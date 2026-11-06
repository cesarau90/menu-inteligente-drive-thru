import { useCallback, useEffect, useRef, useState } from 'react'
import { CONTROL_STORAGE_KEY, DEFAULT_CONTROL_STATE, parseControlState } from '../lib/controlState'
import {
  INITIAL_SYNC,
  onIncoming,
  onLocalChange,
  parseControlPayload,
  type SyncState,
} from '../lib/controlSync'
import { openControlChannel, type ControlChannel, type RealtimeStatus } from '../lib/realtimeChannel'
import { supabase } from '../lib/supabaseClient'
import type { ControlState } from '../types'

function read(): ControlState {
  try {
    return parseControlState(localStorage.getItem(CONTROL_STORAGE_KEY))
  } catch {
    return DEFAULT_CONTROL_STATE
  }
}

function write(state: ControlState) {
  try {
    localStorage.setItem(CONTROL_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* almacenamiento no disponible: el estado vive solo en memoria */
  }
}

/**
 * Estado compartido del panel y la pantalla.
 * - Entre dispositivos: Supabase Realtime (Broadcast, canal "drive-thru").
 * - Respaldo: localStorage (+ evento "storage"), que sincroniza pestañas del mismo navegador y
 *   guarda el último estado si Realtime no conecta.
 */
export function useControlState() {
  const [state, setState] = useState<ControlState>(read)
  const [realtime, setRealtime] = useState<RealtimeStatus>(supabase ? 'connecting' : 'off')

  const stateRef = useRef(state)
  const syncRef = useRef<SyncState>(INITIAL_SYNC)
  const channelRef = useRef<ControlChannel | null>(null)
  const realtimeRef = useRef<RealtimeStatus>(realtime)
  // Hubo cambios locales mientras Realtime no estaba conectado: al conectar se envían.
  const pendingRef = useRef(false)

  const commit = useCallback((next: ControlState) => {
    stateRef.current = next
    setState(next)
    write(next)
  }, [])

  const broadcast = useCallback((next: ControlState) => {
    syncRef.current = onLocalChange()
    if (realtimeRef.current === 'on') channelRef.current?.send('control', next)
    else pendingRef.current = true
  }, [])

  // Respaldo: cambios hechos en otra pestaña del mismo navegador.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === CONTROL_STORAGE_KEY || e.key === null) {
        const next = read()
        stateRef.current = next
        setState(next)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Realtime: cambios hechos en otros dispositivos.
  useEffect(() => {
    let channel: ControlChannel | null = null
    channel = openControlChannel({
      onStatus: (status) => {
        realtimeRef.current = status
        setRealtime(status)
        if (status !== 'on') return
        if (pendingRef.current) {
          // Cambié cosas sin conexión: mi estado es el más reciente, lo envío.
          pendingRef.current = false
          syncRef.current = onLocalChange()
          channel?.send('control', stateRef.current)
        } else {
          // Me conecté (o reconecté): pido el estado actual a quien ya lo tenga.
          syncRef.current = { ...syncRef.current, synced: false }
          channel?.send('request')
        }
      },
      onMessage: (event, payload) => {
        const result = onIncoming(syncRef.current, event)
        syncRef.current = result.next
        if (event === 'request') {
          if (result.reply) channel?.send('state', stateRef.current)
          return
        }
        if (!result.apply) return
        const incoming = parseControlPayload(payload)
        if (incoming) commit(incoming)
      },
    })
    channelRef.current = channel
    return () => {
      channel?.close()
      channelRef.current = null
    }
  }, [commit])

  const update = useCallback(
    (patch: Partial<ControlState>) => {
      const next = parseControlState(JSON.stringify({ ...stateRef.current, ...patch }))
      commit(next)
      broadcast(next)
    },
    [commit, broadcast],
  )

  const reset = useCallback(() => {
    commit(DEFAULT_CONTROL_STATE)
    broadcast(DEFAULT_CONTROL_STATE)
  }, [commit, broadcast])

  return { state, update, reset, realtime }
}

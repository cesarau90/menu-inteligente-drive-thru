import type { RealtimeChannel } from '@supabase/supabase-js'
import type { ControlState } from '../types'
import { SYNC_CHANNEL, type SyncEvent } from './controlSync'
import { supabase } from './supabaseClient'

/** off: sin Supabase configurado · connecting · on: conectado · error: se cayó (se reintenta solo). */
export type RealtimeStatus = 'off' | 'connecting' | 'on' | 'error'

export interface ChannelHandlers {
  onMessage: (event: SyncEvent, payload: unknown) => void
  onStatus: (status: RealtimeStatus) => void
}

export interface ControlChannel {
  send: (event: SyncEvent, state?: ControlState) => void
  close: () => void
}

const EVENTS: SyncEvent[] = ['control', 'request', 'state']

// Un solo canal por página (no uno por componente): evita suscripciones duplicadas con StrictMode
// y deja que supabase-js se encargue de reconectar. Los componentes se registran como oyentes.
const listeners = new Set<ChannelHandlers>()
let channel: RealtimeChannel | null = null
let status: RealtimeStatus = 'connecting'

function setStatus(next: RealtimeStatus) {
  status = next
  listeners.forEach((l) => l.onStatus(next))
}

function ensureChannel(): RealtimeChannel | null {
  if (!supabase) return null
  if (channel) return channel
  const ch = supabase.channel(SYNC_CHANNEL, { config: { broadcast: { self: false, ack: false } } })
  for (const event of EVENTS) {
    ch.on('broadcast', { event }, ({ payload }) => listeners.forEach((l) => l.onMessage(event, payload)))
  }
  ch.subscribe((s) => {
    if (s === 'SUBSCRIBED') setStatus('on')
    else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT' || s === 'CLOSED') setStatus('error')
  })
  channel = ch
  return ch
}

/** Se une al canal "drive-thru". Devuelve null si no hay Supabase (queda solo localStorage). */
export function openControlChannel(handlers: ChannelHandlers): ControlChannel | null {
  const ch = ensureChannel()
  if (!ch) {
    queueMicrotask(() => handlers.onStatus('off'))
    return null
  }
  listeners.add(handlers)
  // Estado actual para quien se une tarde (en un microtask: así el que llama ya tiene su referencia).
  queueMicrotask(() => handlers.onStatus(status))
  return {
    send: (event, state) => {
      if (status !== 'on') return
      void ch.send({ type: 'broadcast', event, payload: state ? { state } : {} })
    },
    close: () => {
      listeners.delete(handlers)
    },
  }
}

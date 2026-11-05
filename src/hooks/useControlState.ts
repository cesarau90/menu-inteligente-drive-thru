import { useCallback, useEffect, useState } from 'react'
import { CONTROL_STORAGE_KEY, DEFAULT_CONTROL_STATE, parseControlState } from '../lib/controlState'
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

export function useControlState() {
  const [state, setState] = useState<ControlState>(read)

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === CONTROL_STORAGE_KEY || e.key === null) setState(read())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const update = useCallback((patch: Partial<ControlState>) => {
    setState((prev) => {
      const next = parseControlState(JSON.stringify({ ...prev, ...patch }))
      write(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    write(DEFAULT_CONTROL_STATE)
    setState(DEFAULT_CONTROL_STATE)
  }, [])

  return { state, update, reset }
}

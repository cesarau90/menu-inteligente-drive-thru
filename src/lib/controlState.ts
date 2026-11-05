import type { ControlState } from '../types'

export const CONTROL_STORAGE_KEY = 'drivethru-control'

export const DEFAULT_CONTROL_STATE: ControlState = {
  queue: 3,
  weatherMode: 'simulated',
  manualTemp: 30,
  hourMode: 'real',
  manualHour: 9,
}

function clampNumber(value: unknown, min: number, max: number, fallback: number, integer: boolean): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  const v = Math.min(max, Math.max(min, value))
  return integer ? Math.round(v) : v
}

export function parseControlState(raw: string | null): ControlState {
  if (raw === null) return DEFAULT_CONTROL_STATE
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return DEFAULT_CONTROL_STATE
  }
  if (typeof data !== 'object' || data === null) return DEFAULT_CONTROL_STATE
  const d = data as Record<string, unknown>
  const def = DEFAULT_CONTROL_STATE
  return {
    queue: clampNumber(d.queue, 0, 15, def.queue, true),
    weatherMode: d.weatherMode === 'real' || d.weatherMode === 'simulated' ? d.weatherMode : def.weatherMode,
    manualTemp: clampNumber(d.manualTemp, -10, 50, def.manualTemp, false),
    hourMode: d.hourMode === 'real' || d.hourMode === 'manual' ? d.hourMode : def.hourMode,
    manualHour: clampNumber(d.manualHour, 0, 23, def.manualHour, true),
  }
}

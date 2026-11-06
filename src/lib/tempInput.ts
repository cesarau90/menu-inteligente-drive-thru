export const TEMP_MIN = -10
export const TEMP_MAX = 50

/** Texto → número, o null si todavía no es un número completo ("", "-", ".", "1e3"…). */
export function parseTempText(text: string): number | null {
  const t = text.trim().replace(',', '.')
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(t)) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

export function clampTemp(n: number): number {
  return Math.min(TEMP_MAX, Math.max(TEMP_MIN, n))
}

/**
 * Estado del input de temperatura manual.
 * - text: lo que el usuario ve y escribe (puede quedar vacío o en "-").
 * - value: último número válido (limitado a -10…50); es lo que usa la pantalla.
 * - editing: true mientras el usuario escribe; protege el texto de cambios externos.
 */
export interface TempInputState {
  text: string
  value: number
  editing: boolean
}

export type TempInputAction =
  | { type: 'change'; text: string }
  | { type: 'blur' }
  | { type: 'external'; value: number }
  | { type: 'set'; value: number }

export function initTempInput(value: number): TempInputState {
  const v = clampTemp(value)
  return { text: String(v), value: v, editing: false }
}

export function tempInputReducer(state: TempInputState, action: TempInputAction): TempInputState {
  switch (action.type) {
    case 'change': {
      const parsed = parseTempText(action.text)
      return {
        text: action.text,
        value: parsed === null ? state.value : clampTemp(parsed),
        editing: true,
      }
    }
    case 'blur':
      // Vacío, "-" o fuera de rango: el texto vuelve al último valor válido (ya limitado).
      return { text: String(state.value), value: state.value, editing: false }
    case 'external':
      return state.editing ? state : initTempInput(action.value)
    case 'set':
      return initTempInput(action.value)
  }
}

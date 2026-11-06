import { useCallback, useEffect, useReducer } from 'react'
import { clampTemp, initTempInput, parseTempText, tempInputReducer } from '../lib/tempInput'

/**
 * Input de temperatura manual con estado de texto: el campo puede quedar vacío o en "-" mientras
 * se escribe, y solo se llama a `commit` cuando el texto es un número válido (limitado a -10…50).
 */
export function useTempInput(value: number, commit: (temp: number) => void) {
  const [state, dispatch] = useReducer(tempInputReducer, value, initTempInput)

  // Cambios externos (otra pestaña, "Restablecer", botones): se reflejan si no se está editando.
  useEffect(() => {
    dispatch({ type: 'external', value })
  }, [value])

  const onChange = useCallback(
    (text: string) => {
      dispatch({ type: 'change', text })
      const parsed = parseTempText(text)
      if (parsed !== null) commit(clampTemp(parsed))
    },
    [commit],
  )

  const onBlur = useCallback(() => dispatch({ type: 'blur' }), [])

  const pick = useCallback(
    (temp: number) => {
      dispatch({ type: 'set', value: temp })
      commit(clampTemp(temp))
    },
    [commit],
  )

  return { text: state.text, onChange, onBlur, pick }
}

export type TempInputApi = ReturnType<typeof useTempInput>

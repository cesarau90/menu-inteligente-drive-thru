import { describe, expect, it } from 'vitest'
import { DEFAULT_CONTROL_STATE, parseControlState } from './controlState'

describe('parseControlState', () => {
  it('null → default', () => {
    expect(parseControlState(null)).toEqual(DEFAULT_CONTROL_STATE)
  })
  it('JSON corrupto → default', () => {
    expect(parseControlState('{bad')).toEqual(DEFAULT_CONTROL_STATE)
  })
  it('JSON que no es objeto → default', () => {
    expect(parseControlState('42')).toEqual(DEFAULT_CONTROL_STATE)
  })
  it('queue 99 → 15', () => {
    expect(parseControlState('{"queue":99}').queue).toBe(15)
  })
  it('queue -4 → 0', () => {
    expect(parseControlState('{"queue":-4}').queue).toBe(0)
  })
  it('queue decimal se redondea a entero', () => {
    expect(parseControlState('{"queue":3.7}').queue).toBe(4)
  })
  it('manualHour 30 → 23', () => {
    expect(parseControlState('{"manualHour":30}').manualHour).toBe(23)
  })
  it('manualTemp fuera de rango se limita a −10..50', () => {
    expect(parseControlState('{"manualTemp":900}').manualTemp).toBe(50)
    expect(parseControlState('{"manualTemp":-90}').manualTemp).toBe(-10)
  })
  it('enum inválido → default', () => {
    const s = parseControlState('{"weatherMode":"x","hourMode":7}')
    expect(s.weatherMode).toBe('simulated')
    expect(s.hourMode).toBe('real')
  })
  it('número como string no numérico → default', () => {
    expect(parseControlState('{"queue":"mucho"}').queue).toBe(DEFAULT_CONTROL_STATE.queue)
  })
  it('objeto válido completo queda igual', () => {
    const v = { queue: 9, weatherMode: 'real', manualTemp: 18, hourMode: 'manual', manualHour: 7 }
    expect(parseControlState(JSON.stringify(v))).toEqual(v)
  })
})

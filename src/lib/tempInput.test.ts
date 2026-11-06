import { describe, expect, it } from 'vitest'
import {
  clampTemp,
  initTempInput,
  parseTempText,
  tempInputReducer,
  type TempInputAction,
  type TempInputState,
} from './tempInput'

const run = (start: TempInputState, ...actions: TempInputAction[]) =>
  actions.reduce(tempInputReducer, start)

describe('parseTempText', () => {
  it.each([
    ['15', 15],
    ['-5', -5],
    ['15.5', 15.5],
    ['.5', 0.5],
    ['1.', 1],
    ['1,5', 1.5],
    [' 15 ', 15],
    ['0', 0],
  ])('"%s" → %s', (text, n) => {
    expect(parseTempText(text)).toBe(n)
  })

  it.each([[''], ['-'], ['.'], ['-.'], ['abc'], ['1e3'], ['--5'], ['5-'], ['  ']])(
    '"%s" no es un número válido (aún)',
    (text) => {
      expect(parseTempText(text)).toBeNull()
    },
  )
})

describe('clampTemp', () => {
  it.each([
    [-11, -10],
    [-10, -10],
    [0, 0],
    [24, 24],
    [50, 50],
    [51, 50],
    [999, 50],
    [-999, -10],
  ])('%s → %s', (n, expected) => {
    expect(clampTemp(n)).toBe(expected)
  })
})

describe('tempInputReducer', () => {
  it('borrar todo y escribir otro número', () => {
    const s0 = initTempInput(30)
    const vacio = run(s0, { type: 'change', text: '' })
    expect(vacio.text).toBe('') // el campo puede quedar vacío mientras escribe
    expect(vacio.value).toBe(30) // y la temperatura no cambia

    const uno = run(vacio, { type: 'change', text: '1' })
    expect(uno).toMatchObject({ text: '1', value: 1, editing: true })

    const quince = run(uno, { type: 'change', text: '15' }, { type: 'blur' })
    expect(quince).toEqual({ text: '15', value: 15, editing: false })
  })

  it('texto vacío + blur regresa al último valor válido', () => {
    const s = run(initTempInput(24), { type: 'change', text: '' }, { type: 'blur' })
    expect(s).toEqual({ text: '24', value: 24, editing: false })
  })

  it('"-" mientras escribe no cambia el valor; con blur regresa al último válido', () => {
    const escribiendo = run(initTempInput(24), { type: 'change', text: '-' })
    expect(escribiendo).toMatchObject({ text: '-', value: 24, editing: true })
    expect(run(escribiendo, { type: 'blur' })).toEqual({ text: '24', value: 24, editing: false })
  })

  it('se puede escribir un negativo: "-" → "-5"', () => {
    const s = run(initTempInput(24), { type: 'change', text: '-' }, { type: 'change', text: '-5' })
    expect(s).toMatchObject({ text: '-5', value: -5 })
  })

  it('fuera de rango: el valor se limita y el texto se corrige al perder el foco', () => {
    const alto = run(initTempInput(24), { type: 'change', text: '100' })
    expect(alto).toMatchObject({ text: '100', value: 50 })
    expect(run(alto, { type: 'blur' })).toEqual({ text: '50', value: 50, editing: false })

    const bajo = run(initTempInput(24), { type: 'change', text: '-40' }, { type: 'blur' })
    expect(bajo).toEqual({ text: '-10', value: -10, editing: false })
  })

  it('los límites exactos -10 y 50 se respetan sin cambio', () => {
    expect(run(initTempInput(24), { type: 'change', text: '-10' }, { type: 'blur' }).text).toBe('-10')
    expect(run(initTempInput(24), { type: 'change', text: '50' }, { type: 'blur' }).text).toBe('50')
  })

  it('un cambio externo se ignora mientras el usuario edita y se aplica si no', () => {
    const editando = run(initTempInput(24), { type: 'change', text: '' })
    expect(run(editando, { type: 'external', value: 33 })).toEqual(editando)

    const quieto = initTempInput(24)
    expect(run(quieto, { type: 'external', value: 33 })).toEqual({ text: '33', value: 33, editing: false })
  })

  it('botón rápido: fija valor y texto aunque se estuviera editando, y limita el rango', () => {
    const editando = run(initTempInput(24), { type: 'change', text: '' })
    expect(run(editando, { type: 'set', value: 15 })).toEqual({ text: '15', value: 15, editing: false })
    expect(run(initTempInput(24), { type: 'set', value: 80 })).toEqual({ text: '50', value: 50, editing: false })
  })

  it('el valor inicial fuera de rango se normaliza', () => {
    expect(initTempInput(99)).toEqual({ text: '50', value: 50, editing: false })
  })
})

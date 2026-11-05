import { describe, expect, it } from 'vitest'
import type { Product } from '../types'
import {
  describeMode,
  getContextKey,
  getDayPart,
  getQueueBand,
  getWeatherBand,
  recommend,
} from './recommendation'

const p = (
  id: string,
  price: number,
  temperature: Product['temperature'],
  tags: string[] = [],
): Product => ({
  id,
  name: id,
  price,
  imageUrl: null,
  category: temperature === 'caliente' ? 'bebida_caliente' : 'bebida_fria',
  temperature,
  tags,
  emoji: '☕',
})

const CATALOG: Product[] = [
  p('f1', 40, 'fria'),
  p('f2', 95, 'fria', ['frappe']),
  p('f3', 60, 'fria', ['cafe']),
  p('f4', 110, 'fria', ['frappe']),
  p('f5', 30, 'fria'),
  p('f6', 85, 'fria', ['postre']),
  p('c1', 35, 'caliente', ['cafe']),
  p('c2', 70, 'caliente', ['cafe']),
  p('c3', 100, 'caliente', ['desayuno']),
  p('c4', 45, 'caliente'),
  p('c5', 90, 'caliente', ['postre']),
  p('c6', 55, 'caliente'),
]

describe('getWeatherBand', () => {
  it.each([
    [28, 'templado'],
    [28.1, 'calor'],
    [20, 'templado'],
    [19.9, 'frio'],
  ])('%s °C → %s', (t, band) => {
    expect(getWeatherBand(t)).toBe(band)
  })
})

describe('getDayPart', () => {
  it.each([
    [5, 'noche'],
    [6, 'manana'],
    [11, 'manana'],
    [12, 'tarde'],
    [18, 'tarde'],
    [19, 'noche'],
    [0, 'noche'],
    [23, 'noche'],
  ])('hora %s → %s', (h, part) => {
    expect(getDayPart(h)).toBe(part)
  })
})

describe('getQueueBand', () => {
  it.each([
    [5, 'corta'],
    [6, 'larga'],
    [0, 'corta'],
    [15, 'larga'],
  ])('%s carros → %s', (q, band) => {
    expect(getQueueBand(q)).toBe(band)
  })
})

describe('getContextKey', () => {
  it('es igual dentro de la misma banda', () => {
    expect(getContextKey({ temperature: 30, queue: 2, hour: 13 })).toBe(
      getContextKey({ temperature: 35, queue: 0, hour: 15 }),
    )
  })
  it('cambia al cruzar de fila 5 a 6', () => {
    expect(getContextKey({ temperature: 30, queue: 5, hour: 13 })).not.toBe(
      getContextKey({ temperature: 30, queue: 6, hour: 13 }),
    )
  })
})

describe('recommend', () => {
  const hot = { temperature: 32, queue: 2, hour: 22 }
  const cold = { temperature: 15, queue: 2, hour: 22 }

  it('calor → solo bebidas frías', () => {
    const r = recommend(CATALOG, hot)
    expect(r).toHaveLength(4)
    expect(r.every((x) => x.temperature === 'fria')).toBe(true)
  })

  it('frío → solo bebidas calientes', () => {
    const r = recommend(CATALOG, cold)
    expect(r.every((x) => x.temperature === 'caliente')).toBe(true)
  })

  it('fila larga (noche, calor) → los más caros primero', () => {
    const r = recommend(CATALOG, { ...hot, queue: 8 })
    expect(r.map((x) => x.id)).toEqual(['f4', 'f2', 'f6', 'f3'])
    expect(r[0].price).toBe(110)
  })

  it('fila corta usa el rng y es estable con rng fijo', () => {
    const a = recommend(CATALOG, hot, () => 0)
    const b = recommend(CATALOG, hot, () => 0)
    const c = recommend(CATALOG, hot, () => 0.99)
    expect(a.map((x) => x.id)).toEqual(b.map((x) => x.id))
    expect(a.map((x) => x.id)).not.toEqual(c.map((x) => x.id))
  })

  it('mañana + templado antepone café y desayuno', () => {
    const r = recommend(CATALOG, { temperature: 24, queue: 6, hour: 8 })
    const front = r.slice(0, 3).map((x) => x.id)
    expect(front).toEqual(['c3', 'c2', 'f3'])
  })

  it('tarde antepone frappés y postres', () => {
    const r = recommend(CATALOG, { temperature: 32, queue: 8, hour: 15 })
    expect(r.slice(0, 3).map((x) => x.id)).toEqual(['f4', 'f2', 'f6'])
  })

  it('con pocos aptos devuelve los que hay', () => {
    const two = [p('a', 10, 'fria'), p('b', 20, 'fria'), p('x', 30, 'caliente')]
    expect(recommend(two, hot)).toHaveLength(2)
  })

  it('catálogo vacío → []', () => {
    expect(recommend([], hot)).toEqual([])
  })

  it('nunca repite ids', () => {
    const r = recommend(CATALOG, { temperature: 24, queue: 1, hour: 8 }, () => 0.3)
    expect(new Set(r.map((x) => x.id)).size).toBe(r.length)
  })
})

describe('describeMode', () => {
  it('calor → bebidas frías', () => {
    const m = describeMode({ temperature: 32, queue: 2, hour: 22 })
    expect(m.emoji).toBe('☀️')
    expect(m.label).toContain('Bebidas frías')
  })
  it('frío → bebidas calientes', () => {
    expect(describeMode({ temperature: 15, queue: 2, hour: 22 }).label).toContain(
      'Bebidas calientes',
    )
  })
  it('el label es corto y el detalle lleva franja y fila larga', () => {
    const m = describeMode({ temperature: 15, queue: 9, hour: 8 })
    expect(m.label).toBe('Día fresco → Bebidas calientes')
    expect(m.detail).toBe('Mañana · Fila larga: selección premium')
    expect(describeMode({ temperature: 15, queue: 2, hour: 22 }).detail).toBe('Noche')
  })
  it('frío usa 🍂', () => {
    expect(describeMode({ temperature: 15, queue: 2, hour: 22 }).emoji).toBe('🍂')
  })
  it('templado → mixto', () => {
    expect(describeMode({ temperature: 24, queue: 2, hour: 22 }).label).toContain('Mixto')
  })
})

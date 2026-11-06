import { describe, expect, it } from 'vitest'
import { FALLBACK_PRODUCTS } from '../data/fallbackProducts'
import type { Product } from '../types'
import { buildMenuColumns, MENU_MAX_ROWS } from './menuColumns'

const p = (id: string, category: Product['category']): Product => ({
  id, name: id, price: 1, imageUrl: null, category, temperature: null, tags: [], emoji: '☕',
})

describe('buildMenuColumns', () => {
  const columns = buildMenuColumns(FALLBACK_PRODUCTS)

  it('muestra los 21 productos del catálogo, cada uno exactamente una vez', () => {
    const ids = columns.flatMap((c) => c.products.map((x) => x.id))
    expect(ids).toHaveLength(21)
    expect(new Set(ids)).toEqual(new Set(FALLBACK_PRODUCTS.map((x) => x.id)))
  })

  it('son 4 columnas con máximo 6 filas cada una', () => {
    expect(columns).toHaveLength(4)
    expect(MENU_MAX_ROWS).toBe(6)
    for (const c of columns) expect(c.products.length).toBeLessThanOrEqual(MENU_MAX_ROWS)
  })

  it('las columnas quedan parejas (diferencia de filas ≤ 2)', () => {
    const sizes = columns.map((c) => c.products.length)
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(2)
    expect(sizes).toEqual([5, 6, 6, 4])
  })

  it('títulos y contenido por columna', () => {
    expect(columns.map((c) => c.title)).toEqual([
      'Café caliente',
      'Otras bebidas',
      'Frappés y postres',
      'Desayuno y snack',
    ])
    expect(columns[0].products.map((x) => x.id)).toEqual(['espresso', 'americano', 'capuchino', 'latte', 'moka'])
    expect(columns[3].products.map((x) => x.id)).toEqual(['croissant', 'sandwich', 'hotcakes', 'galleta'])
  })

  it('"Otras bebidas" lleva primero las calientes y luego las frías', () => {
    expect(columns[1].products.map((x) => x.id)).toEqual([
      'chocolate', 'te-chai', 'cold-brew', 'latte-helado', 'limonada', 'te-helado',
    ])
  })

  it('es independiente de cuáles estén destacados: misma entrada, misma salida', () => {
    expect(buildMenuColumns([...FALLBACK_PRODUCTS])).toEqual(columns)
  })

  it('omite las columnas sin productos y no pierde ninguno', () => {
    const solo = buildMenuColumns([p('a', 'cafe'), p('b', 'postre')])
    expect(solo.map((c) => c.title)).toEqual(['Café caliente', 'Frappés y postres'])
    expect(solo.flatMap((c) => c.products.map((x) => x.id))).toEqual(['a', 'b'])
  })

  it('catálogo vacío → sin columnas', () => {
    expect(buildMenuColumns([])).toEqual([])
  })
})

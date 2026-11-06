/// <reference types="node" />
import { existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { FALLBACK_PRODUCTS } from './fallbackProducts'

describe('imágenes del catálogo de respaldo', () => {
  it('hay 21 productos', () => {
    expect(FALLBACK_PRODUCTS).toHaveLength(21)
  })

  it('Cold brew y Latte helado están en bebidas frías, no en Café', () => {
    const byId = (id: string) => FALLBACK_PRODUCTS.find((p) => p.id === id)
    expect(byId('cold-brew')?.category).toBe('bebida_fria')
    expect(byId('latte-helado')?.category).toBe('bebida_fria')
  })

  it('la categoría Café solo tiene bebidas calientes', () => {
    const cafes = FALLBACK_PRODUCTS.filter((p) => p.category === 'cafe')
    expect(cafes.map((p) => p.id)).toEqual(['espresso', 'americano', 'capuchino', 'latte', 'moka'])
    expect(cafes.every((p) => p.temperature === 'caliente')).toBe(true)
  })

  it('siguen contando como café para la franja de la mañana (tag "cafe")', () => {
    for (const id of ['cold-brew', 'latte-helado']) {
      expect(FALLBACK_PRODUCTS.find((p) => p.id === id)?.tags).toContain('cafe')
    }
  })

  it.each(FALLBACK_PRODUCTS.map((p) => [p.id, p.imageUrl] as const))(
    '%s apunta a /products/<slug>.webp y el archivo existe (<80KB)',
    (id, imageUrl) => {
      expect(imageUrl).toBe(`/products/${id}.webp`)
      const file = resolve(__dirname, '../../public', `.${imageUrl}`)
      expect(existsSync(file)).toBe(true)
      expect(statSync(file).size).toBeLessThan(80 * 1024)
    },
  )
})

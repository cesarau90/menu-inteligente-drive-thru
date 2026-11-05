/// <reference types="node" />
import { existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { FALLBACK_PRODUCTS } from './fallbackProducts'

describe('imágenes del catálogo de respaldo', () => {
  it('hay 21 productos', () => {
    expect(FALLBACK_PRODUCTS).toHaveLength(21)
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

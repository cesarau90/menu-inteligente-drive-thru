import { describe, expect, it } from 'vitest'
import { mapProduct } from './mapProduct'

const row = {
  id: 'abc',
  name: 'Latte',
  price: '45.50',
  image_url: 'https://x.test/a.jpg',
  category: 'cafe',
  temperature: 'caliente',
  tags: ['cafe'],
  emoji: '☕',
}

describe('mapProduct', () => {
  it('convierte una fila válida (precio string → número, image_url → imageUrl)', () => {
    const p = mapProduct(row)
    expect(p?.price).toBe(45.5)
    expect(p?.imageUrl).toBe('https://x.test/a.jpg')
  })
  it('sin name → null', () => {
    expect(mapProduct({ ...row, name: undefined })).toBeNull()
  })
  it('temperature null → null en el producto', () => {
    expect(mapProduct({ ...row, temperature: null })?.temperature).toBeNull()
  })
  it('tags null → []', () => {
    expect(mapProduct({ ...row, tags: null })?.tags).toEqual([])
  })
  it('categoría desconocida → null', () => {
    expect(mapProduct({ ...row, category: 'pizza' })).toBeNull()
  })
  it('precio no numérico → null', () => {
    expect(mapProduct({ ...row, price: 'gratis' })).toBeNull()
  })
})

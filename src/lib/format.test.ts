import { describe, expect, it } from 'vitest'
import type { Product } from '../types'
import { formatClock, formatKicker, formatPrice } from './format'

const prod = (category: Product['category'], temperature: Product['temperature']): Product => ({
  id: 'x', name: 'X', price: 1, imageUrl: null, category, temperature, tags: [], emoji: '☕',
})

describe('formatKicker', () => {
  it('categoría y temperatura', () => {
    expect(formatKicker(prod('cafe', 'caliente'))).toBe('Café · Caliente')
    expect(formatKicker(prod('frappe', 'fria'))).toBe('Frappé · Fría')
  })
  it('sin temperatura solo la categoría', () => {
    expect(formatKicker(prod('postre', null))).toBe('Postre')
    expect(formatKicker(prod('desayuno', null))).toBe('Desayuno')
  })
  it('bebidas no repiten la palabra bebida', () => {
    expect(formatKicker(prod('bebida_fria', 'fria'))).toBe('Bebida fría')
    expect(formatKicker(prod('bebida_caliente', 'caliente'))).toBe('Bebida caliente')
  })
})

describe('formatPrice', () => {
  it('entero sin decimales', () => {
    expect(formatPrice(85)).toBe('$85')
  })
  it('con centavos', () => {
    expect(formatPrice(45.5)).toBe('$45.50')
  })
})

describe('formatClock', () => {
  it('hora real con minutos, 24 h', () => {
    expect(formatClock(new Date(2026, 0, 1, 7, 5), 'real', 0)).toBe('07:05')
  })
  it('hora manual muestra :00', () => {
    expect(formatClock(new Date(2026, 0, 1, 7, 5), 'manual', 15)).toBe('15:00')
  })
})

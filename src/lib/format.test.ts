import { describe, expect, it } from 'vitest'
import { formatClock, formatPrice } from './format'

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

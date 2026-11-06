import type { Product } from '../types'

export function formatPrice(price: number): string {
  return Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`
}

const CATEGORY_LABEL: Record<Product['category'], string> = {
  cafe: 'Café',
  bebida_fria: 'Bebida fría',
  bebida_caliente: 'Bebida caliente',
  frappe: 'Frappé',
  desayuno: 'Desayuno',
  postre: 'Postre',
  snack: 'Snack',
}

/** Línea auxiliar de la tarjeta: categoría y, si aporta, la temperatura (p. ej. "Frappé · Fría"). */
export function formatKicker(product: Product): string {
  const category = CATEGORY_LABEL[product.category]
  const isDrinkCategory = product.category === 'bebida_fria' || product.category === 'bebida_caliente'
  if (!product.temperature || isDrinkCategory) return category
  return `${category} · ${product.temperature === 'fria' ? 'Fría' : 'Caliente'}`
}

const pad = (n: number) => String(n).padStart(2, '0')

export function formatClock(now: Date, mode: 'real' | 'manual', manualHour: number): string {
  return mode === 'manual'
    ? `${pad(manualHour)}:00`
    : `${pad(now.getHours())}:${pad(now.getMinutes())}`
}

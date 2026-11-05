import type { Category, Product, Temperature } from '../types'

const CATEGORIES: Category[] = [
  'bebida_fria',
  'bebida_caliente',
  'cafe',
  'frappe',
  'desayuno',
  'postre',
  'snack',
]

export function mapProduct(row: Record<string, unknown>): Product | null {
  const { id, name, category } = row
  const price = Number(row.price)
  if (typeof id !== 'string' || typeof name !== 'string' || !name) return null
  if (!Number.isFinite(price) || row.price === '' || row.price === null) return null
  if (!CATEGORIES.includes(category as Category)) return null

  const temperature: Temperature | null =
    row.temperature === 'fria' || row.temperature === 'caliente' ? row.temperature : null

  return {
    id,
    name,
    price,
    imageUrl: typeof row.image_url === 'string' && row.image_url ? row.image_url : null,
    category: category as Category,
    temperature,
    tags: Array.isArray(row.tags) ? row.tags.filter((t): t is string => typeof t === 'string') : [],
    emoji: typeof row.emoji === 'string' && row.emoji ? row.emoji : '🍽️',
  }
}

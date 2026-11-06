import type { Category, Product } from '../types'

export const MENU_MAX_ROWS = 6

export interface MenuColumn {
  title: string
  products: Product[]
}

/**
 * Las 4 columnas del menú inferior, por categoría (así no dependen de ids ni de cambios en la base
 * de datos). El orden de las categorías dentro de una columna fija el orden de las filas.
 * Con el catálogo actual: 5 · 6 · 6 · 4 filas (máximo 6).
 */
const COLUMNS: { title: string; categories: Category[] }[] = [
  { title: 'Café caliente', categories: ['cafe'] },
  { title: 'Otras bebidas', categories: ['bebida_caliente', 'bebida_fria'] },
  { title: 'Frappés y postres', categories: ['frappe', 'postre'] },
  { title: 'Desayuno y snack', categories: ['desayuno', 'snack'] },
]

/** Siempre recibe y muestra TODO el catálogo: el menú no cambia con el estado (clima, fila, hora). */
export function buildMenuColumns(products: Product[]): MenuColumn[] {
  return COLUMNS.map((col) => ({
    title: col.title,
    products: col.categories.flatMap((category) => products.filter((p) => p.category === category)),
  })).filter((col) => col.products.length > 0)
}

import { formatPrice } from '../lib/format'
import type { Category, Product } from '../types'

const GROUPS: { title: string; categories: Category[] }[] = [
  { title: 'Café', categories: ['cafe'] },
  { title: 'Otras bebidas', categories: ['bebida_caliente', 'bebida_fria'] },
  { title: 'Frappés', categories: ['frappe'] },
  { title: 'Desayuno', categories: ['desayuno'] },
  { title: 'Postres y más', categories: ['postre', 'snack'] },
]

interface MenuListProps {
  products: Product[]
}

export function MenuList({ products }: MenuListProps) {
  const groups = GROUPS.map((g) => ({
    title: g.title,
    items: products.filter((p) => g.categories.includes(p.category)),
  })).filter((g) => g.items.length > 0)

  return (
    <nav className="menu" aria-label="Menú completo">
      {groups.map((g) => (
        <div className="menu__group" key={g.title}>
          <h3>{g.title}</h3>
          <ul>
            {g.items.map((p) => (
              <li key={p.id}>
                <span>{p.name}</span>
                <span>{formatPrice(p.price)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

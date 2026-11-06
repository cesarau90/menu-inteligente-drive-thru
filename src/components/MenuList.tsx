import { formatPrice } from '../lib/format'
import type { Category, Product } from '../types'

const GROUPS: { title: string; categories: Category[] }[] = [
  { title: 'Café', categories: ['cafe'] },
  { title: 'Bebidas y frappés', categories: ['bebida_caliente', 'bebida_fria', 'frappe'] },
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
                <span className="menu__name">{p.name}</span>
                <span className="menu__leader" aria-hidden="true" />
                <span className="menu__price">{formatPrice(p.price)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

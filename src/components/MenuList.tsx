import { formatPrice } from '../lib/format'
import type { MenuColumn } from '../lib/menuColumns'

interface MenuListProps {
  columns: MenuColumn[]
  /** Ids de los productos destacados ahora: se marcan con un punto y color. */
  featuredIds: string[]
}

export function MenuList({ columns, featuredIds }: MenuListProps) {
  return (
    <nav className="menu" aria-label="Menú completo">
      {columns.map((col) => (
        <div className="menu__group" key={col.title}>
          <h3>{col.title}</h3>
          <ul>
            {col.products.map((p) => {
              const featured = featuredIds.includes(p.id)
              return (
                <li key={p.id} className={featured ? 'menu__item menu__item--featured' : 'menu__item'}>
                  <span className="menu__name">{p.name}</span>
                  <span className="menu__leader" aria-hidden="true" />
                  <span className="menu__price">{formatPrice(p.price)}</span>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
      <p className="menu__legend" aria-hidden="true">
        <span className="menu__dot" /> Recomendado ahora
      </p>
    </nav>
  )
}

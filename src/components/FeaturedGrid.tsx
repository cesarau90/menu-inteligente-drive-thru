import type { Product } from '../types'
import { ProductCard } from './ProductCard'

interface FeaturedGridProps {
  products: Product[]
  contextKey: string
  premium: boolean
}

export function FeaturedGrid({ products, contextKey, premium }: FeaturedGridProps) {
  return (
    <section className="featured" aria-label="Productos recomendados">
      {products.length === 0 ? (
        <p className="featured__empty">Pregunta por nuestras sugerencias del día</p>
      ) : (
        // key = contextKey: al cambiar el contexto se remonta y reproduce la transición de entrada
        <div key={contextKey} className={`featured__grid featured__grid--n${products.length}`}>
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} rank={i + 1} premium={premium} />
          ))}
        </div>
      )}
    </section>
  )
}

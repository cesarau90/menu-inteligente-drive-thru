import type { Product } from '../types'
import { type CardVariant, ProductCard } from './ProductCard'

interface FeaturedGridProps {
  products: Product[]
  contextKey: string
  premium: boolean
}

/** La primera tarjeta es el héroe; las que ocupan dos columnas son "wide"; el resto, "compact". */
function variantFor(index: number, count: number): CardVariant {
  if (index === 0) return 'hero'
  if (index === 1 || (index === 2 && count === 3)) return 'wide'
  return 'compact'
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
            <ProductCard
              key={p.id}
              product={p}
              rank={i + 1}
              premium={premium}
              variant={variantFor(i, products.length)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

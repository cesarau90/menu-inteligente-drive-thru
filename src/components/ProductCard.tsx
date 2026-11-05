import { useState } from 'react'
import { formatPrice } from '../lib/format'
import type { Product } from '../types'

interface ProductCardProps {
  product: Product
  rank: number
  premium: boolean
}

export function ProductCard({ product, rank, premium }: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = product.imageUrl !== null && !imageFailed

  return (
    <article
      className={`card${rank === 1 ? ' card--hero' : ''}`}
      style={{ '--i': rank - 1 } as React.CSSProperties}
    >
      <div className="card__art">
        {showImage ? (
          <img src={product.imageUrl!} alt="" onError={() => setImageFailed(true)} />
        ) : (
          <span className="card__emoji" aria-hidden="true">
            {product.emoji}
          </span>
        )}
        <span className="card__rank">Nº {String(rank).padStart(2, '0')}</span>
        {premium && rank === 1 && <span className="card__badge">Premium</span>}
      </div>
      <div className="card__body">
        <h2 className="card__name">{product.name}</h2>
        <span className="card__price">{formatPrice(product.price)}</span>
      </div>
    </article>
  )
}

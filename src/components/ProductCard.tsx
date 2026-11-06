import { useState } from 'react'
import { formatKicker, formatPrice } from '../lib/format'
import type { Product } from '../types'

export type CardVariant = 'hero' | 'wide' | 'compact'

interface ProductCardProps {
  product: Product
  rank: number
  premium: boolean
  variant: CardVariant
}

export function ProductCard({ product, rank, premium, variant }: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = product.imageUrl !== null && !imageFailed

  return (
    <article
      className={`card card--${variant}`}
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
        {variant === 'hero' && <span className="card__kicker">{formatKicker(product)}</span>}
        <span className="card__rank">Nº {String(rank).padStart(2, '0')}</span>
        {premium && rank === 1 && <span className="card__badge">Premium</span>}
      </div>
      <div className="card__body">
        <h2 className="card__name">{product.name}</h2>
        {variant === 'wide' && <span className="card__sub">{formatKicker(product)}</span>}
        <span className="card__price">{formatPrice(product.price)}</span>
      </div>
    </article>
  )
}

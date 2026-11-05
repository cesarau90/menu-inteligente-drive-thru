import { useEffect, useState } from 'react'
import { FALLBACK_PRODUCTS } from '../data/fallbackProducts'
import { mapProduct } from '../lib/mapProduct'
import { supabase } from '../lib/supabaseClient'
import type { Product } from '../types'

export interface MenuState {
  products: Product[]
  source: 'supabase' | 'fallback'
  loading: boolean
}

const FALLBACK_STATE: MenuState = { products: FALLBACK_PRODUCTS, source: 'fallback', loading: false }

export function useMenu(): MenuState {
  const [state, setState] = useState<MenuState>({
    ...FALLBACK_STATE,
    loading: supabase !== null,
  })

  useEffect(() => {
    if (!supabase) return
    let cancelled = false
    const client = supabase
    const load = async () => {
      try {
        const { data, error } = await client.from('products').select('*').eq('available', true)
        if (cancelled) return
        const mapped =
          error || !data ? [] : data.map(mapProduct).filter((p): p is Product => p !== null)
        setState(
          mapped.length > 0
            ? { products: mapped, source: 'supabase', loading: false }
            : FALLBACK_STATE,
        )
      } catch {
        if (!cancelled) setState(FALLBACK_STATE)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return state
}

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
// Acepta el nombre clásico (ANON_KEY) y el nuevo de Supabase (PUBLISHABLE_KEY).
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined

export const supabase = url && key ? createClient(url, key) : null

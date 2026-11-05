export type Category =
  | 'bebida_fria'
  | 'bebida_caliente'
  | 'cafe'
  | 'frappe'
  | 'desayuno'
  | 'postre'
  | 'snack'

export type Temperature = 'fria' | 'caliente'

export interface Product {
  id: string
  name: string
  price: number
  imageUrl: string | null
  category: Category
  temperature: Temperature | null
  tags: string[]
  emoji: string
}

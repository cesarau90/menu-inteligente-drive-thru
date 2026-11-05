import type { Product } from '../types'

type Seed = [
  id: string,
  name: string,
  price: number,
  category: Product['category'],
  temperature: Product['temperature'],
  tags: string[],
  emoji: string,
]

const SEED: Seed[] = [
  ['espresso', 'Espresso', 38, 'cafe', 'caliente', ['cafe'], '☕'],
  ['americano', 'Americano', 42, 'cafe', 'caliente', ['cafe'], '☕'],
  ['capuchino', 'Capuchino', 55, 'cafe', 'caliente', ['cafe'], '☕'],
  ['latte', 'Latte de vainilla', 60, 'cafe', 'caliente', ['cafe'], '🥛'],
  ['moka', 'Moka caliente', 68, 'cafe', 'caliente', ['cafe'], '🍫'],
  ['chocolate', 'Chocolate caliente', 52, 'bebida_caliente', 'caliente', [], '🍫'],
  ['te-chai', 'Té chai latte', 58, 'bebida_caliente', 'caliente', [], '🫖'],
  ['cold-brew', 'Cold brew', 62, 'cafe', 'fria', ['cafe'], '🧊'],
  ['latte-helado', 'Latte helado', 64, 'cafe', 'fria', ['cafe'], '🥤'],
  ['frappe-moka', 'Frappé de moka', 85, 'frappe', 'fria', ['frappe'], '🥤'],
  ['frappe-caramelo', 'Frappé de caramelo', 90, 'frappe', 'fria', ['frappe'], '🍮'],
  ['frappe-oreo', 'Frappé de galleta', 98, 'frappe', 'fria', ['frappe'], '🍪'],
  ['limonada', 'Limonada mineral', 45, 'bebida_fria', 'fria', [], '🍋'],
  ['te-helado', 'Té helado de durazno', 48, 'bebida_fria', 'fria', [], '🍑'],
  ['croissant', 'Croissant de mantequilla', 40, 'desayuno', null, ['desayuno'], '🥐'],
  ['sandwich', 'Sándwich de jamón y queso', 78, 'desayuno', null, ['desayuno'], '🥪'],
  ['hotcakes', 'Hotcakes con miel', 89, 'desayuno', null, ['desayuno'], '🥞'],
  ['cheesecake', 'Cheesecake de fresa', 95, 'postre', null, ['postre'], '🍰'],
  ['brownie', 'Brownie con nuez', 55, 'postre', null, ['postre'], '🍫'],
  ['rol-canela', 'Rol de canela', 62, 'postre', null, ['postre', 'desayuno'], '🥮'],
  ['galleta', 'Galleta de avena', 28, 'snack', null, [], '🍪'],
]

export const FALLBACK_PRODUCTS: Product[] = SEED.map(
  ([id, name, price, category, temperature, tags, emoji]) => ({
    id,
    name,
    price,
    imageUrl: null,
    category,
    temperature,
    tags,
    emoji,
  }),
)

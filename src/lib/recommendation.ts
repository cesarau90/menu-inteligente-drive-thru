import type {
  DayPart,
  DriveThruContext,
  Product,
  QueueBand,
  WeatherBand,
} from '../types'

export function getWeatherBand(temp: number): WeatherBand {
  if (temp > 28) return 'calor'
  if (temp < 20) return 'frio'
  return 'templado'
}

export function getDayPart(hour: number): DayPart {
  if (hour >= 6 && hour < 12) return 'manana'
  if (hour >= 12 && hour < 19) return 'tarde'
  return 'noche'
}

export function getQueueBand(queue: number): QueueBand {
  return queue > 5 ? 'larga' : 'corta'
}

export function getContextKey(ctx: DriveThruContext): string {
  return `${getWeatherBand(ctx.temperature)}|${getQueueBand(ctx.queue)}|${getDayPart(ctx.hour)}`
}

const DAY_PART_LABEL: Record<DayPart, string> = {
  manana: 'Mañana',
  tarde: 'Tarde',
  noche: 'Noche',
}

export function describeMode(ctx: DriveThruContext): {
  emoji: string
  label: string
  detail: string
} {
  const band = getWeatherBand(ctx.temperature)
  const head =
    band === 'calor'
      ? { emoji: '☀️', text: 'Día caluroso → Bebidas frías' }
      : band === 'frio'
        ? { emoji: '🍂', text: 'Día fresco → Bebidas calientes' }
        : { emoji: '🌤️', text: 'Clima templado → Mixto' }
  const extras = [DAY_PART_LABEL[getDayPart(ctx.hour)]]
  if (getQueueBand(ctx.queue) === 'larga') extras.push('Fila larga: selección premium')
  return { emoji: head.emoji, label: head.text, detail: extras.join(' · ') }
}

const TIME_TAGS: Record<DayPart, string[]> = {
  manana: ['cafe', 'desayuno'],
  tarde: ['frappe', 'postre'],
  noche: [],
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function recommend(
  products: Product[],
  ctx: DriveThruContext,
  rng: () => number = Math.random,
  count = 4,
): Product[] {
  const band = getWeatherBand(ctx.temperature)
  const wanted = band === 'calor' ? 'fria' : band === 'frio' ? 'caliente' : null
  const pool = products.filter((p) => wanted === null || p.temperature === wanted)

  const tags = TIME_TAGS[getDayPart(ctx.hour)]
  const matches = pool.filter((p) => p.tags.some((t) => tags.includes(t)))
  const rest = pool.filter((p) => !matches.includes(p))

  const order = (group: Product[]) =>
    getQueueBand(ctx.queue) === 'larga'
      ? [...group].sort((a, b) => b.price - a.price)
      : shuffle(group, rng)

  return [...order(matches), ...order(rest)].slice(0, count)
}

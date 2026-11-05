export function formatPrice(price: number): string {
  return Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`
}

const pad = (n: number) => String(n).padStart(2, '0')

export function formatClock(now: Date, mode: 'real' | 'manual', manualHour: number): string {
  return mode === 'manual'
    ? `${pad(manualHour)}:00`
    : `${pad(now.getHours())}:${pad(now.getMinutes())}`
}

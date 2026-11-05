const TAMPICO = { lat: 22.2331, lon: -97.8611 }

export function buildWeatherUrl(apiKey: string): string {
  const params = new URLSearchParams({
    lat: String(TAMPICO.lat),
    lon: String(TAMPICO.lon),
    units: 'metric',
    appid: apiKey,
  })
  return `https://api.openweathermap.org/data/2.5/weather?${params}`
}

export function parseWeatherResponse(json: unknown): number | null {
  if (typeof json !== 'object' || json === null) return null
  const main = (json as { main?: unknown }).main
  if (typeof main !== 'object' || main === null) return null
  const temp = (main as { temp?: unknown }).temp
  return typeof temp === 'number' && Number.isFinite(temp) ? temp : null
}

import { useEffect, useState } from 'react'
import { buildWeatherUrl, parseWeatherResponse } from '../lib/weather'

export type WeatherStatus = 'idle' | 'loading' | 'ok' | 'error' | 'no-key'

const REFRESH_MS = 10 * 60 * 1000
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined

export function useWeather(enabled: boolean): { realTemp: number | null; status: WeatherStatus } {
  const [realTemp, setRealTemp] = useState<number | null>(null)
  const [fetchStatus, setFetchStatus] = useState<WeatherStatus>('idle')

  useEffect(() => {
    if (!enabled || !API_KEY) return
    const controller = new AbortController()

    const load = async () => {
      setFetchStatus((s) => (s === 'ok' ? s : 'loading'))
      try {
        const res = await fetch(buildWeatherUrl(API_KEY), { signal: controller.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const temp = parseWeatherResponse(await res.json())
        if (temp === null) throw new Error('Respuesta inválida')
        setRealTemp(temp)
        setFetchStatus('ok')
      } catch {
        if (!controller.signal.aborted) setFetchStatus('error')
      }
    }

    void load()
    const id = setInterval(load, REFRESH_MS)
    return () => {
      controller.abort()
      clearInterval(id)
    }
  }, [enabled])

  const status: WeatherStatus = !API_KEY ? 'no-key' : enabled ? fetchStatus : 'idle'
  return { realTemp: status === 'ok' ? realTemp : null, status }
}

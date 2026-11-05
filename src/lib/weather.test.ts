import { describe, expect, it } from 'vitest'
import { buildWeatherUrl, parseWeatherResponse } from './weather'

describe('buildWeatherUrl', () => {
  it('apunta a Tampico en métrico con la key', () => {
    const url = buildWeatherUrl('abc')
    expect(url).toContain('lat=22.2331')
    expect(url).toContain('lon=-97.8611')
    expect(url).toContain('units=metric')
    expect(url).toContain('appid=abc')
  })
})

describe('parseWeatherResponse', () => {
  it('extrae main.temp', () => {
    expect(parseWeatherResponse({ main: { temp: 31.2 } })).toBe(31.2)
  })
  it.each([[{}], [null], [{ main: { temp: 'x' } }], [{ main: { temp: NaN } }], ['texto']])(
    'devuelve null para %j',
    (input) => {
      expect(parseWeatherResponse(input)).toBeNull()
    },
  )
})

import { useCallback, useMemo } from 'react'
import { formatClock } from '../lib/format'
import { describeMode, getContextKey, getQueueBand, getWeatherBand, recommend } from '../lib/recommendation'
import type { DriveThruContext } from '../types'
import { useClock } from './useClock'
import { useControlState } from './useControlState'
import { useMenu } from './useMenu'
import { useTempInput } from './useTempInput'
import { useWeather } from './useWeather'

export function useDriveThru() {
  const { state: control, update, reset } = useControlState()
  const { products, source: menuSource } = useMenu()
  const commitManualTemp = useCallback((manualTemp: number) => update({ manualTemp }), [update])
  const tempInput = useTempInput(control.manualTemp, commitManualTemp)
  const now = useClock()
  const { realTemp, status: weatherStatus } = useWeather(control.weatherMode === 'real')

  const usingRealTemp = control.weatherMode === 'real' && realTemp !== null
  const temperature = usingRealTemp ? realTemp : control.manualTemp
  const hour = control.hourMode === 'manual' ? control.manualHour : now.getHours()

  const context: DriveThruContext = { temperature, queue: control.queue, hour }
  const contextKey = getContextKey(context)
  const mode = describeMode(context)

  // Se recalcula solo al cambiar de banda (clima|fila|franja) o de catálogo,
  // no con cada tick del reloj ni con cada movimiento del slider.
  const featured = useMemo(
    () => recommend(products, context),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contextKey, products],
  )
  const menu = useMemo(
    () => products.filter((p) => !featured.some((f) => f.id === p.id)),
    [products, featured],
  )

  const band = getWeatherBand(temperature)
  const premium = getQueueBand(control.queue) === 'larga'
  const displayTime = formatClock(now, control.hourMode, control.manualHour)

  return {
    band,
    premium,
    displayTime,
    context,
    contextKey,
    mode,
    featured,
    menu,
    control,
    tempInput,
    update,
    reset,
    weatherStatus,
    usingRealTemp,
    menuSource,
    now,
  }
}

export type DriveThruApp = ReturnType<typeof useDriveThru>

import type { DriveThruApp } from '../hooks'
import { formatPrice } from '../lib/format'
import { HourSelect } from './HourSelect'
import { QueueSlider } from './QueueSlider'
import { TempControl } from './TempControl'
import { WeatherToggle } from './WeatherToggle'

interface ControlPanelProps {
  app: DriveThruApp
}

export function ControlPanel({ app }: ControlPanelProps) {
  const { control, update, reset, weatherStatus, featured, mode } = app
  const realActive = app.usingRealTemp

  return (
    <main className="panel" data-band={app.band}>
      <header className="panel__head">
        <h1>Panel de control</h1>
        <div className="panel__links">
          <a href="/" target="_blank" rel="noreferrer">
            Abrir pantalla en otra pestaña ↗
          </a>
        </div>
      </header>

      <div className="panel__grid">
        <section className="panel__controls" aria-label="Controles">
          <QueueSlider value={control.queue} onChange={(queue) => update({ queue })} />
          <WeatherToggle
            mode={control.weatherMode}
            status={weatherStatus}
            onChange={(weatherMode) => update({ weatherMode })}
          />
          <TempControl
            text={app.tempInput.text}
            value={control.manualTemp}
            disabled={realActive}
            onTextChange={app.tempInput.onChange}
            onBlur={app.tempInput.onBlur}
            onPick={app.tempInput.pick}
          />
          <HourSelect
            mode={control.hourMode}
            hour={control.manualHour}
            onChange={(patch) => update(patch)}
          />
          <button type="button" className="panel__reset" onClick={reset}>
            Restablecer valores
          </button>
        </section>

        <section className="panel__preview" aria-label="Vista previa" aria-live="polite">
          <p className="panel__mode">
            <span aria-hidden="true">{mode.emoji} </span>
            {mode.label}
          </p>
          <p className="panel__facts">
            {Math.round(app.context.temperature)} °C · {app.context.queue} carros · {app.displayTime}
          </p>
          <ol>
            {featured.map((p) => (
              <li key={p.id}>
                <span>{p.name}</span>
                <span>{formatPrice(p.price)}</span>
              </li>
            ))}
          </ol>
          <p className="panel__note">
            Catálogo: {app.menuSource === 'supabase' ? 'Supabase' : 'respaldo local'}
          </p>
        </section>
      </div>
    </main>
  )
}

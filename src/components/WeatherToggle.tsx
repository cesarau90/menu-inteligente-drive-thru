import type { WeatherStatus } from '../hooks'

interface WeatherToggleProps {
  mode: 'real' | 'simulated'
  status: WeatherStatus
  onChange: (mode: 'real' | 'simulated') => void
}

const STATUS_TEXT: Record<WeatherStatus, string> = {
  idle: '',
  loading: 'Consultando OpenWeatherMap…',
  ok: 'Clima real de Tampico activo',
  error: 'No se pudo obtener el clima real: usando temperatura simulada',
  'no-key': 'Sin API key de OpenWeatherMap: usando temperatura simulada',
}

export function WeatherToggle({ mode, status, onChange }: WeatherToggleProps) {
  const unavailable = status === 'no-key'
  return (
    <fieldset className="field">
      <legend className="field__label">Fuente del clima</legend>
      <div className="seg">
        <button
          type="button"
          aria-pressed={mode === 'simulated'}
          onClick={() => onChange('simulated')}
        >
          Simulado
        </button>
        <button
          type="button"
          aria-pressed={mode === 'real'}
          disabled={unavailable}
          onClick={() => onChange('real')}
        >
          Real (Tampico)
        </button>
      </div>
      {mode === 'real' || unavailable ? (
        <p className="field__hint" role="status">
          {STATUS_TEXT[status]}
        </p>
      ) : null}
    </fieldset>
  )
}

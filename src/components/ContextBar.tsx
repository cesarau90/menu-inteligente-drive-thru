interface ContextBarProps {
  temperature: number
  queue: number
  time: string
  mode: { emoji: string; label: string; detail: string }
  tempSource: 'real' | 'simulada'
}

export function ContextBar({ temperature, queue, time, mode, tempSource }: ContextBarProps) {
  return (
    <header className="ctx">
      <div className="ctx__cell">
        <span className="ctx__label">Temp · {tempSource}</span>
        <span className="ctx__value">
          {Math.round(temperature)}
          <span className="ctx__unit">°C</span>
        </span>
      </div>
      <div className="ctx__cell">
        <span className="ctx__label">En fila</span>
        <span className="ctx__value">
          {queue}
          <span className="ctx__unit">{queue === 1 ? 'carro' : 'carros'}</span>
        </span>
      </div>
      <div className="ctx__cell">
        <span className="ctx__label">Hora</span>
        <span className="ctx__value">{time}</span>
      </div>
      <div className="ctx__cell ctx__mode" aria-live="polite">
        <span className="ctx__label">{mode.detail}</span>
        <span className="ctx__value">
          <span aria-hidden="true">{mode.emoji} </span>
          {mode.label}
        </span>
      </div>
    </header>
  )
}

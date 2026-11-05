interface QueueSliderProps {
  value: number
  onChange: (value: number) => void
}

export function QueueSlider({ value, onChange }: QueueSliderProps) {
  return (
    <div className="field">
      <label htmlFor="queue" className="field__label">
        Carros en fila: <strong>{value}</strong>
        <span className="field__hint">{value > 5 ? 'Fila larga → premium' : 'Fila corta → aleatorio'}</span>
      </label>
      <input
        id="queue"
        type="range"
        min={0}
        max={15}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="field__scale" aria-hidden="true">
        <span>0</span>
        <span>5</span>
        <span>15</span>
      </div>
    </div>
  )
}

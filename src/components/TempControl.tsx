const PRESETS = [
  { temp: 15, label: '15 °C frío' },
  { temp: 24, label: '24 °C templado' },
  { temp: 33, label: '33 °C calor' },
]

interface TempControlProps {
  /** Texto del campo: puede estar vacío o ser "-" mientras el usuario escribe. */
  text: string
  /** Temperatura vigente (último valor válido), para marcar el botón rápido activo. */
  value: number
  disabled: boolean
  onTextChange: (text: string) => void
  onBlur: () => void
  onPick: (temp: number) => void
}

export function TempControl({ text, value, disabled, onTextChange, onBlur, onPick }: TempControlProps) {
  return (
    <div className="field">
      <label htmlFor="temp" className="field__label">
        Temperatura manual (°C)
        <span className="field__hint">
          {disabled ? 'Se usa el clima real' : '> 28 bebidas frías · < 20 calientes · en medio mixto'}
        </span>
      </label>
      <input
        id="temp"
        type="number"
        inputMode="decimal"
        min={-10}
        max={50}
        step={0.5}
        value={text}
        disabled={disabled}
        onChange={(e) => onTextChange(e.target.value)}
        onBlur={onBlur}
      />
      <div className="presets" role="group" aria-label="Temperaturas rápidas para la demo">
        {PRESETS.map((p) => (
          <button
            key={p.temp}
            type="button"
            aria-pressed={value === p.temp}
            disabled={disabled}
            onClick={() => onPick(p.temp)}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}

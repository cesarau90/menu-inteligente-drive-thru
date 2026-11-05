interface TempControlProps {
  value: number
  disabled: boolean
  onChange: (value: number) => void
}

export function TempControl({ value, disabled, onChange }: TempControlProps) {
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
        value={value}
        disabled={disabled}
        onChange={(e) => {
          const n = e.target.valueAsNumber
          if (Number.isFinite(n)) onChange(n)
        }}
      />
    </div>
  )
}

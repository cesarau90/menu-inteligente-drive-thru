interface HourSelectProps {
  mode: 'real' | 'manual'
  hour: number
  onChange: (patch: { hourMode: 'real' | 'manual'; manualHour?: number }) => void
}

export function HourSelect({ mode, hour, onChange }: HourSelectProps) {
  return (
    <div className="field">
      <label htmlFor="hour" className="field__label">
        Hora del día
        <span className="field__hint">6–12 café y desayuno · 12–19 frappés y postres · noche mixto</span>
      </label>
      <select
        id="hour"
        value={mode === 'real' ? 'real' : String(hour)}
        onChange={(e) =>
          e.target.value === 'real'
            ? onChange({ hourMode: 'real' })
            : onChange({ hourMode: 'manual', manualHour: Number(e.target.value) })
        }
      >
        <option value="real">Hora real del equipo</option>
        {Array.from({ length: 24 }, (_, h) => (
          <option key={h} value={h}>
            {String(h).padStart(2, '0')}:00
          </option>
        ))}
      </select>
    </div>
  )
}

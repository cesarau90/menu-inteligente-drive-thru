export type WeatherBand = 'calor' | 'frio' | 'templado'
export type DayPart = 'manana' | 'tarde' | 'noche'
export type QueueBand = 'corta' | 'larga'

export interface DriveThruContext {
  temperature: number
  queue: number
  hour: number
}

export interface ControlState {
  queue: number
  weatherMode: 'real' | 'simulated'
  manualTemp: number
  hourMode: 'real' | 'manual'
  manualHour: number
}

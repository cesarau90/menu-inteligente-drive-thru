import { describe, expect, it } from 'vitest'
import { DEFAULT_CONTROL_STATE } from './controlState'
import {
  INITIAL_SYNC,
  onIncoming,
  onLocalChange,
  parseControlPayload,
  type SyncState,
} from './controlSync'

describe('parseControlPayload', () => {
  it('acepta un estado válido', () => {
    const state = { queue: 9, weatherMode: 'simulated', manualTemp: 15, hourMode: 'manual', manualHour: 8 }
    expect(parseControlPayload({ state })).toEqual(state)
  })

  it('limita valores fuera de rango (un mensaje externo no puede romper la pantalla)', () => {
    const r = parseControlPayload({ state: { queue: 99, manualTemp: 900, manualHour: 40 } })
    expect(r).toMatchObject({ queue: 15, manualTemp: 50, manualHour: 23 })
  })

  it('completa con los valores por defecto lo que falte', () => {
    expect(parseControlPayload({ state: { queue: 4 } })).toEqual({ ...DEFAULT_CONTROL_STATE, queue: 4 })
  })

  it.each([[null], [undefined], ['texto'], [42], [{}], [{ state: null }], [{ state: 'x' }], [[]]])(
    'rechaza %j',
    (payload) => {
      expect(parseControlPayload(payload)).toBeNull()
    },
  )
})

describe('onIncoming (cómo se une un cliente nuevo)', () => {
  const fresh: SyncState = INITIAL_SYNC

  it('un cliente recién abierto no ha sincronizado ni tiene nada que responder', () => {
    expect(INITIAL_SYNC).toEqual({ synced: false, touched: false })
  })

  it('un cambio en vivo (control) siempre se aplica y deja al cliente sincronizado', () => {
    expect(onIncoming(fresh, 'control')).toEqual({
      apply: true, reply: false, next: { synced: true, touched: true },
    })
    const synced: SyncState = { synced: true, touched: true }
    expect(onIncoming(synced, 'control').apply).toBe(true)
  })

  it('la primera respuesta (state) a mi solicitud se adopta', () => {
    expect(onIncoming(fresh, 'state')).toEqual({
      apply: true, reply: false, next: { synced: true, touched: true },
    })
  })

  it('las respuestas siguientes se ignoran: no pisan lo ya sincronizado', () => {
    const synced: SyncState = { synced: true, touched: true }
    const r = onIncoming(synced, 'state')
    expect(r.apply).toBe(false)
    expect(r.next).toEqual(synced)
  })

  it('una respuesta tardía no pisa un cambio en vivo posterior', () => {
    const afterLive = onIncoming(fresh, 'control').next
    expect(onIncoming(afterLive, 'state').apply).toBe(false)
  })

  it('solo responde a una solicitud (request) quien ya participó', () => {
    expect(onIncoming(fresh, 'request')).toEqual({ apply: false, reply: false, next: fresh })
    const touched: SyncState = { synced: true, touched: true }
    expect(onIncoming(touched, 'request')).toEqual({ apply: false, reply: true, next: touched })
  })

  it('un cambio local marca al cliente como sincronizado y con estado que compartir', () => {
    expect(onLocalChange()).toEqual({ synced: true, touched: true })
  })
})

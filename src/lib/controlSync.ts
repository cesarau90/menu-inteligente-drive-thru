import type { ControlState } from '../types'
import { parseControlState } from './controlState'

/** Nombre del canal de Supabase Realtime (Broadcast) que comparten el panel y la pantalla. */
export const SYNC_CHANNEL = 'drive-thru'

/**
 * Eventos del canal:
 * - control: el estado completo después de un cambio en vivo (lo manda quien cambió algo).
 * - request: "acabo de abrir, ¿alguien tiene el estado?" (lo manda un cliente al conectarse).
 * - state: respuesta a un request, con el estado de quien ya participó.
 */
export type SyncEvent = 'control' | 'request' | 'state'

/** Valida un mensaje recibido. Los valores se limitan a su rango, así un mensaje ajeno no rompe la pantalla. */
export function parseControlPayload(payload: unknown): ControlState | null {
  if (typeof payload !== 'object' || payload === null) return null
  const state = (payload as { state?: unknown }).state
  if (typeof state !== 'object' || state === null || Array.isArray(state)) return null
  return parseControlState(JSON.stringify(state))
}

export interface SyncState {
  /** Ya tengo un estado confiable (cambio local, cambio en vivo o respuesta adoptada). */
  synced: boolean
  /** Ya participé: tengo un estado que vale la pena compartir con quien se una. */
  touched: boolean
}

export const INITIAL_SYNC: SyncState = { synced: false, touched: false }

/**
 * Qué hacer con un mensaje entrante. No se comparan relojes entre dispositivos: un cambio en vivo
 * siempre gana, y de las respuestas a mi solicitud solo se adopta la primera.
 */
export function onIncoming(
  s: SyncState,
  kind: SyncEvent,
): { apply: boolean; reply: boolean; next: SyncState } {
  switch (kind) {
    case 'control':
      return { apply: true, reply: false, next: { synced: true, touched: true } }
    case 'state': {
      const apply = !s.synced
      return { apply, reply: false, next: apply ? { synced: true, touched: true } : s }
    }
    case 'request':
      return { apply: false, reply: s.touched, next: s }
  }
}

export function onLocalChange(): SyncState {
  return { synced: true, touched: true }
}

import type { GameState, InitialGameState, ZoneState, Card, CardAdded, CardRemoved, CardMoved, CardRotated } from '../types/boardgamevision'

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isCard(value: unknown): value is Card {
  return isRecord(value) && typeof value['id'] === 'number' && typeof value['r'] === 'number'
}

export function isPlayer(value: unknown): value is 1 | 2 {
  return value === 1 || value === 2
}

export function normalizeZones(arr: unknown): ZoneState[] {
  if (!Array.isArray(arr)) return []
  return arr.map((z: unknown): ZoneState => ({
    zone: isRecord(z) && typeof z['zone'] === 'string' ? z['zone'] : '',
    cards: isRecord(z) && Array.isArray(z['cards']) ? z['cards'].filter(isCard) : [],
  }))
}

export function normalizeAdded(arr: unknown): CardAdded[] {
  if (!Array.isArray(arr)) return []
  return arr.filter((c): c is CardAdded =>
    isRecord(c) && isPlayer(c['player']) && typeof c['zone'] === 'string' && isCard(c['card'])
  )
}

export function normalizeRemoved(arr: unknown): CardRemoved[] {
  if (!Array.isArray(arr)) return []
  return arr.filter((c): c is CardRemoved =>
    isRecord(c) && isPlayer(c['player']) && typeof c['zone'] === 'string' && typeof c['cardId'] === 'number'
  )
}

export function normalizeMoved(arr: unknown): CardMoved[] {
  if (!Array.isArray(arr)) return []
  return arr.filter((c): c is CardMoved =>
    isRecord(c) &&
    isPlayer(c['fromPlayer']) && typeof c['fromZone'] === 'string' &&
    isPlayer(c['toPlayer']) && typeof c['toZone'] === 'string' &&
    typeof c['cardId'] === 'number' && typeof c['rotation'] === 'number'
  )
}

export function normalizeRotated(arr: unknown): CardRotated[] {
  if (!Array.isArray(arr)) return []
  return arr.filter((c): c is CardRotated =>
    isRecord(c) && isPlayer(c['player']) && typeof c['zone'] === 'string' &&
    typeof c['cardId'] === 'number' &&
    typeof c['fromRotation'] === 'number' && typeof c['toRotation'] === 'number'
  )
}

export function normalizeGameState(raw: unknown): GameState {
  if (!isRecord(raw)) return { p1: [], p2: [] }
  return {
    p1: normalizeZones(raw['p1']),
    p2: normalizeZones(raw['p2']),
    added:   normalizeAdded(raw['added']),
    removed: normalizeRemoved(raw['removed']),
    moved:   normalizeMoved(raw['moved']),
    rotated: normalizeRotated(raw['rotated']),
  }
}

export function normalizeInitialGameState(raw: unknown): InitialGameState {
  if (!isRecord(raw)) return { nn1: '', nn2: '', p1: [], p2: [] }
  return {
    nn1: typeof raw['nn1'] === 'string' ? raw['nn1'] : '',
    nn2: typeof raw['nn2'] === 'string' ? raw['nn2'] : '',
    p1: normalizeZones(raw['p1']),
    p2: normalizeZones(raw['p2']),
  }
}

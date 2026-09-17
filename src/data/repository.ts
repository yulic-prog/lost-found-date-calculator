import { SAMPLE_ITEMS } from './sample'
import type { LostFoundItem } from '../domain/types'

const STORAGE_KEY = 'lost-found.items.v1'

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readStored(): LostFoundItem[] | null {
  if (!canUseStorage()) return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as LostFoundItem[]
    if (!Array.isArray(parsed)) return null
    return parsed
  } catch {
    return null
  }
}

function writeStored(items: LostFoundItem[]) {
  if (!canUseStorage()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function loadItems(): LostFoundItem[] {
  const stored = readStored()
  if (stored && stored.length > 0) return stored
  writeStored(SAMPLE_ITEMS)
  return SAMPLE_ITEMS.map((item) => ({ ...item }))
}

export function saveItems(items: LostFoundItem[]) {
  writeStored(items)
}

export function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

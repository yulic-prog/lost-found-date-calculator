import { isValidISODate, todayISO } from './dates'
import { MATCH_DATE_REQUIRED_STATUSES } from './statuses'
import type { ItemDraft, LostFoundItem, OperationalStatus } from './types'

export interface FieldErrors {
  itemId?: string
  description?: string
  foundDate?: string
  matchDate?: string
  operationalStatus?: string
}

export function normalizeItemId(value: string): string {
  return value.trim()
}

export function validateItemDraft(
  draft: ItemDraft,
  items: LostFoundItem[],
  options: { currentItemId?: string } = {},
): FieldErrors {
  const errors: FieldErrors = {}
  const itemId = normalizeItemId(draft.itemId)
  const description = draft.description.trim()
  const foundDate = draft.foundDate.trim()
  const matchDate = draft.matchDate.trim()
  const today = todayISO()

  if (!itemId) {
    errors.itemId = 'Item ID is required.'
  } else {
    const duplicate = items.find(
      (item) =>
        item.id !== options.currentItemId &&
        normalizeItemId(item.itemId).toLowerCase() === itemId.toLowerCase(),
    )
    if (duplicate) {
      errors.itemId = 'An item with this ID already exists. Existing records are not overwritten.'
    }
  }

  if (!description) {
    errors.description = 'Description is required.'
  }

  if (!foundDate) {
    errors.foundDate = 'Found Date is required.'
  } else if (!isValidISODate(foundDate)) {
    errors.foundDate = 'Found Date must be a valid date.'
  } else if (foundDate > today) {
    errors.foundDate = 'Found Date cannot be in the future.'
  }

  if (matchDate) {
    if (!isValidISODate(matchDate)) {
      errors.matchDate = 'Match Date must be a valid date.'
    } else if (isValidISODate(foundDate) && matchDate < foundDate) {
      errors.matchDate = 'Match Date cannot be before Found Date.'
    }
  } else if (requiresMatchDate(draft.operationalStatus)) {
    errors.matchDate = 'Match Date is required for this status.'
  }

  return errors
}

export function hasFieldErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0
}

export function requiresMatchDate(status: OperationalStatus): boolean {
  return MATCH_DATE_REQUIRED_STATUSES.includes(status)
}

import { describe, expect, it } from 'vitest'
import { validateItemDraft } from '../domain/validation'
import { SAMPLE_ITEMS } from '../data/sample'
import type { ItemDraft } from '../domain/types'

const valid: ItemDraft = {
  itemId: 'LF-2001',
  description: 'Grey scarf',
  foundDate: '2026-09-01',
  matchDate: '',
  operationalStatus: 'open',
}

describe('item validation', () => {
  it('requires Item ID, description, and a valid Found Date', () => {
    const errors = validateItemDraft(
      { ...valid, itemId: '', description: '', foundDate: 'not-a-date' },
      [],
    )
    expect(errors.itemId).toBe('Item ID is required.')
    expect(errors.description).toBe('Description is required.')
    expect(errors.foundDate).toBe('Found Date must be a valid date.')
  })

  it('prevents duplicate Item IDs without overwriting', () => {
    const errors = validateItemDraft({ ...valid, itemId: 'lf-1042' }, SAMPLE_ITEMS)
    expect(errors.itemId).toMatch(/already exists/)
  })

  it('rejects Match Date before Found Date', () => {
    const errors = validateItemDraft(
      { ...valid, foundDate: '2026-09-10', matchDate: '2026-09-09' },
      [],
    )
    expect(errors.matchDate).toBe('Match Date cannot be before Found Date.')
  })

  it('requires Match Date when status is Matched', () => {
    const errors = validateItemDraft(
      { ...valid, operationalStatus: 'matched', matchDate: '' },
      [],
    )
    expect(errors.matchDate).toBe('Match Date is required for this status.')
  })
})

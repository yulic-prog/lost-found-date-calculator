import { describe, expect, it } from 'vitest'
import { getNextAction } from '../domain/nextAction'
import { computeWorkflowDates } from '../domain/workflow'
import type { LostFoundItem } from '../domain/types'

function item(overrides: Partial<LostFoundItem> & Pick<LostFoundItem, 'matchDate' | 'operationalStatus' | 'recordState'>): LostFoundItem {
  const foundDate = overrides.foundDate ?? '2026-08-01'
  return {
    id: 'test',
    itemId: 'LF-TEST',
    description: 'Test item',
    foundDate,
    submittedAt: null,
    approvedAt: null,
    excelReady: false,
    excelExportedAt: null,
    createdAt: foundDate,
    updatedAt: foundDate,
    workflowDates: computeWorkflowDates({
      foundDate,
      matchDate: overrides.matchDate,
    }),
    ...overrides,
  }
}

describe('next action from confirmed rules', () => {
  it('flags 7-Day Notice when that date has arrived and donation has not', () => {
    const action = getNextAction(
      item({
        matchDate: '2026-08-24',
        recordState: 'approved',
        operationalStatus: 'matched',
      }),
      '2026-09-16',
    )
    expect(action.kind).toBe('seven_day_notice')
    expect(action.urgency).toBe('attention')
    expect(action.dueDate).toBe('2026-09-16')
  })

  it('flags donation when Match Date + 30 has arrived', () => {
    const action = getNextAction(
      item({
        matchDate: '2026-08-17',
        recordState: 'approved',
        operationalStatus: 'seven_day_notice',
      }),
      '2026-09-16',
    )
    expect(action.kind).toBe('donate')
    expect(action.urgency).toBe('attention')
    expect(action.dueDate).toBe('2026-09-16')
  })
})

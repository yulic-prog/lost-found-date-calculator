import { describe, expect, it } from 'vitest'
import {
  computeWorkflowDates,
  donationDateFromMatchDate,
  sevenDayNoticeFromMatchDate,
} from '../domain/workflow'

describe('confirmed Match Date retention rules', () => {
  it('sets Donation Date to Match Date + 30 calendar days', () => {
    expect(donationDateFromMatchDate('2026-08-24')).toBe('2026-09-23')
    expect(donationDateFromMatchDate('2026-08-17')).toBe('2026-09-16')
    expect(donationDateFromMatchDate('2026-01-31')).toBe('2026-03-02')
    expect(donationDateFromMatchDate('2024-01-31')).toBe('2024-03-01')
    expect(donationDateFromMatchDate('2025-12-15')).toBe('2026-01-14')
  })

  it('sets 7-Day Notice Date to Donation Date minus 7 calendar days', () => {
    expect(sevenDayNoticeFromMatchDate('2026-08-24')).toBe('2026-09-16')
    expect(sevenDayNoticeFromMatchDate('2026-08-17')).toBe('2026-09-09')
    expect(sevenDayNoticeFromMatchDate('2026-01-31')).toBe('2026-02-23')
    expect(sevenDayNoticeFromMatchDate('2024-01-31')).toBe('2024-02-23')
  })

  it('computes both confirmed dates from Match Date and leaves unconfirmed fields blank', () => {
    const dates = computeWorkflowDates({
      foundDate: '2026-08-01',
      matchDate: '2026-08-10',
    })
    expect(dates.donate).toBe('2026-09-09')
    expect(dates.sevenDayNotice).toBe('2026-09-02')
    expect(dates.verify).toBeNull()
    expect(dates.lastChance).toBeNull()
    expect(dates.expiresOn).toBeNull()
  })

  it('does not invent dates when Match Date is missing', () => {
    const dates = computeWorkflowDates({
      foundDate: '2026-09-10',
      matchDate: null,
    })
    expect(dates.donate).toBeNull()
    expect(dates.sevenDayNotice).toBeNull()
    expect(dates.verify).toBeNull()
    expect(dates.lastChance).toBeNull()
    expect(dates.expiresOn).toBeNull()
  })
})

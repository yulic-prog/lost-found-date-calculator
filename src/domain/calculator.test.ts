import { describe, expect, it } from 'vitest'
import { calculateDates, excelCutoffMatchDate, formatResultsCopy } from './calculator'
import { addCalendarDays, formatLongDate } from './dates'

describe('30-day date calculator', () => {
  it('computes donation and notice dates from a match date', () => {
    expect(calculateDates('2026-09-16')).toEqual({
      matchDate: '2026-09-16',
      donationDate: '2026-10-16',
      noticeDate: '2026-10-09',
    })
  })

  it('formats a clean copy payload for Excel', () => {
    expect(formatResultsCopy('2026-10-16', '2026-10-09')).toBe(
      ['Donation Date: 16 Oct 2026', '7-Day Notice: 9 Oct 2026'].join('\n'),
    )
  })

  it('formats long dates for the results cards', () => {
    expect(formatLongDate('2026-09-16')).toBe('Wednesday, 16 September 2026')
  })

  it('gives the Excel cutoff as the match date whose notice is today', () => {
    expect(excelCutoffMatchDate('2026-10-20')).toBe('2026-09-27')
    expect(excelCutoffMatchDate('2026-10-21')).toBe('2026-09-28')
    expect(excelCutoffMatchDate('2026-10-19')).toBe('2026-09-26')
  })

  it('moves the Excel cutoff forward one day when today moves forward one day', () => {
    const first = excelCutoffMatchDate('2026-01-01')
    const next = excelCutoffMatchDate('2026-01-02')
    expect(next).toBe(addCalendarDays(first, 1))
  })

  it('rolls the Excel cutoff across the new year', () => {
    expect(excelCutoffMatchDate('2026-01-05')).toBe('2025-12-13')
  })

  it('treats the cutoff as the match date that calculates back to today', () => {
    const today = '2026-10-20'
    const cutoff = excelCutoffMatchDate(today)
    expect(calculateDates(cutoff).noticeDate).toBe(today)
  })
})

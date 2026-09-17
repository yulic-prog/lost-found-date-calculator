import { describe, expect, it } from 'vitest'
import { calculateDates, formatResultsCopy } from './calculator'
import { formatLongDate } from './dates'

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
})

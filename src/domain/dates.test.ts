import { describe, expect, it } from 'vitest'
import { addCalendarDays, isValidISODate } from '../domain/dates'

describe('calendar date arithmetic', () => {
  it('rejects impossible calendar dates', () => {
    expect(isValidISODate('2026-02-30')).toBe(false)
    expect(isValidISODate('2026-13-01')).toBe(false)
    expect(isValidISODate('2026-09-16')).toBe(true)
  })

  it('adds 30 calendar days across a 31-day month', () => {
    expect(addCalendarDays('2026-01-31', 30)).toBe('2026-03-02')
    expect(addCalendarDays('2026-03-31', 30)).toBe('2026-04-30')
    expect(addCalendarDays('2026-05-31', 30)).toBe('2026-06-30')
  })

  it('adds 30 calendar days across a 30-day month', () => {
    expect(addCalendarDays('2026-04-30', 30)).toBe('2026-05-30')
    expect(addCalendarDays('2026-06-30', 30)).toBe('2026-07-30')
    expect(addCalendarDays('2026-11-30', 30)).toBe('2026-12-30')
  })

  it('handles February in a common year', () => {
    expect(addCalendarDays('2023-01-31', 30)).toBe('2023-03-02')
    expect(addCalendarDays('2023-02-01', 30)).toBe('2023-03-03')
    expect(addCalendarDays('2023-02-28', 30)).toBe('2023-03-30')
  })

  it('handles February in a leap year', () => {
    expect(addCalendarDays('2024-01-31', 30)).toBe('2024-03-01')
    expect(addCalendarDays('2024-02-01', 30)).toBe('2024-03-02')
    expect(addCalendarDays('2024-02-29', 30)).toBe('2024-03-30')
  })

  it('handles year changes', () => {
    expect(addCalendarDays('2025-12-02', 30)).toBe('2026-01-01')
    expect(addCalendarDays('2025-12-15', 30)).toBe('2026-01-14')
    expect(addCalendarDays('2025-12-31', 30)).toBe('2026-01-30')
  })

  it('subtracts calendar days across month and year boundaries', () => {
    expect(addCalendarDays('2026-03-02', -7)).toBe('2026-02-23')
    expect(addCalendarDays('2026-01-03', -7)).toBe('2025-12-27')
    expect(addCalendarDays('2024-03-01', -1)).toBe('2024-02-29')
    expect(addCalendarDays('2023-03-01', -1)).toBe('2023-02-28')
  })
})

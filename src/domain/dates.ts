const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const WEEKDAYS_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export function monthNameLong(month: number): string {
  return MONTHS_LONG[month - 1] ?? ''
}

export function todayISO(now = new Date()): string {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isValidISODate(value: string): boolean {
  const match = ISO_DATE.exec(value.trim())
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

export function parseISODate(value: string): { year: number; month: number; day: number } {
  if (!isValidISODate(value)) {
    throw new Error(`Invalid calendar date: ${value}`)
  }
  const match = ISO_DATE.exec(value.trim())
  if (!match) {
    throw new Error(`Invalid calendar date: ${value}`)
  }
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  }
}

export function toISODate(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/**
 * True calendar-day arithmetic. Uses UTC date parts so local timezones
 * and daylight saving never shift the calendar day.
 */
export function addCalendarDays(isoDate: string, days: number): string {
  const { year, month, day } = parseISODate(isoDate)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + days)
  return toISODate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
}

export function compareISODate(a: string, b: string): number {
  if (a === b) return 0
  return a < b ? -1 : 1
}

export function isOnOrAfter(isoDate: string, relativeTo: string): boolean {
  return compareISODate(isoDate, relativeTo) >= 0
}

export function isBefore(isoDate: string, relativeTo: string): boolean {
  return compareISODate(isoDate, relativeTo) < 0
}

export function formatDisplayDate(isoDate: string | null | undefined): string {
  if (!isoDate) return ''
  if (!isValidISODate(isoDate)) return isoDate
  const { year, month, day } = parseISODate(isoDate)
  return `${day} ${MONTHS_SHORT[month - 1]} ${year}`
}

/** Matches the workplace Excel short form, e.g. 12-Sep */
export function formatExcelShortDate(isoDate: string | null | undefined): string {
  if (!isoDate) return ''
  if (!isValidISODate(isoDate)) return isoDate
  const { month, day } = parseISODate(isoDate)
  return `${day}-${MONTHS_SHORT[month - 1]}`
}

/** Compact copy format, e.g. 16 Oct 2026 */
export function formatCopyDate(isoDate: string): string {
  if (!isValidISODate(isoDate)) return isoDate
  const { year, month, day } = parseISODate(isoDate)
  return `${day} ${MONTHS_SHORT[month - 1]} ${year}`
}

/** Full reading format, e.g. Wednesday, 16 September 2026 */
export function formatLongDate(isoDate: string): string {
  if (!isValidISODate(isoDate)) return isoDate
  const parts = getDisplayParts(isoDate)
  return `${parts.weekday}, ${parts.day} ${parts.month} ${parts.year}`
}

export function getDisplayParts(isoDate: string): {
  weekday: string
  day: number
  month: string
  year: number
} {
  const { year, month, day } = parseISODate(isoDate)
  return {
    weekday: WEEKDAYS_LONG[toUtcDate(isoDate).getUTCDay()],
    day,
    month: MONTHS_LONG[month - 1],
    year,
  }
}

export function toUtcDate(isoDate: string): Date {
  const { year, month, day } = parseISODate(isoDate)
  return new Date(Date.UTC(year, month - 1, day))
}

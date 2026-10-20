import { addCalendarDays, formatCopyDate, isValidISODate } from './dates'

export const DONATION_OFFSET_DAYS = 30
export const NOTICE_OFFSET_DAYS = -7

/** Match Date → 7-Day Notice is 30 days, then back 7. Net lag is 23 days. */
export const NOTICE_LAG_FROM_MATCH_DAYS = DONATION_OFFSET_DAYS + NOTICE_OFFSET_DAYS

export function donationDateFromMatch(matchDate: string): string {
  return addCalendarDays(matchDate, DONATION_OFFSET_DAYS)
}

export function noticeDateFromDonation(donationDate: string): string {
  return addCalendarDays(donationDate, NOTICE_OFFSET_DAYS)
}

export function calculateDates(matchDate: string): {
  matchDate: string
  donationDate: string
  noticeDate: string
} {
  if (!isValidISODate(matchDate)) {
    throw new Error(`Invalid match date: ${matchDate}`)
  }
  const donationDate = donationDateFromMatch(matchDate)
  const noticeDate = noticeDateFromDonation(donationDate)
  return { matchDate, donationDate, noticeDate }
}

/**
 * Latest Match Date to key into the 7-Day Notice Excel on `today`.
 * Items matched on this date have their 7-Day Notice today.
 * Anything later is not due yet — don't go past it.
 *
 * 20 October → 27 September.
 */
export function excelCutoffMatchDate(today: string): string {
  if (!isValidISODate(today)) {
    throw new Error(`Invalid date: ${today}`)
  }
  return addCalendarDays(today, -NOTICE_LAG_FROM_MATCH_DAYS)
}

export function formatResultsCopy(donationDate: string, noticeDate: string): string {
  return [
    `Donation Date: ${formatCopyDate(donationDate)}`,
    `7-Day Notice: ${formatCopyDate(noticeDate)}`,
  ].join('\n')
}

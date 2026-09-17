import { addCalendarDays, formatCopyDate, isValidISODate } from './dates'

export const DONATION_OFFSET_DAYS = 30
export const NOTICE_OFFSET_DAYS = -7

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

export function formatResultsCopy(donationDate: string, noticeDate: string): string {
  return [
    `Donation Date: ${formatCopyDate(donationDate)}`,
    `7-Day Notice: ${formatCopyDate(noticeDate)}`,
  ].join('\n')
}

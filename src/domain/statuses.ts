import type { LostFoundItem, OperationalStatus, RecordState } from './types'

export const RECORD_STATES: RecordState[] = [
  'draft',
  'pending_approval',
  'approved',
  'closed',
]

export const OPERATIONAL_STATUSES: OperationalStatus[] = [
  'open',
  'matched',
  'seven_day_notice',
  'ready_for_donation',
  'picked_up',
  'donated_by_owner',
  'donated',
  'closed',
]

export const RECORD_STATE_LABELS: Record<RecordState, string> = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  closed: 'Closed',
}

export const OPERATIONAL_STATUS_LABELS: Record<OperationalStatus, string> = {
  open: 'Open',
  matched: 'Matched',
  seven_day_notice: '7-Day Notice',
  ready_for_donation: 'Ready for Donation',
  picked_up: 'Picked Up by Owner',
  donated_by_owner: 'Donated by Owner',
  donated: 'Donated',
  closed: 'Closed',
}

export const TERMINAL_OPERATIONAL_STATUSES: OperationalStatus[] = [
  'picked_up',
  'donated_by_owner',
  'donated',
  'closed',
]

export const MATCH_DATE_REQUIRED_STATUSES: OperationalStatus[] = [
  'matched',
  'seven_day_notice',
  'ready_for_donation',
  'picked_up',
  'donated_by_owner',
  'donated',
]

export function isTerminalStatus(status: OperationalStatus): boolean {
  return TERMINAL_OPERATIONAL_STATUSES.includes(status)
}

export function displayStatus(item: LostFoundItem): string {
  if (item.recordState === 'draft') return RECORD_STATE_LABELS.draft
  if (item.recordState === 'pending_approval') {
    return RECORD_STATE_LABELS.pending_approval
  }
  if (item.recordState === 'closed' || item.operationalStatus === 'closed') {
    return RECORD_STATE_LABELS.closed
  }
  return OPERATIONAL_STATUS_LABELS[item.operationalStatus]
}

export function statusTone(
  item: LostFoundItem,
): 'neutral' | 'pending' | 'open' | 'matched' | 'notice' | 'donate' | 'complete' {
  if (item.recordState === 'draft') return 'neutral'
  if (item.recordState === 'pending_approval') return 'pending'
  if (item.recordState === 'closed' || isTerminalStatus(item.operationalStatus)) {
    return 'complete'
  }
  if (item.operationalStatus === 'ready_for_donation') return 'donate'
  if (item.operationalStatus === 'seven_day_notice') return 'notice'
  if (item.operationalStatus === 'matched') return 'matched'
  return 'open'
}

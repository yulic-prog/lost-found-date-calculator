import { isOnOrAfter, todayISO } from './dates'
import { isTerminalStatus } from './statuses'
import type { LostFoundItem, NextAction } from './types'

function closedAction(): NextAction {
  return {
    kind: 'closed',
    label: 'Completed',
    detail: null,
    dueDate: null,
    urgency: 'completed',
    ruleStatus: 'confirmed',
  }
}

function noneAction(label = 'No action required'): NextAction {
  return {
    kind: 'none',
    label,
    detail: null,
    dueDate: null,
    urgency: 'none',
    ruleStatus: 'confirmed',
  }
}

/**
 * Next action uses only confirmed rules:
 * approval workflow, Match Date + 30 donation, and donation − 7 notice.
 * Verify / Last Chance / Expires On never generate actions until confirmed.
 */
export function getNextAction(item: LostFoundItem, today = todayISO()): NextAction {
  if (item.recordState === 'closed' || isTerminalStatus(item.operationalStatus)) {
    return closedAction()
  }

  if (item.recordState === 'draft') {
    return {
      kind: 'complete_draft',
      label: 'Submit for approval',
      detail: 'Review the item and generated dates, then submit.',
      dueDate: null,
      urgency: 'attention',
      ruleStatus: 'confirmed',
    }
  }

  if (item.recordState === 'pending_approval') {
    return {
      kind: 'approve',
      label: 'Approval required',
      detail: 'Review the generated row before adding it to the Excel workflow.',
      dueDate: null,
      urgency: 'attention',
      ruleStatus: 'confirmed',
    }
  }

  const donate = item.workflowDates.donate
  const notice = item.workflowDates.sevenDayNotice
  const noticeSent =
    item.operationalStatus === 'seven_day_notice' ||
    item.operationalStatus === 'ready_for_donation'
  const markedReady = item.operationalStatus === 'ready_for_donation'
  const donationDue = Boolean(donate && isOnOrAfter(today, donate)) || markedReady

  if (donationDue) {
    return {
      kind: 'donate',
      label: 'Donation due',
      detail: 'Retention period has ended. Item is ready for donation.',
      dueDate: donate,
      urgency: 'attention',
      ruleStatus: 'confirmed',
    }
  }

  if (notice && isOnOrAfter(today, notice) && !noticeSent) {
    return {
      kind: 'seven_day_notice',
      label: '7-Day Notice due',
      detail: 'Send the 7-day notice before the donation date.',
      dueDate: notice,
      urgency: 'attention',
      ruleStatus: 'confirmed',
    }
  }

  if (notice && !noticeSent) {
    return {
      kind: 'seven_day_notice',
      label: '7-Day Notice upcoming',
      detail: null,
      dueDate: notice,
      urgency: 'upcoming',
      ruleStatus: 'confirmed',
    }
  }

  if (donate) {
    return {
      kind: 'donate',
      label: 'Donation upcoming',
      detail: null,
      dueDate: donate,
      urgency: 'upcoming',
      ruleStatus: 'confirmed',
    }
  }

  if (!item.matchDate) {
    return {
      kind: 'awaiting_match',
      label: 'Awaiting match',
      detail: 'Enter Match Date when the owner is identified.',
      dueDate: null,
      urgency: 'none',
      ruleStatus: 'confirmed',
    }
  }

  return noneAction()
}

export function currentActionRequired(item: LostFoundItem, today = todayISO()): string {
  return getNextAction(item, today).label
}

import { getNextAction } from './nextAction'
import { todayISO } from './dates'
import type { ActionKind, LostFoundItem, NextAction } from './types'

export interface AttentionGroup {
  id: 'verify' | 'approve' | 'seven_day_notice' | 'donate' | 'draft'
  title: string
  description: string
  ruleStatus: 'confirmed' | 'requires_confirmation'
  items: Array<{ item: LostFoundItem; action: NextAction }>
}

export interface UpcomingEvent {
  item: LostFoundItem
  fieldLabel: string
  date: string
  kind: ActionKind
}

export interface QuickStats {
  open: number
  matched: number
  pendingApproval: number
  readyForDonation: number
  closed: number
}

export function buildAttentionGroups(
  items: LostFoundItem[],
  today = todayISO(),
): AttentionGroup[] {
  const withActions = items.map((item) => ({
    item,
    action: getNextAction(item, today),
  }))

  const attention = withActions.filter((entry) => entry.action.urgency === 'attention')

  return [
    {
      id: 'verify',
      title: 'Verification due',
      description:
        'Not active — the workplace Verify formula has not been confirmed.',
      ruleStatus: 'requires_confirmation',
      items: [],
    },
    {
      id: 'approve',
      title: 'Approval required',
      description: 'Items waiting for review before they can enter the Excel workflow.',
      ruleStatus: 'confirmed',
      items: attention.filter((entry) => entry.action.kind === 'approve'),
    },
    {
      id: 'seven_day_notice',
      title: '7-Day Notice due',
      description: 'Confirmed rule: 7-Day Notice Date = Donation Date − 7 calendar days.',
      ruleStatus: 'confirmed',
      items: attention.filter((entry) => entry.action.kind === 'seven_day_notice'),
    },
    {
      id: 'donate',
      title: 'Ready for donation',
      description: 'Confirmed rule: Donation Date = Match Date + 30 calendar days.',
      ruleStatus: 'confirmed',
      items: attention.filter((entry) => entry.action.kind === 'donate'),
    },
    {
      id: 'draft',
      title: 'Drafts to complete',
      description: 'Items that still need to be submitted for approval.',
      ruleStatus: 'confirmed',
      items: attention.filter((entry) => entry.action.kind === 'complete_draft'),
    },
  ]
}

export function buildUpcomingEvents(
  items: LostFoundItem[],
  today = todayISO(),
): UpcomingEvent[] {
  const events: UpcomingEvent[] = []

  for (const item of items) {
    const action = getNextAction(item, today)
    if (action.urgency !== 'upcoming' || !action.dueDate) continue
    events.push({
      item,
      fieldLabel: action.kind === 'seven_day_notice' ? '7-Day Notice' : 'Donate',
      date: action.dueDate,
      kind: action.kind,
    })
  }

  return events.sort((a, b) => a.date.localeCompare(b.date) || a.item.itemId.localeCompare(b.item.itemId))
}

export function buildQuickStats(items: LostFoundItem[], today = todayISO()): QuickStats {
  return {
    open: items.filter(
      (item) => item.operationalStatus === 'open' && item.recordState !== 'closed',
    ).length,
    matched: items.filter((item) => item.operationalStatus === 'matched').length,
    pendingApproval: items.filter((item) => item.recordState === 'pending_approval').length,
    readyForDonation: items.filter((item) => {
      if (item.operationalStatus === 'ready_for_donation') return true
      const action = getNextAction(item, today)
      return action.kind === 'donate' && action.urgency === 'attention'
    }).length,
    closed: items.filter(
      (item) =>
        item.recordState === 'closed' ||
        item.operationalStatus === 'closed' ||
        item.operationalStatus === 'picked_up' ||
        item.operationalStatus === 'donated' ||
        item.operationalStatus === 'donated_by_owner',
    ).length,
  }
}

export function searchItems(items: LostFoundItem[], query: string): LostFoundItem[] {
  const term = query.trim().toLowerCase()
  if (!term) return []

  const idMatches = items.filter((item) => item.itemId.toLowerCase().includes(term))
  if (idMatches.length > 0) {
    return [...idMatches].sort((a, b) => {
      const aExact = a.itemId.toLowerCase() === term
      const bExact = b.itemId.toLowerCase() === term
      if (aExact !== bExact) return aExact ? -1 : 1
      const aPrefix = a.itemId.toLowerCase().startsWith(term)
      const bPrefix = b.itemId.toLowerCase().startsWith(term)
      if (aPrefix !== bPrefix) return aPrefix ? -1 : 1
      return a.itemId.localeCompare(b.itemId)
    })
  }

  return items
    .filter((item) => item.description.toLowerCase().includes(term))
    .sort((a, b) => a.itemId.localeCompare(b.itemId))
}

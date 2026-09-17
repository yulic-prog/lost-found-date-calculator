import { addCalendarDays } from './dates'
import type {
  LostFoundItem,
  RuleStatus,
  WorkflowDates,
  WorkflowFieldId,
} from './types'

export interface WorkflowContext {
  foundDate: string
  matchDate: string | null
}

export interface WorkflowRule {
  id: WorkflowFieldId
  label: string
  excelHeader: string
  status: RuleStatus
  notes: string
  calculate: (context: WorkflowContext) => string | null
}

const RULE_PENDING = (): null => null

/**
 * Central business-rules layer.
 *
 * Confirmed rules live here. Unconfirmed workplace formulas return null
 * and are marked RULE REQUIRES CONFIRMATION — they are never guessed.
 *
 * Confirmed (applies when Match Date is present):
 *   Donation Date     = Match Date + 30 calendar days
 *   7-Day Notice Date = Donation Date − 7 calendar days
 *
 * Not yet confirmed:
 *   Verify, Last Chance, Expires On
 *   Any Donate / 7-Day Notice logic that does not use Match Date
 */
export const WORKFLOW_RULES: WorkflowRule[] = [
  {
    id: 'verify',
    label: 'Verify',
    excelHeader: 'Verify',
    status: 'requires_confirmation',
    notes: 'RULE REQUIRES CONFIRMATION — workplace Verify formula has not been provided.',
    calculate: RULE_PENDING,
  },
  {
    id: 'donate',
    label: 'Donate',
    excelHeader: 'Donate',
    status: 'confirmed',
    notes: 'Donation Date = Match Date + 30 calendar days. Additional Donate rules are not assumed.',
    calculate: ({ matchDate }) => (matchDate ? addCalendarDays(matchDate, 30) : null),
  },
  {
    id: 'lastChance',
    label: 'Last Chance',
    excelHeader: 'Last Chance',
    status: 'requires_confirmation',
    notes: 'RULE REQUIRES CONFIRMATION — workplace Last Chance formula has not been provided.',
    calculate: RULE_PENDING,
  },
  {
    id: 'sevenDayNotice',
    label: '7-Day Notice',
    excelHeader: '7-Day Notice',
    status: 'confirmed',
    notes: '7-Day Notice Date = Donation Date − 7 calendar days, using Match Date + 30 as Donation Date.',
    calculate: ({ matchDate }) => {
      if (!matchDate) return null
      const donationDate = addCalendarDays(matchDate, 30)
      return addCalendarDays(donationDate, -7)
    },
  },
  {
    id: 'expiresOn',
    label: 'Expires On',
    excelHeader: 'Expires on',
    status: 'requires_confirmation',
    notes: 'RULE REQUIRES CONFIRMATION — workplace Expires On formula has not been provided.',
    calculate: RULE_PENDING,
  },
]

export function getWorkflowRule(id: WorkflowFieldId): WorkflowRule {
  const rule = WORKFLOW_RULES.find((entry) => entry.id === id)
  if (!rule) {
    throw new Error(`Unknown workflow field: ${id}`)
  }
  return rule
}

export function emptyWorkflowDates(): WorkflowDates {
  return {
    verify: null,
    donate: null,
    lastChance: null,
    sevenDayNotice: null,
    expiresOn: null,
  }
}

export function computeWorkflowDates(context: WorkflowContext): WorkflowDates {
  const dates = emptyWorkflowDates()
  for (const rule of WORKFLOW_RULES) {
    dates[rule.id] = rule.calculate(context)
  }
  return dates
}

export function applyWorkflowDates(item: LostFoundItem): LostFoundItem {
  return {
    ...item,
    workflowDates: computeWorkflowDates({
      foundDate: item.foundDate,
      matchDate: item.matchDate,
    }),
  }
}

export function donationDateFromMatchDate(matchDate: string): string {
  return addCalendarDays(matchDate, 30)
}

export function sevenDayNoticeFromMatchDate(matchDate: string): string {
  return addCalendarDays(donationDateFromMatchDate(matchDate), -7)
}

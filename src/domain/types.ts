export type RecordState = 'draft' | 'pending_approval' | 'approved' | 'closed'

export type OperationalStatus =
  | 'open'
  | 'matched'
  | 'seven_day_notice'
  | 'ready_for_donation'
  | 'picked_up'
  | 'donated_by_owner'
  | 'donated'
  | 'closed'

export type WorkflowFieldId =
  | 'verify'
  | 'donate'
  | 'lastChance'
  | 'sevenDayNotice'
  | 'expiresOn'

export type RuleStatus = 'confirmed' | 'requires_confirmation'

export interface WorkflowDates {
  verify: string | null
  donate: string | null
  lastChance: string | null
  sevenDayNotice: string | null
  expiresOn: string | null
}

export interface LostFoundItem {
  id: string
  itemId: string
  description: string
  foundDate: string
  matchDate: string | null
  recordState: RecordState
  operationalStatus: OperationalStatus
  workflowDates: WorkflowDates
  createdAt: string
  updatedAt: string
  submittedAt: string | null
  approvedAt: string | null
  excelReady: boolean
  excelExportedAt: string | null
}

export interface ItemDraft {
  itemId: string
  description: string
  foundDate: string
  matchDate: string
  operationalStatus: OperationalStatus
}

export type ActionUrgency = 'attention' | 'upcoming' | 'completed' | 'none'

export type ActionKind =
  | 'complete_draft'
  | 'approve'
  | 'awaiting_match'
  | 'seven_day_notice'
  | 'donate'
  | 'closed'
  | 'none'

export interface NextAction {
  kind: ActionKind
  label: string
  detail: string | null
  dueDate: string | null
  urgency: ActionUrgency
  ruleStatus: RuleStatus
}

export interface ExcelRow {
  itemId: string
  description: string
  foundDate: string | null
  matchDate: string | null
  status: string
  asOfDate: string
  verify: string | null
  donate: string | null
  lastChance: string | null
  sevenDayNotice: string | null
  expiresOn: string | null
}

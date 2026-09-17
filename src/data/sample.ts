import { applyWorkflowDates } from '../domain/workflow'
import type { LostFoundItem } from '../domain/types'

function item(
  values: Omit<
    LostFoundItem,
    'workflowDates' | 'excelReady' | 'excelExportedAt' | 'createdAt' | 'updatedAt'
  > &
    Partial<Pick<LostFoundItem, 'excelReady' | 'excelExportedAt' | 'createdAt' | 'updatedAt'>>,
): LostFoundItem {
  const createdAt = values.createdAt ?? `${values.foundDate}T09:00:00.000Z`
  return applyWorkflowDates({
    ...values,
    workflowDates: {
      verify: null,
      donate: null,
      lastChance: null,
      sevenDayNotice: null,
      expiresOn: null,
    },
    excelReady: values.excelReady ?? values.recordState === 'approved',
    excelExportedAt: values.excelExportedAt ?? null,
    createdAt,
    updatedAt: values.updatedAt ?? createdAt,
  })
}

/**
 * Realistic sample records around 16 Sep 2026 so the dashboard
 * shows a mixture of attention, upcoming, and completed work.
 */
export const SAMPLE_ITEMS: LostFoundItem[] = [
  item({
    id: 'sample-1042',
    itemId: 'LF-1042',
    description: 'Black leather wallet, no ID cards',
    foundDate: '2026-09-10',
    matchDate: null,
    recordState: 'approved',
    operationalStatus: 'open',
    submittedAt: '2026-09-10T15:12:00.000Z',
    approvedAt: '2026-09-10T16:04:00.000Z',
  }),
  item({
    id: 'sample-1038',
    itemId: 'LF-1038',
    description: 'iPhone 14 with cracked case',
    foundDate: '2026-08-20',
    matchDate: '2026-08-24',
    recordState: 'approved',
    operationalStatus: 'matched',
    submittedAt: '2026-08-24T11:20:00.000Z',
    approvedAt: '2026-08-24T13:02:00.000Z',
  }),
  item({
    id: 'sample-1012',
    itemId: 'LF-1012',
    description: 'Laptop charger, USB-C',
    foundDate: '2026-08-05',
    matchDate: '2026-08-17',
    recordState: 'approved',
    operationalStatus: 'seven_day_notice',
    submittedAt: '2026-08-17T10:08:00.000Z',
    approvedAt: '2026-08-17T10:40:00.000Z',
  }),
  item({
    id: 'sample-1021',
    itemId: 'LF-1021',
    description: 'Set of Honda car keys',
    foundDate: '2026-08-01',
    matchDate: '2026-08-10',
    recordState: 'approved',
    operationalStatus: 'ready_for_donation',
    submittedAt: '2026-08-10T09:14:00.000Z',
    approvedAt: '2026-08-10T09:41:00.000Z',
  }),
  item({
    id: 'sample-1040',
    itemId: 'LF-1040',
    description: 'Gold hoop earring (single)',
    foundDate: '2026-08-28',
    matchDate: '2026-09-01',
    recordState: 'approved',
    operationalStatus: 'matched',
    submittedAt: '2026-09-01T14:22:00.000Z',
    approvedAt: '2026-09-01T15:05:00.000Z',
  }),
  item({
    id: 'sample-1050',
    itemId: 'LF-1050',
    description: 'Prescription glasses, black frames',
    foundDate: '2026-09-12',
    matchDate: '2026-09-12',
    recordState: 'pending_approval',
    operationalStatus: 'matched',
    submittedAt: '2026-09-12T17:18:00.000Z',
    approvedAt: null,
  }),
  item({
    id: 'sample-1055',
    itemId: 'LF-1055',
    description: 'Blue North Face jacket, size M',
    foundDate: '2026-09-14',
    matchDate: null,
    recordState: 'draft',
    operationalStatus: 'open',
    submittedAt: null,
    approvedAt: null,
    excelReady: false,
  }),
  item({
    id: 'sample-0988',
    itemId: 'LF-0988',
    description: "Child's red backpack",
    foundDate: '2026-07-01',
    matchDate: '2026-07-02',
    recordState: 'closed',
    operationalStatus: 'picked_up',
    submittedAt: '2026-07-02T11:00:00.000Z',
    approvedAt: '2026-07-02T11:20:00.000Z',
    excelReady: true,
    excelExportedAt: '2026-07-02T11:21:00.000Z',
  }),
  item({
    id: 'sample-0994',
    itemId: 'LF-0994',
    description: 'Navy umbrella',
    foundDate: '2026-07-15',
    matchDate: '2026-07-20',
    recordState: 'closed',
    operationalStatus: 'donated',
    submittedAt: '2026-07-20T09:30:00.000Z',
    approvedAt: '2026-07-20T10:02:00.000Z',
    excelReady: true,
    excelExportedAt: '2026-07-20T10:03:00.000Z',
  }),
  item({
    id: 'sample-0960',
    itemId: 'LF-0960',
    description: 'House keys on lanyard',
    foundDate: '2026-06-01',
    matchDate: '2026-06-05',
    recordState: 'closed',
    operationalStatus: 'donated_by_owner',
    submittedAt: '2026-06-05T13:10:00.000Z',
    approvedAt: '2026-06-05T13:44:00.000Z',
    excelReady: true,
    excelExportedAt: '2026-06-05T13:45:00.000Z',
  }),
]

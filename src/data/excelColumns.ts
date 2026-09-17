import type { ExcelRow } from '../domain/types'

export type ExcelColumnKey = keyof ExcelRow

export interface ExcelColumnMapping {
  key: ExcelColumnKey
  header: string
  kind: 'text' | 'date'
  /**
   * Exact workplace column names and order still need to be confirmed
   * against the live Excel file before append integration is enabled.
   */
  mappingConfirmed: boolean
  notes: string
}

/**
 * Proposed mapping based on core Lost & Found fields plus the
 * documented Excel workflow date columns.
 *
 * Do not append to the real workplace workbook until this mapping
 * is confirmed. Column order and unused columns must be preserved.
 */
export const EXCEL_COLUMNS: ExcelColumnMapping[] = [
  {
    key: 'itemId',
    header: 'Item ID',
    kind: 'text',
    mappingConfirmed: false,
    notes: 'Core field. Confirm header name and column position.',
  },
  {
    key: 'description',
    header: 'Item / Description',
    kind: 'text',
    mappingConfirmed: false,
    notes: 'Core field. Confirm header name and column position.',
  },
  {
    key: 'foundDate',
    header: 'Found Date',
    kind: 'date',
    mappingConfirmed: false,
    notes: 'Core field. Confirm header name, column position, and date format.',
  },
  {
    key: 'matchDate',
    header: 'Match Date',
    kind: 'date',
    mappingConfirmed: false,
    notes: 'Core field. Confirm header name, column position, and date format.',
  },
  {
    key: 'status',
    header: 'Status',
    kind: 'text',
    mappingConfirmed: false,
    notes: 'Core field. Confirm header name and allowed values.',
  },
  {
    key: 'asOfDate',
    header: 'Today',
    kind: 'date',
    mappingConfirmed: false,
    notes: 'Present in the current Excel workflow. Meaning of this column requires confirmation.',
  },
  {
    key: 'verify',
    header: 'Verify',
    kind: 'date',
    mappingConfirmed: false,
    notes: 'Workflow column exists. Formula requires confirmation.',
  },
  {
    key: 'donate',
    header: 'Donate',
    kind: 'date',
    mappingConfirmed: false,
    notes: 'Workflow column exists. Value uses Match Date + 30 when Match Date is present.',
  },
  {
    key: 'lastChance',
    header: 'Last Chance',
    kind: 'date',
    mappingConfirmed: false,
    notes: 'Workflow column exists. Formula requires confirmation.',
  },
  {
    key: 'sevenDayNotice',
    header: '7-Day Notice',
    kind: 'date',
    mappingConfirmed: false,
    notes: 'Workflow column exists. Value uses Donation Date − 7 when Match Date is present.',
  },
  {
    key: 'expiresOn',
    header: 'Expires on',
    kind: 'date',
    mappingConfirmed: false,
    notes: 'Workflow column exists. Formula requires confirmation.',
  },
]

export const EXCEL_DATE_FORMAT = 'dd-mmm'
export const WORKPLACE_EXCEL_WRITE_ENABLED = false

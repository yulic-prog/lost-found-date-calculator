import type { Cell } from 'exceljs'
import { displayStatus } from '../domain/statuses'
import { todayISO, toUtcDate } from '../domain/dates'
import type { ExcelRow, LostFoundItem } from '../domain/types'
import {
  EXCEL_COLUMNS,
  EXCEL_DATE_FORMAT,
  WORKPLACE_EXCEL_WRITE_ENABLED,
} from './excelColumns'

export function buildExcelRow(item: LostFoundItem, asOfDate = todayISO()): ExcelRow {
  return {
    itemId: item.itemId,
    description: item.description,
    foundDate: item.foundDate,
    matchDate: item.matchDate,
    status: displayStatus(item),
    asOfDate,
    verify: item.workflowDates.verify,
    donate: item.workflowDates.donate,
    lastChance: item.workflowDates.lastChance,
    sevenDayNotice: item.workflowDates.sevenDayNotice,
    expiresOn: item.workflowDates.expiresOn,
  }
}

function applyDateCell(cell: Cell, iso: string | null) {
  if (!iso) {
    cell.value = null
    return
  }
  cell.value = toUtcDate(iso)
  cell.numFmt = EXCEL_DATE_FORMAT
}

export async function buildSandboxWorkbook(items: LostFoundItem[]): Promise<ArrayBuffer> {
  const ExcelJS = (await import('exceljs')).default
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Lost & Found Management System'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Approved Append Preview', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })

  sheet.columns = EXCEL_COLUMNS.map((column) => ({
    header: column.header,
    key: column.key,
    width: column.kind === 'text' && column.key === 'description' ? 36 : 16,
  }))

  const header = sheet.getRow(1)
  header.font = { name: 'Calibri', bold: true, color: { argb: 'FF152238' } }
  header.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE7E1D6' },
  }
  header.alignment = { vertical: 'middle' }
  header.height = 20

  const asOfDate = todayISO()
  for (const item of items) {
    const row = buildExcelRow(item, asOfDate)
    const excelRow = sheet.addRow([])
    EXCEL_COLUMNS.forEach((column, index) => {
      const cell = excelRow.getCell(index + 1)
      const value = row[column.key]
      if (column.kind === 'date') {
        applyDateCell(cell, typeof value === 'string' ? value : null)
      } else {
        cell.value = value || null
      }
      cell.font = { name: 'Calibri', size: 11 }
      cell.alignment = { vertical: 'middle' }
    })
  }

  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD8D2C8' } },
        left: { style: 'thin', color: { argb: 'FFD8D2C8' } },
        bottom: { style: 'thin', color: { argb: 'FFD8D2C8' } },
        right: { style: 'thin', color: { argb: 'FFD8D2C8' } },
      }
    })
  })

  const notice = workbook.addWorksheet('Integration Notes')
  notice.getCell('A1').value = 'SANDBOX EXPORT — does not modify the workplace Excel file'
  notice.getCell('A1').font = { bold: true }
  notice.getCell('A3').value =
    'Workplace Excel writes are disabled until column mapping and formatting are confirmed.'
  notice.getCell('A4').value = `WORKPLACE_EXCEL_WRITE_ENABLED = ${WORKPLACE_EXCEL_WRITE_ENABLED}`
  notice.getCell('A6').value = 'Proposed columns'
  notice.getCell('A6').font = { bold: true }
  notice.addRow(['Key', 'Header', 'Confirmed', 'Notes'])
  for (const column of EXCEL_COLUMNS) {
    notice.addRow([
      column.key,
      column.header,
      column.mappingConfirmed ? 'Yes' : 'Requires confirmation',
      column.notes,
    ])
  }
  notice.columns = [{ width: 20 }, { width: 22 }, { width: 24 }, { width: 80 }]

  const buffer = await workbook.xlsx.writeBuffer()
  return buffer as ArrayBuffer
}

export function downloadSandboxWorkbook(buffer: ArrayBuffer, filename: string) {
  const blob = new Blob([new Uint8Array(buffer)], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

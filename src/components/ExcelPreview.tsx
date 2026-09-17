import { formatExcelShortDate } from '../domain/dates'
import type { ExcelRow } from '../domain/types'
import { EXCEL_COLUMNS } from '../data/excelColumns'

export function ExcelPreview({ row }: { row: ExcelRow }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Excel row preview</h2>
        <span className="rule-flag">Sandbox only — workplace file is not modified</span>
      </div>
      <div className="panel-body">
        <p className="banner">
          Column names and order still require confirmation against the live workbook.
          Blank cells are left blank; unconfirmed formulas are not invented.
        </p>
        <div style={{ overflow: 'auto', padding: '0 12px 12px' }}>
          <table className="excel-table">
            <thead>
              <tr>
                {EXCEL_COLUMNS.map((column) => (
                  <th key={column.key}>{column.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {EXCEL_COLUMNS.map((column) => {
                  const value = row[column.key]
                  const display =
                    column.kind === 'date' ? formatExcelShortDate(value) : value || ''
                  return <td key={column.key}>{display}</td>
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

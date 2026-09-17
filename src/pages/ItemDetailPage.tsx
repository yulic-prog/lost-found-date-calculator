import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ExcelPreview } from '../components/ExcelPreview'
import { StatusBadge, UrgencyText } from '../components/StatusBadge'
import { WorkflowPanel } from '../components/WorkflowPanel'
import { buildSandboxWorkbook, buildExcelRow, downloadSandboxWorkbook } from '../data/excel'
import { formatDisplayDate } from '../domain/dates'
import { getNextAction } from '../domain/nextAction'
import {
  displayStatus,
  OPERATIONAL_STATUSES,
  OPERATIONAL_STATUS_LABELS,
  RECORD_STATE_LABELS,
} from '../domain/statuses'
import type { OperationalStatus } from '../domain/types'
import { itemToDraft, useItemStore } from '../store/ItemStore'

export function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const store = useItemStore()
  const item = id ? store.getItem(id) : undefined
  const [confirmApprove, setConfirmApprove] = useState(false)
  const [busy, setBusy] = useState(false)

  if (!id) return <Navigate to="/items" replace />
  if (!item) {
    return (
      <div className="page">
        <h1>Item not found</h1>
        <p className="lede">That record is not in the register.</p>
        <Link className="btn" to="/items">
          Back to items
        </Link>
      </div>
    )
  }

  const record = item
  const action = getNextAction(record)
  const excelRow = buildExcelRow(record)
  const canApprove = record.recordState === 'pending_approval'
  const canEdit = record.recordState === 'draft' || record.recordState === 'pending_approval'
  const canMarkExcel = record.recordState === 'approved' && !record.excelReady

  async function exportRow() {
    setBusy(true)
    try {
      const buffer = await buildSandboxWorkbook([record])
      downloadSandboxWorkbook(buffer, `${record.itemId}-excel-preview.xlsx`)
      store.markExcelExported([record.id])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <div className="crumb">
        <Link to="/items">Items</Link>
        <span>/</span>
        <span>{item.itemId}</span>
      </div>

      <div className="item-hero">
        <div className="item-title">
          <h1>{item.itemId}</h1>
          <p>{item.description}</p>
        </div>
        <div className="actions">
          {canEdit ? (
            <button type="button" className="btn" onClick={() => navigate(`/items/${item.id}/edit`)}>
              Edit
            </button>
          ) : null}
          {item.recordState === 'draft' ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                const result = store.submitForApproval(itemToDraft(item), item.id)
                if (!result.ok) navigate(`/items/${item.id}/edit`)
              }}
            >
              Submit for approval
            </button>
          ) : null}
          {canApprove ? (
            <button type="button" className="btn btn-primary" onClick={() => setConfirmApprove(true)}>
              Approve item
            </button>
          ) : null}
          {item.recordState === 'pending_approval' ? (
            <button type="button" className="btn" onClick={() => store.returnToDraft(item.id)}>
              Return to draft
            </button>
          ) : null}
          {canMarkExcel ? (
            <button type="button" className="btn btn-navy" onClick={() => store.markExcelReady(item.id)}>
              Approve Excel row
            </button>
          ) : null}
          {item.excelReady ? (
            <button type="button" className="btn btn-navy" disabled={busy} onClick={exportRow}>
              Download sandbox row
            </button>
          ) : null}
        </div>
      </div>

      <div className="detail-grid">
        <WorkflowPanel dates={item.workflowDates} />
        <section className="panel">
          <div className="next-action-card">
            <span>Current action required</span>
            <UrgencyText urgency={action.urgency}>{action.label}</UrgencyText>
            {action.detail ? <p className="lede">{action.detail}</p> : null}
          </div>
          <div className="panel-header">
            <h2>Item information</h2>
            <StatusBadge item={item} label={displayStatus(item)} />
          </div>
          <dl className="kv">
            <dt>Item ID</dt>
            <dd className="mono">{item.itemId}</dd>
            <dt>Description</dt>
            <dd>{item.description}</dd>
            <dt>Found Date</dt>
            <dd>{formatDisplayDate(item.foundDate)}</dd>
            <dt>Match Date</dt>
            <dd>{formatDisplayDate(item.matchDate) || ''}</dd>
            <dt>Record state</dt>
            <dd>{RECORD_STATE_LABELS[item.recordState]}</dd>
            <dt>Status</dt>
            <dd>
              {item.recordState === 'approved' ? (
                <select
                  value={item.operationalStatus}
                  onChange={(event) =>
                    store.updateStatus(item.id, event.target.value as OperationalStatus)
                  }
                >
                  {OPERATIONAL_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {OPERATIONAL_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              ) : (
                OPERATIONAL_STATUS_LABELS[item.operationalStatus]
              )}
            </dd>
          </dl>
        </section>
        <ExcelPreview row={excelRow} />
      </div>

      {confirmApprove ? (
        <ConfirmDialog
          title="Approve this item?"
          body="Approval confirms the item details and generated workflow dates. The row can then be reviewed for the Excel workflow. The workplace Excel file will not be changed."
          confirmLabel="Approve"
          onCancel={() => setConfirmApprove(false)}
          onConfirm={() => {
            store.approveItem(item.id)
            setConfirmApprove(false)
          }}
        />
      ) : null}
    </div>
  )
}

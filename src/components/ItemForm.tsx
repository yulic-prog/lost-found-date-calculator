import type { FormEvent } from 'react'
import { OPERATIONAL_STATUSES, OPERATIONAL_STATUS_LABELS } from '../domain/statuses'
import type { FieldErrors } from '../domain/validation'
import type { ItemDraft } from '../domain/types'

export function ItemForm({
  draft,
  errors,
  onChange,
  onSaveDraft,
  onSubmitApproval,
  submitLabel = 'Submit for approval',
}: {
  draft: ItemDraft
  errors: FieldErrors
  onChange: (draft: ItemDraft) => void
  onSaveDraft: () => void
  onSubmitApproval: (event: FormEvent) => void
  submitLabel?: string
}) {
  return (
    <form className="panel form-card" onSubmit={onSubmitApproval}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="itemId">Item ID</label>
          <input
            id="itemId"
            value={draft.itemId}
            onChange={(event) => onChange({ ...draft, itemId: event.target.value })}
            autoComplete="off"
          />
          {errors.itemId ? <span className="error">{errors.itemId}</span> : null}
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={draft.operationalStatus}
            onChange={(event) =>
              onChange({
                ...draft,
                operationalStatus: event.target.value as ItemDraft['operationalStatus'],
              })
            }
          >
            {OPERATIONAL_STATUSES.map((status) => (
              <option key={status} value={status}>
                {OPERATIONAL_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
        <div className="field full">
          <label htmlFor="description">Item / Description</label>
          <textarea
            id="description"
            rows={3}
            value={draft.description}
            onChange={(event) => onChange({ ...draft, description: event.target.value })}
          />
          {errors.description ? <span className="error">{errors.description}</span> : null}
        </div>
        <div className="field">
          <label htmlFor="foundDate">Found Date</label>
          <input
            id="foundDate"
            type="date"
            value={draft.foundDate}
            onChange={(event) => onChange({ ...draft, foundDate: event.target.value })}
          />
          {errors.foundDate ? <span className="error">{errors.foundDate}</span> : null}
        </div>
        <div className="field">
          <label htmlFor="matchDate">Match Date</label>
          <input
            id="matchDate"
            type="date"
            value={draft.matchDate}
            onChange={(event) => onChange({ ...draft, matchDate: event.target.value })}
          />
          {errors.matchDate ? <span className="error">{errors.matchDate}</span> : null}
        </div>
      </div>
      <div className="actions" style={{ marginTop: 22 }}>
        <button type="button" className="btn" onClick={onSaveDraft}>
          Save draft
        </button>
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

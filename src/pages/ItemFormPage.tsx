import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ItemForm } from '../components/ItemForm'
import { formatDisplayDate, todayISO } from '../domain/dates'
import { computeWorkflowDates } from '../domain/workflow'
import type { FieldErrors } from '../domain/validation'
import type { ItemDraft } from '../domain/types'
import { itemToDraft, useItemStore } from '../store/ItemStore'

const emptyDraft = (): ItemDraft => ({
  itemId: '',
  description: '',
  foundDate: todayISO(),
  matchDate: '',
  operationalStatus: 'open',
})

export function ItemFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getItem, saveDraft, submitForApproval } = useItemStore()
  const existing = id ? getItem(id) : undefined
  const [draft, setDraft] = useState<ItemDraft>(() =>
    existing ? itemToDraft(existing) : emptyDraft(),
  )
  const [errors, setErrors] = useState<FieldErrors>({})

  const previewDates = useMemo(
    () =>
      computeWorkflowDates({
        foundDate: draft.foundDate,
        matchDate: draft.matchDate || null,
      }),
    [draft.foundDate, draft.matchDate],
  )

  function handleSaveDraft() {
    const result = saveDraft(draft, existing?.id)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    navigate(`/items/${result.item?.id}`)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const result = submitForApproval(draft, existing?.id)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    navigate(`/items/${result.item?.id}`)
  }

  return (
    <div className="page">
      <div className="crumb">
        <Link to="/items">Items</Link>
        <span>/</span>
        <span>{existing ? 'Edit item' : 'New item'}</span>
      </div>
      <header className="page-header">
        <div>
          <h1>{existing ? 'Edit item' : 'New item'}</h1>
          <p className="lede">
            Only the fields required by the current Lost & Found process. Workflow dates are
            generated from confirmed rules after you save.
          </p>
        </div>
      </header>
      <ItemForm
        draft={draft}
        errors={errors}
        onChange={(next) => {
          setDraft(next)
          setErrors({})
        }}
        onSaveDraft={handleSaveDraft}
        onSubmitApproval={handleSubmit}
      />
      {(previewDates.donate || previewDates.sevenDayNotice) && (
        <p className="lede" style={{ marginTop: 18 }}>
          With the current Match Date, Donate is{' '}
          <strong>{formatDisplayDate(previewDates.donate)}</strong> and 7-Day Notice is{' '}
          <strong>{formatDisplayDate(previewDates.sevenDayNotice)}</strong>. Verify, Last Chance,
          and Expires On stay blank until those workplace rules are confirmed.
        </p>
      )}
    </div>
  )
}

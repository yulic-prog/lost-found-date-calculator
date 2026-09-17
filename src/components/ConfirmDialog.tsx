import type { ReactNode } from 'react'

export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string
  body: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-title">{title}</h2>
        <p>{body}</p>
        <div className="actions">
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-navy" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="empty-note">{children}</p>
}

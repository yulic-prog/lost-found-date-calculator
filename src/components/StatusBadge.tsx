import { statusTone } from '../domain/statuses'
import type { LostFoundItem } from '../domain/types'

export function StatusBadge({ item, label }: { item: LostFoundItem; label: string }) {
  return <span className={`badge ${statusTone(item)}`}>{label}</span>
}

export function UrgencyText({
  urgency,
  children,
}: {
  urgency: 'attention' | 'upcoming' | 'completed' | 'none'
  children: string
}) {
  if (urgency === 'none') return <span className="muted">{children}</span>
  return <span className={`urgency ${urgency}`}>{children}</span>
}

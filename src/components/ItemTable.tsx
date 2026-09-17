import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatDisplayDate } from '../domain/dates'
import { getNextAction } from '../domain/nextAction'
import { displayStatus, OPERATIONAL_STATUS_LABELS, RECORD_STATE_LABELS } from '../domain/statuses'
import type { LostFoundItem, OperationalStatus } from '../domain/types'
import { StatusBadge, UrgencyText } from './StatusBadge'

type SortKey = 'itemId' | 'foundDate' | 'matchDate' | 'status' | 'nextAction'

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: RECORD_STATE_LABELS.draft },
  { value: 'pending_approval', label: RECORD_STATE_LABELS.pending_approval },
  { value: 'approved', label: RECORD_STATE_LABELS.approved },
  ...Object.entries(OPERATIONAL_STATUS_LABELS)
    .filter(([value]) => value !== 'closed')
    .map(([value, label]) => ({ value, label })),
  { value: 'closed', label: RECORD_STATE_LABELS.closed },
]

function sortItems(items: LostFoundItem[], key: SortKey, direction: 'asc' | 'desc') {
  const sorted = [...items].sort((a, b) => {
    const left = sortValue(a, key)
    const right = sortValue(b, key)
    return left.localeCompare(right)
  })
  return direction === 'asc' ? sorted : sorted.reverse()
}

function sortValue(item: LostFoundItem, key: SortKey): string {
  if (key === 'status') return displayStatus(item)
  if (key === 'nextAction') return getNextAction(item).label
  if (key === 'matchDate') return item.matchDate ?? ''
  return item[key]
}

export function ItemTable({ items }: { items: LostFoundItem[] }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('itemId')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return items.filter((item) => {
      const haystack = `${item.itemId} ${item.description}`.toLowerCase()
      const matchesQuery = !term || haystack.includes(term)
      const matchesStatus =
        status === 'all' ||
        item.recordState === status ||
        item.operationalStatus === (status as OperationalStatus)
      const action = getNextAction(item)
      const matchesAction =
        actionFilter === 'all' ||
        (actionFilter === 'attention' && action.urgency === 'attention') ||
        (actionFilter === 'upcoming' && action.urgency === 'upcoming')
      return matchesQuery && matchesStatus && matchesAction
    })
  }, [items, query, status, actionFilter])

  const rows = useMemo(
    () => sortItems(filtered, sortKey, sortDir),
    [filtered, sortKey, sortDir],
  )

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir(key === 'itemId' ? 'desc' : 'asc')
  }

  return (
    <>
      <div className="toolbar">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by Item ID or description"
        />
        <select
          className="filter-select"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          {STATUS_FILTERS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          className="filter-select"
          value={actionFilter}
          onChange={(event) => setActionFilter(event.target.value)}
        >
          <option value="all">All actions</option>
          <option value="attention">Needs attention</option>
          <option value="upcoming">Upcoming</option>
        </select>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>
                <button type="button" onClick={() => toggleSort('itemId')}>
                  Item ID
                </button>
              </th>
              <th className="clip">Description</th>
              <th>
                <button type="button" onClick={() => toggleSort('foundDate')}>
                  Found Date
                </button>
              </th>
              <th>
                <button type="button" onClick={() => toggleSort('matchDate')}>
                  Match Date
                </button>
              </th>
              <th>
                <button type="button" onClick={() => toggleSort('status')}>
                  Status
                </button>
              </th>
              <th>
                <button type="button" onClick={() => toggleSort('nextAction')}>
                  Next Action
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="muted">
                  No items match the current filters.
                </td>
              </tr>
            ) : (
              rows.map((item) => {
                const action = getNextAction(item)
                return (
                  <tr key={item.id} onClick={() => navigate(`/items/${item.id}`)}>
                    <td>
                      <Link className="mono" to={`/items/${item.id}`} onClick={(event) => event.stopPropagation()}>
                        {item.itemId}
                      </Link>
                    </td>
                    <td className="clip">{item.description}</td>
                    <td>{formatDisplayDate(item.foundDate)}</td>
                    <td>{formatDisplayDate(item.matchDate)}</td>
                    <td>
                      <StatusBadge item={item} label={displayStatus(item)} />
                    </td>
                    <td>
                      <UrgencyText urgency={action.urgency}>{action.label}</UrgencyText>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusBadge, UrgencyText } from '../components/StatusBadge'
import { formatDisplayDate } from '../domain/dates'
import { getNextAction } from '../domain/nextAction'
import { searchItems } from '../domain/alerts'
import { displayStatus } from '../domain/statuses'
import { useItemStore } from '../store/ItemStore'

export function SearchPage() {
  const { items } = useItemStore()
  const [query, setQuery] = useState('')
  const results = useMemo(() => searchItems(items, query), [items, query])
  const searched = query.trim().length > 0

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Search</h1>
          <p className="lede">Find an item by Item ID. Description is used only if no ID matches.</p>
        </div>
      </header>

      <div className="search-hero">
        <input
          className="search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Enter Item ID"
          autoFocus
        />
      </div>

      {!searched ? (
        <p className="lede">Type an Item ID to see status, dates, and the current action required.</p>
      ) : results.length === 0 ? (
        <p className="lede">No items found for “{query.trim()}”.</p>
      ) : (
        <div className="panel">
          {results.map((item) => {
            const action = getNextAction(item)
            return (
              <Link className="result-row" key={item.id} to={`/items/${item.id}`}>
                <span className="row-id">{item.itemId}</span>
                <span>
                  {item.description}
                  <span className="row-meta">
                    {' '}
                    · Found {formatDisplayDate(item.foundDate)}
                    {item.matchDate ? ` · Match ${formatDisplayDate(item.matchDate)}` : ''}
                    {item.workflowDates.sevenDayNotice
                      ? ` · 7-Day Notice ${formatDisplayDate(item.workflowDates.sevenDayNotice)}`
                      : ''}
                    {item.workflowDates.donate
                      ? ` · Donate ${formatDisplayDate(item.workflowDates.donate)}`
                      : ''}
                  </span>
                </span>
                <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <StatusBadge item={item} label={displayStatus(item)} />
                  <UrgencyText urgency={action.urgency}>{action.label}</UrgencyText>
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

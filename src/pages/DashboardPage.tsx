import { Link } from 'react-router-dom'
import {
  buildAttentionGroups,
  buildQuickStats,
  buildUpcomingEvents,
} from '../domain/alerts'
import { formatDisplayDate, todayISO } from '../domain/dates'
import { useItemStore } from '../store/ItemStore'
import { EmptyNote } from '../components/ConfirmDialog'

export function DashboardPage() {
  const { items } = useItemStore()
  const today = todayISO()
  const stats = buildQuickStats(items, today)
  const groups = buildAttentionGroups(items, today)
  const upcoming = buildUpcomingEvents(items, today)

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="lede">
            {formatDisplayDate(today)} — items that need attention, and what is coming next.
          </p>
        </div>
        <Link className="btn btn-primary" to="/items/new">
          New item
        </Link>
      </header>

      <section className="stats" aria-label="Quick stats">
        <Stat label="Open items" value={stats.open} />
        <Stat label="Matched items" value={stats.matched} />
        <Stat label="Pending approval" value={stats.pendingApproval} />
        <Stat label="Ready for donation" value={stats.readyForDonation} />
        <Stat label="Closed" value={stats.closed} />
      </section>

      <div className="layout-split">
        <section className="panel">
          <div className="panel-header">
            <h2>Needs attention</h2>
          </div>
          {groups.map((group) => (
            <div className="group" key={group.id}>
              <div className="group-title">
                <h3>{group.title}</h3>
                <span className="count-pill">{group.items.length}</span>
              </div>
              {group.ruleStatus === 'requires_confirmation' ? (
                <p className="empty-note">{group.description}</p>
              ) : group.items.length === 0 ? (
                <EmptyNote>Nothing waiting here.</EmptyNote>
              ) : (
                group.items.map(({ item, action }) => (
                  <Link className="row-link" key={item.id} to={`/items/${item.id}`}>
                    <span className="row-id">{item.itemId}</span>
                    <span>
                      {item.description}
                      <span className="row-meta">
                        {' '}
                        · {action.label}
                        {action.dueDate ? ` · ${formatDisplayDate(action.dueDate)}` : ''}
                      </span>
                    </span>
                    <span className="urgency attention">Needs attention</span>
                  </Link>
                ))
              )}
            </div>
          ))}
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Upcoming</h2>
          </div>
          <div className="panel-body">
            {upcoming.length === 0 ? (
              <EmptyNote>No confirmed upcoming dates.</EmptyNote>
            ) : (
              upcoming.map((event) => (
                <Link className="upcoming-row" key={`${event.item.id}-${event.date}`} to={`/items/${event.item.id}`}>
                  <span className="upcoming-date">{formatDisplayDate(event.date)}</span>
                  <span>
                    <strong>{event.item.itemId}</strong>
                    <span className="row-meta">
                      {' '}
                      · {event.fieldLabel} · {event.item.description}
                    </span>
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

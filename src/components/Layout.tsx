import { NavLink, Outlet } from 'react-router-dom'
import { IconDashboard, IconItems, IconSearch } from './Icons'
import { formatDisplayDate, todayISO } from '../domain/dates'

const links = [
  { to: '/', label: 'Dashboard', icon: <IconDashboard />, end: true },
  { to: '/items', label: 'Items', icon: <IconItems /> },
  { to: '/search', label: 'Search', icon: <IconSearch /> },
]

export function Layout() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">L&F</div>
          <div className="brand-text">
            <strong>Lost & Found</strong>
            <span>Operations</span>
          </div>
        </div>
        <nav className="nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          Internal desk tool
          <br />
          Today {formatDisplayDate(todayISO())}
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}

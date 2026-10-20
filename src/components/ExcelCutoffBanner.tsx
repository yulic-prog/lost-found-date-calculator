import { useEffect, useState } from 'react'
import { excelCutoffMatchDate } from '../domain/calculator'
import { getDisplayParts, msUntilNextPacificDate, todayISO } from '../domain/dates'

function useTodayISO() {
  const [today, setToday] = useState(() => todayISO())

  useEffect(() => {
    const timer = window.setTimeout(() => setToday(todayISO()), msUntilNextPacificDate())
    return () => window.clearTimeout(timer)
  }, [today])

  return today
}

export function ExcelCutoffBanner() {
  const today = useTodayISO()
  const cutoff = excelCutoffMatchDate(today)
  const parts = getDisplayParts(cutoff)
  const todayParts = getDisplayParts(today)

  return (
    <aside className="excel-banner" aria-label="7-Day Notice Excel cutoff">
      <p className="excel-banner-kicker">7-Day Notice Excel</p>
      <p className="excel-banner-lead">Entering</p>
      <p className="excel-banner-date">
        <span className="excel-banner-day">{parts.day}</span>
        <span className="excel-banner-month">{parts.month}</span>
      </p>
      <p className="excel-banner-year">{parts.year}</p>
      <p className="excel-banner-note">
        Enter anything from this date and earlier. Don&apos;t go over.
      </p>
      <p className="excel-banner-today">
        Notice due {todayParts.day} {todayParts.month}
      </p>
    </aside>
  )
}

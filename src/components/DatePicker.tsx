import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import {
  addCalendarDays,
  formatLongDate,
  isValidISODate,
  monthNameLong,
  parseISODate,
  todayISO,
  toISODate,
} from '../domain/dates'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

type DatePickerProps = {
  value: string | null
  onChange: (iso: string) => void
  error?: string | null
  hintId?: string
  errorId?: string
}

function viewFromValue(value: string | null): { year: number; month: number } {
  if (value && isValidISODate(value)) {
    const { year, month } = parseISODate(value)
    return { year, month }
  }
  const today = parseISODate(todayISO())
  return { year: today.year, month: today.month }
}

function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1))
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 }
}

function buildGrid(year: number, month: number): (string | null)[] {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const cells: (string | null)[] = []
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null)
  for (let day = 1; day <= lastDay; day += 1) {
    cells.push(toISODate(year, month, day))
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export function DatePicker({ value, onChange, error, hintId, errorId }: DatePickerProps) {
  const calendarId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => viewFromValue(value))
  const [active, setActive] = useState(() => value ?? todayISO())
  const today = todayISO()
  const days = useMemo(() => buildGrid(view.year, view.month), [view.year, view.month])

  useEffect(() => {
    setView(viewFromValue(value))
    if (value) setActive(value)
  }, [value])

  useEffect(() => {
    if (!open) return

    const focusTarget = () => {
      const selected = rootRef.current?.querySelector<HTMLButtonElement>(
        '[data-day][tabindex="0"]',
      )
      selected?.focus()
    }
    const frame = window.requestAnimationFrame(focusTarget)

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function selectDate(iso: string) {
    onChange(iso)
    setOpen(false)
    triggerRef.current?.focus()
  }

  function moveActive(daysDelta: number) {
    const next = addCalendarDays(active, daysDelta)
    const parsed = parseISODate(next)
    setActive(next)
    setView({ year: parsed.year, month: parsed.month })
  }

  function onGridKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const { year, month } = parseISODate(active)
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        moveActive(-1)
        break
      case 'ArrowRight':
        event.preventDefault()
        moveActive(1)
        break
      case 'ArrowUp':
        event.preventDefault()
        moveActive(-7)
        break
      case 'ArrowDown':
        event.preventDefault()
        moveActive(7)
        break
      case 'Home':
        event.preventDefault()
        setActive(toISODate(year, month, 1))
        break
      case 'End':
        event.preventDefault()
        setActive(toISODate(year, month, lastDay))
        break
      case 'PageUp':
        event.preventDefault()
        {
          const previous = shiftMonth(view.year, view.month, -1)
          const clamped = Math.min(
            parseISODate(active).day,
            new Date(Date.UTC(previous.year, previous.month, 0)).getUTCDate(),
          )
          setView(previous)
          setActive(toISODate(previous.year, previous.month, clamped))
        }
        break
      case 'PageDown':
        event.preventDefault()
        {
          const next = shiftMonth(view.year, view.month, 1)
          const clamped = Math.min(
            parseISODate(active).day,
            new Date(Date.UTC(next.year, next.month, 0)).getUTCDate(),
          )
          setView(next)
          setActive(toISODate(next.year, next.month, clamped))
        }
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        selectDate(active)
        break
      default:
        break
    }
  }

  const labelled = value ? formatLongDate(value) : 'Select a date'

  return (
    <div className="picker" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`picker-trigger${value ? ' has-value' : ''}${error ? ' is-invalid' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={calendarId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hintId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="picker-icon" aria-hidden="true">
          <CalendarIcon />
        </span>
        <span className="picker-label">{labelled}</span>
        <span className="picker-caret" aria-hidden="true">
          <CaretIcon open={open} />
        </span>
      </button>

      {open ? (
        <div
          id={calendarId}
          className="calendar"
          role="dialog"
          aria-label="Choose match date"
        >
          <div className="calendar-header">
            <button
              type="button"
              className="calendar-nav"
              aria-label="Previous month"
              onClick={() => setView((current) => shiftMonth(current.year, current.month, -1))}
            >
              <Chevron direction="left" />
            </button>
            <p className="calendar-month" aria-live="polite">
              {monthNameLong(view.month)} {view.year}
            </p>
            <button
              type="button"
              className="calendar-nav"
              aria-label="Next month"
              onClick={() => setView((current) => shiftMonth(current.year, current.month, 1))}
            >
              <Chevron direction="right" />
            </button>
          </div>

          <div className="calendar-weekdays" aria-hidden="true">
            {WEEKDAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div
            className="calendar-grid"
            role="grid"
            aria-label={`${monthNameLong(view.month)} ${view.year}`}
            onKeyDown={onGridKeyDown}
          >
            {days.map((iso, index) => {
              if (!iso) {
                return <span key={`empty-${index}`} className="calendar-empty" />
              }
              const selected = iso === value
              const isToday = iso === today
              const isActive = iso === active
              const { day } = parseISODate(iso)
              return (
                <button
                  key={iso}
                  type="button"
                  className={`calendar-day${selected ? ' is-selected' : ''}${isToday ? ' is-today' : ''}`}
                  data-day={iso}
                  data-selected={selected ? 'true' : undefined}
                  tabIndex={isActive ? 0 : -1}
                  aria-pressed={selected}
                  aria-label={formatLongDate(iso)}
                  onClick={() => selectDate(iso)}
                  onFocus={() => setActive(iso)}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="4.5" width="14" height="12.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 8h14" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 3.5v2.5M13 3.5v2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function CaretIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ transform: open ? 'rotate(180deg)' : undefined }}
    >
      <path d="M4 6.5 8 10.5 12 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  const d = direction === 'left' ? 'M9.5 4 5.5 8l4 4' : 'M6.5 4 10.5 8l-4 4'
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

import { useEffect, useId, useRef, useState } from 'react'
import { DatePicker } from '../components/DatePicker'
import { ExcelCutoffBanner } from '../components/ExcelCutoffBanner'
import { calculateDates, formatResultsCopy } from '../domain/calculator'
import { getDisplayParts } from '../domain/dates'

export function CalculatorPage() {
  const hintId = useId()
  const errorId = useId()
  const [matchDate, setMatchDate] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current)
    }
  }, [])

  const results = matchDate ? calculateDates(matchDate) : null

  function handleSelect(iso: string) {
    setMatchDate(iso)
    setError(null)
    setCopied(false)
  }

  function handleClear() {
    setMatchDate(null)
    setError(null)
    setCopied(false)
  }

  async function handleCopy() {
    if (!results) {
      setError('Select a Match Date to calculate results.')
      setCopied(false)
      return
    }

    try {
      await copyText(formatResultsCopy(results.donationDate, results.noticeDate))
      setCopied(true)
      setError(null)
      if (copyTimer.current) window.clearTimeout(copyTimer.current)
      copyTimer.current = window.setTimeout(() => setCopied(false), 2200)
    } catch {
      setError('Copy failed. You can still read the dates on screen.')
      setCopied(false)
    }
  }

  return (
    <div className="app">
      <ExcelCutoffBanner />
      <div className="app-frame">
        <header className="hero">
          <p className="eyebrow">Lost &amp; Found</p>
          <h1>30-Day Date Calculator</h1>
          <p className="flowline">
            <span>Match Date</span>
            <span className="flowline-arrow" aria-hidden="true">
              →
            </span>
            <span>Donation Date</span>
            <span className="flowline-arrow" aria-hidden="true">
              →
            </span>
            <span>7-Day Notice</span>
          </p>
        </header>

        <section className="match-card" aria-labelledby="match-heading">
          <div className="match-card-head">
            <div>
              <h2 id="match-heading">Match Date</h2>
              <p id={hintId} className="match-hint">
                Enter the date the item was matched.
              </p>
            </div>
            <button
              type="button"
              className="btn-quiet"
              onClick={handleClear}
              disabled={!matchDate && !error}
            >
              Clear
            </button>
          </div>

          <DatePicker
            value={matchDate}
            onChange={handleSelect}
            error={error}
            hintId={hintId}
            errorId={errorId}
          />

          {error ? (
            <p id={errorId} className="field-error" role="alert">
              {error}
            </p>
          ) : null}
        </section>

        {results ? (
          <section className="results" aria-live="polite" aria-label="Calculated dates">
            <ResultCard
              tone="donation"
              kicker="Donation Date"
              caption="30 calendar days after Match Date"
              iso={results.donationDate}
            />
            <ResultCard
              tone="notice"
              kicker="7-Day Notice"
              caption="7 calendar days before Donation Date"
              iso={results.noticeDate}
            />
          </section>
        ) : (
          <p className="empty-prompt">Select a Match Date to see the Donation Date and 7-Day Notice.</p>
        )}

        <div className="toolbar">
          <button
            type="button"
            className={`btn-primary${copied ? ' is-copied' : ''}`}
            onClick={() => void handleCopy()}
            aria-live="polite"
          >
            {copied ? (
              <>
                <CheckIcon />
                Copied ✓
              </>
            ) : (
              <>
                <CopyIcon />
                Copy Results
              </>
            )}
          </button>
        </div>

        <section className="how" aria-labelledby="how-heading">
          <h2 id="how-heading">How it works</h2>
          <ol className="how-track">
            <li className="how-node">
              <span className="how-dot" aria-hidden="true" />
              <strong>Match Date</strong>
            </li>
            <li className="how-connector" aria-hidden="true">
              <span>30 calendar days</span>
            </li>
            <li className="how-node">
              <span className="how-dot" aria-hidden="true" />
              <strong>Donation Date</strong>
            </li>
            <li className="how-connector" aria-hidden="true">
              <span>− 7 calendar days</span>
            </li>
            <li className="how-node">
              <span className="how-dot" aria-hidden="true" />
              <strong>7-Day Notice</strong>
            </li>
          </ol>
          <p className="how-note">All calculations use calendar days.</p>
        </section>
      </div>

      <footer className="footer">Lost &amp; Found • Date Calculation Tool</footer>
    </div>
  )
}

function ResultCard({
  tone,
  kicker,
  caption,
  iso,
}: {
  tone: 'donation' | 'notice'
  kicker: string
  caption: string
  iso: string
}) {
  const parts = getDisplayParts(iso)

  return (
    <article className={`result-card result-card--${tone}`}>
      <header>
        <p className="result-kicker">{kicker}</p>
        <p className="result-caption">{caption}</p>
      </header>
      <p className="result-weekday">{parts.weekday}</p>
      <p className="result-date">
        {parts.day} {parts.month}
      </p>
      <p className="result-year">{parts.year}</p>
    </article>
  )
}

async function copyText(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await Promise.race([
        navigator.clipboard.writeText(text),
        new Promise((_, reject) => {
          window.setTimeout(() => reject(new Error('Clipboard timed out')), 1200)
        }),
      ])
      return
    }
  } catch {
    // Fall through to the older copy command used in locked-down browsers.
  }

  const field = document.createElement('textarea')
  field.value = text
  field.setAttribute('readonly', '')
  field.style.position = 'fixed'
  field.style.left = '-9999px'
  document.body.appendChild(field)
  field.select()
  const ok = document.execCommand('copy')
  document.body.removeChild(field)
  if (!ok) throw new Error('Copy command failed')
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.5 5.5V4.2A1.2 1.2 0 0 0 9.3 3H4.2A1.2 1.2 0 0 0 3 4.2v5.1A1.2 1.2 0 0 0 4.2 10.5H5.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 8.2 6.4 11l6.1-6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

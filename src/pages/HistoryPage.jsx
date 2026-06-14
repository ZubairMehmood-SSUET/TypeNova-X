import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  getHistory,
  clearHistory,
  calcHistorySummary,
} from '../utils/useStorage'
import './HistoryPage.css'

const FILTERS = ['All', 'Time', 'Words', 'Quote']

function ModeTag({ mode }) {
  return (
    <span className={`hist-mode-tag hist-mode-tag--${mode}`}>
      {mode}
    </span>
  )
}

function WpmBar({ wpm, max = 200 }) {
  const pct = Math.min((wpm / max) * 100, 100)
  return (
    <div className="hist-wpm-bar">
      <div className="hist-wpm-bar__fill" style={{ width: `${pct}%` }} />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="hist-table-empty">
      <p>No tests recorded yet.</p>
      <Link to="/test" className="hist-empty-link">Run your first test →</Link>
    </div>
  )
}

export default function HistoryPage() {
  const [history,  setHistory]  = useState(() => getHistory())
  const [filter,   setFilter]   = useState('All')
  const [clearing, setClearing] = useState(false)

  // Refresh when localStorage changes from another tab
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'tnx:history') setHistory(getHistory())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Also refresh when the component re-mounts after a navigation
  useEffect(() => {
    setHistory(getHistory())
  }, [])

  const summary = calcHistorySummary(history)

  const filtered = filter === 'All'
    ? history
    : history.filter(r => r.mode === filter.toLowerCase())

  const summaryCards = [
    { label: 'Total Tests',  value: String(summary.total),   suffix: '',  accent: false },
    { label: 'Best WPM',     value: String(summary.bestWpm), suffix: '',  accent: true  },
    { label: 'Avg WPM',      value: String(summary.avgWpm),  suffix: '',  accent: false },
    { label: 'Avg Accuracy', value: String(summary.avgAcc),  suffix: '%', accent: false },
  ]

  // Trend chart: last 10 tests reversed (oldest → newest left→right)
  const trendData = history.slice(0, 10).reverse()
  const trendMax  = trendData.length
    ? Math.max(...trendData.map(r => r.wpm), 1)
    : 1

  function handleClear() {
    if (!window.confirm('Clear all test history? This cannot be undone.')) return
    setClearing(true)
    clearHistory()
    setHistory([])
    setClearing(false)
  }

  return (
    <main className="hist-page">

      {/* ── Page header ── */}
      <div className="hist-header">
        <div className="hist-header__left">
          <h1 className="hist-header__title">Your History</h1>
          <p className="hist-header__sub">
            {history.length > 0
              ? `${history.length} test${history.length === 1 ? '' : 's'} recorded locally`
              : 'All-time personal records and test log'}
          </p>
        </div>
        <div className="hist-header__actions">
          {history.length > 0 && (
            <button
              className="hist-clear-btn"
              onClick={handleClear}
              disabled={clearing}
            >
              Clear All
            </button>
          )}
          <Link to="/test" className="hist-header__cta">
            New Test →
          </Link>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="hist-summary">
        {summaryCards.map((s) => (
          <div key={s.label} className="hist-summary__card glass-card">
            <span className={`hist-summary__val ${s.accent ? 'hist-summary__val--accent' : ''}`}>
              {s.value}
              <span className="hist-summary__suffix">{s.suffix}</span>
            </span>
            <span className="hist-summary__label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── WPM Trend ── */}
      <div className="hist-trend glass-card">
        <div className="hist-trend__header">
          <span className="hist-trend__title">WPM Trend</span>
          <span className="hist-trend__hint">
            {trendData.length > 0 ? `Last ${trendData.length} test${trendData.length === 1 ? '' : 's'}` : 'No data yet'}
          </span>
        </div>
        <div className="hist-trend__chart">
          {trendData.length === 0 ? (
            <div className="hist-trend__empty">Complete a test to see your trend</div>
          ) : (
            trendData.map((r, i) => {
              const h = Math.round(((r.wpm) / trendMax) * 100)
              return (
                <div key={r.id ?? i} className="hist-trend__col">
                  <div
                    className="hist-trend__bar"
                    style={{ height: `${Math.max(h, 6)}%` }}
                    title={`${r.wpm} WPM`}
                  />
                  <span className="hist-trend__idx">{i + 1}</span>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── Filter + table ── */}
      <div className="hist-table-wrap glass-card glass-card--strong">

        <div className="hist-table-header">
          <span className="hist-table-title">Test Log</span>
          <div className="hist-filters">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`hist-filter ${filter === f ? 'hist-filter--active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          history.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="hist-table-empty">
              <span>No {filter.toLowerCase()} tests found</span>
            </div>
          )
        ) : (
          <div className="hist-table-scroll">
            <table className="hist-table">
              <thead>
                <tr>
                  <th className="hist-th">#</th>
                  <th className="hist-th">Mode</th>
                  <th className="hist-th">WPM</th>
                  <th className="hist-th hist-th--wide">WPM Chart</th>
                  <th className="hist-th">Accuracy</th>
                  <th className="hist-th hist-th--hide-sm">Errors</th>
                  <th className="hist-th hist-th--right">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={row.id ?? i} className="hist-row">
                    <td className="hist-td hist-td--num">{i + 1}</td>
                    <td className="hist-td">
                      <div className="hist-td__mode">
                        <ModeTag mode={row.mode} />
                        <span className="hist-td__option">{row.optionLabel ?? row.option}</span>
                      </div>
                    </td>
                    <td className="hist-td hist-td--wpm">{row.wpm}</td>
                    <td className="hist-td hist-th--wide">
                      <WpmBar wpm={row.wpm} />
                    </td>
                    <td className="hist-td">
                      <span className={`hist-td__acc ${
                        row.accuracy >= 99 ? 'hist-td__acc--perfect'
                        : row.accuracy >= 97 ? 'hist-td__acc--good' : ''
                      }`}>
                        {row.accuracy}%
                      </span>
                    </td>
                    <td className="hist-td hist-td--hide-sm">
                      <span className={`hist-td__errors ${row.errors > 5 ? 'hist-td__errors--high' : ''}`}>
                        {row.errors}
                      </span>
                    </td>
                    <td className="hist-td hist-td--date">
                      <span className="hist-td__date">{row.dateStr}</span>
                      <span className="hist-td__time">{row.timeStr}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </main>
  )
}

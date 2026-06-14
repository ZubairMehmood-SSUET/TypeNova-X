import { useState, useEffect, useMemo } from 'react'
import { getLeaderboard } from '../utils/useStorage'
import './LeaderboardPage.css'

const FILTERS = ['All Time', 'This Week', 'Today']

// Static global mock entries — represent worldwide competition
const GLOBAL_MOCK = [
  { username: 'velocityking',  wpm: 198, accuracy: 99.1, tests: 2401 },
  { username: 'nitro_typer',   wpm: 187, accuracy: 98.7, tests: 1882 },
  { username: 'swiftfingers',  wpm: 175, accuracy: 99.5, tests: 3104 },
  { username: 'keyboardqueen', wpm: 168, accuracy: 98.2, tests:  940 },
  { username: 'thunderclap99', wpm: 162, accuracy: 97.9, tests: 1225 },
  { username: 'typernova',     wpm: 157, accuracy: 99.0, tests:  783 },
  { username: 'alphadash',     wpm: 151, accuracy: 97.4, tests: 2001 },
  { username: 'coderunner_x',  wpm: 148, accuracy: 98.8, tests:  612 },
  { username: 'blitztype',     wpm: 144, accuracy: 96.9, tests: 1340 },
  { username: 'zerolatency',   wpm: 141, accuracy: 98.1, tests:  889 },
]

function RankBadge({ rank }) {
  if (rank === 1) return <span className="lb-rank lb-rank--gold">1</span>
  if (rank === 2) return <span className="lb-rank lb-rank--silver">2</span>
  if (rank === 3) return <span className="lb-rank lb-rank--bronze">3</span>
  return <span className="lb-rank">{rank}</span>
}

const PODIUM_BADGES = ['🏆', '🥈', '🥉']

export default function LeaderboardPage() {
  const [localEntries, setLocalEntries] = useState(() => getLeaderboard())
  const [activeFilter, setActiveFilter] = useState('All Time')

  // Refresh if localStorage updates in another tab
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'tnx:leaderboard') setLocalEntries(getLeaderboard())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Also refresh on mount (catches same-tab navigation)
  useEffect(() => {
    setLocalEntries(getLeaderboard())
  }, [])

  // Merge local entries into global list, sort by WPM, re-rank
  const combined = useMemo(() => {
    // Mark global entries
    const globals = GLOBAL_MOCK.map(e => ({ ...e, isLocal: false }))

    // For local entries, only include "You" (the player's best)
    const locals = localEntries
      .filter(e => e.username === 'You')
      .map(e => ({
        username: 'You',
        wpm:      e.wpm,
        accuracy: e.accuracy,
        tests:    null,   // shown as "—" in table
        isLocal:  true,
      }))

    // Replace global 'You' placeholder if it exists, otherwise insert
    const all = [...globals, ...locals]

    // Sort desc by WPM, add rank
    return all
      .sort((a, b) => b.wpm - a.wpm)
      .map((entry, i) => ({ ...entry, rank: i + 1, badge: i < 3 ? PODIUM_BADGES[i] : null }))
  }, [localEntries])

  const userEntry = combined.find(e => e.isLocal)
  const userRank  = userEntry?.rank ?? null

  return (
    <main className="lb-page">

      {/* ── Hero ── */}
      <div className="lb-hero">
        <div className="lb-hero__badge">
          <span className="lb-hero__dot" />
          {localEntries.length > 0 ? 'Your Best Score Included' : 'Global Rankings'}
        </div>
        <h1 className="lb-hero__title">Leaderboard</h1>
        <p className="lb-hero__sub">
          {userEntry
            ? `You're ranked #${userRank} with ${userEntry.wpm} WPM. Keep pushing!`
            : 'Complete a test to see your score here.'}
        </p>
      </div>

      {/* ── Top 3 podium ── */}
      <div className="lb-podium">
        {combined.slice(0, 3).map(p => (
          <div
            key={p.username + p.rank}
            className={[
              'lb-podium__card glass-card',
              p.rank === 1 ? 'lb-podium__card--first' : '',
              p.isLocal    ? 'lb-podium__card--you'   : '',
            ].join(' ')}
          >
            <span className="lb-podium__badge">{p.badge}</span>
            <div className="lb-podium__avatar">
              {p.username.charAt(0).toUpperCase()}
            </div>
            <span className="lb-podium__name">
              {p.username}
              {p.isLocal && <span className="lb-you-tag"> you</span>}
            </span>
            <span className="lb-podium__wpm">{p.wpm}</span>
            <span className="lb-podium__wpm-lbl">WPM</span>
            <span className="lb-podium__acc">{p.accuracy}% acc</span>
          </div>
        ))}
      </div>

      {/* ── Filter + table ── */}
      <div className="lb-table-wrap glass-card glass-card--strong">

        <div className="lb-table-header">
          <h2 className="lb-table-title">Global Rankings</h2>
          <div className="lb-filters">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`lb-filter ${activeFilter === f ? 'lb-filter--active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="lb-table-scroll">
          <table className="lb-table">
            <thead>
              <tr>
                <th className="lb-th lb-th--rank">#</th>
                <th className="lb-th lb-th--user">Player</th>
                <th className="lb-th">WPM</th>
                <th className="lb-th">Accuracy</th>
                <th className="lb-th lb-th--tests">Tests</th>
              </tr>
            </thead>
            <tbody>
              {combined.map(row => (
                <tr
                  key={row.username + row.rank}
                  className={`lb-row ${row.isLocal ? 'lb-row--you' : ''}`}
                >
                  <td className="lb-td lb-td--rank">
                    <RankBadge rank={row.rank} />
                  </td>
                  <td className="lb-td lb-td--user">
                    <div className="lb-user">
                      <div className={`lb-user__avatar ${row.isLocal ? 'lb-user__avatar--you' : ''}`}>
                        {row.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="lb-user__name">
                        {row.username}
                        {row.isLocal && <span className="lb-you-tag"> you</span>}
                      </span>
                    </div>
                  </td>
                  <td className="lb-td lb-td--wpm">{row.wpm}</td>
                  <td className="lb-td">
                    <div className="lb-acc">
                      <div className="lb-acc__bar">
                        <div
                          className="lb-acc__fill"
                          style={{ width: `${row.accuracy}%` }}
                        />
                      </div>
                      <span className="lb-acc__val">{row.accuracy}%</span>
                    </div>
                  </td>
                  <td className="lb-td lb-td--tests">
                    {row.tests !== null ? row.tests.toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </main>
  )
}

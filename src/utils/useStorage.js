/**
 * useStorage.js
 * Central localStorage layer for TypeNova-X.
 *
 * Keys:
 *   tnx:history     — array of TestResult objects, newest first, max 200
 *   tnx:leaderboard — array of LeaderboardEntry objects, sorted desc by wpm, max 100
 *
 * All functions are safe to call even when localStorage is blocked (private
 * browsing, storage quota exceeded, etc.) — errors are swallowed and sensible
 * defaults are returned.
 *
 * NOT a React hook — plain utility functions so they can be called from
 * anywhere (hooks, components, event handlers) without Rules of Hooks limits.
 */

const KEYS = {
  history:     'tnx:history',
  leaderboard: 'tnx:leaderboard',
}

const MAX_HISTORY     = 200
const MAX_LEADERBOARD = 100

// ── Serialisation helpers ─────────────────────────────────────────────────────

function load(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch (_) {
    return null
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (_) {
    return false
  }
}

// ── History ───────────────────────────────────────────────────────────────────

/**
 * Return the full history array, newest first.
 * @returns {object[]}
 */
export function getHistory() {
  return load(KEYS.history) ?? []
}

/**
 * Append a new result to history.
 * Stamps a unique id and normalised date/time fields if missing.
 * Trims to MAX_HISTORY entries.
 *
 * @param {object} result  The result object from buildResult()
 * @returns {object}       The stored entry (with id + display date/time)
 */
export function saveResult(result) {
  const history = getHistory()

  const now  = new Date()
  const entry = {
    ...result,
    id:      `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    // Friendly display fields for the History table
    dateStr: now.toISOString().slice(0, 10),                   // "2026-05-30"
    timeStr: now.toTimeString().slice(0, 5),                   // "14:32"
    // Normalise option to string for display (e.g. 30 → "30s", "medium" stays)
    optionLabel: formatOptionLabel(result.mode, result.option),
  }

  history.unshift(entry)
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY
  save(KEYS.history, history)
  return entry
}

/**
 * Remove all history entries.
 */
export function clearHistory() {
  save(KEYS.history, [])
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

/**
 * Return the leaderboard array, sorted desc by wpm.
 * @returns {object[]}
 */
export function getLeaderboard() {
  return load(KEYS.leaderboard) ?? []
}

/**
 * Upsert a result into the local leaderboard.
 * One entry per "username" (defaults to "You"). Only keeps the best wpm per
 * username. Trims to MAX_LEADERBOARD entries.
 *
 * @param {object} result
 * @param {string} [username='You']
 * @returns {object[]}  Updated leaderboard
 */
export function saveLeaderboardEntry(result, username = 'You') {
  const lb = getLeaderboard()

  const existing = lb.findIndex(e => e.username === username)
  const entry = {
    username,
    wpm:      result.wpm,
    rawWpm:   result.rawWpm,
    accuracy: result.accuracy,
    mode:     result.mode,
    option:   result.option,
    date:     result.date ?? new Date().toISOString(),
  }

  if (existing !== -1) {
    // Only update if this is a new personal best
    if (result.wpm > lb[existing].wpm) {
      lb[existing] = entry
    }
  } else {
    lb.push(entry)
  }

  // Sort desc by wpm, trim
  lb.sort((a, b) => b.wpm - a.wpm)
  if (lb.length > MAX_LEADERBOARD) lb.length = MAX_LEADERBOARD

  save(KEYS.leaderboard, lb)
  return lb
}

/**
 * Remove all leaderboard entries.
 */
export function clearLeaderboard() {
  save(KEYS.leaderboard, [])
}

// ── Computed helpers ──────────────────────────────────────────────────────────

/**
 * Derive summary stats from a history array.
 * @param {object[]} history
 * @returns {{ total: number, bestWpm: number, avgWpm: number, avgAcc: number }}
 */
export function calcHistorySummary(history) {
  if (!history.length) {
    return { total: 0, bestWpm: 0, avgWpm: 0, avgAcc: 100 }
  }
  const total  = history.length
  const bestWpm = Math.max(...history.map(r => r.wpm))
  const avgWpm  = Math.round(history.reduce((s, r) => s + r.wpm,      0) / total)
  const avgAcc  = Math.round((history.reduce((s, r) => s + r.accuracy, 0) / total) * 10) / 10
  return { total, bestWpm, avgWpm, avgAcc }
}

// ── Internal util (mirrors textUtils to avoid circular import) ─────────────────

function formatOptionLabel(mode, option) {
  if (mode === 'time')  return `${option}s`
  if (mode === 'words') return `${option}w`
  return String(option)
}

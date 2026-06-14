/**
 * statsUtils.js
 * Pure functions for real-time typing statistics.
 * All functions are deterministic and side-effect free.
 *
 * Phase 4A: buildResult now accepts optional difficulty, currentStreak, bestStreak.
 * All existing exports remain fully backward compatible.
 */

/**
 * Calculate gross WPM.
 * Standard definition: every 5 characters (including spaces) = 1 word.
 *
 * @param {number} correctChars  Total correctly typed characters so far
 * @param {number} elapsedSec    Seconds elapsed since test started (> 0)
 * @returns {number}             Rounded WPM, minimum 0
 */
export function calcWpm(correctChars, elapsedSec) {
  if (elapsedSec <= 0 || correctChars <= 0) return 0
  const minutes = elapsedSec / 60
  return Math.round(correctChars / 5 / minutes)
}

/**
 * Calculate net WPM (gross WPM minus error penalty per minute).
 * Net WPM is what most competitive typing sites display.
 *
 * @param {number} correctChars
 * @param {number} errorChars
 * @param {number} elapsedSec
 * @returns {number}  Rounded net WPM, minimum 0
 */
export function calcNetWpm(correctChars, errorChars, elapsedSec) {
  if (elapsedSec <= 0) return 0
  const minutes  = elapsedSec / 60
  const gross    = correctChars / 5 / minutes
  const penalty  = errorChars  / minutes
  return Math.max(0, Math.round(gross - penalty))
}

/**
 * Calculate accuracy as a percentage.
 *
 * @param {number} totalTyped    Total keystrokes made (correct + incorrect)
 * @param {number} errorChars    Number of incorrect keystrokes
 * @returns {number}             Accuracy 0–100, one decimal place
 */
export function calcAccuracy(totalTyped, errorChars) {
  if (totalTyped <= 0) return 100
  const correct = totalTyped - errorChars
  return Math.max(0, Math.round((correct / totalTyped) * 1000) / 10)
}

/**
 * Build a final result snapshot when a test finishes.
 * Phase 4A adds optional difficulty and streak fields — defaults preserve
 * backward compatibility with Phase 3 callers.
 *
 * @param {object}  params
 * @param {number}  params.correctChars
 * @param {number}  params.errorChars
 * @param {number}  params.totalTyped
 * @param {number}  params.elapsedSec
 * @param {'time'|'words'|'quote'} params.mode
 * @param {number|string} params.option
 * @param {'easy'|'medium'|'hard'} [params.difficulty='medium']
 * @param {number}  [params.currentStreak=0]
 * @param {number}  [params.bestStreak=0]
 * @param {number[]} [params.wpmHistory=[]]  Per-second WPM snapshots for graph
 * @returns {object}
 */
export function buildResult({
  correctChars,
  errorChars,
  totalTyped,
  elapsedSec,
  mode,
  option,
  difficulty    = 'medium',
  currentStreak = 0,
  bestStreak    = 0,
  wpmHistory    = [],
}) {
  return {
    wpm:          calcNetWpm(correctChars, errorChars, elapsedSec),
    rawWpm:       calcWpm(correctChars, elapsedSec),
    accuracy:     calcAccuracy(totalTyped, errorChars),
    errors:       errorChars,
    chars:        correctChars,
    time:         elapsedSec,
    mode,
    option,
    difficulty,
    currentStreak,
    bestStreak,
    wpmHistory,
    date:         new Date().toISOString(),
  }
}

/**
 * Format seconds into MM:SS display string.
 * @param {number} seconds
 * @returns {string}
 */
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return String(s)
  return `${m}:${String(s).padStart(2, '0')}`
}

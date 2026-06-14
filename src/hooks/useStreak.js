/**
 * useStreak.js
 * Tracks the typing streak for a single test session.
 *
 * - currentStreak: consecutive correct characters since the last error
 * - bestStreak:    highest currentStreak reached in this session
 *
 * Uses refs for the mutable counters to avoid triggering re-renders on
 * every keystroke. State is only flushed to React state at the end of
 * each keydown, matching the pattern established in useTypingEngine.
 */

import { useState, useRef, useCallback } from 'react'

/**
 * @returns {{
 *   currentStreak: number,
 *   bestStreak:    number,
 *   bestStreakRef:  React.MutableRefObject<number>,
 *   onCorrect:     () => void,
 *   onError:       () => void,
 *   resetStreak:   () => void,
 * }}
 */
export function useStreak() {
  const [currentStreak, setCurrentStreak] = useState(0)
  const [bestStreak,    setBestStreak]    = useState(0)

  // Refs hold the live values so keystroke handlers read up-to-date data
  // without depending on stale closures.
  const currentRef = useRef(0)
  const bestRef    = useRef(0)

  /** Call when the typed character was correct. */
  const onCorrect = useCallback(() => {
    currentRef.current += 1
    if (currentRef.current > bestRef.current) {
      bestRef.current = currentRef.current
      setBestStreak(bestRef.current)
    }
    setCurrentStreak(currentRef.current)
  }, [])

  /** Call when the typed character was incorrect — resets current streak. */
  const onError = useCallback(() => {
    currentRef.current = 0
    setCurrentStreak(0)
  }, [])

  /** Call on test restart to wipe both counters. */
  const resetStreak = useCallback(() => {
    currentRef.current = 0
    bestRef.current    = 0
    setCurrentStreak(0)
    setBestStreak(0)
  }, [])

  return {
    currentStreak,
    bestStreak,
    bestStreakRef: bestRef,    // exposed for reading inside closures at test-end
    onCorrect,
    onError,
    resetStreak,
  }
}

/**
 * useTimer.js
 * Precision interval timer for typing tests.
 *
 * Features:
 * - Countdown (time mode) or countup (words/quote mode)
 * - requestAnimationFrame-based drift correction for accuracy
 * - Clean start / stop / reset API
 * - No external dependencies
 */

import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * @param {object}   opts
 * @param {number}   opts.duration      Seconds for countdown (ignored in countup mode)
 * @param {boolean}  opts.countdown     true = count down, false = count up
 * @param {function} opts.onTick        Called every second with current display value
 * @param {function} opts.onExpire      Called when countdown reaches 0
 */
export function useTimer({ duration = 30, countdown = true, onTick, onExpire }) {
  const [display,   setDisplay]   = useState(countdown ? duration : 0)
  const [isRunning, setIsRunning] = useState(false)

  const rafRef       = useRef(null)
  const startWallRef = useRef(null)   // wall-clock ms when timer started
  const lastTickRef  = useRef(0)      // last integer second emitted
  const activeRef    = useRef(false)  // guards against stale closures

  // Expose a stable elapsed-seconds getter for external consumers
  const elapsedRef = useRef(0)

  const stop = useCallback(() => {
    activeRef.current = false
    setIsRunning(false)
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    stop()
    elapsedRef.current = 0
    lastTickRef.current = 0
    setDisplay(countdown ? duration : 0)
  }, [stop, countdown, duration])

  const start = useCallback(() => {
    if (activeRef.current) return
    activeRef.current   = true
    startWallRef.current = performance.now()
    lastTickRef.current  = 0
    elapsedRef.current   = 0
    setIsRunning(true)

    function tick(now) {
      if (!activeRef.current) return

      const elapsed = Math.floor((now - startWallRef.current) / 1000)

      if (elapsed !== lastTickRef.current) {
        lastTickRef.current  = elapsed
        elapsedRef.current   = elapsed

        const displayVal = countdown
          ? Math.max(0, duration - elapsed)
          : elapsed

        setDisplay(displayVal)
        onTick?.(displayVal, elapsed)

        if (countdown && duration - elapsed <= 0) {
          stop()
          onExpire?.()
          return
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [countdown, duration, stop, onTick, onExpire])

  // Safety cleanup on unmount
  useEffect(() => {
    return () => {
      activeRef.current = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // When duration changes (user switches from 30s → 60s), reset immediately
  useEffect(() => {
    reset()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, countdown])

  return {
    display,        // number to show in UI
    isRunning,
    elapsed: elapsedRef, // ref — read .current inside event handlers
    start,
    stop,
    reset,
  }
}
  
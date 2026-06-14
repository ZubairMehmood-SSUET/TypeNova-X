/**
 * useSound.js
 * Synthesised sound effects via Web Audio API.
 * Zero external dependencies. Works in all modern browsers.
 *
 * Sounds:
 *  playKeypress() — soft high click on correct keystroke
 *  playError()    — short low buzz on incorrect keystroke
 *  playSuccess()  — ascending chord when test completes
 *
 * All calls are wrapped in try/catch so a blocked AudioContext
 * (e.g. before first user gesture) never throws.
 */

import { useState, useRef, useCallback } from 'react'

function getCtx(ref) {
  if (!ref.current) {
    ref.current = new (window.AudioContext || window.webkitAudioContext)()
  }
  // Resume suspended context (browser autoplay policy)
  if (ref.current.state === 'suspended') {
    ref.current.resume().catch(() => {})
  }
  return ref.current
}

function makeNote(ctx, { freq, type = 'sine', gainPeak = 0.08, duration = 0.08, startOffset = 0 }) {
  const osc  = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type           = type
  osc.frequency.value = freq
  const t = ctx.currentTime + startOffset
  gain.gain.setValueAtTime(gainPeak, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration)
  osc.start(t)
  osc.stop(t + duration + 0.01)
}

export function useSound() {
  const [enabled, setEnabled] = useState(true)
  const ctxRef = useRef(null)

  const playKeypress = useCallback(() => {
    if (!enabled) return
    try {
      makeNote(getCtx(ctxRef), { freq: 700, type: 'sine', gainPeak: 0.06, duration: 0.07 })
    } catch (_) {}
  }, [enabled])

  const playError = useCallback(() => {
    if (!enabled) return
    try {
      makeNote(getCtx(ctxRef), { freq: 160, type: 'sawtooth', gainPeak: 0.09, duration: 0.11 })
    } catch (_) {}
  }, [enabled])

  const playSuccess = useCallback(() => {
    if (!enabled) return
    try {
      const ctx = getCtx(ctxRef)
      // Ascending C-major triad: C5 → E5 → G5
      ;[523.25, 659.25, 783.99].forEach((freq, i) => {
        makeNote(ctx, { freq, type: 'sine', gainPeak: 0.10, duration: 0.28, startOffset: i * 0.11 })
      })
    } catch (_) {}
  }, [enabled])

  const toggle = useCallback(() => setEnabled(v => !v), [])

  return { enabled, toggle, playKeypress, playError, playSuccess }
}

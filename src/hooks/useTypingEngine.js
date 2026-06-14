/**
 * useTypingEngine.js
 * Central state machine for the TypeNova-X typing test.
 *
 * Responsibilities:
 * - Manages test lifecycle: idle → running → finished
 * - Processes every keystroke and maps it to char status
 * - Computes live WPM, accuracy, error count
 * - Orchestrates timer start/stop
 * - Exposes stable restart function
 * - Handles Tab+Enter and Escape keyboard shortcuts
 *
 * Phase 4A additions:
 * - Accepts `difficulty` param (easy / medium / hard)
 * - Threads difficulty into text generators
 * - Integrates useStreak for consecutive-correct tracking
 * - Passes streak data into buildResult
 * - Returns currentStreak + bestStreak for live UI display
 *
 * Phase 4B additions:
 * - lastKeyEvent { key, correct, seq } — drives VirtualKeyboard flash + sound routing
 * - wpmHistory ref — per-second WPM snapshots passed into buildResult for WpmGraph
 *
 * Does NOT contain any JSX or DOM manipulation.
 */

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from 'react'

import { useTimer }   from './useTimer'
import { useStreak }  from './useStreak'
import {
  buildCharMap,
  generateTimeText,
  generateWordText,
  generateQuoteText,
} from '../utils/textUtils'
import { calcWpm, calcAccuracy, buildResult } from '../utils/statsUtils'

// ── Constants ──────────────────────────────────────────────────────────────────
const IGNORED_KEYS = new Set([
  'Shift', 'CapsLock', 'Control', 'Alt', 'Meta',
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  'Home', 'End', 'PageUp', 'PageDown',
  'Insert', 'Delete', 'F1', 'F2', 'F3', 'F4', 'F5',
  'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
  'Tab', 'Escape', 'Enter', 'ContextMenu',
])

// ── Hook ───────────────────────────────────────────────────────────────────────
/**
 * @param {object} params
 * @param {'time'|'words'|'quote'}  params.mode
 * @param {number|string}           params.option       duration(s) | wordCount | 'short'|'medium'|'long'
 * @param {'easy'|'medium'|'hard'}  params.difficulty
 */
export function useTypingEngine({ mode, option, difficulty = 'medium' }) {
  // ── State ────────────────────────────────────────────────────────────────
  const [testState,  setTestState]  = useState('idle')
  const [charMap,    setCharMap]    = useState([])
  const [cursor,     setCursor]     = useState(0)
  const [errorCount, setErrorCount] = useState(0)
  const [totalTyped, setTotalTyped] = useState(0)
  const [liveWpm,    setLiveWpm]    = useState(0)
  const [liveAcc,    setLiveAcc]    = useState(100)
  const [result,     setResult]     = useState(null)

  // ── Refs ─────────────────────────────────────────────────────────────────
  const correctRef  = useRef(0)
  const errorRef    = useRef(0)
  const totalRef    = useRef(0)
  const inputRef    = useRef(null)
  const tabPressRef = useRef(false)

  // Phase 4B: last key event for VirtualKeyboard highlight + sound routing
  // Using a seq counter so the keyboard re-renders even on repeat keys
  const [lastKeyEvent, setLastKeyEvent] = useState({ key: '', correct: true, seq: 0 })

  // Phase 4B: per-second WPM history for the WpmGraph
  // Stored as a ref to avoid re-renders; snapshotted into buildResult at end
  const wpmHistoryRef = useRef([])

  // ── Streak ───────────────────────────────────────────────────────────────
  const streak = useStreak()

  // ── Text generation ───────────────────────────────────────────────────────
  const generateText = useCallback(() => {
    if (mode === 'time')  return generateTimeText(Number(option), difficulty)
    if (mode === 'words') return generateWordText(Number(option), difficulty)
    // Quotes are difficulty-agnostic — they use their own pool
    return generateQuoteText(option)
  }, [mode, option, difficulty])

  // ── Timer callbacks ───────────────────────────────────────────────────────
  const handleExpire = useCallback(() => {
    setTestState('finished')
    setResult(
      buildResult({
        correctChars:  correctRef.current,
        errorChars:    errorRef.current,
        totalTyped:    totalRef.current,
        elapsedSec:    Number(option),
        mode,
        option,
        difficulty,
        currentStreak: streak.currentStreak,
        bestStreak:    streak.bestStreakRef.current,
        wpmHistory:    [...wpmHistoryRef.current],
      })
    )
  // streak.bestStreakRef is a stable ref — safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, option, difficulty])

  const handleTick = useCallback((_, elapsedSec) => {
    if (elapsedSec <= 0) return
    const wpm = calcWpm(correctRef.current, elapsedSec)
    setLiveWpm(wpm)
    setLiveAcc(calcAccuracy(totalRef.current, errorRef.current))
    // Phase 4B: record snapshot for graph
    wpmHistoryRef.current.push(wpm)
  }, [])

  // ── Timer ─────────────────────────────────────────────────────────────────
  const countdown     = mode === 'time'
  const timerDuration = mode === 'time' ? Number(option) : 9999

  const timer = useTimer({
    duration:  timerDuration,
    countdown,
    onTick:    handleTick,
    onExpire:  handleExpire,
  })

  // ── Init / reset ──────────────────────────────────────────────────────────
  const initTest = useCallback(() => {
    const text = generateText()
    setCharMap(buildCharMap(text))
    setCursor(0)
    setErrorCount(0)
    setTotalTyped(0)
    setLiveWpm(0)
    setLiveAcc(100)
    setTestState('idle')
    setResult(null)
    setLastKeyEvent({ key: '', correct: true, seq: 0 })
    correctRef.current = 0
    errorRef.current   = 0
    totalRef.current   = 0
    wpmHistoryRef.current = []
    timer.reset()
    streak.resetStreak()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generateText])

  useEffect(() => {
    initTest()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generateText])

  // ── Focus helper ──────────────────────────────────────────────────────────
  const focusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  // ── Core keystroke handler ────────────────────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    const { key } = e

    // Tab + Enter → restart
    if (key === 'Tab') {
      e.preventDefault()
      tabPressRef.current = true
      return
    }
    if (key === 'Enter' && tabPressRef.current) {
      e.preventDefault()
      tabPressRef.current = false
      initTest()
      setTimeout(() => inputRef.current?.focus(), 0)
      return
    }
    if (key !== 'Tab') tabPressRef.current = false

    // Escape → focus input
    if (key === 'Escape') {
      e.preventDefault()
      inputRef.current?.focus()
      return
    }

    if (IGNORED_KEYS.has(key)) return
    if (testState === 'finished')  return

    // Backspace
    if (key === 'Backspace') {
      e.preventDefault()
      if (cursor === 0) return
      const prev = cursor - 1
      // On backspace: if the char we're un-typing was correct, the streak
      // context becomes ambiguous — we simply reset current streak to 0.
      streak.onError()
      setCharMap(p => {
        const n = [...p]
        n[prev] = { ...n[prev], status: 'pending' }
        return n
      })
      setCursor(prev)
      return
    }

    if (key.length !== 1) return

    // Start timer on first keystroke
    if (testState === 'idle') {
      setTestState('running')
      timer.start()
    }

    const expected = charMap[cursor]?.char
    if (expected === undefined) return

    const isCorrect  = key === expected
    const newStatus  = isCorrect ? 'correct' : 'error'

    setCharMap(p => {
      const n = [...p]
      n[cursor] = { ...n[cursor], status: newStatus }
      return n
    })

    totalRef.current += 1
    if (isCorrect) {
      correctRef.current += 1
      streak.onCorrect()
      setLastKeyEvent(prev => ({ key, correct: true,  seq: prev.seq + 1 }))
    } else {
      errorRef.current += 1
      streak.onError()
      setErrorCount(c => c + 1)
      setLastKeyEvent(prev => ({ key, correct: false, seq: prev.seq + 1 }))
    }
    setTotalTyped(t => t + 1)

    const newCursor = cursor + 1
    setCursor(newCursor)

    // Words / Quote mode: finish when all chars typed
    if (mode !== 'time' && newCursor >= charMap.length) {
      const elapsed = timer.elapsed.current || 1
      timer.stop()
      setTestState('finished')
      setResult(
        buildResult({
          correctChars:  correctRef.current,
          errorChars:    errorRef.current,
          totalTyped:    totalRef.current,
          elapsedSec:    elapsed,
          mode,
          option,
          difficulty,
          currentStreak: streak.currentStreak,
          bestStreak:    streak.bestStreakRef.current,
          wpmHistory:    [...wpmHistoryRef.current],
        })
      )
    }
  }, [testState, cursor, charMap, timer, initTest, mode, option, difficulty, streak])

  // ── Global keydown → auto-focus input ────────────────────────────────────
  useEffect(() => {
    const onGlobalKey = () => {
      if (!inputRef.current) return
      if (document.activeElement === inputRef.current) return
      inputRef.current.focus()
    }
    window.addEventListener('keydown', onGlobalKey)
    return () => window.removeEventListener('keydown', onGlobalKey)
  }, [])

  // ── Restart ───────────────────────────────────────────────────────────────
  const restart = useCallback(() => {
    initTest()
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [initTest])

  // ── Derived display values ─────────────────────────────────────────────────
  const timerDisplay = useMemo(() => {
    if (mode === 'time') return timer.display
    return timer.display === 9999 ? 0 : timer.display
  }, [mode, timer.display])

  return {
    testState,
    charMap,
    cursor,
    errorCount,
    totalTyped,
    liveWpm,
    liveAcc,
    result,
    timerDisplay,
    isRunning:     timer.isRunning,
    currentStreak: streak.currentStreak,
    bestStreak:    streak.bestStreak,
    lastKeyEvent,
    inputRef,
    focusInput,
    handleKeyDown,
    restart,
  }
}

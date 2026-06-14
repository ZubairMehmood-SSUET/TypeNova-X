import { useState, useCallback, useEffect } from 'react'
import { useTypingEngine }    from '../hooks/useTypingEngine'
import { useSound }           from '../hooks/useSound'
import { formatTime }         from '../utils/statsUtils'
import { formatOptionLabel }  from '../utils/textUtils'
import { saveResult, saveLeaderboardEntry } from '../utils/useStorage'
import TestResult             from '../components/TestResult'
import DifficultySelector     from '../components/DifficultySelector'
import VirtualKeyboard        from '../components/VirtualKeyboard'
import './TypingTestPage.css'

const MODES = [
  { id: 'time',  label: 'Time'  },
  { id: 'words', label: 'Words' },
  { id: 'quote', label: 'Quote' },
]

const MODE_OPTIONS = {
  time:  [15, 30, 60, 120],
  words: [10, 25, 50, 100],
  quote: ['short', 'medium', 'long'],
}

export default function TypingTestPage() {
  const [mode,        setMode]        = useState('time')
  const [option,      setOption]      = useState(30)
  const [difficulty,  setDifficulty]  = useState('medium')
  const [showKb,      setShowKb]      = useState(false)

  const handleModeChange = useCallback((newMode) => {
    setMode(newMode)
    setOption(MODE_OPTIONS[newMode][1])
  }, [])

  const engine = useTypingEngine({ mode, option, difficulty })
  const sound  = useSound()

  const {
    testState, charMap, cursor,
    errorCount, liveWpm, liveAcc,
    result, timerDisplay, isRunning,
    currentStreak, bestStreak,
    lastKeyEvent,
    inputRef, handleKeyDown, restart, focusInput,
  } = engine

  // ── Wire sounds to key events ────────────────────────────────────────────
  // lastKeyEvent.seq increments on every keystroke — use it as the trigger
  useEffect(() => {
    if (lastKeyEvent.seq === 0) return
    if (lastKeyEvent.correct) {
      sound.playKeypress()
    } else {
      sound.playError()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastKeyEvent.seq])

  // Play success chord when test finishes
  useEffect(() => {
    if (testState === 'finished') {
      sound.playSuccess()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testState])

  // ── Persist result to localStorage on finish ─────────────────────────────
  useEffect(() => {
    if (testState === 'finished' && result) {
      saveResult(result)
      saveLeaderboardEntry(result, 'You')
    }
  // result reference is stable once testState hits 'finished'
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testState])

  const timerVal = mode === 'time'
    ? formatTime(timerDisplay)
    : isRunning ? formatTime(timerDisplay) : '—'

  // Target key = next expected character (lowercase for VirtualKeyboard matching)
  const targetKey = charMap[cursor]?.char ?? ''

  return (
    <main className="test-page">

      {/* ── Controls bar ── */}
      <div className="test-controls">
        <div className="test-mode-tabs">
          {MODES.map(m => (
            <button
              key={m.id}
              className={`test-mode-tab ${mode === m.id ? 'test-mode-tab--active' : ''}`}
              onClick={() => handleModeChange(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="test-divider-v" aria-hidden="true" />

        <div className="test-options">
          {MODE_OPTIONS[mode].map(opt => (
            <button
              key={opt}
              className={`test-option ${option === opt ? 'test-option--active' : ''}`}
              onClick={() => setOption(opt)}
            >
              {formatOptionLabel(mode, opt)}
            </button>
          ))}
        </div>

        <div className="test-divider-v" aria-hidden="true" />

        <DifficultySelector difficulty={difficulty} onChange={setDifficulty} />

        {/* ── Utility toggles ── */}
        <div className="test-divider-v" aria-hidden="true" />

        <div className="test-toggles">
          <button
            className={`test-toggle-btn ${sound.enabled ? 'test-toggle-btn--on' : ''}`}
            onClick={sound.toggle}
            title={sound.enabled ? 'Sound ON — click to mute' : 'Sound OFF — click to enable'}
            aria-label="Toggle sound"
          >
            {sound.enabled ? '🔊' : '🔇'}
          </button>

          <button
            className={`test-toggle-btn ${showKb ? 'test-toggle-btn--on' : ''}`}
            onClick={() => setShowKb(v => !v)}
            title={showKb ? 'Hide keyboard' : 'Show keyboard'}
            aria-label="Toggle virtual keyboard"
          >
            ⌨
          </button>
        </div>
      </div>

      {/* ── Stat strip ── */}
      <div className="test-stat-strip">
        <div className="test-stat">
          <span className="test-stat__val">
            {testState === 'idle' ? '—' : (liveWpm || '0')}
          </span>
          <span className="test-stat__lbl">WPM</span>
        </div>

        <div className="test-stat">
          <span className="test-stat__val">
            {testState === 'idle' ? '—' : `${liveAcc}%`}
          </span>
          <span className="test-stat__lbl">ACC</span>
        </div>

        <div className="test-stat">
          <span className="test-stat__val test-stat__val--accent">
            {timerVal}
          </span>
          <span className="test-stat__lbl">
            {mode === 'time' ? 'SEC' : 'TIME'}
          </span>
        </div>

        <div className="test-stat">
          <span className="test-stat__val">
            {testState === 'idle' ? '0' : errorCount}
          </span>
          <span className="test-stat__lbl">ERRORS</span>
        </div>

        <div className="test-stat">
          <span className="test-stat__val test-stat__val--streak">
            {testState === 'idle' ? '0' : currentStreak}
          </span>
          <span className="test-stat__lbl">STREAK</span>
        </div>

        <div className="test-stat">
          <span className="test-stat__val test-stat__val--best">
            {testState === 'idle' ? '0' : bestStreak}
          </span>
          <span className="test-stat__lbl">BEST</span>
        </div>
      </div>

      {/* ── Typing arena ── */}
      <div
        className={[
          'test-arena glass-card glass-card--strong',
          testState === 'running'  ? 'test-arena--running'  : '',
          testState === 'finished' ? 'test-arena--finished' : '',
        ].join(' ')}
        onClick={focusInput}
      >
        {testState === 'finished' ? (
          <TestResult result={result} onRestart={restart} />
        ) : (
          <>
            <input
              ref={inputRef}
              className="test-arena__input"
              onKeyDown={handleKeyDown}
              readOnly
              aria-label="Typing input — start typing to begin"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />

            <div
              className="test-arena__text"
              aria-live="polite"
              aria-atomic="false"
            >
              {charMap.map((entry, i) => {
                let cls = 'test-char'
                if (entry.status === 'correct') cls += ' test-char--correct'
                else if (entry.status === 'error') cls += ' test-char--error'
                if (i === cursor && testState !== 'finished') cls += ' test-char--cursor'
                return (
                  <span key={i} className={cls}>
                    {entry.char}
                  </span>
                )
              })}
            </div>

            <div className="test-arena__footer">
              <span className="test-arena__hint">
                {testState === 'idle'
                  ? 'Click here or start typing to begin'
                  : 'Keep going…'}
              </span>
              <button
                className="test-arena__restart"
                onClick={(e) => { e.stopPropagation(); restart() }}
                title="Restart (Tab + Enter)"
              >
                ↺ Restart
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Virtual Keyboard ── */}
      <VirtualKeyboard
        targetKey={targetKey}
        lastKeyEvent={lastKeyEvent}
        visible={showKb && testState !== 'finished'}
      />

      {/* ── Keyboard shortcut hints ── */}
      <div className="test-shortcuts">
        <span className="test-shortcut">
          <kbd>Tab</kbd> + <kbd>Enter</kbd> restart
        </span>
        <span className="test-shortcut">
          <kbd>Esc</kbd> focus
        </span>
      </div>

    </main>
  )
}

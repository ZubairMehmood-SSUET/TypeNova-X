import { useEffect, useRef } from "react";
import { DIFFICULTY_CONFIG } from "../utils/textUtils";
import WpmGraph from "./WpmGraph";
import "./TestResult.css";

/**
 * TestResult — Phase 4A full dashboard
 *
 * Displays:
 *   Main stats   : WPM · RAW · Accuracy · Errors · Correct chars · Duration
 *   Streak panel : Current streak · Best streak
 *   Meta row     : Mode · Difficulty badge
 *
 * @param {{ result: object, onRestart: function }} props
 */
export default function TestResult({ result, onRestart }) {
  const restartBtnRef = useRef(null);

  useEffect(() => {
    restartBtnRef.current?.focus();
  }, []);

  if (!result) return null;

  const {
    wpm,
    rawWpm,
    accuracy,
    errors,
    chars,
    time,
    mode,
    option,
    difficulty = "medium",
    currentStreak = 0,
    bestStreak = 0,
    wpmHistory = [],
  } = result;

  const diffCfg = DIFFICULTY_CONFIG[difficulty] ?? DIFFICULTY_CONFIG.medium;

  const perfMessage =
    wpm >= 120
      ? "Blazing fast. 🔥 Elite tier."
      : wpm >= 100
        ? "Exceptional speed. Top 10%."
        : wpm >= 80
          ? "Impressive. Keep that pace."
          : wpm >= 60
            ? "Solid performance. Push harder."
            : wpm >= 40
              ? "Good start. Consistency wins."
              : "Keep going — every rep counts.";

  const mainStats = [
    {
      label: "WPM",
      value: wpm,
      accent: "purple",
      title: "Net words per minute",
    },
    {
      label: "RAW",
      value: rawWpm,
      accent: null,
      title: "Gross WPM before penalty",
    },
    {
      label: "ACC",
      value: `${accuracy}%`,
      accent: accuracy >= 98 ? "green" : null,
      title: "Accuracy",
    },
    {
      label: "ERRORS",
      value: errors,
      accent: errors === 0 ? "green" : errors > 10 ? "red" : null,
      title: "Keystrokes in error",
    },
    {
      label: "CORRECT",
      value: chars,
      accent: null,
      title: "Correct characters typed",
    },
    {
      label: "TIME",
      value: mode === "time" ? `${option}s` : `${time}s`,
      accent: null,
      title: "Test duration",
    },
  ];

  return (
    <div className="test-result" role="region" aria-label="Test results">
      {/* ── Hero WPM ── */}
      <div className="test-result__header">
        <span className="test-result__badge">Test Complete</span>
        <h2 className="test-result__wpm">
          {wpm}
          <span className="test-result__wpm-unit">wpm</span>
        </h2>
        <p className="test-result__summary">{perfMessage}</p>
      </div>

      {/* ── Main stats grid ── */}
      <div className="test-result__stats">
        {mainStats.map((s) => (
          <div key={s.label} className="test-result__stat" title={s.title}>
            <span
              className={[
                "test-result__stat-val",
                s.accent ? `test-result__stat-val--${s.accent}` : "",
              ].join(" ")}
            >
              {s.value}
            </span>
            <span className="test-result__stat-lbl">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Streak panel ── */}
      <div className="test-result__streak-panel">
        <div className="test-result__streak-header">
          <span className="test-result__streak-title">Streak</span>
        </div>
        <div className="test-result__streak-stats">
          <div className="test-result__streak-stat">
            <span className="test-result__streak-val test-result__streak-val--current">
              {currentStreak}
            </span>
            <span className="test-result__streak-lbl">Current</span>
          </div>
          <div className="test-result__streak-divider" />
          <div className="test-result__streak-stat">
            <span className="test-result__streak-val test-result__streak-val--best">
              {bestStreak}
            </span>
            <span className="test-result__streak-lbl">Best</span>
          </div>
          <div className="test-result__streak-divider" />
          <div className="test-result__streak-stat">
            <span className="test-result__streak-val">
              {bestStreak > 0
                ? Math.round((bestStreak / Math.max(chars, 1)) * 100)
                : 0}
              <span className="test-result__streak-suffix">%</span>
            </span>
            <span className="test-result__streak-lbl">Best / Total</span>
          </div>
        </div>
      </div>

      {/* ── WPM Graph ── */}
      <WpmGraph wpmHistory={wpmHistory} finalWpm={wpm} />

      {/* ── Meta row: mode + difficulty ── */}
      <div className="test-result__meta">
        <span className="test-result__meta-chip">
          {mode} · {String(option)}
        </span>
        <span
          className={`test-result__diff-badge test-result__diff-badge--${diffCfg.color}`}
        >
          <span className="test-result__diff-dot" />
          {diffCfg.label}
        </span>
      </div>

      {/* ── Actions ── */}
      <div className="test-result__actions">
        <button
          ref={restartBtnRef}
          className="test-result__restart"
          onClick={onRestart}
        >
          <span>↺</span>
          Try Again
        </button>
      </div>

      <p className="test-result__shortcut">
        or press <kbd>Tab</kbd> + <kbd>Enter</kbd>
      </p>
    </div>
  );
}

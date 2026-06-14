import './HomePage.css'

const MODES = [
  { id: 'time',   label: 'Time',   icon: '⏱', desc: '15 · 30 · 60 · 120s' },
  { id: 'words',  label: 'Words',  icon: '📝', desc: '10 · 25 · 50 · 100' },
  { id: 'quote',  label: 'Quote',  icon: '❝',  desc: 'Short · Medium · Long' },
]

const STATS = [
  { value: '148',  label: 'Avg WPM',    suffix: '' },
  { value: '99.2', label: 'Accuracy',   suffix: '%' },
  { value: '14K',  label: 'Tests Today',suffix: '+' },
]

export default function HomePage() {
  return (
    <main className="home">
      {/* Hero */}
      <section className="home__hero">
        <div className="home__badge">
          <span className="home__badge-dot" />
          <span>v1.0 — Now Live</span>
        </div>

        <h1 className="home__headline">
          <span className="home__headline-line">Type Faster.</span>
          <span className="home__headline-line home__headline-line--accent">
            Think Sharper.
          </span>
        </h1>

        <p className="home__sub">
          The precision typing engine for developers, writers, and speed demons.
          <br />
          Real-time analytics. Zero distractions.
        </p>

        <button className="home__start-btn">
          <span className="home__start-btn-text">Start Typing</span>
          <span className="home__start-btn-icon">→</span>
        </button>
      </section>

      {/* Live stats bar */}
      <section className="home__stats">
        {STATS.map((s) => (
          <div key={s.label} className="home__stat">
            <span className="home__stat-value">
              {s.value}
              <span className="home__stat-suffix">{s.suffix}</span>
            </span>
            <span className="home__stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* Mode selector preview */}
      <section className="home__modes">
        <p className="home__modes-label">Select Mode</p>
        <div className="home__modes-grid">
          {MODES.map((mode, i) => (
            <div
              key={mode.id}
              className={`home__mode-card glass-card ${i === 0 ? 'home__mode-card--active' : ''}`}
            >
              <span className="home__mode-icon">{mode.icon}</span>
              <span className="home__mode-name">{mode.label}</span>
              <span className="home__mode-desc">{mode.desc}</span>
              {i === 0 && <span className="home__mode-badge">Default</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Typing area placeholder */}
      <section className="home__typing-preview glass-card glass-card--strong">
        <div className="home__typing-meta">
          <span className="home__typing-timer">30</span>
          <span className="home__typing-unit">seconds</span>
        </div>
        <div className="home__typing-text">
          <span className="home__char home__char--correct">T</span>
          <span className="home__char home__char--correct">h</span>
          <span className="home__char home__char--correct">e</span>
          <span className="home__char"> </span>
          <span className="home__char home__char--correct">q</span>
          <span className="home__char home__char--error">u</span>
          <span className="home__char home__char--cursor">i</span>
          <span className="home__char">c</span>
          <span className="home__char">k</span>
          <span className="home__char"> </span>
          <span className="home__char">b</span>
          <span className="home__char">r</span>
          <span className="home__char">o</span>
          <span className="home__char">w</span>
          <span className="home__char">n</span>
          <span className="home__char"> </span>
          <span className="home__char">f</span>
          <span className="home__char">o</span>
          <span className="home__char">x</span>
          <span className="home__char"> </span>
          <span className="home__char">j</span>
          <span className="home__char">u</span>
          <span className="home__char">m</span>
          <span className="home__char">p</span>
          <span className="home__char">s</span>
        </div>
        <div className="home__typing-hint">
          ↑ this is just a preview — the real test starts below
        </div>
      </section>
    </main>
  )
}

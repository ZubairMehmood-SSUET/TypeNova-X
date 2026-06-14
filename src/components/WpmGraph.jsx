/**
 * WpmGraph.jsx
 * Lightweight SVG chart that renders WPM progression from a test session.
 *
 * Props:
 *   wpmHistory  {number[]}  Array of per-second WPM snapshots
 *   finalWpm    {number}    Used for the peak reference line label
 */

import './WpmGraph.css'

const W         = 600   // viewBox width
const H         = 120   // viewBox height
const PAD_L     = 32    // left padding for Y-axis labels
const PAD_R     = 12
const PAD_T     = 12
const PAD_B     = 24    // bottom padding for X-axis labels
const PLOT_W    = W - PAD_L - PAD_R
const PLOT_H    = H - PAD_T - PAD_B

export default function WpmGraph({ wpmHistory = [], finalWpm = 0 }) {
  // Need at least 2 data points to draw a line
  if (!wpmHistory || wpmHistory.length < 2) {
    return (
      <div className="wpm-graph wpm-graph--empty">
        <span className="wpm-graph__empty-msg">Not enough data for graph</span>
      </div>
    )
  }

  const data   = wpmHistory
  const maxWpm = Math.max(...data, 10)
  // Round up to nearest 20 for a clean Y-axis ceiling
  const yMax   = Math.ceil(maxWpm / 20) * 20
  const count  = data.length

  // Map a data point to SVG coords
  const xOf = (i) => PAD_L + (i / (count - 1)) * PLOT_W
  const yOf = (v) => PAD_T + PLOT_H - (v / yMax) * PLOT_H

  // Build polyline points string
  const points = data.map((v, i) => `${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`).join(' ')

  // Build filled area path (polyline + close bottom)
  const areaPath = [
    `M ${xOf(0).toFixed(1)} ${yOf(data[0]).toFixed(1)}`,
    ...data.slice(1).map((v, i) => `L ${xOf(i + 1).toFixed(1)} ${yOf(v).toFixed(1)}`),
    `L ${xOf(count - 1).toFixed(1)} ${(PAD_T + PLOT_H).toFixed(1)}`,
    `L ${xOf(0).toFixed(1)} ${(PAD_T + PLOT_H).toFixed(1)}`,
    'Z',
  ].join(' ')

  // Y-axis grid lines at 0, yMax/2, yMax
  const yTicks = [0, Math.round(yMax / 2), yMax]

  // X-axis labels: show ~4 evenly spaced second markers
  const xTickCount = Math.min(count, 5)
  const xTicks = Array.from({ length: xTickCount }, (_, i) =>
    Math.round((i / (xTickCount - 1)) * (count - 1))
  )

  return (
    <div className="wpm-graph">
      <div className="wpm-graph__header">
        <span className="wpm-graph__title">WPM Over Time</span>
        <span className="wpm-graph__peak">peak {Math.max(...data)}</span>
      </div>

      <svg
        className="wpm-graph__svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        aria-label={`WPM over time graph, peak ${Math.max(...data)} WPM`}
      >
        <defs>
          {/* Gradient fill under the line */}
          <linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#8b5cf6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Y-axis grid lines + labels */}
        {yTicks.map((tick) => {
          const y = yOf(tick).toFixed(1)
          return (
            <g key={tick}>
              <line
                x1={PAD_L} y1={y}
                x2={W - PAD_R} y2={y}
                stroke="rgba(139,92,246,0.1)"
                strokeWidth="1"
                strokeDasharray="3 4"
              />
              <text
                x={PAD_L - 4}
                y={parseFloat(y) + 4}
                textAnchor="end"
                className="wpm-graph__axis-label"
              >
                {tick}
              </text>
            </g>
          )
        })}

        {/* X-axis second labels */}
        {xTicks.map((idx) => (
          <text
            key={idx}
            x={xOf(idx).toFixed(1)}
            y={H - 6}
            textAnchor="middle"
            className="wpm-graph__axis-label"
          >
            {idx}s
          </text>
        ))}

        {/* Area fill */}
        <path
          d={areaPath}
          fill="url(#wpmGrad)"
        />

        {/* Main line */}
        <polyline
          points={points}
          fill="none"
          stroke="#a78bfa"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data point dots — only render if count is manageable */}
        {count <= 60 && data.map((v, i) => (
          <circle
            key={i}
            cx={xOf(i).toFixed(1)}
            cy={yOf(v).toFixed(1)}
            r="2.5"
            fill="#a78bfa"
            opacity="0.7"
          />
        ))}
      </svg>
    </div>
  )
}

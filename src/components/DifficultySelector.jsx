import { DIFFICULTY_CONFIG } from '../utils/textUtils'
import './DifficultySelector.css'

/**
 * DifficultySelector
 * Renders Easy / Medium / Hard toggle buttons.
 * Uses DIFFICULTY_CONFIG from textUtils — single source of truth.
 *
 * @param {{ difficulty: string, onChange: (d: string) => void }} props
 */
export default function DifficultySelector({ difficulty, onChange }) {
  return (
    <div className="diff-selector" role="group" aria-label="Difficulty level">
      {Object.entries(DIFFICULTY_CONFIG).map(([key, cfg]) => (
        <button
          key={key}
          className={[
            'diff-selector__btn',
            `diff-selector__btn--${cfg.color}`,
            difficulty === key ? 'diff-selector__btn--active' : '',
          ].join(' ')}
          onClick={() => onChange(key)}
          title={cfg.description}
          aria-pressed={difficulty === key}
        >
          <span className="diff-selector__dot" />
          {cfg.label}
        </button>
      ))}
    </div>
  )
}

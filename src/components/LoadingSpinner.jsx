import './LoadingSpinner.css'

/**
 * LoadingSpinner
 * Used for page-level loading states (auth check, lazy chunks).
 *
 * @param {{ message?: string, fullPage?: boolean }} props
 */
export default function LoadingSpinner({ message = '', fullPage = false }) {
  return (
    <div
      className={`spinner-wrap ${fullPage ? 'spinner-wrap--full' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={message || 'Loading'}
    >
      <div className="spinner-ring" aria-hidden="true">
        <div className="spinner-ring__inner" />
      </div>
      {message && <span className="spinner-msg">{message}</span>}
    </div>
  )
}

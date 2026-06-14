import { Component } from 'react'
import './ErrorBoundary.css'

/**
 * ErrorBoundary
 * Catches unhandled runtime errors anywhere in the component tree.
 * Shows a recovery UI instead of a blank screen.
 *
 * Usage: wrap the app root or individual page sections.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // In production, send to error reporting service here
    console.error('[TypeNova-X] Unhandled error:', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    // Navigate to home as a safe recovery point
    window.location.href = '/'
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="error-boundary" role="alert">
        <div className="error-boundary__card glass-card glass-card--strong">
          <div className="error-boundary__icon" aria-hidden="true">⚠</div>
          <h1 className="error-boundary__title">Something went wrong</h1>
          <p className="error-boundary__sub">
            TypeNova-X encountered an unexpected error. Your test data is safe in localStorage.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre className="error-boundary__detail">
              {this.state.error.message}
            </pre>
          )}
          <button
            className="error-boundary__btn"
            onClick={this.handleReset}
          >
            ↩ Return to Home
          </button>
        </div>
      </div>
    )
  }
}

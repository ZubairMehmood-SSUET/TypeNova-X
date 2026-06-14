import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, parseFirebaseError } from '../context/AuthContext'
import './AuthPages.css'

export default function SignupPage() {
  const [username, setUsername] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState('')
  const [busy,     setBusy]     = useState(false)

  const { signup } = useAuth()
  const navigate   = useNavigate()

  const strength = password.length === 0 ? 0
    : password.length < 6  ? 1
    : password.length < 10 ? 2
    : 3

  const strengthLabel = ['', 'Weak', 'Good', 'Strong']
  const strengthClass = ['', 'auth-strength--weak', 'auth-strength--good', 'auth-strength--strong']

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    try {
      setError('')
      setBusy(true)
      await signup(email, password, username)
      navigate('/test', { replace: true })
    } catch (err) {
      setError(parseFirebaseError(err.code))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card glass-card glass-card--strong">

        {/* Header */}
        <div className="auth-card__header">
          <div className="auth-card__icon">⌨</div>
          <h1 className="auth-card__title">Create account</h1>
          <p className="auth-card__sub">Join TypeNova-X and start competing</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-username">
              Username <span className="auth-label-opt">(optional)</span>
            </label>
            <input
              id="signup-username"
              className="auth-input"
              type="text"
              placeholder="speedtyper99"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              disabled={busy}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={busy}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-password">Password</label>
            <div className="auth-input-wrap">
              <input
                id="signup-password"
                className="auth-input"
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                disabled={busy}
              />
              <button
                type="button"
                className="auth-eye"
                onClick={() => setShowPass(v => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>

            {password.length > 0 && (
              <div className="auth-strength">
                <div className="auth-strength__bars">
                  {[1, 2, 3].map(n => (
                    <div
                      key={n}
                      className={`auth-strength__bar ${strength >= n ? strengthClass[strength] : ''}`}
                    />
                  ))}
                </div>
                <span className={`auth-strength__label ${strengthClass[strength]}`}>
                  {strengthLabel[strength]}
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className={`auth-btn ${busy ? 'auth-btn--loading' : ''}`}
            disabled={busy}
          >
            {busy ? 'Creating account…' : 'Create Account'}
          </button>

          <p className="auth-terms">
            By signing up you agree to our{' '}
            <button type="button" className="auth-link">Terms</button>
            {' '}and{' '}
            <button type="button" className="auth-link">Privacy Policy</button>
          </p>
        </form>

        {/* Divider */}
        <div className="auth-or">
          <span className="auth-or__line" />
          <span className="auth-or__text">or continue with</span>
          <span className="auth-or__line" />
        </div>

        {/* OAuth stub */}
        <div className="auth-oauth">
          <button className="auth-oauth__btn" type="button">
            <span className="auth-oauth__icon">G</span>
            Google
          </button>
          <button className="auth-oauth__btn" type="button">
            <span className="auth-oauth__icon">⌘</span>
            GitHub
          </button>
        </div>

        {/* Footer */}
        <p className="auth-card__footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Log in</Link>
        </p>
      </div>
    </main>
  )
}

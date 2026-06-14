import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, parseFirebaseError } from '../context/AuthContext'
import './AuthPages.css'

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState('')
  const [busy,     setBusy]     = useState(false)

  const { login }  = useAuth()
  const navigate   = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }
    try {
      setError('')
      setBusy(true)
      await login(email, password)
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
          <h1 className="auth-card__title">Welcome back</h1>
          <p className="auth-card__sub">Log in to track your progress</p>
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
            <label className="auth-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
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
            <div className="auth-label-row">
              <label className="auth-label" htmlFor="login-password">Password</label>
              <button type="button" className="auth-forgot">Forgot password?</button>
            </div>
            <div className="auth-input-wrap">
              <input
                id="login-password"
                className="auth-input"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
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
          </div>

          <button
            type="submit"
            className={`auth-btn ${busy ? 'auth-btn--loading' : ''}`}
            disabled={busy}
          >
            {busy ? 'Logging in…' : 'Log In'}
          </button>
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
          Don't have an account?{' '}
          <Link to="/signup" className="auth-link">Sign up free</Link>
        </p>
      </div>
    </main>
  )
}

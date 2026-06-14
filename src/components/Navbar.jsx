import { useState, useEffect, useCallback } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const navigate           = useNavigate()
  const location           = useLocation()
  const { user, loading, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // Close menu on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await logout()
      navigate('/login')
    } catch (_) {}
  }, [logout, navigate])

  const displayName = user?.displayName
    ?? user?.email?.split('@')[0]
    ?? 'Account'

  const navLinkClass = ({ isActive }) =>
    'navbar__link' + (isActive ? ' navbar__link--active' : '')

  return (
    <header className="navbar" role="banner">
      <div className="navbar__inner">
        {/* Brand */}
        <div
          className="navbar__brand"
          onClick={() => navigate('/')}
          role="link"
          tabIndex={0}
          aria-label="TypeNova-X home"
          onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
        >
          <span className="navbar__logo-icon" aria-hidden="true">⌨</span>
          <span className="navbar__logo-text">
            Type<span className="navbar__logo-accent">Nova</span>
            <span className="navbar__logo-x">-X</span>
          </span>
        </div>

        {/* Desktop nav links */}
        <nav className="navbar__links" aria-label="Main navigation">
          <NavLink to="/"        className={navLinkClass}>Home</NavLink>
          <NavLink to="/test"        className={navLinkClass}>Typingtest</NavLink>
          <NavLink to="/leaderboard" className={navLinkClass}>Leaderboard</NavLink>
          {user && <NavLink to="/history" className={navLinkClass}>History</NavLink>}
        </nav>

        {/* Desktop auth */}
        <div className="navbar__auth">
          {loading ? (
            <span className="navbar__auth-loading" aria-hidden="true" />
          ) : user ? (
            <>
              <span className="navbar__user" aria-label={`Logged in as ${displayName}`}>
                <span className="navbar__user-avatar" aria-hidden="true">
                  {displayName.charAt(0).toUpperCase()}
                </span>
                <span className="navbar__user-name">{displayName}</span>
              </span>
              <button
                className="navbar__logout"
                onClick={handleLogout}
                aria-label="Log out"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login"  className="navbar__link navbar__link--ghost">Log in</NavLink>
              <NavLink to="/signup" className="navbar__cta">Sign Up</NavLink>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <span className="navbar__hamburger-bar" />
          <span className="navbar__hamburger-bar" />
          <span className="navbar__hamburger-bar" />
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <nav
          id="mobile-menu"
          className="navbar__mobile-menu"
          aria-label="Mobile navigation"
        >
          <NavLink to="/"        className={navLinkClass}>Home</NavLink>
          <NavLink to="/test"        className={navLinkClass}>Typingtest</NavLink>
          <NavLink to="/leaderboard" className={navLinkClass}>Leaderboard</NavLink>
          {user && <NavLink to="/history" className={navLinkClass}>History</NavLink>}

          <div className="navbar__mobile-divider" />

          {loading ? null : user ? (
            <>
              <span className="navbar__mobile-user">
                <span className="navbar__user-avatar" aria-hidden="true">
                  {displayName.charAt(0).toUpperCase()}
                </span>
                {displayName}
              </span>
              <button className="navbar__logout" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login"  className="navbar__link">Log in</NavLink>
              <NavLink to="/signup" className="navbar__cta navbar__cta--mobile">Sign Up</NavLink>
            </>
          )}
        </nav>
      )}
    </header>
  )
}

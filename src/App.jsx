import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ErrorBoundary   from './components/ErrorBoundary'
import LoadingSpinner  from './components/LoadingSpinner'
import AmbientBackground from './components/AmbientBackground'
import Navbar          from './components/Navbar'
import './App.css'

// Lazy-load pages for better initial bundle size and code splitting
const HomePage        = lazy(() => import('./pages/HomePage'))
const TypingTestPage  = lazy(() => import('./pages/TypingTestPage'))
const LoginPage       = lazy(() => import('./pages/LoginPage'))
const SignupPage      = lazy(() => import('./pages/SignupPage'))
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'))
const HistoryPage     = lazy(() => import('./pages/HistoryPage'))

/**
 * Redirects unauthenticated users to /login.
 * Shows nothing while the initial auth state is loading (prevents flash).
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner fullPage message="Checking session…" />
  if (!user)   return <Navigate to="/login" replace />
  return children
}

/**
 * Redirects already-logged-in users away from /login and /signup.
 */
function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner fullPage />
  if (user)    return <Navigate to="/test" replace />
  return children
}

// Page-level suspense fallback
const PageFallback = () => (
  <LoadingSpinner fullPage />
)

function AppRoutes() {
  return (
    <div className="app">
      {/* Skip to main content — accessibility */}
      <a className="skip-nav" href="#main-content">Skip to content</a>

      <AmbientBackground />
      <Navbar />

      <main id="main-content" tabIndex={-1}>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/"            element={<HomePage />} />
            <Route path="/test"        element={<TypingTestPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />

            {/* Auth routes — redirect away if already logged in */}
            <Route path="/login"  element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />

            {/* Protected — requires authentication */}
            <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}

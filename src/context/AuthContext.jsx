/**
 * AuthContext.jsx
 * Provides Firebase Auth state to the entire app via React Context.
 *
 * Exports:
 *   AuthProvider  — wrap the app tree with this
 *   useAuth()     — hook that returns { user, loading, login, signup, logout }
 *
 * user     — Firebase User object when signed in, null otherwise
 * loading  — true while onAuthStateChanged fires for the first time
 *            (prevents flashing "not logged in" on refresh)
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'

import { auth } from '../firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext(null)

// ── Error normaliser ──────────────────────────────────────────────────────────

/**
 * Convert a Firebase Auth error code into a human-readable message.
 * @param {string} code  e.g. 'auth/wrong-password'
 * @returns {string}
 */
export const parseFirebaseError = (code) => {
  const map = {
    'auth/user-not-found':       'No account found with this email.',
    'auth/wrong-password':       'Incorrect password.',
    'auth/invalid-credential':   'Invalid email or password.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password':        'Password must be at least 6 characters.',
    'auth/invalid-email':        'Please enter a valid email address.',
    'auth/too-many-requests':    'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/user-disabled':        'This account has been disabled.',
    'auth/operation-not-allowed':'Email/password sign-in is not enabled.',
  }
  return map[code] ?? 'Something went wrong. Please try again.'
}

// ── Provider ──────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // Subscribe to Firebase auth state — fires once on mount and on every
  // sign-in / sign-out. Sets loading = false after the first check.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? null)
      setLoading(false)
    })
    return unsubscribe   // cleanup on unmount
  }, [])

  /**
   * Create a new account with email, password, and optional display name.
   * Throws a Firebase AuthError on failure — callers should catch it.
   */
  const signup = useCallback(async (email, password, username = '') => {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    if (username.trim()) {
      await updateProfile(credential.user, { displayName: username.trim() })
      // Force a local state update so Navbar reflects the display name
      setUser({ ...credential.user, displayName: username.trim() })
    }
    return credential
  }, [])

  /**
   * Sign in with email and password.
   * Throws a Firebase AuthError on failure.
   */
  const login = useCallback(async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }, [])

  /**
   * Sign out the current user.
   */
  const logout = useCallback(async () => {
    return signOut(auth)
  }, [])

  const value = { user, loading, signup, login, logout }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Access auth state and actions from any component inside AuthProvider.
 * @returns {{ user: import('firebase/auth').User|null, loading: boolean,
 *             signup: Function, login: Function, logout: Function }}
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>.')
  return ctx
}

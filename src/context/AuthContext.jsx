import React, { useContext, useState, useEffect } from 'react'
import { auth } from '../config/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'

/**
 * AuthContext - Manages user authentication state
 * Provides login, register, logout, and currentUser
 */
const AuthContext = React.createContext()

/**
 * AuthProvider - Wraps app with Firebase authentication
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /**
   * Register a new user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<User>} - Firebase user object
   */
  const register = async (email, password) => {
    try {
      setError(null)
      const result = await createUserWithEmailAndPassword(auth, email, password)
      console.log('✓ User registered:', result.user.uid)
      return result.user
    } catch (err) {
      console.error('✗ Registration error:', err.message)
      setError(err.message)
      throw err
    }
  }

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<User>} - Firebase user object
   */
  const login = async (email, password) => {
    try {
      setError(null)
      const result = await signInWithEmailAndPassword(auth, email, password)
      console.log('✓ User logged in:', result.user.uid)
      return result.user
    } catch (err) {
      console.error('✗ Login error:', err.message)
      setError(err.message)
      throw err
    }
  }

  /**
   * Logout current user
   * Syncs all progress to Firebase before logging out
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
      setError(null)

      // Sync progress to Firebase before logout
      if (currentUser?.uid) {
        const { syncAllProgressToFirebase } = await import('../utils/storage.js')
        try {
          await syncAllProgressToFirebase(currentUser.uid)
          console.log('✓ Progress synced to Firebase before logout')
        } catch (syncError) {
          console.warn('⚠️ Could not sync progress to Firebase:', syncError.message)
          // Continue with logout even if sync fails
        }
      }

      await signOut(auth)
      console.log('✓ User logged out')
    } catch (err) {
      console.error('✗ Logout error:', err.message)
      setError(err.message)
      throw err
    }
  }

  /**
   * Listen for authentication state changes
   * This runs when app loads and whenever user logs in/out
   * When user logs in, load and merge progress from Firebase
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)

      if (user) {
        console.log('ℹ️ Auth state changed - user logged in:', user.uid)

        // Load and merge progress from Firebase on login
        try {
          const { loadProgressFromFirebase } = await import('../utils/storage.js')
          await loadProgressFromFirebase(user.uid)
          console.log('✓ Progress loaded and merged from Firebase')
        } catch (error) {
          console.warn('⚠️ Could not load progress from Firebase:', error.message)
          // Graceful degradation: continue with local data
        }
      } else {
        console.log('ℹ️ Auth state changed - user logged out')
      }

      setLoading(false)
    })

    // Cleanup subscription on unmount
    return unsubscribe
  }, [])

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!currentUser,
    isLoading: loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to use AuthContext in components
 * @returns {Object} Auth context value (currentUser, login, logout, etc.)
 * @throws {Error} If used outside AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext

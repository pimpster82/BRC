import React, { createContext, useState, useCallback } from 'react'

/**
 * LoadingContext - Global loading state management
 *
 * Provides a centralized way to manage loading states across the app.
 * Useful for:
 * - Data fetching operations
 * - API calls
 * - Page transitions
 * - Form submissions
 *
 * Usage:
 * const { showLoading, hideLoading, isLoading } = useLoading()
 */
export const LoadingContext = createContext()

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('Wird geladen...')

  const showLoading = useCallback((msg = 'Wird geladen...') => {
    setMessage(msg)
    setIsLoading(true)
  }, [])

  const hideLoading = useCallback(() => {
    setIsLoading(false)
  }, [])

  const value = {
    isLoading,
    message,
    showLoading,
    hideLoading,
  }

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  )
}

/**
 * useLoading Hook - Access loading context in any component
 *
 * @returns {Object} { isLoading, message, showLoading, hideLoading }
 */
export function useLoading() {
  const context = React.useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider')
  }
  return context
}

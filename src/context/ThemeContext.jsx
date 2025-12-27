import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

/**
 * ThemeContext - Manage dark/light/system theme preferences
 * Persists user choice to localStorage and applies to document
 *
 * Themes: 'light' | 'dark' | 'system'
 * - 'light'/'dark': Manual selection, overrides system preference
 * - 'system': Follows OS preference, updates on OS change
 *
 * Fix Log:
 * - Added error handling for localStorage access
 * - Added useMemo to prevent unnecessary re-renders
 * - Dev-only logging (process.env.NODE_ENV check)
 * - Improved initialization with try/catch
 * - Always remove both light/dark classes before adding new one
 */
const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  // Initialize from localStorage with error handling
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'system'
    try {
      const saved = localStorage.getItem('settings_theme')
      if (process.env.NODE_ENV === 'development') {
        console.log('🎨 [ThemeContext Init] Loaded from localStorage:', saved || 'null (using system)')
      }
      return saved || 'system'
    } catch (error) {
      console.warn('⚠️ localStorage not available:', error)
      return 'system'
    }
  })

  /**
   * Determine actual theme to use (resolves 'system' to actual preference)
   */
  const getActualTheme = (themeValue) => {
    if (themeValue === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return themeValue
  }

  /**
   * Apply theme to document
   */
  useEffect(() => {
    const actualTheme = getActualTheme(theme)
    const root = document.documentElement

    // Remove both classes first to prevent conflicts
    root.classList.remove('light', 'dark')
    // Add current theme class
    root.classList.add(actualTheme)

    if (process.env.NODE_ENV === 'development') {
      console.log(`🎨 [ThemeContext Apply] ${theme} → ${actualTheme}`)
    }
  }, [theme])

  /**
   * Listen to system preference changes (ONLY if theme is 'system')
   */
  useEffect(() => {
    // Early exit if user has manual preference
    if (theme !== 'system') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e) => {
      const newActualTheme = e.matches ? 'dark' : 'light'
      if (process.env.NODE_ENV === 'development') {
        console.log(`🎨 [System Preference Changed] ${newActualTheme}`)
      }
      // Trigger re-render to apply new system theme
      setTheme('system')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  /**
   * Set and persist theme preference
   */
  const setThemePreference = (newTheme) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎨 [setThemePreference] Changing from "${theme}" to "${newTheme}"`)
    }

    setTheme(newTheme)

    try {
      localStorage.setItem('settings_theme', newTheme)
      if (process.env.NODE_ENV === 'development') {
        console.log(`🎨 [localStorage] Saved "${newTheme}" to localStorage`)
      }
    } catch (error) {
      console.error('❌ Failed to save theme to localStorage:', error)
    }
  }

  /**
   * Get current actual theme (resolved from 'system' if needed)
   */
  const actualTheme = getActualTheme(theme)

  /**
   * Memoize context value to prevent unnecessary re-renders of children
   */
  const value = useMemo(
    () => ({ theme, setThemePreference, actualTheme }),
    [theme, actualTheme]
  )

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook to use theme context
 */
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

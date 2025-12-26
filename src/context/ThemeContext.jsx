import React, { createContext, useContext, useEffect, useState } from 'react'

/**
 * ThemeContext - Manage dark/light/system theme preferences
 * Persists user choice to localStorage and applies to document
 */
const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  // Theme can be: 'light', 'dark', or 'system'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('settings_theme') || 'light'
  })

  /**
   * Determine actual theme to use (resolves 'system' to actual preference)
   */
  const getActualTheme = (themeValue) => {
    if (themeValue === 'system') {
      // Check system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return themeValue
  }

  /**
   * Apply theme to document
   */
  useEffect(() => {
    const actualTheme = getActualTheme(theme)
    const htmlElement = document.documentElement

    if (actualTheme === 'dark') {
      htmlElement.classList.add('dark')
    } else {
      htmlElement.classList.remove('dark')
    }
  }, [theme])

  /**
   * Listen to system preference changes when theme is 'system'
   */
  useEffect(() => {
    if (theme !== 'system') {
      return // Only listen if system theme is selected
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      // Trigger re-render to apply new actual theme
      setTheme('system') // This forces useEffect above to run
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  /**
   * Set theme preference
   */
  const setThemePreference = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('settings_theme', newTheme)
  }

  /**
   * Get current actual theme (resolved from 'system' if needed)
   */
  const actualTheme = getActualTheme(theme)

  return (
    <ThemeContext.Provider value={{ theme, setThemePreference, actualTheme }}>
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

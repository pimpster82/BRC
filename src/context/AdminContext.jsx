import React, { useContext, useState, useEffect } from 'react'

/**
 * AdminContext - Manages admin mode state
 * Provides PIN verification, admin mode activation/deactivation
 * PIN: 170182 (6 digits)
 */
const AdminContext = React.createContext()

/**
 * AdminProvider - Wraps app with admin mode functionality
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 */
export const AdminProvider = ({ children }) => {
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [error, setError] = useState(null)

  // Load admin mode state from localStorage on mount
  useEffect(() => {
    const savedAdminMode = localStorage.getItem('app_adminMode') === 'true'
    setIsAdminMode(savedAdminMode)
  }, [])

  /**
   * Verify PIN and activate admin mode
   * @param {string} pin - 6-digit PIN to verify
   * @returns {boolean} - True if PIN is correct, false otherwise
   */
  const verifyPin = (pin) => {
    try {
      setError(null)
      const correctPin = '170182'

      if (pin === correctPin) {
        setIsAdminMode(true)
        localStorage.setItem('app_adminMode', 'true')
        console.log('✓ Admin mode activated')
        return true
      } else {
        setError('Falscher PIN')
        console.warn('✗ Invalid PIN attempt')
        return false
      }
    } catch (err) {
      console.error('✗ PIN verification error:', err.message)
      setError(err.message)
      return false
    }
  }

  /**
   * Exit admin mode
   * @returns {void}
   */
  const exitAdminAccess = () => {
    try {
      setError(null)
      setIsAdminMode(false)
      localStorage.removeItem('app_adminMode')
      console.log('✓ Admin mode deactivated')
    } catch (err) {
      console.error('✗ Error exiting admin mode:', err.message)
      setError(err.message)
    }
  }

  const value = {
    isAdminMode,
    verifyPin,
    exitAdminAccess,
    error
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

/**
 * Hook to use AdminContext in components
 * @returns {Object} Admin context value (isAdminMode, verifyPin, exitAdminAccess, etc.)
 * @throws {Error} If used outside AdminProvider
 */
export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}

export default AdminContext

import React, { useState, useRef, useEffect } from 'react'
import { Lock, X } from 'lucide-react'

/**
 * AdminPINModal - PIN entry modal for admin access
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Callback when modal closes
 * @param {Function} props.onVerify - Callback with PIN (pin) when user clicks OK
 * @param {string} props.error - Error message to display
 */
const AdminPINModal = ({ isOpen, onClose, onVerify, error }) => {
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const pinInputRef = useRef(null)

  // Focus on input when modal opens
  useEffect(() => {
    if (isOpen && pinInputRef.current) {
      pinInputRef.current.focus()
    }
  }, [isOpen])

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
    setPin(value)
  }

  const handleOK = () => {
    if (pin.length === 6) {
      onVerify(pin)
      setPin('')
    }
  }

  const handleCancel = () => {
    setPin('')
    setShowPin(false)
    onClose()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && pin.length === 6) {
      handleOK()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg max-w-sm w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-300">
              Admin Access
            </h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          PIN eingeben um Admin-Modus zu aktivieren
        </p>

        {/* PIN Input */}
        <div className="mb-4">
          <input
            ref={pinInputRef}
            type={showPin ? 'text' : 'password'}
            inputMode="numeric"
            maxLength="6"
            value={pin}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="••••••"
            className="w-full px-4 py-3 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent tracking-widest"
          />
        </div>

        {/* Show PIN Toggle */}
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={showPin}
            onChange={(e) => setShowPin(e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">PIN anzeigen</span>
        </label>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleOK}
            disabled={pin.length !== 6}
            className="flex-1 px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminPINModal

import React, { useState, useEffect } from 'react'
import LoadingSpinner from './LoadingSpinner'

/**
 * MinimumDelaySpinner - Ensures LoadingSpinner is shown for at least 5 seconds
 *
 * This wrapper ensures users can see the beautiful loading animation,
 * even if the actual loading completes very quickly.
 *
 * @param {boolean} loading - Whether the actual loading is happening
 * @param {string} message - Loading message to display
 * @param {ReactNode} children - Content to show when not loading
 */
export default function MinimumDelaySpinner({ loading, message, children }) {
  const [showSpinner, setShowSpinner] = useState(loading)
  const [startTime, setStartTime] = useState(null)

  useEffect(() => {
    if (loading && !startTime) {
      // Loading started - record start time
      setStartTime(Date.now())
      setShowSpinner(true)
    } else if (!loading && startTime) {
      // Loading finished - check if minimum time has elapsed
      const elapsed = Date.now() - startTime
      const minDisplayTime = 5000 // 5 seconds

      if (elapsed >= minDisplayTime) {
        // Minimum time already elapsed, hide immediately
        setShowSpinner(false)
        setStartTime(null)
      } else {
        // Wait for remaining time
        const remainingTime = minDisplayTime - elapsed
        const timer = setTimeout(() => {
          setShowSpinner(false)
          setStartTime(null)
        }, remainingTime)

        return () => clearTimeout(timer)
      }
    }
  }, [loading, startTime])

  if (showSpinner) {
    return <LoadingSpinner variant="full" message={message} />
  }

  return children
}

/**
 * Progress Context
 *
 * Provides unified progress tracking state and calculations for all reading plans.
 * Uses memoization and caching to optimize performance.
 *
 * Usage:
 * import { useProgress } from '../context/ProgressContext'
 * const { chaptersRead, chaptersIndex, overallProgress, oneyearProgress } = useProgress()
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { buildChaptersIndex } from '../utils/progressTracking'
import { getThematicProgress } from '../utils/thematicHelpers'
import { calculateAllVersesRead, calculateTotalBibleVerses } from '../utils/verseProgressCalculator'
import { getOneyearProgress, oneyearReadings } from '../config/oneyear-readings'
import { getBibleOverviewProgress, bibleOverviewReadings } from '../config/bible-overview-readings'
import { getPersonalReadingData, savePersonalReadingData } from '../utils/storage'

const ProgressContext = createContext(null)

/**
 * ProgressProvider Component
 *
 * Wraps the app and provides progress tracking state and calculations.
 * Automatically syncs with localStorage and invalidates cache when chaptersRead changes.
 */
export const ProgressProvider = ({ children }) => {
  // Core state: chaptersRead array (single source of truth)
  const [chaptersRead, setChaptersRead] = useState([])

  // Dependency tracking for cache invalidation
  const [lastLength, setLastLength] = useState(0)

  // Load initial data from localStorage
  useEffect(() => {
    const loadData = () => {
      const data = getPersonalReadingData()
      setChaptersRead(data?.chaptersRead || [])
    }

    loadData()

    // Listen for updates from other components
    const handleUpdate = () => loadData()
    window.addEventListener('personalReadingUpdated', handleUpdate)

    return () => {
      window.removeEventListener('personalReadingUpdated', handleUpdate)
    }
  }, [])

  // Update lastLength when chaptersRead changes (for cache invalidation)
  useEffect(() => {
    setLastLength(chaptersRead.length)
  }, [chaptersRead])

  // Build chaptersIndex (Map) for O(1) lookups
  // Recomputes only when chaptersRead reference changes
  const chaptersIndex = useMemo(() => {
    return buildChaptersIndex(chaptersRead)
  }, [chaptersRead])

  // Calculate Overall Bible Progress
  // Memoized: recomputes only when length changes
  const overallProgress = useMemo(() => {
    const versesRead = calculateAllVersesRead(chaptersRead)
    const totalVerses = calculateTotalBibleVerses()
    const percentage = totalVerses > 0 ? Math.round((versesRead / totalVerses) * 100) : 0

    return {
      versesRead,
      totalVerses,
      percentage
    }
  }, [lastLength]) // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate 1 Year Plan Progress
  // Memoized: recomputes only when length changes
  const oneyearProgress = useMemo(() => {
    return getOneyearProgress(chaptersRead)
  }, [lastLength]) // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate Bible Overview Progress
  // Memoized: recomputes only when length changes
  const bibleOverviewProgress = useMemo(() => {
    return getBibleOverviewProgress(chaptersRead)
  }, [lastLength]) // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate Thematic Plan Progress
  // Memoized: recomputes only when length changes
  const thematicProgress = useMemo(() => {
    // TODO: Replace with actual thematic topics array when available
    // For now, return placeholder
    return {
      total: 0,
      completed: 0,
      percentage: 0
    }
  }, [lastLength]) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Update chaptersRead and persist to storage
   * @param {Array} newChaptersRead - Updated chaptersRead array
   */
  const updateChaptersRead = (newChaptersRead) => {
    setChaptersRead(newChaptersRead)

    // Persist to localStorage
    const data = getPersonalReadingData()
    const updated = { ...data, chaptersRead: newChaptersRead }
    savePersonalReadingData(updated)

    // Notify other components
    window.dispatchEvent(new Event('personalReadingUpdated'))
  }

  // Context value
  const value = {
    // Core data
    chaptersRead,
    chaptersIndex,

    // Update function
    updateChaptersRead,

    // Memoized progress calculations
    overallProgress,
    oneyearProgress,
    bibleOverviewProgress,
    thematicProgress,

    // Utility data
    oneyearReadings,
    bibleOverviewReadings
  }

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  )
}

/**
 * Custom hook to access progress context
 * @returns {Object} Progress context value
 * @throws {Error} If used outside ProgressProvider
 */
export const useProgress = () => {
  const context = useContext(ProgressContext)

  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }

  return context
}

/**
 * HOC to wrap component with ProgressProvider
 * @param {React.Component} Component - Component to wrap
 * @returns {React.Component} Wrapped component
 */
export const withProgress = (Component) => {
  return (props) => (
    <ProgressProvider>
      <Component {...props} />
    </ProgressProvider>
  )
}

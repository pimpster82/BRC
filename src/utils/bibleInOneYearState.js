/**
 * Bible in One Year - Separate State Management
 *
 * This plan has its own isolated progress tracking to maintain the integrity
 * of the "read the Bible in 365 days" challenge.
 *
 * Key Features:
 * - Separate from global chaptersRead (no import from other plans)
 * - Pause/Resume functionality
 * - Attempt tracking with 18-month archive
 * - Export to global chaptersRead when exiting
 */

const STORAGE_KEY = 'bibleCompanion_bibleInOneYear'
const ARCHIVE_KEY = 'bibleCompanion_bibleInOneYear_archive'
const ARCHIVE_RETENTION_MONTHS = 18

/**
 * Get current Bible in One Year state
 * @returns {Object|null} Current state or null if no active plan
 */
export const getBibleInOneYearState = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Error reading Bible in One Year state:', error)
    return null
  }
}

/**
 * Initialize a new Bible in One Year attempt
 * @param {number} attemptNumber - Attempt number (1, 2, 3, ...)
 * @returns {Object} New state object
 */
export const initializeBibleInOneYear = (attemptNumber = 1) => {
  const newState = {
    active: true,
    attempt: attemptNumber,
    startDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    pauseDate: null,
    completedReadings: [], // Array of reading IDs (1-365)
    lastReadingId: 0,
    lastReadingDate: null, // Date when last reading was marked (for notifications)
    daysActive: 0,
    totalChaptersRead: 0
  }

  saveBibleInOneYearState(newState)
  return newState
}

/**
 * Save Bible in One Year state
 * @param {Object} state - State to save
 */
export const saveBibleInOneYearState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Error saving Bible in One Year state:', error)
  }
}

/**
 * Mark a reading as complete
 * @param {Object} state - Current state
 * @param {number} readingId - Reading ID (1-365)
 * @returns {Object} Updated state
 */
export const markReadingComplete = (state, readingId) => {
  if (!state || state.completedReadings.includes(readingId)) {
    return state
  }

  const newState = {
    ...state,
    completedReadings: [...state.completedReadings, readingId].sort((a, b) => a - b),
    lastReadingId: Math.max(state.lastReadingId, readingId),
    lastReadingDate: new Date().toISOString().split('T')[0], // Track when this reading was marked
    daysActive: state.daysActive + 1
  }

  saveBibleInOneYearState(newState)
  return newState
}

/**
 * Unmark a reading
 * @param {Object} state - Current state
 * @param {number} readingId - Reading ID (1-365)
 * @returns {Object} Updated state
 */
export const unmarkReading = (state, readingId) => {
  if (!state) return state

  const newState = {
    ...state,
    completedReadings: state.completedReadings.filter(id => id !== readingId)
  }

  // If no readings marked anymore, clear lastReadingDate
  if (newState.completedReadings.length === 0) {
    newState.lastReadingDate = null
  }

  saveBibleInOneYearState(newState)
  return newState
}

/**
 * Pause the current plan
 * @param {Object} state - Current state
 * @returns {Object} Updated state
 */
export const pausePlan = (state) => {
  if (!state) return state

  const newState = {
    ...state,
    active: false,
    pauseDate: new Date().toISOString().split('T')[0]
  }

  saveBibleInOneYearState(newState)
  return newState
}

/**
 * Resume the paused plan
 * @param {Object} state - Current state
 * @returns {Object} Updated state
 */
export const resumePlan = (state) => {
  if (!state) return state

  const newState = {
    ...state,
    active: true,
    pauseDate: null
  }

  saveBibleInOneYearState(newState)
  return newState
}

/**
 * Archive current attempt and prepare for new one
 * @param {Object} state - Current state to archive
 * @returns {Object} Archived attempt data
 */
export const archiveCurrentAttempt = (state) => {
  if (!state) return null

  const archivedAttempt = {
    ...state,
    archivedDate: new Date().toISOString().split('T')[0]
  }

  // Get existing archives
  const archives = getArchivedAttempts()

  // Add new archive
  archives.push(archivedAttempt)

  // Clean old archives (keep only last 18 months)
  const cleanedArchives = cleanOldArchives(archives)

  // Save archives
  saveArchives(cleanedArchives)

  return archivedAttempt
}

/**
 * Get all archived attempts
 * @returns {Array} Array of archived attempts
 */
export const getArchivedAttempts = () => {
  try {
    const data = localStorage.getItem(ARCHIVE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error reading archives:', error)
    return []
  }
}

/**
 * Save archives
 * @param {Array} archives - Array of archived attempts
 */
const saveArchives = (archives) => {
  try {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archives))
  } catch (error) {
    console.error('Error saving archives:', error)
  }
}

/**
 * Clean archives older than 18 months
 * @param {Array} archives - Array of archived attempts
 * @returns {Array} Cleaned archives
 */
const cleanOldArchives = (archives) => {
  const cutoffDate = new Date()
  cutoffDate.setMonth(cutoffDate.getMonth() - ARCHIVE_RETENTION_MONTHS)
  const cutoffDateStr = cutoffDate.toISOString().split('T')[0]

  return archives.filter(archive => {
    const archiveDate = archive.archivedDate || archive.pauseDate || archive.startDate
    return archiveDate >= cutoffDateStr
  })
}

/**
 * Export completed readings to global chaptersRead
 * @param {Object} state - Current state
 * @param {Array} oneyearReadings - Array of oneyear reading definitions
 * @returns {Array} Array of chapters in chaptersRead format
 */
export const exportToGlobalProgress = (state, oneyearReadings) => {
  if (!state || !state.completedReadings.length) return []

  const chaptersToAdd = []

  state.completedReadings.forEach(readingId => {
    const reading = oneyearReadings.find(r => r.id === readingId)
    if (!reading) return

    // Convert reading to chapters
    if (reading.startChapter && reading.endChapter) {
      for (let ch = reading.startChapter; ch <= reading.endChapter; ch++) {
        chaptersToAdd.push({ book: reading.book, chapter: ch })
      }
    } else if (reading.chapter) {
      chaptersToAdd.push({ book: reading.book, chapter: reading.chapter })
    }
  })

  return chaptersToAdd
}

/**
 * Clear current plan (for new start)
 */
export const clearCurrentPlan = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing plan:', error)
  }
}

/**
 * Calculate statistics for display
 * @param {Object} state - Current state
 * @returns {Object} Statistics object
 */
export const calculateStats = (state) => {
  if (!state) {
    return {
      progress: 0,
      readingsCompleted: 0,
      totalReadings: 365,
      daysActive: 0,
      startDate: null,
      pauseDate: null,
      isActive: false,
      daysAhead: 0,
      daysBehind: 0,
      isOnTrack: true,
      expectedReadings: 0,
      hasStarted: false
    }
  }

  const progress = Math.round((state.completedReadings.length / 365) * 100)
  const actualReadings = state.completedReadings.length

  // Calculate on-track status (1 reading per day expected)
  let daysAhead = 0
  let daysBehind = 0
  let isOnTrack = true
  let expectedReadings = 0

  if (state.startDate && state.active) {
    const start = new Date(state.startDate)
    const today = new Date()
    const daysSinceStart = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1 // +1 to include start day

    // Expected: 1 reading per day
    expectedReadings = Math.min(daysSinceStart, 365)

    // Calculate difference (positive = ahead, negative = behind)
    const difference = actualReadings - expectedReadings

    if (difference > 0) {
      daysAhead = difference
      isOnTrack = false
    } else if (difference < 0) {
      daysBehind = Math.abs(difference)
      isOnTrack = false
    } else {
      isOnTrack = true
    }
  }

  // Calculate actual days active (startDate to pauseDate or today)
  let actualDaysActive = 0
  if (state.startDate) {
    const start = new Date(state.startDate)
    const end = state.pauseDate ? new Date(state.pauseDate) : new Date()
    actualDaysActive = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1 // +1 to include start day
  }

  return {
    progress,
    readingsCompleted: state.completedReadings.length,
    totalReadings: 365,
    daysActive: actualDaysActive,
    startDate: state.startDate,
    pauseDate: state.pauseDate,
    isActive: state.active,
    attempt: state.attempt,
    daysAhead,
    daysBehind,
    isOnTrack,
    expectedReadings,
    hasStarted: true
  }
}

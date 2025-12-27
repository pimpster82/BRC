// LocalStorage utility for Bible Reading Companion

import { createQueueItem, enqueueItem } from './syncQueue.js'
import { APP_VERSION } from '../config/version.js'

/**
 * STORAGE KEY PREFIX SYSTEM
 * ========================
 *
 * Prod (1.0.x): No prefix - uses standard keys
 *   bibleCompanion_dailyText, bibleCompanion_weeklyReading, etc.
 *   Shared Firebase DB: prod_completedDates, prod_weeklyReading, etc.
 *
 * Dev (dev0.x): "dev_" prefix - completely isolated
 *   dev_bibleCompanion_dailyText, dev_bibleCompanion_weeklyReading, etc.
 *   Shared Firebase DB: dev_completedDates, dev_weeklyReading, etc.
 *
 * Benefits:
 *   ✓ No code changes needed (handled automatically here)
 *   ✓ Prod unaffected (no modifications)
 *   ✓ Dev completely isolated (different localStorage keys)
 *   ✓ Can share Firebase DB without conflicts
 *   ✓ Easy switching between versions (just use different URLs)
 */

// Determine if running in dev mode
const isDevelopmentMode = APP_VERSION.startsWith('dev')
const STORAGE_PREFIX = isDevelopmentMode ? 'dev_' : ''

if (isDevelopmentMode) {
  console.log('🔧 [DEV MODE] Using storage prefix: dev_')
}

/**
 * Internal helper to get storage key with dev prefix if needed
 * @param {string} baseKey - The base key name (without prefix)
 * @returns {string} - The key with dev prefix if in dev mode
 */
const getStorageKey = (baseKey) => `${STORAGE_PREFIX}${baseKey}`

/**
 * Wrapper functions for localStorage with automatic dev prefix
 * These handle ALL localStorage access for this app
 * Ensures dev and prod never collide in localStorage
 */
const storage = {
  /**
   * Get item from localStorage with automatic dev prefix
   * @param {string} key - The base key name (without dev_ prefix)
   * @returns {string|null} - The stored value or null
   */
  getItem: (key) => {
    const prefixedKey = getStorageKey(key)
    return localStorage.getItem(prefixedKey)
  },

  /**
   * Set item in localStorage with automatic dev prefix
   * @param {string} key - The base key name (without dev_ prefix)
   * @param {string} value - The value to store
   */
  setItem: (key, value) => {
    const prefixedKey = getStorageKey(key)
    localStorage.setItem(prefixedKey, value)
  },

  /**
   * Remove item from localStorage with automatic dev prefix
   * @param {string} key - The base key name (without dev_ prefix)
   */
  removeItem: (key) => {
    const prefixedKey = getStorageKey(key)
    localStorage.removeItem(prefixedKey)
  }
}

/**
 * Export wrapper as module-level function for backwards compatibility
 * Allows: localStorage.getItem → storage.getItem
 */
export { storage as wrappedStorage }

const STORAGE_KEYS = {
  DAILY_TEXT: getStorageKey('bibleCompanion_dailyText'),
  WEEKLY_READING: getStorageKey('bibleCompanion_weeklyReading'),
  PERSONAL_READING: getStorageKey('bibleCompanion_personalReading'),
  SCHEDULE_PREFIX: getStorageKey('bibleCompanion_schedule_'),
  YEARTEXT_PREFIX: getStorageKey('bibleCompanion_yeartext_'),
  PENDING_SYNC_QUEUE: getStorageKey('bibleCompanion_pendingSyncQueue')
}

// Daily Text Storage Functions
export const getDailyTextData = () => {
  const data = localStorage.getItem(STORAGE_KEYS.DAILY_TEXT)
  if (!data) {
    return {
      completedDates: [],
      currentStreak: 0,
      longestStreak: 0
    }
  }
  try {
    const parsed = JSON.parse(data)
    // Ensure all required fields exist (defensive against corrupted data)
    return {
      completedDates: Array.isArray(parsed.completedDates) ? parsed.completedDates : [],
      currentStreak: typeof parsed.currentStreak === 'number' ? parsed.currentStreak : 0,
      longestStreak: typeof parsed.longestStreak === 'number' ? parsed.longestStreak : 0
    }
  } catch (error) {
    console.warn('⚠️ Corrupted daily text data in localStorage, resetting:', error)
    return {
      completedDates: [],
      currentStreak: 0,
      longestStreak: 0
    }
  }
}

export const saveDailyTextData = (data) => {
  localStorage.setItem(STORAGE_KEYS.DAILY_TEXT, JSON.stringify(data))
}

// Internal: Update daily text without queue (for queue replay)
// Exported for use in queue processing
export const _updateDailyTextInternal = (date, isComplete) => {
  const data = getDailyTextData()
  const dateStr = date || getTodayDateString()
  const isCurrentlyComplete = data.completedDates.includes(dateStr)

  if (isComplete && !isCurrentlyComplete) {
    // Mark complete
    data.completedDates.push(dateStr)
    data.completedDates.sort()
  } else if (!isComplete && isCurrentlyComplete) {
    // Unmark complete
    data.completedDates = data.completedDates.filter(d => d !== dateStr)
  } else {
    // Already in desired state
    return data
  }

  // Calculate streak and set timestamp
  data.currentStreak = calculateStreak(data.completedDates)
  data.lastUpdated = Date.now()
  saveDailyTextData(data)

  return data
}

export const markDailyTextComplete = (date) => {
  const data = getDailyTextData()
  const dateStr = date || getTodayDateString()

  // Add date if not already completed
  if (!data.completedDates.includes(dateStr)) {
    // PHASE 3: Add to sync queue for multi-device offline sync
    const queue = getPendingSyncQueue()
    const queueItem = createQueueItem('daily', 'mark_complete', { date: dateStr })
    const updatedQueue = enqueueItem(queue, queueItem)
    savePendingSyncQueue(updatedQueue)

    // Apply locally
    return _updateDailyTextInternal(dateStr, true)
  }

  return data
}

export const unmarkDailyTextComplete = (date) => {
  const data = getDailyTextData()
  const dateStr = date || getTodayDateString()

  // Only process if date is actually marked
  if (data.completedDates.includes(dateStr)) {
    // PHASE 3: Add to sync queue for multi-device offline sync
    const queue = getPendingSyncQueue()
    const queueItem = createQueueItem('daily', 'unmark_complete', { date: dateStr })
    const updatedQueue = enqueueItem(queue, queueItem)
    savePendingSyncQueue(updatedQueue)

    // Apply locally
    return _updateDailyTextInternal(dateStr, false)
  }

  return data
}

export const isDailyTextComplete = (date) => {
  const data = getDailyTextData()
  const dateStr = date || getTodayDateString()
  return data.completedDates.includes(dateStr)
}

// Helper Functions
export const getTodayDateString = () => {
  const today = new Date()
  return formatDateString(today)
}

export const formatDateString = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const calculateStreak = (completedDates) => {
  if (completedDates.length === 0) return 0

  // Sort dates in descending order
  const sortedDates = [...completedDates].sort().reverse()

  let streak = 0
  const today = new Date()
  let checkDate = new Date(today)

  // Check if today is completed
  const todayStr = formatDateString(today)
  if (sortedDates[0] === todayStr) {
    streak = 1
    checkDate.setDate(checkDate.getDate() - 1)
  } else {
    // Check if yesterday was completed (streak can continue)
    checkDate.setDate(checkDate.getDate() - 1)
    const yesterdayStr = formatDateString(checkDate)
    if (sortedDates[0] !== yesterdayStr) {
      return 0 // Streak broken
    }
    streak = 1
    checkDate.setDate(checkDate.getDate() - 1)
  }

  // Count consecutive days backwards
  for (let i = 1; i < sortedDates.length; i++) {
    const expectedDate = formatDateString(checkDate)
    if (sortedDates[i] === expectedDate) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

export const getFormattedDate = (date) => {
  const dateObj = date ? new Date(date) : new Date()
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return dateObj.toLocaleDateString('en-US', options)
}

// Weekly Reading Storage Functions
export const getWeeklyReadingData = () => {
  const data = localStorage.getItem(STORAGE_KEYS.WEEKLY_READING)
  if (!data) {
    return {
      completedWeeks: [],
      currentMeetingDay: 0
    }
  }
  try {
    const parsed = JSON.parse(data)
    return {
      completedWeeks: Array.isArray(parsed.completedWeeks) ? parsed.completedWeeks : [],
      currentMeetingDay: typeof parsed.currentMeetingDay === 'number' ? parsed.currentMeetingDay : 0
    }
  } catch (error) {
    console.warn('⚠️ Corrupted weekly reading data in localStorage, resetting:', error)
    return {
      completedWeeks: [],
      currentMeetingDay: 0
    }
  }
}

export const saveWeeklyReadingData = (data) => {
  localStorage.setItem(STORAGE_KEYS.WEEKLY_READING, JSON.stringify(data))
}

// Personal Reading Storage Functions
export const getPersonalReadingData = () => {
  const data = localStorage.getItem(STORAGE_KEYS.PERSONAL_READING)
  if (!data) {
    return {
      chaptersRead: [],
      thematicTopicsRead: [],
      selectedPlan: 'free'
    }
  }
  try {
    const parsed = JSON.parse(data)
    return {
      chaptersRead: Array.isArray(parsed.chaptersRead) ? parsed.chaptersRead : [],
      thematicTopicsRead: Array.isArray(parsed.thematicTopicsRead) ? parsed.thematicTopicsRead : [],
      selectedPlan: typeof parsed.selectedPlan === 'string' ? parsed.selectedPlan : 'free'
    }
  } catch (error) {
    console.warn('⚠️ Corrupted personal reading data in localStorage, resetting:', error)
    return {
      chaptersRead: [],
      thematicTopicsRead: [],
      selectedPlan: 'free'
    }
  }
}

export const savePersonalReadingData = (data) => {
  localStorage.setItem(STORAGE_KEYS.PERSONAL_READING, JSON.stringify(data))
}

/**
 * Mark a thematic topic as read
 * @param {number} topicId - The topic ID from thematic-topics.js
 * @returns {Object} Updated personal reading data
 */
export const markThematicTopicComplete = (topicId) => {
  const data = getPersonalReadingData()

  if (!data.thematicTopicsRead.includes(topicId)) {
    data.thematicTopicsRead.push(topicId)
  }

  savePersonalReadingData(data)
  return data
}

/**
 * Unmark a thematic topic as read
 * @param {number} topicId - The topic ID from thematic-topics.js
 * @returns {Object} Updated personal reading data
 */
export const unmarkThematicTopicComplete = (topicId) => {
  const data = getPersonalReadingData()

  data.thematicTopicsRead = data.thematicTopicsRead.filter(id => id !== topicId)

  savePersonalReadingData(data)
  return data
}

/**
 * Check if a thematic topic is marked as read
 * @param {number} topicId - The topic ID from thematic-topics.js
 * @returns {boolean} Whether the topic has been marked as read
 */
export const isThematicTopicComplete = (topicId) => {
  const data = getPersonalReadingData()
  return data.thematicTopicsRead.includes(topicId)
}

/**
 * Get progress for thematic plan
 * @returns {Object} { completed: number, total: number, percentage: number }
 */
export const getThematicProgress = () => {
  const data = getPersonalReadingData()
  // We'll calculate total from thematicTopics which has 17 total topics
  const total = 17 // From thematic-topics.js
  const completed = data.thematicTopicsRead.length

  return {
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0
  }
}

// Schedule Storage Functions (Local Cache)
export const getScheduleFromCache = (year) => {
  const key = `${STORAGE_KEYS.SCHEDULE_PREFIX}${year}`
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : null
}

export const saveScheduleToCache = (year, weeklySchedule) => {
  const key = `${STORAGE_KEYS.SCHEDULE_PREFIX}${year}`
  localStorage.setItem(key, JSON.stringify(weeklySchedule))
}

export const deleteScheduleFromCache = (year) => {
  const key = `${STORAGE_KEYS.SCHEDULE_PREFIX}${year}`
  localStorage.removeItem(key)
}

export const getCachedScheduleYears = () => {
  const years = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(STORAGE_KEYS.SCHEDULE_PREFIX)) {
      const year = parseInt(key.replace(STORAGE_KEYS.SCHEDULE_PREFIX, ''))
      if (!isNaN(year)) {
        years.push(year)
      }
    }
  }
  return years.sort((a, b) => b - a)
}

// Yeartext Storage Functions (Local Cache)
export const getYeartextFromCache = (year) => {
  const key = `${STORAGE_KEYS.YEARTEXT_PREFIX}${year}`
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : null
}

export const saveYeartextToCache = (year, yeartextData) => {
  const key = `${STORAGE_KEYS.YEARTEXT_PREFIX}${year}`
  localStorage.setItem(key, JSON.stringify(yeartextData))
}

export const deleteYeartextFromCache = (year) => {
  const key = `${STORAGE_KEYS.YEARTEXT_PREFIX}${year}`
  localStorage.removeItem(key)
}

export const getCachedYeartextYears = () => {
  const years = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(STORAGE_KEYS.YEARTEXT_PREFIX)) {
      const year = parseInt(key.replace(STORAGE_KEYS.YEARTEXT_PREFIX, ''))
      if (!isNaN(year)) {
        years.push(year)
      }
    }
  }
  return years.sort((a, b) => b - a)
}

/**
 * PHASE 3: Firebase Sync Functions
 * These functions sync user progress to Firebase Realtime Database
 * They require the user to be authenticated (userId from auth.currentUser.uid)
 */

/**
 * Sync daily text progress to Firebase
 * Called when user marks daily text complete/incomplete or on logout
 *
 * @param {string} userId - Firebase user ID
 * @returns {Promise<Object>} The synced data
 */
export const syncDailyTextToFirebase = async (userId) => {
  if (!userId) {
    console.warn('⚠️ Cannot sync daily text: no userId provided')
    return null
  }

  try {
    const { saveUserProgress } = await import('./userProgress.js')
    const dailyData = getDailyTextData()
    await saveUserProgress(userId, 'daily', dailyData)
    return dailyData
  } catch (error) {
    console.error('✗ Failed to sync daily text to Firebase:', error)
    throw error
  }
}

/**
 * Sync weekly reading progress to Firebase
 *
 * @param {string} userId - Firebase user ID
 * @returns {Promise<Object>} The synced data
 */
export const syncWeeklyReadingToFirebase = async (userId) => {
  if (!userId) {
    console.warn('⚠️ Cannot sync weekly reading: no userId provided')
    return null
  }

  try {
    const { saveUserProgress } = await import('./userProgress.js')
    const weeklyData = getWeeklyReadingData()
    await saveUserProgress(userId, 'weekly', weeklyData)
    return weeklyData
  } catch (error) {
    console.error('✗ Failed to sync weekly reading to Firebase:', error)
    throw error
  }
}

/**
 * Sync personal reading progress to Firebase
 *
 * @param {string} userId - Firebase user ID
 * @returns {Promise<Object>} The synced data
 */
export const syncPersonalReadingToFirebase = async (userId) => {
  if (!userId) {
    console.warn('⚠️ Cannot sync personal reading: no userId provided')
    return null
  }

  try {
    const { saveUserProgress } = await import('./userProgress.js')
    const personalData = getPersonalReadingData()
    await saveUserProgress(userId, 'personal', personalData)
    return personalData
  } catch (error) {
    console.error('✗ Failed to sync personal reading to Firebase:', error)
    throw error
  }
}

/**
 * Sync ALL progress sections to Firebase at once
 * Useful for logout or batch sync
 *
 * @param {string} userId - Firebase user ID
 * @returns {Promise<Object>} All synced data sections
 */
export const syncAllProgressToFirebase = async (userId) => {
  if (!userId) {
    console.warn('⚠️ Cannot sync progress: no userId provided')
    return null
  }

  try {
    console.log(`ℹ️ Syncing all progress for user ${userId} to Firebase...`)
    const results = await Promise.all([
      syncDailyTextToFirebase(userId),
      syncWeeklyReadingToFirebase(userId),
      syncPersonalReadingToFirebase(userId)
    ])

    console.log('✓ All progress synced to Firebase')
    return {
      daily: results[0],
      weekly: results[1],
      personal: results[2]
    }
  } catch (error) {
    console.error('✗ Failed to sync all progress:', error)
    throw error
  }
}

/**
 * Load and merge user progress from Firebase
 * Uses timestamp-based merge logic (newest wins)
 * Called on login to sync device progress
 *
 * @param {string} userId - Firebase user ID
 * @returns {Promise<Object>} Merged progress { daily, weekly, personal }
 */
/**
 * Get the week start date for the current week (based on meeting day)
 * Used to match against completedWeeks when reconstructing weeklyReading_current
 * @returns {string} Date string in format YYYY-MM-DD
 */
const getCurrentWeekStart = () => {
  // Get test date from localStorage if set
  const savedTestDate = localStorage.getItem('testDate')
  const checkDate = savedTestDate ? new Date(savedTestDate) : new Date()

  // Get meeting day from settings
  const meetingDay = parseInt(localStorage.getItem('settings_meetingDay') || '1')

  // Calculate week start based on meeting day
  const currentDay = checkDate.getDay()
  let daysBack = (currentDay - meetingDay + 7) % 7

  const weekStartDate = new Date(checkDate)
  weekStartDate.setDate(weekStartDate.getDate() - daysBack)

  // Format as YYYY-MM-DD
  const year = weekStartDate.getFullYear()
  const month = String(weekStartDate.getMonth() + 1).padStart(2, '0')
  const day = String(weekStartDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Reconstruct weeklyReading_current from Firebase completedWeeks data
 * When syncing from Firebase, we need to rebuild the current week's chapter details
 * @param {Object} weeklyData - The merged weekly data from Firebase
 * @returns {void} Saves to localStorage
 */
const reconstructWeeklyReadingCurrent = (weeklyData) => {
  if (!weeklyData || !weeklyData.completedWeeks || weeklyData.completedWeeks.length === 0) {
    console.log('   No completed weeks in Firebase data, skipping reconstruction')
    return
  }

  const currentWeekStart = getCurrentWeekStart()
  console.log(`   Reconstructing weeklyReading_current for week starting: ${currentWeekStart}`)

  // Find the current week in completedWeeks
  const currentWeekData = weeklyData.completedWeeks.find(week => week.weekStart === currentWeekStart)

  if (currentWeekData && currentWeekData.chapters) {
    const reconstructed = {
      weekStart: currentWeekStart,
      chaptersRead: currentWeekData.chapters
    }
    localStorage.setItem('weeklyReading_current', JSON.stringify(reconstructed))
    console.log(`   ✓ Reconstructed weeklyReading_current:`, reconstructed)
  } else {
    console.log(`   No matching week found in completedWeeks for ${currentWeekStart}`)
  }
}

export const loadProgressFromFirebase = async (userId) => {
  if (!userId) {
    console.warn('⚠️ Cannot load progress: no userId provided')
    return null
  }

  try {
    const { loadAllUserProgress, mergeProgress } = await import('./userProgress.js')

    console.log(`ℹ️ Loading and merging progress for user ${userId} from Firebase...`)

    // Load from Firebase
    const firebaseProgress = await loadAllUserProgress(userId)
    console.log(`   Firebase data:`, firebaseProgress)

    // Get current local data
    const localDaily = getDailyTextData()
    const localWeekly = getWeeklyReadingData()
    const localPersonal = getPersonalReadingData()

    console.log(`   Local weekly before merge:`, localWeekly)
    console.log(`   Firebase weekly:`, firebaseProgress?.weekly)

    // Merge using timestamp logic (last-write-wins)
    const mergedDaily = mergeProgress(localDaily, firebaseProgress?.daily)
    const mergedWeekly = mergeProgress(localWeekly, firebaseProgress?.weekly)
    const mergedPersonal = mergeProgress(localPersonal, firebaseProgress?.personal)

    console.log(`   Merged weekly after merge:`, mergedWeekly)

    // Save merged data back to localStorage
    if (mergedDaily) saveDailyTextData(mergedDaily)
    if (mergedWeekly) saveWeeklyReadingData(mergedWeekly)
    if (mergedPersonal) savePersonalReadingData(mergedPersonal)

    // IMPORTANT: Reconstruct weeklyReading_current from the merged weekly data
    // This is critical for multi-device sync to work!
    if (mergedWeekly) {
      reconstructWeeklyReadingCurrent(mergedWeekly)
    }

    console.log('✓ Progress merged and saved to localStorage')
    console.log('✓ weeklyReading_current reconstructed from Firebase data')

    return {
      daily: mergedDaily,
      weekly: mergedWeekly,
      personal: mergedPersonal
    }
  } catch (error) {
    console.error('✗ Failed to load progress from Firebase:', error)
    // Don't throw - graceful degradation (use local data only)
    return null
  }
}

// ==================== Sync Queue Functions (Phase 3) ====================

/**
 * Get pending sync queue from localStorage
 * @returns {Array} Queue items
 */
export const getPendingSyncQueue = () => {
  const data = localStorage.getItem(STORAGE_KEYS.PENDING_SYNC_QUEUE)
  if (!data) {
    return []
  }
  try {
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn('⚠️ Corrupted sync queue data in localStorage, resetting:', error)
    return []
  }
}

/**
 * Save sync queue to localStorage
 * @param {Array} queue - Queue items
 */
export const savePendingSyncQueue = (queue) => {
  if (!Array.isArray(queue)) queue = []
  localStorage.setItem(STORAGE_KEYS.PENDING_SYNC_QUEUE, JSON.stringify(queue))
}

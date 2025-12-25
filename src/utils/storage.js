// LocalStorage utility for Bible Reading Companion

const STORAGE_KEYS = {
  DAILY_TEXT: 'bibleCompanion_dailyText',
  WEEKLY_READING: 'bibleCompanion_weeklyReading',
  PERSONAL_READING: 'bibleCompanion_personalReading',
  SCHEDULE_PREFIX: 'bibleCompanion_schedule_',
  YEARTEXT_PREFIX: 'bibleCompanion_yeartext_'
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

export const markDailyTextComplete = (date) => {
  const data = getDailyTextData()
  const dateStr = date || getTodayDateString()

  // Add date if not already completed
  if (!data.completedDates.includes(dateStr)) {
    data.completedDates.push(dateStr)
    data.completedDates.sort()

    // Calculate streak
    data.currentStreak = calculateStreak(data.completedDates)

    saveDailyTextData(data)
  }

  return data
}

export const unmarkDailyTextComplete = (date) => {
  const data = getDailyTextData()
  const dateStr = date || getTodayDateString()

  // Remove date from completed dates
  data.completedDates = data.completedDates.filter(d => d !== dateStr)

  // Recalculate streak
  data.currentStreak = calculateStreak(data.completedDates)

  saveDailyTextData(data)
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
      selectedPlan: 'free'
    }
  }
  try {
    const parsed = JSON.parse(data)
    return {
      chaptersRead: Array.isArray(parsed.chaptersRead) ? parsed.chaptersRead : [],
      selectedPlan: typeof parsed.selectedPlan === 'string' ? parsed.selectedPlan : 'free'
    }
  } catch (error) {
    console.warn('⚠️ Corrupted personal reading data in localStorage, resetting:', error)
    return {
      chaptersRead: [],
      selectedPlan: 'free'
    }
  }
}

export const savePersonalReadingData = (data) => {
  localStorage.setItem(STORAGE_KEYS.PERSONAL_READING, JSON.stringify(data))
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

    // Get current local data
    const localDaily = getDailyTextData()
    const localWeekly = getWeeklyReadingData()
    const localPersonal = getPersonalReadingData()

    // Merge using timestamp logic (last-write-wins)
    const mergedDaily = mergeProgress(localDaily, firebaseProgress?.daily)
    const mergedWeekly = mergeProgress(localWeekly, firebaseProgress?.weekly)
    const mergedPersonal = mergeProgress(localPersonal, firebaseProgress?.personal)

    // Save merged data back to localStorage
    if (mergedDaily) saveDailyTextData(mergedDaily)
    if (mergedWeekly) saveWeeklyReadingData(mergedWeekly)
    if (mergedPersonal) savePersonalReadingData(mergedPersonal)

    console.log('✓ Progress merged and saved to localStorage')

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

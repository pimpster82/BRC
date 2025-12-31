// Weekly Bible Reading Schedule - Dynamic Loader
// Loads schedules only when needed (lazy loading)
// Reduces initial bundle size and startup time

// Import Firebase cache utilities
import { getScheduleFromCache } from '../src/utils/storage'
import { loadScheduleFromFirebase } from '../src/utils/firebaseSchedules'

// Map of available schedule years (only what's available locally)
// This will be populated dynamically based on what files exist
const AVAILABLE_SCHEDULES = {
  2023: true,
  2024: true,
  2025: true,
  // New years will be added when user imports via Settings
  // Or detected automatically from the file system
}

// Cache for loaded schedules to avoid re-loading
const scheduleCache = {}

/**
 * Dynamically load a schedule file
 * Tries multiple sources (in priority order):
 * 1. In-memory cache (fastest)
 * 2. LocalStorage cache (from previous Firebase save)
 * 3. Firebase Realtime Database (admin-published schedules)
 * 4. Dynamic import from data files (offline fallback)
 *
 * @param {number} year - The year to load
 * @returns {Promise<Array>} - Weekly schedule array, or null if not available
 */
export const loadScheduleForYear = async (year) => {
  // 1. Check in-memory cache first (fastest)
  if (scheduleCache[year]) {
    return scheduleCache[year]
  }

  // 2. Check localStorage cache (saved from Firebase)
  try {
    const cachedSchedule = getScheduleFromCache(year)
    if (cachedSchedule && Array.isArray(cachedSchedule)) {
      // Cache it in memory
      scheduleCache[year] = cachedSchedule
      if (!AVAILABLE_SCHEDULES[year]) {
        AVAILABLE_SCHEDULES[year] = true
        console.log(`✓ Schedule for year ${year} loaded from local cache`)
      }
      return cachedSchedule
    }
  } catch (error) {
    console.warn(`Error loading schedule from cache: ${error.message}`)
  }

  // 3. Try to load from Firebase (admin-published schedules)
  try {
    const result = await loadScheduleFromFirebase(year)
    if (result.success && result.schedule) {
      const schedule = result.schedule
      // Cache it in memory
      scheduleCache[year] = schedule
      if (!AVAILABLE_SCHEDULES[year]) {
        AVAILABLE_SCHEDULES[year] = true
        console.log(`✓ Schedule for year ${year} loaded from Firebase`)
      }
      return schedule
    }
  } catch (error) {
    console.warn(`⚠️ Error loading from Firebase: ${error.message}`)
  }

  // 4. Try to dynamically import the schedule file (legacy/offline fallback)
  try {
    const module = await import(`./weekly-reading-schedule-${year}.js`)
    const schedule = module[`weeklyReadingSchedule${year}`] || module.default

    // Cache it
    scheduleCache[year] = schedule

    // Mark it as available if it wasn't already
    if (!AVAILABLE_SCHEDULES[year]) {
      AVAILABLE_SCHEDULES[year] = true
      console.log(`✓ Schedule for year ${year} found and loaded from fallback data files`)
    }

    return schedule
  } catch (error) {
    console.warn(`⚠️ Schedule for year ${year} not found anywhere. User can import via Settings.`)
    return null
  }
}

/**
 * Get schedule for a specific year (synchronous if cached, async if not)
 * @param {number} year - The year (e.g., 2026)
 * @returns {Array|null} - Weekly schedule for that year, or null if not available
 */
export const getScheduleForYear = (year) => {
  // Return from cache if available
  if (scheduleCache[year]) {
    return scheduleCache[year]
  }

  // If not in cache and not marked as available, return null
  if (!AVAILABLE_SCHEDULES[year]) {
    return null
  }

  // If marked as available but not loaded, we need async loading
  // This shouldn't happen in normal flow - use loadScheduleForYear instead
  console.warn(`Schedule for ${year} marked as available but not loaded. Use loadScheduleForYear() for async loading.`)
  return null
}

/**
 * Get all available years (locally available)
 * @returns {Array<number>} - List of years with available schedules (sorted)
 */
export const getAvailableYears = () => {
  return Object.keys(AVAILABLE_SCHEDULES)
    .filter(year => AVAILABLE_SCHEDULES[year])
    .map(Number)
    .sort((a, b) => a - b)
}

/**
 * Check if a year is available locally
 * @param {number} year - The year to check
 * @returns {boolean} - True if schedule exists for this year
 */
export const isYearAvailable = (year) => {
  return AVAILABLE_SCHEDULES[year] === true
}

/**
 * Register a newly imported schedule (called after user imports via Settings)
 * @param {number} year - The year being added
 * @param {Array} schedule - The schedule data array
 */
export const registerSchedule = (year, schedule) => {
  AVAILABLE_SCHEDULES[year] = true
  scheduleCache[year] = schedule
  console.log(`Schedule for year ${year} registered successfully`)
}

/**
 * Check if a year's schedule needs to be imported
 * @param {number} year - The year to check
 * @returns {boolean} - True if schedule is not available
 */
export const needsScheduleImport = (year) => {
  return AVAILABLE_SCHEDULES[year] !== true
}

/**
 * Get current week's reading based on meeting day (SYNCHRONOUS - must be called after schedule is loaded)
 * @param {number} meetingDay - Day of week (0=Sunday, 1=Monday, etc.)
 * @param {Date} date - Optional date to check (defaults to today)
 * @returns {Object|null} - Current week's reading schedule, or null if not found
 */
export const getCurrentWeekReading = (meetingDay = 1, date = null) => {
  // Use provided date or today
  const checkDate = date ? new Date(date) : new Date()
  checkDate.setHours(0, 0, 0, 0)

  // Find the NEXT meeting day (when to prepare for next meeting)
  const todayDayOfWeek = checkDate.getDay()
  let daysUntilNextMeeting

  if (todayDayOfWeek < meetingDay) {
    // Meeting day is still coming this week
    daysUntilNextMeeting = meetingDay - todayDayOfWeek
  } else if (todayDayOfWeek > meetingDay) {
    // Meeting day already passed, it's in the next week
    daysUntilNextMeeting = 7 - todayDayOfWeek + meetingDay
  } else {
    // Today IS the meeting day
    daysUntilNextMeeting = 0
  }

  const nextMeetingDate = new Date(checkDate)
  nextMeetingDate.setDate(checkDate.getDate() + daysUntilNextMeeting)

  // Use the year of the NEXT MEETING to determine which schedule to load
  // This fixes the year-boundary bug when meeting crosses into new year
  const targetYear = nextMeetingDate.getFullYear()

  // Try target year first (MUST be cached already)
  let schedule = scheduleCache[targetYear]

  // If not found, try next year (for end-of-year transitions)
  if (!schedule) {
    schedule = scheduleCache[targetYear + 1]
  }

  // If still no schedule, try previous year (for beginning-of-year)
  if (!schedule) {
    schedule = scheduleCache[targetYear - 1]
  }

  if (!schedule || schedule.length === 0) {
    console.warn(`No schedule available for year ${targetYear} in cache. Schedule must be loaded first via loadScheduleForYear()`)
    return null
  }

  // Find which schedule week this next meeting date falls into
  for (const week of schedule) {
    const scheduleStart = new Date(week.weekStart)
    scheduleStart.setHours(0, 0, 0, 0)

    const scheduleEnd = new Date(week.weekEnd)
    scheduleEnd.setHours(23, 59, 59, 999)

    // Check if the next meeting day falls within this schedule period
    if (nextMeetingDate >= scheduleStart && nextMeetingDate <= scheduleEnd) {
      return week
    }
  }

  console.warn('No matching week found for date:', checkDate.toISOString(), 'Next meeting:', nextMeetingDate.toISOString())
  return null
}

/**
 * Get reading by specific date (SYNCHRONOUS - must be called after schedule is loaded)
 * @param {Date|string} date - The date to look up
 * @returns {Object|null} - Week's reading for that date, or null
 */
export const getReadingByDate = (date) => {
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)

  const year = targetDate.getFullYear()
  const schedule = scheduleCache[year]

  if (!schedule || schedule.length === 0) {
    return null
  }

  for (const week of schedule) {
    const weekStart = new Date(week.weekStart)
    const weekEnd = new Date(week.weekEnd)

    if (targetDate >= weekStart && targetDate <= weekEnd) {
      return week
    }
  }

  return null
}

/**
 * Format week range for display
 * @param {string} weekStart - ISO date string (YYYY-MM-DD)
 * @param {string} weekEnd - ISO date string (YYYY-MM-DD)
 * @param {string} locale - Locale for formatting (default: 'de-DE')
 * @returns {string} - Formatted week range (e.g., "1. Dez - 7. Dez")
 */
export const formatWeekRange = (weekStart, weekEnd, locale = 'de-DE') => {
  const start = new Date(weekStart)
  const end = new Date(weekEnd)

  const options = { day: 'numeric', month: 'short' }
  const startStr = start.toLocaleDateString(locale, options)
  const endStr = end.toLocaleDateString(locale, options)

  return `${startStr} - ${endStr}`
}

export default {
  loadScheduleForYear,
  getScheduleForYear,
  getAvailableYears,
  isYearAvailable,
  needsScheduleImport,
  registerSchedule,
  getCurrentWeekReading,
  getReadingByDate,
  formatWeekRange
}

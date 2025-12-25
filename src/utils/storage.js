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
      currentStreak: 0
    }
  }
  return JSON.parse(data)
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

// Weekly Reading Storage Functions (placeholder for future)
export const getWeeklyReadingData = () => {
  const data = localStorage.getItem(STORAGE_KEYS.WEEKLY_READING)
  return data ? JSON.parse(data) : { completedWeeks: [] }
}

export const saveWeeklyReadingData = (data) => {
  localStorage.setItem(STORAGE_KEYS.WEEKLY_READING, JSON.stringify(data))
}

// Personal Reading Storage Functions (placeholder for future)
export const getPersonalReadingData = () => {
  const data = localStorage.getItem(STORAGE_KEYS.PERSONAL_READING)
  return data ? JSON.parse(data) : { chaptersRead: [] }
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

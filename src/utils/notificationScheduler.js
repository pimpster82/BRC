/**
 * Notification Scheduler
 * Manages local notification alarms for Bible Reading Companion
 *
 * This scheduler:
 * - Calculates next notification times based on user settings
 * - Manages timers for local notifications
 * - Handles permission requests
 * - Integrates with Service Worker for background notifications
 */

import { t } from '../config/i18n'

/**
 * Get enabled notification settings
 * @returns {Object} Notification settings from localStorage
 */
export const getNotificationSettings = () => {
  return {
    masterSwitch: localStorage.getItem('settings_notificationMasterSwitch') !== 'false',
    dailyText: {
      enabled: localStorage.getItem('settings_notification_dailyText') !== 'false',
      time: localStorage.getItem('settings_notification_dailyTextTime') || '08:00'
    },
    weeklyReading: {
      enabled: localStorage.getItem('settings_notification_weeklyReading') !== 'false',
      time: localStorage.getItem('settings_notification_weeklyReadingTime') || '10:00'
    },
    personalReading: {
      enabled: localStorage.getItem('settings_notification_personalReading') !== 'false',
      time: localStorage.getItem('settings_notification_personalReadingTime') || '12:00'
    },
    streakPreservation: {
      enabled: localStorage.getItem('settings_notification_streakPreservation') !== 'false',
      time: '18:00' // Fixed time
    },
    encouragementMessages: {
      enabled: localStorage.getItem('settings_notification_encouragementMessages') !== 'false'
    }
  }
}

/**
 * Parse time string (HH:MM) to minutes since midnight
 * @param {string} timeStr - Time in format "HH:MM"
 * @returns {number} Minutes since midnight
 */
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Get minutes until next alarm time
 * @param {string} alarmTime - Alarm time in format "HH:MM"
 * @returns {number} Milliseconds until alarm time
 */
export const getTimeUntilAlarm = (alarmTime) => {
  const now = new Date()
  const alarmMinutes = timeToMinutes(alarmTime)
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  let minutesUntil = alarmMinutes - currentMinutes

  if (minutesUntil <= 0) {
    // Alarm time has passed, schedule for tomorrow
    minutesUntil += 24 * 60
  }

  return minutesUntil * 60 * 1000 // Convert to milliseconds
}

/**
 * Request notification permission from user
 * @returns {Promise<boolean>} Permission granted
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported in this browser')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

/**
 * Get current notification permission status
 * @returns {string} 'granted', 'denied', 'default', or 'unsupported'
 */
export const getNotificationPermission = () => {
  if (!('Notification' in window)) {
    return 'unsupported'
  }
  return Notification.permission
}

/**
 * Show a local notification
 * @param {Object} options - Notification options
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body
 * @param {string} options.icon - Icon URL
 * @param {string} options.tag - Notification tag (prevents duplicates)
 * @param {Object} options.data - Custom data
 */
export const showLocalNotification = (options) => {
  const {
    title,
    body,
    icon = '/icons/icon-light-192.png',
    tag = 'default',
    data = {}
  } = options

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    // Use service worker to show notification
    navigator.serviceWorker.controller.postMessage({
      type: 'SHOW_NOTIFICATION',
      title,
      body,
      icon,
      tag,
      data
    })
  } else if ('Notification' in window && Notification.permission === 'granted') {
    // Fallback to direct notification
    new Notification(title, {
      body,
      icon,
      tag,
      data
    })
  }
}

/**
 * Schedule a notification alarm
 * @param {string} type - Notification type (daily_text, weekly_reading, etc.)
 * @param {string} alarmTime - Alarm time in "HH:MM" format
 * @param {Function} callback - Function to call when alarm triggers
 * @returns {number} Timeout ID
 */
export const scheduleNotification = (type, alarmTime, callback) => {
  const timeUntilAlarm = getTimeUntilAlarm(alarmTime)

  console.log(`[Scheduler] ${type} scheduled for ${alarmTime} (in ${Math.round(timeUntilAlarm / 1000 / 60)} minutes)`)

  const timeoutId = setTimeout(() => {
    console.log(`[Scheduler] ${type} alarm triggered!`)
    callback()

    // Reschedule for next day
    scheduleNotification(type, alarmTime, callback)
  }, timeUntilAlarm)

  return timeoutId
}

/**
 * Calculate which reading should appear in next reminder
 * @returns {string|null} Reading description or null
 */
export const getNextReadingForReminder = () => {
  try {
    const personalData = JSON.parse(localStorage.getItem('bibleCompanion_personalReading') || '{}')
    const chaptersRead = personalData.chaptersRead || []
    const selectedPlan = personalData.selectedPlan || 'free'

    if (selectedPlan === 'free') {
      // Get next chapter from Free reading plan
      const { readingCategories } = require('../config/reading-categories')
      const { getBibleBooks } = require('../config/languages')
      const bibleBooks = getBibleBooks()

      if (chaptersRead.length > 0) {
        const lastChapter = chaptersRead[chaptersRead.length - 1]
        const nextChapter = lastChapter.chapter + 1

        if (nextChapter <= 188) { // Max chapters in Free plan
          const book = bibleBooks.find(b => b.number === lastChapter.book)
          return `${book?.name || 'Next Reading'} ${nextChapter}`
        }
      }
    }
    // Other plans can be added here
  } catch (error) {
    console.error('Error calculating next reading:', error)
  }

  return null
}

/**
 * Check if user has active streak
 * @returns {Object} Streak info { current, hasActive, lastDate }
 */
export const getStreakInfo = () => {
  try {
    const dailyData = JSON.parse(localStorage.getItem('bibleCompanion_dailyText') || '{}')
    const completedDates = dailyData.completedDates || []
    const currentStreak = dailyData.currentStreak || 0
    const today = new Date().toISOString().split('T')[0]

    // Check if today is already marked
    const todayMarked = completedDates.includes(today)

    return {
      current: currentStreak,
      hasActive: currentStreak >= 5 && !todayMarked,
      lastDate: completedDates[completedDates.length - 1] || null,
      todayMarked
    }
  } catch (error) {
    console.error('Error getting streak info:', error)
    return { current: 0, hasActive: false, lastDate: null, todayMarked: false }
  }
}

/**
 * Determine if streak reminder should show
 * @returns {boolean} True if reminder should be shown
 */
export const shouldShowStreakReminder = () => {
  const settings = getNotificationSettings()
  if (!settings.masterSwitch || !settings.streakPreservation.enabled) {
    return false
  }

  const streak = getStreakInfo()
  return streak.hasActive
}

/**
 * Trigger all enabled notifications
 * This is called by notificationService periodically
 * @returns {Promise<void>}
 */
export const checkAndShowNotifications = async () => {
  const settings = getNotificationSettings()

  // Check master switch
  if (!settings.masterSwitch) {
    return
  }

  // Check permission
  if (getNotificationPermission() !== 'granted') {
    return
  }

  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  // Daily Text Reminder
  if (settings.dailyText.enabled && currentTime === settings.dailyText.time) {
    showLocalNotification({
      title: t('notification.daily_text_title'),
      body: t('notification.daily_text_body'),
      tag: 'daily_text',
      data: { type: 'daily_text', deeplink: '' }
    })
  }

  // Streak Preservation Reminder
  if (settings.streakPreservation.enabled && currentTime === settings.streakPreservation.time) {
    if (shouldShowStreakReminder()) {
      showLocalNotification({
        title: t('notification.streak_title'),
        body: t('notification.streak_body'),
        tag: 'streak_preservation',
        data: { type: 'streak_preservation', deeplink: '' }
      })
    }
  }

  // Other reminders would be added similarly...
}

export default {
  getNotificationSettings,
  requestNotificationPermission,
  getNotificationPermission,
  showLocalNotification,
  scheduleNotification,
  getNextReadingForReminder,
  getStreakInfo,
  shouldShowStreakReminder,
  checkAndShowNotifications,
  getTimeUntilAlarm
}

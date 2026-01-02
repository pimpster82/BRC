/**
 * Notification Service Orchestrator
 *
 * Manages all notification schedulers:
 * - Daily Text Reminder (configurable time)
 * - Weekly Reading Reminder (configurable time)
 * - Personal Reading Reminder (configurable time)
 * - Streak Preservation Reminder (18:00, conditional on 5+ day streak)
 *
 * Integrates with:
 * - notificationScheduler.js (time-based scheduling)
 * - firebaseMessageTemplates.js (random message templates)
 * - Settings from localStorage
 */

import {
  getNotificationSettings,
  scheduleNotification,
  showLocalNotification,
  getStreakInfo,
  shouldShowStreakReminder
} from './notificationScheduler'
import { getRandomMessage } from './firebaseMessageTemplates'
import { getCurrentLanguage } from '../config/languages'

// Store timeout IDs for cleanup
let scheduledNotifications = {}

/**
 * Check if Daily Text is already completed today
 * @returns {boolean} True if today's date is in completedDates
 */
const isDailyTextCompletedToday = () => {
  try {
    const dailyData = JSON.parse(localStorage.getItem('bibleCompanion_dailyText') || '{}')
    const completedDates = dailyData.completedDates || []
    const today = new Date().toISOString().split('T')[0]
    return completedDates.includes(today)
  } catch (error) {
    console.error('[NotificationService] Error checking daily text completion:', error)
    return false
  }
}

/**
 * Check if Personal Reading was done today
 * @returns {boolean} True if any chapter was read today
 */
const isPersonalReadingDoneToday = () => {
  try {
    const personalData = JSON.parse(localStorage.getItem('bibleCompanion_personalReading') || '{}')
    const chaptersRead = personalData.chaptersRead || []
    const today = new Date().toISOString().split('T')[0]

    // Check if any chapter was marked today
    return chaptersRead.some((chapter) => {
      if (!chapter.timestamp) return false
      const chapterDate = new Date(chapter.timestamp).toISOString().split('T')[0]
      return chapterDate === today
    })
  } catch (error) {
    console.error('[NotificationService] Error checking personal reading completion:', error)
    return false
  }
}

/**
 * Check if we should trigger weekly reading reminder
 * Only trigger on specific days relative to meeting day
 * @returns {boolean} True if it's a good time to show the reminder
 */
const shouldTriggerWeeklyReminder = () => {
  try {
    const weeklyData = JSON.parse(localStorage.getItem('bibleCompanion_weeklyReading') || '{}')
    const meetingDay = parseInt(localStorage.getItem('settings_meetingDay') || '2') // Default Tuesday

    // Get current day of week (0 = Sunday, 6 = Saturday)
    const now = new Date()
    const currentDay = now.getDay()

    // Calculate days until next meeting
    let daysUntilMeeting = (meetingDay - currentDay + 7) % 7
    if (daysUntilMeeting === 0) {
      daysUntilMeeting = 7 // If today is meeting day, next is in 7 days
    }

    // Trigger reminder 2 days before meeting
    // So if meeting is Tuesday (day 2), remind on Sunday (day 0) = 2 days before
    // And also Monday (day 1) = 1 day before (for flexibility)
    const shouldTrigger = daysUntilMeeting >= 1 && daysUntilMeeting <= 2

    if (shouldTrigger) {
      console.log(`[NotificationService] Weekly reminder triggered: ${daysUntilMeeting} days until meeting day ${meetingDay}`)
    }

    return shouldTrigger
  } catch (error) {
    console.error('[NotificationService] Error checking weekly reminder timing:', error)
    return false
  }
}

/**
 * Check if weekly reading is complete for the upcoming week
 * @returns {boolean} True if weekly reading is NOT complete (show reminder), false if complete (skip reminder)
 */
const isWeeklyReadingIncomplete = () => {
  try {
    const weeklyData = JSON.parse(localStorage.getItem('bibleCompanion_weeklyReading') || '{}')
    const completedWeeks = weeklyData.completedWeeks || []

    // Get current week's reading to check
    // The app shows reading for the week containing NEXT meeting day
    const meetingDay = parseInt(localStorage.getItem('settings_meetingDay') || '2')
    const now = new Date()
    const currentDay = now.getDay()

    // Calculate the date of the next meeting
    let daysUntilMeeting = (meetingDay - currentDay + 7) % 7
    if (daysUntilMeeting === 0) {
      daysUntilMeeting = 7
    }
    const nextMeetingDate = new Date(now)
    nextMeetingDate.setDate(nextMeetingDate.getDate() + daysUntilMeeting)
    const nextMeetingWeekStart = new Date(nextMeetingDate)
    nextMeetingWeekStart.setDate(nextMeetingDate.getDate() - meetingDay)
    const weekStartStr = nextMeetingWeekStart.toISOString().split('T')[0]

    // Check if this week is in completedWeeks
    const weekCompleted = completedWeeks.some(week => week.weekStart === weekStartStr)

    // Return TRUE if reading is INCOMPLETE (i.e., NOT in completedWeeks) - so reminder should show
    return !weekCompleted
  } catch (error) {
    console.error('[NotificationService] Error checking weekly reading completion:', error)
    return true // If error, assume incomplete so reminder can show
  }
}

/**
 * Start notification service
 * Schedules all enabled notifications based on user settings
 */
export const startNotificationService = () => {
  const settings = getNotificationSettings()
  const language = getCurrentLanguage()

  // Stop any existing schedules first
  stopNotificationService()

  // Check master switch
  if (!settings.masterSwitch) {
    console.log('[NotificationService] Master switch is OFF - no notifications scheduled')
    return
  }

  // Daily Text Reminder
  if (settings.dailyText.enabled) {
    scheduledNotifications.dailyText = scheduleNotification(
      'daily_text',
      settings.dailyText.time,
      async () => {
        // Only show reminder if not already completed today
        if (!isDailyTextCompletedToday()) {
          const message = await getRandomMessage('daily_text', language)
          showLocalNotification({
            title: message || '📖 Daily Text Reminder',
            body: 'Time to read today\'s text!',
            tag: 'daily_text',
            data: { type: 'daily_text', deeplink: '/' }
          })
        }
      }
    )
  }

  // Weekly Reading Reminder
  if (settings.weeklyReading.enabled) {
    scheduledNotifications.weeklyReading = scheduleNotification(
      'weekly_reading',
      settings.weeklyReading.time,
      async () => {
        // Only show reminder if:
        // 1. Weekly reading is NOT complete for upcoming week
        // 2. We're within 2 days before the meeting day
        if (isWeeklyReadingIncomplete() && shouldTriggerWeeklyReminder()) {
          const message = await getRandomMessage('weekly_reading', language)
          showLocalNotification({
            title: message || '📚 Weekly Reading Reminder',
            body: 'Time for this week\'s Bible reading!',
            tag: 'weekly_reading',
            data: { type: 'weekly_reading', deeplink: '/weekly-reading' }
          })
        }
      }
    )
  }

  // Personal Reading Reminder
  if (settings.personalReading.enabled) {
    scheduledNotifications.personalReading = scheduleNotification(
      'personal_reading',
      settings.personalReading.time,
      async () => {
        // Only show reminder if nothing has been read in PBP today
        if (!isPersonalReadingDoneToday()) {
          const message = await getRandomMessage('personal_reading', language)
          showLocalNotification({
            title: message || '📘 Personal Reading Reminder',
            body: 'Continue your Bible reading journey!',
            tag: 'personal_reading',
            data: { type: 'personal_reading', deeplink: '/personal-reading' }
          })
        }
      }
    )
  }

  // Streak Preservation Reminder (18:00, conditional)
  if (settings.streakPreservation.enabled) {
    scheduledNotifications.streakPreservation = scheduleNotification(
      'streak_preservation',
      settings.streakPreservation.time,
      async () => {
        // Check if streak reminder should show (5+ day streak + nothing logged today)
        if (shouldShowStreakReminder()) {
          const streak = getStreakInfo()
          const message = await getRandomMessage('streak_preservation', language)
          showLocalNotification({
            title: message || '🔥 Keep your streak going!',
            body: `You have a ${streak.current}-day streak. Don't lose it!`,
            tag: 'streak_preservation',
            data: { type: 'streak_preservation', deeplink: '/' }
          })
        }
      }
    )
  }

  console.log('[NotificationService] All notifications scheduled:', Object.keys(scheduledNotifications))
}

/**
 * Stop notification service
 * Clears all scheduled notifications
 */
export const stopNotificationService = () => {
  Object.keys(scheduledNotifications).forEach((key) => {
    clearTimeout(scheduledNotifications[key])
  })
  scheduledNotifications = {}
  console.log('[NotificationService] All notifications stopped')
}

/**
 * Restart notification service
 * Useful when settings change or language changes
 */
export const restartNotificationService = () => {
  console.log('[NotificationService] Restarting...')
  stopNotificationService()
  startNotificationService()
}

export default {
  startNotificationService,
  stopNotificationService,
  restartNotificationService
}

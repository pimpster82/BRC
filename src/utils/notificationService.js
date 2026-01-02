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
        const message = await getRandomMessage('daily_text', language)
        showLocalNotification({
          title: message || '📖 Daily Text Reminder',
          body: 'Time to read today\'s text!',
          tag: 'daily_text',
          data: { type: 'daily_text', deeplink: '/' }
        })
      }
    )
  }

  // Weekly Reading Reminder
  if (settings.weeklyReading.enabled) {
    scheduledNotifications.weeklyReading = scheduleNotification(
      'weekly_reading',
      settings.weeklyReading.time,
      async () => {
        const message = await getRandomMessage('weekly_reading', language)
        showLocalNotification({
          title: message || '📚 Weekly Reading Reminder',
          body: 'Time for this week\'s Bible reading!',
          tag: 'weekly_reading',
          data: { type: 'weekly_reading', deeplink: '/weekly-reading' }
        })
      }
    )
  }

  // Personal Reading Reminder
  if (settings.personalReading.enabled) {
    scheduledNotifications.personalReading = scheduleNotification(
      'personal_reading',
      settings.personalReading.time,
      async () => {
        const message = await getRandomMessage('personal_reading', language)
        showLocalNotification({
          title: message || '📘 Personal Reading Reminder',
          body: 'Continue your Bible reading journey!',
          tag: 'personal_reading',
          data: { type: 'personal_reading', deeplink: '/personal-reading' }
        })
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

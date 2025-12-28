/**
 * reminderService.js - Browser Notifications for Daily Reading Reminders
 *
 * Handles daily reading reminders using Browser Notifications API
 * Features:
 * - Checks reminder time every minute
 * - Sends notification at configured time
 * - Tracks if notification already sent today (prevent duplicates)
 * - Falls back gracefully if notifications disabled
 */

/**
 * Start the reminder service
 * Checks every minute if it's time to send the daily reminder
 * @param {function} onReminderTime - Optional callback when reminder time reached
 */
export const startReminderService = (onReminderTime = null) => {
  // Store interval ID so we can stop it later
  window._reminderServiceInterval = setInterval(() => {
    checkAndSendReminder(onReminderTime)
  }, 60000) // Check every 60 seconds

  // Also check immediately on startup
  checkAndSendReminder(onReminderTime)

  console.log('✓ Reminder service started - checking every 60 seconds')
}

/**
 * Stop the reminder service
 */
export const stopReminderService = () => {
  if (window._reminderServiceInterval) {
    clearInterval(window._reminderServiceInterval)
    delete window._reminderServiceInterval
    console.log('✓ Reminder service stopped')
  }
}

/**
 * Check if it's time to send reminder and send if conditions met
 * @param {function} onReminderTime - Optional callback
 */
const checkAndSendReminder = (onReminderTime = null) => {
  try {
    const dailyReminder = localStorage.getItem('settings_dailyReminder') === 'true'
    const reminderTime = localStorage.getItem('settings_reminderTime') || '08:00'

    if (!dailyReminder) {
      return // Reminders disabled
    }

    const now = new Date()
    const [hours, minutes] = reminderTime.split(':').map(Number)
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    // Check if current time matches reminder time (within same minute)
    if (currentTime === reminderTime) {
      // Check if we already sent a notification today
      const lastNotificationDate = localStorage.getItem('bibleCompanion_lastNotificationDate')
      const today = new Date().toISOString().split('T')[0]

      if (lastNotificationDate !== today) {
        sendNotification()
        localStorage.setItem('bibleCompanion_lastNotificationDate', today)

        if (onReminderTime) {
          onReminderTime()
        }
      }
    }
  } catch (error) {
    console.error('✗ Error checking reminder:', error)
  }
}

/**
 * Send the notification
 * Uses Browser Notifications API if available and permitted
 */
const sendNotification = () => {
  try {
    // Check if Notifications API is available
    if (!('Notification' in window)) {
      console.warn('⚠️ Notifications not supported in this browser')
      return
    }

    // Check permission status
    if (Notification.permission !== 'granted') {
      console.warn('⚠️ Notification permission not granted')
      return
    }

    // Send the notification
    const notification = new Notification('📖 Tagestext', {
      body: 'Dein Tagestext wartet auf dich! Bereit zum Lesen?',
      icon: '/icons/icon-light-192.png',
      badge: '/icons/icon-light-192.png',
      tag: 'daily-reading-reminder', // Prevents duplicates
      requireInteraction: false // Auto-close after a while
    })

    // Click handler - open app when notification clicked
    notification.addEventListener('click', () => {
      window.focus()
      // Navigate to home page (could be improved to go to daily text)
    })

    console.log('✓ Notification sent at', new Date().toLocaleTimeString())
  } catch (error) {
    console.error('✗ Error sending notification:', error)
  }
}

/**
 * Request permission for notifications
 * Must be called from user interaction (button click)
 * @returns {Promise<string>} - 'granted', 'denied', or 'default'
 */
export const requestNotificationPermission = async () => {
  try {
    if (!('Notification' in window)) {
      console.warn('⚠️ Notifications not supported in this browser')
      return 'unsupported'
    }

    // If already granted or denied, return current status
    if (Notification.permission !== 'default') {
      console.log(`ℹ️ Notification permission already: ${Notification.permission}`)
      return Notification.permission
    }

    // Request permission (must be in user interaction)
    const permission = await Notification.requestPermission()
    console.log(`✓ Notification permission result: ${permission}`)

    return permission
  } catch (error) {
    console.error('✗ Error requesting notification permission:', error)
    return 'error'
  }
}

/**
 * Get current notification permission status
 * @returns {string} - 'granted', 'denied', 'default', or 'unsupported'
 */
export const getNotificationPermission = () => {
  if (!('Notification' in window)) {
    return 'unsupported'
  }
  return Notification.permission
}

/**
 * Test notification (for debugging)
 * Sends an immediate notification regardless of time
 */
export const testNotification = () => {
  try {
    if (Notification.permission !== 'granted') {
      console.warn('⚠️ Notification permission not granted')
      return false
    }

    const notification = new Notification('📖 TEST Benachrichtigung', {
      body: 'Das ist eine Test-Benachrichtigung - funktioniert!',
      icon: '/icons/icon-light-192.png',
      badge: '/icons/icon-light-192.png'
    })

    console.log('✓ Test notification sent')
    return true
  } catch (error) {
    console.error('✗ Error sending test notification:', error)
    return false
  }
}

/**
 * Get notification service info for debugging
 * @returns {object} - Current service state
 */
export const getNotificationInfo = () => {
  return {
    supported: 'Notification' in window,
    permission: getNotificationPermission(),
    reminderEnabled: localStorage.getItem('settings_dailyReminder') === 'true',
    reminderTime: localStorage.getItem('settings_reminderTime') || '08:00',
    lastNotificationDate: localStorage.getItem('bibleCompanion_lastNotificationDate'),
    serviceActive: !!window._reminderServiceInterval
  }
}

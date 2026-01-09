/**
 * Firebase Message Templates Admin Utility
 * Provides functions for admins to manage notification message templates
 *
 * Structure:
 * /notification_templates/{notificationType}/{language}/messages: [...]
 */

import { database } from '../config/firebase'
import { ref, get, set, remove } from 'firebase/database'

export const NOTIFICATION_TYPES = [
  'daily_text',
  'weekly_reading',
  'personal_reading',
  'streak_preservation'
]

export const LANGUAGES = ['de', 'en', 'es', 'it', 'fr']

/**
 * Get all templates for a notification type and language
 * @param {string} notificationType - Type of notification
 * @param {string} language - Language code
 * @returns {Promise<string[]>} Array of message templates
 */
export const getAdminTemplates = async (notificationType, language) => {
  try {
    const templateRef = ref(database, `notification_templates/${notificationType}/${language}/messages`)
    const snapshot = await get(templateRef)

    if (snapshot.exists()) {
      return snapshot.val()
    }
    return []
  } catch (error) {
    console.error(`[TemplatesAdmin] Error loading ${notificationType}/${language}:`, error)
    return []
  }
}

/**
 * Save templates for a notification type and language
 * @param {string} notificationType - Type of notification
 * @param {string} language - Language code
 * @param {string[]} messages - Array of message templates
 * @returns {Promise<boolean>} Success status
 */
export const saveAdminTemplates = async (notificationType, language, messages) => {
  try {
    // Filter out empty strings
    const filteredMessages = messages.filter(msg => msg && msg.trim().length > 0)

    if (filteredMessages.length === 0) {
      console.warn(`[TemplatesAdmin] No valid messages to save for ${notificationType}/${language}`)
      return false
    }

    const templateRef = ref(database, `notification_templates/${notificationType}/${language}/messages`)
    await set(templateRef, filteredMessages)

    console.log(`[TemplatesAdmin] Saved ${filteredMessages.length} templates for ${notificationType}/${language}`)
    return true
  } catch (error) {
    console.error(`[TemplatesAdmin] Error saving ${notificationType}/${language}:`, error)
    return false
  }
}

/**
 * Delete all templates for a notification type and language
 * @param {string} notificationType - Type of notification
 * @param {string} language - Language code
 * @returns {Promise<boolean>} Success status
 */
export const deleteAdminTemplates = async (notificationType, language) => {
  try {
    const templateRef = ref(database, `notification_templates/${notificationType}/${language}/messages`)
    await remove(templateRef)

    console.log(`[TemplatesAdmin] Deleted templates for ${notificationType}/${language}`)
    return true
  } catch (error) {
    console.error(`[TemplatesAdmin] Error deleting ${notificationType}/${language}:`, error)
    return false
  }
}

/**
 * Add a single message template
 * @param {string} notificationType - Type of notification
 * @param {string} language - Language code
 * @param {string} message - Message to add
 * @returns {Promise<boolean>} Success status
 */
export const addAdminTemplate = async (notificationType, language, message) => {
  try {
    if (!message || message.trim().length === 0) {
      console.warn('[TemplatesAdmin] Empty message not added')
      return false
    }

    const templates = await getAdminTemplates(notificationType, language)
    templates.push(message.trim())

    return saveAdminTemplates(notificationType, language, templates)
  } catch (error) {
    console.error('[TemplatesAdmin] Error adding template:', error)
    return false
  }
}

/**
 * Update a single message template
 * @param {string} notificationType - Type of notification
 * @param {string} language - Language code
 * @param {number} index - Index of template to update
 * @param {string} message - New message
 * @returns {Promise<boolean>} Success status
 */
export const updateAdminTemplate = async (notificationType, language, index, message) => {
  try {
    const templates = await getAdminTemplates(notificationType, language)

    if (index < 0 || index >= templates.length) {
      console.error('[TemplatesAdmin] Invalid template index')
      return false
    }

    templates[index] = message.trim()
    return saveAdminTemplates(notificationType, language, templates)
  } catch (error) {
    console.error('[TemplatesAdmin] Error updating template:', error)
    return false
  }
}

/**
 * Delete a single message template
 * @param {string} notificationType - Type of notification
 * @param {string} language - Language code
 * @param {number} index - Index of template to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteAdminTemplate = async (notificationType, language, index) => {
  try {
    const templates = await getAdminTemplates(notificationType, language)

    if (index < 0 || index >= templates.length) {
      console.error('[TemplatesAdmin] Invalid template index')
      return false
    }

    templates.splice(index, 1)
    return saveAdminTemplates(notificationType, language, templates)
  } catch (error) {
    console.error('[TemplatesAdmin] Error deleting template:', error)
    return false
  }
}

/**
 * Initialize Firebase notification templates structure (idempotent)
 * Creates the structure if it doesn't exist, skips if already present
 * @returns {Promise<{success: boolean, message: string, created: number}>}
 */
export const initializeAdminTemplates = async () => {
  try {
    let createdCount = 0
    const results = []

    // For each notification type
    for (const notificationType of NOTIFICATION_TYPES) {
      // For each language
      for (const language of LANGUAGES) {
        const templateRef = ref(database, `notification_templates/${notificationType}/${language}/messages`)
        const snapshot = await get(templateRef)

        // Only create if doesn't exist
        if (!snapshot.exists()) {
          await set(templateRef, [])
          createdCount++
          results.push(`✓ Created ${notificationType}/${language}`)
        } else {
          results.push(`- Skipped ${notificationType}/${language} (already exists)`)
        }
      }
    }

    const message = `Initialized ${createdCount} new template structures\n\n${results.join('\n')}`
    console.log(`[TemplatesAdmin] ${message}`)

    return {
      success: true,
      message,
      created: createdCount
    }
  } catch (error) {
    console.error('[TemplatesAdmin] Error initializing templates:', error)
    return {
      success: false,
      message: `Error initializing templates: ${error.message}`,
      created: 0
    }
  }
}

/**
 * Get notification type label
 * @param {string} notificationType - Type of notification
 * @returns {string} Label
 */
export const getNotificationTypeLabel = (notificationType) => {
  const labels = {
    daily_text: 'Daily Text Reminders',
    weekly_reading: 'Weekly Reading Reminders',
    personal_reading: 'Personal Reading Reminders',
    streak_preservation: 'Streak Preservation Reminders'
  }
  return labels[notificationType] || notificationType
}

/**
 * Get language name
 * @param {string} language - Language code
 * @returns {string} Language name
 */
export const getLanguageName = (language) => {
  const names = {
    de: 'Deutsch',
    en: 'English',
    es: 'Español',
    it: 'Italiano',
    fr: 'Français'
  }
  return names[language] || language
}

export default {
  getAdminTemplates,
  saveAdminTemplates,
  deleteAdminTemplates,
  addAdminTemplate,
  updateAdminTemplate,
  deleteAdminTemplate,
  NOTIFICATION_TYPES,
  LANGUAGES,
  getNotificationTypeLabel,
  getLanguageName
}

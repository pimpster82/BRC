/**
 * Firebase schedule and yeartext storage
 *
 * Architecture:
 * - Shared Data (same for all users): schedules, yeartexts
 * - User-specific Data: reading progress, preferences
 *
 * Structure in Firebase:
 * /schedules/{year}/ - Central schedule repository
 * /yeartexts/{year}/ - Yearly scripture themes
 * /users/{userId}/progress/ - User-specific progress tracking
 */

import { database, isFirebaseConfigured } from '../config/firebase'
import { ref, get, set, remove } from 'firebase/database'
import { getScheduleFromCache, saveScheduleToCache, getYeartextFromCache, saveYeartextToCache } from './storage'

/**
 * Save schedule to Firebase (and local cache)
 * @param {number} year - The year
 * @param {Array} weeklySchedule - Array of week objects with readings
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export const saveScheduleToFirebase = async (year, weeklySchedule) => {
  if (!isFirebaseConfigured()) {
    console.warn('⚠️ Firebase not configured, saving to local storage only')
    saveScheduleToCache(year, weeklySchedule)
    return { success: true, cached: true }
  }

  try {
    const scheduleRef = ref(database, `schedules/${year}`)

    const scheduleData = {
      weeks: weeklySchedule,
      lastUpdated: new Date().toISOString(),
      version: 1
    }

    await set(scheduleRef, scheduleData)

    // Also save to local cache
    saveScheduleToCache(year, weeklySchedule)

    console.log(`✓ Schedule ${year} saved to Firebase and local cache`)
    return { success: true }
  } catch (error) {
    console.error(`✗ Failed to save schedule to Firebase:`, error)
    // Fallback to local cache only
    saveScheduleToCache(year, weeklySchedule)
    return {
      success: false,
      error: error.message,
      cached: true
    }
  }
}

/**
 * Load schedule from Firebase or local cache
 * @param {number} year - The year to load
 * @returns {Promise<Object>} - { success: boolean, schedule?: Array, source: 'firebase'|'local'|'none', error?: string }
 */
export const loadScheduleFromFirebase = async (year) => {
  // First, try local cache
  const cachedSchedule = getScheduleFromCache(year)
  if (cachedSchedule) {
    return {
      success: true,
      schedule: cachedSchedule,
      source: 'local'
    }
  }

  // If not in cache and Firebase is not configured, return error
  if (!isFirebaseConfigured()) {
    return {
      success: false,
      source: 'none',
      error: 'Schedule not found locally and Firebase is not configured'
    }
  }

  try {
    const scheduleRef = ref(database, `schedules/${year}`)
    const snapshot = await get(scheduleRef)

    if (snapshot.exists()) {
      const scheduleData = snapshot.val()
      const weeklySchedule = scheduleData.weeks || []

      // Save to local cache for offline access
      saveScheduleToCache(year, weeklySchedule)

      console.log(`✓ Schedule ${year} loaded from Firebase`)
      return {
        success: true,
        schedule: weeklySchedule,
        source: 'firebase'
      }
    } else {
      return {
        success: false,
        source: 'none',
        error: `Schedule for year ${year} not found on Firebase`
      }
    }
  } catch (error) {
    console.error(`✗ Failed to load schedule from Firebase:`, error)
    return {
      success: false,
      source: 'none',
      error: error.message
    }
  }
}

/**
 * Save yeartext to Firebase (and local cache)
 * @param {number} year - The year
 * @param {Object} yeartextData - { scripture: string, text: string, year: number, message?: string }
 * @param {string} language - Language code (de, en, es, it, fr). Defaults to 'english'
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export const saveYeartextToFirebase = async (year, yeartextData, language = 'english') => {
  if (!isFirebaseConfigured()) {
    console.warn('⚠️ Firebase not configured, saving to local storage only')
    saveYeartextToCache(year, yeartextData, language)
    return { success: true, cached: true }
  }

  try {
    // Save under language-specific path: yeartexts/{year}/{language}/
    const yeartextRef = ref(database, `yeartexts/${year}/${language}`)

    const dataToSave = {
      scripture: yeartextData.scripture,
      text: yeartextData.text,
      lastUpdated: new Date().toISOString()
    }

    await set(yeartextRef, dataToSave)

    // Also save to local cache
    saveYeartextToCache(year, yeartextData, language)

    console.log(`✓ Yeartext ${year} (${language}) saved to Firebase and local cache`)
    return { success: true }
  } catch (error) {
    console.error(`✗ Failed to save yeartext to Firebase:`, error)
    // Fallback to local cache only
    saveYeartextToCache(year, yeartextData, language)
    return {
      success: false,
      error: error.message,
      cached: true
    }
  }
}

/**
 * Load yeartext from Firebase or local cache for a specific language
 * @param {number} year - The year to load
 * @param {string} language - Language code (de, en, es, it, fr). Defaults to 'english'
 * @returns {Promise<Object>} - { success: boolean, yeartext?: Object, source: 'firebase'|'local'|'none', error?: string }
 */
export const loadYeartextFromFirebase = async (year, language = 'english') => {
  // Map language codes to Firebase storage keys
  const langMap = {
    'de': 'de',
    'en': 'english',
    'es': 'es',
    'it': 'it',
    'fr': 'fr'
  }

  const fbLang = langMap[language] || 'english'

  // First, try local cache
  const cachedYeartext = getYeartextFromCache(year, fbLang)
  if (cachedYeartext) {
    return {
      success: true,
      yeartext: cachedYeartext,
      source: 'local'
    }
  }

  // If not in cache and Firebase is not configured, return error
  if (!isFirebaseConfigured()) {
    return {
      success: false,
      source: 'none',
      error: 'Yeartext not found locally and Firebase is not configured'
    }
  }

  try {
    // Load from Firebase for the requested language
    const yeartextRef = ref(database, `yeartexts/${year}/${fbLang}`)
    const snapshot = await get(yeartextRef)

    if (snapshot.exists()) {
      const yeartextData = snapshot.val()

      // Save to local cache for offline access
      saveYeartextToCache(year, yeartextData, fbLang)

      console.log(`✓ Yeartext ${year} (${fbLang}) loaded from Firebase`)
      return {
        success: true,
        yeartext: yeartextData,
        source: 'firebase'
      }
    } else {
      return {
        success: false,
        source: 'none',
        error: `Yeartext for year ${year} (${fbLang}) not found on Firebase`
      }
    }
  } catch (error) {
    console.error(`✗ Failed to load yeartext from Firebase:`, error)
    return {
      success: false,
      source: 'none',
      error: error.message
    }
  }
}

/**
 * Get available schedule years from Firebase
 * @returns {Promise<Array>} - Array of years with schedules available
 */
export const getAvailableScheduleYears = async () => {
  if (!isFirebaseConfigured()) {
    return []
  }

  try {
    const schedulesRef = ref(database, 'schedules')
    const snapshot = await get(schedulesRef)

    if (snapshot.exists()) {
      const years = Object.keys(snapshot.val()).map(year => parseInt(year))
      return years.sort((a, b) => b - a) // Return in descending order (newest first)
    }
    return []
  } catch (error) {
    console.error('✗ Failed to get available schedule years:', error)
    return []
  }
}

/**
 * Get available yeartext years from Firebase
 * @returns {Promise<Array>} - Array of years with yeartexts available
 */
export const getAvailableYeartextYears = async () => {
  if (!isFirebaseConfigured()) {
    return []
  }

  try {
    const yeartextsRef = ref(database, 'yeartexts')
    const snapshot = await get(yeartextsRef)

    if (snapshot.exists()) {
      const years = Object.keys(snapshot.val()).map(year => parseInt(year))
      return years.sort((a, b) => b - a) // Return in descending order (newest first)
    }
    return []
  } catch (error) {
    console.error('✗ Failed to get available yeartext years:', error)
    return []
  }
}

/**
 * Update yeartext translation for a specific language in Firebase
 * @param {number} year - The year
 * @param {string} language - Language code (de, en, es, it, fr) or 'english'
 * @param {Object} translationData - { scripture: string, text: string }
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export const updateYeartextTranslation = async (year, language, translationData) => {
  // Map language codes to Firebase storage keys
  const langMap = {
    'de': 'de',
    'en': 'english',
    'es': 'es',
    'it': 'it',
    'fr': 'fr'
  }

  const fbLang = langMap[language] || language

  if (!isFirebaseConfigured()) {
    console.warn('⚠️ Firebase not configured, saving to local storage only')
    saveYeartextToCache(year, translationData, fbLang)
    return { success: true, cached: true }
  }

  try {
    const translationRef = ref(database, `yeartexts/${year}/${fbLang}`)

    const dataToSave = {
      scripture: translationData.scripture,
      text: translationData.text,
      lastUpdated: new Date().toISOString()
    }

    await set(translationRef, dataToSave)

    // Also save to local cache
    saveYeartextToCache(year, translationData, fbLang)

    console.log(`✓ Yeartext translation for ${year} (${fbLang}) updated`)
    return { success: true }
  } catch (error) {
    console.error(`✗ Failed to save yeartext translation:`, error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Get all available translations for a year
 * @param {number} year - The year
 * @returns {Promise<Array>} - Array of language codes with translations available
 */
export const getAvailableTranslations = async (year) => {
  if (!isFirebaseConfigured()) {
    return []
  }

  try {
    const yeartextsRef = ref(database, `yeartexts/${year}`)
    const snapshot = await get(yeartextsRef)

    if (snapshot.exists()) {
      const languages = Object.keys(snapshot.val())
      return languages
    }
    return []
  } catch (error) {
    console.error('✗ Failed to get available translations:', error)
    return []
  }
}

/**
 * Delete schedule from Firebase
 * @param {number} year - The year to delete
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export const deleteScheduleFromFirebase = async (year) => {
  if (!isFirebaseConfigured()) {
    return { success: false, error: 'Firebase not configured' }
  }

  try {
    const scheduleRef = ref(database, `schedules/${year}`)
    await remove(scheduleRef)
    console.log(`✓ Schedule ${year} deleted from Firebase`)
    return { success: true }
  } catch (error) {
    console.error(`✗ Failed to delete schedule from Firebase:`, error)
    return { success: false, error: error.message }
  }
}

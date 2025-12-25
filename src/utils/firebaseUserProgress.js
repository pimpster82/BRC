/**
 * Firebase User Progress Sync - Phase 3
 *
 * Handles syncing user progress data to Firebase with multi-device support.
 * Each user can sync across multiple devices with timestamp-based merge logic.
 *
 * Firebase Structure (Phase 3):
 * /users/{userId}/progress/daily/ - Daily text progress
 * /users/{userId}/progress/weekly/ - Weekly reading progress
 * /users/{userId}/progress/personal/ - Personal reading progress
 * /users/{userId}/metadata/ - Last login, device info
 *
 * Phase 1: Device-based sync (legacy - still supported for migration)
 * Phase 3: User-based sync with authentication
 */

import { database, isFirebaseConfigured, auth } from '../config/firebase'
import { ref, set, get, update, remove } from 'firebase/database'
import { getOrCreateDeviceId, getDeviceName, getDeviceInfo } from './deviceId'
import {
  getDailyTextData,
  getWeeklyReadingData,
  getPersonalReadingData
} from './storage'

/**
 * Save daily text progress to Firebase
 * Phase 3: Saves to users/{userId}/progress/daily
 * @param {Object} dailyTextData - { completedDates: [], currentStreak: number, longestStreak: number }
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export const saveDailyProgressToFirebase = async (dailyTextData) => {
  if (!isFirebaseConfigured()) {
    console.warn('⚠️ Firebase not configured, progress saved to localStorage only')
    return { success: true, cached: true }
  }

  try {
    // Get current user ID from Firebase Auth
    const userId = auth?.currentUser?.uid

    if (!userId) {
      console.warn('⚠️ No authenticated user, falling back to device-based sync')
      // Fallback to Phase 1 device-based sync
      const deviceId = getOrCreateDeviceId()
      const progressRef = ref(database, `devices/${deviceId}/progress/daily`)
      const dataToSave = {
        completedDates: dailyTextData.completedDates || [],
        currentStreak: dailyTextData.currentStreak || 0,
        longestStreak: dailyTextData.longestStreak || 0,
        lastUpdated: new Date().toISOString()
      }
      await set(progressRef, dataToSave)
      console.log(`✓ Daily progress synced to Firebase (device: ${deviceId.substring(0, 8)}...)`)
      return { success: true }
    }

    // Phase 3: Save to users/{userId}/progress/daily
    const progressRef = ref(database, `users/${userId}/progress/daily`)

    const dataToSave = {
      completedDates: dailyTextData.completedDates || [],
      currentStreak: dailyTextData.currentStreak || 0,
      longestStreak: dailyTextData.longestStreak || 0,
      lastUpdated: Date.now()  // Use millisecond timestamp for consistent merge logic
    }

    await set(progressRef, dataToSave)

    console.log(`✓ Daily progress synced to Firebase (user: ${userId.substring(0, 8)}...)`)
    return { success: true }
  } catch (error) {
    console.error('✗ Failed to save daily progress to Firebase:', error)
    return {
      success: false,
      error: error.message,
      cached: true
    }
  }
}

/**
 * Save weekly reading progress to Firebase
 * Phase 3: Saves to users/{userId}/progress/weekly
 * @param {Object} weeklyReadingData - { completedWeeks: [], currentMeetingDay: number }
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export const saveWeeklyProgressToFirebase = async (weeklyReadingData) => {
  if (!isFirebaseConfigured()) {
    console.warn('⚠️ Firebase not configured, progress saved to localStorage only')
    return { success: true, cached: true }
  }

  try {
    const userId = auth?.currentUser?.uid

    if (!userId) {
      console.warn('⚠️ No authenticated user, falling back to device-based sync')
      const deviceId = getOrCreateDeviceId()
      const progressRef = ref(database, `devices/${deviceId}/progress/weekly`)
      const dataToSave = {
        completedWeeks: weeklyReadingData.completedWeeks || [],
        currentMeetingDay: weeklyReadingData.currentMeetingDay || 0,
        lastUpdated: new Date().toISOString()
      }
      await set(progressRef, dataToSave)
      console.log(`✓ Weekly progress synced to Firebase (device: ${deviceId.substring(0, 8)}...)`)
      return { success: true }
    }

    const progressRef = ref(database, `users/${userId}/progress/weekly`)

    const dataToSave = {
      completedWeeks: weeklyReadingData.completedWeeks || [],
      currentMeetingDay: weeklyReadingData.currentMeetingDay || 0,
      lastUpdated: Date.now()
    }

    await set(progressRef, dataToSave)

    console.log(`✓ Weekly progress synced to Firebase (user: ${userId.substring(0, 8)}...)`)
    return { success: true }
  } catch (error) {
    console.error('✗ Failed to save weekly progress to Firebase:', error)
    return {
      success: false,
      error: error.message,
      cached: true
    }
  }
}

/**
 * Save personal reading progress to Firebase
 * Phase 3: Saves to users/{userId}/progress/personal
 * @param {Object} personalReadingData - { chaptersRead: [], selectedPlan: string }
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export const savePersonalProgressToFirebase = async (personalReadingData) => {
  if (!isFirebaseConfigured()) {
    console.warn('⚠️ Firebase not configured, progress saved to localStorage only')
    return { success: true, cached: true }
  }

  try {
    const userId = auth?.currentUser?.uid

    if (!userId) {
      console.warn('⚠️ No authenticated user, falling back to device-based sync')
      const deviceId = getOrCreateDeviceId()
      const progressRef = ref(database, `devices/${deviceId}/progress/personal`)
      const dataToSave = {
        chaptersRead: personalReadingData.chaptersRead || [],
        selectedPlan: personalReadingData.selectedPlan || 'free',
        lastUpdated: new Date().toISOString()
      }
      await set(progressRef, dataToSave)
      console.log(`✓ Personal progress synced to Firebase (device: ${deviceId.substring(0, 8)}...)`)
      return { success: true }
    }

    const progressRef = ref(database, `users/${userId}/progress/personal`)

    const dataToSave = {
      chaptersRead: personalReadingData.chaptersRead || [],
      selectedPlan: personalReadingData.selectedPlan || 'free',
      lastUpdated: Date.now()
    }

    await set(progressRef, dataToSave)

    console.log(`✓ Personal progress synced to Firebase (user: ${userId.substring(0, 8)}...)`)
    return { success: true }
  } catch (error) {
    console.error('✗ Failed to save personal progress to Firebase:', error)
    return {
      success: false,
      error: error.message,
      cached: true
    }
  }
}

/**
 * Load all progress from Firebase for this device
 * @returns {Promise<Object>} - { success: boolean, progress?: { daily, weekly, personal }, error?: string }
 */
export const loadProgressFromFirebase = async () => {
  if (!isFirebaseConfigured()) {
    console.warn('⚠️ Firebase not configured, using localStorage only')
    return { success: false, cached: true }
  }

  try {
    const deviceId = getOrCreateDeviceId()
    const progressRef = ref(database, `devices/${deviceId}/progress`)
    const snapshot = await get(progressRef)

    if (snapshot.exists()) {
      const progress = snapshot.val()
      console.log(`✓ Progress loaded from Firebase (device: ${deviceId.substring(0, 8)}...)`)
      return {
        success: true,
        progress
      }
    } else {
      console.log('ℹ️ No progress data found on Firebase for this device')
      return {
        success: false,
        progress: null
      }
    }
  } catch (error) {
    console.error('✗ Failed to load progress from Firebase:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Update device stats (device name, sync status, etc.)
 * @param {Object} statsUpdate - Partial stats object to update
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export const updateDeviceStats = async (statsUpdate = {}) => {
  if (!isFirebaseConfigured()) {
    return { success: true, cached: true }
  }

  try {
    const deviceId = getOrCreateDeviceId()
    const statsRef = ref(database, `devices/${deviceId}/stats`)

    const dataToSave = {
      deviceId,
      deviceName: getDeviceName(),
      lastSync: new Date().toISOString(),
      ...statsUpdate
    }

    await set(statsRef, dataToSave)

    console.log(`✓ Device stats updated on Firebase`)
    return { success: true }
  } catch (error) {
    console.error('✗ Failed to update device stats:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Sync ALL local progress to Firebase
 * Called periodically or when user marks something complete
 * @returns {Promise<Object>} - { success: boolean, synced: string[], error?: string }
 */
export const syncAllProgressToFirebase = async () => {
  if (!isFirebaseConfigured()) {
    return { success: true, cached: true, synced: [] }
  }

  const synced = []

  try {
    // Sync all three progress types
    const dailyData = getDailyTextData()
    const dailyResult = await saveDailyProgressToFirebase(dailyData)
    if (dailyResult.success) synced.push('daily')

    const weeklyData = getWeeklyReadingData()
    const weeklyResult = await saveWeeklyProgressToFirebase(weeklyData)
    if (weeklyResult.success) synced.push('weekly')

    const personalData = getPersonalReadingData()
    const personalResult = await savePersonalProgressToFirebase(personalData)
    if (personalResult.success) synced.push('personal')

    // Update device stats
    await updateDeviceStats()

    console.log(`✓ All progress synced to Firebase: ${synced.join(', ')}`)
    return { success: true, synced }
  } catch (error) {
    console.error('✗ Failed to sync all progress:', error)
    return {
      success: false,
      synced,
      error: error.message
    }
  }
}

/**
 * Get device info from Firebase
 * Useful for displaying which devices have synced data
 * @returns {Promise<Object>} - { success: boolean, devices?: Array, error?: string }
 */
export const getDevicesFromFirebase = async () => {
  if (!isFirebaseConfigured()) {
    return { success: false }
  }

  try {
    const devicesRef = ref(database, 'devices')
    const snapshot = await get(devicesRef)

    if (snapshot.exists()) {
      const devicesData = snapshot.val()
      const devices = Object.keys(devicesData).map((deviceId) => ({
        deviceId,
        deviceName: devicesData[deviceId].stats?.deviceName || 'Unknown Device',
        lastSync: devicesData[deviceId].stats?.lastSync || null
      }))

      return { success: true, devices }
    }

    return { success: false, devices: [] }
  } catch (error) {
    console.error('✗ Failed to get devices from Firebase:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Clear device data from Firebase (useful for testing)
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export const clearDeviceDataFromFirebase = async () => {
  if (!isFirebaseConfigured()) {
    return { success: false }
  }

  try {
    const deviceId = getOrCreateDeviceId()
    const deviceRef = ref(database, `devices/${deviceId}`)
    await remove(deviceRef)

    console.log(`✓ Device data cleared from Firebase`)
    return { success: true }
  } catch (error) {
    console.error('✗ Failed to clear device data from Firebase:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

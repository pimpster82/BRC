import { ref, get, set, update } from 'firebase/database'
import { database } from '../config/firebase'

/**
 * User Progress Utilities for Phase 3 (Multi-Device Sync)
 * Handles saving and loading user progress with timestamp-based merge logic
 *
 * Firebase structure: users/{userId}/progress/{section}/
 * Each section (daily, weekly, personal) has lastUpdated timestamp
 */

/**
 * Get the current timestamp (milliseconds since epoch)
 * @returns {number} Current timestamp
 */
const getCurrentTimestamp = () => Date.now()

/**
 * Save user progress section to Firebase with timestamp
 * Implements last-write-wins strategy: newest timestamp overwrites older data
 *
 * @param {string} userId - Firebase user ID (from auth.currentUser.uid)
 * @param {string} section - Progress section: 'daily', 'weekly', or 'personal'
 * @param {Object} data - Progress data to save
 * @returns {Promise<void>}
 *
 * @example
 * await saveUserProgress(userId, 'daily', {
 *   completedDates: ['2025-12-25', '2025-12-24'],
 *   currentStreak: 5
 * })
 */
export const saveUserProgress = async (userId, section, data) => {
  if (!userId) throw new Error('userId is required')
  if (!section) throw new Error('section is required')
  if (!data) throw new Error('data is required')

  try {
    const progressRef = ref(database, `users/${userId}/progress/${section}`)
    const timestamp = getCurrentTimestamp()

    const dataWithTimestamp = {
      ...data,
      lastUpdated: timestamp
    }

    await set(progressRef, dataWithTimestamp)
    console.log(`✓ Saved ${section} progress for user ${userId} at ${new Date(timestamp).toISOString()}`)
    return { success: true, timestamp }
  } catch (error) {
    console.error(`✗ Failed to save ${section} progress:`, error)
    throw error
  }
}

/**
 * Load user progress section from Firebase
 *
 * @param {string} userId - Firebase user ID
 * @param {string} section - Progress section: 'daily', 'weekly', or 'personal'
 * @returns {Promise<Object|null>} Progress data with lastUpdated timestamp, or null if not found
 *
 * @example
 * const dailyProgress = await loadUserProgress(userId, 'daily')
 * // Returns: { completedDates: [...], currentStreak: 5, lastUpdated: 1703520000000 }
 */
export const loadUserProgress = async (userId, section) => {
  if (!userId) throw new Error('userId is required')
  if (!section) throw new Error('section is required')

  try {
    const progressRef = ref(database, `users/${userId}/progress/${section}`)
    const snapshot = await get(progressRef)

    if (snapshot.exists()) {
      console.log(`✓ Loaded ${section} progress for user ${userId}`)
      return snapshot.val()
    } else {
      console.log(`ℹ️ No ${section} progress found for user ${userId}`)
      return null
    }
  } catch (error) {
    console.error(`✗ Failed to load ${section} progress:`, error)
    throw error
  }
}

/**
 * Load ALL user progress sections at once
 * Useful for initialization on login
 *
 * @param {string} userId - Firebase user ID
 * @returns {Promise<Object>} All progress sections: { daily, weekly, personal }
 *
 * @example
 * const allProgress = await loadAllUserProgress(userId)
 * // Returns: { daily: {...}, weekly: {...}, personal: {...} }
 */
export const loadAllUserProgress = async (userId) => {
  if (!userId) throw new Error('userId is required')

  try {
    const progressRef = ref(database, `users/${userId}/progress`)
    const snapshot = await get(progressRef)

    if (snapshot.exists()) {
      console.log(`✓ Loaded all progress for user ${userId}`)
      return snapshot.val()
    } else {
      console.log(`ℹ️ No progress data found for user ${userId}`)
      return { daily: null, weekly: null, personal: null }
    }
  } catch (error) {
    console.error('✗ Failed to load all progress:', error)
    throw error
  }
}

/**
 * Validate that completedDates array contains only valid YYYY-MM-DD format dates
 * Filters out any invalid entries to prevent streak calculation corruption
 *
 * @param {Array} completedDates - Array of date strings
 * @returns {Array} Validated array containing only valid YYYY-MM-DD dates
 */
const validateCompletedDates = (completedDates) => {
  if (!Array.isArray(completedDates)) return []

  // Regex pattern for YYYY-MM-DD format
  const datePattern = /^\d{4}-\d{2}-\d{2}$/

  return completedDates.filter(date => {
    if (typeof date !== 'string') return false
    if (!datePattern.test(date)) return false

    // Additional validation: check if it's a valid date
    const [year, month, day] = date.split('-').map(Number)
    if (month < 1 || month > 12) return false
    if (day < 1 || day > 31) return false

    return true
  })
}

/**
 * Merge local progress with Firebase progress using timestamp-based logic
 * Last-write-wins: if Firebase version is newer, use it; otherwise use local
 *
 * This is the core multi-device sync logic:
 * - If Firebase data is newer: use Firebase version
 * - If local data is newer: use local version (will be uploaded on next save)
 * - If timestamps are equal: use Firebase version (tiebreaker)
 *
 * IMPORTANT: Validates completedDates to prevent corruption from invalid date formats
 *
 * @param {Object} localData - Local progress data (from localStorage)
 * @param {Object} firebaseData - Firebase progress data
 * @returns {Object} Merged progress data with merged lastUpdated timestamp
 *
 * @example
 * const merged = mergeProgress(
 *   { completedDates: [...], lastUpdated: 1000 },
 *   { completedDates: [...], lastUpdated: 2000 }
 * )
 * // Returns version with lastUpdated: 2000 (Firebase version won)
 */
export const mergeProgress = (localData, firebaseData) => {
  // If one is missing, return the other (with validation)
  if (!firebaseData) {
    if (localData?.completedDates) {
      localData.completedDates = validateCompletedDates(localData.completedDates)
    }
    return localData
  }
  if (!localData) {
    if (firebaseData?.completedDates) {
      firebaseData.completedDates = validateCompletedDates(firebaseData.completedDates)
    }
    return firebaseData
  }

  const localTimestamp = localData.lastUpdated || 0
  const firebaseTimestamp = firebaseData.lastUpdated || 0

  // Last-write-wins: newer timestamp overwrites
  if (firebaseTimestamp > localTimestamp) {
    console.log(`ℹ️ Firebase version is newer (${firebaseTimestamp} > ${localTimestamp}), using Firebase data`)
    // Validate Firebase data before returning
    if (firebaseData?.completedDates) {
      const validatedDates = validateCompletedDates(firebaseData.completedDates)
      if (validatedDates.length !== firebaseData.completedDates.length) {
        console.warn(`⚠️ Firebase completedDates had ${firebaseData.completedDates.length} entries, filtered to ${validatedDates.length} valid dates`)
        firebaseData.completedDates = validatedDates
      }
    }
    return firebaseData
  } else if (localTimestamp > firebaseTimestamp) {
    console.log(`ℹ️ Local version is newer (${localTimestamp} > ${firebaseTimestamp}), using local data`)
    // Validate local data
    if (localData?.completedDates) {
      const validatedDates = validateCompletedDates(localData.completedDates)
      if (validatedDates.length !== localData.completedDates.length) {
        console.warn(`⚠️ Local completedDates had ${localData.completedDates.length} entries, filtered to ${validatedDates.length} valid dates`)
        localData.completedDates = validatedDates
      }
    }
    return localData
  } else {
    // Equal timestamps - use Firebase as tiebreaker
    console.log(`ℹ️ Timestamps equal, using Firebase version as tiebreaker`)
    // Validate Firebase data
    if (firebaseData?.completedDates) {
      const validatedDates = validateCompletedDates(firebaseData.completedDates)
      if (validatedDates.length !== firebaseData.completedDates.length) {
        console.warn(`⚠️ Firebase completedDates had ${firebaseData.completedDates.length} entries, filtered to ${validatedDates.length} valid dates`)
        firebaseData.completedDates = validatedDates
      }
    }
    return firebaseData
  }
}

/**
 * Merge a specific progress section with Firebase
 * Combines mergeProgress logic with Firebase operations
 *
 * @param {string} userId - Firebase user ID
 * @param {string} section - Progress section: 'daily', 'weekly', or 'personal'
 * @param {Object} localData - Local progress data
 * @returns {Promise<Object>} Merged progress data
 */
export const mergeUserProgressSection = async (userId, section, localData) => {
  if (!userId) throw new Error('userId is required')

  try {
    // Load Firebase version
    const firebaseData = await loadUserProgress(userId, section)

    // Merge using timestamp logic
    const mergedData = mergeProgress(localData, firebaseData)

    // Save merged data back to Firebase (ensures consistency)
    if (mergedData) {
      await saveUserProgress(userId, section, mergedData)
    }

    return mergedData
  } catch (error) {
    console.error(`✗ Failed to merge ${section} progress:`, error)
    throw error
  }
}

/**
 * Delete a progress section from Firebase
 * Used when user clears data or deletes account
 *
 * @param {string} userId - Firebase user ID
 * @param {string} section - Progress section to delete
 * @returns {Promise<void>}
 */
export const deleteUserProgress = async (userId, section) => {
  if (!userId) throw new Error('userId is required')
  if (!section) throw new Error('section is required')

  try {
    const progressRef = ref(database, `users/${userId}/progress/${section}`)
    await set(progressRef, null) // Firebase convention: set to null to delete
    console.log(`✓ Deleted ${section} progress for user ${userId}`)
  } catch (error) {
    console.error(`✗ Failed to delete ${section} progress:`, error)
    throw error
  }
}

/**
 * Get user metadata (created date, last login, device info)
 * Useful for tracking which devices have synced
 *
 * @param {string} userId - Firebase user ID
 * @returns {Promise<Object|null>} User metadata or null if not found
 */
export const loadUserMetadata = async (userId) => {
  if (!userId) throw new Error('userId is required')

  try {
    const metadataRef = ref(database, `users/${userId}/metadata`)
    const snapshot = await get(metadataRef)

    if (snapshot.exists()) {
      return snapshot.val()
    }
    return null
  } catch (error) {
    console.error('✗ Failed to load user metadata:', error)
    throw error
  }
}

/**
 * Update user metadata (last login, device info, etc.)
 * Called on login to track device activity
 *
 * @param {string} userId - Firebase user ID
 * @param {Object} metadata - Metadata to update (lastLogin, devices, etc.)
 * @returns {Promise<void>}
 */
export const updateUserMetadata = async (userId, metadata) => {
  if (!userId) throw new Error('userId is required')

  try {
    const metadataRef = ref(database, `users/${userId}/metadata`)
    const timestamp = getCurrentTimestamp()

    const dataWithTimestamp = {
      ...metadata,
      lastUpdated: timestamp
    }

    // Use update instead of set to merge with existing metadata
    await update(ref(database, `users/${userId}`), {
      metadata: dataWithTimestamp
    })

    console.log(`✓ Updated metadata for user ${userId}`)
  } catch (error) {
    console.error('✗ Failed to update user metadata:', error)
    throw error
  }
}

/**
 * Check if user has any synced progress on Firebase
 * Useful for first-login migration detection
 *
 * @param {string} userId - Firebase user ID
 * @returns {Promise<boolean>} True if user has any progress data on Firebase
 */
export const hasUserProgress = async (userId) => {
  if (!userId) throw new Error('userId is required')

  try {
    const progressRef = ref(database, `users/${userId}/progress`)
    const snapshot = await get(progressRef)
    return snapshot.exists()
  } catch (error) {
    console.error('✗ Failed to check user progress:', error)
    return false
  }
}

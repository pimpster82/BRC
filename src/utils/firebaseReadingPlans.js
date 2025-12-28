/**
 * Firebase Reading Plans Storage
 * Handles saving, loading, installing/uninstalling custom reading plans
 */

import { ref, set, get, remove } from 'firebase/database'
import { database, auth } from '../config/firebase'

/**
 * Upload a new reading plan to Firebase
 * @param {Object} plan - Parsed plan object
 * @param {string} userId - User ID (creator)
 */
export const uploadReadingPlan = async (plan, userId) => {
  if (!database || !userId) {
    throw new Error('Firebase not initialized or user not logged in')
  }

  try {
    const planData = {
      ...plan,
      creatorId: userId,
      createdAt: new Date().toISOString(),
      installations: 0,
      isPublic: true,
      status: 'published'
    }

    // Save to /readingPlans/available/{planId}
    const planRef = ref(database, `readingPlans/available/${plan.id}`)
    await set(planRef, planData)

    console.log('✓ Reading plan uploaded:', plan.id)
    return planData
  } catch (error) {
    console.error('✗ Failed to upload reading plan:', error)
    throw error
  }
}

/**
 * Get all available reading plans
 */
export const getAvailableReadingPlans = async () => {
  if (!database) return []

  try {
    const plansRef = ref(database, 'readingPlans/available')
    const snapshot = await get(plansRef)

    if (!snapshot.exists()) {
      return []
    }

    const plans = []
    snapshot.forEach((child) => {
      plans.push({
        id: child.key,
        ...child.val()
      })
    })

    return plans
  } catch (error) {
    console.error('✗ Failed to fetch available plans:', error)
    return []
  }
}

/**
 * Get user's installed plans
 * @param {string} userId - User ID
 */
export const getInstalledPlans = async (userId) => {
  if (!database || !userId) return []

  try {
    const installRef = ref(database, `readingPlans/users/${userId}/installedPlans`)
    const snapshot = await get(installRef)

    if (!snapshot.exists()) {
      return []
    }

    return Object.keys(snapshot.val() || {})
  } catch (error) {
    console.error('✗ Failed to fetch installed plans:', error)
    return []
  }
}

/**
 * Install a reading plan for user
 * @param {string} planId - Plan ID to install
 * @param {string} userId - User ID
 */
export const installReadingPlan = async (planId, userId) => {
  if (!database || !userId) {
    throw new Error('Firebase not initialized or user not logged in')
  }

  try {
    // Add to user's installed plans
    const installRef = ref(database, `readingPlans/users/${userId}/installedPlans/${planId}`)
    await set(installRef, {
      installedAt: new Date().toISOString()
    })

    // Increment installation count
    const countRef = ref(database, `readingPlans/available/${planId}/installations`)
    const snapshot = await get(countRef)
    const currentCount = snapshot.val() || 0
    await set(countRef, currentCount + 1)

    console.log('✓ Plan installed:', planId)
    return true
  } catch (error) {
    console.error('✗ Failed to install plan:', error)
    throw error
  }
}

/**
 * Uninstall a reading plan for user
 * @param {string} planId - Plan ID to uninstall
 * @param {string} userId - User ID
 */
export const uninstallReadingPlan = async (planId, userId) => {
  if (!database || !userId) {
    throw new Error('Firebase not initialized or user not logged in')
  }

  try {
    // Remove from user's installed plans
    const installRef = ref(database, `readingPlans/users/${userId}/installedPlans/${planId}`)
    await remove(installRef)

    // Decrement installation count
    const countRef = ref(database, `readingPlans/available/${planId}/installations`)
    const snapshot = await get(countRef)
    const currentCount = Math.max(0, (snapshot.val() || 1) - 1)
    await set(countRef, currentCount)

    console.log('✓ Plan uninstalled:', planId)
    return true
  } catch (error) {
    console.error('✗ Failed to uninstall plan:', error)
    throw error
  }
}

/**
 * Get a specific reading plan details
 * @param {string} planId - Plan ID
 */
export const getReadingPlan = async (planId) => {
  if (!database) return null

  try {
    const planRef = ref(database, `readingPlans/available/${planId}`)
    const snapshot = await get(planRef)

    if (!snapshot.exists()) {
      return null
    }

    return {
      id: planId,
      ...snapshot.val()
    }
  } catch (error) {
    console.error('✗ Failed to fetch plan:', error)
    return null
  }
}

/**
 * Load plan data from localStorage as fallback
 * Used for system plans (free, thematic)
 */
export const loadSystemPlans = () => {
  const systemPlans = {
    free: {
      id: 'system_free',
      name: {
        de: 'Kostenlos',
        en: 'Free Reading',
        es: 'Gratis',
        it: 'Gratuito',
        fr: 'Gratuit'
      },
      type: 'category',
      sections: [
        {
          title: {
            de: 'Schöpfung',
            en: 'Creation',
            es: 'Creación',
            it: 'Creazione',
            fr: 'Création'
          },
          bookRange: { startBook: 1, endBook: 5 },
          topics: []
        },
        {
          title: {
            de: 'Verheißenes Land',
            en: 'Promised Land',
            es: 'Tierra Prometida',
            it: 'Terra Promessa',
            fr: 'Terre Promise'
          },
          bookRange: { startBook: 6, endBook: 8 },
          topics: []
        }
        // ... more sections
      ],
      createdAt: new Date().toISOString(),
      isSystem: true
    },
    thematic: {
      id: 'system_thematic',
      name: {
        de: 'Thematisch',
        en: 'Thematic',
        es: 'Temático',
        it: 'Tematico',
        fr: 'Thématique'
      },
      type: 'thematic',
      sections: [],
      createdAt: new Date().toISOString(),
      isSystem: true
    }
  }

  return systemPlans
}

/**
 * Sync reading plan selection to localStorage
 */
export const syncInstalledPlans = async (userId) => {
  try {
    const installed = await getInstalledPlans(userId)
    localStorage.setItem('readingPlans_installed', JSON.stringify(installed))
    return installed
  } catch (error) {
    console.error('✗ Failed to sync installed plans:', error)
    return []
  }
}

/**
 * Get cached installed plans from localStorage
 */
export const getCachedInstalledPlans = () => {
  try {
    const cached = localStorage.getItem('readingPlans_installed')
    return cached ? JSON.parse(cached) : []
  } catch (error) {
    return []
  }
}

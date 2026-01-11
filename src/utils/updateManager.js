/**
 * Update Manager
 *
 * Handles version checking, channel management, and app updates.
 * Supports switching between Production and Beta release channels.
 *
 * Core Functions:
 * - getCurrentChannel() - Get active update channel
 * - setUpdateChannel() - Switch between Production/Beta
 * - checkForUpdates() - Check if newer version available
 * - compareVersions() - Compare semantic versions
 * - triggerUpdate() - Install update (clear cache + reload)
 *
 * Channel Management:
 * - Production: Stable releases (v2.0.1)
 * - Beta: Test releases (B0.3.0)
 * - User data preserved during channel switches
 *
 * Usage:
 * ```javascript
 * import { checkForUpdates, setUpdateChannel, triggerUpdate } from '@/utils/updateManager'
 *
 * // Switch to beta channel
 * setUpdateChannel('beta')
 *
 * // Check for updates
 * const update = await checkForUpdates()
 * if (update.hasUpdate) {
 *   await triggerUpdate()
 * }
 * ```
 */

import {
  RELEASE_CHANNELS,
  DEFAULT_CHANNEL,
  CHANNEL_STORAGE_KEY,
  CHANNEL_SWITCH_TIMESTAMP_KEY,
  getChannelById
} from '../config/channels'
import { APP_VERSION } from '../config/version'

/**
 * Get current active channel from localStorage
 * Falls back to DEFAULT_CHANNEL if not set or invalid
 *
 * @returns {Object} Channel configuration object
 */
export const getCurrentChannel = () => {
  const stored = localStorage.getItem(CHANNEL_STORAGE_KEY)

  // Validate stored channel
  if (stored && (stored === 'production' || stored === 'beta')) {
    return RELEASE_CHANNELS[stored.toUpperCase()]
  }

  // Fallback to default
  return DEFAULT_CHANNEL
}

/**
 * Set active update channel
 * Switches between Production and Beta channels
 *
 * @param {string} channelId - Channel ID ('production' or 'beta')
 * @throws {Error} If channelId is invalid
 * @returns {Object} The newly active channel configuration
 */
export const setUpdateChannel = (channelId) => {
  const isValid = Object.values(RELEASE_CHANNELS).some(ch => ch.id === channelId)

  if (!isValid) {
    throw new Error(`Invalid channel: ${channelId}. Must be 'production' or 'beta'`)
  }

  // Store channel preference
  localStorage.setItem(CHANNEL_STORAGE_KEY, channelId)

  // Record timestamp of channel switch
  localStorage.setItem(CHANNEL_SWITCH_TIMESTAMP_KEY, Date.now().toString())

  console.log(`✓ Update channel switched to: ${channelId}`)

  return getCurrentChannel()
}

/**
 * Check for updates from current channel
 * Fetches version.json from deployment URL and compares with current version
 *
 * @returns {Promise<Object>} Update information object
 * @property {boolean} hasUpdate - True if update available
 * @property {string} currentVersion - Currently installed version
 * @property {string} latestVersion - Latest available version
 * @property {string} channel - Active channel ID
 * @property {string} downloadUrl - URL to download update
 * @property {string} [error] - Error message if check failed
 */
export const checkForUpdates = async () => {
  const channel = getCurrentChannel()

  try {
    // Fetch version.json from deployment URL with cache-busting
    const response = await fetch(`${channel.deploymentUrl}/version.json?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const remoteVersion = await response.json()

    // Validate response
    if (!remoteVersion.version || !remoteVersion.channel) {
      throw new Error('Invalid version.json format')
    }

    // Normalize versions for comparison (remove v or B prefix)
    const currentClean = APP_VERSION.replace(/^[vB]/, '')
    const remoteClean = remoteVersion.version.replace(/^[vB]/, '')

    // Compare versions
    const comparison = compareVersions(remoteClean, currentClean)
    const hasUpdate = comparison > 0

    console.log(
      `[Update Check] Current: ${APP_VERSION}, Remote: ${remoteVersion.version}, Has Update: ${hasUpdate}`
    )

    return {
      hasUpdate,
      currentVersion: APP_VERSION,
      latestVersion: remoteVersion.version,
      channel: channel.id,
      channelName: channel.name,
      releaseNotes: remoteVersion.releaseNotes || '',
      downloadUrl: channel.deploymentUrl,
      buildDate: remoteVersion.buildDate,
      gitTag: remoteVersion.gitTag
    }
  } catch (error) {
    console.error('[Update Check] Failed:', error)

    return {
      hasUpdate: false,
      currentVersion: APP_VERSION,
      channel: channel.id,
      error: error.message
    }
  }
}

/**
 * Compare semantic versions
 * Supports both Production (v2.0.1) and Beta (B0.3.0) formats
 *
 * @param {string} v1 - First version (e.g. '2.0.1' or 'B0.3.0')
 * @param {string} v2 - Second version (e.g. '2.0.0' or 'B0.2.5')
 * @returns {number} 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 *
 * @example
 * compareVersions('2.0.1', '2.0.0') // => 1
 * compareVersions('B0.3.0', 'B0.3.1') // => -1
 * compareVersions('v2.1.0', 'v2.1.0') // => 0
 */
export const compareVersions = (v1, v2) => {
  // Remove prefixes (v or B) if present
  const clean1 = v1.replace(/^[vB]/, '')
  const clean2 = v2.replace(/^[vB]/, '')

  // Split into parts and convert to numbers
  const parts1 = clean1.split('.').map(Number)
  const parts2 = clean2.split('.').map(Number)

  // Compare each part (major, minor, patch)
  for (let i = 0; i < 3; i++) {
    const p1 = parts1[i] || 0
    const p2 = parts2[i] || 0

    if (p1 > p2) return 1
    if (p1 < p2) return -1
  }

  return 0
}

/**
 * Trigger app update
 * Steps:
 * 1. Unregister all service workers
 * 2. Clear all caches
 * 3. Reload app from new channel URL
 *
 * IMPORTANT: This preserves user data (localStorage reading progress)
 * Only code and assets are refreshed
 *
 * @returns {Promise<void>}
 */
export const triggerUpdate = async () => {
  console.log('[Update] Starting update process...')

  try {
    // Step 1: Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()

      for (const registration of registrations) {
        await registration.unregister()
        console.log('[Update] Service worker unregistered')
      }
    }

    // Step 2: Clear all caches
    if ('caches' in window) {
      const cacheKeys = await caches.keys()

      await Promise.all(
        cacheKeys.map(async key => {
          await caches.delete(key)
          console.log(`[Update] Cache deleted: ${key}`)
        })
      )
    }

    console.log('[Update] All caches cleared')

    // Step 3: Reload app (hard reload to bypass cache)
    // This will load from the active channel's deployment URL
    console.log('[Update] Reloading app...')
    window.location.reload(true)
  } catch (error) {
    console.error('[Update] Error during update:', error)
    throw error
  }
}

/**
 * Get last channel switch timestamp
 *
 * @returns {number|null} Timestamp in milliseconds, or null if never switched
 */
export const getLastChannelSwitch = () => {
  const timestamp = localStorage.getItem(CHANNEL_SWITCH_TIMESTAMP_KEY)
  return timestamp ? parseInt(timestamp, 10) : null
}

/**
 * Get installed version information
 * Includes version, channel, installation date, etc.
 *
 * @returns {Object} Version info object
 */
export const getInstalledVersionInfo = () => {
  const channel = getCurrentChannel()
  const lastSwitch = getLastChannelSwitch()

  return {
    version: APP_VERSION,
    channelId: channel.id,
    channelName: channel.name,
    channelUrl: channel.deploymentUrl,
    lastChannelSwitch: lastSwitch,
    lastChannelSwitchDate: lastSwitch ? new Date(lastSwitch).toLocaleString() : 'Nie',
    installDate: localStorage.getItem('app_firstLaunch') || 'unknown'
  }
}

/**
 * Format version for display
 * Removes dev prefix if present
 *
 * @param {string} version - Version string
 * @returns {string} Formatted version
 */
export const formatVersion = (version) => {
  return version.replace(/^dev/, '').replace(/^v/, '').replace(/^B/, 'Beta ')
}

/**
 * Check if current version is a beta version
 *
 * @returns {boolean} True if beta version
 */
export const isBetaVersion = () => {
  return APP_VERSION.startsWith('B') || APP_VERSION.startsWith('dev')
}

/**
 * Get channel name from version string
 *
 * @param {string} version - Version string
 * @returns {string} Channel name ('production' or 'beta')
 */
export const getChannelFromVersion = (version) => {
  if (version.startsWith('B') || version.startsWith('dev')) {
    return 'beta'
  }
  return 'production'
}

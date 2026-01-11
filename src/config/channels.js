/**
 * Release Channel Configuration
 *
 * Defines available update channels for the Bible Reading Companion app.
 * Admin users can switch between Production (stable) and Beta (test) channels.
 *
 * Architecture:
 * - Two separate Vercel deployments (Production & Beta)
 * - Each channel has its own deployment URL
 * - Version format: v* for Production (v2.0.1), B* for Beta (B0.3.0)
 * - Automatic update checks at configurable intervals
 *
 * Usage:
 * import { RELEASE_CHANNELS, getCurrentChannel } from '@/config/channels'
 */

export const RELEASE_CHANNELS = {
  /**
   * PRODUCTION Channel
   * - Stable, tested releases for end users
   * - Deployed from master branch
   * - Version format: v{MAJOR}.{MINOR}.{PATCH} (e.g. v2.0.1)
   * - Update checks every 1 hour
   * - Manual update only (never auto-update)
   */
  PRODUCTION: {
    id: 'production',
    name: 'Stabile Version',
    description: 'Getestete Version für Produktiveinsatz',
    deploymentUrl: 'https://brc-liard.vercel.app',
    versionPrefix: 'v',                    // v2.0.1, v2.1.0
    versionPattern: /^v\d+\.\d+\.\d+$/,    // Regex to validate version format
    updateCheckInterval: 3600000,          // 1 hour in milliseconds
    autoUpdate: false,                     // Never auto-update production
    enabled: true
  },

  /**
   * BETA Channel
   * - Test releases for beta testers and admins
   * - Deployed from development branch
   * - Version format: B{MAJOR}.{MINOR}.{PATCH} (e.g. B0.3.0)
   * - Update checks every 30 minutes
   * - Asks user before updating (not automatic)
   */
  BETA: {
    id: 'beta',
    name: 'Beta-Version',
    description: 'Testversion mit neuen Features (kann instabil sein)',
    deploymentUrl: 'https://brc-beta.vercel.app',
    versionPrefix: 'B',                    // B0.3.0, B0.3.1
    versionPattern: /^B\d+\.\d+\.\d+$/,    // Regex to validate version format
    updateCheckInterval: 1800000,          // 30 minutes in milliseconds
    autoUpdate: false,                     // Ask user before updating
    enabled: true
  }
}

/**
 * Default channel for new installations
 */
export const DEFAULT_CHANNEL = RELEASE_CHANNELS.PRODUCTION

/**
 * localStorage key for storing active channel
 */
export const CHANNEL_STORAGE_KEY = 'settings_updateChannel'

/**
 * localStorage key for storing last channel switch timestamp
 */
export const CHANNEL_SWITCH_TIMESTAMP_KEY = 'settings_lastChannelSwitch'

/**
 * Get channel configuration by ID
 * @param {string} channelId - Channel ID ('production' or 'beta')
 * @returns {Object} Channel configuration object
 */
export const getChannelById = (channelId) => {
  return Object.values(RELEASE_CHANNELS).find(ch => ch.id === channelId) || DEFAULT_CHANNEL
}

/**
 * Validate if version string matches channel pattern
 * @param {string} version - Version string to validate
 * @param {string} channelId - Channel ID to validate against
 * @returns {boolean} True if version matches channel pattern
 */
export const isValidVersionForChannel = (version, channelId) => {
  const channel = getChannelById(channelId)
  return channel.versionPattern.test(version)
}

/**
 * Get all enabled channels
 * @returns {Array} Array of enabled channel configurations
 */
export const getEnabledChannels = () => {
  return Object.values(RELEASE_CHANNELS).filter(ch => ch.enabled)
}

/**
 * Device ID Management
 *
 * Generates and manages a unique device identifier for progress tracking.
 * Used to sync device-specific progress to Firebase.
 *
 * Phase 1: Device-based tracking
 * Phase 3: Can be extended to support multiple devices per user (via userId)
 */

const DEVICE_ID_KEY = 'bibleCompanion_deviceId'
const DEVICE_NAME_KEY = 'bibleCompanion_deviceName'

/**
 * Generate a simple UUID v4
 * @returns {string} UUID in format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Get or create device ID
 * Uses localStorage to persist the device ID across sessions.
 * UUID is generated once and reused.
 *
 * @returns {string} Unique device ID
 */
export function getOrCreateDeviceId() {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY)

  if (!deviceId) {
    deviceId = generateUUID()
    localStorage.setItem(DEVICE_ID_KEY, deviceId)
    console.log(`✓ New device ID created: ${deviceId}`)
  }

  return deviceId
}

/**
 * Get device name (user-friendly identifier)
 * Auto-detects browser and OS, can be customized by user
 *
 * @returns {string} Device name
 */
export function getDeviceName() {
  let customName = localStorage.getItem(DEVICE_NAME_KEY)

  if (customName) {
    return customName
  }

  // Auto-detect browser and OS
  const ua = navigator.userAgent
  let browserName = 'Unknown'
  let osName = 'Unknown'

  // Browser detection
  if (ua.indexOf('Chrome') > -1 && ua.indexOf('Chromium') === -1) {
    browserName = 'Chrome'
  } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
    browserName = 'Safari'
  } else if (ua.indexOf('Firefox') > -1) {
    browserName = 'Firefox'
  } else if (ua.indexOf('Edge') > -1) {
    browserName = 'Edge'
  }

  // OS detection
  if (ua.indexOf('Windows') > -1) {
    osName = 'Windows'
  } else if (ua.indexOf('Mac') > -1) {
    osName = 'macOS'
  } else if (ua.indexOf('Linux') > -1) {
    osName = 'Linux'
  } else if (ua.indexOf('Android') > -1) {
    osName = 'Android'
  } else if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) {
    osName = 'iOS'
  }

  return `${browserName} on ${osName}`
}

/**
 * Set custom device name
 * User can rename their device for easier identification across devices
 *
 * @param {string} name - Custom device name
 */
export function setDeviceName(name) {
  if (name && name.trim()) {
    localStorage.setItem(DEVICE_NAME_KEY, name.trim())
    console.log(`✓ Device name updated: ${name}`)
    return true
  }
  return false
}

/**
 * Reset device ID (creates new device)
 * Useful for testing or when user wants a fresh start
 *
 * @returns {string} New device ID
 */
export function resetDeviceId() {
  const newDeviceId = generateUUID()
  localStorage.setItem(DEVICE_ID_KEY, newDeviceId)
  console.log(`✓ Device ID reset to: ${newDeviceId}`)
  return newDeviceId
}

/**
 * Get device info summary
 * @returns {Object} Device information
 */
export function getDeviceInfo() {
  return {
    deviceId: getOrCreateDeviceId(),
    deviceName: getDeviceName(),
    userAgent: navigator.userAgent,
    language: navigator.language
  }
}

/**
 * Application Version
 *
 * Update this whenever you release a new version.
 * Format: MAJOR.MINOR.PATCH
 * - MAJOR: Large features, breaking changes
 * - MINOR: New features (like multi-device sync, auth)
 * - PATCH: Bug fixes
 */

export const APP_VERSION = '0.1.0'

/**
 * Build Information
 * Updated automatically with each build
 */
export const BUILD_DATE = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
export const BUILD_INFO = `v${APP_VERSION} (${BUILD_DATE})`

/**
 * Version History
 *
 * 0.1.0 (Multi-Device Sync + Personal Reading Release)
 * - Firebase authentication (email/password)
 * - Multi-device sync with auth status indicator
 * - Real-time chapter progress sync across devices
 * - Pull-to-refresh for Firebase sync with reconstruction
 * - Enhanced logging for sync debugging
 * - Centralized version management system
 * - Personal Reading Page with verse-level progress tracking
 * - Support for complete and partial chapter reads
 * - Accurate verse counting across all 66 books
 * - Deep integration with JW.org Bible links
 *
 * 0.0.1 (Initial Release)
 * - Daily text tracking
 * - Weekly reading with verse-based progress
 * - Personal Bible program (placeholder)
 * - Multi-language support (de, en, es, it, fr)
 * - Auth status indicator (LogIn/LogOut icons)
 */

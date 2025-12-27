/**
 * Application Version
 *
 * Update this whenever you release a new version.
 * Format: MAJOR.MINOR.PATCH
 * - MAJOR: Large features, breaking changes
 * - MINOR: New features (like multi-device sync, auth)
 * - PATCH: Bug fixes
 */

export const APP_VERSION = 'dev0.2.0'

/**
 * Build Information
 * Updated automatically with each build
 */
export const BUILD_DATE = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
export const BUILD_TIMESTAMP = new Date().toISOString().split(':').slice(0, 2).join(':') // HH:MM format
export const BUILD_CODE = `${BUILD_DATE.replace(/-/g, '')}-${Math.random().toString(16).substr(2, 8).toUpperCase()}` // YYYYMMDD-RANDOMHEX
export const BUILD_INFO = `v${APP_VERSION} (${BUILD_CODE})`

/**
 * VERSIONING STRATEGY
 * ===================
 *
 * PRODUCTION (master branch)
 *   - 1.0.0, 1.0.1, 1.1.0, 1.2.0, 2.0.0, etc.
 *   - Semantic Versioning: MAJOR.MINOR.PATCH
 *   - 1.0.1 = Bugfix for 1.0.0
 *   - 1.1.0 = New feature added to 1.0.x
 *   - 2.0.0 = Breaking changes or major redesign
 *   - For testers and end users (stable, tested)
 *
 * DEVELOPMENT (development branch)
 *   - dev0.2.0, dev0.2.1, dev0.2.2, etc.
 *   - Format: dev0.MINOR.PATCH-[buildcode]
 *   - [buildcode] = YYYYMMDD-RANDOMHEX (auto-generated)
 *   - Example: dev0.2.3-20251228-A3F9C2E1
 *   - For developers and internal testing
 *
 * WORKFLOW
 * ========
 * 1. Work on development branch with dev0.2.x versions
 * 2. When feature is complete and tested:
 *    - Switch to master
 *    - Bump version (1.0.1 for bugfix, 1.1.0 for feature)
 *    - Merge development changes
 *    - Tag and release (v1.0.1, v1.1.0)
 * 3. Continue dev work on development branch
 *
 * Version History
 *
 * dev0.2.0 (Development - Started v2.0 Roadmap)
 * - Comprehensive dark mode support across all UI elements
 * - Dynamic daily text links with date parameter (mobile-friendly JW.org finder URLs)
 * - Fixed thematic topics background colors in dark mode
 * - Fixed external link opening to prevent extra browser window on iOS
 * - Stable foundation for parallel 2.0 development
 * - All 3 reading systems fully functional: Daily Text, Weekly Reading, Personal Programs
 * - 5 languages fully supported (German, English, Spanish, Italian, French)
 * - Multi-device sync with timestamp-based conflict resolution
 * - Firebase authentication and real-time data synchronization
 * - Verse-level progress tracking with partial chapter support
 * - Recommended for production use and as fallback for 2.0 development
 *
 * 0.1.2 (Dark Mode Complete - Form Fields Fix)
 * - Converted SettingsPage form fields to PBP pattern (space-y-2)
 * - Added 298+ missing dark: variants across all pages
 * - Fixed toggle switches, chevrons, buttons in dark mode
 * - Fixed status indicator colors (complete/partial/unread)
 * - Fixed input validation borders and focus rings
 * - All UI elements now properly themed in dark mode
 * - Standardized form field spacing across pages
 *
 * 0.1.1 (Dark Mode Bug Fix Release)
 * - Fixed theme toggle buttons to properly override system preference
 * - Added dark mode styling to yeartext component (now fully readable)
 * - Fixed remaining white backgrounds across all pages
 * - Comprehensive dark mode coverage for all UI elements
 * - Default theme changed from 'light' to 'system' for better UX
 * - Hover states properly styled for dark mode
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

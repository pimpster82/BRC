# 📋 Development To-Do List

> **Note:** This file is used to track development tasks and progress. Update checkboxes as items are completed.
> For more context, see `CLAUDE.md` - Development Guide.

---

## ⚠️ CRITICAL: PRODUCTION PROTECTION

**🚨 DO NOT PUSH DIRECTLY TO MASTER BRANCH 🚨**

### Branch Structure (Parallel Dev + Prod)

```
master (PRODUCTION) ❌ DO NOT WORK HERE
  ├── Version: 1.0.0, 1.0.1, 1.1.0, etc.
  ├── Status: STABLE & TESTED
  ├── Testers Use: YES
  ├── Deployment: Vercel (Live at https://brc-liard.vercel.app)
  └── Tagged Releases: v1.0.0, v1.0.1, v1.1.0, etc.

development (CURRENT WORK) ✅ WORK HERE
  ├── Version: dev0.2.0, dev0.2.1, dev0.2.2, etc.
  ├── Status: EXPERIMENTAL & UNDER DEVELOPMENT
  ├── Testers Use: NO (internal testing only)
  ├── Deployment: NOT pushed to Vercel production
  └── LINKED_PRODUCTION_VERSION: Tracks which prod is live
```

### Safety Rules

1. **ALWAYS work on `development` branch:**
   ```bash
   git checkout development  # ✅ CORRECT
   git checkout master       # ❌ NEVER do this to work
   ```

2. **NEVER push directly to master:**
   ```bash
   git push origin development  # ✅ CORRECT
   git push origin master       # ❌ ONLY for releases
   ```

3. **ONLY merge to master when:**
   - Feature is complete AND tested
   - Code reviewed
   - Ready for production release
   - Version number bumped (1.0.1, 1.1.0, etc.)

4. **Release Workflow (when feature ready):**
   ```bash
   # 1. Finalize on development
   git checkout development
   git add . && git commit -m "..."
   git push origin development

   # 2. Switch to master for release
   git checkout master

   # 3. Bump version in package.json & src/config/version.js
   # Edit: version = "1.0.1" or "1.1.0"

   # 4. Commit & tag release
   git add . && git commit -m "Release v1.0.1: ..."
   git tag v1.0.1
   git push origin master && git push origin v1.0.1

   # 5. Back to development with updated baseline
   git checkout development
   # Update LINKED_PRODUCTION_VERSION = "1.0.1"
   git add src/config/version.js
   git commit -m "Update linked prod version to 1.0.1"
   # Increment dev version: dev0.2.1 → dev0.2.2
   ```

5. **Check Current Branch:**
   ```bash
   git branch -v  # Shows: * development (current) or * master
   ```

### Rollback Safety

- `LINKED_PRODUCTION_VERSION` in `src/config/version.js` = which prod is live
- If you need to rollback: check git history, checkout previous tag
- Example: `git checkout v1.0.0` (returns to v1.0.0 state)

---

## 🚀 Session Start - Files to Read First

**Before starting work, read these files to understand the codebase architecture and available helpers:**

### Core System Files (READ FIRST)
1. **`CLAUDE.md`** - Developer guide, implementation status, key architectural decisions
2. **`CONTEXT.md`** - Quick start, current features, tech stack, file overview
3. **`docs/GOALS.md`** - System requirements, feature specifications

### Key Utilities & Helpers (Know What's Available)

**Storage & Data Persistence:**
- **`src/utils/storage.js`** - LocalStorage CRUD for daily/weekly/personal reading
  - Functions: `getDailyTextData()`, `markDailyTextComplete()`, `saveDailyTextData()`
  - Also: Firebase sync wrappers, schedule caching

**Firebase & Sync:**
- **`src/utils/firebaseUserProgress.js`** - User auth-based progress sync
  - Functions: `saveDailyProgressToFirebase()`, `saveWeeklyProgressToFirebase()`, `savePersonalProgressToFirebase()`
  - Also: Device stats, queue processing (when implemented)
- **`src/utils/userProgress.js`** - Merge logic, user progress management
  - Functions: `mergeProgress()` (currently uses last-upload-timestamp, needs fix!)
  - Also: `loadUserProgress()`, `saveUserProgress()`, `validateCompletedDates()`
- **`src/utils/firebaseSchedules.js`** - Schedule caching, year fetching
  - Functions: `loadScheduleFromFirebase()`, `saveScheduleToFirebase()`

**Bible Data & Parsing:**
- **`data/bible-link-builder.js`** - Generate JW.org deep links
  - Key function: `buildLanguageSpecificWebLink(book, startChapter, endChapter, language)`
  - Also: `getLocalizedBookName()`, `buildBibleLink()`
- **`src/utils/readingParser.js`** - Fuzzy Bible reference parsing
  - Key function: `parseReadingInput(input, defaultBook)`
  - Handles: "Genesis 1-3", "Mt 5:1-10", "1mo 2", "Jes 41:10", etc.
  - Also: Spelling suggestions, fuzzy matching
- **`src/utils/scheduleParser.js`** - Convert book references to localized text
  - Key function: `parseReadingText(reading, language)`
  - Outputs: Localized "Isaiah 1-3" in German/English/Spanish/Italian/French
- **`src/utils/verseProgressCalculator.js`** - Accurate verse counting for partial reads
  - Key function: `calculateVerseProgress(chaptersRead, book, startChapter, endChapter)`
  - Handles: Verse-level accuracy (e.g., Genesis 2:3-5 = 3 verses)
  - Also: `formatProgressText()` for display

**Authentication:**
- **`src/context/AuthContext.jsx`** - Firebase Auth management
  - Functions: `useAuth()` hook, login/register/logout
  - Also: `currentUser`, `loading` state, error handling
- **`src/config/firebase.js`** - Firebase initialization
  - Exports: `auth`, `database`, `isFirebaseConfigured()`

**Configuration:**
- **`src/config/i18n.js`** - Multilingual support (5 languages)
  - Key function: `t(key, defaultText, params)` for translations
  - Also: `getCurrentLanguage()`, `setCurrentLanguage()`
- **`src/config/reading-categories.js`** - 7 Bible book categories for Free reading plan
- **`src/config/thematic-topics.js`** - 17 thematic study topics for Thematic plan
- **`src/config/languages.js`** - Language configuration

**Schedule Loading:**
- **`data/weekly-reading-schedule.js`** - Schedule loader with fallback logic
  - Key function: `getCurrentWeekReading(meetingDay, date)` ⚠️ HAS OFF-BY-ONE BUG!
  - Also: `loadScheduleForYear()`, `getScheduleForYear()`, `formatWeekRange()`
  - Data structure: `{ weekStart, weekEnd, reading, book, chapters }`

### Important Data Structures to Know

**Daily Text Progress:**
```javascript
{
  completedDates: ['2025-12-24', '2025-12-25'],
  currentStreak: 2,
  longestStreak: 5,
  lastUpdated: 1703520000000  // Timestamp (milliseconds)
}
```

**Weekly Reading Progress:**
```javascript
{
  completedWeeks: [
    {
      weekStart: '2025-12-22',
      chapters: [true, true, false],  // book chapters read status
      reading: { book: 23, startChapter: 1, endChapter: 3 }
    }
  ],
  currentMeetingDay: 2  // 0-6 (Sunday-Saturday), 2 = Tuesday
}
```

**Personal Reading Progress:**
```javascript
{
  chaptersRead: [
    { book: 1, chapter: 1, status: 'complete', timestamp: 1234567890 },
    { book: 1, chapter: 2, status: 'partial', verses: 15, timestamp: 1234567891 }
  ],
  thematicTopicsRead: [1, 2, 5, 8],  // Topic IDs that are complete
  selectedPlan: 'free'  // or 'thematic', 'chronological', 'oneyear'
}
```

**Firebase User Progress Structure:**
```javascript
/users/{userId}/progress/
  ├── daily/
  │   ├── completedDates: [...]
  │   ├── currentStreak: number
  │   └── lastUpdated: timestamp
  ├── weekly/
  │   ├── completedWeeks: [...]
  │   └── lastUpdated: timestamp
  └── personal/
      ├── chaptersRead: [...]
      └── lastUpdated: timestamp
```

### Key Concepts to Remember

1. **Timestamp Bug** 🔴 - `lastUpdated` is set on Firebase UPLOAD, not on local action
   - This causes issues with offline conflicts
   - See: Item #1 in CRITICAL BUGS and #2-9 in Multi-Device Sync section

2. **Meeting Day Logic** 🔴 - Currently searches LAST meeting day, should search NEXT
   - User sets meeting day (e.g., Tuesday = 2)
   - App should show reading for the week CONTAINING next meeting day
   - Bug: Shows reading for week containing LAST meeting day
   - See: CRITICAL BUG #1

3. **Schedule Strategy** - Three-level fallback:
   - Level 1: localStorage cache (fastest)
   - Level 2: Firebase (synced across devices)
   - Level 3: Static data files (offline fallback)

4. **Multi-Language** - All Bible book names and UI strings available in 5 languages
   - Use: `t('key')` for translations, never hardcode strings
   - See: `src/config/i18n.js` for all available keys

5. **Firebase Auth is Optional** - App works offline or without login
   - With auth: Data syncs across devices
   - Without auth: Data stays in localStorage only

---

## 🔴 CRITICAL BUGS (High Priority)

- [x] **getCurrentWeekReading() Off-By-One Week Bug** ✅ FIXED
  - Issue: Searches for LAST meeting day instead of NEXT meeting day
  - Impact: Users see wrong Bible reading week
  - File: `/data/weekly-reading-schedule.js` line 142-198
  - Fix: Changed `daysSinceLastMeeting` → `daysUntilNextMeeting`
  - Status: ✅ COMPLETED - Commit 0f77e39

---

## 🔧 NEW BUGS FOUND DURING TESTING (Testing Session 2025-12-26)

### Language Initialization
- [x] **Language Settings Mismatch: Settings UI showed English while App UI rendered German**
  - **Root Cause:** Two `getCurrentLanguage()` functions with inconsistent defaults
    - `languages.js`: `DEFAULT_LANGUAGE = 'en'`
    - `i18n.js`: fallback to `'de'`
  - **Fix Applied:** Both functions now detect browser locale and default to 'en' (Commit 0d042f3)
  - **Behavior:** Auto-detect `navigator.language` from browser, respect localStorage override
  - **Status:** ✅ FIXED

### Weekly Reading Schedule
- [x] **WeeklyReadingCard renders without schedule data on cold start** ✅ FIXED
  - **Root Cause:** Schedule files were `.js.old` (deprecated), migrated to Firebase; user must import via Settings first
  - **Fix Applied:** Added helpful error state with direct link to Settings → Schedule Update (Commit cde7b58)
  - **Behavior:** When no schedule exists, shows "No reading available" + clickable link to Settings
  - **Status:** ✅ FIXED - Improved UX with actionable guidance

### Thematic Reading Links
- [x] **Thematic reading scripture links always navigate to first verse of section** ✅ FIXED
  - **Root Cause:** `buildLanguageSpecificWebLink()` only used start verse in JW.org URL, ignored end verse
  - **Fix Applied:** Enhanced link builder to support verse ranges (BBCCCVVV-BBCCCVVV format) (Commit 6d15652)
  - **Changes:**
    - `buildLanguageSpecificWebLink()`: Now creates verse range URLs when `endVerse` specified
    - `versesLinksBuilder.js`: Improved verse range handling for thematic topics
  - **Behavior:** Links now highlight correct verse ranges (e.g., "Psalm 117-119:10" → shows those verses)
  - **Status:** ✅ FIXED

### Personal Bible Program Card
- [x] **PersonalReadingCard "Next: {chapter}" text should be interactive link** ✅ IMPLEMENTED
  - **Fix Applied:** Convert "Next: Genesis 1" text to clickable button with query params (Commit 28a441d)
  - **Implementation:**
    - PersonalReadingCard: Button navigates to `/personal-reading?book={bookNumber}&chapter={chapterNumber}`
    - PersonalReadingPage: Reads query params, automatically opens chapter modal for requested book
  - **Behavior:** Users can now click next reading from home card, jumps to that chapter modal in PBP page
  - **Status:** ✅ IMPLEMENTED

### Date Formatting
- [x] **Date display always in German, should be language-specific** ✅ FIXED
  - **Root Cause:** `HomePage.jsx` hardcoded `toLocaleDateString('de-DE', options)` regardless of selected language
  - **Fix Applied:** Made date formatting respect current language with locale mapping (Commit af23d38)
  - **Implementation:**
    - Add locale map: `de: 'de-DE'`, `en: 'en-US'`, `es: 'es-ES'`, `it: 'it-IT'`, `fr: 'fr-FR'`
    - Call `getCurrentLanguage()` in `getFormattedDate()`
    - Pass correct locale to `toLocaleDateString()`
  - **Also Fixed:** Removed "TODAY" label from date display (shows only formatted date)
  - **Behavior:** Date now displays in user's language (Monday/Montag/Lunes/Lunedì/Lundi)
  - **Status:** ✅ FIXED - File: `src/pages/HomePage.jsx` lines 248-265

### User Interface & Navigation
- [x] **PersonalReadingPage link/info integration requires refactoring** ✅ COMPLETED
  - **Issue:** Multiple link sources (JW.org, next reading, continue position) need unified navigation strategy
  - **Solution Implemented:** "Continue Where You Left Off" pattern for all reading plans
  - **Implementation Details:**
    - Unified "next link" concept in PersonalReadingCard.jsx
    - Free Plan: Shows next chapter based on chaptersRead array
    - Thematic Plan: Shows next unread topic based on thematicTopicsRead array
    - Both navigate intelligently to continue exactly where user left off
  - **Documentation:** Added comprehensive "Next Link Strategy" section to CLAUDE.md with templates for future plans
  - **Files Updated:**
    - `src/components/PersonalReadingCard.jsx` - Plan-aware next link logic
    - `src/pages/PersonalReadingPage.jsx` - Proper topic expansion and "last read" tracking
    - `CLAUDE.md` - Architecture documentation for next link pattern
  - **Priority:** MEDIUM (design consistency)
  - **Status:** ✅ COMPLETED - Commits 21edcea, 3fca0c4

### Application Icon Design
- [x] **Design and implement app icon (open Bible 3D outline style)** ✅ COMPLETED
  - **Design Spec (v1 - Deprecated):**
    - Style: Minimalist open Bible with 3D perspective (45°/30° rotation)
    - Strokes: Thick white outline (no fill) for clean, modern look
    - Inspired by user's reference image
  - **Implementation (v1):**
    - Created: `public/icons/open-bible-icon.svg` (minimalist vector design)
    - Generated variants: 16x16, 32x32, 192x192, 512x512 PNG files
    - Used: sharp library for high-quality PNG conversion
  - **Priority:** LOW (PWA polish)
  - **Status:** ✅ COMPLETED (v1)
  - **Result:** Initial minimalist icon design completed

### iOS 2025 App Icon System (Light/Dark/Tinted Variants)
- [x] **Implement iOS 2025-compliant app icons with Light/Dark/Tinted variants** ✅ COMPLETED
  - **Design Spec (v2 - AI Generated):**
    - Tool: DALL-E 3 (GPT-4 subscription)
    - Style: Professional lineart, open Bible with verse lines
    - Colors: Navy blue outline (#1a3a52), blue bookmark accent (#2563eb)
    - 3 Required Variants per Apple iOS 2025 requirements:
      - ☀️ Light Mode: White pages, navy outline, transparent/light background
      - 🌙 Dark Mode: White pages, dark gray background, navy outline
      - 🎨 Tinted Mode: Full grayscale (opaque), Gray Gamma 2.2 for system color tinting
  - **Implementation:**
    - Generated: 10 PNG files at multiple sizes (192, 512, 1024)
      - `icon-light-192.png`, `icon-light-512.png`, `icon-light-1024.png`
      - `icon-dark-192.png`, `icon-dark-512.png`, `icon-dark-1024.png`
      - `icon-tinted-192.png`, `icon-tinted-512.png`, `icon-tinted-1024.png`
    - Created: Modern SVG matching PNG design (`open-bible-icon.svg`)
    - iOS-specific: Maintained 120×120, 152×152, 167×167, 180×180 sizes
  - **Configuration Updates:**
    - Updated: `public/manifest.json` with all 3 variants + proper `purpose` attributes
      - Light/Dark: `purpose: "any maskable"`
      - Tinted: `purpose: "monochrome"`
    - Updated: `index.html` with dark mode favicon support
      - Light favicon: `icon-light-192.png` & `icon-light-512.png`
      - Dark favicon: `icon-dark-192.png` & `icon-dark-512.png` (auto-detected via `media="(prefers-color-scheme: dark)"`)
      - iOS: `apple-touch-icon` links with Light Mode primary
    - Created: `docs/iOS_APP_ICON_SETUP.md` - Complete Xcode setup guide for native iOS apps
    - Created: `public/icons/README.md` - Icon variants documentation
  - **Cleanup:**
    - Deleted: 13 old icon files (47% storage reduction)
      - Old SVG, old PNGs, ICO file, duplicate DALL-E sources
    - Kept: Only iOS 2025-compliant variants
  - **Technical Compliance:**
    - Color Space (Light/Dark): sRGB
    - Color Space (Tinted): Gray Gamma 2.2
    - Format: PNG (all), SVG (vector)
    - No manual corner rounding (Apple applies system "squircle" mask)
    - Fully opaque tinted variant (per Apple requirements)
  - **Files Modified/Created:**
    - Modified: `index.html`, `public/manifest.json`, `readytoremove.md`
    - Created: `docs/iOS_APP_ICON_SETUP.md`, `public/icons/README.md`
    - Added: 10 iOS 2025-compliant PNG variants
    - Removed: 13 deprecated icon files
  - **Priority:** MEDIUM (required for App Store + PWA compliance)
  - **Status:** ✅ COMPLETED - Commit 3f548be
  - **Result:** Production-ready iOS 2025 icons ready for App Store submission + PWA deployment

### Dark Mode Theme Support
- [x] **Implement dark mode with Light/Dark/System options** ✅ COMPLETED
  - **Theme Options:**
    - ☀️ Light: Bright design (light blue gradients, white cards)
    - 🌙 Dark: Dark slate background with proper contrast (slate-950 bg, slate-900 cards)
    - 💻 System: Respects device/OS dark mode preference (prefers-color-scheme)
  - **Implementation:**
    - Created: `src/context/ThemeContext.jsx` - Global theme state management
    - Configuration: `tailwind.config.cjs` with `darkMode: 'selector'`
    - Updated: `src/styles/index.css` with dark: variants for all components
    - Integration: App.jsx wrapped with ThemeProvider
    - UI: Theme toggle in Settings → Display Settings (3 buttons)
  - **Color Palette (Dark Mode):**
    - Primary background: slate-950 (#0f172a)
    - Card background: slate-900 (#111827)
    - Primary text: gray-50 (#f9fafb)
    - Secondary text: gray-300 (#d1d5db)
    - Borders: gray-700, gray-800 variants
    - Accent colors: Lighter variants for visibility
  - **Coverage:**
    - Pages: All 7 pages (HomePage, WeeklyReading, PersonalReading, Settings, Login, Register, ParserTestBench)
    - Components: All card components, input fields, buttons, text elements
    - Common elements: Gradients, backgrounds, borders, shadows
  - **Features:**
    - localStorage persistence (`settings_theme`)
    - System preference auto-detection via `prefers-color-scheme` media query
    - Smooth 300ms transitions when switching themes
    - Proper contrast ratios for accessibility (WCAG AA standard)
  - **Files Updated/Created:**
    - `src/context/ThemeContext.jsx` - New context for theme management
    - `tailwind.config.cjs` - Added darkMode configuration
    - `src/styles/index.css` - Added 60+ dark: variant rules
    - `src/App.jsx` - Added ThemeProvider wrapper
    - `src/pages/SettingsPage.jsx` - Theme toggle buttons in Display Settings
    - All component files - Added dark: Tailwind classes
  - **Priority:** MEDIUM (user experience enhancement)
  - **Status:** ✅ COMPLETED - Commit 283792f
  - **Result:** Professional dark mode ready for production with system preference detection

---

## 📱 Multi-Device Sync System (Phase 3: Complete ✅)

- [x] **Fix Firebase Sync: Timestamp beim Markieren setzen, nicht beim Upload** ✅ COMPLETED
  - Implementation: Set `lastUpdated = Date.now()` when user marks item locally
  - Storage: Preserved in localStorage when queuing, passed to Firebase on upload
  - Impact: Offline conflicts now resolved by actual action time, not upload time
  - Files: `src/utils/storage.js` (lines 43-82, 557-582), `src/utils/firebaseUserProgress.js` (lines 65-67, 121-123, 175-177)
  - Status: ✅ COMPLETED - Commit 326a5c3

- [x] **Implement Offline Sync Queue System für multi-device conflicts** ✅ COMPLETED
  - Implementation: `bibleCompanion_pendingSyncQueue` in localStorage
  - Queue structure: `[{ id, section, action, data, timestamp, synced, retries }, ...]`
  - Features: FIFO order, deduplication, retry logic, event-sourcing
  - Files: New `src/utils/syncQueue.js` (160 lines), `src/utils/storage.js` (new functions)
  - Status: ✅ COMPLETED - Commit 0cfe5e6

- [x] **Add Event-Sourcing for action history instead of state-only storage** ✅ COMPLETED
  - Implementation: Queue stores complete action history with timestamps
  - Benefit: Actions replayed in order when device comes online, ensuring correct final state
  - Example: Mark → Unmark → Mark sequence replays correctly to final "marked" state
  - Files: `src/utils/syncQueue.js` line 10-50
  - Status: ✅ COMPLETED - Commit 0cfe5e6

- [x] **Implement Deduplication Logic: Nach (section, date, action) composite key** ✅ COMPLETED
  - Implementation: Queue item IDs use format `{section}_{identifier}_{action}` (e.g., `daily_2025-12-25_mark_complete`)
  - Behavior: New action on same item replaces previous action in queue (not duplicated)
  - Impact: User marks/unmarks same date multiple times → only final action queued
  - Files: `src/utils/syncQueue.js` line 27-38
  - Status: ✅ COMPLETED - Commit 0cfe5e6

- [x] **Add Queue-Item processing with FIFO order for pending syncs** ✅ COMPLETED
  - Implementation: `processPendingSyncQueue(userId)` function
  - Process: Get next unsynced item, execute action, sync to Firebase, mark synced, repeat
  - FIFO Guarantee: Only processes `getNextPendingItem()` which returns lowest sequence number
  - Files: `src/utils/firebaseUserProgress.js` lines 367-481
  - Status: ✅ COMPLETED - Commit 0cfe5e6

- [x] **Update mergeProgress() to handle action conflicts correctly** ✅ COMPLETED
  - Implementation: Compare `lastUpdated` timestamps (now set at action time, not upload time)
  - Logic: Firebase version wins if timestamp > local (with tiebreaker to Firebase)
  - Documentation: Added clear explanation that timestamps are ACTION-based
  - Files: `src/utils/userProgress.js` lines 145-231
  - Status: ✅ COMPLETED - Commit de5f38d

- [x] **Write test cases for multi-device sync scenarios (offline conflicts)** ✅ COMPLETED
  - Documentation: Comprehensive test scenarios with setup/timeline/assertions
  - Test Coverage: 5 scenarios (offline single device, multi-device conflict, deduplication, FIFO order, retry logic)
  - Manual Testing: Full checklist with 4 test cases and verification steps
  - Files: New `docs/MULTI_DEVICE_SYNC_TESTS.md` (350+ lines)
  - Status: ✅ COMPLETED - Comprehensive test documentation ready

- [x] **Document sync logic in CLAUDE.md with examples** ✅ IN PROGRESS
  - Required: Add section explaining queue system, timestamps, merging with architecture diagrams
  - Examples: Concrete before/after scenarios showing correct conflict resolution
  - Files: `CLAUDE.md` (new Multi-Device Sync System section)
  - Status: 🔄 IN PROGRESS - Adding documentation now

- [x] **Handle online/offline transitions gracefully (window events)** ✅ COMPLETED
  - Implementation: Registered `window.online` and `window.offline` event listeners
  - Behavior: On 'online' event, calls `processPendingSyncQueue(userId)` to sync queued actions
  - Error Handling: Try/catch with console logging for debugging
  - Files: `src/App.jsx` lines 41-72
  - Status: ✅ COMPLETED - Commit 5d0a1f4

---

## 📚 Weekly Schedule Management

- [x] **Implement Schedule Sync Strategy: lokaler Cache → Firebase → WOL Fallback** ✅ DONE
  - **Completed:** Firebase is now Priority #3 in loadScheduleForYear() (Commit 50e4852)
  - Priority order: Memory → LocalStorage → **Firebase** → Static Files (Offline)
  - One admin generates schedule once (via Settings), all users load from Firebase
  - No more individual users downloading from WOL (too many requests!)
  - Status: ✅ IMPLEMENTED - Firebase-first strategy active

- [ ] **Auto-Sync New Year Schedule: Ab Dezember täglich prüfen ob nächstes Jahr auf WOL/Firebase verfügbar ist**
  - Logic: In December, daily check if next year's schedule available
  - Phase 3 (Current): Admin manually publishes to Firebase via Settings
  - Phase 4 (Future): Automatic fetch from WOL in December if not yet published
  - When found: Save to Firebase, notify users via Settings
  - Files: New `scheduleAutoSync.js` utility (Phase 4)
  - Status: PHASE 3 (manual), PHASE 4 (design pending)
  - Notes: Schedule usually available Sept/Oct on WOL

- [ ] **Schedule Cache-Versioning: Nur neu downloaden wenn Firebase-Version neuer**
  - Add: Version hash to schedule metadata
  - Add: Compare local version vs Firebase version
  - Only download if Firebase version is newer
  - Structure: `/schedules/{year}/metadata/{ version, hash, lastUpdated }`
  - Files: `firebaseSchedules.js`, `storage.js`
  - Status: NOT STARTED (Phase 4 - optimization)

---

## 🐛 UI/UX Bugs (High Priority)

- [x] **Back Button in Settings should use browser back (navigate(-1)) instead of always going home** ✅ VERIFIED
  - Current: Already uses `navigate(-1)` correctly
  - Status: ✅ ALREADY IMPLEMENTED (line 282)

- [x] **Personal Reading Card "Open" link should go to /personal-reading, not directly to chapter** ✅ VERIFIED
  - Current: Already navigates to `/personal-reading` correctly
  - Status: ✅ ALREADY IMPLEMENTED (line 84)

- [x] **Personal Reading Plan names are inconsistent with available plans** ✅ FIXED
  - Problem: Fallback translation key used wrong namespace
  - Fixed: Changed `t('readingplan.free')` to `t('reading.plan_free')` in SettingsPage.jsx line 465
  - Status: ✅ COMPLETED - Commit 0f77e39

- [x] **Free Reading topics should be collapsed by default, only expand last-read topic** ✅ VERIFIED
  - Status: ✅ ALREADY IMPLEMENTED (initializes expandedCategories with only last-read category expanded)

---

## 📖 Documentation

- [x] **Clarify Weekly Reading Logic in Doku: Lesewoche läuft VON (Tag nach Meeting) BIS (nächster Meeting-Tag)** ✅ COMPLETED
  - **Solution:** Added comprehensive "Meeting Day Cycle & Weekly Reading Logic" section to CLAUDE.md
  - **Documentation Includes:**
    - Core concept: App shows reading for week containing NEXT meeting (not previous)
    - Algorithm explanation: How `getCurrentWeekReading()` calculates which week to display
    - Concrete example: Tuesday meeting with calculations for Monday/Wednesday/Tuesday check-ins
    - Schedule structure: How weekStart/weekEnd dates work
    - Implementation details: File location, function signature, localStorage structure
    - Developer notes: Timezone handling, caching requirements, year boundary transitions
  - **Files Updated:** `CLAUDE.md` lines 191-254
  - **Status:** ✅ COMPLETED - Clear, detailed documentation with examples
  - **Impact:** Future developers now understand the meeting day logic without confusion

### Code Cleanup & File Analysis
- [x] **Analyze codebase for redundant/bloated files** ✅ COMPLETED
  - **Analysis Performed:**
    - Scanned all src/, data/, public/, docs/ directories
    - Identified unused code files (duplicates, orphaned components)
    - Identified bloated/outdated markdown documentation
    - Identified old screenshot files
    - Identified one-time utility scripts
  - **Results:**
    - Created: `readytoremove.md` with complete cleanup checklist
    - Found: 14 files safe for deletion:
      - 5 code files (duplicates, orphaned components, old utilities)
      - 3 old screenshot files (temporary test files)
      - 6 bloated/outdated markdown docs (dark mode guides, old architecture)
  - **Documentation:**
    - Detailed analysis per file with reasoning
    - Space savings calculation: ~260 KB (documentation) + ~1 MB (old icons)
    - Safe deletion checklist with git commands
  - **Status:** ✅ COMPLETED - Commit 3f548be
  - **Result:** Complete cleanup blueprint ready for code maintenance

---

## 🔐 Admin Access System (v1.1.0)

- [ ] **Implement Admin Access Control for Dev Features**
  - **Overview:** Admin-Mode aktiviert durch 6-stellige PIN (170182) via Calendar Button
    - Gibt Zugriff auf Admin-Only Features & Settings
    - Bleibt persistent bis "Exit Admin Access" gedrückt wird
    - Zentrale Admin Settings Section mit ALLEN hidden Features

  - **Calendar Button (HomePage)**
    - Icon: 📅 (Immer Calendar, nie Lock - weil neben Datum)
    - Public Mode: Click → PIN Modal "PIN eingeben" [••••••] [OK] [Abbrechen]
    - Wenn PIN korrekt (170182) → Admin-Mode aktiviert
    - Admin Mode: Click → Date Picker öffnet (Test Date Functionality)
    - Zum Deaktivieren: Settings → Admin Settings → "Exit Admin Access"

  - **Admin Settings Section (Settings → ⚙️ ADMIN SETTINGS)**
    - Only visible when Admin-Mode active
    - Enthält ALLE Admin-only Settings:
      - Exit Admin Access [Button] - Deactivates Admin Mode
      - Reset App Settings [Button] - Reset all user data
      - Device Info (Device ID Display + Copy Button)
      - Daily Reminders (Toggle + Time Picker)
      - Display Color Scheme (Light / Dark / System buttons)
      - Update Schedule (Fetch new schedule from JW.org/Firebase)

  - **Admin-Only Features (Hidden until Admin Mode)**
    1. Test Date Picker (HomePage Calendar Button) - access: "admin"
       - Only functional when Admin-Mode active
    2. Coming Soon Reading Plans (PersonalReadingPage) - access: "admin"
       - Plans with "Coming Soon" status only visible in dropdown when Admin-Mode
       - Public users see only available plans
    3. Schedule Update Dialog (Admin Settings Section) - access: "admin"
       - Fetch/update reading schedule functionality

  - **Implementation Details**
    - Create: AdminContext.jsx (isAdminMode state + verifyPin(170182))
    - localStorage: "app_adminMode" (true/false, until logout)
    - Calendar Button: Conditional onClick (PIN Modal vs Date Picker)
    - PIN verification: Modal without context, just PIN input + OK/Cancel
    - Persistent: Stays active until "Exit Admin Access" clicked
    - Migrate all admin settings to dedicated section in Settings page

  - **Access Tags**
    - access: "admin" → Hidden until Admin-Mode
    - Settings in Admin Section require Admin to modify

  - **Status:** ✅ COMPLETED (Phase 4 - Implementation Complete)
  - **Priority:** 🟡 MEDIUM (Required for test user experience)
  - **Estimated Effort:** 2-3 hours (Context setup + Conditional rendering)
  - **Completed:** Commit 71cd6d8
    - AdminContext.jsx created with PIN verification (170182)
    - AdminPINModal component for PIN input
    - HomePage calendar button dual-mode (PIN gateway / Date Picker)
    - Admin Settings Section in SettingsPage with all hidden features
    - Feature flags for admin-only items (Date Picker, Schedule Update, Coming Soon Plans)
    - localStorage persistence ("app_adminMode")
    - Related fixes: Theme/Farbschema admin-only, Reading plans visibility

---

## 🤝 Social Interaction Features (v1.2.0+)

- [ ] **Implement Social Interaction System**
  - **Overview:** Optional addon feature for community motivation
    - User profiles with nickname + avatar icon
    - QR Code friend codes for bilateral friend connections
    - Share reading stats (streaks, achievements)
    - Send encouragement messages with scriptures & emojis
    - Community motivation without chat functionality

  - **User Profile**
    - Nickname (editable)
    - Avatar Icon (selection from JW-appropriate icons)
    - QR Code Generation (friend code - linked to email + random hash)
    - Profile visibility settings

  - **Friend System**
    - Bilateral friendship: Scan QR Code → Auto-add as friend
    - Friend list display
    - Remove friend capability
    - Optional: Block user (TBD at implementation)

  - **Stats Sharing**
    - Daily Text Streak (visible to friends)
    - PBP Streak (visible to friends)
    - Achievements (visible to friends)
    - Optional: Total books read %, reading plans progress (TBD)

  - **Encouragement Messages**
    - Send to friends (not chat, specific messages only)
    - Predefined messages with Bible verses + emoji
    - Examples: "Keep going! 🙏", "Great streak! 📖", "God bless your reading! 📕"
    - User can include scripture references
    - Receive notifications for encouragement messages
    - Message history (optional view)

  - **Data Structure**
    - User Profile: { nickname, avatar, qrCode, friendsList }
    - Friends: [{ userId, nickname, avatar, addedDate }]
    - Messages: [{ from, message, scripture, timestamp }]
    - Achievements: [{ type, date, shared }]

  - **Architecture Considerations**
    - Optional feature: Settings → Social Features (Toggle on/off)
    - Firebase sync required for friend data
    - Requires user authentication (Firebase Auth)
    - QR Code generation library (TBD)
    - Only available for registered users

  - **Status:** DESIGN PHASE (Details TBD at implementation)
  - **Priority:** 🟡 MEDIUM (Community engagement)
  - **Dependencies:** Firebase Auth, Firebase Database, QR Code Library
  - **Estimated Effort:** 4-6 hours (TBD based on scope decisions)

---

## ⭐ Favorite Scriptures Feature (v1.2.0+)

- [ ] **Implement Favorite Scriptures System**
  - **Overview:** Personal scripture collection with notes & tags
    - Independent from Social features
    - Private collection per user
    - Scripture reference input with parsing
    - Optional notes per scripture
    - Optional tags system for organization

  - **Scripture Input & Storage**
    - Input field: Accept scripture references (e.g., "John 3:16", "Genesis 1-3")
    - Use existing `readingParser.js` for validation
    - Store: { reference, parsedData, notes, tags, addedDate }

  - **Notes System**
    - Optional: Add personal notes to each scripture
    - Notes: Free-form text input
    - Character limit (TBD: 500/1000 chars?)
    - Edit & delete notes

  - **Tags System (Optional, Design Phase)**
    - Predefined tags (e.g., "comfort", "hope", "strength", "promise", "guidance")
    - Or user-created tags (TBD)
    - Multiple tags per scripture
    - Filter by tag
    - Considerations: Simplicity vs flexibility (TBD)

  - **Data Structure**
    - Favorites: [{ reference, parsedReference, notes, tags, addedDate, lastModified }]
    - Storage: localStorage + Firebase sync (if authenticated)
    - Export/Import capability (optional future feature)

  - **UI/Navigation**
    - Settings → "Favorite Scriptures" (new section)
    - Or: Separate page "My Favorites"
    - List view or grid view (TBD)
    - Quick add button (floating action button or inline input)
    - Option to open scripture in JW Library

  - **Sharing Considerations**
    - Private by default (user's personal collection)
    - Optional: Share favorites with friends (TBD)
    - Or keep completely private (TBD at implementation)

  - **Status:** DESIGN PHASE (Details TBD at implementation)
  - **Priority:** 🟢 LOW (Nice-to-have, personal feature)
  - **Dependencies:** Existing readingParser, JW Library links
  - **Estimated Effort:** 2-3 hours (TBD based on scope)

---

## 📊 Summary

| Category | Total | Completed | Status |
|----------|-------|-----------|--------|
| Critical Bugs | 1 | 1 | ✅ COMPLETE |
| Testing Findings (New) | 7 | 7 | ✅ COMPLETE |
| Multi-Device Sync | 9 | 9 | ✅ COMPLETE |
| Schedule Management | 3 | 1 | 🟡 MEDIUM (2 pending - Phase 4) |
| UI/UX Bugs | 4 | 4 | ✅ COMPLETE |
| Documentation | 1 | 1 | ✅ COMPLETE |
| **UI Polish** | **3** | **3** | ✅ COMPLETE |
| **Code Cleanup** | **1** | **1** | ✅ COMPLETE |
| **Admin Access System** | **1** | **1** | ✅ COMPLETE (Phase 4 - Implementation) |
| **Social Interaction** | **1** | **0** | 🟡 MEDIUM (Phase 5 - Design Phase) |
| **Favorite Scriptures** | **1** | **0** | 🟢 LOW (Phase 5 - Design Phase) |
| **TOTAL** | **32** | **28** | **88% Complete** |

---

## ✅ Completed Items (Archive)

*None yet - tasks in progress will be moved here*

---

## 📝 How to Use This File

1. **Updating Progress:** Check off `[ ]` → `[x]` when task is complete
2. **Adding Notes:** Add info under each task as you discover details
3. **Moving Items:** Complete → move to "Completed Items" section
4. **Status Indicators:**
   - 🔴 CRITICAL - Must fix before production
   - 🟡 MEDIUM - Important features/improvements
   - 🟢 LOW - Nice-to-have, polish, documentation
   - **NOT STARTED** - Not yet begun
   - **DESIGN PHASE** - Still deciding approach
   - **IN PROGRESS** - Actively being worked on
   - **BLOCKED** - Waiting for something else

---

**Last Updated:** 2025-12-27 (Admin Access System Implementation Complete: 28/32 total)
**Total Tasks:** 32 (1 critical + 7 testing findings + 9 sync + 3 schedule + 4 UI/UX + 1 docs + 3 UI polish + 1 code cleanup + 1 admin access ✅ + 1 social + 1 favorites)
**Progress:** 28/32 (88%)
**Recent Completions:**
- iOS 2025 App Icon System (Light/Dark/Tinted variants with DALL-E 3)
  - Professional design with navy blue outline and blue bookmark accent
  - Apple iOS 2025 compliant (sRGB + Gray Gamma 2.2 color spaces)
  - Dark mode favicon support via `media="(prefers-color-scheme: dark)"`
  - Complete Xcode setup guide for native iOS deployment
  - 47% storage reduction (13 old icons deleted)
- Code Cleanup Analysis (readytoremove.md created)
  - 14 files identified for safe deletion
  - 5 code files (duplicates, orphaned), 3 screenshots, 6 bloated docs
  - ~1.3 MB total savings
  - Complete cleanup blueprint with git commands
- Weekly Reading Logic documentation (CLAUDE.md: algorithm, examples, implementation)
- Dark mode theme support (Light/Dark/System with system preference detection)
- **Admin Access System (✅ IMPLEMENTATION COMPLETE)**
  - AdminContext.jsx with PIN verification (170182)
  - AdminPINModal component for PIN input dialog
  - HomePage calendar button dual-mode (PIN gateway ↔️ Date Picker)
  - Admin Settings Section in SettingsPage (Exit Admin, Device Info, Reminders, Theme, Schedule Update)
  - Feature flags for admin-only items (Date Picker, Schedule Update, Coming Soon Plans)
  - localStorage persistence ("app_adminMode") until exit
  - Related fixes: Theme/Farbschema moved to admin-only, Coming Soon plans hidden for non-admin
- **Social Interaction Features (Design Phase - Ready for v1.2.0)**
  - User profiles with nickname + avatar icons
  - QR Code friend codes (bilateral connections)
  - Stats sharing (streaks, achievements)
  - Encouragement messages (scripture + emoji, no chat)
- **Favorite Scriptures System (Design Phase)**
  - Personal scripture collection with notes
  - Tags system (optional)
  - Private storage (localStorage + Firebase sync)

**Remaining Open Items (Phase 4-5 - Future):**
- Admin Access System Implementation (design complete, ready to dev)
- Social Interaction Implementation (design phase, TBD scope)
- Favorite Scriptures Implementation (design phase, TBD scope)
- Auto-Sync New Year Schedule (design pending)
- Schedule Cache-Versioning (optimization only)
- Delete deprecated files using readytoremove.md checklist (optional maintenance)

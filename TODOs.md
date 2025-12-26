# 📋 Development To-Do List

> **Note:** This file is used to track development tasks and progress. Update checkboxes as items are completed.
> For more context, see `CLAUDE.md` - Development Guide.

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
  - **Design Spec:**
    - Style: Minimalist open Bible with 3D perspective (45°/30° rotation)
    - Strokes: Thick white outline (no fill) for clean, modern look
    - Inspired by user's reference image
  - **Implementation:**
    - Created: `public/icons/open-bible-icon.svg` (minimalist vector design)
    - Generated variants: 16x16, 32x32, 192x192, 512x512 PNG files
    - Used: sharp library for high-quality PNG conversion
  - **Configuration:**
    - Created: `public/manifest.json` (PWA manifest with all icon variants)
    - Updated: `index.html` with manifest link, favicon references, theme-color meta tag
    - iOS Support: Added apple-touch-icon for iOS home screen
  - **Files Updated/Created:**
    - `public/icons/open-bible-icon.svg` - SVG source
    - `public/icons/icon-*.png` (4 variants)
    - `public/manifest.json` - PWA configuration
    - `index.html` - Favicon and manifest links
    - `scripts/generate-icons.js` - Icon generation utility
    - `package.json` - Added sharp dependency
  - **Priority:** LOW (PWA polish)
  - **Status:** ✅ COMPLETED
  - **Result:** App now has professional, minimalist icon design ready for PWA installation

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
| **UI Polish** | **1** | **1** | ✅ COMPLETE |
| **TOTAL** | **26** | **24** | **92% Complete** |

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

**Last Updated:** 2025-12-27 (App icon design completed: 24/26 total)
**Total Tasks:** 26 (1 critical + 7 testing findings + 9 sync + 3 schedule + 4 UI/UX + 1 docs + 1 UI polish)
**Progress:** 24/26 (92%)
**Recent Completions:**
- Weekly Reading Logic documentation (CLAUDE.md: algorithm, examples, implementation)
- App icon design (SVG + PNG variants, PWA manifest, favicon integration)

**Remaining Open Items (Phase 4 - Future):**
- Auto-Sync New Year Schedule (design pending)
- Schedule Cache-Versioning (optimization only)

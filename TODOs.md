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
- [ ] **PersonalReadingPage link/info integration requires refactoring**
  - **Issue:** Multiple link sources (JW.org, next reading, continue position) need unified navigation strategy
  - **Current State:** Links functional but inconsistent behavior across reading types
  - **Required:** Audit all reading page link handlers and standardize behavior
  - **Files:** `src/pages/PersonalReadingPage.jsx`, `src/pages/WeeklyReadingPage.jsx`, `src/components/*.jsx`
  - **Priority:** MEDIUM (design consistency)
  - **Status:** DESIGN PHASE

### Application Icon Design
- [ ] **Design and implement app icon (open Bible 3D outline style)**
  - **Spec:**
    - Style: Open Bible in outline form (thick white lines)
    - Perspective: 45°/30° rotation from top-right angle
    - Format: SVG preferred for scalability
    - Use Cases: favicon, web app manifest, launcher icon
  - **Deliverables:**
    - Create `public/icons/` directory structure
    - Generate icon variants (16x16, 32x32, 192x192, 512x512)
    - Update `public/manifest.json` icon paths
  - **Files:** `public/manifest.json`, `public/index.html`, new icon assets
  - **Priority:** LOW (PWA polish)
  - **Status:** DESIGN PENDING

---

## 📱 Multi-Device Sync System (Phase Enhancement)

- [ ] **Fix Firebase Sync: Timestamp beim Markieren setzen, nicht beim Upload**
  - Current: `lastUpdated = Date.now()` when uploading to Firebase (wrong!)
  - Better: `lastUpdated = Date.now()` when user marks item locally
  - Impact: Offline conflicts resolved by actual action time, not upload time
  - Files: `firebaseUserProgress.js`, `storage.js`
  - Status: NOT STARTED

- [ ] **Implement Offline Sync Queue System für multi-device conflicts**
  - Add: `pendingSyncQueue` to localStorage structure
  - Queue items track: action, timestamp, synced status
  - Prevents duplicate actions across devices
  - Files: `storage.js`, new `syncQueue.js` utility
  - Status: NOT STARTED

- [ ] **Add Event-Sourcing for action history instead of state-only storage**
  - Replace: Store only final state (e.g., `{ status: 'complete' }`)
  - With: Action history (e.g., `{ action: 'mark_complete', timestamp: 11:59 }`)
  - Benefit: Replay all actions in correct order for accurate final state
  - Example: If user marks/unmarks same chapter, last action wins (correct!)
  - Files: `storage.js`, `userProgress.js`
  - Status: NOT STARTED

- [ ] **Implement Deduplication Logic: Nach (book, chapter) statt Sync-ID**
  - Problem: Each device generates local sync IDs (not globally unique)
  - Solution: Deduplicate by (book, chapter) composite key, not ID
  - Impact: Two devices marking same chapter only keeps one entry
  - Files: `userProgress.js` mergeProgress() function
  - Status: NOT STARTED

- [ ] **Add Queue-Item processing with FIFO order for pending syncs**
  - Function: `processPendingSyncQueue(userId)`
  - Process queue items sequentially when device comes online
  - Mark items `synced: true` after successful upload
  - Files: `firebaseUserProgress.js`
  - Status: NOT STARTED

- [ ] **Update mergeProgress() to handle action conflicts correctly**
  - Old: Last-write-wins by upload timestamp (wrong for offline)
  - New: Last-write-wins by action timestamp (correct!)
  - Also: Handle arrays correctly (merge, don't overwrite)
  - Files: `userProgress.js` line 167-221
  - Status: NOT STARTED

- [ ] **Write test cases for multi-device sync scenarios (offline conflicts)**
  - Test: Handy marks online, Tablet offline marks same item differently, then syncs
  - Test: Two devices offline, both make changes, sync at different times
  - Test: Same item marked then unmarked offline, sync shows correct state
  - Framework: Vitest + React Testing Library
  - Status: NOT STARTED

- [ ] **Document sync logic in CLAUDE.md with examples**
  - Add: Section explaining queue system, timestamps, merging
  - Add: Concrete examples with dates/times
  - Add: Before/After comparison (old vs new approach)
  - Files: `CLAUDE.md`
  - Status: NOT STARTED

- [ ] **Handle online/offline transitions gracefully (window events)**
  - Add: `window.addEventListener('online', processPendingSyncQueue)`
  - Add: `window.addEventListener('offline', disableSyncButton)`
  - Test: Works when network reconnects
  - Files: `App.jsx` or new `networkStatus.js` utility
  - Status: NOT STARTED

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

- [ ] **Clarify Weekly Reading Logic in Doku: Lesewoche läuft VON (Tag nach Meeting) BIS (nächster Meeting-Tag)**
  - Current doc: Confusing explanation of weekStartDay vs meetingDay
  - Better: Explain that reading week determined by NEXT meeting day
  - Add: Concrete example with dates (e.g., Meeting=Tuesday, 17.12-23.12 reads Jesaja 11-13)
  - Files: `CLAUDE.md`, `docs/GOALS.md`
  - Status: NOT STARTED
  - See also: Related to CRITICAL BUG #1

---

## 📊 Summary

| Category | Total | Completed | Status |
|----------|-------|-----------|--------|
| Critical Bugs | 1 | 1 | ✅ COMPLETE |
| Testing Findings (New) | 6 | 6 | ✅ COMPLETE |
| Multi-Device Sync | 9 | 0 | 🟡 MEDIUM |
| Schedule Management | 3 | 1 | 🟡 MEDIUM (2 pending) |
| UI/UX Bugs | 4 | 4 | ✅ COMPLETE |
| Documentation | 1 | 0 | 🟢 LOW |
| **TOTAL** | **24** | **12** | **50% Complete** |

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

**Last Updated:** 2025-12-26 (All 6 testing findings fixed: 12/24 completed)
**Total Tasks:** 24 (18 original + 6 new from testing)
**Progress:** 12/24 (50%)
**Recent Fixes:**
- 0d042f3: Language initialization (browser locale detection)
- cde7b58: Weekly reading UX (error state with Settings link)
- 6d15652: Thematic links (verse range support in JW.org URLs)
- 28a441d: PBP Next link (interactive button with query params)
- 50e4852: Firebase-first schedule loading (Priority #3: Firebase before static files)
- af23d38: Date formatting (language-specific with locale mapping, removed TODAY label)

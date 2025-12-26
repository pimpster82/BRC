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

- [ ] **getCurrentWeekReading() Off-By-One Week Bug**
  - Issue: Searches for LAST meeting day instead of NEXT meeting day
  - Impact: Users see wrong Bible reading week
  - File: `/data/weekly-reading-schedule.js` line 142-198
  - Fix: Change `daysSinceLastMeeting` → `daysUntilNextMeeting`
  - Status: NOT STARTED

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

- [ ] **Auto-Sync New Year Schedule: Ab Dezember täglich prüfen ob nächstes Jahr auf WOL/Firebase verfügbar ist**
  - Logic: In December, daily check if next year's schedule available
  - Option 1: Admin manually publishes to Firebase
  - Option 2: Automatic fetch from WOL if available
  - When found: Save to Firebase, notify users via Settings
  - Files: New `scheduleAutoSync.js` utility
  - Status: DESIGN PHASE - Decide admin vs automatic
  - Notes: Schedule usually available Sept/Oct on WOL

- [ ] **Schedule Cache-Versioning: Nur neu downloaden wenn Firebase-Version neuer**
  - Add: Version hash to schedule metadata
  - Add: Compare local version vs Firebase version
  - Only download if Firebase version is newer
  - Structure: `/schedules/{year}/metadata/{ version, hash, lastUpdated }`
  - Files: `firebaseSchedules.js`, `storage.js`
  - Status: NOT STARTED

- [ ] **Implement Schedule Sync Strategy: lokaler Cache → Firebase → WOL Fallback**
  - Priority order: localStorage cache → Firebase → WOL (never!)
  - One admin generates schedule once, all users load from Firebase
  - No more individual users downloading from WOL (too many requests!)
  - Function: `loadScheduleForYear(year)` enhanced with version check
  - Files: `weekly-reading-schedule.js`, `firebaseSchedules.js`
  - Status: PARTIAL - Basic structure exists, needs versioning

---

## 🐛 UI/UX Bugs (High Priority)

- [ ] **Back Button in Settings should use browser back (navigate(-1)) instead of always going home**
  - Current: Navigates to `/` (homepage)
  - Better: Use `navigate(-1)` to go to previous page
  - Impact: Better UX when accessing Settings from different pages
  - Files: `src/pages/SettingsPage.jsx` line 281
  - Status: NOT STARTED

- [ ] **Personal Reading Card "Open" link should go to /personal-reading, not directly to chapter**
  - Current: Opens JW.org link directly to next chapter
  - Better: Navigate to `/personal-reading` page first
  - Impact: User can manage reading plans, track progress, see all chapters
  - Files: `src/components/PersonalReadingCard.jsx` line 118-133
  - Status: NOT STARTED

- [ ] **Personal Reading Plan names are inconsistent with available plans**
  - Problem: Dropdown shows plan names that don't match available plans, defaults to "Freies Lesen"
  - Current plans: 'free', 'chronological', 'oneyear', 'thematic'
  - Issue: Translation keys or plan selection logic broken
  - Files: `src/pages/PersonalReadingPage.jsx`, `src/config/i18n.js`
  - Status: NOT STARTED

- [ ] **Free Reading topics should be collapsed by default, only expand last-read topic**
  - Current: All topics shown expanded
  - Better: Collapse all topics, only expand the one where user last read
  - Impact: Better UX for large topic lists, easier to find last position
  - Files: `src/pages/PersonalReadingPage.jsx` (Free Reading section)
  - Status: NOT STARTED

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
| Critical Bugs | 1 | 0 | 🔴 HIGH |
| Multi-Device Sync | 9 | 0 | 🟡 MEDIUM |
| Schedule Management | 3 | 0 | 🟡 MEDIUM |
| UI/UX Bugs | 4 | 0 | 🔴 HIGH |
| Documentation | 1 | 0 | 🟢 LOW |
| **TOTAL** | **18** | **0** | **0% Complete** |

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

**Last Updated:** 2025-12-26 (Updated with UI/UX bugs)
**Total Tasks:** 18
**Progress:** 0/18 (0%)

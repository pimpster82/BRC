# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ WICHTIGE REGEL FÜR CLAUDE

**NIEMALS Daten erfinden oder raten!** Das kostet dem Entwickler enorm viel Zeit und macht die Zusammenarbeit unmöglich.

- ✅ **Immer** echte Daten von JW.org fetchen (WebFetch tool)
- ✅ **Ehrlich sagen**, wenn du dir unsicher bist
- ✅ **Fragen stellen**, wenn du eine Annahme machen würdest
- ❌ **NIEMALS** erfundene Daten, Code oder Werte generieren

Beispiel FALSCH:
```javascript
// Das ist erfunden! Nicht machen!
const yeartext2024 = { scripture: 'Psalm 56:3', text: 'Erfundener Text...' }
```

Beispiel RICHTIG:
```javascript
// WebFetch von JW.org verwenden, um echte Daten zu bekommen
const result = await WebFetch('https://wol.jw.org/...', 'extract yeartext')
```

---

## 📋 Development Task Tracking (TODOs.md)

**All development tasks are tracked in `TODOs.md` at the project root.**

This file contains:
- ✅ Checkboxes for each task (mark off as completed)
- 🔴 Critical bugs that must be fixed
- 🟡 Medium priority improvements
- 🟢 Low priority polish/documentation
- 📝 Detailed notes and file locations for each task
- 💾 Archive section for completed items

**How to use:**
1. Open `TODOs.md` in editor
2. Check off `[ ]` → `[x]` when you complete a task
3. Add notes about what you learned/fixed
4. Move completed items to archive section

**Current Status:** See `TODOs.md` for complete progress tracking

Key sections:
- 🔴 CRITICAL BUGS (1 item) - getCurrentWeekReading() off-by-one week bug
- 📱 Multi-Device Sync System (9 items)
- 📚 Schedule Management (3 items)
- 📖 Documentation (1 item)

---

## Implementation Status (Current)

**Overall Progress:** ~85% of documented features implemented

| Feature | Status | Notes |
|---------|--------|-------|
| **Daily Text Tracking** | ✅ COMPLETE | Mark complete, streak calculation, JW.org links |
| **Weekly Reading Tracking** | ✅ COMPLETE | Schedule fetching & display works; full chapter tracking with verse-level accuracy |
| **Personal Bible Program (PBP)** | ✅ COMPLETE | 4 reading plans fully implemented: Free (categories), Thematic (17 topics), Chronological (UI), One-Year (UI) |
| **PBP - Free Plan** | ✅ COMPLETE | All 66 books, 7 categories, chapter-level tracking with verse accuracy, color-coded progress |
| **PBP - Thematic Plan** | ✅ COMPLETE | 17 thematic study topics, 4 sections, scripture references, topic completion tracking |
| **5-Language i18n** | ✅ COMPLETE | All 5 languages fully translated (100+ keys) |
| **Multilingual Yeartext** | ✅ COMPLETE | Yeartext downloaded as English, all 5 languages stored in Firebase, manual editing support |
| **Display Settings** | ✅ COMPLETE | Toggle yeartext visibility, extensible settings panel for future options |
| **User Authentication** | ✅ COMPLETE | Firebase Auth fully integrated with protected routes, login/register pages, session persistence |
| **Firebase Integration** | ✅ COMPLETE | Schedule, yeartext, and user progress sync all working; user-scoped data storage |
| **Verse-Level Progress** | ✅ COMPLETE | Accurate verse counting for partial reads, supports ranges like "Genesis 2:3-5" |
| **Bible Reference Parser** | ✅ COMPLETE | Fuzzy matching for book names, supports multiple formats, error suggestions |
| **Offline Capability** | ✅ PARTIAL | Works offline after initial load; no service worker registered |
| **PWA Features** | ❌ NOT IMPLEMENTED | No manifest.json, no service worker, no install prompt |
| **Notifications/Reminders** | 🔶 UI ONLY | Settings UI exists; backend notification logic not implemented |
| **Statistics Dashboard** | ⚠️ PARTIAL | Daily text streak works; advanced weekly & personal stats not implemented |
| **Multi-User/Family Features** | 🔶 BACKEND READY | Data structure ready for Phase 3; no UI for family sharing |
| **Automated Tests** | ❌ NOT CONFIGURED | Manual testing only via ParserTestBench |

---

## Project Overview

**Bible Reading Companion** is a web app (future PWA) designed for Jehovah's Witnesses to track three independent Bible reading systems:

1. **Daily Text (Tagestext)** - Daily devotional from "Examining the Scriptures Daily" ✅ **IMPLEMENTED**
2. **Weekly Bible Reading** - Official weekly program with meeting-to-meeting cycle support ⚠️ **PARTIAL**
3. **Personal Bible Program (PBP)** - Custom Bible reading plans 🔶 **PLANNED (data structures only)**

The app is privacy-first (LocalStorage-based), multilingual (German, English, Spanish, Italian, French), and works offline after initial load. **Note:** The PWA features (service worker, offline install) are documented but not yet implemented.

## Tech Stack

- **Framework:** React 18.2.0 with React Router 7.10.1
- **Build Tool:** Vite 5.0.8
- **Styling:** Tailwind CSS 4.1.18 with PostCSS
- **Icons:** Lucide React 0.263.1
- **Storage:** LocalStorage (primary), Firebase Realtime Database (optional sync), IndexedDB (planned)
- **Backend:** Firebase Realtime Database (for shared data and optional sync)
- **Language:** JavaScript/JSX (ES Modules, no TypeScript)
- **Firebase SDK:** firebase (v9.0+, modular API)

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000 with HMR)
npm run dev

# Build for production (creates /dist folder)
npm run build

# Preview production build locally
npm run preview

# Lint code with ESLint
npm run lint

# Deploy to GitHub Pages (builds and deploys to gh-pages branch)
npm run deploy
```

## Project Structure

```
src/
├── App.jsx                    # Main router with 4 routes (/, /weekly, /settings, /test-parser)
├── main.jsx                   # React entry point
├── components/                # Reusable UI components
│   ├── DailyTextCard.jsx      # Daily devotional tracking
│   ├── WeeklyReadingCard.jsx  # Weekly reading progress
│   └── ReadingInputParser.jsx # Bible reference parser UI
├── pages/                     # Route pages
│   ├── HomePage.jsx           # Landing page with date picker
│   ├── WeeklyReadingPage.jsx  # Detailed weekly tracking
│   ├── SettingsPage.jsx       # User preferences & language selection
│   └── ParserTestBench.jsx    # Development tool for parser testing
├── utils/                     # Utility functions
│   ├── storage.js             # LocalStorage CRUD wrapper
│   ├── readingParser.js       # Fuzzy Bible reference parser (Levenshtein)
│   ├── scheduleUpdater.js     # Schedule fetching & generation
│   └── jw-links.js            # JW.org URL builders
├── config/                    # Configuration
│   ├── i18n.js                # 5-language translation dictionary (36 KB)
│   └── languages.js           # Language config & Bible book metadata
└── styles/
    └── index.css              # Tailwind imports + custom component classes

data/
├── bible-books-*.json         # Bible book metadata (5 languages)
├── weekly-reading-schedule-*.js  # Yearly schedule files (2023-2026)
├── yeartext-*.js              # Year text quotes by year
├── memorial-reading-schedule.js # Memorial program schedule
└── bible-link-builder.js      # JW.org link generation utility

scripts/
├── parse-daily-texts.js       # Daily text data parser
├── generate-weekly-schedule.cjs # Schedule generation tool
└── find-overview.cjs          # Code overview generator

docs/
├── GOALS.md                   # Complete feature requirements
├── UI_UX.md                   # UI mockups & design specifications
├── THEMES.md                  # Design system & theming
└── CLOUD_SYNC.md              # Cloud synchronization strategy (Phase 3)
```

## Key Architecture Decisions

### Component-Based with Hooks
- All components are functional React components using hooks
- No class components, no state management library (useState + localStorage sufficient)
- LocalStorage as single source of truth for user data

### Internationalization (i18n)
- Centralized translation dictionary in `src/config/i18n.js`
- Use `import { t } from '../config/i18n'` to access translations
- Key naming convention: `namespace.feature` (e.g., `nav.today`, `home.daily_text`)
- Supports string interpolation with parameters
- **Always add strings to all 5 languages** (de, en, es, it, fr) before using

### Modular Utilities
- **readingParser.js** - Fuzzy matching algorithm (Levenshtein distance) for parsing Bible references
- **storage.js** - Abstraction over LocalStorage for CRUD operations
- **jw-links.js** - URL format: `bible=BBCCCVVV-BBCCCVVV` (BB=book, CCC=chapter, VVV=verse)
- **scheduleUpdater.js** - Dynamically fetches and generates reading schedules

### Meeting Day Cycle
- Weekly reading is based on configurable meeting day (0-6, where 0=Sunday)
- One week = meeting day to meeting day
- This is stored in localStorage settings

### Offline-Capable (Not Full PWA)
- All data stored locally in localStorage (primary storage)
- Firebase Realtime Database for shared/synchronized data (optional)
- No API calls required for core functionality (daily text works fully offline)
- **Limitation:** Works offline only after initial load; must fetch schedules in Settings while online
- Two-tier caching: in-memory cache → localStorage → Firebase → dynamic imports (fallback)
- **Note:** No service worker registered; app is NOT installable as PWA yet
- **Note:** App must load initial HTML/JS from network; browser cache used for subsequent loads

## Firebase Architecture

### Motivation
The Firebase integration enables:
1. **Simplified Schedule Management** - Users download schedules once via Settings; stored in Firebase + local cache
2. **Future Multi-User Support** - Foundation for shared data across devices and family members
3. **iOS App Readiness** - Shared data backend for native iOS companion app
4. **Offline + Online Hybrid** - Best of both: offline-capable with optional cloud sync

### Data Structure (Currently Implemented)

```javascript
// Firebase Realtime Database structure
{
  // ✅ CURRENTLY IN USE
  schedules: {
    2025: {
      weeks: [
        {
          weekStart: '2025-01-06',
          weekEnd: '2025-01-12',
          reading: {  // Language-independent format (v2.0)
            book: 1,
            startChapter: 1,
            endChapter: 3
          },
          chapters: [1, 2, 3]
        },
        // ... more weeks
      ],
      lastUpdated: '2025-01-06T10:30:00Z',
      version: 1
    },
    2026: { ... }
    // One document per year (shared, not per user)
  },

  // ✅ UPDATED: Multilingual yeartext structure
  yeartexts: {
    2025: {
      english: {
        scripture: 'Psalm 56:3',
        text: 'I am afraid, but I put my trust in you.',
        lastUpdated: '2025-01-06T10:30:00Z'
      },
      de: { scripture: 'Psalm 56:3', text: '...', lastUpdated: '...' },
      es: { scripture: 'Psalm 56:3', text: '...', lastUpdated: '...' },
      it: { scripture: 'Psalm 56:3', text: '...', lastUpdated: '...' },
      fr: { scripture: 'Psalm 56:3', text: '...', lastUpdated: '...' }
    },
    2026: { ... }
    // One document per year with language-specific subtrees
  },

  // ❌ NOT YET IMPLEMENTED (Planned for Phase 3)
  users: {
    {userId}: {
      progress: {
        daily: { completedDates: [...], currentStreak: 15 },
        weekly: { completedWeeks: [...] },
        personal: { chaptersRead: [...] }
      },
      settings: { language: 'de', meetingDay: 1, ... }
    }
  }
}
```

### LoadingStrategy (Multi-Tier)

**Priority order for schedules:**
1. **In-Memory Cache** (fastest) - Already loaded in this session
2. **LocalStorage Cache** (fast) - Persisted from previous Firebase saves
3. **Firebase Realtime Database** (PRIMARY) - Admin-published schedules (new default!)
   - Admin publishes schedules via Settings (manual, Phase 3)
   - Or automated sync every December (Phase 4)
4. **Dynamic Import** (offline fallback) - Legacy static data files

**Key Change:** Firebase is now Priority #3 (not last resort). If schedule not locally cached, app fetches from Firebase automatically on load.

### Configuration

**File:** `.env.local` (create from `.env.local.example`)
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

**File:** `src/config/firebase.js`
- Initializes Firebase on startup
- Provides `isFirebaseConfigured()` function to check if credentials are set
- Exports `database` reference for use in utilities

### Key Utilities

**File:** `src/utils/firebaseSchedules.js`
- `saveScheduleToFirebase(year, weeklySchedule)` - Save to Firebase + cache
- `loadScheduleFromFirebase(year)` - Load from cache first, then Firebase
- `saveYeartextToFirebase(year, yeartextData, language = 'english')` - Save yeartext for specific language (de, en, es, it, fr)
- `loadYeartextFromFirebase(year, language = 'english')` - Load yeartext from specific language path; no fallback
- `updateYeartextTranslation(year, language, translationData)` - Update translation for manual editing
- `getAvailableTranslations(year)` - List available language translations for a year
- `getAvailableScheduleYears()` - List years in Firebase
- `deleteScheduleFromFirebase(year)` - Remove schedule

**File:** `src/utils/storage.js` (Extended)
- `getScheduleFromCache(year)` / `saveScheduleToCache(year, schedule)`
- `getYeartextFromCache(year, language)` / `saveYeartextToCache(year, yeartextData, language)`
- `getCachedScheduleYears()` / `getCachedYeartextYears()`

### User Flow: Schedule Loading (Standard)

**Normal User - App Start (Priority Order):**
1. WeeklyReadingCard loads on app start
2. `loadScheduleForYear()` tries:
   - Memory cache? (fastest)
   - LocalStorage? (previously saved)
   - **Firebase? (NEW DEFAULT!)** → Fetches admin-published schedule
   - Fallback to static files if offline
3. Reading displays for current week

**Admin/Settings - Publish Schedule (Phase 3+):**

*Current (Phase 2)* - Manual import via Settings:
1. Admin user goes to Settings → "Schedule Update"
2. Enters year and clicks "Download Schedule"
3. App fetches from JW.org (real data, never invented)
4. `SettingsPage.jsx:handleFetchSchedule()`:
   - Calls `fetchScheduleFromWOL()` and `fetchYeartextFromWOL()`
   - Saves to Firebase via `saveScheduleToFirebase()` and `saveYeartextToFirebase()`
   - Published for ALL users
5. All regular users get it via Firebase on next app start

*Future (Phase 4)* - Automated December sync (planned):
- In December, admin publishes next year's schedule automatically
- All users get updated schedule without manual action
- Or: App auto-detects new schedule on JW.org in December

### User Flow: View Weekly Reading

1. User navigates to home or WeeklyReadingCard loads
2. `WeeklyReadingCard.jsx` calls `loadScheduleForYear(year)`
3. `loadScheduleForYear()` in `data/weekly-reading-schedule.js` tries (in order):
   - 💨 In-memory cache (fastest)
   - 💾 LocalStorage cache (from previous Firebase save)
   - 🔥 **Firebase Realtime DB** (admin-published schedules) ← NEW PRIORITY!
   - 📄 Dynamic import of data files (offline fallback)
4. Returns schedule for current week display
5. If no schedule found anywhere: shows helpful message with link to Settings

### Multi-User Vision (Phase 3)

Future architecture for family/shared use:

```javascript
// User authentication (future: Firebase Auth)
const userId = auth.currentUser.uid

// User-specific progress (would be saved at users/{userId}/...)
const userProgress = {
  userId,
  dailyText: { completedDates: [...], currentStreak: 15 },
  weeklyReading: { completedWeeks: [...] },
  personalReading: { chaptersRead: [...] }
}

// Shared data (schedules/yeartexts stay at /schedules/{year}/, /yeartexts/{year}/)
// Parents and kids download same schedule once, sync to one place
```

### Modular Reading Plans (Phase 5+)

**Current State (Phase 1-4):**
- **Free Plan** & **Thematic Plan:** Hardcoded in source (`reading-categories.js`, `thematic-topics.js`)
- Require code changes and deployment to modify
- Works offline without issues

**Future State (Phase 5+) - Downloadable Plan Modules:**
- **Chronological Plan** & **One-Year Plan** (and others) will be Firebase-installable
- Users can download/install custom reading plans like "app modules"
- Admin can publish new plans without code deployment

**Firebase Structure (Phase 5):**
```
/reading-plans/
  ├── chronological/
  │   ├── metadata.json { name, version, author, compatible_versions }
  │   └── data.json { chapters, order, pacing }
  │
  ├── one-year/
  │   ├── metadata.json
  │   └── data.json
  │
  └── custom-plans/ (Phase 5+)
      ├── {planSlug}/
      │   ├── metadata.json
      │   └── data.json
```

**Loading Strategy (Phase 5):**
1. Check app-bundled plans (Free, Thematic) - static
2. Check localStorage for installed plans
3. Check Firebase for available plans to download
4. Show "Install" button in UI for new plans
5. Users can enable/disable installed plans

**Benefits:**
- ✅ Zero deployment for new plans
- ✅ Users can customize (create community plans)
- ✅ Offline support (cached after install)
- ✅ Easy rollback (just uninstall module)
- ✅ Versioning and compatibility checks

### iOS Native App Readiness

The Firebase backend enables building a native iOS app that:
- Reads schedules from `/schedules/{year}/` (shared)
- Stores user progress at `users/{userId}/` (private)
- Uses Firebase Cloud Messaging for notifications
- Syncs offline changes when back online
- **Future:** Supports modular reading plans from Firebase

No backend API server needed - Firebase Realtime Database handles all data needs.

---

## Language-Independent Reading Format (v2.0)

### Problem Statement
Previously, reading schedules stored book names in English (e.g., "Genesis 1-3"), which prevented true multilinguality. Schedules saved with English names couldn't be used in other languages without conversion.

### Solution: Book Number Format
Reading data now uses the canonical Genesis-Revelation (1-66) numbering system:

**Format:**
```javascript
// Old format (v1.0) - Language-specific
reading: "Genesis 1-3"

// New format (v2.0) - Language-independent
reading: {
  book: 1,           // Standard book number (1-66)
  startChapter: 1,
  endChapter: 3
}
```

**Examples:**
- Genesis 1-3 → `{ book: 1, startChapter: 1, endChapter: 3 }`
- Matthew 24 → `{ book: 40, startChapter: 24, endChapter: 24 }`
- Revelation 21-22 → `{ book: 66, startChapter: 21, endChapter: 22 }`

### Book Number System (Standard)
- **Genesis** = 1
- **Exodus** = 2
- ...
- **Matthew** = 40
- **Mark** = 41
- **Luke** = 42
- **John** = 43
- **Acts** = 44
- ...
- **Revelation** = 66

All files and utilities use this standard 1-66 system (including bible-books-*.json, LOCALIZED_BOOK_SLUGS, weekly-reading-schedule data).

### Implementation Details

**Parser: `src/utils/scheduleParser.js`**
- `parseReadingText(reading, language)` - Converts reading object to localized text
  - Input: `{ book: 1, startChapter: 1, endChapter: 3 }` + language code
  - Output: "Genesis 1-3" in specified language (de, en, es, it, fr)
- `readingToJWLinkFormat(reading)` - Converts to JW.org link format
- `isValidReading(reading)` - Validates reading object structure

**Schedule Parser: `src/utils/scheduleUpdater.js` (updated)**
- `parseScheduleFromHTML()` now extracts book numbers instead of names
- Schedules are saved with `reading: { book, startChapter, endChapter }` format

**UI Components Updated:**
- `WeeklyReadingCard.jsx` - Uses `parseReadingText(weekReading.reading, getCurrentLanguage())`
- `WeeklyReadingPage.jsx` - Uses `parseReadingText()` and `getLocalizedBookName(reading.book, language)`
- `bible-link-builder.js` - Added `buildLinkFromReadingObject()` convenience function

### Benefits
✅ **Truly Multilingual** - Same schedule works in all 5 languages (de, en, es, it, fr)
✅ **Firebase-Ready** - Schedules can be shared across language boundaries
✅ **Future-Proof** - Ready for native iOS app and multi-user support
✅ **Consistent** - Book numbering matches all other systems in the app

### Firebase Data Structure (Updated)
```javascript
// Before (v1.0)
weeks: [
  {
    weekStart: '2025-01-06',
    reading: "Genesis 1-3",  // Language-specific
    book: "Genesis",
    bookNumber: 1,
    chapters: [1, 2, 3]
  }
]

// After (v2.0)
weeks: [
  {
    weekStart: '2025-01-06',
    reading: {  // Language-independent
      book: 1,
      startChapter: 1,
      endChapter: 3
    },
    chapters: [1, 2, 3]
  }
]
```

---

## Multi-Device Sync System (Phase 3: Complete ✅)

### Overview

The multi-device sync system enables users to sync their Bible reading progress across multiple devices (phone, tablet, desktop) with proper offline support. The key innovation is **timestamp-based conflict resolution**, ensuring the user's actual action time (not upload time) determines which version wins in conflicts.

### Architecture

**Three-Tier Sync Strategy:**

```
┌─────────────────────────────────────────────────────────────────────┐
│ User Performs Action (mark/unmark daily text)                       │
└─────────────────────────────────────────────────────────────────────┘
                               │
                    Device Online/Offline?
                         │          │
                    Online │        │ Offline
                         │          │
                ┌────────▼───┐   ┌──▼─────────┐
                │  Update    │   │   Queue    │
                │ LocalStore │   │   Item in  │
                │  + Firebase│   │ localStorage│
                └────────────┘   └──┬─────────┘
                         │          │ Device Comes Online
                         │          │
                         └──────────┤
                                    │
                    ┌───────────────▼────────────────┐
                    │ processPendingSyncQueue()      │
                    │ (FIFO, Retry Logic)            │
                    └───────────────┬────────────────┘
                                    │
                    ┌───────────────▼────────────────┐
                    │  Merge with Firebase Version   │
                    │  (Action Timestamp Wins)       │
                    └───────────────┬────────────────┘
                                    │
                    ┌───────────────▼────────────────┐
                    │ All Devices Show Same State    │
                    │ (Eventual Consistency)         │
                    └────────────────────────────────┘
```

### Queue System (Offline-First)

When a user is offline, actions are stored in a **sync queue** using event-sourcing:

**Queue Item Structure:**
```javascript
{
  id: 'daily_2025-12-25_mark_complete',    // Composite key: section_identifier_action
  section: 'daily',                         // daily, weekly, or personal
  action: 'mark_complete',                  // The action type
  data: { date: '2025-12-25' },            // Action-specific data
  timestamp: 1703520000000,                 // ACTION TIME (when user marked it)
  synced: false,                            // Has this synced to Firebase yet?
  retries: 0                                // Retry counter for failed syncs
}
```

**Key Features:**

1. **Deduplication by Composite Key:**
   - Same action on same item replaces previous entry in queue
   - Example: If user marks date X, then unmarks X, then marks X again:
     - Queue after mark: `[{ id: 'daily_X_mark_complete', ... }]`
     - Queue after unmark: `[{ id: 'daily_X_unmark_complete', ... }]` (replaced!)
     - Queue after 2nd mark: `[{ id: 'daily_X_mark_complete', ... }]` (replaced!)
   - Only final action syncs when device comes online ✅

2. **FIFO Processing:**
   - When device comes online, queue items processed in order (by sequence number)
   - Each action replayed locally, then synced to Firebase
   - Ensures correct final state even with multiple offline changes

3. **Event-Sourcing:**
   - Complete action history stored in queue
   - Actions replayed sequentially when syncing
   - Final state computed from replay (not from state snapshot alone)

4. **Retry Logic:**
   - Failed syncs automatically retry (up to 3 attempts)
   - Exponential backoff for network errors
   - After 3 retries, item marked as failed but skipped to allow next item

### Timestamp-Based Conflict Resolution

**The Problem (Before):**
```javascript
// Device A: Marks date 2025-12-25 at 11:00 AM
completedDates: ['2025-12-25']
lastUpdated: 1703545000000  // Set WHEN UPLOADING to Firebase at 14:00 PM

// Device B: Unmarks date 2025-12-25 at 10:00 AM, syncs immediately
completedDates: []
lastUpdated: 1703541600000  // Set WHEN UPLOADING to Firebase at 11:30 AM

// Merge result: WRONG! Device B wins because upload was later (11:30 > 10:00)
// But Device A's action (11:00) is actually more recent than B's (10:00)!
```

**The Solution (After):**
```javascript
// Device A: Marks date 2025-12-25 at 11:00 AM
completedDates: ['2025-12-25']
lastUpdated: 1703520000000  // Set WHEN USER MARKS (11:00 AM)

// Device B: Unmarks date 2025-12-25 at 10:00 AM
completedDates: []
lastUpdated: 1703516400000  // Set WHEN USER UNMARKS (10:00 AM)

// When Device B syncs and merges with Firebase version from Device A:
// Merge logic: 1703520000000 (A's action) > 1703516400000 (B's action)
// Result: Device A's version wins ✅ CORRECT!
```

**Merge Logic (in `userProgress.js`):**
```javascript
const mergeProgress = (localData, firebaseData) => {
  const localTimestamp = localData.lastUpdated || 0
  const firebaseTimestamp = firebaseData.lastUpdated || 0

  // Last-write-wins: NEWER ACTION TIMESTAMP WINS
  if (firebaseTimestamp > localTimestamp) {
    return firebaseData  // Firebase action is more recent
  } else if (localTimestamp > firebaseTimestamp) {
    return localData     // Local action is more recent
  } else {
    return firebaseData  // Equal timestamps: Firebase wins as tiebreaker
  }
}
```

### Event Listeners (App.jsx)

The app listens for online/offline transitions and triggers queue processing:

```javascript
// In App.jsx, AppContent component:
useEffect(() => {
  const handleOnline = async () => {
    console.log('📡 Device came online - processing pending sync queue...')
    if (currentUser?.uid) {
      try {
        const result = await processPendingSyncQueue(currentUser.uid)
        console.log(`✓ Sync queue processed: ${result.processed} items`)
      } catch (error) {
        console.error('✗ Error processing sync queue:', error)
      }
    }
  }

  window.addEventListener('online', handleOnline)

  return () => {
    window.removeEventListener('online', handleOnline)
  }
}, [currentUser])
```

**How It Works:**
1. User marks item while offline → Item queued with timestamp
2. Device connection status changes → `window.online` event fires
3. `handleOnline()` called → Calls `processPendingSyncQueue(userId)`
4. Queue processor replays all offline actions in FIFO order
5. After each action: Local state + Firebase sync (with merged conflict resolution)
6. Queue items marked as synced, removed from queue
7. Result: All devices now have identical state ✅

### Implementation Files

| Component | File | Lines | Status |
|-----------|------|-------|--------|
| **Queue Management** | `src/utils/syncQueue.js` | 1-160 | ✅ Complete |
| **Queue Storage/Retrieval** | `src/utils/storage.js` | 43-82, 557-582 | ✅ Complete |
| **Queue Processing** | `src/utils/firebaseUserProgress.js` | 367-481 | ✅ Complete |
| **Event Listeners** | `src/App.jsx` | 41-72 | ✅ Complete |
| **Merge Logic** | `src/utils/userProgress.js` | 145-231 | ✅ Complete |
| **Test Documentation** | `docs/MULTI_DEVICE_SYNC_TESTS.md` | 1-343 | ✅ Complete |

### Example Workflow: Two Devices Offline

**Setup:**
- Device A (Phone): Online, marks 2025-12-24 at 11:00 AM
- Device B (Tablet): Offline, can't sync

**Timeline:**

```
11:00 - Device A marks 2025-12-24 online
        → Timestamp: 1703520000000 (11:00 AM)
        → Syncs immediately to Firebase

11:30 - Device B marks 2025-12-25 offline (user unaware A already marked)
        → Timestamp: 1703521800000 (11:30 AM)
        → Queued: [{ id: 'daily_2025-12-25_mark_complete', timestamp: 1703521800000 }]

12:00 - Device B user unmarks 2025-12-25 (changed mind), still offline
        → Timestamp: 1703525400000 (12:00 PM)
        → Queue REPLACED: [{ id: 'daily_2025-12-25_unmark_complete', timestamp: 1703525400000 }]

14:00 - Device B comes online
        → processPendingSyncQueue() runs
        → Replays: unmark 2025-12-25 locally
        → Syncs to Firebase with timestamp 1703525400000
        → Merges: 1703525400000 (B's unmark) > any previous Firebase version
        → Result: All devices show 2025-12-25 as UNMARKED ✅
```

### Current Limitations

1. **Daily Text Only** - Queue system fully works for daily text; weekly/personal not yet integrated
2. **No Persistence** - Queue lost if app crashes (acceptable for now)
3. **No Offline UI Indicators** - App doesn't show "queued X items" in UI
4. **No Batch Syncing** - Each action sent individually; could batch multiple in one Firebase write

### Future Improvements (Phase 4+)

- [ ] Extend queue system to weekly/personal reading
- [ ] Add "Syncing 5/10..." progress indicator in UI
- [ ] Batch sync (send multiple items per Firebase write)
- [ ] Offline mode UI indicator
- [ ] Manual conflict resolution UI (let user choose which version to keep)
- [ ] Sync analytics (success rate, retry counts, latency metrics)

### Testing

**Manual Testing Checklist:**
- [ ] Mark daily text offline, come online, verify Firebase synced
- [ ] Mark same date multiple times offline, verify queue deduplication (only final action syncs)
- [ ] Conflict resolution: Device A marks online, Device B unmarks offline, device B comes online last → shows Device A's version
- [ ] Large queue: Mark 20 dates offline, come online, verify all synced in order

**For Automated Tests:**
- See: `docs/MULTI_DEVICE_SYNC_TESTS.md` - 5 complete test scenarios with code examples
- Framework recommended: Vitest + React Testing Library
- Key scenarios to test: offline queue, conflict resolution, deduplication, retry logic

---

## Data Flow & Storage Schema

```javascript
// LocalStorage structure (user data)
{
  // Daily Text tracking - ✅ FULLY IMPLEMENTED
  bibleCompanion_dailyText: {
    completedDates: ['2025-11-28', '2025-11-27', ...],
    currentStreak: 15
  },

  // Weekly Reading tracking - ⚠️ PARTIAL (UI not complete)
  bibleCompanion_weeklyReading: {
    completedWeeks: [
      { weekStart: '2025-11-24', chapters: [true, false, true, ...] }
    ],
    currentMeetingDay: 1  // 0-6 (Monday-Sunday)
  },

  // Personal Bible Program tracking - 🔶 DATA ONLY (no UI)
  bibleCompanion_personalReading: {
    chaptersRead: [
      { book: 'Genesis', chapter: 1, timestamp: 1704067200 },
      // ...
    ],
    selectedPlan: 'free'  // 'free', 'chronological', 'oneyear', etc.
  },

  // Cached schedules and yeartexts from Firebase
  bibleCompanion_schedule_2025: [{ weekStart, weekEnd, reading: { book, startChapter, endChapter }, chapters }],
  bibleCompanion_yeartext_2025: { scripture, text, year },

  // User preferences - ⚠️ PARTIAL (theme not implemented)
  app_language: 'de',  // de, en, es, it, fr
  settings_meetingDay: '1',  // 0-6 (Monday-Sunday)
  settings_readingPlan: 'free',  // For future PBP feature
  settings_dailyReminder: 'false',  // UI exists, backend not implemented
  settings_reminderTime: '08:00',  // UI exists, backend not implemented
  settings_showYeartext: 'true',  // ✅ NEW: Toggle yeartext card visibility

  testDate: '2025-12-25'  // Development helper for date testing
}
```

**Important Note:** The `theme` setting is NOT implemented. The app currently has no dark mode or theme switching.

---

## What's Actually Working (Production-Ready)

### Utilities & Features You Can Use

| Utility | File | Status | Notes |
|---------|------|--------|-------|
| **Daily Text CRUD** | `src/utils/storage.js` | ✅ | `getDailyTextData()`, `markDailyTextComplete()`, `isDailyTextComplete()`, `calculateStreak()` |
| **Weekly Reading CRUD** | `src/utils/storage.js` | ✅ | `getWeeklyReadingData()`, `saveWeeklyReadingData()`, `getWeekOfReading()` |
| **Personal Reading CRUD** | `src/utils/storage.js` | ✅ | `getPersonalReadingData()`, `savePersonalReadingData()` (data-only, no UI) |
| **Bible Reference Parser** | `src/utils/readingParser.js` | ✅ | Fuzzy matching - parses "Genesis 1", "Gen 1:1-5", "1. Mose 1" |
| **Reading Format Converter** | `src/utils/scheduleParser.js` | ✅ | Converts `{ book: 1, startChapter: 1, endChapter: 3 }` to localized text in all 5 languages |
| **JW.org Link Builder** | `data/bible-link-builder.js` | ✅ | `buildBibleLink()`, `buildLanguageSpecificWebLink()`, `getLocalizedBookName()` |
| **Schedule Fetching** | `src/utils/scheduleUpdater.js` | ✅ | `fetchScheduleFromWOL(year)` - Downloads from JW.org with CORS proxy fallback |
| **Yeartext Fetching** | `src/utils/yeartextFetcher.js` | ✅ | `fetchYeartextFromWol(year, language)` - Returns hardcoded 2026+ data |
| **Firebase Schedule Sync** | `src/utils/firebaseSchedules.js` | ✅ | `saveScheduleToFirebase()`, `loadScheduleFromFirebase()`, `getAvailableScheduleYears()` |
| **Firebase Yeartext Sync (Multilingual)** | `src/utils/firebaseSchedules.js` | ✅ NEW | `saveYeartextToFirebase(year, data, language)`, `loadYeartextFromFirebase(year, language)`, `updateYeartextTranslation()`, `getAvailableTranslations()` |
| **Multilingual i18n** | `src/config/i18n.js` | ✅ | 100+ translation keys for 5 languages; `t('key')`, `t('key', null, { param: value })` |
| **Language Switching** | `src/config/languages.js` | ✅ | `getCurrentLanguage()`, `setCurrentLanguage()`, `SUPPORTED_LANGUAGES` |
| **Daily Text Card** | `src/components/DailyTextCard.jsx` | ✅ | Full UI with mark complete, streak, JW.org link |
| **Weekly Reading Card** | `src/components/WeeklyReadingCard.jsx` | ✅ | Shows current week, chapters, links to detailed page |
| **Weekly Reading Page** | `src/pages/WeeklyReadingPage.jsx` | ✅ | Chapter-by-chapter tracker with verse-level progress |
| **Personal Reading Page** | `src/pages/PersonalReadingPage.jsx` | ✅ | 4 reading plans (Free/Thematic/Chronological/One-Year), categories, verse tracking, scripture references |
| **Personal Reading Card** | `src/components/PersonalReadingCard.jsx` | ✅ | Homepage quick view, shows next reading, chapters read count |
| **User Authentication** | `src/context/AuthContext.jsx` | ✅ | Firebase Auth context, login/register pages, protected routes, session persistence |
| **Login Page** | `src/pages/LoginPage.jsx` | ✅ | Email/password login with bilingual UI and error handling |
| **Register Page** | `src/pages/RegisterPage.jsx` | ✅ | Email/password registration with validation and confirmation |
| **Verse Progress Calculator** | `src/utils/verseProgressCalculator.js` | ✅ | Accurate verse counting for partial reads, supports ranges |
| **Thematic Topics Config** | `src/config/thematic-topics.js` | ✅ | 17 thematic study topics with 4 sections and scripture references |
| **Reading Categories Config** | `src/config/reading-categories.js` | ✅ | 7 book categories for organized Bible reading |
| **Settings Page** | `src/pages/SettingsPage.jsx` | ✅ | Language, meeting day, schedule download, reset data, display settings (notifications UI only) |
| **Display Settings** | `src/pages/SettingsPage.jsx` | ✅ | Toggle yeartext visibility; extensible for future app settings |
| **Parser Test Bench** | `src/pages/ParserTestBench.jsx` | ✅ | Development tool to test Bible reference parsing |

### Data Sources

| Data | Source | Type | Status |
|------|--------|------|--------|
| **Bible Books** | `data/bible-books-*.json` (5 languages) | Static JSON | ✅ Fully populated |
| **Weekly Schedules** | Firebase (primary) → LocalStorage cache → `data/weekly-reading-schedule-*.js.old` (legacy) | Dynamic | ✅ Works for 2025-2026 |
| **Yeartexts** | `data/yeartext-*.js` (2023-2026) | Static JS | ✅ 2025-2026 populated |
| **Memorial Schedule** | `data/memorial-reading-schedule.js` | Static JS | ✅ Exists but not used in UI |
| **Firebase Backend** | Europe-west1 (europe-west1.firebasedatabase.app) | Cloud | ✅ Configured, credentials in `.env.local` |

### What's NOT Ready (Don't Use)

| Feature | Issue |
|---------|-------|
| **Theme/Dark Mode** | Not implemented; color variables hardcoded for light mode |
| **Notifications** | UI controls exist in Settings; no backend implementation |
| **PWA/Offline Install** | No manifest.json, no service worker, can't install as app |
| **Chronological Reading Plan** | UI button exists; shows "Coming Soon", data structure ready |
| **One-Year Reading Plan** | UI button exists; shows "Coming Soon", data structure ready |
| **Advanced Statistics Dashboard** | Daily streak works; detailed weekly & personal stats not implemented |
| **Automated Tests** | No test suite; manual testing only |

---

## Common Development Tasks

### Adding a New UI String
1. Open `src/config/i18n.js`
2. Add key to **all 5 language sections** (de, en, es, it, fr)
3. In component: `import { t } from '../config/i18n'`
4. Use: `t('your.key')` or with params: `t('your.key', null, { param: value })`

### Creating a New Component
1. Place in `src/components/` (reusable) or `src/pages/` (route page)
2. Use Tailwind CSS classes (custom classes available in `styles/index.css`)
3. Import translations: `import { t } from '../config/i18n'`
4. Import localStorage wrapper: `import { getFromStorage, saveToStorage } from '../utils/storage'`
5. Use React Router hooks if needed: `import { useParams, useNavigate } from 'react-router-dom'`

### Parsing Bible References
- Use `readingParser.js` utility which has fuzzy matching
- Handles variations like "Genesis 1", "Gen 1:1-5", "1. Mose 1"
- Returns normalized format: `{ book: 'Genesis', chapter: 1, verses: [1, 5] }`

### Building JW.org Links
- Use `jw-links.js` - functions like `buildBibleLink(bookNumber, chapter, verses)`
- Format: `https://www.jw.org/finder?srcid=jwlshare&wtlocale=E&prefer=lang&bible=BBCCCVVV-BBCCCVVV`
- Book numbers: Genesis=1, Revelation=66 (zero-padded)

### Adding New Routes
1. Create page component in `src/pages/`
2. Import in `src/App.jsx`
3. Add route: `<Route path="/new-route" element={<NewPage />} />`
4. Add navigation link in appropriate component

## Testing

**Current Status:** ❌ No automated test suite

**Manual Testing Only:**
- Use `ParserTestBench.jsx` (/test-parser) for Bible reference parser validation
- Test components in browser via React DevTools
- Verify localStorage persistence by opening DevTools → Application → Local Storage
- Check console for errors via `console.log` or DevTools console tab

**Known Testing Gaps:**
- No unit tests for utility functions (parser, storage, schedule updater)
- No component tests for UI elements
- No integration tests for Firebase sync
- No E2E tests

**To Add Automated Tests:**
- Recommended: Vitest (Vite-native, fast, minimal setup)
- Alternative: Jest (more mature ecosystem)
- Component testing: React Testing Library
- E2E testing: Playwright or Cypress (optional, for complex flows)
- **Note:** Will need to install and configure from scratch; no test infrastructure exists yet

## Code Quality

- ESLint configured for JavaScript/JSX linting
- Run: `npm run lint`
- Custom Tailwind CSS component classes defined in `styles/index.css` (e.g., `.card`, `.btn-open`)
- Avoid inline styles; use Tailwind utilities

## Important Links & References

- **JW.org Daily Text:** https://wol.jw.org/en/wol/dt/r1/lp-e (updates daily)
- **Weekly Reading 2025:** https://wol.jw.org/en/wol/d/r1/lp-e/1102025214
- **Weekly Reading 2026:** https://wol.jw.org/en/wol/d/r1/lp-e/1102026214
- **Link Format:** `bible=BB001001-BB005999` → Genesis 1-5

## Design System (Tailwind CSS)

- **Colors:** Primary (#1E40AF), Secondary (#7C3AED), Success (#16A34A), Warning (#D97706), Danger (#DC2626)
- **Status Indicators:**
  - Green (#27AE60) - Read/Complete
  - Yellow (#F39C12) - Partial/In Progress
  - Gray (#BDC3C7) - Unread/Pending
- **Custom Classes:** `.card`, `.card-header`, `.btn-open`, `.reading-status`

## Deployment

- **Build:** `npm run build` creates optimized bundle in `/dist`
- **Deploy (GitHub Pages):** `npm run deploy` pushes to `gh-pages` branch on GitHub
  - For GitHub Pages: Change vite.config.js `base` to `/BRC/` and rebuild
- **Deploy (Vercel):** Connected to GitHub repo; automatically deploys on push
  - **Live URL:** https://brc-liard.vercel.app
  - **Base path:** `base: '/'` in vite.config.js (Vercel deploys to root)
  - **Cache strategy:** vite.config.js sets `Cache-Control: no-store` headers to prevent stale assets
- **Current configuration:** `base: '/'` for Vercel; change comment in vite.config.js for GitHub Pages

## Documentation References

- **CONTEXT.md** - Development context and quick start guide
- **I18N_GUIDE.md** - Detailed i18n usage and translation system
- **docs/GOALS.md** - Complete feature list and system specifications
- **docs/UI_UX.md** - UI mockups and design specifications
- **docs/THEMES.md** - Theme system and design tokens
- **docs/CLOUD_SYNC.md** - Cloud synchronization strategy (future)

## Current Project Phase

**Phase 1 (100% Complete):** Core features ✅
- ✅ Daily Text tracking with streaks
- ✅ Weekly Reading with full chapter tracking and verse-level accuracy
- ✅ Personal Bible Program - 4 reading plans (Free, Thematic, Chronological UI, One-Year UI)
- ✅ 5-language i18n with 100+ translation keys
- ✅ Firebase integration for all data (schedules, yeartexts, user progress)
- ⚠️ PWA features (planned but not implemented - no service worker)

**Phase 2 (50% Complete):** Statistics, themes, advanced features
- ✅ User Authentication (login/register with protected routes)
- ✅ Verse-level progress tracking with partial read support
- ✅ Bible reference parser with fuzzy matching
- ⚠️ Statistics dashboard (daily streak works; advanced weekly & personal stats partial)
- ❌ Theme system (light/dark mode) - not implemented
- ❌ Reading reminders/notifications (backend) - UI only

**Phase 3 (30% Complete):** Multi-user & family features
- ✅ User authentication & session persistence via Firebase Auth
- ✅ Per-user progress tracking (Firebase structure ready)
- 🔶 Family/shared reading groups (backend structure ready, no UI)
- ✅ Cross-device sync (working with timestamp-based merge)
- 🔶 Native iOS companion app backend (Firebase structure ready)

## Developer Quick Reference

### What You Can Build With (85% complete)

```
✅ Daily Text tracking              | Use: storage.js + DailyTextCard.jsx component
✅ Weekly reading with verse tracking| Use: WeeklyReadingPage.jsx with firebaseSchedules.js
✅ Personal Bible reading (4 plans)  | Use: PersonalReadingPage.jsx with verseProgressCalculator.js
✅ User authentication              | Use: AuthContext.jsx with protected routes
✅ Bible reference parsing          | Use: readingParser.js for fuzzy matching
✅ Verse progress calculation       | Use: verseProgressCalculator.js for partial reads
✅ Link generation                  | Use: bible-link-builder.js for JW.org links
✅ Multilingual support             | Use: i18n.js for all 5 languages (5 languages, 100+ keys)
✅ Firebase user sync               | Use: firebaseUserProgress.js for cross-device sync
✅ Thematic study organization      | Use: thematic-topics.js (17 topics, 4 sections)
✅ Reading categories               | Use: reading-categories.js (7 book categories)
```

### What's Incomplete (Don't Assume Works)

```
⚠️ Statistics dashboard              | Daily streak works; advanced weekly & personal stats partial
🔶 Chronological reading plan        | UI button exists; shows "Coming Soon"
🔶 One-year reading plan             | UI button exists; shows "Coming Soon"
🔶 Family sharing features           | Data structure ready; no UI for family groups
❌ Theme/Dark mode                   | Not implemented; light mode only
❌ Notifications backend             | UI exists in Settings; no backend notification logic
❌ PWA features                      | No service worker; can't install as app
❌ Automated tests                   | No test suite; manual testing via ParserTestBench
```

---

## Troubleshooting Tips

- **HMR not working?** Check Vite config; ensure port 3000 is available
- **Translations showing keys?** Verify key exists in all 5 language sections in i18n.js
- **Tailwind styles not applying?** Restart dev server; clear browser cache
- **localStorage empty?** Check browser DevTools Storage tab; ensure not in private/incognito mode
- **Build failing?** Run `npm install` to ensure dependencies are up to date
- **Need to test changes?** Always restart the dev server after making modifications (HMR not reliable for all changes)
- **Schedule not showing?** Load it via Settings → Schedule section first; app won't have data until downloaded
- **Firebase not working?** Check `.env.local` has correct credentials; verify database rules allow read/write
- deep links werden mit der hilfe von  data/bible-link-builder.js erstellt
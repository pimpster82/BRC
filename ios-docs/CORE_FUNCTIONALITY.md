# Core Functionality Specification

**Bible Reading Companion - iOS Implementation Guide**

This document describes **what** each feature does, not **how** it's implemented.

---

## 1. THREE READING SYSTEMS

### 1.1 Daily Text ☀️ (Täglicher Text)

**Purpose**: Daily spiritual nourishment through a Bible verse and commentary.

**User Workflow**:
1. User opens app → sees today's date and yeartext banner
2. Daily Text card shows verse excerpt and scripture reference
3. User taps "Open" → redirects to full text on wol.jw.org
4. User marks as complete → checkbox toggles
5. Streak counter updates automatically
6. Data persists locally and syncs to Firebase

**Business Rules**:
- Streak breaks if user misses a day (yesterday not marked)
- Streak continues if today OR yesterday is marked
- Can mark past dates retroactively
- Cannot mark future dates
- Yeartext changes annually

**Data Tracked**:
- Completed dates array: `["2025-12-25", "2025-12-24"]`
- Current streak: `5 days`
- Longest streak: `42 days`

---

### 1.2 Weekly Reading 📅 (Wöchentliches Bibellesen)

**Purpose**: Preparation for congregation meeting through official weekly Bible reading program.

**Meeting Day Cycle Logic** (CRITICAL):
- App shows reading for week containing user's **NEXT** meeting day, not previous
- Algorithm:
  1. User sets meeting day (0=Sunday ... 6=Saturday)
  2. Calculate days until next meeting from current date
  3. Find schedule week containing that next meeting date
  4. Display that week's reading assignment

**Example**:
- Meeting day: Tuesday (day 2)
- Current date: Friday, Dec 27, 2024
- Days until next meeting: Tuesday, Dec 31 = 4 days
- Result: Display "Dec 29 - Jan 4: Isaiah 3-5"

**User Workflow**:
1. Navigate to Weekly Reading page
2. See current week's assignment (e.g., "Isaiah 3-5")
3. Mark chapters individually or use smart input:
   - "9" = chapter 9 complete
   - "9-10" = chapters 9-10 complete
   - "9:5-10" = chapter 9 up to verse 10 (partial)
4. Progress bar shows **verse-based** completion %
5. Tap chapter → opens JW.org with deep link
6. Undo last action or clear all progress

**Smart Reading Input Parser**:
Accepts flexible formats:
- Book name optional if matches current week's book
- Abbreviations: "Jes" for Jesaja/Isaiah
- Fuzzy matching with spelling suggestions
- Verse ranges: "3-4:15" = chapter 3 complete, 4 up to verse 15
- Scattered verses: "3:1,2; 4:15"

**Progress Calculation**:
- Uses verse counts, NOT chapter counts
- Example: Isaiah 3-5 = 80 total verses
- If chapter 3 complete (20v) + chapter 4 partial (10v) = 30/80 = 37.5%

**Business Rules**:
- Week changes based on next meeting day, not calendar week
- Verse-level accuracy for partial chapters
- Can mark chapters out of order
- Smart continuation: suggests "continue from verse X"

---

### 1.3 Personal Reading 📖 (Persönliches Bibellese Programm)

**Purpose**: Track progress through entire Bible (1,189 chapters) using various reading plans.

**Core Architecture: Unified Progress Tracking**

**CRITICAL**: All personal reading plans share a SINGLE source of truth: the `chaptersRead` array.

**Key Principle**:
- One data source tracks every chapter read
- Language-independent: Uses book numbers (1-66)
- Bi-directional sync: Marking in ANY plan updates ALL plans
- Performance: Map-based index for O(1) lookups

---

## 2. READING PLANS

### 2.1 Free Reading (Freies Lesen)

**What it does**:
- User selects any book and marks chapters manually
- No preset order or schedule
- Books organized in 7 categories (Law, History, Poetry, Wisdom, Prophets, Gospels, Letters)
- Visual grid shows progress per book with color coding:
  - Green: 100% complete
  - Yellow gradient: 1-99% complete
  - Gray: 0% complete

**User Workflow A: Book Grid View**
1. User selects category (e.g., "Law")
2. Sees 5 books as colored squares
3. Taps book → chapter modal opens
4. Sees grid of all chapters (e.g., Genesis: 50 chapters)
5. Chapters show status: Green (complete), Yellow (partial), Gray (unread)
6. Tap chapter → opens JW.org deep link
7. Long-press chapter → edit partial verse count
8. Select mode: batch mark multiple chapters

---

### 2.2 Bible in 1 Year (Bibel in 1 Jahr)

**What it does**:
- 365 daily readings covering entire Bible in one year
- Fixed schedule: ~3-4 chapters per day
- On-track status: Shows days ahead/behind schedule
- Resume/Restart functionality for paused plans
- Organized in 10 sections: Moses, Promised Land, Kings, Exile & Return, Wisdom, Prophets, Jesus' Life, Congregation, Paul's Letters, Apostles' Writings

**On-Track Calculation**:
```
Expected Readings = Days Since Start
Actual Readings = Completed Count
Difference = Actual - Expected

Status:
  - On Track: Difference == 0
  - X Days Ahead: Difference > 0
  - X Days Behind: Difference < 0
```

**Pause/Resume**:
- User can pause plan (freezes progress tracking)
- Resume picks up where left off
- Restart clears current attempt, starts fresh
- History tracks all attempts

**User Workflow**:
1. Select "Bible in 1 Year" plan
2. First reading → Plan starts, tracks start date
3. Mark readings as complete
4. Badge shows on-track status (green/yellow/red)
5. If user falls behind, can still continue
6. Pause button freezes days-active counter
7. Return later → Modal offers Resume or Restart

---

### 2.3 Bible Overview (Bibelübersicht)

**What it does**:
- 123 readings focusing on key Bible accounts
- 2 sections:
  1. Historical Overview (106 readings) - OT events
  2. Congregation Development (17 readings) - NT church growth
- Shorter than 1 Year plan
- Uses unified `chaptersRead` for tracking

---

### 2.4 Thematic Plan (Thematisches Studium)

**What it does**:
- 17 study topics organized in 4 sections:
  1. **Famous People** (7 topics): Noah, Moses, Ruth, David, Abigail, Daniel, Elizabeth & Mary
  2. **Wisdom** (5 topics): Family, Friendships, Prayer, Sermon on Mount, Work
  3. **Help** (3 topics): Discouragement, Grief, Guilt
  4. **What the Bible Says** (2 topics): Last days, Hope for future

**Complex Reading Formats Supported**:
- Full chapters: Ruth 1-4
- Single chapters: 1 Samuel 17
- Verse ranges: 1 Samuel 25:2-35
- Scattered verses: Ephesians 5:28,29,33
- Cross-chapter: Genesis 6:9-9:19

**Auto-Detection**:
- Checkbox automatically checks if chapters already read (from other plans!)
- Individual scripture checkboxes within each topic
- Progress tracked as "topics completed" and "overall Bible progress"

**User Workflow B: Topic Expansion**
1. See 4 sections (collapsed by default)
2. Section with next unread topic auto-expands
3. Tap topic title → expands to show scripture list
4. Each scripture has:
   - Checkbox (mark as read)
   - Reference text (e.g., "Ruth 1-4")
   - External link icon → opens JW.org
5. Auto-detection: Checkbox automatically checks if already read elsewhere
6. Topic turns purple when ALL scriptures read

---

### 2.5 Manual Progress Entry

**User Workflow C**:
1. Tap "Add Progress" button (bottom of screen)
2. Input field appears with smart parser
3. Enter reading: "1mo 2-5" or "Matthäus 24:3-14"
4. Parser validates and suggests corrections:
   - Book not found → suggests similar books
   - Ambiguous input → shows options
   - Chapter exceeds book → suggests alternatives
5. On submit, chapters added to `chaptersRead`
6. All relevant plans update immediately
7. Firebase sync happens in background

---

## 3. KEY BUSINESS LOGIC

### 3.1 Bible Parsing (readingParser.js)

**Input Formats Supported**:
- Simple: "3" → Chapter 3
- Range: "3-5" → Chapters 3, 4, 5
- With verses: "3:1-5" → Chapter 3, verses 1-5
- Partial end: "3-4:15" → Chapter 3 complete, Chapter 4 up to verse 15
- Scattered: "3:1,2; 4:15" → Multiple verse references
- With book: "1mo 3-5" or "Matthäus 5:1-10"
- Across chapters: "2:1-4:2" → Chapters 2-4 with verse ranges

**Fuzzy Matching**:
- Levenshtein distance algorithm for book names
- Abbreviation matching (case-insensitive)
- Alternative names (e.g., "1. Mose" = "Genesis")
- Spelling suggestions (edit distance ≤ 3)
- Confidence levels: exact, high, medium, low

**Error Handling**:
- Chapter exceeds book range → suggests verse or range interpretations
- Book not found → suggests similar book names
- Ambiguous input → prompts user to clarify
- Format not recognized → shows examples

---

### 3.2 Schedule Management

**Priority Order for Loading**:
1. **In-memory cache** (fastest, cleared on reload)
2. **UserDefaults cache** (persists across sessions)
3. **Firebase Realtime Database** (admin-published)
4. **Static data files** (bundled fallback)

**Admin Schedule Update Flow**:
1. Admin enters admin mode (PIN 170182)
2. Settings → Admin Settings → Schedule Update
3. Enters year (2024-2030)
4. Taps "Download Schedule"
5. App fetches from wol.jw.org (WebFetch tool)
6. Parses HTML to extract weekly assignments
7. Converts to JSON: `{ year, weeks: [...] }`
8. Saves to Firebase: `/schedules/{year}/weeks[]`
9. Saves to UserDefaults cache
10. All users load from Firebase automatically

---

### 3.3 Unified Progress Tracking

**Core Concept**: Single source of truth for ALL reading plans.

**chaptersRead Array**:
- Every chapter read anywhere is stored here
- Language-independent: book numbers 1-66
- Immutable operations: functions return new arrays
- Timestamped: tracks when chapter was marked

**Performance Optimization**:
- `chaptersIndex` Map: Built from array for O(1) lookups
- Key format: "book:chapter" (e.g., "1:5" for Genesis 5)
- Memoized in context to avoid rebuilding

**Core Functions**:

**isReadingComplete(book, startChapter, endChapter, index)**
- Checks if ALL chapters in range are complete
- O(n) where n = chapters in range (typically 1-5)
- Used by all plans

**markReadingComplete(chaptersRead, book, start, end, source)**
- Marks all chapters in range as complete
- Sets timestamp to Date.now()
- Returns new array (immutable)
- Used when user taps "Mark Complete"

**Business Rules**:
- Chapters identified by (book, chapter) pair - unique
- Status can upgrade: partial → complete
- Status never downgrades automatically
- Timestamp = action time (critical for offline sync)
- Duplicate prevention: same book+chapter = replace entry
- Source tracking: informational only

---

### 3.4 Verse Progress Calculation

**Why Verse-Level Accuracy?**
Assignments aren't uniform:
- Genesis 1-3 = 80 verses
- Psalm 119 alone = 176 verses
- Obadiah 1 = 21 verses (entire book)

Chapter-based progress would be misleading.

**Calculation**:
1. Determine verse count per chapter
2. For complete chapters: count all verses
3. For partial chapters: count verses marked as read
4. Calculate: `versesRead / totalVerses`
5. Display as percentage

**Example**:
```
Assignment: Psalm 117-119
- Psalm 117: 2 verses (complete)
- Psalm 118: 29 verses (complete)
- Psalm 119: 176 verses (partial, 10 verses read)

Calculation:
Read: 2 + 29 + 10 = 41 verses
Total: 2 + 29 + 176 = 207 verses
Progress: 41/207 = 19.8%
```

---

## 4. OFFLINE-FIRST ARCHITECTURE

### 4.1 Storage Hierarchy

**Primary: UserDefaults**
- All user data stored locally
- Instant read/write (synchronous)
- Persists across sessions
- No network required
- Capacity: ~10 MB

**Secondary: Firebase Realtime Database**
- Optional: user must authenticate
- Purpose: sync across devices, backup
- Async: operations don't block UI
- Real-time: changes propagate immediately
- Graceful degradation: app works without Firebase

**Storage Keys**:
```
bibleCompanion_dailyText
bibleCompanion_weeklyReading
bibleCompanion_personalReading
bibleCompanion_schedule_{year}
bibleCompanion_yeartext_{year}
bibleCompanion_pendingSyncQueue
settings_meetingDay
settings_language
settings_readingPlan
```

---

### 4.2 Sync Queue System

**Problem**:
- User marks chapter on Phone A (offline)
- User marks same chapter on Phone B (offline)
- Both come online
- Which data wins?

**Solution: Event Sourcing with Sync Queue**

**Queue Structure**:
```swift
struct QueueItem {
    let id: String  // "daily_2025-12-25_mark_complete"
    let section: String  // "daily", "weekly", "personal"
    let action: String  // "mark_complete", "unmark_complete"
    let timestamp: Date  // When action occurred
    let data: [String: Any]
    var synced: Bool
    var retries: Int
}
```

**Enqueue (When User Acts)**:
1. User marks item (online or offline)
2. Action applied immediately to UserDefaults
3. Queue item created with composite ID
4. Duplicate check: if same ID exists, replace (latest wins)
5. Queue saved to UserDefaults
6. If online: trigger sync immediately
7. If offline: queue persists until reconnect

**Process Queue (When Online)**:
1. Get next unsynced item (FIFO)
2. Execute action via Firebase API
3. Mark item as synced
4. Remove from queue
5. Repeat until queue empty
6. On error: increment retry, keep in queue

**Conflict Resolution**:
- Timestamp comparison: latest action wins
- Timestamp = action time (Date.now() when tapped)
- Firebase stores timestamp with data
- On merge: compare timestamps, keep newer
- Tie-breaker: Firebase wins

---

### 4.3 Online/Offline Transitions

**Detection**:
```swift
import Network
let monitor = NWPathMonitor()
monitor.pathUpdateHandler = { path in
    if path.status == .satisfied {
        // Online
    } else {
        // Offline
    }
}
```

**When Going Offline**:
1. No special action needed
2. User continues working normally
3. Actions queued automatically
4. UI shows "working offline" (optional)

**When Coming Online**:
1. Network status changes
2. App checks: is user authenticated?
3. If yes: process pending sync queue
4. Queue items sync in FIFO order
5. UI updates after sync complete
6. Error handling: retry failed items

**Pull-to-Refresh (HomePage only)**:
- User pulls down on home screen
- Trigger: loadProgressFromFirebase(userId)
- Fetches latest data from Firebase
- Merges with local data (timestamp-based)
- Reconstructs weekly reading current week
- Shows "Reloading..." spinner

---

## 5. JW.ORG INTEGRATION

### 5.1 Deep Links

**Purpose**: Open Bible passages directly in JW Library app or jw.org.

**URL Format (Finder)**:
```
https://www.jw.org/finder?srcid=jwlshare&wtlocale={X}&prefer=lang&bible={start}-{end}&pub=nwtsty

Components:
- wtlocale: E=English, X=German, S=Spanish, I=Italian, F=French
- bible: BBCCCVVV format
  - BB: Book number (01-66), zero-padded
  - CCC: Chapter (001-150), zero-padded
  - VVV: Verse (001-176), zero-padded

Examples:
- Genesis 1:1 → bible=01001001-01001001
- Genesis 1-3 → bible=01001001-01003050
- Psalm 119:64-176 → bible=19119064-19119176
```

**How it Works**:
1. User taps "Open" on chapter/reading
2. App builds finder URL
3. Uses `UIApplication.open()` with URL
4. iOS detects Universal Link
5. Opens JW Library app if installed
6. Falls back to Safari if app not installed
7. User reads, then returns to app

**Language Support**:
- Detects current language
- Builds appropriate wtlocale code
- Verse navigation works across all 5 languages

---

## 6. ADMIN FEATURES

### 6.1 PIN-Based Admin Access

**Admin PIN: 170182**

**Activation Flow**:
1. User taps calendar icon 📅 next to date on homepage
2. PIN modal appears (if not in admin mode)
3. User enters 6-digit PIN: 170182
4. On correct PIN:
   - Admin mode activated
   - Saved to UserDefaults: `app_adminMode = true`
   - Date picker appears
   - Admin settings section visible

**What Admin Mode Unlocks**:

**1. Test Date Picker (HomePage)**
- Calendar icon functional
- Set any date for testing
- Affects: Daily Text date, Weekly Reading schedule, 1 Year plan calculation
- Date shown in orange when test date active
- Reset button returns to today

**2. Admin Settings Section (SettingsPage)**
- Exit Admin Access (red button)
- Reset App Settings (clear settings, keep progress)
- Device Info (unique device ID + copy button)
- Schedule Update (fetch from WOL by year)
- Initialize Templates (Firebase setup)
- Daily Reminders (future feature)
- Display Color Scheme (Light/Dark/System)

**3. Coming Soon Plans Visibility**
- Reading plans with `status: coming_soon` only appear in admin mode
- Regular users don't see incomplete features

**Exit Admin Access**:
1. Settings → Admin Settings
2. Tap "Exit Admin Access"
3. Admin mode deactivated
4. UserDefaults: `app_adminMode` removed
5. All admin features hidden

**Security Notes**:
- PIN is hardcoded (not configurable)
- No server validation (client-side only)
- Purpose: UX convenience, not security

---

## 7. INTERNATIONALIZATION

**Supported Languages**:
- German (de)
- English (en)
- Spanish (es)
- Italian (it)
- French (fr)

**Translation System**:
```swift
// Usage:
LocalizedStringKey("home.daily_text")  // "DAILY TEXT" (en)
```

**Key Features**:
- Centralized: All strings in Localizable.strings
- Namespaced: Organized by feature (home, weekly, reading)
- Parameter support: Dynamic values
- Fallback: Missing keys show key name

**Bible Book Names**:
- Each language has separate bible-books-{lang}.json
- Localized names, abbreviations, alternative names
- Used by parser for fuzzy matching

**Date Formatting**:
- Uses DateFormatter with locale
- Respects language setting
- Format: "Freitag, 27. Dezember 2024" (German)

---

## 8. DATA FLOWS

### Daily Text Flow
```
User Action: Mark Daily Text Complete
↓
1. DailyTextCard → markComplete(date)
↓
2. UserDefaults → Update immediately
   - Add date to completedDates
   - Calculate new streak
   - Set lastUpdated = Date.now()
↓
3. Create queue item
   - enqueueItem('daily', 'mark_complete', { date })
   - Save queue to UserDefaults
↓
4. If online + authenticated:
   - Process sync queue
   - Save to Firebase: /users/{userId}/progress/daily/
↓
5. UI updates immediately (from UserDefaults)
```

### Multi-Device Sync
```
Device A (offline): Marks Dec 25 at 10:00 AM
Device B (offline): Unmarks Dec 25 at 10:05 AM

Both come online:
↓
Device A syncs: timestamp 10:00 AM
Device B syncs: timestamp 10:05 AM
↓
Firebase merge: Compares timestamps
↓
Result: Dec 25 is UNMARKED (latest wins)
↓
Both devices receive merged state
```

---

## SUMMARY

This document describes the **functionality** of Bible Reading Companion without implementation details. Use this as the source of truth for **what** features should do, while implementation guides explain **how** to build them.

**Key Concepts**:
1. **Three Reading Systems**: Daily Text, Weekly Reading, Personal Reading
2. **Unified Progress Tracking**: Single `chaptersRead` array
3. **Offline-First**: UserDefaults + Firebase sync queue
4. **Smart Bible Parser**: Fuzzy matching, multiple formats
5. **Deep Links**: JW.org and JW Library integration
6. **Multi-Language**: 5 languages, ~300 translation keys
7. **Admin Features**: PIN-protected testing and management

---

**Last Updated**: 2026-01-23

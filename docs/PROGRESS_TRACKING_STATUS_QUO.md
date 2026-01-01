# Progress Tracking System - Status Quo Analysis
**Date:** 2026-01-01
**Purpose:** Document current state before unified refactoring

---

## 📊 FREE READING

### Data Structure
```javascript
chaptersRead: [
  {
    book: 1,              // 1-66
    chapter: 5,           // Chapter number
    status: 'complete',   // 'complete' | 'partial' | undefined
    verses: 10,           // Optional: for partial chapters
    timestamp: 1234567890 // Date.now()
  }
]
```

### Storage Location
- **LocalStorage Key:** `bibleCompanion_personalReading`
- **Firebase Path:** `/users/{userId}/progress/personalReading`
- **Structure:** `{ chaptersRead: [], thematicTopicsRead: [], selectedPlan: 'free' }`

### Operations

**Mark Complete:**
```javascript
markChapterComplete(bookNumber, chapter)
→ Adds/updates: { book, chapter, status: 'complete', timestamp }
```

**Mark Partial:**
```javascript
markChapterPartial(bookNumber, chapter, verses)
→ Adds/updates: { book, chapter, status: 'partial', verses, timestamp }
```

**Unmark:**
```javascript
unmarkChapter(bookNumber, chapter)
→ Removes entry from chaptersRead array
```

**Check Status:**
```javascript
getChapterStatus(bookNumber, chapter)
→ Returns: 'complete' | 'partial' | null
```

### Progress Calculation

**Per Book:**
```javascript
getBookProgress(bookNumber)
→ Filters chaptersRead by book
→ Calculates verses read / total verses
→ Returns { percentage, completed, total }
```

**Overall Bible:**
```javascript
calculateAllVersesRead(chaptersRead)
→ Sums verses for all chapters in array
→ Uses getVerseCount(book, chapter) for each entry
```

### Features
- ✅ Supports partial chapter tracking (verse-level granularity)
- ✅ Parser for text input ("Genesis 1-3", "Matt 5:1-10")
- ✅ Visual book grid with color-coded progress
- ✅ Chapter modal with individual chapter selection
- ✅ Batch operations (select multiple chapters)

### Edge Cases
- Partial chapter can be upgraded to complete
- Complete chapter can be downgraded to partial or unread
- Timestamp updates on each modification
- Parser validates against max chapters/verses

---

## 📅 1 YEAR PLAN

### Data Structure (CURRENT)
```javascript
// NEW (after refactoring):
Uses chaptersRead array (same as Free Reading)

// OLD (deprecated but still in localStorage):
bibleCompanion_oneyear: {
  completedReadings: [1, 5, 8, ...],  // Reading IDs (DEPRECATED)
  startDate: '2025-01-01',
  freezeHistory: [],
  lastUpdated: '...'
}
```

### Storage Location
- **LocalStorage Key:** `bibleCompanion_oneyear` (metadata only: startDate, freezeHistory)
- **Progress:** Uses global `chaptersRead` from `bibleCompanion_personalReading`

### Reading Format
```javascript
oneyearReadings = [
  { id: 1, section: 'moses', book: 1, startChapter: 1, endChapter: 3 },
  { id: 2, section: 'moses', book: 1, startChapter: 4, endChapter: 7 },
  ...
]
```

### Operations

**Check if Reading Complete:**
```javascript
isReadingCompleted(readingId, chaptersRead)
→ Finds reading by ID
→ Checks if ALL chapters (startChapter to endChapter) exist in chaptersRead
→ Returns boolean
```

**Mark Reading Complete:**
```javascript
markReadingComplete(readingId, chaptersRead)
→ Finds reading by ID
→ Adds ALL chapters (startChapter to endChapter) to chaptersRead
→ Format: { book, chapter, status: 'complete', timestamp }
→ Returns updated chaptersRead array
```

**Unmark Reading:**
```javascript
unmarkReadingComplete(readingId, chaptersRead)
→ Removes ALL chapters in range from chaptersRead
→ Returns updated chaptersRead array
```

### Progress Calculation

**Overall Progress:**
```javascript
getOneyearProgress(chaptersRead)
→ Iterates all 365 readings
→ Counts how many are complete (using isReadingCompleted)
→ Returns { total: 365, completed: X, percentage: Y }
```

**On Track Status:**
```javascript
getOnTrackStatus(chaptersRead)
→ Gets startDate from localStorage
→ Calculates days since start
→ Expected readings = daysSinceStart (1 per day)
→ Actual readings = getOneyearProgress().completed
→ Returns { daysAhead, daysBehind, expectedReadings, actualReadings, hasStarted }
```

### Features
- ✅ Auto-detection based on chaptersRead
- ✅ Synchronizes with Free Reading automatically
- ✅ On Track Meter (visual slider showing ahead/behind)
- ✅ Start date tracking
- ✅ Freeze/resume functionality (planned)

### Edge Cases
- Reading can overlap with other plans (same chapters)
- startDate persists independently of progress
- If chapters marked in Free Reading, 1 Year reading auto-completes

---

## 📖 BIBLE OVERVIEW

### Data Structure (CURRENT)
```javascript
// NEW (after refactoring):
Uses chaptersRead array (same as Free Reading)

// OLD (deprecated but still in localStorage):
bibleCompanion_bible_overview: {
  completedReadings: [1, 5, 8, ...],  // Reading IDs (DEPRECATED)
  lastUpdated: '...'
}
```

### Storage Location
- **LocalStorage Key:** `bibleCompanion_bible_overview` (deprecated)
- **Progress:** Uses global `chaptersRead` from `bibleCompanion_personalReading`

### Reading Format
```javascript
bibleOverviewReadings = [
  { id: 1, section: 'historical', book: 1, startChapter: 12, endChapter: 15 },
  { id: 2, section: 'historical', book: 1, startChapter: 16, endChapter: 18 },
  ...
]
```

### Operations
**Identical to 1 Year Plan:**
- `isReadingCompleted(readingId, chaptersRead)` - checks if all chapters present
- `markReadingComplete(readingId, chaptersRead)` - adds all chapters
- `unmarkReadingComplete(readingId, chaptersRead)` - removes all chapters

### Progress Calculation
```javascript
getBibleOverviewProgress(chaptersRead)
→ Counts completed readings
→ Returns { total, completed, percentage }
```

### Features
- ✅ Auto-detection based on chaptersRead
- ✅ Synchronizes with Free Reading and 1 Year Plan
- ✅ Two sections: Historical Overview + New Testament

### Edge Cases
- Same as 1 Year Plan (overlap, auto-completion)

---

## 🎯 THEMATIC PLAN

### Data Structure
```javascript
thematicTopicsRead: [1, 5, 8, ...]  // Topic IDs only
```

### Storage Location
- **LocalStorage Key:** `bibleCompanion_personalReading` (same object as Free Reading)
- **Field:** `thematicTopicsRead` array

### Topic Format
```javascript
thematicTopics = [
  { id: 1, section: 'famous_people', titleKey: 'thematic.noah', verses: 'Genesis 6:9–9:19' },
  { id: 2, section: 'famous_people', titleKey: 'thematic.moses', verses: 'Exodus 13:17–14:31' },
  { id: 3, section: 'famous_people', titleKey: 'thematic.ruth', verses: 'Ruth chapters 1-4' },
  { id: 8, section: 'wisdom', titleKey: 'thematic.family', verses: 'Ephesians 5:28, 29, 33; 6:1-4' },
  ...
]
```

### Verses Format Variants
- **Verse range in single chapter:** `"Genesis 6:9–9:19"` (Chapter 6 verse 9 to Chapter 9 verse 19)
- **Full chapters:** `"Ruth chapters 1-4"`
- **Single chapter:** `"1 Samuel chapter 17"`
- **Verse ranges in chapter:** `"1 Samuel 25:2-35"`
- **Multiple scattered verses:** `"Ephesians 5:28, 29, 33; 6:1-4"`

### Operations

**Mark Topic Complete:**
```javascript
markThematicTopicComplete(topicId)
→ Adds topicId to thematicTopicsRead array
→ Does NOT modify chaptersRead!
```

**Unmark Topic:**
```javascript
unmarkThematicTopicComplete(topicId)
→ Removes topicId from thematicTopicsRead array
```

**Check if Complete:**
```javascript
isThematicTopicComplete(topicId)
→ Returns thematicTopicsRead.includes(topicId)
```

### Progress Calculation
```javascript
getThematicProgress()
→ Counts topics in thematicTopicsRead
→ Returns { total: 40, completed: X, percentage: Y }
```

### Features
- ❌ NO automatic synchronization with chaptersRead
- ❌ NO partial tracking
- ✅ Manual topic-level marking only
- ✅ Organized by sections (Famous People, Wisdom, Prophecies, etc.)

### Edge Cases
- Verses format is string-based, not parsed
- Topics can cover single verses, not full chapters
- No way to track partial topic completion
- Marking topic does NOT affect Free Reading progress

---

## 🔴 ISSUES & INCONSISTENCIES

### 1. Thematic Plan Isolation
**Problem:** Thematic topics don't contribute to chaptersRead
**Impact:** Reading "Ruth chapters 1-4" in Thematic doesn't mark Ruth 1-4 as complete in Free Reading
**Root Cause:** Manual topic-level tracking with unparsed verse strings

### 2. Status Field Inconsistency
**Problem:** Free Reading uses `status: 'complete' | 'partial'`, but 1 Year/Bible Overview only recently added it
**Impact:** Existing data might not have status field
**Workaround:** Default to 'complete' if status is undefined

### 3. Duplicate Storage (Deprecated)
**Problem:** Old `completedReadings` arrays still in localStorage for 1 Year and Bible Overview
**Impact:** Wasted storage, potential confusion
**Fix Needed:** Migration/cleanup script

### 4. Partial Chapter Support
**Problem:** Only Free Reading supports partial chapters (verse-level granularity)
**Impact:** Other plans can't track partial progress
**Question:** Should 1 Year/Bible Overview support partial readings?

### 5. Progress Calculation Scattered
**Problem:** Multiple implementations of similar logic:
- `calculateAllVersesRead()` (new, global)
- `calculateVersesRead()` (old, per-book)
- `getBookProgress()` (Free Reading)
- `getOneyearProgress()` (1 Year)
- `getBibleOverviewProgress()` (Bible Overview)
- `getThematicProgress()` (Thematic)

**Impact:** Code duplication, potential bugs, performance overhead

### 6. Timestamp Format
**Problem:** Mixed formats:
- Free Reading: `Date.now()` (number)
- 1 Year/Bible Overview: `new Date().toISOString()` (string)

**Impact:** Inconsistent sorting, parsing

---

## 📈 PERFORMANCE CONCERNS

### Current Performance Bottlenecks

1. **Array Filtering on Every Render:**
   - `chaptersRead.filter(ch => ch.book === bookNumber)` called repeatedly
   - No memoization or caching

2. **Redundant Progress Calculations:**
   - Overall Bible Progress calculated in header
   - Same calculation repeated for each plan
   - Could be computed once and cached

3. **Nested Loops in isReadingCompleted:**
   - For each reading, loops through all chapters
   - For large chaptersRead arrays, this is O(n*m)

4. **No Indexing:**
   - Linear search through chaptersRead for every operation
   - Could use Map/Set for O(1) lookups: `Map<"book:chapter", ChapterData>`

---

## 💾 STORAGE SIZE ANALYSIS

### Current Storage Usage (Example)

**If all 1189 chapters marked complete:**
```javascript
chaptersRead = [
  { book: 1, chapter: 1, status: 'complete', timestamp: 1234567890 },
  // ... x 1189
]
```

**Estimated size:**
- Per entry: ~60 bytes (JSON serialized)
- 1189 chapters × 60 bytes ≈ **71 KB**

**With partial chapters (20% partial):**
- Additional verses field: ~10 bytes per partial entry
- 238 partial × 10 bytes ≈ **2.4 KB**
- **Total: ~73 KB**

**LocalStorage limit:** 5-10 MB (varies by browser)
**Current usage:** < 1% of limit ✅

---

## 🎯 REQUIREMENTS SUMMARY

### What Each Plan Needs

**Free Reading:**
- ✅ Verse-level granularity (partial chapters)
- ✅ Flexible input (parser)
- ✅ Visual progress (book grid, chapter modal)
- ✅ Batch operations

**1 Year Plan:**
- ✅ Chapter-level granularity (no partials needed)
- ✅ Auto-detection from chaptersRead
- ✅ On Track Meter (time-based progress)
- ✅ Start date tracking
- ⏳ Freeze/resume history

**Bible Overview:**
- ✅ Chapter-level granularity
- ✅ Auto-detection from chaptersRead
- ✅ Section-based organization

**Thematic Plan:**
- ❓ Verse-level granularity (single verses, verse ranges)
- ❓ Should it modify chaptersRead?
- ✅ Topic-level completion (current)
- ❓ Auto-suggestion when topic chapters are all read?

---

## 🔮 NEXT STEPS

This analysis will inform the design of the unified progress tracking architecture.

**Key Questions to Answer:**
1. Should Thematic Plan parse verses and add to chaptersRead?
2. Should we index chaptersRead for O(1) lookups?
3. Should we unify timestamp format?
4. Should we cache progress calculations?
5. How to handle migration of old completedReadings arrays?

**Continue to:** `PROGRESS_TRACKING_ARCHITECTURE.md` (design phase)

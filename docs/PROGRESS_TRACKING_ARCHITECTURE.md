# Progress Tracking Architecture - Unified Concept
**Date:** 2026-01-01
**Status:** 🎯 DESIGN PHASE
**Based on:** PROGRESS_TRACKING_STATUS_QUO.md

---

## 🎯 DESIGN GOALS

1. **Single Source of Truth:** One `chaptersRead` array for all plans
2. **Plan Masking:** Each plan "queries" chaptersRead to determine completion
3. **Performance:** O(1) lookups via indexing, cached calculations
4. **Consistency:** Unified data formats, no duplication
5. **Extensibility:** Easy to add new reading plans

---

## 📊 CORE DATA STRUCTURE

### Primary Storage: chaptersRead Array

```javascript
chaptersRead: [
  {
    book: 1,                    // 1-66 (required)
    chapter: 5,                 // Chapter number (required)
    status: 'complete',         // 'complete' | 'partial' (required)
    verses: 10,                 // Number of verses read (optional, for partial)
    timestamp: 1234567890,      // Unix timestamp in milliseconds (required)
    source: 'free'              // 'free' | 'oneyear' | 'bible_overview' | 'thematic' (optional, for tracking)
  }
]
```

### Index Structure (In-Memory, Computed on Load)

```javascript
chaptersIndex: Map<string, ChapterData>
// Key format: "book:chapter" (e.g., "1:5" for Genesis 5)
// Value: ChapterData object from chaptersRead

Example:
chaptersIndex.set("1:5", { book: 1, chapter: 5, status: 'complete', ... })
```

**Benefits:**
- O(1) lookup: `chaptersIndex.get("1:5")`
- Fast existence check: `chaptersIndex.has("1:5")`
- No array filtering needed

---

## 🔧 UNIFIED OPERATIONS

### Core Functions (New: `src/utils/progressTracking.js`)

```javascript
/**
 * Initialize index from chaptersRead array
 */
export const buildChaptersIndex = (chaptersRead) => {
  const index = new Map()
  chaptersRead.forEach(chapter => {
    const key = `${chapter.book}:${chapter.chapter}`
    index.set(key, chapter)
  })
  return index
}

/**
 * Check if chapter is read (with optional status filter)
 */
export const isChapterRead = (book, chapter, chaptersIndex, statusFilter = null) => {
  const key = `${book}:${chapter}`
  const data = chaptersIndex.get(key)

  if (!data) return false
  if (statusFilter && data.status !== statusFilter) return false
  return true
}

/**
 * Add/update chapter in chaptersRead
 */
export const setChapterRead = (chaptersRead, book, chapter, status, verses = null, source = null) => {
  const timestamp = Date.now()
  const newChaptersRead = [...chaptersRead]

  const index = newChaptersRead.findIndex(c => c.book === book && c.chapter === chapter)

  const chapterData = {
    book,
    chapter,
    status,
    timestamp,
    ...(verses !== null && { verses }),
    ...(source && { source })
  }

  if (index > -1) {
    newChaptersRead[index] = chapterData
  } else {
    newChaptersRead.push(chapterData)
  }

  return newChaptersRead
}

/**
 * Remove chapter from chaptersRead
 */
export const removeChapter = (chaptersRead, book, chapter) => {
  return chaptersRead.filter(c => !(c.book === book && c.chapter === chapter))
}

/**
 * Check if a reading (multiple chapters) is complete
 */
export const isReadingComplete = (book, startChapter, endChapter, chaptersIndex) => {
  for (let ch = startChapter; ch <= endChapter; ch++) {
    if (!isChapterRead(book, ch, chaptersIndex, 'complete')) {
      return false
    }
  }
  return true
}

/**
 * Mark all chapters in a reading as complete
 */
export const markReadingComplete = (chaptersRead, book, startChapter, endChapter, source = null) => {
  let newChaptersRead = [...chaptersRead]

  for (let ch = startChapter; ch <= endChapter; ch++) {
    newChaptersRead = setChapterRead(newChaptersRead, book, ch, 'complete', null, source)
  }

  return newChaptersRead
}

/**
 * Unmark all chapters in a reading
 */
export const unmarkReading = (chaptersRead, book, startChapter, endChapter) => {
  let newChaptersRead = [...chaptersRead]

  for (let ch = startChapter; ch <= endChapter; ch++) {
    newChaptersRead = removeChapter(newChaptersRead, book, ch)
  }

  return newChaptersRead
}
```

---

## 📈 PROGRESS CALCULATION (Cached)

### Cache Structure

```javascript
progressCache: {
  overall: {
    versesRead: 15234,
    totalVerses: 31102,
    percentage: 49,
    timestamp: 1234567890,  // Cache invalidation
    chaptersReadCount: 523  // For invalidation check
  },
  plans: {
    oneyear: { completed: 150, total: 365, percentage: 41 },
    bible_overview: { completed: 45, total: 180, percentage: 25 },
    thematic: { completed: 12, total: 40, percentage: 30 }
  }
}
```

### Cache Invalidation Strategy

**When to invalidate:**
- Any modification to `chaptersRead` array
- Compare: `chaptersRead.length !== cache.chaptersReadCount`

**Implementation:**
```javascript
export const getOverallProgress = (chaptersRead, cache = null) => {
  // Check cache validity
  if (cache?.overall && cache.overall.chaptersReadCount === chaptersRead.length) {
    return cache.overall
  }

  // Recalculate
  const versesRead = calculateAllVersesRead(chaptersRead)
  const totalVerses = calculateTotalBibleVerses()
  const percentage = Math.round((versesRead / totalVerses) * 100)

  return {
    versesRead,
    totalVerses,
    percentage,
    timestamp: Date.now(),
    chaptersReadCount: chaptersRead.length
  }
}
```

---

## 🎯 THEMATIC PLAN INTEGRATION

### Verse Parsing Strategy

**Input Formats to Support:**
```javascript
"Genesis 6:9–9:19"          → Books 1, chapters 6-9
"Ruth chapters 1-4"         → Book 8, chapters 1-4
"1 Samuel chapter 17"       → Book 9, chapter 17
"1 Samuel 25:2-35"          → Book 9, chapter 25 (partial)
"Ephesians 5:28, 29, 33; 6:1-4" → Book 49, chapters 5-6 (partial)
```

### Parser Function (New: `src/utils/thematicVersesParser.js`)

```javascript
/**
 * Parse thematic verses string into chapter ranges
 * Returns array of { book, startChapter, endChapter, isPartial, verses? }
 */
export const parseThematicVerses = (versesString) => {
  // Use existing parseReadingInput from readingParser.js
  const result = parseMultipleVerses(versesString)

  // Transform to chapter ranges
  const ranges = []

  result.forEach(({ book, chapter, startVerse, endVerse }) => {
    if (!book || !chapter) return

    // Check if it's a full chapter or partial
    const totalVerses = getVerseCount(book.number, chapter)
    const isFullChapter = !startVerse || (startVerse === 1 && endVerse === totalVerses)

    if (isFullChapter) {
      ranges.push({
        book: book.number,
        chapter,
        isPartial: false
      })
    } else {
      const versesRead = endVerse - startVerse + 1
      ranges.push({
        book: book.number,
        chapter,
        isPartial: true,
        verses: versesRead
      })
    }
  })

  return ranges
}

/**
 * Check if a thematic topic is complete based on chaptersRead
 */
export const isThematicTopicComplete = (topicId, chaptersRead) => {
  const topic = thematicTopics.find(t => t.id === topicId)
  if (!topic) return false

  const ranges = parseThematicVerses(topic.verses)
  const index = buildChaptersIndex(chaptersRead)

  // Check if ALL ranges are satisfied
  for (const range of ranges) {
    const chapterData = index.get(`${range.book}:${range.chapter}`)

    if (!chapterData) return false

    if (range.isPartial) {
      // For partial, check if enough verses read
      if (chapterData.status === 'complete') continue // Full chapter covers it
      if (chapterData.status === 'partial' && chapterData.verses >= range.verses) continue
      return false
    } else {
      // For full chapter, must be complete
      if (chapterData.status !== 'complete') return false
    }
  }

  return true
}

/**
 * Mark thematic topic as complete (adds all chapters to chaptersRead)
 */
export const markThematicTopicComplete = (chaptersRead, topicId) => {
  const topic = thematicTopics.find(t => t.id === topicId)
  if (!topic) return chaptersRead

  const ranges = parseThematicVerses(topic.verses)
  let newChaptersRead = [...chaptersRead]

  ranges.forEach(range => {
    if (range.isPartial) {
      newChaptersRead = setChapterRead(
        newChaptersRead,
        range.book,
        range.chapter,
        'partial',
        range.verses,
        'thematic'
      )
    } else {
      newChaptersRead = setChapterRead(
        newChaptersRead,
        range.book,
        range.chapter,
        'complete',
        null,
        'thematic'
      )
    }
  })

  return newChaptersRead
}
```

### Thematic Storage (Simplified)

**REMOVE:**
```javascript
thematicTopicsRead: [1, 5, 8, ...]  // OLD - DELETE THIS
```

**KEEP (Optional, for Manual Overrides):**
```javascript
thematicManualCompletions: [12, 23]  // Topics manually marked without reading
```

**Why?** User might want to mark topic as "covered" without reading every verse (e.g., already studied it).

---

## 🏗️ PLAN-SPECIFIC LOGIC

### 1 Year Plan

```javascript
// oneyear-readings.js
export const isReadingCompleted = (readingId, chaptersIndex) => {
  const reading = oneyearReadings.find(r => r.id === readingId)
  if (!reading) return false

  return isReadingComplete(reading.book, reading.startChapter, reading.endChapter, chaptersIndex)
}

export const markReadingComplete = (chaptersRead, readingId) => {
  const reading = oneyearReadings.find(r => r.id === readingId)
  if (!reading) return chaptersRead

  return markReadingComplete(chaptersRead, reading.book, reading.startChapter, reading.endChapter, 'oneyear')
}
```

### Bible Overview

```javascript
// bible-overview-readings.js
// IDENTICAL to 1 Year Plan pattern
export const isReadingCompleted = (readingId, chaptersIndex) => {
  const reading = bibleOverviewReadings.find(r => r.id === readingId)
  if (!reading) return false

  return isReadingComplete(reading.book, reading.startChapter, reading.endChapter, chaptersIndex)
}
```

### Free Reading

```javascript
// No changes needed - already uses chaptersRead directly
// Just ensure it uses unified timestamp format (Date.now())
```

### Thematic Plan

```javascript
// thematic-topics.js
export const isTopicComplete = (topicId, chaptersRead) => {
  // First check manual completions
  const manualCompletions = getManualCompletions()
  if (manualCompletions.includes(topicId)) return true

  // Then check chaptersRead
  return isThematicTopicComplete(topicId, chaptersRead)
}

export const markTopicComplete = (chaptersRead, topicId, isManual = false) => {
  if (isManual) {
    // Add to manual completions list
    addManualCompletion(topicId)
    return chaptersRead
  }

  // Parse and add chapters
  return markThematicTopicComplete(chaptersRead, topicId)
}
```

---

## 🎨 REACT COMPONENT INTEGRATION

### Context Provider (New: `ProgressContext.jsx`)

```javascript
export const ProgressProvider = ({ children }) => {
  const [chaptersRead, setChaptersRead] = useState([])
  const [chaptersIndex, setChaptersIndex] = useState(new Map())
  const [progressCache, setProgressCache] = useState({})

  // Rebuild index when chaptersRead changes
  useEffect(() => {
    const index = buildChaptersIndex(chaptersRead)
    setChaptersIndex(index)

    // Invalidate cache
    setProgressCache({})
  }, [chaptersRead])

  // Memoized progress calculations
  const overallProgress = useMemo(() => {
    return getOverallProgress(chaptersRead, progressCache)
  }, [chaptersRead, progressCache])

  const oneyearProgress = useMemo(() => {
    return getOneyearProgress(chaptersRead, chaptersIndex, progressCache)
  }, [chaptersRead, chaptersIndex, progressCache])

  // ... more memoized calculations

  return (
    <ProgressContext.Provider value={{
      chaptersRead,
      setChaptersRead,
      chaptersIndex,
      overallProgress,
      oneyearProgress,
      // ... more values
    }}>
      {children}
    </ProgressContext.Provider>
  )
}

export const useProgress = () => useContext(ProgressContext)
```

### Usage in Components

```javascript
// PersonalReadingPage.jsx
const { chaptersRead, setChaptersRead, chaptersIndex, overallProgress } = useProgress()

// Mark chapter complete
const handleMarkComplete = (book, chapter) => {
  const newChaptersRead = setChapterRead(chaptersRead, book, chapter, 'complete', null, 'free')
  setChaptersRead(newChaptersRead)
  savePersonalReadingData({ ...personalData, chaptersRead: newChaptersRead })
}

// Check if reading complete
const isComplete = isReadingComplete(1, 1, 3, chaptersIndex) // Genesis 1-3
```

---

## ⚡ PERFORMANCE OPTIMIZATIONS

### 1. Indexing
- **Build index once** on data load
- **Update incrementally** on single chapter changes
- **Rebuild completely** on batch operations

### 2. Memoization
- Use `useMemo` for all progress calculations
- Dependencies: `chaptersRead.length` (not the array itself)

### 3. Debouncing
- Debounce Firebase sync on rapid changes
- Batch multiple chapter marks into single save

### 4. Virtual Scrolling
- For book grid in Free Reading (66 books)
- For long reading lists in 1 Year Plan (365 readings)

### 5. Lazy Loading
- Don't calculate plan progress until plan is selected
- Use React.lazy for plan-specific components

---

## 🔄 DATA MIGRATION

**Decision:** ❌ **NO MIGRATION** (per user request)

**Strategy:**
- Keep old data structures in localStorage
- New code writes to `chaptersRead` only
- Old `completedReadings` arrays ignored
- Users start fresh or manually re-mark

**Cleanup (Optional, Future):**
```javascript
// Can add button in Settings to clean old data
export const cleanupOldData = () => {
  localStorage.removeItem('bibleCompanion_oneyear') // Keep only metadata
  localStorage.removeItem('bibleCompanion_bible_overview')
  // Keep thematicTopicsRead for backwards compat (until fully migrated)
}
```

---

## 📐 UNIFIED STANDARDS

### Timestamp Format
```javascript
timestamp: Date.now()  // Always milliseconds since epoch
```

### Status Values
```javascript
status: 'complete' | 'partial'  // No undefined, always set
```

### Source Tracking (Optional)
```javascript
source: 'free' | 'oneyear' | 'bible_overview' | 'thematic'
```
**Purpose:** Analytics, debugging, potential "Reading History" feature

---

## 🧪 TESTING STRATEGY

### Unit Tests (New: `src/utils/__tests__/progressTracking.test.js`)

```javascript
describe('progressTracking', () => {
  test('buildChaptersIndex creates correct Map', () => {
    const chaptersRead = [
      { book: 1, chapter: 1, status: 'complete', timestamp: 123 }
    ]
    const index = buildChaptersIndex(chaptersRead)
    expect(index.get('1:1')).toEqual(chaptersRead[0])
  })

  test('isReadingComplete checks all chapters', () => {
    const index = new Map([
      ['1:1', { book: 1, chapter: 1, status: 'complete' }],
      ['1:2', { book: 1, chapter: 2, status: 'complete' }],
      ['1:3', { book: 1, chapter: 3, status: 'partial' }]
    ])

    expect(isReadingComplete(1, 1, 2, index)).toBe(true)  // 1-2 complete
    expect(isReadingComplete(1, 1, 3, index)).toBe(false) // 3 is partial
  })

  // ... more tests
})
```

### Integration Tests

- Mark chapter in Free Reading → verify 1 Year reading auto-completes
- Mark 1 Year reading → verify Free Reading shows green chapters
- Mark Thematic topic → verify chapters appear in Free Reading
- Performance: measure index build time for 1189 chapters (should be < 10ms)

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Core Infrastructure
- [ ] Create `src/utils/progressTracking.js` with core functions
- [ ] Create `src/utils/thematicVersesParser.js`
- [ ] Create `src/context/ProgressContext.jsx`
- [ ] Add unit tests

### Phase 2: Refactor Plans
- [ ] Update Free Reading to use unified functions
- [ ] Update 1 Year Plan to use chaptersIndex
- [ ] Update Bible Overview to use chaptersIndex
- [ ] Update Thematic Plan to parse verses

### Phase 3: UI Integration
- [ ] Integrate ProgressContext in App.jsx
- [ ] Update PersonalReadingPage to use context
- [ ] Update progress bars to use cached calculations
- [ ] Add loading states

### Phase 4: Cleanup
- [ ] Remove old completedReadings code
- [ ] Remove duplicate progress calculation functions
- [ ] Add deprecation warnings for old data structures
- [ ] Update documentation

---

## 🎯 SUCCESS CRITERIA

1. ✅ All plans use same `chaptersRead` array
2. ✅ O(1) chapter lookup via index
3. ✅ Progress calculations cached and memoized
4. ✅ Thematic Plan integrated with verse parsing
5. ✅ No code duplication in progress calculation
6. ✅ Performance: < 100ms for all progress calculations
7. ✅ Tests: > 90% coverage for core functions

---

## 🚀 FUTURE ENHANCEMENTS

### Smart Completion Detection
```javascript
// Suggest marking readings when all chapters are complete
export const getSuggestedCompletions = (chaptersRead, plan) => {
  const suggestions = []

  plan.readings.forEach(reading => {
    const isComplete = isReadingComplete(reading.book, reading.startChapter, reading.endChapter, index)
    const isMarked = /* check if user already marked it */

    if (isComplete && !isMarked) {
      suggestions.push({ readingId: reading.id, type: 'auto-detected' })
    }
  })

  return suggestions
}
```

### Reading History / Timeline
```javascript
// Show chronological reading history
export const getReadingTimeline = (chaptersRead) => {
  return chaptersRead
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(ch => ({
      ...ch,
      bookName: getBibleBooks().books[ch.book - 1]?.name,
      date: new Date(ch.timestamp)
    }))
}
```

### Statistics & Insights
- Reading streak (consecutive days)
- Average chapters per day
- Most read book
- Reading speed (verses per session)
- Plan comparison (which plan you're ahead/behind in)

---

## 📝 NOTES

This architecture prioritizes:
1. **Performance** - Indexed lookups, cached calculations
2. **Consistency** - Single data structure, unified functions
3. **Extensibility** - Easy to add new plans
4. **Simplicity** - Clear separation of concerns

The design follows React best practices:
- Context for global state
- Memoization for expensive calculations
- Pure functions for data transformations
- Component composition over complex logic

---

**Next Step:** Begin implementation (Phase 1: Core Infrastructure)

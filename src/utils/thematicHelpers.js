/**
 * Thematic Plan Helpers
 *
 * Utilities for working with Thematic Plan topics and their language-independent readings format.
 *
 * Reading Format (Language-Independent):
 * - Full chapters: { book: 8, startChapter: 1, endChapter: 4 }
 * - Single chapter: { book: 9, chapter: 17 }
 * - Verse range: { book: 9, chapter: 25, startVerse: 2, endVerse: 35 }
 * - Scattered verses: { book: 49, chapter: 5, verses: [28, 29, 33] }
 */

import { getVerseCount } from './verseProgressCalculator'
import { buildChaptersIndex, setChapterRead } from './progressTracking'
import { getBibleBooks } from '../config/languages'

/**
 * Format a reading for display in current language
 *
 * @param {Object} reading - Reading object with book number
 * @param {string} language - Language code (de, en, es, it, fr)
 * @returns {string} Formatted reading string
 *
 * @example
 * formatReadingForDisplay({ book: 1, startChapter: 1, endChapter: 3 }, 'en')
 * // → "Genesis 1-3"
 */
export const formatReadingForDisplay = (reading, language) => {
  const bibleBooks = getBibleBooks(language)
  const bookName = bibleBooks.books[reading.book - 1]?.name || `Book ${reading.book}`

  // Full chapter range (e.g., "Genesis 1-3")
  if (reading.startChapter && reading.endChapter && !reading.startVerse) {
    if (reading.startChapter === reading.endChapter) {
      return `${bookName} ${reading.startChapter}`
    }
    return `${bookName} ${reading.startChapter}-${reading.endChapter}`
  }

  // Single chapter (e.g., "1 Samuel 17")
  if (reading.chapter && !reading.startVerse && !reading.verses) {
    return `${bookName} ${reading.chapter}`
  }

  // Verse range in single chapter (e.g., "1 Samuel 25:2-35")
  if (reading.chapter && reading.startVerse && reading.endVerse) {
    return `${bookName} ${reading.chapter}:${reading.startVerse}-${reading.endVerse}`
  }

  // Verse range across chapters (e.g., "Genesis 6:9–9:19")
  if (reading.startChapter && reading.endChapter && reading.startVerse && reading.endVerse) {
    if (reading.startChapter === reading.endChapter) {
      return `${bookName} ${reading.startChapter}:${reading.startVerse}-${reading.endVerse}`
    }
    return `${bookName} ${reading.startChapter}:${reading.startVerse}–${reading.endChapter}:${reading.endVerse}`
  }

  // Scattered verses (e.g., "Ephesians 5:28, 29, 33")
  if (reading.verses && Array.isArray(reading.verses) && reading.chapter) {
    return `${bookName} ${reading.chapter}:${reading.verses.join(', ')}`
  }

  return bookName
}

/**
 * Check if a single reading is satisfied in chaptersRead
 *
 * @param {Object} reading - Reading object
 * @param {Map} chaptersIndex - Index built from chaptersRead
 * @returns {boolean} True if reading requirements are met
 *
 * @example
 * isReadingSatisfied({ book: 8, startChapter: 1, endChapter: 4 }, index)
 */
export const isReadingSatisfied = (reading, chaptersIndex) => {
  // Full chapter range (e.g., Ruth 1-4)
  if (reading.startChapter && reading.endChapter && !reading.startVerse) {
    for (let ch = reading.startChapter; ch <= reading.endChapter; ch++) {
      const key = `${reading.book}:${ch}`
      const chapterData = chaptersIndex.get(key)

      if (!chapterData || chapterData.status !== 'complete') {
        return false
      }
    }
    return true
  }

  // Single chapter (e.g., 1 Samuel 17)
  if (reading.chapter && !reading.startVerse && !reading.verses) {
    const key = `${reading.book}:${reading.chapter}`
    const chapterData = chaptersIndex.get(key)
    return chapterData && chapterData.status === 'complete'
  }

  // Verse range in single chapter (e.g., 1 Samuel 25:2-35)
  if (reading.chapter && reading.startVerse && reading.endVerse) {
    const key = `${reading.book}:${reading.chapter}`
    const chapterData = chaptersIndex.get(key)

    if (!chapterData) return false

    // Full chapter covers it
    if (chapterData.status === 'complete') return true

    // Partial chapter - check if enough verses
    if (chapterData.status === 'partial' && chapterData.verses) {
      const versesNeeded = reading.endVerse - reading.startVerse + 1
      return chapterData.verses >= versesNeeded
    }

    return false
  }

  // Verse range across chapters (e.g., Genesis 6:9–9:19)
  if (reading.startChapter && reading.endChapter && reading.startVerse && reading.endVerse) {
    // Simplified: check if all chapters in range are complete
    for (let ch = reading.startChapter; ch <= reading.endChapter; ch++) {
      const key = `${reading.book}:${ch}`
      const chapterData = chaptersIndex.get(key)

      if (!chapterData || chapterData.status !== 'complete') {
        return false
      }
    }
    return true
  }

  // Scattered verses (e.g., [28, 29, 33])
  if (reading.verses && Array.isArray(reading.verses) && reading.chapter) {
    const key = `${reading.book}:${reading.chapter}`
    const chapterData = chaptersIndex.get(key)

    if (!chapterData) return false

    // Full chapter covers it
    if (chapterData.status === 'complete') return true

    // Partial chapter - check if enough verses
    if (chapterData.status === 'partial' && chapterData.verses) {
      const versesNeeded = reading.verses.length
      return chapterData.verses >= versesNeeded
    }

    return false
  }

  return false
}

/**
 * Check if a thematic topic is complete based on chaptersRead
 *
 * @param {Object} topic - Topic object with readings array
 * @param {Array} chaptersRead - Array of read chapters
 * @returns {boolean} True if ALL readings in topic are satisfied
 *
 * @example
 * const topic = { id: 1, readings: [{ book: 8, startChapter: 1, endChapter: 4 }] }
 * isThematicTopicComplete(topic, chaptersRead)
 */
export const isThematicTopicComplete = (topic, chaptersRead) => {
  if (!topic || !topic.readings || !Array.isArray(topic.readings)) {
    return false
  }

  const index = buildChaptersIndex(chaptersRead)

  // Check if ALL readings are satisfied
  for (const reading of topic.readings) {
    if (!isReadingSatisfied(reading, index)) {
      return false
    }
  }

  return true
}

/**
 * Mark thematic topic as complete (adds all chapters/verses to chaptersRead)
 *
 * @param {Object} topic - Topic object with readings array
 * @param {Array} chaptersRead - Current chaptersRead array
 * @param {string} source - Source identifier (e.g., 'thematic')
 * @returns {Array} New chaptersRead array with topic readings added
 *
 * @example
 * const newChapters = markThematicTopicComplete(topic, chaptersRead, 'thematic')
 */
export const markThematicTopicComplete = (topic, chaptersRead, source = 'thematic') => {
  if (!topic || !topic.readings || !Array.isArray(topic.readings)) {
    return chaptersRead
  }

  let newChaptersRead = [...chaptersRead]

  topic.readings.forEach(reading => {
    // Full chapter range
    if (reading.startChapter && reading.endChapter && !reading.startVerse) {
      for (let ch = reading.startChapter; ch <= reading.endChapter; ch++) {
        newChaptersRead = setChapterRead(newChaptersRead, reading.book, ch, 'complete', null, source)
      }
      return
    }

    // Single chapter
    if (reading.chapter && !reading.startVerse && !reading.verses) {
      newChaptersRead = setChapterRead(newChaptersRead, reading.book, reading.chapter, 'complete', null, source)
      return
    }

    // Verse range in single chapter
    if (reading.chapter && reading.startVerse && reading.endVerse) {
      const versesRead = reading.endVerse - reading.startVerse + 1
      newChaptersRead = setChapterRead(newChaptersRead, reading.book, reading.chapter, 'partial', versesRead, source)
      return
    }

    // Verse range across chapters - mark all chapters as complete
    if (reading.startChapter && reading.endChapter && reading.startVerse && reading.endVerse) {
      for (let ch = reading.startChapter; ch <= reading.endChapter; ch++) {
        newChaptersRead = setChapterRead(newChaptersRead, reading.book, ch, 'complete', null, source)
      }
      return
    }

    // Scattered verses
    if (reading.verses && Array.isArray(reading.verses) && reading.chapter) {
      const versesRead = reading.verses.length
      newChaptersRead = setChapterRead(newChaptersRead, reading.book, reading.chapter, 'partial', versesRead, source)
    }
  })

  return newChaptersRead
}

/**
 * Unmark thematic topic (remove all chapters/verses for this topic)
 *
 * Note: For now, this is disabled to prevent data loss. Users can unmark via Free Reading.
 * A proper implementation would need to track which source added each chapter to handle overlapping topics.
 *
 * @param {Object} topic - Topic object with readings array
 * @param {Array} chaptersRead - Current chaptersRead array
 * @returns {Array} Unchanged chaptersRead array (function disabled)
 */
export const unmarkThematicTopicComplete = (topic, chaptersRead) => {
  // Disabled: Removing chapters could affect other plans
  // Users should use Free Reading to unmark individual chapters
  return chaptersRead
}

/**
 * Get progress for all thematic topics
 *
 * @param {Array} topics - Array of thematic topic objects
 * @param {Array} chaptersRead - Array of read chapters
 * @returns {Object} { total, completed, percentage }
 */
export const getThematicProgress = (topics, chaptersRead) => {
  const total = topics.length
  let completed = 0

  topics.forEach(topic => {
    if (isThematicTopicComplete(topic, chaptersRead)) {
      completed++
    }
  })

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return {
    total,
    completed,
    percentage
  }
}

/**
 * Progress Tracking - Unified Core Utilities
 *
 * Provides unified functions for managing reading progress across all plans.
 * Uses chaptersRead array as single source of truth.
 *
 * Key Concepts:
 * - chaptersIndex: Map for O(1) lookups (key: "book:chapter")
 * - Immutable operations: All functions return new arrays
 * - Plan masking: Each plan queries chaptersRead to determine completion
 */

import { getVerseCount } from './verseProgressCalculator'

/**
 * Build an index (Map) from chaptersRead array for O(1) lookups
 *
 * @param {Array} chaptersRead - Array of chapter objects
 * @returns {Map} Map with "book:chapter" keys and chapter data values
 *
 * @example
 * const chaptersRead = [{ book: 1, chapter: 5, status: 'complete', timestamp: 123 }]
 * const index = buildChaptersIndex(chaptersRead)
 * index.get("1:5") // → { book: 1, chapter: 5, status: 'complete', timestamp: 123 }
 */
export const buildChaptersIndex = (chaptersRead) => {
  const index = new Map()

  if (!Array.isArray(chaptersRead)) return index

  chaptersRead.forEach(chapter => {
    if (chapter.book && chapter.chapter) {
      const key = `${chapter.book}:${chapter.chapter}`
      index.set(key, chapter)
    }
  })

  return index
}

/**
 * Check if a chapter is read (with optional status filter)
 *
 * @param {number} book - Book number (1-66)
 * @param {number} chapter - Chapter number
 * @param {Map} chaptersIndex - Index built from chaptersRead
 * @param {string|null} statusFilter - Optional: 'complete' or 'partial'
 * @returns {boolean} True if chapter exists and matches filter
 *
 * @example
 * isChapterRead(1, 5, index) // True if Genesis 5 is read (any status)
 * isChapterRead(1, 5, index, 'complete') // True only if complete
 */
export const isChapterRead = (book, chapter, chaptersIndex, statusFilter = null) => {
  const key = `${book}:${chapter}`
  const data = chaptersIndex.get(key)

  if (!data) return false
  if (statusFilter && data.status !== statusFilter) return false

  return true
}

/**
 * Add or update a chapter in chaptersRead
 *
 * @param {Array} chaptersRead - Current chaptersRead array
 * @param {number} book - Book number (1-66)
 * @param {number} chapter - Chapter number
 * @param {string} status - 'complete' or 'partial'
 * @param {number|null} verses - Number of verses read (for partial chapters)
 * @param {string|null} source - Optional: 'free', 'oneyear', 'bible_overview', 'thematic'
 * @returns {Array} New chaptersRead array with chapter added/updated
 *
 * @example
 * const newChapters = setChapterRead(chaptersRead, 1, 5, 'complete', null, 'free')
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
    ...(verses !== null && verses > 0 && { verses }),
    ...(source && { source })
  }

  if (index > -1) {
    // Update existing entry
    newChaptersRead[index] = chapterData
  } else {
    // Add new entry
    newChaptersRead.push(chapterData)
  }

  return newChaptersRead
}

/**
 * Remove a chapter from chaptersRead
 *
 * @param {Array} chaptersRead - Current chaptersRead array
 * @param {number} book - Book number (1-66)
 * @param {number} chapter - Chapter number
 * @returns {Array} New chaptersRead array with chapter removed
 *
 * @example
 * const newChapters = removeChapter(chaptersRead, 1, 5)
 */
export const removeChapter = (chaptersRead, book, chapter) => {
  return chaptersRead.filter(c => !(c.book === book && c.chapter === chapter))
}

/**
 * Check if a reading (multiple chapters) is complete
 *
 * @param {number} book - Book number (1-66)
 * @param {number} startChapter - Starting chapter
 * @param {number} endChapter - Ending chapter (inclusive)
 * @param {Map} chaptersIndex - Index built from chaptersRead
 * @param {string} statusFilter - 'complete' or 'partial' (default: 'complete')
 * @returns {boolean} True if ALL chapters in range are read with given status
 *
 * @example
 * isReadingComplete(1, 1, 3, index) // True if Genesis 1-3 all complete
 */
export const isReadingComplete = (book, startChapter, endChapter, chaptersIndex, statusFilter = 'complete') => {
  for (let ch = startChapter; ch <= endChapter; ch++) {
    if (!isChapterRead(book, ch, chaptersIndex, statusFilter)) {
      return false
    }
  }
  return true
}

/**
 * Mark all chapters in a reading as complete
 *
 * @param {Array} chaptersRead - Current chaptersRead array
 * @param {number} book - Book number (1-66)
 * @param {number} startChapter - Starting chapter
 * @param {number} endChapter - Ending chapter (inclusive)
 * @param {string|null} source - Optional: plan identifier
 * @returns {Array} New chaptersRead array with all chapters marked complete
 *
 * @example
 * const newChapters = markReadingComplete(chaptersRead, 1, 1, 3, 'oneyear')
 */
export const markReadingComplete = (chaptersRead, book, startChapter, endChapter, source = null) => {
  let newChaptersRead = [...chaptersRead]

  for (let ch = startChapter; ch <= endChapter; ch++) {
    newChaptersRead = setChapterRead(newChaptersRead, book, ch, 'complete', null, source)
  }

  return newChaptersRead
}

/**
 * Unmark all chapters in a reading (remove them)
 *
 * @param {Array} chaptersRead - Current chaptersRead array
 * @param {number} book - Book number (1-66)
 * @param {number} startChapter - Starting chapter
 * @param {number} endChapter - Ending chapter (inclusive)
 * @returns {Array} New chaptersRead array with chapters removed
 *
 * @example
 * const newChapters = unmarkReading(chaptersRead, 1, 1, 3)
 */
export const unmarkReading = (chaptersRead, book, startChapter, endChapter) => {
  let newChaptersRead = [...chaptersRead]

  for (let ch = startChapter; ch <= endChapter; ch++) {
    newChaptersRead = removeChapter(newChaptersRead, book, ch)
  }

  return newChaptersRead
}

/**
 * Get chapter data from index
 *
 * @param {number} book - Book number (1-66)
 * @param {number} chapter - Chapter number
 * @param {Map} chaptersIndex - Index built from chaptersRead
 * @returns {Object|null} Chapter data or null if not found
 *
 * @example
 * const data = getChapterData(1, 5, index)
 * // → { book: 1, chapter: 5, status: 'complete', timestamp: 123 }
 */
export const getChapterData = (book, chapter, chaptersIndex) => {
  const key = `${book}:${chapter}`
  return chaptersIndex.get(key) || null
}

/**
 * Get all chapters read for a specific book
 *
 * @param {number} book - Book number (1-66)
 * @param {Array} chaptersRead - Array of chapter objects
 * @returns {Array} Chapters for the specified book
 *
 * @example
 * const genesisChapters = getChaptersForBook(1, chaptersRead)
 */
export const getChaptersForBook = (book, chaptersRead) => {
  return chaptersRead.filter(ch => ch.book === book)
}

/**
 * Count complete chapters for a book
 *
 * @param {number} book - Book number (1-66)
 * @param {Array} chaptersRead - Array of chapter objects
 * @returns {number} Number of complete chapters
 *
 * @example
 * const completeCount = countCompleteChapters(1, chaptersRead)
 */
export const countCompleteChapters = (book, chaptersRead) => {
  return chaptersRead.filter(ch => ch.book === book && ch.status === 'complete').length
}

/**
 * Check if partial chapters exist in a reading
 * Useful for smart completion detection
 *
 * @param {number} book - Book number (1-66)
 * @param {number} startChapter - Starting chapter
 * @param {number} endChapter - Ending chapter (inclusive)
 * @param {Map} chaptersIndex - Index built from chaptersRead
 * @returns {boolean} True if any chapter in range is partial
 */
export const hasPartialChapters = (book, startChapter, endChapter, chaptersIndex) => {
  for (let ch = startChapter; ch <= endChapter; ch++) {
    const data = getChapterData(book, ch, chaptersIndex)
    if (data && data.status === 'partial') {
      return true
    }
  }
  return false
}

/**
 * Calculate completion percentage for a reading
 *
 * @param {number} book - Book number (1-66)
 * @param {number} startChapter - Starting chapter
 * @param {number} endChapter - Ending chapter (inclusive)
 * @param {Map} chaptersIndex - Index built from chaptersRead
 * @returns {Object} { complete, partial, total, percentage }
 */
export const getReadingProgress = (book, startChapter, endChapter, chaptersIndex) => {
  const total = endChapter - startChapter + 1
  let complete = 0
  let partial = 0

  for (let ch = startChapter; ch <= endChapter; ch++) {
    const data = getChapterData(book, ch, chaptersIndex)
    if (data) {
      if (data.status === 'complete') complete++
      else if (data.status === 'partial') partial++
    }
  }

  const percentage = total > 0 ? Math.round((complete / total) * 100) : 0

  return {
    complete,
    partial,
    total,
    percentage
  }
}

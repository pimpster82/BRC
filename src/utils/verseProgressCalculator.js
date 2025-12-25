/**
 * Verse-Based Progress Calculator
 *
 * Calculates reading progress based on actual verse counts instead of chapters.
 * This enables accurate tracking when users read partial chapters (e.g., 13:1-3).
 *
 * Example:
 * - Assignment: Chapters 11-13 (e.g., Genesis 11-13 = 32+31+24 = 87 verses)
 * - Read: Ch 11 complete (32 verses) + Ch 12 complete (22 verses) + Ch 13:1-3 (3 verses)
 * - Progress: 57/87 = 65.5% (not 66% from chapters alone)
 */

import { BIBLE_VERSE_COUNTS } from '../../data/bible-verse-counts'

/**
 * Get the total number of verses in a chapter
 * @param {number} bookNumber - Book number (1-66)
 * @param {number} chapterNumber - Chapter number
 * @returns {number} Total verses in that chapter
 */
export const getVerseCount = (bookNumber, chapterNumber) => {
  return BIBLE_VERSE_COUNTS[bookNumber]?.[chapterNumber] || 0
}

/**
 * Calculate total verses in a range of chapters
 * @param {number} bookNumber - Book number (1-66)
 * @param {number} startChapter - Starting chapter
 * @param {number} endChapter - Ending chapter (inclusive)
 * @returns {number} Total verses in the range
 */
export const getTotalVerses = (bookNumber, startChapter, endChapter) => {
  let total = 0
  for (let ch = startChapter; ch <= endChapter; ch++) {
    total += getVerseCount(bookNumber, ch)
  }
  return total
}

/**
 * Calculate verses read based on chapter data
 * @param {Array} chaptersRead - Array of chapter objects: { chapter, status, verses? }
 * @param {number} bookNumber - Book number for verse lookups
 * @param {number} startChapter - Starting chapter of the assignment
 * @param {number} endChapter - Ending chapter of the assignment
 * @returns {number} Total verses read
 */
export const calculateVersesRead = (chaptersRead, bookNumber, startChapter, endChapter) => {
  if (!chaptersRead || chaptersRead.length === 0) return 0

  let versesRead = 0

  for (let ch = startChapter; ch <= endChapter; ch++) {
    const chapterData = chaptersRead.find(c => c.chapter === ch)

    if (!chapterData) {
      // Chapter not started
      continue
    }

    if (chapterData.status === 'complete') {
      // Full chapter read
      versesRead += getVerseCount(bookNumber, ch)
    } else if (chapterData.status === 'partial' && chapterData.verses) {
      // Partial chapter - add verses read
      versesRead += chapterData.verses
    }
  }

  return versesRead
}

/**
 * Calculate progress percentage based on verses
 * @param {Array} chaptersRead - Array of chapter objects
 * @param {number} bookNumber - Book number
 * @param {number} startChapter - Starting chapter
 * @param {number} endChapter - Ending chapter
 * @returns {Object} { versesRead, totalVerses, percentage }
 */
export const calculateVerseProgress = (chaptersRead, bookNumber, startChapter, endChapter) => {
  const totalVerses = getTotalVerses(bookNumber, startChapter, endChapter)
  const versesRead = calculateVersesRead(chaptersRead, bookNumber, startChapter, endChapter)

  const percentage = totalVerses > 0 ? (versesRead / totalVerses) * 100 : 0

  return {
    versesRead,
    totalVerses,
    percentage: Math.round(percentage * 10) / 10 // Round to 1 decimal place
  }
}

/**
 * Get the number of verses in a partial chapter
 * Useful for displaying "Read up to verse X" messages
 * @param {number} bookNumber - Book number
 * @param {number} chapter - Chapter number
 * @returns {number} Total verses in that chapter
 */
export const getChapterVerseCount = (bookNumber, chapter) => {
  return getVerseCount(bookNumber, chapter)
}

/**
 * Calculate how many complete chapters have been read
 * (for display purposes, separate from verse-based progress)
 * @param {Array} chaptersRead - Array of chapter objects
 * @returns {number} Count of complete chapters
 */
export const getCompleteChaptersCount = (chaptersRead) => {
  if (!chaptersRead) return 0
  return chaptersRead.filter(c => c.status === 'complete').length
}

/**
 * Calculate how many chapters have been at least partially read
 * @param {Array} chaptersRead - Array of chapter objects
 * @returns {number} Count of chapters with any progress
 */
export const getStartedChaptersCount = (chaptersRead) => {
  if (!chaptersRead) return 0
  return chaptersRead.length
}

/**
 * Check if all chapters in a range are complete
 * @param {Array} chaptersRead - Array of chapter objects
 * @param {Array} expectedChapters - Array of chapter numbers expected to be read
 * @returns {boolean} True if all expected chapters are complete
 */
export const areAllChaptersComplete = (chaptersRead, expectedChapters) => {
  if (!chaptersRead || chaptersRead.length === 0) return false

  return expectedChapters.every(chapter => {
    const found = chaptersRead.find(c => c.chapter === chapter)
    return found && found.status === 'complete'
  })
}

/**
 * Format progress display text
 * @param {number} versesRead - Verses read
 * @param {number} totalVerses - Total verses
 * @param {number} percentage - Progress percentage
 * @returns {string} Formatted text like "56/87 verses (65%)"
 */
export const formatProgressText = (versesRead, totalVerses, percentage) => {
  return `${versesRead}/${totalVerses} ${totalVerses === 1 ? 'verse' : 'verses'} (${Math.round(percentage)}%)`
}

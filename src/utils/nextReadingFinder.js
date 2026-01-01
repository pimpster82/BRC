/**
 * Next Reading Finder - Centralized logic for finding what to read next
 *
 * Used by:
 * - PersonalReadingCard: Display "Next Reading" on home page
 * - PersonalReadingPage: Auto-expand section containing next reading
 *
 * Philosophy: Users read wherever they want. Sections are organizational helpers.
 * "Next" = continue from last read, not first unread in plan order.
 */

import { thematicTopics } from '../config/thematic-topics'
import { bibleOverviewReadings } from '../config/bible-overview-readings'
import { oneyearReadings } from '../config/oneyear-readings'

/**
 * Get the next reading based on plan type
 * @param {string} plan - Plan type ('free', 'bible_overview', 'oneyear', 'thematic')
 * @param {Object} personalData - User's reading data
 * @param {Object} bibleInOneYearState - Separate state for Bible in One Year plan
 * @param {Object} bibleBooks - Bible books metadata (from getBibleBooks)
 * @returns {Object|null} Next reading info or null
 */
export const getNextReading = (plan, personalData, bibleInOneYearState = null, bibleBooks = null) => {
  if (!personalData) return null

  // Thematic Plan: Next unread topic
  if (plan === 'thematic') {
    const completedTopics = personalData.thematicTopicsRead || []
    const nextUnreadTopic = thematicTopics.find(topic => !completedTopics.includes(topic.id))

    if (nextUnreadTopic) {
      return {
        type: 'topic',
        topicId: nextUnreadTopic.id,
        titleKey: nextUnreadTopic.titleKey,
        sectionKey: nextUnreadTopic.section
      }
    }

    return null // All topics complete
  }

  // Bible in One Year Plan: Next reading after last completed
  if (plan === 'oneyear' && bibleInOneYearState) {
    const completedReadings = bibleInOneYearState.completedReadings || []

    if (completedReadings.length === 0) {
      // No readings yet - return first reading
      const firstReading = oneyearReadings[0]
      return {
        type: 'oneyear_reading',
        readingId: firstReading.id,
        sectionKey: firstReading.section,
        book: firstReading.book,
        startChapter: firstReading.startChapter,
        endChapter: firstReading.endChapter
      }
    }

    // Find last completed reading ID
    const lastCompletedId = Math.max(...completedReadings)

    // Next reading is lastCompletedId + 1
    const nextReading = oneyearReadings.find(r => r.id === lastCompletedId + 1)

    if (nextReading) {
      return {
        type: 'oneyear_reading',
        readingId: nextReading.id,
        sectionKey: nextReading.section,
        book: nextReading.book,
        startChapter: nextReading.startChapter,
        endChapter: nextReading.endChapter
      }
    }

    return null // Plan complete
  }

  // Bible Overview Plan: Next reading after last completed
  if (plan === 'bible_overview') {
    const chaptersRead = personalData.chaptersRead || []

    if (chaptersRead.length === 0) {
      // No readings yet - return first reading
      const firstReading = bibleOverviewReadings[0]
      return {
        type: 'bible_overview_reading',
        readingId: firstReading.id,
        sectionKey: firstReading.section,
        book: firstReading.book,
        startChapter: firstReading.startChapter,
        endChapter: firstReading.endChapter
      }
    }

    // Find what was read last (by highest book/chapter)
    const sorted = [...chaptersRead].sort(
      (a, b) => a.book !== b.book ? a.book - b.book : a.chapter - b.chapter
    )
    const lastRead = sorted[sorted.length - 1]

    // Find next reading that contains a chapter after lastRead
    for (const reading of bibleOverviewReadings) {
      // Check if this reading contains chapters we haven't read yet
      if (reading.book > lastRead.book ||
          (reading.book === lastRead.book && reading.startChapter > lastRead.chapter)) {
        return {
          type: 'bible_overview_reading',
          readingId: reading.id,
          sectionKey: reading.section,
          book: reading.book,
          startChapter: reading.startChapter,
          endChapter: reading.endChapter
        }
      }
    }

    return null // All readings complete
  }

  // Free Reading (and other plans): Next chapter after last read
  if (bibleBooks) {
    const chaptersRead = personalData.chaptersRead || []

    if (chaptersRead.length === 0) {
      // No readings yet - suggest Genesis 1
      return {
        type: 'chapter',
        book: 1,
        chapter: 1,
        bookName: bibleBooks.books[0].name
      }
    }

    // Sort by book and chapter to find the last one
    const sorted = [...chaptersRead].sort(
      (a, b) => a.book !== b.book ? a.book - b.book : a.chapter - b.chapter
    )

    const lastRead = sorted[sorted.length - 1]
    const book = bibleBooks.books[lastRead.book - 1]

    if (!book) return null

    let nextChapter = lastRead.chapter + 1
    let nextBook = lastRead.book

    // If we've finished all chapters in a book, move to next book
    if (nextChapter > book.chapters) {
      nextBook = lastRead.book + 1
      nextChapter = 1
    }

    // Check if there's a next book
    if (nextBook <= 66) {
      const nextBookData = bibleBooks.books[nextBook - 1]
      return {
        type: 'chapter',
        book: nextBook,
        chapter: nextChapter,
        bookName: nextBookData.name
      }
    }
  }

  return null
}

/**
 * Find which section contains a specific reading
 * @param {string} plan - Plan type
 * @param {Object} nextReading - Result from getNextReading()
 * @returns {string|null} Section key
 */
export const getSectionForNextReading = (plan, nextReading) => {
  if (!nextReading) return null

  // For thematic and plan-specific readings, section is already included
  if (nextReading.sectionKey) {
    return nextReading.sectionKey
  }

  return null
}

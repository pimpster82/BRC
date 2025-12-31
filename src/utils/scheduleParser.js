/**
 * Schedule Parser Utility
 * Converts between language-independent reading format and human-readable text
 *
 * This enables schedules to be stored with book numbers only,
 * making them truly multilingual and firebase-shareable
 */

import { getLocalizedBookName, getBookNumberFromName } from '../../data/bible-link-builder'

/**
 * Format a reading object to human-readable text in specified language
 * @param {Object} reading - { book: number, startChapter: number, endChapter: number }
 * @param {string} language - Language code (de, en, es, it, fr)
 * @returns {string} - Formatted reading like "Genesis 1-3"
 */
export const parseReadingText = (reading, language = 'en') => {
  if (!reading || typeof reading === 'string') {
    // Fallback for old format or invalid data
    return reading || 'No reading'
  }

  try {
    const { book, startChapter, endChapter } = reading

    if (!book || !startChapter || !endChapter) {
      console.warn('Invalid reading format:', reading)
      return 'Invalid reading'
    }

    const bookName = getLocalizedBookName(book, language)

    if (startChapter === endChapter) {
      return `${bookName} ${startChapter}`
    }

    return `${bookName} ${startChapter}-${endChapter}`
  } catch (error) {
    console.error('Error parsing reading text:', error, reading)
    return 'Error parsing reading'
  }
}

/**
 * Parse Bible book name and chapters from text like "Genesis 1-3" or "Gen. 1:1-5"
 * Returns book number and chapter range
 *
 * @param {string} readingText - Text like "Genesis 1-3" or "Exodus 5-10"
 * @returns {Object} - { book: number, startChapter: number, endChapter: number } or null
 */
export const parseReadingFromText = (readingText) => {
  if (!readingText || typeof readingText !== 'string') {
    return null
  }

  try {
    // Remove extra whitespace
    const text = readingText.trim()

    // Pattern: "BookName chapter-chapter" or "BookName chapter"
    const match = text.match(/^(.+?)\s+(\d+)(?:-(\d+))?$/)

    if (!match) {
      console.warn('Could not parse reading text:', readingText)
      return null
    }

    const bookName = match[1].trim()
    const startChapter = parseInt(match[2], 10)
    const endChapter = match[3] ? parseInt(match[3], 10) : startChapter

    // Find book number by name using multilingual lookup
    const bookNumber = getBookNumberFromName(bookName)

    if (!bookNumber) {
      console.warn('Could not find book number for name:', bookName)
      return null
    }

    return {
      book: bookNumber,
      startChapter,
      endChapter
    }
  } catch (error) {
    console.error('Error parsing reading from text:', error, readingText)
    return null
  }
}

/**
 * Convert reading object to JW.org Bible link format
 * @param {Object} reading - { book: number, startChapter: number, endChapter: number }
 * @returns {string} - URL parameter like "01001001-01003999"
 */
export const readingToJWLinkFormat = (reading) => {
  if (!reading || typeof reading === 'string') {
    return null
  }

  try {
    const { book, startChapter, endChapter } = reading

    if (!book || !startChapter || !endChapter) {
      return null
    }

    // Format: BBCCCVVV-BBCCCVVV
    // BB = book (01-66), CCC = chapter, VVV = verse
    const startPadded = String(book).padStart(2, '0') + String(startChapter).padStart(3, '0') + '001'
    const endPadded = String(book).padStart(2, '0') + String(endChapter).padStart(3, '0') + '999'

    return `${startPadded}-${endPadded}`
  } catch (error) {
    console.error('Error converting reading to link format:', error, reading)
    return null
  }
}

/**
 * Get first and last book chapters for a reading range
 * Useful for displaying book name and chapter numbers
 *
 * @param {Object} reading - { book: number, startChapter: number, endChapter: number }
 * @returns {Object} - { bookNumber: number, firstChapter: number, lastChapter: number }
 */
export const getReadingRange = (reading) => {
  if (!reading || typeof reading === 'string') {
    return null
  }

  return {
    bookNumber: reading.book,
    firstChapter: reading.startChapter,
    lastChapter: reading.endChapter
  }
}

/**
 * Validate reading object format
 * @param {any} reading - Data to validate
 * @returns {boolean} - True if valid
 */
export const isValidReading = (reading) => {
  if (!reading || typeof reading !== 'object') {
    return false
  }

  const { book, startChapter, endChapter } = reading

  return (
    typeof book === 'number' &&
    book >= 1 &&
    book <= 66 &&
    typeof startChapter === 'number' &&
    startChapter >= 1 &&
    typeof endChapter === 'number' &&
    endChapter >= startChapter
  )
}

export default {
  parseReadingText,
  parseReadingFromText,
  readingToJWLinkFormat,
  getReadingRange,
  isValidReading
}

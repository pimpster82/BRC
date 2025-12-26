/**
 * Parse Bible verses strings and generate JW.org links
 * Examples:
 * - "Genesis 6:9–9:19" → Genesis 6 verses 9-19
 * - "Ruth chapters 1-4" → Ruth 1-4 complete
 * - "Matthew chapters 5-7" → Matthew 5-7 complete
 */

import { getBibleBooks, getCurrentLanguage } from '../config/languages'
import { buildLanguageSpecificWebLink } from '../../data/bible-link-builder'

/**
 * Find a book by its name (with language support)
 */
const findBookByName = (bookName, language) => {
  const bibleBooks = getBibleBooks(language)
  const cleaned = bookName.toLowerCase().trim().replace(/\./g, '')

  // Try exact match on full name
  for (const book of bibleBooks.books) {
    if (book.name.toLowerCase() === cleaned) return book
    if (book.abbreviation.toLowerCase().replace(/\./g, '') === cleaned) return book
  }

  // Try partial match (first words)
  for (const book of bibleBooks.books) {
    const bookWords = book.name.toLowerCase().split(/\s+/)
    const inputWords = cleaned.split(/\s+/)

    let match = true
    for (const word of inputWords) {
      if (!bookWords.some(bw => bw.startsWith(word))) {
        match = false
        break
      }
    }
    if (match) return book
  }

  return null
}

/**
 * Parse a verses string and return link information
 * Returns: { book, startChapter, startVerse, endChapter, endVerse, text }
 */
export const parseVersesString = (versesString, language = null) => {
  if (!versesString || typeof versesString !== 'string') return null

  const lang = language || getCurrentLanguage()
  const trimmed = versesString.trim()

  // Pattern 1: "Book chapter-chapter" (e.g., "Ruth chapters 1-4")
  const chapterRangeMatch = trimmed.match(/^([A-Za-z\s\.]+?)\s+chapters?\s+(\d+)\s*-\s*(\d+)$/i)
  if (chapterRangeMatch) {
    const book = findBookByName(chapterRangeMatch[1], lang)
    if (book) {
      return {
        book,
        startChapter: parseInt(chapterRangeMatch[2]),
        startVerse: 1,
        endChapter: parseInt(chapterRangeMatch[3]),
        endVerse: -1, // -1 means full chapter
        text: trimmed
      }
    }
  }

  // Pattern 2: "Book chapter:verse–chapter:verse" (e.g., "Genesis 6:9–9:19")
  const verseRangeMatch = trimmed.match(/^([A-Za-z\s\.]+?)\s+(\d+):(\d+)[–-](\d+):(\d+)$/i)
  if (verseRangeMatch) {
    const book = findBookByName(verseRangeMatch[1], lang)
    if (book) {
      return {
        book,
        startChapter: parseInt(verseRangeMatch[2]),
        startVerse: parseInt(verseRangeMatch[3]),
        endChapter: parseInt(verseRangeMatch[4]),
        endVerse: parseInt(verseRangeMatch[5]),
        text: trimmed
      }
    }
  }

  // Pattern 3: "Book chapter:verse" (e.g., "Psalm 23")
  const singleVerseMatch = trimmed.match(/^([A-Za-z\s\.]+?)\s+(\d+)(?::(\d+))?$/i)
  if (singleVerseMatch) {
    const book = findBookByName(singleVerseMatch[1], lang)
    if (book) {
      return {
        book,
        startChapter: parseInt(singleVerseMatch[2]),
        startVerse: singleVerseMatch[3] ? parseInt(singleVerseMatch[3]) : 1,
        endChapter: parseInt(singleVerseMatch[2]),
        endVerse: singleVerseMatch[3] ? parseInt(singleVerseMatch[3]) : -1,
        text: trimmed
      }
    }
  }

  return null
}

/**
 * Generate a JW.org link for a verses string
 */
export const buildVersesLink = (versesString, language = null) => {
  const parsed = parseVersesString(versesString, language)
  if (!parsed) return null

  try {
    const lang = language || getCurrentLanguage()

    // Determine the end verse for the link
    // - If single verse or verse range within same chapter: use endVerse
    // - If multi-chapter range: end at verse 999 (last verse of end chapter)
    // - If full chapters: end at verse 999
    const linkEndVerse = parsed.endChapter === parsed.startChapter && parsed.endVerse !== -1
      ? parsed.endVerse           // Verse range within same chapter
      : (parsed.endVerse === -1 ? 999 : parsed.endVerse)  // Full chapter(s) or verse range

    // For multi-chapter ranges, we need to handle them differently
    // For now, we'll only link to the start chapter and let JW.org show context
    const linkObj = buildLanguageSpecificWebLink(
      parsed.book.number,           // bookNumber
      parsed.startChapter,          // chapter (always use startChapter)
      parsed.startVerse,            // startVerse
      parsed.endChapter === parsed.startChapter
        ? linkEndVerse              // If same chapter, include endVerse
        : null,                      // If multi-chapter, let link default to chapter end
      lang                          // languageCode
    )

    return {
      text: parsed.text,
      url: linkObj.web,             // Use linkObj.web, not linkObj directly
      book: parsed.book.name
    }
  } catch (error) {
    console.warn('Failed to build link for verses:', versesString, error)
    return null
  }
}

/**
 * Parse multiple verses strings (separated by semicolon)
 * Returns array of link objects
 */
export const parseMultipleVerses = (versesString, language = null) => {
  if (!versesString || typeof versesString !== 'string') return []

  const parts = versesString.split(/;\s*/)
  const links = []

  for (const part of parts) {
    const link = buildVersesLink(part, language)
    if (link) {
      links.push(link)
    }
  }

  return links
}

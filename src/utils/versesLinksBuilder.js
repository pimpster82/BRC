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

  // Pattern 1: "Book chapters? 1-4" (e.g., "Ruth chapters 1-4" or "Ruth chapter 1-4")
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

  // Pattern 2: "Book chapter 5" or "Book chapters 5" (e.g., "Daniel chapter 6", "1 Samuel chapter 17")
  const singleChapterMatch = trimmed.match(/^([A-Za-z\s\.]+?)\s+chapters?\s+(\d+)$/i)
  if (singleChapterMatch) {
    const book = findBookByName(singleChapterMatch[1], lang)
    if (book) {
      return {
        book,
        startChapter: parseInt(singleChapterMatch[2]),
        startVerse: 1,
        endChapter: parseInt(singleChapterMatch[2]),
        endVerse: -1, // -1 means full chapter
        text: trimmed
      }
    }
  }

  // Pattern 3: "Book chapter:verse–chapter:verse" (e.g., "Genesis 6:9–9:19", "Exodus 13:17–14:31")
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

  // Pattern 4: "Book chapter:verse-verse" within same chapter (e.g., "1 Samuel 25:2-35")
  const sameChapterMatch = trimmed.match(/^([A-Za-z\s\.]+?)\s+(\d+):(\d+)-(\d+)$/i)
  if (sameChapterMatch) {
    const book = findBookByName(sameChapterMatch[1], lang)
    if (book) {
      return {
        book,
        startChapter: parseInt(sameChapterMatch[2]),
        startVerse: parseInt(sameChapterMatch[3]),
        endChapter: parseInt(sameChapterMatch[2]),
        endVerse: parseInt(sameChapterMatch[4]),
        text: trimmed
      }
    }
  }

  // Pattern 5: "Book chapter" or "Book chapter:verse" (e.g., "Psalm 23", "Psalm 55:22")
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
 * Parse multiple verses strings (separated by semicolon or comma)
 * Handles formats like:
 * - "Psalm 55:22; 62:8; 1 John 5:14" (semicolon-separated)
 * - "Ephesians 5:28, 29, 33; 6:1-4" (mixed comma and semicolon)
 * Returns array of link objects
 */
export const parseMultipleVerses = (versesString, language = null) => {
  if (!versesString || typeof versesString !== 'string') return []

  const lang = language || getCurrentLanguage()
  const links = []

  // First, split by semicolon to get main sections
  const sections = versesString.split(/;\s*/)

  for (const section of sections) {
    // For each section, check if it has comma-separated verses
    // Pattern: "Book chapter:verse, verse, verse" or "Book chapter:verse-verse"
    const commaMatch = section.match(/^([A-Za-z\s\.]+?)\s+(\d+):(\d+)(?:,\s*(\d+))+/)

    if (commaMatch) {
      // This is a comma-separated verses within same chapter (e.g., "Ephesians 5:28, 29, 33")
      // Try to parse each verse individually
      const bookName = commaMatch[1]
      const chapter = commaMatch[2]

      // Extract all verse numbers
      const verseMatches = section.matchAll(/(\d+)/g)
      const verses = Array.from(verseMatches).map(m => m[1])

      if (verses.length > 0) {
        // Use the first verse as representative link
        const firstVerse = verses[0]
        const link = buildVersesLink(`${bookName} ${chapter}:${firstVerse}`, lang)
        if (link) {
          // Update text to show all verses
          link.text = section.trim()
          links.push(link)
        }
      }
    } else {
      // Regular parsing for non-comma verses
      const link = buildVersesLink(section, lang)
      if (link) {
        links.push(link)
      }
    }
  }

  return links
}

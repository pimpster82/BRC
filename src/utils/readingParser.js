// Smart Reading Parser
// Parses flexible input like "Isa 3-4:15" or "1 Tim 3:1,2; 4:15"

import { getBibleBooks, getCurrentLanguage } from '../config/languages'

/**
 * Parse reading input and return structured data
 * Examples:
 * - "3" → Chapter 3 complete
 * - "3-5" → Chapters 3, 4, 5 complete
 * - "3-4:15" → Chapter 3 complete, Chapter 4 up to verse 15
 * - "Isaiah 3:1,2; 4:15" → Isaiah 3 verses 1-2, and Isaiah 4 verse 15
 * - "Isa 3-4:15" → Isaiah 3 complete, Isaiah 4 up to verse 15
 * - "1 Tim 3:1-5" → 1 Timothy 3 verses 1-5
 *
 * Separators:
 * - , (comma) = "and" for verses (3:1,2 = verses 1 AND 2)
 * - ; (semicolon) = separate references (3:1; 4:15)
 * - - (dash) = range (3-5 or 3:1-5)
 */

/**
 * Calculate Levenshtein distance (edit distance) between two strings
 */
const levenshteinDistance = (str1, str2) => {
  const m = str1.length
  const n = str2.length
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1
      }
    }
  }

  return dp[m][n]
}

/**
 * Find book by name with fuzzy matching
 * Returns: { book, confidence, suggestions }
 */
const findBook = (bookInput, languageCode = null) => {
  if (!bookInput) return null

  const language = languageCode || getCurrentLanguage()
  const bibleBooks = getBibleBooks(language)
  const cleaned = bookInput.toLowerCase().trim().replace(/\./g, '')

  // First: Try exact matches
  for (const book of bibleBooks.books) {
    // Match full name
    if (book.name.toLowerCase() === cleaned) {
      return { book, confidence: 'exact', suggestions: [] }
    }

    // Match abbreviation
    if (book.abbreviation.toLowerCase().replace(/\./g, '') === cleaned) {
      return { book, confidence: 'exact', suggestions: [] }
    }

    // Match alternative names
    if (book.alternativeNames && book.alternativeNames.length > 0) {
      for (const altName of book.alternativeNames) {
        if (altName.toLowerCase().replace(/\./g, '') === cleaned) {
          return { book, confidence: 'exact', suggestions: [] }
        }
      }
    }

    // Match common variations
    const nameNoSpaces = book.name.toLowerCase().replace(/\s+/g, '')
    const inputNoSpaces = cleaned.replace(/\s+/g, '')
    if (nameNoSpaces === inputNoSpaces) {
      return { book, confidence: 'exact', suggestions: [] }
    }
  }

  // Second: Try fuzzy matching
  const candidates = []

  for (const book of bibleBooks.books) {
    const bookName = book.name.toLowerCase()
    const bookAbbr = book.abbreviation.toLowerCase().replace(/\./g, '')

    // Calculate distances
    const nameDistance = levenshteinDistance(cleaned, bookName)
    const abbrDistance = levenshteinDistance(cleaned, bookAbbr)
    const minDistance = Math.min(nameDistance, abbrDistance)

    // Check if starts with input (high priority)
    const startsWithName = bookName.startsWith(cleaned)
    const startsWithAbbr = bookAbbr.startsWith(cleaned)

    if (startsWithName || startsWithAbbr || minDistance <= 3) {
      candidates.push({
        book,
        distance: minDistance,
        startsWith: startsWithName || startsWithAbbr
      })
    }
  }

  if (candidates.length === 0) {
    return null
  }

  // Sort by priority: startsWith first, then by distance
  candidates.sort((a, b) => {
    if (a.startsWith && !b.startsWith) return -1
    if (!a.startsWith && b.startsWith) return 1
    return a.distance - b.distance
  })

  const bestMatch = candidates[0]
  const suggestions = candidates.slice(0, 3).map(c => c.book)

  if (bestMatch.distance === 0 || bestMatch.startsWith) {
    // Very likely match
    return { book: bestMatch.book, confidence: 'high', suggestions }
  } else if (bestMatch.distance <= 2) {
    // Possible match
    return { book: bestMatch.book, confidence: 'medium', suggestions }
  } else {
    // Uncertain
    return { book: null, confidence: 'low', suggestions }
  }
}

/**
 * Error message keys for i18n translation
 * The actual translation happens in the React component via t() function
 */
export const ERROR_KEYS = {
  INVALID_INPUT: 'weekly.error_invalid_input',
  FORMAT_NOT_RECOGNIZED: 'weekly.error_format_not_recognized',
  PARSING_ERROR: 'weekly.error_parsing',
  INVALID_RANGE: 'weekly.error_invalid_range',
  INVALID_RANGE_CHAPTERS: 'weekly.error_invalid_range_chapters',
  CHAPTER_EXCEEDS: 'weekly.error_chapter_exceeds'
}

export const parseReadingInput = (input, defaultBook = null) => {
  if (!input || typeof input !== 'string') {
    return { chapters: [], errorKey: ERROR_KEYS.INVALID_INPUT }
  }

  const trimmed = input.trim()
  if (!trimmed) {
    return { chapters: [], error: 'Bitte Eingabe machen' }
  }

  try {
    // Try to extract book name first
    let book = defaultBook
    let referenceText = trimmed

    // Check if input contains a book name
    // Pattern: starts with optional number, then letters
    const bookMatch = trimmed.match(/^([1-3]?\s*[a-zA-Z][a-zA-Z\s\.]*?)\s+(\d.*)$/)
    if (bookMatch) {
      const bookInput = bookMatch[1]
      const foundResult = findBook(bookInput)

      if (foundResult) {
        // Check confidence level
        if (foundResult.confidence === 'exact' || foundResult.confidence === 'high') {
          book = foundResult.book
          referenceText = bookMatch[2]
        } else if (foundResult.confidence === 'medium') {
          // Suggest but allow to proceed
          return {
            chapters: [],
            book: null,
            error: null,
            suggestion: {
              type: 'did_you_mean',
              input: bookInput,
              suggestions: foundResult.suggestions,
              referenceText: bookMatch[2]
            }
          }
        } else if (foundResult.confidence === 'low') {
          // Multiple possibilities
          return {
            chapters: [],
            book: null,
            error: null,
            suggestion: {
              type: 'unclear',
              input: bookInput,
              suggestions: foundResult.suggestions,
              referenceText: bookMatch[2]
            }
          }
        }
      } else {
        // No match found at all
        return {
          chapters: [],
          book: null,
          error: null,
          suggestion: {
            type: 'not_found',
            input: bookInput,
            referenceText: bookMatch[2]
          }
        }
      }
    }

    // Now parse the reference part (without book name)
    // Remove spaces for easier parsing
    const cleaned = referenceText.replace(/\s+/g, '')

    // Handle semicolon (separate references) - parse each part
    if (cleaned.includes(';')) {
      const parts = cleaned.split(';')
      const allChapters = []

      for (const part of parts) {
        const result = parseSingleReference(part.trim(), book)
        if (result.error) {
          return { chapters: [], book, error: result.error }
        }
        allChapters.push(...result.chapters)
      }

      return { chapters: allChapters, book, error: null }
    }

    // Parse single reference
    return { ...parseSingleReference(cleaned, book), book }
  } catch (error) {
    return { chapters: [], error: 'Fehler beim Parsen' }
  }
}

/**
 * Parse a single reference (no semicolons)
 * Examples: "3-4:15", "3:1,2", "3-5", "2:1-4:2"
 */
const parseSingleReference = (cleaned, book) => {
  try {
    // Case 1: Chapter-to-Chapter with verses (e.g., "2:1-4:2")
    // Pattern: chapter:verse-chapter:verse
    const chapterToChapterMatch = cleaned.match(/^(\d+):(\d+)-(\d+):(\d+)$/)
    if (chapterToChapterMatch) {
      const startChapter = parseInt(chapterToChapterMatch[1])
      const startVerse = parseInt(chapterToChapterMatch[2])
      const endChapter = parseInt(chapterToChapterMatch[3])
      const endVerse = parseInt(chapterToChapterMatch[4])

      if (startChapter > endChapter) {
        return { chapters: [], errorKey: ERROR_KEYS.INVALID_RANGE_CHAPTERS }
      }

      const chapters = []

      // First chapter - check if starting from verse 1 (= complete) or later (= partial)
      if (startVerse === 1) {
        // Starting from verse 1 = complete chapter
        chapters.push({
          chapter: startChapter,
          status: 'complete',
          verses: null
        })
      } else {
        // Starting from verse > 1 = partial (from startVerse to end)
        chapters.push({
          chapter: startChapter,
          status: 'partial',
          verses: 999, // Read from startVerse to end of chapter
          continueFrom: startVerse
        })
      }

      // Middle chapters - all complete
      for (let i = startChapter + 1; i < endChapter; i++) {
        chapters.push({
          chapter: i,
          status: 'complete',
          verses: null
        })
      }

      // Last chapter - partial from start to endVerse
      if (endChapter > startChapter) {
        chapters.push({
          chapter: endChapter,
          status: 'partial',
          verses: endVerse,
          continueFrom: endVerse + 1
        })
      }

      return { chapters, error: null }
    }

    // Case 2: Chapter range with verse at end (e.g., "3-4:15")
    const rangeWithVerseMatch = cleaned.match(/^(\d+)-(\d+):(.+)$/)
    if (rangeWithVerseMatch) {
      const startChapter = parseInt(rangeWithVerseMatch[1])
      const endChapter = parseInt(rangeWithVerseMatch[2])
      const versePart = rangeWithVerseMatch[3]

      const chapters = []

      // All chapters before the last one are complete
      for (let i = startChapter; i < endChapter; i++) {
        chapters.push({
          chapter: i,
          status: 'complete',
          verses: null
        })
      }

      // Last chapter - parse verses
      const lastVerseNum = parseVerses(versePart)
      chapters.push({
        chapter: endChapter,
        status: 'partial',
        verses: lastVerseNum,
        continueFrom: lastVerseNum + 1
      })

      return { chapters, error: null }
    }

    // Case 3: Single chapter with verses (e.g., "4:15" or "4:1,2" or "4:1-5")
    const singleWithVerseMatch = cleaned.match(/^(\d+):(.+)$/)
    if (singleWithVerseMatch) {
      const chapter = parseInt(singleWithVerseMatch[1])
      const versePart = singleWithVerseMatch[2]

      const lastVerse = parseVerses(versePart)

      return {
        chapters: [{
          chapter,
          status: 'partial',
          verses: lastVerse,
          continueFrom: lastVerse + 1
        }],
        error: null
      }
    }

    // Case 3: Chapter range (e.g., "3-5")
    const rangeMatch = cleaned.match(/^(\d+)-(\d+)$/)
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1])
      const end = parseInt(rangeMatch[2])

      if (start > end) {
        return { chapters: [], errorKey: ERROR_KEYS.INVALID_RANGE }
      }

      const chapters = []
      for (let i = start; i <= end; i++) {
        chapters.push({
          chapter: i,
          status: 'complete',
          verses: null
        })
      }

      return { chapters, error: null }
    }

    // Case 4: Single chapter (e.g., "3")
    const singleMatch = cleaned.match(/^(\d+)$/)
    if (singleMatch) {
      const chapter = parseInt(singleMatch[1])

      // Validate chapter number if book is provided
      if (book && book.chapters) {
        // Check if chapter number exceeds book's chapter count
        if (chapter > book.chapters) {
          // Check if this could be a chapter:verse pattern
          // e.g., "67" could be "6:7" (chapter 6, verse 7)
          const chapterStr = singleMatch[1]
          if (chapterStr.length >= 2) {
            const suggestions = []

            // Try splitting at each position
            for (let i = 1; i < chapterStr.length; i++) {
              const possibleChapter = parseInt(chapterStr.substring(0, i))
              const possibleVerse = parseInt(chapterStr.substring(i))

              if (possibleChapter <= book.chapters && possibleVerse > 0) {
                suggestions.push({
                  type: 'verse',
                  display: `${possibleChapter}:${possibleVerse}`,
                  description: `Kapitel ${possibleChapter}, Vers ${possibleVerse}`
                })
              }
            }

            // Also try range interpretation (e.g., "67" -> "6-7")
            for (let i = 1; i < chapterStr.length; i++) {
              const rangeStart = parseInt(chapterStr.substring(0, i))
              const rangeEnd = parseInt(chapterStr.substring(i))

              if (rangeStart <= book.chapters && rangeEnd <= book.chapters && rangeStart < rangeEnd) {
                suggestions.push({
                  type: 'range',
                  display: `${rangeStart}-${rangeEnd}`,
                  description: `Kapitel ${rangeStart} bis ${rangeEnd}`
                })
              }
            }

            if (suggestions.length > 0) {
              return {
                chapters: [],
                book,
                error: null,
                suggestion: {
                  type: 'invalid_chapter',
                  input: chapter,
                  maxChapters: book.chapters,
                  bookName: book.name,
                  suggestions,
                  originalInput: chapterStr
                }
              }
            }
          }

          return {
            chapters: [],
            book,
            errorKey: ERROR_KEYS.CHAPTER_EXCEEDS,
            errorParams: { book: book.name, chapters: book.chapters, chapter }
          }
        }
      }

      return {
        chapters: [{
          chapter,
          status: 'complete',
          verses: null
        }],
        error: null
      }
    }

    return { chapters: [], errorKey: ERROR_KEYS.FORMAT_NOT_RECOGNIZED }
  } catch (error) {
    return { chapters: [], errorKey: ERROR_KEYS.PARSING_ERROR }
  }
}

/**
 * Parse verse specification and return the highest verse number
 * Handles: "15", "1,2", "1-5", "1,2,5-7"
 */
const parseVerses = (versePart) => {
  let maxVerse = 0

  // Handle comma-separated verses (1,2,5)
  const parts = versePart.split(',')

  for (const part of parts) {
    // Check if this part is a range (1-5)
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(v => parseInt(v.trim()))
      maxVerse = Math.max(maxVerse, end)
    } else {
      const verse = parseInt(part.trim())
      maxVerse = Math.max(maxVerse, verse)
    }
  }

  return maxVerse
}

/**
 * Format chapter status for display
 */
export const formatChapterStatus = (chapterData) => {
  if (!chapterData) return 'Nicht gelesen'

  if (chapterData.status === 'complete') {
    return 'Komplett gelesen'
  }

  if (chapterData.status === 'partial') {
    return `Bis Vers ${chapterData.verses}`
  }

  return 'Nicht gelesen'
}

/**
 * Get next reading suggestion
 */
export const getNextReading = (chapterData) => {
  if (!chapterData || chapterData.status === 'complete') {
    return null
  }

  if (chapterData.status === 'partial' && chapterData.continueFrom) {
    return `Weiter ab Vers ${chapterData.continueFrom}`
  }

  return null
}

export default {
  parseReadingInput,
  formatChapterStatus,
  getNextReading
}

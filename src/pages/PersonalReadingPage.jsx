import React, { useState, useEffect } from 'react'
import { ChevronLeft, ExternalLink, Check, Edit2, ChevronDown, ChevronRight, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { t, getCurrentLanguage } from '../config/i18n'
import { getBibleBooks } from '../config/languages'
import { readingCategories, getBooksInCategory } from '../config/reading-categories'
import { thematicTopics, getThematicSections, getTopicsInSection } from '../config/thematic-topics'
import { getPersonalReadingData, savePersonalReadingData, syncPersonalReadingToFirebase, markThematicTopicComplete, unmarkThematicTopicComplete, isThematicTopicComplete, getThematicProgress } from '../utils/storage'
import { buildLanguageSpecificWebLink } from '../../data/bible-link-builder'
import { auth } from '../config/firebase'
import { parseReadingInput } from '../utils/readingParser'
import { parseMultipleVerses } from '../utils/versesLinksBuilder'
import {
  getTotalVerses,
  calculateVersesRead,
  calculateVerseProgress,
  getVerseCount,
} from '../utils/verseProgressCalculator'

/**
 * PersonalReadingPage - Verse-Based Progress Tracking
 *
 * Shows all 66 Bible books as a grid with color-coded verse-based progress:
 * - Green: All chapters read (100% of verses)
 * - Yellow: Some chapters read (1-99% of verses)
 * - Gray: No chapters read (0% of verses)
 *
 * Features:
 * - Verse-accurate progress (not just chapter counts)
 * - Support for partial chapter reads (e.g., Genesis 11:1-3)
 * - Chapter status: complete or partial
 * - JW.org deeplinks for reading
 * - Manual progress logging
 */

export default function PersonalReadingPage() {
  const navigate = useNavigate()
  const language = getCurrentLanguage()
  const bibleBooks = getBibleBooks(language)

  // State
  const [personalData, setPersonalData] = useState(null)
  const [selectedBook, setSelectedBook] = useState(null)
  const [showChapterModal, setShowChapterModal] = useState(false)
  const [showProgressForm, setShowProgressForm] = useState(false)
  const [progressInputText, setProgressInputText] = useState('')
  const [progressError, setProgressError] = useState(null)
  const [progressSuggestion, setProgressSuggestion] = useState(null)
  const [editingPartialChapter, setEditingPartialChapter] = useState(null) // { chapter, verses }
  const [selectedPlan, setSelectedPlan] = useState('free') // 'free', 'chronological', 'oneyear', 'thematic'
  const [expandedCategories, setExpandedCategories] = useState({}) // Track which categories are expanded
  const [expandedSections, setExpandedSections] = useState({}) // Track which thematic sections are expanded
  const [expandedTopics, setExpandedTopics] = useState({}) // Track which thematic topics are expanded

  // Find the category ID of the last-read chapter
  const getLastReadCategoryId = () => {
    if (!personalData || !personalData.chaptersRead || personalData.chaptersRead.length === 0) {
      return null
    }

    // Find the most recently read chapter (by timestamp)
    const lastChapter = personalData.chaptersRead.reduce((latest, current) => {
      return (current.timestamp || 0) > (latest.timestamp || 0) ? current : latest
    })

    if (!lastChapter) return null

    // Find which category contains this book
    for (const category of readingCategories) {
      const booksInCat = getBooksInCategory(category.id)
      if (booksInCat.includes(lastChapter.book)) {
        return category.id
      }
    }

    return null
  }

  // Load data on mount
  useEffect(() => {
    const data = getPersonalReadingData()
    setPersonalData(data)
    // Load the selected plan from storage
    if (data.selectedPlan) {
      setSelectedPlan(data.selectedPlan)
    }

    // Initialize expandedCategories to show only the last-read category
    const lastReadCategoryId = getLastReadCategoryId()
    if (lastReadCategoryId) {
      setExpandedCategories({ [lastReadCategoryId]: true })
    }
  }, [])

  // Helper: Save to localStorage and sync to Firebase if authenticated
  const saveAndSync = async (data) => {
    savePersonalReadingData(data)

    // Also sync to Firebase if user is authenticated
    if (auth.currentUser?.uid) {
      try {
        await syncPersonalReadingToFirebase(auth.currentUser.uid)
      } catch (error) {
        console.warn('⚠️ Failed to sync to Firebase:', error)
      }
    }
  }

  /**
   * Get chapters read for a specific book
   * Returns array of chapter objects: { chapter, status: 'complete'|'partial', verses? }
   */
  const getChaptersReadForBook = (bookNumber) => {
    if (!personalData) return []
    return personalData.chaptersRead.filter(ch => ch.book === bookNumber)
  }

  // Calculate verse-based progress for a book
  const getBookProgress = (bookNumber) => {
    if (!personalData) return { versesRead: 0, totalVerses: 0, percentage: 0 }

    const totalChapters = bibleBooks.books[bookNumber - 1]?.chapters || 1
    const chaptersReadForBook = getChaptersReadForBook(bookNumber)

    // Calculate using verse-based progress
    const result = calculateVerseProgress(
      chaptersReadForBook,
      bookNumber,
      1,
      totalChapters
    )

    return result
  }

  // Get color based on progress percentage with smooth gradient yellow→green
  const getProgressColor = (percentage) => {
    if (percentage === 100) return 'bg-green-700'
    if (percentage >= 96) return 'bg-green-600'
    if (percentage >= 86) return 'bg-green-500'
    if (percentage >= 76) return 'bg-lime-400'
    if (percentage >= 61) return 'bg-amber-400'
    if (percentage >= 46) return 'bg-yellow-500'
    if (percentage >= 31) return 'bg-yellow-400'
    if (percentage >= 16) return 'bg-yellow-300'
    if (percentage > 0) return 'bg-yellow-200'
    return 'bg-gray-300'
  }

  // Check if chapter is read (complete or partial)
  const getChapterStatus = (bookNumber, chapter) => {
    const found = personalData?.chaptersRead.find(
      ch => ch.book === bookNumber && ch.chapter === chapter
    )
    return found?.status || null // 'complete' | 'partial' | null
  }

  // Get verse count if partial chapter
  const getChapterVerses = (bookNumber, chapter) => {
    const found = personalData?.chaptersRead.find(
      ch => ch.book === bookNumber && ch.chapter === chapter
    )
    return found?.verses || 0
  }

  // Toggle chapter to complete status
  const markChapterComplete = (bookNumber, chapter) => {
    const updated = { ...personalData }
    const index = updated.chaptersRead.findIndex(
      ch => ch.book === bookNumber && ch.chapter === chapter
    )

    if (index > -1) {
      // Already exists, update to complete
      updated.chaptersRead[index] = {
        book: bookNumber,
        chapter: chapter,
        status: 'complete',
        timestamp: Date.now()
      }
    } else {
      // Add new complete chapter
      updated.chaptersRead.push({
        book: bookNumber,
        chapter: chapter,
        status: 'complete',
        timestamp: Date.now()
      })
    }

    saveAndSync(updated)
    setPersonalData(updated)
    window.dispatchEvent(new Event('personalReadingUpdated'))
  }

  // Mark chapter as unread
  const unmarkChapter = (bookNumber, chapter) => {
    const updated = { ...personalData }
    updated.chaptersRead = updated.chaptersRead.filter(
      ch => !(ch.book === bookNumber && ch.chapter === chapter)
    )

    saveAndSync(updated)
    setPersonalData(updated)
    window.dispatchEvent(new Event('personalReadingUpdated'))
  }

  // Mark chapter as partial with verse count
  const markChapterPartial = (bookNumber, chapter, verses) => {
    const updated = { ...personalData }
    const index = updated.chaptersRead.findIndex(
      ch => ch.book === bookNumber && ch.chapter === chapter
    )

    const verseCount = getVerseCount(bookNumber, chapter)
    if (verses > verseCount) return // Validation

    if (index > -1) {
      updated.chaptersRead[index] = {
        book: bookNumber,
        chapter: chapter,
        status: 'partial',
        verses: verses,
        timestamp: Date.now()
      }
    } else {
      updated.chaptersRead.push({
        book: bookNumber,
        chapter: chapter,
        status: 'partial',
        verses: verses,
        timestamp: Date.now()
      })
    }

    saveAndSync(updated)
    setPersonalData(updated)
    window.dispatchEvent(new Event('personalReadingUpdated'))
  }

  // Handle manual progress input with parser
  const handleSubmitProgress = () => {
    if (!progressInputText.trim()) {
      setProgressError(t('reading.error_empty'))
      return
    }

    // Parse the input WITHOUT a default book (book name must be provided)
    const result = parseReadingInput(progressInputText, null)

    // Check for errors
    if (result.error) {
      setProgressError(result.error)
      setProgressSuggestion(result.suggestion || null)
      return
    }

    // Check if a book was found in the input
    if (!result.book) {
      setProgressError('Buchname erforderlich (z.B. "1mo 2-5" oder "Matthäus 24")')
      if (result.suggestion) {
        setProgressSuggestion(result.suggestion)
      }
      return
    }

    // Check if there are suggestions (unclear or ambiguous book name)
    if (result.suggestion) {
      setProgressSuggestion(result.suggestion)
      return
    }

    const bookNumber = result.book.number
    const maxChapters = bibleBooks.books[bookNumber - 1]?.chapters || 1

    // Verify chapters are within book range
    const invalidChapters = result.chapters.filter(ch => ch.chapter > maxChapters)
    if (invalidChapters.length > 0) {
      setProgressError(`${t('reading.error_chapter_range')} (1-${maxChapters})`)
      return
    }

    // Process chapters: mark complete or partial
    const updated = { ...personalData }

    result.chapters.forEach(parsedChapter => {
      const { chapter, status, verses } = parsedChapter

      // Find or create chapter entry
      const index = updated.chaptersRead.findIndex(
        ch => ch.book === bookNumber && ch.chapter === chapter
      )

      const newEntry = {
        book: bookNumber,
        chapter: chapter,
        status: status,
        ...(status === 'partial' && { verses }),
        timestamp: Date.now()
      }

      if (index > -1) {
        updated.chaptersRead[index] = newEntry
      } else {
        updated.chaptersRead.push(newEntry)
      }
    })

    // Save and reset
    saveAndSync(updated)
    setPersonalData(updated)
    window.dispatchEvent(new Event('personalReadingUpdated'))

    // Reset form
    setProgressInputText('')
    setProgressError(null)
    setProgressSuggestion(null)
    setShowProgressForm(false)
  }

  // Handle suggestion acceptance - reconstructs input with selected book
  const handleAcceptSuggestion = (suggestion, selectedBook) => {
    if (!suggestion || !selectedBook) return

    // Reconstruct the input with the selected book name and the original reference
    const newInput = `${selectedBook.name} ${suggestion.referenceText || ''}`
    setProgressInputText(newInput.trim())
    setProgressSuggestion(null)
    setProgressError(null)
  }

  // Calculate total progress across all books (verse-based)
  const calculateTotalProgress = () => {
    if (!personalData) return { versesRead: 0, totalVerses: 0, percentage: 0 }

    let totalVerses = 0
    let versesRead = 0

    // For each book, calculate total and read verses
    for (let bookNum = 1; bookNum <= 66; bookNum++) {
      const totalChapters = bibleBooks[bookNum - 1]?.chapters || 1
      const bookTotal = getTotalVerses(bookNum, 1, totalChapters)
      totalVerses += bookTotal

      // Get chapters read for this book and count verses
      const chaptersReadForBook = getChaptersReadForBook(bookNum)
      const bookRead = calculateVersesRead(chaptersReadForBook, bookNum, 1, totalChapters)
      versesRead += bookRead
    }

    return {
      versesRead,
      totalVerses,
      percentage: totalVerses > 0 ? Math.round((versesRead / totalVerses) * 100) : 0
    }
  }

  if (!personalData) return <div className="p-4 text-center">Laden...</div>

  const totalProgress = calculateTotalProgress()
  const hebrewBooks = bibleBooks.books.slice(0, 39)
  const greekBooks = bibleBooks.books.slice(39, 66)

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold flex-1">{t('home.personal_reading')}</h1>
          <button
            onClick={() => navigate('/settings')}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title={t('nav.settings')}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Total Progress Bar (Verse-Based) */}
        <div className="px-4 pb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-2">
            <span>{totalProgress.versesRead} / {totalProgress.totalVerses} {t('reading.verses')}</span>
            <span>{totalProgress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all"
              style={{ width: `${totalProgress.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content - Plan-Specific Views */}
      <div className="p-4 pb-32">
        {selectedPlan === 'free' && (
          <div className="space-y-6">
            {readingCategories.map((category) => {
              const isExpanded = expandedCategories[category.id] === true // Default to collapsed
              const booksInCategory = getBooksInCategory(category.id)

              return (
                <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Category Header */}
                  <button
                    onClick={() => {
                      setExpandedCategories(prev => ({
                        ...prev,
                        [category.id]: !prev[category.id]
                      }))
                    }}
                    className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 px-4 py-3 flex items-center justify-between border-b border-gray-200"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <ChevronDown
                        size={20}
                        className={`text-blue-600 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                      />
                      <div className="text-left">
                        <h3 className="font-bold text-gray-800">{t(category.translationKey)}</h3>
                      </div>
                    </div>
                  </button>

                  {/* Category Books Grid */}
                  {isExpanded && (
                    <div className="p-4 bg-white">
                      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-2">
                        {booksInCategory.map((bookNumber) => {
                          const book = bibleBooks.books[bookNumber - 1]
                          const progress = getBookProgress(bookNumber)

                          return (
                            <button
                              key={bookNumber}
                              onClick={() => {
                                setSelectedBook(bookNumber)
                                setShowChapterModal(true)
                              }}
                              className={`aspect-square p-1 rounded-lg border-2 border-gray-200 transition-all flex flex-col justify-center items-center ${getProgressColor(progress.percentage)}`}
                              title={book?.name}
                            >
                              <div className="text-white font-bold text-center flex items-center justify-center h-full text-xs sm:text-sm">
                                <span>{book?.abbreviation || book?.name.substring(0, 2)}</span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {selectedPlan === 'chronological' && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-2">{t('reading.plan_chronological')}</p>
            <p className="text-sm text-gray-500">{t('reading.coming_soon')}</p>
          </div>
        )}

        {selectedPlan === 'oneyear' && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-2">{t('reading.plan_oneyear')}</p>
            <p className="text-sm text-gray-500">{t('reading.coming_soon')}</p>
          </div>
        )}

        {selectedPlan === 'thematic' && (
          <div className="space-y-6">
            {/* Thematic Plan Progress */}
            {(() => {
              const progress = getThematicProgress()
              return (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                  <div className="flex justify-between text-sm text-gray-700 mb-2">
                    <span className="font-medium">{t('reading.plan_thematic')}</span>
                    <span className="font-semibold">{progress.completed}/{progress.total} {t('reading.topics_completed')}</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-purple-600 h-full transition-all"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-2">{progress.percentage}% {t('reading.complete')}</div>
                </div>
              )
            })()}

            {/* Thematic Sections */}
            {getThematicSections().map((section) => {
              const isExpanded = expandedSections[section.key] !== false // Default to expanded
              const topicsInSection = getTopicsInSection(section.key)

              return (
                <div key={section.key} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Section Header */}
                  <button
                    onClick={() => {
                      setExpandedSections(prev => ({
                        ...prev,
                        [section.key]: !prev[section.key]
                      }))
                    }}
                    className="w-full bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 px-4 py-3 flex items-center justify-between border-b border-gray-200"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <ChevronDown
                        size={20}
                        className={`text-purple-600 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                      />
                      <h3 className="font-bold text-gray-800">{t(section.titleKey)}</h3>
                    </div>
                  </button>

                  {/* Topics in Section */}
                  {isExpanded && (
                    <div className="p-4 bg-white space-y-2">
                      {topicsInSection.map((topic) => {
                        const isTopicExpanded = expandedTopics[topic.id]
                        const isCompleted = isThematicTopicComplete(topic.id)

                        return (
                          <div key={topic.id} className={`border rounded-lg overflow-hidden transition-colors ${isCompleted ? 'border-purple-300 bg-purple-50' : 'border-gray-100'}`}>
                            {/* Topic Header (Clickable) */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (isCompleted) {
                                    unmarkThematicTopicComplete(topic.id)
                                  } else {
                                    markThematicTopicComplete(topic.id)
                                  }
                                  setPersonalData(getPersonalReadingData())
                                  window.dispatchEvent(new Event('personalReadingUpdated'))
                                }}
                                className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                                  isCompleted
                                    ? 'bg-purple-600 border-purple-600'
                                    : 'border-gray-300 hover:border-purple-400'
                                }`}
                              >
                                {isCompleted && <Check className="w-4 h-4 text-white" />}
                              </button>
                              <button
                                onClick={() => {
                                  setExpandedTopics(prev => ({
                                    ...prev,
                                    [topic.id]: !prev[topic.id]
                                  }))
                                }}
                                className={`w-full text-left bg-gray-50 hover:bg-gray-100 px-3 py-2 flex items-center gap-2 transition-colors ${isCompleted ? 'bg-purple-100 hover:bg-purple-150' : ''}`}
                              >
                                <ChevronRight
                                  size={18}
                                  className={`text-gray-600 transition-transform flex-shrink-0 ${isTopicExpanded ? 'rotate-90' : 'rotate-0'}`}
                                />
                                <span className={`font-medium text-sm text-left flex-1 ${isCompleted ? 'text-purple-700 line-through' : 'text-gray-700'}`}>
                                  {t(topic.titleKey)}
                                </span>
                              </button>
                            </div>

                            {/* Topic Content - Scripture References */}
                            {isTopicExpanded && (
                              <div className={`border-t p-3 ${isCompleted ? 'border-purple-200 bg-white' : 'border-gray-100 bg-white'}`}>
                                {(() => {
                                  const versesLinks = parseMultipleVerses(topic.verses, language)
                                  if (versesLinks.length > 0) {
                                    return (
                                      <div className="flex flex-wrap gap-2">
                                        {versesLinks.map((link, idx) => (
                                          <a
                                            key={idx}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 hover:text-blue-900 rounded text-xs font-medium transition-colors"
                                            title={`Open ${link.book} on JW.org`}
                                          >
                                            {link.text}
                                            <ExternalLink className="inline w-3 h-3 ml-1" />
                                          </a>
                                        ))}
                                      </div>
                                    )
                                  } else {
                                    return <p className="text-xs text-gray-600 font-mono">{topic.verses}</p>
                                  }
                                })()}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Chapter Modal */}
      {showChapterModal && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-2xl rounded-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <div className="flex-1">
                <h3 className="text-lg font-bold">{bibleBooks.books[selectedBook - 1]?.name}</h3>
                <p className="text-sm text-gray-600">{bibleBooks.books[selectedBook - 1]?.chapters} {t('common.chapters')}</p>
              </div>
              <button
                onClick={() => setShowChapterModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Mark All / Unmark All */}
            <div className="sticky top-16 bg-gray-50 border-b border-gray-200 px-4 py-3 flex gap-2">
              <button
                onClick={() => {
                  for (let i = 1; i <= (bibleBooks.books[selectedBook - 1]?.chapters || 1); i++) {
                    if (getChapterStatus(selectedBook, i) === null) {
                      markChapterComplete(selectedBook, i)
                    }
                  }
                }}
                className="flex-1 py-2 px-3 bg-green-100 text-green-700 rounded font-medium hover:bg-green-200 text-sm"
              >
                ✓ {t('common.mark_all')}
              </button>
              <button
                onClick={() => {
                  const updated = { ...personalData }
                  updated.chaptersRead = updated.chaptersRead.filter(ch => ch.book !== selectedBook)
                  saveAndSync(updated)
                  setPersonalData(updated)
                  window.dispatchEvent(new Event('personalReadingUpdated'))
                }}
                className="flex-1 py-2 px-3 bg-gray-200 text-gray-700 rounded font-medium hover:bg-gray-300 text-sm"
              >
                ✕ {t('common.unmark_all')}
              </button>
            </div>

            {/* Chapters Grid */}
            <div className="p-4">
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: bibleBooks.books[selectedBook - 1]?.chapters || 1 }).map(
                  (_, chIdx) => {
                    const chapter = chIdx + 1
                    const status = getChapterStatus(selectedBook, chapter)
                    const totalVerses = getVerseCount(selectedBook, chapter)
                    const readVersesCount = getChapterVerses(selectedBook, chapter)

                    return (
                      <div key={chapter} className="relative">
                        <button
                          onClick={() => {
                            if (status === 'complete') {
                              unmarkChapter(selectedBook, chapter)
                            } else {
                              markChapterComplete(selectedBook, chapter)
                            }
                          }}
                          onRightClick={(e) => {
                            e.preventDefault()
                            setEditingPartialChapter({ chapter, verses: readVersesCount })
                          }}
                          className={`w-full py-2 rounded font-semibold text-sm transition-all ${
                            status === 'complete'
                              ? 'bg-green-600 text-white'
                              : status === 'partial'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {chapter}
                        </button>
                        {status === 'partial' && (
                          <div className="text-xs text-gray-600 text-center mt-1">
                            {readVersesCount}/{totalVerses}v
                          </div>
                        )}
                      </div>
                    )
                  }
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Progress Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        {!showProgressForm ? (
          <button
            onClick={() => setShowProgressForm(true)}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            {t('reading.add_progress')}
          </button>
        ) : (
          <div className="space-y-3">
            {/* Unified Book + Chapter Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('reading.chapter')}
              </label>
              <input
                type="text"
                value={progressInputText}
                onChange={(e) => {
                  setProgressInputText(e.target.value)
                  setProgressError(null)
                  setProgressSuggestion(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmitProgress()
                }}
                className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                  progressError
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="z.B. 1mo 2-5 oder 1mo 2:5-16 oder Matthäus 24:3-14"
              />
              <p className="text-xs text-gray-500">
                Format: Buchname oder Abkürzung, dann Kapitel/Verse. Z.B. "1mo 3", "Jes 41:10", "Mt 5-7"
              </p>
            </div>

            {/* Error Message */}
            {progressError && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-700 font-medium">{progressError}</p>
              </div>
            )}

            {/* Suggestions */}
            {progressSuggestion && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 space-y-2">
                <p className="text-sm font-medium text-yellow-800">
                  {progressSuggestion.type === 'did_you_mean' && 'Did you mean one of these books?'}
                  {progressSuggestion.type === 'unclear' && `"${progressSuggestion.input}" is unclear. Which book did you mean?`}
                  {progressSuggestion.type === 'not_found' && `"${progressSuggestion.input}" not found. Did you mean one of these?`}
                </p>
                <div className="flex flex-wrap gap-2">
                  {progressSuggestion.suggestions && progressSuggestion.suggestions.map((book, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        handleAcceptSuggestion(progressSuggestion, book)
                      }}
                      className="px-3 py-1 bg-yellow-200 text-yellow-900 rounded text-sm font-medium hover:bg-yellow-300"
                    >
                      {book.abbreviation || book.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSubmitProgress}
                className="flex-1 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700"
              >
                {t('common.save')}
              </button>
              <button
                onClick={() => {
                  setShowProgressForm(false)
                  setProgressInputText('')
                  setProgressError(null)
                  setProgressSuggestion(null)
                }}
                className="flex-1 py-2 bg-gray-300 text-gray-800 rounded font-semibold hover:bg-gray-400"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

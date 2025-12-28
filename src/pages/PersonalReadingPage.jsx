import React, { useState, useEffect } from 'react'
import { ChevronLeft, ExternalLink, Check, Edit2, ChevronDown, ChevronRight, Settings, Download, X, Star } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLoading } from '../context/LoadingContext'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { t, getCurrentLanguage } from '../config/i18n'
import { getBibleBooks } from '../config/languages'
import { readingCategories, getBooksInCategory } from '../config/reading-categories'
import { thematicTopics, getThematicSections, getTopicsInSection } from '../config/thematic-topics'
import { getPersonalReadingData, savePersonalReadingData, syncPersonalReadingToFirebase, markThematicTopicComplete, unmarkThematicTopicComplete, isThematicTopicComplete, getThematicProgress } from '../utils/storage'
import { buildLanguageSpecificWebLink } from '../../data/bible-link-builder'
import { auth } from '../config/firebase'
import { parseReadingInput } from '../utils/readingParser'
import { parseMultipleVerses } from '../utils/versesLinksBuilder'
import { getAvailableReadingPlans, installReadingPlan, uninstallReadingPlan, getInstalledPlans } from '../utils/firebaseReadingPlans'
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
  const [searchParams] = useSearchParams()
  const { showLoading, hideLoading } = useLoading()
  const { currentUser } = useAuth()
  const language = getCurrentLanguage()
  const bibleBooks = getBibleBooks(language)

  // State
  const [personalData, setPersonalData] = useState(null)
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)
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
  const [isSelectMode, setIsSelectMode] = useState(false) // Chapter selection mode
  const [selectedChapters, setSelectedChapters] = useState(new Set()) // Selected chapters for batch operations

  // Reading Plans Store
  const [availablePlans, setAvailablePlans] = useState([]) // Custom plans from Firebase
  const [installedPlans, setInstalledPlans] = useState([]) // User's installed plans
  const [loadingPlans, setLoadingPlans] = useState(false) // Loading state for plans

  // Find the category ID of the last-read chapter (for Free plan)
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

  // Find the last-read thematic topic ID (for Thematic plan)
  const getLastReadThematicTopicId = () => {
    if (!personalData || !personalData.thematicTopicsRead || personalData.thematicTopicsRead.length === 0) {
      return null
    }

    // Find the most recently read topic (thematicTopicsRead is an array of topic IDs)
    // Since we need timestamp, we'll check thematicTopicsRead structure
    // If it's just IDs, use the last one in the array
    // If it's objects with timestamps, find the most recent
    const lastItem = personalData.thematicTopicsRead[personalData.thematicTopicsRead.length - 1]

    if (typeof lastItem === 'number') {
      // It's just a topic ID
      return lastItem
    } else if (typeof lastItem === 'object' && lastItem.topicId) {
      // It's an object with topicId property
      return lastItem.topicId
    }

    return null
  }

  // Load data on mount
  useEffect(() => {
    const data = getPersonalReadingData()
    setPersonalData(data)
    // Load the selected plan from Settings (consistent with SettingsPage)
    const savedPlan = localStorage.getItem('settings_readingPlan') || 'free'
    setSelectedPlan(savedPlan)

    // Initialize expandedCategories to show only the last-read category
    const lastReadCategoryId = getLastReadCategoryId()
    if (lastReadCategoryId) {
      setExpandedCategories({ [lastReadCategoryId]: true })
    }

    // Initialize expandedTopics to show only the last-read thematic topic
    const lastReadTopicId = getLastReadThematicTopicId()
    if (lastReadTopicId) {
      setExpandedTopics({ [lastReadTopicId]: true })
    }

    // Handle query parameters (e.g., ?book=1&chapter=5)
    const bookParam = searchParams.get('book')
    const chapterParam = searchParams.get('chapter')
    if (bookParam && chapterParam) {
      const bookNumber = parseInt(bookParam)
      const chapterNumber = parseInt(chapterParam)
      if (bookNumber >= 1 && bookNumber <= 66 && chapterNumber >= 1) {
        setSelectedBook(bookNumber)
        setShowChapterModal(true)
      }
    }

    // Mark initial load as complete
    setIsLoadingInitial(false)
  }, [searchParams])

  // Load available and installed plans
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoadingPlans(true)

        // Load available plans from Firebase
        const available = await getAvailableReadingPlans()
        setAvailablePlans(available)

        // Load user's installed plans
        if (currentUser) {
          const installed = await getInstalledPlans(currentUser.uid)
          setInstalledPlans(installed)
        }
      } catch (error) {
        console.error('✗ Failed to load reading plans:', error)
      } finally {
        setLoadingPlans(false)
      }
    }

    loadPlans()
  }, [currentUser])

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

  // Install a reading plan
  const handleInstallPlan = async (planId) => {
    if (!currentUser) {
      alert(t('common.login_required'))
      return
    }

    try {
      await installReadingPlan(planId, currentUser.uid)
      // Refresh installed plans list
      const updated = await getInstalledPlans(currentUser.uid)
      setInstalledPlans(updated)
    } catch (error) {
      console.error('✗ Failed to install plan:', error)
      alert('Failed to install plan: ' + error.message)
    }
  }

  // Uninstall a reading plan
  const handleUninstallPlan = async (planId) => {
    if (!currentUser) return

    try {
      await uninstallReadingPlan(planId, currentUser.uid)
      // Refresh installed plans list
      const updated = await getInstalledPlans(currentUser.uid)
      setInstalledPlans(updated)
    } catch (error) {
      console.error('✗ Failed to uninstall plan:', error)
      alert('Failed to uninstall plan: ' + error.message)
    }
  }

  // Handle plan selection change
  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId)
    localStorage.setItem('settings_readingPlan', planId)
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

  // Show loading spinner on initial load
  if (isLoadingInitial) {
    return <LoadingSpinner variant="full" message={t('common.loading')} />
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 z-40">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-800 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold flex-1">{t('home.personal_reading')}</h1>
          <button
            onClick={() => navigate('/settings')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-800 rounded-lg"
            title={t('nav.settings')}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Total Progress Bar (Verse-Based) */}
        <div className="px-4 pb-4">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 dark:text-gray-300 mb-2">
            <span>{totalProgress.versesRead} / {totalProgress.totalVerses} {t('reading.verses')}</span>
            <span>{totalProgress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-full transition-all"
              style={{ width: `${totalProgress.percentage}%` }}
            />
          </div>
        </div>

        {/* Plan Selector */}
        <div className="px-4 pb-4 space-y-3">
          {/* Installed Plans Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('reading.reading_plan')}</label>
            <select
              value={selectedPlan}
              onChange={(e) => handleSelectPlan(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {/* System Plans */}
              <optgroup label="System Plans">
                <option value="free">{t('reading.plan_free') || 'Free Reading'}</option>
                <option value="thematic">{t('reading.plan_thematic') || 'Thematic'}</option>
              </optgroup>

              {/* Installed Custom Plans */}
              {installedPlans.length > 0 && (
                <optgroup label="My Plans">
                  {availablePlans
                    .filter(plan => installedPlans.includes(plan.id))
                    .map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name?.[language] || plan.name?.en || plan.id}
                      </option>
                    ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Available Plans Overview */}
          {availablePlans.length > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
              📦 {availablePlans.length} plan{availablePlans.length !== 1 ? 's' : ''} available
              {installedPlans.length > 0 && ` (${installedPlans.length} installed)`}
            </div>
          )}
        </div>
      </div>

      {/* Available Plans Section */}
      {currentUser && availablePlans.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gradient-to-b from-blue-50 dark:from-slate-800 to-white dark:to-slate-900">
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-300">
              <Download className="w-5 h-5" />
              Available Plans
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {availablePlans.map(plan => {
                const isInstalled = installedPlans.includes(plan.id)
                const planName = plan.name?.[language] || plan.name?.en || plan.id

                return (
                  <div
                    key={plan.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isInstalled
                        ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 dark:text-gray-300 line-clamp-2">{planName}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Type: {plan.type} | {plan.installations || 0} installs
                        </p>
                      </div>
                      {isInstalled && (
                        <div className="ml-2 flex-shrink-0">
                          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (isInstalled) {
                          handleUninstallPlan(plan.id)
                        } else {
                          handleInstallPlan(plan.id)
                        }
                      }}
                      className={`w-full py-2 rounded-lg font-medium text-sm transition-colors ${
                        isInstalled
                          ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800'
                          : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                      }`}
                    >
                      {isInstalled ? (
                        <>
                          <X className="w-4 h-4 inline mr-1" />
                          Uninstall
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 inline mr-1" />
                          Install
                        </>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Content - Plan-Specific Views */}
      <div className="p-4 pb-32">
        {/* Custom Plan Handler - Check if selectedPlan is a custom plan ID */}
        {selectedPlan && !['free', 'chronological', 'oneyear', 'thematic'].includes(selectedPlan) && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-2">Custom Plan: {selectedPlan}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Plan content rendering coming soon...</p>
          </div>
        )}

        {selectedPlan === 'free' && (
          <div className="space-y-6">
            {readingCategories.map((category) => {
              const isExpanded = expandedCategories[category.id] === true // Default to collapsed
              const booksInCategory = getBooksInCategory(category.id)

              return (
                <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  {/* Category Header */}
                  <button
                    onClick={() => {
                      setExpandedCategories(prev => ({
                        ...prev,
                        [category.id]: !prev[category.id]
                      }))
                    }}
                    className="w-full bg-gradient-to-r from-blue-50 dark:from-slate-800 to-indigo-50 dark:to-slate-700 hover:from-blue-100 dark:hover:from-slate-700 hover:to-indigo-100 dark:hover:to-slate-600 px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <ChevronDown
                        size={20}
                        className={`text-blue-600 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                      />
                      <div className="text-left">
                        <h3 className="font-bold text-gray-800 dark:text-gray-300">{t(category.translationKey)}</h3>
                      </div>
                    </div>
                  </button>

                  {/* Category Books Grid */}
                  {isExpanded && (
                    <div className="p-4 bg-white dark:bg-slate-800">
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
                              className={`aspect-square p-1 rounded-lg border-2 border-gray-200 dark:border-gray-700 transition-all flex flex-col justify-center items-center ${getProgressColor(progress.percentage)}`}
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
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-300 mb-2">{t('reading.plan_chronological')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-300">{t('reading.coming_soon')}</p>
          </div>
        )}

        {selectedPlan === 'oneyear' && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-300 mb-2">{t('reading.plan_oneyear')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-300">{t('reading.coming_soon')}</p>
          </div>
        )}

        {selectedPlan === 'thematic' && (
          <div className="space-y-6">
            {/* Thematic Plan Progress */}
            {(() => {
              const progress = getThematicProgress()
              return (
                <div className="bg-gradient-to-r from-purple-50 dark:from-purple-900 to-pink-50 dark:to-pink-900 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                  <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 mb-2">
                    <span className="font-medium">{t('reading.plan_thematic')}</span>
                    <span className="font-semibold">{progress.completed}/{progress.total} {t('reading.topics_completed')}</span>
                  </div>
                  <div className="w-full bg-purple-200 dark:bg-purple-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-purple-600 dark:bg-purple-500 h-full transition-all"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-300 mt-2">{progress.percentage}% {t('reading.complete')}</div>
                </div>
              )
            })()}

            {/* Thematic Sections */}
            {getThematicSections().map((section) => {
              const isExpanded = expandedSections[section.key] !== false // Default to expanded
              const topicsInSection = getTopicsInSection(section.key)

              return (
                <div key={section.key} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  {/* Section Header */}
                  <button
                    onClick={() => {
                      setExpandedSections(prev => ({
                        ...prev,
                        [section.key]: !prev[section.key]
                      }))
                    }}
                    className="w-full bg-gradient-to-r from-purple-50 dark:from-purple-900 to-pink-50 dark:to-pink-900 hover:from-purple-100 dark:hover:from-purple-800 hover:to-pink-100 dark:hover:to-pink-800 px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <ChevronDown
                        size={20}
                        className={`text-purple-600 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                      />
                      <h3 className="font-bold text-gray-800 dark:text-gray-300">{t(section.titleKey)}</h3>
                    </div>
                  </button>

                  {/* Topics in Section */}
                  {isExpanded && (
                    <div className="p-4 bg-white dark:bg-slate-800 space-y-2">
                      {topicsInSection.map((topic) => {
                        const isTopicExpanded = expandedTopics[topic.id]
                        const isCompleted = isThematicTopicComplete(topic.id)

                        return (
                          <div key={topic.id} className={`border rounded-lg overflow-hidden transition-colors ${isCompleted ? 'border-purple-300 bg-purple-50 dark:bg-purple-900 dark:border-purple-700' : 'border-gray-100 dark:border-gray-800'}`}>
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
                                    ? 'bg-purple-600 dark:bg-purple-500 border-purple-600 dark:border-purple-500'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
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
                                className={`w-full text-left bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 px-3 py-2 flex items-center gap-2 transition-colors ${isCompleted ? 'bg-purple-100 dark:bg-purple-800 hover:bg-purple-150 dark:hover:bg-purple-700' : ''}`}
                              >
                                <ChevronRight
                                  size={18}
                                  className={`text-gray-600 dark:text-gray-300 transition-transform flex-shrink-0 ${isTopicExpanded ? 'rotate-90' : 'rotate-0'}`}
                                />
                                <span className={`font-medium text-sm text-left flex-1 ${isCompleted ? 'text-purple-700 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                                  {t(topic.titleKey)}
                                </span>
                              </button>
                            </div>

                            {/* Topic Content - Scripture References */}
                            {isTopicExpanded && (
                              <div className={`border-t p-3 ${isCompleted ? 'border-purple-200 dark:border-purple-600 bg-purple-50 dark:bg-purple-900' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-800'}`}>
                                {(() => {
                                  const versesLinks = parseMultipleVerses(topic.verses, language)
                                  return (
                                    <div className="flex flex-wrap gap-2">
                                      {versesLinks.map((link, idx) => (
                                        <a
                                          key={idx}
                                          href={link.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 dark:text-blue-100 hover:underline font-medium transition-colors"
                                          title={`Open ${link.book} on JW.org`}
                                        >
                                          {link.text}
                                          <ExternalLink className="inline w-3 h-3 ml-1" />
                                        </a>
                                      ))}
                                    </div>
                                  )
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
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
              <div className="flex-1">
                <h3 className="text-lg font-bold">{bibleBooks.books[selectedBook - 1]?.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-300">{bibleBooks.books[selectedBook - 1]?.chapters} {t('common.chapters')}</p>
              </div>
              <button
                onClick={() => {
                  setShowChapterModal(false)
                  setIsSelectMode(false)
                  setSelectedChapters(new Set())
                }}
                className="text-gray-500 dark:text-gray-400 dark:text-gray-300 hover:text-gray-700 dark:text-gray-300 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Select Mode Toggle & Actions */}
            <div className="sticky top-16 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex gap-2">
              {!isSelectMode ? (
                <button
                  onClick={() => {
                    setIsSelectMode(true)
                    setSelectedChapters(new Set())
                  }}
                  className="flex-1 py-2 px-3 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100 rounded font-medium hover:bg-blue-200 text-sm"
                >
                  ☑ {t('common.select')}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsSelectMode(false)
                      setSelectedChapters(new Set())
                    }}
                    className="flex-1 py-2 px-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded font-medium hover:bg-gray-300 dark:hover:bg-slate-600 dark:bg-slate-600 text-sm"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={() => {
                      selectedChapters.forEach(chapter => {
                        markChapterComplete(selectedBook, chapter)
                      })
                      setSelectedChapters(new Set())
                      setIsSelectMode(false)
                    }}
                    disabled={selectedChapters.size === 0}
                    className="flex-1 py-2 px-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded font-medium hover:bg-green-200 dark:hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    ✓ {t('common.mark_done')}
                  </button>
                  <button
                    onClick={() => {
                      const updated = { ...personalData }
                      updated.chaptersRead = updated.chaptersRead.filter(ch => !(ch.book === selectedBook && selectedChapters.has(ch.chapter)))
                      saveAndSync(updated)
                      setPersonalData(updated)
                      setSelectedChapters(new Set())
                      setIsSelectMode(false)
                      window.dispatchEvent(new Event('personalReadingUpdated'))
                    }}
                    disabled={selectedChapters.size === 0}
                    className="flex-1 py-2 px-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded font-medium hover:bg-red-200 dark:hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    ✕ {t('common.mark_undone')}
                  </button>
                </>
              )}
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
                    const isSelected = selectedChapters.has(chapter)

                    // Determine base background color based on status
                    const baseColor = status === 'complete'
                      ? 'bg-green-600 dark:bg-green-500'
                      : status === 'partial'
                      ? 'bg-yellow-500 dark:bg-yellow-600'
                      : 'bg-gray-100 dark:bg-slate-700'

                    const baseText = status ? 'text-white' : 'text-gray-700 dark:text-gray-300'

                    return (
                      <div key={chapter} className="relative">
                        <button
                          onClick={() => {
                            if (isSelectMode) {
                              // Select Mode: Toggle checkbox
                              const newSelected = new Set(selectedChapters)
                              if (newSelected.has(chapter)) {
                                newSelected.delete(chapter)
                              } else {
                                newSelected.add(chapter)
                              }
                              setSelectedChapters(newSelected)
                            } else {
                              // Normal Mode: Open deeplink
                              const linkObj = buildLanguageSpecificWebLink(
                                selectedBook,
                                chapter,
                                1,  // startVerse (defaults to verse 1)
                                null,  // endVerse (null = read whole chapter)
                                language
                              )
                              // Use direct navigation instead of window.open() to avoid iOS PWA popup
                              window.location.href = linkObj.web
                            }
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault()
                            setEditingPartialChapter({ chapter, verses: readVersesCount })
                          }}
                          className={`w-full py-2 rounded font-semibold text-sm transition-all relative ${
                            baseColor
                          } ${baseText} ${
                            isSelectMode
                              ? isSelected
                                ? 'ring-4 ring-blue-400 dark:ring-blue-500'
                                : 'opacity-75 hover:opacity-100'
                              : status ? 'hover:opacity-90' : 'hover:bg-gray-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          {isSelectMode && isSelected && <span className="absolute top-1 right-2 text-white text-lg font-bold">✓</span>}
                          {chapter}
                        </button>
                        {status === 'partial' && (
                          <div className={`text-xs text-center mt-1 ${isSelectMode && isSelected ? 'text-blue-600 font-medium' : 'text-gray-600 dark:text-gray-300'}`}>
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
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-700 p-4">
        {!showProgressForm ? (
          <button
            onClick={() => setShowProgressForm(true)}
            className="w-full py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600"
          >
            {t('reading.add_progress')}
          </button>
        ) : (
          <div className="space-y-3">
            {/* Unified Book + Chapter Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                    ? 'border-red-300 dark:border-red-700 focus:ring-red-500 dark:focus:ring-red-400'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'
                }`}
                placeholder="z.B. 1mo 2-5 oder 1mo 2:5-16 oder Matthäus 24:3-14"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-300">
                Format: Buchname oder Abkürzung, dann Kapitel/Verse. Z.B. "1mo 3", "Jes 41:10", "Mt 5-7"
              </p>
            </div>

            {/* Error Message */}
            {progressError && (
              <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded p-3">
                <p className="text-sm text-red-700 dark:text-red-100 font-medium">{progressError}</p>
              </div>
            )}

            {/* Suggestions */}
            {progressSuggestion && (
              <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded p-3 space-y-2">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-100">
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
                      className="px-3 py-1 bg-yellow-200 dark:bg-yellow-700 text-yellow-900 dark:text-yellow-100 rounded text-sm font-medium hover:bg-yellow-300 dark:hover:bg-yellow-600"
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
                className="flex-1 py-2 bg-green-600 dark:bg-green-500 text-white rounded font-semibold hover:bg-green-700 dark:hover:bg-green-600"
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
                className="flex-1 py-2 bg-gray-300 dark:bg-slate-600 text-gray-800 dark:text-gray-300 rounded font-semibold hover:bg-gray-400"
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

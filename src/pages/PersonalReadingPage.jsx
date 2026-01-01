import React, { useState, useEffect } from 'react'
import { ChevronLeft, ExternalLink, Check, Edit2, ChevronDown, ChevronRight, Settings } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLoading } from '../context/LoadingContext'
import { useAuth } from '../context/AuthContext'
import { useProgress } from '../context/ProgressContext'
import { setChapterRead, removeChapter, isReadingComplete, markReadingComplete as markReadingCompleteUnified, unmarkReading } from '../utils/progressTracking'
import { isThematicTopicComplete as isThematicTopicCompleteUnified, markThematicTopicComplete as markThematicTopicCompleteUnified, unmarkThematicTopicComplete as unmarkThematicTopicCompleteUnified, formatReadingForDisplay, isReadingSatisfied, markSingleReadingComplete, unmarkSingleReadingComplete } from '../utils/thematicHelpers'
import { getBibleInOneYearState, initializeBibleInOneYear, saveBibleInOneYearState, markReadingComplete as markBibleInOneYearReading, unmarkReading as unmarkBibleInOneYearReading, calculateStats, resumePlan, archiveCurrentAttempt, clearCurrentPlan } from '../utils/bibleInOneYearState'
import BibleInOneYearModal from '../components/BibleInOneYearModal'
import LoadingSpinner from '../components/LoadingSpinner'
import { t, getCurrentLanguage } from '../config/i18n'
import { getBibleBooks } from '../config/languages'
import { readingCategories, getBooksInCategory } from '../config/reading-categories'
import { thematicTopics, getThematicSections, getTopicsInSection } from '../config/thematic-topics'
import { bibleOverviewReadings, bibleOverviewSections, getReadingsInSection as getBibleOverviewReadingsInSection } from '../config/bible-overview-readings'
import { oneyearReadings, oneyearSections, getReadingsInSection as getOneyearReadingsInSection, getOnTrackStatus } from '../config/oneyear-readings'
import { getPersonalReadingData, savePersonalReadingData, syncPersonalReadingToFirebase } from '../utils/storage'
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
  const { overallProgress, oneyearProgress, bibleOverviewProgress, thematicProgress, chaptersRead, chaptersIndex, updateChaptersRead } = useProgress()
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
  const [selectedPlan, setSelectedPlan] = useState('free') // 'free', 'chronological', 'oneyear', 'thematic', 'bible_overview'
  const [expandedCategories, setExpandedCategories] = useState({}) // Track which categories are expanded
  const [expandedSections, setExpandedSections] = useState({}) // Track which thematic sections are expanded
  const [expandedTopics, setExpandedTopics] = useState({}) // Track which thematic topics are expanded
  const [isSelectMode, setIsSelectMode] = useState(false) // Chapter selection mode
  const [selectedChapters, setSelectedChapters] = useState(new Set()) // Selected chapters for batch operations
  const [isScrolled, setIsScrolled] = useState(false) // Track scroll state for progress bar collapse

  // Bible in One Year - Separate State
  const [bibleInOneYearState, setBibleInOneYearState] = useState(null)
  const [showBibleInOneYearModal, setShowBibleInOneYearModal] = useState(false)
  const [bibleInOneYearStats, setBibleInOneYearStats] = useState(null)

  // Reading Plans Store (needed for custom plans display)
  const [availablePlans, setAvailablePlans] = useState([]) // Custom plans from Firebase
  const [installedPlans, setInstalledPlans] = useState([]) // User's installed plans

  // Scroll detection for progress bar collapse
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Load available and installed plans
  useEffect(() => {
    const loadPlans = async () => {
      try {
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
      }
    }

    loadPlans()
  }, [currentUser])

  // Bible in One Year - Load state and show modal if existing attempt found
  useEffect(() => {
    if (selectedPlan === 'oneyear') {
      const state = getBibleInOneYearState()

      if (state) {
        // Existing attempt found - show modal to resume or restart
        const stats = calculateStats(state)
        setBibleInOneYearState(state)
        setBibleInOneYearStats(stats)

        // Only show modal if plan is paused (not active)
        if (!state.active) {
          setShowBibleInOneYearModal(true)
        }
      } else {
        // No existing attempt - initialize new one
        const newState = initializeBibleInOneYear(1)
        setBibleInOneYearState(newState)
        setBibleInOneYearStats(calculateStats(newState))
      }
    }
  }, [selectedPlan])

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

  // Get custom plan details
  const getCustomPlan = (planId) => {
    return availablePlans.find(p => p.id === planId)
  }

  // Custom plan expanded topics tracking
  const [customPlanTopics, setCustomPlanTopics] = useState({})

  const toggleCustomTopic = (planId, sectionIdx, topicIdx) => {
    const key = `${planId}_${sectionIdx}_${topicIdx}`
    setCustomPlanTopics(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
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

  // Toggle chapter to complete status (using unified progressTracking)
  const markChapterComplete = (bookNumber, chapter) => {
    const newChaptersRead = setChapterRead(chaptersRead, bookNumber, chapter, 'complete', null, 'free')
    updateChaptersRead(newChaptersRead)

    // Update local state for immediate UI update
    const updated = { ...personalData, chaptersRead: newChaptersRead }
    setPersonalData(updated)
    saveAndSync(updated)
  }

  // Mark chapter as unread (using unified progressTracking)
  const unmarkChapter = (bookNumber, chapter) => {
    const newChaptersRead = removeChapter(chaptersRead, bookNumber, chapter)
    updateChaptersRead(newChaptersRead)

    // Update local state for immediate UI update
    const updated = { ...personalData, chaptersRead: newChaptersRead }
    setPersonalData(updated)
    saveAndSync(updated)
  }

  // Mark chapter as partial with verse count (using unified progressTracking)
  const markChapterPartial = (bookNumber, chapter, verses) => {
    const verseCount = getVerseCount(bookNumber, chapter)
    if (verses > verseCount) return // Validation

    const newChaptersRead = setChapterRead(chaptersRead, bookNumber, chapter, 'partial', verses, 'free')
    updateChaptersRead(newChaptersRead)

    // Update local state for immediate UI update
    const updated = { ...personalData, chaptersRead: newChaptersRead }
    setPersonalData(updated)
    saveAndSync(updated)
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

    // Process chapters: mark complete or partial (using unified progressTracking)
    let newChaptersRead = [...chaptersRead]

    result.chapters.forEach(parsedChapter => {
      const { chapter, status, verses } = parsedChapter
      newChaptersRead = setChapterRead(newChaptersRead, bookNumber, chapter, status, verses, 'free')
    })

    // Update context and persist
    updateChaptersRead(newChaptersRead)
    const updated = { ...personalData, chaptersRead: newChaptersRead }
    setPersonalData(updated)
    saveAndSync(updated)

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

  // Bible in One Year - Modal Handlers
  const handleBibleInOneYearResume = () => {
    // Resume existing attempt
    const updatedState = resumePlan(bibleInOneYearState)
    setBibleInOneYearState(updatedState)
    setBibleInOneYearStats(calculateStats(updatedState))
    setShowBibleInOneYearModal(false)
  }

  const handleBibleInOneYearRestart = () => {
    // Archive current attempt and start new one
    archiveCurrentAttempt(bibleInOneYearState)
    clearCurrentPlan()

    const newAttempt = bibleInOneYearState.attempt + 1
    const newState = initializeBibleInOneYear(newAttempt)
    setBibleInOneYearState(newState)
    setBibleInOneYearStats(calculateStats(newState))
    setShowBibleInOneYearModal(false)
  }

  const handleBibleInOneYearCancel = () => {
    // Close modal and stay on paused plan
    setShowBibleInOneYearModal(false)
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

        {/* Progress Bars - Plan-Specific */}
        <div className="px-4 pb-4">
          {/* Free Reading */}
          {selectedPlan === 'free' && (
            <div className="space-y-2">
              {!isScrolled && (
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>{t('reading.overall_progress')}</span>
                  <span>{overallProgress.percentage}%</span>
                </div>
              )}
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-full transition-all"
                  style={{ width: `${overallProgress.percentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Thematic Plan - Dual Bars */}
          {selectedPlan === 'thematic' && (
            <div className="space-y-2">
              {/* Overall Bible Progress */}
              <div>
                {!isScrolled && (
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>{t('reading.overall_progress')}</span>
                    <span>{overallProgress.percentage}%</span>
                  </div>
                )}
                <div className="w-full bg-blue-200 dark:bg-blue-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-full transition-all"
                    style={{ width: `${overallProgress.percentage}%` }}
                  />
                </div>
              </div>

              {/* Thematic Plan Progress */}
              <div>
                {!isScrolled && (
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>{t('reading.plan_thematic')}</span>
                    <span>{thematicProgress.percentage}%</span>
                  </div>
                )}
                <div className="w-full bg-purple-200 dark:bg-purple-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-purple-600 dark:bg-purple-500 h-full transition-all"
                    style={{ width: `${thematicProgress.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bible in One Year - Separate Progress Tracking */}
          {selectedPlan === 'oneyear' && bibleInOneYearStats && (
            <div className="space-y-2">
              {/* Bible in One Year Progress */}
              <div>
                {!isScrolled && (
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>{t('bibleInOneYear.planName')}</span>
                    <span>{bibleInOneYearStats.readingsCompleted}/{bibleInOneYearStats.totalReadings} ({bibleInOneYearStats.progress}%)</span>
                  </div>
                )}
                <div className="w-full bg-green-200 dark:bg-green-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-green-600 dark:bg-green-500 h-full transition-all"
                    style={{ width: `${bibleInOneYearStats.progress}%` }}
                  />
                </div>
              </div>

              {/* Active Days Info */}
              {!isScrolled && bibleInOneYearStats.daysActive > 0 && (
                <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  {bibleInOneYearStats.daysActive} {t('common.days')} {t('common.active')}
                </div>
              )}
            </div>
          )}

          {/* Bible Overview - Overall Bible Progress + Bible Overview Progress */}
          {selectedPlan === 'bible_overview' && (
            <div className="space-y-2">
              {/* Overall Bible Progress */}
              <div>
                {!isScrolled && (
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>{t('reading.overall_progress')}</span>
                    <span>{overallProgress.percentage}%</span>
                  </div>
                )}
                <div className="w-full bg-blue-200 dark:bg-blue-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-full transition-all"
                    style={{ width: `${overallProgress.percentage}%` }}
                  />
                </div>
              </div>

              {/* Bible Overview Progress */}
              <div>
                {!isScrolled && (
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>{t('reading.plan_bible_overview')}</span>
                    <span>{bibleOverviewProgress.percentage}%</span>
                  </div>
                )}
                <div className="w-full bg-green-200 dark:bg-green-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-green-600 dark:bg-green-500 h-full transition-all"
                    style={{ width: `${bibleOverviewProgress.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content - Plan-Specific Views */}
      <div className="p-4 pb-32">
        {/* Custom Plan Handler */}
        {selectedPlan && !['free', 'chronological', 'oneyear', 'thematic', 'bible_overview'].includes(selectedPlan) && (() => {
          const plan = getCustomPlan(selectedPlan)
          if (!plan) {
            return (
              <div className="text-center py-12">
                <p className="text-red-600 dark:text-red-400">Plan not found: {selectedPlan}</p>
              </div>
            )
          }

          // Render based on plan type
          if (plan.type === 'chronological' || plan.type === 'category') {
            // Chronological/Category: Show sections with subsections
            return (
              <div className="space-y-6">
                {plan.sections?.map((section, idx) => (
                  <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 dark:from-slate-800 to-indigo-50 dark:to-slate-700 px-4 py-3">
                      <h3 className="font-bold text-gray-800 dark:text-gray-300">{section.title?.[language] || section.title?.en || 'Section'}</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {section.topics?.map((topic, tidx) => {
                        const topicKey = `${plan.id}_${idx}_${tidx}`
                        const isExpanded = customPlanTopics[topicKey]

                        return (
                          <div key={tidx} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            {/* Topic Header */}
                            <button
                              onClick={() => toggleCustomTopic(plan.id, idx, tidx)}
                              className="w-full bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 px-3 py-2 flex items-center gap-2 transition-colors"
                            >
                              <ChevronRight size={18} className={`text-gray-600 dark:text-gray-300 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                              <span className="font-medium text-sm text-left flex-1 text-gray-800 dark:text-gray-300">
                                {topic.title?.[language] || topic.title?.en}
                              </span>
                            </button>

                            {/* Verses (Expandable) */}
                            {isExpanded && topic.verses && topic.verses.length > 0 && (
                              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 space-y-2">
                                {topic.verses.map((verse, vidx) => {
                                  const book = bibleBooks.books[verse.book - 1]
                                  const bookName = book?.name || `Book ${verse.book}`

                                  let verseStr = bookName
                                  if (verse.chapter) {
                                    verseStr += ` ${verse.chapter}`
                                    if (verse.startVerse) {
                                      verseStr += `:${verse.startVerse}`
                                      if (verse.endVerse && verse.endVerse !== verse.startVerse) {
                                        verseStr += `-${verse.endVerse}`
                                      }
                                    }
                                  }

                                  // Build link
                                  const linkObj = buildLanguageSpecificWebLink(
                                    verse.book,
                                    verse.chapter,
                                    verse.startVerse || 1,
                                    verse.endVerse || null,
                                    language
                                  )

                                  return (
                                    <div key={vidx} className="flex items-center gap-2">
                                      <a
                                        href={linkObj.web}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium text-sm transition-colors flex-1"
                                      >
                                        {verseStr}
                                        <ExternalLink className="inline w-3 h-3 ml-1" />
                                      </a>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )
          }

          // Thematic: Show topics with verses
          if (plan.type === 'thematic') {
            return (
              <div className="space-y-6">
                {plan.sections?.map((section, idx) => (
                  <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-50 dark:from-purple-900 to-pink-50 dark:to-pink-900 px-4 py-3">
                      <h3 className="font-bold text-gray-800 dark:text-gray-300">{section.title?.[language] || section.title?.en}</h3>
                    </div>
                    <div className="p-4 space-y-2">
                      {section.topics?.map((topic, tidx) => (
                        <div key={tidx} className="text-sm text-gray-700 dark:text-gray-300">
                          <p className="font-medium">{topic.title?.[language] || topic.title?.en}</p>
                          {topic.verses && topic.verses.length > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{topic.verses.length} verse(s)</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          }

          return (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Unknown plan type: {plan.type}</p>
            </div>
          )
        })()}

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

        {selectedPlan === 'bible_overview' && (
          <div className="space-y-6">
            {/* Bible Overview Sections */}
            {bibleOverviewSections.map((section) => {
              const isExpanded = expandedSections[section.key] !== false // Default to expanded
              const readingsInSection = getBibleOverviewReadingsInSection(section.key)

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
                    className="w-full bg-gradient-to-r from-blue-50 dark:from-blue-900 to-indigo-50 dark:to-indigo-900 hover:from-blue-100 dark:hover:from-blue-800 hover:to-indigo-100 dark:hover:to-indigo-800 px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <ChevronDown
                        size={20}
                        className={`text-blue-600 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                      />
                      <h3 className="font-bold text-gray-800 dark:text-gray-300">{t(section.titleKey)}</h3>
                    </div>
                  </button>

                  {/* Readings in Section */}
                  {isExpanded && (
                    <div className="p-4 bg-white dark:bg-slate-800 space-y-2">
                      {readingsInSection.map((reading) => {
                        // Use unified progressTracking with chaptersIndex for O(1) lookup
                        const isCompleted = isReadingComplete(reading.book, reading.startChapter, reading.endChapter, chaptersIndex)
                        const book = bibleBooks.books[reading.book - 1]
                        const bookName = book?.name || `Book ${reading.book}`

                        // Build readable reference (e.g., "Genesis 12-15")
                        let referenceText = bookName
                        if (reading.startChapter === reading.endChapter) {
                          referenceText += ` ${reading.startChapter}`
                        } else {
                          referenceText += ` ${reading.startChapter}-${reading.endChapter}`
                        }

                        // Build JW.org link
                        const linkObj = buildLanguageSpecificWebLink(
                          reading.book,
                          reading.startChapter,
                          1,  // startVerse
                          null,  // endVerse (null = whole chapter)
                          language
                        )

                        return (
                          <div key={reading.id} className={`border rounded-lg overflow-hidden transition-colors ${isCompleted ? 'border-blue-300 bg-blue-50 dark:bg-blue-900 dark:border-blue-700' : 'border-gray-100 dark:border-gray-800'}`}>
                            <div className="flex items-center gap-2 p-2">
                              {/* Checkbox */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // Use unified progressTracking functions
                                  const newChaptersRead = isCompleted
                                    ? unmarkReading(chaptersRead, reading.book, reading.startChapter, reading.endChapter)
                                    : markReadingCompleteUnified(chaptersRead, reading.book, reading.startChapter, reading.endChapter, 'bible_overview')

                                  updateChaptersRead(newChaptersRead)
                                  const updated = { ...personalData, chaptersRead: newChaptersRead }
                                  savePersonalReadingData(updated)
                                  setPersonalData(updated)
                                }}
                                className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                                  isCompleted
                                    ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                                }`}
                              >
                                {isCompleted && <Check className="w-4 h-4 text-white" />}
                              </button>

                              {/* Reading Reference Link */}
                              <a
                                href={linkObj.web}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex-1 text-left px-2 py-1 font-medium text-sm transition-colors ${
                                  isCompleted
                                    ? 'text-blue-700 dark:text-blue-300 line-through'
                                    : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline'
                                }`}
                              >
                                {referenceText}
                                <ExternalLink className="inline w-3 h-3 ml-1" />
                              </a>
                            </div>
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

        {selectedPlan === 'chronological' && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-300 mb-2">{t('reading.plan_chronological')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-300">{t('reading.coming_soon')}</p>
          </div>
        )}

        {selectedPlan === 'oneyear' && (
          <div className="space-y-6">
            {/* One Year Sections */}
            {oneyearSections.map((section) => {
              const isExpanded = expandedSections[section.key] !== false // Default to expanded
              const readingsInSection = getOneyearReadingsInSection(section.key)

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
                    className="w-full bg-gradient-to-r from-green-50 dark:from-green-900 to-lime-50 dark:to-lime-900 hover:from-green-100 dark:hover:from-green-800 hover:to-lime-100 dark:hover:to-lime-800 px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <ChevronDown
                        size={20}
                        className={`text-green-600 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                      />
                      <h3 className="font-bold text-gray-800 dark:text-gray-300">{t(section.titleKey)}</h3>
                    </div>
                  </button>

                  {/* Readings in Section */}
                  {isExpanded && (
                    <div className="p-4 bg-white dark:bg-slate-800 space-y-2">
                      {readingsInSection.map((reading) => {
                        // BIBLE IN ONE YEAR: Use separate state (not chaptersRead)
                        const isCompleted = bibleInOneYearState?.completedReadings?.includes(reading.id) || false
                        const book = bibleBooks.books[reading.book - 1]
                        const bookName = book?.name || `Book ${reading.book}`

                        // Build readable reference (e.g., "Genesis 1-3" or "Psalms 119:64-176")
                        let referenceText = bookName
                        if (reading.startVerse && reading.endVerse) {
                          // Verse-specific reading like "Psalms 119:64-176"
                          referenceText += ` ${reading.startChapter}:${reading.startVerse}-${reading.endVerse}`
                        } else if (reading.startChapter === reading.endChapter) {
                          referenceText += ` ${reading.startChapter}`
                        } else {
                          referenceText += ` ${reading.startChapter}-${reading.endChapter}`
                        }

                        // Build JW.org link
                        const linkObj = buildLanguageSpecificWebLink(
                          reading.book,
                          reading.startChapter,
                          reading.startVerse || 1,  // startVerse
                          null,  // endVerse (null = whole chapter)
                          language
                        )

                        return (
                          <div key={reading.id} className={`border rounded-lg overflow-hidden transition-colors ${isCompleted ? 'border-green-300 bg-green-50 dark:bg-green-900 dark:border-green-700' : 'border-gray-100 dark:border-gray-800'}`}>
                            <div className="flex items-center gap-2 p-2">
                              {/* Checkbox */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // BIBLE IN ONE YEAR: Mark/unmark in separate state
                                  const newState = isCompleted
                                    ? unmarkBibleInOneYearReading(bibleInOneYearState, reading.id)
                                    : markBibleInOneYearReading(bibleInOneYearState, reading.id)

                                  setBibleInOneYearState(newState)
                                  setBibleInOneYearStats(calculateStats(newState))
                                }}
                                className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                                  isCompleted
                                    ? 'bg-green-600 dark:bg-green-500 border-green-600 dark:border-green-500'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                                }`}
                              >
                                {isCompleted && <Check className="w-4 h-4 text-white" />}
                              </button>

                              {/* Reading Reference Link */}
                              <a
                                href={linkObj.web}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex-1 text-left px-2 py-1 font-medium text-sm transition-colors ${
                                  isCompleted
                                    ? 'text-green-700 dark:text-green-300 line-through'
                                    : 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:underline'
                                }`}
                              >
                                {referenceText}
                                <ExternalLink className="inline w-3 h-3 ml-1" />
                              </a>
                            </div>
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

        {selectedPlan === 'thematic' && (
          <div className="space-y-6">
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
                        // Check if ALL readings in topic are complete (for visual indication only)
                        const isTopicFullyComplete = isThematicTopicCompleteUnified(topic, chaptersIndex)

                        return (
                          <div key={topic.id} className={`border rounded-lg overflow-hidden transition-colors ${isTopicFullyComplete ? 'border-purple-300 bg-purple-50 dark:bg-purple-900 dark:border-purple-700' : 'border-gray-100 dark:border-gray-800'}`}>
                            {/* Topic Header - Expandable Title (no checkbox) */}
                            <button
                              onClick={() => {
                                setExpandedTopics(prev => ({
                                  ...prev,
                                  [topic.id]: !prev[topic.id]
                                }))
                              }}
                              className={`w-full text-left px-3 py-2 flex items-center gap-2 transition-colors ${isTopicFullyComplete ? 'bg-purple-100 dark:bg-purple-800 hover:bg-purple-150 dark:hover:bg-purple-700' : 'bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                            >
                              {/* Chevron + Title */}
                              <ChevronRight
                                size={18}
                                className={`text-gray-600 dark:text-gray-300 transition-transform flex-shrink-0 ${isTopicExpanded ? 'rotate-90' : 'rotate-0'}`}
                              />
                              <span className={`font-medium text-sm text-left flex-1 ${isTopicFullyComplete ? 'text-purple-700 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                {t(topic.titleKey)}
                              </span>
                            </button>

                            {/* Topic Content - Scripture References with individual checkboxes */}
                            {isTopicExpanded && topic.readings && (
                              <div className={`border-t p-3 ${isTopicFullyComplete ? 'border-purple-200 dark:border-purple-600 bg-purple-50 dark:bg-purple-900' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-800'}`}>
                                <div className="space-y-2">
                                  {topic.readings.map((reading, idx) => {
                                    const formattedText = formatReadingForDisplay(reading, language)
                                    // Check if THIS reading is complete (auto-detection!)
                                    const isReadingComplete = isReadingSatisfied(reading, chaptersIndex)

                                    // Build JW.org finder URL with full verse/chapter range support
                                    const buildCompleteFinderUrl = (reading, lang) => {
                                      const localeMap = { de: 'X', en: 'E', es: 'S', it: 'I', fr: 'F' }
                                      const wtlocale = localeMap[lang] || 'E'

                                      let startRef, endRef

                                      if (reading.chapter) {
                                        // Single chapter format
                                        const chapter = reading.chapter.toString().padStart(3, '0')

                                        if (reading.verses && Array.isArray(reading.verses)) {
                                          // Scattered verses
                                          const startVerse = reading.verses[0].toString().padStart(3, '0')
                                          const endVerse = reading.verses[reading.verses.length - 1].toString().padStart(3, '0')
                                          startRef = `${reading.book.toString().padStart(2, '0')}${chapter}${startVerse}`
                                          endRef = `${reading.book.toString().padStart(2, '0')}${chapter}${endVerse}`
                                        } else {
                                          // Normal chapter or verse range
                                          const startVerse = (reading.startVerse || 1).toString().padStart(3, '0')
                                          const endVerse = (reading.endVerse || 999).toString().padStart(3, '0')
                                          startRef = `${reading.book.toString().padStart(2, '0')}${chapter}${startVerse}`
                                          endRef = `${reading.book.toString().padStart(2, '0')}${chapter}${endVerse}`
                                        }
                                      } else if (reading.startChapter) {
                                        // Chapter range format (e.g., Ruth 1-4 or Genesis 6:9-9:19)
                                        const startChapter = reading.startChapter.toString().padStart(3, '0')
                                        const endChapter = (reading.endChapter || reading.startChapter).toString().padStart(3, '0')
                                        const startVerse = (reading.startVerse || 1).toString().padStart(3, '0')
                                        const endVerse = (reading.endVerse || 999).toString().padStart(3, '0')

                                        startRef = `${reading.book.toString().padStart(2, '0')}${startChapter}${startVerse}`
                                        endRef = `${reading.book.toString().padStart(2, '0')}${endChapter}${endVerse}`
                                      }

                                      return `https://www.jw.org/finder?srcid=jwlshare&wtlocale=${wtlocale}&prefer=lang&bible=${startRef}-${endRef}&pub=nwtsty`
                                    }

                                    const webUrl = buildCompleteFinderUrl(reading, language)

                                    return (
                                      <div key={idx} className="flex items-center gap-2">
                                        {/* Checkbox for individual reading */}
                                        <div
                                          onClick={() => {
                                            // Mark/unmark single reading
                                            const newChaptersRead = isReadingComplete
                                              ? unmarkSingleReadingComplete(reading, chaptersRead)
                                              : markSingleReadingComplete(reading, chaptersRead, 'thematic')

                                            updateChaptersRead(newChaptersRead)
                                            const updated = { ...personalData, chaptersRead: newChaptersRead }
                                            savePersonalReadingData(updated)
                                            setPersonalData(updated)
                                          }}
                                          className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                                            isReadingComplete
                                              ? 'bg-purple-600 dark:bg-purple-500 border-purple-600 dark:border-purple-500'
                                              : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                                          }`}
                                        >
                                          {isReadingComplete && <Check className="w-3 h-3 text-white" />}
                                        </div>

                                        {/* Scripture link */}
                                        <a
                                          href={webUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium transition-colors ${isReadingComplete ? 'line-through opacity-60' : ''}`}
                                          title={`Open ${formattedText} on JW.org`}
                                        >
                                          {formattedText}
                                          <ExternalLink className="inline w-3 h-3 ml-1" />
                                        </a>
                                      </div>
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
                      // Batch unmark using unified progressTracking
                      let newChaptersRead = [...chaptersRead]
                      selectedChapters.forEach(chapter => {
                        newChaptersRead = removeChapter(newChaptersRead, selectedBook, chapter)
                      })

                      updateChaptersRead(newChaptersRead)
                      const updated = { ...personalData, chaptersRead: newChaptersRead }
                      setPersonalData(updated)
                      saveAndSync(updated)
                      setSelectedChapters(new Set())
                      setIsSelectMode(false)
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

      {/* Bible in One Year - Resume/Restart Modal */}
      {showBibleInOneYearModal && bibleInOneYearStats && (
        <BibleInOneYearModal
          stats={bibleInOneYearStats}
          onResume={handleBibleInOneYearResume}
          onRestart={handleBibleInOneYearRestart}
          onCancel={handleBibleInOneYearCancel}
        />
      )}
    </div>
  )
}

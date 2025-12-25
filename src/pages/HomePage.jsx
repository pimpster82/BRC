import React, { useState, useEffect } from 'react'
import { Calendar, BookOpen, Lightbulb, ExternalLink, Settings, X, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { t, getCurrentLanguage } from '../config/i18n'
import { getYeartextFromCache } from '../utils/storage'
import { loadYeartextFromFirebase } from '../utils/firebaseSchedules'
import { fetchYeartextFromWol, saveYeartextToCache, getYeartextFromCache as getCachedYeartext } from '../utils/yeartextFetcher'
import DailyTextCard from '../components/DailyTextCard'
import WeeklyReadingCard from '../components/WeeklyReadingCard'

// Yeartext cache for lazy loading
const yeartextCache = {}

/**
 * Load yeartext for a specific year
 * Tries multiple sources:
 * 1. In-memory cache (fastest)
 * 2. LocalStorage cache (from Firebase save)
 * 3. Dynamic import from data files (legacy)
 */
const loadYeartext = async (year) => {
  // Check in-memory cache first
  if (yeartextCache[year]) {
    return yeartextCache[year]
  }

  // Check localStorage cache (saved from Firebase)
  try {
    const cachedYeartext = getYeartextFromCache(year)
    if (cachedYeartext) {
      yeartextCache[year] = cachedYeartext
      return cachedYeartext
    }
  } catch (error) {
    console.warn(`Error loading yeartext from cache: ${error.message}`)
  }

  // Try to load dynamically from data files (legacy/fallback)
  try {
    const module = await import(`../../data/yeartext-${year}.js`)
    const yeartext = module[`yeartext${year}`] || module.default
    yeartextCache[year] = yeartext
    return yeartext
  } catch (error) {
    console.warn(`⚠️ Yeartext for year ${year} not found in cache or data files`)
    return null
  }
}


function HomePage() {
  const navigate = useNavigate()
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [testDate, setTestDate] = useState(null)
  const [yeartext, setYeartext] = useState(null)
  const [isUpdatingYeartext, setIsUpdatingYeartext] = useState(false)
  const [translationAvailable, setTranslationAvailable] = useState(true)
  const [currentLanguage, setCurrentLanguage] = useState('en')
  const [showYeartext, setShowYeartext] = useState(true)

  // Load test date from localStorage
  useEffect(() => {
    const savedTestDate = localStorage.getItem('testDate')
    if (savedTestDate) {
      setTestDate(savedTestDate)
    }
  }, [])

  // Load display settings from localStorage
  useEffect(() => {
    const savedShowYeartext = localStorage.getItem('settings_showYeartext')
    setShowYeartext(savedShowYeartext !== 'false') // Default: true
  }, [])

  // Load and update language when app language changes
  useEffect(() => {
    const newLanguage = getCurrentLanguage()
    setCurrentLanguage(newLanguage)
  }, [])

  // Load yeartext for current year and language from Firebase with fallback to legacy data
  useEffect(() => {
    const loadYeartextAsync = async () => {
      const currentYear = getCurrentDate().getFullYear()
      const language = getCurrentLanguage()

      console.log(`📖 Loading yeartext for year ${currentYear}, language: ${language}`)

      // Try to load from Firebase first (language param gets mapped inside the function)
      const firebaseResult = await loadYeartextFromFirebase(currentYear, language)

      if (firebaseResult.success && firebaseResult.yeartext) {
        console.log(`✓ Loaded from Firebase:`, firebaseResult.yeartext)
        setYeartext(firebaseResult.yeartext)
        setTranslationAvailable(true)
      } else {
        console.warn(`⚠️ Firebase load failed, falling back to legacy data`)
        // Fallback to legacy data files for offline/development
        let legacyYeartext = await loadYeartext(currentYear)
        if (legacyYeartext) {
          setYeartext(legacyYeartext)
          // Check if translation is available in legacy format
          if (legacyYeartext.translations && legacyYeartext.translations[language]) {
            setTranslationAvailable(legacyYeartext.translations[language].fetched !== false)
          } else {
            setTranslationAvailable(false)
          }
        }
      }
    }
    loadYeartextAsync()
  }, [testDate, currentLanguage])

  // Handle yeartext update from wol.jw.org
  const handleUpdateYeartext = async () => {
    const currentYear = getCurrentDate().getFullYear()
    const language = getCurrentLanguage()

    setIsUpdatingYeartext(true)

    try {
      // Fetch from wol.jw.org
      const fetched = await fetchYeartextFromWol(currentYear, language)

      if (fetched) {
        // Update the yeartext data
        const updatedYeartext = { ...yeartext }
        if (!updatedYeartext.translations) {
          updatedYeartext.translations = {}
        }
        updatedYeartext.translations[language] = {
          ...fetched,
          fetched: true
        }

        // Save to cache
        saveYeartextToCache(currentYear, fetched, language)

        setYeartext(updatedYeartext)
        setTranslationAvailable(true)
      }
    } catch (error) {
      console.error('Error updating yeartext:', error)
    } finally {
      setIsUpdatingYeartext(false)
    }
  }

  // Get today's date or test date
  const getCurrentDate = () => {
    if (testDate) {
      return new Date(testDate)
    }
    return new Date()
  }

  // Get today's date in German format
  const getFormattedDate = () => {
    const date = getCurrentDate()
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    const formatted = date.toLocaleDateString('de-DE', options)
    // Capitalize first letter
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  }

  const handleDateChange = (newDate) => {
    setTestDate(newDate)
    localStorage.setItem('testDate', newDate)
    // Force component re-render by triggering state update
    setShowDatePicker(false)
  }

  const handleResetDate = () => {
    setTestDate(null)
    localStorage.removeItem('testDate')
    setShowDatePicker(false)
    // State update will trigger re-render with new date
  }

  // Format date for input (YYYY-MM-DD)
  const getInputDate = () => {
    const date = getCurrentDate()
    return date.toISOString().split('T')[0]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Yeartext Banner - Overlay Style */}
        {yeartext && showYeartext && (
          <div className="pt-4 pb-2">
            <div className="relative">
              <div className={`text-center px-4 py-3 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 rounded-xl backdrop-blur-sm border rounded-xl backdrop-blur-sm shadow-sm ${!translationAvailable ? 'border-yellow-300' : 'border-indigo-200/30'}`}>
                <p className="text-sm font-semibold text-indigo-900/80 mb-1">
                  {yeartext.year} {t('home.yeartext')}
                </p>

                {/* Display yeartext in current language */}
                <p className="text-lg font-bold text-indigo-900 leading-snug mb-1">
                  "{yeartext.text}"
                </p>
                <p className="text-sm text-indigo-700/70 font-medium mb-2">
                  — {yeartext.scripture}
                </p>

                {/* Update button if translation not available */}
                {!translationAvailable && (
                  <button
                    onClick={handleUpdateYeartext}
                    disabled={isUpdatingYeartext}
                    className="text-xs px-3 py-1 bg-yellow-400 text-yellow-900 rounded hover:bg-yellow-500 disabled:opacity-50 transition-colors flex items-center gap-1 mx-auto"
                  >
                    <RefreshCw className={`w-3 h-3 ${isUpdatingYeartext ? 'animate-spin' : ''}`} />
                    {isUpdatingYeartext ? t('common.updating') : t('home.update_yeartext')}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header with Date and Settings */}
        <div className="mb-4 pt-2">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="p-1 hover:bg-white rounded transition-colors"
                title="Datum ändern (Test)"
              >
                <Calendar className={`w-5 h-5 ${testDate ? 'text-orange-600' : ''}`} />
              </button>
              {t('nav.today')} - {getFormattedDate()}
            </h1>
            <button
              onClick={() => navigate('/settings')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
              aria-label="Einstellungen"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Date Picker Dropdown */}
          {showDatePicker && (
            <div className="mt-3 p-4 bg-white rounded-lg border border-gray-300 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">{t('datepicker.title')}</h3>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <input
                type="date"
                value={getInputDate()}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              />

              {testDate && (
                <button
                  onClick={handleResetDate}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                >
                  {t('datepicker.reset')}
                </button>
              )}

              <p className="text-xs text-gray-500 mt-2">
                {t('datepicker.warning')}
              </p>
            </div>
          )}
        </div>

        {/* Main Content - Card Layout */}
        <div className="space-y-4">
          {/* Daily Text Card */}
          <DailyTextCard />

          {/* Weekly Reading */}
          <WeeklyReadingCard />

          {/* Personal Reading - Placeholder */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
            <h2 className="font-semibold text-green-900 mb-3 text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {t('home.personal_reading')}
            </h2>

            <p className="text-sm text-gray-700 mb-2 italic">
              {t('home.reading_plan')}
            </p>

            <div className="flex items-center gap-1 mb-3">
              <Lightbulb className="w-3 h-3 text-green-700" />
              <p className="text-sm text-gray-700">
                <span className="text-xs text-gray-600">{t('home.next_reading')}:</span> <span className="font-medium">Genesis 20-22</span>
              </p>
            </div>

            <div className="pt-3 border-t border-green-200 flex items-center justify-between">
              <p className="text-xs text-green-700">{t('home.day_progress', null, {current: 45, total: 365, percent: 12})}</p>
              <button className="text-sm text-green-900 font-medium flex items-center gap-1 hover:text-green-700">
                <ExternalLink className="w-4 h-4" />
                {t('home.open')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage

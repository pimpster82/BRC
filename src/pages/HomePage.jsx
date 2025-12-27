import React, { useState, useEffect, useRef } from 'react'
import { Calendar, BookOpen, Lightbulb, ExternalLink, Settings, X, RefreshCw, LogOut, LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { t, getCurrentLanguage } from '../config/i18n'
import { getYeartextFromCache, loadProgressFromFirebase } from '../utils/storage'
import { loadYeartextFromFirebase } from '../utils/firebaseSchedules'
import { fetchYeartextFromWol, saveYeartextToCache, getYeartextFromCache as getCachedYeartext } from '../utils/yeartextFetcher'
import DailyTextCard from '../components/DailyTextCard'
import WeeklyReadingCard from '../components/WeeklyReadingCard'
import PersonalReadingCard from '../components/PersonalReadingCard'

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
  const { logout, currentUser } = useAuth()
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [testDate, setTestDate] = useState(null)
  const [yeartext, setYeartext] = useState(null)
  const [isUpdatingYeartext, setIsUpdatingYeartext] = useState(false)
  const [translationAvailable, setTranslationAvailable] = useState(true)
  const [currentLanguage, setCurrentLanguage] = useState('en')
  const [showYeartext, setShowYeartext] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Pull-to-Refresh state
  const [isPulling, setIsPulling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const touchStartY = useRef(0)
  const contentRef = useRef(null)
  const PULL_THRESHOLD = 100  // pixels needed to trigger refresh

  // Handle pull-to-refresh
  const handleTouchStart = (e) => {
    if (contentRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY
      setIsPulling(true)
    }
  }

  const handleTouchMove = (e) => {
    if (!isPulling || isRefreshing) return

    const currentY = e.touches[0].clientY
    const distance = currentY - touchStartY.current

    if (distance > 0) {
      setPullDistance(distance)    }
  }

  const handleTouchEnd = async () => {
    if (!isPulling || isRefreshing) return

    setIsPulling(false)

    if (pullDistance >= PULL_THRESHOLD && currentUser?.uid) {
      setIsRefreshing(true)
      try {
        console.log('🔄 Reloading progress from Firebase...')
        console.log(`   User: ${currentUser.email}`)
        console.log(`   Before sync - weeklyReading_current:`, localStorage.getItem('weeklyReading_current'))

        const result = await loadProgressFromFirebase(currentUser.uid)

        console.log('✓ Progress reloaded successfully')
        console.log(`   After sync - weeklyReading_current:`, localStorage.getItem('weeklyReading_current'))
        console.log(`   Merged weekly data:`, result?.weekly)

        // Trigger WeeklyReadingCard update
        window.dispatchEvent(new Event('weeklyReadingUpdated'))
      } catch (error) {
        console.error('✗ Failed to reload progress:', error)
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }

  // Handle auth button click
  const handleAuthClick = () => {
    if (currentUser) {
      // Show logout confirmation modal
      setShowLogoutConfirm(true)
    } else {
      // Not logged in - go to login page
      navigate('/login')
    }
  }

  // Confirm logout
  const handleLogoutConfirmed = async () => {
    try {
      setIsLoggingOut(true)
      setShowLogoutConfirm(false)
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
    }
  }

  // Cancel logout
  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false)
  }

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

  // Get today's date in language-specific format
  const getFormattedDate = () => {
    const date = getCurrentDate()
    const language = getCurrentLanguage()
    // Map app language codes to Intl locale codes
    const localeMap = {
      de: 'de-DE',
      en: 'en-US',
      es: 'es-ES',
      it: 'it-IT',
      fr: 'fr-FR'
    }
    const locale = localeMap[language] || 'en-US'
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    const formatted = date.toLocaleDateString(locale, options)
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
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 dark:from-slate-800 to-indigo-50 dark:to-slate-700 dark:from-slate-900 dark:to-slate-800 p-4 overflow-y-auto"
      ref={contentRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-Refresh Indicator */}
      {(isPulling || isRefreshing) && (
        <div
          className="flex justify-center items-center transition-all duration-300"
          style={{
            height: Math.min(pullDistance, 80) + 'px',
            opacity: Math.min(pullDistance / PULL_THRESHOLD, 1)
          }}
        >
          <div className="flex flex-col items-center">
            <RefreshCw
              className={`w-6 h-6 text-indigo-600 dark:text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`}
              style={{
                transform: isRefreshing ? 'none' : `rotate(${Math.min(pullDistance / 2, 180)}deg)`
              }}
            />
            {!isRefreshing && pullDistance >= PULL_THRESHOLD && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">Release to reload</p>
            )}
            {isRefreshing && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">Reloading...</p>
            )}
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto">
        {/* Yeartext Banner - Overlay Style */}
        {yeartext && showYeartext && (
          <div className="pt-4 pb-2">
            <div className="relative">
              <div className={`text-center px-4 py-3 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 rounded-xl backdrop-blur-sm border rounded-xl backdrop-blur-sm shadow-sm ${!translationAvailable ? 'border-yellow-300 dark:border-yellow-600' : 'border-indigo-200/30 dark:border-indigo-800/30'}`}>
                <p className="text-sm font-semibold text-indigo-900/80 dark:text-indigo-100/80 mb-1">
                  {yeartext.year} {t('home.yeartext')}
                </p>

                {/* Display yeartext in current language */}
                <p className="text-lg font-bold text-indigo-900 dark:text-indigo-100 leading-snug mb-1">
                  "{yeartext.text}"
                </p>
                <p className="text-sm text-indigo-700/70 dark:text-indigo-300/70 font-medium mb-2">
                  — {yeartext.scripture}
                </p>

                {/* Update button if translation not available */}
                {!translationAvailable && (
                  <button
                    onClick={handleUpdateYeartext}
                    disabled={isUpdatingYeartext}
                    className="text-xs px-3 py-1 bg-yellow-400 dark:bg-yellow-700 text-yellow-900 dark:text-yellow-100 rounded hover:bg-yellow-50 dark:bg-yellow-9000 dark:hover:bg-yellow-600 disabled:opacity-50 transition-colors flex items-center gap-1 mx-auto"
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
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-300 flex items-center gap-2">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded transition-colors"
                title="Datum ändern (Test)"
              >
                <Calendar className={`w-5 h-5 ${testDate ? 'text-orange-600 dark:text-orange-400' : ''}`} />
              </button>
              {getFormattedDate()}
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/settings')}
                className="p-2 text-gray-600 dark:text-gray-400 dark:text-gray-300 hover:text-gray-900 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Einstellungen"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={handleAuthClick}
                disabled={isLoggingOut}
                className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                  currentUser
                    ? 'text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-white dark:hover:bg-slate-800'
                    : 'text-gray-600 dark:text-gray-300 hover:text-green-600 hover:bg-white dark:hover:bg-slate-800'
                }`}
                aria-label={currentUser ? 'Logout' : 'Login'}
                title={currentUser ? 'Abmelden' : 'Anmelden'}
              >
                {currentUser ? <LogOut className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Date Picker Dropdown */}
          {showDatePicker && (
            <div className="mt-3 p-4 bg-white rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800 dark:text-gray-300">{t('datepicker.title')}</h3>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 dark:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <input
                type="date"
                value={getInputDate()}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              />

              {testDate && (
                <button
                  onClick={handleResetDate}
                  className="w-full bg-gray-100 dark:bg-slate-700 dark:bg-slate-800 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-sm"
                >
                  {t('datepicker.reset')}
                </button>
              )}

              <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-300 mt-2">
                {t('datepicker.warning')}
              </p>
            </div>
          )}

          {/* Logout Confirmation Modal */}
          {showLogoutConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg max-w-sm w-full p-6">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-300 mb-4">Abmelden?</h2>

                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-300 mb-2">Angemeldet als:</p>
                  <p className="text-base font-medium text-gray-800 dark:text-gray-300 break-all">
                    {currentUser?.email}
                  </p>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-300 mb-6">
                  Dein Fortschritt wird automatisch synchronisiert.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleLogoutCancel}
                    className="flex-1 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-300 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-slate-600 dark:bg-slate-600 transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleLogoutConfirmed}
                    disabled={isLoggingOut}
                    className="flex-1 bg-red-600 dark:bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 dark:hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {isLoggingOut ? 'Abmelden...' : 'Abmelden'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content - Card Layout */}
        <div className="space-y-4">
          {/* Daily Text Card */}
          <DailyTextCard />

          {/* Weekly Reading */}
          <WeeklyReadingCard />

          {/* Personal Reading */}
          <PersonalReadingCard />
        </div>
      </div>
    </div>
  )
}

export default HomePage

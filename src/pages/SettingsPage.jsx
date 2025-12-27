import React, { useState, useEffect } from 'react'
import { ArrowLeft, Globe, Calendar, Bell, RotateCcw, ChevronDown, ChevronRight, BookOpen, Download, RefreshCw, Eye, Smartphone, Copy, Moon, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLoading } from '../context/LoadingContext'
import { SUPPORTED_LANGUAGES, getCurrentLanguage, setCurrentLanguage } from '../config/languages'
import { fetchScheduleFromWOL, fetchYeartextFromWOL } from '../utils/scheduleUpdater'
import { saveScheduleToFirebase, saveYeartextToFirebase } from '../utils/firebaseSchedules'
import { getOrCreateDeviceId, getDeviceName, setDeviceName, getDeviceInfo } from '../utils/deviceId'
import { t } from '../config/i18n'
import { APP_VERSION, BUILD_INFO, LINKED_PRODUCTION_VERSION } from '../config/version'
import { useTheme } from '../context/ThemeContext'
import bibleBooks from '../../data/bible-books-en.json'

const SettingsPage = () => {
  const navigate = useNavigate()
  const { showLoading, hideLoading } = useLoading()
  const { theme, setThemePreference } = useTheme()

  // Expanded sections
  const [expandedSection, setExpandedSection] = useState(null)
  const [expandedReadingPlanDropdown, setExpandedReadingPlanDropdown] = useState(false)

  // Language
  const [language, setLanguage] = useState(getCurrentLanguage())

  // Display Settings
  const [showYeartext, setShowYeartext] = useState(
    localStorage.getItem('settings_showYeartext') !== 'false' // Default: true
  )

  // Weekly Reading Settings
  const [meetingDay, setMeetingDay] = useState(
    localStorage.getItem('settings_meetingDay') || '1' // Monday default
  )

  // Personal Reading Settings
  const [readingPlan, setReadingPlan] = useState(
    localStorage.getItem('settings_readingPlan') || 'free'
  )

  // Notifications
  const [dailyReminder, setDailyReminder] = useState(
    localStorage.getItem('settings_dailyReminder') === 'true'
  )
  const [reminderTime, setReminderTime] = useState(
    localStorage.getItem('settings_reminderTime') || '08:00'
  )

  // Schedule Update
  const [scheduleYear, setScheduleYear] = useState(new Date().getFullYear() + 1)
  const [scheduleStatus, setScheduleStatus] = useState(null) // 'loading', 'success', 'error'
  const [scheduleMessage, setScheduleMessage] = useState('')

  // Device Info
  const [deviceId, setDeviceId] = useState(getOrCreateDeviceId())
  const [deviceName, setDeviceNameState] = useState(getDeviceName())
  const [isEditingDeviceName, setIsEditingDeviceName] = useState(false)
  const [tempDeviceName, setTempDeviceName] = useState(getDeviceName())
  const [copySuccess, setCopySuccess] = useState(false)


  const handleLanguageChange = (newLanguage) => {
    // Clear yeartext cache when switching languages so the new language is loaded fresh
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.includes('bibleCompanion_yeartext')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))

    setCurrentLanguage(newLanguage)
    setLanguage(newLanguage)
    // Navigate to home instead of reload to preserve router context
    setTimeout(() => navigate('/'), 100)
  }

  const handleShowYeartext = () => {
    const newValue = !showYeartext
    setShowYeartext(newValue)
    localStorage.setItem('settings_showYeartext', newValue.toString())
  }

  const handleMeetingDayChange = (day) => {
    setMeetingDay(day)
    localStorage.setItem('settings_meetingDay', day)
  }

  const handleReadingPlanChange = (plan) => {
    setReadingPlan(plan)
    localStorage.setItem('settings_readingPlan', plan)
    setExpandedReadingPlanDropdown(false)
  }

  const handleDailyReminderToggle = () => {
    const newValue = !dailyReminder
    setDailyReminder(newValue)
    localStorage.setItem('settings_dailyReminder', newValue.toString())
  }

  const handleReminderTimeChange = (time) => {
    setReminderTime(time)
    localStorage.setItem('settings_reminderTime', time)
  }

  const handleFetchSchedule = async () => {
    setScheduleStatus('loading')
    setScheduleMessage('')
    showLoading(t('settings.fetching_schedule'))

    try {
      // Fetch both schedule and yeartext from JW.org
      const [scheduleResult, yeartextResult] = await Promise.all([
        fetchScheduleFromWOL(scheduleYear),
        fetchYeartextFromWOL(scheduleYear)
      ])

      if (!scheduleResult.success) {
        throw new Error(scheduleResult.error)
      }

      // Save schedule to Firebase
      const scheduleSaveResult = await saveScheduleToFirebase(scheduleYear, scheduleResult.schedule)

      // Check if schedule save was successful
      if (!scheduleSaveResult.success) {
        throw new Error(`Fehler beim Speichern des Leseplans: ${scheduleSaveResult.error}`)
      }

      // Save yeartext in ALL 5 languages to Firebase
      // English gets the fetched data, other languages are empty placeholders for manual translation
      const yeartextSavePromises = []

      if (yeartextResult.success && yeartextResult.yeartext) {
        // Save English with fetched data
        yeartextSavePromises.push(
          saveYeartextToFirebase(scheduleYear, yeartextResult.yeartext, 'english')
        )

        // Save same English data for all other languages (can be manually edited later)
        const otherLanguages = ['de', 'es', 'it', 'fr']
        otherLanguages.forEach(lang => {
          yeartextSavePromises.push(
            saveYeartextToFirebase(scheduleYear, yeartextResult.yeartext, lang)
          )
        })
      }

      await Promise.all(yeartextSavePromises)

      setScheduleStatus('success')

      // Build success message
      let message = `✅ Leseplan für ${scheduleYear} wurde erfolgreich gespeichert!\n\n`

      // Add schedule info
      message += `📚 Leseplan: ${scheduleResult.schedule.length} Wochen geladen\n`

      // Add yeartext info if available
      if (yeartextResult.success && yeartextResult.yeartext) {
        message += `✓ Jahrestext (English): ${yeartextResult.yeartext.scripture}\n`
        message += `⚠️ Andere Sprachen sind leer - bitte manuell in Firebase füllen\n`
        message += `📝 Übersetzungen: de, es, it, fr`
      }

      setScheduleMessage(message)
    } catch (error) {
      console.error('Schedule fetch error:', error)
      setScheduleStatus('error')
      setScheduleMessage(`❌ Fehler beim Abrufen des Leseplans: ${error.message}`)
    } finally {
      hideLoading()
    }
  }


  const handleResetAll = () => {
    if (window.confirm(t('settings.reset_confirm'))) {
      // Reset to defaults
      localStorage.removeItem('settings_showYeartext')
      localStorage.removeItem('settings_meetingDay')
      localStorage.removeItem('settings_readingPlan')
      localStorage.removeItem('settings_dailyReminder')
      localStorage.removeItem('settings_reminderTime')
      localStorage.removeItem('app_language')
      localStorage.removeItem('settings_theme')

      // Navigate to home instead of reload to preserve router context
      setTimeout(() => navigate('/'), 100)
    }
  }

  const handleResetProgress = () => {
    if (window.confirm(t('settings.reset_progress_confirm'))) {
      // Reset all reading progress data
      localStorage.removeItem('bibleCompanion_dailyText') // Daily text streak
      localStorage.removeItem('weeklyReading_current') // Current week progress
      localStorage.removeItem('personalReading_progress') // Personal reading progress

      // Clear any chapter/verse data
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('chapter') || key.includes('verse') || key.includes('reading'))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))

      // Success message and navigate home instead of reload
      alert(t('settings.reset_success'))
      setTimeout(() => navigate('/'), 100)
    }
  }

  const handleClearCache = () => {
    if (window.confirm('Cache wirklich löschen? (Schedules und Yeartexts werden neu von Firebase geladen)')) {
      // Clear all cached schedules and yeartexts
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('bibleCompanion_schedule') || key.includes('bibleCompanion_yeartext'))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
      alert('✓ Cache gelöscht!')
    }
  }

  // Device Info Handlers
  const handleCopyDeviceId = () => {
    navigator.clipboard.writeText(deviceId)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  const handleSaveDeviceName = () => {
    if (setDeviceName(tempDeviceName)) {
      setDeviceNameState(tempDeviceName)
      setIsEditingDeviceName(false)
    }
  }

  const handleCancelEditDeviceName = () => {
    setTempDeviceName(deviceName)
    setIsEditingDeviceName(false)
  }

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const getLanguageName = () => {
    return SUPPORTED_LANGUAGES.find(l => l.code === language)?.name || 'Deutsch'
  }

  const getMeetingDayName = () => {
    return weekDays.find(d => d.value === meetingDay)?.label || t('weekday.monday')
  }

  const getReadingPlanName = () => {
    return readingPlans.find(p => p.value === readingPlan)?.label || t('reading.plan_free')
  }

  const weekDays = [
    { value: '0', label: t('weekday.sunday') },
    { value: '1', label: t('weekday.monday') },
    { value: '2', label: t('weekday.tuesday') },
    { value: '3', label: t('weekday.wednesday') },
    { value: '4', label: t('weekday.thursday') },
    { value: '5', label: t('weekday.friday') },
    { value: '6', label: t('weekday.saturday') }
  ]

  const readingPlans = [
    { value: 'free', label: t('reading.plan_free') },
    { value: 'chronological', label: t('reading.plan_chronological') },
    { value: 'oneyear', label: t('reading.plan_oneyear') },
    { value: 'thematic', label: t('reading.plan_thematic') }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 dark:from-slate-800 to-indigo-50 dark:to-slate-700 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 pt-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('nav.back')}
          </button>

          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-300 mb-2">
            {t('settings.title')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-300">
            {t('settings.subtitle')}
          </p>
        </div>

        {/* Language Settings */}
        <div className="card bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 mb-3">
          <button
            onClick={() => toggleSection('language')}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="font-semibold text-gray-800 dark:text-gray-300">{t('settings.language')}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-300">{getLanguageName()}</span>
              {expandedSection === 'language' ? (
                <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
              )}
            </div>
          </button>

          {expandedSection === 'language' && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-2">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      language === lang.code
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 hover:border-gray-300 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="font-medium">{lang.name}</span>
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-300 mt-3">
                {t('settings.language_note')}
              </p>
            </div>
          )}
        </div>

        {/* Display Settings */}
        <div className="card bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 mb-3">
          <button
            onClick={() => toggleSection('display')}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="font-semibold text-gray-800 dark:text-gray-300">{t('settings.display')}</h2>
            </div>
            {expandedSection === 'display' ? (
              <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
            )}
          </button>

          {expandedSection === 'display' && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
              {/* Show Yeartext Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings.show_yeartext')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-300">{t('settings.show_yeartext_note')}</p>
                </div>
                <button
                  onClick={handleShowYeartext}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showYeartext ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showYeartext ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Theme Preference */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Farbschema</p>
                <div className="flex gap-2">
                  {[
                    { value: 'light', label: '☀️ Hell' },
                    { value: 'dark', label: '🌙 Dunkel' },
                    { value: 'system', label: '💻 System' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setThemePreference(option.value)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        theme === option.value
                          ? 'bg-blue-600 dark:bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-300 mt-1">Wähle dein bevorzugtes Farbschema</p>
              </div>
            </div>
          )}
        </div>

        {/* Weekly Reading Settings */}
        <div className="card bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 mb-3">
          <button
            onClick={() => toggleSection('weekly')}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="font-semibold text-gray-800 dark:text-gray-300">{t('settings.weekly_reading')}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-300">{getMeetingDayName()}</span>
              {expandedSection === 'weekly' ? (
                <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
              )}
            </div>
          </button>

          {expandedSection === 'weekly' && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* Meeting Day */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.meeting_day')}
                </label>
                <select
                  value={meetingDay}
                  onChange={(e) => handleMeetingDayChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {weekDays.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-300">
                  {t('settings.meeting_day_note')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Personal Reading Plan */}
        <div className="card bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 mb-3">
          <button
            onClick={() => toggleSection('personal')}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="font-semibold text-gray-800 dark:text-gray-300">{t('settings.personal_plan')}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-300">{getReadingPlanName()}</span>
              {expandedSection === 'personal' ? (
                <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
              )}
            </div>
          </button>

          {expandedSection === 'personal' && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  {t('settings.reading_plan')}
                </label>

                {/* Dropdown Trigger */}
                <button
                  onClick={() => setExpandedReadingPlanDropdown(!expandedReadingPlanDropdown)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300 rounded-lg text-left text-gray-700 dark:text-gray-300 font-medium flex items-center justify-between hover:border-gray-400 transition-colors"
                >
                  {readingPlans.find(p => p.value === readingPlan)?.label || t('reading.plan_free')}
                  <ChevronDown className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform ${expandedReadingPlanDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {expandedReadingPlanDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300 rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      {readingPlans.map((plan) => (
                        <button
                          key={plan.value}
                          onClick={() => handleReadingPlanChange(plan.value)}
                          className={`w-full text-left px-3 py-2 transition-all ${
                            readingPlan === plan.value
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-medium'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          {plan.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-300 mt-3">
                  {t('settings.reading_plan_note')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="card bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 mb-3">
          <button
            onClick={() => toggleSection('notifications')}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="font-semibold text-gray-800 dark:text-gray-300">{t('settings.notifications')}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-300">
                {dailyReminder ? `An (${reminderTime})` : 'Aus'}
              </span>
              {expandedSection === 'notifications' ? (
                <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
              )}
            </div>
          </button>

          {expandedSection === 'notifications' && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* Daily Reminder Toggle */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings.daily_reminder')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-300">{t('settings.for_daily_text')}</p>
                </div>
                <button
                  onClick={handleDailyReminderToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    dailyReminder ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      dailyReminder ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Reminder Time */}
              {dailyReminder && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('settings.reminder_time')}
                  </label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => handleReminderTimeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-300">
                {t('settings.reminders_coming')}
              </p>
            </div>
          )}
        </div>

        {/* Schedule Update */}
        <div className="card bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 mb-3">
          <button
            onClick={() => toggleSection('schedule')}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="font-semibold text-gray-800 dark:text-gray-300">{t('settings.schedule_update')}</h2>
            </div>
            {expandedSection === 'schedule' ? (
              <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
            )}
          </button>

          {expandedSection === 'schedule' && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-300 mb-3">
                Lade den wöchentlichen Leseplan <strong>und Jahrestext</strong> für ein neues Jahr von JW.org herunter.
              </p>

              {/* Year Input */}
              <div className="space-y-2 mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.schedule_year')}
                </label>
                <input
                  type="number"
                  value={scheduleYear}
                  onChange={(e) => setScheduleYear(parseInt(e.target.value))}
                  min={new Date().getFullYear()}
                  max={new Date().getFullYear() + 5}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Fetch Button */}
              <button
                onClick={handleFetchSchedule}
                disabled={scheduleStatus === 'loading'}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  scheduleStatus === 'loading'
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                }`}
              >
                {scheduleStatus === 'loading' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {t('settings.downloading')}
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    {t('settings.download_schedule')}
                  </>
                )}
              </button>

              {/* Status Message */}
              {scheduleMessage && (
                <div
                  className={`mt-3 p-3 rounded-lg text-sm whitespace-pre-line ${
                    scheduleStatus === 'success'
                      ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-100 border border-green-200 dark:border-green-700'
                      : scheduleStatus === 'error'
                      ? 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-100 border border-red-200 dark:border-red-700'
                      : 'bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-100 border border-blue-200 dark:border-blue-700'
                  }`}
                >
                  {scheduleMessage}
                </div>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-300 mt-3 space-y-1">
                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-300">
                  {t('settings.schedule_loading')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Reset All */}
        <div className="card bg-white dark:bg-slate-900 border border-red-200 dark:border-red-700 mb-4">
          <button
            onClick={() => toggleSection('reset')}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h2 className="font-semibold text-gray-800 dark:text-gray-300">{t('settings.reset')}</h2>
            </div>
            {expandedSection === 'reset' ? (
              <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
            )}
          </button>

          {expandedSection === 'reset' && (
            <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-700 space-y-3">
              {/* Reset Settings */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.reset_settings')}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-300 mb-2">
                  {t('settings.reset_settings_note')}
                </p>
                <button
                  onClick={handleResetAll}
                  className="w-full bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100 py-2 px-4 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-800 transition-colors border border-red-200 dark:border-red-700"
                >
                  {t('settings.reset_settings_button')}
                </button>
              </div>

              {/* Clear Cache */}
              <div className="pt-3 border-t border-red-200 dark:border-red-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cache löschen</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-300 mb-2">
                  Löscht gecachte Schedules und Yeartexts. Diese werden beim nächsten Laden neu von Firebase geladen.
                </p>
                <button
                  onClick={handleClearCache}
                  className="w-full bg-orange-50 dark:bg-orange-900 text-orange-700 dark:text-orange-100 py-2 px-4 rounded-lg font-medium hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors border border-orange-200"
                >
                  Cache löschen
                </button>
              </div>

              {/* Reset Progress */}
              <div className="pt-3 border-t border-red-200 dark:border-red-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.reset_progress')}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-300 mb-2">
                  {t('settings.reset_progress_note')}
                </p>
                <button
                  onClick={handleResetProgress}
                  className="w-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 py-2 px-4 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-800 transition-colors border border-red-300 dark:border-red-600"
                >
                  {t('settings.reset_progress_button')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Device Info */}
        <div className="card bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-700 mb-4">
          <button
            onClick={() => toggleSection('device')}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="font-semibold text-gray-800 dark:text-gray-300">Device Info</h2>
            </div>
            {expandedSection === 'device' ? (
              <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
            )}
          </button>

          {expandedSection === 'device' && (
            <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700 space-y-3">
              {/* Device ID */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Device ID</p>
                <div className="flex gap-2">
                  <code className="flex-1 text-xs bg-gray-100 dark:bg-slate-700 p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300 font-mono overflow-auto">
                    {deviceId.substring(0, 12)}...
                  </code>
                  <button
                    onClick={handleCopyDeviceId}
                    className={`px-3 py-2 rounded text-sm font-medium flex items-center gap-1 transition-colors ${
                      copySuccess
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700'
                        : 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800'
                    }`}
                  >
                    <Copy className="w-4 h-4" />
                    {copySuccess ? 'Kopiert!' : 'Kopieren'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-300">Eindeutige Geräte-ID für Cross-Device-Synchronisation</p>
              </div>

              {/* Device Name */}
              <div className="pt-3 border-t border-blue-200 dark:border-blue-700 space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Device Name</p>
                {!isEditingDeviceName ? (
                  <div className="flex gap-2">
                    <p className="flex-1 text-sm bg-gray-50 p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300">
                      {deviceName}
                    </p>
                    <button
                      onClick={() => setIsEditingDeviceName(true)}
                      className="px-3 py-2 rounded text-sm font-medium bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-100 border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                    >
                      Bearbeiten
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={tempDeviceName}
                      onChange={(e) => setTempDeviceName(e.target.value)}
                      className="w-full text-sm px-3 py-2 border border-blue-300 dark:border-blue-600 dark:border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="z.B. Mein Handy"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveDeviceName}
                        className="flex-1 px-3 py-2 rounded text-sm font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                      >
                        Speichern
                      </button>
                      <button
                        onClick={handleCancelEditDeviceName}
                        className="flex-1 px-3 py-2 rounded text-sm font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-300 mt-1">Hilfreicher Name zur Unterscheidung mehrerer Geräte</p>
              </div>
            </div>
          )}
        </div>

        {/* Version & Build Info Card */}
        <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 mt-6 mb-4 p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div className="flex-1 space-y-3">
              {/* App Version */}
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">APP VERSION</p>
                <p className="text-sm font-mono text-gray-900 dark:text-gray-200 mt-1">{APP_VERSION}</p>
              </div>

              {/* Build Code - With Copy Button */}
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">BUILD CODE</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-mono text-gray-900 dark:text-gray-200 flex-1 break-all">{BUILD_INFO}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(BUILD_INFO)
                      alert('Build code copied to clipboard!')
                    }}
                    className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors"
                    title="Copy build code"
                  >
                    <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Production Version Link */}
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">LINKED PRODUCTION</p>
                <p className="text-sm font-mono text-gray-900 dark:text-gray-200 mt-1">v{LINKED_PRODUCTION_VERSION}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current production version in use</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4 pb-4">
          <p>{t('settings.made_with')}</p>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage

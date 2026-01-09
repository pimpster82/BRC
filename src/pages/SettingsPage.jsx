import React, { useState, useEffect } from 'react'
import { ArrowLeft, Globe, Calendar, Bell, RotateCcw, ChevronDown, ChevronRight, BookOpen, Download, RefreshCw, Eye, Smartphone, Copy, Moon, Info, Lock, Plus, Check, AlertCircle, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLoading } from '../context/LoadingContext'
import { useAdmin } from '../context/AdminContext'
import { useAuth } from '../context/AuthContext'
import ReadingPlanCreator from '../components/ReadingPlanCreator'
import BibleInOneYearWarningModal from '../components/BibleInOneYearWarningModal'
import AdminMessageTemplates from '../components/AdminMessageTemplates'
import { uploadReadingPlan, getAvailableReadingPlans, installReadingPlan, uninstallReadingPlan, getInstalledPlans } from '../utils/firebaseReadingPlans'
import { getBibleInOneYearState, pausePlan } from '../utils/bibleInOneYearState'
import { SUPPORTED_LANGUAGES, getCurrentLanguage, setCurrentLanguage } from '../config/languages'
import { fetchScheduleFromWOL, fetchYeartextFromWOL } from '../utils/scheduleUpdater'
import { saveScheduleToFirebase, saveYeartextToFirebase } from '../utils/firebaseSchedules'
import { initializeAdminTemplates } from '../utils/firebaseTemplatesAdmin'
import { getOrCreateDeviceId, getDeviceName, setDeviceName, getDeviceInfo } from '../utils/deviceId'
import { t } from '../config/i18n'
import { APP_VERSION, BUILD_INFO, LINKED_PRODUCTION_VERSION } from '../config/version'
import { useTheme } from '../context/ThemeContext'
import bibleBooks from '../../data/bible-books-en.json'
import { requestNotificationPermission, getNotificationPermission, testNotification } from '../utils/reminderService'
import { showLocalNotification } from '../utils/notificationScheduler'
import { restartNotificationService } from '../utils/notificationService'

const SettingsPage = () => {
  const navigate = useNavigate()
  const { showLoading, hideLoading } = useLoading()
  const { isAdminMode, exitAdminAccess } = useAdmin()
  const { currentUser } = useAuth()
  const { theme, setThemePreference } = useTheme()
  const [showPlanCreator, setShowPlanCreator] = useState(false)
  const [planUploadMessage, setPlanUploadMessage] = useState('')
  const [planUploadError, setPlanUploadError] = useState('')

  // Expanded sections
  const [expandedSection, setExpandedSection] = useState(null)
  const [expandedReadingPlanDropdown, setExpandedReadingPlanDropdown] = useState(false)
  const [expandedVersionInfo, setExpandedVersionInfo] = useState(false)
  const [expandedAdminSubsection, setExpandedAdminSubsection] = useState({ notifications: false, plans: false, device: false, reset: false })
  const [expandedInfoIcons, setExpandedInfoIcons] = useState({ scheduleUpdate: false, planCreator: false, deviceId: false, resetSettings: false, clearCache: false, resetProgress: false })

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

  // Bible in One Year Warning Modal - Show when user tries to switch away from active One Year plan
  const [showBibleInOneYearWarning, setShowBibleInOneYearWarning] = useState(false)
  const [pendingPlan, setPendingPlan] = useState(null)

  // Notifications - Master Switch
  const [notificationMasterSwitch, setNotificationMasterSwitch] = useState(
    localStorage.getItem('settings_notificationMasterSwitch') !== 'false'
  )

  // Notifications - Daily Text
  const [dailyTextEnabled, setDailyTextEnabled] = useState(
    localStorage.getItem('settings_notification_dailyText') !== 'false'
  )
  const [dailyTextTime, setDailyTextTime] = useState(
    localStorage.getItem('settings_notification_dailyTextTime') || '08:00'
  )

  // Notifications - Weekly Reading
  const [weeklyReadingEnabled, setWeeklyReadingEnabled] = useState(
    localStorage.getItem('settings_notification_weeklyReading') !== 'false'
  )
  const [weeklyReadingTime, setWeeklyReadingTime] = useState(
    localStorage.getItem('settings_notification_weeklyReadingTime') || '10:00'
  )

  // Notifications - Personal Reading
  const [personalReadingEnabled, setPersonalReadingEnabled] = useState(
    localStorage.getItem('settings_notification_personalReading') !== 'false'
  )
  const [personalReadingTime, setPersonalReadingTime] = useState(
    localStorage.getItem('settings_notification_personalReadingTime') || '12:00'
  )

  // Notifications - Streak Preservation (fixed time: 18:00)
  const [streakEnabled, setStreakEnabled] = useState(
    localStorage.getItem('settings_notification_streakPreservation') !== 'false'
  )

  // Notifications - Permission Status
  const [notificationPermission, setNotificationPermission] = useState(
    getNotificationPermission()
  )

  // Legacy notification states (kept for backward compatibility)
  const [dailyReminder, setDailyReminder] = useState(
    localStorage.getItem('settings_dailyReminder') === 'true'
  )
  const [reminderTime, setReminderTime] = useState(
    localStorage.getItem('settings_reminderTime') || '08:00'
  )
  const [permissionLoading, setPermissionLoading] = useState(false)

  // Schedule Update
  const [scheduleYear, setScheduleYear] = useState(new Date().getFullYear() + 1)
  const [scheduleStatus, setScheduleStatus] = useState(null) // 'loading', 'success', 'error'
  const [scheduleMessage, setScheduleMessage] = useState('')

  // Initialize Templates
  const [initTemplateLoading, setInitTemplateLoading] = useState(false)
  const [initTemplateMessage, setInitTemplateMessage] = useState('')

  // Device Info
  const [deviceId, setDeviceId] = useState(getOrCreateDeviceId())
  const [deviceName, setDeviceNameState] = useState(getDeviceName())
  const [isEditingDeviceName, setIsEditingDeviceName] = useState(false)
  const [tempDeviceName, setTempDeviceName] = useState(getDeviceName())
  const [copySuccess, setCopySuccess] = useState(false)

  // Custom Reading Plans
  const [availablePlans, setAvailablePlans] = useState([]) // Custom plans from Firebase
  const [installedPlans, setInstalledPlans] = useState([]) // User's installed plans
  const [loadingPlans, setLoadingPlans] = useState(false) // Loading state for plans
  const [showPlanInfoModal, setShowPlanInfoModal] = useState(false) // Show plan details modal
  const [selectedPlanInfo, setSelectedPlanInfo] = useState(null) // Plan to show in modal
  const [showUninstallModal, setShowUninstallModal] = useState(false) // Show uninstall confirmation
  const [planToUninstall, setPlanToUninstall] = useState(null) // Plan to uninstall

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

  const handleReadingPlanChange = (newPlan) => {
    const currentPlan = readingPlan

    // If switching AWAY from active One Year plan, show warning
    if (currentPlan === 'oneyear' && newPlan !== 'oneyear') {
      const bibleInOneYearState = getBibleInOneYearState()

      // Only warn if plan is active
      if (bibleInOneYearState && bibleInOneYearState.active) {
        setPendingPlan(newPlan)
        setShowBibleInOneYearWarning(true)
        setExpandedReadingPlanDropdown(false)
        return // Block the switch
      }
    }

    // Normal plan switch
    setReadingPlan(newPlan)
    localStorage.setItem('settings_readingPlan', newPlan)
    setExpandedReadingPlanDropdown(false)
  }

  // Confirm pausing One Year plan and switch to new plan
  const handleConfirmPause = () => {
    if (!pendingPlan) return

    // Pause the One Year plan
    const state = getBibleInOneYearState()
    if (state) {
      pausePlan(state)
    }

    // Switch to the new plan
    setReadingPlan(pendingPlan)
    localStorage.setItem('settings_readingPlan', pendingPlan)

    // Close modal
    setShowBibleInOneYearWarning(false)
    setPendingPlan(null)
  }

  // Cancel pausing - stay on One Year plan
  const handleCancelPause = () => {
    setShowBibleInOneYearWarning(false)
    setPendingPlan(null)
  }

  // Show plan info modal for installation
  const handleShowPlanInfo = (plan) => {
    setSelectedPlanInfo(plan)
    setShowPlanInfoModal(true)
    setExpandedReadingPlanDropdown(false)
  }

  // Show uninstall confirmation modal
  const handleShowUninstallConfirm = (plan) => {
    setPlanToUninstall(plan)
    setShowUninstallModal(true)
    setExpandedReadingPlanDropdown(false)
  }

  // Install a custom reading plan (from modal)
  const handleInstallPlan = async () => {
    if (!currentUser || !selectedPlanInfo) {
      alert(t('common.login_required'))
      return
    }

    try {
      await installReadingPlan(selectedPlanInfo.id, currentUser.uid)
      // Refresh installed plans list
      const updated = await getInstalledPlans(currentUser.uid)
      setInstalledPlans(updated)
      setShowPlanInfoModal(false)
      setSelectedPlanInfo(null)
    } catch (error) {
      console.error('✗ Failed to install plan:', error)
      alert('Failed to install plan: ' + error.message)
    }
  }

  // Uninstall a custom reading plan (from modal)
  const handleUninstallPlan = async () => {
    if (!currentUser || !planToUninstall) return

    try {
      await uninstallReadingPlan(planToUninstall.id, currentUser.uid)
      // Refresh installed plans list
      const updated = await getInstalledPlans(currentUser.uid)
      setInstalledPlans(updated)

      // If the uninstalled plan was selected, switch to 'free' plan
      if (readingPlan === planToUninstall.id) {
        handleReadingPlanChange('free')
      }

      setShowUninstallModal(false)
      setPlanToUninstall(null)
    } catch (error) {
      console.error('✗ Failed to uninstall plan:', error)
      alert('Failed to uninstall plan: ' + error.message)
    }
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

  const handleRequestNotificationPermission = async () => {
    setPermissionLoading(true)
    try {
      const permission = await requestNotificationPermission()
      setNotificationPermission(permission)

      if (permission === 'granted') {
        alert('✓ Benachrichtigungen aktiviert! Sie erhalten ab sofort Erinnerungen zum Tagestext.')
      } else if (permission === 'denied') {
        alert('⚠️ Benachrichtigungen wurden abgelehnt. Sie können dies in Ihren Browser-Einstellungen ändern.')
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      alert('✗ Fehler beim Anfordern der Berechtigung')
    } finally {
      setPermissionLoading(false)
    }
  }

  const handleTestNotification = () => {
    const success = testNotification()
    if (!success) {
      alert('⚠️ Benachrichtigung konnte nicht gesendet werden. Bitte aktivieren Sie Benachrichtigungen in den Browser-Einstellungen.')
    }
  }

  // NEW NOTIFICATION HANDLERS

  const handleMasterSwitchToggle = () => {
    const newValue = !notificationMasterSwitch
    setNotificationMasterSwitch(newValue)
    localStorage.setItem('settings_notificationMasterSwitch', newValue.toString())
    // Restart notification service to apply new settings
    restartNotificationService()
  }

  const handleDailyTextToggle = () => {
    const newValue = !dailyTextEnabled
    setDailyTextEnabled(newValue)
    localStorage.setItem('settings_notification_dailyText', newValue.toString())
    // Restart notification service
    restartNotificationService()
  }

  const handleDailyTextTimeChange = (time) => {
    setDailyTextTime(time)
    localStorage.setItem('settings_notification_dailyTextTime', time)
    // Restart notification service with new time
    restartNotificationService()
  }

  const handleWeeklyReadingToggle = () => {
    const newValue = !weeklyReadingEnabled
    setWeeklyReadingEnabled(newValue)
    localStorage.setItem('settings_notification_weeklyReading', newValue.toString())
    // Restart notification service
    restartNotificationService()
  }

  const handleWeeklyReadingTimeChange = (time) => {
    setWeeklyReadingTime(time)
    localStorage.setItem('settings_notification_weeklyReadingTime', time)
    // Restart notification service with new time
    restartNotificationService()
  }

  const handlePersonalReadingToggle = () => {
    const newValue = !personalReadingEnabled
    setPersonalReadingEnabled(newValue)
    localStorage.setItem('settings_notification_personalReading', newValue.toString())
    // Restart notification service
    restartNotificationService()
  }

  const handlePersonalReadingTimeChange = (time) => {
    setPersonalReadingTime(time)
    localStorage.setItem('settings_notification_personalReadingTime', time)
    // Restart notification service with new time
    restartNotificationService()
  }

  const handleStreakToggle = () => {
    const newValue = !streakEnabled
    setStreakEnabled(newValue)
    localStorage.setItem('settings_notification_streakPreservation', newValue.toString())
    // Restart notification service
    restartNotificationService()
  }

  const handleRequestPermission = async () => {
    setPermissionLoading(true)
    try {
      const permission = await requestNotificationPermission()
      setNotificationPermission(permission)
    } catch (error) {
      console.error('Error requesting notification permission:', error)
    } finally {
      setPermissionLoading(false)
    }
  }

  const handleNewTestNotification = () => {
    if (notificationPermission !== 'granted') {
      alert(t('settings.notification_permission_required'))
      return
    }

    showLocalNotification({
      title: t('notification.daily_text_title'),
      body: t('notification.daily_text_body'),
      tag: 'test',
      data: { type: 'test' }
    })
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

  const handleInitializeTemplates = async () => {
    setInitTemplateLoading(true)
    setInitTemplateMessage('')

    try {
      const result = await initializeAdminTemplates()

      if (result.success) {
        setInitTemplateMessage(`✅ ${result.message}`)
      } else {
        setInitTemplateMessage(`❌ ${result.message}`)
      }
    } catch (error) {
      console.error('Template initialization error:', error)
      setInitTemplateMessage(`❌ Fehler beim Initialisieren: ${error.message}`)
    } finally {
      setInitTemplateLoading(false)
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

  // Reading Plan Creator Handler
  const handlePlanUpload = async (plan) => {
    if (!currentUser) {
      setPlanUploadError('You must be logged in to upload plans')
      return
    }

    try {
      showLoading()
      setPlanUploadError('')
      setPlanUploadMessage('')

      await uploadReadingPlan(plan, currentUser.uid)

      setPlanUploadMessage(`✓ Plan "${plan.name.en || plan.name.de}" uploaded successfully!`)
      setTimeout(() => {
        setPlanUploadMessage('')
        setShowPlanCreator(false)
      }, 3000)
    } catch (error) {
      setPlanUploadError(`Failed to upload plan: ${error.message}`)
      console.error('Plan upload error:', error)
    } finally {
      hideLoading()
    }
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
    // Check system plans first
    const systemPlan = readingPlans.find(p => p.value === readingPlan)
    if (systemPlan) return systemPlan.label

    // Check custom plans
    const customPlan = availablePlans.find(p => p.id === readingPlan)
    if (customPlan) {
      return customPlan.name?.[language] || customPlan.name?.en || customPlan.id
    }

    return t('reading.plan_free')
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

  // Available reading plans - show coming soon plans only in admin mode
  const allReadingPlans = [
    { value: 'free', label: t('reading.plan_free'), available: true },
    { value: 'bible_overview', label: t('reading.plan_bible_overview'), available: true },
    { value: 'thematic', label: t('reading.plan_thematic'), available: true },
    { value: 'chronological', label: t('reading.plan_chronological'), available: false },
    { value: 'oneyear', label: t('reading.plan_oneyear'), available: true }
  ]

  const readingPlans = allReadingPlans.filter(plan => plan.available || isAdminMode)

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
        <div className="card bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 mb-3 p-0">
          <button
            onClick={() => toggleSection('language')}
            className="w-full flex items-start justify-between pt-[10px] pr-[5px] pb-[10px] pl-[10px]"
          >
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              <Globe className="w-5 h-5 flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
              <h2 className="font-semibold text-gray-800 dark:text-gray-300">{t('settings.language')}</h2>
            </div>
            <div className="flex items-center gap-0 flex-shrink-0">
              <span className="text-xs text-gray-600 dark:text-gray-400">{getLanguageName()}</span>
              {expandedSection === 'language' ? (
                <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              )}
            </div>
          </button>

          {expandedSection === 'language' && (
            <div className="mt-0 pt-4 pl-[10px] pr-[10px] pb-[16px] border-t border-gray-200 dark:border-gray-700">
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
        <div className="card bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 mb-3 p-0">
          <button
            onClick={() => toggleSection('display')}
            className="w-full flex items-start justify-between pt-[10px] pr-[5px] pb-[10px] pl-[10px]"
          >
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              <Eye className="w-5 h-5 flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
              <h2 className="font-semibold text-gray-800 dark:text-gray-300">{t('settings.display')}</h2>
            </div>
            <div className="flex items-center gap-0 flex-shrink-0">
              {expandedSection === 'display' ? (
                <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              )}
            </div>
          </button>

          {expandedSection === 'display' && (
            <div className="mt-0 pt-4 pl-[10px] pr-[10px] pb-[16px] border-t border-gray-200 dark:border-gray-700 space-y-4">
              {/* Show Yeartext Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">{t('settings.show_yeartext')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('settings.show_yeartext_note')}</p>
                </div>
                <button
                  onClick={handleShowYeartext}
                  className={`relative inline-flex h-4 w-11 items-center rounded-full transition-colors ${
                    showYeartext ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-4 transform rounded-full bg-white transition-transform ${
                      showYeartext ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

            </div>
          )}
        </div>


        {/* Weekly Reading Settings */}
        <div className="card bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 mb-3 p-0">
          <button
            onClick={() => toggleSection('weekly')}
            className="w-full flex items-start justify-between pt-[10px] pr-[5px] pb-[10px] pl-[10px]"
          >
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              <Calendar className="w-5 h-5 flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
              <h2 className="font-semibold text-gray-800 dark:text-gray-300">{t('settings.weekly_reading')}</h2>
            </div>
            <div className="flex items-center gap-0 flex-shrink-0">
              <span className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-300">{getMeetingDayName()}</span>
              {expandedSection === 'weekly' ? (
                <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
              )}
            </div>
          </button>

          {expandedSection === 'weekly' && (
            <div className="mt-0 pt-4 pl-[10px] pr-[10px] pb-[16px] border-t border-gray-200 dark:border-gray-700">
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
        <div className="card bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 mb-3 p-0">
          <button
            onClick={() => toggleSection('personal')}
            className="w-full flex items-start justify-between pt-[10px] pr-[5px] pb-[10px] pl-[10px]"
          >
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              <BookOpen className="w-5 h-5 flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
              <h2 className="font-semibold text-gray-800 dark:text-gray-300">{t('settings.personal_plan')}</h2>
            </div>
            <div className="flex items-center gap-0 flex-shrink-0">
              <span className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-300">{getReadingPlanName()}</span>
              {expandedSection === 'personal' ? (
                <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
              )}
            </div>
          </button>

          {expandedSection === 'personal' && (
            <div className="mt-0 pt-4 pl-[10px] pr-[10px] pb-[16px] border-t border-gray-200 dark:border-gray-700">
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  {t('settings.reading_plan')}
                </label>

                {/* Dropdown Trigger */}
                <button
                  onClick={() => setExpandedReadingPlanDropdown(!expandedReadingPlanDropdown)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300 rounded-lg text-left text-gray-700 dark:text-gray-300 font-medium flex items-center justify-between hover:border-gray-400 transition-colors"
                >
                  {getReadingPlanName()}
                  <ChevronDown className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform ${expandedReadingPlanDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {expandedReadingPlanDropdown && (() => {
                  // Combine system and installed custom plans, sort alphabetically
                  const installedSystemPlans = readingPlans.map(p => ({
                    ...p,
                    displayName: p.label,
                    isSystem: true
                  }))

                  const installedCustomPlans = availablePlans
                    .filter(plan => installedPlans.includes(plan.id))
                    .map(plan => ({
                      ...plan,
                      value: plan.id,
                      displayName: plan.name?.[language] || plan.name?.en || plan.id,
                      isSystem: false
                    }))

                  const allInstalledPlans = [...installedSystemPlans, ...installedCustomPlans]
                    .sort((a, b) => a.displayName.localeCompare(b.displayName))

                  // Get available (not installed) custom plans, sort alphabetically
                  const availableCustomPlans = availablePlans
                    .filter(plan => !installedPlans.includes(plan.id))
                    .map(plan => ({
                      ...plan,
                      displayName: plan.name?.[language] || plan.name?.en || plan.id
                    }))
                    .sort((a, b) => a.displayName.localeCompare(b.displayName))

                  return (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                      {/* Installed Plans (System + Custom) - Alphabetically sorted */}
                      <div className="py-2">
                        {allInstalledPlans.map((plan) => (
                          <div
                            key={plan.value}
                            className={`flex items-center justify-between px-3 py-2 transition-all ${
                              readingPlan === plan.value
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                                : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                            }`}
                          >
                            <button
                              onClick={() => handleReadingPlanChange(plan.value)}
                              className="flex-1 text-left font-medium text-gray-700 dark:text-gray-300"
                            >
                              {plan.displayName}
                            </button>
                            {!plan.isSystem && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleShowUninstallConfirm(plan)
                                }}
                                className="ml-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                                title={t('common.uninstall') || 'Uninstall'}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Available Plans - Alphabetically sorted */}
                      {currentUser && availableCustomPlans.length > 0 && (
                        <div className="border-t border-gray-300 dark:border-gray-600 py-2">
                          {availableCustomPlans.map((plan) => (
                            <div
                              key={plan.id}
                              className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
                            >
                              <span className="flex-1 text-gray-400 dark:text-gray-500 text-sm">
                                {plan.displayName}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleShowPlanInfo(plan)
                                }}
                                className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                title={t('common.install') || 'Install'}
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })()}

                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-300 mt-3">
                  {t('settings.reading_plan_note')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Notifications - NEW NOTIFICATION SETTINGS UI */}
        <div className="card bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 mb-3 p-0">
          <button
            onClick={() => toggleSection('notifications')}
            className="w-full flex items-start justify-between pt-[10px] pr-[5px] pb-[10px] pl-[10px]"
          >
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              <Bell className="w-5 h-5 flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
              <h2 className="font-semibold text-gray-800 dark:text-gray-300">
                {t('settings.notifications_title')}
              </h2>
            </div>
            <div className="flex items-center gap-0 flex-shrink-0">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {notificationMasterSwitch ? t('common.active') : 'Stumm'}
              </span>
              {expandedSection === 'notifications' ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>

          {expandedSection === 'notifications' && (
            <div className="mt-0 pt-4 pl-[10px] pr-[10px] pb-[16px] space-y-4 border-t border-gray-200 dark:border-gray-700">

              {/* Permission Status Indicator */}
              {notificationPermission !== 'granted' && (
                <div className={`p-3 rounded-lg border flex items-start gap-2 ${
                  notificationPermission === 'denied'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
                }`}>
                  <AlertCircle className="w-4 h-4 mt-0.5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      {t('settings.notification_permission_required')}
                    </p>
                    {notificationPermission !== 'denied' && (
                      <button
                        onClick={handleRequestPermission}
                        disabled={permissionLoading}
                        className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {t('settings.notification_enable_permission')}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Master Mute Switch */}
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-300">
                    {t('settings.notifications_master')}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('settings.notifications_master_mute')}
                  </p>
                </div>
                <button
                  onClick={handleMasterSwitchToggle}
                  className={`relative inline-flex h-4 w-11 items-center rounded-full transition-colors ${
                    notificationMasterSwitch
                      ? 'bg-blue-600 dark:bg-blue-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-5 w-4 transform rounded-full bg-white transition-transform ${
                    notificationMasterSwitch ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700" />

              {/* Daily Text Reminder */}
              <div className={notificationMasterSwitch ? '' : 'opacity-50 pointer-events-none'}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="font-medium text-gray-800 dark:text-gray-300">
                    {t('settings.notification_daily_text')}
                  </p>
                  <button
                    onClick={handleDailyTextToggle}
                    disabled={!notificationMasterSwitch}
                    className={`relative inline-flex h-4 w-11 items-center rounded-full transition-colors ${
                      dailyTextEnabled
                        ? 'bg-blue-600 dark:bg-blue-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-5 w-4 transform rounded-full bg-white transition-transform ${
                      dailyTextEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                {dailyTextEnabled && (
                  <div className="ml-4">
                    <input
                      type="time"
                      value={dailyTextTime}
                      onChange={(e) => handleDailyTextTimeChange(e.target.value)}
                      disabled={!notificationMasterSwitch}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Weekly Reading Reminder */}
              <div className={notificationMasterSwitch ? '' : 'opacity-50 pointer-events-none'}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="font-medium text-gray-800 dark:text-gray-300">
                    {t('settings.notification_weekly_reading')}
                  </p>
                  <button
                    onClick={handleWeeklyReadingToggle}
                    disabled={!notificationMasterSwitch}
                    className={`relative inline-flex h-4 w-11 items-center rounded-full transition-colors ${
                      weeklyReadingEnabled
                        ? 'bg-blue-600 dark:bg-blue-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-5 w-4 transform rounded-full bg-white transition-transform ${
                      weeklyReadingEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                {weeklyReadingEnabled && (
                  <div className="ml-4">
                    <input
                      type="time"
                      value={weeklyReadingTime}
                      onChange={(e) => handleWeeklyReadingTimeChange(e.target.value)}
                      disabled={!notificationMasterSwitch}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Personal Reading Reminder */}
              <div className={notificationMasterSwitch ? '' : 'opacity-50 pointer-events-none'}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="font-medium text-gray-800 dark:text-gray-300">
                    {t('settings.notification_personal_reading')}
                  </p>
                  <button
                    onClick={handlePersonalReadingToggle}
                    disabled={!notificationMasterSwitch}
                    className={`relative inline-flex h-4 w-11 items-center rounded-full transition-colors ${
                      personalReadingEnabled
                        ? 'bg-blue-600 dark:bg-blue-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-5 w-4 transform rounded-full bg-white transition-transform ${
                      personalReadingEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                {personalReadingEnabled && (
                  <div className="ml-4">
                    <input
                      type="time"
                      value={personalReadingTime}
                      onChange={(e) => handlePersonalReadingTimeChange(e.target.value)}
                      disabled={!notificationMasterSwitch}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Streak Preservation Reminder */}
              <div className={notificationMasterSwitch ? '' : 'opacity-50 pointer-events-none'}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-300">
                      {t('settings.notification_streak')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      18:00
                    </p>
                  </div>
                  <button
                    onClick={handleStreakToggle}
                    disabled={!notificationMasterSwitch}
                    className={`relative inline-flex h-4 w-11 items-center rounded-full transition-colors ${
                      streakEnabled
                        ? 'bg-blue-600 dark:bg-blue-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-5 w-4 transform rounded-full bg-white transition-transform ${
                      streakEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Test Notification Button */}
              {notificationPermission === 'granted' && (
                <button
                  onClick={handleNewTestNotification}
                  className="w-full mt-4 px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                >
                  {t('settings.notification_test')}
                </button>
              )}
            </div>
          )}
        </div>


        {/* ADMIN SETTINGS - Consolidated & Organized */}
        {isAdminMode && (
        <div className="card bg-white dark:bg-slate-900 border border-red-200 dark:border-red-700 mb-3 p-0">
          <div className="w-full flex items-start justify-between pt-[10px] pr-[5px] pb-[10px] pl-[10px]">
            <button
              onClick={() => toggleSection('admin')}
              className="flex items-start gap-2.5 flex-1 min-w-0 hover:opacity-80 transition-opacity"
            >
              <Lock className="w-5 h-5 flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
              <h2 className="font-semibold text-gray-800 dark:text-gray-300">Admin Settings</h2>
            </button>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={exitAdminAccess}
                className="px-3 py-1 text-xs font-medium rounded bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white transition-colors"
                title="Exit Admin Mode"
              >
                Beenden
              </button>
              {expandedSection === 'admin' ? (
                <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              )}
            </div>
          </div>

          {expandedSection === 'admin' && (
            <div className="mt-0 pt-4 pl-[10px] pr-[10px] pb-[16px] border-t border-red-200 dark:border-red-700 space-y-4">

              {/* Section 1: Admin Message Templates */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-300">Message Templates</h3>

                {/* Initialize Templates Button */}
                <button
                  onClick={handleInitializeTemplates}
                  disabled={initTemplateLoading}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-200 rounded-lg font-medium hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors border border-purple-200 dark:border-purple-700 text-sm disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  {initTemplateLoading ? 'Initialisiere...' : 'Initialize Templates'}
                </button>

                {/* Template Init Status Message */}
                {initTemplateMessage && (
                  <div className={`p-2 rounded text-xs whitespace-pre-wrap ${
                    initTemplateMessage.startsWith('✅')
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                  }`}>
                    {initTemplateMessage}
                  </div>
                )}

                {/* Admin Message Templates Editor */}
                <AdminMessageTemplates />
              </div>

              {/* Divider */}
              <div className="border-t border-red-200 dark:border-red-700" />

              {/* Section 2: Reading Plan Things */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-300">Lesepläne</h3>

                {/* Schedule Update Year Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-400">Jahr für Leseplan</label>
                  <input
                    type="number"
                    min="2024"
                    max={new Date().getFullYear() + 5}
                    value={scheduleYear}
                    onChange={(e) => setScheduleYear(parseInt(e.target.value) || new Date().getFullYear() + 1)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Schedule Update Button */}
                <button
                  onClick={handleFetchSchedule}
                  disabled={scheduleStatus === 'loading'}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg font-medium hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors border border-blue-200 dark:border-blue-700 text-sm disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  Schedule Update laden
                </button>

                {/* Status Message */}
                {scheduleMessage && (
                  <div className={`mt-2 p-2 rounded text-xs whitespace-pre-wrap ${
                    scheduleStatus === 'success'
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                      : scheduleStatus === 'error'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                      : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                  }`}>
                    {scheduleMessage}
                  </div>
                )}

                {/* Create Reading Plan Button */}
                <button
                  onClick={() => setShowPlanCreator(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-lg font-medium hover:bg-green-100 dark:hover:bg-green-800 transition-colors border border-green-200 dark:border-green-700 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create Plan
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-red-200 dark:border-red-700" />

              {/* Section 3: Device Things */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-300">Gerät</h3>

                {/* Device ID */}
                <div className="space-y-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Device ID</p>
                  <div className="flex gap-2">
                    <code className="flex-1 text-xs bg-gray-100 dark:bg-slate-700 p-2 rounded border border-gray-300 dark:border-gray-600 dark:text-gray-300 font-mono overflow-auto">
                      {deviceId.substring(0, 12)}...
                    </code>
                    <button
                      onClick={handleCopyDeviceId}
                      className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
                        copySuccess
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800'
                      }`}
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Device Name */}
                <div className="space-y-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Device Name</p>
                  {!isEditingDeviceName ? (
                    <div className="flex gap-2">
                      <p className="flex-1 text-xs bg-gray-50 p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300">
                        {deviceName}
                      </p>
                      <button
                        onClick={() => setIsEditingDeviceName(true)}
                        className="px-2 py-1 rounded text-xs font-medium bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={tempDeviceName}
                        onChange={(e) => setTempDeviceName(e.target.value)}
                        className="w-full text-xs px-2 py-1 border border-blue-300 dark:border-blue-600 dark:bg-slate-800 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={handleSaveDeviceName}
                          className="flex-1 px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEditDeviceName}
                          className="flex-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-red-200 dark:border-red-700" />

              {/* Section 4: Reset/Cleanup */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">Zurücksetzen</h3>

                {/* Reset All Settings */}
                <button
                  onClick={handleResetAll}
                  className="w-full bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100 py-2 px-3 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-800 transition-colors border border-red-200 dark:border-red-700 text-sm"
                >
                  Reset All
                </button>

                {/* Clear Cache */}
                <button
                  onClick={handleClearCache}
                  className="w-full bg-orange-50 dark:bg-orange-900 text-orange-700 dark:text-orange-100 py-2 px-3 rounded-lg font-medium hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors border border-orange-200 text-sm"
                >
                  Clear Cache
                </button>

                {/* Reset Progress */}
                <button
                  onClick={handleResetProgress}
                  className="w-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 py-2 px-3 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-800 transition-colors border border-red-300 dark:border-red-600 text-sm"
                >
                  Reset Progress
                </button>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Version & Build Info Card - Expandable */}
        <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 mb-3 p-0">
          <button
            onClick={() => setExpandedVersionInfo(!expandedVersionInfo)}
            className="w-full flex items-start justify-between pt-[10px] pr-[5px] pb-[10px] pl-[10px]"
          >
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              <Info
                className="w-5 h-5 flex-shrink-0 text-blue-600 dark:text-blue-400 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity mt-0.5"
                onClick={(e) => {
                  e.stopPropagation()
                  setExpandedVersionInfo(!expandedVersionInfo)
                }}
              />
              <h2 className="font-semibold text-gray-800 dark:text-gray-300">BRC</h2>
            </div>
            <div className="flex items-center gap-0 flex-shrink-0">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                v{APP_VERSION}
              </span>
            </div>
          </button>

          {expandedVersionInfo && (
            <div className="mt-0 pt-4 pl-[10px] pr-[10px] pb-[16px] border-t border-slate-200 dark:border-slate-700 space-y-3">
              {/* Build Code - With Copy Button */}
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Build</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-mono text-gray-900 dark:text-gray-200 flex-1 break-all bg-gray-50 dark:bg-slate-800 p-2 rounded border border-gray-200 dark:border-slate-700">
                    {BUILD_INFO}
                  </p>
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
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Production</p>
                <p className="text-sm font-mono text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-slate-800 p-2 rounded border border-gray-200 dark:border-slate-700">
                  v{LINKED_PRODUCTION_VERSION}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4 pb-4">
          <p>{t('settings.made_with')}</p>
        </div>
      </div>

      {/* Reading Plan Creator Modal */}
      <ReadingPlanCreator
        isOpen={showPlanCreator}
        onClose={() => setShowPlanCreator(false)}
        onUpload={handlePlanUpload}
      />

      {/* Plan Info Modal (for installation) */}
      {showPlanInfoModal && selectedPlanInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-300">
                {selectedPlanInfo.name?.[language] || selectedPlanInfo.name?.en || selectedPlanInfo.id}
              </h3>
              <button
                onClick={() => {
                  setShowPlanInfoModal(false)
                  setSelectedPlanInfo(null)
                }}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4">
              {/* Plan Type */}
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  {t('settings.plan_type') || 'Type'}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 capitalize">{selectedPlanInfo.type}</p>
              </div>

              {/* Installations Count */}
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  {t('settings.installations') || 'Installations'}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedPlanInfo.installations || 0} {t('settings.installs') || 'installs'}
                </p>
              </div>

              {/* Description (if available) */}
              {selectedPlanInfo.description && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    {t('settings.description') || 'Description'}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedPlanInfo.description[language] || selectedPlanInfo.description.en || selectedPlanInfo.description}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-700 p-4 flex gap-2">
              <button
                onClick={() => {
                  setShowPlanInfoModal(false)
                  setSelectedPlanInfo(null)
                }}
                className="flex-1 py-2 px-4 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleInstallPlan}
                className="flex-1 py-2 px-4 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                {t('common.install') || 'Install'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Uninstall Confirmation Modal */}
      {showUninstallModal && planToUninstall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full">
            {/* Modal Header */}
            <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 p-4">
              <h3 className="text-lg font-bold text-red-800 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {t('settings.uninstall_plan') || 'Uninstall Plan'}
              </h3>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {t('settings.uninstall_confirm') || 'Are you sure you want to uninstall this reading plan?'}
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-slate-800 p-3 rounded">
                {planToUninstall.displayName || planToUninstall.name?.[language] || planToUninstall.name?.en || planToUninstall.id}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                {t('settings.can_reinstall') || 'You can reinstall it anytime.'}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex gap-2">
              <button
                onClick={() => {
                  setShowUninstallModal(false)
                  setPlanToUninstall(null)
                }}
                className="flex-1 py-2 px-4 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleUninstallPlan}
                className="flex-1 py-2 px-4 bg-red-600 dark:bg-red-500 text-white rounded-lg font-medium hover:bg-red-700 dark:hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                {t('common.uninstall') || 'Uninstall'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bible in One Year Warning Modal - Show when user tries to switch away from active plan */}
      {showBibleInOneYearWarning && (
        <BibleInOneYearWarningModal
          planName={t('reading.plan_oneyear')}
          onConfirm={handleConfirmPause}
          onCancel={handleCancelPause}
        />
      )}
    </div>
  )
}

export default SettingsPage

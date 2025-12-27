import React, { useState, useEffect } from 'react'
import { ExternalLink, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { t, getCurrentLanguage } from '../config/i18n'
import { getCurrentWeekReading, loadScheduleForYear } from '../../data/weekly-reading-schedule'
import { getLocalizedBookName } from '../../data/bible-link-builder'
import { parseReadingText } from '../utils/scheduleParser'
import { calculateVerseProgress } from '../utils/verseProgressCalculator'

const WeeklyReadingCard = () => {
  const navigate = useNavigate()
  const [weekReading, setWeekReading] = useState(null)
  const [chaptersRead, setChaptersRead] = useState([])
  const [nextChapter, setNextChapter] = useState(null)

  const loadReading = async () => {
    // Get test date from localStorage if set
    const savedTestDate = localStorage.getItem('testDate')
    const testDate = savedTestDate ? new Date(savedTestDate) : null

    // Get meeting day from settings
    const meetingDay = parseInt(localStorage.getItem('settings_meetingDay') || '1')

    // Determine which year we need
    const checkDate = testDate ? new Date(testDate) : new Date()
    const year = checkDate.getFullYear()

    // Load the schedule for this year if needed
    const schedule = await loadScheduleForYear(year)

    if (!schedule) {
      console.warn(`No schedule available for ${year}. User needs to import via Settings.`)
      setWeekReading(null)
      return
    }

    // Now get current week's reading (after schedule is loaded)
    const reading = getCurrentWeekReading(meetingDay, testDate)
    setWeekReading(reading)

    // Load saved progress from localStorage
    if (reading) {
      const saved = localStorage.getItem('weeklyReading_current')
      let chaptersReadData = []
      if (saved) {
        const data = JSON.parse(saved)
        // Check if it's the same week
        if (data.weekStart === reading.weekStart) {
          chaptersReadData = data.chaptersRead || []
          setChaptersRead(chaptersReadData)
        }
      }

      // Calculate next unread chapter
      const chaptersReadSet = new Set(chaptersReadData.map(c => c.chapter))
      const nextUnreadChapter = reading.chapters.find(chapter => !chaptersReadSet.has(chapter))

      if (nextUnreadChapter) {
        setNextChapter(nextUnreadChapter)
      } else {
        // All chapters read
        setNextChapter(null)
      }
    }
  }

  useEffect(() => {
    loadReading()
  }, [])

  // Listen for storage changes (from other tabs/components)
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('📱 Storage changed, reloading weekly reading...')
      loadReading()
    }

    window.addEventListener('storage', handleStorageChange)

    // Also listen for custom events from the same tab
    window.addEventListener('weeklyReadingUpdated', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('weeklyReadingUpdated', handleStorageChange)
    }
  }, [])

  const handleOpenReading = () => {
    navigate('/weekly')
  }

  if (!weekReading) {
    return (
      <div className="card card-blue">
        <h2 className="card-header card-header-blue">
          <Calendar className="w-4 h-4" />
          {t('weekly.title')}
        </h2>
        <p className="text-sm text-gray-600 mb-3">{t('weekly.no_reading')}</p>
        <button
          onClick={() => navigate('/settings')}
          className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          → {t('settings.schedule_update')} ({t('common.open')})
        </button>
      </div>
    )
  }

  // Calculate verse-based progress instead of chapter-based
  const verseProgress = calculateVerseProgress(
    chaptersRead,
    weekReading.reading.book,
    Math.min(...weekReading.chapters),
    Math.max(...weekReading.chapters)
  )

  const totalChapters = weekReading.chapters.length
  const readCount = chaptersRead.length
  const progressPercent = verseProgress.percentage

  return (
    <div className="card card-blue">
      <h2 className="card-header card-header-blue">
        <Calendar className="w-4 h-4" />
        {t('weekly.title')}
      </h2>

      <p className="card-description">
        {t('weekly.week_of')}{' '}
        {nextChapter ? (
          <>
            <button
              onClick={() => navigate(`/weekly?chapter=${nextChapter}`)}
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
              title="Continue reading"
            >
              {t('weekly.title')}
            </button>
            {' '} • {parseReadingText(weekReading.reading, getCurrentLanguage())}
          </>
        ) : (
          parseReadingText(weekReading.reading, getCurrentLanguage())
        )}
      </p>

      <div className="card-footer card-footer-blue">
        <p className="card-stat-blue">
          {t('weekly.progress', null, { current: verseProgress.versesRead, total: verseProgress.totalVerses, percent: Math.round(progressPercent) })}
        </p>
        <button
          onClick={handleOpenReading}
          className="btn-open btn-open-blue"
        >
          <ExternalLink className="w-4 h-4" />
          {t('weekly.open')}
        </button>
      </div>
    </div>
  )
}

export default WeeklyReadingCard

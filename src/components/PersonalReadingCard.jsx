import React, { useState, useEffect } from 'react'
import { BookOpen, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { t, getCurrentLanguage } from '../config/i18n'
import { getPersonalReadingData } from '../utils/storage'
import { getBibleBooks } from '../config/languages'
import { getBibleInOneYearState } from '../utils/bibleInOneYearState'
import { getNextReading } from '../utils/nextReadingFinder'
import { parseMultipleVerses } from '../utils/versesLinksBuilder'
import { buildBibleLink } from '../../data/bible-link-builder'

/**
 * PersonalReadingCard - Shows next reading in Personal Bible Program
 * Displays:
 * - Current plan selection
 * - Next reading to continue with
 * - Button to open full Personal Reading page
 */
export default function PersonalReadingCard() {
  const navigate = useNavigate()
  const language = getCurrentLanguage()
  const bibleBooks = getBibleBooks(language)

  const [personalData, setPersonalData] = useState(null)
  const [nextReading, setNextReading] = useState(null)
  const [planName, setPlanName] = useState('')

  useEffect(() => {
    const data = getPersonalReadingData()
    setPersonalData(data)

    // Get plan name translation from settings (consistent with SettingsPage and PersonalReadingPage)
    const savedPlan = localStorage.getItem('settings_readingPlan') || 'free'
    const plans = {
      free: 'reading.plan_free',
      chronological: 'reading.plan_chronological',
      oneyear: 'reading.plan_oneyear',
      thematic: 'reading.plan_thematic',
      bible_overview: 'reading.plan_bible_overview'
    }
    setPlanName(t(plans[savedPlan] || 'reading.plan_free'))

    // Get Bible in One Year state if applicable
    const bibleInOneYearState = savedPlan === 'oneyear' ? getBibleInOneYearState() : null

    // Calculate next reading using centralized logic
    const next = getNextReading(savedPlan, data, bibleInOneYearState, bibleBooks)

    if (!next) {
      // All complete
      setNextReading({
        displayText: '✅ ' + t('reading.complete'),
        isThematic: savedPlan === 'thematic'
      })
      return
    }

    // Format display based on reading type
    if (next.type === 'topic') {
      setNextReading({
        topicId: next.topicId,
        displayText: t(next.titleKey),
        isThematic: true
      })
    } else if (next.type === 'chapter') {
      setNextReading({
        book: next.bookName,
        chapter: next.chapter,
        bookNumber: next.book,
        displayText: `${next.bookName} ${next.chapter}`,
        isThematic: false
      })
    } else if (next.type === 'oneyear_reading' || next.type === 'bible_overview_reading') {
      // For plan-specific readings, show book and chapter range
      const bookData = bibleBooks.books[next.book - 1]
      const displayText = next.startChapter === next.endChapter
        ? `${bookData.name} ${next.startChapter}`
        : `${bookData.name} ${next.startChapter}-${next.endChapter}`

      setNextReading({
        book: bookData.name,
        chapter: next.startChapter,
        bookNumber: next.book,
        displayText: displayText,
        isThematic: false
      })
    }
  }, [language, bibleBooks, t])

  const handleOpenPersonalReading = () => {
    navigate('/personal-reading')
  }

  if (!personalData || !nextReading) {
    return null
  }

  return (
    <div className="card card-green">
      <h2 className="card-header card-header-green">
        <BookOpen className="w-4 h-4" />
        {t('home.personal_reading')}
      </h2>

      <p className="card-description">
        {planName} • {t('reading.next')}:{' '}
        {nextReading.isThematic ? (
          <button
            onClick={() => navigate('/personal-reading')}
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
            title="Go to thematic reading"
          >
            {nextReading.displayText}
          </button>
        ) : (
          <button
            onClick={() => navigate(`/personal-reading?book=${nextReading.bookNumber}&chapter=${nextReading.chapter}`)}
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
            title="Continue reading"
          >
            {nextReading.displayText}
          </button>
        )}
      </p>

      <div className="card-footer card-footer-green">
        <div className="flex items-center gap-3">
          <p className="card-stat-green">
            {personalData.chaptersRead.length} {t('reading.chapters_read')}
          </p>
        </div>
        <button
          onClick={handleOpenPersonalReading}
          className="btn-open btn-open-green"
        >
          <ExternalLink className="w-4 h-4" />
          {t('common.open')}
        </button>
      </div>
    </div>
  )
}

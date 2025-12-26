import React, { useState, useEffect } from 'react'
import { BookOpen, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { t, getCurrentLanguage } from '../config/i18n'
import { getPersonalReadingData } from '../utils/storage'
import { getBibleBooks } from '../config/languages'
import { thematicTopics } from '../config/thematic-topics'
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
      thematic: 'reading.plan_thematic'
    }
    setPlanName(t(plans[savedPlan] || 'reading.plan_free'))

    // Calculate next reading based on plan type
    if (savedPlan === 'thematic') {
      // For thematic plan, show the next unread topic
      const completedTopics = data.thematicTopicsRead || []
      const nextUnreadTopic = thematicTopics.find(topic => !completedTopics.includes(topic.id))

      if (nextUnreadTopic) {
        setNextReading({
          topicId: nextUnreadTopic.id,
          displayText: t(nextUnreadTopic.titleKey),
          isThematic: true
        })
      } else {
        // All topics complete
        setNextReading({
          topicId: null,
          displayText: '✅ Alle Themen abgeschlossen!',
          isThematic: true
        })
      }
    } else {
      // For free/other plans, show next chapter
      if (data.chaptersRead && data.chaptersRead.length > 0) {
        // Sort by book and chapter to find the next one
        const sorted = [...data.chaptersRead].sort(
          (a, b) => a.book !== b.book ? a.book - b.book : a.chapter - b.chapter
        )

        const lastRead = sorted[sorted.length - 1]
        const book = bibleBooks.books[lastRead.book - 1]

        if (book) {
          let nextChapter = lastRead.chapter + 1
          let nextBook = lastRead.book

          // If we've finished all chapters in a book, move to next book
          if (nextChapter > book.chapters) {
            nextBook = lastRead.book + 1
            nextChapter = 1
          }

          // Check if there's a next book
          if (nextBook <= 66) {
            const nextBookData = bibleBooks.books[nextBook - 1]
            setNextReading({
              book: nextBookData.name,
              chapter: nextChapter,
              bookNumber: nextBook,
              displayText: `${nextBookData.name} ${nextChapter}`,
              isThematic: false
            })
          }
        }
      } else {
        // No reading yet, suggest Genesis 1
        const genesisBook = bibleBooks.books[0]
        setNextReading({
          book: genesisBook.name,
          chapter: 1,
          bookNumber: 1,
          displayText: `${genesisBook.name} 1`,
          isThematic: false
        })
      }
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

import React, { useState, useEffect } from 'react'
import { ExternalLink, Sun, Flame } from 'lucide-react'
import { t } from '../config/i18n'
import { getDailyTextUrl } from '../utils/jw-links'
import {
  isDailyTextComplete,
  markDailyTextComplete,
  unmarkDailyTextComplete,
  getDailyTextData
} from '../utils/storage'
import { saveDailyProgressToFirebase } from '../utils/firebaseUserProgress'

const DailyTextCard = () => {
  const [isComplete, setIsComplete] = useState(false)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    // Load initial state
    const complete = isDailyTextComplete()
    const data = getDailyTextData()
    setIsComplete(complete)
    setStreak(data.currentStreak)
  }, [])

  const handleToggleComplete = async () => {
    if (isComplete) {
      const data = unmarkDailyTextComplete()
      setIsComplete(false)
      setStreak(data.currentStreak)
      // Sync to Firebase
      await saveDailyProgressToFirebase(data)
    } else {
      const data = markDailyTextComplete()
      setIsComplete(true)
      setStreak(data.currentStreak)
      // Sync to Firebase
      await saveDailyProgressToFirebase(data)
    }
  }

  const handleOpenDailyText = () => {
    const language = localStorage.getItem('app_language') || 'de'
    const url = getDailyTextUrl(language)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg p-4 shadow-sm border border-indigo-100">
      <h2 className="font-semibold text-indigo-900 mb-3 text-base flex items-center gap-2">
        <Sun className="w-4 h-4" />
        {t('dailytext.title')}
      </h2>

      <p className="text-sm text-gray-700 mb-3 italic">
        {t('dailytext.preview')}
      </p>

      <div className="flex items-center gap-2 mb-3">
        {!isComplete && (
          <button
            onClick={handleToggleComplete}
            className="text-sm text-gray-600 hover:text-green-600 font-medium"
          >
            {t('dailytext.mark_read')}
          </button>
        )}
      </div>

      <div className="pt-3 border-t border-indigo-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isComplete && (
            <p className="text-sm text-green-600 font-medium">{t('dailytext.marked_read')}</p>
          )}
          {streak > 0 && (
            <p className="text-xs text-indigo-700 flex items-center gap-1">
              <Flame className="w-3 h-3" />
              <span className="font-bold">{streak} {streak === 1 ? t('dailytext.day_streak_singular') : t('dailytext.day_streak_plural')}</span>
            </p>
          )}
        </div>
        <button
          onClick={handleOpenDailyText}
          className="text-sm text-indigo-900 font-medium flex items-center gap-1 hover:text-indigo-700"
        >
          <ExternalLink className="w-4 h-4" />
          {t('dailytext.open')}
        </button>
      </div>
    </div>
  )
}

export default DailyTextCard

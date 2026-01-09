import React from 'react'
import { X, Calendar, TrendingUp, BookOpen, Clock } from 'lucide-react'
import { t } from '../config/i18n'

/**
 * Bible in One Year - Resume/Restart Modal
 *
 * Shown when user wants to start Bible in One Year but already has an existing attempt
 *
 * Props:
 * - stats: Object with { attempt, startDate, pauseDate, readingsCompleted, totalReadings, progress, daysActive }
 * - onResume: Function to resume existing plan
 * - onRestart: Function to restart with new attempt
 * - onCancel: Function to close modal
 */
export default function BibleInOneYearModal({ stats, onResume, onRestart, onCancel }) {
  if (!stats) return null

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <BookOpen className="text-blue-600 dark:text-blue-400" size={24} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {t('bibleInOneYear.modal.title')}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Plan Info */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="space-y-2 text-sm">
              {/* Start Date */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Calendar size={16} />
                  <span>{t('bibleInOneYear.modal.started')}</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatDate(stats.startDate)}
                </span>
              </div>

              {/* Pause Date */}
              {stats.pauseDate && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Clock size={16} />
                    <span>{t('bibleInOneYear.modal.paused')}</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(stats.pauseDate)}
                  </span>
                </div>
              )}

              {/* Progress */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <TrendingUp size={16} />
                  <span>{t('bibleInOneYear.modal.progress')}</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {stats.readingsCompleted}/{stats.totalReadings} ({stats.progress}%)
                </span>
              </div>

              {/* Days Active */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Calendar size={16} />
                  <span>{t('bibleInOneYear.modal.daysActive')}</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {stats.daysActive} {t('common.days')}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all"
                  style={{ width: `${stats.progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Question */}
          <p className="text-center text-gray-700 dark:text-gray-300 font-medium">
            {t('bibleInOneYear.modal.question')}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onResume}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            {t('bibleInOneYear.modal.resume')}
          </button>
          <button
            onClick={onRestart}
            className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors"
          >
            {t('bibleInOneYear.modal.restart')}
          </button>
        </div>
      </div>
    </div>
  )
}

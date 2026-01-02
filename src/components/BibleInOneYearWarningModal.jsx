import React from 'react'
import { X, AlertTriangle, BookOpen } from 'lucide-react'
import { t } from '../config/i18n'

/**
 * Bible in One Year Warning Modal
 *
 * Shown when user tries to switch away from active One Year Reading plan
 * Warns that the plan will be paused and gives user chance to cancel
 *
 * Props:
 * - onConfirm: Function to pause plan and switch (User clicked "Plan unterbrechen")
 * - onCancel: Function to close modal without switching (User clicked "Abbrechen")
 */
export default function BibleInOneYearWarningModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <AlertTriangle className="text-amber-600 dark:text-amber-400 flex-shrink-0" size={24} />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Plan unterbrechen?
          </h2>
          <button
            onClick={onCancel}
            className="ml-auto text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Warning Message */}
          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-3">
            <div className="flex gap-3">
              <BookOpen className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={20} />
              <div className="space-y-2">
                <p className="font-semibold text-amber-900 dark:text-amber-200">
                  Du bist gerade im "Bibel in einem Jahr" Plan.
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Wenn du zu einem anderen Plan wechselst, wird dein Fortschritt pausiert. Du kannst später weitermachen, wo du aufgehört hast.
                </p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>Dein Fortschritt wird gespeichert</strong> und du kannst jederzeit zurückkehren.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onCancel}
            className="flex-1 py-2 px-4 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 px-4 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
          >
            Plan unterbrechen
          </button>
        </div>
      </div>
    </div>
  )
}

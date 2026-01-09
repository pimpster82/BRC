import React from 'react'
import { X } from 'lucide-react'
import { t } from '../config/i18n'

/**
 * Bible in One Year Plan Switch Modal
 *
 * Shown when user tries to switch away from active One Year Reading plan
 * Informs that the plan will be paused and data is safe
 *
 * Props:
 * - planName: Name of the plan being paused (e.g., "Bibel in einem Jahr")
 * - onConfirm: Function to pause plan and switch
 * - onCancel: Function to close modal without switching
 */
export default function BibleInOneYearWarningModal({ planName = 'Plan', onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-sm w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {planName} pausieren
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          <p className="text-gray-700 dark:text-gray-300">
            Du wechselst zu einem anderen Plan. Dein Fortschritt wird pausiert und bleibt erhalten.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Du kannst jederzeit zurückkehren und weitermachen, wo du aufgehört hast.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onCancel}
            className="flex-1 py-2 px-4 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
          >
            Pausieren
          </button>
        </div>
      </div>
    </div>
  )
}

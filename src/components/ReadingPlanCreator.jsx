import React, { useState } from 'react'
import { BookOpen, X, AlertCircle, CheckCircle } from 'lucide-react'
import { parseReadingPlan, validatePlan, formatPlanPreview } from '../utils/readingPlanParser'

/**
 * ReadingPlanCreator - Modal for creating/uploading custom reading plans
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close callback
 * @param {Function} props.onUpload - Upload callback with plan data
 */
const ReadingPlanCreator = ({ isOpen, onClose, onUpload }) => {
  const [planText, setPlanText] = useState('')
  const [parsedPlan, setParsedPlan] = useState(null)
  const [preview, setPreview] = useState('')
  const [errors, setErrors] = useState([])
  const [validationErrors, setValidationErrors] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const handlePreview = () => {
    setErrors([])
    setValidationErrors([])

    if (!planText.trim()) {
      setErrors(['Plan text is empty'])
      return
    }

    try {
      const plan = parseReadingPlan(planText)
      setParsedPlan(plan)

      // Validate
      const validation = validatePlan(plan)
      if (!validation.valid) {
        setValidationErrors(validation.errors)
        setPreview(formatPlanPreview(plan))
        return
      }

      setValidationErrors([])
      setPreview(formatPlanPreview(plan))
    } catch (error) {
      setErrors([error.message])
      setParsedPlan(null)
      setPreview('')
    }
  }

  const handleUpload = async () => {
    if (!parsedPlan || validationErrors.length > 0) {
      setErrors(['Please fix validation errors before uploading'])
      return
    }

    setIsLoading(true)
    try {
      await onUpload(parsedPlan)
      setPlanText('')
      setParsedPlan(null)
      setPreview('')
      setErrors([])
      onClose()
    } catch (error) {
      setErrors([error.message])
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setPlanText('')
    setParsedPlan(null)
    setPreview('')
    setErrors([])
    setValidationErrors([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-300">Create Reading Plan</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Side */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Plan Text (Paste your plan)
              </label>
              <textarea
                value={planText}
                onChange={(e) => setPlanText(e.target.value)}
                placeholder={`---
id: my_plan
name: [de] Mein Plan | [en] My Plan | [es] Mi Plan | [it] Mio Piano | [fr] Mon Plan
type: thematic
---

# [de] Section 1 | [en] Section 1
## [de] Topic | [en] Topic
01:1:1-5`}
                className="w-full h-64 px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePreview}
                disabled={isLoading || !planText.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Preview
              </button>
              <button
                onClick={handleUpload}
                disabled={isLoading || !parsedPlan || validationErrors.length > 0}
                className="flex-1 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg font-medium hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Uploading...' : 'Upload to Firebase'}
              </button>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="space-y-2">
                {errors.map((error, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-2"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview Side */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preview
              </label>
              <div className="h-64 px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-slate-800 rounded-lg overflow-y-auto">
                {preview ? (
                  <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                    {preview}
                  </pre>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Preview will appear here</p>
                )}
              </div>
            </div>

            {/* Validation Status */}
            {validationErrors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Validation Issues:</p>
                {validationErrors.map((error, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex gap-2"
                  >
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">{error}</p>
                  </div>
                ))}
              </div>
            )}

            {parsedPlan && validationErrors.length === 0 && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700 dark:text-green-300">Plan is valid and ready to upload!</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Help */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-slate-800">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            📖 <strong>Format:</strong> YAML header with sections and multilingual content. See docs for examples.
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            ⏱️ <strong>Time Directives:</strong> /1D, /7D, /1W, /1M, /3M, /1Y (auto-divide verses)
          </p>
        </div>
      </div>
    </div>
  )
}

export default ReadingPlanCreator

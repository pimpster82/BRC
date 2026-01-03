import React, { useState, useEffect } from 'react'
import {
  getAdminTemplates,
  saveAdminTemplates,
  addAdminTemplate,
  updateAdminTemplate,
  deleteAdminTemplate,
  NOTIFICATION_TYPES,
  LANGUAGES,
  getNotificationTypeLabel,
  getLanguageName
} from '../utils/firebaseTemplatesAdmin'
import { X, Plus, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { t } from '../config/i18n'

/**
 * Admin Message Templates Management Component
 * Allows admins to manage notification message templates in Firebase
 */
export const AdminMessageTemplates = () => {
  const [expandedType, setExpandedType] = useState(null)
  const [expandedLanguage, setExpandedLanguage] = useState(null)
  const [templates, setTemplates] = useState({})
  const [loading, setLoading] = useState({})
  const [editingState, setEditingState] = useState({
    isEditing: false,
    type: null,
    language: null,
    index: null,
    value: ''
  })
  const [newTemplateState, setNewTemplateState] = useState({
    type: null,
    language: null,
    value: ''
  })
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  // Load templates when language is expanded
  useEffect(() => {
    if (expandedLanguage) {
      const [type, lang] = expandedLanguage.split(':')
      loadTemplates(type, lang)
    }
  }, [expandedLanguage])

  const loadTemplates = async (notificationType, language) => {
    setLoading(prev => ({ ...prev, [expandedLanguage]: true }))
    try {
      const data = await getAdminTemplates(notificationType, language)
      setTemplates(prev => ({
        ...prev,
        [expandedLanguage]: data || []
      }))
    } catch (error) {
      showError('Failed to load templates')
    } finally {
      setLoading(prev => ({ ...prev, [expandedLanguage]: false }))
    }
  }

  const handleEditStart = (type, language, index, value) => {
    setEditingState({
      isEditing: true,
      type,
      language,
      index,
      value
    })
  }

  const handleEditCancel = () => {
    setEditingState({
      isEditing: false,
      type: null,
      language: null,
      index: null,
      value: ''
    })
  }

  const handleEditSave = async () => {
    const { type, language, index, value } = editingState
    try {
      const success = await updateAdminTemplate(type, language, index, value)
      if (success) {
        showSuccess(`Template updated`)
        loadTemplates(type, language)
        handleEditCancel()
      } else {
        showError('Failed to update template')
      }
    } catch (error) {
      showError('Error updating template')
    }
  }

  const handleDeleteTemplate = async (type, language, index) => {
    if (!window.confirm('Delete this template?')) return

    try {
      const success = await deleteAdminTemplate(type, language, index)
      if (success) {
        showSuccess('Template deleted')
        loadTemplates(type, language)
      } else {
        showError('Failed to delete template')
      }
    } catch (error) {
      showError('Error deleting template')
    }
  }

  const handleAddTemplate = async () => {
    const { type, language, value } = newTemplateState

    if (!type || !language || !value.trim()) {
      showError('Please fill in all fields')
      return
    }

    try {
      const success = await addAdminTemplate(type, language, value)
      if (success) {
        showSuccess('Template added')
        loadTemplates(type, language)
        setNewTemplateState({ type: null, language: null, value: '' })
      } else {
        showError('Failed to add template')
      }
    } catch (error) {
      showError('Error adding template')
    }
  }

  const showSuccess = (message) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const showError = (message) => {
    setErrorMessage(message)
    setTimeout(() => setErrorMessage(null), 3000)
  }

  return (
    <div className="space-y-4">
      {/* Messages */}
      {successMessage && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg text-green-700 dark:text-green-300 text-sm">
          ✓ {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
          ✗ {errorMessage}
        </div>
      )}

      {/* Notification Types */}
      {NOTIFICATION_TYPES.map((notificationType) => (
        <div key={notificationType} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg p-0">
          {/* Type Header */}
          <button
            onClick={() => setExpandedType(expandedType === notificationType ? null : notificationType)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">{getNotificationTypeLabel(notificationType)}</h3>
            {expandedType === notificationType ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {/* Languages */}
          {expandedType === notificationType && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
              {LANGUAGES.map((language) => {
                const key = `${notificationType}:${language}`
                const typeTemplates = templates[key] || []
                const isExpanded = expandedLanguage === key

                return (
                  <div key={key} className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                    {/* Language Header */}
                    <button
                      onClick={() => setExpandedLanguage(isExpanded ? null : key)}
                      className="w-full flex items-center justify-between hover:opacity-75 transition-opacity"
                    >
                      <h4 className="font-medium text-gray-700 dark:text-gray-300">
                        {getLanguageName(language)}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {typeTemplates.length} templates
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* Templates List */}
                    {isExpanded && (
                      <div className="mt-3 space-y-2">
                        {loading[key] ? (
                          <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
                        ) : typeTemplates.length === 0 ? (
                          <p className="text-sm text-gray-600 dark:text-gray-400">No templates yet</p>
                        ) : (
                          typeTemplates.map((template, index) => (
                            <div key={index} className="flex items-start gap-2 p-2 bg-white dark:bg-slate-900 rounded border border-gray-200 dark:border-gray-700 group">
                              {editingState.isEditing && editingState.type === notificationType && editingState.language === language && editingState.index === index ? (
                                // Edit Mode
                                <div className="flex-1 space-y-2">
                                  <textarea
                                    value={editingState.value}
                                    onChange={(e) =>
                                      setEditingState(prev => ({ ...prev, value: e.target.value }))
                                    }
                                    className="w-full p-2 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-gray-200 dark:border-blue-500"
                                    rows="3"
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      onClick={handleEditCancel}
                                      className="px-3 py-1 text-sm bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={handleEditSave}
                                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                // View Mode
                                <>
                                  <p className="flex-1 text-sm text-gray-700 dark:text-gray-300 py-1">
                                    {template}
                                  </p>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                    <button
                                      onClick={() => handleEditStart(notificationType, language, index, template)}
                                      className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                                      title="Edit template"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTemplate(notificationType, language, index)}
                                      className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                                      title="Delete template"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))
                        )}

                        {/* Add New Template */}
                        {newTemplateState.type === notificationType && newTemplateState.language === language ? (
                          <div className="p-2 bg-white dark:bg-slate-900 rounded border border-green-300 dark:border-green-700 space-y-2">
                            <textarea
                              value={newTemplateState.value}
                              onChange={(e) =>
                                setNewTemplateState(prev => ({ ...prev, value: e.target.value }))
                              }
                              placeholder="Enter new template message..."
                              className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-800 dark:text-gray-200 dark:border-gray-600"
                              rows="2"
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setNewTemplateState({ type: null, language: null, value: '' })}
                                className="px-3 py-1 text-sm bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleAddTemplate}
                                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setNewTemplateState({ type: notificationType, language, value: '' })}
                            className="w-full flex items-center justify-center gap-2 p-2 text-sm text-green-600 dark:text-green-400 border border-green-300 dark:border-green-700 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Add template
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default AdminMessageTemplates

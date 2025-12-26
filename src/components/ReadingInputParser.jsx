import React, { useState } from 'react'
import { parseReadingInput } from '../utils/readingParser'

/**
 * Reusable Reading Input Parser Component
 * Handles user input, parsing, suggestions, and callbacks
 */
const ReadingInputParser = ({
  defaultBook = null,
  placeholder = "z.B. Isa 3-4:15",
  onSuccess,
  onCancel,
  showExamples = true
}) => {
  const [input, setInput] = useState('')
  const [error, setError] = useState(null)
  const [suggestion, setSuggestion] = useState(null)
  const [parsedResult, setParsedResult] = useState(null)

  const handleSubmit = () => {
    if (!input.trim()) {
      setError('Bitte Eingabe machen')
      return
    }

    const result = parseReadingInput(input, defaultBook)

    // Handle suggestions
    if (result.suggestion) {
      setSuggestion(result.suggestion)
      setError(null)
      setParsedResult(null)
      return
    }

    // Handle errors
    if (result.error) {
      setError(result.error)
      setSuggestion(null)
      setParsedResult(null)
      return
    }

    // Success
    setParsedResult(result)
    setError(null)
    setSuggestion(null)

    if (onSuccess) {
      onSuccess(result)
    }
  }

  const handleAcceptSuggestion = (suggestedBook) => {
    if (!suggestion) return

    // Reconstruct input with suggested book
    const newInput = `${suggestedBook.name} ${suggestion.referenceText}`
    setInput(newInput)
    setSuggestion(null)
    setError(null)
  }

  const handleReset = () => {
    setInput('')
    setError(null)
    setSuggestion(null)
    setParsedResult(null)
  }

  return (
    <div className="reading-input-parser">
      {/* Input Field */}
      <div className="mb-3">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setError(null)
            setSuggestion(null)
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSubmit()
            }
          }}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Error Message */}
        {error && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}

        {/* Suggestions */}
        {suggestion && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            {suggestion.type === 'did_you_mean' && (
              <>
                <p className="text-sm font-medium text-yellow-900 mb-2">
                  Meintest du...?
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestion.suggestions.map((book) => (
                    <button
                      key={book.number}
                      onClick={() => handleAcceptSuggestion(book)}
                      className="text-sm bg-white dark:bg-slate-900 border border-yellow-300 px-3 py-1 rounded hover:bg-yellow-100 text-yellow-900"
                    >
                      {book.name}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setSuggestion(null)}
                  className="text-xs text-gray-600 mt-2 hover:text-gray-800"
                >
                  Abbrechen
                </button>
              </>
            )}
            {suggestion.type === 'unclear' && (
              <>
                <p className="text-sm font-medium text-yellow-900 mb-2">
                  Welches Buch meinst du?
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestion.suggestions.map((book) => (
                    <button
                      key={book.number}
                      onClick={() => handleAcceptSuggestion(book)}
                      className="text-sm bg-white dark:bg-slate-900 border border-yellow-300 px-3 py-1 rounded hover:bg-yellow-100 text-yellow-900"
                    >
                      {book.name}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setSuggestion(null)}
                  className="text-xs text-gray-600 mt-2 hover:text-gray-800"
                >
                  Neu eingeben
                </button>
              </>
            )}
            {suggestion.type === 'not_found' && (
              <>
                <p className="text-sm text-yellow-900">
                  Buch "{suggestion.input}" nicht gefunden. Bitte erneut versuchen.
                </p>
                <button
                  onClick={() => setSuggestion(null)}
                  className="text-xs text-gray-600 mt-2 hover:text-gray-800"
                >
                  OK
                </button>
              </>
            )}
            {suggestion.type === 'invalid_chapter' && (
              <>
                <p className="text-sm text-yellow-900 mb-2">
                  <strong>{suggestion.bookName}</strong> hat nur{' '}
                  <strong>{suggestion.maxChapters}</strong> Kapitel.
                </p>
                <p className="text-sm font-medium text-yellow-900 mb-2">
                  Meintest du:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestion.suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInput(`${suggestion.bookName} ${sug.display}`)
                        setSuggestion(null)
                      }}
                      className="text-sm bg-white dark:bg-slate-900 border border-yellow-300 px-3 py-1 rounded hover:bg-yellow-100 text-yellow-900"
                    >
                      <strong>{sug.display}</strong>
                      <span className="text-xs text-gray-600 ml-1">({sug.description})</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setSuggestion(null)}
                  className="text-xs text-gray-600 mt-2 hover:text-gray-800"
                >
                  Neu eingeben
                </button>
              </>
            )}
          </div>
        )}

        {/* Examples */}
        {showExamples && (
          <div className="mt-2 text-xs text-gray-600">
            <p className="font-medium mb-1">Beispiele:</p>
            <p>• <code className="bg-gray-100 dark:bg-slate-800 px-1 rounded">3</code> → Kapitel 3 komplett</p>
            <p>• <code className="bg-gray-100 dark:bg-slate-800 px-1 rounded">3-5</code> → Kapitel 3 bis 5</p>
            <p>• <code className="bg-gray-100 dark:bg-slate-800 px-1 rounded">3-4:15</code> → Kap 3 komplett, 4 bis Vers 15</p>
            <p>• <code className="bg-gray-100 dark:bg-slate-800 px-1 rounded">3:1,2</code> → Kap 3 Verse 1 und 2</p>
            <p>• <code className="bg-gray-100 dark:bg-slate-800 px-1 rounded">3:1,2; 4:15</code> → Kap 3 V. 1-2 und Kap 4 V. 15</p>
            <p className="mt-1 text-gray-500">
              <strong>Trenner:</strong> <code>,</code> = und · <code>;</code> = weiterer Text · <code>-</code> = bis
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Speichern
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Abbrechen
          </button>
        )}
      </div>
    </div>
  )
}

export default ReadingInputParser

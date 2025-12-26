import React, { useState } from 'react'
import { ArrowLeft, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { parseReadingInput } from '../utils/readingParser'
import { t } from '../config/i18n'

const ParserTestBench = () => {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [testHistory, setTestHistory] = useState([])

  const handleTest = () => {
    if (!input.trim()) return

    const parseResult = parseReadingInput(input)
    const timestamp = new Date().toLocaleTimeString('de-DE')

    const testResult = {
      input,
      result: parseResult,
      timestamp
    }

    setResult(testResult)
    setTestHistory([testResult, ...testHistory.slice(0, 9)]) // Keep last 10
  }

  const renderResult = (testResult) => {
    const { result: parseResult } = testResult

    if (parseResult.error) {
      return (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="font-semibold text-red-900">{t('test.error')}</span>
          </div>
          <p className="text-sm text-red-700">{parseResult.error}</p>
        </div>
      )
    }

    if (parseResult.suggestion) {
      return (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-5 h-5 text-yellow-600" />
            <span className="font-semibold text-yellow-900">{t('test.suggestion')}</span>
          </div>
          <p className="text-sm text-yellow-700 mb-2">
            <strong>Type:</strong> {parseResult.suggestion.type}
          </p>

          {/* Book suggestions */}
          {parseResult.suggestion.suggestions && parseResult.suggestion.suggestions[0]?.number && (
            <div className="text-sm">
              <p className="text-yellow-700 mb-1">{t('test.suggested_books')}</p>
              <div className="flex flex-wrap gap-1">
                {parseResult.suggestion.suggestions.map(book => (
                  <span key={book.number} className="bg-white px-2 py-1 rounded text-yellow-900 text-xs">
                    {book.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Invalid chapter suggestions */}
          {parseResult.suggestion.type === 'invalid_chapter' && (
            <div className="text-sm">
              <p className="text-yellow-700 mb-2">
                {t('test.only_chapters', null, {book: parseResult.suggestion.bookName, chapters: parseResult.suggestion.maxChapters})}
              </p>
              <p className="text-yellow-700 mb-1">{t('test.did_you_mean')}</p>
              <div className="flex flex-wrap gap-2">
                {parseResult.suggestion.suggestions.map((sug, idx) => (
                  <span key={idx} className="bg-white px-3 py-2 rounded text-yellow-900 text-sm">
                    <strong>{sug.display}</strong>
                    <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">({sug.description})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }

    if (parseResult.chapters && parseResult.chapters.length > 0) {
      return (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-900">{t('test.success')}</span>
          </div>

          {parseResult.book && (
            <div className="mb-3 p-2 bg-white rounded">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Buch:</strong> {parseResult.book.name} (#{parseResult.book.number})
              </p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-green-900">
              Kapitel ({parseResult.chapters.length}):
            </p>
            {parseResult.chapters.map((chapter, idx) => (
              <div key={idx} className="p-2 bg-white rounded">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Kapitel {chapter.chapter}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    chapter.status === 'complete'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {chapter.status === 'complete' ? 'Komplett' : 'Teilweise'}
                  </span>
                </div>
                {chapter.status === 'partial' && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {chapter.verses === 999
                      ? `Ab Vers ${chapter.continueFrom} bis Ende`
                      : `Bis Vers ${chapter.verses}${chapter.continueFrom && chapter.continueFrom > 1 && chapter.verses !== 999 ? ` · Weiter ab Vers ${chapter.continueFrom}` : ''}`
                    }
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="p-3 bg-gray-50 border border-gray-200 dark:border-gray-700 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">Kein Ergebnis</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 pt-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Zurück
          </button>

          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Parser Test Bench
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Teste und validiere Bibel-Referenz Eingaben
          </p>
        </div>

        {/* Test Input */}
        <div className="card card-blue mb-6">
          <h2 className="font-semibold text-blue-900 mb-4">Test Eingabe</h2>

          <div className="mb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleTest()
                }
              }}
              placeholder="z.B. Isa 3-4:15 oder Gen 1:1,2; 2:3"
              className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            />
          </div>

          <button
            onClick={handleTest}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Test Parsen
          </button>
        </div>

        {/* Current Result */}
        {result && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Aktuelles Ergebnis: "{result.input}"
            </h3>
            {renderResult(result)}
          </div>
        )}

        {/* Test History */}
        {testHistory.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Test Historie ({testHistory.length})
            </h3>
            <div className="space-y-3">
              {testHistory.map((test, idx) => (
                <div key={idx} className="card card-blue">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm font-mono text-blue-900">
                      {test.input}
                    </code>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {test.timestamp}
                    </span>
                  </div>
                  {renderResult(test)}
                </div>
              ))}
            </div>

            <button
              onClick={() => setTestHistory([])}
              className="mt-4 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200"
            >
              Historie löschen
            </button>
          </div>
        )}

        {/* Quick Test Examples */}
        <div className="mt-8 card bg-white border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Quick Tests</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              '3',
              '3-5',
              '3:1,2',
              '3-4:15',
              'Isa 3-5',
              'Gen 1:1',
              '1 Tim 3:1,2',
              'Isaih 3',
              'Jo 3',
              'Genesis 1:1,2; 2:3'
            ].map((example) => (
              <button
                key={example}
                onClick={() => {
                  setInput(example)
                  setTimeout(() => handleTest(), 100)
                }}
                className="text-left text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded text-gray-700 dark:text-gray-300"
              >
                <code>{example}</code>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ParserTestBench

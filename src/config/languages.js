// Language configuration for the Bible Reading Companion
// Add new languages here when needed

import bibleBooksDe from '../../data/bible-books-de.json'
import bibleBooksEn from '../../data/bible-books-en.json'
import bibleBooksEs from '../../data/bible-books-es.json'
import bibleBooksIt from '../../data/bible-books-it.json'
import bibleBooksFr from '../../data/bible-books-fr.json'

export const SUPPORTED_LANGUAGES = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
]

export const DEFAULT_LANGUAGE = 'en'

// Bible books database by language
export const BIBLE_BOOKS_BY_LANGUAGE = {
  de: bibleBooksDe,
  en: bibleBooksEn,
  es: bibleBooksEs,
  it: bibleBooksIt,
  fr: bibleBooksFr
}

/**
 * Get Bible books for a specific language
 * @param {string} languageCode - Language code (de, en, es, it, fr)
 * @returns {Object} Bible books database
 */
export const getBibleBooks = (languageCode = DEFAULT_LANGUAGE) => {
  return BIBLE_BOOKS_BY_LANGUAGE[languageCode] || BIBLE_BOOKS_BY_LANGUAGE[DEFAULT_LANGUAGE]
}

/**
 * Get current language from localStorage or default
 * @returns {string} Language code
 */
export const getCurrentLanguage = () => {
  return localStorage.getItem('app_language') || DEFAULT_LANGUAGE
}

/**
 * Set current language in localStorage
 * @param {string} languageCode - Language code
 */
export const setCurrentLanguage = (languageCode) => {
  if (BIBLE_BOOKS_BY_LANGUAGE[languageCode]) {
    localStorage.setItem('app_language', languageCode)
    return true
  }
  return false
}

/**
 * JW.org Links Builder
 * Maps language codes to JW.org language codes for Daily Text and other content
 */

// Mapping from app language codes to JW.org language codes
const jwLanguageCodes = {
  de: 'r10/lp-x',      // German: lp-x (Deutsch)
  en: 'r1/lp-e',       // English: lp-e (English)
  es: 'r4/lp-s',       // Spanish: lp-s (Español)
  it: 'r6/lp-i',       // Italian: lp-i (Italiano)
  fr: 'r30/lp-f'       // French: lp-f (Français)
}

// Mapping from app language codes to JW.org wtlocale codes for finder URLs
const wtLocaleMap = {
  de: 'X',   // German
  en: 'E',   // English
  es: 'S',   // Spanish
  it: 'I',   // Italian
  fr: 'F'    // French
}

/**
 * Get the JW.org Daily Text URL for the current language with current date
 * Uses mobile-friendly finder URL format with dynamic date parameter
 * @param {string} language - Language code (de, en, es, it, fr)
 * @param {Date} date - Date for the daily text (optional, defaults to today)
 * @returns {string} Full URL to JW.org Daily Text with date
 */
export const getDailyTextUrl = (language = 'en', date = null) => {
  // Get current date or use provided date
  const dateObj = date || new Date()

  // Format date as YYYYMMDD
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  const dateStr = `${year}${month}${day}`

  // Get wtlocale code for language
  const wtlocale = wtLocaleMap[language] || wtLocaleMap['en']

  // Use mobile-friendly finder URL format
  return `https://www.jw.org/finder?srcid=jwlshare&wtlocale=${wtlocale}&prefer=lang&alias=daily-text&date=${dateStr}`
}

/**
 * Get the JW.org Home Page URL for the current language
 * @param {string} language - Language code (de, en, es, it, fr)
 * @returns {string} Full URL to JW.org home page
 */
export const getJwHomeUrl = (language = 'en') => {
  const jwCode = jwLanguageCodes[language] || jwLanguageCodes['en']
  return `https://wol.jw.org/${language}/wol/h/${jwCode}`
}

/**
 * Get the JW.org Bible Reading Plan URL for the current language
 * @param {string} language - Language code (de, en, es, it, fr)
 * @returns {string} Full URL to JW.org Bible Reading Plan
 */
export const getBibleReadingPlanUrl = (language = 'en') => {
  const jwCode = jwLanguageCodes[language] || jwLanguageCodes['en']
  return `https://wol.jw.org/${language}/wol/h/${jwCode}`
}

export default {
  getDailyTextUrl,
  getJwHomeUrl,
  getBibleReadingPlanUrl
}

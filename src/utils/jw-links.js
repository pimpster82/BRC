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

/**
 * Get the JW.org Daily Text URL for the current language
 * @param {string} language - Language code (de, en, es, it, fr)
 * @returns {string} Full URL to JW.org Daily Text
 */
export const getDailyTextUrl = (language = 'en') => {
  const jwCode = jwLanguageCodes[language] || jwLanguageCodes['en']
  return `https://wol.jw.org/${language}/wol/dt/${jwCode}`
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

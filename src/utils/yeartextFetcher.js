/**
 * Yeartext data - manually defined per language and year
 * Update this object when new yeartexts are published
 */
const YEARTEXT_DATA = {
  2026: {
    de: {
      scripture: "Matthäus 5:3",
      text: "Glücklich sind die geistig Armen"
    },
    en: {
      scripture: "Matthew 5:3",
      text: "Happy are those conscious of their spiritual need."
    },
    es: {
      scripture: "Mateo 5:3",
      text: "Dichosos los que tienen conciencia de su necesidad espiritual"
    },
    it: {
      scripture: "Matteo 5:3",
      text: "Felici quelli che sono consapevoli del loro bisogno spirituale"
    },
    fr: {
      scripture: "Matthieu 5:3",
      text: "Heureux ceux qui ont conscience de leur besoin spirituel"
    }
  }
  // Add more years as needed:
  // 2027: {
  //   de: { scripture: "...", text: "..." },
  //   en: { scripture: "...", text: "..." },
  //   // ...
  // }
}

/**
 * Get yeartext for a specific year and language
 * @param {number} year - The year (e.g., 2026)
 * @param {string} language - Language code (de, en, es, it, fr)
 * @returns {Promise<Object>} - { scripture, text, language, year } or null if not found
 */
export const fetchYeartextFromWol = async (year, language = 'en') => {
  try {
    // Normalize language to fallback to 'en' if not available
    const lang = (YEARTEXT_DATA[year] && YEARTEXT_DATA[year][language]) ? language : 'en'

    if (!YEARTEXT_DATA[year]) {
      console.warn(`⚠ Yeartext data for year ${year} not available`)
      return null
    }

    if (!YEARTEXT_DATA[year][lang]) {
      console.warn(`⚠ Yeartext data for ${lang}/${year} not available`)
      return null
    }

    const data = YEARTEXT_DATA[year][lang]

    return {
      scripture: data.scripture,
      text: data.text,
      language: lang,
      year: year,
      fetchedAt: new Date().toISOString()
    }
  } catch (error) {
    console.error(`✗ Error fetching yeartext [${language}/${year}]:`, error.message)
    return null
  }
}

/**
 * Save yeartext to localStorage cache
 * @param {number} year - The year
 * @param {Object} yeartextData - The yeartext object
 * @param {string} language - Language code
 */
export const saveYeartextToCache = (year, yeartextData, language) => {
  try {
    const cacheKey = `yeartext_${year}_${language}`
    localStorage.setItem(cacheKey, JSON.stringify(yeartextData))
    console.log(`✓ Cached yeartext [${language}/${year}]`)
  } catch (error) {
    console.warn(`Could not save yeartext to cache: ${error.message}`)
  }
}

/**
 * Get yeartext from localStorage cache
 * @param {number} year - The year
 * @param {string} language - Language code
 * @returns {Object|null} - Cached yeartext or null
 */
export const getYeartextFromCache = (year, language) => {
  try {
    const cacheKey = `yeartext_${year}_${language}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      console.log(`✓ Loaded yeartext [${language}/${year}] from cache`)
      return JSON.parse(cached)
    }
    return null
  } catch (error) {
    console.warn(`Could not retrieve yeartext from cache: ${error.message}`)
    return null
  }
}

export default {
  fetchYeartextFromWol,
  saveYeartextToCache,
  getYeartextFromCache
}

/**
 * Firebase Message Templates System
 * Loads and caches notification message templates from Firebase
 * Allows dynamic message updates without redeploying app
 *
 * Structure:
 * /notification_templates/{notificationType}/{language}/messages: [...]
 */

import { database } from '../config/firebase'
import { ref, get } from 'firebase/database'

const TEMPLATE_CACHE_KEY = 'brc_message_templates'
const TEMPLATE_CACHE_TIME = 1000 * 60 * 60 * 24 // 24 hours

/**
 * Get message template from Firebase or cache
 * @param {string} notificationType - Type of notification (daily_text, weekly_reading, etc.)
 * @param {string} language - Language code (de, en, es, it, fr)
 * @returns {Promise<string[]>} Array of message templates
 */
export const getMessageTemplates = async (notificationType, language) => {
  const cacheKey = `${notificationType}_${language}`

  // Check cache first
  const cached = getCachedTemplates(cacheKey)
  if (cached) {
    console.log(`[Templates] Using cached templates for ${cacheKey}`)
    return cached
  }

  try {
    // Fetch from Firebase
    const templateRef = ref(database, `notification_templates/${notificationType}/${language}/messages`)
    const snapshot = await get(templateRef)

    if (snapshot.exists()) {
      const templates = snapshot.val()
      console.log(`[Templates] Loaded ${templates.length} templates for ${cacheKey}`)

      // Cache the result
      setCachedTemplates(cacheKey, templates)

      return templates
    } else {
      console.warn(`[Templates] No templates found for ${cacheKey}`)
      return getFallbackTemplates(notificationType, language)
    }
  } catch (error) {
    console.error(`[Templates] Error loading ${cacheKey}:`, error)

    // Try cache anyway (might be stale but better than nothing)
    const staleCache = getCachedTemplates(cacheKey, true)
    if (staleCache) {
      return staleCache
    }

    return getFallbackTemplates(notificationType, language)
  }
}

/**
 * Get a random message from templates
 * @param {string} notificationType - Type of notification
 * @param {string} language - Language code
 * @returns {Promise<string>} Random message template
 */
export const getRandomMessage = async (notificationType, language) => {
  const templates = await getMessageTemplates(notificationType, language)

  if (!templates || templates.length === 0) {
    return `[${notificationType}]`
  }

  const randomIndex = Math.floor(Math.random() * templates.length)
  return templates[randomIndex]
}

/**
 * Get cached templates
 * @param {string} cacheKey - Cache key
 * @param {boolean} ignoreExpiry - Get even if expired
 * @returns {string[]|null} Cached templates or null
 */
const getCachedTemplates = (cacheKey, ignoreExpiry = false) => {
  try {
    const cache = JSON.parse(localStorage.getItem(TEMPLATE_CACHE_KEY) || '{}')
    const entry = cache[cacheKey]

    if (!entry) {
      return null
    }

    // Check if expired
    if (!ignoreExpiry && Date.now() - entry.timestamp > TEMPLATE_CACHE_TIME) {
      return null
    }

    return entry.templates
  } catch (error) {
    console.error('[Templates] Cache read error:', error)
    return null
  }
}

/**
 * Set cached templates
 * @param {string} cacheKey - Cache key
 * @param {string[]} templates - Message templates
 */
const setCachedTemplates = (cacheKey, templates) => {
  try {
    const cache = JSON.parse(localStorage.getItem(TEMPLATE_CACHE_KEY) || '{}')

    cache[cacheKey] = {
      templates,
      timestamp: Date.now()
    }

    localStorage.setItem(TEMPLATE_CACHE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.error('[Templates] Cache write error:', error)
  }
}

/**
 * Clear template cache
 * @param {string|null} cacheKey - Specific key or null for all
 */
export const clearTemplateCache = (cacheKey = null) => {
  try {
    if (cacheKey) {
      const cache = JSON.parse(localStorage.getItem(TEMPLATE_CACHE_KEY) || '{}')
      delete cache[cacheKey]
      localStorage.setItem(TEMPLATE_CACHE_KEY, JSON.stringify(cache))
    } else {
      localStorage.removeItem(TEMPLATE_CACHE_KEY)
    }
    console.log('[Templates] Cache cleared')
  } catch (error) {
    console.error('[Templates] Cache clear error:', error)
  }
}

/**
 * Fallback templates (embedded in app, used when Firebase unavailable)
 * @param {string} notificationType - Type of notification
 * @param {string} language - Language code
 * @returns {string[]} Fallback templates
 */
const getFallbackTemplates = (notificationType, language) => {
  const fallbacks = {
    daily_text: {
      de: [
        '📖 Tagestext wartet auf dich!',
        'Schaffst du es heute?',
        'Eine neue Seite wartet!',
        'Bereit für deinen Tagestext?'
      ],
      en: [
        '📖 Daily Text is waiting!',
        'Can you make it today?',
        'A new passage awaits!',
        'Ready for your Daily Text?'
      ],
      es: [
        '📖 ¡Tu Texto Diario te espera!',
        '¿Puedes hacerlo hoy?',
        '¡Un nuevo pasaje te espera!',
        '¿Listo para tu Texto Diario?'
      ],
      it: [
        '📖 Il tuo Testo Giornaliero ti aspetta!',
        'Puoi farcela oggi?',
        'Un nuovo passo ti aspetta!',
        'Pronto per il tuo Testo Giornaliero?'
      ],
      fr: [
        '📖 Ton Texte Quotidien t\'attend!',
        'Peux-tu le faire aujourd\'hui?',
        'Un nouveau passage t\'attend!',
        'Prêt pour ton Texte Quotidien?'
      ]
    },
    weekly_reading: {
      de: [
        '📚 Wöchentliches Lesen wartet!',
        'Zeit zum Lesen!',
        'Bereite dich vor!',
        'Die Woche beginnt!'
      ],
      en: [
        '📚 Weekly Reading awaits!',
        'Time to read!',
        'Prepare yourself!',
        'The week begins!'
      ],
      es: [
        '📚 ¡La Lectura Semanal te espera!',
        '¡Hora de leer!',
        '¡Prepárate!',
        '¡La semana comienza!'
      ],
      it: [
        '📚 La Lettura Settimanale ti aspetta!',
        'Ora di leggere!',
        'Preparati!',
        'La settimana inizia!'
      ],
      fr: [
        '📚 Ta Lecture Hebdomadaire t\'attend!',
        'Temps de lire!',
        'Prépare-toi!',
        'La semaine commence!'
      ]
    },
    personal_reading: {
      de: [
        '📘 Dein Bibelleseplan!',
        'Weiterlesen?',
        'Wo bist du stehen geblieben?',
        'Zeit zum Lesen!'
      ],
      en: [
        '📘 Your Bible Plan!',
        'Continue reading?',
        'Where did you leave off?',
        'Time to read!'
      ],
      es: [
        '📘 ¡Tu Plan Bíblico!',
        '¿Continuar leyendo?',
        '¿Dónde te detuviste?',
        '¡Hora de leer!'
      ],
      it: [
        '📘 Il tuo Piano Biblico!',
        'Continua a leggere?',
        'Dove ti sei fermato?',
        'Ora di leggere!'
      ],
      fr: [
        '📘 Ton Plan Biblique!',
        'Continuer à lire?',
        'Où t\'es-tu arrêté?',
        'Temps de lire!'
      ]
    },
    streak_preservation: {
      de: [
        '🔥 Du warst so nah dran! Noch eine einmal?',
        '🔥 5 Tage in Folge! Schaffst du es nochmal?',
        '🔥 Großartig dabei! Willst du heute noch lesen?',
        '🔥 Es wäre schade, wenn du heute stoppst! Noch einmal?'
      ],
      en: [
        '🔥 You were so close! One more time?',
        '🔥 5 days in a row! Can you make it again?',
        '🔥 Great job! Want to read today?',
        '🔥 It would be a shame to stop now! One more?'
      ],
      es: [
        '🔥 ¡Estabas tan cerca! ¿Una vez más?',
        '🔥 ¡5 días seguidos! ¿Puedes hacerlo de nuevo?',
        '🔥 ¡Buen trabajo! ¿Quieres leer hoy?',
        '🔥 ¡Sería una pena parar ahora! ¿Una más?'
      ],
      it: [
        '🔥 Eri così vicino! Un\'altra volta?',
        '🔥 5 giorni di fila! Puoi farcela di nuovo?',
        '🔥 Ottimo lavoro! Vuoi leggere oggi?',
        '🔥 Sarebbe un peccato fermarsi ora! Un\'altra?'
      ],
      fr: [
        '🔥 Tu étais si proche! Une fois de plus?',
        '🔥 5 jours d\'affilée! Peux-tu recommencer?',
        '🔥 Excellent travail! Tu veux lire aujourd\'hui?',
        '🔥 Ce serait dommage d\'arrêter maintenant! Encore?'
      ]
    }
  }

  const templates = fallbacks[notificationType]?.[language]
  if (templates) {
    console.log(`[Templates] Using fallback for ${notificationType}/${language}`)
    return templates
  }

  // Final fallback
  console.warn(`[Templates] No fallback found for ${notificationType}/${language}`)
  return [`[${notificationType}]`]
}

export default {
  getMessageTemplates,
  getRandomMessage,
  clearTemplateCache
}

// Schedule Updater - Fetches weekly reading schedule, yeartext, and memorial reading from WOL

import bibleBooks from '../../data/bible-books-en.json'

// Create a map of book names to book numbers for faster lookup
const bookNameMap = {}
bibleBooks.books.forEach(book => {
  bookNameMap[book.name.toLowerCase()] = book.number
})

/**
 * Fetch yeartext from JW.org WOL using a CORS proxy
 * @param {number} year - The year to fetch (e.g., 2027)
 * @returns {Promise<Object>} - { success: boolean, yeartext: Object, error: string }
 */
export const fetchYeartextFromWOL = async (year) => {
  const wolUrl = `https://wol.jw.org/en/wol/d/r1/lp-e/110${year}212`

  // Try multiple CORS proxies in order
  const proxies = [
    `https://corsproxy.io/?${encodeURIComponent(wolUrl)}`,
    `https://thingproxy.freeboard.io/fetch/${wolUrl}`,
  ]

  for (let i = 0; i < proxies.length; i++) {
    try {
      console.log(`Fetching yeartext with proxy ${i + 1}/${proxies.length}...`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const response = await fetch(proxies[i], {
        signal: controller.signal,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const html = await response.text()
      const yeartext = parseYeartextFromHTML(html, year)

      if (!yeartext.scripture) {
        throw new Error('Yeartext not found in HTML')
      }

      console.log(`Successfully fetched yeartext from proxy ${i + 1}`)

      return {
        success: true,
        yeartext: yeartext,
        error: null
      }
    } catch (error) {
      console.warn(`Yeartext proxy ${i + 1} failed:`, error.message)

      if (i === proxies.length - 1) {
        return {
          success: false,
          yeartext: null,
          error: `Fehler beim Abrufen des Jahrestextes.\n\nDirektlink: ${wolUrl}`
        }
      }

      continue
    }
  }

  return {
    success: false,
    yeartext: null,
    error: 'Unerwarteter Fehler beim Abrufen des Jahrestextes'
  }
}

/**
 * Parse HTML from yeartext page and extract the scripture
 * Handles JW.org HTML format: "Yeartext "text"—<a>Scripture</a>"
 */
function parseYeartextFromHTML(html, year) {
  // Step 1: Find "Yeartext " in the HTML
  const yeartextIndex = html.indexOf('Yeartext')
  if (yeartextIndex === -1) {
    console.warn('Yeartext keyword not found')
    return { scripture: null, text: null, year: parseInt(year) }
  }

  // Step 2: Extract only the line containing Yeartext (up to the closing </p> tag)
  const lineEnd = html.indexOf('</p>', yeartextIndex)
  const window = html.substring(yeartextIndex, lineEnd + 4)

  // Step 3: Extract text between quotes
  // Match: opening quote, then capture text until closing quote or em-dash
  const textMatch = window.match(/Yeartext\s+.([^"—-]+?)["—-]/)

  if (!textMatch) {
    console.warn('Could not extract yeartext quote')
    return { scripture: null, text: null, year: parseInt(year) }
  }

  let text = textMatch[1].trim().replace(/["​\u200B]/g, '').trim()

  // Check if text still contains quotes (sign of parsing error)
  const quoteMatches = text.match(/[""]/g)
  if (quoteMatches) {
    const quoteCount = quoteMatches.length
    console.warn(`⚠️ Found ${quoteCount} quote(s) in extracted yeartext: "${text}"`)

    if (quoteCount === 1) {
      // Only one quote - remove it automatically
      text = text.replace(/[""]/g, '').trim()
    } else {
      // Multiple quotes - potential parsing error
      console.error(`✗ Multiple quotes found - cannot auto-correct yeartext. Text: "${text}"`)
      return { scripture: null, text: null, year: parseInt(year) }
    }
  }

  // Step 4: Extract scripture from <a> tag
  const scriptureMatch = window.match(/>([^<]+)<\/a>/)

  if (!scriptureMatch) {
    console.warn('Could not extract scripture reference')
    return { scripture: null, text: text, year: parseInt(year) }
  }

  const scripture = scriptureMatch[1].trim()

  return {
    scripture: scripture,
    text: text,
    year: parseInt(year),
    message: `✓ Jahrestext ${year}: "${text}" (${scripture})`
  }
}

/**
 * Fetch weekly reading schedule from JW.org WOL using a CORS proxy
 * @param {number} year - The year to fetch (e.g., 2027)
 * @returns {Promise<Object>} - { success: boolean, schedule: Array, error: string }
 */
export const fetchScheduleFromWOL = async (year) => {
  const wolUrl = `https://wol.jw.org/en/wol/d/r1/lp-e/110${year}214`

  // Try multiple CORS proxies in order
  const proxies = [
    `https://corsproxy.io/?${encodeURIComponent(wolUrl)}`,
    `https://thingproxy.freeboard.io/fetch/${wolUrl}`,
  ]

  for (let i = 0; i < proxies.length; i++) {
    try {
      console.log(`Attempting to fetch with proxy ${i + 1}/${proxies.length}...`)

      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      const response = await fetch(proxies[i], {
        signal: controller.signal,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const html = await response.text()
      const schedule = parseScheduleFromHTML(html, year)

      if (schedule.length === 0) {
        throw new Error('No schedule data found in HTML')
      }

      console.log(`Successfully fetched ${schedule.length} weeks from proxy ${i + 1}`)

      return {
        success: true,
        schedule: schedule,
        error: null
      }
    } catch (error) {
      console.warn(`Proxy ${i + 1} failed:`, error.message)

      // If this is the last proxy, return error
      if (i === proxies.length - 1) {
        return {
          success: false,
          schedule: [],
          error: `Alle CORS-Proxys fehlgeschlagen. Bitte versuchen Sie es später erneut oder verwenden Sie den manuellen Download.\n\nDirektlink: ${wolUrl}`
        }
      }

      // Otherwise try next proxy
      continue
    }
  }

  // Fallback (should never reach here)
  return {
    success: false,
    schedule: [],
    error: 'Unerwarteter Fehler beim Abrufen des Zeitplans'
  }
}

/**
 * Parse HTML from WOL and extract schedule data
 */
function parseScheduleFromHTML(html, year) {
  const schedule = []

  const monthNames = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12
  }

  // Extract all month sections
  const monthRegex = /<h2[^>]*>(?:<[^>]*>)*<strong>(January|February|March|April|May|June|July|August|September|October|November|December)<\/strong>(?:<\/[^>]*>)*<\/h2>(.*?)(?=<h2|$)/gs

  let monthMatch
  while ((monthMatch = monthRegex.exec(html)) !== null) {
    const month = monthMatch[1]
    const monthContent = monthMatch[2]
    const currentMonth = monthNames[month]

    // Extract readings from list items
    // Format: <span class="txtSrcBullet">5 </span><a...>Isaiah 17-20</a>
    const readingRegex = /<span class="txtSrcBullet">(\d+)\s*<\/span>(?:.*?<a[^>]*>(.*?)<\/a>|(.*?)(?=<\/p>))/g

    let readingMatch
    while ((readingMatch = readingRegex.exec(monthContent)) !== null) {
      const dayOfMonth = parseInt(readingMatch[1])
      const reading = (readingMatch[2] || readingMatch[3] || '').trim()

      // Skip empty or invalid readings
      if (!reading || reading.includes('<')) continue

      const weekStart = new Date(parseInt(year), currentMonth - 1, dayOfMonth)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      const formatDate = (date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      }

      // Parse book and chapters
      let readingObj = null
      let chapters = []

      if (reading.includes('Memorial') || reading.includes('memorial')) {
        readingObj = null
        chapters = []
      } else {
        const match = reading.match(/^([A-Za-z\s]+?)\s+(\d+)(?:[-–](\d+))?/)
        if (match) {
          const bookName = match[1].trim()
          // Look up book number from bible books (1-66 standard numbering)
          const bookNumber = bookNameMap[bookName.toLowerCase()] || null
          const startChapter = parseInt(match[2])
          const endChapter = match[3] ? parseInt(match[3]) : startChapter

          // New language-independent format
          readingObj = {
            book: bookNumber,
            startChapter: startChapter,
            endChapter: endChapter
          }

          for (let i = startChapter; i <= endChapter; i++) {
            chapters.push(i)
          }
        }
      }

      schedule.push({
        weekStart: formatDate(weekStart),
        weekEnd: formatDate(weekEnd),
        reading: readingObj,  // New format: { book, startChapter, endChapter }
        chapters: chapters,
        year: parseInt(year),
        month: currentMonth
      })
    }
  }

  return schedule
}

/**
 * Generate JavaScript module content from schedule data
 */
export const generateScheduleModule = (schedule, year) => {
  let jsContent = `// Weekly Bible Reading Schedule for ${year}
// Auto-generated from JW.org WOL
// Source: https://wol.jw.org/en/wol/d/r1/lp-e/110${year}214
// Generated: ${new Date().toISOString()}

export const weeklyReadingSchedule${year} = [\n`

  schedule.forEach(week => {
    jsContent += `  { weekStart: '${week.weekStart}', weekEnd: '${week.weekEnd}', reading: '${week.reading}', book: ${week.book ? `'${week.book}'` : 'null'}, bookNumber: ${week.bookNumber !== null ? week.bookNumber : 'null'}, chapters: [${week.chapters.join(', ')}], year: ${week.year}, month: ${week.month} },\n`
  })

  jsContent += `]\n\nexport default weeklyReadingSchedule${year}\n`

  return jsContent
}

/**
 * Save schedule file - triggers download
 */
export const saveScheduleForDownload = (scheduleModule, year) => {
  const blob = new Blob([scheduleModule], { type: 'text/javascript' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `weekly-reading-schedule-${year}.js`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Update the main loader file to include new year
 * For dynamic loading, we just need to add the year to the AVAILABLE_SCHEDULES map
 * @param {number} year - The year to add
 * @returns {string} - Updated loader file content
 */
export const updateLoaderFile = (currentLoaderContent, year) => {
  let updatedContent = currentLoaderContent

  // Check if this year is already in AVAILABLE_SCHEDULES
  if (currentLoaderContent.includes(`${year}: true`)) {
    console.log(`Year ${year} already in loader`)
    return currentLoaderContent
  }

  // Add year to AVAILABLE_SCHEDULES
  // Find the AVAILABLE_SCHEDULES object and add the new year
  const availableSchedulesRegex = /(const AVAILABLE_SCHEDULES = \{[\s\S]*?)(  \/\/ \d{4} and beyond)/
  const match = currentLoaderContent.match(availableSchedulesRegex)

  if (match) {
    // Add new year entry before the comment about future years
    const newEntry = `  ${year}: true,\n`
    updatedContent = updatedContent.replace(availableSchedulesRegex, `$1${newEntry}$2`)
  } else {
    // Fallback: Add before the comment at the end
    const fallbackRegex = /(  \/\/ \d{4} and beyond)/
    if (currentLoaderContent.match(fallbackRegex)) {
      updatedContent = updatedContent.replace(fallbackRegex, `  ${year}: true,\n$1`)
    }
  }

  return updatedContent
}

/**
 * Download all necessary files as a ZIP
 */
export const downloadSchedulePackage = async (scheduleModule, year, loaderContent, yeartextModule = null) => {
  try {
    // Import JSZip dynamically
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()

    // Add the schedule file
    zip.file(`weekly-reading-schedule-${year}.js`, scheduleModule)

    // Add the updated loader file
    zip.file('weekly-reading-schedule.js', loaderContent)

    // Add yeartext file if provided
    if (yeartextModule) {
      zip.file(`yeartext-${year}.js`, yeartextModule)
    }

    // Add README with instructions
    const readme = `# Installation Instructions - ${year}

## Dateien im Paket:
- weekly-reading-schedule-${year}.js (Wöchentlicher Leseplan)
- weekly-reading-schedule.js (Aktualisierter Loader)${yeartextModule ? `\n- yeartext-${year}.js (Jahrestext)` : ''}

## Installation:

1. Kopiere "weekly-reading-schedule-${year}.js" nach:
   data/weekly-reading-schedule-${year}.js

2. Ersetze "weekly-reading-schedule.js" mit der neuen Version:
   data/weekly-reading-schedule.js
${yeartextModule ? `
3. Kopiere "yeartext-${year}.js" nach:
   data/yeartext-${year}.js
` : ''}
${yeartextModule ? '4' : '3'}. Fertig! Die App verwendet jetzt automatisch alle Daten für ${year}.

---
Generiert: ${new Date().toLocaleString('de-DE')}
`
    zip.file('INSTALLATION.txt', readme)

    // Generate ZIP
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `bible-reading-${year}-package.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return { success: true, method: 'zip-download' }
  } catch (error) {
    console.error('ZIP creation failed:', error)
    // Fallback to individual file download
    saveScheduleForDownload(scheduleModule, year)
    return { success: true, method: 'fallback-download' }
  }
}

/**
 * Save schedule directly to file system (requires File System Access API)
 * Falls back to download if not supported
 */
export const saveScheduleToDataFolder = async (scheduleModule, year) => {
  try {
    // Check if File System Access API is supported
    if ('showSaveFilePicker' in window) {
      const opts = {
        suggestedName: `weekly-reading-schedule-${year}.js`,
        types: [{
          description: 'JavaScript Files',
          accept: { 'text/javascript': ['.js'] },
        }],
      }

      const handle = await window.showSaveFilePicker(opts)
      const writable = await handle.createWritable()
      await writable.write(scheduleModule)
      await writable.close()

      return { success: true, method: 'file-system' }
    } else {
      // Fallback to download
      saveScheduleForDownload(scheduleModule, year)
      return { success: true, method: 'download' }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false, error: 'Save cancelled' }
    }
    // Fallback to download on any error
    saveScheduleForDownload(scheduleModule, year)
    return { success: true, method: 'download-fallback' }
  }
}

/**
 * Generate JavaScript module content for yeartext
 */
export const generateYeartextModule = (yeartext, year) => {
  const jsContent = `// Annual Yeartext for ${year}
// Source: https://wol.jw.org/en/wol/d/r1/lp-e/110${year}212
// Generated: ${new Date().toISOString()}

export const yeartext${year} = {
  year: ${year},
  scripture: '${yeartext.scripture}',
  text: '${yeartext.text.replace(/'/g, "\\'")}',
}

export default yeartext${year}
`
  return jsContent
}

/**
 * Get memorial week from schedule
 */
export const getMemorialWeekFromSchedule = (schedule) => {
  return schedule.find(week =>
    week.reading.toLowerCase().includes('memorial') ||
    week.book === null
  ) || null
}

export default {
  fetchScheduleFromWOL,
  fetchYeartextFromWOL,
  generateScheduleModule,
  generateYeartextModule,
  getMemorialWeekFromSchedule,
  saveScheduleForDownload,
  saveScheduleToDataFolder,
  updateLoaderFile,
  downloadSchedulePackage
}

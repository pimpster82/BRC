#!/usr/bin/env node

/**
 * Script to fetch weekly reading schedule and yeartext from JW.org WOL
 * Usage: node scripts/parse-daily-texts.js [year]
 * Example: node scripts/parse-daily-texts.js 2026
 */

import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const year = process.argv[2] || new Date().getFullYear()

console.log(`📖 Fetching Bible reading data for ${year}...`)

/**
 * Fetch data from URL
 */
async function fetchData(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  return await response.text()
}

/**
 * Parse yeartext from HTML
 */
function parseYeartextFromHTML(html, year) {
  // Find the paragraph with class="sn" containing "Yeartext"
  // Example: <p id="p3" data-pid="3" class="sn">Yeartext "Happy are those conscious of their spiritual need."​—<a href="..." class="b">Matthew 5:3</a>.</p>
  const yeartextMatch = html.match(/<p[^>]*class="sn"[^>]*>Yeartext\s+(.*?)<\/p>/s)

  if (!yeartextMatch) {
    throw new Error('Yeartext paragraph not found in HTML')
  }

  let yeartextContent = yeartextMatch[1]

  // Extract scripture reference from the <a> tag FIRST (before we remove tags)
  const scriptureMatch = yeartextContent.match(/<a[^>]*>([1-3]?\s*[A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+):(\d+)<\/a>/)
  let scripture = null

  if (scriptureMatch) {
    const book = scriptureMatch[1].trim()
    const chapter = scriptureMatch[2]
    const verse = scriptureMatch[3]
    scripture = `${book} ${chapter}:${verse}`
  }

  // Remove all HTML tags to get plain text
  yeartextContent = yeartextContent.replace(/<[^>]*>/g, '').trim()

  // Try to extract text using multiple methods
  let text = null

  // Method 1: Try regex with various quote types
  let match = yeartextContent.match(/["\u201C](.+?)["\u201D]/)
  if (match) {
    text = match[1].trim()
  }

  // Method 2: If regex fails, split by em-dash and extract
  if (!text) {
    const parts = yeartextContent.split(/[—\u2014]/)
    if (parts.length > 0) {
      // Remove "Yeartext " prefix and any quotes
      text = parts[0].replace(/^Yeartext\s*/, '').replace(/^["\u201C\u201D"\s]+|["\u201C\u201D"\s]+$/g, '').trim()
    }
  }

  if (!text || !scripture) {
    throw new Error(`Could not parse yeartext from HTML. Content: "${yeartextContent}". Text: ${text}, Scripture: ${scripture}`)
  }

  return {
    scripture,
    text: text.replace(/&#?\w+;/g, '').trim(),
    year: parseInt(year)
  }
}

/**
 * Parse weekly reading schedule from HTML
 */
function parseScheduleFromHTML(html, year) {
  const schedule = []

  const monthNames = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12
  }

  const monthRegex = /<h2[^>]*>(?:<[^>]*>)*<strong>(January|February|March|April|May|June|July|August|September|October|November|December)<\/strong>(?:<\/[^>]*>)*<\/h2>(.*?)(?=<h2|$)/gs

  let monthMatch
  while ((monthMatch = monthRegex.exec(html)) !== null) {
    const month = monthMatch[1]
    const monthContent = monthMatch[2]
    const currentMonth = monthNames[month]

    const readingRegex = /<span class="txtSrcBullet">(\d+)\s*<\/span>(?:.*?<a[^>]*>(.*?)<\/a>|(.*?)(?=<\/p>))/g

    let readingMatch
    while ((readingMatch = readingRegex.exec(monthContent)) !== null) {
      const dayOfMonth = parseInt(readingMatch[1])
      const reading = (readingMatch[2] || readingMatch[3] || '').trim()

      if (!reading || reading.includes('<')) continue

      const weekStart = new Date(parseInt(year), currentMonth - 1, dayOfMonth)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      const formatDate = (date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      }

      let book = null
      let chapters = []

      if (reading.includes('Memorial') || reading.includes('memorial')) {
        book = null
        chapters = []
      } else {
        const match = reading.match(/^([A-Za-z\s]+?)\s+(\d+)(?:[-–](\d+))?/)
        if (match) {
          book = match[1].trim()
          const startChapter = parseInt(match[2])
          const endChapter = match[3] ? parseInt(match[3]) : startChapter

          for (let i = startChapter; i <= endChapter; i++) {
            chapters.push(i)
          }
        }
      }

      schedule.push({
        weekStart: formatDate(weekStart),
        weekEnd: formatDate(weekEnd),
        reading: reading,
        book: book,
        chapters: chapters,
        year: parseInt(year),
        month: currentMonth
      })
    }
  }

  return schedule
}

/**
 * Generate JavaScript module for yeartext
 */
function generateYeartextModule(yeartext, year) {
  return `// Annual Yeartext for ${year}
// Source: https://wol.jw.org/en/wol/d/r1/lp-e/110${year}212
// Generated: ${new Date().toISOString()}

export const yeartext${year} = {
  year: ${year},
  scripture: '${yeartext.scripture}',
  text: '${yeartext.text.replace(/'/g, "\\'")}',
}

export default yeartext${year}
`
}

/**
 * Generate JavaScript module for schedule
 */
function generateScheduleModule(schedule, year) {
  let jsContent = `// Weekly Bible Reading Schedule for ${year}
// Auto-generated from JW.org WOL
// Source: https://wol.jw.org/en/wol/d/r1/lp-e/110${year}214
// Generated: ${new Date().toISOString()}

export const weeklyReadingSchedule${year} = [\n`

  schedule.forEach(week => {
    jsContent += `  { weekStart: '${week.weekStart}', weekEnd: '${week.weekEnd}', reading: '${week.reading}', book: ${week.book ? `'${week.book}'` : 'null'}, chapters: [${week.chapters.join(', ')}], year: ${week.year}, month: ${week.month} },\n`
  })

  jsContent += `]\n\nexport default weeklyReadingSchedule${year}\n`

  return jsContent
}

/**
 * Update loader file to include new year
 */
async function updateLoaderFile(year) {
  const loaderPath = join(process.cwd(), 'data', 'weekly-reading-schedule.js')
  let currentContent = await readFile(loaderPath, 'utf-8')

  // 1. Add import statement
  const importLine = `import { weeklyReadingSchedule${year} } from './weekly-reading-schedule-${year}.js'`
  if (!currentContent.includes(importLine)) {
    const importRegex = /(import\s+{[^}]+}\s+from\s+['"]\.\/weekly-reading-schedule-\d{4}\.js['"]\s*\n)/g
    const imports = currentContent.match(importRegex) || []

    if (imports.length > 0) {
      const lastImport = imports[imports.length - 1]
      currentContent = currentContent.replace(lastImport, lastImport + importLine + '\n')
    }
  }

  // 2. Add to registry
  const registryLine = `  ${year}: weeklyReadingSchedule${year},`
  if (!currentContent.includes(`${year}: weeklyReadingSchedule${year}`)) {
    const registryRegex = /const allSchedules = \{([^}]*)\}/s
    const registryMatch = currentContent.match(registryRegex)

    if (registryMatch) {
      const registryContent = registryMatch[1]
      const registryEntries = registryContent
        .trim()
        .split('\n')
        .filter(line => line.trim() && !line.includes('//'))
        .map(line => line.trim().startsWith('  ') ? line.trim() : '  ' + line.trim())
        .filter(line => line.trim())

      registryEntries.push(registryLine)

      const sortedEntries = registryEntries.sort((a, b) => {
        const yearA = parseInt(a.match(/(\d{4}):/)?.[1] || '0')
        const yearB = parseInt(b.match(/(\d{4}):/)?.[1] || '0')
        return yearA - yearB
      })

      const newRegistry = `const allSchedules = {\n${sortedEntries.join('\n')}\n}`
      currentContent = currentContent.replace(registryRegex, newRegistry)
    }
  }

  // 3. Add to exports
  const exportLine = `weeklyReadingSchedule${year}`
  if (!currentContent.includes(exportLine)) {
    const exportRegex = /export\s+\{([^}]+)\}/
    const exportMatch = currentContent.match(exportRegex)

    if (exportMatch) {
      const currentExports = exportMatch[1].trim().split(',').map(e => e.trim())
      currentExports.push(exportLine)
      const newExports = `export { ${currentExports.join(', ')} }`
      currentContent = currentContent.replace(exportRegex, newExports)
    }
  }

  await writeFile(loaderPath, currentContent, 'utf-8')
}

/**
 * Update yeartext loader in HomePage
 */
async function updateYeartextImports(year) {
  const homePagePath = join(process.cwd(), 'src', 'pages', 'HomePage.jsx')
  let content = await readFile(homePagePath, 'utf-8')

  // Add import if not exists
  const importLine = `import yeartext${year} from '../../data/yeartext-${year}.js'`
  if (!content.includes(importLine)) {
    // Find the last yeartext import
    const lastYeartextImport = content.match(/import yeartext\d{4} from '.*yeartext-\d{4}\.js'/g)
    if (lastYeartextImport && lastYeartextImport.length > 0) {
      const lastImport = lastYeartextImport[lastYeartextImport.length - 1]
      content = content.replace(lastImport, lastImport + '\n' + importLine)
    }
  }

  // Add to registry
  const registryEntry = `  ${year}: yeartext${year},`
  if (!content.includes(`${year}: yeartext${year}`)) {
    const registryMatch = content.match(/const yeartextRegistry = \{([^}]*)\}/s)
    if (registryMatch) {
      const registryContent = registryMatch[1]
      const lines = registryContent.split('\n').filter(line => line.trim() && !line.includes('//'))

      // Add new year and sort
      lines.push(registryEntry)
      const sortedLines = lines.sort((a, b) => {
        const yearA = parseInt(a.match(/(\d{4}):/)?.[1] || '0')
        const yearB = parseInt(b.match(/(\d{4}):/)?.[1] || '0')
        return yearA - yearB
      })

      const newRegistry = `const yeartextRegistry = {\n${sortedLines.join('\n')}\n  // Add more years as they become available:\n}`
      content = content.replace(/const yeartextRegistry = \{[^}]*\}/s, newRegistry)
    }
  }

  await writeFile(homePagePath, content, 'utf-8')
}

/**
 * Main execution
 */
async function main() {
  try {
    // Fetch yeartext
    console.log(`\n1️⃣  Fetching yeartext for ${year}...`)
    const yeartextUrl = `https://wol.jw.org/en/wol/d/r1/lp-e/110${year}212`
    const yeartextHtml = await fetchData(yeartextUrl)
    const yeartext = parseYeartextFromHTML(yeartextHtml, year)
    console.log(`   ✅ Found: "${yeartext.text}" (${yeartext.scripture})`)

    // Fetch schedule
    console.log(`\n2️⃣  Fetching weekly reading schedule for ${year}...`)
    const scheduleUrl = `https://wol.jw.org/en/wol/d/r1/lp-e/110${year}214`
    const scheduleHtml = await fetchData(scheduleUrl)
    const schedule = parseScheduleFromHTML(scheduleHtml, year)
    console.log(`   ✅ Found ${schedule.length} weeks of readings`)

    // Generate and save yeartext file
    console.log(`\n3️⃣  Generating yeartext-${year}.js...`)
    const yeartextModule = generateYeartextModule(yeartext, year)
    const yeartextPath = join(process.cwd(), 'data', `yeartext-${year}.js`)
    await writeFile(yeartextPath, yeartextModule, 'utf-8')
    console.log(`   ✅ Saved to data/yeartext-${year}.js`)

    // Generate and save schedule file
    console.log(`\n4️⃣  Generating weekly-reading-schedule-${year}.js...`)
    const scheduleModule = generateScheduleModule(schedule, year)
    const schedulePath = join(process.cwd(), 'data', `weekly-reading-schedule-${year}.js`)
    await writeFile(schedulePath, scheduleModule, 'utf-8')
    console.log(`   ✅ Saved to data/weekly-reading-schedule-${year}.js`)

    // Update loader files
    console.log(`\n5️⃣  Updating loader files...`)
    await updateLoaderFile(year)
    console.log(`   ✅ Updated data/weekly-reading-schedule.js`)

    await updateYeartextImports(year)
    console.log(`   ✅ Updated src/pages/HomePage.jsx`)

    console.log(`\n✨ Successfully generated all files for ${year}!\n`)
    console.log(`📁 Files created:`)
    console.log(`   • data/yeartext-${year}.js`)
    console.log(`   • data/weekly-reading-schedule-${year}.js`)
    console.log(`\n📝 Files updated:`)
    console.log(`   • data/weekly-reading-schedule.js`)
    console.log(`   • src/pages/HomePage.jsx`)
    console.log(`\n🎉 You're all set! The app will automatically use the ${year} data.\n`)

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`)
    process.exit(1)
  }
}

main()

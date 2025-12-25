#!/usr/bin/env node

/**
 * Generate Weekly Reading Schedule from JW.org
 *
 * This script creates the weekly-reading-schedule-YEAR.js file
 * by fetching data from wol.jw.org
 *
 * Usage: Run this script manually and paste the schedule data when prompted
 *        Or update the data object below with data from wol.jw.org
 */

// INSTRUCTIONS:
// 1. Visit https://wol.jw.org/en/wol/d/r1/lp-e/1102026214 (change year in URL)
// 2. Copy the complete schedule below and update the scheduleData array
// 3. Run: node scripts/generate-weekly-schedule.js 2026

const fs = require('fs')
const path = require('path')

// Load bible books data to map book names to numbers
const bibleBooks = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/bible-books-en.json'), 'utf8')
)

// Create a map of book names to book numbers for faster lookup
const bookNameMap = {}
bibleBooks.books.forEach(book => {
  bookNameMap[book.name.toLowerCase()] = book.number
})

const year = process.argv[2] || '2026'

// Schedule data from JW.org: https://wol.jw.org/en/wol/d/r1/lp-e/1102025214
// Format: Each entry is: { month: 'Month', day: DD, reading: 'Book Chapter-Range' }
const scheduleData = [
  // January
  { month: 'January', day: 6, reading: 'Psalms 127-134' },
  { month: 'January', day: 13, reading: 'Psalms 135-137' },
  { month: 'January', day: 20, reading: 'Psalms 138-139' },
  { month: 'January', day: 27, reading: 'Psalms 140-143' },

  // February
  { month: 'February', day: 3, reading: 'Psalms 144-146' },
  { month: 'February', day: 10, reading: 'Psalms 147-150' },
  { month: 'February', day: 17, reading: 'Proverbs 1' },
  { month: 'February', day: 24, reading: 'Proverbs 2' },

  // March
  { month: 'March', day: 3, reading: 'Proverbs 3' },
  { month: 'March', day: 10, reading: 'Proverbs 4' },
  { month: 'March', day: 17, reading: 'Proverbs 5' },
  { month: 'March', day: 24, reading: 'Proverbs 6' },
  { month: 'March', day: 31, reading: 'Proverbs 7' },

  // April
  { month: 'April', day: 7, reading: 'Proverbs 8' },
  { month: 'April', day: 14, reading: 'Proverbs 9' },
  { month: 'April', day: 21, reading: 'Proverbs 10' },
  { month: 'April', day: 28, reading: 'Proverbs 11' },

  // May
  { month: 'May', day: 5, reading: 'Proverbs 12' },
  { month: 'May', day: 12, reading: 'Proverbs 13' },
  { month: 'May', day: 19, reading: 'Proverbs 14' },
  { month: 'May', day: 26, reading: 'Proverbs 15' },

  // June
  { month: 'June', day: 2, reading: 'Proverbs 16' },
  { month: 'June', day: 9, reading: 'Proverbs 17' },
  { month: 'June', day: 16, reading: 'Proverbs 18' },
  { month: 'June', day: 23, reading: 'Proverbs 19' },
  { month: 'June', day: 30, reading: 'Proverbs 20' },

  // July
  { month: 'July', day: 7, reading: 'Proverbs 21' },
  { month: 'July', day: 14, reading: 'Proverbs 22' },
  { month: 'July', day: 21, reading: 'Proverbs 23' },
  { month: 'July', day: 28, reading: 'Proverbs 24' },

  // August
  { month: 'August', day: 4, reading: 'Proverbs 25' },
  { month: 'August', day: 11, reading: 'Proverbs 26' },
  { month: 'August', day: 18, reading: 'Proverbs 27' },
  { month: 'August', day: 25, reading: 'Proverbs 28' },

  // September
  { month: 'September', day: 1, reading: 'Proverbs 29' },
  { month: 'September', day: 8, reading: 'Proverbs 30' },
  { month: 'September', day: 15, reading: 'Proverbs 31' },
  { month: 'September', day: 22, reading: 'Ecclesiastes 1-2' },
  { month: 'September', day: 29, reading: 'Ecclesiastes 3-4' },

  // October
  { month: 'October', day: 6, reading: 'Ecclesiastes 5-6' },
  { month: 'October', day: 13, reading: 'Ecclesiastes 7-8' },
  { month: 'October', day: 20, reading: 'Ecclesiastes 9-10' },
  { month: 'October', day: 27, reading: 'Ecclesiastes 11-12' },

  // November
  { month: 'November', day: 3, reading: 'Song of Solomon 1-2' },
  { month: 'November', day: 10, reading: 'Song of Solomon 3-5' },
  { month: 'November', day: 17, reading: 'Song of Solomon 6-8' },
  { month: 'November', day: 24, reading: 'Isaiah 1-2' },

  // December
  { month: 'December', day: 1, reading: 'Isaiah 3-5' },
  { month: 'December', day: 8, reading: 'Isaiah 6-8' },
  { month: 'December', day: 15, reading: 'Isaiah 9-10' },
  { month: 'December', day: 22, reading: 'Isaiah 11-13' },
  { month: 'December', day: 29, reading: 'Isaiah 14-16' }
]

const monthNames = {
  'January': 1, 'February': 2, 'March': 3, 'April': 4,
  'May': 5, 'June': 6, 'July': 7, 'August': 8,
  'September': 9, 'October': 10, 'November': 11, 'December': 12
}

function generateSchedule() {
  console.log(`📖 Generating weekly reading schedule for ${year}`)
  console.log(`📊 Processing ${scheduleData.length} entries...`)

  const schedule = scheduleData.map(entry => {
    const month = monthNames[entry.month]
    const weekStart = new Date(parseInt(year), month - 1, entry.day)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const formatDate = (date) => {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }

    // Parse book and chapters
    let book = null
    let bookNumber = null
    let chapters = []

    if (entry.reading.includes('Memorial')) {
      book = null
      bookNumber = null
      chapters = []
    } else {
      const match = entry.reading.match(/^([A-Za-z\s]+?)\s+(\d+)(?:[-–](\d+))?/)
      if (match) {
        book = match[1].trim()
        // Look up book number from bible-books-en.json (1-66 standard numbering)
        bookNumber = bookNameMap[book.toLowerCase()] || null
        const startChapter = parseInt(match[2])
        const endChapter = match[3] ? parseInt(match[3]) : startChapter

        for (let i = startChapter; i <= endChapter; i++) {
          chapters.push(i)
        }
      }
    }

    return {
      weekStart: formatDate(weekStart),
      weekEnd: formatDate(weekEnd),
      reading: entry.reading,
      book: book,
      bookNumber: bookNumber,
      chapters: chapters,
      year: parseInt(year),
      month: month
    }
  })

  // Generate JavaScript file
  let jsContent = `// Weekly Bible Reading Schedule for ${year}
// Source: https://wol.jw.org/en/wol/d/r1/lp-e/110${year}214

export const weeklyReadingSchedule${year} = [\n`

  schedule.forEach(week => {
    jsContent += `  { weekStart: '${week.weekStart}', weekEnd: '${week.weekEnd}', reading: '${week.reading}', book: ${week.book ? `'${week.book}'` : 'null'}, bookNumber: ${week.bookNumber !== null ? week.bookNumber : 'null'}, chapters: [${week.chapters.join(', ')}], year: ${week.year}, month: ${week.month} },\n`
  })

  jsContent += `]\n\nexport default weeklyReadingSchedule${year}\n`

  const outputPath = path.join(__dirname, `../data/weekly-reading-schedule-${year}.js`)
  fs.writeFileSync(outputPath, jsContent, 'utf8')

  console.log(`✅ Generated ${schedule.length} weekly entries`)
  console.log(`💾 Saved to: ${outputPath}`)
  console.log('\n🎉 Done!')
}

generateSchedule()

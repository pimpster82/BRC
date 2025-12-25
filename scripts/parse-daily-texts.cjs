#!/usr/bin/env node

/**
 * Parse Daily Text EPUB and generate JSON database
 *
 * Usage: node scripts/parse-daily-texts.js data/es26_E.epub
 * Output: data/daily-texts-2026.json
 */

const EPub = require('epub2')
const fs = require('fs')
const path = require('path')

const epubPath = process.argv[2] || path.join(__dirname, '../data/es26_E.epub')
const outputPath = path.join(__dirname, '../data/daily-texts-2026.json')

console.log('📖 Parsing EPUB:', epubPath)

const epub = new EPub(epubPath)

epub.on('end', async () => {
  console.log('✅ EPUB loaded successfully')
  console.log('📚 Book info:', {
    title: epub.metadata.title,
    creator: epub.metadata.creator,
    date: epub.metadata.date
  })

  const dailyTexts = []
  let processed = 0

  // Get all chapters
  const chapters = epub.flow.map(chapter => chapter.id)
  console.log(`📄 Found ${chapters.length} chapters`)

  // Process each chapter
  for (const chapterId of chapters) {
    try {
      await new Promise((resolve, reject) => {
        epub.getChapter(chapterId, (error, text) => {
          if (error) {
            console.error(`❌ Error reading chapter ${chapterId}:`, error.message)
            return resolve()
          }

          // Parse the HTML content
          const dateMatch = text.match(/(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}/)
          const scriptureMatch = text.match(/<p[^>]*class="[^"]*scripture[^"]*"[^>]*>(.*?)<\/p>/i)
          const themeMatch = text.match(/<p[^>]*class="[^"]*theme[^"]*"[^>]*>(.*?)<\/p>/i)

          if (dateMatch) {
            const cleanText = (html) => html.replace(/<[^>]*>/g, '').trim()

            const entry = {
              rawDate: dateMatch[0],
              scripture: scriptureMatch ? cleanText(scriptureMatch[1]) : '',
              theme: themeMatch ? cleanText(themeMatch[1]) : '',
              chapterId: chapterId
            }

            dailyTexts.push(entry)
            processed++

            if (processed % 30 === 0) {
              console.log(`⏳ Processed ${processed} entries...`)
            }
          }

          resolve()
        })
      })
    } catch (err) {
      console.error('Error processing chapter:', err)
    }
  }

  console.log(`\n✨ Extracted ${dailyTexts.length} daily text entries`)

  // Save to JSON
  const output = {
    year: 2026,
    source: 'Examining the Scriptures Daily 2026',
    generated: new Date().toISOString(),
    count: dailyTexts.length,
    texts: dailyTexts
  }

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))
  console.log(`💾 Saved to: ${outputPath}`)
  console.log('\n🎉 Done!')
})

epub.on('error', (err) => {
  console.error('❌ Error loading EPUB:', err)
  process.exit(1)
})

epub.parse()

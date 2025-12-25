const EPub = require('epub2').EPub
const epub = new EPub('./data/es26_E.epub')

epub.on('end', async () => {
  // Check first 10 chapters for overview
  const chapters = epub.flow.slice(0, 10).map(chapter => chapter.id)
  
  for (const chapterId of chapters) {
    await new Promise((resolve) => {
      epub.getChapter(chapterId, (error, text) => {
        if (error) return resolve()
        
        if (text.includes('July') || text.includes('Jeremiah 13')) {
          console.log(`\n=== Found in ${chapterId} ===`)
          
          // Check for month headings in this chapter
          const has H2 = text.includes('<h2')
          const hasJuly = text.includes('>July<')
          const hasJer13 = text.includes('Jeremiah 13')
          
          console.log(`Has <h2>: ${hasH2}, Has >July<: ${hasJuly}, Has Jer 13: ${hasJer13}`)
          
          if (hasJuly) {
            const idx = text.indexOf('>July<')
            console.log('\nContext:')
            console.log(text.substring(idx - 100, idx + 600))
          }
        }
        
        resolve()
      })
    })
  }
})

epub.on('error', (err) => console.error(err))
epub.parse()

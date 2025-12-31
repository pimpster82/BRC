// Parse One Year Reading Plan into structured format
// Input: List of readings like "Genesis 1-3", "Psalms 119:64-176", "Obadiah/Jonah"
// Output: Array of { id, section, book, startChapter, endChapter, startVerse, endVerse }

const rawReadings = `
# THE WRITINGS OF MOSES

Genesis 1-3
Genesis 4-7
Genesis 8-11
Genesis 12-15
Genesis 16-18
Genesis 19-22
Genesis 23-24
Genesis 25-27
Genesis 28-30
Genesis 31-32
Genesis 33-34
Genesis 35-37
Genesis 38-40
Genesis 41-42
Genesis 43-45
Genesis 46-48
Genesis 49-50
Exodus 1-4
Exodus 5-7
Exodus 8-10
Exodus 11-13
Exodus 14-15
Exodus 16-18
Exodus 19-21
Exodus 22-25
Exodus 26-28
Exodus 29-30
Exodus 31-33
Exodus 34-35
Exodus 36-38
Exodus 39-40
Leviticus 1-4
Leviticus 5-7
Leviticus 8-10
Leviticus 11-13
Leviticus 14-15
Leviticus 16-18
Leviticus 19-21
Leviticus 22-23
Leviticus 24-25
Leviticus 26-27
Numbers 1-3
Numbers 4-6
Numbers 7-9
Numbers 10-12
Numbers 13-15
Numbers 16-18
Numbers 19-21
Numbers 22-24
Numbers 25-27
Numbers 28-30
Numbers 31-32
Numbers 33-36
Deuteronomy 1-2
Deuteronomy 3-4
Deuteronomy 5-7
Deuteronomy 8-10
Deuteronomy 11-13
Deuteronomy 14-16
Deuteronomy 17-19
Deuteronomy 20-22
Deuteronomy 23-26
Deuteronomy 27-28
Deuteronomy 29-31
Deuteronomy 32
Deuteronomy 33-34

# ISRAEL ENTERS THE PROMISED LAND

Joshua 1-4
Joshua 5-7
Joshua 8-9
Joshua 10-12
Joshua 13-15
Joshua 16-18
Joshua 19-21
Joshua 22-24
Judges 1-2
Judges 3-5
Judges 6-7
Judges 8-9
Judges 10-11
Judges 12-13
Judges 14-16
Judges 17-19
Judges 20-21
Ruth 1-4

# WHEN THE KINGS RULED ISRAEL

1 Samuel 1-2
1 Samuel 3-6
1 Samuel 7-9
1 Samuel 10-12
1 Samuel 13-14
1 Samuel 15-16
1 Samuel 17-18
1 Samuel 19-21
1 Samuel 22-24
1 Samuel 25-27
1 Samuel 28-31
2 Samuel 1-2
2 Samuel 3-5
2 Samuel 6-8
2 Samuel 9-12
2 Samuel 13-14
2 Samuel 15-16
2 Samuel 17-18
2 Samuel 19-20
2 Samuel 21-22
2 Samuel 23-24
1 Kings 1-2
1 Kings 3-5
1 Kings 6-7
1 Kings 8
1 Kings 9-10
1 Kings 11-12
1 Kings 13-14
1 Kings 15-17
1 Kings 18-19
1 Kings 20-21
1 Kings 22
2 Kings 1-3
2 Kings 4-5
2 Kings 6-8
2 Kings 9-10
2 Kings 11-13
2 Kings 14-15
2 Kings 16-17
2 Kings 18-19
2 Kings 20-22
2 Kings 23-25
1 Chronicles 1-2
1 Chronicles 3-5
1 Chronicles 6-7
1 Chronicles 8-10
1 Chronicles 11-12
1 Chronicles 13-15
1 Chronicles 16-17
1 Chronicles 18-20
1 Chronicles 21-23
1 Chronicles 24-26
1 Chronicles 27-29
2 Chronicles 1-3
2 Chronicles 4-6
2 Chronicles 7-9
2 Chronicles 10-14
2 Chronicles 15-18
2 Chronicles 19-22
2 Chronicles 23-25
2 Chronicles 26-28
2 Chronicles 29-30
2 Chronicles 31-33
2 Chronicles 34-36

# THE JEWS RETURN FROM EXILE

Ezra 1-3
Ezra 4-7
Ezra 8-10
Nehemiah 1-3
Nehemiah 4-6
Nehemiah 7-8
Nehemiah 9-10
Nehemiah 11-13
Esther 1-4
Esther 5-10

# BOOKS OF SONGS AND PRACTICAL WISDOM

Job 1-5
Job 6-9
Job 10-14
Job 15-18
Job 19-20
Job 21-24
Job 25-29
Job 30-31
Job 32-34
Job 35-38
Job 39-42
Psalms 1-8
Psalms 9-16
Psalms 17-19
Psalms 20-25
Psalms 26-31
Psalms 32-35
Psalms 36-38
Psalms 39-42
Psalms 43-47
Psalms 48-52
Psalms 53-58
Psalms 59-64
Psalms 65-68
Psalms 69-72
Psalms 73-77
Psalms 78-79
Psalms 80-86
Psalms 87-90
Psalms 91-96
Psalms 97-103
Psalms 104-105
Psalms 106-108
Psalms 109-115
Psalms 116-119:63
Psalms 119:64-176
Psalms 120-129
Psalms 130-138
Psalms 139-144
Psalms 145-150
Proverbs 1-4
Proverbs 5-8
Proverbs 9-12
Proverbs 13-16
Proverbs 17-19
Proverbs 20-22
Proverbs 23-27
Proverbs 28-31
Ecclesiastes 1-4
Ecclesiastes 5-8
Ecclesiastes 9-12
Song of Solomon 1-8

# THE PROPHETS

Isaiah 1-4
Isaiah 5-7
Isaiah 8-10
Isaiah 11-14
Isaiah 15-19
Isaiah 20-24
Isaiah 25-28
Isaiah 29-31
Isaiah 32-35
Isaiah 36-37
Isaiah 38-40
Isaiah 41-43
Isaiah 44-47
Isaiah 48-50
Isaiah 51-55
Isaiah 56-58
Isaiah 59-62
Isaiah 63-66
Jeremiah 1-3
Jeremiah 4-5
Jeremiah 6-7
Jeremiah 8-10
Jeremiah 11-13
Jeremiah 14-16
Jeremiah 17-20
Jeremiah 21-23
Jeremiah 24-26
Jeremiah 27-29
Jeremiah 30-31
Jeremiah 32-33
Jeremiah 34-36
Jeremiah 37-39
Jeremiah 40-42
Jeremiah 43-44
Jeremiah 45-48
Jeremiah 49-50
Jeremiah 51-52
Lamentations 1-2
Lamentations 3-5
Ezekiel 1-3
Ezekiel 4-6
Ezekiel 7-9
Ezekiel 10-12
Ezekiel 13-15
Ezekiel 16
Ezekiel 17-18
Ezekiel 19-21
Ezekiel 22-23
Ezekiel 24-26
Ezekiel 27-28
Ezekiel 29-31
Ezekiel 32-33
Ezekiel 34-36
Ezekiel 37-38
Ezekiel 39-40
Ezekiel 41-43
Ezekiel 44-45
Ezekiel 46-48
Daniel 1-2
Daniel 3-4
Daniel 5-7
Daniel 8-10
Daniel 11-12
Hosea 1-7
Hosea 8-14
Joel 1-3
Amos 1-5
Amos 6-9
Obadiah/Jonah
Micah 1-7
Nahum/Habakkuk
Zephaniah/Haggai
Zechariah 1-7
Zechariah 8-11
Zechariah 12-14
Malachi 1-4

# ACCOUNTS OF JESUS' LIFE AND MINISTRY

Matthew 1-4
Matthew 5-7
Matthew 8-10
Matthew 11-13
Matthew 14-17
Matthew 18-20
Matthew 21-23
Matthew 24-25
Matthew 26
Matthew 27-28
Mark 1-3
Mark 4-5
Mark 6-8
Mark 9-10
Mark 11-13
Mark 14-16
Luke 1-2
Luke 3-5
Luke 6-7
Luke 8-9
Luke 10-11
Luke 12-13
Luke 14-17
Luke 18-19
Luke 20-22
Luke 23-24
John 1-3
John 4-5
John 6-7
John 8-9
John 10-12
John 13-15
John 16-18
John 19-21

# GROWTH OF THE CHRISTIAN CONGREGATION

Acts 1-3
Acts 4-6
Acts 7-8
Acts 9-11
Acts 12-14
Acts 15-16
Acts 17-19
Acts 20-21
Acts 22-23
Acts 24-26
Acts 27-28

# THE LETTERS OF PAUL

Romans 1-3
Romans 4-7
Romans 8-11
Romans 12-16
1 Corinthians 1-6
1 Corinthians 7-10
1 Corinthians 11-14
1 Corinthians 15-16
2 Corinthians 1-6
2 Corinthians 7-10
2 Corinthians 11-13
Galatians 1-6
Ephesians 1-6
Philippians 1-4
Colossians 1-4
1 Thessalonians 1-5
2 Thessalonians 1-3
1 Timothy 1-6
2 Timothy 1-4
Titus/Philemon
Hebrews 1-6
Hebrews 7-10
Hebrews 11-13

# THE WRITINGS OF THE OTHER APOSTLES AND DISCIPLES

James 1-5
1 Peter 1-5
2 Peter 1-3
1 John 1-5
2 John/3 John/Jude
Revelation 1-4
Revelation 5-9
Revelation 10-14
Revelation 15-18
Revelation 19-22
`.trim()

// Bible book mapping (English names to book numbers 1-66)
const bookMap = {
  'Genesis': 1, 'Exodus': 2, 'Leviticus': 3, 'Numbers': 4, 'Deuteronomy': 5,
  'Joshua': 6, 'Judges': 7, 'Ruth': 8, '1 Samuel': 9, '2 Samuel': 10,
  '1 Kings': 11, '2 Kings': 12, '1 Chronicles': 13, '2 Chronicles': 14,
  'Ezra': 15, 'Nehemiah': 16, 'Esther': 17, 'Job': 18, 'Psalms': 19,
  'Proverbs': 20, 'Ecclesiastes': 21, 'Song of Solomon': 22,
  'Isaiah': 23, 'Jeremiah': 24, 'Lamentations': 25, 'Ezekiel': 26, 'Daniel': 27,
  'Hosea': 28, 'Joel': 29, 'Amos': 30, 'Obadiah': 31, 'Jonah': 32,
  'Micah': 33, 'Nahum': 34, 'Habakkuk': 35, 'Zephaniah': 36, 'Haggai': 37,
  'Zechariah': 38, 'Malachi': 39,
  'Matthew': 40, 'Mark': 41, 'Luke': 42, 'John': 43, 'Acts': 44,
  'Romans': 45, '1 Corinthians': 46, '2 Corinthians': 47, 'Galatians': 48,
  'Ephesians': 49, 'Philippians': 50, 'Colossians': 51,
  '1 Thessalonians': 52, '2 Thessalonians': 53, '1 Timothy': 54, '2 Timothy': 55,
  'Titus': 56, 'Philemon': 57, 'Hebrews': 58,
  'James': 59, '1 Peter': 60, '2 Peter': 61, '1 John': 62, '2 John': 63,
  '3 John': 64, 'Jude': 65, 'Revelation': 66
}

// Section mapping
const sectionMap = {
  'THE WRITINGS OF MOSES': 'moses',
  'ISRAEL ENTERS THE PROMISED LAND': 'promised_land',
  'WHEN THE KINGS RULED ISRAEL': 'kings',
  'THE JEWS RETURN FROM EXILE': 'exile_return',
  'BOOKS OF SONGS AND PRACTICAL WISDOM': 'wisdom',
  'THE PROPHETS': 'prophets',
  "ACCOUNTS OF JESUS' LIFE AND MINISTRY": 'jesus_life',
  'GROWTH OF THE CHRISTIAN CONGREGATION': 'congregation',
  'THE LETTERS OF PAUL': 'paul_letters',
  'THE WRITINGS OF THE OTHER APOSTLES AND DISCIPLES': 'apostles_writings'
}

function parseReading(line, id, currentSection) {
  // Handle special cases with multiple books
  if (line === 'Obadiah/Jonah') {
    return [
      { id, section: currentSection, book: 31, startChapter: 1, endChapter: 1 }, // Obadiah (1 chapter)
      { id: id + 0.5, section: currentSection, book: 32, startChapter: 1, endChapter: 4 } // Jonah (4 chapters)
    ]
  }
  if (line === 'Nahum/Habakkuk') {
    return [
      { id, section: currentSection, book: 34, startChapter: 1, endChapter: 3 }, // Nahum (3 chapters)
      { id: id + 0.5, section: currentSection, book: 35, startChapter: 1, endChapter: 3 } // Habakkuk (3 chapters)
    ]
  }
  if (line === 'Zephaniah/Haggai') {
    return [
      { id, section: currentSection, book: 36, startChapter: 1, endChapter: 3 }, // Zephaniah (3 chapters)
      { id: id + 0.5, section: currentSection, book: 37, startChapter: 1, endChapter: 2 } // Haggai (2 chapters)
    ]
  }
  if (line === 'Titus/Philemon') {
    return [
      { id, section: currentSection, book: 56, startChapter: 1, endChapter: 3 }, // Titus (3 chapters)
      { id: id + 0.5, section: currentSection, book: 57, startChapter: 1, endChapter: 1 } // Philemon (1 chapter)
    ]
  }
  if (line === '2 John/3 John/Jude') {
    return [
      { id, section: currentSection, book: 63, startChapter: 1, endChapter: 1 }, // 2 John (1 chapter)
      { id: id + 0.33, section: currentSection, book: 64, startChapter: 1, endChapter: 1 }, // 3 John (1 chapter)
      { id: id + 0.66, section: currentSection, book: 65, startChapter: 1, endChapter: 1 } // Jude (1 chapter)
    ]
  }

  // Parse "Book Chapter-Chapter" or "Book Chapter" or "Book Chapter:Verse-Verse"
  const match = line.match(/^(.+?)\s+(\d+)(?::(\d+))?(?:-(\d+)(?::(\d+))?)?$/)
  if (!match) {
    console.error('Failed to parse:', line)
    return null
  }

  const bookName = match[1].trim()
  const bookNum = bookMap[bookName]
  if (!bookNum) {
    console.error('Unknown book:', bookName, 'in line:', line)
    return null
  }

  const startChapter = parseInt(match[2])
  const startVerse = match[3] ? parseInt(match[3]) : undefined
  const endPart = match[4] ? parseInt(match[4]) : undefined
  const endVerse = match[5] ? parseInt(match[5]) : undefined

  // Determine if this is chapter-chapter or chapter:verse-verse
  let endChapter
  let finalEndVerse

  if (startVerse !== undefined) {
    // This has verses: e.g., "119:64-176" means chapter 119, verses 64-176
    endChapter = startChapter // Same chapter
    finalEndVerse = endPart // The number after "-" is the ending verse
  } else if (endPart !== undefined) {
    // No verses, just chapters: e.g., "1-3" means chapters 1-3
    endChapter = endPart
  } else {
    // Single chapter
    endChapter = startChapter
  }

  const reading = {
    id,
    section: currentSection,
    book: bookNum,
    startChapter,
    endChapter
  }

  if (startVerse !== undefined) reading.startVerse = startVerse
  if (finalEndVerse !== undefined) reading.endVerse = finalEndVerse

  return reading
}

// Parse the raw readings
const lines = rawReadings.split('\n')
let currentSection = ''
let id = 1
const readings = []

for (const line of lines) {
  const trimmed = line.trim()
  if (!trimmed) continue

  if (trimmed.startsWith('#')) {
    const sectionTitle = trimmed.substring(1).trim()
    currentSection = sectionMap[sectionTitle] || currentSection
    continue
  }

  const parsed = parseReading(trimmed, id, currentSection)
  if (Array.isArray(parsed)) {
    readings.push(...parsed)
  } else if (parsed) {
    readings.push(parsed)
  }
  id++
}

// Output as JavaScript code
console.log('export const oneyearReadings = [')
readings.forEach(r => {
  const parts = [`id: ${r.id}`, `section: '${r.section}'`, `book: ${r.book}`, `startChapter: ${r.startChapter}`, `endChapter: ${r.endChapter}`]
  if (r.startVerse !== undefined) parts.push(`startVerse: ${r.startVerse}`)
  if (r.endVerse !== undefined) parts.push(`endVerse: ${r.endVerse}`)
  console.log(`  { ${parts.join(', ')} },`)
})
console.log(']')

console.log('\n\n// Section definitions')
console.log('export const oneyearSections = [')
const sections = [
  { key: 'moses', titleKey: 'oneyear.moses', count: 65 },
  { key: 'promised_land', titleKey: 'oneyear.promised_land', count: 18 },
  { key: 'kings', titleKey: 'oneyear.kings', count: 86 },
  { key: 'exile_return', titleKey: 'oneyear.exile_return', count: 10 },
  { key: 'wisdom', titleKey: 'oneyear.wisdom', count: 64 },
  { key: 'prophets', titleKey: 'oneyear.prophets', count: 75 },
  { key: 'jesus_life', titleKey: 'oneyear.jesus_life', count: 35 },
  { key: 'congregation', titleKey: 'oneyear.congregation', count: 11 },
  { key: 'paul_letters', titleKey: 'oneyear.paul_letters', count: 24 },
  { key: 'apostles_writings', titleKey: 'oneyear.apostles_writings', count: 12 }
]
sections.forEach(s => {
  console.log(`  { key: '${s.key}', titleKey: '${s.titleKey}', count: ${s.count} },`)
})
console.log(']')

console.log('\n\nTotal readings:', readings.length)

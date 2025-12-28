/**
 * Reading Plan Parser
 * Parses custom reading plan format into structured JSON
 * Format: YAML header + multilang sections + auto-divide directives
 */

/**
 * Parse time directive to days
 * /1D, /7D, /1W, /1M, /3M, /1Y, /2Y
 */
const parseTimeDuration = (directive) => {
  const match = directive.match(/\/(\d+)([DWMY])/)
  if (!match) return null

  const [, num, unit] = match
  const number = parseInt(num)

  const conversions = {
    D: 1,           // Day
    W: 7,           // Week
    M: 30,          // Month
    Y: 365          // Year
  }

  return number * (conversions[unit] || 1)
}

/**
 * Parse verse reference (BB:C:V format)
 * Examples: "01:1:1-5", "01:1-3", "01-05", "45:1:1-5:10"
 */
const parseVerse = (verseStr) => {
  verseStr = verseStr.trim()

  // Book range: "01-05"
  if (/^\d{2}-\d{2}$/.test(verseStr)) {
    const [start, end] = verseStr.split('-').map(Number)
    return {
      type: 'bookRange',
      startBook: start,
      endBook: end
    }
  }

  // Single book: "41" (Mark)
  if (/^\d{2}$/.test(verseStr)) {
    return {
      type: 'book',
      book: Number(verseStr)
    }
  }

  // Single chapter: "40:28" (book 40, chapter 28 - all verses)
  const singleChapterMatch = verseStr.match(/^(\d{2}):(\d+)$/)
  if (singleChapterMatch) {
    const [, book, chapter] = singleChapterMatch
    return {
      type: 'specific',
      book: Number(book),
      chapter: Number(chapter),
      startVerse: 1,
      endVerse: 999 // Will be capped by actual chapter length
    }
  }

  // Full format: "01:1:1-5" or "01:1-3" or "45:1:1-5:10"
  const fullMatch = verseStr.match(/^(\d{2}):(\d+):(\d+)(?:-(\d+)?)?(?::(\d+))?$/)
  if (fullMatch) {
    const [, book, chapter, startVerse, endVerse, endChapter] = fullMatch
    return {
      type: 'specific',
      book: Number(book),
      chapter: Number(chapter),
      startVerse: Number(startVerse),
      endVerse: endVerse ? Number(endVerse) : Number(startVerse),
      endChapter: endChapter ? Number(endChapter) : undefined
    }
  }

  // Chapter range: "41:1-16"
  const chapterMatch = verseStr.match(/^(\d{2}):(\d+)-(\d+)$/)
  if (chapterMatch) {
    const [, book, startChapter, endChapter] = chapterMatch
    return {
      type: 'chapterRange',
      book: Number(book),
      startChapter: Number(startChapter),
      endChapter: Number(endChapter)
    }
  }

  throw new Error(`Invalid verse format: ${verseStr}`)
}

/**
 * Parse YAML-style header
 */
const parseHeader = (headerText) => {
  const lines = headerText.split('\n').filter(l => l.trim())
  const header = {}

  for (const line of lines) {
    const [key, ...valueParts] = line.split(':')
    const value = valueParts.join(':').trim()

    if (key === 'id') header.id = value
    if (key === 'name') header.name = value
    if (key === 'type') header.type = value
  }

  if (!header.id) throw new Error('Missing required field: id')
  if (!header.name) throw new Error('Missing required field: name')
  if (!header.type) throw new Error('Missing required field: type')

  return header
}

/**
 * Parse multilingual name
 * Format: "[de] Name | [en] Name | [es] Name"
 */
const parseMultilangText = (text) => {
  const result = {}
  const parts = text.split('|')

  for (const part of parts) {
    const match = part.match(/\[(\w{2})\]\s*(.+)/)
    if (match) {
      const [, lang, content] = match
      result[lang] = content.trim()
    }
  }

  return result
}

/**
 * Main parser function
 */
export const parseReadingPlan = (planText) => {
  try {
    // Split header and content
    const parts = planText.split('---').map(s => s.trim()).filter(s => s)

    if (parts.length < 2) {
      throw new Error('Invalid format: need at least ---\\nheader\\n---\\ncontent')
    }

    const [headerBlock, ...contentParts] = parts
    const content = contentParts.join('\n---\n').trim()

    // Parse header
    const header = parseHeader(headerBlock)

    // Parse multilang name
    const nameObj = parseMultilangText(header.name)

    // Parse content into sections
    const sections = parseContent(content, header.type)

    return {
      id: header.id,
      name: nameObj,
      type: header.type,
      sections: sections,
      createdAt: new Date().toISOString()
    }
  } catch (error) {
    throw new Error(`Parse error: ${error.message}`)
  }
}

/**
 * Parse content sections and topics
 *
 * Structure:
 * - category: # [lang] Title | content (book ranges)
 * - thematic: # [lang] Title | ## [lang] Topic | content (verses)
 * - chronological: # [lang] Title | optionally ## [lang] Subsection | content (verses/books) with optional time directive
 */
const parseContent = (content, planType) => {
  const sections = []
  const lines = content.split('\n')
  let currentSection = null
  let currentTopic = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (!line) continue

    // Section header: "# [de] Title | [en] Title"
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      if (currentSection) {
        sections.push(currentSection)
      }
      currentSection = {
        title: parseMultilangText(line.substring(2)),
        topics: []
      }
      currentTopic = null
      continue
    }

    // Topic header: "## [de] Title | [en] Title"
    if (line.startsWith('## ')) {
      currentTopic = {
        title: parseMultilangText(line.substring(3)),
        verses: []
      }
      if (currentSection) {
        currentSection.topics.push(currentTopic)
      }
      continue
    }

    // Content line (verses or book ranges)
    if (line && currentSection) {
      const { verses, timeDuration } = parseContentLine(line, planType)

      if (planType === 'category') {
        // For category plans, add directly to section
        if (!currentSection.bookRange) {
          currentSection.bookRange = verses[0]
        }
      } else if (planType === 'thematic') {
        // For thematic plans, add to current topic
        if (currentTopic) {
          currentTopic.verses.push(...verses)
        }
      } else if (planType === 'chronological') {
        // For chronological plans, allow both with (##) and without subsections
        if (currentTopic) {
          // If there's a topic (##), add to topic
          currentTopic.verses.push(...verses)
          if (timeDuration) {
            currentTopic.duration = timeDuration
          }
        } else if (!currentSection.bookRange && !currentSection.verses) {
          // If no topic and section is empty, treat as direct section content
          currentSection.verses = verses
          if (timeDuration) {
            currentSection.duration = timeDuration
          }
        }
      }
    }
  }

  if (currentSection) {
    sections.push(currentSection)
  }

  return sections
}

/**
 * Parse a content line (verses + optional time directive)
 * Examples:
 * - "01-05"
 * - "19:23; 19:119; 19:150"
 * - "01-66 (/1Y)"
 * - "45-58 (/1M)"
 */
const parseContentLine = (line, planType) => {
  let timeDuration = null
  let contentLine = line

  // Check for time directive
  const timeMatch = line.match(/\s*\(\/[^\)]+\)/)
  if (timeMatch) {
    timeDuration = parseTimeDuration(timeMatch[0])
    contentLine = line.replace(timeMatch[0], '').trim()
  }

  // Split multiple verses by semicolon
  const parts = contentLine.split(';').map(p => p.trim())
  const verses = parts.map(part => parseVerse(part))

  return { verses, timeDuration }
}

/**
 * Validate plan structure
 *
 * Rules:
 * - category: requires bookRange in sections
 * - thematic: requires verses in topics
 * - chronological: requires verses or bookRange (time directive optional)
 */
export const validatePlan = (plan) => {
  const errors = []

  // Check required fields
  if (!plan.id) errors.push('Missing plan ID')
  if (!plan.name || Object.keys(plan.name).length === 0) {
    errors.push('Missing multilingual names')
  }
  if (!plan.type || !['category', 'thematic', 'chronological'].includes(plan.type)) {
    errors.push('Invalid plan type')
  }
  if (!plan.sections || plan.sections.length === 0) {
    errors.push('Plan has no sections')
  }

  // Check language coverage
  const languages = new Set()
  for (const section of plan.sections || []) {
    for (const lang of Object.keys(section.title || {})) {
      languages.add(lang)
    }
    for (const topic of section.topics || []) {
      for (const lang of Object.keys(topic.title || {})) {
        languages.add(lang)
      }
    }
  }

  if (languages.size < 5) {
    errors.push(`Incomplete language coverage: ${Array.from(languages).join(', ')} (need: de, en, es, it, fr)`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Format plan for display (preview)
 */
export const formatPlanPreview = (plan) => {
  let preview = `📖 Plan: ${plan.name.en || plan.name.de}\n`
  preview += `Type: ${plan.type}\n\n`

  for (const section of plan.sections) {
    preview += `📂 ${section.title.en || section.title.de}\n`

    if (section.bookRange) {
      const start = section.bookRange.startBook || section.bookRange.book || '?'
      const end = section.bookRange.endBook || ''
      preview += `   Books: ${start}${end ? `-${end}` : ''}\n`
    }

    if (section.verses && section.verses.length > 0) {
      preview += `   Verses: ${section.verses.length} reference(s)\n`
    }

    if (section.duration) {
      preview += `   Duration: ${section.duration} days\n`
    }

    for (const topic of section.topics || []) {
      preview += `   📌 ${topic.title.en || topic.title.de}\n`
      if (topic.verses && topic.verses.length > 0) {
        preview += `      ${topic.verses.length} verse reference(s)\n`
      }
      if (topic.duration) {
        preview += `      Duration: ${topic.duration} days\n`
      }
    }
    preview += '\n'
  }

  return preview
}

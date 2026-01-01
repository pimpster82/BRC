/**
 * Bible Overview Reading Plan
 * A chronological journey through key Bible accounts
 * Two main sections: Old Testament historical overview + New Testament congregation development
 */

export const bibleOverviewReadings = [
  // Historical Overview of God's Dealings with the Israelites
  { id: 1, section: 'historical', book: 1, startChapter: 12, endChapter: 15 },
  { id: 2, section: 'historical', book: 1, startChapter: 16, endChapter: 18 },
  { id: 3, section: 'historical', book: 1, startChapter: 19, endChapter: 22 },
  { id: 4, section: 'historical', book: 1, startChapter: 23, endChapter: 24 },
  { id: 5, section: 'historical', book: 1, startChapter: 25, endChapter: 27 },
  { id: 6, section: 'historical', book: 1, startChapter: 28, endChapter: 30 },
  { id: 7, section: 'historical', book: 1, startChapter: 31, endChapter: 32 },
  { id: 8, section: 'historical', book: 1, startChapter: 33, endChapter: 34 },
  { id: 9, section: 'historical', book: 1, startChapter: 35, endChapter: 37 },
  { id: 10, section: 'historical', book: 1, startChapter: 38, endChapter: 40 },
  { id: 11, section: 'historical', book: 1, startChapter: 41, endChapter: 42 },
  { id: 12, section: 'historical', book: 1, startChapter: 43, endChapter: 45 },
  { id: 13, section: 'historical', book: 1, startChapter: 46, endChapter: 48 },
  { id: 14, section: 'historical', book: 1, startChapter: 49, endChapter: 50 },
  { id: 15, section: 'historical', book: 2, startChapter: 1, endChapter: 4 },
  { id: 16, section: 'historical', book: 2, startChapter: 5, endChapter: 7 },
  { id: 17, section: 'historical', book: 2, startChapter: 8, endChapter: 10 },
  { id: 18, section: 'historical', book: 2, startChapter: 11, endChapter: 13 },
  { id: 19, section: 'historical', book: 2, startChapter: 14, endChapter: 15 },
  { id: 20, section: 'historical', book: 2, startChapter: 16, endChapter: 18 },
  { id: 21, section: 'historical', book: 2, startChapter: 19, endChapter: 21 },
  { id: 22, section: 'historical', book: 2, startChapter: 31, endChapter: 33 },
  { id: 23, section: 'historical', book: 2, startChapter: 34, endChapter: 35 },
  { id: 24, section: 'historical', book: 4, startChapter: 10, endChapter: 12 },
  { id: 25, section: 'historical', book: 4, startChapter: 13, endChapter: 15 },
  { id: 26, section: 'historical', book: 4, startChapter: 16, endChapter: 18 },
  { id: 27, section: 'historical', book: 4, startChapter: 19, endChapter: 21 },
  { id: 28, section: 'historical', book: 4, startChapter: 22, endChapter: 24 },
  { id: 29, section: 'historical', book: 4, startChapter: 25, endChapter: 27 },
  { id: 30, section: 'historical', book: 4, startChapter: 31, endChapter: 32 },
  { id: 31, section: 'historical', book: 4, startChapter: 33, endChapter: 36 },
  { id: 32, section: 'historical', book: 5, startChapter: 3, endChapter: 4 },
  { id: 33, section: 'historical', book: 5, startChapter: 17, endChapter: 19 },
  { id: 34, section: 'historical', book: 5, startChapter: 29, endChapter: 31 },
  { id: 35, section: 'historical', book: 5, startChapter: 32, endChapter: 32 },
  { id: 36, section: 'historical', book: 5, startChapter: 33, endChapter: 34 },
  { id: 37, section: 'historical', book: 6, startChapter: 1, endChapter: 4 },
  { id: 38, section: 'historical', book: 6, startChapter: 5, endChapter: 7 },
  { id: 39, section: 'historical', book: 6, startChapter: 8, endChapter: 9 },
  { id: 40, section: 'historical', book: 6, startChapter: 10, endChapter: 12 },
  { id: 41, section: 'historical', book: 6, startChapter: 13, endChapter: 15 },
  { id: 42, section: 'historical', book: 6, startChapter: 16, endChapter: 18 },
  { id: 43, section: 'historical', book: 6, startChapter: 19, endChapter: 21 },
  { id: 44, section: 'historical', book: 6, startChapter: 22, endChapter: 24 },
  { id: 45, section: 'historical', book: 7, startChapter: 1, endChapter: 2 },
  { id: 46, section: 'historical', book: 7, startChapter: 3, endChapter: 5 },
  { id: 47, section: 'historical', book: 7, startChapter: 6, endChapter: 7 },
  { id: 48, section: 'historical', book: 7, startChapter: 8, endChapter: 9 },
  { id: 49, section: 'historical', book: 7, startChapter: 10, endChapter: 11 },
  { id: 50, section: 'historical', book: 7, startChapter: 12, endChapter: 13 },
  { id: 51, section: 'historical', book: 7, startChapter: 14, endChapter: 16 },
  { id: 52, section: 'historical', book: 7, startChapter: 17, endChapter: 19 },
  { id: 53, section: 'historical', book: 7, startChapter: 20, endChapter: 21 },
  { id: 54, section: 'historical', book: 8, startChapter: 1, endChapter: 4 },
  { id: 55, section: 'historical', book: 9, startChapter: 1, endChapter: 2 },
  { id: 56, section: 'historical', book: 9, startChapter: 3, endChapter: 6 },
  { id: 57, section: 'historical', book: 9, startChapter: 7, endChapter: 9 },
  { id: 58, section: 'historical', book: 9, startChapter: 10, endChapter: 12 },
  { id: 59, section: 'historical', book: 9, startChapter: 13, endChapter: 14 },
  { id: 60, section: 'historical', book: 9, startChapter: 15, endChapter: 16 },
  { id: 61, section: 'historical', book: 9, startChapter: 17, endChapter: 18 },
  { id: 62, section: 'historical', book: 9, startChapter: 19, endChapter: 21 },
  { id: 63, section: 'historical', book: 9, startChapter: 22, endChapter: 24 },
  { id: 64, section: 'historical', book: 9, startChapter: 25, endChapter: 27 },
  { id: 65, section: 'historical', book: 9, startChapter: 28, endChapter: 31 },
  { id: 66, section: 'historical', book: 10, startChapter: 1, endChapter: 2 },
  { id: 67, section: 'historical', book: 10, startChapter: 3, endChapter: 5 },
  { id: 68, section: 'historical', book: 10, startChapter: 6, endChapter: 8 },
  { id: 69, section: 'historical', book: 10, startChapter: 9, endChapter: 12 },
  { id: 70, section: 'historical', book: 10, startChapter: 13, endChapter: 14 },
  { id: 71, section: 'historical', book: 10, startChapter: 15, endChapter: 16 },
  { id: 72, section: 'historical', book: 10, startChapter: 17, endChapter: 18 },
  { id: 73, section: 'historical', book: 10, startChapter: 19, endChapter: 20 },
  { id: 74, section: 'historical', book: 10, startChapter: 21, endChapter: 22 },
  { id: 75, section: 'historical', book: 10, startChapter: 23, endChapter: 24 },
  { id: 76, section: 'historical', book: 11, startChapter: 1, endChapter: 2 },
  { id: 77, section: 'historical', book: 11, startChapter: 3, endChapter: 5 },
  { id: 78, section: 'historical', book: 11, startChapter: 6, endChapter: 7 },
  { id: 79, section: 'historical', book: 11, startChapter: 8, endChapter: 8 },
  { id: 80, section: 'historical', book: 11, startChapter: 9, endChapter: 10 },
  { id: 81, section: 'historical', book: 11, startChapter: 11, endChapter: 12 },
  { id: 82, section: 'historical', book: 11, startChapter: 13, endChapter: 14 },
  { id: 83, section: 'historical', book: 11, startChapter: 15, endChapter: 17 },
  { id: 84, section: 'historical', book: 11, startChapter: 18, endChapter: 19 },
  { id: 85, section: 'historical', book: 11, startChapter: 20, endChapter: 21 },
  { id: 86, section: 'historical', book: 11, startChapter: 22, endChapter: 22 },
  { id: 87, section: 'historical', book: 12, startChapter: 1, endChapter: 3 },
  { id: 88, section: 'historical', book: 12, startChapter: 4, endChapter: 5 },
  { id: 89, section: 'historical', book: 12, startChapter: 6, endChapter: 8 },
  { id: 90, section: 'historical', book: 12, startChapter: 9, endChapter: 10 },
  { id: 91, section: 'historical', book: 12, startChapter: 11, endChapter: 13 },
  { id: 92, section: 'historical', book: 12, startChapter: 14, endChapter: 15 },
  { id: 93, section: 'historical', book: 12, startChapter: 16, endChapter: 17 },
  { id: 94, section: 'historical', book: 12, startChapter: 18, endChapter: 19 },
  { id: 95, section: 'historical', book: 12, startChapter: 20, endChapter: 22 },
  { id: 96, section: 'historical', book: 12, startChapter: 23, endChapter: 25 },
  { id: 97, section: 'historical', book: 15, startChapter: 1, endChapter: 3 },
  { id: 98, section: 'historical', book: 15, startChapter: 4, endChapter: 7 },
  { id: 99, section: 'historical', book: 15, startChapter: 8, endChapter: 10 },
  { id: 100, section: 'historical', book: 16, startChapter: 1, endChapter: 3 },
  { id: 101, section: 'historical', book: 16, startChapter: 4, endChapter: 6 },
  { id: 102, section: 'historical', book: 16, startChapter: 7, endChapter: 8 },
  { id: 103, section: 'historical', book: 16, startChapter: 9, endChapter: 10 },
  { id: 104, section: 'historical', book: 16, startChapter: 11, endChapter: 13 },
  { id: 105, section: 'historical', book: 17, startChapter: 1, endChapter: 4 },
  { id: 106, section: 'historical', book: 17, startChapter: 5, endChapter: 10 },

  // Chronological Overview of the Development of the Christian Congregation
  { id: 107, section: 'congregation', book: 41, startChapter: 1, endChapter: 3 },
  { id: 108, section: 'congregation', book: 41, startChapter: 4, endChapter: 5 },
  { id: 109, section: 'congregation', book: 42, startChapter: 6, endChapter: 8 },
  { id: 110, section: 'congregation', book: 42, startChapter: 9, endChapter: 10 },
  { id: 111, section: 'congregation', book: 42, startChapter: 11, endChapter: 13 },
  { id: 112, section: 'congregation', book: 42, startChapter: 14, endChapter: 16 },
  { id: 113, section: 'congregation', book: 44, startChapter: 1, endChapter: 3 },
  { id: 114, section: 'congregation', book: 44, startChapter: 4, endChapter: 6 },
  { id: 115, section: 'congregation', book: 44, startChapter: 7, endChapter: 8 },
  { id: 116, section: 'congregation', book: 44, startChapter: 9, endChapter: 11 },
  { id: 117, section: 'congregation', book: 44, startChapter: 12, endChapter: 14 },
  { id: 118, section: 'congregation', book: 44, startChapter: 15, endChapter: 16 },
  { id: 119, section: 'congregation', book: 44, startChapter: 17, endChapter: 19 },
  { id: 120, section: 'congregation', book: 44, startChapter: 20, endChapter: 21 },
  { id: 121, section: 'congregation', book: 44, startChapter: 22, endChapter: 23 },
  { id: 122, section: 'congregation', book: 44, startChapter: 24, endChapter: 26 },
  { id: 123, section: 'congregation', book: 44, startChapter: 27, endChapter: 28 },
]

export const bibleOverviewSections = [
  {
    key: 'historical',
    titleKey: 'bible_overview.historical_overview',
    count: 106
  },
  {
    key: 'congregation',
    titleKey: 'bible_overview.congregation_development',
    count: 17
  }
]

/**
 * Get all readings in a section
 */
export const getReadingsInSection = (sectionKey) => {
  return bibleOverviewReadings.filter(reading => reading.section === sectionKey)
}

/**
 * Get section for a specific reading ID
 */
export const getSectionForReading = (readingId) => {
  const reading = bibleOverviewReadings.find(r => r.id === readingId)
  return reading ? reading.section : null
}

/**
 * Get completed readings from localStorage
 */
const getCompletedReadings = () => {
  try {
    const stored = localStorage.getItem('bibleCompanion_bibleOverview')
    if (!stored) return []
    const data = JSON.parse(stored)
    return data.completedReadings || []
  } catch (error) {
    console.error('Failed to load Bible Overview data:', error)
    return []
  }
}

/**
 * Save completed readings to localStorage
 */
const saveCompletedReadings = (completedReadings) => {
  try {
    const data = {
      completedReadings,
      lastUpdated: new Date().toISOString()
    }
    localStorage.setItem('bibleCompanion_bibleOverview', JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save Bible Overview data:', error)
  }
}

/**
 * Check if a reading is completed by checking if all its chapters are in chaptersRead
 * @param {number} readingId - Reading ID
 * @param {Array} chaptersRead - Global chaptersRead array from personalData
 */
export const isReadingCompleted = (readingId, chaptersRead = []) => {
  const reading = bibleOverviewReadings.find(r => r.id === readingId)
  if (!reading) return false

  // Check if ALL chapters from startChapter to endChapter are in chaptersRead
  for (let ch = reading.startChapter; ch <= reading.endChapter; ch++) {
    const found = chaptersRead.find(c => c.book === reading.book && c.chapter === ch)
    if (!found) return false
  }

  return true
}

/**
 * Mark a reading as completed by adding all its chapters to chaptersRead
 * @param {number} readingId - Reading ID
 * @param {Array} chaptersRead - Current chaptersRead array
 * @returns {Array} Updated chaptersRead array
 */
export const markReadingComplete = (readingId, chaptersRead = []) => {
  const reading = bibleOverviewReadings.find(r => r.id === readingId)
  if (!reading) return chaptersRead

  const newChaptersRead = [...chaptersRead]
  const timestamp = new Date().toISOString()

  // Add all chapters from this reading to chaptersRead
  for (let ch = reading.startChapter; ch <= reading.endChapter; ch++) {
    const exists = newChaptersRead.find(c => c.book === reading.book && c.chapter === ch)
    if (!exists) {
      newChaptersRead.push({
        book: reading.book,
        chapter: ch,
        status: 'complete',  // Add status for Free Reading compatibility
        timestamp
      })
    }
  }

  return newChaptersRead
}

/**
 * Unmark a reading as completed by removing all its chapters from chaptersRead
 * @param {number} readingId - Reading ID
 * @param {Array} chaptersRead - Current chaptersRead array
 * @returns {Array} Updated chaptersRead array
 */
export const unmarkReadingComplete = (readingId, chaptersRead = []) => {
  const reading = bibleOverviewReadings.find(r => r.id === readingId)
  if (!reading) return chaptersRead

  // Remove all chapters from this reading from chaptersRead
  const newChaptersRead = chaptersRead.filter(c => {
    if (c.book !== reading.book) return true
    if (c.chapter < reading.startChapter || c.chapter > reading.endChapter) return true
    return false
  })

  return newChaptersRead
}

/**
 * Get progress for Bible Overview plan
 * @param {Array} chaptersRead - Global chaptersRead array
 */
export const getBibleOverviewProgress = (chaptersRead = []) => {
  const total = bibleOverviewReadings.length
  let completed = 0

  // Count how many readings are completed based on chaptersRead
  for (const reading of bibleOverviewReadings) {
    if (isReadingCompleted(reading.id, chaptersRead)) {
      completed++
    }
  }

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return {
    total,
    completed,
    percentage
  }
}

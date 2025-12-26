/**
 * Reading Categories for Free Reading Plan
 * Organized by historical/thematic periods
 */

export const readingCategories = [
  {
    id: 1,
    bookRange: [1, 5],
    translationKey: 'reading.category_creation',
    description: 'Genesis through Deuteronomy'
  },
  {
    id: 2,
    bookRange: [6, 8],
    translationKey: 'reading.category_promised_land',
    description: 'Joshua through Ruth'
  },
  {
    id: 3,
    bookRange: [9, 14],
    translationKey: 'reading.category_kings',
    description: '1 Samuel through 2 Chronicles'
  },
  {
    id: 4,
    bookRange: [15, 17],
    translationKey: 'reading.category_exile_return',
    description: 'Ezra through Esther'
  },
  {
    id: 5,
    bookRange: [18, 18],
    translationKey: 'reading.category_job',
    description: 'Job'
  },
  {
    id: 6,
    bookRange: [19, 22],
    translationKey: 'reading.category_wisdom',
    description: 'Psalms through Song of Songs'
  },
  {
    id: 7,
    bookRange: [23, 39],
    translationKey: 'reading.category_prophets',
    description: 'Isaiah through Malachi'
  },
  {
    id: 8,
    bookRange: [40, 43],
    translationKey: 'reading.category_gospel',
    description: 'Matthew through John'
  },
  {
    id: 9,
    bookRange: [44, 44],
    translationKey: 'reading.category_acts',
    description: 'Acts'
  },
  {
    id: 10,
    bookRange: [45, 58],
    translationKey: 'reading.category_paul',
    description: 'Romans through Hebrews'
  },
  {
    id: 11,
    bookRange: [59, 66],
    translationKey: 'reading.category_apostles',
    description: 'James through Revelation'
  }
]

/**
 * Get category for a specific book number
 */
export const getCategoryForBook = (bookNumber) => {
  return readingCategories.find(
    cat => bookNumber >= cat.bookRange[0] && bookNumber <= cat.bookRange[1]
  )
}

/**
 * Get all books in a category
 */
export const getBooksInCategory = (categoryId) => {
  const category = readingCategories.find(cat => cat.id === categoryId)
  if (!category) return []

  const [start, end] = category.bookRange
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

/**
 * Thematic Reading Plan Topics
 * Organized by theme with specific scripture references
 * Used for the Thematic Plan mode in Personal Reading
 *
 * NEW FORMAT (Language-Independent):
 * Each topic has a 'readings' array with book numbers (1-66) instead of string-based verses.
 * This allows cross-language support and integration with unified progress tracking.
 *
 * Reading Formats:
 * - Full chapters: { book: 8, startChapter: 1, endChapter: 4 }
 * - Single chapter: { book: 9, chapter: 17 }
 * - Partial chapter: { book: 9, chapter: 25, startVerse: 2, endVerse: 35 }
 * - Scattered verses: { book: 49, chapter: 5, verses: [28, 29, 33] }
 * - Cross-chapter verse range: { book: 1, startChapter: 6, startVerse: 9, endChapter: 9, endVerse: 19 }
 */

export const thematicTopics = [
  // Famous People and Stories
  {
    id: 1,
    section: 'famous_people',
    titleKey: 'thematic.noah',
    readings: [
      { book: 1, startChapter: 6, startVerse: 9, endChapter: 9, endVerse: 19 } // Genesis 6:9–9:19
    ]
  },
  {
    id: 2,
    section: 'famous_people',
    titleKey: 'thematic.moses',
    readings: [
      { book: 2, startChapter: 13, startVerse: 17, endChapter: 14, endVerse: 31 } // Exodus 13:17–14:31
    ]
  },
  {
    id: 3,
    section: 'famous_people',
    titleKey: 'thematic.ruth',
    readings: [
      { book: 8, startChapter: 1, endChapter: 4 } // Ruth 1-4
    ]
  },
  {
    id: 4,
    section: 'famous_people',
    titleKey: 'thematic.david_goliath',
    readings: [
      { book: 9, chapter: 17 } // 1 Samuel 17
    ]
  },
  {
    id: 5,
    section: 'famous_people',
    titleKey: 'thematic.abigail',
    readings: [
      { book: 9, chapter: 25, startVerse: 2, endVerse: 35 } // 1 Samuel 25:2-35
    ]
  },
  {
    id: 6,
    section: 'famous_people',
    titleKey: 'thematic.daniel',
    readings: [
      { book: 27, chapter: 6 } // Daniel 6
    ]
  },
  {
    id: 7,
    section: 'famous_people',
    titleKey: 'thematic.elizabeth_mary',
    readings: [
      { book: 42, startChapter: 1, endChapter: 2 } // Luke 1-2
    ]
  },

  // Wisdom for Daily Living
  {
    id: 8,
    section: 'wisdom',
    titleKey: 'thematic.family',
    readings: [
      { book: 49, chapter: 5, verses: [28, 29, 33] }, // Ephesians 5:28, 29, 33
      { book: 49, chapter: 6, startVerse: 1, endVerse: 4 } // Ephesians 6:1-4
    ]
  },
  {
    id: 9,
    section: 'wisdom',
    titleKey: 'thematic.friendships',
    readings: [
      { book: 20, chapter: 13, verses: [20] }, // Proverbs 13:20
      { book: 20, chapter: 17, verses: [17] }, // Proverbs 17:17
      { book: 20, chapter: 27, verses: [17] }  // Proverbs 27:17
    ]
  },
  {
    id: 10,
    section: 'wisdom',
    titleKey: 'thematic.prayer',
    readings: [
      { book: 19, chapter: 55, verses: [22] }, // Psalm 55:22
      { book: 19, chapter: 62, verses: [8] },  // Psalm 62:8
      { book: 62, chapter: 5, verses: [14] }   // 1 John 5:14
    ]
  },
  {
    id: 11,
    section: 'wisdom',
    titleKey: 'thematic.sermon_mount',
    readings: [
      { book: 40, startChapter: 5, endChapter: 7 } // Matthew 5-7
    ]
  },
  {
    id: 12,
    section: 'wisdom',
    titleKey: 'thematic.work',
    readings: [
      { book: 20, chapter: 14, verses: [23] },     // Proverbs 14:23
      { book: 21, chapter: 3, verses: [12, 13] },  // Ecclesiastes 3:12, 13
      { book: 21, chapter: 4, verses: [6] }        // Ecclesiastes 4:6
    ]
  },

  // When You Need Help With...
  {
    id: 13,
    section: 'help',
    titleKey: 'thematic.discouragement',
    readings: [
      { book: 19, chapter: 23 },              // Psalm 23
      { book: 23, chapter: 41, verses: [10] } // Isaiah 41:10
    ]
  },
  {
    id: 14,
    section: 'help',
    titleKey: 'thematic.grief',
    readings: [
      { book: 47, chapter: 1, verses: [3, 4] }, // 2 Corinthians 1:3, 4
      { book: 60, chapter: 5, verses: [7] }     // 1 Peter 5:7
    ]
  },
  {
    id: 15,
    section: 'help',
    titleKey: 'thematic.guilt',
    readings: [
      { book: 19, chapter: 86, verses: [5] },      // Psalm 86:5
      { book: 26, chapter: 18, verses: [21, 22] }  // Ezekiel 18:21, 22
    ]
  },

  // What the Bible Says About...
  {
    id: 16,
    section: 'about',
    titleKey: 'thematic.last_days',
    readings: [
      { book: 40, chapter: 24, startVerse: 3, endVerse: 14 }, // Matthew 24:3-14
      { book: 55, chapter: 3, startVerse: 1, endVerse: 5 }    // 2 Timothy 3:1-5
    ]
  },
  {
    id: 17,
    section: 'about',
    titleKey: 'thematic.hope_future',
    readings: [
      { book: 19, chapter: 37, verses: [10, 11, 29] }, // Psalm 37:10, 11, 29
      { book: 66, chapter: 21, verses: [3, 4] }        // Revelation 21:3, 4
    ]
  }
]

/**
 * Get all topics for a specific section
 */
export const getTopicsInSection = (section) => {
  return thematicTopics.filter(topic => topic.section === section)
}

/**
 * Get topic by ID
 */
export const getTopicById = (id) => {
  return thematicTopics.find(topic => topic.id === id)
}

/**
 * Get all sections
 */
export const getThematicSections = () => {
  return [
    {
      key: 'famous_people',
      titleKey: 'thematic.section_famous_people'
    },
    {
      key: 'wisdom',
      titleKey: 'thematic.section_wisdom'
    },
    {
      key: 'help',
      titleKey: 'thematic.section_help'
    },
    {
      key: 'about',
      titleKey: 'thematic.section_about'
    }
  ]
}

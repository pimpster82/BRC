/**
 * Thematic Reading Plan Topics
 * Organized by theme with specific scripture references
 * Used for the Thematic Plan mode in Personal Reading
 */

export const thematicTopics = [
  // Famous People and Stories
  {
    id: 1,
    section: 'famous_people',
    titleKey: 'thematic.noah',
    verses: 'Genesis 6:9–9:19'
  },
  {
    id: 2,
    section: 'famous_people',
    titleKey: 'thematic.moses',
    verses: 'Exodus 13:17–14:31'
  },
  {
    id: 3,
    section: 'famous_people',
    titleKey: 'thematic.ruth',
    verses: 'Ruth chapters 1-4'
  },
  {
    id: 4,
    section: 'famous_people',
    titleKey: 'thematic.david_goliath',
    verses: '1 Samuel chapter 17'
  },
  {
    id: 5,
    section: 'famous_people',
    titleKey: 'thematic.abigail',
    verses: '1 Samuel 25:2-35'
  },
  {
    id: 6,
    section: 'famous_people',
    titleKey: 'thematic.daniel',
    verses: 'Daniel chapter 6'
  },
  {
    id: 7,
    section: 'famous_people',
    titleKey: 'thematic.elizabeth_mary',
    verses: 'Luke chapters 1-2'
  },

  // Wisdom for Daily Living
  {
    id: 8,
    section: 'wisdom',
    titleKey: 'thematic.family',
    verses: 'Ephesians 5:28, 29, 33; 6:1-4'
  },
  {
    id: 9,
    section: 'wisdom',
    titleKey: 'thematic.friendships',
    verses: 'Proverbs 13:20; 17:17; 27:17'
  },
  {
    id: 10,
    section: 'wisdom',
    titleKey: 'thematic.prayer',
    verses: 'Psalm 55:22; 62:8; 1 John 5:14'
  },
  {
    id: 11,
    section: 'wisdom',
    titleKey: 'thematic.sermon_mount',
    verses: 'Matthew chapters 5-7'
  },
  {
    id: 12,
    section: 'wisdom',
    titleKey: 'thematic.work',
    verses: 'Proverbs 14:23; Ecclesiastes 3:12, 13; 4:6'
  },

  // When You Need Help With...
  {
    id: 13,
    section: 'help',
    titleKey: 'thematic.discouragement',
    verses: 'Psalm 23; Isaiah 41:10'
  },
  {
    id: 14,
    section: 'help',
    titleKey: 'thematic.grief',
    verses: '2 Corinthians 1:3, 4; 1 Peter 5:7'
  },
  {
    id: 15,
    section: 'help',
    titleKey: 'thematic.guilt',
    verses: 'Psalm 86:5; Ezekiel 18:21, 22'
  },

  // What the Bible Says About...
  {
    id: 16,
    section: 'about',
    titleKey: 'thematic.last_days',
    verses: 'Matthew 24:3-14; 2 Timothy 3:1-5'
  },
  {
    id: 17,
    section: 'about',
    titleKey: 'thematic.hope_future',
    verses: 'Psalm 37:10, 11, 29; Revelation 21:3, 4'
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

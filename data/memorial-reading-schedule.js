/**
 * Memorial Bible Reading Schedule for 2025
 * Covers the final week of Jesus' life on Earth
 * Memorial Date: Saturday, April 12, 2025 (after sundown) - Nisan 14
 */

export const memorial2025 = {
  memorialDate: "2025-04-12",
  memorialDateFormatted: "Saturday, April 12, 2025 (after sundown)",
  nisanDay: 14,
  
  // Reading schedule starts approximately 1-2 weeks before Memorial
  readingSchedule: [
    {
      nisanDay: 8,
      date: "2025-04-06", // Approximately - needs solar/lunar calculation
      dayOfWeek: "Sunday",
      phase: "Before Memorial Week",
      readings: [
        { book: 43, startChapter: 11, endChapter: 11, startVerse: 55, endVerse: 999, reference: "John 11:55–12:1" }
      ]
    },
    {
      nisanDay: 9,
      date: "2025-04-07", // Monday
      dayOfWeek: "Monday",
      phase: "Before Memorial Week",
      readings: [
        { book: 40, startChapter: 26, endChapter: 26, startVerse: 6, endVerse: 13, reference: "Matthew 26:6-13" },
        { book: 41, startChapter: 14, endChapter: 14, startVerse: 3, endVerse: 9, reference: "Mark 14:3-9" },
        { book: 43, startChapter: 12, endChapter: 12, startVerse: 2, endVerse: 11, reference: "John 12:2-11" }
      ],
      additionalReading: "Jesus—The Way, chap. 101"
    },
    {
      nisanDay: 10,
      date: "2025-04-08", // Tuesday - Triumphal Entry
      dayOfWeek: "Tuesday",
      phase: "Memorial Week",
      readings: [
        { book: 40, startChapter: 21, endChapter: 21, startVerse: 1, endVerse: 11, reference: "Matthew 21:1-11" },
        { book: 40, startChapter: 21, endChapter: 21, startVerse: 14, endVerse: 17, reference: "Matthew 21:14-17" },
        { book: 41, startChapter: 11, endChapter: 11, startVerse: 1, endVerse: 11, reference: "Mark 11:1-11" },
        { book: 42, startChapter: 19, endChapter: 19, startVerse: 29, endVerse: 44, reference: "Luke 19:29-44" },
        { book: 43, startChapter: 12, endChapter: 12, startVerse: 12, endVerse: 19, reference: "John 12:12-19" }
      ],
      additionalReading: "Jesus—The Way, chap. 102"
    },
    {
      nisanDay: 11,
      date: "2025-04-09", // Wednesday
      dayOfWeek: "Wednesday",
      phase: "Memorial Week",
      readings: [
        { book: 40, startChapter: 21, endChapter: 21, startVerse: 12, endVerse: 13, reference: "Matthew 21:12-13" },
        { book: 40, startChapter: 21, endChapter: 21, startVerse: 18, endVerse: 19, reference: "Matthew 21:18-19" },
        { book: 41, startChapter: 11, endChapter: 11, startVerse: 12, endVerse: 19, reference: "Mark 11:12-19" },
        { book: 42, startChapter: 19, endChapter: 19, startVerse: 45, endVerse: 48, reference: "Luke 19:45-48" },
        { book: 43, startChapter: 12, endChapter: 12, startVerse: 20, endVerse: 50, reference: "John 12:20-50" }
      ],
      additionalReading: "Jesus—The Way, chaps. 103-104"
    },
    {
      nisanDay: 12,
      date: "2025-04-10", // Thursday
      dayOfWeek: "Thursday",
      phase: "Memorial Week",
      readings: [
        { book: 40, startChapter: 21, endChapter: 25, startVerse: 19, endVerse: 999, reference: "Matthew 21:19–25:46" },
        { book: 41, startChapter: 11, endChapter: 13, startVerse: 20, endVerse: 999, reference: "Mark 11:20–13:37" },
        { book: 42, startChapter: 20, endChapter: 21, startVerse: 1, endVerse: 999, reference: "Luke 20:1–21:38" }
      ],
      additionalReading: "Jesus—The Way, chaps. 105-114"
    },
    {
      nisanDay: 13,
      date: "2025-04-11", // Friday
      dayOfWeek: "Friday",
      phase: "Memorial Week - Day Before",
      readings: [
        { book: 40, startChapter: 26, endChapter: 26, startVerse: 1, endVerse: 5, reference: "Matthew 26:1-5" },
        { book: 40, startChapter: 26, endChapter: 26, startVerse: 14, endVerse: 16, reference: "Matthew 26:14-16" },
        { book: 41, startChapter: 14, endChapter: 14, startVerse: 1, endVerse: 2, reference: "Mark 14:1-2" },
        { book: 41, startChapter: 14, endChapter: 14, startVerse: 10, endVerse: 11, reference: "Mark 14:10-11" },
        { book: 42, startChapter: 22, endChapter: 22, startVerse: 1, endVerse: 6, reference: "Luke 22:1-6" }
      ],
      additionalReading: "Jesus—The Way, chap. 115"
    },
    {
      nisanDay: 14,
      date: "2025-04-12", // Saturday - MEMORIAL DAY
      dayOfWeek: "Saturday",
      phase: "Memorial (after sunset)",
      readings: [
        { book: 40, startChapter: 26, endChapter: 26, startVerse: 17, endVerse: 19, reference: "Matthew 26:17-19" },
        { book: 41, startChapter: 14, endChapter: 14, startVerse: 12, endVerse: 16, reference: "Mark 14:12-16" },
        { book: 42, startChapter: 22, endChapter: 22, startVerse: 7, endVerse: 13, reference: "Luke 22:7-13" },
        { book: 40, startChapter: 26, endChapter: 26, startVerse: 20, endVerse: 75, reference: "Matthew 26:20-75" },
        { book: 41, startChapter: 14, endChapter: 14, startVerse: 17, endVerse: 72, reference: "Mark 14:17-72" },
        { book: 42, startChapter: 22, endChapter: 22, startVerse: 14, endVerse: 65, reference: "Luke 22:14-65" },
        { book: 43, startChapter: 13, endChapter: 18, startVerse: 1, endVerse: 27, reference: "John 13:1–18:27" }
      ],
      additionalReading: "Jesus—The Way, chaps. 116-126",
      isMemorialDay: true
    },
    {
      nisanDay: 15,
      date: "2025-04-13", // Sunday - Crucifixion & Death
      dayOfWeek: "Sunday",
      phase: "After Memorial",
      readings: [
        { book: 40, startChapter: 27, endChapter: 27, startVerse: 1, endVerse: 61, reference: "Matthew 27:1-61" },
        { book: 41, startChapter: 15, endChapter: 15, startVerse: 1, endVerse: 47, reference: "Mark 15:1-47" },
        { book: 42, startChapter: 22, endChapter: 23, startVerse: 66, endVerse: 999, reference: "Luke 22:66–23:56" },
        { book: 43, startChapter: 18, endChapter: 19, startVerse: 28, endVerse: 999, reference: "John 18:28–19:42" }
      ],
      additionalReading: "Jesus—The Way, chaps. 127-133"
    },
    {
      nisanDay: 16,
      date: "2025-04-14", // Monday - Tomb Guarded
      dayOfWeek: "Monday",
      phase: "After Memorial",
      readings: [
        { book: 40, startChapter: 27, endChapter: 27, startVerse: 62, endVerse: 66, reference: "Matthew 27:62-66" },
        { book: 41, startChapter: 16, endChapter: 16, startVerse: 1, endVerse: 1, reference: "Mark 16:1" }
      ]
    },
    {
      nisanDay: 17,
      date: "2025-04-15", // Tuesday - Resurrection
      dayOfWeek: "Tuesday",
      phase: "After Memorial - Resurrection",
      readings: [
        { book: 40, startChapter: 28, endChapter: 28, startVerse: 1, endVerse: 15, reference: "Matthew 28:1-15" },
        { book: 41, startChapter: 16, endChapter: 16, startVerse: 2, endVerse: 8, reference: "Mark 16:2-8" },
        { book: 42, startChapter: 24, endChapter: 24, startVerse: 1, endVerse: 49, reference: "Luke 24:1-49" },
        { book: 43, startChapter: 20, endChapter: 20, startVerse: 1, endVerse: 25, reference: "John 20:1-25" }
      ],
      additionalReading: "Jesus—The Way, chaps. 134-135"
    }
  ]
};

/**
 * Helper function to generate JW.org links for Memorial readings
 */
export function getMemorialReadingLink(nisanDay, locale = 'E') {
  const day = memorial2025.readingSchedule.find(d => d.nisanDay === nisanDay);
  if (!day) return null;
  
  // For days with multiple separate readings, create combined link
  // This is a simplified version - may need refinement based on how you want to handle multiple readings
  const allReadings = day.readings.map(r => {
    const bookStr = r.book.toString().padStart(2, '0');
    const startChapterStr = r.startChapter.toString().padStart(3, '0');
    const startVerseStr = r.startVerse.toString().padStart(3, '0');
    
    let endChapterStr, endVerseStr;
    if (r.endChapter) {
      endChapterStr = r.endChapter.toString().padStart(3, '0');
      endVerseStr = (r.endVerse || 999).toString().padStart(3, '0');
    } else {
      endChapterStr = startChapterStr;
      endVerseStr = '999';
    }
    
    return {
      start: `${bookStr}${startChapterStr}${startVerseStr}`,
      end: `${bookStr}${endChapterStr}${endVerseStr}`,
      reference: r.reference
    };
  });
  
  return {
    date: day.date,
    dayOfWeek: day.dayOfWeek,
    nisanDay: day.nisanDay,
    phase: day.phase,
    isMemorialDay: day.isMemorialDay || false,
    readings: allReadings.map(r => ({
      reference: r.reference,
      link: `https://www.jw.org/finder?srcid=jwlshare&wtlocale=${locale}&prefer=lang&bible=${r.start}-${r.end}&pub=nwtsty`
    })),
    additionalReading: day.additionalReading
  };
}

/**
 * Check if a given date falls within Memorial reading period
 */
export function isMemorialReadingPeriod(dateString) {
  const date = new Date(dateString);
  const startDate = new Date(memorial2025.readingSchedule[0].date);
  const endDate = new Date(memorial2025.readingSchedule[memorial2025.readingSchedule.length - 1].date);
  
  return date >= startDate && date <= endDate;
}

/**
 * Get Memorial reading for a specific date
 */
export function getMemorialReadingForDate(dateString, locale = 'E') {
  const day = memorial2025.readingSchedule.find(d => d.date === dateString);
  if (!day) return null;
  
  return getMemorialReadingLink(day.nisanDay, locale);
}

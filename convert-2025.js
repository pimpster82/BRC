const fs = require('fs');

// Get the 2025 schedule
const schedule2025 = require('./data/weekly-reading-schedule-2025.js').weeklyReadingSchedule2025;

// Convert each entry
const converted = schedule2025.map(week => {
  // Parse chapters from the reading string
  const match = week.reading.match(/(\d+)(?:-(\d+))?$/);
  const startChapter = parseInt(match[1], 10);
  const endChapter = match[2] ? parseInt(match[2], 10) : startChapter;

  return {
    ...week,
    reading: {
      book: week.bookNumber,
      startChapter,
      endChapter
    }
  };
});

// Generate the new file content
const lines = ['// Weekly Bible Reading Schedule for 2025', '// Source: https://wol.jw.org/en/wol/d/r1/lp-e/1102025214', '', 'export const weeklyReadingSchedule2025 = ['];

converted.forEach((w, idx) => {
  const readingObj = `{ book: ${w.reading.book}, startChapter: ${w.reading.startChapter}, endChapter: ${w.reading.endChapter} }`;
  const chapters = w.chapters.map(c => c).join(', ');
  const line = `  { weekStart: '${w.weekStart}', weekEnd: '${w.weekEnd}', reading: ${readingObj}, chapters: [${chapters}], year: ${w.year}, month: ${w.month} }`;
  lines.push(idx < converted.length - 1 ? line + ',' : line);
});

lines.push(']', '', 'export default weeklyReadingSchedule2025', '');

fs.writeFileSync('./data/weekly-reading-schedule-2025.js', lines.join('\n'));
console.log('✓ Converted weekly-reading-schedule-2025.js');

#!/usr/bin/env node
/**
 * Convert schedule files from old string format to new object format
 * Old: reading: 'Psalms 127-134'
 * New: reading: { book: 19, startChapter: 127, endChapter: 134 }
 */

const fs = require('fs');
const path = require('path');

// Parse reading string to extract start and end chapters
function parseChapters(readingStr) {
  // Format: "Book1 Chapter-Chapter" or "Book Name1 Chapter-Chapter"
  // Examples: "Psalms 127-134", "Song of Solomon 1-2"

  const match = readingStr.match(/(\d+)(?:-(\d+))?$/);
  if (!match) {
    console.error(`Could not parse chapters from: ${readingStr}`);
    return { start: null, end: null };
  }

  const startChapter = parseInt(match[1], 10);
  const endChapter = match[2] ? parseInt(match[2], 10) : startChapter;

  return { start: startChapter, end: endChapter };
}

// Convert a single week object
function convertWeek(week) {
  if (!week.reading || typeof week.reading !== 'string') {
    return week; // Skip if already in new format or invalid
  }

  const chapters = parseChapters(week.reading);

  if (chapters.start === null) {
    return week; // Skip if parsing failed
  }

  // Create new reading object format
  const newReading = {
    book: week.bookNumber,
    startChapter: chapters.start,
    endChapter: chapters.end
  };

  // Return week with new reading format
  return {
    ...week,
    reading: newReading
  };
}

// Convert a schedule file
function convertScheduleFile(filePath) {
  console.log(`Processing: ${filePath}`);

  const content = fs.readFileSync(filePath, 'utf8');

  // Extract the array export
  const match = content.match(/export const\s+\w+\s*=\s*\[([\s\S]*)\];/);
  if (!match) {
    console.error(`Could not find schedule array in ${filePath}`);
    return;
  }

  // Import the schedule to work with actual JavaScript objects
  // We'll use dynamic import
  const scheduleData = require(filePath);
  const scheduleKey = Object.keys(scheduleData).find(key => Array.isArray(scheduleData[key]));

  if (!scheduleKey) {
    console.error(`No array export found in ${filePath}`);
    return;
  }

  const schedule = scheduleData[scheduleKey];
  const convertedSchedule = schedule.map(convertWeek);

  // Generate the new file content
  const year = path.basename(filePath).match(/\d+/)[0];
  const exportName = `weeklyReadingSchedule${year}`;

  // Build the array content
  const arrayContent = convertedSchedule
    .map(week => {
      const readingStr = typeof week.reading === 'string'
        ? `'${week.reading}'`
        : `{ book: ${week.reading.book}, startChapter: ${week.reading.startChapter}, endChapter: ${week.reading.endChapter} }`;

      return `  { weekStart: '${week.weekStart}', weekEnd: '${week.weekEnd}', reading: ${readingStr}, chapters: [${week.chapters.join(', ')}], year: ${week.year}, month: ${week.month} }`;
    })
    .join(',\n');

  const newContent = `// Weekly Bible Reading Schedule for ${year}
// Source: https://wol.jw.org/en/wol/d/r1/lp-e/1102025214

export const ${exportName} = [
${arrayContent}
]

export default ${exportName}
`;

  fs.writeFileSync(filePath, newContent);
  console.log(`✓ Converted ${filePath}`);
}

// Main
const scheduleDir = path.join(__dirname, 'data');
const scheduleFiles = fs.readdirSync(scheduleDir)
  .filter(f => f.match(/^weekly-reading-schedule-\d+\.js$/))
  .map(f => path.join(scheduleDir, f));

console.log(`Found ${scheduleFiles.length} schedule files to convert\n`);

scheduleFiles.forEach(convertScheduleFile);

console.log('\n✓ All schedule files converted successfully!');

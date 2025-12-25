/**
 * Bible Link Builder for JW.org
 * Generates links that open JW Library app if available, otherwise jw.org website
 */

import bibleBooks from './bible-books-en.json';

/**
 * Map of language codes to JW.org locale paths
 * Format: { languageCode: { locale: 'wtlocale code', path: 'url path' } }
 */
const LANGUAGE_LOCALES = {
  de: { locale: 'de', path: '/de/bibliothek/bibel/studienbibel/buecher' },
  en: { locale: 'E', path: '/en/library/bible/study-bible/books' },
  es: { locale: 'es', path: '/es/biblioteca/biblia/biblia-estudio/libros' },
  it: { locale: 'it', path: '/it/biblioteca-digitale/bibbia/bibbia-per-lo-studio/libri' },
  fr: { locale: 'fr', path: '/fr/bibliothèque/bible/bible-d-etude/livres' },
};

/**
 * Map of book numbers to localized names on JW.org
 * Key is book number (1-66), values are the URL slugs for each language
 * IMPORTANT: This is built from bible-books-en.json as the master source
 */
const LOCALIZED_BOOK_SLUGS = {
  1: { de: 'mose', en: 'genesis', es: 'génesis', it: 'genesi', fr: 'genèse' },
  2: { de: 'mose', en: 'exodus', es: 'éxodo', it: 'esodo', fr: 'exode' },
  3: { de: 'mose', en: 'leviticus', es: 'levítico', it: 'levitico', fr: 'lévitique' },
  4: { de: 'mose', en: 'numbers', es: 'números', it: 'numeri', fr: 'nombres' },
  5: { de: 'mose', en: 'deuteronomy', es: 'deuteronomio', it: 'deuteronomio', fr: 'deutéronome' },
  6: { de: 'josua', en: 'joshua', es: 'josué', it: 'giosuè', fr: 'josué' },
  7: { de: 'richter', en: 'judges', es: 'jueces', it: 'giudici', fr: 'juges' },
  8: { de: 'ruth', en: 'ruth', es: 'rut', it: 'rut', fr: 'ruth' },
  9: { de: 'samuel', en: '1-samuel', es: '1-samuel', it: '1-samuele', fr: '1-samuel' },
  10: { de: 'samuel', en: '2-samuel', es: '2-samuel', it: '2-samuele', fr: '2-samuel' },
  11: { de: 'koenige', en: '1-kings', es: '1-reyes', it: '1-re', fr: '1-rois' },
  12: { de: 'koenige', en: '2-kings', es: '2-reyes', it: '2-re', fr: '2-rois' },
  13: { de: 'chronik', en: '1-chronicles', es: '1-crónicas', it: '1-cronache', fr: '1-chroniques' },
  14: { de: 'chronik', en: '2-chronicles', es: '2-crónicas', it: '2-cronache', fr: '2-chroniques' },
  15: { de: 'esra', en: 'ezra', es: 'esdras', it: 'esdra', fr: 'esdras' },
  16: { de: 'nehemia', en: 'nehemiah', es: 'nehemías', it: 'neemia', fr: 'néhémie' },
  17: { de: 'esther', en: 'esther', es: 'ester', it: 'ester', fr: 'esther' },
  18: { de: 'hiob', en: 'job', es: 'job', it: 'giobbe', fr: 'job' },
  19: { de: 'psalm', en: 'psalms', es: 'salmos', it: 'salmi', fr: 'psaumes' },
  20: { de: 'sprueche', en: 'proverbs', es: 'proverbios', it: 'proverbi', fr: 'proverbes' },
  21: { de: 'prediger', en: 'ecclesiastes', es: 'eclesiastés', it: 'ecclesiaste', fr: 'ecclésiaste' },
  22: { de: 'hohelied', en: 'song-of-solomon', es: 'cantares', it: 'cantico', fr: 'cantique-des-cantiques' },
  23: { de: 'jesaja', en: 'isaiah', es: 'isaías', it: 'isaia', fr: 'isaïe' },
  24: { de: 'jeremia', en: 'jeremiah', es: 'jeremías', it: 'geremia', fr: 'jérémie' },
  25: { de: 'klagelieder', en: 'lamentations', es: 'lamentaciones', it: 'lamentazioni', fr: 'lamentations' },
  26: { de: 'ezechiel', en: 'ezekiel', es: 'ezequiel', it: 'ezechiele', fr: 'ézéchiel' },
  27: { de: 'daniel', en: 'daniel', es: 'daniel', it: 'daniele', fr: 'daniel' },
  28: { de: 'hosea', en: 'hosea', es: 'oseas', it: 'osea', fr: 'osée' },
  29: { de: 'joel', en: 'joel', es: 'joel', it: 'gioele', fr: 'joël' },
  30: { de: 'amos', en: 'amos', es: 'amós', it: 'amos', fr: 'amos' },
  31: { de: 'obadja', en: 'obadiah', es: 'abdías', it: 'abdia', fr: 'abdias' },
  32: { de: 'jona', en: 'jonah', es: 'jonás', it: 'giona', fr: 'jonas' },
  33: { de: 'micha', en: 'micah', es: 'miqueas', it: 'michea', fr: 'michée' },
  34: { de: 'nahum', en: 'nahum', es: 'nahúm', it: 'naum', fr: 'nahum' },
  35: { de: 'habakuk', en: 'habakkuk', es: 'habacuc', it: 'abacuc', fr: 'habacuc' },
  36: { de: 'zefanja', en: 'zephaniah', es: 'sofonías', it: 'sofonia', fr: 'sophonie' },
  37: { de: 'haggai', en: 'haggai', es: 'hageo', it: 'aggeo', fr: 'aggée' },
  38: { de: 'sacharja', en: 'zechariah', es: 'zacarías', it: 'zaccaria', fr: 'zacharie' },
  39: { de: 'maleachi', en: 'malachi', es: 'malaquías', it: 'malachia', fr: 'malachie' },
  40: { de: 'matthaeus', en: 'matthew', es: 'mateo', it: 'matteo', fr: 'matthieu' },
  41: { de: 'markus', en: 'mark', es: 'marcos', it: 'marco', fr: 'marc' },
  42: { de: 'lukas', en: 'luke', es: 'lucas', it: 'luca', fr: 'luc' },
  43: { de: 'johannes', en: 'john', es: 'juan', it: 'giovanni', fr: 'jean' },
  44: { de: 'apostelgeschichte', en: 'acts', es: 'hechos', it: 'atti', fr: 'actes' },
  45: { de: 'romer', en: 'romans', es: 'romanos', it: 'romani', fr: 'romains' },
  46: { de: 'korinther', en: '1-corinthians', es: '1-corintios', it: '1-corinzi', fr: '1-corinthiens' },
  47: { de: 'korinther', en: '2-corinthians', es: '2-corintios', it: '2-corinzi', fr: '2-corinthiens' },
  48: { de: 'galater', en: 'galatians', es: 'gálatas', it: 'galati', fr: 'galates' },
  49: { de: 'epheser', en: 'ephesians', es: 'efesios', it: 'efesini', fr: 'éphésiens' },
  50: { de: 'philipper', en: 'philippians', es: 'filipenses', it: 'filippesi', fr: 'philippiens' },
  51: { de: 'kolosser', en: 'colossians', es: 'colosenses', it: 'colossesi', fr: 'colossiens' },
  52: { de: 'thessalonicher', en: '1-thessalonians', es: '1-tesalonicenses', it: '1-tessalonicesi', fr: '1-thessaloniciens' },
  53: { de: 'thessalonicher', en: '2-thessalonians', es: '2-tesalonicenses', it: '2-tessalonicesi', fr: '2-thessaloniciens' },
  54: { de: 'timotheus', en: '1-timothy', es: '1-timoteo', it: '1-timoteo', fr: '1-timothée' },
  55: { de: 'timotheus', en: '2-timothy', es: '2-timoteo', it: '2-timoteo', fr: '2-timothée' },
  56: { de: 'titus', en: 'titus', es: 'tito', it: 'tito', fr: 'tite' },
  57: { de: 'philemon', en: 'philemon', es: 'filemón', it: 'filemone', fr: 'philémon' },
  58: { de: 'hebraer', en: 'hebrews', es: 'hebreos', it: 'ebrei', fr: 'hébreux' },
  59: { de: 'jakobus', en: 'james', es: 'santiago', it: 'giacomo', fr: 'jacques' },
  60: { de: 'petrus', en: '1-peter', es: '1-pedro', it: '1-pietro', fr: '1-pierre' },
  61: { de: 'petrus', en: '2-peter', es: '2-pedro', it: '2-pietro', fr: '2-pierre' },
  62: { de: 'johannes', en: '1-john', es: '1-juan', it: '1-giovanni', fr: '1-jean' },
  63: { de: 'johannes', en: '2-john', es: '2-juan', it: '2-giovanni', fr: '2-jean' },
  64: { de: 'johannes', en: '3-john', es: '3-juan', it: '3-giovanni', fr: '3-jean' },
  65: { de: 'judas', en: 'jude', es: 'judas', it: 'giuda', fr: 'jude' },
  66: { de: 'offenbarung', en: 'revelation', es: 'apocalipsis', it: 'apocalisse', fr: 'apocalypse' },
};

/**
 * Build a JW.org web link for a Bible reading (with hash fragment for verse navigation)
 * @param {number} bookNumber - Bible book number (1-66, where Genesis=1, Matthew=40, Revelation=66)
 * @param {number} startChapter - Starting chapter
 * @param {number} endChapter - Ending chapter (optional, defaults to startChapter)
 * @param {string} languageCode - Language code (de, en, es, it, fr) - defaults to 'en'
 * @param {number} startVerse - Starting verse (optional, defaults to 1)
 * @returns {string} - Complete JW.org web URL with hash fragment for verse navigation
 *
 * IMPORTANT: All book numbers use standard numbering (1-66) matching bible-books-*.json.
 */
export function buildBibleLink(bookNumber, startChapter, endChapter = null, languageCode = 'en', startVerse = 1) {
  // If no end chapter specified, use start chapter
  if (endChapter === null) {
    endChapter = startChapter;
  }

  // Use buildLanguageSpecificWebLink for consistent link generation
  return buildLanguageSpecificWebLink(bookNumber, startChapter, startVerse, endChapter, languageCode)?.web || null;
}

/**
 * Build a JW Library deep link (jwlibrary://) for direct app opening
 * @param {number} bookNumber - Bible book number (1-66)
 * @param {number} chapter - Chapter number
 * @param {number} verse - Starting verse (optional, defaults to 1)
 * @returns {string} - JW Library deep link
 */
export function buildJWLibraryDeepLink(bookNumber, chapter, verse = 1) {
  const bookStr = bookNumber.toString().padStart(2, '0');
  const chapterStr = chapter.toString().padStart(3, '0');
  const verseStr = verse.toString().padStart(3, '0');

  const reference = `${bookStr}${chapterStr}${verseStr}`;
  return `jwlibrary://bible/${reference}`;
}

/**
 * Build a link from book name and chapters
 * @param {string} bookName - Name of the Bible book (e.g., "Genesis", "Revelation")
 * @param {number} startChapter - Starting chapter
 * @param {number} endChapter - Ending chapter (optional)
 * @param {string} locale - Language code (default: 'E' for English)
 * @returns {string|null} - JW.org finder URL or null if book not found
 */
export function buildBibleLinkByName(bookName, startChapter, endChapter = null, locale = 'E') {
  const book = bibleBooks.books.find(
    b => b.name.toLowerCase() === bookName.toLowerCase() || 
         b.abbreviation.toLowerCase() === bookName.toLowerCase()
  );
  
  if (!book) {
    console.error(`Book "${bookName}" not found`);
    return null;
  }
  
  return buildBibleLink(book.number, startChapter, endChapter, locale);
}

/**
 * Get book information by name or number
 * @param {string|number} identifier - Book name or number
 * @returns {object|null} - Book object or null if not found
 */
export function getBookInfo(identifier) {
  if (typeof identifier === 'number') {
    return bibleBooks.books.find(b => b.number === identifier) || null;
  }
  
  return bibleBooks.books.find(
    b => b.name.toLowerCase() === identifier.toLowerCase() || 
         b.abbreviation.toLowerCase() === identifier.toLowerCase()
  ) || null;
}

/**
 * Build a language-specific JW.org web link with JW Library deep link fallback
 * @param {number} bookNumber - Bible book number (1-66, internal system where Isaiah=22)
 * @param {number} chapter - Chapter number
 * @param {number} startVerse - Starting verse (optional, defaults to 1)
 * @param {number} endVerse - Ending verse (optional, defaults to end of chapter)
 * @param {string} languageCode - Language code (de, en, es, it, fr) - defaults to current language or 'en'
 * @returns {object} - Object with web and library links
 */
export function buildLanguageSpecificWebLink(bookNumber, chapter, startVerse = 1, endVerse = null, languageCode = null) {
  // Get current language from localStorage if not specified
  if (!languageCode) {
    languageCode = localStorage.getItem('app_language') || 'en';
  }

  // Get locale info, default to English if language not found
  const localeInfo = LANGUAGE_LOCALES[languageCode] || LANGUAGE_LOCALES['en'];

  // Get localized book slug for this language
  const bookSlugs = LOCALIZED_BOOK_SLUGS[bookNumber];
  if (!bookSlugs) {
    console.error(`Book number ${bookNumber} not found in localized slugs`);
    return null;
  }

  // Use the slug for the current language, fallback to English if not available
  const bookSlug = bookSlugs[languageCode] || bookSlugs['en'];

  // Build the web URL with the correct language path and localized book name
  // The path uses the book slug (e.g., 'isaiah', 'genesis', etc.)
  // The chapter number is appended to the path
  // Example: https://www.jw.org/de/bibliothek/bibel/studienbibel/buecher/jesaja/9/
  const baseUrl = `https://www.jw.org${localeInfo.path}`;
  const webUrl = `${baseUrl}/${bookSlug}/${chapter}/`;

  // Build hash fragment for verse navigation in web link
  // JW.org uses format: v[BBCCCVVV]-v[BBCCCVVV] where:
  // BB = book number (01-66, Genesis=01, Matthew=40, etc.)
  // CCC = chapter (000-999, zero-padded to 3 digits)
  // VVV = verse (000-999, zero-padded to 3 digits)
  // Example: https://www.jw.org/en/library/bible/study-bible/books/matthew/24/#v40024014-v40024019
  const jwOrgBookNumber = bookNumber.toString().padStart(2, '0');
  const chapterStr = chapter.toString().padStart(3, '0');
  const startVerseStr = startVerse.toString().padStart(3, '0');
  const endVerseStr = endVerse ? endVerse.toString().padStart(3, '0') : '999';

  const hashFragment = `#v${jwOrgBookNumber}${chapterStr}${startVerseStr}-v${jwOrgBookNumber}${chapterStr}${endVerseStr}`;
  const webUrlWithHash = `${webUrl}${hashFragment}`;

  // Build JW Library deep link as fallback
  // Format: jwpub://b/NWT/BOOK:CHAPTER:VERSE-BOOK:CHAPTER:VERSE
  // Book numbers in JW Library format: Genesis=1, Matthew=39, Revelation=66
  const libraryStartRef = `${bookNumber}:${chapter}:${startVerse}`;
  const libraryEndRef = endVerse ? `${bookNumber}:${chapter}:${endVerse}` : `${bookNumber}:${chapter}:999`;

  // Use jwpub:// protocol which is supported by JW Library
  const libraryUrl = `jwpub://b/NWT/${libraryStartRef}-${libraryEndRef}`;

  return {
    web: webUrlWithHash,
    library: libraryUrl,
    primary: webUrlWithHash  // Primary is web link with hash for direct verse navigation
  };
}

/**
 * Map English book names to book numbers
 */
const ENGLISH_BOOK_NAMES_TO_NUMBER = {
  'genesis': 1, '1-mose': 1, 'mose': 1,
  'exodus': 2,
  'leviticus': 3,
  'numbers': 4,
  'deuteronomy': 5,
  'joshua': 6, 'josua': 6,
  'judges': 7, 'richter': 7,
  'ruth': 8,
  '1-samuel': 9, '1 samuel': 9, 'samuel': 9,
  '2-samuel': 10,
  '1-kings': 11, '1 kings': 11, 'korinther': 11,
  '2-kings': 12,
  '1-chronicles': 13, '1 chronicles': 13, 'chronik': 13,
  '2-chronicles': 14,
  'ezra': 15, 'esra': 15,
  'nehemiah': 16, 'nehemia': 16,
  'job': 17, 'hiob': 17,
  'psalms': 18, 'psalm': 18,
  'proverbs': 19, 'sprueche': 19,
  'ecclesiastes': 20, 'prediger': 20,
  'song-of-solomon': 21, 'song of solomon': 21, 'hohelied': 21,
  'isaiah': 22, 'jesaja': 22,
  'jeremiah': 23, 'jeremia': 23,
  'lamentations': 24, 'klagelieder': 24,
  'ezekiel': 25, 'ezechiel': 25,
  'daniel': 26,
  'hosea': 27,
  'joel': 28,
  'amos': 29,
  'obadiah': 30, 'obadja': 30,
  'jonah': 31, 'jona': 31,
  'micah': 32, 'micha': 32,
  'nahum': 33,
  'habakkuk': 34, 'habakuk': 34,
  'zephaniah': 35, 'zefanja': 35,
  'haggai': 36,
  'zechariah': 37, 'sacharja': 37,
  'malachi': 38, 'maleachi': 38,
  'matthew': 39, 'matthaeus': 39,
  'mark': 40, 'markus': 40,
  'luke': 41, 'lukas': 41,
  'john': 42, 'johannes': 42,
  'acts': 43, 'apostelgeschichte': 43,
  'romans': 44, 'romer': 44,
  '1-corinthians': 45, '1 corinthians': 45, '1-korinther': 45,
  '2-corinthians': 46, '2 corinthians': 46, '2-korinther': 46,
  'galatians': 47, 'galater': 47,
  'ephesians': 48, 'epheser': 48,
  'philippians': 49, 'philipper': 49,
  'colossians': 50, 'kolosser': 50,
  '1-thessalonians': 51, '1 thessalonians': 51, '1-thessalonicher': 51,
  '2-thessalonians': 52, '2 thessalonians': 52, '2-thessalonicher': 52,
  '1-timothy': 53, '1 timothy': 53, '1-timotheus': 53,
  '2-timothy': 54, '2 timothy': 54, '2-timotheus': 54,
  'titus': 55,
  'philemon': 56,
  'hebrews': 57, 'hebraer': 57,
  'james': 58, 'jakobus': 58,
  '1-peter': 59, '1 peter': 59, '1-petrus': 59,
  '2-peter': 60, '2 peter': 60, '2-petrus': 60,
  '1-john': 61, '1 john': 61, '1-johannes': 61,
  '2-john': 62, '2 john': 62, '2-johannes': 62,
  '3-john': 63, '3 john': 63, '3-johannes': 63,
  'jude': 65, 'judas': 65,
  'revelation': 66, 'offenbarung': 66,
};

/**
 * Get book number from English book name
 * @param {string} bookName - English book name (e.g., "Isaiah", "1 Timothy")
 * @returns {number|null} - Book number (1-66) or null if not found
 */
export function getBookNumberFromName(bookName) {
  if (!bookName) return null;
  const normalized = bookName.toLowerCase().trim();
  return ENGLISH_BOOK_NAMES_TO_NUMBER[normalized] || null;
}

/**
 * Get localized book name by book number
 * @param {number} bookNumber - Bible book number (1-66)
 * @param {string} languageCode - Language code (de, en, es, it, fr) - defaults to current language or 'en'
 * @returns {string} - Localized book name with proper capitalization (e.g., "Isaías", "Isaiah", "Jesaja")
 */
export function getLocalizedBookName(bookNumber, languageCode = null) {
  // Get current language from localStorage if not specified
  if (!languageCode) {
    languageCode = localStorage.getItem('app_language') || 'en';
  }

  const bookSlugs = LOCALIZED_BOOK_SLUGS[bookNumber];
  if (!bookSlugs) {
    console.error(`Book number ${bookNumber} not found`);
    return null;
  }

  // Get slug for the language, fallback to English
  const slug = bookSlugs[languageCode] || bookSlugs['en'];

  // Capitalize the slug properly (handle cases like "1-samuel", "song-of-solomon")
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('-');
}

/**
 * Parse a reading string like "Genesis 1-3" or "Rev 21-22"
 * @param {string} readingString - Reading in format "BookName Chapter-Chapter"
 * @param {string} locale - Language code
 * @returns {string|null} - JW.org finder URL or null if invalid format
 */
export function parseReadingString(readingString, locale = 'E') {
  // Match patterns like "Genesis 1-3", "Rev 21-22", "Psalms 1"
  const match = readingString.match(/^(.+?)\s+(\d+)(?:-(\d+))?$/);

  if (!match) {
    console.error(`Invalid reading format: "${readingString}"`);
    return null;
  }

  const [, bookName, startChapter, endChapter] = match;
  return buildBibleLinkByName(
    bookName.trim(),
    parseInt(startChapter),
    endChapter ? parseInt(endChapter) : null,
    locale
  );
}

/**
 * Build a link from a reading object (language-independent format)
 * @param {Object} reading - Reading object with format { book: number, startChapter: number, endChapter: number }
 * @param {number} chapter - Chapter to open (optional, defaults to startChapter)
 * @param {number} verse - Starting verse (optional, defaults to 1)
 * @param {string} languageCode - Language code (de, en, es, it, fr)
 * @returns {Object} - Object with web and library links
 */
export function buildLinkFromReadingObject(reading, chapter = null, verse = 1, languageCode = null) {
  if (!reading || !reading.book) {
    console.error('Invalid reading object:', reading);
    return null;
  }

  // Use provided chapter or fall back to startChapter
  const chapterToUse = chapter || reading.startChapter;

  return buildLanguageSpecificWebLink(reading.book, chapterToUse, verse, null, languageCode);
}

/**
 * DOCUMENTATION: Book Number Standardization
 *
 * This module standardizes all book numbers using the canonical Genesis-Revelation (1-66) numbering system:
 * - Genesis = 1
 * - Exodus = 2
 * - ...
 * - Matthew = 40
 * - Mark = 41
 * - Luke = 42
 * - John = 43
 * - Acts = 44
 * - ...
 * - Revelation = 66
 *
 * All functions and data structures (bible-books-*.json, LOCALIZED_BOOK_SLUGS, weekly-reading-schedule-*.js)
 * use the same standard 1-66 numbering system. This eliminates inconsistencies and bugs.
 *
 * The language-independent reading format is now used throughout:
 * - Format: { book: number, startChapter: number, endChapter: number }
 * - Example: { book: 1, startChapter: 1, endChapter: 3 } represents Genesis 1-3
 * - This enables truly multilingual schedules that work across all languages
 *
 * Test Cases (all using standard 1-66 numbering):
 * - buildBibleLink(40, 24, 24, 'en', 14) for Matthew 24:14
 *   → https://www.jw.org/en/library/bible/study-bible/books/matthew/24/#v40024014-v40024999
 *
 * - buildBibleLink(44, 3, 3, 'en', 10) for Acts 3:10
 *   → https://www.jw.org/en/library/bible/study-bible/books/acts/3/#v44003010-v44003999
 *
 * - buildBibleLink(66, 21, 21, 'en', 22) for Revelation 21:22
 *   → https://www.jw.org/en/library/bible/study-bible/books/revelation/21/#v66021022-v66021999
 *
 * - buildLinkFromReadingObject({ book: 1, startChapter: 1, endChapter: 3 }, 1, 1, 'de') for Genesis 1 in German
 *   → https://www.jw.org/de/bibliothek/bibel/studienbibel/buecher/mose/1/#v01001001-v01001999
 */

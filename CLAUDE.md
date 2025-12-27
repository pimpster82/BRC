# CLAUDE.md - Quick Reference

**START HERE:** Read `TODOs.md` first (progress, bugs, current tasks, status)

## ⚠️ Core Rule

**NEVER invent data.** Always fetch real data from JW.org using WebFetch tool.

## Project Overview

**Bible Reading Companion** - App for JWs to track three reading systems:
1. **Daily Text** - ✅ Fully working
2. **Weekly Reading** - ✅ Fully working
3. **Personal Plans** (Free/Thematic/Chronological/One-Year) - ✅ Fully working

**Status:** 93% complete (see TODOs.md). Offline-capable, 5-language, Firebase synced.

## Tech Stack

React 18 + Vite + Tailwind CSS + Firebase Auth/Realtime DB + LocalStorage

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000 with HMR)
npm run dev

# Build for production (creates /dist folder)
npm run build

# Preview production build locally
npm run preview

# Lint code with ESLint
npm run lint

# Deploy to GitHub Pages (builds and deploys to gh-pages branch)
npm run deploy
```

## Project Structure

```
src/pages/        # Routes: HomePage, WeeklyReadingPage, PersonalReadingPage, SettingsPage, LoginPage, RegisterPage
src/components/   # UI cards & reusable components
src/utils/        # Storage, Firebase sync, Bible parsing, scheduling
src/config/       # i18n, languages, reading plans, Firebase config
src/context/      # Auth & Theme context
data/             # Bible metadata, schedules, yeartexts, links
docs/             # Architecture docs: GOALS.md, UI_UX.md, MULTI_DEVICE_SYNC_TESTS.md
```

## Key Concepts

- **State Management:** React hooks + localStorage (no Redux needed)
- **i18n:** `src/config/i18n.js` with 5 languages. Always add strings to all 5 languages.
- **Bible Parsing:** `readingParser.js` - fuzzy matching. `jw-links.js` - link builder.
- **Storage:** `storage.js` - localStorage wrapper with Firebase sync

### Weekly Reading: Meeting Day Logic

App shows reading for week containing user's **NEXT** meeting (not previous).

- Function: `getCurrentWeekReading(meetingDay, date)` in `data/weekly-reading-schedule.js`
- Setting: `settings_meetingDay` (0=Sunday, 1=Monday, ..., 6=Saturday)
- Priority: In-memory cache → LocalStorage → Firebase → static files

### Offline-Capable (Not PWA)

Works offline after initial load. No service worker (can't install as PWA).
Priority: LocalStorage cache → Firebase → static fallback

## Firebase Configuration

**Setup:** Copy `.env.local.example` → `.env.local` with Firebase credentials

**Structure:**
- `/schedules/{year}/weeks[]` - Admin-published schedules (shared across users)
- `/yeartexts/{year}` - Multilingual yeartexts (de, en, es, it, fr)
- `/users/{userId}/progress/` - Per-user reading progress (daily, weekly, personal)

**Key Files:** `src/config/firebase.js`, `src/utils/firebaseSchedules.js`, `src/utils/firebaseUserProgress.js`

**Sync Queue:** Offline actions queued in localStorage, synced via FIFO when online (see TODOs.md)

## Data Structures

**Reading Format (Language-Independent):** `{ book: 1, startChapter: 1, endChapter: 3 }`
- Book: 1-66 (Genesis-Revelation)
- Used in schedules, yeartexts, and user progress

**LocalStorage Keys:**
- `bibleCompanion_dailyText` - Completed dates, streak
- `bibleCompanion_weeklyReading` - Completed weeks, meeting day
- `bibleCompanion_personalReading` - Chapters read, selected plan
- `app_language` - Current language (de/en/es/it/fr)
- `settings_*` - User preferences

## Common Development Tasks

**Add UI String:** Open `src/config/i18n.js` → Add to all 5 languages → Use `t('key')` in components

**Create Component:** Place in `src/components/` or `src/pages/` → Import `t` for translations → Use localStorage via `storage.js`

**Parse Bible References:** Use `src/utils/readingParser.js` - handles "Genesis 1", "Gen 1:1-5", "1. Mose 1"

**Build JW.org Links:** Use `data/bible-link-builder.js` - format: `bible=BBCCCVVV-BBCCCVVV` (book 1-66)

**Add Routes:** Create page in `src/pages/` → Add to `App.jsx` → Link via navigation components

## Testing

No automated tests. Manual testing via `ParserTestBench.jsx` (/test-parser). Recommend Vitest + React Testing Library if adding tests.

## Key Files Reference

| Task | File |
|------|------|
| Storage CRUD | `src/utils/storage.js` |
| Bible parsing (fuzzy) | `src/utils/readingParser.js` |
| Translations (i18n) | `src/config/i18n.js` |
| JW.org links | `data/bible-link-builder.js` |
| Firebase sync | `src/utils/firebaseSchedules.js`, `firebaseUserProgress.js` |
| Weekly schedule | `data/weekly-reading-schedule.js` |
| Auth context | `src/context/AuthContext.jsx` |
| Theme context | `src/context/ThemeContext.jsx` |

## Deployment

**Build:** `npm run build` → `/dist` folder

**Vercel:** Auto-deploys on push. Live: https://brc-liard.vercel.app

**GitHub Pages:** Change `base: '/BRC/'` in vite.config.js, run `npm run deploy`

## Quick Troubleshooting

- **Translations showing keys?** Add to all 5 languages in `src/config/i18n.js`
- **Tailwind not applying?** Restart dev server & clear cache
- **localStorage empty?** Check DevTools Storage tab; not in private mode?
- **Schedule missing?** Load via Settings → Schedule Update first
- **Firebase failing?** Check `.env.local` credentials and database rules
- **Build errors?** Run `npm install` and restart dev server
# 🎯 QUICK START - Bible Reading Companion Development

## 📍 Current Status
✅ Project setup complete and running
✅ Welcome screen displayed at http://localhost:3000
✅ Ready to build core features

---

## 🗂️ Project Structure
```
D:\DANIEL_ai_Playground\bible-reading-companion\
├── docs/                      # Full specifications
│   ├── GOALS.md              # What to build
│   ├── UI_UX.md              # How it should look
│   ├── THEMES.md             # Design system
│   └── CLOUD_SYNC.md         # Cloud features (later)
├── data/                      # Ready-to-use data
│   ├── bible-books-database.json
│   ├── bible-link-builder.js
│   └── memorial-reading-schedule.js
├── src/
│   ├── App.jsx               # Current: Welcome screen
│   ├── components/           # Build here
│   ├── utils/                # Helper functions
│   └── styles/index.css
└── README.md
```

---

## 🎯 What We're Building (3 Systems)

### 1. Daily Text (Tagestext) ☀️
- Shows today's scripture from wol.jw.org
- Simple tracking: read/not read
- Link: https://wol.jw.org/en/wol/dt/r1/lp-e

### 2. Weekly Reading (Wöchentliches Lesen) 📅
- Official JW weekly Bible reading
- Meeting-to-meeting cycle support
- Chapter-by-chapter + verse-level tracking
- Plan 2025: https://wol.jw.org/en/wol/d/r1/lp-e/1102025214

### 3. Personal Bible Program (PBP) 📖
- Custom reading plans through entire Bible
- Track all 1,189 chapters
- Multiple plan types:
  - Bible in 1 Year
  - Chronological
  - Book by Book
  - Free Reading (Bible Tree)

---

## 🎨 UI Design (3 Screens)

**Navigation:** Swipe left/right between screens

```
[← HEUTE →]  [← WOCHE →]  [← PBP →]
   Screen 1     Screen 2    Screen 3
```

**Screen 1: HEUTE (Landing)**
- Quick overview of all 3 systems
- Direct action buttons

**Screen 2: WOCHE** 
- Chapter list with status (✓/◐/○)
- Click chapter → opens JW.org link

**Screen 3: PBP**
- Layout depends on selected plan
- Shows "What's next?" prominently

See: `docs/UI_UX.md` for detailed mockups

---

## 🔧 Tech Stack
- React 18 + Vite
- Tailwind CSS (configured)
- LocalStorage + IndexedDB
- Supabase (later for cloud sync)

---

## 📋 Next Steps (Priority Order)

### PHASE 1: Core Features

**Step 1: Build Daily Text Component** ⭐ START HERE
```
Create: src/components/DailyTextCard.jsx
- Fetch from wol.jw.org link
- Display verse + snippet
- Track completion (localStorage)
- "Open" button
```

**Step 2: Build Weekly Reading**
```
Create: src/components/WeeklyReadingCard.jsx
- Show current week's reading
- Chapter status (read/partial/unread)
- Meeting-to-meeting logic
Use: data/weekly-schedule-2025.js (need to create)
```

**Step 3: Build Personal Reading (Basic)**
```
Create: src/components/PersonalReadingCard.jsx
- Start with "Free Reading" (Bible Tree)
- Show progress (X/1189 chapters)
- Click chapter → open link
Use: data/bible-books-database.json
```

**Step 4: Build 3-Screen Navigation**
```
Create: src/components/SwipeNavigation.jsx
- Today / Week / PBP screens
- Swipe or tab navigation
```

---

## 🔗 Important Link Format

**JW.org Bible Links:**
```
https://www.jw.org/finder?srcid=jwlshare&wtlocale=E&prefer=lang&bible=BBCCCVVV-BBCCCVVV&pub=nwtsty

BB = Book (01-66, zero-padded)
CCC = Chapter (001-999, zero-padded)
VVV = Verse (001-999, always use 999 for end)

Example:
Genesis 1-3 → bible=01001001-01003999
Isaiah 1-2 → bible=23001001-23002999
```

Use: `data/bible-link-builder.js` (ready to use)

---

## 💾 Data Storage

**LocalStorage structure:**
```javascript
{
  dailyText: {
    completedDates: ["2025-11-28", ...],
    currentStreak: 15
  },
  weeklyReading: {
    completedWeeks: [...]
  },
  personalReading: {
    chaptersRead: [{
      book: "Genesis",
      chapter: 1,
      verses: "all",
      timestamp: 1704067200
    }]
  }
}
```

---

## 🎨 Colors & Status

```
✓ Green  (#27AE60) - Read
◐ Yellow (#F39C12) - Partial
○ Gray   (#BDC3C7) - Not read
```

---

## 🚀 Quick Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Install new package
npm install package-name
```

---

## 📝 Development Tips

1. **Start simple** - Get one feature working, then enhance
2. **Test often** - Check browser frequently
3. **Mobile-first** - Design for phone screens
4. **Refer to docs/** - Detailed specs in there
5. **Use existing data/** - Bible data already prepared

---

## 🔍 Key Files to Reference

**Must read:**
- `docs/GOALS.md` - Complete feature list
- `docs/UI_UX.md` - All screen layouts & mockups

**Use these:**
- `data/bible-books-database.json` - 66 books, chapter counts
- `data/bible-link-builder.js` - Generate JW.org links
- `data/memorial-reading-schedule.js` - Memorial 2025 data

---

## 🎯 Recommended First Task

**Create the Daily Text Card:**

1. Create `src/components/DailyTextCard.jsx`
2. Show today's date
3. Add button: "Open Daily Text" → opens wol.jw.org/en/wol/dt/r1/lp-e
4. Add checkbox: "Mark as read"
5. Save to localStorage
6. Display streak counter

Then integrate into `src/App.jsx` to replace welcome screen.

---

## 💡 When Stuck

- Check `docs/UI_UX.md` for mockups
- Check `docs/GOALS.md` for requirements
- Test components in isolation first
- Console.log everything!

---

## ✅ Success Criteria

You'll know it's working when:
- Daily Text opens JW.org correctly
- Completion persists after refresh
- Mobile-responsive design
- Clean, simple UI

---

**Ready to code! Start with Daily Text Card.** 🚀

---

**Files Created This Session:**
- `/docs/*.md` - All specifications
- `/data/*` - Bible data & helpers
- `/src/App.jsx` - Welcome screen (replace with real app)
- Project structure - Ready for development

**Current Date:** December 5, 2025
**Project Status:** Setup complete, ready for Phase 1

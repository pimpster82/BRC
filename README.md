# Bible Reading Companion ✅

A comprehensive web app (85% complete) to help Jehovah's Witnesses track daily Bible reading progress with full Firebase authentication, offline support, and JW.org integration.

## 📖 What is this?

A full-featured web app for Jehovah's Witnesses to track three independent Bible reading systems:

1. **Daily Text** ✅ - Daily scripture from "Examining the Scriptures Daily" with streak tracking
2. **Weekly Bible Reading** ✅ - Official weekly reading for meetings with verse-level progress tracking
3. **Personal Bible Program (PBP)** ✅ - 4 reading plans: Free (66 books in 7 categories), Thematic (17 topics), Chronological (UI ready), One-Year (UI ready)

**Special Features:**
- 🔐 Firebase authentication with login/register
- 💾 Cross-device synchronization with automatic merge
- 🌍 5-language support (German, English, Spanish, Italian, French)
- 📖 Verse-level accuracy (track partial chapters like Genesis 2:3-5)
- 🔗 Deep links to JW.org for scripture passages
- 📱 Mobile-responsive design
- ⚡ Works offline after initial load

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📁 Documentation

See `/docs` folder for detailed specifications:
- `GOALS.md` - Project goals and requirements
- `UI_UX.md` - User interface and design concepts
- `THEMES.md` - Theme system and design
- `CLOUD_SYNC.md` - Data storage and cloud sync strategy

## 🛠️ Tech Stack

- **Frontend:** React 18.2 + Vite 5.0 + React Router 7
- **Styling:** Tailwind CSS 4 + PostCSS
- **Storage:** LocalStorage (primary) + IndexedDB (planned)
- **Cloud:** Firebase Realtime Database (authentication, progress sync, schedule caching)
- **Icons:** Lucide React
- **i18n:** Custom multilingual system (5 languages, 100+ keys)
- **Language:** JavaScript/JSX (ES Modules, no TypeScript)

## 📱 Features & Implementation Status

### Phase 1: Core Features (100% Complete) ✅
- ✅ Daily Text tracking with streak counter
- ✅ Weekly reading with chapter-by-chapter progress + verse accuracy
- ✅ Personal Bible Program (PBP) with 2 fully functional plans:
  - ✅ Free Plan: All 66 books organized in 7 categories
  - ✅ Thematic Plan: 17 thematic study topics across 4 sections
  - 🔶 Chronological & One-Year plans (UI ready, shows "Coming Soon")
- ✅ 5-language multilingual support (de, en, es, it, fr)
- ✅ Bible reference parser with fuzzy matching
- ✅ JW.org deep links for scripture passages
- ✅ Offline capability after initial load

### Phase 2: Advanced Features (50% Complete)
- ✅ User authentication (Firebase Auth with login/register)
- ✅ Verse-level progress tracking (partial chapter support)
- ✅ Bible reference parser with fuzzy matching
- ⚠️ Statistics dashboard (daily streak works; weekly/personal stats partial)
- ❌ Theme/Dark mode system (not implemented)
- ❌ Notification backend (UI exists, backend not implemented)

### Phase 3: Multi-User & Family (30% Complete)
- ✅ User authentication & session persistence
- ✅ Per-user progress tracking in Firebase
- ✅ Cross-device synchronization with automatic merge
- 🔶 Family sharing features (backend ready, no UI)

## 🔐 Security & Privacy

- **Local First:** All data stored locally in browser (localStorage)
- **Cloud Sync:** Optional - only synced when user authenticates
- **Authentication:** Firebase Email/Password (user controls login)
- **No Personal Data Required:** Only email + password needed (can use test account)
- **GDPR Compliant:** Firebase backend in Europe (europe-west1)
- **Data Control:** Users can reset all data anytime in Settings
- **Cross-Device:** Secure sync via Firebase authentication

## 📖 Documentation

- **CLAUDE.md** - Developer guide and implementation details
- **CONTEXT.md** - Quick start and current features overview
- **docs/GOALS.md** - Complete requirements and system design
- **docs/UI_UX.md** - UI mockups and design specifications
- **docs/THEMES.md** - Design system and color schemes
- **docs/CLOUD_SYNC.md** - Cloud synchronization strategy
- **I18N_GUIDE.md** - Internationalization guide
- **FIREBASE_SETUP.md** - Firebase configuration guide

## 📄 License

Personal project for congregation use.

## 👤 Author

Daniel - Austria

# Bible Reading Companion - iOS Native App

**Status:** 🚧 In Development (Foundation Complete)
**Version:** 1.0.0 (MVP)
**Platform:** iOS 15.0+
**Framework:** SwiftUI + Combine
**Architecture:** MVVM (Model-View-ViewModel)

---

## 📋 Project Overview

Native iOS port of the Bible Reading Companion web app. This app helps Jehovah's Witnesses organize and track three Bible reading systems:

1. **Daily Text** ☀️ - Daily spiritual nourishment
2. **Weekly Reading** 📅 - Congregation meeting preparation
3. **Personal Reading** 📖 - Bible study plans (Free, 1 Year, Overview, Thematic)

**Core Philosophy:**
- **Functionality Preservation:** 100% feature parity with web app
- **Design Flexibility:** Architected for easy UI/UX redesigns
- **Offline-First:** Works without internet, syncs via Firebase
- **Multi-Language:** Supports 5 languages (de, en, es, it, fr)

---

## 🎯 Current Status

### ✅ Completed (Foundation)

- [x] Project structure (65 directories)
- [x] Core data models (ChapterRead, Reading, Progress)
- [x] Flexible theming system (AppTheme protocol)
- [x] Core services:
  - [x] ProgressTrackingService (unified progress tracking)
  - [x] JWOrgLinkBuilder (deep links to JW.org)
  - [x] UserDefaultsService (offline storage)
- [x] App entry point with tab navigation
- [x] Documentation (CORE_FUNCTIONALITY.md)

### 🚧 In Progress

- [ ] ViewModels for all features
- [ ] SwiftUI views (placeholders exist)
- [ ] Firebase integration (Auth + Realtime Database)
- [ ] Localization files (300+ translation keys)
- [ ] Bible book data (JSON files)
- [ ] Reading plan configurations

### ⏳ Pending

- [ ] Bible parsing service (smart input parser)
- [ ] Schedule service (weekly reading logic)
- [ ] Sync queue implementation
- [ ] Network monitoring
- [ ] Complete UI implementation
- [ ] Testing
- [ ] App Store assets

---

## 🏗️ Architecture

### MVVM Pattern

```
┌─────────────────────────────────────────────┐
│                    View                      │  ← SwiftUI UI (no business logic)
│  (HomeView, WeeklyReadingView, etc.)        │
└───────────────┬─────────────────────────────┘
                │ @StateObject / @ObservedObject
┌───────────────▼─────────────────────────────┐
│                 ViewModel                    │  ← UI State + Actions
│  (HomeViewModel, WeeklyReadingViewModel)    │
└───────────────┬─────────────────────────────┘
                │ Uses
┌───────────────▼─────────────────────────────┐
│                 Services                     │  ← Business Logic
│  (ProgressTracking, BibleParsing, etc.)     │
└───────────────┬─────────────────────────────┘
                │ Accesses
┌───────────────▼─────────────────────────────┐
│                  Models                      │  ← Data Structures
│  (ChapterRead, Reading, Progress)           │
└─────────────────────────────────────────────┘
```

### Design Flexibility

**CRITICAL:** The app is architected to make UI/UX changes easy:

1. **Centralized Theming:** All colors, fonts, spacing in `AppTheme.swift`
2. **No Hardcoded Styles:** Views reference theme, never hardcode
3. **Modular Components:** Reusable UI components with styling parameters
4. **ViewModels Handle Logic:** Views are pure declarative UI

**Example:**
```swift
// ✅ CORRECT: References theme
Text("Title")
    .font(theme.titleFont)
    .foregroundColor(theme.textPrimary)

// ❌ WRONG: Hardcoded styling
Text("Title")
    .font(.title)
    .foregroundColor(.black)
```

### Key Design Patterns

- **Protocol-Oriented:** `AppTheme` protocol for swappable themes
- **Dependency Injection:** Services injected via `@Environment`
- **Reactive:** Combine for data flow
- **Immutable Data:** Pure functions, no side effects
- **Single Source of Truth:** `chaptersRead` array for all progress

---

## 📁 Project Structure

```
BibleReadingCompanion/
├── App/
│   ├── BibleReadingCompanionApp.swift  ← Main entry point
│   └── Info.plist
│
├── Core/
│   ├── Models/                  ← Data structures
│   │   ├── ChapterRead.swift    ← Single chapter read (unified tracking)
│   │   ├── Reading.swift        ← Bible reading range
│   │   ├── BibleBook.swift
│   │   ├── User.swift
│   │   └── Progress/
│   │       ├── DailyProgress.swift
│   │       ├── WeeklyProgress.swift
│   │       └── PersonalProgress.swift
│   │
│   ├── Services/                ← Business logic
│   │   ├── Bible/
│   │   │   ├── ProgressTrackingService.swift  ← Unified progress
│   │   │   ├── JWOrgLinkBuilder.swift         ← Deep links
│   │   │   ├── BibleParsingService.swift      ← TODO
│   │   │   └── ScheduleService.swift          ← TODO
│   │   ├── Storage/
│   │   │   ├── UserDefaultsService.swift      ← Offline storage
│   │   │   └── CoreDataService.swift          ← Optional
│   │   ├── Firebase/
│   │   │   ├── FirebaseAuthService.swift      ← TODO
│   │   │   ├── FirebaseRealtimeService.swift  ← TODO
│   │   │   └── FirebaseSyncService.swift      ← TODO
│   │   └── Localization/
│   │       └── LocalizationService.swift      ← TODO
│   │
│   └── Utilities/
│       └── Extensions/
│
├── Features/                    ← MVVM modules by feature
│   ├── Home/
│   │   ├── Views/
│   │   │   └── HomeView.swift
│   │   └── ViewModels/
│   │       └── HomeViewModel.swift
│   │
│   ├── DailyText/
│   ├── WeeklyReading/
│   ├── PersonalReading/
│   ├── Settings/
│   └── Authentication/
│
├── UI/                          ← Design system (FLEXIBLE!)
│   ├── Theme/
│   │   ├── AppTheme.swift       ← Theme protocol
│   │   ├── ColorPalette.swift
│   │   ├── Typography.swift
│   │   └── Animations.swift
│   └── Components/              ← Reusable UI
│       ├── Buttons/
│       ├── Cards/
│       └── Progress/
│
├── Resources/
│   ├── Localizable/             ← 5 languages
│   │   ├── de.lproj/
│   │   ├── en.lproj/
│   │   ├── es.lproj/
│   │   ├── it.lproj/
│   │   └── fr.lproj/
│   ├── Data/
│   │   ├── BibleBooks/          ← Book metadata (JSON)
│   │   └── ReadingPlans/        ← Plan configurations (JSON)
│   └── Assets.xcassets/
│
└── Config/
    ├── GoogleService-Info.plist ← Firebase config
    └── AppConfiguration.swift
```

---

## 🔑 Key Concepts

### 1. Unified Progress Tracking

**CRITICAL:** All personal reading plans share a SINGLE `chaptersRead` array.

```swift
// Single source of truth
var chaptersRead: [ChapterRead] = []

// O(1) lookup via index
var chaptersIndex: [String: ChapterRead] = buildIndex(chaptersRead)

// Check if chapter is complete
let isComplete = chaptersIndex["1:5"] != nil  // Genesis 5
```

**Benefits:**
- Marking Genesis 5 in Free Reading automatically updates Bible in 1 Year
- Language-independent (uses book numbers 1-66)
- O(1) lookup performance
- Firebase-friendly structure

### 2. Offline-First Storage

**Priority:**
1. **UserDefaults** (primary) - instant, offline
2. **Firebase** (secondary) - sync, backup

**Pattern:**
```swift
// User marks chapter
1. Update UserDefaults immediately → UI updates
2. Add to sync queue
3. If online: sync to Firebase
4. If offline: queue persists until reconnect
```

### 3. Smart Bible Parser

**Input formats supported:**
- Simple: `3` → Chapter 3
- Range: `3-5` → Chapters 3, 4, 5
- Partial: `3-4:15` → Ch 3 complete, Ch 4 up to v15
- Verse range: `3:1-5` → Chapter 3, verses 1-5
- With book: `Genesis 3-5`
- Fuzzy matching: `Jes` → Jesaja/Isaiah

**Implementation:** Levenshtein distance algorithm (TODO)

### 4. JW.org Deep Links

**Format:** `https://www.jw.org/finder?...bible=BBCCCVVV-BBCCCVVV`

```swift
// Genesis 1:1 → 01001001
// Matthew 24:14 → 40024014

let url = JWOrgLinkBuilder.shared.buildChapterLink(
    book: 1,
    chapter: 5,
    language: "en"
)
```

**Fallback:** JW Library app → JW.org Safari

---

## 🌍 Multi-Language Support

**Supported Languages:**
- German (de)
- English (en)
- Spanish (es)
- Italian (it)
- French (fr)

**Translation Keys:** ~300 keys organized by feature

**Structure:**
```
Localizable/
├── de.lproj/Localizable.strings
├── en.lproj/Localizable.strings
├── es.lproj/Localizable.strings
├── it.lproj/Localizable.strings
└── fr.lproj/Localizable.strings
```

**Usage:**
```swift
Text("home.daily_text")  // "DAILY TEXT" in user's language
```

---

## 🔥 Firebase Integration

### Database Structure

```
/schedules/{year}/weeks[]       ← Admin-published schedules (shared)
/yeartexts/{year}               ← Multilingual yeartexts
/users/{userId}/
    /progress/
        /daily/                 ← Daily text progress
        /weekly/                ← Weekly reading progress
        /personal/              ← Personal reading progress
    /settings/                  ← User preferences
```

### Sync Queue

**Problem:** Offline changes on multiple devices

**Solution:** Event sourcing with timestamp-based conflict resolution

```swift
struct SyncQueueItem {
    let id: String          // "daily_2025-12-25_mark"
    let section: String     // "daily", "weekly", "personal"
    let action: String      // "mark_complete", "unmark"
    let timestamp: Int64    // When action occurred
    let data: [String: Any]
    var synced: Bool
}
```

**Flow:**
1. User acts (online or offline) → update UserDefaults
2. Create queue item → save to UserDefaults
3. If online: process queue immediately
4. If offline: queue persists until reconnect
5. On reconnect: FIFO processing
6. Conflict resolution: latest timestamp wins

---

## 🎨 Theming System

### Creating a New Theme

```swift
struct ModernTheme: AppTheme {
    var primaryColor: Color { .purple }
    var backgroundColor: Color { .black }
    var titleFont: Font { .system(.largeTitle, design: .serif) }
    // ... override all properties
}

// Apply theme
ThemeManager.shared.switchTheme(to: ModernTheme())
```

### Using Theme in Views

```swift
struct MyView: View {
    @Environment(\.theme) var theme

    var body: some View {
        VStack(spacing: theme.spacing.md) {
            Text("Title")
                .font(theme.titleFont)
                .foregroundColor(theme.textPrimary)
        }
        .padding(theme.spacing.lg)
        .background(theme.cardColor)
        .cornerRadius(theme.cornerRadius.md)
    }
}
```

**Never hardcode:**
- Colors
- Fonts
- Spacing
- Corner radius
- Shadows
- Animations

**Always reference theme!**

---

## 🚀 Getting Started

### Prerequisites

- macOS 13.0+ with Xcode 15.0+
- iOS 15.0+ device or simulator
- Firebase account (for sync features)
- CocoaPods or Swift Package Manager

### Setup Steps

1. **Clone Repository**
   ```bash
   cd /home/user/BRC/ios/BibleReadingCompanion
   ```

2. **Install Dependencies**
   ```bash
   # Using Swift Package Manager (recommended)
   # Open BibleReadingCompanion.xcodeproj in Xcode
   # File → Add Packages → Add Firebase SDK
   ```

3. **Configure Firebase**
   ```bash
   # Download GoogleService-Info.plist from Firebase Console
   # Add to BibleReadingCompanion/Config/
   ```

4. **Build & Run**
   ```bash
   # Open in Xcode
   open BibleReadingCompanion.xcodeproj

   # Select simulator or device
   # Press Cmd+R to build and run
   ```

---

## 📝 Next Steps

### Phase 1: Complete Services (1-2 weeks)
- [ ] Implement BibleParsingService (fuzzy matching)
- [ ] Implement ScheduleService (meeting day logic)
- [ ] Implement LocalizationService
- [ ] Implement Firebase services (Auth, Realtime, Sync)
- [ ] Port Bible book data to JSON (66 books × 5 languages)
- [ ] Port reading plan configurations to JSON

### Phase 2: ViewModels (1 week)
- [ ] HomeViewModel
- [ ] DailyTextViewModel
- [ ] WeeklyReadingViewModel
- [ ] PersonalReadingViewModel
- [ ] SettingsViewModel
- [ ] AuthViewModel

### Phase 3: UI Implementation (2-3 weeks)
- [ ] Home screen (cards for each system)
- [ ] Daily Text view (yeartext banner, scripture, streak)
- [ ] Weekly Reading view (chapter grid, smart input)
- [ ] Personal Reading views:
  - [ ] Free Reading (Bible tree, chapter grid)
  - [ ] Bible in 1 Year (365 readings, on-track status)
  - [ ] Bible Overview (123 readings)
  - [ ] Thematic Plan (17 topics)
- [ ] Settings view (language, meeting day, theme, reset)
- [ ] Authentication views (login, register)

### Phase 4: Localization (1 week)
- [ ] Create 5 Localizable.strings files
- [ ] Translate all 300+ keys
- [ ] Test language switching
- [ ] Verify RTL support (if needed)

### Phase 5: Testing & Polish (1-2 weeks)
- [ ] Unit tests (services, ViewModels)
- [ ] Integration tests (Firebase sync)
- [ ] UI tests (user flows)
- [ ] Manual testing on devices
- [ ] Performance optimization
- [ ] Accessibility audit (VoiceOver, Dynamic Type)
- [ ] Dark mode verification

### Phase 6: App Store Preparation (1 week)
- [ ] App Store screenshots (all sizes)
- [ ] App Store description (5 languages)
- [ ] Privacy policy
- [ ] App Store Connect setup
- [ ] TestFlight beta testing

**Estimated Total:** 8-12 weeks for MVP

---

## 📚 Documentation

- **CORE_FUNCTIONALITY.md** - What each feature does (functional spec)
- **DATA_MODELS.md** - Complete data structure reference (TODO)
- **I18N_REQUIREMENTS.md** - Translation keys and localization (TODO)
- **FEATURE_CHECKLIST.md** - Complete feature list with acceptance criteria (TODO)

---

## 🤝 Contributing

When adding features or making changes:

1. **Preserve Functionality:** Match web app behavior exactly
2. **Use Theme System:** Never hardcode styles
3. **Follow MVVM:** Business logic in ViewModels, not Views
4. **Write Tests:** Unit tests for services, UI tests for flows
5. **Update Docs:** Keep documentation in sync

---

## 📄 License

Copyright © 2026 Bible Reading Companion. All rights reserved.

---

## 🆘 Support

For questions or issues:
- Web app repo: https://github.com/pimpster82/BRC
- Documentation: `/home/user/BRC/ios-docs/`
- Web app (reference): https://brc-liard.vercel.app

---

**Last Updated:** January 23, 2026
**iOS Version:** 1.0.0 (In Development)
**Web App Version:** 2.0.1 (Production Reference)

# iOS Native App - Documentation

This directory contains comprehensive analysis and specifications for the iOS native port of Bible Reading Companion.

## Documents

### 1. **CORE_FUNCTIONALITY.md**
- **Purpose**: Describes what each feature does (not how)
- **Contents**:
  - 3 Reading Systems (Daily Text, Weekly Reading, Personal Reading)
  - User workflows and interactions
  - Business rules and logic
  - Data flows between components

### 2. **DATA_MODELS.md**
- **Purpose**: Complete data structure specifications for Swift implementation
- **Contents**:
  - Swift model definitions
  - Firebase database schema
  - UserDefaults/Core Data persistence
  - Data transformation rules

### 3. **I18N_REQUIREMENTS.md**
- **Purpose**: Multi-language support specifications
- **Contents**:
  - ~300 translation keys organized by feature
  - All 5 languages (de, en, es, it, fr)
  - Parameter interpolation patterns
  - Implementation guidance

### 4. **FEATURE_CHECKLIST.md**
- **Purpose**: Complete feature list with acceptance criteria
- **Contents**:
  - P0/P1/P2 priority features
  - Acceptance criteria per feature
  - Testing requirements
  - MVP definition

## Key Findings from Web App Analysis

### Architecture
- **Offline-First**: LocalStorage + Firebase sync
- **Language-Independent**: Book numbers (1-66) instead of localized names
- **Unified Progress Tracking**: Single `chaptersRead` array for all reading plans
- **Smart Bible Parser**: Fuzzy matching with Levenshtein distance algorithm
- **Deep Linking**: JW.org and JW Library app integration

### Data Model
```swift
// Single source of truth for ALL reading progress
struct ChapterRead {
    let book: Int          // 1-66 (Genesis-Revelation)
    let chapter: Int
    var status: ChapterStatus  // .complete or .partial
    var verses: Int?       // For partial chapters
    let timestamp: Date
}
```

### Firebase Structure
```
/schedules/{year}/weeks[]  - Admin-published schedules (shared)
/yeartexts/{year}          - Multilingual yeartexts (de, en, es, it, fr)
/users/{userId}/progress/  - Per-user reading progress (daily, weekly, personal)
```

### Reading Systems

#### 1. Daily Text ☀️
- Display today's scripture + commentary from JW.org
- Track completion + reading streaks
- Yeartext banner display

#### 2. Weekly Reading 📅
- Show current week's Bible reading based on meeting day
- Chapter-by-chapter + verse-level progress tracking
- Smart input parser (handles "3-5", "3-4:15", etc.)
- Meeting day cycle logic (shows NEXT meeting's reading)

#### 3. Personal Reading 📖
- **Free Reading**: Manual chapter selection, 66 books
- **Bible in 1 Year**: 365 readings, on-track status
- **Bible Overview**: 123 key readings
- **Thematic Plan**: 17 topics, 4 sections
- **Chronological** (coming soon)

All plans share unified `chaptersRead` tracking!

## Priority Summary

### P0 (Critical - MVP)
- Authentication (email/password)
- Multi-language (5 languages)
- Daily Text (display, mark read, streak tracking)
- Weekly Reading (smart parser, progress tracking)
- Personal Reading (all 3 active plans)
- JW.org link generation
- Firebase sync (real-time + offline queue)
- Settings (language, meeting day, reading plan)
- Dark mode

### P1 (High - v1.1)
- Bible Overview plan
- Thematic plan
- Accessibility (VoiceOver, Dynamic Type)
- Reset functions
- Yeartext management

### P2 (Medium - v1.2)
- Admin features (PIN 170182)
- Update channel (production/beta)
- Schedule management

### P3 (Low - Future)
- Local notifications
- Chronological plan
- Social features

## Technical Requirements

### iOS Version
- **Minimum**: iOS 15.0
- **Target**: iOS 17.0+
- **Devices**: iPhone + iPad

### Dependencies
- Firebase Auth
- Firebase Realtime Database
- SwiftUI (no UIKit)
- Combine framework
- Foundation + CoreData (optional)

### Architecture
- **Pattern**: MVVM (Model-View-ViewModel)
- **Design System**: Centralized theming for easy UI changes
- **Services**: Business logic separated from UI
- **Storage**: UserDefaults + Firebase sync
- **Networking**: URLSession + Firebase SDK

## Design Flexibility

**CRITICAL REQUIREMENT**: While preserving functionality is paramount, the iOS app must be architected to easily accommodate:
- Different layouts from web app
- Animations and transitions
- Background images
- Different color schemes
- Future UI/UX redesigns

**Implementation Strategy**:
1. **MVVM Pattern**: Business logic in ViewModels (never in Views)
2. **Theme System**: All colors/fonts/spacing centralized
3. **Modular Components**: Reusable UI components with styling parameters
4. **No Hardcoded Styles**: Everything references theme system

## Next Steps

1. ✅ Analyze codebase functionality
2. ✅ Extract data models and schemas
3. ✅ Document i18n and features
4. 🔄 Create iOS project structure (in progress)
5. ⏳ Implement core models
6. ⏳ Implement services (parsing, tracking, sync)
7. ⏳ Implement ViewModels
8. ⏳ Build UI with placeholder designs
9. ⏳ Add Firebase integration
10. ⏳ Add localization (5 languages)
11. ⏳ Test on simulator + device
12. ⏳ Deploy to TestFlight

## Questions?

Refer to the detailed documents in this directory for complete specifications, code examples, and implementation guidance.

---

**Last Updated**: 2026-01-23
**Source**: Web app at `/home/user/BRC/`
**Production Version**: 2.0.1
**Live URL**: https://brc-liard.vercel.app

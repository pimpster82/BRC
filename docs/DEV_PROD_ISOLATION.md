# 🔧 Dev/Prod Isolation Strategy

**Last Updated:** 2025-12-27
**Status:** ✅ Documented & Planned | ⏳ Implementation in Progress

---

## Overview

Parallel development of v2.0 (dev) and v1.0 (prod) requires complete isolation:
- **No data corruption** when switching between versions
- **Easy rollback** if dev breaks something
- **Shared Firebase DB** for testing purposes
- **Zero code changes** to production code

This document describes the complete isolation strategy.

---

## Current Status

### ✅ COMPLETED
1. **Version Strategy** (`src/config/version.js`)
   - Prod: `1.0.0` (Semantic Versioning)
   - Dev: `dev0.2.0` (with auto-generated BUILD_CODE)
   - `LINKED_PRODUCTION_VERSION`: Tracks which prod is live

2. **Storage Layer** (`src/utils/storage.js`)
   - Automatic "dev_" prefix detection
   - Prod uses: `bibleCompanion_dailyText`
   - Dev uses: `dev_bibleCompanion_dailyText`
   - `wrappedStorage` export ready for other files

3. **Settings Display** (`src/pages/SettingsPage.jsx`)
   - Shows APP_VERSION (dev0.2.0)
   - Shows BUILD_CODE with copy button
   - Shows LINKED_PRODUCTION_VERSION

### ⏳ IN PROGRESS
1. **Vercel Projects** - Need to create separate projects
2. **localStorage Migration** - Progressive update of other files
3. **Firebase Strategy** - Define prod/dev data separation

---

## Architecture

### Deployment URLs

```
┌─────────────────────────────────────────────────┐
│ PRODUCTION (Vercel Project 1)                   │
├─────────────────────────────────────────────────┤
│ URL: https://brc-liard.vercel.app              │
│ Branch: master                                  │
│ Version: 1.0.0                                  │
│ Environment: Production                         │
│ Deploy: Auto on push to master                  │
│ Firebase: Production DB                         │
│ Tester Access: YES                              │
│ Developer Access: NO                            │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ DEVELOPMENT (Vercel Project 2)                  │
├─────────────────────────────────────────────────┤
│ URL: https://brc-dev-liard.vercel.app          │
│ Branch: development                             │
│ Version: dev0.2.0                               │
│ Environment: Development                        │
│ Deploy: Auto on push to development             │
│ Firebase: Shared with Prod (diff keys)          │
│ Tester Access: NO                               │
│ Developer Access: YES                           │
└─────────────────────────────────────────────────┘
```

### Storage Isolation

**localStorage Keys:**
```
PRODUCTION
├── bibleCompanion_dailyText
├── bibleCompanion_weeklyReading
├── bibleCompanion_personalReading
├── bibleCompanion_schedule_*
├── bibleCompanion_yeartext_*
└── app_language, themePreference, etc.

DEVELOPMENT (automatic "dev_" prefix)
├── dev_bibleCompanion_dailyText
├── dev_bibleCompanion_weeklyReading
├── dev_bibleCompanion_personalReading
├── dev_bibleCompanion_schedule_*
├── dev_bibleCompanion_yeartext_*
└── dev_app_language, dev_themePreference, etc.
```

**How It Works:**
- `APP_VERSION.startsWith('dev')` → Use "dev_" prefix
- All `STORAGE_KEYS` automatically prefixed via `getStorageKey()`
- `wrappedStorage` helper for other files to access localStorage
- Prod code: ZERO changes needed

### Firebase Strategy

**Option A: Shared DB with Prefix (RECOMMENDED)**
```javascript
// Same Firebase DB, different key prefixes
Prod writes to: completedDates, weeklyReading, etc.
Dev writes to:  dev_completedDates, dev_weeklyReading, etc.

Benefit: Single DB to manage, clear separation
Cost: Need to add prefix logic to Firebase sync functions
```

**Option B: Separate Firebase Projects**
```javascript
// Different Firebase projects entirely
Prod: pimpster82-bible (existing)
Dev: pimpster82-bible-dev (new project)

Benefit: Complete isolation, no risk
Cost: Duplicate Firebase setup, billing
```

**Current Decision:** Option A (Shared DB with Prefix)

---

## Implementation Roadmap

### Phase 1: Documentation ✅
- [x] Create this file (DEV_PROD_ISOLATION.md)
- [x] Document strategy
- [x] Document next steps

### Phase 2: Vercel Setup ⏳
1. Create new Vercel project for development branch
   - Name: `bible-reading-companion-dev`
   - Import: Same GitHub repo
   - Branch: `development`
   - Domain: `brc-dev-liard.vercel.app` (or similar)
   - Environment: Development

2. Set environment variables in Vercel
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   (same as prod for shared DB approach)
   ```

3. Verify auto-deploy works
   - Push to development branch
   - Check Vercel dashboard
   - Verify deployment at brc-dev-liard.vercel.app

### Phase 3: Progressive localStorage Migration ⏳
Update files to use `wrappedStorage` instead of direct `localStorage`:

**Priority 1 (High Impact):**
- [ ] `src/config/i18n.js` - Language preference (frequent)
- [ ] `src/context/ThemeContext.jsx` - Theme preference (frequent)

**Priority 2 (Medium Impact):**
- [ ] `src/context/AuthContext.jsx` - User session
- [ ] `src/config/languages.js` - Language config

**Priority 3 (Low Impact):**
- [ ] Other files using localStorage
- [ ] Settings-related storage

### Phase 4: Firebase Prefix Logic ⏳
Add dev prefix to Firebase sync functions:
- `firebaseUserProgress.js` - Add `dev_` prefix when in dev mode
- `firebaseSchedules.js` - Add `dev_` prefix when in dev mode
- `userProgress.js` - Handle dev/prod key separation

### Phase 5: Testing & Validation ⏳
- [ ] Test prod: brc-liard.vercel.app works normally
- [ ] Test dev: brc-dev-liard.vercel.app works independently
- [ ] Cross-browser testing (localStorage isolation)
- [ ] Firebase DB inspection (prod vs dev keys)
- [ ] Switch between versions: no data loss or corruption

---

## Files to Modify

### Already Done ✅
- `src/utils/storage.js` - Storage prefix system
- `src/config/version.js` - Version with LINKED_PRODUCTION_VERSION
- `src/pages/SettingsPage.jsx` - Version info display

### Need to Update ⏳

#### Priority 1
**`src/config/i18n.js`**
```javascript
// BEFORE
const currentLanguage = localStorage.getItem('app_language') || 'de'
localStorage.setItem('app_language', lang)

// AFTER
import { wrappedStorage } from '../utils/storage'
const currentLanguage = wrappedStorage.getItem('app_language') || 'de'
wrappedStorage.setItem('app_language', lang)
```

**`src/context/ThemeContext.jsx`**
```javascript
// BEFORE
localStorage.getItem('themePreference')
localStorage.setItem('themePreference', theme)

// AFTER
import { wrappedStorage } from '../utils/storage'
wrappedStorage.getItem('themePreference')
wrappedStorage.setItem('themePreference', theme)
```

#### Priority 2
**`src/context/AuthContext.jsx`**
```javascript
// Multiple localStorage calls for user session
// Replace all with wrappedStorage
import { wrappedStorage } from '../utils/storage'
```

**`src/config/languages.js`**
```javascript
// Replace localStorage.getItem with wrappedStorage.getItem
```

#### Priority 3
- Any other file using `localStorage` directly
- Use sed/find to identify: `grep -r "localStorage\." src/`

---

## Testing Checklist

### Before Vercel Deploy
- [ ] Local dev build works
- [ ] localStorage keys correct in DevTools
- [ ] Dev console logs: "🔧 [DEV MODE] Using storage prefix: dev_"
- [ ] Settings page shows version info

### After Vercel Deploy
- [ ] Prod (brc-liard.vercel.app) works normally
- [ ] Dev (brc-dev-liard.vercel.app) works independently
- [ ] Switch between URLs: no data conflicts
- [ ] localStorage isolated (DevTools → Application)
- [ ] Firebase DB shows dev_ and non-dev keys

### Cross-Browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Chrome/Safari

### Data Integrity
- [ ] Prod user data unaffected
- [ ] Dev can test without corrupting prod
- [ ] Rollback possible (prod snapshot available)

---

## Firebase Data Structure (Plan)

### Current (Shared DB, Prod Only)
```
/users/{userId}/
  └── progress/
      ├── daily/
      │   ├── completedDates
      │   └── currentStreak
      ├── weekly/
      │   └── completedWeeks
      └── personal/
          ├── chaptersRead
          └── thematicTopicsRead

/schedules/{year}/weeks[]
/yeartexts/{year}/
```

### After Dev Prefix Implementation
```
/users/{userId}/
  └── progress/
      ├── daily/
      │   ├── completedDates (PROD)
      │   ├── dev_completedDates (DEV)
      │   ├── currentStreak (PROD)
      │   └── dev_currentStreak (DEV)
      ├── weekly/
      │   ├── completedWeeks (PROD)
      │   └── dev_completedWeeks (DEV)
      └── personal/
          ├── chaptersRead (PROD)
          ├── dev_chaptersRead (DEV)
          ├── thematicTopicsRead (PROD)
          └── dev_thematicTopicsRead (DEV)

/schedules/
  ├── {year}/weeks[] (PROD shared)
  └── dev_{year}/weeks[] (DEV isolated if needed)

/yeartexts/
  ├── {year}/ (PROD shared)
  └── dev_{year}/ (DEV isolated if needed)
```

Or simpler: Use same keys, but users can have separate test data.

---

## Risk Mitigation

**What Could Go Wrong?**

1. **Dev corrupts prod data**
   - ✅ Mitigated: localStorage completely isolated
   - ✅ Mitigated: Firebase keys prefixed
   - ✅ Mitigated: Different Vercel projects

2. **Prod code accidentally changed**
   - ✅ Mitigated: master branch protected
   - ✅ Mitigated: Production Protection warning in TODOs.md
   - ✅ Mitigated: Code review process

3. **Version confusion**
   - ✅ Mitigated: Settings shows exact version + BUILD_CODE
   - ✅ Mitigated: Different URLs (brc-liard vs brc-dev-liard)
   - ✅ Mitigated: Console logs version info

4. **Firebase DB split/sync issues**
   - ✅ Mitigated: Shared DB with prefixes (keeps sync simple)
   - ⚠️ Need to test thoroughly before shipping

---

## Rollback Plan

If dev breaks something:

1. **Immediate:** Switch users to prod URL
   ```
   Dev (broken): https://brc-dev-liard.vercel.app
   Prod (stable): https://brc-liard.vercel.app
   ```

2. **Data Recovery:** Check localStorage
   ```
   Prod uses: bibleCompanion_* keys (unaffected)
   Dev uses: dev_bibleCompanion_* keys (can delete)
   ```

3. **Firebase Recovery:** Check version in DB
   ```
   Prod keys: completedDates, weeklyReading, etc.
   Dev keys: dev_completedDates, dev_weeklyReading, etc.
   ```

4. **Full Rollback:** Checkout previous tag
   ```bash
   git checkout v1.0.0
   npm run build
   # Deploy to prod
   ```

---

## Success Criteria

✅ **Isolation Achieved When:**
1. Dev and Prod run simultaneously on different URLs
2. localStorage keys completely separate
3. Firebase DB shows both prod and dev data (prefixed)
4. Switching between URLs doesn't cause data loss
5. Each version can be updated independently
6. Testers use only prod, developers use only dev

✅ **Safe to Ship When:**
1. All localStorage calls use wrappedStorage
2. Firebase sync functions handle dev prefix
3. Testing checklist passed
4. No data corruption in any scenario

---

## Timeline

**Week 1:**
- [x] Documentation (this file)
- [ ] Create Vercel dev project
- [ ] Set environment variables

**Week 2:**
- [ ] Migrate localStorage calls (Priority 1)
- [ ] Test isolation
- [ ] Firebase prefix logic

**Week 3:**
- [ ] Migrate remaining localStorage calls (Priority 2+3)
- [ ] Full testing suite
- [ ] Rollback plan validation

**Week 4:**
- [ ] Production release
- [ ] Monitor for issues
- [ ] Archive documentation

---

## Questions & Answers

**Q: Why separate Vercel projects?**
A: Complete isolation. Prod deployments never affected by dev. Clear URLs for testers.

**Q: Can't we use environment variables?**
A: We could, but separate projects are clearer and safer for this workflow.

**Q: Will Firebase get too complicated?**
A: Only slightly. Prefixes are simple (dev_ prefix when dev mode). Can always split later.

**Q: What if a tester accidentally goes to dev URL?**
A: Different URL prefix (brc-dev-liard) makes it obvious. Plus Settings show "dev0.2.0".

**Q: How long until we can use dev branch in production?**
A: When dev features are complete, tested, and merged to master. Then master becomes new prod.

---

## References

- **CLAUDE.md** - Versioning strategy section
- **TODOs.md** - Production protection rules
- **src/config/version.js** - Version management
- **src/utils/storage.js** - Storage isolation code

---

**Next Action:** Create Vercel dev project (brc-dev-liard.vercel.app)

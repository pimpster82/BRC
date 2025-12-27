# PWA Manifest Versioning & Cache Busting Strategy

## Overview

This document explains how the Bible Reading Companion handles app updates, especially for PWA icons and manifest changes, ensuring users always get the latest assets.

## Problem Statement

**Browser Caching Issue:**
- Browsers cache `manifest.json` and icon files aggressively
- Users may not see icon/app updates immediately after deployment
- Especially problematic for PWA home screen installations
- Users need to manually clear cache to get updates

## Solution: 3-Layer Cache Busting Strategy

### Layer 1: Manifest Versioning

**File:** `public/manifest.json`

```json
{
  "name": "Bible Reading Companion",
  "version": "1.2.0",           // App version (updated on icon changes)
  "manifest_version": "2.0.0",  // Manifest format version
  ...
}
```

- Bump `version` when app icons or significant features change
- Bump `manifest_version` when manifest structure changes
- Version format: `MAJOR.MINOR.PATCH` (Semantic Versioning)

### Layer 2: Query String Cache Busting

**File:** `index.html`

```html
<!-- Manifest link with version query parameter -->
<link rel="manifest" href="/manifest.json?v=1.2.0" />
```

- Query string `?v=X.Y.Z` forces browser to refetch manifest
- Browser treats `/manifest.json` and `/manifest.json?v=1.2.0` as different resources
- Version parameter matches `manifest.json` version
- **Update process:** Change version in BOTH files together

### Layer 3: HTTP Cache Headers (Vercel)

**File:** `vercel.json`

**Manifest.json:**
```
Cache-Control: public, max-age=3600, must-revalidate
```
- 1 hour max cache
- `must-revalidate` forces revalidation after expiry
- Browsers will recheck after 1 hour anyway

**Icons:**
```
Cache-Control: public, max-age=604800, immutable
```
- 7 days (604800 seconds) cache
- `immutable` = file won't change for this URL
- Safe because icons use content-based naming

**Index.html:**
```
Cache-Control: public, max-age=0, must-revalidate
```
- Always revalidate HTML
- Ensures users get latest manifest link with correct version

### Layer 4: Runtime Version Check (JavaScript)

**File:** `index.html` (in `<head>`)

```javascript
const CHECK_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours - adjust as needed

// Checks manifest version periodically
// Also checks when user returns to tab
// Logs update detection to console
// Users can manually refresh when prompted
```

**Behavior:**
- Runs on page load
- Checks every 24 hours (configurable via `CHECK_INTERVAL`)
- Checks when tab becomes visible (user returns to app)
- Stores version in `localStorage` (key: `brc_manifest_version`)
- Logs updates to browser console

**Why 24 hours?**
- Batty-efficient (minimal power drain)
- Vercel manifest cache already 1 hour
- Frequent checks provide no additional benefit
- Adjustable via `CHECK_INTERVAL` constant if needed

**To Change Interval:**
```javascript
// Examples:
const CHECK_INTERVAL = 1 * 60 * 60 * 1000  // 1 hour
const CHECK_INTERVAL = 6 * 60 * 60 * 1000  // 6 hours
const CHECK_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours (default)
```

---

## Update Process

### For Icon Updates (Most Common)

1. **Update the icons:**
   - Add/modify PNG files in `public/icons/`
   - Update `public/manifest.json` to reference new icons

2. **Bump Version (All 3 places):**

   **public/manifest.json:**
   ```json
   "version": "1.2.1"  // Change from 1.2.0
   ```

   **index.html:**
   ```html
   <link rel="manifest" href="/manifest.json?v=1.2.1" />
   ```

3. **Commit & Push:**
   ```bash
   git add public/manifest.json index.html public/icons/*
   git commit -m "feat: Update app icons to v1.2.1"
   git push origin master
   ```

4. **Vercel Auto-Deploy:**
   - Changes deploy automatically
   - New icons served with fresh manifest

5. **User Experience:**
   - Immediately: Users might see old cached icons (up to 1 hour)
   - After manifest cache expires (1 hour): Manifest revalidated, new icons loaded
   - Instant (PWA users): If user manual refreshes, icons update immediately
   - Console log: `[BRC] App updated: 1.2.0 → 1.2.1`

### For Major Features

1. Bump `MAJOR` version: `1.2.0` → `2.0.0`
2. Update all 3 locations
3. Deploy as usual

### For Manifest Structure Changes

1. Bump `manifest_version`: `"2.0.0"` → `"3.0.0"`
2. This signals browsers that manifest format changed
3. Particularly important if adding new manifest fields

---

## Browser Behavior Timeline

| Time | Action | User Sees |
|------|--------|-----------|
| T+0 | Deploy v1.2.1 | Old icons (cached) |
| T+0 | Vercel serves new manifest | Still old (manifest cached 1h) |
| T+1 hour | Manifest cache expires | New icons appear automatically |
| T+1 hour | PWA reinstalls | Updated home screen icon |
| T+next visit | JavaScript check runs* | Detects version change in console |

*JavaScript check runs every 24 hours OR when user returns to tab after absence

---

## Technical Details

### Manifest Link Query String

Why this works:
```
URL: /manifest.json
     └── Browser caches for 1 hour

URL: /manifest.json?v=1.2.0
     └── Different resource!
     └── Browser fetches fresh copy
     └── But still uses same 1-hour cache for **this URL**

URL: /manifest.json?v=1.2.1
     └── NEW resource!
     └── Forces browser to download manifest
     └── New icons loaded immediately
```

### Icon Naming Strategy

Current approach (preferred):
```
icon-light-1024.png    ← Immutable (7-day cache safe)
icon-dark-1024.png     ← File content might change, but...
icon-tinted-1024.png   ← Users always update via manifest link
```

Alternative (if icon data changes):
```
icon-light-1024-v2.png     ← Version in filename
icon-light-1024-v3.png     ← Requires manifest update + versioning
```

Current approach is simpler: **manifest.json acts as single version source**.

---

## localStorage Structure

**Key:** `brc_manifest_version`
**Value:** Current manifest version (e.g., `"1.2.1"`)
**Purpose:** Detect when user loads new version

```javascript
localStorage.getItem('brc_manifest_version')  // Returns "1.2.0" or "1.2.1"
```

---

## Troubleshooting

### "I don't see the new icons"

1. **In development:**
   - Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Clear site data: DevTools → Application → Clear storage

2. **In production (Vercel):**
   - Wait 1 hour for manifest cache to expire
   - Or hard refresh manually
   - Check console for: `[BRC] App updated: X.Y.Z → X.Y.Z`

3. **PWA home screen:**
   - Icons may lag up to 7 days
   - User can manually refresh browser, then reinstall app

### "Icon didn't update after I changed the version"

- Check both `public/manifest.json` and `index.html` have **same version**
- Run `git status` to confirm files staged
- Verify Vercel build completed successfully

### "I see old manifest in DevTools"

- Expected! Waiting for 1-hour cache expiration
- Check Network tab: Response headers show `Cache-Control: max-age=3600`
- Hard refresh forces immediate recheck

---

## Version Bump Guidelines

Use Semantic Versioning: **MAJOR.MINOR.PATCH**

- **PATCH** (e.g., 1.2.0 → 1.2.1)
  - Icon updates
  - Bug fixes
  - Minor color/styling changes

- **MINOR** (e.g., 1.2.0 → 1.3.0)
  - New features
  - Icon variant additions (e.g., monochrome tinted)
  - Manifest field additions

- **MAJOR** (e.g., 1.2.0 → 2.0.0)
  - Significant redesigns
  - Breaking changes
  - Major app restructure

---

## Related Files

- `public/manifest.json` - PWA manifest with version field
- `index.html` - Manifest link with cache-busting query string
- `vercel.json` - Production cache headers
- `vite.config.js` - Development cache settings

---

## References

- [Web App Manifest Spec](https://www.w3.org/TR/appmanifest/)
- [HTTP Caching Best Practices](https://web.dev/http-cache/)
- [PWA Update Strategies](https://developers.google.com/web/tools/workbox/guides/advanced-recipes)
- [Vercel Cache Control Headers](https://vercel.com/docs/concepts/edge-network/caching)

---

**Last Updated:** 2025-12-27
**Current Version:** 1.2.0
**Manifest Version:** 2.0.0
**Check Interval:** 24 hours (battery-optimized)

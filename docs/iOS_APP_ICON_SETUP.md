# iOS 2025 App Icon Setup Guide

## Overview

This project now includes **3 App Icon Variants** for iOS 2025+ compliance:
- **Light Mode** - Default bright appearance
- **Dark Mode** - Dark system appearance
- **Tinted** - Grayscale monochrome for user customization

All icons are generated at multiple sizes and ready for native iOS app deployment.

---

## Icon Files Available

Located in `/public/icons/`:

### Master Icons (1024×1024)
- `icon-light-1024.png` - Light mode (sRGB)
- `icon-dark-1024.png` - Dark mode (sRGB, dark background)
- `icon-tinted-1024.png` - Tinted/Grayscale (fully opaque)

### Web Icons (512×512 & 192×192)
- `icon-light-512.png` / `icon-light-192.png`
- `icon-dark-512.png` / `icon-dark-192.png`
- `icon-tinted-512.png` / `icon-tinted-192.png`

### iOS-Specific Icons
- `icon-ios-120x120.png` - iPhone Spotlight
- `icon-ios-152x152.png` - iPad
- `icon-ios-167x167.png` - iPad Pro
- `icon-ios-180x180.png` - iPhone Home Screen

---

## For Native iOS App (Xcode)

### Step 1: Create Assets.xcassets Icon Set

1. Open your Xcode project
2. Navigate to **Assets.xcassets**
3. Right-click → **New App Icon Set**
4. Name it `AppIcon`

### Step 2: Configure Light Mode (Default)

For each size, drag `icon-light-XXXX.png`:

```
iOS Apps:
  - 16pt (iPhone, iPad Spotlight): icon-light-1024.png (scaled to 16pt)
  - 20pt (iPad Notifications): icon-light-1024.png (scaled)
  - 29pt (iPhone Spotlight): icon-light-1024.png (scaled)
  - 40pt (iPad Spotlight, iPhone Notifications): icon-light-1024.png (scaled)
  - 60pt (iPhone App): icon-light-1024.png (scaled)
  - 76pt (iPad App): icon-light-1024.png (scaled)
  - 83.5pt (iPad Pro App): icon-light-1024.png (scaled)
  - 1024pt (App Store): icon-light-1024.png
```

### Step 3: Enable Dark Mode Variant

For iOS 18+:

1. Select the **App Icon** in Assets
2. In the **Attributes Inspector** (right panel):
   - Check **"Appearances"**
   - Select **"Dark"**
3. For each size, add the corresponding `icon-dark-XXXX.png`

### Step 4: Add Monochrome (Tinted) Variant

For iOS 18+ Tinted Appearance:

1. In **Attributes Inspector**:
   - Check **"Appearances"**
   - Select **"Monochrome"**
2. For each size, add the corresponding `icon-tinted-XXXX.png`
3. Color space should be **Gray Gamma 2.2**

### Step 5: Verify Icon Settings

In **General** tab:
- App Icon Set: `AppIcon` (should be selected)
- Color Space: **sRGB** (for color icons) or **Gray Gamma 2.2** (for monochrome)

---

## For Web App (PWA)

### Configuration Already Done ✅

The following files are already configured:

**manifest.json:**
- All 3 variants listed with correct `purpose` attribute
- `"purpose": "any maskable"` for light/dark
- `"purpose": "monochrome"` for tinted
- All sizes from 192x192 to 1024x1024

**index.html:**
- Apple touch icons configured for iOS
- manifest.json linked
- Viewport settings for notch devices

### Browser/PWA Support

- **Chrome**: Automatically selects `icon-light` or `icon-dark` based on system preference
- **Firefox**: Uses primary icon (light)
- **Safari/iOS**: Uses apple-touch-icon variants
- **App Shortcut**: Uses monochrome variant if available

---

## Technical Specifications

| Property | Light Mode | Dark Mode | Tinted |
|----------|-----------|-----------|--------|
| Color Space | sRGB | sRGB | Gray Gamma 2.2 |
| Format | PNG | PNG | PNG |
| Transparency | Allowed | Optional | NOT allowed (fully opaque) |
| Master Size | 1024×1024 | 1024×1024 | 1024×1024 |
| Background | White/transparent | Dark gray (#141414) | Medium gray |
| Purpose | `any maskable` | `any maskable` | `monochrome` |

---

## Deployment Checklist

### For App Store Submission (Native iOS):
- [ ] Light mode icon set in Xcode
- [ ] Dark mode variant configured
- [ ] Monochrome/Tinted variant added
- [ ] All sizes validated (no rounded corners added—Apple does this)
- [ ] App Icon Set selected in General tab
- [ ] Color space correct for each variant

### For PWA Deployment:
- [ ] manifest.json with all 3 variants ✅
- [ ] index.html apple-touch-icon tags ✅
- [ ] All PNG files in `/public/icons/` ✅
- [ ] Test on multiple devices/browsers

### For GitHub Pages / Vercel:
- [ ] Deploy as usual—icons included in build
- [ ] Manifest.json served correctly
- [ ] Icons accessible at `/icons/` path ✅

---

## Testing

### Native iOS (Simulator):
1. Run app on simulator with iOS 18+
2. Switch system dark mode (Settings → Display & Brightness)
3. Icon should update automatically
4. Verify tinted appearance in custom home screen editor

### Web (Browser):
1. `npm run dev`
2. Open DevTools → Application → Manifest
3. Verify all icon entries present
4. Test on different screen brightness settings

### Add to Home Screen:
1. Safari: Share → Add to Home Screen
2. Icon should match system dark mode
3. Check iPad and iPhone sizes separately

---

## Notes

- ⚠️ Do NOT round corners manually—Apple applies a system "squircle" mask
- ⚠️ Tinted icon MUST be fully opaque (no transparency)
- ℹ️ For web, system automatically selects light/dark based on `prefers-color-scheme`
- ℹ️ Monochrome purpose tells system to apply tint color over grayscale icon

---

## References

- [Apple HIG - App Icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [iOS 18 Dark & Tinted Icons](https://www.createwithswift.com/preparing-your-app-icon-for-dark-and-tinted-appearance/)
- [Web App Manifest Icons](https://www.w3.org/TR/appmanifest/#icons-member)

---

**Last Updated:** 2025-12-27
**iOS Support:** iOS 18+ (fallback to light mode for earlier versions)
**Web Support:** All modern browsers

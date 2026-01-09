# App Icons - iOS 2025 Compliant (Silver Design)

## Current Icon Files (✅ ACTIVE)

### Master Icons (1024×1024) - iOS 2025 Variants

**3 Required Variants (Silver Design):**
- `icon-silver-light-1024.png` - Light mode (open Bible with colorful bookmarks, transparent bg)
- `icon-silver-dark-1024.png` - Dark mode (same Bible, slate-900 background)
- `icon-silver-tinted-1024.png` - Monochrome/Grayscale (fully opaque, for system tinting)

### Web Icons (512×512 & 192×192)
- `icon-silver-light-512.png` / `icon-silver-light-192.png`
- `icon-silver-dark-512.png` / `icon-silver-dark-192.png`
- `icon-silver-tinted-512.png` / `icon-silver-tinted-192.png`

### iOS Home Screen Icons
- `icon-ios-120x120.png` - iPhone Spotlight
- `icon-ios-152x152.png` - iPad
- `icon-ios-167x167.png` - iPad Pro
- `icon-ios-180x180.png` - iPhone Home Screen

### Vector Format
- `open-bible-icon.svg` - Scalable vector (modern design matching PNG variants)

---

## Total: 17 Files (487 KB)

### Design (Silver Variant)
- **Style:** Open Bible with colorful reading highlights (yellow, blue, pink, green lines)
- **Components:** Silver/gray hard cover, white pages with colored bookmarks, "BRC" ribbon bookmark
- **Colors:** Silver/gray frame, white pages, multicolor highlights (yellow, cyan, magenta, lime)
- **Format:** PNG (all) + SVG (vector)
- **Color Spaces:** sRGB (light/dark), Gray Gamma 2.2 (tinted)

### Configuration
- ✅ `manifest.json` - All variants with correct `purpose` attribute
- ✅ `index.html` - Apple touch icons for iOS
- ✅ Ready for PWA and native iOS deployment

---

## For Developers

If you need to regenerate icons from source:

1. Use `dall-e icon.png` as source (or regenerate from DALL-E 3)
2. Script: Run icon generation scripts in `scripts/`
3. Update `manifest.json` with new variants

Source file (optional to keep):
- `dall-e icon.png` - Original DALL-E 3 output (376 KB)

---

## Deprecated Files (Can Be Deleted)

Old icons replaced by new iOS 2025 variants:
- ❌ `icon-16x16.png` (old)
- ❌ `icon-32x32.png` (old)
- ❌ `icon-192x192.png` (old)
- ❌ `icon-512x512.png` (old)
- ❌ `icon-ios-*.png` (old variants)
- ❌ `open-bible-icon.svg` (old)
- ❌ `bible_tracker_icon_dark.ico` (converted)
- ❌ `ChatGPT Image Dec 27, 2025, 03_54_41 PM.png` (duplicate source)

See `readytoremove.md` in project root for full cleanup list.

---

## Alternative Icon Designs (Archived)

Previous versions and test variants are stored in `public/icons/alternatives/`:
- `icon-light-*.png` / `icon-dark-*.png` / `icon-tinted-*.png` (old navy design)
- `icon-light-cartoon.png` (test variant)
- `book-loading-*.gif` (loading animations)

These are kept for reference/testing. Only the **silver variants** are deployed.

---

**Last Updated:** 2026-01-01
**iOS Compliance:** iOS 18+ (with iOS 25 support)
**Web Compliance:** PWA, all modern browsers

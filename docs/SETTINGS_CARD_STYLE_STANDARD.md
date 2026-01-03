# Settings Card Style Standard

**WICHTIG:** Alle neuen Settings Cards MÜSSEN diesem Standard folgen!

## Card Structure

```jsx
<div className="card bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 mb-3 p-0">
  <button
    onClick={() => toggleSection('sectionName')}
    className="w-full flex items-start justify-between pt-[10px] pr-[5px] pb-[10px] pl-[10px]"
  >
    {/* LEFT SIDE: Icon + Title */}
    <div className="flex items-start gap-2.5 flex-1 min-w-0">
      <IconName className="w-5 h-5 flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
      <h2 className="font-semibold text-gray-800 dark:text-gray-300">Title</h2>
    </div>

    {/* RIGHT SIDE: Status + Chevron */}
    <div className="flex items-center gap-0 flex-shrink-0">
      <span className="text-xs text-gray-600 dark:text-gray-400">Status</span>
      {expandedSection === 'sectionName' ? (
        <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
      ) : (
        <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
      )}
    </div>
  </button>

  {/* EXPANDED CONTENT */}
  {expandedSection === 'sectionName' && (
    <div className="mt-0 pt-4 pl-[10px] pr-[10px] pb-[16px] border-t border-gray-200 dark:border-gray-700">
      {/* Content goes here */}
    </div>
  )}
</div>
```

## Spacing & Sizing Reference

| Element | Value | Notes |
|---------|-------|-------|
| **Card Container** | `p-0` | No padding on card itself |
| **Card Margin** | `mb-3` | 12px margin bottom between cards |
| **Button Padding** | `pt-[10px] pr-[5px] pb-[10px] pl-[10px]` | 10px top/bottom, 5px right, 10px left |
| **Left Side (Icon+Title)** | `flex items-start gap-2.5 flex-1 min-w-0` | items-START for left-aligned wrapping, gap-2.5 = 10px |
| **Icon** | `w-5 h-5 flex-shrink-0 mt-0.5` | 20px size, 2px top margin for alignment |
| **Right Side (Status+Chevron)** | `flex items-center gap-0 flex-shrink-0` | gap-0 = no gap, stay right-aligned |
| **Status Text** | `text-xs` | 12px font size (2pt smaller than title) |
| **Expanded Content Padding** | `mt-0 pt-4 pl-[10px] pr-[10px] pb-[16px]` | 10px left/right, 16px bottom |
| **Chevron Size** | `w-5 h-5` | Always 20px |

## Critical Rules

### 1. Text Wrapping - ALWAYS Use `items-start`
```jsx
// ✅ CORRECT - Text wraps left-aligned
<div className="flex items-start gap-2.5 flex-1 min-w-0">

// ❌ WRONG - Text wraps centered
<div className="flex items-center gap-2.5 flex-1 min-w-0">
```

The `items-start` ensures that when title text wraps to multiple lines, it stays left-aligned instead of centering.

### 2. Icon Alignment
```jsx
// ✅ CORRECT - Icon at top with slight margin for visual balance
<IconName className="w-5 h-5 flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />

// ❌ WRONG - No flex-shrink-0 or margin
<IconName className="w-5 h-5 text-blue-600 dark:text-blue-400" />
```

### 3. Right Side (Status + Chevron)
```jsx
// ✅ CORRECT - No gap, stays right-aligned
<div className="flex items-center gap-0 flex-shrink-0">
  <span className="text-xs">Status</span>
  <ChevronDown className="w-5 h-5" />
</div>

// ❌ WRONG - gap-2 pushes elements apart
<div className="flex items-center gap-2">
```

### 4. Expanded Content Padding
```jsx
// ✅ CORRECT - Matches button left/right padding
<div className="mt-0 pt-4 pl-[10px] pr-[10px] pb-[16px]">

// ❌ WRONG - Using px-4 instead of custom values
<div className="mt-4 pt-4 px-4 pb-4">
```

## Color & Dark Mode

All text colors must include dark mode variants:
```jsx
// ✅ CORRECT
className="text-gray-800 dark:text-gray-300"

// ❌ WRONG - Missing dark mode
className="text-gray-800"
```

## Implementation Checklist

When creating a new Settings Card, verify:
- [ ] Card has `p-0` and `mb-3`
- [ ] Button has `items-start` (NOT `items-center`)
- [ ] Button padding is `pt-[10px] pr-[5px] pb-[10px] pl-[10px]`
- [ ] Left div uses `flex items-start gap-2.5 flex-1 min-w-0`
- [ ] Icon has `flex-shrink-0` and `mt-0.5`
- [ ] Right div uses `flex items-center gap-0 flex-shrink-0`
- [ ] Status text is `text-xs` (not `text-sm`)
- [ ] Expanded content uses `mt-0 pt-4 pl-[10px] pr-[10px] pb-[16px]`
- [ ] All text has dark: variants
- [ ] No hardcoded text - use `t('key')` for translations

## Why These Values?

- **items-start:** Ensures text wrapping stays left-aligned instead of centering
- **gap-2.5 (10px):** Visual spacing between icon and text
- **gap-0 on right:** Status stays compact next to chevron without extra space
- **mt-0.5 on icon:** Subtle top margin for visual balance when title is larger
- **text-xs on status:** 2pt smaller than title (semibold) for visual hierarchy
- **pb-[16px] expanded:** More breathing room at bottom of expanded content
- **flex-1 min-w-0:** Allows left content to grow but prevents overflow
- **flex-shrink-0:** Prevents right content from shrinking, keeps it fixed

## File Locations

- Main Settings Page: `src/pages/SettingsPage.jsx`
- Reference implementations: Lines 652-1605
- Do NOT modify this standard without team discussion

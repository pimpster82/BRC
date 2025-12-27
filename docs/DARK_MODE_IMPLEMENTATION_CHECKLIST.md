# 🌙 Dark Mode Implementation Checklist

> **Rule #1:** Every UI element needs BOTH light AND dark styling. Test in Dark Mode during development!

---

## ✅ Quick Checklist for New Features

### Containers & Cards
- [ ] Card backgrounds: `className="card bg-white dark:bg-slate-900"` (NOT just `.card`)
- [ ] Wrapper divs: `<div className="space-y-2">` (for form fields)
- [ ] Borders: Always include dark variant `border-gray-200 dark:border-gray-700`

### Form Fields (Inputs, Selects, Textareas)
```jsx
// ✅ CORRECT Pattern
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
    Label
  </label>
  <input
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  <p className="text-xs text-gray-500 dark:text-gray-400">Help text</p>
</div>

// ❌ WRONG - spacing via mb-2, mt-1
<div>
  <label className="... mb-2">Label</label>
  <input className="..." />
  <p className="... mt-1">Help text</p>
</div>
```

### Buttons
- [ ] Primary buttons: `bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600`
- [ ] Secondary buttons: `bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300`
- [ ] Status buttons (green/red): Always add full dark variants
- [ ] Toggle switches: `${active ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`

### Text Colors
| Light | Dark | Use Case |
|-------|------|----------|
| `text-gray-900` | `dark:text-gray-100` | Headings |
| `text-gray-700` | `dark:text-gray-300` | Body text |
| `text-gray-600` | `dark:text-gray-400` | Secondary text |
| `text-gray-500` | `dark:text-gray-400` | Tertiary/muted |
| `text-{color}-700` | `dark:text-{color}-300` | Semantic colors (blue, green, red) |

### Border Colors
```jsx
// Standard pattern
border-gray-200 dark:border-gray-700

// Semantic colors
border-blue-200 dark:border-blue-700
border-green-100 dark:border-green-700
border-red-200 dark:border-red-700
```

### Background Colors
```jsx
// For colored backgrounds
bg-blue-50 dark:bg-blue-900      // light: pale blue, dark: dark blue
bg-gray-100 dark:bg-slate-700    // light: light gray, dark: slate
bg-green-100 dark:bg-green-900   // light: pale green, dark: dark green
```

### Hover States
- [ ] Always include dark hover: `hover:bg-gray-200 dark:hover:bg-slate-600`
- [ ] Link colors: `text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300`

### Focus States (for inputs)
```jsx
// ✅ Include dark focus ring
focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
```

### Chevrons & Icons
- [ ] Icon colors: `text-gray-400 dark:text-gray-500`
- [ ] Icon on colored backgrounds: `text-{color}-600 dark:text-{color}-400`

---

## 🚨 Common Mistakes to Avoid

### Mistake #1: Fixed Light Colors in Containers
```jsx
// ❌ WRONG - bg-white is hardcoded
<div className="card bg-white border...">

// ✅ CORRECT - dark variant included
<div className="card bg-white dark:bg-slate-900 border...">
```

### Mistake #2: Manual Spacing in Form Fields
```jsx
// ❌ WRONG - mb-2, mt-1, mt-3
<label className="... mb-2">Label</label>
<input className="..." />
<p className="... mt-1">Help</p>

// ✅ CORRECT - use space-y-2
<div className="space-y-2">
  <label className="...">Label</label>
  <input className="..." />
  <p className="...">Help</p>
</div>
```

### Mistake #3: Missing Dark Variant in Ternary
```jsx
// ❌ WRONG - only light colors in ternary
className={`${isActive ? 'bg-blue-600' : 'bg-gray-100'}`}

// ✅ CORRECT - include dark variants
className={`${isActive ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-100 dark:bg-slate-700'}`}
```

### Mistake #4: Forgetting Focus Rings
```jsx
// ❌ WRONG - no dark focus
focus:ring-blue-500

// ✅ CORRECT - dark focus ring
focus:ring-blue-500 dark:focus:ring-blue-400
```

### Mistake #5: Inconsistent Gray Palette
```jsx
// ❌ WRONG - mixing gray and slate
dark:bg-gray-700 dark:text-gray-300

// ✅ CORRECT - consistent slate for dark mode backgrounds
dark:bg-slate-800 dark:text-gray-300
```

---

## 🎯 Testing Checklist Before Committing

**For Every New Component/Page:**

1. **Light Mode**
   - [ ] All text readable (not too light/dark)
   - [ ] Buttons have good contrast
   - [ ] Borders visible
   - [ ] Hover states clear

2. **Dark Mode** (Most Important!)
   - [ ] Card backgrounds are DARK (not white) - `dark:bg-slate-900`
   - [ ] Text is readable (not too bright) - use `dark:text-gray-300` not `dark:text-gray-100`
   - [ ] Icons visible - `dark:text-{color}`
   - [ ] Form inputs dark - `dark:bg-slate-800 dark:border-gray-600`
   - [ ] Buttons properly styled
   - [ ] Hover states work
   - [ ] Focus rings visible
   - [ ] No white backgrounds showing

3. **Testing Method**
   ```
   Desktop: F12 DevTools → ⚙️ → Rendering → Emulate CSS media feature prefers-color-scheme
   Mobile: Settings → Display → Dark Mode (or System setting)
   Then: Hard refresh (Ctrl+Shift+R) to clear cache
   ```

---

## 📋 Form Field Template

**Copy-paste this pattern for all new forms:**

```jsx
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
    Field Label
  </label>

  {/* For text inputs */}
  <input
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
  />

  {/* For selects */}
  <select
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    ...
  </select>

  {/* Help text */}
  <p className="text-xs text-gray-500 dark:text-gray-400">
    Help text or instructions
  </p>
</div>
```

---

## 📋 Card Template

**Copy-paste this pattern for all new cards:**

```jsx
<div className="card bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 mb-3">
  <button
    onClick={() => toggleSection('name')}
    className="w-full flex items-center justify-between"
  >
    <div className="flex items-center gap-2">
      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      <h2 className="font-semibold text-gray-800 dark:text-gray-300">
        Card Title
      </h2>
    </div>
    <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
  </button>

  {isExpanded && (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
      {/* Content goes here */}
    </div>
  )}
</div>
```

---

## 🎨 Color Reference

### Core Dark Mode Palette
- **Dark backgrounds:** `dark:bg-slate-900` (cards, containers)
- **Dark surfaces:** `dark:bg-slate-800` (inputs, nested elements)
- **Dark page:** `dark:bg-slate-950` (body background)
- **Primary text:** `dark:text-gray-100` (rarely used - too bright!)
- **Secondary text:** `dark:text-gray-300` (standard body text)
- **Tertiary text:** `dark:text-gray-400` (labels, hints)
- **Muted text:** `dark:text-gray-500` (disabled, subtle)

### Semantic Dark Colors
```
Blue:   text-blue-600 dark:text-blue-400, bg-blue-50 dark:bg-blue-900
Green:  text-green-600 dark:text-green-400, bg-green-50 dark:bg-green-900
Red:    text-red-600 dark:text-red-400, bg-red-50 dark:bg-red-900
Yellow: text-yellow-600 dark:text-yellow-400, bg-yellow-50 dark:bg-yellow-900
Purple: text-purple-600 dark:text-purple-400, bg-purple-50 dark:bg-purple-900
```

---

## 🔗 Related Documentation

- **DARK_MODE_COLOR_GUIDE.md** - Deep dive on color theory and accessibility
- **DARK_MODE_ISSUES_ANALYSIS.md** - What was broken and how we fixed it
- **src/styles/index.css** - CSS component classes (.card, .btn-open, etc.)

---

## 💡 Pro Tips

1. **Always test in Dark Mode first** - If it looks good dark, light is easy
2. **Use DevTools emulation** - F12 → ⚙️ → Rendering → prefers-color-scheme
3. **Check contrast ratios** - Use https://webaim.org/resources/contrastchecker/
4. **Reference existing patterns** - Look at PersonalReadingPage or SettingsPage for working examples
5. **Commit dark mode with feature** - Don't wait for Phase 2 fixes!

---

**Generated:** 2025-12-27
**Last Updated:** After v0.1.2 Dark Mode Complete Release

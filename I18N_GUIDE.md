# Internationalization (i18n) Guide

## Overview

The Bible Reading Companion app supports multiple languages with a centralized dictionary system. All UI strings are managed in `src/config/i18n.js`.

## Supported Languages

- 🇩🇪 **Deutsch** (de)
- 🇬🇧 **English** (en)
- 🇪🇸 **Español** (es)
- 🇮🇹 **Italiano** (it)
- 🇫🇷 **Français** (fr)

## Adding New Strings

### 1. Add to i18n Dictionary

In `src/config/i18n.js`, add your new string to **all language sections**:

```javascript
export const translations = {
  de: {
    'my_feature.title': 'Mein Feature',
    'my_feature.description': 'Eine Beschreibung des Features',
    // ... more German strings
  },
  en: {
    'my_feature.title': 'My Feature',
    'my_feature.description': 'A description of the feature',
    // ... more English strings
  },
  // ... other languages
}
```

### 2. Use in Components

Import and use the `t()` function:

```javascript
import { t } from '../config/i18n'

function MyComponent() {
  const title = t('my_feature.title')
  const description = t('my_feature.description')

  return (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  )
}
```

## String Interpolation

For dynamic strings with parameters:

```javascript
// In i18n.js
export const translations = {
  de: {
    'home.day_progress': 'Tag {current} von {total} · {percent}% abgeschlossen',
  },
  // ...
}

// In component
const progress = t('home.day_progress', null, {
  current: 5,
  total: 365,
  percent: 1
})
// Output: "Tag 5 von 365 · 1% abgeschlossen"
```

## Using Specific Language

```javascript
// Get translation in a specific language (not current language)
const germanText = t('nav.today', 'de')  // Returns "HEUTE"
const englishText = t('nav.today', 'en') // Returns "TODAY"
```

## Getting All Translations

```javascript
import { getTranslations } from '../config/i18n'

// Get all German translations
const allGerman = getTranslations('de')

// Get all English translations
const allEnglish = getTranslations('en')
```

## Key Naming Convention

Use dot notation with descriptive category prefixes:

- `nav.*` - Navigation items
- `home.*` - Home page content
- `settings.*` - Settings page content
- `weekday.*` - Days of the week
- `readingplan.*` - Reading plan names
- `datepicker.*` - Date picker UI

Example: `'home.daily_text'`, `'settings.reset_confirm'`

## Migration Checklist

When adding new UI strings:

1. ✅ Add string key to all 5 language sections in `i18n.js`
2. ✅ Import `t` function in your component
3. ✅ Use `t('your.key')` instead of hardcoded strings
4. ✅ Test all languages in settings to verify translation appears
5. ✅ Commit with version bump (e.g., 0.0.1 → 0.1.0 for new features)

## Future Enhancements

- [ ] Add translation export for crowdsourcing translations
- [ ] Create translation validation tool
- [ ] Add right-to-left (RTL) language support (Arabic, Hebrew)
- [ ] Extract strings to external JSON files for easier management
- [ ] Add translation completeness percentage tracking

## Example: Adding a New Feature with Translations

1. **i18n.js** - Add strings for all languages:
```javascript
export const translations = {
  de: {
    'new_feature.button': 'Neue Funktion',
    'new_feature.title': 'Feature Titel',
  },
  en: {
    'new_feature.button': 'New Feature',
    'new_feature.title': 'Feature Title',
  },
  // ... etc
}
```

2. **MyNewFeature.jsx** - Use translations:
```javascript
import { t } from '../config/i18n'

export default function MyNewFeature() {
  return (
    <div>
      <h2>{t('new_feature.title')}</h2>
      <button>{t('new_feature.button')}</button>
    </div>
  )
}
```

3. **Commit** with appropriate version bump:
```bash
git commit -m "Add new feature with i18n support - v0.1.0"
```

## Troubleshooting

**String shows up as key name instead of translation?**
- Check that key exists in all language sections
- Verify key spelling matches exactly
- Check that language code is correct

**Translation not updating in app?**
- Clear browser cache
- Restart dev server
- Check localStorage for correct language code

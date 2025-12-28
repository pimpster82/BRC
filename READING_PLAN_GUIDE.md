# 📚 Reading Plan Creator Guide

Create and share custom Bible reading plans! Simple text format, no coding required.

---

## Quick Start

1. **Go to Settings** ⚙️ → ADMIN SETTINGS (PIN: 170182)
2. **Click** "📚 Create Reading Plan"
3. **Paste plan** in the modal
4. **Preview** to check format
5. **Upload** to Firebase
6. **Share** plan ID with others!

---

## Plan Format

```
---
id: unique_plan_id
name: [de] Planname | [en] Plan Name | [es] Nombre | [it] Nome | [fr] Nom
type: category | thematic | chronological
---

# [de] Section Title | [en] Section Title
Content here

## [de] Subsection | [en] Subsection
Content here
```

**Required fields:**
- `id` - Unique identifier (use lowercase, no spaces)
- `name` - Multilingual title (all 5 languages!)
- `type` - One of: `category`, `thematic`, `chronological`

---

## Content Types

### 1. Book Ranges (for Category Plans)
```
# [de] Old Testament | [en] Old Testament
01-39
```
Represents books 1-39 (Genesis to Malachi)

**Format:** `01-39` or `01,05,10` (single books separated by comma)

### 2. Specific Verses (for Thematic Plans)
```
## [de] Prayer | [en] Prayer
19:23:1-5; 19:119:1-10; 62:1:5:14
```
Specific Bible passages for thematic topics

**Format:** `BB:C:V` where:
- `BB` = Book number (01-66)
- `C` = Chapter
- `V` = Verse(s)

**Examples:**
- `01:1:1-5` - Genesis 1:1-5
- `19:23` - Psalm 23 (all verses)
- `45:1:1-5:10` - Romans 1:1 to 5:10

### 3. Time-Based Plans (Auto-Divide)
```
# [de] Bibel in einem Jahr | [en] Bible in One Year
01-66 (/1Y)

# [de] Paulus in einem Monat | [en] Paul in a Month
45-58 (/1M)
```

The system automatically divides the content evenly!

**Time Directives:**
- `/1D` = 1 day
- `/7D` = 7 days
- `/1W` = 1 week
- `/2W` = 2 weeks
- `/1M` = 1 month (30 days)
- `/3M` = 3 months
- `/1Y` = 1 year (365 days)
- `/2Y` = 2 years

---

## Complete Examples

### Example 1: Category Plan (Like Free Plan)
```
---
id: system_ot_nt
name: [de] Altes & Neues Testament | [en] Old & New Testament | [es] AT & NT | [it] AT e NT | [fr] AT et NT
type: category
---

# [de] Altes Testament | [en] Old Testament | [es] Antiguo Testamento | [it] Antico Testamento | [fr] Ancien Testament
01-39

# [de] Neues Testament | [en] New Testament | [es] Nuevo Testamento | [it] Nuovo Testamento | [fr] Nouveau Testament
40-66
```

### Example 2: Thematic Plan
```
---
id: my_comfort_topics
name: [de] Trost & Hoffnung | [en] Comfort & Hope | [es] Consuelo y Esperanza | [it] Conforto e Speranza | [fr] Réconfort et Espoir
type: thematic
---

# [de] Wenn dir Mut fehlt | [en] When You're Discouraged | [es] Cuando estás desanimado | [it] Quando sei scoraggiato | [fr] Quand tu es découragé

## [de] Psalm 23 | [en] Psalm 23 | [es] Salmo 23 | [it] Salmo 23 | [fr] Psaume 23
19:23

## [de] Trost von Gott | [en] God's Comfort | [es] Consuelo de Dios | [it] Conforto di Dio | [fr] Réconfort de Dieu
23:41:10; 47:1:3-4; 60:5:7

# [de] Hoffnung für die Zukunft | [en] Hope for the Future | [es] Esperanza para el futuro | [it] Speranza per il futuro | [fr] Espoir pour l'avenir

## [de] Gottes Reich | [en] God's Kingdom | [es] Reino de Dios | [it] Regno di Dio | [fr] Royaume de Dieu
66:21:1-4
```

### Example 3: Time-Based Challenge
```
---
id: gospels_week
name: [de] Die Evangelien in einer Woche | [en] The Gospels in One Week | [es] Los Evangelios en una Semana | [it] I Vangeli in una Settimana | [fr] Les Évangiles en une Semaine
type: chronological
---

# [de] Matthew bis John | [en] Matthew through John | [es] Mateo a Juan | [it] Matteo a Giovanni | [fr] Matthieu à Jean
40-43 (/7D)
```

---

## Important Rules

✅ **DO:**
- Use **all 5 languages** (de, en, es, it, fr)
- Separate languages with `|` (pipe symbol)
- Wrap language codes in `[]` brackets
- Use uppercase hex format for IDs: `my_custom_plan`
- Test with Preview before uploading

❌ **DON'T:**
- Mix format types (don't combine book ranges and verses in same section)
- Use wrong language codes
- Forget to add all 5 languages
- Use special characters in plan ID
- Leave sections empty

---

## Validation Checks

The Preview will show errors if:
- ❌ Missing required fields (id, name, type)
- ❌ Book numbers out of range (must be 01-66)
- ❌ Invalid verse format
- ❌ Incomplete language coverage
- ❌ Invalid time directives

Fix the issues and Preview again!

---

## After Upload

✅ Plan appears in Firebase at: `/readingPlans/available/{plan_id}`

✅ Other users can:
- See it in "Available Plans"
- Read description
- Install it with one click
- Use it in their dropdown

✅ Uninstalling:
- Removes from their "installedPlans"
- Stays in "Available Plans" for others

---

## Tips & Tricks

**1. Use Clear IDs**
```
✓ my_comfort_devotional
✓ paulus_letters_deep_study
✗ asdf (too vague)
```

**2. Organize by Sections**
```
# Section Theme
  ## Topic A
  Content

  ## Topic B
  Content
```

**3. Time Directives for Reading**
```
# Read in 90 days
01-39 (/3M)    # Old Testament

# Read in 90 days
40-66 (/3M)    # New Testament
```

**4. Combine Verses in Thematic**
```
## Key Teaching
19:119:1-20; 19:119:89-104; 19:119:165-176
```

---

## What Happens Behind the Scenes

```
Your Plan Text
    ↓
Parser validates & structures
    ↓
Preview shows results
    ↓
Upload to Firebase
    ↓
Firebase stores in /readingPlans/available/
    ↓
Users see in "Available Plans"
    ↓
User installs → Added to their installedPlans/
    ↓
Plan appears in dropdown
```

---

## Support & Examples

**Check examples in:**
- Settings → Admin Settings → Create Reading Plan
- Modal has example format in placeholder

**Common errors?**
- Reread the Format section
- Check Preview output
- Ensure all 5 languages present
- Verify book numbers (01-66)

**Questions?**
- Use the [Forum/Community](link)
- Check the TODOs.md file

---

**Happy Plan Creating!** 📖✨

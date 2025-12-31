# 📚 Reading Plans - Quick Start & Testing Guide

Complete guide to test and use the Reading Plan Store system.

---

## 🎯 For Administrators (Creating Plans)

### 1. Open Admin Settings
- Go to **Settings** ⚙️
- Click **ADMIN SETTINGS** (PIN: 170182)
- Click "📚 Create Reading Plan"

### 2. Paste Your Plan

Example: Jesu Leben und Wirken (Chronological)

```yaml
---
id: chron_jesus_life
name: [de] Jesu Leben und Wirken | [en] Life and Ministry of Jesus | [es] Vida y ministerio de Jesús | [it] Vita e ministero di Gesù | [fr] Vie et ministère de Jésus
type: chronological
---

# [de] Geburt und Vorbereitung | [en] Birth and Preparation | [es] Nacimiento y preparación | [it] Nascita e preparazione | [fr] Naissance et préparation

## [de] Geburt Jesu | [en] Birth of Jesus
40:1-2;42:1-2

## [de] Johannes der Täufer | [en] John the Baptist
40:3;41:1;42:3;43:1
```

### 3. Click Preview
- Validates format
- Shows structure
- Displays errors

### 4. Upload to Firebase
- Click "Upload to Firebase"
- Plan appears in Firebase: `/readingPlans/available/{planId}`

---

## 👤 For Users (Installing Plans)

### 1. Go to Personal Reading Page

### 2. Scroll Down to "Available Plans"
- Shows all custom + system plans
- Displays: Plan name, type, installation count

### 3. Click "Install"
- Plan moves to "My Plans" dropdown
- Added to your installedPlans

### 4. Select from Dropdown
- Choose plan from dropdown
- Plan content displays below
- Read in your own pace

### 5. Uninstall (Optional)
- Click "Uninstall" to remove from dropdown
- Plan stays in "Available Plans" for others

---

## ✅ Full End-to-End Test

### Test Scenario 1: Create + Install Category Plan

**Admin:**
```yaml
---
id: test_gospels
name: [de] Die vier Evangelien | [en] The Four Gospels | [es] Los cuatro Evangelios | [it] I quattro Vangeli | [fr] Les quatre Évangiles
type: category
---

# [de] Matthäus | [en] Matthew
40

# [de] Markus | [en] Mark
41

# [de] Lukas | [en] Luke
42

# [de] Johannes | [en] John
43
```

**User:**
1. Upload from Admin
2. Go to Personal Reading
3. See plan in "Available Plans"
4. Click Install
5. Select from dropdown
6. See book grid (like Free Plan)

---

### Test Scenario 2: Create + Install Thematic Plan

**Admin:**
```yaml
---
id: test_prayer
name: [de] Gebete in der Bibel | [en] Prayers in the Bible | [es] Oraciones en la Biblia | [it] Preghiere nella Bibbia | [fr] Prières dans la Bible
type: thematic
---

# [de] Alte Testament Gebete | [en] Old Testament Prayers

## [de] Psalm 23 | [en] Psalm 23
19:23

## [de] Psalm 139 | [en] Psalm 139
19:139
```

**User:**
1. Upload from Admin
2. Go to Personal Reading
3. See plan in "Available Plans"
4. Click Install
5. Select from dropdown
6. See themed topics (like Thematic Plan)

---

### Test Scenario 3: Create + Install Chronological Plan (Free Pace)

**Admin:**
```yaml
---
id: test_chron_pentateuch
name: [de] Pentateuch in Ordnung | [en] Pentateuch in Order | [es] Pentateuco en orden | [it] Pentateuco in ordine | [fr] Pentateuque dans l'ordre
type: chronological
---

# [de] Mose 1-5 | [en] Genesis-Deuteronomy

## [de] Schöpfung bis Flut | [en] Creation to Flood
01:1-11

## [de] Patriarchen | [en] Patriarchs
01:12-50

## [de] Exodus | [en] Exodus
02

## [de] Levitikus | [en] Leviticus
03

## [de] Numeri | [en] Numbers
04

## [de] Deuteronomium | [en] Deuteronomy
05
```

**User:**
1. Upload from Admin
2. Go to Personal Reading
3. See plan in "Available Plans"
4. Click Install
5. Select from dropdown
6. See chronological structure with subsections

---

## 🔍 What to Check

### Preview Modal (Admin)
- ✅ Text parses without errors
- ✅ All 5 languages detected
- ✅ Plan structure shows correctly
- ✅ Green success message appears

### Firebase Upload
- ✅ No error messages
- ✅ Success message shown
- ✅ Plan disappears from modal

### Available Plans Section (User)
- ✅ Plan appears in grid
- ✅ Shows: name (in your language), type, installations
- ✅ "Install" button works

### Dropdown (User)
- ✅ Custom plan appears in "My Plans" section
- ✅ Selecting it shows plan content
- ✅ Plan renders correctly

### Plan Rendering
- ✅ Category: Shows book grid (color-coded)
- ✅ Thematic: Shows topics with expandable content
- ✅ Chronological: Shows sections with subsections

### Uninstall
- ✅ Plan disappears from dropdown
- ✅ Plan stays in "Available Plans"
- ✅ Re-install works

---

## 📋 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Parse error: Invalid format" | Make sure first `---` is on its own line |
| "Incomplete language coverage" | Add all 5 languages: de, en, es, it, fr |
| Plan not appearing in Available Plans | Check Firebase is connected, wait 30 seconds |
| Selected plan shows nothing | Plan might not have loaded - refresh page |
| Dark mode colors wrong | Reload page, check browser cache |

---

## 🚀 Success Criteria

All tests PASS when:
1. ✅ Admin can create + upload plans
2. ✅ Plans appear in "Available Plans" section
3. ✅ Users can install + uninstall
4. ✅ Plans appear in dropdown with correct names
5. ✅ Plan content renders based on type
6. ✅ Dark mode works everywhere
7. ✅ Multilingual names show correctly

**System is PRODUCTION READY!** 🎉
# 📚 Reading Plan Types - Complete Guide

Welcher Typ passt zu deinem Plan? Hier sind alle Optionen mit Beispielen.

---

## 1. **Category Plans** (`type: category`)

### 🎯 Wofür?
- **Bücher nach Kategorien ordnen** (z.B. OT/NT, Evangelien, Paulusbriefe)
- **Keine Subsektionen nötig** - einfache flache Struktur
- **Nutzer wählt Bücher aus und liest frei** - kein festgelegter Tempo

### ✅ Erlaubt:
- Nur `#` Hauptsektionen (keine `##` Subsektionen!)
- Book-Ranges: `01-39` (Bücher 1-39)
- Einzelne Bücher: `01,05,10`

### ❌ NICHT erlaubt:
- `##` Subsektionen
- Spezifische Verse (`01:1:1-5`)
- Zeit-Direktiven (`/1Y`, `/1M`)

### 📝 Beispiel: Old & New Testament

```yaml
---
id: simple_ot_nt
name: [de] Altes & Neues Testament | [en] Old & New Testament | [es] AT & NT | [it] AT e NT | [fr] AT et NT
type: category
---

# [de] Altes Testament | [en] Old Testament
01-39

# [de] Neues Testament | [en] New Testament
40-66
```

**Renderiert als:** Zwei Sektionen mit Buch-Grids (wie "Free Plan")

---

## 2. **Thematic Plans** (`type: thematic`)

### 🎯 Wofür?
- **Themen durchleuchten** (z.B. "Gebet in der Bibel", "Hoffnung", "Glaube")
- **Spezifische Verse sammeln** - nicht ganze Bücher
- **Subsektionen möglich** für Unter-Themen
- **Nutzer hakt Themen ab** wenn erledigt (Checkbox)

### ✅ Erlaubt:
- `#` Hauptsektionen (Thema-Überschriften)
- `##` Subsektionen (Unter-Themen)
- Spezifische Verse: `01:1:1-5` (Buch 1, Kapitel 1, Verse 1-5)
- Verse-Liste: `19:23` (Psalm 23 komplett)
- Verse-Ranges: `47:1:3-4` (Buch 47, Kapitel 1, Verse 3-4)

### ❌ NICHT erlaubt:
- Book-Ranges (`01-39`)
- Zeit-Direktiven (`/1Y`, `/1M`)

### 📝 Beispiel: Gebet in der Bibel

```yaml
---
id: theme_prayer
name: [de] Gebet in der Bibel | [en] Prayer in the Bible | [es] Oración en la Biblia | [it] Preghiera nella Bibbia | [fr] Prière dans la Bible
type: thematic
---

# [de] Alte Testament Gebete | [en] Old Testament Prayers

## [de] Psalm 23 - Geborgenheit | [en] Psalm 23 - Security
19:23

## [de] Psalm 139 - Gott kennt mich | [en] Psalm 139 - God Knows Me
19:139

# [de] Neue Testament Gebete | [en] New Testament Prayers

## [de] Vaterunser | [en] Lord's Prayer
40:6:9-13

## [de] Paulus' Gebete | [en] Paul's Prayers
51:1:3-14; 51:3:14-19
```

**Renderiert als:** Thema-Struktur mit expandierbaren Topics, Verse als Links

---

## 3. **Chronological Plans** (`type: chronological`)

### 🎯 Wofür?
- **Bibel in historischer Reihenfolge** (nicht Buch-für-Buch)
- **Mit oder ohne Zeitplan:** Zeit-Direktiven sind optional!
  - Mit Zeit (`/1Y`): Auto-Divide in Tagesteile (z.B. "Bibel in 1 Jahr")
  - Ohne Zeit: Nutzer liest in eigner Geschwindigkeit, aber in chronologischer Reihenfolge

### ✅ Erlaubt:
- `#` Hauptsektionen
- `##` Subsektionen (optional, für Gruppierung)
- Book-Ranges: `01-66`
- Spezifische Verse: `01:1:1-5:10`
- Zeit-Direktiven: `/1Y`, `/1M`, `/7D` (optional!)

### ❌ NICHT erlaubt:
- Nichts! Alle Kombinationen sind erlaubt

### 📝 Beispiel: Bibel in 1 Jahr

```yaml
---
id: chrono_one_year
name: [de] Bibel in einem Jahr | [en] Bible in One Year | [es] Biblia en un año | [it] Bibbia in un anno | [fr] Bible en un an
type: chronological
---

# [de] Altes Testament in chronologischer Reihenfolge | [en] Old Testament Chronologically
01-39 (/6M)

# [de] Neues Testament in chronologischer Reihenfolge | [en] New Testament Chronologically
40-66 (/6M)
```

**Renderiert als:** Daily readings - jeder Tag bekommt auto-dividierte Verse

**Wie Auto-Divide funktioniert:**
- `/1Y` = 365 Tage → 01-66 ÷ 365 = ~31 Verse pro Tag
- `/1M` = 30 Tage → 01-66 ÷ 30 = ~67 Verse pro Tag
- `/7D` = 7 Tage → 01-66 ÷ 7 = ~188 Verse pro Tag

---

## 3b. **Chronological OHNE Zeit** (Neu!)

### 📝 Beispiel: Schöpfung bis Exil (Freies Tempo)

```yaml
---
id: chron_creation_to_exile
name: [de] Schöpfung bis Exil (Chronologisch) | [en] Creation to Exile (Chronologically) | [es] Creación al Exilio | [it] Creazione all'Esilio | [fr] Création à l'Exil
type: chronological
---

# [de] Anfang der Welt | [en] Beginning of the World

## [de] Schöpfung bis Flut | [en] Creation to Flood
01:1-11

## [de] Nach der Flut | [en] After the Flood
01:12-17

# [de] Patriarchenzeit | [en] Patriarchal Age

## [de] Abraham bis Josef | [en] Abraham to Joseph
01:18-50

## [de] Hiob (Parallele Zeit) | [en] Job (Parallel Period)
18

# [de] Exodus und Sinai | [en] Exodus and Sinai
02-03

# [de] Königreich David | [en] Kingdom of David
09-12

## [de] Davids Psalmen | [en] David's Psalms
19
```

**Renderiert als:** Kapitel-Gruppen in chronologischer Reihenfolge, Nutzer wählt, wie schnell er liest

---

## 📊 Vergleich-Tabelle

| Feature | Category | Thematic | Chronological |
|---------|----------|----------|---|
| **Book-Ranges** (`01-39`) | ✅ | ❌ | ✅ |
| **Spezifische Verse** (`01:1:1-5`) | ❌ | ✅ | ✅ |
| **Subsektionen** (`##`) | ❌ | ✅ | ✅ |
| **Zeit-Direktiven** (`/1Y`) | ❌ | ❌ | ✅ (optional!) |
| **Auto-Divide** | ❌ | ❌ | ✅ (bei Zeit-Direktive) |
| **Freies Tempo** | ✅ | ✅ | ✅ (ohne Zeit) |

---

## 🎯 Entscheidungshilfe

**Frag dich:**

1. **Willst du Bücher oder spezifische Verse?**
   - Bücher → Category oder Chronological
   - Spezifische Verse → Thematic oder Chronological

2. **Brauchst du Subsektionen/Gruppierungen?**
   - Ja → Thematic oder Chronological (jeweils mit `##`)
   - Nein → Category

3. **Willst du biblisch chronologische Reihenfolge?**
   - Ja → **Chronological** (mit oder ohne Zeit!)
   - Nein → Category oder Thematic

4. **Brauchst du festgelegtes Tempo (z.B. "Bibel in 1 Jahr")?**
   - Ja → Chronological mit `/1Y`
   - Nein → Chronological ohne Zeit (Nutzer liest frei)

---

## ✨ Dein Plan: Schöpfung bis Exodus (Chronologisch, frei)

**Anforderung:** Chronologische Reihenfolge, kein festes Tempo, mit Subsektionen

**Beste Lösung: `type: chronological` (ohne Zeit!)**

```yaml
---
id: chron_creation_to_exodus
name: [de] Schöpfung bis Exodus | [en] Creation to Exodus | [es] Creación al Éxodo | [it] Creazione all'Esodo | [fr] Création à l'Exode
type: chronological
---

# [de] Antike Welt | [en] Ancient World

## [de] Schöpfung bis Flut | [en] Creation to Flood
01:1-11

# [de] Patriarchen | [en] Patriarchs

## [de] Abraham bis Josef | [en] Abraham to Joseph
01:12-50

# [de] Exodus | [en] Exodus
02
```

**Das funktioniert jetzt nativ!** 🚀
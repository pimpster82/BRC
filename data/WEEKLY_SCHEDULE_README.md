# Weekly Reading Schedule - System Documentation

## 📁 Dateien-Struktur

```
data/
├── weekly-reading-schedule.js          # Haupt-Loader (importiert alle Jahre)
├── weekly-reading-schedule-2026.js     # Daten für 2026
├── weekly-reading-schedule-2027.js     # Daten für 2027 (wenn verfügbar)
└── WEEKLY_SCHEDULE_README.md           # Diese Datei
```

## 🔄 Wie das System funktioniert

### 1. **Jahr-spezifische Dateien** (`weekly-reading-schedule-YEAR.js`)
Jedes Jahr hat seine eigene Datei mit allen 52 Wochen:

```javascript
// weekly-reading-schedule-2026.js
export const weeklyReadingSchedule2026 = [
  { weekStart: '2026-01-05', weekEnd: '2026-01-11', reading: 'Isaiah 17-20', ... },
  { weekStart: '2026-01-12', weekEnd: '2026-01-18', reading: 'Isaiah 21-23', ... },
  ...
]
```

### 2. **Haupt-Loader** (`weekly-reading-schedule.js`)
Importiert alle verfügbaren Jahre und bietet Funktionen zum Zugriff:

```javascript
import { weeklyReadingSchedule2026 } from './weekly-reading-schedule-2026.js'

const allSchedules = {
  2026: weeklyReadingSchedule2026,
  // Weitere Jahre hier hinzufügen
}
```

## ✅ Neues Jahr hinzufügen

### Schritt 1: Datei von WOL herunterladen

1. Gehe zu **Einstellungen** → **"Leseplan aktualisieren"**
2. Wähle das Jahr (z.B. 2027)
3. Klicke auf **"Leseplan herunterladen"**
4. Speichere die Datei als `data/weekly-reading-schedule-2027.js`

### Schritt 2: In Haupt-Loader registrieren

Öffne `data/weekly-reading-schedule.js` und füge hinzu:

```javascript
// 1. Import hinzufügen (Zeile ~5)
import { weeklyReadingSchedule2027 } from './weekly-reading-schedule-2027.js'

// 2. Zum Registry hinzufügen (Zeile ~12)
const allSchedules = {
  2026: weeklyReadingSchedule2026,
  2027: weeklyReadingSchedule2027,  // ← NEU
}

// 3. Export hinzufügen (Zeile ~155)
export { weeklyReadingSchedule2026, weeklyReadingSchedule2027 }
```

### Schritt 3: Fertig! ✓

Die App verwendet jetzt automatisch das neue Jahr, wenn das Datum erreicht wird.

## 🎯 Vorteile dieses Systems

### ✅ **Einfache Updates**
- Download über die App
- Nur 3 Zeilen Code hinzufügen
- Keine Duplikation

### ✅ **Automatische Jahr-Erkennung**
- App wählt automatisch das richtige Jahr basierend auf aktuellem Datum
- Funktioniert auch bei Jahresübergängen (Dezember → Januar)

### ✅ **Saubere Struktur**
- Jedes Jahr = eine Datei
- Zentrale Verwaltung im Loader
- Keine hartcodierten Daten im Code

### ✅ **Zukunftssicher**
- Vorbereitet für beliebig viele Jahre
- Alte Jahre bleiben verfügbar (für Statistiken/Verlauf)

## 📖 Verwendung in Components

```javascript
import { getCurrentWeekReading, getScheduleForYear } from '../data/weekly-reading-schedule.js'

// Aktuelles Lesen für Dienstag-Versammlung
const currentWeek = getCurrentWeekReading(2)  // 2 = Dienstag

// Alle Wochen für ein bestimmtes Jahr
const schedule2027 = getScheduleForYear(2027)

// Verfügbare Jahre prüfen
import { getAvailableYears, isYearAvailable } from '../data/weekly-reading-schedule.js'

const years = getAvailableYears()  // [2026, 2027, 2028]
const has2027 = isYearAvailable(2027)  // true
```

## 🔧 Wartung

### Alte Jahre entfernen (optional)

Wenn du alte Jahre nicht mehr brauchst (z.B. 2026 im Jahr 2030):

1. Lösche die Datei `weekly-reading-schedule-2026.js`
2. Entferne die 3 Zeilen aus `weekly-reading-schedule.js`:
   - Import
   - Registry-Eintrag
   - Export

### Fehlersuche

**Problem:** "No schedule available for year 2027"

**Lösung:**
1. Prüfe ob `weekly-reading-schedule-2027.js` existiert
2. Prüfe ob der Import in `weekly-reading-schedule.js` vorhanden ist
3. Prüfe ob der Registry-Eintrag vorhanden ist

## 📝 Dateiformat

Jede Jahr-Datei muss diesem Format folgen:

```javascript
export const weeklyReadingScheduleYEAR = [
  {
    weekStart: 'YYYY-MM-DD',    // ISO date
    weekEnd: 'YYYY-MM-DD',      // ISO date
    reading: 'Book X-Y',        // String
    book: 'BookName',           // String or null (Memorial Week)
    chapters: [X, Y, Z],        // Array of numbers
    year: YEAR,                 // Number
    month: M                    // Number (1-12)
  },
  ...
]
```

## 🎓 Best Practices

1. ✅ **Verwende die Settings-Funktion** zum Download (statt manuell zu erstellen)
2. ✅ **Lade neue Jahre VOR Jahresende** herunter (z.B. 2027 im November 2026)
3. ✅ **Behalte mindestens 2 Jahre** (aktuelles + nächstes Jahr)
4. ✅ **Teste nach dem Hinzufügen** eines neuen Jahres

## 💡 Häufige Fragen

**Q: Kann ich mehrere Jahre gleichzeitig haben?**
A: Ja! Das System unterstützt beliebig viele Jahre.

**Q: Was passiert am Jahresübergang?**
A: Die App sucht automatisch im nächsten Jahr, wenn das aktuelle Jahr endet.

**Q: Muss ich alte Jahre löschen?**
A: Nein, sie können für Statistiken/Verlauf nützlich sein.

**Q: Kann ich die Daten manuell bearbeiten?**
A: Ja, aber verwende besser die Download-Funktion für Genauigkeit.

## 🔗 Links

- WOL Leseplan 2026: https://wol.jw.org/en/wol/d/r1/lp-e/1102026214
- WOL Leseplan 2027: https://wol.jw.org/en/wol/d/r1/lp-e/1102027214
- WOL Leseplan YEAR: https://wol.jw.org/en/wol/d/r1/lp-e/110YEAR214

---

**Erstellt:** Dezember 2025
**Letztes Update:** Dezember 2025

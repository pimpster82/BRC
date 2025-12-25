# Bible Reading Companion - UI/UX Konzept

## 📱 Navigation & Struktur

### Haupt-Navigation: Swipe-basiert (3 Screens)

```
┌─────────────────────────────────────┐
│  ←  [HEUTE] → [WOCHE] → [PBP]       │
└─────────────────────────────────────┘

Screen 1: HEUTE (Landing Page)
Screen 2: WÖCHENTLICHES PROGRAMM  
Screen 3: PERSÖNLICHES PROGRAMM (PBP)
```

**Navigation:**
- Swipe links/rechts zum Wechseln
- Oder: Direkte Links/Tabs oben
- Landing Page = Standard beim Öffnen

---

## 🏠 SCREEN 1: HEUTE (Landing Page)

### Zweck
Schneller Überblick: "Was steht heute an?"

### Layout
```
┌─────────────────────────────────────┐
│ 📅 HEUTE - Freitag, 28. November    │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ☀️ TAGESTEXT                    │ │
│ │                                 │ │
│ │ "Let the peace of God..."       │ │
│ │ — Philippians 4:7               │ │
│ │                                 │ │
│ │ ✓ Gelesen | [📖 Öffnen]         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📅 WÖCHENTLICHES LESEN          │ │
│ │                                 │ │
│ │ Diese Woche: Jesaja 2-4         │ │
│ │ ██████░░░░ 2 von 3 Kapiteln     │ │
│ │                                 │ │
│ │ ✓ Kap 2  ✓ Kap 3  ○ Kap 4      │ │
│ │                                 │ │
│ │ [→ Zum Wochenprogramm]          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📖 PERSÖNLICHES LESEN (PBP)     │ │
│ │                                 │ │
│ │ Plan: Bibel in 1 Jahr           │ │
│ │ Tag 45 von 365                  │ │
│ │                                 │ │
│ │ 💡 Als nächstes:                │ │
│ │ Genesis 20-22                   │ │
│ │                                 │ │
│ │ [📱 Jetzt lesen]                │ │
│ │ [→ Zu meinem Programm]          │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Funktionen
- **Tagestext:** Direkt von hier aus öffnen (Link zu wol.jw.org)
- **Wochenprogramm:** Kurz-Übersicht + Link zur Detail-Ansicht
- **PBP:** "Was als nächstes?" + Links zum Lesen & Detail-Ansicht

### Interaktion
- Tagestext-Karte: Click öffnet Link
- Wochenprogramm: Click auf Karte → zu Screen 2
- PBP: Click auf Karte → zu Screen 3
- Swipe rechts → zu Screen 2

---

## 📅 SCREEN 2: WÖCHENTLICHES PROGRAMM

### Zweck
Detaillierte Ansicht der wöchentlichen Lesung mit Kapitel-für-Kapitel Tracking

### Layout
```
┌─────────────────────────────────────┐
│ [←HEUTE]  WOCHE  [PBP→]             │
│                                     │
│ 📅 Wöchentliche Lesung              │
│ Für Versammlung: Dienstag, 3. Dez   │
│                                     │
│ ╔═══════════════════════════════╗   │
│ ║  JESAJA 2-4                   ║   │
│ ╚═══════════════════════════════╝   │
│                                     │
│ Kapitel-Übersicht:                  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ✓ Kapitel 2                     │ │
│ │   Gelesen am 26. Nov            │ │
│ │   [📖 Nochmal öffnen]           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ✓ Kapitel 3                     │ │
│ │   Gelesen am 27. Nov            │ │
│ │   [📖 Nochmal öffnen]           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ◐ Kapitel 4 (Teilweise)         │ │
│ │   Gelesen bis Vers 15           │ │
│ │   [📱 Weiterlesen ab 4:16]      │ │
│ │   [✓ Als gelesen markieren]     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📊 STATISTIK                    │ │
│ │ Streak: 🔥 12 Wochen            │ │
│ │ Dieses Jahr: 45 von 52 Wochen   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Kapitel-Status (Farbcodierung)
- ✓ **Grün** - Komplett gelesen
- ◐ **Gelb** - Teilweise gelesen (zeigt bis welchem Vers)
- ○ **Grau** - Noch nicht gelesen

### Interaktion
- **Click auf Kapitel:** Öffnet Link zu JW.org/JW Library
- **Nach dem Öffnen:** Option zum Markieren
  - "Komplett gelesen"
  - "Teilweise gelesen bis Vers X"
  - "Noch nicht fertig"
- **Teilweise gelesen:** Zeigt "Weiterlesen ab X:Y" Button

### Statistiken
- Wochenstreak (wie viele Wochen in Folge gelesen)
- Jahresübersicht (X von 52 Wochen)
- Optinal später: Mehr Details

---

## 📖 SCREEN 3: PERSÖNLICHES PROGRAMM (PBP)

### Zweck
Zeigt das persönliche Leseprogramm - **Layout variiert je nach gewähltem Plan**

### Wichtige Prinzipien
1. **Focus auf "Was kommt als nächstes?"**
2. **Plan-abhängiges Layout**
3. **Nicht an den Tag gebunden** (verzögerte Lesungen sichtbar)
4. **Vorausschauen möglich** (voraus lesen erlaubt)

---

### Layout A: Plan "Bibel in 1 Jahr"

```
┌─────────────────────────────────────┐
│ [←WOCHE]  PBP                       │
│                                     │
│ 📖 Bibel in 1 Jahr                  │
│ Start: 1. Januar 2025               │
│                                     │
│ Fortschritt: ████████░░░ 347/1.189  │
│ Tag 45 von 365 (29%)                │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ⚠️ NICHT GELESEN (Gestern)      │ │
│ │ Tag 44: Genesis 18-19           │ │
│ │ [📱 Jetzt nachholen]            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 💡 HEUTE (Tag 45)               │ │
│ │ Genesis 20-22                   │ │
│ │                                 │ │
│ │ ○ Kapitel 20                    │ │
│ │ ○ Kapitel 21                    │ │
│ │ ○ Kapitel 22                    │ │
│ │                                 │ │
│ │ [📱 Jetzt lesen]                │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📅 MORGEN (Tag 46)              │ │
│ │ Genesis 23-25                   │ │
│ │ [👁 Vorschau]                   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [📊 Detaillierter Fortschritt]      │
│ [⚙️ Plan ändern]                    │
└─────────────────────────────────────┘
```

**Besonderheiten:**
- Zeigt **verpasste Tage** (gestern, vorgestern, etc.)
- **Heutiges Programm** prominent
- **Morgen** als Vorschau (kann auch schon heute gelesen werden)
- "Weiterlättern" möglich → zeigt Tag 47, 48, etc.
- **Status-Tracking:** Pro Kapitel markierbar

---

### Layout B: Plan "Freies Lesen" (Bible Tree)

```
┌─────────────────────────────────────┐
│ [←WOCHE]  PBP                       │
│                                     │
│ 📖 Freies Lesen                     │
│                                     │
│ Fortschritt: ████░░░░░ 347/1.189    │
│ (29% der Bibel gelesen)             │
│                                     │
│ 💡 Du bist zuletzt bei:             │
│ Genesis 15:11                       │
│ [📱 Hier weiterlesen]               │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ 📚 BIBELÜBERSICHT                   │
│                                     │
│ ▼ 📖 Genesis (✓ 15/50)              │
│   ├─ ✓ Kapitel 1                   │
│   ├─ ✓ Kapitel 2                   │
│   ├─ ... (11 weitere gelesen)      │
│   ├─ ◐ Kapitel 15 (bis Vers 10)    │
│   ├─ ○ Kapitel 16                  │
│   └─ ○ ... (34 weitere)            │
│                                     │
│ ▶ 📖 Exodus (✓ 12/40)               │
│ ▶ 📖 Levitikus (○ 0/27)             │
│ ▶ 📖 Numeri (○ 0/36)                │
│ ...                                 │
│                                     │
│ ▼ 📖 Matthäus (✓ 28/28) ⭐         │
│   ├─ ✓ Alle Kapitel gelesen        │
│                                     │
│ ▶ 📖 Markus (○ 0/16)                │
│ ...                                 │
└─────────────────────────────────────┘
```

**Besonderheiten:**
- **Baumstruktur** (collapsible/expandable)
- **Letzte Position** oben hervorgehoben
- Click auf Buch → Buch expandiert, zeigt Kapitel
- Click auf Kapitel → Öffnet Link
- **Farbcodierung:**
  - ✓ Grün = Gelesen
  - ◐ Gelb = Teilweise
  - ○ Grau = Noch nicht
- **Animiert:** Smooth expand/collapse
- **Sternchen ⭐** bei komplett gelesenen Büchern

---

### Layout C: Plan "Chronologisch" oder "Thematisch"

```
┌─────────────────────────────────────┐
│ [←WOCHE]  PBP                       │
│                                     │
│ 📖 Chronologischer Plan             │
│ Ereignisse in historischer Reihenfolge│
│                                     │
│ Fortschritt: ████░░░░░ 120/365 Tage │
│                                     │
│ 💡 Als nächstes:                    │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📜 Abschnitt 5: Abraham         │ │
│ │                                 │ │
│ │ Texte:                          │ │
│ │ • Genesis 12-14   [○ Lesen]    │ │
│ │ • Genesis 15-17   [○ Lesen]    │ │
│ │ • Genesis 18-20   [○ Lesen]    │ │
│ │                                 │ │
│ │ Fortschritt: ░░░░░░░░░░ 0/3     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ✓ Abgeschlossene Abschnitte:        │
│                                     │
│ ✓ Abschnitt 1: Schöpfung            │
│ ✓ Abschnitt 2: Sintflut             │
│ ✓ Abschnitt 3: Turmbau zu Babel     │
│ ✓ Abschnitt 4: Hiob                 │
│                                     │
│ [📋 Alle Abschnitte anzeigen]       │
└─────────────────────────────────────┘
```

**Besonderheiten:**
- **Abschnitts-basiert** (nicht Tage)
- Jeder Abschnitt = Thema/Ereignis
- Mehrere Texte pro Abschnitt
- Click auf Text → Öffnet Link
- Abschnitt fertig → Zum nächsten
- **Farbcodierung** pro Abschnitt

---

## 🎨 Allgemeine Design-Prinzipien

### Farbsystem (Status)
```
✓ Grün     - Komplett gelesen
◐ Gelb     - Teilweise gelesen  
○ Grau     - Noch nicht gelesen
⚠️ Orange   - Verzögert/überfällig
💡 Blau     - "Als nächstes" / Aktuell
⭐ Gold     - Komplett/Achievement
```

### Typografie
- **Große, lesbare Schrift** für Bibeltexte
- **Icons** für schnelle Orientierung
- **Klare Hierarchie** (Titel > Untertitel > Details)

### Interaktion
- **Große Touch-Targets** (mobile-friendly)
- **Swipe** für Navigation zwischen Screens
- **Pull-to-Refresh** für Tagestext-Update
- **Smooth Animations** beim Wechseln

### Tracking-Mechanismus
Nach dem Öffnen eines Links:
```
┌─────────────────────────────────────┐
│ Du hast gerade geöffnet:            │
│ Genesis 20                          │
│                                     │
│ Hast du das Kapitel gelesen?        │
│                                     │
│ [✓ Komplett gelesen]                │
│ [◐ Teilweise (bis Vers...)]         │
│ [⏰ Später]                          │
└─────────────────────────────────────┘
```

Oder alternativ:
- **Automatisch als "teilweise" markieren** beim Öffnen
- Nutzer muss manuell "komplett" markieren
- Option in Einstellungen wählbar

---

## 🔧 Technische Details

### Responsive Design
- **Mobile First** (primär für Smartphones)
- Tablet: Nutzt mehr Platz (Side-by-Side Ansichten möglich)
- Desktop: Nutzt Breite für zusätzliche Infos

### Performance
- **Lazy Loading** für Bible Tree (nur sichtbare Bücher laden)
- **Smooth Scrolling**
- **Fast Transitions** zwischen Screens

### Offline
- Alle gelesenen Kapitel offline verfügbar
- Links funktionieren nur online (JW.org)
- Tracking funktioniert offline, synct später

---

## 📋 Offene Fragen zum Klären

### 1. Teilkapitel-Eingabe: SMART TEXT PARSING ✅

**Prinzip:** Nutzer gibt Text ein, App erkennt intelligent was gemeint ist

**Beispiele - Alles sollte funktionieren:**
```
Genesis 1:1-3:12
gen1-3:12
gen 1-3:12
Gen. 1; 2; 3:1-12
genesis 1,2,3:1-12
Gen 1-3:12
GEN 1:1 - 3:12
```

**Parsing-Regeln:**
- **Case-insensitive** (Genesis = GENESIS = genesis)
- **Abkürzungen erlaubt** (Gen = Genesis, Matt = Matthew, Ps = Psalm)
- **Flexible Trennzeichen:**
  - Minus/Dash: `-` (Bereich)
  - Komma: `,` (Liste)
  - Semikolon: `;` (Liste)
  - Doppelpunkt: `:` (Verse)
- **Leerzeichen optional**
- **Punkt nach Abkürzung optional** (Gen. = Gen)

**Erkennungslogik:**
1. Buch erkennen (Name oder Abkürzung)
2. Kapitel extrahieren (Zahlen vor erstem Doppelpunkt)
3. Verse extrahieren (Zahlen nach Doppelpunkt)
4. Bereiche vs. Listen unterscheiden

**Fehlertoleranz:**
- Wenn unklar → Nachfragen
- "Meintest du: Genesis 1-3:12?"
- Vorschläge bei unklaren Abkürzungen

**Technisch:**
- RegEx-basiert
- Abkürzungs-Dictionary (Gen → Genesis, Matt → Matthew, etc.)
- Parser validiert gegen Bible Books Database

### 2. "Verzug" und "Voraus lesen" - Nur bei zeitbasierten Plänen ✅

**Gilt für:**
- Bibel in 1 Jahr
- Bibel in 6 Monaten
- Chronologisch mit Zeitrahmen

**Gilt NICHT für:**
- Freies Lesen
- Buch für Buch (ohne Zeitrahmen)

**Konzept:**
```
Plan: Bibel in 1 Jahr, Start 1. Jan
Heute: 15. Februar (Tag 46)

Status-Berechnung:
- Sollte bei: Tag 46 (Genesis 20-22)
- Tatsächlich bei: Tag 44 (Genesis 18-19)
- Verzug: 2 Tage

Anzeige:
⚠️ 2 Tage im Verzug
💡 Heute solltest du lesen: Genesis 20-22
📚 Nachzuholen: Genesis 18-19 (Tag 44), Genesis 20-22 (Tag 45)
```

**Optionen für Nutzer:**
- "Verzug aufholen" (zeigt alle verpassten Tage)
- "Bei heute weitermachen" (überspringt Verzug)
- "Plan neu starten"

**Status: Später verfeinern, jetzt nur dokumentieren**

---

### 3. Statistiken - Im Hintergrund tracken ✅

**Wichtig jetzt:** Daten sammeln, Visualisierung später

**Was tracken:**

#### Allgemein (alle Systeme):
- Gesamtkapitel gelesen (X von 1.189)
- Prozent der Bibel (%)
- Gelesene Bücher (komplett)

#### Pro Bibelbuch:
- Kapitel gelesen (X von Y)
- Prozent des Buches (%)
- Wann angefangen / beendet

#### Altes vs. Neues Testament:
- AT: X von 929 Kapiteln
- NT: X von 260 Kapiteln

#### Zeitbasierte Pläne:
- Tage im Plan (Tag X von Y)
- Fortschritt vs. Soll (voraus/im Verzug)
- Geschätzte Fertigstellung

#### Chronologischer Plan:
- "Stream of Time" - Wo in der Geschichte
- Welche Epoche (z.B. "Patriarchen", "Richterzeit", "Königreich", etc.)
- Prozent der Geschichte

#### Streaks:
- Tagestext: Aktuelle Serie, längste Serie
- Wochenprogramm: Aktuelle Serie, längste Serie
- PBP: Tage in Folge gelesen

#### Leseverhalten:
- Durchschnitt Kapitel/Tag
- Meist gelesene Zeit (Morgen/Abend)
- Meist gelesenes Buch

**Datenstruktur:**
```javascript
statistics: {
  overall: {
    totalChapters: 347,
    totalBooks: 1189,
    percentComplete: 29.2,
    booksCompleted: ['Genesis', 'Exodus', ...]
  },
  
  byBook: {
    'Genesis': { chaptersRead: 50, total: 50, percent: 100, startDate: '2025-01-01', endDate: '2025-01-15' },
    'Exodus': { chaptersRead: 23, total: 40, percent: 57.5, startDate: '2025-01-16', endDate: null }
  },
  
  testament: {
    oldTestament: { read: 280, total: 929, percent: 30.1 },
    newTestament: { read: 67, total: 260, percent: 25.8 }
  },
  
  streaks: {
    dailyText: { current: 15, longest: 45 },
    weeklyReading: { current: 12, longest: 28 },
    personalReading: { current: 8, longest: 34 }
  },
  
  chronologicalPosition: {
    epoch: 'Patriarchs',
    percentThroughHistory: 15.3
  }
}
```

**Status: Daten sammeln ab Tag 1, Visualisierung kommt später**

### 4. Einstellungen-Zugang ✅

**Zugriff:**
- **Option A:** Hamburger-Menu links oben (☰ drei Linien)
- **Option B:** 3-Punkte-Menu rechts oben (⋮)
- **Option C:** Rechts-Swipe von Landing Page

**Empfehlung:** Hamburger-Menu links oben (☰) + auch via Rechts-Swipe

**Einstellungen-Screen Layout:**
```
┌─────────────────────────────────────┐
│ ☰  EINSTELLUNGEN               [×]  │
├─────────────────────────────────────┤
│                                     │
│ ═══ SYSTEM ═══                      │
│                                     │
│ 🌐 Sprache                          │
│    → English                    [>] │
│                                     │
│ 🔔 Benachrichtigungen               │
│    ☑ Push-Benachrichtigungen        │
│    ☑ Erinnerungen                   │
│                                     │
│ 🎨 Darstellung                      │
│    ○ Hell  ● Dunkel  ○ Auto     │
│                                     │
│ 💾 Daten                            │
│    [Daten exportieren]              │
│    [Daten importieren]              │
│    [Zurücksetzen]                   │
│                                     │
│ ═══ TAGESTEXT ═══                   │
│                                     │
│ ☑ Tagestext aktiviert               │
│ ⏰ Erinnerung: 07:00            [>] │
│                                     │
│ ═══ WÖCHENTLICHES LESEN ═══         │
│                                     │
│ ☑ Wochenprogramm aktiviert          │
│ 📅 Versammlungstag: Dienstag    [>] │
│ 📆 Wochenstart: Mittwoch        [>] │
│ ⏰ Erinnerung: 20:00            [>] │
│                                     │
│ ═══ PERSÖNLICHES LESEN (PBP) ═══    │
│                                     │
│ ☑ PBP aktiviert                     │
│                                     │
│ 📖 Aktiver Plan:                    │
│    Bibel in 1 Jahr              [>] │
│    [Plan ändern]                    │
│                                     │
│ 📚 Alle meine Pläne:                │
│ • Bibel in 1 Jahr (Aktiv)       [>] │
│ • Freies Lesen                  [>] │
│                                     │
│ [+ Neuen Plan hinzufügen]           │
│                                     │
│ ⏰ Erinnerung: 06:00            [>] │
│                                     │
│ ═══ ÜBER ═══                        │
│                                     │
│ ℹ️ Version 1.0.0                    │
│ 📧 Feedback senden                  │
│ 📄 Datenschutz                      │
│                                     │
└─────────────────────────────────────┘
```

**Design-Prinzipien:**
- **Visuell klar getrennt** durch Abschnitte (═══)
- **Icons** für schnelle Orientierung
- **Hierarchisch:** System → Einzelne Programme
- **Toggle-Switches** (☑) für Ein/Aus
- **Pfeile [>]** für Untermenüs
- **Große Touch-Targets**

**Mehrere Pläne gleichzeitig (Future):**
```
📚 Alle meine Pläne:
• Bibel in 1 Jahr (Aktiv) ⭐
  Start: 1. Jan 2025
  Fortschritt: 29%
  
• Freies Lesen
  Fortschritt: 347/1.189 Kapitel
  
• Chronologisch (Pausiert)
  Fortschritt: 15% der Geschichte
  
[+ Neuen Plan hinzufügen]
```

**Status: Klar strukturiert, später erweiterbar**

---

### 5. Bible Tree Animation

**Konzept:** Smooth, aber nicht übertrieben
- Expand/Collapse mit Ease-Transition (0.3s)
- Scroll-to bei "Du bist bei..." mit Highlight-Effekt
- Lazy Loading (nur sichtbare Bücher laden)

**Status: Standard-Animationen, nichts Aufwendiges**

---

## ✅ Zusammenfassung - Was geklärt ist:

1. ✅ **Smart Text Parsing** - Flexible Bibel-Eingabe
2. ✅ **Verzug** - Nur bei zeitbasierten Plänen, später verfeinern
3. ✅ **Statistiken** - Im Hintergrund tracken, Visualisierung später
4. ✅ **Einstellungen** - Hamburger-Menu, klar strukturiert
5. ✅ **Animationen** - Standard, nicht übertrieben

## 🚀 Bereit für die Entwicklung?

Alle wichtigen UI/UX Entscheidungen sind getroffen!
Nächster Schritt: Technische Planung & Entwicklung starten

# Bible Reading Companion - Ziele & Anforderungen (v2)

## 📖 Projektziel

Eine Web-Anwendung die Jehovas Zeugen hilft, ihr tägliches Bibellesen zu organisieren und ihren Fortschritt zu verfolgen. Die App integriert sich nahtlos mit JW.org und der JW Library App.

---

## 📚 Hintergrund: Die jährliche "Tagestext"-Broschüre

### Was ist die Tagestext-Broschüre?
**Offizieller Titel:** "Täglich in den Schriften forschen" (Englisch: "Examining the Scriptures Daily")
- Jährliche Publikation von Jehovas Zeugen
- Neue Ausgabe jedes Jahr (2025, 2026, etc.)
- Verfügbar als gedruckte Broschüre und online

### Was enthält die Broschüre?
1. **Jahrestext** - Das Motto für das Jahr mit Kommentar
   - Beispiel 2025: "Give Jehovah the glory due his name." - Psalm 96:8

2. **Tagestext** - Für jeden Tag des Jahres (365 Einträge)
   - Ein Bibelvers
   - Ein kurzer Kommentar/Gedanke dazu
   - Online: https://wol.jw.org/en/wol/dt/r1/lp-e (aktualisiert sich täglich)

3. **Wöchentliches Bibelleseprogramm** - Jahresübersicht
   - Welche Kapitel jede Woche zu lesen sind
   - Für die wöchentliche Zusammenkunft
   - Online 2025: https://wol.jw.org/en/wol/d/r1/lp-e/1102025214
   - Online 2026: https://wol.jw.org/en/wol/d/r1/lp-e/1102026214

4. **Memorial Reading Program** - Spezielles Leseprogramm
   - Aktiviert ca. 2 Wochen vor dem Gedächtnismahl
   - Bereitet auf die Feier zum Gedenken an Jesu Tod vor

---

## 🎯 Die drei Hauptfunktionen der App

Die App hilft beim Tracking von drei **unabhängigen** Lesesystemen:

### 1. Tagestext (Täglich) ☀️
**Quelle:** Die tägliche Andacht aus der Broschüre
**Tracking:** Wurde heute gelesen? Ja/Nein

### 2. Wöchentliches Bibellesen (Wöchentlich) 📅
**Quelle:** Das offizielle wöchentliche Leseprogramm aus der Broschüre
**Tracking:** Wurde diese Woche gelesen? Ja/Nein

### 3. Persönliches Bibellesen (Individuell) 📖
**Quelle:** Eigener Leseplan des Nutzers
**Tracking:** Welche Kapitel wurden gelesen? (detailliert)

---

## 📋 SYSTEM 1: Tagestext

### Zweck
Tägliche geistige Nahrung durch den Bibelvers und Kommentar des Tages.

### Funktion
- Zeigt den aktuellen Tagestext (Vers + Kommentar-Vorschau)
- Aktualisiert sich automatisch um Mitternacht
- Link öffnet vollständigen Text auf wol.jw.org
- Einfaches Tracking: "Gelesen" oder "Nicht gelesen"

### Beispiel-Anzeige
```
┌─────────────────────────────────────┐
│ ☀️ TAGESTEXT                        │
│ Freitag, 28. November 2025          │
│                                     │
│ "Let the peace of God guard your   │
│  hearts..."                         │
│ — Philippians 4:7                  │
│                                     │
│ [Kommentar-Vorschau (erste Zeilen)]│
│                                     │
│ [📖 Vollständig lesen]              │
│ [ ] Als gelesen markieren          │
│                                     │
│ Streak: 🔥 15 Tage                 │
└─────────────────────────────────────┘
```

### Tracking-Daten
```javascript
dailyText: {
  completedDates: ['2025-11-27', '2025-11-26', ...],
  currentStreak: 15,
  longestStreak: 45
}
```

### Benutzeroptionen
- Ein/Ausschalten
- Erinnerung festlegen (z.B. "Jeden Tag um 07:00")
- Sprache wählen

### Statistiken
- Aktuelle Serie (Streak)
- Längste Serie
- Anzahl gelesener Tage diesen Monat/Jahr

---

## 📋 SYSTEM 2: Wöchentliches Bibellesen

### Zweck
Vorbereitung auf die wöchentliche Zusammenkunft durch das offizielle Bibelleseprogramm.

### Funktion
- Zeigt die wöchentliche Leseaufgabe aus dem Jahresplan
- Beispiel: "24.-30. November 2025: Jesaja 1-2"
- Link öffnet die Kapitel in JW.org/JW Library
- Einfaches Tracking: "Gelesen" oder "Nicht gelesen" (pro Woche)

### Besonderheit: Anpassung an Versammlungstag

**Problem:** Die offizielle Woche ist Montag-Sonntag, aber Versammlungen sind an verschiedenen Tagen.

**Lösung:** Der Nutzer konfiguriert:
1. **Versammlungstag** (z.B. Dienstag)
2. **Wochenstart** (z.B. Mittwoch = Tag nach Versammlung)

#### Beispiele für Wochenstart:

**Wochenstart = Mittwoch** (Tag nach Dienstags-Versammlung)
```
Offizielle Woche: Mo 24. Nov - So 30. Nov (Jesaja 1-2)
Deine Lesewoche:  Mi 27. Nov - Di 3. Dez
Für Versammlung:  Dienstag, 3. Dezember
```

**Wochenstart = Montag** (Traditionell, folgt offiziellem Plan)
```
Offizielle Woche: Mo 24. Nov - So 30. Nov (Jesaja 1-2)
Deine Lesewoche:  Mo 24. Nov - So 30. Nov
```

**Wochenstart = Sonntag**
```
Offizielle Woche: Mo 24. Nov - So 30. Nov (Jesaja 1-2)
Deine Lesewoche:  So 23. Nov - Sa 29. Nov
```

**Fazit:** Nutzer wählt einfach seinen Wochenstart-Tag, App berechnet automatisch welche Lesung angezeigt wird.

### Beispiel-Anzeige
```
┌─────────────────────────────────────┐
│ 📅 WÖCHENTLICHES BIBELLESEN         │
│                                     │
│ Für Versammlung: Dienstag, 3. Dez   │
│ Deine Lesewoche: Mi 27.Nov - Di 3.Dez│
│                                     │
│ JESAJA 3-5                          │
│ (Kapitel 3, 4, 5)                  │
│                                     │
│ [📱 Kapitel öffnen]                 │
│ [ ] Als gelesen markieren          │
│                                     │
│ Offizielle Woche: 1.-7. Dezember   │
└─────────────────────────────────────┘
```

### Tracking-Daten

**Besonderheit: Vers-genaues Tracking**

Die App ermöglicht es, auch **Teile von Kapiteln** als gelesen zu markieren:

**Beispiel:**
```
Lesung: Psalm 117-119
Gelesen: Psalm 117-119:10

Ergebnis:
✓ Psalm 117 - Komplett gelesen
✓ Psalm 118 - Komplett gelesen
◐ Psalm 119 - Teilweise gelesen (bis Vers 10)

Nächstes Mal:
→ Weiter ab Psalm 119:11
```

**Datenstruktur:**
```javascript
weeklyReading: {
  meetingDay: 2,  // Dienstag
  weekStartDay: 3,  // Mittwoch (Tag nach Versammlung)
  
  completedWeeks: [
    {
      officialWeek: '2025-11-24',
      reading: 'Psalm 117-119',
      status: 'partial',
      completed: [
        { book: 'Psalm', chapter: 117, verses: 'all' },
        { book: 'Psalm', chapter: 118, verses: 'all' },
        { book: 'Psalm', chapter: 119, verses: '1-10' }
      ],
      continueFrom: { book: 'Psalm', chapter: 119, verse: 11 }
    }
  ]
}
```

**In der Anzeige:**
```
┌─────────────────────────────────────┐
│ Psalm 117-119                       │
│                                     │
│ ✓ Psalm 117 (komplett)             │
│ ✓ Psalm 118 (komplett)             │
│ ◐ Psalm 119 (bis Vers 10)          │
│                                     │
│ 💡 Weiter ab: Psalm 119:11         │
│                                     │
│ [📱 Weiterlesen ab 119:11]          │
└─────────────────────────────────────┘
```

### Benutzeroptionen
- Ein/Ausschalten
- Versammlungstag festlegen
- Wochenzyklus wählen (A/B/C oben)
- Erinnerung festlegen

### Statistiken
- Anzahl gelesener Wochen
- Aktuelle Serie

---

## 📋 SYSTEM 3: Persönliches Bibellesen

### Zweck
Die gesamte Bibel lesen und den Überblick behalten welche Kapitel bereits gelesen wurden.

### Kernkonzept
**Ziel ist IMMER: Alle 1.189 Kapitel der Bibel lesen**

Der Nutzer wählt einen **Leseplan** der bestimmt:
- In welcher **Reihenfolge** gelesen wird
- Welches **Tempo** vorgegeben ist
- Ob es einen **Zeitrahmen** gibt (z.B. "1 Jahr")

**WICHTIG:**
- Egal welcher Plan: Die App trackt alle 1.189 Kapitel
- Gelesene Kapitel bleiben markiert bei Planwechsel
- Gesamtfortschritt ist plan-unabhängig
- Nutzer sieht immer: "X von 1.189 Kapiteln gelesen"

### Beispiel-Anzeige (Hauptansicht)
```
┌─────────────────────────────────────┐
│ 📖 PERSÖNLICHES BIBELLESEN          │
│                                     │
│ Plan: Bibel in 1 Jahr               │
│ Start: 1. Januar 2025               │
│                                     │
│ Gesamtfortschritt:                  │
│ ████████░░░░░░░░░░░░ 347/1.189 (29%)│
│                                     │
│ Heute zu lesen (Tag 45):            │
│ GENESIS 20-22                       │
│                                     │
│ [📱 Kapitel öffnen]                 │
│ [ ] Kapitel 20  [ ] Kapitel 21      │
│ [ ] Kapitel 22                      │
│                                     │
│ [📊 Detaillierter Fortschritt]     │
└─────────────────────────────────────┘
```

### Tracking-Daten

**Besonderheit: Vers-genaues Tracking + "Wo geht's weiter?"**

Das PBP (Persönliches Bibellese Programm) trackt nicht nur WELCHE Kapitel gelesen wurden, sondern auch:
- **Teilweise gelesene Kapitel** (z.B. "Genesis 15:1-10")
- **Wo weitermachen** (z.B. "Weiter ab Genesis 15:11")

**Beispiel:**
```
Plan sagt: Genesis 15-17 lesen
Gelesen: Genesis 15:1-10, dann unterbrochen

Ergebnis:
◐ Genesis 15 - Teilweise (bis Vers 10)
○ Genesis 16 - Nicht gelesen
○ Genesis 17 - Nicht gelesen

Nächstes Mal:
💡 "Du bist bei Genesis 15:11 - Hier geht's weiter!"
```

**Datenstruktur:**
```javascript
personalReading: {
  currentPlan: 'bible-in-one-year',
  startDate: '2025-01-01',
  
  // Alle Kapitel mit Vers-Details
  chaptersRead: [
    { 
      book: 'Genesis', 
      chapter: 1, 
      verses: 'all',  // oder '1-15' für teilweise
      date: '2025-01-01',
      readCount: 1 
    },
    { 
      book: 'Genesis', 
      chapter: 15, 
      verses: '1-10',  // Teilweise!
      date: '2025-01-15',
      readCount: 1 
    }
  ],
  
  // "Wo bin ich?"
  currentPosition: {
    book: 'Genesis',
    chapter: 15,
    verse: 11,  // Hier weitermachen
    lastRead: '2025-01-15'
  },
  
  // Plan-Fortschritt
  planProgress: {
    currentDay: 45,
    totalDays: 365,
    todaysReading: { book: 'Genesis', chapters: [20, 21, 22] }
  },
  
  // Statistiken
  totalChaptersComplete: 347,  // Komplett gelesene Kapitel
  totalChaptersPartial: 2,     // Teilweise gelesene
  totalChapters: 1189,
  percentComplete: 29.2
}
```

**Anzeige im PBP:**
```
┌─────────────────────────────────────┐
│ 📖 PERSÖNLICHES BIBELLESEN          │
│                                     │
│ Plan: Bibel in 1 Jahr (Tag 45)      │
│                                     │
│ 💡 Du bist bei:                     │
│ Genesis 15:11                       │
│ (Zuletzt gelesen: 15. Jan)         │
│                                     │
│ Heutiges Programm (Tag 45):        │
│ Genesis 20-22                       │
│                                     │
│ [📱 Weiterlesen ab 15:11]           │
│ [📅 Zu heutigem Programm (Kap 20)] │
│                                     │
│ Fortschritt: ████░░░░░ 347/1.189    │
└─────────────────────────────────────┘
```

**Wichtige Funktionen:**
1. **"Wo bin ich?"** - Zeigt immer die letzte Position
2. **"Was steht heute am Programm?"** - Zeigt Plan-Vorgabe für heute
3. **Flexibilität** - Nutzer kann zwischen beiden wählen
4. **Teilkapitel-Tracking** - Kein Kapitel "verloren" wenn unterbrochen

---

## 📖 Persönliches Bibellesen - Lesepläne (Details)

### Zweck der verschiedenen Pläne

**Warum verschiedene Pläne?**

Die Pläne dienen als **Führung und Orientierung**:
- "Wo soll ich weiterlesen?"
- "Wie viel sollte ich heute lesen?"
- "In welcher Reihenfolge macht es Sinn?"

**ABER:** Der Nutzer behält immer den **Überblick** über:
- Was bereits gelesen wurde (alle 1.189 Kapitel)
- Wo er gerade ist
- Was noch zu lesen ist

**Die Pläne sind flexibel** - Nutzer kann:
- Dem Plan folgen
- Vom Plan abweichen
- Plan wechseln
- Eigenes Tempo wählen

---

### Plan A: Bibel in 1 Jahr
- **Reihenfolge:** Biblische Reihenfolge (Genesis → Offenbarung)
- **Tempo:** ~3-4 Kapitel pro Tag (fix)
- **Zeitrahmen:** 365 Tage
- **Start:** Nutzer wählt Startdatum
- **Tagesanzeige:** "Tag 45 von 365: Genesis 20-22"

### Plan B: Bibel in 2 Jahren
- **Reihenfolge:** Biblische Reihenfolge
- **Tempo:** ~1-2 Kapitel pro Tag (fix)
- **Zeitrahmen:** 730 Tage
- **Entspannter als Plan A**

### Plan C: Chronologisch
- **Reihenfolge:** Historische Abfolge
- **Tempo:** Nutzer wählt Dauer (1 Jahr, 2 Jahre, etc.)
- **Besonderheit:** Bücher durchmischt (z.B. Hiob vor Abraham)

### Plan D: Buch für Buch
- **Reihenfolge:** Biblische Reihenfolge
- **Tempo:** Kein Tagesziel - Nutzer liest ein Buch komplett, dann das nächste
- **Anzeige:** "Jesaja: Kapitel 23 von 66"
- **Flexibel, kein Zeitdruck**

### Plan E: Freies Lesen
- **Keine Vorgaben**
- Nutzer wählt selbst was er liest
- Markiert Kapitel manuell als gelesen
- App zeigt nur Gesamtfortschritt

---

## 🔄 Flexibilität bei persönlichem Lesen

### Planwechsel
Nutzer kann jederzeit den Plan wechseln:
```
Start: "Bibel in 1 Jahr" → 90 Tage gelesen
Wechsel zu: "Buch für Buch"
Resultat: Alle 347 gelesenen Kapitel bleiben markiert
Weiter: Mit neuem Plan und Tempo
```

### Pause und Fortsetzung
```
Nutzer folgt "Bibel in 1 Jahr"
Pausiert 2 Wochen
Optionen:
  A) Weitermachen ab heute (Plan verschiebt sich)
  B) Plan neu starten
  C) Fehlende Tage nachholen
```

### Zweiter Durchgang
```
Bibel komplett gelesen: 1.189/1.189
Option: "Neuen Durchgang starten"
Resultat: Kapitel werden "ungelesen" für Durchgang 2
Statistik: "Durchgang 2: 50 Kapitel"
```

---

## 💡 Zusätzliche Features (Später/Optional)

### Memorial Reading Program
- Aus der Tagestext-Broschüre
- Aktiviert ca. 2 Wochen vor Gedächtnismahl
- Spezielles Leseprogramm über letzte Woche von Jesu Leben
- **Status:** Später implementieren

### Jahrestext
- Das Motto des Jahres (z.B. 2025: Psalm 96:8)
- Prominent in App anzeigen
- Mit Kommentar aus Broschüre
- **Status:** Optional

---

## 🎯 Zusammenfassung: Die drei Systeme

| System | Quelle | Tracking | Ziel |
|--------|--------|----------|------|
| **Tagestext** | Tagestext-Broschüre (täglich) | Ja/Nein pro Tag | Tägliche Andacht |
| **Wöchentliches Lesen** | Tagestext-Broschüre (Jahresplan) | Ja/Nein pro Woche | Versammlungsvorbereitung |
| **Persönliches Lesen** | Eigener Plan | Pro Kapitel (1.189) | Ganze Bibel lesen |

**Alle drei sind unabhängig und können individuell ein-/ausgeschaltet werden.**

---

## 📝 Nächste Schritte

Für jedes System genau definieren:
1. Datenstruktur (welche Daten gespeichert werden)
2. Benutzeroberfläche (wie es aussieht)
3. Benutzerinteraktionen (was der Nutzer tun kann)
4. Logik (wie das Tracking funktioniert)

**Womit starten?**
- [ ] Tagestext detailliert ausarbeiten
- [ ] Wöchentliches Bibellesen detailliert ausarbeiten
- [ ] Persönliches Bibellesen detailliert ausarbeiten

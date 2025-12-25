# Bible Reading Companion - Design & Theme System

## 🎨 Theme-System - Übersicht

### Drei Theme-Ebenen (von einfach bis aufwendig)

```
Level 1: Farbschemas (Basic)
Level 2: Illustrierte Themes  
Level 3: Animierte/Interaktive Themes
```

Nutzer kann zwischen Ebenen wählen basierend auf:
- Persönlichem Geschmack
- Geräteleistung
- Batterieverbrauch

---

## 🎨 LEVEL 1: Farbschemas (Basic)

### Konzept
Einfache Farbpaletten, minimalistisch, schnell, batteriefreundlich

### Vordefinierte Farbschemas

#### 1. **Classic Light** (Standard)
```
Primary:     #3B5998 (Bibel-Blau)
Secondary:   #8B9DC3
Accent:      #DDA15E (Warm Gold)
Background:  #FFFFFF
Surface:     #F5F5F5
Text:        #2C3E50
Success:     #27AE60 (Grün - gelesen)
Warning:     #F39C12 (Orange - teilweise)
Inactive:    #BDC3C7 (Grau - nicht gelesen)
```

#### 2. **Dark Mode**
```
Primary:     #4A90E2
Secondary:   #6C8EAD
Accent:      #FFD700 (Gold)
Background:  #1A1A1A
Surface:     #2C2C2C
Text:        #E0E0E0
Success:     #2ECC71
Warning:     #F39C12
Inactive:    #4A4A4A
```

#### 3. **Serenity** (Beruhigend)
```
Primary:     #6B9080 (Salbeigrün)
Secondary:   #A4C3B2
Accent:      #CCE3DE
Background:  #F6FFF8
Surface:     #EAF4F4
Text:        #3D5A47
```

#### 4. **Warm Earth** (Natürlich)
```
Primary:     #8B4513 (Lederbraun)
Secondary:   #D2691E
Accent:      #DEB887
Background:  #FFF8DC
Surface:     #F5DEB3
Text:        #3E2723
```

#### 5. **Ocean Breeze** (Kühl)
```
Primary:     #006994
Secondary:   #0090C1
Accent:      #00B4D8
Background:  #F0F8FF
Surface:     #E6F3F8
Text:        #003D5B
```

#### 6. **Sunset** (Warm & Lebendig)
```
Primary:     #E63946
Secondary:   #F77F00
Accent:      #FCBF49
Background:  #FFFBF5
Surface:     #FFF3E0
Text:        #4A1C1C
```

#### 7. **Minimalist** (Schwarz-Weiß)
```
Primary:     #000000
Secondary:   #333333
Accent:      #666666
Background:  #FFFFFF
Surface:     #F8F8F8
Text:        #1A1A1A
```

#### 8. **High Contrast** (Barrierefreiheit)
```
Primary:     #000000
Secondary:   #333333
Accent:      #FFD700
Background:  #FFFFFF
Surface:     #F0F0F0
Text:        #000000
(Größere Schrift, dickere Linien)
```

### Implementierung
```css
:root {
  --color-primary: #3B5998;
  --color-secondary: #8B9DC3;
  --color-accent: #DDA15E;
  /* ... etc */
}

[data-theme="dark"] {
  --color-primary: #4A90E2;
  /* ... etc */
}
```

---

## 🎨 LEVEL 2: Illustrierte Themes

### Konzept
Hintergrundbilder/Illustrationen passend zu biblischen Themen
Dezent, nicht ablenkend, statisch

### Theme-Kategorien

#### A. **Biblische Landschaften**

**1. Jerusalem Sunrise**
- Hintergrund: Sanfte Illustration von Jerusalem bei Sonnenaufgang
- Farbpalette: Warme Goldtöne, sanftes Orange
- Einsatz: Subtiler Verlauf im Hintergrund
- Stil: Aquarell-artig, weich

**2. Sea of Galilee**
- Hintergrund: Ruhiger See, Boote
- Farbpalette: Blau-Grün-Töne
- Stil: Minimalistisch, beruhigend

**3. Garden of Gethsemane**
- Hintergrund: Olivenbäume, sanftes Licht
- Farbpalette: Grün, Braun, Gold
- Stil: Friedlich, meditativ

**4. Desert Wandering**
- Hintergrund: Wüstenlandschaft, Sternenhimmel
- Farbpalette: Sandfarben, Dunkelblau
- Stil: Weite, Stille

#### B. **Symbolische Themes**

**5. Scripture Scroll**
- Hintergrund: Pergament-Textur
- Farbpalette: Beige, Braun, Gold
- Elemente: Dezente Schriftzeichen-Ornamente
- Stil: Vintage, klassisch

**6. Candlelight Study**
- Hintergrund: Warmes Kerzenlicht
- Farbpalette: Dunkelbraun, Orange-Glow
- Stil: Gemütlich, fokussiert

**7. Olive Branch**
- Hintergrund: Olivenzweig-Muster (subtil)
- Farbpalette: Grün, Creme
- Stil: Friedlich, natürlich

**8. Shepherd's Path**
- Hintergrund: Hügellandschaft mit Schafen
- Farbpalette: Pastell-Grün, Blau
- Stil: Psalm 23 inspiriert

#### C. **Jahreszeitliche Themes**

**9. Spring Renewal**
- Hintergrund: Blühende Felder
- Wechselt: März-Mai
- Farbpalette: Pastellfarben

**10. Summer Light**
- Hintergrund: Sonnenfelder
- Wechselt: Juni-August
- Farbpalette: Helle, warme Farben

**11. Autumn Harvest**
- Hintergrund: Ernteszenen
- Wechselt: September-November
- Farbpalette: Gold, Orange, Braun

**12. Winter Peace**
- Hintergrund: Schnee, Stille
- Wechselt: Dezember-Februar
- Farbpalette: Weiß, Blau, Silber

### Technische Details
- **Format:** SVG oder optimierte PNG
- **Opacity:** 0.05-0.15 (sehr subtil!)
- **Position:** Fixed background
- **Performance:** Lazy Loading
- **Optional:** Nur auf WiFi laden (Einstellung)

---

## 🎨 LEVEL 3: Animierte/Interaktive Themes

### Konzept
Lebendige, aber nicht ablenkende Animationen
Optional für leistungsstarke Geräte
Deaktivierbar für Batterieschonung

### Animationstypen

#### A. **Subtile Hintergrund-Animationen**

**1. Gentle Clouds**
```
Langsam ziehende Wolken
Speed: 60 Sekunden für volle Bewegung
Opacity: 0.1
Blur: Leicht
```

**2. Flowing Water**
```
Sanfte Wellen-Animation
Basierend auf: Sea of Galilee Theme
Speed: Sehr langsam
Effect: Beruhigend
```

**3. Starry Night**
```
Langsam funkelnde Sterne
Perfekt für: Dark Mode
Effect: Twinkle (1-3 Sekunden Intervall)
```

**4. Soft Particles**
```
Schwebende Lichtpartikel
Wie: Staub in Sonnenlicht
Speed: Sehr langsam schwebend
Count: 10-15 Partikel max
```

#### B. **Interaktive Elemente**

**5. Parallax Scroll**
```
Hintergrund bewegt sich langsamer als Content
Effect: Tiefe
Subtilität: Faktor 0.3
```

**6. Reading Progress Glow**
```
Sanftes Leuchten bei gelesenen Kapiteln
Effect: Pulse (langsam)
Color: Gold/Grün
```

**7. Streak Fire Animation**
```
🔥 Flammen-Animation bei Streak-Anzeige
Effect: Flackern
Größe: Wächst mit Streak-Zahl
```

**8. Tree Growth Animation**
```
Bible Tree wächst mit Fortschritt
Visualisierung: Neue Äste/Blätter bei gelesenen Büchern
Effect: Smooth Grow-In
```

#### C. **Thematische Animationen**

**9. Creation Theme** (Genesis)
```
Hintergrund: Vom Dunkel zum Licht
Animation: 7-Tage-Schöpfung subtil visualisiert
Tageszeit-basiert: Morgen = Licht, Abend = Dämmerung
```

**10. Exodus Journey**
```
Hintergrund: Wüste → Berg → Gelobtes Land
Progress-basiert: Ändert sich mit Lesefortschritt
Meilensteine: Bei 25%, 50%, 75% der Bibel
```

**11. Gospel Light**
```
Strahlendes Licht von oben
Aktiviert: Beim Lesen der Evangelien
Effect: Sanftes Strahlen
```

**12. Revelation Sky**
```
Dynamischer Himmel mit Wolken
Aktiviert: Beim Lesen der Offenbarung
Effect: Dramatisch aber nicht übertrieben
```

#### D. **Micro-Interactions**

**Button Press**
```
Ripple-Effect beim Klick
Scale: 1.0 → 1.05 → 1.0
Duration: 0.2s
```

**Card Flip**
```
Beim Markieren als "gelesen"
Effect: Flip-Animation
Duration: 0.4s
Sound: Optional sanftes "Ding"
```

**Streak Counter**
```
Zahl "poppt" bei Inkrement
Effect: Scale + Bounce
Konfetti: Optional bei Meilensteinen (10, 50, 100 Tage)
```

**Progress Bar Fill**
```
Animated Fill beim Fortschritt
Effect: Smooth gradient flow
Duration: 1s
```

---

## 🎯 Theme-Auswahl Interface

### In Einstellungen
```
┌─────────────────────────────────────┐
│ 🎨 DESIGN & THEMES                  │
│                                     │
│ Theme-Ebene wählen:                 │
│                                     │
│ ○ Basic (Nur Farben)                │
│   Schnell, batteriefreundlich       │
│                                     │
│ ● Illustriert (Empfohlen)           │
│   Schöne Hintergründe               │
│                                     │
│ ○ Animiert (Leistungsstark)        │
│   Volle Animationen                 │
│   ⚠️ Höherer Batterieverbrauch      │
│                                     │
│ ─────────────────────────────────   │
│                                     │
│ Theme wählen:                       │
│                                     │
│ [Preview: Classic Light]            │
│ ● Classic Light                     │
│                                     │
│ [Preview: Dark Mode]                │
│ ○ Dark Mode                         │
│                                     │
│ [Preview: Jerusalem Sunrise]        │
│ ○ Jerusalem Sunrise                 │
│                                     │
│ [Preview: Sea of Galilee]           │
│ ○ Sea of Galilee                    │
│                                     │
│ [▼ Mehr Themes anzeigen...]         │
│                                     │
│ ─────────────────────────────────   │
│                                     │
│ Zusätzliche Optionen:               │
│ ☑ Automatischer Dark Mode (19-7 Uhr)│
│ ☑ Jahreszeitliches Theme            │
│ ☐ Theme basierend auf Leseposition  │
│   (Genesis → Schöpfung, etc.)       │
│                                     │
└─────────────────────────────────────┘
```

### Live Preview
- Jedes Theme zeigt **Preview-Karte** beim Scrollen
- **Tap auf Preview** = Sofortige Anwendung
- **Smooth Transition** zwischen Themes (1s fade)

---

## 🎨 Spezial-Features

### 1. **Adaptive Themes**
```
Theme passt sich automatisch an:
- Tageszeit (hell morgens, dunkel abends)
- Leseposition (Genesis = Schöpfung, Offenbarung = Himmlisch)
- Jahreszeit (Frühling = Blüten, Winter = Schnee)
- Feiertage (Weihnachten, Ostern, Memorial)
```

### 2. **Memorial Season Theme**
```
Aktiviert automatisch 2 Wochen vor Gedächtnismahl:
- Dunkler, ernster Ton
- Gethsemane-Hintergrund
- Goldene Akzente
- Sanfte Kerzen-Animation (optional)
```

### 3. **Achievement Themes**
```
Freischaltbar bei Meilensteinen:
- "Bibel-Leser" - Nach 50% der Bibel
- "Testament-Meister" - AT oder NT komplett
- "Jahres-Leser" - Bibel in 1 Jahr geschafft
- "Treuer Leser" - 365 Tage Streak
```

### 4. **Community Themes** (Future)
```
Nutzer können eigene Themes erstellen und teilen:
- Theme-Editor (Farben, Bilder)
- Upload-Funktion
- Bewertungssystem
- Download von Community-Themes
```

---

## 🎨 Custom Theme Creator (Advanced)

### Für Power-User
```
┌─────────────────────────────────────┐
│ 🎨 EIGENES THEME ERSTELLEN          │
│                                     │
│ Name: Mein Theme                    │
│ [________________]                  │
│                                     │
│ Primärfarbe:   [#3B5998] [🎨]      │
│ Sekundärfarbe: [#8B9DC3] [🎨]      │
│ Akzentfarbe:   [#DDA15E] [🎨]      │
│                                     │
│ Hintergrundbild:                    │
│ [📁 Bild hochladen]                 │
│ Opacity: ▓▓▓▓▓░░░░░ 50%            │
│                                     │
│ [Live Preview]                      │
│                                     │
│ [Speichern]  [Teilen]              │
└─────────────────────────────────────┘
```

---

## 📊 Performance-Überlegungen

### Theme-Ebene vs. Performance
```
Basic (Farben):
  CPU: Minimal
  RAM: ~5MB
  Batterie: +0% Verbrauch
  
Illustriert:
  CPU: Niedrig
  RAM: ~15MB
  Batterie: +2-5% Verbrauch
  
Animiert:
  CPU: Mittel
  RAM: ~25MB
  Batterie: +10-15% Verbrauch
  GPU: Empfohlen
```

### Auto-Switching
```
Bei niedrigem Batteriestand (< 20%):
→ Automatisch zu "Basic" wechseln
→ Nutzer wird informiert
→ Nach Laden wieder zurück
```

---

## 🎯 Standard-Einstellungen

### Bei Erstinstallation
```
Theme-Ebene: Illustriert (Empfohlen)
Theme: Classic Light (tagsüber)
       Dark Mode (automatisch 19-7 Uhr)
Animationen: Medium (Balance)
```

### Empfehlungen basierend auf Gerät
```
High-End (Gaming-Phone, Flagship):
→ "Probiere Animierte Themes!"

Mid-Range:
→ "Illustrierte Themes empfohlen"

Budget/Älter:
→ "Basic Themes für beste Performance"
```

---

## 🎨 Zusammenfassung

**3 Theme-Ebenen:**
- ✅ **Basic** - Nur Farben (8 Schemas)
- ✅ **Illustriert** - + Hintergrundbilder (12 Themes)
- ✅ **Animiert** - + Animationen (12 Varianten)

**Special Features:**
- Adaptive Themes (Tageszeit, Position, Jahreszeit)
- Memorial Season Theme
- Achievement Themes
- Custom Theme Creator

**Performance:**
- Auto-Switching bei niedrigem Akku
- Geräte-basierte Empfehlungen
- Alle Animationen deaktivierbar

**User Control:**
- Komplette Kontrolle über Theme
- Live Preview
- Smooth Transitions
- Speichern & Teilen

Bereit für Umsetzung! 🎨

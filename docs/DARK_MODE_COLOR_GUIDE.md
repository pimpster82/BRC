# Dark Mode Color Design: Complete Best Practices Guide

A comprehensive guide for creating cohesive, accessible, and beautiful dark mode color palettes for web applications.

---

## Table of Contents

1. [Color Palette Strategy](#1-color-palette-strategy)
2. [Semantic Colors & Design Tokens](#2-semantic-colors--design-tokens)
3. [Contrast & Readability (WCAG)](#3-contrast--readability-wcag)
4. [Natural & Coherent Design](#4-natural--coherent-design)
5. [Color Psychology in Dark Contexts](#5-color-psychology-in-dark-contexts)
6. [Common Color Mistakes](#6-common-color-mistakes)
7. [Design System Examples](#7-design-system-examples)
8. [Tailwind CSS Color Strategy](#8-tailwind-css-color-strategy)
9. [Saturation & Transition Strategy](#9-saturation--transition-strategy)
10. [Practical Implementation Checklist](#10-practical-implementation-checklist)

---

## 1. Color Palette Strategy

### Foundation: Avoid Pure Black and White

**The Problem with Pure Black (#000000):**
- Creates excessive contrast causing eye strain
- Produces "halation effect" (light bleeding around text)
- Reduces legibility, especially for users with astigmatism
- Makes it difficult to show depth and elevation

**The Solution: Dark Gray Backgrounds**

```css
/* ❌ DON'T: Pure black */
background-color: #000000;

/* ✅ DO: Dark gray (Material Design standard) */
background-color: #121212;

/* ✅ ALTERNATIVES: Other dark gray options */
background-color: #1C1C1E;  /* Apple-style */
background-color: #181818;  /* Slightly lighter */
background-color: #0D1117;  /* GitHub dark */
```

**The Problem with Pure White Text (#FFFFFF):**
- Too harsh on dark backgrounds
- Creates glare and eye strain
- Fails to establish visual hierarchy

**The Solution: Off-White Text**

```css
/* ❌ DON'T: Pure white text */
color: #FFFFFF;

/* ✅ DO: Off-white for body text */
color: #E0E0E0;  /* Material Design default */
color: #D4D4D4;  /* Slightly dimmer */
color: #FAFAFA;  /* Very subtle off-white */

/* ✅ DO: Bolder for headings */
color: #F5F5F5;
color: #ECECEC;
```

### Base Color Palette Structure

```javascript
const darkModePalette = {
  // Surface colors (elevation-based)
  surface: {
    background: '#121212',    // Base surface (elevation 0)
    level1: '#1E1E1E',       // Card/panel (elevation 1)
    level2: '#232323',       // Modal/dialog (elevation 2)
    level3: '#282828',       // Dropdown/menu (elevation 3)
    level4: '#2C2C2C',       // Tooltip (elevation 4)
  },

  // Text colors (hierarchy-based)
  text: {
    primary: '#E0E0E0',      // Body text (87% opacity equivalent)
    secondary: '#A0A0A0',    // Secondary text (60% opacity equivalent)
    tertiary: '#707070',     // Disabled/hint text (38% opacity equivalent)
    inverse: '#1A1A1A',      // Text on colored backgrounds
  },

  // Border/divider colors
  border: {
    default: '#2C2C2C',      // Subtle borders
    strong: '#3C3C3C',       // Emphasized borders
    muted: '#1F1F1F',        // Very subtle dividers
  },
}
```

---

## 2. Semantic Colors & Design Tokens

### Three-Tier Token System

Modern design systems use a hierarchical token structure:

```
Base Tokens → Semantic Tokens → Component Tokens
```

**1. Base Tokens (Primitive Values)**

Raw color values without context:

```javascript
const baseTokens = {
  // Neutral grays (10 shades)
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A',
  },

  // Brand color ramps (desaturated for dark mode)
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    // ... standard shades
    700: '#1D4ED8',  // Light mode primary
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Dark mode variants (lighter, desaturated)
  blueDark: {
    200: '#BFDBFE',  // Dark mode primary (lighter shade)
    300: '#93C5FD',  // Dark mode hover
    400: '#60A5FA',  // Dark mode active
  },
}
```

**2. Semantic Tokens (Contextual Meaning)**

Map base tokens to roles with meaning:

```javascript
const semanticTokens = {
  light: {
    background: {
      primary: baseTokens.gray[50],
      secondary: baseTokens.gray[100],
      tertiary: baseTokens.gray[200],
    },
    text: {
      primary: baseTokens.gray[900],
      secondary: baseTokens.gray[600],
      tertiary: baseTokens.gray[500],
    },
    border: {
      default: baseTokens.gray[300],
      strong: baseTokens.gray[400],
    },
    primary: {
      default: baseTokens.blue[700],
      hover: baseTokens.blue[800],
      active: baseTokens.blue[900],
    },
  },

  dark: {
    background: {
      primary: '#121212',
      secondary: '#1E1E1E',
      tertiary: '#232323',
    },
    text: {
      primary: baseTokens.gray[100],   // Lighter for readability
      secondary: baseTokens.gray[400],
      tertiary: baseTokens.gray[500],
    },
    border: {
      default: '#2C2C2C',
      strong: '#3C3C3C',
    },
    primary: {
      default: baseTokens.blueDark[300],  // Lighter, desaturated
      hover: baseTokens.blueDark[200],
      active: baseTokens.blueDark[400],
    },
  },
}
```

**3. Component Tokens (UI-Specific)**

Map semantic tokens to specific components:

```javascript
const componentTokens = {
  button: {
    primary: {
      background: semanticTokens[mode].primary.default,
      text: semanticTokens[mode].text.inverse,
      border: 'transparent',
    },
    secondary: {
      background: 'transparent',
      text: semanticTokens[mode].primary.default,
      border: semanticTokens[mode].border.strong,
    },
  },

  card: {
    background: semanticTokens[mode].background.secondary,
    border: semanticTokens[mode].border.default,
    text: semanticTokens[mode].text.primary,
  },
}
```

### Semantic Color Roles

Define colors by their **purpose**, not appearance:

```javascript
const semanticColors = {
  // Status colors (must work in both modes)
  success: {
    light: '#16A34A',    // Green-600
    dark: '#4ADE80',     // Green-400 (lighter, desaturated)
  },

  warning: {
    light: '#D97706',    // Orange-600
    dark: '#FBBF24',     // Yellow-400 (lighter, more visible)
  },

  error: {
    light: '#DC2626',    // Red-600
    dark: '#F87171',     // Red-400 (lighter, less harsh)
  },

  info: {
    light: '#2563EB',    // Blue-600
    dark: '#60A5FA',     // Blue-400
  },

  // Interactive states
  interactive: {
    default: 'primary.default',
    hover: 'primary.hover',
    active: 'primary.active',
    disabled: 'text.tertiary',
  },
}
```

---

## 3. Contrast & Readability (WCAG)

### WCAG 2.1 Contrast Requirements

**Minimum Contrast Ratios:**

```
Normal Text (< 18pt):     4.5:1 (AA) | 7:1 (AAA)
Large Text (≥ 18pt/14pt bold): 3:1 (AA) | 4.5:1 (AAA)
UI Components:            3:1 (AA)
```

### Dark Mode Contrast Testing

**Common Combinations to Test:**

```css
/* ✅ PASS: 12.6:1 ratio (AAA) */
background: #121212;
color: #E0E0E0;

/* ✅ PASS: 7.8:1 ratio (AAA) */
background: #1E1E1E;
color: #D4D4D4;

/* ⚠️ MARGINAL: 4.6:1 ratio (AA only) */
background: #121212;
color: #A0A0A0;

/* ❌ FAIL: 2.8:1 ratio */
background: #121212;
color: #707070;
```

### Practical WCAG Guidelines for Dark Mode

**1. Text on Dark Backgrounds**

```css
/* Body text: Aim for AAA (7:1+) */
.text-body {
  background: #121212;
  color: #E0E0E0;  /* 12.6:1 ratio ✅ */
}

/* Secondary text: Minimum AA (4.5:1+) */
.text-secondary {
  background: #121212;
  color: #A0A0A0;  /* 4.6:1 ratio ✅ */
}

/* Disabled text: Can be lower (informational only) */
.text-disabled {
  background: #121212;
  color: #707070;  /* 2.8:1 ratio - use aria-disabled */
}
```

**2. Colored Text on Dark Backgrounds**

```css
/* ❌ DON'T: Saturated colors fail contrast */
.error-text-bad {
  background: #121212;
  color: #DC2626;  /* Red-600: 2.1:1 ratio ❌ */
}

/* ✅ DO: Use lighter shades */
.error-text-good {
  background: #121212;
  color: #F87171;  /* Red-400: 5.2:1 ratio ✅ */
}
```

**3. UI Components (Borders, Icons)**

```css
/* Borders/dividers: Minimum 3:1 */
.border {
  border-color: #2C2C2C;  /* 3.1:1 against #121212 ✅ */
}

/* Interactive icons: Minimum 3:1 */
.icon {
  fill: #A0A0A0;  /* 4.6:1 ratio ✅ */
}
```

### Contrast Testing Tools

```javascript
// Recommended tools for verification:
const contrastTools = [
  'WebAIM Contrast Checker (webaim.org/resources/contrastchecker)',
  'Stark plugin for Figma/Sketch',
  'axe DevTools browser extension',
  'Lighthouse in Chrome DevTools',
  'Color.review (color.review)',
  'Accessible Color Palette Generator (wpdean.com/t/accessible-color-palette-generator)',
]
```

---

## 4. Natural & Coherent Design

### Elevation System (Material Design Approach)

Dark mode uses **lightness** to indicate elevation, not just shadows:

```css
/* Elevation scale: Higher = lighter */
.elevation-0 {
  background: #121212;  /* Base surface */
}

.elevation-1 {
  background: #1E1E1E;  /* +6% white overlay */
}

.elevation-2 {
  background: #232323;  /* +9% white overlay */
}

.elevation-3 {
  background: #282828;  /* +12% white overlay */
}

.elevation-4 {
  background: #2C2C2C;  /* +15% white overlay */
}
```

**How to Calculate Elevation Colors:**

Material Design uses semi-transparent white overlays:

```css
/* Formula: Base (#121212) + White overlay at X% opacity */

/* Elevation 1 = #121212 + rgba(255, 255, 255, 0.05) */
/* Elevation 2 = #121212 + rgba(255, 255, 255, 0.07) */
/* Elevation 3 = #121212 + rgba(255, 255, 255, 0.08) */
/* Elevation 4 = #121212 + rgba(255, 255, 255, 0.09) */
/* Elevation 6 = #121212 + rgba(255, 255, 255, 0.11) */
/* Elevation 8 = #121212 + rgba(255, 255, 255, 0.12) */
```

**Visual Hierarchy:**

```
Tooltips/Popover (highest)      → #2C2C2C (elevation 4)
Dropdown/Menu                    → #282828 (elevation 3)
Modal/Dialog                     → #232323 (elevation 2)
Card/Panel                       → #1E1E1E (elevation 1)
Page Background (lowest)         → #121212 (elevation 0)
```

### Depth & Layering

**Combine elevation with subtle shadows:**

```css
/* Low elevation: Minimal shadow */
.card {
  background: #1E1E1E;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

/* Medium elevation: Moderate shadow */
.modal {
  background: #232323;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

/* High elevation: Strong shadow */
.dropdown {
  background: #282828;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
}
```

**Best Practice:** Limit to 4-5 elevation levels to maintain clarity.

---

## 5. Color Psychology in Dark Contexts

### How Colors Behave Differently in Dark Mode

**Light Mode vs Dark Mode Color Perception:**

| Color Family | Light Mode Feeling | Dark Mode Feeling | Adjustment Needed |
|--------------|-------------------|-------------------|-------------------|
| **Blue** | Professional, calm | Cool, tech-forward | Lighten 2-3 shades, reduce saturation |
| **Green** | Success, growth | Vibrant, energetic | Lighten, avoid neon greens |
| **Red** | Urgent, error | Harsh, aggressive | Lighten significantly, reduce saturation |
| **Yellow** | Warning, caution | Glaring, harsh | Use amber/orange instead, reduce brightness |
| **Purple** | Creative, luxurious | Vivid, modern | Lighten, slight desaturation |
| **Gray** | Neutral, subtle | Foundation, structural | Use as base, ensure 3+ shades for hierarchy |

### Brand Color Adaptation for Dark Mode

**Strategy:** Use saturated brand colors sparingly on small, prominent elements.

```css
/* ✅ DO: Brand color on logo and primary CTA */
.logo {
  color: #1E40AF;  /* Full saturation OK for small areas */
}

.btn-primary {
  background: #1E40AF;  /* Saturated brand color for emphasis */
  color: #FFFFFF;
}

/* ❌ DON'T: Saturated brand color on large surfaces */
.hero-section-bad {
  background: #1E40AF;  /* Too harsh, overwhelming */
}

/* ✅ DO: Desaturated brand color on large surfaces */
.hero-section-good {
  background: #1E3A8A;  /* Desaturated, darker variant */
}
```

### Status Colors in Dark Mode

**Success (Green):**

```css
/* Light mode */
.success-light {
  color: #16A34A;  /* Green-600 */
}

/* Dark mode: Shift to lighter, less saturated */
.success-dark {
  color: #4ADE80;  /* Green-400: Visible but not harsh */
}
```

**Warning (Yellow/Orange):**

```css
/* Light mode */
.warning-light {
  color: #D97706;  /* Orange-600 */
}

/* Dark mode: Shift to amber for better visibility */
.warning-dark {
  color: #FBBF24;  /* Yellow-400: Warm, visible */
}
```

**Error (Red):**

```css
/* Light mode */
.error-light {
  color: #DC2626;  /* Red-600 */
}

/* Dark mode: Lighten significantly to avoid harshness */
.error-dark {
  color: #F87171;  /* Red-400: Less aggressive */
}
```

**Info (Blue):**

```css
/* Light mode */
.info-light {
  color: #2563EB;  /* Blue-600 */
}

/* Dark mode: Lighten for visibility */
.info-dark {
  color: #60A5FA;  /* Blue-400 */
}
```

---

## 6. Common Color Mistakes

### 1. Pure Black Backgrounds

```css
/* ❌ MISTAKE: Pure black (#000000) */
.app-bad {
  background: #000000;
  color: #FFFFFF;  /* Creates halation, eye strain */
}

/* ✅ FIX: Dark gray (#121212) */
.app-good {
  background: #121212;
  color: #E0E0E0;  /* Softer contrast */
}
```

**Why it matters:** Pure black causes:
- Halation effect (light bleeding)
- Excessive contrast
- Eye strain, especially for users with astigmatism
- Inability to show elevation/depth

---

### 2. Overly Saturated Accent Colors

```css
/* ❌ MISTAKE: Highly saturated colors */
.btn-bad {
  background: #121212;
  color: #00FF00;  /* Neon green: 6.9:1 but causes eye strain */
}

.link-bad {
  background: #121212;
  color: #0000FF;  /* Pure blue: 2.6:1 - fails contrast ❌ */
}

/* ✅ FIX: Desaturated, lighter variants */
.btn-good {
  background: #121212;
  color: #4ADE80;  /* Green-400: 8.2:1, comfortable ✅ */
}

.link-good {
  background: #121212;
  color: #60A5FA;  /* Blue-400: 5.9:1, passes AA ✅ */
}
```

**Why it matters:** Saturated colors on dark backgrounds:
- Create optical vibrations
- Cause eye fatigue
- Often fail WCAG contrast requirements
- Look garish and unprofessional

**Rule of thumb:** Reduce saturation by 20-30% in dark mode.

---

### 3. Gray-on-Gray Low Contrast

```css
/* ❌ MISTAKE: Insufficient contrast between grays */
.card-bad {
  background: #1A1A1A;
  border: 1px solid #222222;  /* Only 1.2:1 contrast - invisible */
  color: #666666;  /* 2.3:1 - fails WCAG ❌ */
}

/* ✅ FIX: Stronger contrast between elements */
.card-good {
  background: #1E1E1E;
  border: 1px solid #2C2C2C;  /* 1.8:1 - visible boundary */
  color: #A0A0A0;  /* 4.6:1 - passes AA ✅ */
}
```

**Why it matters:** Subtle gray variations are invisible in dark mode.

**Rule of thumb:** Maintain at least 1.5:1 contrast for borders, 3:1 for UI components.

---

### 4. Inverting Light Mode Colors Directly

```css
/* ❌ MISTAKE: Simple inversion */
.theme-bad {
  /* Light mode */
  --bg-light: #FFFFFF;
  --text-light: #000000;
  --primary-light: #1E40AF;

  /* Dark mode (naive inversion) */
  --bg-dark: #000000;      /* Pure black ❌ */
  --text-dark: #FFFFFF;    /* Pure white ❌ */
  --primary-dark: #1E40AF; /* Same saturation ❌ */
}

/* ✅ FIX: Thoughtful adaptation */
.theme-good {
  /* Light mode */
  --bg-light: #FFFFFF;
  --text-light: #171717;
  --primary-light: #1E40AF;

  /* Dark mode (adjusted) */
  --bg-dark: #121212;      /* Dark gray ✅ */
  --text-dark: #E0E0E0;    /* Off-white ✅ */
  --primary-dark: #60A5FA; /* Lighter, desaturated ✅ */
}
```

**Why it matters:** Direct inversion creates harsh, unnatural-looking interfaces.

---

### 5. Inconsistent Elevation Signals

```css
/* ❌ MISTAKE: Random surface colors */
.surfaces-bad {
  .page { background: #121212; }
  .card { background: #1A1A1A; }  /* Random shade */
  .modal { background: #151515; } /* Random shade */
  .tooltip { background: #1F1F1F; } /* Random shade */
  /* No clear hierarchy */
}

/* ✅ FIX: Systematic elevation scale */
.surfaces-good {
  .page { background: #121212; }     /* Elevation 0 */
  .card { background: #1E1E1E; }     /* Elevation 1 (+6% white) */
  .modal { background: #232323; }    /* Elevation 2 (+9% white) */
  .tooltip { background: #2C2C2C; }  /* Elevation 4 (+15% white) */
  /* Clear visual hierarchy */
}
```

**Why it matters:** Users need consistent depth cues to understand UI layering.

---

### 6. Too Many Elevation Levels

```css
/* ❌ MISTAKE: 10+ surface shades */
.elevations-bad {
  --surface-0: #121212;
  --surface-1: #141414;
  --surface-2: #161616;
  --surface-3: #181818;
  --surface-4: #1A1A1A;
  --surface-5: #1C1C1C;
  /* ... continues to surface-10 */
  /* Users can't distinguish these */
}

/* ✅ FIX: 4-5 meaningful levels */
.elevations-good {
  --surface-0: #121212;  /* Base */
  --surface-1: #1E1E1E;  /* Cards */
  --surface-2: #232323;  /* Modals */
  --surface-3: #282828;  /* Dropdowns */
  --surface-4: #2C2C2C;  /* Tooltips */
  /* Clear, distinguishable hierarchy */
}
```

**Why it matters:** Too many levels create confusion and inconsistency.

**Rule of thumb:** Limit to 4-5 elevation levels max.

---

### 7. Ignoring Halation Effect

```css
/* ❌ MISTAKE: White text on pure black for users with astigmatism */
.text-bad {
  background: #000000;
  color: #FFFFFF;
  font-weight: 300;  /* Thin font makes it worse */
  /* Causes severe halation for ~30% of users */
}

/* ✅ FIX: Off-white on dark gray, medium font weight */
.text-good {
  background: #121212;
  color: #E0E0E0;
  font-weight: 400;  /* Regular weight reduces bleeding */
  /* Comfortable for users with astigmatism */
}
```

**Why it matters:** Halation causes text to "bleed" or appear blurry for users with astigmatism (very common condition).

**Additional fix:** Offer light mode as an option for users who need it.

---

### 8. Saturated Backgrounds on Large Surfaces

```css
/* ❌ MISTAKE: Bright brand color as page background */
.hero-bad {
  background: #1E40AF;  /* Saturated blue */
  color: #FFFFFF;
  padding: 100vh;  /* Full viewport */
  /* Overwhelming, causes eye strain */
}

/* ✅ FIX: Desaturated gradient or dark variant */
.hero-good {
  background: linear-gradient(135deg, #1E3A8A, #1E293B);
  color: #E0E0E0;
  padding: 100vh;
  /* Subtle, professional */
}

/* ✅ ALTERNATIVE: Use brand color as accent only */
.hero-good-alt {
  background: #121212;
  color: #E0E0E0;
}

.hero-good-alt .btn-primary {
  background: #1E40AF;  /* Brand color on small element ✅ */
  color: #FFFFFF;
}
```

**Why it matters:** Saturated backgrounds dominate attention and cause fatigue.

**Rule:** Saturated brand colors belong on buttons, logos, and icons—not backgrounds.

---

### 9. Forgetting Disabled States

```css
/* ❌ MISTAKE: Disabled state too similar to enabled */
.btn-bad {
  background: #1E1E1E;
  color: #A0A0A0;
}

.btn-bad:disabled {
  background: #1A1A1A;  /* Only slightly darker */
  color: #909090;       /* Barely different */
  /* Users can't tell it's disabled */
}

/* ✅ FIX: Clear visual difference */
.btn-good {
  background: #1E1E1E;
  color: #E0E0E0;
}

.btn-good:disabled {
  background: #161616;   /* Noticeably darker */
  color: #606060;        /* Much dimmer */
  opacity: 0.5;          /* Additional signal */
  cursor: not-allowed;
  /* Obviously disabled */
}
```

**Why it matters:** Users need clear feedback about interactive vs non-interactive elements.

---

### 10. No Focus/Hover States

```css
/* ❌ MISTAKE: No visual feedback on interaction */
.link-bad {
  color: #60A5FA;
}

.link-bad:hover,
.link-bad:focus {
  /* No change - user doesn't know it's interactive */
}

/* ✅ FIX: Clear hover and focus states */
.link-good {
  color: #60A5FA;
  transition: color 0.2s ease;
}

.link-good:hover {
  color: #93C5FD;  /* Lighter on hover */
}

.link-good:focus-visible {
  outline: 2px solid #60A5FA;
  outline-offset: 2px;
  border-radius: 2px;
}
```

**Why it matters:** Interactive elements must show clear state changes for accessibility.

---

## 7. Design System Examples

### Material Design (Google)

**Key Characteristics:**
- Base background: `#121212`
- Elevation using white overlays (5%, 7%, 8%, 9%, 11%, 12%)
- Primary colors from 200-400 shades (lighter range)
- Text hierarchy: 87% (high emphasis), 60% (medium), 38% (disabled)

**Example Implementation:**

```css
/* Material Design Dark Theme */
:root[data-theme="dark"] {
  /* Surfaces */
  --md-surface-0: #121212;
  --md-surface-1: #1E1E1E;  /* +5% white */
  --md-surface-2: #232323;  /* +7% white */
  --md-surface-3: #252525;  /* +8% white */
  --md-surface-4: #272727;  /* +9% white */

  /* Text */
  --md-text-high: rgba(255, 255, 255, 0.87);    /* #DEDEDE */
  --md-text-medium: rgba(255, 255, 255, 0.60);  /* #999999 */
  --md-text-disabled: rgba(255, 255, 255, 0.38); /* #616161 */

  /* Primary (use lighter shades) */
  --md-primary: #BB86FC;      /* Purple-400 */
  --md-primary-variant: #3700B3;

  /* Secondary */
  --md-secondary: #03DAC6;    /* Teal-400 */

  /* Error */
  --md-error: #CF6679;        /* Red-400, desaturated */

  /* Success */
  --md-success: #81C784;      /* Green-400 */
}
```

**Material Design Elevation Reference:**

```javascript
const materialElevations = {
  0: '#121212',  // Base
  1: '#1E1E1E',  // +5%  - Cards
  2: '#232323',  // +7%  - Raised cards
  3: '#252525',  // +8%  - Drawers
  4: '#272727',  // +9%  - Modals
  6: '#2C2C2C',  // +11% - Snackbars
  8: '#2E2E2E',  // +12% - Menus/tooltips
}
```

---

### GitHub Dark (Dimmed)

**Key Characteristics:**
- Base background: `#0D1117` (very dark blue-gray)
- Canvas subtle: `#161B22`
- Borders: `#30363D`
- Emphasis on blue accents with high contrast
- Uses semantic naming (canvas, border, emphasis)

**Example Implementation:**

```css
/* GitHub Dark Theme */
:root[data-theme="github-dark"] {
  /* Canvas (backgrounds) */
  --gh-canvas-default: #0D1117;
  --gh-canvas-subtle: #161B22;
  --gh-canvas-inset: #010409;

  /* Borders */
  --gh-border-default: #30363D;
  --gh-border-muted: #21262D;

  /* Text */
  --gh-fg-default: #E6EDF3;
  --gh-fg-muted: #7D8590;
  --gh-fg-subtle: #6E7681;

  /* Accents */
  --gh-accent-fg: #2F81F7;       /* Blue */
  --gh-accent-emphasis: #1F6FEB;
  --gh-success-fg: #3FB950;      /* Green */
  --gh-danger-fg: #F85149;       /* Red */
  --gh-warning-fg: #D29922;      /* Yellow */
}
```

---

### Discord Dark

**Key Characteristics:**
- Base background: `#36393F` (medium-dark gray)
- Secondary: `#2F3136` (darker)
- Tertiary: `#202225` (darkest)
- Brand color: `#5865F2` (blurple)
- High contrast text: `#FFFFFF`

**Example Implementation:**

```css
/* Discord Dark Theme */
:root[data-theme="discord-dark"] {
  /* Backgrounds */
  --discord-bg-primary: #36393F;
  --discord-bg-secondary: #2F3136;
  --discord-bg-tertiary: #202225;
  --discord-bg-accent: #4F545C;

  /* Text */
  --discord-text-normal: #DCDDDE;
  --discord-text-muted: #72767D;
  --discord-text-link: #00AFF4;

  /* Brand */
  --discord-brand: #5865F2;
  --discord-brand-hover: #4752C4;

  /* Status */
  --discord-success: #3BA55D;
  --discord-warning: #FAA81A;
  --discord-danger: #ED4245;
}
```

**Note:** Discord uses a lighter base background (#36393F) than Material Design, which some users find more comfortable for extended use.

---

### Slack Dark

**Key Characteristics:**
- Base background: `#1A1D21` (dark charcoal)
- Surface: `#222529`
- Borders: `#383D44`
- Brand colors remain vibrant
- High text contrast

**Example Implementation:**

```css
/* Slack Dark Theme */
:root[data-theme="slack-dark"] {
  /* Backgrounds */
  --slack-bg-primary: #1A1D21;
  --slack-bg-secondary: #222529;
  --slack-bg-tertiary: #2E3238;

  /* Borders */
  --slack-border-default: #383D44;

  /* Text */
  --slack-text-primary: #D1D2D3;
  --slack-text-secondary: #868889;

  /* Brand */
  --slack-brand-primary: #1164A3;
  --slack-brand-secondary: #611F69;

  /* Status */
  --slack-success: #2BAC76;
  --slack-warning: #E2A735;
  --slack-error: #E01E5A;
}
```

---

### Figma Dark

**Key Characteristics:**
- Base background: `#1E1E1E` (neutral dark gray)
- UI elements: `#2C2C2C`
- Canvas: `#0E0E0E` (darker for contrast)
- High-contrast borders
- Subtle elevation changes

**Example Implementation:**

```css
/* Figma Dark Theme */
:root[data-theme="figma-dark"] {
  /* Backgrounds */
  --figma-bg-app: #1E1E1E;
  --figma-bg-canvas: #0E0E0E;
  --figma-bg-surface: #2C2C2C;
  --figma-bg-hovered: #333333;

  /* Borders */
  --figma-border-default: #3D3D3D;

  /* Text */
  --figma-text-primary: #FFFFFF;
  --figma-text-secondary: #B3B3B3;
  --figma-text-tertiary: #8C8C8C;

  /* Brand */
  --figma-purple: #8B5CF6;
  --figma-blue: #3B82F6;
}
```

---

### Comparison Table

| Design System | Base BG | Surface | Text Primary | Primary Accent | Philosophy |
|---------------|---------|---------|--------------|----------------|------------|
| **Material** | #121212 | #1E1E1E | #DEDEDE | #BB86FC (Purple) | Elevation via white overlays |
| **GitHub** | #0D1117 | #161B22 | #E6EDF3 | #2F81F7 (Blue) | Semantic naming, high contrast |
| **Discord** | #36393F | #2F3136 | #DCDDDE | #5865F2 (Blurple) | Lighter base, vibrant accents |
| **Slack** | #1A1D21 | #222529 | #D1D2D3 | #1164A3 (Blue) | Professional, high contrast |
| **Figma** | #1E1E1E | #2C2C2C | #FFFFFF | #8B5CF6 (Purple) | Neutral grays, creative tools |

---

## 8. Tailwind CSS Color Strategy

### Configuration Approach

**Option 1: CSS Variables (Recommended)**

Most flexible approach using CSS custom properties:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Use class-based dark mode

  theme: {
    extend: {
      colors: {
        // Use CSS variables for dynamic theming
        background: {
          primary: 'rgb(var(--color-bg-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-bg-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--color-bg-tertiary) / <alpha-value>)',
        },
        text: {
          primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--color-text-tertiary) / <alpha-value>)',
        },
        border: {
          default: 'rgb(var(--color-border-default) / <alpha-value>)',
          strong: 'rgb(var(--color-border-strong) / <alpha-value>)',
        },
      },
    },
  },
}
```

**CSS Variables Definition:**

```css
/* globals.css or app.css */

:root {
  /* Light mode colors (RGB channels) */
  --color-bg-primary: 255 255 255;      /* #FFFFFF */
  --color-bg-secondary: 249 250 251;    /* #F9FAFB */
  --color-bg-tertiary: 243 244 246;     /* #F3F4F6 */

  --color-text-primary: 17 24 39;       /* #111827 */
  --color-text-secondary: 75 85 99;     /* #4B5563 */
  --color-text-tertiary: 156 163 175;   /* #9CA3AF */

  --color-border-default: 229 231 235;  /* #E5E7EB */
  --color-border-strong: 209 213 219;   /* #D1D5DB */
}

.dark {
  /* Dark mode colors (RGB channels) */
  --color-bg-primary: 18 18 18;         /* #121212 */
  --color-bg-secondary: 30 30 30;       /* #1E1E1E */
  --color-bg-tertiary: 35 35 35;        /* #232323 */

  --color-text-primary: 224 224 224;    /* #E0E0E0 */
  --color-text-secondary: 160 160 160;  /* #A0A0A0 */
  --color-text-tertiary: 112 112 112;   /* #707070 */

  --color-border-default: 44 44 44;     /* #2C2C2C */
  --color-border-strong: 60 60 60;      /* #3C3C3C */
}
```

**Usage in Components:**

```jsx
// Automatic theme switching
<div className="bg-background-primary text-text-primary border border-border-default">
  <h1 className="text-text-primary">Heading</h1>
  <p className="text-text-secondary">Description text</p>
</div>

// With opacity
<div className="bg-background-primary/50 backdrop-blur">
  Translucent background
</div>
```

---

### Option 2: Dark Variant (Built-in Tailwind)

Using Tailwind's built-in dark mode variant:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        // Define semantic colors
        primary: {
          DEFAULT: '#1E40AF',  // Light mode
          dark: '#60A5FA',     // Dark mode
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#121212',
        },
      },
    },
  },
}
```

**Usage:**

```jsx
<div className="bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100">
  <button className="bg-blue-600 dark:bg-blue-400 hover:bg-blue-700 dark:hover:bg-blue-300">
    Click me
  </button>
</div>
```

---

### Option 3: Extended Color Scales

Create custom color scales optimized for dark mode:

```javascript
// tailwind.config.js
const colors = require('tailwindcss/colors')

module.exports = {
  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        // Light mode uses standard shades
        // Dark mode uses lighter shades

        // Primary brand color
        brand: {
          50: '#F0F9FF',   // Light mode: backgrounds
          100: '#E0F2FE',
          200: '#BAE6FD',  // Dark mode: hover
          300: '#7DD3FC',  // Dark mode: default
          400: '#38BDF8',  // Dark mode: active
          500: '#0EA5E9',  // Light mode: default
          600: '#0284C7',  // Light mode: hover
          700: '#0369A1',  // Light mode: active
          800: '#075985',
          900: '#0C4A6E',
        },

        // Neutral grays
        surface: {
          50: '#FAFAFA',   // Light: backgrounds
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',  // Dark: default
          900: '#171717',  // Dark: secondary
          950: '#0A0A0A',
        },
      },
    },
  },
}
```

**Usage with Scales:**

```jsx
<div className="bg-surface-50 dark:bg-surface-900">
  <button className="bg-brand-600 hover:bg-brand-700 dark:bg-brand-300 dark:hover:bg-brand-200">
    Primary Button
  </button>
</div>
```

---

### Best Practices for Tailwind Dark Mode

**1. Use Class-Based Dark Mode**

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',  // ✅ Recommended: Manual control
  // darkMode: 'media', // ❌ Auto-detects but can't be toggled
}
```

**2. Implement Theme Toggle**

```javascript
// utils/theme.js
export function toggleTheme() {
  const html = document.documentElement
  const currentTheme = html.classList.contains('dark') ? 'dark' : 'light'
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'

  html.classList.remove(currentTheme)
  html.classList.add(newTheme)

  localStorage.setItem('theme', newTheme)
}

export function initTheme() {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  const theme = savedTheme || (prefersDark ? 'dark' : 'light')
  document.documentElement.classList.add(theme)
}
```

**3. Prevent Flash of Unstyled Content (FOUC)**

```html
<!-- Add to <head> before any other scripts -->
<script>
  (function() {
    const theme = localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.add(theme);
  })();
</script>
```

**4. Combine with Responsive Variants**

```jsx
{/* Responsive + Dark mode */}
<div className="
  bg-white dark:bg-gray-900
  md:bg-gray-50 md:dark:bg-gray-800
  lg:bg-gray-100 lg:dark:bg-gray-700
">
  Responsive dark mode
</div>
```

**5. Use Semantic Color Names**

```javascript
// ✅ DO: Semantic names
colors: {
  background: { primary, secondary, tertiary },
  text: { primary, secondary, tertiary },
  border: { default, strong },
  interactive: { default, hover, active },
}

// ❌ DON'T: Generic names
colors: {
  gray1, gray2, gray3,
  blue1, blue2, blue3,
}
```

---

### Complete Tailwind Dark Mode Example

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        // Semantic tokens using CSS variables
        bg: {
          primary: 'rgb(var(--bg-primary) / <alpha-value>)',
          secondary: 'rgb(var(--bg-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--bg-tertiary) / <alpha-value>)',
        },

        text: {
          primary: 'rgb(var(--text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--text-tertiary) / <alpha-value>)',
        },

        border: {
          DEFAULT: 'rgb(var(--border-default) / <alpha-value>)',
          strong: 'rgb(var(--border-strong) / <alpha-value>)',
        },

        // Status colors
        success: {
          DEFAULT: 'rgb(var(--success) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--warning) / <alpha-value>)',
        },
        error: {
          DEFAULT: 'rgb(var(--error) / <alpha-value>)',
        },
      },

      backgroundColor: {
        // Elevation levels
        'elevation-0': 'rgb(var(--elevation-0) / <alpha-value>)',
        'elevation-1': 'rgb(var(--elevation-1) / <alpha-value>)',
        'elevation-2': 'rgb(var(--elevation-2) / <alpha-value>)',
        'elevation-3': 'rgb(var(--elevation-3) / <alpha-value>)',
      },
    },
  },
}
```

```css
/* globals.css */
:root {
  /* Light mode */
  --bg-primary: 255 255 255;
  --bg-secondary: 249 250 251;
  --bg-tertiary: 243 244 246;

  --text-primary: 17 24 39;
  --text-secondary: 75 85 99;
  --text-tertiary: 156 163 175;

  --border-default: 229 231 235;
  --border-strong: 209 213 219;

  --success: 22 163 74;
  --warning: 217 119 6;
  --error: 220 38 38;

  --elevation-0: 255 255 255;
  --elevation-1: 249 250 251;
  --elevation-2: 243 244 246;
  --elevation-3: 229 231 235;
}

.dark {
  /* Dark mode */
  --bg-primary: 18 18 18;
  --bg-secondary: 30 30 30;
  --bg-tertiary: 35 35 35;

  --text-primary: 224 224 224;
  --text-secondary: 160 160 160;
  --text-tertiary: 112 112 112;

  --border-default: 44 44 44;
  --border-strong: 60 60 60;

  --success: 74 222 128;
  --warning: 251 191 36;
  --error: 248 113 113;

  --elevation-0: 18 18 18;
  --elevation-1: 30 30 30;
  --elevation-2: 35 35 35;
  --elevation-3: 40 40 40;
}
```

---

## 9. Saturation & Transition Strategy

### The Desaturation Rule

**Core Principle:** Colors should be **20-30% less saturated** in dark mode compared to light mode.

**Why:**
- Saturated colors appear more vivid against dark backgrounds
- Prevent optical vibrations and eye strain
- Maintain WCAG contrast requirements
- Create a more refined, professional appearance

---

### How to Desaturate Colors

**Method 1: HSL Color Space**

```css
/* Light mode: Full saturation */
.btn-light {
  background: hsl(220, 90%, 50%);  /* Blue with 90% saturation */
}

/* Dark mode: Reduced saturation (20-30% less) */
.btn-dark {
  background: hsl(220, 70%, 65%);  /* Blue with 70% saturation, increased lightness */
}
```

**Formula:**
- Reduce saturation by 20-30%
- Increase lightness by 15-25%
- Keep hue constant (or adjust slightly for warmth)

---

**Method 2: Add White Light**

```css
/* Light mode */
.primary-light {
  color: #1E40AF;  /* Saturated blue */
}

/* Dark mode: Mix with white */
.primary-dark {
  color: #60A5FA;  /* Blue mixed with white (desaturated) */
}
```

**Technical approach:**
1. Take base color (e.g., #1E40AF)
2. Increase lightness in LCH/OKLCH space
3. Decrease chroma (saturation) proportionally
4. Result: Softer, more accessible color

---

**Method 3: Use Lighter Shade from Color Scale**

```javascript
const colorScale = {
  blue: {
    400: '#60A5FA',  // Light mode: Too light
    500: '#3B82F6',  // Light mode: Default
    600: '#2563EB',  // Light mode: Hover
    700: '#1D4ED8',  // Light mode: Active
  }
}

// Light mode uses darker shades (600-800)
const lightMode = {
  primary: colorScale.blue[600],      // #2563EB
  primaryHover: colorScale.blue[700], // #1D4ED8
}

// Dark mode uses lighter shades (300-400)
const darkMode = {
  primary: colorScale.blue[400],      // #60A5FA (naturally desaturated)
  primaryHover: colorScale.blue[300], // #93C5FD
}
```

---

### Saturation by Color Family

Different color families require different desaturation strategies:

| Color Family | Light Mode (HSL) | Dark Mode (HSL) | Notes |
|--------------|------------------|-----------------|-------|
| **Blue** | hsl(220, 90%, 50%) | hsl(220, 70%, 65%) | Reduce saturation 20%, lighten 15% |
| **Green** | hsl(142, 71%, 45%) | hsl(142, 55%, 60%) | Avoid neon greens; use softer tones |
| **Red** | hsl(0, 84%, 60%) | hsl(0, 65%, 70%) | Reduce saturation heavily; very light |
| **Yellow** | hsl(45, 93%, 47%) | hsl(40, 80%, 65%) | Shift to amber/orange; reduce brightness |
| **Purple** | hsl(258, 90%, 66%) | hsl(258, 70%, 75%) | Slight desaturation; increase lightness |
| **Orange** | hsl(27, 96%, 61%) | hsl(27, 75%, 70%) | Moderate desaturation |

---

### Transition Strategies

**Strategy 1: Gradual Shift (Recommended)**

Smoothly transition colors between modes:

```css
:root {
  /* Light mode */
  --primary-hue: 220;
  --primary-saturation: 90%;
  --primary-lightness: 50%;

  --primary: hsl(var(--primary-hue), var(--primary-saturation), var(--primary-lightness));

  transition: background-color 0.3s ease, color 0.3s ease;
}

.dark {
  /* Dark mode */
  --primary-saturation: 70%;  /* -20% */
  --primary-lightness: 65%;   /* +15% */
}

/* All elements using --primary will transition smoothly */
button {
  background: var(--primary);
}
```

**Benefits:**
- Smooth visual transition
- No jarring color jumps
- Reduces user disorientation

---

**Strategy 2: Step-Based Transition**

Define discrete color steps for precise control:

```css
:root {
  --color-primary-50: #EFF6FF;
  --color-primary-100: #DBEAFE;
  /* ... */
  --color-primary-600: #2563EB;  /* Light mode default */
  --color-primary-700: #1D4ED8;
}

.dark {
  /* Remap: Use lighter shades in dark mode */
  --color-primary-default: var(--color-primary-400);  /* Instead of 600 */
  --color-primary-hover: var(--color-primary-300);    /* Instead of 700 */
}

button {
  background: var(--color-primary-default);
}

button:hover {
  background: var(--color-primary-hover);
}
```

---

**Strategy 3: Separate Palettes**

Maintain completely separate color definitions:

```css
/* Light mode palette */
:root {
  --primary: #1E40AF;
  --primary-hover: #1E3A8A;
  --success: #16A34A;
  --error: #DC2626;
}

/* Dark mode palette (completely independent) */
.dark {
  --primary: #60A5FA;
  --primary-hover: #93C5FD;
  --success: #4ADE80;
  --error: #F87171;
}
```

**Benefits:**
- Complete control over each mode
- No constraints from shared color scales
- Easier to fine-tune for accessibility

---

### Saturation Levels by Use Case

**1. Brand Colors (Logo, Primary CTA)**

```css
/* Light mode: Full saturation OK */
.logo-light {
  color: hsl(220, 90%, 50%);  /* Vibrant brand blue */
}

/* Dark mode: Slight desaturation (10-15%) */
.logo-dark {
  color: hsl(220, 80%, 60%);  /* Still recognizable, less harsh */
}
```

**Rule:** Brand identity colors can remain more saturated, but still reduce by 10-15%.

---

**2. Interactive Elements (Buttons, Links)**

```css
/* Light mode */
.btn-light {
  background: hsl(220, 85%, 55%);
}

/* Dark mode: 20-25% desaturation */
.btn-dark {
  background: hsl(220, 65%, 65%);
}
```

**Rule:** Interactive elements need clear visibility; reduce saturation 20-25%.

---

**3. Status/Semantic Colors**

```css
/* Light mode */
.success-light { color: hsl(142, 71%, 45%); }  /* Green */
.warning-light { color: hsl(45, 93%, 47%); }   /* Yellow */
.error-light { color: hsl(0, 84%, 60%); }      /* Red */

/* Dark mode: Heavy desaturation (25-30%) */
.success-dark { color: hsl(142, 50%, 60%); }   /* Softer green */
.warning-dark { color: hsl(40, 70%, 65%); }    /* Amber instead of yellow */
.error-dark { color: hsl(0, 60%, 70%); }       /* Much lighter red */
```

**Rule:** Status colors require heavy desaturation (25-30%) to avoid harshness.

---

**4. Large Background Surfaces**

```css
/* Light mode */
.hero-light {
  background: linear-gradient(135deg, hsl(220, 90%, 50%), hsl(280, 90%, 50%));
}

/* Dark mode: Heavy desaturation + darkening */
.hero-dark {
  background: linear-gradient(135deg, hsl(220, 30%, 20%), hsl(280, 30%, 20%));
}
```

**Rule:** Large surfaces need **heavy desaturation (50%+)** and **darkening** to avoid overwhelming users.

---

### Testing Saturation Levels

**Visual Checklist:**

1. View color on dark background (#121212)
2. Ask: Does it appear to "vibrate" or "glow"?
   - **Yes** → Reduce saturation by 10%
   - **No** → Test contrast ratio
3. Check WCAG contrast with WebAIM tool
4. Test with users who have astigmatism if possible

**Code Example:**

```css
/* Test grid for saturation levels */
.saturation-test {
  background: #121212;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
}

/* Original (100% saturation) */
.sat-100 { color: hsl(220, 90%, 50%); }

/* 80% saturation */
.sat-80 { color: hsl(220, 72%, 55%); }

/* 60% saturation */
.sat-60 { color: hsl(220, 54%, 60%); }

/* 40% saturation */
.sat-40 { color: hsl(220, 36%, 65%); }

/* 20% saturation */
.sat-20 { color: hsl(220, 18%, 70%); }
```

---

### LCH/OKLCH Color Space Advantage

**Why LCH is better for dark mode:**

```css
/* HSL: Lightness is NOT perceptual */
.blue-hsl { color: hsl(220, 90%, 50%); }  /* Appears darker than... */
.yellow-hsl { color: hsl(60, 90%, 50%); } /* ...this, despite same L=50% */

/* LCH: Perceptual uniformity */
.blue-lch { color: oklch(50% 0.2 250); }   /* Perceptually matches... */
.yellow-lch { color: oklch(50% 0.2 110); } /* ...this in brightness */
```

**Desaturation in OKLCH:**

```css
/* Light mode: Full chroma */
.primary-light {
  color: oklch(55% 0.25 250);  /* L=55%, C=0.25 (chroma/saturation) */
}

/* Dark mode: Reduced chroma, increased lightness */
.primary-dark {
  color: oklch(70% 0.18 250);  /* L=70% (+15%), C=0.18 (-28%) */
}
```

**Benefits:**
- Predictable contrast ratios across hues
- Easier to maintain accessibility
- Consistent perceived brightness
- Simpler color ramp generation

**Recommended for:** Advanced design systems with complex color scales.

---

## 10. Practical Implementation Checklist

### Phase 1: Foundation Setup

**1. Define Base Colors**

- [ ] Choose base background: `#121212` or `#1E1E1E`
- [ ] Define 4-5 elevation levels (surface colors)
- [ ] Set text hierarchy: primary, secondary, tertiary
- [ ] Establish border/divider colors
- [ ] Test all combinations for 3:1 minimum contrast

**Example:**

```css
:root.dark {
  /* Surfaces */
  --surface-0: #121212;
  --surface-1: #1E1E1E;
  --surface-2: #232323;
  --surface-3: #282828;
  --surface-4: #2C2C2C;

  /* Text */
  --text-primary: #E0E0E0;
  --text-secondary: #A0A0A0;
  --text-tertiary: #707070;

  /* Borders */
  --border-default: #2C2C2C;
  --border-strong: #3C3C3C;
}
```

---

**2. Adapt Brand Colors**

- [ ] Identify primary brand color (e.g., `#1E40AF`)
- [ ] Desaturate by 20-30% for dark mode
- [ ] Lighten by 15-25%
- [ ] Test on `#121212` background
- [ ] Verify WCAG AA contrast (4.5:1 for text, 3:1 for UI)

**Example:**

```css
/* Light mode */
--brand-primary: #1E40AF;  /* hsl(220, 90%, 50%) */

/* Dark mode */
--brand-primary: #60A5FA;  /* hsl(220, 70%, 65%) */
```

---

**3. Create Semantic Color Tokens**

- [ ] Define status colors: success, warning, error, info
- [ ] Test each on dark background
- [ ] Ensure 4.5:1 contrast for text usage
- [ ] Document semantic meaning in code comments

**Example:**

```css
.dark {
  --success: #4ADE80;   /* Green-400 */
  --warning: #FBBF24;   /* Yellow-400 */
  --error: #F87171;     /* Red-400 */
  --info: #60A5FA;      /* Blue-400 */
}
```

---

### Phase 2: Component Implementation

**4. Update Interactive States**

- [ ] Default state
- [ ] Hover state (lighter/more prominent)
- [ ] Active state (even lighter)
- [ ] Focus state (visible outline)
- [ ] Disabled state (dimmed, low contrast)

**Example:**

```css
.btn-primary {
  background: var(--brand-primary);
  color: #FFFFFF;
}

.btn-primary:hover {
  background: var(--brand-primary-hover);
}

.btn-primary:active {
  background: var(--brand-primary-active);
}

.btn-primary:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}

.btn-primary:disabled {
  background: var(--surface-2);
  color: var(--text-tertiary);
  cursor: not-allowed;
  opacity: 0.5;
}
```

---

**5. Implement Elevation System**

- [ ] Map components to elevation levels
- [ ] Add box-shadows for depth
- [ ] Test visual hierarchy (higher = lighter)
- [ ] Limit to 4-5 levels max

**Component Mapping:**

```javascript
const elevationMap = {
  'page-background': 0,     // #121212
  'card': 1,                // #1E1E1E
  'modal': 2,               // #232323
  'dropdown': 3,            // #282828
  'tooltip': 4,             // #2C2C2C
}
```

---

**6. Add Transitions**

- [ ] Smooth color transitions (0.2-0.3s)
- [ ] Prevent jarring mode switches
- [ ] Test with reduced-motion preference

**Example:**

```css
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none;
  }
}
```

---

### Phase 3: Accessibility Testing

**7. Contrast Verification**

- [ ] Test all text/background combinations with WebAIM
- [ ] Verify UI components (3:1 minimum)
- [ ] Check focus indicators (3:1 against background)
- [ ] Test with browser DevTools contrast checker

**Tools:**
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools: Inspect element → Accessibility panel
- axe DevTools extension

---

**8. User Testing**

- [ ] Test with users with astigmatism
- [ ] Verify readability for users 40+ (presbyopia)
- [ ] Check with color blindness simulators
- [ ] Get feedback on "too bright" or "too dim" areas

**Color Blindness Testing:**
- Chrome DevTools: Rendering tab → Emulate vision deficiencies
- Stark plugin for Figma

---

**9. Halation Testing**

- [ ] Ask users with astigmatism about text bleeding
- [ ] Verify off-white text (#E0E0E0) vs pure white (#FFFFFF)
- [ ] Test on pure black (#000000) vs dark gray (#121212)
- [ ] Offer light mode option for users who need it

---

### Phase 4: Polish & Optimization

**10. Theme Toggle Implementation**

- [ ] Add theme toggle UI (button/switch)
- [ ] Persist user preference in localStorage
- [ ] Respect prefers-color-scheme on first visit
- [ ] Prevent FOUC (flash of unstyled content)

**Implementation:**

```javascript
// Prevent FOUC: Add to <head>
<script>
  (function() {
    const theme = localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.add(theme);
  })();
</script>
```

---

**11. Documentation**

- [ ] Document all color tokens in design system
- [ ] Create visual style guide
- [ ] Add code examples for developers
- [ ] Include accessibility guidelines

**Example Documentation:**

```markdown
## Color Tokens

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--text-primary` | #111827 | #E0E0E0 | Body text, headings |
| `--text-secondary` | #4B5563 | #A0A0A0 | Captions, labels |
| `--text-tertiary` | #9CA3AF | #707070 | Disabled text |
| `--bg-primary` | #FFFFFF | #121212 | Page background |
| `--bg-secondary` | #F9FAFB | #1E1E1E | Cards, panels |
```

---

**12. Performance Optimization**

- [ ] Use CSS variables for dynamic theming
- [ ] Avoid inline styles (hard to switch themes)
- [ ] Minimize JavaScript-based color changes
- [ ] Compress CSS with PurgeCSS/Tailwind

---

### Phase 5: Maintenance

**13. Regression Testing**

- [ ] Test on new browsers/devices
- [ ] Check after dependency updates
- [ ] Verify third-party components (charts, editors)
- [ ] Test with system dark mode toggle

---

**14. Continuous Improvement**

- [ ] Monitor user feedback
- [ ] Track analytics: % users using dark mode
- [ ] A/B test color variations
- [ ] Update colors based on WCAG updates

---

### Quick Reference Checklist

**Before Launch:**

- [ ] All text passes WCAG AA (4.5:1 for normal, 3:1 for large)
- [ ] No pure black (#000000) backgrounds
- [ ] No pure white (#FFFFFF) text
- [ ] Brand colors desaturated 20-30%
- [ ] Elevation system implemented (4-5 levels)
- [ ] Interactive states defined (hover, active, focus, disabled)
- [ ] Theme toggle works and persists
- [ ] FOUC prevented
- [ ] Tested with astigmatism users
- [ ] Documentation complete

---

## Summary: Key Takeaways

### The Golden Rules

1. **Never use pure black (#000000)** → Use `#121212` or similar dark gray
2. **Never use pure white (#FFFFFF) text** → Use `#E0E0E0` off-white
3. **Desaturate colors by 20-30%** in dark mode
4. **Lighten colors by 15-25%** in dark mode
5. **Maintain 4.5:1 contrast** for normal text (WCAG AA)
6. **Use elevation to show depth** (lighter = higher)
7. **Limit to 4-5 elevation levels**
8. **Test with users who have astigmatism**
9. **Offer light mode option** (never force dark mode)
10. **Use semantic color tokens** (not generic names)

---

### Color Formula Quick Reference

```javascript
// Light mode → Dark mode transformation
function adaptForDarkMode(lightColor) {
  // 1. Convert to HSL
  const hsl = rgbToHsl(lightColor)

  // 2. Reduce saturation by 20-30%
  hsl.saturation *= 0.75  // 25% reduction

  // 3. Increase lightness by 15-25%
  hsl.lightness += 20  // +20 points

  // 4. Convert back to RGB/hex
  return hslToRgb(hsl)
}

// Example:
// Light: hsl(220, 90%, 50%) → #1E40AF
// Dark:  hsl(220, 68%, 70%) → #60A5FA
```

---

### Recommended Color Palette Starter

```css
:root {
  /* Light mode */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --text-primary: #111827;
  --text-secondary: #4B5563;
  --border: #E5E7EB;
  --primary: #2563EB;
  --success: #16A34A;
  --warning: #D97706;
  --error: #DC2626;
}

.dark {
  /* Dark mode */
  --bg-primary: #121212;
  --bg-secondary: #1E1E1E;
  --text-primary: #E0E0E0;
  --text-secondary: #A0A0A0;
  --border: #2C2C2C;
  --primary: #60A5FA;
  --success: #4ADE80;
  --warning: #FBBF24;
  --error: #F87171;
}
```

---

### Tools & Resources

**Contrast Checkers:**
- WebAIM: https://webaim.org/resources/contrastchecker/
- Color Review: https://color.review

**Color Generators:**
- Accessible Color Palette Generator: https://wpdean.com/t/accessible-color-palette-generator/
- Color Ramp: https://color-ramp.com

**Design Systems:**
- Material Design Dark Theme: https://material.io/design/color/dark-theme.html
- GitHub Primer Colors: https://primer.style/foundations/color
- Tailwind Colors: https://tailwindcss.com/docs/customizing-colors

**Color Spaces:**
- OKLCH Explorer: https://oklch.com
- LCH Color Picker: https://lch.oklch.com

---

**Document Version:** 1.0
**Last Updated:** 2025-12-27
**Status:** Complete

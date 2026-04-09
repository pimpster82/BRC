// ╔══════════════════════════════════════════════════════════╗
// ║          EPEX Spot Preis-Widget für Scriptable           ║
// ║  Zeigt aktuelle Börsen-Strompreise (DE/AT) – stündlich   ║
// ╚══════════════════════════════════════════════════════════╝
//
// INSTALLATION:
//   1. App "Scriptable" aus dem App Store installieren (kostenlos)
//   2. Dieses Script in Scriptable einfügen (+ → Script einfügen)
//   3. Widget auf dem Homescreen hinzufügen:
//      Homescreen lange drücken → + → Scriptable → Größe wählen
//   4. Widget konfigurieren: Dieses Script auswählen
//
// DATENQUELLE: aWATTar API (kostenlos, kein API-Key nötig)
//   Deutschland: https://api.awattar.de/v1/marketdata
//   Österreich:  https://api.awattar.at/v1/marketdata
//
// WICHTIG: Preise sind EPEX Spot Börsenpreise (netto, ohne MwSt/Netzentgelte)

// ═══════════════════════════════════════════════════════════
// KONFIGURATION – hier anpassen
// ═══════════════════════════════════════════════════════════
const CONFIG = {
  // Land: "de" für Deutschland, "at" für Österreich
  country: "de",

  // Preisschwellen für Farbkodierung (in ct/kWh, Börsenwert netto)
  thresholdGreen:  5,   // ≤ dieser Wert → grün (günstig)
  thresholdYellow: 15,  // ≤ dieser Wert → gelb (mittel), darüber → rot (teuer)

  // Anzahl der nächsten Stunden im Medium-Widget (max. 8)
  hoursToShow: 6,

  // Hintergrundfarbe des Widgets
  bgColorDark:   new Color("#0f0f1a"),
  bgColorLight:  new Color("#f0f4ff"),

  // Widget im Dark Mode? (auto = je nach Systemeinstellung)
  // Werte: true = immer dunkel, false = immer hell, "auto" = Systemeinstellung
  forceDarkMode: "auto",
}

// ═══════════════════════════════════════════════════════════
// FARBEN & DESIGN
// ═══════════════════════════════════════════════════════════
const isDark = CONFIG.forceDarkMode === "auto"
  ? Device.isUsingDarkAppearance()
  : CONFIG.forceDarkMode

const COLORS = {
  bg:       isDark ? CONFIG.bgColorDark  : CONFIG.bgColorLight,
  text:     isDark ? new Color("#ffffff") : new Color("#1a1a2e"),
  dim:      isDark ? new Color("#777799") : new Color("#888888"),
  accent:   new Color("#e94560"),
  green:    new Color("#00c851"),
  yellow:   new Color("#ffbb33"),
  red:      new Color("#ff4444"),
  barBg:    isDark ? new Color("#222244") : new Color("#dde4f0"),
  negative: new Color("#4fc3f7"),   // Negativpreise → blau
}

// ═══════════════════════════════════════════════════════════
// API & DATEN
// ═══════════════════════════════════════════════════════════
async function fetchPrices() {
  const base = CONFIG.country === "at"
    ? "https://api.awattar.at/v1/marketdata"
    : "https://api.awattar.de/v1/marketdata"

  // Daten für jetzt bis +26 Stunden laden
  const now  = Date.now()
  const end  = now + 26 * 3600 * 1000
  const url  = `${base}?start=${now}&end=${end}`

  try {
    const req = new Request(url)
    req.timeoutInterval = 15
    const json = await req.loadJSON()
    return json.data || []
  } catch (e) {
    console.error("Fehler beim Laden der Preise:", e)
    return null
  }
}

function eurMwhToCtKwh(eurMwh) {
  // EUR/MWh → ct/kWh: dividieren durch 10
  return eurMwh / 10
}

function priceColor(ctKwh) {
  if (ctKwh < 0)                       return COLORS.negative
  if (ctKwh <= CONFIG.thresholdGreen)  return COLORS.green
  if (ctKwh <= CONFIG.thresholdYellow) return COLORS.yellow
  return COLORS.red
}

function priceLabel(ctKwh) {
  const sign = ctKwh < 0 ? "−" : ""
  return `${sign}${Math.abs(ctKwh).toFixed(1)}`
}

function hourStr(ts) {
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2, "0")}:00`
}

function trendArrow(current, next) {
  if (next > current + 0.5) return { symbol: "↑", color: COLORS.red }
  if (next < current - 0.5) return { symbol: "↓", color: COLORS.green }
  return { symbol: "→", color: COLORS.dim }
}

// Gibt aktuellen Eintrag + nächste n Einträge zurück
function getRelevantEntries(data, count) {
  const now = Date.now()
  const result = []

  for (const entry of data) {
    if (entry.start_timestamp <= now && entry.end_timestamp > now) {
      result.push({ ...entry, isCurrent: true })
    } else if (entry.start_timestamp > now && result.length > 0) {
      result.push({ ...entry, isCurrent: false })
      if (result.length >= count + 1) break
    }
  }

  // Fallback: wenn noch kein "current" gefunden (z.B. Daten beginnen in Zukunft)
  if (result.length === 0) {
    for (const entry of data.slice(0, count + 1)) {
      result.push({ ...entry, isCurrent: result.length === 0 })
    }
  }

  return result
}

// ═══════════════════════════════════════════════════════════
// WIDGET BAUEN
// ═══════════════════════════════════════════════════════════
async function buildWidget(family) {
  const widget = new ListWidget()
  widget.backgroundColor = COLORS.bg
  widget.setPadding(12, 14, 10, 14)
  widget.url = "https://www.awattar.de/tariffs/hourly"

  const data = await fetchPrices()

  // ── Fehlerfall ──────────────────────────────────────────
  if (!data || data.length === 0) {
    addHeader(widget)
    widget.addSpacer(10)
    const err = widget.addText("Keine Daten verfügbar.\nBitte Internetverbindung\nprüfen.")
    err.textColor = COLORS.dim
    err.font = Font.systemFont(12)
    return widget
  }

  const maxHours = family === "small" ? 2 : family === "large" ? 11 : CONFIG.hoursToShow
  const entries  = getRelevantEntries(data, maxHours)
  const current  = entries[0]
  const curPrice = eurMwhToCtKwh(current.marketprice)

  // ── SMALL Widget ─────────────────────────────────────────
  if (family === "small") {
    addHeader(widget)
    widget.addSpacer(4)

    // Großer aktueller Preis
    const priceRow = widget.addStack()
    priceRow.layoutHorizontally()
    priceRow.centerAlignContent()

    const bigText = priceRow.addText(priceLabel(curPrice))
    bigText.textColor = priceColor(curPrice)
    bigText.font = Font.boldSystemFont(38)

    const unitCol = priceRow.addStack()
    unitCol.layoutVertically()
    unitCol.addSpacer(14)
    const unit = unitCol.addText(" ct\n/kWh")
    unit.textColor = COLORS.dim
    unit.font = Font.systemFont(9)

    widget.addSpacer(2)

    const nowLabel = widget.addText(`Jetzt · ${hourStr(current.start_timestamp)} Uhr`)
    nowLabel.textColor = COLORS.dim
    nowLabel.font = Font.systemFont(10)

    widget.addSpacer(8)

    // Nächste 2 Stunden
    for (let i = 1; i < Math.min(entries.length, 3); i++) {
      const e = entries[i]
      const p = eurMwhToCtKwh(e.marketprice)
      const row = widget.addStack()
      row.layoutHorizontally()

      const t = row.addText(hourStr(e.start_timestamp) + " Uhr")
      t.textColor = COLORS.dim
      t.font = Font.systemFont(11)

      row.addSpacer()

      const pTxt = row.addText(`${priceLabel(p)} ct`)
      pTxt.textColor = priceColor(p)
      pTxt.font = Font.boldSystemFont(11)

      widget.addSpacer(3)
    }

    addFooter(widget)
  }

  // ── MEDIUM Widget ─────────────────────────────────────────
  else if (family === "medium") {
    addHeader(widget)
    widget.addSpacer(6)

    const mainRow = widget.addStack()
    mainRow.layoutHorizontally()

    // Linke Spalte: Aktueller Preis
    const left = mainRow.addStack()
    left.layoutVertically()
    left.size = new Size(120, 0)

    const big = left.addText(priceLabel(curPrice))
    big.textColor = priceColor(curPrice)
    big.font = Font.boldSystemFont(40)

    const ctLbl = left.addText("ct/kWh")
    ctLbl.textColor = COLORS.dim
    ctLbl.font = Font.systemFont(11)

    left.addSpacer(4)

    const nowLbl = left.addText(`${hourStr(current.start_timestamp)} Uhr`)
    nowLbl.textColor = COLORS.dim
    nowLbl.font = Font.systemFont(10)

    // Trend zur nächsten Stunde
    if (entries.length > 1) {
      const nextP = eurMwhToCtKwh(entries[1].marketprice)
      const arrow = trendArrow(curPrice, nextP)
      left.addSpacer(2)
      const tr = left.addText(`nächste ${arrow.symbol} ${priceLabel(nextP)} ct`)
      tr.textColor = arrow.color
      tr.font = Font.systemFont(10)
    }

    mainRow.addSpacer(8)

    // Rechte Spalte: Nächste Stunden
    const right = mainRow.addStack()
    right.layoutVertically()

    const hdr = right.addText("Nächste Stunden")
    hdr.textColor = COLORS.dim
    hdr.font = Font.systemFont(9)
    right.addSpacer(4)

    for (let i = 1; i < Math.min(entries.length, CONFIG.hoursToShow + 1); i++) {
      const e = entries[i]
      const p = eurMwhToCtKwh(e.marketprice)

      const row = right.addStack()
      row.layoutHorizontally()

      const dot = row.addText("● ")
      dot.textColor = priceColor(p)
      dot.font = Font.systemFont(10)

      const time = row.addText(hourStr(e.start_timestamp))
      time.textColor = COLORS.dim
      time.font = Font.systemFont(10)

      row.addSpacer()

      const pTxt = row.addText(`${priceLabel(p)} ct`)
      pTxt.textColor = priceColor(p)
      pTxt.font = Font.boldSystemFont(10)

      right.addSpacer(3)
    }

    addFooter(widget)
  }

  // ── LARGE Widget ──────────────────────────────────────────
  else {
    addHeader(widget)
    widget.addSpacer(4)

    // Aktueller Preis groß
    const topRow = widget.addStack()
    topRow.layoutHorizontally()
    topRow.centerAlignContent()

    const bigTxt = topRow.addText(priceLabel(curPrice))
    bigTxt.textColor = priceColor(curPrice)
    bigTxt.font = Font.boldSystemFont(44)

    const uStack = topRow.addStack()
    uStack.layoutVertically()
    uStack.addSpacer(18)
    const uTxt = uStack.addText(" ct/kWh")
    uTxt.textColor = COLORS.dim
    uTxt.font = Font.systemFont(12)

    widget.addSpacer(2)

    const nowRow = widget.addStack()
    nowRow.layoutHorizontally()
    const nLbl = nowRow.addText(`Jetzt: ${hourStr(current.start_timestamp)}–${hourStr(current.end_timestamp)} Uhr`)
    nLbl.textColor = COLORS.dim
    nLbl.font = Font.systemFont(10)

    if (entries.length > 1) {
      const nextP = eurMwhToCtKwh(entries[1].marketprice)
      const arrow = trendArrow(curPrice, nextP)
      nowRow.addSpacer()
      const tr = nowRow.addText(`${arrow.symbol} ${priceLabel(nextP)} ct`)
      tr.textColor = arrow.color
      tr.font = Font.systemFont(10)
    }

    widget.addSpacer(8)

    // Trennlinie
    const div = widget.addText("─────────────────────────────")
    div.textColor = isDark ? new Color("#222244") : new Color("#ccccdd")
    div.font = Font.systemFont(8)

    widget.addSpacer(6)

    // Preisliste mit Mini-Balken
    const allPrices = entries.slice(1).map(e => Math.abs(eurMwhToCtKwh(e.marketprice)))
    const maxP = Math.max(...allPrices, 1)

    for (let i = 1; i < Math.min(entries.length, 12); i++) {
      const e = entries[i]
      const p = eurMwhToCtKwh(e.marketprice)

      const row = widget.addStack()
      row.layoutHorizontally()
      row.centerAlignContent()

      // Dot
      const dot = row.addText("●")
      dot.textColor = priceColor(p)
      dot.font = Font.systemFont(9)
      row.addSpacer(4)

      // Uhrzeit
      const tTxt = row.addText(hourStr(e.start_timestamp))
      tTxt.textColor = COLORS.dim
      tTxt.font = Font.monospacedSystemFont(10)
      row.addSpacer(6)

      // Mini-Balken
      const barWidth = Math.max(1, Math.round((Math.abs(p) / maxP) * 12))
      const bar = row.addText("▮".repeat(barWidth))
      bar.textColor = priceColor(p)
      bar.font = Font.systemFont(8)

      row.addSpacer()

      // Preis
      const pTxt = row.addText(`${priceLabel(p)} ct`)
      pTxt.textColor = priceColor(p)
      pTxt.font = Font.boldMonospacedSystemFont(10)

      widget.addSpacer(4)
    }

    addFooter(widget)
  }

  // Jede Stunde neu laden
  const nextHour = new Date()
  nextHour.setMinutes(2, 0, 0)
  nextHour.setHours(nextHour.getHours() + 1)
  widget.refreshAfterDate = nextHour

  return widget
}

// ═══════════════════════════════════════════════════════════
// HILFSFUNKTIONEN
// ═══════════════════════════════════════════════════════════
function addHeader(widget) {
  const row = widget.addStack()
  row.layoutHorizontally()
  row.centerAlignContent()

  const icon = row.addText("⚡")
  icon.font = Font.systemFont(12)

  row.addSpacer(4)

  const title = row.addText("EPEX Spot")
  title.textColor = COLORS.accent
  title.font = Font.boldSystemFont(13)

  row.addSpacer()

  const ctry = row.addText(CONFIG.country.toUpperCase() + " · Börsenpreis")
  ctry.textColor = COLORS.dim
  ctry.font = Font.systemFont(9)
}

function addFooter(widget) {
  widget.addSpacer()
  const now = new Date()
  const hh  = now.getHours().toString().padStart(2, "0")
  const mm  = now.getMinutes().toString().padStart(2, "0")
  const footer = widget.addText(`Stand: ${hh}:${mm} · Quelle: aWATTar / EPEX SPOT`)
  footer.textColor = COLORS.dim
  footer.font = Font.systemFont(8)
  footer.rightAlignText()
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
const family = config.widgetFamily || "medium"
const widget = await buildWidget(family)

if (config.runsInWidget) {
  Script.setWidget(widget)
} else {
  // Vorschau wenn direkt in Scriptable ausgeführt
  switch (family) {
    case "small":  await widget.presentSmall();  break
    case "large":  await widget.presentLarge();  break
    default:       await widget.presentMedium(); break
  }
}

Script.complete()

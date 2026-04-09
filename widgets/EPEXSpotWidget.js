// ╔══════════════════════════════════════════════════════════╗
// ║          EPEX Spot Preis-Widget für Scriptable           ║
// ║  Zeigt aktuelle Börsen-Strompreise (DE/AT) – stündlich   ║
// ╚══════════════════════════════════════════════════════════╝
// v1.1 – Fixes: Dark Mode Farben (Color.dynamic), API-Fallback
//
// INSTALLATION:
//   1. App "Scriptable" aus dem App Store installieren (kostenlos)
//   2. Dieses Script in Scriptable einfügen (+ → Neues Script)
//   3. Homescreen lange drücken → + → Scriptable → Größe wählen
//   4. Widget antippen → dieses Script auswählen
//
// QUELLEN: energy-charts.info (Fraunhofer ISE) + aWATTar als Fallback
// PREISE: EPEX Spot Day-Ahead, netto (ohne MwSt / Netzentgelte)

// ═══════════════════════════════════════════════════════════
// KONFIGURATION – hier anpassen
// ═══════════════════════════════════════════════════════════
const CONFIG = {
  country:        "de",  // "de" = Deutschland, "at" = Österreich
  thresholdGreen:  5,    // ≤ ct/kWh → grün  (günstig)
  thresholdYellow: 15,   // ≤ ct/kWh → gelb  (mittel), darüber → rot (teuer)
  hoursToShow:     6,    // Anzahl Folgestunden im Medium-Widget (max. 8)
}

// ═══════════════════════════════════════════════════════════
// FARBEN – Color.dynamic() schaltet automatisch Hell/Dunkel
// ═══════════════════════════════════════════════════════════
const C = {
  bg:      Color.dynamic(new Color("#f0f4ff"), new Color("#0f0f1a")),
  text:    Color.dynamic(new Color("#1a1a2e"), new Color("#ffffff")),
  dim:     Color.dynamic(new Color("#555577"), new Color("#777799")),
  divider: Color.dynamic(new Color("#ccccdd"), new Color("#222244")),
  accent:  new Color("#e94560"),
  green:   new Color("#00c851"),
  yellow:  new Color("#ffbb33"),
  red:     new Color("#ff4444"),
  blue:    new Color("#4fc3f7"),   // Negativpreise
}

// ═══════════════════════════════════════════════════════════
// API – Primär: energy-charts.info (Fraunhofer ISE)
//        Fallback: aWATTar
// ═══════════════════════════════════════════════════════════
async function fetchPrices() {
  const now = Date.now()
  const h26 = 26 * 3600000   // 26 Stunden in ms (keine Numeric Separators für Kompatibilität)

  // 1. Primär: aWATTar – bestätigtes Format: {object, data[], url}
  //    data[i]: { start_timestamp (ms), end_timestamp (ms), marketprice (EUR/MWh), unit }
  try {
    const base = CONFIG.country === "at"
      ? "https://api.awattar.at/v1/marketdata"
      : "https://api.awattar.de/v1/marketdata"
    const req = new Request(base + "?start=" + now + "&end=" + (now + h26))
    req.timeoutInterval = 15
    req.headers = { "Accept": "application/json" }
    const json = await req.loadJSON()
    if (Array.isArray(json.data) && json.data.length > 0) return json.data
  } catch (e) {
    console.error("aWATTar Fehler:", e.message)
  }

  // 2. Fallback: energy-charts.info (Fraunhofer ISE)
  //    Format: { unix_seconds[], price[] } – Preise in EUR/MWh
  try {
    const bzn = CONFIG.country === "at" ? "AT" : "DE-LU"
    const req = new Request("https://api.energy-charts.info/price?bzn=" + bzn)
    req.timeoutInterval = 15
    req.headers = { "Accept": "application/json" }
    const json = await req.loadJSON()

    if (Array.isArray(json.unix_seconds) && json.unix_seconds.length > 0) {
      const entries = []
      for (let i = 0; i < json.unix_seconds.length; i++) {
        if (json.price[i] === null) continue
        const start = json.unix_seconds[i] * 1000
        const end   = i + 1 < json.unix_seconds.length
          ? json.unix_seconds[i + 1] * 1000
          : start + 3600000
        if (end > now - 3600000) {
          entries.push({ start_timestamp: start, end_timestamp: end, marketprice: json.price[i] })
        }
      }
      if (entries.length > 0) return entries
    }
  } catch (e) {
    console.error("energy-charts Fehler:", e.message)
  }

  return null
}

// ═══════════════════════════════════════════════════════════
// HILFSFUNKTIONEN
// ═══════════════════════════════════════════════════════════
function toCtKwh(eurMwh) { return eurMwh / 10 }

function priceColor(ct) {
  if (ct < 0)                       return C.blue
  if (ct <= CONFIG.thresholdGreen)  return C.green
  if (ct <= CONFIG.thresholdYellow) return C.yellow
  return C.red
}

function fmt(ct) {
  if (ct == null) return "–"
  return (ct < 0 ? "−" : "") + Math.abs(ct).toFixed(1)
}

function hStr(ts) {
  return new Date(ts).getHours().toString().padStart(2, "0") + ":00"
}

function trendArrow(cur, nxt) {
  if (nxt > cur + 0.5) return { s: "↑", c: C.red }
  if (nxt < cur - 0.5) return { s: "↓", c: C.green }
  return { s: "→", c: C.dim }
}

// Liefert aktuellen Slot + nächste n Einträge
function getEntries(data, count) {
  const now = Date.now()
  const out = []
  for (const e of data) {
    if (e.start_timestamp <= now && e.end_timestamp > now) {
      out.push({ ...e, isCurrent: true })
    } else if (e.start_timestamp > now && out.length > 0) {
      out.push({ ...e, isCurrent: false })
      if (out.length >= count + 1) break
    }
  }
  // Fallback: kein "jetzt" gefunden → erste Einträge verwenden
  if (out.length === 0) {
    for (const e of data.slice(0, count + 1)) {
      out.push({ ...e, isCurrent: out.length === 0 })
    }
  }
  return out
}

function addHeader(w) {
  const row = w.addStack()
  row.layoutHorizontally()
  row.centerAlignContent()
  const icon = row.addText("⚡ ")
  icon.font = Font.systemFont(12)
  const title = row.addText("EPEX Spot")
  title.textColor = C.accent
  title.font = Font.boldSystemFont(13)
  row.addSpacer()
  const sub = row.addText(CONFIG.country.toUpperCase() + " · Börsenpreis")
  sub.textColor = C.dim
  sub.font = Font.systemFont(9)
}

function addFooter(w) {
  w.addSpacer()
  const now = new Date()
  const hh  = now.getHours().toString().padStart(2, "0")
  const mm  = now.getMinutes().toString().padStart(2, "0")
  const f   = w.addText(`Stand: ${hh}:${mm} · energy-charts.info / aWATTar`)
  f.textColor = C.dim
  f.font = Font.systemFont(8)
  f.rightAlignText()
}

// ═══════════════════════════════════════════════════════════
// WIDGET AUFBAUEN
// ═══════════════════════════════════════════════════════════
async function buildWidget(family) {
  const w = new ListWidget()
  w.backgroundColor = C.bg          // Color.dynamic → kein Device.isUsingDarkAppearance() nötig
  w.setPadding(12, 14, 10, 14)
  w.url = "https://api.energy-charts.info"

  const data = await fetchPrices()

  // ── Fehlerfall ──────────────────────────────────────────
  if (!data || data.length === 0) {
    addHeader(w)
    w.addSpacer(10)
    const err = w.addText(
      "⚠️ Keine Preisdaten\nverfügbar.\n\n" +
      "Bitte prüfen:\n" +
      "· Internetverbindung\n" +
      "· Einstellungen → Scriptable\n" +
      "  → Netzwerkzugriff erlaubt?"
    )
    err.textColor = C.dim
    err.font = Font.systemFont(11)
    return w
  }

  const maxH    = family === "small" ? 2 : family === "large" ? 11 : CONFIG.hoursToShow
  const entries = getEntries(data, maxH)
  const cur     = entries[0]
  const curCt   = toCtKwh(cur.marketprice)

  // ── SMALL ───────────────────────────────────────────────
  if (family === "small") {
    addHeader(w)
    w.addSpacer(4)

    const prRow = w.addStack()
    prRow.layoutHorizontally()
    prRow.centerAlignContent()

    const big = prRow.addText(fmt(curCt))
    big.textColor = priceColor(curCt)
    big.font = Font.boldSystemFont(38)

    const uc = prRow.addStack()
    uc.layoutVertically()
    uc.addSpacer(14)
    const u = uc.addText(" ct\n/kWh")
    u.textColor = C.dim
    u.font = Font.systemFont(9)

    w.addSpacer(2)
    const nl = w.addText(`Jetzt · ${hStr(cur.start_timestamp)} Uhr`)
    nl.textColor = C.dim
    nl.font = Font.systemFont(10)
    w.addSpacer(8)

    for (let i = 1; i < Math.min(entries.length, 3); i++) {
      const e = entries[i]
      const p = toCtKwh(e.marketprice)
      const row = w.addStack()
      row.layoutHorizontally()
      const t = row.addText(hStr(e.start_timestamp) + " Uhr")
      t.textColor = C.dim
      t.font = Font.systemFont(11)
      row.addSpacer()
      const pt = row.addText(`${fmt(p)} ct`)
      pt.textColor = priceColor(p)
      pt.font = Font.boldSystemFont(11)
      w.addSpacer(3)
    }
    addFooter(w)
  }

  // ── MEDIUM ──────────────────────────────────────────────
  else if (family === "medium") {
    addHeader(w)
    w.addSpacer(6)

    const mainRow = w.addStack()
    mainRow.layoutHorizontally()

    // Linke Spalte – aktueller Preis
    const left = mainRow.addStack()
    left.layoutVertically()
    left.size = new Size(120, 0)

    const big = left.addText(fmt(curCt))
    big.textColor = priceColor(curCt)
    big.font = Font.boldSystemFont(40)

    const cl = left.addText("ct/kWh")
    cl.textColor = C.dim
    cl.font = Font.systemFont(11)
    left.addSpacer(4)

    const nl = left.addText(`${hStr(cur.start_timestamp)} Uhr`)
    nl.textColor = C.dim
    nl.font = Font.systemFont(10)

    if (entries.length > 1) {
      const nxt = toCtKwh(entries[1].marketprice)
      const arr = trendArrow(curCt, nxt)
      left.addSpacer(2)
      const tr = left.addText(`nächste ${arr.s} ${fmt(nxt)} ct`)
      tr.textColor = arr.c
      tr.font = Font.systemFont(10)
    }

    mainRow.addSpacer(8)

    // Rechte Spalte – nächste Stunden
    const right = mainRow.addStack()
    right.layoutVertically()

    const hdr = right.addText("Nächste Stunden")
    hdr.textColor = C.dim
    hdr.font = Font.systemFont(9)
    right.addSpacer(4)

    for (let i = 1; i < Math.min(entries.length, CONFIG.hoursToShow + 1); i++) {
      const e = entries[i]
      const p = toCtKwh(e.marketprice)
      const row = right.addStack()
      row.layoutHorizontally()
      const dot = row.addText("● ")
      dot.textColor = priceColor(p)
      dot.font = Font.systemFont(10)
      const time = row.addText(hStr(e.start_timestamp))
      time.textColor = C.dim
      time.font = Font.systemFont(10)
      row.addSpacer()
      const pt = row.addText(`${fmt(p)} ct`)
      pt.textColor = priceColor(p)
      pt.font = Font.boldSystemFont(10)
      right.addSpacer(3)
    }
    addFooter(w)
  }

  // ── LARGE ───────────────────────────────────────────────
  else {
    addHeader(w)
    w.addSpacer(4)

    const topRow = w.addStack()
    topRow.layoutHorizontally()
    topRow.centerAlignContent()

    const bigTxt = topRow.addText(fmt(curCt))
    bigTxt.textColor = priceColor(curCt)
    bigTxt.font = Font.boldSystemFont(44)

    const us = topRow.addStack()
    us.layoutVertically()
    us.addSpacer(18)
    const ut = us.addText(" ct/kWh")
    ut.textColor = C.dim
    ut.font = Font.systemFont(12)

    w.addSpacer(2)

    const nowRow = w.addStack()
    nowRow.layoutHorizontally()
    const nl2 = nowRow.addText(`Jetzt: ${hStr(cur.start_timestamp)}–${hStr(cur.end_timestamp)} Uhr`)
    nl2.textColor = C.dim
    nl2.font = Font.systemFont(10)

    if (entries.length > 1) {
      const nxt = toCtKwh(entries[1].marketprice)
      const arr = trendArrow(curCt, nxt)
      nowRow.addSpacer()
      const tr = nowRow.addText(`${arr.s} ${fmt(nxt)} ct`)
      tr.textColor = arr.c
      tr.font = Font.systemFont(10)
    }

    w.addSpacer(8)
    const div = w.addText("─────────────────────────────")
    div.textColor = C.divider
    div.font = Font.systemFont(8)
    w.addSpacer(6)

    const allP = entries.slice(1).map(e => Math.abs(toCtKwh(e.marketprice)))
    const maxP = Math.max(...allP, 1)

    for (let i = 1; i < Math.min(entries.length, 12); i++) {
      const e  = entries[i]
      const p  = toCtKwh(e.marketprice)
      const row = w.addStack()
      row.layoutHorizontally()
      row.centerAlignContent()

      const dot = row.addText("●")
      dot.textColor = priceColor(p)
      dot.font = Font.systemFont(9)
      row.addSpacer(4)

      const tt = row.addText(hStr(e.start_timestamp))
      tt.textColor = C.dim
      tt.font = Font.monospacedSystemFont(10)
      row.addSpacer(6)

      const bw  = Math.max(1, Math.round((Math.abs(p) / maxP) * 12))
      const bar = row.addText("▮".repeat(bw))
      bar.textColor = priceColor(p)
      bar.font = Font.systemFont(8)
      row.addSpacer()

      const pt = row.addText(`${fmt(p)} ct`)
      pt.textColor = priceColor(p)
      pt.font = Font.boldMonospacedSystemFont(10)
      w.addSpacer(4)
    }
    addFooter(w)
  }

  // Zur nächsten vollen Stunde + 2 Min neu laden
  const nextH = new Date()
  nextH.setMinutes(2, 0, 0)
  nextH.setHours(nextH.getHours() + 1)
  w.refreshAfterDate = nextH

  return w
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
const family = config.widgetFamily || "medium"
const widget = await buildWidget(family)

if (config.runsInWidget) {
  Script.setWidget(widget)
} else {
  switch (family) {
    case "small": await widget.presentSmall(); break
    case "large": await widget.presentLarge(); break
    default:      await widget.presentMedium(); break
  }
}

Script.complete()

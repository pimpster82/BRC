# Firebase Security Rules Update - Custom Plans für alle User

## Problem

**Aktueller Zustand:**
- Admin-PIN (170182) schaltet Custom Plans im UI frei
- Aber Firebase-Regeln erlauben nur Firebase-Admins das Installieren
- **Resultat:** User sehen Custom Plans, können sie aber nicht installieren → PERMISSION_DENIED

## Lösung

**Neue Logik (empfohlen):**
```
┌─────────────────────────────────────────────────────────────┐
│ Zugriffslevel                                               │
├─────────────────────────────────────────────────────────────┤
│ 1. Eingeloggte User (jeder mit Account)                    │
│    ✅ Eigene Custom Plans installieren/deinstallieren       │
│    ✅ Eigenen Reading Progress verwalten                    │
│    ✅ Alle verfügbaren Plans sehen                          │
│                                                              │
│ 2. Admin-PIN Zugang (170182)                               │
│    ✅ Alles von Level 1                                     │
│    ✅ Schedule Upload UI                                    │
│    ✅ Reading Plan Creator UI                               │
│    ✅ Yeartext Upload UI                                    │
│    ✅ Admin-spezifische Settings                            │
│                                                              │
│ 3. Firebase Admins (in /admins gespeichert)                │
│    ✅ Alles von Level 1 + 2                                 │
│    ✅ Neue Custom Plans hochladen (Firebase-Write)          │
│    ✅ Schedules ändern (Firebase-Write)                     │
│    ✅ Yeartexts ändern (Firebase-Write)                     │
└─────────────────────────────────────────────────────────────┘
```

## Firebase Rules Änderungen

### Vorher (CURRENT-FIXED.json)
```json
"readingPlans": {
  ".read": true,
  "available": {
    "$planId": {
      ".write": "root.child('admins').child(auth.uid).exists() || (!data.exists() && auth != null)"
    }
  }
}
```
**Problem:** Komplizierte Regel die nicht klar zwischen "Plan hochladen" und "Plan installieren" unterscheidet

### Nachher (RECOMMENDED.json)
```json
"readingPlans": {
  ".read": true,
  "available": {
    "$planId": {
      ".write": "root.child('admins').child(auth.uid).exists()"
    }
  }
},
"users": {
  "$uid": {
    ".read": "$uid === auth.uid",
    ".write": "$uid === auth.uid",
    "installedPlans": {
      ".read": "$uid === auth.uid",
      ".write": "$uid === auth.uid"
    }
  }
}
```
**Vorteil:** Klare Trennung:
- `/readingPlans/available/$planId` → Nur Admins können neue Pläne hochladen
- `/users/$uid/installedPlans` → Jeder User kann seine eigenen Installationen verwalten

## Implementierung

### Schritt 1: Firebase Console öffnen
1. Gehe zu [Firebase Console](https://console.firebase.google.com/)
2. Wähle dein Projekt
3. Realtime Database → Regeln

### Schritt 2: Neue Rules einfügen
Kopiere den Inhalt von `firebase-security-rules-RECOMMENDED.json` und füge ihn in die Firebase Console ein.

### Schritt 3: Publizieren
Klicke auf "Veröffentlichen"

## Datenstruktur

### Custom Plans Storage
```
/readingPlans
  /available
    /planId1
      name: {...}
      type: "chronological"
      sections: [...]
      installations: 42  // Zähler (optional)
    /planId2
      ...

/users
  /userId1
    /installedPlans
      0: "planId1"
      1: "planId3"
    /progress
      ...
  /userId2
    /installedPlans
      0: "planId2"
    /progress
      ...
```

## Test nach dem Update

1. **Als normaler User einloggen** (nicht mit Firebase-Admin Account)
2. **Admin-PIN eingeben** (170182) in Settings
3. **Custom Plan im Dropdown wählen** (z.B. "Bible in One Year")
4. **Auf Download-Symbol klicken**
5. **"Install" Button klicken**
6. **Erwartetes Ergebnis:** ✅ Plan wird erfolgreich installiert (kein PERMISSION_DENIED mehr)

## Sicherheit

**Ist das sicher?**
✅ Ja! Custom Plans sind nicht sensitive Daten
✅ Jeder User kann nur seine eigenen Installationen verwalten
✅ Users können keine neuen Pläne hochladen (nur Admins)
✅ Users können keine globalen Daten (schedules, yeartexts) ändern

## Rollback

Falls Probleme auftreten, kannst du zurück zu den alten Rules wechseln:
```bash
# Inhalt von firebase-security-rules-CURRENT-FIXED.json verwenden
```

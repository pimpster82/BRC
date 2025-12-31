# Firebase Admin Setup & Security Rules

## 🔐 Aktuelles Problem

**Status:** Niemand kann derzeit Schedules/Yeartexts in Firebase schreiben!

**Grund:** `firebase-security-rules.json` hat `.write: false` für `/schedules` und `/yeartexts`

---

## ✅ Empfohlene Lösung: Admin-basierte Schreibrechte

### Schritt 1: Firebase Security Rules aktualisieren

1. Öffne [Firebase Console](https://console.firebase.google.com)
2. Wähle dein Projekt
3. Gehe zu **Realtime Database** → **Rules**
4. Ersetze die Rules mit dem Inhalt von `firebase-security-rules-recommended.json`

```json
{
  "rules": {
    "admins": {
      ".read": "auth != null",
      ".write": "root.child('admins').child(auth.uid).exists()"
    },
    "schedules": {
      ".read": true,
      ".write": "root.child('admins').child(auth.uid).exists()"
    },
    "yeartexts": {
      ".read": true,
      ".write": "root.child('admins').child(auth.uid).exists()"
    },
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

5. Klicke **Publish**

---

### Schritt 2: Admin-User hinzufügen

#### Methode A: Manuell in Firebase Console

1. Firebase Console → **Realtime Database** → **Data**
2. Klicke auf die Root `/`
3. Klicke **+** (Add child)
4. Name: `admins`
5. Klicke auf `admins` → **+** (Add child)
6. Name: `<USER_UID>` (z.B. `xyz123abc456` - die UID des Users)
7. Value: `true`
8. Speichern

**Struktur:**
```
/admins/
  xyz123abc456: true
  abc789def012: true
```

#### Methode B: Programmatisch (empfohlen)

Erstelle eine Admin-Management-Seite in der App:

```javascript
// In AdminManagementPage.jsx
import { ref, set } from 'firebase/database'
import { database } from '../config/firebase'

// Admin hinzufügen
const addAdmin = async (userEmail) => {
  const user = await getUserByEmail(userEmail) // Firebase Auth lookup
  await set(ref(database, `admins/${user.uid}`), true)
}

// Admin entfernen
const removeAdmin = async (uid) => {
  await set(ref(database, `admins/${uid}`), null)
}
```

---

### Schritt 3: User-UID herausfinden

#### Option A: Firebase Console
1. Firebase Console → **Authentication** → **Users**
2. Kopiere die **User UID** des gewünschten Admin-Users

#### Option B: In der App (Browser Console)
```javascript
// Wenn User eingeloggt ist
import { auth } from './src/config/firebase'
console.log('Meine UID:', auth.currentUser.uid)
```

#### Option C: Code in AuthContext.jsx anzeigen lassen
```javascript
// In src/context/AuthContext.jsx
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('🔑 User UID:', user.uid) // ← UID in Console anzeigen
      setUser(user)
    }
  })
  return unsubscribe
}, [])
```

---

## 🧪 Testing

### Nach dem Setup testen:

1. **Als Normal-User einloggen:**
   - Versuche Schedule zu uploaden → sollte fehlschlagen
   - Console: `Permission denied`

2. **Als Admin-User einloggen:**
   - Gehe zu Settings → Schedule Update
   - Lade Schedule von JW.org
   - Sollte erfolgreich sein
   - Console: `✓ Schedule 2025 saved to Firebase`

3. **Ohne Login:**
   - Schedules lesen: ✅ sollte funktionieren
   - Schedules schreiben: ❌ sollte fehlschlagen

---

## 🔄 Alternative: Einfachere Lösung (weniger sicher)

Wenn du noch kein vollständiges Admin-System aufbauen möchtest:

### Option: Alle authentifizierten User dürfen schreiben

```json
{
  "rules": {
    "schedules": {
      ".read": true,
      ".write": "auth != null"
    },
    "yeartexts": {
      ".read": true,
      ".write": "auth != null"
    },
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

**Vorteil:** Einfach, jeder eingeloggte User kann Schedules hochladen
**Nachteil:** Weniger Kontrolle, alle User haben Schreibrechte

---

## 📋 Aktueller Code-Flow

### Wo Schedules geschrieben werden:

1. **SettingsPage.jsx:126** - `saveScheduleToFirebase()`
2. **SettingsPage.jsx:140-147** - `saveYeartextToFirebase()`

### Wer kann diese Funktion aufrufen:

- ❌ **Frontend-PIN (170182)** - nur UI-Sperre, Firebase kennt das nicht!
- ✅ **Firebase Auth User** - Firebase erkennt `auth.uid`

### Problem mit aktuellem Admin-System:

Der `AdminContext.jsx` verwendet einen **Frontend-PIN** (`170182`). Firebase Security Rules kennen diesen PIN nicht! Firebase sieht nur:

- `auth.uid` (User ID, wenn eingeloggt)
- `auth.token` (Auth-Token)

**Lösung:** Kombiniere Frontend-PIN mit Firebase `/admins`-Liste

---

## 🚀 Deployment

### Rules deployen:

#### Methode A: Firebase Console (manuell)
1. Kopiere `firebase-security-rules-recommended.json`
2. Firebase Console → Realtime Database → Rules
3. Paste & Publish

#### Methode B: Firebase CLI (automatisch)
```bash
# Falls firebase.json existiert:
firebase deploy --only database

# Oder direkt:
firebase database:update / firebase-security-rules-recommended.json
```

---

## 📊 Übersicht: Wer kann was?

| Aktion | Nicht eingeloggt | Normal User | Admin User |
|--------|------------------|-------------|------------|
| Schedules lesen | ✅ Ja | ✅ Ja | ✅ Ja |
| Schedules schreiben | ❌ Nein | ❌ Nein | ✅ Ja |
| Yeartexts lesen | ✅ Ja | ✅ Ja | ✅ Ja |
| Yeartexts schreiben | ❌ Nein | ❌ Nein | ✅ Ja |
| Eigener Progress lesen | ❌ Nein | ✅ Ja | ✅ Ja |
| Eigener Progress schreiben | ❌ Nein | ✅ Ja | ✅ Ja |
| Fremder Progress lesen | ❌ Nein | ❌ Nein | ❌ Nein |

---

## 🛠️ Nächste Schritte

1. [ ] Security Rules updaten (firebase-security-rules-recommended.json)
2. [ ] Ersten Admin-User in `/admins` eintragen (deine UID)
3. [ ] Als Admin einloggen und Schedule upload testen
4. [ ] (Optional) Admin-Management-Page bauen
5. [ ] Alte `firebase-security-rules.json` durch neue Rules ersetzen

---

## 📞 Support

Wenn Probleme auftreten:

1. **Console Fehler checken:** Browser DevTools → Console
2. **Firebase Console logs:** Realtime Database → Usage
3. **Auth Status prüfen:** `console.log(auth.currentUser)`
4. **UID checken:** Ist deine UID wirklich in `/admins`?

---

**Erstellt:** 2025-12-31
**Für:** Bible Reading Companion (BRC)
**Status:** Empfohlen für Produktion

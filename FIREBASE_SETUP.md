# Firebase Setup Guide

## Phase 1: Device-Based Architecture (Current)

This guide helps you configure Firebase Realtime Database for the Bible Reading Companion app.

### Prerequisites
- Firebase Project created (https://console.firebase.google.com)
- Environment variables configured in `.env.local`
- React app deployed and running

### Step 1: Configure Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Realtime Database** → **Rules** tab
4. Replace the default rules with the content from `firebase-security-rules.json`
5. Click **Publish**

### Security Rules Explained

```json
{
  "rules": {
    "devices": {
      "{deviceId}": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

**Device-Based Architecture:**
- Each device gets a unique UUID (`deviceId`) when the app first loads
- Each device stores its own progress data at `devices/{deviceId}/progress/`
- Every device can read/write its own data
- Device identified by locally generated UUID (no server validation needed)

**Data Structure:**
```
devices/
├── {deviceId1}/
│   ├── progress/
│   │   ├── daily/ - Daily text reading progress
│   │   ├── weekly/ - Weekly reading progress
│   │   └── personal/ - Personal Bible plan progress
│   └── stats/ - Device metadata (name, last sync, etc.)
├── {deviceId2}/
│   └── ...
```

### Step 2: Verify Connection

1. Open the app in your browser
2. Open DevTools Console (F12)
3. You should see logs like:
   ```
   ✓ Daily progress synced to Firebase (device: abc12345...)
   ✓ Weekly progress synced to Firebase (device: abc12345...)
   ✓ Personal progress synced to Firebase (device: abc12345...)
   ```

4. In Firebase Console → Realtime Database → Data, you should see:
   ```
   devices/
   └── {your-device-uuid}/
       ├── progress/
       │   ├── daily/ {...}
       │   ├── weekly/ {...}
       │   └── personal/ {...}
       └── stats/ {...}
   ```

### Step 3: Test Multi-Device Sync

1. Open the app on Device A
2. Mark some chapters as read
3. Watch Firebase Console - data appears in `devices/{deviceA-uuid}/`
4. Open the app on Device B
5. Mark different chapters as read
6. Both devices' data should be visible in Firebase at separate paths

### Important Notes

**Phase 1 (Current) - Device-Based:**
- No user authentication required
- Each device is independent
- Data is NOT shared between devices
- Good for personal use or testing

**Phase 3 (Future) - User-Based:**
- Will use Firebase Authentication (Google, Email/Password, etc.)
- User data will be stored at `users/{userId}/`
- Same account can sync across multiple devices
- Family members can share data (with permissions)
- Will require upgrading security rules

### Troubleshooting

**"Firebase not configured" warning?**
- Check your `.env.local` file has all required Firebase keys
- Restart the dev server or redeploy to Vercel

**Data not syncing?**
- Open DevTools Console and check for error messages
- Verify security rules are published in Firebase Console
- Check that your Firebase API key has read/write permissions

**Device data visible to other devices?**
- Current Phase 1 allows all devices to see all device data
- This is intentional for testing phase
- Phase 3 will restrict access with proper authentication

### Next Steps

When you're ready for Phase 3:
1. Enable Firebase Authentication in Console
2. Update security rules to use `auth` instead of open access
3. Add login UI to the app
4. Migrate `devices/{deviceId}/` structure to `users/{userId}/`
5. Update app to require authentication

---

**Version:** 1.0 (Phase 1 - Device-Based)
**Last Updated:** 2025-12-25

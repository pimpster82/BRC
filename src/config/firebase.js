// Firebase configuration and initialization
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseio.com`
}

// Initialize Firebase
let app
let database

try {
  // Check if all required config variables are present
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ]

  const missingVars = requiredVars.filter(varName => !import.meta.env[varName])

  if (missingVars.length === 0) {
    app = initializeApp(firebaseConfig)
    database = getDatabase(app)
    console.log('%c✓ Firebase initialized successfully', 'color: green; font-weight: bold; font-size: 14px')
    console.log('Project:', import.meta.env.VITE_FIREBASE_PROJECT_ID)
    console.log('Database URL:', `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseio.com`)
  } else {
    console.warn('⚠️ Firebase not configured. Missing environment variables:', missingVars)
    console.warn('Please copy .env.local.example to .env.local and add your Firebase credentials')
  }
} catch (error) {
  console.error('✗ Firebase initialization failed:', error)
}

export { app, database }
export const isFirebaseConfigured = () => {
  return Boolean(database)
}

import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import HomePage from './pages/HomePage'
import WeeklyReadingPage from './pages/WeeklyReadingPage'
import ParserTestBench from './pages/ParserTestBench'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PersonalReadingPage from './pages/PersonalReadingPage'
import { processPendingSyncQueue } from './utils/firebaseUserProgress'

/**
 * ProtectedRoute - Only allows authenticated users
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ element }) => {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Wird geladen...</p>
        </div>
      </div>
    )
  }

  return currentUser ? element : <Navigate to="/login" replace />
}

/**
 * AppContent - Router and routes (rendered under AuthProvider)
 * Handles online/offline event listeners for sync queue processing
 */
const AppContent = () => {
  const { currentUser } = useAuth()

  useEffect(() => {
    // PHASE 3: Add online/offline event listeners
    // When device comes online, process pending sync queue

    const handleOnline = async () => {
      console.log('📡 Device came online - processing pending sync queue...')
      if (currentUser?.uid) {
        try {
          const result = await processPendingSyncQueue(currentUser.uid)
          if (result.success) {
            console.log(`✓ Sync queue processed: ${result.processed} items synced, ${result.failed} failed`)
          }
        } catch (error) {
          console.error('✗ Error processing sync queue:', error)
        }
      }
    }

    const handleOffline = () => {
      console.log('📡 Device went offline - queue processing paused')
    }

    // Register event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup on unmount
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [currentUser])

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute element={<HomePage />} />} />
      <Route path="/weekly" element={<ProtectedRoute element={<WeeklyReadingPage />} />} />
      <Route path="/personal-reading" element={<ProtectedRoute element={<PersonalReadingPage />} />} />
      <Route path="/test-parser" element={<ProtectedRoute element={<ParserTestBench />} />} />
      <Route path="/settings" element={<ProtectedRoute element={<SettingsPage />} />} />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router basename="">
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

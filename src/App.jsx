import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import { AdminProvider } from './context/AdminContext'
import { ThemeProvider } from './context/ThemeContext'
import { LoadingProvider } from './context/LoadingContext'
import { ProgressProvider } from './context/ProgressContext'
import MinimumDelaySpinner from './components/MinimumDelaySpinner'
import InstallPromptBanner from './components/InstallPromptBanner'
import HomePage from './pages/HomePage'
import WeeklyReadingPage from './pages/WeeklyReadingPage'
import ParserTestBench from './pages/ParserTestBench'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PersonalReadingPage from './pages/PersonalReadingPage'
import { processPendingSyncQueue } from './utils/firebaseUserProgress'
import { startNotificationService, stopNotificationService } from './utils/notificationService'

/**
 * ProtectedRoute - Only allows authenticated users
 * Redirects to login if user is not authenticated
 * Shows loading spinner for minimum 5 seconds to display animation
 */
const ProtectedRoute = ({ element }) => {
  const { currentUser, loading } = useAuth()

  return (
    <MinimumDelaySpinner loading={loading} message="Authentifizierung wird überprüft...">
      {currentUser ? element : <Navigate to="/login" replace />}
    </MinimumDelaySpinner>
  )
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

    // Start notification service (Phase 4)
    startNotificationService()

    // Cleanup on unmount
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      stopNotificationService()
    }
  }, [currentUser])

  return (
    <>
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

      {/* Install Prompt Banner - shows after 2nd visit */}
      {currentUser && <InstallPromptBanner />}
    </>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminProvider>
          <ProgressProvider>
            <LoadingProvider>
              <Router basename="">
                <AppContent />
              </Router>
            </LoadingProvider>
          </ProgressProvider>
        </AdminProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

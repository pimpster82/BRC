import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import HomePage from './pages/HomePage'
import WeeklyReadingPage from './pages/WeeklyReadingPage'
import ParserTestBench from './pages/ParserTestBench'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PersonalReadingPage from './pages/PersonalReadingPage'

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

function App() {
  return (
    <AuthProvider>
      <Router basename="">
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
      </Router>
    </AuthProvider>
  )
}

export default App

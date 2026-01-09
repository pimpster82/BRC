import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { t } from '../config/i18n'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { register, error: authError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validation
      if (!email.trim()) {
        setError(t('auth.error_email_required'))
        setLoading(false)
        return
      }

      if (!password.trim()) {
        setError(t('auth.error_password_required'))
        setLoading(false)
        return
      }

      if (password.length < 6) {
        setError(t('auth.error_password_min_length'))
        setLoading(false)
        return
      }

      if (password !== confirmPassword) {
        setError(t('auth.error_passwords_mismatch'))
        setLoading(false)
        return
      }

      await register(email, password)
      console.log('✓ Registration successful, redirecting to home')
      navigate('/')
    } catch (err) {
      console.error('Registration error:', err)
      if (err.code === 'auth/email-already-in-use') {
        setError(t('auth.error_email_in_use'))
      } else if (err.code === 'auth/invalid-email') {
        setError(t('auth.error_invalid_email'))
      } else {
        setError(err.message || t('auth.error_register_failed'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 dark:from-slate-800 to-indigo-50 dark:to-slate-700 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center safe-top px-4 pb-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8 max-w-md w-full">
        {/* Header */}
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-100 rounded-full p-3">
            <UserPlus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-indigo-900 dark:text-indigo-100 mb-2">
          {t('auth.register_title')}
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 dark:text-gray-300 mb-8">
          {t('auth.register_subtitle')}
        </p>

        {/* Errors */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-700 dark:text-red-100 text-sm">{error}</p>
          </div>
        )}

        {authError && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-700 dark:text-red-100 text-sm">{authError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('auth.email_label')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.email_placeholder')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('auth.password_min_label')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('auth.password_confirm_label')}
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
          >
            {loading ? t('auth.register_loading') : t('auth.register_button')}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-300 text-sm">
            {t('auth.have_account')}{' '}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
              {t('auth.login_button')}
            </Link>
          </p>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <p className="text-blue-800 dark:text-blue-100 text-xs">
            <strong>{t('auth.info_title')}</strong> {t('auth.info_message')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage

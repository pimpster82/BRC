import React, { useState, useEffect } from 'react'
import { X, Share, Plus } from 'lucide-react'
import { t } from '../config/i18n'

/**
 * InstallPromptBanner - PWA Installation Prompt
 *
 * Shows platform-specific install instructions:
 * - iOS: Step-by-step guide with Share button
 * - Android: Install button that triggers browser prompt
 *
 * Features:
 * - Auto-detect if already installed
 * - "Later" / "Don't show again" options
 * - Smart timing (after 2 visits)
 * - localStorage persistence
 */
export default function InstallPromptBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)

  useEffect(() => {
    // Detect platform
    const ua = window.navigator.userAgent
    const iOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream
    const android = /Android/.test(ua)

    setIsIOS(iOS)
    setIsAndroid(android)

    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       window.navigator.standalone === true

    // Check if user dismissed
    const dismissed = localStorage.getItem('installPrompt_dismissed')
    const visitCount = parseInt(localStorage.getItem('installPrompt_visitCount') || '0', 10)

    // Don't show if installed or dismissed
    if (isInstalled || dismissed === 'true') {
      return
    }

    // Increment visit count
    localStorage.setItem('installPrompt_visitCount', (visitCount + 1).toString())

    // Show after 2nd visit
    if (visitCount >= 1) {
      setShowBanner(true)
    }

    // Android: Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowBanner(true)
    }

    if (android) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Show install prompt
    deferredPrompt.prompt()

    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted install')
    }

    setDeferredPrompt(null)
    setShowBanner(false)
  }

  const handleLater = () => {
    setShowBanner(false)
    // Show again on next visit
  }

  const handleDismiss = () => {
    localStorage.setItem('installPrompt_dismissed', 'true')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-w-md mx-auto">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="pr-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('install.banner_title')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t('install.banner_message')}
          </p>

          {/* iOS Instructions */}
          {isIOS && (
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                <Share size={16} />
                {t('install.ios_title')}
              </h4>
              <ol className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                <li>{t('install.ios_step1')} <Share size={14} className="inline" /></li>
                <li>{t('install.ios_step2')}</li>
                <li>{t('install.ios_step3')}</li>
              </ol>
            </div>
          )}

          {/* Android Install Button */}
          {isAndroid && deferredPrompt && (
            <button
              onClick={handleInstall}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg mb-3 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              {t('install.android_install')}
            </button>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleLater}
              className="flex-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg text-sm transition-colors"
            >
              {t('install.later')}
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg text-sm transition-colors"
            >
              {t('install.dismiss')}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

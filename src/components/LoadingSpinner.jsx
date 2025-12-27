import React from 'react'

/**
 * LoadingSpinner - Animated loading screen with pulsing logo and status text
 *
 * Features:
 * - Pulsing app icon animation
 * - Customizable loading message
 * - Dark/Light mode support
 * - Professional appearance
 *
 * @param {Object} props
 * @param {string} props.message - Loading message to display (default: "Wird geladen...")
 */
export default function LoadingSpinner({ message = 'Wird geladen...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900">
      <div className="text-center px-4">
        {/* Pulsing Icon Container */}
        <div className="mb-6 flex justify-center">
          {/* Outer pulse ring */}
          <div className="absolute w-40 h-40 bg-indigo-400 rounded-full opacity-20 animate-pulse dark:bg-blue-400"></div>

          {/* Icon */}
          <div className="relative w-32 h-32 flex items-center justify-center animate-pulse">
            <img
              src="/icons/open-bible-icon.svg"
              alt="Loading..."
              className="w-24 h-24 drop-shadow-lg"
            />
          </div>
        </div>

        {/* Loading Text */}
        <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">
          {message}
        </p>

        {/* Animated dots */}
        <div className="mt-4 flex justify-center gap-1">
          <span className="w-2 h-2 bg-indigo-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
          <span className="w-2 h-2 bg-indigo-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
          <span className="w-2 h-2 bg-indigo-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
        </div>
      </div>

      {/* Custom CSS Animations */}
      <style>{`
        @keyframes pulse-smooth {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        .animate-pulse {
          animation: pulse-smooth 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  )
}

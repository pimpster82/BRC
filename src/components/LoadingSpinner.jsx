import React from 'react'

/**
 * LoadingSpinner - Animated loading component with multiple variants
 *
 * Features:
 * - Pulsing app icon animation
 * - Multiple size variants (full-screen, inline, small)
 * - Customizable loading message
 * - Dark/Light mode support
 * - Professional appearance
 *
 * @param {Object} props
 * @param {string} props.message - Loading message to display (default: "Wird geladen...")
 * @param {string} props.variant - Size variant: 'full' (default), 'inline', or 'small'
 * @param {boolean} props.showDots - Show animated bounce dots (default: true)
 * @param {string} props.iconSize - Icon size: 'lg' (default), 'md', 'sm'
 */
export default function LoadingSpinner({
  message = 'Wird geladen...',
  variant = 'full', // 'full', 'inline', 'small'
  showDots = true,
  iconSize = 'lg',
}) {
  // Size configurations
  const sizes = {
    full: {
      container: 'min-h-screen',
      ring: 'w-40 h-40',
      icon: 'w-32 h-32',
      iconImg: 'w-24 h-24',
      text: 'text-lg',
      mb: 'mb-6',
    },
    inline: {
      container: 'py-12',
      ring: 'w-32 h-32',
      icon: 'w-24 h-24',
      iconImg: 'w-16 h-16',
      text: 'text-base',
      mb: 'mb-4',
    },
    small: {
      container: 'py-6',
      ring: 'w-20 h-20',
      icon: 'w-16 h-16',
      iconImg: 'w-10 h-10',
      text: 'text-sm',
      mb: 'mb-2',
    },
  }

  const config = sizes[variant] || sizes.full
  const bgClass =
    variant === 'full'
      ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900'
      : 'bg-transparent'

  return (
    <div className={`flex items-center justify-center ${config.container} ${bgClass}`}>
      <div className="text-center px-4">
        {/* Pulsing Icon Container */}
        <div className={`flex justify-center ${config.mb}`}>
          {/* Outer pulse ring */}
          <div
            className={`absolute ${config.ring} bg-indigo-400 rounded-full opacity-20 animate-pulse dark:bg-blue-400`}
          ></div>

          {/* Icon */}
          <div className={`relative ${config.icon} flex items-center justify-center animate-pulse`}>
            <img
              src="/icons/book-loading.svg"
              alt="Loading... file not found 404"
              className={`${config.iconImg} rounded-full object-cover drop-shadow-lg`}
            />
          </div>
        </div>

        {/* Loading Text */}
        <p className={`${config.text} text-gray-700 dark:text-gray-300 font-medium`}>
          {message}
        </p>

        {/* Animated dots */}
        {showDots && (
          <div className="mt-3 flex justify-center gap-1">
            <span
              className="w-2 h-2 bg-indigo-600 dark:bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: '0s' }}
            ></span>
            <span
              className="w-2 h-2 bg-indigo-600 dark:bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.15s' }}
            ></span>
            <span
              className="w-2 h-2 bg-indigo-600 dark:bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.3s' }}
            ></span>
          </div>
        )}
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

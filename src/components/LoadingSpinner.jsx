import React, { useState, useEffect } from 'react'

/**
 * LoadingSpinner - Animated loading component with multiple variants
 *
 * Features:
 * - Pulsing app icon animation
 * - Multiple size variants (full-screen, inline, small)
 * - Customizable loading message
 * - Dark/Light mode support
 * - Professional appearance
 * - Minimum display time of 5 seconds to show loading animation
 * - Round loading GIF with smooth edges
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
  const [gifLoaded, setGifLoaded] = useState(false)
  const [minTimeElapsed, setMinTimeElapsed] = useState(false)

  useEffect(() => {
    // Ensure minimum display time of 5 seconds
    const timer = setTimeout(() => {
      setMinTimeElapsed(true)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  // Preload the GIF
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setGifLoaded(true)
    }
    img.src = '/icons/book-loading.gif'
  }, [])
  // Size configurations
  const sizes = {
    full: {
      container: 'min-h-screen',
      ring: 'w-32 h-32',
      icon: 'w-32 h-32',
      iconImg: 'w-24 h-24',
      text: 'text-lg',
      mb: 'mb-6',
    },
    inline: {
      container: 'py-12',
      ring: 'w-24 h-24',
      icon: 'w-24 h-24',
      iconImg: 'w-16 h-16',
      text: 'text-base',
      mb: 'mb-4',
    },
    small: {
      container: 'py-6',
      ring: 'w-16 h-16',
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
          {/* Positioned Container for absolute ring */}
          <div className="relative">
            {/* Outer pulse ring */}
            <div
              className={`absolute ${config.ring} bg-indigo-400 rounded-full opacity-20 animate-pulse dark:bg-blue-400 -z-10`}
              style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            ></div>

            {/* Icon - Animated GIF (Round) */}
            <div className={`relative ${config.icon} flex items-center justify-center animate-pulse`}>
              <img
                src="/icons/book-loading.gif"
                alt="Loading..."
                className={`${config.iconImg} object-cover rounded-full drop-shadow-lg`}
                style={{
                  clipPath: 'circle(50%)',
                  opacity: gifLoaded ? 1 : 0,
                  transition: 'opacity 0.3s ease-in'
                }}
              />
            </div>
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
            transform: scale(1);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.03);
            opacity: 1;
          }
        }

        .animate-pulse {
          animation: pulse-smooth 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  )
}

/**
 * useUpdateChecker - React Hook for automatic update checking
 *
 * Features:
 * - Checks for updates on app startup
 * - Periodic update checks based on channel interval
 *   - Production: Every 1 hour
 *   - Beta: Every 30 minutes
 * - Returns update info and check status
 *
 * Usage:
 * const { updateInfo, isChecking, checkUpdate } = useUpdateChecker()
 *
 * updateInfo: {
 *   hasUpdate: boolean,
 *   currentVersion: string,
 *   latestVersion: string,
 *   channel: string,
 *   downloadUrl: string
 * }
 */

import { useState, useEffect } from 'react'
import { checkForUpdates, getCurrentChannel } from '../utils/updateManager'

export function useUpdateChecker() {
  const [updateInfo, setUpdateInfo] = useState(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkUpdate = async () => {
    setIsChecking(true)
    try {
      const result = await checkForUpdates()
      setUpdateInfo(result)

      // Log update check result
      if (result.hasUpdate) {
        console.log(`✓ Update available: ${result.latestVersion} (current: ${result.currentVersion})`)
      } else {
        console.log(`✓ No updates available (current: ${result.currentVersion})`)
      }

      return result
    } catch (error) {
      console.error('✗ Update check failed:', error)
      setUpdateInfo({
        hasUpdate: false,
        error: error.message,
        currentVersion: null,
        latestVersion: null
      })
      return null
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    // Initial check on mount (delay by 5 seconds to avoid blocking app startup)
    const initialCheckTimeout = setTimeout(() => {
      console.log('[useUpdateChecker] Starting initial update check...')
      checkUpdate()
    }, 5000)

    // Set up periodic checking based on channel interval
    const channel = getCurrentChannel()
    console.log(`[useUpdateChecker] Setting up periodic checks every ${channel.updateCheckInterval / 60000} minutes for ${channel.id} channel`)

    const intervalId = setInterval(() => {
      console.log(`[useUpdateChecker] Periodic update check (${channel.id})`)
      checkUpdate()
    }, channel.updateCheckInterval)

    // Cleanup on unmount
    return () => {
      clearTimeout(initialCheckTimeout)
      clearInterval(intervalId)
    }
  }, [])

  return {
    updateInfo,
    isChecking,
    checkUpdate
  }
}

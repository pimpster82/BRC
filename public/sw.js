/**
 * Service Worker for Bible Reading Companion
 * Handles background notifications, push messages, and offline support
 */

const CACHE_NAME = 'brc-v1'
const NOTIFICATION_STORE = 'brc_notifications'

// Workbox manifest injection point (required by vite-plugin-pwa)
self.__WB_MANIFEST;

// Install event - precache essential files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...')
  self.skipWaiting()
})

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...')
  self.clients.claim()
})

// Fetch event - cache strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip cross-origin requests
  if (!event.request.url.includes(self.location.origin)) {
    return
  }

  // Cache-first for static assets
  if (event.request.url.includes('/icons/') || event.request.url.includes('/assets/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((fetchResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchResponse.clone())
            return fetchResponse
          })
        })
      })
    )
  }
})

// Handle notification clicks - route to correct page
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const data = event.notification.data || {}
  const { type, deeplink } = data

  // Route based on notification type
  let targetUrl = '/'

  if (type === 'daily_text') {
    targetUrl = '/'
  } else if (type === 'weekly_reading') {
    targetUrl = '/weekly-reading'
  } else if (type === 'personal_reading') {
    targetUrl = `/personal-reading${deeplink || ''}`
  } else if (type === 'streak_preservation') {
    targetUrl = '/'
  } else if (type === 'encouragement') {
    targetUrl = '/settings'
  }

  // Open window or focus existing
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if window already open
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus()
        }
      }
      // Open new window if not found
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag)
})

// Handle push messages from Firebase Cloud Messaging (FCM)
self.addEventListener('push', (event) => {
  console.log('[SW] Push message received')

  let notificationData = {
    title: 'Bible Reading Companion',
    body: 'New message',
    icon: '/icons/icon-light-192.png',
    badge: '/icons/icon-light-192.png'
  }

  if (event.data) {
    try {
      const payload = event.data.json()
      notificationData = {
        ...notificationData,
        ...payload.notification,
        data: payload.data || {}
      }
    } catch (error) {
      console.error('[SW] Failed to parse push data:', error)
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.data?.type || 'default',
      data: notificationData.data
    })
  )
})

// Handle background sync (for offline actions)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)

  if (event.tag === 'sync-progress') {
    event.waitUntil(
      // Notify clients to sync their progress
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SYNC_PROGRESS',
            timestamp: Date.now()
          })
        })
      })
    )
  }
})

// Handle messages from clients (for update management)
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data)

  // Skip waiting and activate new service worker immediately
  if (event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skipping waiting, activating now')
    self.skipWaiting()
  }

  // Clear all caches (for channel switching or forced updates)
  if (event.data.type === 'CLEAR_CACHE') {
    console.log('[SW] Clearing all caches')
    event.waitUntil(
      caches.keys().then((keys) => {
        return Promise.all(keys.map((key) => {
          console.log('[SW] Deleting cache:', key)
          return caches.delete(key)
        }))
      }).then(() => {
        console.log('[SW] All caches cleared')
      })
    )
  }
})

console.log('[SW] Service Worker loaded')

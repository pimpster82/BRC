/**
 * Sync Queue System - Phase 3 Multi-Device Sync
 *
 * Handles offline sync queue for multi-device synchronization.
 * When offline, actions are queued and processed when device comes online.
 *
 * Queue Item Structure:
 * {
 *   id: uuid (unique ID for deduplication),
 *   section: 'daily' | 'weekly' | 'personal',
 *   action: 'mark_complete' | 'unmark_complete',
 *   timestamp: Date.now() (when action occurred),
 *   data: { ... action-specific data ... },
 *   synced: false,
 *   retries: 0
 * }
 */

/**
 * Generate unique queue item ID (composite key based on action type)
 * This enables deduplication - if same action is queued twice, they get same ID
 *
 * @param {string} section - 'daily', 'weekly', or 'personal'
 * @param {string} action - 'mark_complete' or 'unmark_complete'
 * @param {Object} data - Action data (contains identifying info)
 * @returns {string} Composite key ID
 */
export const generateQueueItemId = (section, action, data) => {
  // Composite key based on section and action data
  switch (section) {
    case 'daily':
      // Daily: deduplicate by (date, action)
      return `daily_${data.date}_${action}`

    case 'weekly':
      // Weekly: deduplicate by (weekStart, action)
      return `weekly_${data.weekStart}_${action}`

    case 'personal':
      // Personal: deduplicate by (book, chapter, action)
      return `personal_${data.book}_${data.chapter}_${action}`

    default:
      // Fallback: use UUID
      return `${section}_${Date.now()}_${Math.random()}`
  }
}

/**
 * Create a new queue item
 * @param {string} section - 'daily', 'weekly', or 'personal'
 * @param {string} action - 'mark_complete' or 'unmark_complete'
 * @param {Object} data - Action-specific data
 * @returns {Object} Queue item
 */
export const createQueueItem = (section, action, data) => {
  return {
    id: generateQueueItemId(section, action, data),
    section,
    action,
    timestamp: Date.now(),
    data,
    synced: false,
    retries: 0
  }
}

/**
 * Add item to sync queue (with deduplication)
 * If item with same ID already exists, replace it (latest action wins)
 *
 * @param {Array} queue - Current queue array
 * @param {Object} item - Queue item to add
 * @returns {Array} Updated queue
 */
export const enqueueItem = (queue, item) => {
  if (!Array.isArray(queue)) queue = []

  // Remove existing item with same ID (deduplication)
  const filtered = queue.filter(q => q.id !== item.id)

  // Add new item at end (FIFO order)
  filtered.push(item)

  return filtered
}

/**
 * Get next pending item from queue (FIFO)
 * @param {Array} queue - Queue array
 * @returns {Object|null} First unsynced item or null
 */
export const getNextPendingItem = (queue) => {
  if (!Array.isArray(queue)) return null

  // Find first item that hasn't been synced yet
  return queue.find(item => !item.synced) || null
}

/**
 * Mark item as synced in queue
 * @param {Array} queue - Queue array
 * @param {string} itemId - Item ID to mark as synced
 * @returns {Array} Updated queue
 */
export const markItemSynced = (queue, itemId) => {
  if (!Array.isArray(queue)) return queue

  return queue.map(item => {
    if (item.id === itemId) {
      return { ...item, synced: true, retries: 0 }
    }
    return item
  })
}

/**
 * Increment retry count for item
 * @param {Array} queue - Queue array
 * @param {string} itemId - Item ID to increment retry
 * @returns {Array} Updated queue
 */
export const incrementRetry = (queue, itemId) => {
  if (!Array.isArray(queue)) return queue

  return queue.map(item => {
    if (item.id === itemId) {
      return { ...item, retries: (item.retries || 0) + 1 }
    }
    return item
  })
}

/**
 * Remove synced items from queue (cleanup)
 * @param {Array} queue - Queue array
 * @returns {Array} Queue with only pending items
 */
export const removeSyncedItems = (queue) => {
  if (!Array.isArray(queue)) return []
  return queue.filter(item => !item.synced)
}

/**
 * Check if queue has pending items
 * @param {Array} queue - Queue array
 * @returns {boolean}
 */
export const hasPendingItems = (queue) => {
  if (!Array.isArray(queue)) return false
  return queue.some(item => !item.synced)
}

/**
 * Get queue stats (for logging/debugging)
 * @param {Array} queue - Queue array
 * @returns {Object} Stats object
 */
export const getQueueStats = (queue) => {
  if (!Array.isArray(queue)) {
    return { total: 0, synced: 0, pending: 0, failedRetries: 0 }
  }

  const total = queue.length
  const synced = queue.filter(item => item.synced).length
  const pending = total - synced
  const failedRetries = queue.filter(item => !item.synced && item.retries >= 3).length

  return { total, synced, pending, failedRetries }
}

export default {
  generateQueueItemId,
  createQueueItem,
  enqueueItem,
  getNextPendingItem,
  markItemSynced,
  incrementRetry,
  removeSyncedItems,
  hasPendingItems,
  getQueueStats
}

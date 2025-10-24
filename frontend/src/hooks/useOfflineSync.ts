import { useState, useEffect, useCallback } from 'react'
import { useOnlineStatus } from './useOnlineStatus'
import {
  getPendingChanges,
  removePendingChange,
  updatePendingChangeRetry,
  updateLastSync,
  getPendingChangesCount,
  getLastSync,
  saveArtifactOffline,
  addSyncLog,
  resetFailedPendingChanges
} from '../utils/offlineStorage'
import { PendingChange } from '../utils/db'
import {
  createArtifact as createArtifactFirebase,
  updateArtifact as updateArtifactFirebase,
  deleteArtifact as deleteArtifactFirebase,
  getArtifacts
} from '../services/artifacts'
import { SyncStatus } from '../types/sync'
import { auth } from '../services/firebase'

const MAX_RETRIES = 3
const SYNC_INTERVAL = 30000 // 30 seconds

/**
 * Hook for managing offline sync functionality
 */
export const useOfflineSync = () => {
  const isOnline = useOnlineStatus()
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline,
    isSyncing: false,
    lastSyncAt: undefined,
    pendingChanges: 0,
    conflicts: 0,
    errors: []
  })

  /**
   * Convert data URL to File object
   */
  const dataUrlToFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',')
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  /**
   * Process a single pending change
   */
  const processPendingChange = async (change: PendingChange): Promise<boolean> => {
    try {
      console.log(`🔄 Processing pending change: ${change.action} ${change.entityType} ${change.entityId}`)

      if (change.entityType === 'artifact') {
        switch (change.action) {
          case 'create': {
            // Handle photo data URLs for offline-created artifacts
            const syncData = { ...change.data }
            
            // Convert photoDataUrls back to File objects
            if (syncData.photoDataUrls && Array.isArray(syncData.photoDataUrls)) {
              console.log(`📸 Converting ${syncData.photoDataUrls.length} photo data URLs to files...`)
              syncData.photos = syncData.photoDataUrls.map((dataUrl: string, index: number) => {
                return dataUrlToFile(dataUrl, `offline-photo-${index}.jpg`)
              })
              // Remove the data URLs to avoid sending to Firebase
              delete syncData.photoDataUrls
              delete syncData.tempId
            }
            
            await createArtifactFirebase(syncData)
            break
          }
          case 'update': {
            // Handle photo data URLs for offline-updated artifacts
            const syncData = { ...change.data }
            
            if (syncData.photoDataUrls && Array.isArray(syncData.photoDataUrls)) {
              console.log(`📸 Converting ${syncData.photoDataUrls.length} photo data URLs to files...`)
              syncData.photos = syncData.photoDataUrls.map((dataUrl: string, index: number) => {
                return dataUrlToFile(dataUrl, `offline-photo-${index}.jpg`)
              })
              delete syncData.photoDataUrls
            }
            
            await updateArtifactFirebase(change.entityId, syncData)
            break
          }
          case 'delete': {
            // Check if this is a temp artifact (offline-only, never synced)
            if (change.entityId.startsWith('temp-')) {
              console.log(`🗑️ Skipping delete for offline-only artifact: ${change.entityId}`)
              // Don't try to delete from Firebase, just succeed
              return true
            }
            await deleteArtifactFirebase(change.entityId)
            break
          }
        }
      }

      // Add sync log
      await addSyncLog({
        id: `${change.entityType}-${change.entityId}-${Date.now()}`,
        userId: change.data?.createdBy || 'unknown',
        entityType: change.entityType,
        entityId: change.entityId,
        action: change.action,
        localTimestamp: new Date(change.timestamp).toISOString(),
        serverTimestamp: new Date().toISOString(),
        conflictResolved: false
      })

      console.log(`✅ Successfully synced: ${change.action} ${change.entityType} ${change.entityId}`)
      return true
    } catch (error: any) {
      console.error(`❌ Error processing pending change:`, error)
      
      // Update retry count
      if (change.id) {
        await updatePendingChangeRetry(change.id, error.message)
      }

      return false
    }
  }

  /**
   * Sync all pending changes to server
   */
  const syncPendingChanges = useCallback(async () => {
    if (!isOnline) {
      console.log('📴 Cannot sync while offline')
      return
    }

    // Check if user is authenticated
    if (!auth.currentUser) {
      console.log('⏸️ Sync skipped: User not authenticated yet')
      return
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true }))

    try {
      const pendingChanges = await getPendingChanges()
      console.log(`🔄 Syncing ${pendingChanges.length} pending changes...`)

      let successCount = 0
      let failureCount = 0

      for (const change of pendingChanges) {
        // Skip if max retries reached
        if (change.retries >= MAX_RETRIES) {
          console.warn(`⚠️ Max retries reached for change ${change.id}`)
          failureCount++
          continue
        }

        const success = await processPendingChange(change)
        
        if (success && change.id) {
          await removePendingChange(change.id)
          successCount++
        } else {
          failureCount++
        }
      }

      // Update last sync timestamp
      await updateLastSync()
      const lastSyncAt = await getLastSync()

      // Get updated pending count
      const pendingCount = await getPendingChangesCount()

      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncAt: lastSyncAt || undefined,
        pendingChanges: pendingCount
      }))

      console.log(`✅ Sync completed: ${successCount} succeeded, ${failureCount} failed`)
    } catch (error) {
      console.error('❌ Error syncing pending changes:', error)
      setSyncStatus(prev => ({ ...prev, isSyncing: false }))
    }
  }, [isOnline])

  /**
   * Sync data from server to local cache
   */
  const syncFromServer = useCallback(async () => {
    if (!isOnline) {
      console.log('📴 Cannot sync from server while offline')
      return
    }

    // Check if user is authenticated
    if (!auth.currentUser) {
      console.log('⏸️ Sync from server skipped: User not authenticated yet')
      return
    }

    try {
      console.log('📥 Syncing data from server...')
      
      // Fetch all artifacts from server
      const artifacts = await getArtifacts()

      // Save to local cache
      for (const artifact of artifacts) {
        await saveArtifactOffline(artifact, true)
      }

      // Update last sync timestamp
      await updateLastSync()
      const lastSyncAt = await getLastSync()

      setSyncStatus(prev => ({
        ...prev,
        lastSyncAt: lastSyncAt || undefined
      }))

      console.log(`✅ Synced ${artifacts.length} artifacts from server`)
    } catch (error) {
      console.error('❌ Error syncing from server:', error)
    }
  }, [isOnline])

  /**
   * Full bidirectional sync
   */
  const fullSync = useCallback(async () => {
    if (!isOnline) {
      console.log('📴 Cannot sync while offline')
      return
    }

    console.log('🔄 Starting full sync...')
    
    // First sync pending changes to server
    await syncPendingChanges()
    
    // Then sync data from server
    await syncFromServer()
    
    console.log('✅ Full sync completed')
  }, [isOnline, syncPendingChanges, syncFromServer])

  /**
   * Update pending changes count
   */
  const updatePendingCount = useCallback(async () => {
    const count = await getPendingChangesCount()
    setSyncStatus(prev => ({ ...prev, pendingChanges: count }))
  }, [])

  // Database will be initialized lazily on first use via ensureDbReady()

  // Update sync status when online status changes
  useEffect(() => {
    setSyncStatus(prev => ({ ...prev, isOnline }))
    
    // Trigger sync when coming back online
    if (isOnline) {
      console.log('🌐 Back online, starting sync...')
      fullSync()
    }
  }, [isOnline, fullSync])

  // Update last sync time on mount
  useEffect(() => {
    const loadLastSync = async () => {
      const lastSyncAt = await getLastSync()
      setSyncStatus(prev => ({
        ...prev,
        lastSyncAt: lastSyncAt || undefined
      }))
    }
    loadLastSync()
  }, [])

  // Update pending changes count on mount and periodically
  useEffect(() => {
    updatePendingCount()
    
    const interval = setInterval(updatePendingCount, 5000) // Every 5 seconds
    
    return () => clearInterval(interval)
  }, [updatePendingCount])

  // Auto-sync interval when online
  useEffect(() => {
    if (!isOnline) return

    const interval = setInterval(() => {
      console.log('⏰ Auto-sync triggered')
      fullSync()
    }, SYNC_INTERVAL)

    return () => clearInterval(interval)
  }, [isOnline, fullSync])

  /**
   * Retry failed pending changes (reset retry count and sync)
   */
  const retryFailedChanges = useCallback(async () => {
    try {
      const resetCount = await resetFailedPendingChanges()
      if (resetCount > 0) {
        console.log(`🔄 Retrying ${resetCount} failed changes...`)
        await updatePendingCount()
        await fullSync()
      } else {
        console.log('✅ No failed changes to retry')
      }
    } catch (error) {
      console.error('❌ Error retrying failed changes:', error)
    }
  }, [fullSync, updatePendingCount])

  return {
    syncStatus,
    syncPendingChanges,
    syncFromServer,
    fullSync,
    updatePendingCount,
    retryFailedChanges
  }
}


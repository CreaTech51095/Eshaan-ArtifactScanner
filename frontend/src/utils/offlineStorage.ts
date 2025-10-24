import { db, CachedArtifact, CachedPhoto, PendingChange, ensureDbReady } from './db'
import { Artifact, Photo } from '../types/artifact'
import { SyncLog } from '../types/sync'

/**
 * Offline Storage utilities for managing local data
 */

// ============================================================================
// ARTIFACTS
// ============================================================================

/**
 * Save artifact to offline storage
 */
export const saveArtifactOffline = async (
  artifact: Artifact,
  synced: boolean = false
): Promise<void> => {
  try {
    await ensureDbReady()
    const cachedArtifact: CachedArtifact = {
      ...artifact,
      createdAt: artifact.createdAt.toString(),
      updatedAt: artifact.updatedAt?.toString() || artifact.createdAt.toString(),
      _synced: synced
    }
    await db.artifacts.put(cachedArtifact)
    console.log(`💾 Artifact ${artifact.id} saved to offline storage`)
  } catch (error) {
    console.error('❌ Error saving artifact offline:', error)
    throw error
  }
}

/**
 * Get artifact from offline storage
 */
export const getArtifactOffline = async (
  id: string
): Promise<CachedArtifact | null> => {
  try {
    await ensureDbReady()
    const artifact = await db.artifacts.get(id)
    return artifact || null
  } catch (error) {
    console.error('❌ Error getting artifact offline:', error)
    throw error
  }
}

/**
 * Get all artifacts from offline storage
 */
export const getAllArtifactsOffline = async (): Promise<CachedArtifact[]> => {
  try {
    await ensureDbReady()
    const artifacts = await db.artifacts.toArray()
    // Sort by createdAt descending
    artifacts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    return artifacts
  } catch (error) {
    console.error('❌ Error getting all artifacts offline:', error)
    throw error
  }
}

/**
 * Delete artifact from offline storage
 */
export const deleteArtifactOffline = async (id: string): Promise<void> => {
  try {
    await ensureDbReady()
    await db.artifacts.delete(id)
    console.log(`🗑️ Artifact ${id} deleted from offline storage`)
  } catch (error) {
    console.error('❌ Error deleting artifact offline:', error)
    throw error
  }
}

/**
 * Search artifacts in offline storage
 */
export const searchArtifactsOffline = async (
  searchTerm: string
): Promise<CachedArtifact[]> => {
  try {
    const allArtifacts = await getAllArtifactsOffline()
    const lowerSearchTerm = searchTerm.toLowerCase()
    
    return allArtifacts.filter(artifact => 
      artifact.name.toLowerCase().includes(lowerSearchTerm) ||
      artifact.description?.toLowerCase().includes(lowerSearchTerm) ||
      artifact.artifactType.toLowerCase().includes(lowerSearchTerm) ||
      artifact.discoverySite.toLowerCase().includes(lowerSearchTerm)
    )
  } catch (error) {
    console.error('❌ Error searching artifacts offline:', error)
    throw error
  }
}

// ============================================================================
// PHOTOS
// ============================================================================

/**
 * Save photo to offline storage
 */
export const savePhotoOffline = async (
  photo: Photo,
  dataUrl?: string,
  synced: boolean = false
): Promise<void> => {
  try {
    await ensureDbReady()
    const cachedPhoto: CachedPhoto = {
      ...photo,
      _synced: synced,
      _dataUrl: dataUrl
    }
    await db.photos.put(cachedPhoto)
    console.log(`💾 Photo ${photo.id} saved to offline storage`)
  } catch (error) {
    console.error('❌ Error saving photo offline:', error)
    throw error
  }
}

/**
 * Get photos for an artifact from offline storage
 */
export const getPhotosOffline = async (
  artifactId: string
): Promise<CachedPhoto[]> => {
  try {
    await ensureDbReady()
    const photos = await db.photos
      .where('artifactId')
      .equals(artifactId)
      .toArray()
    return photos
  } catch (error) {
    console.error('❌ Error getting photos offline:', error)
    throw error
  }
}

/**
 * Delete photo from offline storage
 */
export const deletePhotoOffline = async (id: string): Promise<void> => {
  try {
    await ensureDbReady()
    await db.photos.delete(id)
    console.log(`🗑️ Photo ${id} deleted from offline storage`)
  } catch (error) {
    console.error('❌ Error deleting photo offline:', error)
    throw error
  }
}

// ============================================================================
// PENDING CHANGES
// ============================================================================

/**
 * Add a pending change to the queue
 */
export const addPendingChange = async (
  change: Omit<PendingChange, 'id' | 'timestamp' | 'retries'>
): Promise<number> => {
  try {
    await ensureDbReady()
    const id = await db.pendingChanges.add({
      ...change,
      timestamp: Date.now(),
      retries: 0
    })
    console.log(`📝 Pending change added: ${change.action} ${change.entityType} ${change.entityId}`)
    return id
  } catch (error) {
    console.error('❌ Error adding pending change:', error)
    throw error
  }
}

/**
 * Get all pending changes
 */
export const getPendingChanges = async (): Promise<PendingChange[]> => {
  try {
    await ensureDbReady()
    const changes = await db.pendingChanges.toArray()
    // Sort by timestamp ascending (oldest first)
    changes.sort((a, b) => a.timestamp - b.timestamp)
    return changes
  } catch (error) {
    console.error('❌ Error getting pending changes:', error)
    throw error
  }
}

/**
 * Remove a pending change from the queue
 */
export const removePendingChange = async (id: number): Promise<void> => {
  try {
    await ensureDbReady()
    await db.pendingChanges.delete(id)
    console.log(`✅ Pending change ${id} removed`)
  } catch (error) {
    console.error('❌ Error removing pending change:', error)
    throw error
  }
}

/**
 * Update pending change retry count
 */
export const updatePendingChangeRetry = async (
  id: number,
  error?: string
): Promise<void> => {
  try {
    await ensureDbReady()
    const change = await db.pendingChanges.get(id)
    if (change) {
      await db.pendingChanges.update(id, {
        retries: change.retries + 1,
        error: error
      })
    }
  } catch (error) {
    console.error('❌ Error updating pending change retry:', error)
    throw error
  }
}

/**
 * Reset retry count on failed pending changes (allows them to be retried)
 */
export const resetFailedPendingChanges = async (): Promise<number> => {
  try {
    await ensureDbReady()
    const allChanges = await db.pendingChanges.toArray()
    const failedChanges = allChanges.filter(change => change.retries >= 3)
    
    for (const change of failedChanges) {
      if (change.id) {
        await db.pendingChanges.update(change.id, {
          retries: 0,
          error: undefined
        })
      }
    }
    
    console.log(`🔄 Reset ${failedChanges.length} failed pending changes`)
    return failedChanges.length
  } catch (error) {
    console.error('❌ Error resetting failed pending changes:', error)
    throw error
  }
}

/**
 * Get pending changes count
 */
export const getPendingChangesCount = async (): Promise<number> => {
  try {
    await ensureDbReady()
    const count = await db.pendingChanges.count()
    return count
  } catch (error: any) {
    // Silently return 0 if database isn't ready yet
    // This prevents flooding the console during initialization
    if (error.name === 'NotFoundError' || error.name === 'DatabaseClosedError') {
      return 0
    }
    console.error('❌ Error getting pending changes count:', error)
    return 0
  }
}

// ============================================================================
// SYNC LOGS
// ============================================================================

/**
 * Add a sync log entry
 */
export const addSyncLog = async (log: SyncLog): Promise<void> => {
  try {
    await ensureDbReady()
    await db.syncLogs.put(log)
    console.log(`📋 Sync log added: ${log.action} ${log.entityType} ${log.entityId}`)
  } catch (error) {
    console.error('❌ Error adding sync log:', error)
    throw error
  }
}

/**
 * Get sync logs for an entity
 */
export const getSyncLogs = async (
  entityType: string,
  entityId: string
): Promise<SyncLog[]> => {
  try {
    await ensureDbReady()
    const logs = await db.syncLogs
      .where('[entityType+entityId]')
      .equals([entityType, entityId])
      .toArray()
    return logs
  } catch (error) {
    console.error('❌ Error getting sync logs:', error)
    throw error
  }
}

// ============================================================================
// METADATA
// ============================================================================

/**
 * Update last sync timestamp
 */
export const updateLastSync = async (): Promise<void> => {
  try {
    await ensureDbReady()
    await db.metadata.put({
      key: 'lastSyncAt',
      value: new Date().toISOString(),
      updatedAt: Date.now()
    })
    console.log('✅ Last sync timestamp updated')
  } catch (error) {
    console.error('❌ Error updating last sync:', error)
    throw error
  }
}

/**
 * Get last sync timestamp
 */
export const getLastSync = async (): Promise<string | null> => {
  try {
    await ensureDbReady()
    const metadata = await db.metadata.get('lastSyncAt')
    return metadata?.value || null
  } catch (error) {
    console.error('❌ Error getting last sync:', error)
    return null
  }
}

/**
 * Update online status
 */
export const updateOnlineStatus = async (isOnline: boolean): Promise<void> => {
  try {
    await ensureDbReady()
    await db.metadata.put({
      key: 'isOnline',
      value: isOnline,
      updatedAt: Date.now()
    })
  } catch (error) {
    console.error('❌ Error updating online status:', error)
    throw error
  }
}

/**
 * Get online status
 */
export const getOnlineStatus = async (): Promise<boolean> => {
  try {
    await ensureDbReady()
    const metadata = await db.metadata.get('isOnline')
    return metadata?.value ?? navigator.onLine
  } catch (error) {
    console.error('❌ Error getting online status:', error)
    return navigator.onLine
  }
}

/**
 * Convert File to Data URL for offline storage
 */
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Convert Data URL to Blob
 */
export const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
  const response = await fetch(dataUrl)
  return await response.blob()
}


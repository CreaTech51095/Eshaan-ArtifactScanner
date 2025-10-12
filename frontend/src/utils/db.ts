import Dexie, { Table } from 'dexie'
import { Artifact, Photo } from '../types/artifact'
import { SyncLog } from '../types/sync'

export interface PendingChange {
  id?: number
  entityType: 'artifact' | 'photo'
  entityId: string
  action: 'create' | 'update' | 'delete'
  data: any
  timestamp: number
  retries: number
  error?: string
}

export interface CachedArtifact extends Omit<Artifact, 'createdAt' | 'updatedAt'> {
  createdAt: string
  updatedAt: string
  _localOnly?: boolean
  _synced: boolean
}

export interface CachedPhoto extends Photo {
  _localOnly?: boolean
  _synced: boolean
  _dataUrl?: string // For storing photo data offline
}

export interface AppMetadata {
  key: string
  value: any
  updatedAt: number
}

/**
 * Dexie Database for offline storage
 */
class ArtifactDatabase extends Dexie {
  artifacts!: Table<CachedArtifact, string>
  photos!: Table<CachedPhoto, string>
  pendingChanges!: Table<PendingChange, number>
  syncLogs!: Table<SyncLog, string>
  metadata!: Table<AppMetadata, string>

  constructor() {
    super('ArtifactScannerDB')
    
    // Database schema - increment version if schema changes
    this.version(2).stores({
      artifacts: 'id, name, artifactType, discoverySite, createdBy, createdAt, _synced',
      photos: 'id, artifactId, _synced',
      pendingChanges: '++id, entityType, entityId, action, timestamp',
      syncLogs: 'id, entityType, entityId, action, localTimestamp',
      metadata: 'key'
    })
  }
}

// Create and export database instance
export const db = new ArtifactDatabase()

// Track if we've tried to fix the database
let fixAttempted = false

/**
 * Ensure database is initialized before operations
 * Dexie automatically creates the database and tables on first access
 */
export const ensureDbReady = async () => {
  // If database is already open and working, return immediately
  if (db.isOpen()) {
    return
  }

  try {
    // Try to open the database
    await db.open()
  } catch (error: any) {
    console.warn('⚠️ Database error detected:', error.name)
    
    // If we haven't tried to fix it yet, delete and recreate
    if (!fixAttempted) {
      fixAttempted = true
      console.warn('🔄 Attempting to recreate database...')
      
      try {
        // Delete the old database
        await db.delete()
        console.log('🗑️ Old database deleted')
        
        // Wait a bit for IndexedDB to clean up
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Create new database by opening it
        await db.open()
        console.log('✅ Database recreated successfully')
      } catch (recreateError) {
        console.error('❌ Failed to recreate database:', recreateError)
        fixAttempted = false // Allow retry
        throw recreateError
      }
    } else {
      // Already tried to fix, just throw the error
      throw error
    }
  }
}

/**
 * Force reset database - delete and recreate from scratch
 */
export const forceResetDatabase = async () => {
  try {
    console.log('🔄 Force resetting database...')
    
    // Close the database first
    db.close()
    
    // Delete it
    await db.delete()
    console.log('🗑️ Database deleted')
    
    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Reset the fix flag
    fixAttempted = false
    
    // Reopen to recreate
    await db.open()
    console.log('✅ Database recreated successfully')
    
    return true
  } catch (error) {
    console.error('❌ Error resetting database:', error)
    throw error
  }
}

/**
 * Clear all data from the database (useful for logout)
 */
export const clearDatabase = async () => {
  try {
    await db.artifacts.clear()
    await db.photos.clear()
    await db.pendingChanges.clear()
    await db.syncLogs.clear()
    // Keep metadata
    console.log('✅ Database cleared successfully')
  } catch (error) {
    console.error('❌ Error clearing database:', error)
    throw error
  }
}

/**
 * Get database size estimation
 */
export const getDatabaseSize = async (): Promise<number> => {
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate()
      return estimate.usage || 0
    }
    return 0
  } catch (error) {
    console.error('❌ Error getting database size:', error)
    return 0
  }
}

/**
 * Export database for debugging
 */
export const exportDatabase = async () => {
  try {
    const artifacts = await db.artifacts.toArray()
    const photos = await db.photos.toArray()
    const pendingChanges = await db.pendingChanges.toArray()
    const syncLogs = await db.syncLogs.toArray()
    const metadata = await db.metadata.toArray()

    return {
      artifacts,
      photos,
      pendingChanges,
      syncLogs,
      metadata,
      exportedAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('❌ Error exporting database:', error)
    throw error
  }
}

export default db


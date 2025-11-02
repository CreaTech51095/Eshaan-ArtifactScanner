/**
 * Offline-capable artifacts service
 * Automatically uses offline storage when offline and syncs when online
 */

import { Artifact, CreateArtifactRequest, UpdateArtifactRequest } from '../types/artifact'
import {
  createArtifact as createArtifactOnline,
  updateArtifact as updateArtifactOnline,
  deleteArtifact as deleteArtifactOnline,
  getArtifact as getArtifactOnline,
  getArtifacts as getArtifactsOnline,
  searchArtifacts as searchArtifactsOnline
} from './artifacts'
import {
  saveArtifactOffline,
  getArtifactOffline,
  getAllArtifactsOffline,
  deleteArtifactOffline,
  searchArtifactsOffline,
  addPendingChange,
  fileToDataUrl,
  savePhotoOffline
} from '../utils/offlineStorage'
import { CachedArtifact } from '../utils/db'

/**
 * Convert cached artifact to Artifact type
 */
const cachedToArtifact = (cached: CachedArtifact): Artifact => ({
  ...cached,
  createdAt: new Date(cached.createdAt),
  updatedAt: new Date(cached.updatedAt)
})

/**
 * Create a new artifact (works offline)
 */
export const createArtifact = async (
  data: CreateArtifactRequest
): Promise<string> => {
  const isOnline = navigator.onLine

  try {
    if (isOnline) {
      // Online: Create in Firebase
      const artifactId = await createArtifactOnline(data)
      
      // Also save to offline cache for immediate access
      const artifact = await getArtifactOnline(artifactId)
      if (artifact) {
        await saveArtifactOffline(artifact, true)
      }
      
      return artifactId
    } else {
      // Offline: Save locally and queue for sync
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Convert photos to data URLs for offline storage
      const photoDataUrls: string[] = []
      const tempPhotos = []
      
      for (let i = 0; i < data.photos.length; i++) {
        const photo = data.photos[i]
        const dataUrl = await fileToDataUrl(photo)
        photoDataUrls.push(dataUrl)
        
        // Create temporary photo object for preview (using data URL as downloadUrl)
        tempPhotos.push({
          id: `temp-photo-${tempId}-${i}`,
          artifactId: tempId,
          downloadUrl: dataUrl, // Use data URL for offline preview
          storagePath: '', // Will be set when synced
          uploadedBy: 'current-user',
          uploadedAt: new Date().toISOString(),
          caption: photo.name
        })
      }

      // Create temporary artifact object
      const tempArtifact: CachedArtifact = {
        id: tempId,
        qrCode: '',
        name: data.name,
        description: data.description,
        artifactType: data.artifactType,
        material: data.material,
        materialSubtype: data.materialSubtype,
        objectClassification: data.objectClassification,
        discoveryDate: data.discoveryDate,
        discoverySite: data.discoverySite,
        location: data.location,
        photos: tempPhotos, // Include temp photos for offline preview
        metadata: data.metadata,
        createdBy: 'current-user', // Will be updated when synced
        createdAt: new Date().toISOString(),
        lastModifiedBy: 'current-user',
        lastModifiedAt: new Date().toISOString(),
        version: 1,
        isDeleted: false,
        _localOnly: true,
        _synced: false
      }

      // Save to offline storage
      await saveArtifactOffline(tempArtifact, false)

      // Queue for sync
      await addPendingChange({
        entityType: 'artifact',
        entityId: tempId,
        action: 'create',
        data: {
          ...data,
          tempId,
          photoDataUrls
        }
      })

      console.log('📴 Artifact created offline, will sync when online')
      return tempId
    }
  } catch (error) {
    console.error('❌ Error creating artifact:', error)
    throw error
  }
}

/**
 * Get a single artifact by ID (works offline)
 */
export const getArtifact = async (id: string): Promise<Artifact | null> => {
  const isOnline = navigator.onLine

  try {
    if (isOnline) {
      // Try online first
      try {
        const artifact = await getArtifactOnline(id)
        if (artifact) {
          // Cache for offline use
          await saveArtifactOffline(artifact, true)
          return artifact
        }
      } catch (onlineError) {
        console.warn('Failed to fetch online, falling back to cache')
      }
    }

    // Fallback to offline cache
    const cached = await getArtifactOffline(id)
    return cached ? cachedToArtifact(cached) : null
  } catch (error) {
    console.error('❌ Error getting artifact:', error)
    throw error
  }
}

/**
 * Get all artifacts (works offline)
 */
export const getArtifacts = async (): Promise<Artifact[]> => {
  const isOnline = navigator.onLine

  try {
    if (isOnline) {
      // Try online first
      try {
        const artifacts = await getArtifactsOnline()
        
        // Cache all artifacts for offline use
        for (const artifact of artifacts) {
          await saveArtifactOffline(artifact, true)
        }
        
        return artifacts
      } catch (onlineError) {
        console.warn('Failed to fetch online, falling back to cache')
      }
    }

    // Fallback to offline cache
    const cached = await getAllArtifactsOffline()
    return cached.map(cachedToArtifact)
  } catch (error) {
    console.error('❌ Error getting artifacts:', error)
    throw error
  }
}

/**
 * Update an existing artifact (works offline)
 */
export const updateArtifact = async (
  id: string,
  data: UpdateArtifactRequest
): Promise<void> => {
  const isOnline = navigator.onLine

  try {
    if (isOnline) {
      // Online: Update in Firebase
      await updateArtifactOnline(id, data)
      
      // Update cache
      const artifact = await getArtifactOnline(id)
      if (artifact) {
        await saveArtifactOffline(artifact, true)
      }
    } else {
      // Offline: Update locally and queue for sync
      const cached = await getArtifactOffline(id)
      if (!cached) {
        throw new Error('Artifact not found in offline cache')
      }

      // Convert new photos to data URLs if any
      let photoDataUrls: string[] | undefined
      let newTempPhotos = []
      
      if (data.photos && data.photos.length > 0) {
        photoDataUrls = []
        for (let i = 0; i < data.photos.length; i++) {
          const photo = data.photos[i]
          const dataUrl = await fileToDataUrl(photo)
          photoDataUrls.push(dataUrl)
          
          // Create temporary photo object for preview
          newTempPhotos.push({
            id: `temp-photo-${id}-${Date.now()}-${i}`,
            artifactId: id,
            downloadUrl: dataUrl, // Use data URL for offline preview
            storagePath: '', // Will be set when synced
            uploadedBy: 'current-user',
            uploadedAt: new Date().toISOString(),
            caption: photo.name
          })
        }
      }

      // Update local cache
      const updatedArtifact: CachedArtifact = {
        ...cached,
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.artifactType && { artifactType: data.artifactType }),
        ...(data.discoveryDate && { discoveryDate: data.discoveryDate }),
        ...(data.discoverySite && { discoverySite: data.discoverySite }),
        ...(data.location && { location: data.location }),
        ...(data.metadata && { metadata: data.metadata }),
        // Add new photos if any
        ...(newTempPhotos.length > 0 && { photos: [...cached.photos, ...newTempPhotos] }),
        lastModifiedAt: new Date().toISOString(),
        version: cached.version + 1,
        _synced: false
      }

      await saveArtifactOffline(updatedArtifact, false)

      // Queue for sync
      await addPendingChange({
        entityType: 'artifact',
        entityId: id,
        action: 'update',
        data: {
          ...data,
          photoDataUrls
        }
      })

      console.log('📴 Artifact updated offline, will sync when online')
    }
  } catch (error) {
    console.error('❌ Error updating artifact:', error)
    throw error
  }
}

/**
 * Delete an artifact (works offline)
 */
export const deleteArtifact = async (id: string): Promise<void> => {
  const isOnline = navigator.onLine

  try {
    if (isOnline) {
      // Online: Delete from Firebase
      await deleteArtifactOnline(id)
      
      // Remove from cache
      await deleteArtifactOffline(id)
    } else {
      // Offline: Mark as deleted locally and queue for sync
      const cached = await getArtifactOffline(id)
      if (cached) {
        const deletedArtifact: CachedArtifact = {
          ...cached,
          isDeleted: true,
          lastModifiedAt: new Date().toISOString(),
          _synced: false
        }
        
        await saveArtifactOffline(deletedArtifact, false)
      }

      // Queue for sync
      await addPendingChange({
        entityType: 'artifact',
        entityId: id,
        action: 'delete',
        data: {}
      })

      console.log('📴 Artifact deleted offline, will sync when online')
    }
  } catch (error) {
    console.error('❌ Error deleting artifact:', error)
    throw error
  }
}

/**
 * Search artifacts (works offline)
 */
export const searchArtifacts = async (searchTerm: string): Promise<Artifact[]> => {
  const isOnline = navigator.onLine

  try {
    if (isOnline) {
      // Try online first
      try {
        const artifacts = await searchArtifactsOnline(searchTerm)
        
        // Cache results
        for (const artifact of artifacts) {
          await saveArtifactOffline(artifact, true)
        }
        
        return artifacts
      } catch (onlineError) {
        console.warn('Failed to search online, falling back to cache')
      }
    }

    // Fallback to offline search
    const cached = await searchArtifactsOffline(searchTerm)
    return cached.map(cachedToArtifact)
  } catch (error) {
    console.error('❌ Error searching artifacts:', error)
    throw error
  }
}

/**
 * Check if an artifact is cached offline
 */
export const isArtifactCached = async (id: string): Promise<boolean> => {
  const cached = await getArtifactOffline(id)
  return cached !== null
}

/**
 * Get all artifacts that haven't been synced yet
 */
export const getUnsyncedArtifacts = async (): Promise<Artifact[]> => {
  const cached = await getAllArtifactsOffline()
  const unsynced = cached.filter(artifact => !artifact._synced)
  return unsynced.map(cachedToArtifact)
}


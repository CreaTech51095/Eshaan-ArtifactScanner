import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore'
import QRCode from 'qrcode'
import { db } from './firebase'
import { auth } from './firebase'
import { 
  Artifact, 
  CreateArtifactRequest, 
  UpdateArtifactRequest 
} from '../types/artifact'

const ARTIFACTS_COLLECTION = 'artifacts'

/**
 * Generate QR code data URL for an artifact
 */
const generateQRCodeDataURL = async (artifactId: string): Promise<string> => {
  try {
    const artifactUrl = `${window.location.origin}/artifacts/${artifactId}`
    const qrCodeDataUrl = await QRCode.toDataURL(artifactUrl, {
      width: 512,
      margin: 2,
      color: {
        dark: '#1e293b',
        light: '#ffffff'
      }
    })
    return qrCodeDataUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    return ''
  }
}

/**
 * Create a new artifact in Firestore
 */
export const createArtifact = async (
  data: CreateArtifactRequest
): Promise<string> => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to create artifacts')
    }

    // Prepare artifact data with metadata (without QR code first)
    const artifactData = {
      ...data,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isDeleted: false,
      version: 1,
      qrCodeUrl: null, // Will be updated after document creation
      photoCount: 0
    }

    // Add to Firestore
    const docRef = await addDoc(collection(db, ARTIFACTS_COLLECTION), artifactData)
    
    console.log('✅ Artifact created successfully with ID:', docRef.id)

    // Generate and update QR code URL
    try {
      const qrCodeUrl = await generateQRCodeDataURL(docRef.id)
      if (qrCodeUrl) {
        await updateDoc(doc(db, ARTIFACTS_COLLECTION, docRef.id), {
          qrCodeUrl: qrCodeUrl
        })
        console.log('✅ QR code generated and stored')
      }
    } catch (qrError) {
      console.warn('⚠️ QR code generation failed, but artifact was created:', qrError)
    }
    
    return docRef.id
  } catch (error) {
    console.error('❌ Error creating artifact:', error)
    throw error
  }
}

/**
 * Get a single artifact by ID
 */
export const getArtifact = async (id: string): Promise<Artifact | null> => {
  try {
    const docRef = doc(db, ARTIFACTS_COLLECTION, id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    const data = docSnap.data()
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as Artifact
  } catch (error) {
    console.error('❌ Error getting artifact:', error)
    throw error
  }
}

/**
 * Get all artifacts (non-deleted)
 */
export const getArtifacts = async (): Promise<Artifact[]> => {
  try {
    // Simple query without orderBy to avoid index requirement initially
    const q = query(
      collection(db, ARTIFACTS_COLLECTION),
      where('isDeleted', '==', false)
    )

    const querySnapshot = await getDocs(q)
    const artifacts: Artifact[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      artifacts.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      } as Artifact)
    })

    // Sort client-side by createdAt descending
    artifacts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return artifacts
  } catch (error) {
    console.error('❌ Error getting artifacts:', error)
    throw error
  }
}

/**
 * Update an existing artifact
 */
export const updateArtifact = async (
  id: string,
  data: UpdateArtifactRequest
): Promise<void> => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to update artifacts')
    }

    const docRef = doc(db, ARTIFACTS_COLLECTION, id)
    
    // Get current version
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      throw new Error('Artifact not found')
    }

    const currentVersion = docSnap.data().version || 1

    // Filter out undefined values (Firestore doesn't allow undefined)
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    )

    // Update with new data and increment version
    await updateDoc(docRef, {
      ...cleanData,
      updatedAt: serverTimestamp(),
      updatedBy: user.uid,
      version: currentVersion + 1
    })

    console.log('✅ Artifact updated successfully:', id)
  } catch (error) {
    console.error('❌ Error updating artifact:', error)
    throw error
  }
}

/**
 * Soft delete an artifact (mark as deleted)
 */
export const deleteArtifact = async (id: string): Promise<void> => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to delete artifacts')
    }

    const docRef = doc(db, ARTIFACTS_COLLECTION, id)

    await updateDoc(docRef, {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      deletedBy: user.uid,
      updatedAt: serverTimestamp()
    })

    console.log('✅ Artifact deleted successfully:', id)
  } catch (error) {
    console.error('❌ Error deleting artifact:', error)
    throw error
  }
}

/**
 * Search artifacts by various criteria
 */
export const searchArtifacts = async (
  searchTerm: string
): Promise<Artifact[]> => {
  try {
    // For now, get all artifacts and filter client-side
    // TODO: Implement proper full-text search with Algolia or similar
    const allArtifacts = await getArtifacts()
    
    const lowerSearchTerm = searchTerm.toLowerCase()
    
    return allArtifacts.filter(artifact => 
      artifact.name.toLowerCase().includes(lowerSearchTerm) ||
      artifact.description?.toLowerCase().includes(lowerSearchTerm) ||
      artifact.artifactType.toLowerCase().includes(lowerSearchTerm) ||
      artifact.discoverySite.toLowerCase().includes(lowerSearchTerm)
    )
  } catch (error) {
    console.error('❌ Error searching artifacts:', error)
    throw error
  }
}

/**
 * Filter artifacts by type
 */
export const getArtifactsByType = async (
  artifactType: string
): Promise<Artifact[]> => {
  try {
    const q = query(
      collection(db, ARTIFACTS_COLLECTION),
      where('isDeleted', '==', false),
      where('artifactType', '==', artifactType),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const artifacts: Artifact[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      artifacts.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      } as Artifact)
    })

    return artifacts
  } catch (error) {
    console.error('❌ Error getting artifacts by type:', error)
    throw error
  }
}

/**
 * Get artifacts by discovery site
 */
export const getArtifactsBySite = async (
  site: string
): Promise<Artifact[]> => {
  try {
    const q = query(
      collection(db, ARTIFACTS_COLLECTION),
      where('isDeleted', '==', false),
      where('discoverySite', '==', site),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const artifacts: Artifact[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      artifacts.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      } as Artifact)
    })

    return artifacts
  } catch (error) {
    console.error('❌ Error getting artifacts by site:', error)
    throw error
  }
}

/**
 * Generate QR codes for all artifacts that don't have one
 * Useful for updating existing artifacts
 */
export const generateMissingQRCodes = async (): Promise<number> => {
  try {
    const allArtifacts = await getArtifacts()
    let updated = 0

    for (const artifact of allArtifacts) {
      if (!artifact.qrCodeUrl) {
        try {
          const qrCodeUrl = await generateQRCodeDataURL(artifact.id)
          if (qrCodeUrl) {
            await updateDoc(doc(db, ARTIFACTS_COLLECTION, artifact.id), {
              qrCodeUrl: qrCodeUrl
            })
            updated++
            console.log(`✅ Generated QR code for artifact: ${artifact.id}`)
          }
        } catch (error) {
          console.error(`Failed to generate QR for ${artifact.id}:`, error)
        }
      }
    }

    console.log(`✅ Updated ${updated} artifacts with QR codes`)
    return updated
  } catch (error) {
    console.error('❌ Error generating missing QR codes:', error)
    throw error
  }
}


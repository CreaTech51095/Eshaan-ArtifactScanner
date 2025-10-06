import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { db, auth } from './firebase'
import {
  ArtifactComment,
  CreateCommentData,
  UpdateCommentData
} from '../types/comment'
import { authService } from './auth'

const COMMENTS_COLLECTION = 'artifactComments'

/**
 * Create a new comment or suggestion
 */
export const createComment = async (
  data: CreateCommentData
): Promise<string> => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated')
    }

    // Get current user profile
    const userProfile = await authService.getUserProfile(user.uid)

    const commentData = {
      artifactId: data.artifactId,
      userId: user.uid,
      userEmail: userProfile.email,
      username: userProfile.username,
      content: data.content,
      type: data.type,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isDeleted: false
    }

    const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), commentData)
    console.log('✅ Comment created:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('❌ Error creating comment:', error)
    throw error
  }
}

/**
 * Get all comments for an artifact
 */
export const getCommentsForArtifact = async (
  artifactId: string
): Promise<ArtifactComment[]> => {
  try {
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where('artifactId', '==', artifactId),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const comments: ArtifactComment[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      comments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date()
      } as ArtifactComment)
    })

    return comments
  } catch (error) {
    console.error('❌ Error getting comments:', error)
    throw error
  }
}

/**
 * Update a comment (only by the author)
 */
export const updateComment = async (
  commentId: string,
  data: UpdateCommentData
): Promise<void> => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated')
    }

    const commentRef = doc(db, COMMENTS_COLLECTION, commentId)

    await updateDoc(commentRef, {
      content: data.content,
      updatedAt: serverTimestamp()
    })

    console.log('✅ Comment updated:', commentId)
  } catch (error) {
    console.error('❌ Error updating comment:', error)
    throw error
  }
}

/**
 * Delete a comment (soft delete)
 */
export const deleteComment = async (commentId: string): Promise<void> => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated')
    }

    const commentRef = doc(db, COMMENTS_COLLECTION, commentId)

    await updateDoc(commentRef, {
      isDeleted: true,
      updatedAt: serverTimestamp()
    })

    console.log('✅ Comment deleted:', commentId)
  } catch (error) {
    console.error('❌ Error deleting comment:', error)
    throw error
  }
}


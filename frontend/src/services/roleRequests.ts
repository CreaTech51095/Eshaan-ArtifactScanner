import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db, auth } from './firebase'
import {
  RoleRequest,
  CreateRoleRequestData,
  ReviewRoleRequestData,
  RoleRequestStatus
} from '../types/roleRequest'
import { UserRole } from '../types/user'
import { authService } from './auth'

const ROLE_REQUESTS_COLLECTION = 'roleRequests'

/**
 * Create a new role request
 */
export const createRoleRequest = async (
  data: CreateRoleRequestData
): Promise<string> => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated')
    }

    // Get current user profile to get current role
    const userProfile = await authService.getUserProfile(user.uid)

    // Check if user already has a pending request
    const existingRequest = await getPendingRequestForUser(user.uid)
    if (existingRequest) {
      throw new Error('You already have a pending role request')
    }

    // Don't allow requesting a lower role
    if (data.requestedRole === 'researcher') {
      throw new Error('Cannot request researcher role')
    }

    const requestData = {
      userId: user.uid,
      userEmail: userProfile.email,
      username: userProfile.username,
      currentRole: userProfile.role,
      requestedRole: data.requestedRole,
      reason: data.reason,
      status: 'pending' as RoleRequestStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, ROLE_REQUESTS_COLLECTION), requestData)
    console.log('✅ Role request created:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('❌ Error creating role request:', error)
    throw error
  }
}

/**
 * Get pending request for a user
 */
export const getPendingRequestForUser = async (
  userId: string
): Promise<RoleRequest | null> => {
  try {
    const q = query(
      collection(db, ROLE_REQUESTS_COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'pending')
    )

    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) {
      return null
    }

    const doc = querySnapshot.docs[0]
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
      reviewedAt: data.reviewedAt?.toDate?.() || undefined
    } as RoleRequest
  } catch (error) {
    console.error('❌ Error getting pending request:', error)
    throw error
  }
}

/**
 * Get all role requests for a user
 */
export const getRoleRequestsForUser = async (
  userId: string
): Promise<RoleRequest[]> => {
  try {
    const q = query(
      collection(db, ROLE_REQUESTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const requests: RoleRequest[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      requests.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
        reviewedAt: data.reviewedAt?.toDate?.() || undefined
      } as RoleRequest)
    })

    return requests
  } catch (error) {
    console.error('❌ Error getting role requests:', error)
    throw error
  }
}

/**
 * Get all pending role requests (admin only)
 */
export const getAllPendingRequests = async (): Promise<RoleRequest[]> => {
  try {
    const q = query(
      collection(db, ROLE_REQUESTS_COLLECTION),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'asc')
    )

    const querySnapshot = await getDocs(q)
    const requests: RoleRequest[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      requests.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
        reviewedAt: data.reviewedAt?.toDate?.() || undefined
      } as RoleRequest)
    })

    return requests
  } catch (error) {
    console.error('❌ Error getting pending requests:', error)
    throw error
  }
}

/**
 * Review a role request (approve or deny) - Admin only
 */
export const reviewRoleRequest = async (
  requestId: string,
  reviewData: ReviewRoleRequestData
): Promise<void> => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated')
    }

    const requestRef = doc(db, ROLE_REQUESTS_COLLECTION, requestId)
    const requestSnap = await getDoc(requestRef)

    if (!requestSnap.exists()) {
      throw new Error('Role request not found')
    }

    const requestData = requestSnap.data() as RoleRequest

    // Update request status
    await updateDoc(requestRef, {
      status: reviewData.status,
      reviewedBy: user.uid,
      reviewedAt: serverTimestamp(),
      reviewNotes: reviewData.reviewNotes || '',
      updatedAt: serverTimestamp()
    })

    // If approved, update user's role
    if (reviewData.status === 'approved') {
      const userRef = doc(db, 'users', requestData.userId)
      await updateDoc(userRef, {
        role: requestData.requestedRole
      })
      console.log('✅ User role updated to:', requestData.requestedRole)
    }

    console.log('✅ Role request reviewed:', requestId, reviewData.status)
  } catch (error) {
    console.error('❌ Error reviewing role request:', error)
    throw error
  }
}

/**
 * Get all role requests (admin only)
 */
export const getAllRoleRequests = async (): Promise<RoleRequest[]> => {
  try {
    const q = query(
      collection(db, ROLE_REQUESTS_COLLECTION),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const requests: RoleRequest[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      requests.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
        reviewedAt: data.reviewedAt?.toDate?.() || undefined
      } as RoleRequest)
    })

    return requests
  } catch (error) {
    console.error('❌ Error getting all role requests:', error)
    throw error
  }
}


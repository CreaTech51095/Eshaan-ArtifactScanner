import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  orderBy
} from 'firebase/firestore'
import { db, auth } from './firebase'
import { GroupJoinRequest, CreateGroupRequestRequest } from '../types/groupRequest'
import { addMember } from './groupMembers'
import { getDefaultGroupPermissions } from '../types/group'

const GROUP_REQUESTS_COLLECTION = 'groupRequests'

/**
 * Create a request to join a group
 */
export const createJoinRequest = async (
  data: CreateGroupRequestRequest
): Promise<string> => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to request to join groups')
    }

    // Check if user already has a pending request
    const existingRequest = await getUserPendingRequest(data.groupId, user.uid)
    if (existingRequest) {
      throw new Error('You already have a pending request for this group')
    }

    const requestData = {
      groupId: data.groupId,
      userId: user.uid,
      status: 'pending',
      message: data.message || '',
      createdAt: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, GROUP_REQUESTS_COLLECTION), requestData)
    console.log('✅ Join request created successfully:', docRef.id)

    return docRef.id
  } catch (error) {
    console.error('❌ Error creating join request:', error)
    throw error
  }
}

/**
 * Get pending request for a specific user and group
 */
export const getUserPendingRequest = async (
  groupId: string,
  userId: string
): Promise<GroupJoinRequest | null> => {
  try {
    const q = query(
      collection(db, GROUP_REQUESTS_COLLECTION),
      where('groupId', '==', groupId),
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
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      reviewedAt: data.reviewedAt?.toDate?.()?.toISOString(),
    } as GroupJoinRequest
  } catch (error) {
    console.error('❌ Error getting user pending request:', error)
    throw error
  }
}

/**
 * Get all pending requests for a group
 */
export const getGroupPendingRequests = async (
  groupId: string
): Promise<GroupJoinRequest[]> => {
  try {
    const q = query(
      collection(db, GROUP_REQUESTS_COLLECTION),
      where('groupId', '==', groupId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const requests: GroupJoinRequest[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      requests.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        reviewedAt: data.reviewedAt?.toDate?.()?.toISOString(),
      } as GroupJoinRequest)
    })

    return requests
  } catch (error) {
    console.error('❌ Error getting group pending requests:', error)
    throw error
  }
}

/**
 * Approve a join request
 */
export const approveJoinRequest = async (
  requestId: string
): Promise<void> => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to approve requests')
    }

    // Get the request
    const requestDoc = await getDoc(doc(db, GROUP_REQUESTS_COLLECTION, requestId))
    if (!requestDoc.exists()) {
      throw new Error('Request not found')
    }

    const requestData = requestDoc.data() as GroupJoinRequest

    // Add user to group as a member
    await addMember(requestData.groupId, {
      userId: requestData.userId,
      role: 'member',
      permissions: getDefaultGroupPermissions('member')
    })

    // Update request status
    await updateDoc(doc(db, GROUP_REQUESTS_COLLECTION, requestId), {
      status: 'approved',
      reviewedAt: serverTimestamp(),
      reviewedBy: user.uid
    })

    console.log('✅ Join request approved:', requestId)
  } catch (error) {
    console.error('❌ Error approving join request:', error)
    throw error
  }
}

/**
 * Reject a join request
 */
export const rejectJoinRequest = async (
  requestId: string
): Promise<void> => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to reject requests')
    }

    await updateDoc(doc(db, GROUP_REQUESTS_COLLECTION, requestId), {
      status: 'rejected',
      reviewedAt: serverTimestamp(),
      reviewedBy: user.uid
    })

    console.log('✅ Join request rejected:', requestId)
  } catch (error) {
    console.error('❌ Error rejecting join request:', error)
    throw error
  }
}

/**
 * Cancel own join request
 */
export const cancelJoinRequest = async (
  requestId: string
): Promise<void> => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to cancel requests')
    }

    await updateDoc(doc(db, GROUP_REQUESTS_COLLECTION, requestId), {
      status: 'rejected',
      reviewedAt: serverTimestamp()
    })

    console.log('✅ Join request cancelled:', requestId)
  } catch (error) {
    console.error('❌ Error cancelling join request:', error)
    throw error
  }
}


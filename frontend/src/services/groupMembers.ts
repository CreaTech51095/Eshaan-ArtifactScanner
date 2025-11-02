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
  serverTimestamp
} from 'firebase/firestore'
import { db, auth } from './firebase'
import {
  GroupMember,
  GroupMemberRole,
  GroupPermissions,
  AddMemberRequest,
  UpdateMemberRequest,
  getDefaultGroupPermissions
} from '../types/group'

const GROUP_MEMBERS_COLLECTION = 'groupMembers'
const USERS_COLLECTION = 'users'

/**
 * Add a member to a group
 */
export const addMember = async (
  groupId: string,
  request: AddMemberRequest
): Promise<string> => {
  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('User must be authenticated to add members')
    }

    let targetUserId: string

    // Find user by email or use provided userId
    if (request.email) {
      const usersQuery = query(
        collection(db, USERS_COLLECTION),
        where('email', '==', request.email)
      )
      const usersSnapshot = await getDocs(usersQuery)
      
      if (usersSnapshot.empty) {
        throw new Error('User not found with this email')
      }
      
      targetUserId = usersSnapshot.docs[0].id
    } else if (request.userId) {
      targetUserId = request.userId
    } else {
      throw new Error('Either email or userId must be provided')
    }

    // Check if user is already a member
    const existingMembership = await getUserGroupMembership(groupId, targetUserId)
    if (existingMembership) {
      throw new Error('User is already a member of this group')
    }

    // Create member record
    const permissions = request.permissions 
      ? { ...getDefaultGroupPermissions(request.role), ...request.permissions }
      : getDefaultGroupPermissions(request.role)

    const memberData = {
      userId: targetUserId,
      groupId,
      role: request.role,
      permissions,
      joinedAt: serverTimestamp(),
      invitedBy: currentUser.uid
    }

    const docRef = await addDoc(collection(db, GROUP_MEMBERS_COLLECTION), memberData)
    console.log('✅ Member added successfully:', targetUserId)

    return docRef.id
  } catch (error) {
    console.error('❌ Error adding member:', error)
    throw error
  }
}

/**
 * Remove a member from a group
 */
export const removeMember = async (
  groupId: string,
  userId: string
): Promise<void> => {
  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('User must be authenticated to remove members')
    }

    // Find the membership record
    const membersQuery = query(
      collection(db, GROUP_MEMBERS_COLLECTION),
      where('groupId', '==', groupId),
      where('userId', '==', userId)
    )
    
    const membersSnapshot = await getDocs(membersQuery)
    
    if (membersSnapshot.empty) {
      throw new Error('Member not found in this group')
    }

    // Delete the membership
    const memberDoc = membersSnapshot.docs[0]
    await deleteDoc(doc(db, GROUP_MEMBERS_COLLECTION, memberDoc.id))

    console.log('✅ Member removed successfully:', userId)
  } catch (error) {
    console.error('❌ Error removing member:', error)
    throw error
  }
}

/**
 * Update member permissions
 */
export const updateMemberPermissions = async (
  groupId: string,
  userId: string,
  permissions: Partial<GroupPermissions>
): Promise<void> => {
  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('User must be authenticated to update permissions')
    }

    // Find the membership record
    const membersQuery = query(
      collection(db, GROUP_MEMBERS_COLLECTION),
      where('groupId', '==', groupId),
      where('userId', '==', userId)
    )
    
    const membersSnapshot = await getDocs(membersQuery)
    
    if (membersSnapshot.empty) {
      throw new Error('Member not found in this group')
    }

    const memberDoc = membersSnapshot.docs[0]
    const currentPermissions = memberDoc.data().permissions

    // Update permissions
    await updateDoc(doc(db, GROUP_MEMBERS_COLLECTION, memberDoc.id), {
      permissions: {
        ...currentPermissions,
        ...permissions
      }
    })

    console.log('✅ Member permissions updated:', userId)
  } catch (error) {
    console.error('❌ Error updating member permissions:', error)
    throw error
  }
}

/**
 * Update member role
 */
export const updateMemberRole = async (
  groupId: string,
  userId: string,
  role: GroupMemberRole
): Promise<void> => {
  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('User must be authenticated to update roles')
    }

    // Find the membership record
    const membersQuery = query(
      collection(db, GROUP_MEMBERS_COLLECTION),
      where('groupId', '==', groupId),
      where('userId', '==', userId)
    )
    
    const membersSnapshot = await getDocs(membersQuery)
    
    if (membersSnapshot.empty) {
      throw new Error('Member not found in this group')
    }

    const memberDoc = membersSnapshot.docs[0]

    // Update role and reset permissions to default for new role
    await updateDoc(doc(db, GROUP_MEMBERS_COLLECTION, memberDoc.id), {
      role,
      permissions: getDefaultGroupPermissions(role)
    })

    console.log('✅ Member role updated:', userId, 'to', role)
  } catch (error) {
    console.error('❌ Error updating member role:', error)
    throw error
  }
}

/**
 * Get all members of a group
 */
export const getGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
  try {
    const membersQuery = query(
      collection(db, GROUP_MEMBERS_COLLECTION),
      where('groupId', '==', groupId)
    )
    
    const membersSnapshot = await getDocs(membersQuery)
    const members: GroupMember[] = []

    membersSnapshot.forEach((doc) => {
      const data = doc.data()
      members.push({
        id: doc.id,
        ...data,
        joinedAt: data.joinedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as GroupMember)
    })

    return members
  } catch (error) {
    console.error('❌ Error getting group members:', error)
    throw error
  }
}

/**
 * Get specific user's membership in a group
 */
export const getUserGroupMembership = async (
  groupId: string,
  userId: string
): Promise<GroupMember | null> => {
  try {
    const membersQuery = query(
      collection(db, GROUP_MEMBERS_COLLECTION),
      where('groupId', '==', groupId),
      where('userId', '==', userId)
    )
    
    const membersSnapshot = await getDocs(membersQuery)
    
    if (membersSnapshot.empty) {
      return null
    }

    const doc = membersSnapshot.docs[0]
    const data = doc.data()
    
    return {
      id: doc.id,
      ...data,
      joinedAt: data.joinedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    } as GroupMember
  } catch (error) {
    console.error('❌ Error getting user group membership:', error)
    throw error
  }
}

/**
 * Get all groups a user is a member of
 */
export const getUserMemberships = async (userId: string): Promise<GroupMember[]> => {
  try {
    const membersQuery = query(
      collection(db, GROUP_MEMBERS_COLLECTION),
      where('userId', '==', userId)
    )
    
    const membersSnapshot = await getDocs(membersQuery)
    const memberships: GroupMember[] = []

    membersSnapshot.forEach((doc) => {
      const data = doc.data()
      memberships.push({
        id: doc.id,
        ...data,
        joinedAt: data.joinedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as GroupMember)
    })

    return memberships
  } catch (error) {
    console.error('❌ Error getting user memberships:', error)
    throw error
  }
}

/**
 * Leave a group (user removes themselves)
 */
export const leaveGroup = async (groupId: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('User must be authenticated to leave groups')
    }

    await removeMember(groupId, currentUser.uid)
    console.log('✅ Left group successfully')
  } catch (error) {
    console.error('❌ Error leaving group:', error)
    throw error
  }
}


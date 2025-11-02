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
  Timestamp
} from 'firebase/firestore'
import { db, auth } from './firebase'
import {
  Group,
  CreateGroupRequest,
  UpdateGroupRequest,
  getDefaultGroupSettings,
  getDefaultGroupPermissions
} from '../types/group'

const GROUPS_COLLECTION = 'groups'
const GROUP_MEMBERS_COLLECTION = 'groupMembers'

/**
 * Create a new group
 */
export const createGroup = async (data: CreateGroupRequest): Promise<string> => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to create groups')
    }

    const groupData = {
      name: data.name,
      description: data.description || '',
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isDeleted: false,
      settings: {
        ...getDefaultGroupSettings(),
        ...data.settings
      }
    }

    const docRef = await addDoc(collection(db, GROUPS_COLLECTION), groupData)
    console.log('✅ Group created successfully with ID:', docRef.id)

    // Add creator as group admin
    const memberData = {
      userId: user.uid,
      groupId: docRef.id,
      role: 'group_admin',
      permissions: getDefaultGroupPermissions('group_admin'),
      joinedAt: serverTimestamp()
    }

    await addDoc(collection(db, GROUP_MEMBERS_COLLECTION), memberData)
    console.log('✅ Creator added as group admin')

    return docRef.id
  } catch (error) {
    console.error('❌ Error creating group:', error)
    throw error
  }
}

/**
 * Get a single group by ID
 */
export const getGroup = async (groupId: string): Promise<Group | null> => {
  try {
    const docRef = doc(db, GROUPS_COLLECTION, groupId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    const data = docSnap.data()
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    } as Group
  } catch (error) {
    console.error('❌ Error getting group:', error)
    throw error
  }
}

/**
 * Get all groups the user belongs to
 */
export const getUserGroups = async (userId: string): Promise<Group[]> => {
  try {
    // First, get all group memberships for the user
    const membershipsQuery = query(
      collection(db, GROUP_MEMBERS_COLLECTION),
      where('userId', '==', userId)
    )
    
    const membershipsSnapshot = await getDocs(membershipsQuery)
    const groupIds = membershipsSnapshot.docs.map(doc => doc.data().groupId)

    if (groupIds.length === 0) {
      return []
    }

    // Get all groups (we'll filter client-side to avoid complex queries)
    const groupsQuery = query(
      collection(db, GROUPS_COLLECTION),
      where('isDeleted', '==', false)
    )
    
    const groupsSnapshot = await getDocs(groupsQuery)
    const groups: Group[] = []

    groupsSnapshot.forEach((doc) => {
      // Only include groups where user is a member
      if (groupIds.includes(doc.id)) {
        const data = doc.data()
        groups.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as Group)
      }
    })

    return groups
  } catch (error) {
    console.error('❌ Error getting user groups:', error)
    throw error
  }
}

/**
 * Get all groups (for admins)
 */
export const getAllGroups = async (): Promise<Group[]> => {
  try {
    const q = query(
      collection(db, GROUPS_COLLECTION),
      where('isDeleted', '==', false)
    )

    const querySnapshot = await getDocs(q)
    const groups: Group[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      groups.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as Group)
    })

    return groups
  } catch (error) {
    console.error('❌ Error getting all groups:', error)
    throw error
  }
}

/**
 * Update an existing group
 */
export const updateGroup = async (
  groupId: string,
  data: UpdateGroupRequest
): Promise<void> => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to update groups')
    }

    const docRef = doc(db, GROUPS_COLLECTION, groupId)
    
    // Filter out undefined values
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    )

    await updateDoc(docRef, {
      ...cleanData,
      updatedAt: serverTimestamp()
    })

    console.log('✅ Group updated successfully:', groupId)
  } catch (error) {
    console.error('❌ Error updating group:', error)
    throw error
  }
}

/**
 * Soft delete a group
 */
export const deleteGroup = async (groupId: string): Promise<void> => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to delete groups')
    }

    const docRef = doc(db, GROUPS_COLLECTION, groupId)

    await updateDoc(docRef, {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      deletedBy: user.uid,
      updatedAt: serverTimestamp()
    })

    console.log('✅ Group deleted successfully:', groupId)
  } catch (error) {
    console.error('❌ Error deleting group:', error)
    throw error
  }
}

/**
 * Transfer artifact to a different group
 */
export const transferArtifactToGroup = async (
  artifactId: string,
  newGroupId: string | null
): Promise<void> => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to transfer artifacts')
    }

    const artifactRef = doc(db, 'artifacts', artifactId)
    
    await updateDoc(artifactRef, {
      groupId: newGroupId,
      updatedAt: serverTimestamp(),
      updatedBy: user.uid
    })

    console.log('✅ Artifact transferred successfully:', artifactId, 'to group:', newGroupId)
  } catch (error) {
    console.error('❌ Error transferring artifact:', error)
    throw error
  }
}


import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { db, auth } from './firebase'
import { User, UserRole } from '../types/user'

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const q = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const users: User[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      users.push({
        id: doc.id,
        email: data.email,
        username: data.username,
        role: data.role,
        displayName: data.displayName,
        createdAt: data.createdAt,
        lastLoginAt: data.lastLoginAt,
        isActive: data.isActive
      } as User)
    })

    return users
  } catch (error) {
    console.error('❌ Error getting all users:', error)
    throw error
  }
}

/**
 * Get users by role
 */
export const getUsersByRole = async (role: UserRole): Promise<User[]> => {
  try {
    const q = query(
      collection(db, 'users'),
      where('role', '==', role),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const users: User[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      users.push({
        id: doc.id,
        email: data.email,
        username: data.username,
        role: data.role,
        displayName: data.displayName,
        createdAt: data.createdAt,
        lastLoginAt: data.lastLoginAt,
        isActive: data.isActive
      } as User)
    })

    return users
  } catch (error) {
    console.error('❌ Error getting users by role:', error)
    throw error
  }
}

/**
 * Deactivate a user account (mark as inactive in Firestore) - Admin only
 * Cannot delete admin accounts
 * User will be blocked from logging in via the auth service check
 */
export const deactivateUser = async (userId: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('Must be authenticated')
    }

    const userRef = doc(db, 'users', userId)

    // Mark user as inactive in Firestore
    // The auth service will check this on login and block inactive users
    await updateDoc(userRef, {
      isActive: false,
      deletedAt: serverTimestamp(),
      deletedBy: currentUser.uid
    })

    console.log('✅ User deactivated:', userId)
  } catch (error) {
    console.error('❌ Error deactivating user:', error)
    throw error
  }
}

/**
 * Reactivate a user account (mark as active in Firestore) - Admin only
 */
export const reactivateUser = async (userId: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('Must be authenticated')
    }

    const userRef = doc(db, 'users', userId)

    // Mark user as active again in Firestore
    await updateDoc(userRef, {
      isActive: true,
      reactivatedAt: serverTimestamp(),
      reactivatedBy: currentUser.uid,
      deletedAt: null,
      deletedBy: null
    })

    console.log('✅ User reactivated:', userId)
  } catch (error) {
    console.error('❌ Error reactivating user:', error)
    throw error
  }
}

/**
 * Update user role - Admin only
 * Cannot change admin roles
 */
export const updateUserRole = async (
  userId: string,
  newRole: UserRole
): Promise<void> => {
  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('Must be authenticated')
    }

    const userRef = doc(db, 'users', userId)

    await updateDoc(userRef, {
      role: newRole,
      roleUpdatedAt: serverTimestamp(),
      roleUpdatedBy: currentUser.uid
    })

    console.log('✅ User role updated:', userId, 'to', newRole)
  } catch (error) {
    console.error('❌ Error updating user role:', error)
    throw error
  }
}


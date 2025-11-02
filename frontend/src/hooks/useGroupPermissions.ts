import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { getUserGroupMembership } from '../services/groupMembers'
import { GroupMember, GroupPermissions, hasGroupPermission, isGroupAdmin as checkIsGroupAdmin } from '../types/group'

interface UseGroupPermissionsReturn {
  membership: GroupMember | null
  loading: boolean
  isGroupAdmin: boolean
  hasPermission: (permission: keyof GroupPermissions) => boolean
  canManageGroup: boolean
  reload: () => Promise<void>
}

/**
 * Hook to check group-level permissions for the current user
 */
export const useGroupPermissions = (groupId: string | undefined): UseGroupPermissionsReturn => {
  const { user } = useAuth()
  const [membership, setMembership] = useState<GroupMember | null>(null)
  const [loading, setLoading] = useState(true)

  const loadMembership = async () => {
    if (!user || !groupId) {
      setMembership(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const membershipData = await getUserGroupMembership(groupId, user.id)
      setMembership(membershipData)
    } catch (error) {
      console.error('Error loading group membership:', error)
      setMembership(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMembership()
  }, [user, groupId])

  const hasPermission = (permission: keyof GroupPermissions): boolean => {
    // Global admins have all permissions
    if (user?.role === 'admin') {
      return true
    }

    return hasGroupPermission(membership, permission)
  }

  const isAdmin = (): boolean => {
    // Global admins are always group admins
    if (user?.role === 'admin') {
      return true
    }

    return checkIsGroupAdmin(membership)
  }

  const canManage = (): boolean => {
    // Global admins can manage all groups
    if (user?.role === 'admin') {
      return true
    }

    // Group admins can manage their groups
    return checkIsGroupAdmin(membership)
  }

  return {
    membership,
    loading,
    isGroupAdmin: isAdmin(),
    hasPermission,
    canManageGroup: canManage(),
    reload: loadMembership
  }
}


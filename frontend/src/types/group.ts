// Group-related type definitions

export type GroupMemberRole = 'member' | 'group_admin'

export interface GroupPermissions {
  canCreateArtifacts: boolean
  canEditArtifacts: boolean
  canDeleteArtifacts: boolean
  canViewArtifacts: boolean
  canManageMembers: boolean
}

export interface Group {
  id: string
  name: string
  description?: string
  createdBy: string
  createdAt: string
  updatedAt?: string
  isDeleted: boolean
  settings: GroupSettings
  // Computed fields (not stored in Firestore)
  memberCount?: number
  artifactCount?: number
}

export interface GroupSettings {
  privacy: 'public' | 'private'
  defaultMemberPermissions: GroupPermissions
  allowMemberInvites: boolean // Whether regular members can invite others
}

export interface GroupMember {
  id: string // userId_groupId
  userId: string
  groupId: string
  role: GroupMemberRole
  permissions: GroupPermissions
  joinedAt: string
  invitedBy?: string
}

export interface GroupInvitation {
  id: string
  groupId: string
  invitedBy: string
  invitedEmail: string
  invitedUserId?: string // If user exists in system
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  createdAt: string
  expiresAt: string
  acceptedAt?: string
}

export interface CreateGroupRequest {
  name: string
  description?: string
  settings?: Partial<GroupSettings>
}

export interface UpdateGroupRequest {
  name?: string
  description?: string
  settings?: Partial<GroupSettings>
}

export interface AddMemberRequest {
  userId?: string
  email?: string
  role: GroupMemberRole
  permissions?: Partial<GroupPermissions>
}

export interface UpdateMemberRequest {
  role?: GroupMemberRole
  permissions?: Partial<GroupPermissions>
}

// Default permissions for different roles
export const getDefaultGroupPermissions = (role: GroupMemberRole): GroupPermissions => {
  switch (role) {
    case 'group_admin':
      return {
        canCreateArtifacts: true,
        canEditArtifacts: true,
        canDeleteArtifacts: true,
        canViewArtifacts: true,
        canManageMembers: true,
      }
    case 'member':
      return {
        canCreateArtifacts: true,
        canEditArtifacts: true,
        canDeleteArtifacts: false,
        canViewArtifacts: true,
        canManageMembers: false,
      }
    default:
      return {
        canCreateArtifacts: false,
        canEditArtifacts: false,
        canDeleteArtifacts: false,
        canViewArtifacts: true,
        canManageMembers: false,
      }
  }
}

export const getDefaultGroupSettings = (): GroupSettings => {
  return {
    privacy: 'private',
    defaultMemberPermissions: getDefaultGroupPermissions('member'),
    allowMemberInvites: false,
  }
}

// Helper to check if a user has a specific permission in a group
export const hasGroupPermission = (
  membership: GroupMember | null,
  permission: keyof GroupPermissions
): boolean => {
  if (!membership) return false
  return membership.permissions[permission] === true
}

// Helper to check if user is group admin
export const isGroupAdmin = (membership: GroupMember | null): boolean => {
  if (!membership) return false
  return membership.role === 'group_admin'
}


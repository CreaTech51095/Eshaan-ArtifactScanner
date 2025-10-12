export type UserRole = 'admin' | 'archaeologist' | 'researcher' | 'guest'

export interface User {
  id: string
  email: string
  username: string
  role: UserRole
  displayName?: string
  createdAt: string
  lastLoginAt: string
  isActive: boolean
}

export interface CreateUserRequest {
  email: string
  password: string
  username: string
  displayName?: string
  role: UserRole
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
  expiresIn?: string
}

export interface AuthError {
  code: string
  message: string
  details?: Record<string, any>
}

export interface UserProfile {
  id: string
  email: string
  username: string
  displayName?: string
  role: UserRole
  createdAt: string
  lastLoginAt: string
  isActive: boolean
}

export interface UpdateUserRequest {
  displayName?: string
  username?: string
}

export interface UserPermissions {
  canCreateArtifacts: boolean
  canEditArtifacts: boolean
  canDeleteArtifacts: boolean
  canUploadPhotos: boolean
  canDeletePhotos: boolean
  canManageUsers: boolean
}

export const getUserPermissions = (role: UserRole): UserPermissions => {
  switch (role) {
    case 'admin':
      return {
        canCreateArtifacts: true,
        canEditArtifacts: true,
        canDeleteArtifacts: true,
        canUploadPhotos: true,
        canDeletePhotos: true,
        canManageUsers: true,
      }
    case 'archaeologist':
      return {
        canCreateArtifacts: true,
        canEditArtifacts: true,
        canDeleteArtifacts: true,
        canUploadPhotos: true,
        canDeletePhotos: true,
        canManageUsers: false,
      }
    case 'researcher':
      return {
        canCreateArtifacts: false,
        canEditArtifacts: false,
        canDeleteArtifacts: false,
        canUploadPhotos: false,
        canDeletePhotos: false,
        canManageUsers: false,
      }
    case 'guest':
      return {
        canCreateArtifacts: false,
        canEditArtifacts: false,
        canDeleteArtifacts: false,
        canUploadPhotos: false,
        canDeletePhotos: false,
        canManageUsers: false,
      }
    default:
      return {
        canCreateArtifacts: false,
        canEditArtifacts: false,
        canDeleteArtifacts: false,
        canUploadPhotos: false,
        canDeletePhotos: false,
        canManageUsers: false,
      }
  }
}

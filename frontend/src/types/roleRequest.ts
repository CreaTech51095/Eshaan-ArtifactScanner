import { UserRole } from './user'

export type RoleRequestStatus = 'pending' | 'approved' | 'denied'

export interface RoleRequest {
  id: string
  userId: string
  userEmail: string
  username: string
  currentRole: UserRole
  requestedRole: UserRole
  reason: string
  status: RoleRequestStatus
  createdAt: Date
  updatedAt: Date
  reviewedBy?: string
  reviewedAt?: Date
  reviewNotes?: string
}

export interface CreateRoleRequestData {
  requestedRole: UserRole
  reason: string
}

export interface ReviewRoleRequestData {
  status: 'approved' | 'denied'
  reviewNotes?: string
}


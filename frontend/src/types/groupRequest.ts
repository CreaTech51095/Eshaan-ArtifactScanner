// Group join request types

export type GroupRequestStatus = 'pending' | 'approved' | 'rejected'

export interface GroupJoinRequest {
  id: string
  groupId: string
  userId: string
  status: GroupRequestStatus
  message?: string // Optional message from user explaining why they want to join
  createdAt: string
  reviewedAt?: string
  reviewedBy?: string
}

export interface CreateGroupRequestRequest {
  groupId: string
  message?: string
}

export interface ReviewGroupRequestRequest {
  requestId: string
  status: 'approved' | 'rejected'
}


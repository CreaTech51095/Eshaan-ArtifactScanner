import React, { useState, useEffect } from 'react'
import { Check, X, User, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { GroupJoinRequest } from '../../types/groupRequest'
import { User as UserType } from '../../types/user'
import { getGroupPendingRequests, approveJoinRequest, rejectJoinRequest } from '../../services/groupRequests'
import { getDoc, doc } from 'firebase/firestore'
import { db } from '../../services/firebase'
import LoadingSpinner from '../common/LoadingSpinner'

interface PendingRequestsListProps {
  groupId: string
  onRequestReviewed: () => void
}

const PendingRequestsList: React.FC<PendingRequestsListProps> = ({
  groupId,
  onRequestReviewed
}) => {
  const [requests, setRequests] = useState<GroupJoinRequest[]>([])
  const [userDetails, setUserDetails] = useState<Map<string, UserType>>(new Map())
  const [loading, setLoading] = useState(true)
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null)

  const loadRequests = async () => {
    try {
      setLoading(true)
      const requestsData = await getGroupPendingRequests(groupId)
      setRequests(requestsData)

      // Load user details for each request
      const details = new Map<string, UserType>()
      for (const request of requestsData) {
        try {
          const userDoc = await getDoc(doc(db, 'users', request.userId))
          if (userDoc.exists()) {
            details.set(request.userId, userDoc.data() as UserType)
          }
        } catch (error) {
          console.error('Error loading user details:', error)
        }
      }
      setUserDetails(details)
    } catch (error) {
      console.error('Error loading requests:', error)
      toast.error('Failed to load join requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [groupId])

  const handleApprove = async (requestId: string) => {
    try {
      setProcessingRequestId(requestId)
      await approveJoinRequest(requestId)
      toast.success('Request approved! User added to group.')
      await loadRequests()
      onRequestReviewed()
    } catch (error: any) {
      console.error('Error approving request:', error)
      toast.error(error.message || 'Failed to approve request')
    } finally {
      setProcessingRequestId(null)
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      setProcessingRequestId(requestId)
      await rejectJoinRequest(requestId)
      toast.success('Request rejected')
      await loadRequests()
    } catch (error: any) {
      console.error('Error rejecting request:', error)
      toast.error(error.message || 'Failed to reject request')
    } finally {
      setProcessingRequestId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner text="Loading requests..." />
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>No pending join requests</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => {
        const user = userDetails.get(request.userId)
        const isProcessing = processingRequestId === request.id

        return (
          <div
            key={request.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {user?.displayName || user?.username || 'Unknown User'}
                </div>
                <div className="text-sm text-gray-500">{user?.email}</div>
                {request.message && (
                  <div className="text-sm text-gray-600 mt-1 italic">
                    "{request.message}"
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-1">
                  Requested {new Date(request.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(request.id)}
                disabled={isProcessing}
                className="btn btn-sm bg-green-600 hover:bg-green-700 text-white"
                title="Approve request"
              >
                {isProcessing ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Approve
                  </>
                )}
              </button>
              <button
                onClick={() => handleReject(request.id)}
                disabled={isProcessing}
                className="btn btn-sm btn-ghost text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Reject request"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default PendingRequestsList


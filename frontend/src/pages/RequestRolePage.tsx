import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { UserRole } from '../types/user'
import { RoleRequest } from '../types/roleRequest'
import {
  createRoleRequest,
  getPendingRequestForUser,
  getRoleRequestsForUser
} from '../services/roleRequests'
import toast from 'react-hot-toast'
import { Shield, ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react'

const RequestRolePage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [requestedRole, setRequestedRole] = useState<UserRole>('archaeologist')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingRequest, setPendingRequest] = useState<RoleRequest | null>(null)
  const [requestHistory, setRequestHistory] = useState<RoleRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRequests()
  }, [user])

  const loadRequests = async () => {
    if (!user) return

    try {
      setLoading(true)
      const pending = await getPendingRequestForUser(user.id)
      setPendingRequest(pending)

      const history = await getRoleRequestsForUser(user.id)
      setRequestHistory(history)
    } catch (error: any) {
      console.error('Error loading requests:', error)
      // Only show error toast if it's not a permission issue
      if (!error.message?.includes('permission') && !error.message?.includes('denied')) {
        toast.error('Failed to load role requests')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason.trim()) {
      toast.error('Please provide a reason for your request')
      return
    }

    if (reason.trim().length < 20) {
      toast.error('Please provide a more detailed reason (at least 20 characters)')
      return
    }

    try {
      setIsSubmitting(true)
      await createRoleRequest({
        requestedRole,
        reason: reason.trim()
      })

      toast.success('Role request submitted successfully!')
      setReason('')
      loadRequests()
    } catch (error: any) {
      console.error('Error submitting request:', error)
      toast.error(error.message || 'Failed to submit request')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return null
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        )
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        )
      case 'denied':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            Denied
          </span>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/profile')}
          className="btn btn-ghost mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary-600" />
            Request Role Upgrade
          </h1>
          <p className="mt-2 text-gray-600">
            Current Role: <strong className="text-gray-900 capitalize">{user.role}</strong>
          </p>
        </div>

        {/* Pending Request Alert */}
        {pendingRequest && (
          <div className="card mb-6 border-yellow-300 bg-yellow-50">
            <div className="card-content">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900">Pending Request</h3>
                  <p className="text-yellow-800 text-sm mt-1">
                    You have a pending request for <strong className="capitalize">{pendingRequest.requestedRole}</strong> role.
                    Please wait for an administrator to review your request.
                  </p>
                  <p className="text-yellow-700 text-xs mt-2">
                    Submitted: {pendingRequest.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Request Form */}
        {!pendingRequest && user.role !== 'admin' && (
          <div className="card mb-6">
            <div className="card-header">
              <h2 className="text-xl font-semibold">Submit New Request</h2>
            </div>
            <form onSubmit={handleSubmit} className="card-content space-y-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Requested Role
                </label>
                <select
                  id="role"
                  value={requestedRole}
                  onChange={(e) => setRequestedRole(e.target.value as UserRole)}
                  className="input"
                  disabled={isSubmitting}
                >
                  <option value="archaeologist">Archaeologist - Create and edit artifacts</option>
                  {user.role === 'archaeologist' && (
                    <option value="admin">Administrator - Full system access</option>
                  )}
                </select>
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Request
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="input min-h-[120px]"
                  placeholder="Please explain why you need this role upgrade. Include your qualifications, experience, or institutional affiliation..."
                  disabled={isSubmitting}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {reason.length}/500 characters (minimum 20)
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || reason.length < 20}
                className="btn btn-primary w-full"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        )}

        {/* Already Admin */}
        {user.role === 'admin' && (
          <div className="card border-green-300 bg-green-50">
            <div className="card-content">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900">Administrator Account</h3>
                  <p className="text-green-800 text-sm mt-1">
                    You have the highest level of access. You can manage role requests from other users in the Admin Panel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Request History */}
        {requestHistory.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold">Request History</h2>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                {requestHistory.map((request) => (
                  <div
                    key={request.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          <span className="capitalize">{request.currentRole}</span>
                          {' → '}
                          <span className="capitalize">{request.requestedRole}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          {request.createdAt.toLocaleDateString()} at{' '}
                          {request.createdAt.toLocaleTimeString()}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Reason:</strong> {request.reason}
                    </p>
                    {request.reviewNotes && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>Admin Response:</strong> {request.reviewNotes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RequestRolePage


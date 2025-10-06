import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { RoleRequest } from '../types/roleRequest'
import {
  getAllPendingRequests,
  getAllRoleRequests,
  reviewRoleRequest
} from '../services/roleRequests'
import toast from 'react-hot-toast'
import { Shield, ArrowLeft, Clock, CheckCircle, XCircle, Users } from 'lucide-react'

const AdminPanelPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [pendingRequests, setPendingRequests] = useState<RoleRequest[]>([])
  const [allRequests, setAllRequests] = useState<RoleRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending')
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard', { replace: true })
      return
    }

    loadRequests()
  }, [user, navigate])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const [pending, all] = await Promise.all([
        getAllPendingRequests(),
        getAllRoleRequests()
      ])
      setPendingRequests(pending)
      setAllRequests(all)
    } catch (error) {
      console.error('Error loading requests:', error)
      toast.error('Failed to load role requests')
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (requestId: string, status: 'approved' | 'denied') => {
    try {
      await reviewRoleRequest(requestId, {
        status,
        reviewNotes: reviewNotes.trim() || undefined
      })

      toast.success(`Request ${status}!`)
      setReviewingId(null)
      setReviewNotes('')
      loadRequests()
    } catch (error: any) {
      console.error('Error reviewing request:', error)
      toast.error(error.message || 'Failed to review request')
    }
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

  if (!user || user.role !== 'admin') {
    return null
  }

  const displayRequests = activeTab === 'pending' ? pendingRequests : allRequests

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-ghost mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary-600" />
            Admin Panel
          </h1>
          <p className="mt-2 text-gray-600">
            Manage role requests from users
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`btn ${
              activeTab === 'pending' ? 'btn-primary' : 'btn-outline'
            }`}
          >
            <Clock className="w-4 h-4 mr-2" />
            Pending ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`btn ${
              activeTab === 'all' ? 'btn-primary' : 'btn-outline'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            All Requests ({allRequests.length})
          </button>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="card">
            <div className="card-content text-center py-12">
              <p className="text-gray-500">Loading requests...</p>
            </div>
          </div>
        ) : displayRequests.length === 0 ? (
          <div className="card">
            <div className="card-content text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {activeTab === 'pending' 
                  ? 'No pending requests'
                  : 'No role requests yet'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {displayRequests.map((request) => (
              <div key={request.id} className="card">
                <div className="card-content">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {request.username} ({request.userEmail})
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="capitalize">{request.currentRole}</span>
                        {' → '}
                        <span className="capitalize font-medium">{request.requestedRole}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Submitted: {request.createdAt.toLocaleDateString()} at{' '}
                        {request.createdAt.toLocaleTimeString()}
                      </p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {request.reason}
                    </p>
                  </div>

                  {request.status === 'pending' && (
                    <div className="border-t pt-4">
                      {reviewingId === request.id ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Review Notes (Optional)
                            </label>
                            <textarea
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                              className="input min-h-[80px]"
                              placeholder="Add any notes or feedback..."
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReview(request.id, 'approved')}
                              className="btn btn-primary flex-1"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReview(request.id, 'denied')}
                              className="btn btn-danger flex-1"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Deny
                            </button>
                            <button
                              onClick={() => {
                                setReviewingId(null)
                                setReviewNotes('')
                              }}
                              className="btn btn-ghost"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReviewingId(request.id)}
                          className="btn btn-primary w-full"
                        >
                          Review Request
                        </button>
                      )}
                    </div>
                  )}

                  {request.status !== 'pending' && (
                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600">
                        <strong>Reviewed:</strong> {request.reviewedAt?.toLocaleDateString()}
                      </p>
                      {request.reviewNotes && (
                        <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                          <strong>Notes:</strong> {request.reviewNotes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPanelPage


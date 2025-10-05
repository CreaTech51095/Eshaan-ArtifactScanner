import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { auth } from '../services/firebase'
import { deleteUser } from 'firebase/auth'
import toast from 'react-hot-toast'

const DeleteAccountPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm')
      return
    }

    if (!auth.currentUser || !user) {
      toast.error('No user logged in')
      return
    }

    setDeleting(true)
    try {
      const userId = auth.currentUser.uid

      // First, update Firestore to mark user as inactive/deleted
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
      const { db } = await import('../services/firebase')
      
      await updateDoc(doc(db, 'users', userId), {
        isActive: false,
        deletedAt: serverTimestamp(),
        deletedBy: userId
      })

      // Then delete the Firebase Auth account
      await deleteUser(auth.currentUser)
      
      toast.success('Account deleted successfully')
      navigate('/login')
    } catch (error: any) {
      console.error('Error deleting account:', error)
      
      // Handle specific error cases
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Please log out and log back in before deleting your account', {
          duration: 5000
        })
      } else {
        toast.error('Failed to delete account. Please try again.')
      }
    } finally {
      setDeleting(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/profile')}
          className="btn btn-ghost mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </button>

        <div className="card border-2 border-red-200">
          <div className="card-content">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Delete Account</h1>
                <p className="text-sm text-red-600">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-900 mb-2">⚠️ Warning</h3>
              <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                <li>Your account will be permanently deleted</li>
                <li>All your artifacts will remain in the system</li>
                <li>You will lose access to all your data</li>
                <li>This action cannot be reversed</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="font-bold text-red-600">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="input"
                  placeholder="Type DELETE here"
                  disabled={deleting}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/profile')}
                  className="btn btn-outline flex-1"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={confirmText !== 'DELETE' || deleting}
                  className="btn btn-danger flex-1"
                >
                  {deleting ? 'Deleting...' : 'Delete My Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteAccountPage


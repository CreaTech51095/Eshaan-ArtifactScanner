import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { auth } from '../services/firebase'

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<PasswordFormData>()

  const newPassword = watch('newPassword')

  const onSubmit = async (data: PasswordFormData) => {
    if (!auth.currentUser || !auth.currentUser.email) {
      toast.error('User not authenticated')
      return
    }

    setSaving(true)
    try {
      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        data.currentPassword
      )

      await reauthenticateWithCredential(auth.currentUser, credential)

      // Update password
      await updatePassword(auth.currentUser, data.newPassword)

      toast.success('Password changed successfully!', {
        duration: 3000,
        icon: '✅'
      })

      reset()
      navigate('/profile')
    } catch (error: any) {
      console.error('Error changing password:', error)
      
      if (error.code === 'auth/wrong-password') {
        toast.error('Current password is incorrect')
      } else if (error.code === 'auth/weak-password') {
        toast.error('New password is too weak. Use at least 6 characters')
      } else {
        toast.error(error.message || 'Failed to change password')
      }
    } finally {
      setSaving(false)
    }
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

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Change Password</h1>
          <p className="mt-2 text-gray-600">
            Update your account password
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="card-content space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Password Requirements:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>At least 6 characters long</li>
                  <li>Use a mix of letters, numbers, and symbols</li>
                  <li>Avoid common passwords</li>
                </ul>
              </div>
            </div>

            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                <Lock className="w-4 h-4 inline mr-1" />
                Current Password
              </label>
              <input
                {...register('currentPassword', {
                  required: 'Current password is required'
                })}
                type="password"
                id="currentPassword"
                className="input"
                placeholder="Enter your current password"
              />
              {errors.currentPassword && (
                <p className="text-red-600 text-sm mt-1">{errors.currentPassword.message}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                <Lock className="w-4 h-4 inline mr-1" />
                New Password
              </label>
              <input
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                type="password"
                id="newPassword"
                className="input"
                placeholder="Enter your new password"
              />
              {errors.newPassword && (
                <p className="text-red-600 text-sm mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                <Lock className="w-4 h-4 inline mr-1" />
                Confirm New Password
              </label>
              <input
                {...register('confirmPassword', {
                  required: 'Please confirm your new password',
                  validate: value => value === newPassword || 'Passwords do not match'
                })}
                type="password"
                id="confirmPassword"
                className="input"
                placeholder="Confirm your new password"
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="btn btn-outline flex-1"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary flex-1"
              >
                {saving ? 'Changing Password...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChangePasswordPage


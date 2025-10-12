import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Mail, Shield } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { doc, updateDoc } from 'firebase/firestore'
import { updateProfile, updateEmail } from 'firebase/auth'
import { db, auth } from '../services/firebase'

interface ProfileFormData {
  displayName: string
  username: string
  email: string
  role: string
}

const EditProfilePage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [showRoleChange, setShowRoleChange] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProfileFormData>({
    defaultValues: {
      displayName: user?.displayName || '',
      username: user?.username || '',
      email: user?.email || '',
      role: user?.role || ''
    }
  })

  const onSubmit = async (data: ProfileFormData) => {
    if (!user || !auth.currentUser) {
      toast.error('User not authenticated')
      return
    }

    setSaving(true)
    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: data.displayName
      })

      // Update email if changed
      if (data.email !== user.email) {
        try {
          await updateEmail(auth.currentUser, data.email)
        } catch (error: any) {
          if (error.code === 'auth/requires-recent-login') {
            toast.error('Please log out and log back in before changing your email', {
              duration: 5000
            })
            setSaving(false)
            return
          }
          throw error
        }
      }

      // Update Firestore user document
      const userRef = doc(db, 'users', user.id)
      const updates: any = {
        displayName: data.displayName,
        username: data.username,
        email: data.email
      }
      
      // Only update role if it changed and is a valid downgrade
      if (data.role !== user.role && user.role === 'archaeologist' && data.role === 'researcher') {
        updates.role = data.role
        toast.success('Role changed to Researcher. You now have read-only access.', {
          duration: 5000,
          icon: '⚠️'
        })
      }
      
      await updateDoc(userRef, updates)

      toast.success('Profile updated successfully!', {
        duration: 3000,
        icon: '✅'
      })

      // Reload the page to reflect changes
      window.location.href = '/profile'
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setSaving(false)
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

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="mt-2 text-gray-600">
            Update your personal information
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="card-content space-y-6">
            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4 inline mr-1" />
                Display Name
              </label>
              <input
                {...register('displayName', {
                  required: 'Display name is required',
                  minLength: {
                    value: 2,
                    message: 'Display name must be at least 2 characters'
                  },
                  maxLength: {
                    value: 50,
                    message: 'Display name must be less than 50 characters'
                  }
                })}
                type="text"
                id="displayName"
                className="input"
                placeholder="Enter your display name"
              />
              {errors.displayName && (
                <p className="text-red-600 text-sm mt-1">{errors.displayName.message}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4 inline mr-1" />
                Username
              </label>
              <input
                {...register('username', {
                  required: 'Username is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters'
                  },
                  maxLength: {
                    value: 30,
                    message: 'Username must be less than 30 characters'
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_-]+$/,
                    message: 'Username can only contain letters, numbers, hyphens, and underscores'
                  }
                })}
                type="text"
                id="username"
                className="input"
                placeholder="Enter your username"
              />
              {errors.username && (
                <p className="text-red-600 text-sm mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email format'
                  }
                })}
                type="email"
                id="email"
                className="input"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                ⚠️ Changing your email may require you to log in again
              </p>
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                <Shield className="w-4 h-4 inline mr-1" />
                Role
              </label>
              
              {user.role === 'archaeologist' ? (
                <>
                  <select
                    {...register('role')}
                    id="role"
                    className="input"
                    onChange={(e) => setShowRoleChange(e.target.value !== user.role)}
                  >
                    <option value="archaeologist">Archaeologist (Full Access)</option>
                    <option value="researcher">Researcher (Read-Only)</option>
                  </select>
                  
                  {showRoleChange && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-yellow-800 text-sm">
                        <strong>⚠️ Downgrading to Researcher:</strong> You will lose the ability to create and edit artifacts. 
                        You'll need to contact an administrator to upgrade back to Archaeologist.
                      </p>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-500 mt-1">
                    You can downgrade to Researcher for read-only access. Contact an administrator to upgrade to Admin.
                  </p>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    id="role"
                    value={user.role === 'researcher' ? 'Researcher (Read-Only)' : user.role === 'admin' ? 'Administrator' : user.role === 'guest' ? 'Guest' : user.role}
                    className="input bg-gray-100 cursor-not-allowed"
                    disabled
                    readOnly
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {user.role === 'researcher' 
                      ? 'Contact an administrator to upgrade to Archaeologist or Admin roles.'
                      : user.role === 'guest'
                      ? 'Guest accounts have read-only access. Create a full account for more features.'
                      : 'Contact an administrator if you need a different role.'
                    }
                  </p>
                </>
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
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditProfilePage


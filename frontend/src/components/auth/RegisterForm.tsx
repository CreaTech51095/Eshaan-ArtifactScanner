import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../hooks/useAuth'
import { CreateUserRequest, UserRole } from '../../types/user'
import toast from 'react-hot-toast'

interface RegisterFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const { register: registerUser, loading, error, clearError } = useAuth()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<CreateUserRequest & { confirmPassword: string }>()

  const password = watch('password')

  const onSubmit = async (data: CreateUserRequest & { confirmPassword: string }) => {
    try {
      setIsSubmitting(true)
      clearError()
      
      const { confirmPassword, ...userData } = data
      // Role is already set from the form dropdown
      await registerUser(userData)
      
      const roleDisplay = userData.role === 'archaeologist' ? 'Archaeologist' : 'Researcher'
      toast.success(`Registration successful! Your account has been created with ${roleDisplay} access.`)
      
      // Explicitly navigate to dashboard after successful registration
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 100)
      
      onSuccess?.()
    } catch (err: any) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="card">
        <div className="card-header">
          <h2 className="text-2xl font-bold text-center">Create Account</h2>
          <p className="text-center text-secondary-600 mt-2">
            Join the archaeological artifacts management system
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="card-content space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 text-sm">{error.message}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1">
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
              placeholder="archaeologist@university.edu"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-secondary-700 mb-1">
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
                  value: 50,
                  message: 'Username must be less than 50 characters'
                },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: 'Username can only contain letters, numbers, and underscores'
                }
              })}
              type="text"
              id="username"
              className="input"
              placeholder="archaeologist_jane"
            />
            {errors.username && (
              <p className="text-red-600 text-sm mt-1">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-secondary-700 mb-1">
              Display Name (Optional)
            </label>
            <input
              {...register('displayName', {
                maxLength: {
                  value: 100,
                  message: 'Display name must be less than 100 characters'
                }
              })}
              type="text"
              id="displayName"
              className="input"
              placeholder="Dr. Jane Smith"
            />
            {errors.displayName && (
              <p className="text-red-600 text-sm mt-1">{errors.displayName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-secondary-700 mb-1">
              Account Type *
            </label>
            <select
              {...register('role', {
                required: 'Please select an account type'
              })}
              id="role"
              className="input"
              defaultValue="archaeologist"
            >
              <option value="archaeologist">Archaeologist (Full Access)</option>
              <option value="researcher">Researcher (Read-Only)</option>
            </select>
            {errors.role && (
              <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>
            )}
            
            <div className="mt-2 space-y-2">
              <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                <strong>Archaeologist:</strong> Create, edit, delete, and manage your own artifacts with photo uploads.
              </div>
              <div className="p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700">
                <strong>Researcher:</strong> View and browse artifacts (read-only access).
              </div>
            </div>
            
            <p className="text-sm text-gray-500 mt-2">
              💡 You can change between Archaeologist and Researcher roles anytime in your profile settings. 
              Contact an administrator to request Admin access.
            </p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-1">
              Password
            </label>
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              type="password"
              id="password"
              className="input"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 mb-1">
              Confirm Password
            </label>
            <input
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match'
              })}
              type="password"
              id="confirmPassword"
              className="input"
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="btn btn-primary btn-md w-full"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="card-footer">
          <p className="text-center text-sm text-secondary-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterForm

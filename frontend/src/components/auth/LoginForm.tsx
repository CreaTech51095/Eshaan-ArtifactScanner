import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../hooks/useAuth'
import { LoginRequest } from '../../types/user'
import toast from 'react-hot-toast'

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToRegister?: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const { login, loading, error, clearError } = useAuth()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<LoginRequest>()

  const onSubmit = async (data: LoginRequest) => {
    try {
      setIsSubmitting(true)
      clearError()
      await login(data)
      toast.success('Login successful!')
      
      // Navigate to dashboard after successful login
      navigate('/dashboard', { replace: true })
      
      onSuccess?.()
    } catch (err: any) {
      toast.error(err.message || 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="card">
        <div className="card-header">
          <h2 className="text-2xl font-bold text-center">Sign In</h2>
          <p className="text-center text-secondary-600 mt-2">
            Sign in to your archaeological artifacts account
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

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="btn btn-primary btn-md w-full"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="card-footer">
          <p className="text-center text-sm text-secondary-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginForm

import React, { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoginForm from '../components/auth/LoginForm'
import RegisterForm from '../components/auth/RegisterForm'
import authService from '../services/auth'
import toast from 'react-hot-toast'
import { UserRound } from 'lucide-react'

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [guestLoading, setGuestLoading] = useState(false)

  const handleGuestLogin = async () => {
    setGuestLoading(true)
    try {
      await authService.loginAsGuest()
      toast.success('Welcome, Guest! Browse artifacts without an account.', {
        icon: '👋',
        duration: 4000
      })
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Guest login error:', error)
      
      // Check if it's an auth error related to anonymous auth not being enabled
      if (error.message?.includes('auth/operation-not-allowed') || 
          error.message?.includes('auth/admin-restricted-operation')) {
        toast.error('Guest mode is not enabled in Firebase. Please enable Anonymous Authentication in the Firebase Console.', {
          duration: 6000
        })
      } else {
        toast.error(error.message || 'Failed to continue as guest. Please try again.')
      }
    } finally {
      setGuestLoading(false)
    }
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <svg
              className="h-8 w-8 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-secondary-900">
            Archaeological Artifacts Scanner
          </h1>
          <p className="mt-2 text-sm text-secondary-600">
            Manage and scan archaeological artifacts with QR codes
          </p>
        </div>

        {isLogin ? (
          <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
        )}

        {/* Guest Login Option */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-primary-50 to-secondary-100 text-gray-500">
                Or
              </span>
            </div>
          </div>

          <button
            onClick={handleGuestLogin}
            disabled={guestLoading}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <UserRound className="w-5 h-5" />
            {guestLoading ? 'Signing in as Guest...' : 'Continue as Guest'}
          </button>
          <p className="mt-2 text-xs text-center text-gray-500">
            Browse artifacts without creating an account (read-only access)
          </p>
        </div>

        <div className="mt-8 text-center">
          <div className="text-xs text-secondary-500">
            <p>Demo Credentials:</p>
            <p className="mt-1">
              <strong>Admin:</strong> admin@university.edu / admin123
            </p>
            <p>
              <strong>Archaeologist:</strong> archaeologist@university.edu / archaeologist123
            </p>
            <p>
              <strong>Researcher:</strong> researcher@university.edu / researcher123
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

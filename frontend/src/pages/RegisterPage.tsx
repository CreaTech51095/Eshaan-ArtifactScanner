import React from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import RegisterForm from '../components/auth/RegisterForm'

const RegisterPage: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-main-gradient flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-archaeological-lightBrown">
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-archaeological-charcoal">
            Create Your Account
          </h1>
          <p className="mt-2 text-sm text-archaeological-charcoal">
            Join the Archaeological Artifacts community
          </p>
        </div>

        <RegisterForm onSwitchToLogin={() => navigate('/login')} />

        <div className="mt-4 text-center">
          <p className="text-sm text-archaeological-olive">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-medium text-primary-600 hover:text-primary-500 underline"
            >
              Log in here
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage



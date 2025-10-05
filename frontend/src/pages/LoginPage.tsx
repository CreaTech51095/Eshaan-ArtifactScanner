import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoginForm from '../components/auth/LoginForm'
import RegisterForm from '../components/auth/RegisterForm'

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const [isLogin, setIsLogin] = useState(true)

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

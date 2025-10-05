import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/common/LoadingSpinner'

const DashboardPage: React.FC = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.displayName || user?.username}!
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your archaeological artifacts and discoveries
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card">
            <div className="card-content">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Total Artifacts
              </h3>
              <p className="text-3xl font-bold text-primary-600">0</p>
              <p className="text-sm text-gray-500 mt-1">
                Artifacts in your collection
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Recent Discoveries
              </h3>
              <p className="text-3xl font-bold text-green-600">0</p>
              <p className="text-sm text-gray-500 mt-1">
                This month
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Photos Uploaded
              </h3>
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-sm text-gray-500 mt-1">
                Total photos
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('/artifacts/new')}
              className="btn btn-primary btn-lg"
            >
              Add New Artifact
            </button>
            <button 
              onClick={() => navigate('/scanner')}
              className="btn btn-outline btn-lg"
            >
              Scan QR Code
            </button>
            <button 
              onClick={() => navigate('/artifacts')}
              className="btn btn-outline btn-lg"
            >
              View All Artifacts
            </button>
            <button 
              onClick={() => alert('Photo upload will be available soon!')}
              className="btn btn-outline btn-lg"
            >
              Upload Photos
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { getUserPermissions } from '../types/user'
import { getArtifacts } from '../services/artifacts'
import { Artifact } from '../types/artifact'

interface DashboardStats {
  totalArtifacts: number
  recentDiscoveries: number
  totalPhotos: number
}

const DashboardPage: React.FC = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const permissions = user ? getUserPermissions(user.role) : null
  const [stats, setStats] = useState<DashboardStats>({
    totalArtifacts: 0,
    recentDiscoveries: 0,
    totalPhotos: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true)
        const artifacts = await getArtifacts()
        
        // Calculate stats
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        
        const totalArtifacts = artifacts.length
        const recentDiscoveries = artifacts.filter((artifact: Artifact) => {
          const createdAt = new Date(artifact.createdAt)
          return createdAt >= startOfMonth
        }).length
        const totalPhotos = artifacts.reduce((sum: number, artifact: Artifact) => {
          return sum + (artifact.photos?.length || 0)
        }, 0)
        
        setStats({
          totalArtifacts,
          recentDiscoveries,
          totalPhotos,
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoadingStats(false)
      }
    }

    if (user) {
      fetchStats()
    }
  }, [user])

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
              {loadingStats ? (
                <div className="text-3xl font-bold text-gray-400">...</div>
              ) : (
                <p className="text-3xl font-bold text-primary-600">{stats.totalArtifacts}</p>
              )}
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
              {loadingStats ? (
                <div className="text-3xl font-bold text-gray-400">...</div>
              ) : (
                <p className="text-3xl font-bold text-green-600">{stats.recentDiscoveries}</p>
              )}
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
              {loadingStats ? (
                <div className="text-3xl font-bold text-gray-400">...</div>
              ) : (
                <p className="text-3xl font-bold text-blue-600">{stats.totalPhotos}</p>
              )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {permissions?.canCreateArtifacts && (
              <button 
                onClick={() => navigate('/artifacts/new')}
                className="btn btn-primary btn-lg"
              >
                Add New Artifact
              </button>
            )}
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage

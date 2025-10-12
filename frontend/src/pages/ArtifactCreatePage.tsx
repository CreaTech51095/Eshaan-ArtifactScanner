import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import ArtifactForm from '../components/artifacts/ArtifactForm'
import { CreateArtifactRequest } from '../types/artifact'
import { createArtifact } from '../services/artifacts'
import { useAuth } from '../hooks/useAuth'
import { getUserPermissions } from '../types/user'

const ArtifactCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const permissions = user ? getUserPermissions(user.role) : null
  const [loading, setLoading] = React.useState(false)

  // Redirect if user doesn't have permission to create artifacts
  useEffect(() => {
    if (user && !permissions?.canCreateArtifacts) {
      toast.error('You do not have permission to create artifacts')
      navigate('/artifacts')
    }
  }, [user, permissions, navigate])

  const handleSubmit = async (data: CreateArtifactRequest) => {
    setLoading(true)
    try {
      console.log('Creating artifact:', data)
      
      // Create artifact in Firebase
      const artifactId = await createArtifact(data)
      
      // Show success message
      toast.success('Artifact created successfully!', {
        duration: 3000,
        icon: '✅'
      })
      
      // Navigate to the artifact detail page
      navigate(`/artifacts/${artifactId}`)
    } catch (error: any) {
      console.error('Error creating artifact:', error)
      
      // Show error message
      toast.error(error.message || 'Failed to create artifact. Please try again.', {
        duration: 4000,
        icon: '❌'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-ghost mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Artifact</h1>
          <p className="mt-2 text-gray-600">
            Record a new archaeological artifact in your collection
          </p>
        </div>

        <div className="card">
          <div className="card-content">
            <ArtifactForm onSubmit={handleSubmit} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArtifactCreatePage


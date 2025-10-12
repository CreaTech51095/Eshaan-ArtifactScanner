import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import ArtifactForm from '../components/artifacts/ArtifactForm'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { getArtifact, updateArtifact } from '../services/artifacts'
import { CreateArtifactRequest } from '../types/artifact'
import { useAuth } from '../hooks/useAuth'
import { getUserPermissions } from '../types/user'

const ArtifactEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [initialData, setInitialData] = useState<Partial<CreateArtifactRequest>>()

  useEffect(() => {
    const loadArtifact = async () => {
      // Check permissions first
      if (user) {
        const permissions = getUserPermissions(user.role)
        if (!permissions.canEditArtifacts) {
          toast.error('You do not have permission to edit artifacts')
          navigate('/artifacts')
          return
        }
      }

      if (!id) {
        navigate('/artifacts')
        return
      }

      try {
        setLoading(true)
        const artifact = await getArtifact(id)
        
        if (!artifact) {
          toast.error('Artifact not found')
          navigate('/artifacts')
          return
        }

        // Prepare initial data for the form
        setInitialData({
          name: artifact.name,
          description: artifact.description || '',
          artifactType: artifact.artifactType,
          discoveryDate: artifact.discoveryDate,
          discoverySite: artifact.discoverySite,
          location: artifact.location,
          gpsCoordinates: artifact.gpsCoordinates,
          dimensions: artifact.dimensions,
          material: artifact.material,
          condition: artifact.condition,
          notes: artifact.notes || ''
        })
      } catch (error) {
        console.error('Error loading artifact:', error)
        toast.error('Failed to load artifact')
        navigate('/artifacts')
      } finally {
        setLoading(false)
      }
    }

    loadArtifact()
  }, [id, navigate, user])

  const handleSubmit = async (data: CreateArtifactRequest) => {
    if (!id) return

    setSaving(true)
    try {
      console.log('Updating artifact:', id, data)
      
      // Update artifact in Firebase
      await updateArtifact(id, data)
      
      // Show success message
      toast.success('Artifact updated successfully!', {
        duration: 3000,
        icon: '✅'
      })
      
      // Navigate back to the artifact detail page
      navigate(`/artifacts/${id}`)
    } catch (error: any) {
      console.error('Error updating artifact:', error)
      
      // Show error message
      toast.error(error.message || 'Failed to update artifact. Please try again.', {
        duration: 4000,
        icon: '❌'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Loading artifact..." />
      </div>
    )
  }

  if (!initialData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-600">Artifact not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(`/artifacts/${id}`)}
          className="btn btn-ghost mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Artifact
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Artifact</h1>
          <p className="mt-2 text-gray-600">
            Update the details of your archaeological artifact
          </p>
        </div>

        <div className="card">
          <div className="card-content">
            <ArtifactForm 
              onSubmit={handleSubmit} 
              loading={saving}
              initialData={initialData}
              isEditMode={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArtifactEditPage


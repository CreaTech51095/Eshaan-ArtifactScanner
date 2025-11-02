import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import ArtifactForm from '../components/artifacts/ArtifactForm'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { getArtifact, updateArtifact } from '../services/artifactsOffline'
import { CreateArtifactRequest, Artifact } from '../types/artifact'
import { useAuth } from '../hooks/useAuth'
import { getUserPermissions, getUserPermissionsInGroup } from '../types/user'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { getUserGroupMembership } from '../services/groupMembers'

const ArtifactEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isOnline = useOnlineStatus()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [initialData, setInitialData] = useState<Partial<CreateArtifactRequest>>()
  const [existingPhotos, setExistingPhotos] = useState<any[]>([])
  const [artifact, setArtifact] = useState<Artifact | null>(null)

  useEffect(() => {
    const loadArtifact = async () => {
      if (!id) {
        navigate('/artifacts')
        return
      }

      try {
        setLoading(true)
        const artifactData = await getArtifact(id)
        
        if (!artifactData) {
          toast.error('Artifact not found')
          navigate('/artifacts')
          return
        }

        setArtifact(artifactData)

        // Check permissions (global or group-specific)
        if (user) {
          let hasEditPermission = false
          
          if (artifactData.groupId) {
            // Check group permissions
            const membership = await getUserGroupMembership(user.id, artifactData.groupId)
            if (membership) {
              const permissions = getUserPermissionsInGroup(user.role, {
                canCreateArtifacts: membership.permissions.canCreateArtifacts,
                canEditArtifacts: membership.permissions.canEditArtifacts,
                canDeleteArtifacts: membership.permissions.canDeleteArtifacts,
                canViewArtifacts: membership.permissions.canViewArtifacts
              })
              hasEditPermission = permissions.canEditArtifacts
            }
          } else {
            // Check global permissions
            const permissions = getUserPermissions(user.role)
            hasEditPermission = permissions.canEditArtifacts
          }

          if (!hasEditPermission) {
            toast.error('You do not have permission to edit this artifact')
            navigate('/artifacts')
            return
          }
        }

        // Prepare initial data for the form
        setInitialData({
          name: artifactData.name,
          description: artifactData.description || '',
          artifactType: artifactData.artifactType,
          material: artifactData.material,
          materialSubtype: artifactData.materialSubtype,
          objectClassification: artifactData.objectClassification,
          discoveryDate: artifactData.discoveryDate,
          discoverySite: artifactData.discoverySite,
          location: artifactData.location,
          gpsCoordinates: artifactData.gpsCoordinates,
          dimensions: artifactData.dimensions,
          condition: artifactData.condition,
          notes: artifactData.notes || '',
          groupId: artifactData.groupId
        })
        
        // Store existing photos
        setExistingPhotos(artifactData.photos || [])
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
      navigate('/artifacts/' + id)
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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading artifact..." />
      </div>
    )
  }

  if (!initialData) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-archaeological-charcoal">Artifact not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/artifacts/' + id)}
          className="btn btn-ghost mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Artifact
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-archaeological-charcoal">Edit Artifact</h1>
          <p className="mt-2 text-archaeological-charcoal">
            Update the details of your archaeological artifact
          </p>
        </div>

        <div className="card">
          <div className="card-content">
            <ArtifactForm 
              onSubmit={handleSubmit} 
              loading={saving}
              initialData={initialData}
              existingPhotos={existingPhotos}
              isEditMode={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArtifactEditPage

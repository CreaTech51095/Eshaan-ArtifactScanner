import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, MapPin, Calendar, Package, QrCode, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ArtifactQRCode from '../components/artifacts/ArtifactQRCode'
import { getArtifact, deleteArtifact } from '../services/artifactsOffline'
import { Artifact } from '../types/artifact'
import { useAuth } from '../hooks/useAuth'
import { getUserPermissions, getUserPermissionsInGroup } from '../types/user'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { useGroupPermissions } from '../hooks/useGroupPermissions'

const ArtifactDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isOnline = useOnlineStatus()
  const [artifact, setArtifact] = useState<Artifact | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  
  // Get group permissions if artifact belongs to a group
  const { membership, loading: groupLoading } = useGroupPermissions(artifact?.groupId || undefined)
  
  // Combine global and group permissions
  const permissions = user
    ? artifact && artifact.groupId && membership
      ? getUserPermissionsInGroup(user.role, {
          canCreateArtifacts: membership.permissions.canCreateArtifacts,
          canEditArtifacts: membership.permissions.canEditArtifacts,
          canDeleteArtifacts: membership.permissions.canDeleteArtifacts,
          canViewArtifacts: membership.permissions.canViewArtifacts
        })
      : getUserPermissions(user.role)
    : null

  useEffect(() => {
    const loadArtifact = async () => {
      if (!id) return

      try {
        setLoading(true)
        const data = await getArtifact(id)
        if (data) {
          console.log('🔍 Loaded artifact data:', data)
          console.log('📸 Photos array:', data.photos)
          console.log('📸 Photos count:', data.photos?.length || 0)
          setArtifact(data)
        } else {
          toast.error('Artifact not found')
          navigate('/artifacts')
        }
      } catch (error) {
        console.error('Error loading artifact:', error)
        toast.error('Failed to load artifact')
      } finally {
        setLoading(false)
      }
    }

    loadArtifact()
  }, [id, navigate])

  const handleDelete = async () => {
    if (!id || !artifact) return

    const confirmed = window.confirm(
      `Are you sure you want to delete "${artifact.name}"? This action cannot be undone.`
    )

    if (!confirmed) return

    try {
      setDeleting(true)
      await deleteArtifact(id)
      toast.success('Artifact deleted successfully')
      navigate('/artifacts')
    } catch (error: any) {
      console.error('Error deleting artifact:', error)
      toast.error(error.message || 'Failed to delete artifact')
    } finally {
      setDeleting(false)
    }
  }

  if (loading || groupLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading artifact..." />
      </div>
    )
  }

  if (!artifact) {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/artifacts')}
          className="btn btn-ghost mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Artifacts
        </button>

        <div className="card">
          <div className="card-content">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-archaeological-charcoal mb-2">
                  {artifact.name}
                </h1>
                <div className="flex flex-wrap gap-2">
                  {/* Material Badge */}
                  {artifact.material && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      Material: {artifact.material}
                      {artifact.materialSubtype && ` (${artifact.materialSubtype})`}
                    </span>
                  )}
                  {/* Object Classification Badge */}
                  {artifact.objectClassification && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Type: {artifact.objectClassification}
                    </span>
                  )}
                  {/* Legacy Artifact Type (for backward compatibility) */}
                  {!artifact.material && !artifact.objectClassification && artifact.artifactType && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-archaeological-lightBrown text-primary-800">
                      {artifact.artifactType}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="btn btn-outline btn-sm"
                  title="Show QR Code"
                >
                  <QrCode className="w-4 h-4" />
                </button>
                {/* Show edit button if user has edit permissions (includes group permissions) */}
                {user && permissions?.canEditArtifacts && (
                  <>
                    <button
                      onClick={() => navigate(`/artifacts/${id}/edit`)}
                      className="btn btn-outline btn-sm"
                      title="Edit artifact"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </>
                )}
                {/* Show delete button if user has delete permissions (includes group permissions) */}
                {user && permissions?.canDeleteArtifacts && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="btn btn-danger btn-sm"
                    title="Delete artifact"
                  >
                    {deleting ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {showQRCode && (
              <div className="mb-6 p-6 bg-archaeological-warmGray rounded-lg border border-archaeological-lightBrown">
                <h2 className="text-lg font-semibold text-archaeological-charcoal mb-4 text-center">QR Code</h2>
                <ArtifactQRCode artifactId={id!} artifactName={artifact.name} />
              </div>
            )}

            {/* Photo Gallery */}
            {artifact.photos && Array.isArray(artifact.photos) && artifact.photos.length > 0 ? (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-archaeological-charcoal mb-4">Photos ({artifact.photos.length})</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {artifact.photos.map((photo, index) => (
                    <div key={photo.id || index} className="relative group">
                      <img
                        src={photo.url}
                        alt={photo.caption || `Artifact photo ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg border-2 border-archaeological-lightBrown hover:border-primary-500 transition-colors cursor-pointer"
                        onClick={() => window.open(photo.url, '_blank')}
                        onError={(e) => {
                          console.error('Failed to load image:', photo.url)
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0Y1RjFFRCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM3QTlCNzYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+'
                        }}
                      />
                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-2 rounded-b-lg">
                          {photo.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-6 p-6 bg-archaeological-warmGray rounded-lg border border-archaeological-lightBrown">
                <p className="text-archaeological-olive text-center">No photos available for this artifact</p>
                <p className="text-archaeological-sage text-sm text-center mt-1">
                  This artifact may have been created before photo upload was available
                </p>
              </div>
            )}

            {artifact.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-archaeological-charcoal mb-2">Description</h2>
                <p className="text-archaeological-charcoal whitespace-pre-wrap">{artifact.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-archaeological-sage mt-1" />
                <div>
                  <p className="text-sm font-medium text-archaeological-olive">Discovery Date</p>
                  <p className="text-archaeological-charcoal">{artifact.discoveryDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-archaeological-sage mt-1" />
                <div>
                  <p className="text-sm font-medium text-archaeological-olive">Discovery Site</p>
                  <p className="text-archaeological-charcoal">{artifact.discoverySite}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-archaeological-sage mt-1" />
                <div>
                  <p className="text-sm font-medium text-archaeological-olive">Current Location</p>
                  <p className="text-archaeological-charcoal">{artifact.location}</p>
                </div>
              </div>

              {artifact.gpsCoordinates && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-archaeological-sage mt-1" />
                  <div>
                    <p className="text-sm font-medium text-archaeological-olive">GPS Coordinates</p>
                    <p className="text-archaeological-charcoal">
                      {artifact.gpsCoordinates.latitude}, {artifact.gpsCoordinates.longitude}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {artifact.notes && (
              <div className="mt-6 pt-6 border-t border-archaeological-lightBrown">
                <h2 className="text-lg font-semibold text-archaeological-charcoal mb-2">Notes</h2>
                <p className="text-archaeological-charcoal whitespace-pre-wrap">{artifact.notes}</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-archaeological-lightBrown text-sm text-archaeological-olive">
              <p>Created: {new Date(artifact.createdAt).toLocaleString()}</p>
              <p>Last updated: {new Date(artifact.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArtifactDetailPage

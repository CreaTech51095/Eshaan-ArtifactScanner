import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, MapPin, Calendar, Package, QrCode, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ArtifactQRCode from '../components/artifacts/ArtifactQRCode'
import { getArtifact, deleteArtifact } from '../services/artifacts'
import { Artifact } from '../types/artifact'
import { useAuth } from '../hooks/useAuth'
import { getUserPermissions } from '../types/user'

const ArtifactDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const permissions = user ? getUserPermissions(user.role) : null
  const [artifact, setArtifact] = useState<Artifact | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Loading artifact..." />
      </div>
    )
  }

  if (!artifact) {
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {artifact.name}
                </h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                  {artifact.artifactType}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="btn btn-outline btn-sm"
                  title="Show QR Code"
                >
                  <QrCode className="w-4 h-4" />
                </button>
                {/* Only show edit button if user has edit permissions */}
                {user && permissions?.canEditArtifacts && (user.id === artifact.createdBy || user.role === 'admin') && (
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
                {/* Admins can delete any artifact, archaeologists can delete their own */}
                {user && permissions?.canDeleteArtifacts && (user.id === artifact.createdBy || user.role === 'admin') && (
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
              <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">QR Code</h2>
                <ArtifactQRCode artifactId={id!} artifactName={artifact.name} />
              </div>
            )}

            {/* Photo Gallery */}
            {artifact.photos && Array.isArray(artifact.photos) && artifact.photos.length > 0 ? (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Photos ({artifact.photos.length})</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {artifact.photos.map((photo, index) => (
                    <div key={photo.id || index} className="relative group">
                      <img
                        src={photo.url}
                        alt={photo.caption || `Artifact photo ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors cursor-pointer"
                        onClick={() => window.open(photo.url, '_blank')}
                        onError={(e) => {
                          console.error('Failed to load image:', photo.url)
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+'
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
              <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500 text-center">No photos available for this artifact</p>
                <p className="text-gray-400 text-sm text-center mt-1">
                  This artifact may have been created before photo upload was available
                </p>
              </div>
            )}

            {artifact.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{artifact.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Discovery Date</p>
                  <p className="text-gray-900">{artifact.discoveryDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Discovery Site</p>
                  <p className="text-gray-900">{artifact.discoverySite}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Current Location</p>
                  <p className="text-gray-900">{artifact.location}</p>
                </div>
              </div>

              {artifact.gpsCoordinates && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">GPS Coordinates</p>
                    <p className="text-gray-900">
                      {artifact.gpsCoordinates.latitude}, {artifact.gpsCoordinates.longitude}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {artifact.notes && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Notes</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{artifact.notes}</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-500">
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

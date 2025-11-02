import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Package, Image } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { getArtifacts } from '../services/artifactsOffline'
import { Artifact } from '../types/artifact'
import { useAuth } from '../hooks/useAuth'
import { getUserPermissions } from '../types/user'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

const ArtifactListPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isOnline = useOnlineStatus()
  const permissions = user ? getUserPermissions(user.role) : null
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadArtifacts()
  }, [])

  const loadArtifacts = async () => {
    try {
      setLoading(true)
      const data = await getArtifacts()
      setArtifacts(data)
      console.log('✅ Loaded artifacts:', data.length)
      console.log('📸 First artifact photos:', data[0]?.photos)
      data.forEach((artifact, index) => {
        console.log(`Artifact ${index}: ${artifact.name} - Photos: ${artifact.photos?.length || 0}`)
      })
    } catch (error: any) {
      console.error('Error loading artifacts:', error)
      toast.error('Failed to load artifacts')
    } finally {
      setLoading(false)
    }
  }

  const filteredArtifacts = artifacts.filter(artifact =>
    artifact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artifact.artifactType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artifact.discoverySite.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artifact.material?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artifact.materialSubtype?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artifact.objectClassification?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading artifacts..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-archaeological-charcoal">Artifacts</h1>
            <p className="mt-2 text-archaeological-charcoal">
              Browse and manage your archaeological artifacts
            </p>
          </div>
          {permissions?.canCreateArtifacts && (
            <button
              onClick={() => navigate('/artifacts/new')}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Artifact
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-archaeological-sage w-5 h-5" />
            <input
              type="text"
              placeholder="Search artifacts by name, type, or site..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
        </div>

        {/* Artifacts Grid */}
        {filteredArtifacts.length === 0 ? (
          <div className="card">
            <div className="card-content text-center py-12">
              <Package className="w-16 h-16 text-archaeological-sage mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-archaeological-charcoal mb-2">
                {searchTerm ? 'No artifacts found' : 'No artifacts yet'}
              </h3>
              <p className="text-archaeological-charcoal mb-6">
                {searchTerm
                  ? 'Try adjusting your search criteria'
                  : permissions?.canCreateArtifacts 
                    ? 'Get started by adding your first artifact'
                    : 'No artifacts available yet'}
              </p>
              {!searchTerm && permissions?.canCreateArtifacts && (
                <button
                  onClick={() => navigate('/artifacts/new')}
                  className="btn btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Artifact
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtifacts.map((artifact) => (
              <div
                key={artifact.id}
                onClick={() => navigate(`/artifacts/${artifact.id}`)}
                className="card hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
              >
                {/* Photo Thumbnail */}
                {artifact.photos && Array.isArray(artifact.photos) && artifact.photos.length > 0 ? (
                  <div className="w-full h-48 overflow-hidden relative">
                    <img
                      src={artifact.photos[0].url}
                      alt={artifact.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Failed to load thumbnail:', artifact.photos[0].url)
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-48 bg-archaeological-warmGray flex items-center justify-center"><svg class="w-12 h-12 text-archaeological-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>'
                      }}
                    />
                    {artifact.photos.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                        +{artifact.photos.length - 1} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-48 bg-archaeological-warmGray flex items-center justify-center">
                    <Image className="w-12 h-12 text-archaeological-sage" />
                    <span className="absolute text-xs text-archaeological-olive mt-20">No photos</span>
                  </div>
                )}

                <div className="card-content">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-archaeological-charcoal line-clamp-2">
                      {artifact.name}
                    </h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {/* Material Badge */}
                    {artifact.material && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {artifact.material}
                        {artifact.materialSubtype && ` (${artifact.materialSubtype})`}
                      </span>
                    )}
                    {/* Object Classification Badge */}
                    {artifact.objectClassification && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {artifact.objectClassification}
                      </span>
                    )}
                    {/* Legacy Type (for backward compatibility) */}
                    {!artifact.material && !artifact.objectClassification && artifact.artifactType && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-archaeological-lightBrown text-primary-800">
                        {artifact.artifactType}
                      </span>
                    )}
                  </div>

                  {artifact.description && (
                    <p className="text-sm text-archaeological-charcoal mb-3 line-clamp-2">
                      {artifact.description}
                    </p>
                  )}

                  <div className="space-y-1 text-sm text-archaeological-olive">
                    <p>
                      <span className="font-medium">Site:</span> {artifact.discoverySite}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span> {artifact.discoveryDate}
                    </p>
                    <p>
                      <span className="font-medium">Location:</span> {artifact.location}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-archaeological-lightBrown text-xs text-archaeological-olive">
                    Added {new Date(artifact.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results count */}
        {filteredArtifacts.length > 0 && (
          <div className="mt-6 text-center text-sm text-archaeological-olive">
            Showing {filteredArtifacts.length} of {artifacts.length} artifact{artifacts.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}

export default ArtifactListPage

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { getArtifacts } from '../services/artifacts'
import { Artifact } from '../types/artifact'

const ArtifactListPage: React.FC = () => {
  const navigate = useNavigate()
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
    artifact.discoverySite.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Loading artifacts..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Artifacts</h1>
            <p className="mt-2 text-gray-600">
              Browse and manage your archaeological artifacts
            </p>
          </div>
          <button
            onClick={() => navigate('/artifacts/new')}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Artifact
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No artifacts found' : 'No artifacts yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? 'Try adjusting your search criteria'
                  : 'Get started by adding your first artifact'}
              </p>
              {!searchTerm && (
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
                className="card hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="card-content">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {artifact.name}
                    </h3>
                  </div>
                  
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mb-3">
                    {artifact.artifactType}
                  </span>

                  {artifact.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {artifact.description}
                    </p>
                  )}

                  <div className="space-y-1 text-sm text-gray-500">
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

                  <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-400">
                    Added {new Date(artifact.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results count */}
        {filteredArtifacts.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Showing {filteredArtifacts.length} of {artifacts.length} artifact{artifacts.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}

export default ArtifactListPage

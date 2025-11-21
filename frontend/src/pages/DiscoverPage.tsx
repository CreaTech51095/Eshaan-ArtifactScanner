import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, MapPin, Calendar, User, Heart, Share2, MessageCircle } from 'lucide-react'
import { Artifact } from '../types/artifact'
import { getArtifacts } from '../services/artifactsOffline'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

interface ArtifactFeedItem extends Artifact {
  relevanceScore: number
  source: 'database' | 'museum'
  museumName?: string
}

const DiscoverPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [feedItems, setFeedItems] = useState<ArtifactFeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [likedArtifacts, setLikedArtifacts] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadDiscoveryFeed()
  }, [user])

  const loadDiscoveryFeed = async () => {
    try {
      setLoading(true)
      const artifacts = await getArtifacts()
      
      // Apply personalized algorithm
      const scoredArtifacts = artifacts.map((artifact: Artifact) => ({
        ...artifact,
        relevanceScore: calculateRelevanceScore(artifact),
        source: 'database' as const,
      }))

      // Sort by relevance score
      const sortedArtifacts = scoredArtifacts.sort((a, b) => b.relevanceScore - a.relevanceScore)
      
      // Add some randomization to prevent same feed every time
      const shuffledArtifacts = addRandomization(sortedArtifacts)
      
      setFeedItems(shuffledArtifacts)
    } catch (error) {
      console.error('Error loading discovery feed:', error)
      toast.error('Failed to load discovery feed')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Calculate relevance score based on multiple factors
   * Higher score = more relevant to user
   */
  const calculateRelevanceScore = (artifact: Artifact): number => {
    let score = 0
    
    // Recency boost (newer artifacts score higher)
    const daysOld = Math.floor((Date.now() - new Date(artifact.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    if (daysOld < 7) score += 50
    else if (daysOld < 30) score += 30
    else if (daysOld < 90) score += 10
    
    // Photo count boost (artifacts with photos are more engaging)
    if (artifact.photos && artifact.photos.length > 0) {
      score += artifact.photos.length * 10
    }
    
    // GPS location boost (artifacts with location data)
    if (artifact.gpsLocation) {
      score += 20
    }
    
    // Description quality boost
    if (artifact.description && artifact.description.length > 100) {
      score += 15
    }
    
    // Material/classification diversity
    if (artifact.material) score += 10
    if (artifact.objectClassification) score += 10
    
    // Random factor for serendipity (0-20 points)
    score += Math.random() * 20
    
    return score
  }

  /**
   * Add randomization to prevent identical feeds
   */
  const addRandomization = (artifacts: ArtifactFeedItem[]): ArtifactFeedItem[] => {
    const result = [...artifacts]
    const topCount = Math.min(10, artifacts.length)
    
    // Keep top items but shuffle within groups
    for (let i = 0; i < topCount; i++) {
      const j = i + Math.floor(Math.random() * (topCount - i))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    
    return result
  }

  const handleLike = (artifactId: string) => {
    setLikedArtifacts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(artifactId)) {
        newSet.delete(artifactId)
        toast.success('Removed from favorites')
      } else {
        newSet.add(artifactId)
        toast.success('Added to favorites')
      }
      return newSet
    })
  }

  const handleShare = (artifact: ArtifactFeedItem) => {
    const url = `${window.location.origin}/artifacts/${artifact.id}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard!')
  }

  const handleComment = (artifactId: string) => {
    navigate(`/artifacts/${artifactId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading discovery feed..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-archaeological-warmGray">
      {/* Header */}
      <div className="bg-archaeological-charcoal text-white py-8 mb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-primary-400" />
            <h1 className="text-4xl font-bold">Explore Ancient Artifacts</h1>
          </div>
          <p className="text-archaeological-sage text-lg">
            Discover fascinating pieces from the past
          </p>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {feedItems.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500 text-lg">No artifacts to discover yet.</p>
            <p className="text-gray-400 mt-2">Start adding artifacts to build your collection!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {feedItems.map((item) => (
              <div 
                key={item.id}
                className="card overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => navigate(`/artifacts/${item.id}`)}
              >
                {/* Image */}
                {item.photos && item.photos.length > 0 && (
                  <div className="w-full h-96 bg-archaeological-lightBrown overflow-hidden">
                    <img
                      src={item.photos[0].url}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="card-content">
                  {/* Header */}
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-archaeological-charcoal mb-2">
                      {item.name}
                    </h2>
                    
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      {item.objectClassification && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                          {item.objectClassification}
                        </span>
                      )}
                      {item.material && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {item.material}
                          {item.materialSubtype && ` (${item.materialSubtype})`}
                        </span>
                      )}
                      {item.source === 'museum' && item.museumName && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          📍 {item.museumName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="text-archaeological-charcoal mb-4 line-clamp-3">
                      {item.description}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-archaeological-olive">
                    {item.discoverySite && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{item.discoverySite}</span>
                      </div>
                    )}
                    {item.discoveryDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{item.discoveryDate}</span>
                      </div>
                    )}
                    {item.createdBy && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Added by {item.createdBy}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-4 border-t border-archaeological-lightBrown">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLike(item.id)
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        likedArtifacts.has(item.id)
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Heart 
                        className={`w-5 h-5 ${likedArtifacts.has(item.id) ? 'fill-current' : ''}`} 
                      />
                      <span className="text-sm font-medium">
                        {likedArtifacts.has(item.id) ? 'Liked' : 'Like'}
                      </span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleShare(item)
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                      <span className="text-sm font-medium">Share</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleComment(item.id)
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">View Details</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DiscoverPage


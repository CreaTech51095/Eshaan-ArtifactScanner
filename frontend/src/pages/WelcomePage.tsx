import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserRound } from 'lucide-react'
import authService from '../services/auth'
import toast from 'react-hot-toast'
import { Artifact } from '../types/artifact'
import { getArtifacts } from '../services/artifacts'

const WelcomePage: React.FC = () => {
  const navigate = useNavigate()
  const [guestLoading, setGuestLoading] = useState(false)
  const [featuredArtifacts, setFeaturedArtifacts] = useState<Artifact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeaturedArtifacts()
  }, [])

  const loadFeaturedArtifacts = async () => {
    try {
      const artifacts = await getArtifacts()
      // Get the 6 most recent artifacts with photos
      const withPhotos = artifacts
        .filter(a => a.photos && a.photos.length > 0)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6)
      setFeaturedArtifacts(withPhotos)
    } catch (error) {
      console.error('Error loading featured artifacts:', error)
      // Fail silently - page still works without featured artifacts
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    setGuestLoading(true)
    try {
      await authService.loginAsGuest()
      toast.success('Welcome, Guest!', {
        icon: '👋',
        duration: 3000
      })
      navigate('/discover')
    } catch (error: any) {
      console.error('Guest login error:', error)
      if (error.message?.includes('auth/operation-not-allowed') || 
          error.message?.includes('auth/admin-restricted-operation')) {
        toast.error('Guest mode not enabled. Please contact administrator.')
      } else {
        toast.error('Failed to continue as guest.')
      }
    } finally {
      setGuestLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-archaeological-warmGray">
      {/* Navigation */}
      <nav className="bg-white border-b border-archaeological-lightBrown">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">🏺</span>
              </div>
              <span className="text-2xl font-bold text-archaeological-charcoal">archDB</span>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-sm font-medium text-archaeological-charcoal bg-archaeological-warmGray hover:bg-archaeological-lightBrown rounded-lg transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
              >
                Create Account
              </button>
              <button
                onClick={() => navigate('/team')}
                className="px-4 py-2 text-sm font-medium text-archaeological-charcoal hover:bg-archaeological-warmGray rounded-lg transition-colors"
              >
                meet the team
              </button>
              <button
                onClick={handleGuestLogin}
                disabled={guestLoading}
                className="px-4 py-2 text-sm font-medium text-archaeological-charcoal hover:bg-archaeological-warmGray rounded-lg transition-colors disabled:opacity-50"
              >
                {guestLoading ? 'Loading...' : 'guest'}
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="px-4 py-2 text-sm font-medium text-archaeological-charcoal hover:bg-archaeological-warmGray rounded-lg transition-colors"
              >
                contact us
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-archaeological-charcoal text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto border-4 border-dashed border-archaeological-sage p-8 rounded-lg mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Welcome to <span className="text-primary-400">archDB</span>!
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-archaeological-sage max-w-3xl mx-auto bg-archaeological-olive/20 p-4 rounded-lg">
            ArchDB is an app that provides universal access to a central database.
          </p>
        </div>
      </div>

      {/* Featured Artifacts Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-archaeological-charcoal mb-2 underline">
            Explore Recent Artifacts
          </h2>
          <p className="text-archaeological-olive">
            Discover the latest additions to our collection
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-archaeological-olive mt-4">Loading artifacts...</p>
          </div>
        ) : featuredArtifacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {featuredArtifacts.map((artifact) => (
              <div 
                key={artifact.id}
                onClick={() => {
                  // For guests/visitors, prompt to create account
                  toast('Please log in or create an account to view full details', {
                    icon: '🔒',
                    duration: 3000
                  })
                  navigate('/register')
                }}
                className="card overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
              >
                {artifact.photos && artifact.photos.length > 0 && (
                  <div className="h-64 overflow-hidden bg-archaeological-lightBrown">
                    <img
                      src={artifact.photos[0].url}
                      alt={artifact.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="card-content">
                  <h4 className="font-bold text-lg text-archaeological-charcoal mb-1 truncate">
                    {artifact.name}
                  </h4>
                  {artifact.discoverySite && (
                    <p className="text-sm text-archaeological-olive truncate">
                      📍 {artifact.discoverySite}
                    </p>
                  )}
                  {artifact.objectClassification && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded">
                      {artifact.objectClassification}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-archaeological-warmGray rounded-lg">
            <p className="text-archaeological-olive text-lg mb-4">
              No artifacts available yet. Be the first to add one!
            </p>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="mt-16 text-center space-y-4">
          <button
            onClick={() => navigate('/register')}
            className="btn btn-primary btn-lg text-xl px-12 py-4"
          >
            Explore All Artifacts!
          </button>
          <p className="text-archaeological-olive">
            Create an account to add your own discoveries
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-archaeological-charcoal text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-archaeological-sage">
            © 2024 archDB. Preserving history through technology.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default WelcomePage


import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserRound } from 'lucide-react'
import authService from '../services/auth'
import toast from 'react-hot-toast'

const WelcomePage: React.FC = () => {
  const navigate = useNavigate()
  const [guestLoading, setGuestLoading] = useState(false)

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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-archaeological-charcoal mb-2 underline">
            Artifacts of the week : Explore Museums
          </h2>
        </div>

        {/* Museum Sections */}
        <div className="space-y-12">
          {/* Rosicrucian Egyptian Museum */}
          <div>
            <h3 className="text-2xl font-bold text-archaeological-charcoal mb-6">
              Rosicrucian Egyptian Museum
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Sample artifacts - to be populated from real data */}
              <div className="card overflow-hidden cursor-pointer hover:shadow-xl transition-shadow">
                <div className="h-64 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                  <span className="text-6xl">🏺</span>
                </div>
                <div className="card-content">
                  <h4 className="font-bold text-lg text-archaeological-charcoal">Washing Set</h4>
                  <p className="text-sm text-archaeological-olive">Rosicrucian Egyptian Museum</p>
                </div>
              </div>

              <div className="card overflow-hidden cursor-pointer hover:shadow-xl transition-shadow">
                <div className="h-64 bg-gradient-to-br from-cyan-100 to-cyan-200 flex items-center justify-center">
                  <span className="text-6xl">🔪</span>
                </div>
                <div className="card-content">
                  <h4 className="font-bold text-lg text-archaeological-charcoal">Razors</h4>
                  <p className="text-sm text-archaeological-olive">Rosicrucian Egyptian Museum</p>
                </div>
              </div>

              <div className="card overflow-hidden cursor-pointer hover:shadow-xl transition-shadow">
                <div className="h-64 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                  <span className="text-6xl">🪔</span>
                </div>
                <div className="card-content">
                  <h4 className="font-bold text-lg text-archaeological-charcoal">Lamps</h4>
                  <p className="text-sm text-archaeological-olive">Rosicrucian Egyptian Museum</p>
                </div>
              </div>
            </div>

            <div className="bg-archaeological-lightBrown/30 p-6 rounded-lg border-2 border-archaeological-lightBrown">
              <p className="text-archaeological-charcoal text-center">
                At the Rosicrucian Egyptian Museum, the past tells a story. Visit the Plowing Man Model,
                and learn about a side of history recently uncovered. Ancient Egyptian beliefs in afterlife
                awaken our souls? Take a tour of the Rosicrucian to find out more.
              </p>
            </div>
          </div>

          {/* San Diego Archaeological Center */}
          <div>
            <h3 className="text-2xl font-bold text-archaeological-charcoal mb-6">
              San Diego Archaeological Center
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="card overflow-hidden cursor-pointer hover:shadow-xl transition-shadow">
                <div className="h-64 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                  <span className="text-6xl">🧺</span>
                </div>
                <div className="card-content">
                  <h4 className="font-bold text-lg text-archaeological-charcoal">Woven Basket</h4>
                  <p className="text-sm text-archaeological-olive">Rosicrucian Egyptian Museum</p>
                </div>
              </div>

              <div className="card overflow-hidden cursor-pointer hover:shadow-xl transition-shadow">
                <div className="h-64 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <span className="text-6xl">🍶</span>
                </div>
                <div className="card-content">
                  <h4 className="font-bold text-lg text-archaeological-charcoal">Wine Jar</h4>
                  <p className="text-sm text-archaeological-olive">Rosicrucian Egyptian Museum</p>
                </div>
              </div>

              <div className="card overflow-hidden cursor-pointer hover:shadow-xl transition-shadow">
                <div className="h-64 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <span className="text-6xl">🗿</span>
                </div>
                <div className="card-content">
                  <h4 className="font-bold text-lg text-archaeological-charcoal">Shabti</h4>
                  <p className="text-sm text-archaeological-olive">Rosicrucian Egyptian Museum</p>
                </div>
              </div>
            </div>

            <div className="bg-archaeological-lightBrown/30 p-6 rounded-lg border-2 border-archaeological-lightBrown">
              <p className="text-archaeological-charcoal text-center">
                Happy Halloween from the San Diego Archaeological Center! These innocent looking pearly dolls
                carry a dark side. A girl on the way to a ball, dead from being frozen? Explore this chilling
                story down at the center.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-16 text-center">
          <button
            onClick={() => navigate('/register')}
            className="btn btn-primary btn-lg text-xl px-12 py-4"
          >
            Explore Ancient Artifacts!
          </button>
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


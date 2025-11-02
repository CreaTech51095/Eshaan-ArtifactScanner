import React from 'react'
import { Link } from 'react-router-dom'
import { Package, Users } from 'lucide-react'
import UserProfileMenu from './UserProfileMenu'
import { useAuth } from '../../hooks/useAuth'

const AppHeader: React.FC = () => {
  const { user } = useAuth()

  return (
    <header className="bg-archaeological-cream border-b border-archaeological-lightBrown sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Package className="w-8 h-8 text-primary-600" />
            <div>
              <h1 className="text-lg font-bold text-archaeological-charcoal">Artifacts Scanner</h1>
              <p className="text-xs text-archaeological-olive">Archaeological Management</p>
            </div>
          </Link>

          {/* Navigation */}
          {user && (
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                to="/dashboard" 
                className="text-sm font-medium text-archaeological-charcoal hover:text-primary-600 transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                to="/artifacts" 
                className="text-sm font-medium text-archaeological-charcoal hover:text-primary-600 transition-colors"
              >
                Artifacts
              </Link>
              <Link 
                to="/groups" 
                className="text-sm font-medium text-archaeological-charcoal hover:text-primary-600 transition-colors flex items-center gap-1"
              >
                <Users className="w-4 h-4" />
                Groups
              </Link>
              <Link 
                to="/scanner" 
                className="text-sm font-medium text-archaeological-charcoal hover:text-primary-600 transition-colors"
              >
                Scanner
              </Link>
            </nav>
          )}

          {/* User Profile Menu */}
          {user && <UserProfileMenu />}
        </div>
      </div>
    </header>
  )
}

export default AppHeader


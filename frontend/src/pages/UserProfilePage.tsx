import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, User, Shield, Calendar } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const UserProfilePage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return null
  }

  console.log('UserProfilePage: user.role =', user.role)
  console.log('UserProfilePage: showing admin button?', user.role === 'admin')

  return (
    <div className="min-h-screen bg-archaeological-warmGray">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-ghost mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-archaeological-charcoal">My Profile</h1>
          <p className="mt-2 text-archaeological-olive">
            View and manage your account information
          </p>
        </div>

        <div className="grid gap-6">
          {/* Profile Card */}
          <div className="card">
            <div className="card-content">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 rounded-full bg-primary-600 text-white flex items-center justify-center text-3xl font-bold">
                  {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-archaeological-charcoal">
                    {user.displayName || user.username || 'User'}
                  </h2>
                  {user.role && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 mt-2">
                      {user.role}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-archaeological-warmGray rounded-lg">
                  <Mail className="w-5 h-5 text-archaeological-sage" />
                  <div>
                    <p className="text-sm font-medium text-archaeological-olive">Email</p>
                    <p className="text-archaeological-charcoal">{user.email}</p>
                  </div>
                </div>

                {user.username && (
                  <div className="flex items-center gap-3 p-3 bg-archaeological-warmGray rounded-lg">
                    <User className="w-5 h-5 text-archaeological-sage" />
                    <div>
                      <p className="text-sm font-medium text-archaeological-olive">Username</p>
                      <p className="text-archaeological-charcoal">{user.username}</p>
                    </div>
                  </div>
                )}

                {user.role && (
                  <div className="flex items-center gap-3 p-3 bg-archaeological-warmGray rounded-lg">
                    <Shield className="w-5 h-5 text-archaeological-sage" />
                    <div>
                      <p className="text-sm font-medium text-archaeological-olive">Role</p>
                      <p className="text-archaeological-charcoal capitalize">{user.role}</p>
                    </div>
                  </div>
                )}

                {user.createdAt && (
                  <div className="flex items-center gap-3 p-3 bg-archaeological-warmGray rounded-lg">
                    <Calendar className="w-5 h-5 text-archaeological-sage" />
                    <div>
                      <p className="text-sm font-medium text-archaeological-olive">Member Since</p>
                      <p className="text-archaeological-charcoal">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="card">
            <div className="card-content">
              <h3 className="text-lg font-semibold text-archaeological-charcoal mb-4">Account Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/profile/edit')}
                  className="btn btn-outline w-full justify-start"
                >
                  Edit Profile Information
                </button>
                <button
                  onClick={() => navigate('/profile/change-password')}
                  className="btn btn-outline w-full justify-start"
                >
                  Change Password
                </button>
                {user.role !== 'admin' && (
                  <button
                    onClick={() => navigate('/profile/request-role')}
                    className="btn btn-primary w-full justify-start"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Request Role Upgrade
                  </button>
                )}
                {user.role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="btn btn-primary w-full justify-start"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Panel
                  </button>
                )}
                <button
                  onClick={() => navigate('/profile/delete')}
                  className="btn btn-danger w-full justify-start"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfilePage


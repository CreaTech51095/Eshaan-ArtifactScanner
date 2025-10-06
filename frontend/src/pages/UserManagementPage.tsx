import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { User, UserRole } from '../types/user'
import {
  getAllUsers,
  deactivateUser,
  reactivateUser,
  updateUserRole
} from '../services/userManagement'
import toast from 'react-hot-toast'
import { ArrowLeft, Users, Shield, Trash2, RefreshCw, Edit2, Search } from 'lucide-react'

const UserManagementPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all')
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [newRole, setNewRole] = useState<UserRole>('researcher')

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard', { replace: true })
      return
    }

    loadUsers()
  }, [user, navigate])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const allUsers = await getAllUsers()
      setUsers(allUsers)
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivateUser = async (userId: string, userEmail: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${userEmail}? They will not be able to log in.`
    )

    if (!confirmed) return

    try {
      await deactivateUser(userId)
      toast.success('User deactivated successfully')
      loadUsers()
    } catch (error: any) {
      console.error('Error deactivating user:', error)
      toast.error(error.message || 'Failed to deactivate user')
    }
  }

  const handleReactivateUser = async (userId: string, userEmail: string) => {
    try {
      await reactivateUser(userId)
      toast.success(`${userEmail} has been reactivated`)
      loadUsers()
    } catch (error: any) {
      console.error('Error reactivating user:', error)
      toast.error(error.message || 'Failed to reactivate user')
    }
  }

  const handleUpdateRole = async (userId: string) => {
    try {
      await updateUserRole(userId, newRole)
      toast.success('User role updated successfully')
      setEditingUserId(null)
      loadUsers()
    } catch (error: any) {
      console.error('Error updating role:', error)
      toast.error(error.message || 'Failed to update role')
    }
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'archaeologist':
        return 'bg-blue-100 text-blue-800'
      case 'researcher':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === 'all' || u.role === filterRole

    return matchesSearch && matchesRole
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-ghost mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary-600" />
            User Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage user accounts and permissions
          </p>
        </div>

        {/* Search and Filter */}
        <div className="card mb-6">
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Users
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                    placeholder="Search by email, username, or name..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Role
                </label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as 'all' | UserRole)}
                  className="input"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="archaeologist">Archaeologist</option>
                  <option value="researcher">Researcher</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="card">
            <div className="card-content text-center py-12">
              <p className="text-gray-500">Loading users...</p>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="card">
            <div className="card-content text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No users found</p>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-content p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className={!u.isActive ? 'bg-gray-50 opacity-60' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {u.displayName || u.username}
                              {u.id === user.id && (
                                <span className="ml-2 text-xs text-gray-500">(You)</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{u.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingUserId === u.id && u.role !== 'admin' ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value as UserRole)}
                                className="input input-sm"
                              >
                                <option value="researcher">Researcher</option>
                                <option value="archaeologist">Archaeologist</option>
                              </select>
                              <button
                                onClick={() => handleUpdateRole(u.id)}
                                className="btn btn-primary btn-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingUserId(null)}
                                className="btn btn-ghost btn-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(u.role)}`}>
                              {u.role}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            {/* Can't modify admin accounts or yourself */}
                            {u.role !== 'admin' && u.id !== user.id && (
                              <>
                                {u.isActive ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingUserId(u.id)
                                        setNewRole(u.role)
                                      }}
                                      className="btn btn-ghost btn-sm"
                                      title="Change role"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeactivateUser(u.id, u.email)}
                                      className="btn btn-danger btn-sm"
                                      title="Deactivate user"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => handleReactivateUser(u.id, u.email)}
                                    className="btn btn-primary btn-sm"
                                    title="Reactivate user"
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            )}
                            {u.role === 'admin' && u.id !== user.id && (
                              <span className="text-xs text-gray-400">Protected</span>
                            )}
                            {u.id === user.id && (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="card">
            <div className="card-content">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
          <div className="card">
            <div className="card-content">
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-red-600">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-content">
              <p className="text-sm text-gray-600">Archaeologists</p>
              <p className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.role === 'archaeologist').length}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-content">
              <p className="text-sm text-gray-600">Researchers</p>
              <p className="text-2xl font-bold text-green-600">
                {users.filter(u => u.role === 'researcher').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserManagementPage


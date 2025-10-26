import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Package, Settings, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { useGroupPermissions } from '../hooks/useGroupPermissions'
import { getGroup, deleteGroup } from '../services/groups'
import { getArtifactsByGroup } from '../services/artifacts'
import { Group } from '../types/group'
import { Artifact } from '../types/artifact'
import GroupMembersList from '../components/groups/GroupMembersList'
import AddMemberDialog from '../components/groups/AddMemberDialog'
import LoadingSpinner from '../components/common/LoadingSpinner'

type TabType = 'overview' | 'artifacts' | 'members' | 'settings'

const GroupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isGroupAdmin, canManageGroup, loading: permissionsLoading } = useGroupPermissions(id)
  
  const [group, setGroup] = useState<Group | null>(null)
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [loading, setLoading] = useState(true)
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (id) {
      loadGroupData()
    }
  }, [id])

  const loadGroupData = async () => {
    if (!id) return

    try {
      setLoading(true)
      const [groupData, artifactsData] = await Promise.all([
        getGroup(id),
        getArtifactsByGroup(id)
      ])
      
      if (!groupData) {
        toast.error('Group not found')
        navigate('/groups')
        return
      }

      setGroup(groupData)
      setArtifacts(artifactsData)
    } catch (error: any) {
      console.error('Error loading group:', error)
      toast.error('Failed to load group')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteGroup = async () => {
    if (!id || !group) return

    const confirmed = window.confirm(
      `Are you sure you want to delete "${group.name}"? This action cannot be undone.`
    )

    if (!confirmed) return

    try {
      setDeleting(true)
      await deleteGroup(id)
      toast.success('Group deleted successfully')
      navigate('/groups')
    } catch (error: any) {
      console.error('Error deleting group:', error)
      toast.error(error.message || 'Failed to delete group')
    } finally {
      setDeleting(false)
    }
  }

  if (loading || permissionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Loading group..." />
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Group Not Found</h2>
          <button onClick={() => navigate('/groups')} className="btn btn-primary mt-4">
            Back to Groups
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <button
          onClick={() => navigate('/groups')}
          className="btn btn-ghost mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Groups
        </button>

        <div className="card mb-6">
          <div className="card-content">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.name}</h1>
                {group.description && (
                  <p className="text-gray-600 mb-4">{group.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{group.memberCount || 0} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    <span>{artifacts.length} artifacts</span>
                  </div>
                </div>
              </div>
              {canManageGroup && (
                <button
                  onClick={handleDeleteGroup}
                  className="btn btn-ghost text-red-600 hover:bg-red-50"
                  disabled={deleting}
                >
                  {deleting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Group
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('artifacts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'artifacts'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="w-4 h-4 inline mr-1" />
              Artifacts ({artifacts.length})
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'members'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4 inline mr-1" />
              Members
            </button>
            {canManageGroup && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-1" />
                Settings
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <div className="card-content">
                  <h3 className="text-lg font-semibold mb-4">Group Information</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Privacy</dt>
                      <dd className="text-sm text-gray-900 capitalize">{group.settings.privacy}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(group.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="card">
                <div className="card-content">
                  <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Artifacts</span>
                      <span className="text-2xl font-bold text-primary-600">{artifacts.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Members</span>
                      <span className="text-2xl font-bold text-primary-600">{group.memberCount || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'artifacts' && (
            <div className="card">
              <div className="card-content">
                {artifacts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No artifacts in this group yet</p>
                    <button
                      onClick={() => navigate('/artifacts/new')}
                      className="btn btn-primary mt-4"
                    >
                      Create First Artifact
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {artifacts.map((artifact) => (
                      <div
                        key={artifact.id}
                        onClick={() => navigate(`/artifacts/${artifact.id}`)}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                      >
                        {artifact.photos && artifact.photos.length > 0 ? (
                          <img
                            src={artifact.photos[0].url}
                            alt={artifact.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{artifact.name}</h4>
                          <p className="text-sm text-gray-500">{artifact.artifactType}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'members' && id && user && (
            <div className="card">
              <div className="card-content">
                <GroupMembersList
                  groupId={id}
                  canManage={canManageGroup}
                  currentUserId={user.id}
                  onAddMember={() => setShowAddMemberDialog(true)}
                />
              </div>
            </div>
          )}

          {activeTab === 'settings' && canManageGroup && (
            <div className="card">
              <div className="card-content">
                <h3 className="text-lg font-semibold mb-4">Group Settings</h3>
                <p className="text-gray-600">Settings management coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Member Dialog */}
      {showAddMemberDialog && id && (
        <AddMemberDialog
          groupId={id}
          onClose={() => setShowAddMemberDialog(false)}
          onMemberAdded={() => {
            loadGroupData()
            setShowAddMemberDialog(false)
          }}
        />
      )}
    </div>
  )
}

export default GroupDetailPage


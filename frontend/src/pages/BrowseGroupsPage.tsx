import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users, Lock, Globe, UserPlus, Clock, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { getAllGroups } from '../services/groups'
import { getUserMemberships } from '../services/groupMembers'
import { createJoinRequest, getUserPendingRequest } from '../services/groupRequests'
import { Group } from '../types/group'
import { GroupJoinRequest } from '../types/groupRequest'
import LoadingSpinner from '../components/common/LoadingSpinner'

const BrowseGroupsPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [userGroupIds, setUserGroupIds] = useState<Set<string>>(new Set())
  const [pendingRequests, setPendingRequests] = useState<Map<string, GroupJoinRequest>>(new Map())
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [requestingGroupId, setRequestingGroupId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Load all public groups
      const allGroups = await getAllGroups()
      const publicGroups = allGroups.filter(g => g.settings.privacy === 'public')
      setGroups(publicGroups)

      // Load user's current memberships
      const memberships = await getUserMemberships(user.id)
      const memberGroupIds = new Set(memberships.map(m => m.groupId))
      setUserGroupIds(memberGroupIds)

      // Load pending requests for groups user is not in
      const requests = new Map<string, GroupJoinRequest>()
      for (const group of publicGroups) {
        if (!memberGroupIds.has(group.id)) {
          const request = await getUserPendingRequest(group.id, user.id)
          if (request) {
            requests.set(group.id, request)
          }
        }
      }
      setPendingRequests(requests)
    } catch (error: any) {
      console.error('Error loading groups:', error)
      toast.error('Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestJoin = async (groupId: string) => {
    try {
      setRequestingGroupId(groupId)
      await createJoinRequest({ groupId })
      toast.success('Join request sent! Group admins will review your request.')
      await loadData() // Reload to show pending status
    } catch (error: any) {
      console.error('Error requesting to join:', error)
      toast.error(error.message || 'Failed to send join request')
    } finally {
      setRequestingGroupId(null)
    }
  }

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Loading groups..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Public Groups</h1>
          <p className="mt-2 text-gray-600">
            Discover and join groups to collaborate with teams
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search public groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
        </div>

        {/* Groups List */}
        {filteredGroups.length === 0 ? (
          <div className="card">
            <div className="card-content text-center py-12">
              <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No groups found' : 'No public groups available'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? 'Try adjusting your search criteria'
                  : 'Public groups will appear here when they are created'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGroups.map((group) => {
              const isMember = userGroupIds.has(group.id)
              const pendingRequest = pendingRequests.get(group.id)
              const isRequesting = requestingGroupId === group.id

              return (
                <div
                  key={group.id}
                  className="card hover:shadow-lg transition-shadow"
                >
                  <div className="card-content">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {group.name}
                          </h3>
                          <Globe className="w-4 h-4 text-green-500" title="Public Group" />
                        </div>

                        {group.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {group.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{group.memberCount || 0} members</span>
                          </div>
                        </div>
                      </div>

                      <div className="ml-4">
                        {isMember ? (
                          <button
                            onClick={() => navigate(`/groups/${group.id}`)}
                            className="btn btn-primary flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Member
                          </button>
                        ) : pendingRequest ? (
                          <button
                            disabled
                            className="btn btn-secondary flex items-center gap-2"
                          >
                            <Clock className="w-4 h-4" />
                            Pending
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRequestJoin(group.id)}
                            disabled={isRequesting}
                            className="btn btn-primary flex items-center gap-2"
                          >
                            {isRequesting ? (
                              <>
                                <LoadingSpinner size="sm" />
                                Requesting...
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4" />
                                Request to Join
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Results count */}
        {filteredGroups.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Showing {filteredGroups.length} public group{filteredGroups.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}

export default BrowseGroupsPage


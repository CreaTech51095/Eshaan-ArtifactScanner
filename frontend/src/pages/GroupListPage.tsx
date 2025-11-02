import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { getUserGroups } from '../services/groups'
import { getGroupMembers } from '../services/groupMembers'
import { getArtifactsByGroup } from '../services/artifacts'
import { Group } from '../types/group'
import GroupCard from '../components/groups/GroupCard'
import LoadingSpinner from '../components/common/LoadingSpinner'

const GroupListPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadGroups()
  }, [user])

  const loadGroups = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await getUserGroups(user.id)
      
      // Fetch member and artifact counts for each group
      const groupsWithCounts = await Promise.all(
        data.map(async (group) => {
          try {
            const [members, artifacts] = await Promise.all([
              getGroupMembers(group.id),
              getArtifactsByGroup(group.id)
            ])
            return {
              ...group,
              memberCount: members.length,
              artifactCount: artifacts.length
            }
          } catch (error) {
            console.error(`Error fetching counts for group ${group.id}:`, error)
            return {
              ...group,
              memberCount: 0,
              artifactCount: 0
            }
          }
        })
      )
      
      setGroups(groupsWithCounts)
    } catch (error: any) {
      console.error('Error loading groups:', error)
      toast.error('Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <LoadingSpinner text="Loading groups..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-archaeological-charcoal">Groups</h1>
            <p className="mt-2 text-archaeological-charcoal">
              Collaborate with your team on artifacts
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/groups/browse/public')}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Browse Public Groups
            </button>
            <button
              onClick={() => navigate('/groups/new')}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Group
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-archaeological-sage w-5 h-5" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
        </div>

        {/* Groups Grid */}
        {filteredGroups.length === 0 ? (
          <div className="card">
            <div className="card-content text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-archaeological-charcoal mb-2">
                {searchTerm ? 'No groups found' : 'No groups yet'}
              </h3>
              <p className="text-archaeological-charcoal mb-6">
                {searchTerm
                  ? 'Try adjusting your search criteria'
                  : 'Create your first group to start collaborating with your team'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => navigate('/groups/new')}
                  className="btn btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Group
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}

        {/* Results count */}
        {filteredGroups.length > 0 && (
          <div className="mt-6 text-center text-sm text-archaeological-olive">
            Showing {filteredGroups.length} of {groups.length} group{groups.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}

export default GroupListPage


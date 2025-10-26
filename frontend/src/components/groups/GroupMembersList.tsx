import React, { useState, useEffect } from 'react'
import { UserPlus, Trash2, Shield, User, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { GroupMember } from '../../types/group'
import { User as UserType } from '../../types/user'
import { getGroupMembers, removeMember } from '../../services/groupMembers'
import { getDoc, doc } from 'firebase/firestore'
import { db } from '../../services/firebase'
import LoadingSpinner from '../common/LoadingSpinner'

interface GroupMembersListProps {
  groupId: string
  canManage: boolean
  currentUserId: string
  onAddMember?: () => void
}

const GroupMembersList: React.FC<GroupMembersListProps> = ({
  groupId,
  canManage,
  currentUserId,
  onAddMember
}) => {
  const [members, setMembers] = useState<GroupMember[]>([])
  const [memberDetails, setMemberDetails] = useState<Map<string, UserType>>(new Map())
  const [loading, setLoading] = useState(true)
  const [removingMember, setRemovingMember] = useState<string | null>(null)

  const loadMembers = async () => {
    try {
      setLoading(true)
      const membersData = await getGroupMembers(groupId)
      setMembers(membersData)

      // Load user details for each member
      const details = new Map<string, UserType>()
      for (const member of membersData) {
        try {
          const userDoc = await getDoc(doc(db, 'users', member.userId))
          if (userDoc.exists()) {
            details.set(member.userId, userDoc.data() as UserType)
          }
        } catch (error) {
          console.error('Error loading user details:', error)
        }
      }
      setMemberDetails(details)
    } catch (error) {
      console.error('Error loading members:', error)
      toast.error('Failed to load group members')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [groupId])

  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm('Are you sure you want to remove this member from the group?')) {
      return
    }

    try {
      setRemovingMember(userId)
      await removeMember(groupId, userId)
      toast.success('Member removed successfully')
      await loadMembers()
    } catch (error: any) {
      console.error('Error removing member:', error)
      toast.error(error.message || 'Failed to remove member')
    } finally {
      setRemovingMember(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner text="Loading members..." />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          Members ({members.length})
        </h3>
        {canManage && onAddMember && (
          <button onClick={onAddMember} className="btn btn-primary btn-sm">
            <UserPlus className="w-4 h-4" />
            Add Member
          </button>
        )}
      </div>

      {members.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No members yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((member) => {
            const userDetails = memberDetails.get(member.userId)
            const isCurrentUser = member.userId === currentUserId

            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {userDetails?.displayName || userDetails?.username || 'Unknown User'}
                      </span>
                      {isCurrentUser && (
                        <span className="text-xs text-gray-500">(You)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{userDetails?.email}</span>
                      {member.role === 'group_admin' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          <Shield className="w-3 h-3" />
                          Group Admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {canManage && !isCurrentUser && (
                  <button
                    onClick={() => handleRemoveMember(member.userId)}
                    disabled={removingMember === member.userId}
                    className="btn btn-ghost btn-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {removingMember === member.userId ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </>
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default GroupMembersList


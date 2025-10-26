import React, { useState } from 'react'
import { X, UserPlus, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { addMember } from '../../services/groupMembers'
import { GroupMemberRole, getDefaultGroupPermissions } from '../../types/group'
import LoadingSpinner from '../common/LoadingSpinner'

interface AddMemberDialogProps {
  groupId: string
  onClose: () => void
  onMemberAdded: () => void
}

const AddMemberDialog: React.FC<AddMemberDialogProps> = ({
  groupId,
  onClose,
  onMemberAdded
}) => {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<GroupMemberRole>('member')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error('Please enter an email address')
      return
    }

    try {
      setLoading(true)
      await addMember(groupId, {
        email: email.trim(),
        role,
        permissions: getDefaultGroupPermissions(role)
      })
      toast.success('Member added successfully')
      onMemberAdded()
      onClose()
    } catch (error: any) {
      console.error('Error adding member:', error)
      toast.error(error.message || 'Failed to add member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Add Member</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="form-group">
            <label className="label">
              <Mail className="w-4 h-4" />
              Email Address
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="input"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the email address of the user you want to add
            </p>
          </div>

          <div className="form-group">
            <label className="label">
              <UserPlus className="w-4 h-4" />
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as GroupMemberRole)}
              className="input"
              disabled={loading}
            >
              <option value="member">Member</option>
              <option value="group_admin">Group Admin</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {role === 'group_admin'
                ? 'Group admins can manage members and group settings'
                : 'Members can view and edit artifacts based on their permissions'}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Add Member
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddMemberDialog


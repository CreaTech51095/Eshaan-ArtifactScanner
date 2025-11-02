import React, { useState } from 'react'
import { X, Shield, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { GroupMember, GroupPermissions, GroupMemberRole } from '../../types/group'
import { updateMemberPermissions, updateMemberRole } from '../../services/groupMembers'
import { User } from '../../types/user'

interface EditMemberPermissionsDialogProps {
  member: GroupMember
  memberUser: User | undefined
  groupId: string
  onClose: () => void
  onSuccess: () => void
}

const EditMemberPermissionsDialog: React.FC<EditMemberPermissionsDialogProps> = ({
  member,
  memberUser,
  groupId,
  onClose,
  onSuccess
}) => {
  const [role, setRole] = useState<GroupMemberRole>(member.role)
  const [permissions, setPermissions] = useState<GroupPermissions>(member.permissions)
  const [saving, setSaving] = useState(false)

  const handlePermissionChange = (key: keyof GroupPermissions, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Update role if changed
      if (role !== member.role) {
        await updateMemberRole(groupId, member.userId, role)
      }
      
      // Update permissions
      await updateMemberPermissions(groupId, member.userId, permissions)
      
      toast.success('Member permissions updated successfully')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error updating member permissions:', error)
      toast.error(error.message || 'Failed to update permissions')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Edit Member Permissions</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Member Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-gray-900">
              {memberUser?.displayName || memberUser?.username || 'Unknown User'}
            </p>
            <p className="text-sm text-gray-600">{memberUser?.email}</p>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as GroupMemberRole)}
              className="input"
            >
              <option value="member">Member</option>
              <option value="group_admin">Group Admin</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {role === 'group_admin' 
                ? 'Group admins can manage members and group settings' 
                : 'Regular members have limited permissions'}
            </p>
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Permissions
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={permissions.canViewArtifacts}
                  onChange={(e) => handlePermissionChange('canViewArtifacts', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">View Artifacts</span>
                  <p className="text-xs text-gray-500">Can view group artifacts</p>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={permissions.canCreateArtifacts}
                  onChange={(e) => handlePermissionChange('canCreateArtifacts', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Create Artifacts</span>
                  <p className="text-xs text-gray-500">Can add new artifacts to the group</p>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={permissions.canEditArtifacts}
                  onChange={(e) => handlePermissionChange('canEditArtifacts', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Edit Artifacts</span>
                  <p className="text-xs text-gray-500">Can modify existing artifacts</p>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={permissions.canDeleteArtifacts}
                  onChange={(e) => handlePermissionChange('canDeleteArtifacts', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Delete Artifacts</span>
                  <p className="text-xs text-gray-500">Can remove artifacts from the group</p>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={permissions.canManageMembers}
                  onChange={(e) => handlePermissionChange('canManageMembers', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Manage Members</span>
                  <p className="text-xs text-gray-500">Can add/remove group members</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditMemberPermissionsDialog


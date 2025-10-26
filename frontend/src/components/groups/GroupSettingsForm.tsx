import React, { useState, useEffect } from 'react'
import { Save, Lock, Globe, Settings as SettingsIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { Group, UpdateGroupRequest } from '../../types/group'
import { updateGroup } from '../../services/groups'
import LoadingSpinner from '../common/LoadingSpinner'

interface GroupSettingsFormProps {
  group: Group
  onUpdate: () => void
}

const GroupSettingsForm: React.FC<GroupSettingsFormProps> = ({ group, onUpdate }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<UpdateGroupRequest>({
    name: group.name,
    description: group.description || '',
    settings: {
      privacy: group.settings.privacy,
      defaultMemberPermissions: { ...group.settings.defaultMemberPermissions },
      allowMemberInvites: group.settings.allowMemberInvites
    }
  })

  // Update form data when group changes
  useEffect(() => {
    setFormData({
      name: group.name,
      description: group.description || '',
      settings: {
        privacy: group.settings.privacy,
        defaultMemberPermissions: { ...group.settings.defaultMemberPermissions },
        allowMemberInvites: group.settings.allowMemberInvites
      }
    })
  }, [group])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name?.trim()) {
      toast.error('Group name is required')
      return
    }

    try {
      setLoading(true)
      await updateGroup(group.id, formData)
      toast.success('Group settings updated successfully!')
      onUpdate()
    } catch (error: any) {
      console.error('Error updating group settings:', error)
      toast.error(error.message || 'Failed to update group settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Basic Information</h3>
        </div>
        <div className="card-content space-y-4">
          <div className="form-group">
            <label className="label">
              <SettingsIcon className="w-4 h-4" />
              Group Name
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Egypt Excavation Team"
              className="input"
              required
              maxLength={100}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="label">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the purpose of this group..."
              className="input"
              rows={3}
              maxLength={500}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Privacy Settings</h3>
        </div>
        <div className="card-content space-y-4">
          <div className="form-group">
            <label className="label">
              Group Privacy
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="privacy"
                  value="private"
                  checked={formData.settings?.privacy === 'private'}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: { ...formData.settings!, privacy: 'private' }
                  })}
                  disabled={loading}
                />
                <Lock className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium">Private</div>
                  <div className="text-sm text-gray-500">
                    Only invited members can see this group
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="privacy"
                  value="public"
                  checked={formData.settings?.privacy === 'public'}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: { ...formData.settings!, privacy: 'public' }
                  })}
                  disabled={loading}
                />
                <Globe className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium">Public</div>
                  <div className="text-sm text-gray-500">
                    Anyone can see this group
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.settings?.allowMemberInvites}
                onChange={(e) => setFormData({
                  ...formData,
                  settings: {
                    ...formData.settings!,
                    allowMemberInvites: e.target.checked
                  }
                })}
                disabled={loading}
              />
              <span className="text-sm font-medium">Allow members to invite others</span>
            </label>
            <p className="text-xs text-gray-500 ml-6 mt-1">
              If enabled, regular members can add new people to the group (not just admins)
            </p>
          </div>
        </div>
      </div>

      {/* Default Member Permissions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Default Member Permissions</h3>
          <p className="text-sm text-gray-500 mt-1">
            These permissions will be applied to new members when they join
          </p>
        </div>
        <div className="card-content space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.settings?.defaultMemberPermissions.canViewArtifacts}
              onChange={(e) => setFormData({
                ...formData,
                settings: {
                  ...formData.settings!,
                  defaultMemberPermissions: {
                    ...formData.settings!.defaultMemberPermissions,
                    canViewArtifacts: e.target.checked
                  }
                }
              })}
              disabled={loading}
            />
            <div>
              <span className="text-sm font-medium">View artifacts</span>
              <p className="text-xs text-gray-500">Members can view all artifacts in this group</p>
            </div>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.settings?.defaultMemberPermissions.canCreateArtifacts}
              onChange={(e) => setFormData({
                ...formData,
                settings: {
                  ...formData.settings!,
                  defaultMemberPermissions: {
                    ...formData.settings!.defaultMemberPermissions,
                    canCreateArtifacts: e.target.checked
                  }
                }
              })}
              disabled={loading}
            />
            <div>
              <span className="text-sm font-medium">Create artifacts</span>
              <p className="text-xs text-gray-500">Members can add new artifacts to this group</p>
            </div>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.settings?.defaultMemberPermissions.canEditArtifacts}
              onChange={(e) => setFormData({
                ...formData,
                settings: {
                  ...formData.settings!,
                  defaultMemberPermissions: {
                    ...formData.settings!.defaultMemberPermissions,
                    canEditArtifacts: e.target.checked
                  }
                }
              })}
              disabled={loading}
            />
            <div>
              <span className="text-sm font-medium">Edit artifacts</span>
              <p className="text-xs text-gray-500">Members can modify existing artifacts in this group</p>
            </div>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.settings?.defaultMemberPermissions.canDeleteArtifacts}
              onChange={(e) => setFormData({
                ...formData,
                settings: {
                  ...formData.settings!,
                  defaultMemberPermissions: {
                    ...formData.settings!.defaultMemberPermissions,
                    canDeleteArtifacts: e.target.checked
                  }
                }
              })}
              disabled={loading}
            />
            <div>
              <span className="text-sm font-medium">Delete artifacts</span>
              <p className="text-xs text-gray-500">Members can remove artifacts from this group</p>
            </div>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.settings?.defaultMemberPermissions.canManageMembers}
              onChange={(e) => setFormData({
                ...formData,
                settings: {
                  ...formData.settings!,
                  defaultMemberPermissions: {
                    ...formData.settings!.defaultMemberPermissions,
                    canManageMembers: e.target.checked
                  }
                }
              })}
              disabled={loading}
            />
            <div>
              <span className="text-sm font-medium">Manage members</span>
              <p className="text-xs text-gray-500">Members can add/remove other members</p>
            </div>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default GroupSettingsForm


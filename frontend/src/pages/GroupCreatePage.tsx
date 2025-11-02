import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Lock, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import { createGroup } from '../services/groups'
import { CreateGroupRequest } from '../types/group'
import LoadingSpinner from '../components/common/LoadingSpinner'

const GroupCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateGroupRequest>({
    name: '',
    description: '',
    settings: {
      privacy: 'private',
      defaultMemberPermissions: {
        canCreateArtifacts: true,
        canEditArtifacts: true,
        canDeleteArtifacts: false,
        canViewArtifacts: true,
        canManageMembers: false
      },
      allowMemberInvites: false
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Group name is required')
      return
    }

    try {
      setLoading(true)
      const groupId = await createGroup(formData)
      toast.success('Group created successfully!')
      navigate(`/groups/${groupId}`)
    } catch (error: any) {
      console.error('Error creating group:', error)
      toast.error(error.message || 'Failed to create group')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/groups')}
          className="btn btn-ghost mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Groups
        </button>

        <div className="card">
          <div className="card-header">
            <h2 className="text-2xl font-bold">Create New Group</h2>
            <p className="text-archaeological-charcoal mt-1">
              Set up a new group to collaborate with your team
            </p>
          </div>

          <form onSubmit={handleSubmit} className="card-content space-y-6">
            {/* Basic Information */}
            <div className="form-group">
              <label className="label">
                <Users className="w-4 h-4" />
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

            {/* Privacy Settings */}
            <div className="form-group">
              <label className="label">
                Privacy
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-archaeological-lightBrown rounded-lg cursor-pointer hover:bg-archaeological-warmGray">
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
                  <Lock className="w-5 h-5 text-archaeological-olive" />
                  <div>
                    <div className="font-medium">Private</div>
                    <div className="text-sm text-archaeological-olive">
                      Only invited members can see this group
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-archaeological-lightBrown rounded-lg cursor-pointer hover:bg-archaeological-warmGray">
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
                  <Globe className="w-5 h-5 text-archaeological-olive" />
                  <div>
                    <div className="font-medium">Public</div>
                    <div className="text-sm text-archaeological-olive">
                      Anyone can see this group
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Default Member Permissions */}
            <div className="form-group">
              <label className="label">
                Default Member Permissions
              </label>
              <p className="text-sm text-archaeological-olive mb-3">
                These permissions will be applied to new members by default
              </p>
              <div className="space-y-2">
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
                  <span className="text-sm">Can create artifacts</span>
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
                  <span className="text-sm">Can edit artifacts</span>
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
                  <span className="text-sm">Can delete artifacts</span>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/groups')}
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
                    Creating...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    Create Group
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default GroupCreatePage


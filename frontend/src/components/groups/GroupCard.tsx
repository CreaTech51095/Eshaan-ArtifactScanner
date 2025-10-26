import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Package, Shield } from 'lucide-react'
import { Group } from '../../types/group'

interface GroupCardProps {
  group: Group
}

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/groups/${group.id}`)}
      className="card hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="card-content">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {group.name}
          </h3>
          {group.settings.privacy === 'private' && (
            <Shield className="w-4 h-4 text-gray-400" />
          )}
        </div>

        {group.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {group.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{group.memberCount || 0} members</span>
          </div>
          <div className="flex items-center gap-1">
            <Package className="w-4 h-4" />
            <span>{group.artifactCount || 0} artifacts</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-400">
          Created {new Date(group.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}

export default GroupCard


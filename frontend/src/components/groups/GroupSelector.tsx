import React from 'react'
import { Users } from 'lucide-react'
import { Group } from '../../types/group'

interface GroupSelectorProps {
  groups: Group[]
  selectedGroupId: string | undefined
  onChange: (groupId: string | undefined) => void
  label?: string
  required?: boolean
  placeholder?: string
  showUncategorized?: boolean
}

const GroupSelector: React.FC<GroupSelectorProps> = ({
  groups,
  selectedGroupId,
  onChange,
  label = 'Group',
  required = false,
  placeholder = 'Select a group',
  showUncategorized = true
}) => {
  return (
    <div className="form-group">
      <label className="label">
        <Users className="w-4 h-4" />
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={selectedGroupId || ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="input"
        required={required}
      >
        <option value="">{placeholder}</option>
        {showUncategorized && (
          <option value="uncategorized">Uncategorized (No Group)</option>
        )}
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default GroupSelector


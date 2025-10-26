import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Group } from '../types/group'
import { getUserGroups } from '../services/groups'
import { useAuth } from '../hooks/useAuth'

interface GroupContextType {
  currentGroup: Group | null
  userGroups: Group[]
  loading: boolean
  setCurrentGroup: (group: Group | null) => void
  reloadGroups: () => Promise<void>
}

const GroupContext = createContext<GroupContextType | undefined>(undefined)

interface GroupProviderProps {
  children: ReactNode
}

export const GroupProvider: React.FC<GroupProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null)
  const [userGroups, setUserGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  const loadGroups = async () => {
    if (!user) {
      setUserGroups([])
      setCurrentGroup(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const groups = await getUserGroups(user.id)
      setUserGroups(groups)
      
      // If current group is not in the list anymore, clear it
      if (currentGroup && !groups.find(g => g.id === currentGroup.id)) {
        setCurrentGroup(null)
      }
    } catch (error) {
      console.error('Error loading groups:', error)
      setUserGroups([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGroups()
  }, [user])

  const value: GroupContextType = {
    currentGroup,
    userGroups,
    loading,
    setCurrentGroup,
    reloadGroups: loadGroups
  }

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>
}

export const useGroupContext = () => {
  const context = useContext(GroupContext)
  if (context === undefined) {
    throw new Error('useGroupContext must be used within a GroupProvider')
  }
  return context
}


import { createContext, useContext, ReactNode } from 'react'
import { useOfflineSync } from '../hooks/useOfflineSync'
import { SyncStatus } from '../types/sync'

interface OfflineSyncContextType {
  syncStatus: SyncStatus
  syncPendingChanges: () => Promise<void>
  syncFromServer: () => Promise<void>
  fullSync: () => Promise<void>
  updatePendingCount: () => Promise<void>
  retryFailedChanges: () => Promise<void>
}

const OfflineSyncContext = createContext<OfflineSyncContextType | undefined>(undefined)

/**
 * Provider for offline sync functionality
 */
export function OfflineSyncProvider({ children }: { children: ReactNode }) {
  const offlineSync = useOfflineSync()

  return (
    <OfflineSyncContext.Provider value={offlineSync}>
      {children}
    </OfflineSyncContext.Provider>
  )
}

/**
 * Hook to access offline sync context
 */
export function useOfflineSyncContext() {
  const context = useContext(OfflineSyncContext)
  if (context === undefined) {
    throw new Error('useOfflineSyncContext must be used within OfflineSyncProvider')
  }
  return context
}


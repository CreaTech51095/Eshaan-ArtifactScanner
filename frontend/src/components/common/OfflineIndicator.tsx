import { useEffect, useState } from 'react'
import { WifiOff, Wifi, Cloud, CloudOff, RefreshCw, AlertCircle } from 'lucide-react'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { getPendingChangesCount } from '../../utils/offlineStorage'
import { useOfflineSyncContext } from '../../contexts/OfflineSyncContext'
import { db } from '../../utils/db'

interface OfflineIndicatorProps {
  showOnlineState?: boolean
  isSyncing?: boolean
  lastSyncAt?: string
  pendingChanges?: number
}

/**
 * Component to show connection status and sync state
 */
export default function OfflineIndicator({ 
  showOnlineState = true,
  isSyncing = false,
  lastSyncAt,
  pendingChanges: externalPendingChanges
}: OfflineIndicatorProps) {
  const isOnline = useOnlineStatus()
  const { retryFailedChanges } = useOfflineSyncContext()
  const [pendingChanges, setPendingChanges] = useState(0)
  const [failedChanges, setFailedChanges] = useState(0)

  // Update pending changes count
  useEffect(() => {
    const updateCount = async () => {
      const count = await getPendingChangesCount()
      setPendingChanges(count)
    }
    
    updateCount()
    const interval = setInterval(updateCount, 5000) // Update every 5 seconds
    
    return () => clearInterval(interval)
  }, [])

  // Check for failed changes
  useEffect(() => {
    const checkFailedChanges = async () => {
      try {
        const allChanges = await db.pendingChanges.toArray()
        const failed = allChanges.filter(change => change.retries >= 3)
        setFailedChanges(failed.length)
      } catch (error) {
        console.error('Error checking failed changes:', error)
      }
    }
    
    checkFailedChanges()
    const interval = setInterval(checkFailedChanges, 5000) // Update every 5 seconds
    
    return () => clearInterval(interval)
  }, [])

  const finalPendingChanges = externalPendingChanges ?? pendingChanges

  // Don't show anything if online and no pending changes
  if (isOnline && !showOnlineState && finalPendingChanges === 0 && !isSyncing) {
    return null
  }

  const formatLastSync = (timestamp: string | undefined) => {
    if (!timestamp) return 'Never'
    
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    return date.toLocaleDateString()
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div 
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg
          transition-all duration-300 backdrop-blur-sm
          ${isOnline 
            ? 'bg-white/90 border border-gray-200 text-gray-700' 
            : 'bg-orange-500/90 text-white'
          }
        `}
      >
        {/* Connection status icon */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              {isSyncing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Wifi className="w-4 h-4" />
              )}
            </>
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
          
          <span className="text-sm font-medium">
            {isOnline ? (
              isSyncing ? 'Syncing...' : 'Online'
            ) : (
              'Offline'
            )}
          </span>
        </div>

        {/* Pending changes badge */}
        {finalPendingChanges > 0 && (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-500 text-white rounded-full text-xs font-semibold">
            <CloudOff className="w-3 h-3" />
            {finalPendingChanges}
          </div>
        )}

        {/* Last sync time */}
        {isOnline && lastSyncAt && !isSyncing && (
          <div className="flex items-center gap-1 text-xs text-gray-500 border-l pl-2 ml-1 border-gray-300">
            <Cloud className="w-3 h-3" />
            <span>{formatLastSync(lastSyncAt)}</span>
          </div>
        )}
      </div>

      {/* Offline mode message */}
      {!isOnline && (
        <div className="mt-2 px-4 py-2 bg-white/90 border border-orange-200 rounded-lg shadow-lg text-xs text-gray-600 backdrop-blur-sm">
          <p>Working offline. Changes will sync when connection is restored.</p>
        </div>
      )}

      {/* Failed changes retry button */}
      {isOnline && failedChanges > 0 && (
        <div className="mt-2 px-4 py-2 bg-red-50/90 border border-red-200 rounded-lg shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span>
                {failedChanges} change{failedChanges > 1 ? 's' : ''} failed to sync
              </span>
            </div>
            <button
              onClick={retryFailedChanges}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


import { useEffect, useState, useRef } from 'react'
import { WifiOff, Wifi, Cloud, CloudOff, RefreshCw, AlertCircle, Move } from 'lucide-react'
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
  
  // Draggable position state
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('offlineIndicatorPosition')
    return saved ? JSON.parse(saved) : { x: window.innerWidth - 200, y: window.innerHeight - 100 }
  })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const indicatorRef = useRef<HTMLDivElement>(null)

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

  // Drag handlers
  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true)
    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y
    })
  }

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return
    
    const newX = clientX - dragStart.x
    const newY = clientY - dragStart.y
    
    // Keep within viewport bounds
    const maxX = window.innerWidth - (indicatorRef.current?.offsetWidth || 200)
    const maxY = window.innerHeight - (indicatorRef.current?.offsetHeight || 100)
    
    const boundedX = Math.max(0, Math.min(newX, maxX))
    const boundedY = Math.max(0, Math.min(newY, maxY))
    
    setPosition({ x: boundedX, y: boundedY })
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    // Save position to localStorage
    localStorage.setItem('offlineIndicatorPosition', JSON.stringify(position))
  }

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleDragStart(e.clientX, e.clientY)
  }

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    handleDragStart(touch.clientX, touch.clientY)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY)
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      handleDragMove(touch.clientX, touch.clientY)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleDragEnd)
      document.addEventListener('touchmove', handleTouchMove)
      document.addEventListener('touchend', handleDragEnd)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleDragEnd)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleDragEnd)
      }
    }
  }, [isDragging, dragStart, position])

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
    <div 
      ref={indicatorRef}
      className="fixed z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none'
      }}
    >
      <div 
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg
          transition-all duration-300 backdrop-blur-sm select-none
          ${isOnline 
            ? 'bg-white/90 border border-archaeological-lightBrown text-archaeological-charcoal' 
            : 'bg-orange-500/90 text-white'
          }
          ${isDragging ? 'opacity-80' : 'opacity-100'}
        `}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Drag handle */}
        <Move className="w-3 h-3 opacity-50" />
        <div className="w-px h-4 bg-gray-300"></div>
        
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
          <div className="flex items-center gap-1 text-xs text-archaeological-olive border-l pl-2 ml-1 border-archaeological-lightBrown">
            <Cloud className="w-3 h-3" />
            <span>{formatLastSync(lastSyncAt)}</span>
          </div>
        )}
      </div>

      {/* Offline mode message */}
      {!isOnline && (
        <div className="mt-2 px-4 py-2 bg-white/90 border border-orange-200 rounded-lg shadow-lg text-xs text-archaeological-olive backdrop-blur-sm">
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


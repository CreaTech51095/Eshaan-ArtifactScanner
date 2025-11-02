export type EntityType = 'artifact' | 'photo'
export type SyncAction = 'create' | 'update' | 'delete'

export interface SyncLog {
  id: string
  userId: string
  entityType: EntityType
  entityId: string
  action: SyncAction
  localTimestamp: string
  serverTimestamp?: string
  conflictResolved: boolean
  conflictResolution?: ConflictResolution
  data?: Record<string, any>
  version?: number
}

export interface ConflictResolution {
  strategy: 'last-write-wins' | 'merge' | 'manual' | 'server-wins' | 'client-wins'
  resolvedBy: string
  resolvedAt: string
  originalData: Record<string, any>
  serverData: Record<string, any>
  clientData: Record<string, any>
  mergedData: Record<string, any>
  conflicts: ConflictField[]
}

export interface ConflictField {
  field: string
  serverValue: any
  clientValue: any
  resolution: 'server' | 'client' | 'merge' | 'manual'
  mergedValue?: any
}

export interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  lastSyncAt?: string
  pendingChanges: number
  conflicts: number
  errors: SyncError[]
}

export interface SyncError {
  id: string
  syncLogId: string
  error: string
  code: string
  timestamp: string
  retryCount: number
  maxRetries: number
  resolved: boolean
}

export interface SyncConfig {
  batchSize: number
  retryAttempts: number
  retryDelay: number
  conflictResolutionStrategy: 'last-write-wins' | 'merge' | 'manual'
  autoSync: boolean
  syncInterval: number
  offlineMode: boolean
}

export interface SyncQueue {
  pending: SyncLog[]
  processing: SyncLog[]
  completed: SyncLog[]
  failed: SyncLog[]
}

export interface SyncMetrics {
  totalSyncs: number
  successfulSyncs: number
  failedSyncs: number
  conflictsResolved: number
  averageSyncTime: number
  lastSyncDuration: number
  dataTransferred: number
}

export interface OfflineData {
  artifacts: Record<string, any>
  photos: Record<string, any>
  syncLogs: Record<string, SyncLog>
  lastSyncAt: string
  version: number
}

export interface SyncEvent {
  type: 'sync-started' | 'sync-completed' | 'sync-failed' | 'conflict-detected' | 'conflict-resolved'
  data?: any
  timestamp: string
}

export interface ConflictResolutionOptions {
  strategy: 'last-write-wins' | 'merge' | 'manual'
  mergeRules?: MergeRule[]
  customResolver?: (conflict: ConflictField) => any
}

export interface MergeRule {
  field: string
  strategy: 'server' | 'client' | 'merge' | 'custom'
  customResolver?: (serverValue: any, clientValue: any) => any
}

export interface SyncProgress {
  current: number
  total: number
  percentage: number
  currentItem?: string
  status: 'idle' | 'syncing' | 'completed' | 'error'
  errors: SyncError[]
}

export const DEFAULT_SYNC_CONFIG: SyncConfig = {
  batchSize: 50,
  retryAttempts: 3,
  retryDelay: 1000,
  conflictResolutionStrategy: 'last-write-wins',
  autoSync: true,
  syncInterval: 30000, // 30 seconds
  offlineMode: false,
}

export const SYNC_EVENTS = {
  SYNC_STARTED: 'sync-started',
  SYNC_COMPLETED: 'sync-completed',
  SYNC_FAILED: 'sync-failed',
  CONFLICT_DETECTED: 'conflict-detected',
  CONFLICT_RESOLVED: 'conflict-resolved',
  OFFLINE_MODE_ENABLED: 'offline-mode-enabled',
  OFFLINE_MODE_DISABLED: 'offline-mode-disabled',
} as const

export interface SyncState {
  status: SyncStatus
  queue: SyncQueue
  config: SyncConfig
  metrics: SyncMetrics
  progress: SyncProgress
}

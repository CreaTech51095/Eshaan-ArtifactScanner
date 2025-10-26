export interface Photo {
  id: string
  artifactId: string
  url: string
  filename: string
  size: number
  mimeType: string
  width: number
  height: number
  caption?: string
  takenAt: string
  uploadedBy: string
  uploadedAt: string
  isThumbnail: boolean
}

export interface Artifact {
  id: string
  qrCode: string
  name: string
  description?: string
  artifactType: string
  discoveryDate: string
  discoverySite: string
  location: string
  photos: Photo[]
  metadata?: Record<string, any>
  createdBy: string
  createdAt: string
  lastModifiedBy: string
  lastModifiedAt: string
  version: number
  isDeleted: boolean
  groupId?: string // Optional: artifacts can belong to a group
}

export interface CreateArtifactRequest {
  name: string
  description: string
  artifactType: string
  discoveryDate: string
  discoverySite: string
  location: string
  photos: File[]
  metadata?: Record<string, any>
  groupId?: string // Optional: assign artifact to a group
}

export interface UpdateArtifactRequest {
  name?: string
  description?: string
  artifactType?: string
  discoveryDate?: string
  discoverySite?: string
  location?: string
  photos?: File[]
  photosToKeep?: string[] // IDs of existing photos to keep
  metadata?: Record<string, any>
  version: number
}

export interface ArtifactFilters {
  search?: string
  artifactType?: string
  discoverySite?: string
  dateFrom?: string
  dateTo?: string
  createdBy?: string
}

export interface ArtifactListParams {
  page: number
  limit: number
  filters?: ArtifactFilters
  sortBy?: 'name' | 'discoveryDate' | 'createdAt' | 'lastModifiedAt'
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedArtifacts {
  artifacts: Artifact[]
  pagination: Pagination
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ArtifactType {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
}

export const ARTIFACT_TYPES: ArtifactType[] = [
  { id: 'pottery', name: 'Pottery', description: 'Ceramic vessels and containers', icon: '🏺', color: '#8B4513' },
  { id: 'tool', name: 'Tool', description: 'Stone, metal, or bone tools', icon: '🔨', color: '#696969' },
  { id: 'jewelry', name: 'Jewelry', description: 'Personal ornaments and adornments', icon: '💍', color: '#FFD700' },
  { id: 'weapon', name: 'Weapon', description: 'Swords, spears, arrows, and other weapons', icon: '⚔️', color: '#B22222' },
  { id: 'coin', name: 'Coin', description: 'Ancient coins and currency', icon: '🪙', color: '#CD7F32' },
  { id: 'sculpture', name: 'Sculpture', description: 'Carved or molded figures', icon: '🗿', color: '#D2B48C' },
  { id: 'textile', name: 'Textile', description: 'Fabric, clothing, and woven materials', icon: '🧵', color: '#DEB887' },
  { id: 'custom', name: 'Custom Type', description: 'Specify your own artifact type', icon: '✏️', color: '#808080' },
]

export interface QRCodeData {
  artifactId: string
  qrCode: string
  name: string
  artifactType: string
  discoveryDate: string
  discoverySite: string
  location: string
  createdAt: string
}

export interface ArtifactSearchResult {
  artifact: Artifact
  relevanceScore: number
  matchedFields: string[]
}

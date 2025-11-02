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
  artifactType: string // Deprecated: kept for backward compatibility
  material?: string // Primary categorization (stone, ceramic, metals, etc.)
  materialSubtype?: string // For metals: iron, copper alloy, lead, silver, gold
  objectClassification?: string // Secondary categorization by use (pottery, tool, jewelry, etc.)
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
  artifactType: string // Deprecated: kept for backward compatibility
  material?: string
  materialSubtype?: string
  objectClassification?: string
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
  artifactType?: string // Deprecated: kept for backward compatibility
  material?: string
  materialSubtype?: string
  objectClassification?: string
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

// Material types - primary archaeological categorization
export interface MaterialType {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
}

export const ARTIFACT_MATERIALS: MaterialType[] = [
  { id: 'stone', name: 'Stone', description: 'Stone artifacts', icon: '🪨', color: '#708090' },
  { id: 'ceramic', name: 'Ceramic', description: 'Clay-based fired materials', icon: '🏺', color: '#8B4513' },
  { id: 'metal', name: 'Metal', description: 'Metal artifacts (see subtypes)', icon: '⚙️', color: '#696969' },
  { id: 'wood', name: 'Wood', description: 'Wooden artifacts', icon: '🪵', color: '#8B7355' },
  { id: 'textile', name: 'Textile', description: 'Fabric and woven materials', icon: '🧵', color: '#DEB887' },
  { id: 'basket', name: 'Basket', description: 'Basketry and woven plant fibers', icon: '🧺', color: '#D2691E' },
  { id: 'bone', name: 'Bone', description: 'Bone and ivory', icon: '🦴', color: '#F5F5DC' },
  { id: 'feather', name: 'Feather', description: 'Feather artifacts', icon: '🪶', color: '#8FBC8F' },
  { id: 'glass', name: 'Glass', description: 'Glass artifacts', icon: '💎', color: '#87CEEB' },
  { id: 'leather', name: 'Leather', description: 'Leather and hide', icon: '🧳', color: '#A0522D' },
  { id: 'shell', name: 'Shell', description: 'Marine shell', icon: '🐚', color: '#FFE4C4' },
  { id: 'other', name: 'Other', description: 'Other materials', icon: '📦', color: '#808080' },
  { id: 'custom', name: 'Custom', description: 'Specify your own material', icon: '✏️', color: '#808080' },
]

// Metal subtypes - hierarchical breakdown
export interface MetalSubtype {
  id: string
  name: string
  description?: string
}

export const METAL_SUBTYPES: MetalSubtype[] = [
  { id: 'iron', name: 'Iron', description: 'Iron and steel' },
  { id: 'copper-alloy', name: 'Copper Alloy', description: 'Bronze, brass, and other copper alloys' },
  { id: 'lead', name: 'Lead', description: 'Lead artifacts' },
  { id: 'silver', name: 'Silver', description: 'Silver artifacts' },
  { id: 'gold', name: 'Gold', description: 'Gold artifacts' },
  { id: 'mixed', name: 'Mixed Metals', description: 'Multiple metal types' },
  { id: 'custom', name: 'Custom', description: 'Specify metal type' },
]

// Object classifications - categorization by use
export interface ObjectClassification {
  id: string
  name: string
  description?: string
  icon?: string
}

export const OBJECT_CLASSIFICATIONS: ObjectClassification[] = [
  { id: 'pottery', name: 'Pottery', description: 'Ceramic vessels and containers', icon: '🏺' },
  { id: 'vessel', name: 'Vessel', description: 'Containers for liquids or solids', icon: '🫙' },
  { id: 'tool', name: 'Tool', description: 'Implements used for work', icon: '🔨' },
  { id: 'jewelry', name: 'Jewelry', description: 'Personal ornaments', icon: '💍' },
  { id: 'weapon', name: 'Weapon', description: 'Implements for combat or hunting', icon: '⚔️' },
  { id: 'coin', name: 'Coin', description: 'Currency and monetary objects', icon: '🪙' },
  { id: 'sculpture', name: 'Sculpture', description: 'Carved or molded art', icon: '🗿' },
  { id: 'figurine', name: 'Figurine', description: 'Small carved or molded figures', icon: '🧸' },
  { id: 'ornament', name: 'Ornament', description: 'Decorative objects', icon: '✨' },
  { id: 'tablet', name: 'Tablet', description: 'Writing surfaces', icon: '📜' },
  { id: 'seal', name: 'Seal', description: 'Stamps and seal impressions', icon: '🔏' },
  { id: 'container', name: 'Container', description: 'Storage objects', icon: '📦' },
  { id: 'textile-item', name: 'Textile Item', description: 'Clothing or fabric goods', icon: '👕' },
  { id: 'architectural', name: 'Architectural', description: 'Building elements', icon: '🏛️' },
  { id: 'custom', name: 'Custom', description: 'Specify object type', icon: '✏️' },
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

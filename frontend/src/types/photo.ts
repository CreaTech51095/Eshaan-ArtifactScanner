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

export interface CreatePhotoRequest {
  file: File
  caption?: string
  isThumbnail?: boolean
}

export interface PhotoUploadProgress {
  photoId: string
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
}

export interface PhotoMetadata {
  width: number
  height: number
  size: number
  mimeType: string
  filename: string
  takenAt?: string
  camera?: {
    make?: string
    model?: string
    settings?: Record<string, any>
  }
  location?: {
    latitude?: number
    longitude?: number
    altitude?: number
  }
}

export interface PhotoFilters {
  artifactId?: string
  uploadedBy?: string
  dateFrom?: string
  dateTo?: string
  mimeType?: string
  isThumbnail?: boolean
}

export interface PhotoListParams {
  page: number
  limit: number
  filters?: PhotoFilters
  sortBy?: 'uploadedAt' | 'takenAt' | 'filename' | 'size'
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedPhotos {
  photos: Photo[]
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

export interface PhotoCompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

export interface PhotoResizeOptions {
  width: number
  height: number
  maintainAspectRatio?: boolean
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
}

export interface PhotoValidationError {
  field: string
  message: string
  code: string
}

export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
] as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const DEFAULT_COMPRESSION_OPTIONS: PhotoCompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  format: 'jpeg'
}

export const THUMBNAIL_OPTIONS: PhotoResizeOptions = {
  width: 300,
  height: 300,
  maintainAspectRatio: true,
  fit: 'cover'
}

export interface PhotoGalleryItem {
  photo: Photo
  isSelected: boolean
  isMain: boolean
  index: number
}

export interface PhotoViewerState {
  currentIndex: number
  isOpen: boolean
  photos: Photo[]
  showMetadata: boolean
  showControls: boolean
}

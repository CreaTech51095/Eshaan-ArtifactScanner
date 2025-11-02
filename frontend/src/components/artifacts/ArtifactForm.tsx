import React, { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { CreateArtifactRequest } from '../../types/artifact'
import { ARTIFACT_TYPES } from '../../types/artifact'
import { Camera, X, Upload } from 'lucide-react'
import { SUPPORTED_IMAGE_TYPES, MAX_FILE_SIZE } from '../../types/photo'
import CameraCapture from './CameraCapture'
import GroupSelector from '../groups/GroupSelector'
import { Group } from '../../types/group'
import { getUserGroups } from '../../services/groups'
import { useAuth } from '../../hooks/useAuth'

interface ArtifactFormProps {
  onSubmit: (data: CreateArtifactRequest & { photosToKeep?: string[] }) => void
  loading?: boolean
  initialData?: Partial<CreateArtifactRequest>
  existingPhotos?: any[]
  isEditMode?: boolean
}

const ArtifactForm: React.FC<ArtifactFormProps> = ({ 
  onSubmit, 
  loading = false, 
  initialData,
  existingPhotos = [],
  isEditMode = false
}) => {
  const { user } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<CreateArtifactRequest>({
    defaultValues: initialData
  })

  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([])
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([])
  const [photoError, setPhotoError] = useState<string>('')
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [keptPhotoIds, setKeptPhotoIds] = useState<string[]>(existingPhotos.map(p => p.id))
  const [userGroups, setUserGroups] = useState<Group[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(initialData?.groupId)
  const [artifactTypeSelection, setArtifactTypeSelection] = useState<string>(initialData?.artifactType || '')
  const [customArtifactType, setCustomArtifactType] = useState<string>('')
  const cameraInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadUserGroups = async () => {
      if (user) {
        try {
          const groups = await getUserGroups(user.id)
          setUserGroups(groups)
        } catch (error) {
          console.error('Error loading user groups:', error)
        }
      }
    }
    loadUserGroups()
  }, [user])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setPhotoError('')
    const newPhotos: File[] = []
    const newPreviewUrls: string[] = []
    let hasError = false

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!SUPPORTED_IMAGE_TYPES.includes(file.type as any)) {
        setPhotoError(`${file.name} is not a supported image format. Please use JPEG, PNG, or WebP.`)
        hasError = true
        return
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setPhotoError(`${file.name} exceeds the 10MB file size limit.`)
        hasError = true
        return
      }

      newPhotos.push(file)
      newPreviewUrls.push(URL.createObjectURL(file))
    })

    if (!hasError) {
      const updatedPhotos = [...selectedPhotos, ...newPhotos]
      const updatedPreviewUrls = [...photoPreviewUrls, ...newPreviewUrls]
      setSelectedPhotos(updatedPhotos)
      setPhotoPreviewUrls(updatedPreviewUrls)
      setValue('photos', updatedPhotos)
    }
  }

  const removePhoto = (index: number) => {
    const newPhotos = selectedPhotos.filter((_, i) => i !== index)
    const newPreviewUrls = photoPreviewUrls.filter((_, i) => i !== index)
    
    // Revoke the object URL to free memory
    URL.revokeObjectURL(photoPreviewUrls[index])
    
    setSelectedPhotos(newPhotos)
    setPhotoPreviewUrls(newPreviewUrls)
    setValue('photos', newPhotos)
  }

  const removeExistingPhoto = (photoId: string) => {
    const newKeptPhotoIds = keptPhotoIds.filter(id => id !== photoId)
    setKeptPhotoIds(newKeptPhotoIds)
    setPhotoError('')
  }

  const handleCameraCapture = (file: File) => {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setPhotoError(`Photo exceeds the 10MB file size limit.`)
      return
    }

    const newPhotos = [...selectedPhotos, file]
    const newPreviewUrl = URL.createObjectURL(file)
    const newPreviewUrls = [...photoPreviewUrls, newPreviewUrl]
    
    setSelectedPhotos(newPhotos)
    setPhotoPreviewUrls(newPreviewUrls)
    setValue('photos', newPhotos)
    setPhotoError('')
  }

  const handleFormSubmit = (data: CreateArtifactRequest) => {
    // Use custom artifact type if "custom" was selected
    const finalArtifactType = artifactTypeSelection === 'custom' 
      ? customArtifactType.trim() 
      : artifactTypeSelection

    if (artifactTypeSelection === 'custom' && !customArtifactType.trim()) {
      setPhotoError('Please specify a custom artifact type')
      return
    }

    onSubmit({ 
      ...data,
      artifactType: finalArtifactType,
      photos: selectedPhotos,
      groupId: selectedGroupId === 'uncategorized' ? undefined : selectedGroupId,
      ...(isEditMode && { photosToKeep: keptPhotoIds })
    })
  }

  return (
    <>
      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Artifact Name *
        </label>
        <input
          {...register('name', {
            required: 'Artifact name is required',
            maxLength: {
              value: 200,
              message: 'Name must be less than 200 characters'
            }
          })}
          type="text"
          id="name"
          className="input"
          placeholder="Enter artifact name"
        />
        {errors.name && (
          <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          {...register('description', {
            maxLength: {
              value: 2000,
              message: 'Description must be less than 2000 characters'
            }
          })}
          id="description"
          rows={4}
          className="input"
          placeholder="Enter artifact description"
        />
        {errors.description && (
          <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="artifactType" className="block text-sm font-medium text-gray-700 mb-1">
          Artifact Type
        </label>
        <select
          value={artifactTypeSelection}
          onChange={(e) => {
            setArtifactTypeSelection(e.target.value)
            setValue('artifactType', e.target.value)
          }}
          id="artifactType"
          className="input"
        >
          <option value="">Select artifact type</option>
          {ARTIFACT_TYPES.map((type) => (
            <option key={type.id} value={type.id}>
              {type.icon} {type.name}
            </option>
          ))}
        </select>
        {errors.artifactType && (
          <p className="text-red-600 text-sm mt-1">{errors.artifactType.message}</p>
        )}
        
        {/* Custom Type Input */}
        {artifactTypeSelection === 'custom' && (
          <div className="mt-3">
            <label htmlFor="customType" className="block text-sm font-medium text-gray-700 mb-1">
              Specify Artifact Type *
            </label>
            <input
              type="text"
              id="customType"
              value={customArtifactType}
              onChange={(e) => setCustomArtifactType(e.target.value)}
              placeholder="e.g., Manuscript, Bone Fragment, Papyrus..."
              className="input"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the specific type of artifact (max 50 characters)
            </p>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="discoveryDate" className="block text-sm font-medium text-gray-700 mb-1">
          Discovery Date
        </label>
        <input
          {...register('discoveryDate')}
          type="date"
          id="discoveryDate"
          className="input"
        />
        {errors.discoveryDate && (
          <p className="text-red-600 text-sm mt-1">{errors.discoveryDate.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="discoverySite" className="block text-sm font-medium text-gray-700 mb-1">
          Discovery Site
        </label>
        <input
          {...register('discoverySite', {
            maxLength: {
              value: 200,
              message: 'Discovery site must be less than 200 characters'
            }
          })}
          type="text"
          id="discoverySite"
          className="input"
          placeholder="Enter discovery site"
        />
        {errors.discoverySite && (
          <p className="text-red-600 text-sm mt-1">{errors.discoverySite.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Current Location
        </label>
        <input
          {...register('location', {
            maxLength: {
              value: 200,
              message: 'Location must be less than 200 characters'
            }
          })}
          type="text"
          id="location"
          className="input"
          placeholder="Enter current location"
        />
        {errors.location && (
          <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>
        )}
      </div>

      {/* Group Selection */}
      <GroupSelector
        groups={userGroups}
        selectedGroupId={selectedGroupId}
        onChange={setSelectedGroupId}
        label="Group (Optional)"
        placeholder="Select a group or leave uncategorized"
        showUncategorized={true}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photos <span className="text-gray-500 font-normal">
            (Optional)
          </span>
        </label>
        
        <div className="space-y-4">
          {/* Photo Upload Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex gap-3">
              <label
                htmlFor="photo-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4" />
                {photoPreviewUrls.length > 0 ? 'Add More Photos' : 'Choose Photos'}
              </label>
              <input
                id="photo-upload"
                type="file"
                accept={SUPPORTED_IMAGE_TYPES.join(',')}
                multiple
                onChange={handlePhotoChange}
                className="hidden"
              />
              
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Camera className="w-4 h-4" />
                Take Photo
              </button>
            </div>
            
            <div className="flex flex-col text-sm text-gray-500">
              <span>JPEG, PNG, or WebP (max 10MB each)</span>
              {photoPreviewUrls.length > 0 && (
                <span className="text-blue-600 font-medium">{photoPreviewUrls.length} photo{photoPreviewUrls.length !== 1 ? 's' : ''} selected</span>
              )}
            </div>
          </div>

          {/* Photo Error */}
          {photoError && (
            <p className="text-red-600 text-sm">{photoError}</p>
          )}

          {/* Existing Photos (Edit Mode) */}
          {isEditMode && existingPhotos.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">
                Current Photos ({keptPhotoIds.length} of {existingPhotos.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {existingPhotos.map((photo) => {
                  const isKept = keptPhotoIds.includes(photo.id)
                  return (
                    <div 
                      key={photo.id} 
                      className={`relative group ${!isKept ? 'opacity-40' : ''}`}
                    >
                      <img
                        src={photo.url}
                        alt={photo.filename}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      {isKept ? (
                        <button
                          type="button"
                          onClick={() => removeExistingPhoto(photo.id)}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove photo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                          <span className="text-white text-sm font-medium">Removed</span>
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded max-w-[90%] truncate">
                        {photo.filename}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* New Photo Previews */}
          {photoPreviewUrls.length > 0 && (
            <div className="space-y-2">
              {isEditMode && (
                <h4 className="text-sm font-medium text-gray-700">
                  New Photos ({photoPreviewUrls.length})
                </h4>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photoPreviewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-blue-300"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600 bg-opacity-90 text-white text-xs rounded max-w-[90%] truncate">
                      {selectedPhotos[index]?.name}
                    </div>
                    <div className="absolute top-2 left-2 px-2 py-1 bg-green-600 text-white text-xs rounded">
                      NEW
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Photos Message */}
          {photoPreviewUrls.length === 0 && (!isEditMode || existingPhotos.length === 0) && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">
                {isEditMode ? 'No new photos selected' : 'No photos added yet'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Photos are optional. You can add multiple photos - just select multiple files or add one at a time
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          className="btn btn-secondary btn-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-md"
        >
          {loading ? 'Saving...' : 'Save Artifact'}
        </button>
      </div>
      </form>
    </>
  )
}

export default ArtifactForm

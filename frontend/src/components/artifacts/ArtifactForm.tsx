import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { CreateArtifactRequest } from '../../types/artifact'
import { ARTIFACT_TYPES } from '../../types/artifact'
import { Camera, X, Upload } from 'lucide-react'
import { SUPPORTED_IMAGE_TYPES, MAX_FILE_SIZE } from '../../types/photo'
import CameraCapture from './CameraCapture'

interface ArtifactFormProps {
  onSubmit: (data: CreateArtifactRequest) => void
  loading?: boolean
  initialData?: Partial<CreateArtifactRequest>
  isEditMode?: boolean
}

const ArtifactForm: React.FC<ArtifactFormProps> = ({ 
  onSubmit, 
  loading = false, 
  initialData,
  isEditMode = false
}) => {
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
  const cameraInputRef = useRef<HTMLInputElement>(null)

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
    
    if (newPhotos.length === 0) {
      setPhotoError('At least one photo is required')
    }
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
    // Only require photos for new artifacts, not when editing
    if (!isEditMode && selectedPhotos.length === 0) {
      setPhotoError('At least one photo is required')
      return
    }
    onSubmit({ ...data, photos: selectedPhotos })
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
          Description *
        </label>
        <textarea
          {...register('description', {
            required: 'Description is required',
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
          Artifact Type *
        </label>
        <select
          {...register('artifactType', {
            required: 'Artifact type is required'
          })}
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
      </div>

      <div>
        <label htmlFor="discoveryDate" className="block text-sm font-medium text-gray-700 mb-1">
          Discovery Date *
        </label>
        <input
          {...register('discoveryDate', {
            required: 'Discovery date is required'
          })}
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
          Discovery Site *
        </label>
        <input
          {...register('discoverySite', {
            required: 'Discovery site is required',
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
          Current Location *
        </label>
        <input
          {...register('location', {
            required: 'Current location is required',
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photos {!isEditMode && '*'} <span className="text-gray-500 font-normal">
            {isEditMode ? '(Optional - add more photos)' : '(At least 1 required)'}
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
                Choose Photos
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
            
            <span className="text-sm text-gray-500">
              JPEG, PNG, or WebP (max 10MB each)
            </span>
          </div>

          {/* Photo Error */}
          {photoError && (
            <p className="text-red-600 text-sm">{photoError}</p>
          )}

          {/* Photo Previews */}
          {photoPreviewUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photoPreviewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded">
                    {selectedPhotos[index]?.name}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Photos Message */}
          {photoPreviewUrls.length === 0 && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">
                {isEditMode ? 'No new photos selected' : 'No photos added yet'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {isEditMode 
                  ? 'Optionally add more photos to the artifact' 
                  : 'Upload at least one photo of the artifact'}
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

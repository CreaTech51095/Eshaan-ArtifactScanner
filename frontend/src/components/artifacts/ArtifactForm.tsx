import React from 'react'
import { useForm } from 'react-hook-form'
import { CreateArtifactRequest } from '../../types/artifact'
import { ARTIFACT_TYPES } from '../../types/artifact'

interface ArtifactFormProps {
  onSubmit: (data: CreateArtifactRequest) => void
  loading?: boolean
  initialData?: Partial<CreateArtifactRequest>
}

const ArtifactForm: React.FC<ArtifactFormProps> = ({ 
  onSubmit, 
  loading = false, 
  initialData 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CreateArtifactRequest>({
    defaultValues: initialData
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
  )
}

export default ArtifactForm

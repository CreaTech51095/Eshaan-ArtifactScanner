/**
 * Geolocation Utility
 * 
 * Provides functions to capture device GPS coordinates using the browser's
 * Geolocation API with proper error handling and fallback support.
 */

export interface GeoLocation {
  lat: number
  lng: number
  accuracy?: number // Accuracy in meters
  timestamp?: number // When the location was captured
}

export interface GeolocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED' | 'UNKNOWN'
  message: string
}

export interface GeolocationResult {
  success: boolean
  location?: GeoLocation
  error?: GeolocationError
}

/**
 * Check if geolocation is supported by the browser
 */
export const isGeolocationSupported = (): boolean => {
  return 'geolocation' in navigator
}

/**
 * Get the current device location using the Geolocation API
 * 
 * @param timeout - Maximum time to wait for location (in milliseconds)
 * @param enableHighAccuracy - Request high accuracy GPS (may take longer)
 * @returns Promise with location result
 */
export const getCurrentLocation = async (
  timeout: number = 10000,
  enableHighAccuracy: boolean = true
): Promise<GeolocationResult> => {
  // Check if geolocation is supported
  if (!isGeolocationSupported()) {
    return {
      success: false,
      error: {
        code: 'NOT_SUPPORTED',
        message: 'Geolocation is not supported by your browser'
      }
    }
  }

  return new Promise((resolve) => {
    const options: PositionOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge: 5000 // Accept cached position up to 5 seconds old
    }

    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position: GeolocationPosition) => {
        const location: GeoLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        }

        resolve({
          success: true,
          location
        })
      },
      // Error callback
      (error: GeolocationPositionError) => {
        let errorCode: GeolocationError['code']
        let errorMessage: string

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorCode = 'PERMISSION_DENIED'
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.'
            break
          case error.POSITION_UNAVAILABLE:
            errorCode = 'POSITION_UNAVAILABLE'
            errorMessage = 'Location information is unavailable. Please check your device settings.'
            break
          case error.TIMEOUT:
            errorCode = 'TIMEOUT'
            errorMessage = 'Location request timed out. Please try again.'
            break
          default:
            errorCode = 'UNKNOWN'
            errorMessage = 'An unknown error occurred while getting location.'
        }

        resolve({
          success: false,
          error: {
            code: errorCode,
            message: errorMessage
          }
        })
      },
      options
    )
  })
}

/**
 * Watch the device location continuously (useful for tracking movement)
 * 
 * @param onUpdate - Callback function called when location updates
 * @param onError - Callback function called on errors
 * @returns Function to stop watching
 */
export const watchLocation = (
  onUpdate: (location: GeoLocation) => void,
  onError: (error: GeolocationError) => void
): (() => void) => {
  if (!isGeolocationSupported()) {
    onError({
      code: 'NOT_SUPPORTED',
      message: 'Geolocation is not supported by your browser'
    })
    return () => {}
  }

  const options: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 1000
  }

  const watchId = navigator.geolocation.watchPosition(
    (position: GeolocationPosition) => {
      onUpdate({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      })
    },
    (error: GeolocationPositionError) => {
      let errorCode: GeolocationError['code']
      let errorMessage: string

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorCode = 'PERMISSION_DENIED'
          errorMessage = 'Location permission denied'
          break
        case error.POSITION_UNAVAILABLE:
          errorCode = 'POSITION_UNAVAILABLE'
          errorMessage = 'Location unavailable'
          break
        case error.TIMEOUT:
          errorCode = 'TIMEOUT'
          errorMessage = 'Location request timed out'
          break
        default:
          errorCode = 'UNKNOWN'
          errorMessage = 'Unknown location error'
      }

      onError({ code: errorCode, message: errorMessage })
    },
    options
  )

  // Return cleanup function
  return () => {
    navigator.geolocation.clearWatch(watchId)
  }
}

/**
 * Format coordinates for display
 * 
 * @param lat - Latitude
 * @param lng - Longitude
 * @param precision - Number of decimal places (default 6)
 * @returns Formatted coordinate string
 */
export const formatCoordinates = (
  lat: number,
  lng: number,
  precision: number = 6
): string => {
  const latDirection = lat >= 0 ? 'N' : 'S'
  const lngDirection = lng >= 0 ? 'E' : 'W'
  
  return `${Math.abs(lat).toFixed(precision)}° ${latDirection}, ${Math.abs(lng).toFixed(precision)}° ${lngDirection}`
}

/**
 * Generate a Google Maps link for coordinates
 * 
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Google Maps URL
 */
export const getGoogleMapsLink = (lat: number, lng: number): string => {
  return `https://www.google.com/maps?q=${lat},${lng}`
}

/**
 * Validate coordinates
 * 
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns true if coordinates are valid
 */
export const validateCoordinates = (lat: number, lng: number): boolean => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  )
}

/**
 * Parse coordinate string to numbers
 * Supports formats like:
 * - "40.7128, -74.0060"
 * - "40.7128° N, 74.0060° W"
 * - "40.7128 N, 74.0060 W"
 * 
 * @param coordString - Coordinate string
 * @returns Parsed coordinates or null if invalid
 */
export const parseCoordinates = (coordString: string): { lat: number; lng: number } | null => {
  try {
    // Remove degree symbols and direction letters for parsing
    const cleaned = coordString
      .replace(/°/g, '')
      .replace(/[NSEW]/gi, '')
      .trim()
    
    // Split by comma
    const parts = cleaned.split(',').map(p => p.trim())
    
    if (parts.length !== 2) {
      return null
    }
    
    const lat = parseFloat(parts[0])
    const lng = parseFloat(parts[1])
    
    // Check for N/S and E/W directions in original string
    const hasS = /S/i.test(coordString.split(',')[0])
    const hasW = /W/i.test(coordString.split(',')[1])
    
    const finalLat = hasS ? -Math.abs(lat) : lat
    const finalLng = hasW ? -Math.abs(lng) : lng
    
    if (!validateCoordinates(finalLat, finalLng)) {
      return null
    }
    
    return { lat: finalLat, lng: finalLng }
  } catch {
    return null
  }
}

/**
 * Geocoding result from location search
 */
export interface GeocodingResult {
  lat: number
  lng: number
  displayName: string
  address?: {
    city?: string
    state?: string
    country?: string
    countryCode?: string
  }
}

/**
 * Search for a location by address/place name using Nominatim (OpenStreetMap)
 * Returns coordinates and formatted address
 * 
 * @param query - Location search query (e.g., "New York City", "Paris, France", "90210")
 * @returns Array of matching locations
 */
export const searchLocation = async (query: string): Promise<GeocodingResult[]> => {
  if (!query || query.trim().length < 3) {
    return []
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim())
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodedQuery}&` +
      `format=json&` +
      `addressdetails=1&` +
      `limit=5`,
      {
        headers: {
          'User-Agent': 'ArtifactScanner/1.0' // Required by Nominatim
        }
      }
    )

    if (!response.ok) {
      throw new Error('Geocoding request failed')
    }

    const data = await response.json()

    return data.map((result: any) => ({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name,
      address: {
        city: result.address?.city || result.address?.town || result.address?.village,
        state: result.address?.state,
        country: result.address?.country,
        countryCode: result.address?.country_code
      }
    }))
  } catch (error) {
    console.error('Geocoding error:', error)
    return []
  }
}

/**
 * Reverse geocoding - get address from coordinates
 * 
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Address information
 */
export const reverseGeocode = async (
  lat: number, 
  lng: number
): Promise<GeocodingResult | null> => {
  if (!validateCoordinates(lat, lng)) {
    return null
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?` +
      `lat=${lat}&` +
      `lon=${lng}&` +
      `format=json&` +
      `addressdetails=1`,
      {
        headers: {
          'User-Agent': 'ArtifactScanner/1.0'
        }
      }
    )

    if (!response.ok) {
      return null
    }

    const result = await response.json()

    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name,
      address: {
        city: result.address?.city || result.address?.town || result.address?.village,
        state: result.address?.state,
        country: result.address?.country,
        countryCode: result.address?.country_code
      }
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}


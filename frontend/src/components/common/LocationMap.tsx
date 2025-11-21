import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon } from 'leaflet'

// Fix for default marker icons in React-Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// @ts-ignore
delete Icon.Default.prototype._getIconUrl
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

interface LocationMapProps {
  lat: number
  lng: number
  zoom?: number
  height?: string
  markerLabel?: string
  accuracy?: number
  className?: string
  showAccuracyCircle?: boolean
}

/**
 * Component to update map view when coordinates change
 */
const ChangeView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  
  return null
}

/**
 * LocationMap Component
 * 
 * Displays an interactive map with a marker at the specified coordinates.
 * Uses OpenStreetMap tiles (free, no API key required).
 */
const LocationMap: React.FC<LocationMapProps> = ({
  lat,
  lng,
  zoom = 13,
  height = '300px',
  markerLabel,
  accuracy,
  className = '',
  showAccuracyCircle = false
}) => {
  const position: [number, number] = [lat, lng]

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <MapContainer
        center={position}
        zoom={zoom}
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
        scrollWheelZoom={false}
      >
        <ChangeView center={position} zoom={zoom} />
        
        {/* OpenStreetMap tiles - free, no API key needed */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Marker at the location */}
        <Marker position={position}>
          <Popup>
            <div className="text-sm">
              {markerLabel && (
                <p className="font-semibold mb-1">{markerLabel}</p>
              )}
              <p className="text-xs text-gray-600">
                {lat.toFixed(6)}°, {lng.toFixed(6)}°
              </p>
              {accuracy && (
                <p className="text-xs text-gray-500 mt-1">
                  Accuracy: ±{Math.round(accuracy)}m
                </p>
              )}
            </div>
          </Popup>
        </Marker>
        
        {/* Accuracy circle (if enabled and accuracy provided) */}
        {showAccuracyCircle && accuracy && (
          <circle
            center={position}
            radius={accuracy}
            pathOptions={{
              fillColor: 'blue',
              fillOpacity: 0.1,
              color: 'blue',
              weight: 2,
              opacity: 0.5
            }}
          />
        )}
      </MapContainer>
      
      {/* Coordinates display overlay */}
      <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded shadow-sm text-xs z-[1000]">
        <span className="font-mono text-gray-700">
          {lat.toFixed(6)}°, {lng.toFixed(6)}°
        </span>
      </div>
      
      {/* Zoom hint */}
      <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded shadow-sm text-xs z-[1000] text-gray-600">
        Use Ctrl+Scroll to zoom
      </div>
    </div>
  )
}

export default LocationMap


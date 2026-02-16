# GPS Location Capture Feature

## Overview

This feature automatically captures GPS coordinates when users log or scan artifacts. The coordinates are saved to Firestore and displayed on the artifact detail page.

## Architecture

### Files Added/Modified

1. **`utils/geolocation.ts`** (NEW)
   - Core geolocation utility with browser Geolocation API integration
   - Functions for capturing, validating, and formatting GPS coordinates
   - Error handling for permissions and timeouts

2. **`types/artifact.ts`** (MODIFIED)
   - Added `GpsLocation` interface
   - Updated `Artifact`, `CreateArtifactRequest`, and `UpdateArtifactRequest` types

3. **`components/artifacts/ArtifactForm.tsx`** (MODIFIED)
   - Automatic GPS capture on form load
   - Manual coordinate entry fallback
   - GPS status display (loading, success, error)

4. **`services/artifacts.ts`** (MODIFIED)
   - Saves GPS location to Firestore

5. **`services/artifactsOffline.ts`** (MODIFIED)
   - Includes GPS location in offline artifact storage

6. **`pages/ArtifactDetailPage.tsx`** (MODIFIED)
   - Displays GPS coordinates with formatting
   - Google Maps link integration

## How It Works

### Automatic Capture Flow

1. User opens artifact creation form
2. Component automatically requests GPS location on mount
3. Browser prompts user for location permission (first time only)
4. If permission granted:
   - Coordinates are captured (lat/lng)
   - Accuracy and timestamp are recorded
   - Success message displays with formatted coordinates
5. If permission denied or GPS fails:
   - Error message displays
   - Manual entry option becomes available
   - User can retry automatic capture

### Manual Entry Flow

1. User clicks "Enter Manually" button
2. Input fields appear for latitude and longitude
3. Coordinates are validated:
   - Latitude: -90 to 90
   - Longitude: -180 to 180
4. Valid coordinates are saved
5. Form proceeds normally

### Data Storage

GPS location is stored in Firestore as:

```json
{
  "gpsLocation": {
    "lat": 40.7128,
    "lng": -74.0060,
    "accuracy": 10,
    "timestamp": 1700000000000
  }
}
```

## API Reference

### `geolocation.ts` Functions

#### `getCurrentLocation(timeout?, enableHighAccuracy?)`

Captures current device location.

**Parameters:**
- `timeout` (number): Max wait time in ms (default: 10000)
- `enableHighAccuracy` (boolean): Request high accuracy GPS (default: true)

**Returns:** `Promise<GeolocationResult>`

**Example:**
```typescript
const result = await getCurrentLocation()
if (result.success) {
  console.log('Location:', result.location)
} else {
  console.error('Error:', result.error.message)
}
```

#### `formatCoordinates(lat, lng, precision?)`

Formats coordinates for display.

**Parameters:**
- `lat` (number): Latitude
- `lng` (number): Longitude
- `precision` (number): Decimal places (default: 6)

**Returns:** `string` - Formatted coordinate string

**Example:**
```typescript
formatCoordinates(40.7128, -74.0060)
// Returns: "40.712800° N, 74.006000° W"
```

#### `validateCoordinates(lat, lng)`

Validates coordinate values.

**Returns:** `boolean`

#### `getGoogleMapsLink(lat, lng)`

Generates Google Maps URL.

**Returns:** `string`

#### `parseCoordinates(coordString)`

Parses coordinate strings in various formats.

**Supports:**
- "40.7128, -74.0060"
- "40.7128° N, 74.0060° W"
- "40.7128 N, 74.0060 W"

**Returns:** `{ lat: number, lng: number } | null`

## User Experience

### Permission States

1. **First Time Use**
   - Browser prompts for location permission
   - User can allow or deny

2. **Permission Granted**
   - Automatic capture happens in background
   - Success indicator shows coordinates
   - Link to view on Google Maps

3. **Permission Denied**
   - Friendly error message
   - Manual entry option
   - Option to retry (prompts permission again)

4. **Timeout/Error**
   - Clear error explanation
   - Retry button
   - Manual entry option

### Mobile Considerations

- High accuracy mode uses GPS (better outdoors)
- Falls back to Wi-Fi/cell tower triangulation
- Accuracy varies (typically 5-50m)
- May take 5-10 seconds for first fix

### Privacy

- Location is only captured when user creates/edits artifact
- User can deny permission and use manual entry
- Location is optional (not required)
- User can clear GPS data by editing artifact

## Testing

### Manual Testing Checklist

- [ ] Create artifact with GPS enabled
- [ ] Verify coordinates appear in Firestore
- [ ] View artifact detail page - coordinates display correctly
- [ ] Click Google Maps link - opens correct location
- [ ] Deny location permission - manual entry appears
- [ ] Enter manual coordinates - validation works
- [ ] Test offline mode - GPS data saves locally
- [ ] Sync offline artifact - GPS data syncs to Firestore

### Browser Testing

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (iOS/macOS)
- [ ] Mobile browsers

### Permission Testing

1. **First Visit:**
   - Should show browser permission prompt
   - Accept: GPS captures automatically
   - Deny: Shows fallback UI

2. **Subsequent Visits:**
   - Permission remembered by browser
   - No prompt if previously granted
   - Manual override available in browser settings

## Error Handling

All errors are handled gracefully:

| Error | User Message | Fallback |
|-------|-------------|----------|
| Permission Denied | "Location permission denied. Please enable..." | Manual entry |
| Timeout | "Location request timed out. Please try again." | Retry + Manual |
| Position Unavailable | "Location information is unavailable..." | Retry + Manual |
| Not Supported | "Geolocation is not supported by your browser" | Manual entry only |

## Browser Compatibility

✅ **Supported:**
- Chrome 5+
- Firefox 3.5+
- Safari 5+
- Edge 12+
- iOS Safari 3.2+
- Android Browser 2.1+

❌ **Not Supported:**
- Internet Explorer 8 and below
- Very old mobile browsers

For unsupported browsers, manual entry is always available.

## Security Notes

1. **HTTPS Required**: Geolocation API only works on HTTPS (or localhost)
2. **User Permission**: Browser enforces user permission - cannot bypass
3. **Privacy**: Location is only captured when explicitly creating artifacts
4. **Data Storage**: GPS data stored securely in Firestore with auth rules

## Future Enhancements

Potential improvements:

1. **Map Preview**: Show location on embedded map in form
2. **Location History**: Track movement between artifact locations
3. **Batch Geocoding**: Convert coordinates to addresses
4. **Location Clustering**: Group artifacts by geographic proximity
5. **Offline Maps**: Cache map tiles for offline viewing
6. **Location Tracking**: Continuous tracking for field surveys
7. **Geofencing**: Alerts when entering/leaving dig sites

## Troubleshooting

### GPS Not Working?

1. **Check HTTPS**: Must be on HTTPS (production) or localhost (dev)
2. **Check Permissions**: Browser settings may block location
3. **Check Device**: Ensure device has GPS/location services enabled
4. **Try Manual Entry**: Always available as fallback

### Inaccurate Coordinates?

1. **Move Outdoors**: GPS accuracy improves outside
2. **Wait Longer**: First GPS fix can take 10-30 seconds
3. **Enable High Accuracy**: Default setting in code
4. **Check Accuracy Value**: Displayed in UI (in meters)

### Permission Prompt Not Showing?

1. **Already Denied**: Check browser settings to reset
2. **HTTPS Required**: Won't work on HTTP in production
3. **Browser Restrictions**: Some browsers restrict in iframes

## Support

For issues or questions:
1. Check browser console for errors
2. Verify HTTPS/localhost
3. Test in different browser
4. Use manual entry as workaround
5. Check Firestore for saved data



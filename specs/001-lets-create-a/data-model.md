# Data Model: Archaeological Artifacts Scanner App

## Entities

### User
**Purpose**: Represents system users with role-based access control
**Fields**:
- `id`: string (Firebase Auth UID)
- `email`: string (unique, required)
- `username`: string (unique, required)
- `role`: enum ['admin', 'archaeologist', 'researcher'] (required)
- `displayName`: string (optional)
- `createdAt`: timestamp
- `lastLoginAt`: timestamp
- `isActive`: boolean (default: true)

**Validation Rules**:
- Email must be valid format
- Username must be 3-50 characters, alphanumeric + underscore
- Role must be one of the defined enum values
- Display name must be 1-100 characters

**Relationships**:
- One-to-many with Artifact (createdBy field)
- One-to-many with Artifact (lastModifiedBy field)

### Artifact
**Purpose**: Represents a physical archaeological object with digital record
**Fields**:
- `id`: string (Firebase document ID)
- `qrCode`: string (unique, required) - QR code content
- `name`: string (required, 1-200 characters)
- `description`: string (optional, max 2000 characters)
- `artifactType`: string (required) - e.g., "pottery", "tool", "jewelry"
- `discoveryDate`: date (required)
- `discoverySite`: string (required, 1-200 characters)
- `location`: string (required, 1-200 characters) - current location
- `photos`: array of Photo objects
- `metadata`: object (optional) - additional custom fields
- `createdBy`: string (User ID, required)
- `createdAt`: timestamp
- `lastModifiedBy`: string (User ID, required)
- `lastModifiedAt`: timestamp
- `version`: number (for conflict resolution, starts at 1)
- `isDeleted`: boolean (soft delete, default: false)

**Validation Rules**:
- Name must be 1-200 characters
- Description must be max 2000 characters
- Discovery date cannot be in the future
- All required fields must be present
- QR code must be unique across all artifacts

**State Transitions**:
- Created → Active (when first saved)
- Active → Modified (when updated)
- Active → Deleted (soft delete)
- Deleted → Active (restore)

### Photo
**Purpose**: Represents a digital image associated with an artifact
**Fields**:
- `id`: string (Firebase Storage path)
- `artifactId`: string (Artifact ID, required)
- `url`: string (Firebase Storage URL)
- `filename`: string (original filename)
- `size`: number (file size in bytes)
- `mimeType`: string (image MIME type)
- `width`: number (pixels)
- `height`: number (pixels)
- `caption`: string (optional, max 500 characters)
- `takenAt`: timestamp (when photo was taken)
- `uploadedBy`: string (User ID, required)
- `uploadedAt`: timestamp
- `isThumbnail`: boolean (default: false)

**Validation Rules**:
- File size must be max 10MB
- MIME type must be image/* (jpg, png, webp)
- Width and height must be positive numbers
- Caption must be max 500 characters

**Relationships**:
- Many-to-one with Artifact (via artifactId)

### SyncLog
**Purpose**: Tracks data synchronization for offline/online conflict resolution
**Fields**:
- `id`: string (Firebase document ID)
- `userId`: string (User ID, required)
- `entityType`: enum ['artifact', 'photo'] (required)
- `entityId`: string (Entity ID, required)
- `action`: enum ['create', 'update', 'delete'] (required)
- `localTimestamp`: timestamp (when action occurred offline)
- `serverTimestamp`: timestamp (when synced to server)
- `conflictResolved`: boolean (default: false)
- `conflictResolution`: object (optional) - details of how conflict was resolved

**Validation Rules**:
- All required fields must be present
- Timestamps must be valid dates
- Action must be one of the defined enum values

**Relationships**:
- Many-to-one with User (via userId)

## Database Rules

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Artifacts: archaeologists can create/edit, researchers can read
    match /artifacts/{artifactId} {
      allow read: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'archaeologist', 'researcher']);
      allow create, update: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'archaeologist']);
      allow delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Photos: same rules as artifacts
    match /photos/{photoId} {
      allow read: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'archaeologist', 'researcher']);
      allow create, update: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'archaeologist']);
      allow delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Sync logs: users can only access their own
    match /syncLogs/{logId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

### Firebase Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /artifacts/{artifactId}/{photoId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.resource.size < 10 * 1024 * 1024 && // 10MB limit
        request.resource.contentType.matches('image/.*');
    }
  }
}
```

## Indexes

### Firestore Indexes
- `artifacts`: Composite index on `(isDeleted, discoveryDate desc)`
- `artifacts`: Composite index on `(isDeleted, artifactType, discoverySite)`
- `artifacts`: Composite index on `(isDeleted, createdBy, createdAt desc)`
- `photos`: Composite index on `(artifactId, uploadedAt desc)`
- `syncLogs`: Composite index on `(userId, serverTimestamp desc)`

## Data Migration Strategy

### Version 1.0 to 1.1
- Add `version` field to existing artifacts (default: 1)
- Add `isDeleted` field to existing artifacts (default: false)
- Update security rules to include new fields

### Conflict Resolution
- Use `version` field for optimistic locking
- Last-write-wins with user prompt for conflicts
- Track conflicts in SyncLog for audit trail
- Provide merge options for non-conflicting fields

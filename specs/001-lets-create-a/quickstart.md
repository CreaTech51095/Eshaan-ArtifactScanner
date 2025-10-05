# Quickstart Guide: Archaeological Artifacts Scanner App

## Overview
This guide demonstrates the core functionality of the archaeological artifacts scanner app through step-by-step user scenarios.

## Prerequisites
- Modern web browser with camera access
- Internet connection (for initial setup and sync)
- User account with appropriate role (admin, archaeologist, or researcher)

## User Scenarios

### Scenario 1: User Authentication
**Goal**: Log into the system with appropriate permissions

**Steps**:
1. Navigate to the app URL
2. Click "Login" button
3. Enter email: `archaeologist@university.edu`
4. Enter password: `securePassword123`
5. Click "Sign In"
6. Verify dashboard loads with user role displayed

**Expected Result**: User successfully authenticated and redirected to dashboard

### Scenario 2: Create New Artifact
**Goal**: Create a new artifact record and generate QR code

**Steps**:
1. From dashboard, click "Add New Artifact"
2. Fill in artifact details:
   - Name: "Bronze Age Ceramic Bowl"
   - Description: "Well-preserved ceramic bowl with geometric patterns"
   - Artifact Type: "pottery"
   - Discovery Date: "2024-12-15"
   - Discovery Site: "Site Alpha, Trench 2"
   - Location: "Museum Storage Room B"
3. Click "Save Artifact"
4. Verify QR code is generated and displayed
5. Click "Print QR Code" to generate printable version

**Expected Result**: New artifact created with unique QR code generated

### Scenario 3: Scan Existing Artifact
**Goal**: Retrieve artifact information by scanning QR code

**Steps**:
1. From dashboard, click "Scan QR Code"
2. Allow camera access when prompted
3. Point camera at QR code from Scenario 2
4. Wait for QR code to be detected (should be <1 second)
5. Verify artifact details are displayed
6. Click "View Full Details" to see complete record

**Expected Result**: Artifact information retrieved and displayed from QR code scan

### Scenario 4: Add Photos to Artifact
**Goal**: Upload additional photos to an existing artifact

**Steps**:
1. From artifact detail view, click "Add Photos"
2. Click "Choose Files" and select image files
3. Add captions for each photo:
   - "Front view showing geometric patterns"
   - "Side profile view"
   - "Base view with maker's mark"
4. Click "Upload Photos"
5. Verify photos appear in artifact gallery
6. Click on photo to view full size

**Expected Result**: Photos successfully uploaded and associated with artifact

### Scenario 5: Search and Filter Artifacts
**Goal**: Find specific artifacts using search and filter options

**Steps**:
1. From dashboard, click "View All Artifacts"
2. Use search bar to search for "Bronze Age"
3. Apply filter: Artifact Type = "pottery"
4. Apply filter: Discovery Site = "Site Alpha"
5. Verify filtered results show only matching artifacts
6. Clear filters and search for "ceramic"
7. Verify search results update in real-time

**Expected Result**: Search and filter functionality works correctly

### Scenario 6: Offline Mode - Create Artifact
**Goal**: Create artifact while offline and sync when online

**Steps**:
1. Disconnect from internet (or use browser dev tools to simulate offline)
2. Verify app shows "Offline Mode" indicator
3. Click "Add New Artifact"
4. Fill in artifact details:
   - Name: "Offline Test Artifact"
   - Description: "Created while offline"
   - Artifact Type: "tool"
   - Discovery Date: "2024-12-19"
   - Discovery Site: "Test Site"
   - Location: "Test Location"
5. Click "Save Artifact"
6. Verify artifact is saved locally (shows in offline list)
7. Reconnect to internet
8. Wait for sync indicator to show "Syncing..."
9. Verify sync completes and artifact appears in main list

**Expected Result**: Artifact created offline and successfully synced when online

### Scenario 7: Conflict Resolution
**Goal**: Handle data conflicts when multiple users edit the same artifact

**Steps**:
1. User A: Open artifact "Bronze Age Ceramic Bowl"
2. User A: Edit description to "Updated description by User A"
3. User A: Save changes (while offline)
4. User B: Open same artifact
5. User B: Edit description to "Updated description by User B"
6. User B: Save changes
7. User A: Go online and sync
8. Verify conflict resolution dialog appears
9. Choose to keep User A's version
10. Verify final description shows User A's changes

**Expected Result**: Conflict resolution dialog appears and user can choose resolution

### Scenario 8: Role-Based Access Control
**Goal**: Verify different user roles have appropriate access levels

**Steps**:
1. Login as researcher (read-only role)
2. Navigate to artifact list
3. Verify "Add New Artifact" button is not visible
4. Open an artifact detail view
5. Verify "Edit" button is not visible
6. Verify "Delete" button is not visible
7. Login as archaeologist (create/edit role)
8. Verify "Add New Artifact" button is visible
9. Verify "Edit" button is visible
10. Verify "Delete" button is not visible (admin only)
11. Login as admin (full access)
12. Verify all buttons are visible

**Expected Result**: Access controls properly enforced based on user role

## Performance Validation

### Page Load Times
- Dashboard loads in <2 seconds
- Artifact list loads in <2 seconds
- QR code scan detection in <1 second

### Offline Performance
- Offline artifact creation completes in <3 seconds
- Offline sync completes in <5 seconds
- App works fully offline for 24+ hours

### Data Validation
- All form validations work correctly
- File upload size limits enforced (10MB max)
- Image format validation works (jpg, png, webp only)
- Required field validation prevents empty submissions

## Error Handling

### Network Errors
- Graceful handling of network timeouts
- Clear error messages for connection issues
- Automatic retry for failed requests

### Camera Access
- Clear instructions when camera access is denied
- Fallback to file upload when camera unavailable
- QR code detection works in various lighting conditions

### Data Conflicts
- Clear conflict resolution interface
- Audit trail of all changes
- Option to merge non-conflicting fields

## Success Criteria
- All scenarios complete without errors
- Performance targets met
- Offline functionality works reliably
- Role-based access properly enforced
- Data synchronization handles conflicts gracefully

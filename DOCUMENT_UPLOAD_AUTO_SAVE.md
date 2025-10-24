# Document Upload Auto-Save Implementation

## Overview
This document describes the implementation of comprehensive document tracking and auto-save functionality for the Document Verification section. Now, every time a user uploads a document, the system automatically saves detailed information to the backend, allowing for complete state restoration when users return.

## What's New

### 1. Enhanced Document State Structure
Added `documentsDetails` array to track comprehensive information about each uploaded document:

```typescript
documentsDetails: Array<{
  documentName: string;           // e.g., "Passport", "Driver License"
  documentDefinitionId: number;   // Dynamic ID from API config
  frontFileId: number;            // File ID for front side
  backFileId?: number;            // File ID for back side (optional)
  status: "uploaded" | "pending"; // Current status
  uploadedAt: string;             // ISO timestamp
}>
```

### 2. Auto-Save After Each Upload
- **Camera Upload**: When a user captures a document with the camera, the system immediately saves document details to the backend
- **Device Upload**: When a user uploads from device, the system immediately saves document details to the backend
- **No manual save needed**: Data is automatically persisted without user intervention

### 3. Backend Data Structure (POST Request)
When saving document section data, the system now sends:

```json
{
  "fieldValue": {
    "documentsUploaded": true,
    "completedAt": "2025-10-17T08:02:18.688Z",
    "country": "India",
    "uploadedDocuments": ["passport", "driver_license"],
    "documentsDetails": [
      {
        "documentName": "Passport",
        "documentDefinitionId": 123,
        "frontFileId": 456,
        "backFileId": 789,
        "status": "uploaded",
        "uploadedAt": "2025-10-17T08:01:30.000Z"
      },
      {
        "documentName": "Driver License",
        "documentDefinitionId": 124,
        "frontFileId": 457,
        "status": "uploaded",
        "uploadedAt": "2025-10-17T08:02:18.000Z"
      }
    ],
    "uploadedFiles": [...],      // Legacy field for backward compatibility
    "documentUploadIds": {...},   // Legacy field for backward compatibility
    "selectedDocument": ""
  }
}
```

### 4. State Restoration (GET Request)
When a user returns to the form, the system:
1. Fetches saved data from `GET /api/submissions/{submissionId}/values`
2. Parses the `documentsDetails` array
3. Restores:
   - Country selection
   - List of uploaded documents
   - Document cards showing "Uploaded" status
   - File IDs for download functionality
   - All document metadata

### 5. Document Download Functionality
Users can now download their previously uploaded documents:
- Click on uploaded document card
- Downloads both front and back images
- Uses stored `frontFileId` and `backFileId` from `documentsDetails`

## Technical Implementation

### Files Modified

#### 1. `IdentityVerificationPage.tsx`
- **Added**: `documentsDetails` to `documentFormState` type
- **Updated**: `postSectionData()` to include comprehensive document data
- **Updated**: `fetchSubmissionValues()` to restore `documentsDetails` from backend
- **Added**: `handleDocumentUploaded()` callback for auto-save trigger

#### 2. `IdentityDocumentForm.tsx`
- **Added**: `documentsDetails` to props interface
- **Added**: `onDocumentUploaded` callback prop
- **Added**: `addDocumentDetail()` helper function to update document details
- **Added**: `getCurrentDocumentDefinitionId()` helper to extract document definition IDs
- **Updated**: Camera upload handler to call `addDocumentDetail()` and trigger auto-save
- **Updated**: Device upload handler to call `addDocumentDetail()` and trigger auto-save

#### 3. `DynamicSection.tsx`
- **Added**: `documentsDetails` to props interface
- **Added**: `onDocumentUploaded` callback prop
- **Updated**: Pass callback to `IdentityDocumentForm`

#### 4. `DesktopDynamicSection.tsx`
- **Added**: `documentsDetails` to props interface  
- **Added**: `onDocumentUploaded` callback prop
- **Updated**: Pass callback to `IdentityDocumentForm`

## Flow Diagram

```
User uploads document (Camera/Device)
    ↓
Upload files to server
    ↓
Get frontFileId and backFileId
    ↓
Extract documentDefinitionId from API config
    ↓
Call addDocumentDetail()
    ↓
Update documentFormState.documentsDetails
    ↓
Trigger onDocumentUploaded() callback
    ↓
Auto-save to backend via postSectionData()
    ↓
✅ Document details persisted!
```

## Benefits

### For Users
1. **No data loss**: Even if browser crashes or user closes tab, uploaded documents are saved
2. **Resume anytime**: Users can return to the form and see all previously uploaded documents
3. **Download capability**: Users can download their uploaded documents at any time
4. **Clear status**: Visual indicators show which documents are uploaded

### For Developers
1. **Comprehensive tracking**: Full audit trail of document uploads with timestamps
2. **Easy debugging**: Console logs show exactly what's being saved
3. **Backward compatible**: Legacy fields preserved for existing systems
4. **Type-safe**: Full TypeScript support throughout

### For System
1. **Real-time persistence**: No need to wait for section completion
2. **Data integrity**: Atomic saves after each document upload
3. **Recovery support**: Complete state restoration from backend
4. **Scalable**: Works with any number of documents

## API Endpoints Used

### Save Document Data
```
POST /api/{submissionId}/{sectionId}
Body: { fieldValue: JSON.stringify(documentData) }
```

### Retrieve Saved Data
```
GET /api/submissions/{submissionId}/values
Response: Array of { templateSectionId, fieldValue }
```

### Delete Document Files
```
DELETE /api/Files/{fileId}
```

### Download Document Files
```
GET /api/Files/{fileId}/content?inline=false
```

## Testing Checklist

- [ ] Upload document via camera → Check backend for saved details
- [ ] Upload document via device → Check backend for saved details
- [ ] Upload multiple documents → Verify all details saved
- [ ] Refresh page → Verify documents still show as uploaded
- [ ] Download uploaded document → Verify correct files download
- [ ] Delete and re-upload → Verify details updated correctly
- [ ] Complete section 2, refresh → Verify navigation to section 3
- [ ] Check console logs for auto-save confirmations

## Future Enhancements

1. **Retry mechanism**: Auto-retry failed saves
2. **Offline support**: Queue saves when offline
3. **Progress indicators**: Show save status in UI
4. **Conflict resolution**: Handle concurrent edits from multiple devices
5. **Compression**: Reduce payload size for large document sets

## Debugging

Enable verbose logging by checking console for:
- `📤 Posting document section data:` - Shows what's being saved
- `📄 Restored documents details:` - Shows what was loaded
- `✅ Added document detail (Camera):` - Confirms detail tracking
- `✅ Added document detail (Upload Dialog):` - Confirms detail tracking
- `📤 Document uploaded, triggering auto-save...` - Confirms auto-save trigger
- `✅ Document section auto-saved successfully` - Confirms save completion

## Notes

- Document definition IDs are extracted dynamically from API config with hardcoded fallback
- Auto-save is non-blocking and happens in the background
- State is managed via React lifted state pattern for consistency
- All setters use functional form to prevent stale closure bugs

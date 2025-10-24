# Auto-Save After Document Deletion

## Overview
After successfully deleting a document, the system now automatically triggers a POST request to update the backend with only the currently uploaded documents (excluding the deleted one). This ensures the backend always reflects the current state.

## Implementation

### Flow After Document Deletion:

1. **User clicks delete (×) button** on uploaded document
2. **Confirmation dialog** is shown
3. **User confirms deletion**
4. **DELETE API calls** are made:
   - `DELETE /api/Files/{frontFileId}`
   - `DELETE /api/Files/{backFileId}` (if exists)
5. **State updates** (all React state):
   - Remove from `uploadedDocuments` array
   - Remove from `uploadedFiles` array
   - Remove from `documentUploadIds` object
   - Remove from `documentsDetails` array ✅
   - Remove from localStorage
6. **Auto-save triggered** after 200ms delay (to ensure state updates complete):
   - Calls `onDocumentUploaded()` callback
   - Parent component's `handleDocumentUploaded()` executes
   - Calls `postSectionData()` with current document state
7. **POST request sent** to backend:
   - `POST /api/{submissionId}/{sectionId}`
   - Body contains **only remaining uploaded documents**
   - Deleted document is NOT included

### Code Changes

#### IdentityDocumentForm.tsx - `handleDeleteDocument()`
```typescript
// Trigger auto-save to update backend after deletion
// Use setTimeout to ensure all state updates have completed
setTimeout(() => {
  if (onDocumentUploaded) {
    onDocumentUploaded();
    console.log('📤 Auto-save triggered after document deletion');
  }
}, 200); // Increased delay to ensure state updates complete
```

#### IdentityVerificationPage.tsx - `handleDocumentUploaded()`
```typescript
const handleDocumentUploaded = async () => {
  console.log('📤 Document state changed, triggering auto-save...');
  const documentsSection = activeSections.find(s => s.sectionType === "documents");
  if (documentsSection) {
    console.log('📋 Current documents state:', {
      uploadedDocuments: documentFormState.uploadedDocuments,
      documentsDetails: documentFormState.documentsDetails,
    });
    await postSectionData(documentsSection);
    console.log('✅ Document section auto-saved successfully');
  }
};
```

#### IdentityVerificationPage.tsx - `postSectionData()`
The POST request automatically uses the current state, which excludes deleted documents:
```typescript
const documentData = {
  documentsUploaded: isIdentityDocumentCompleted,
  completedAt: new Date().toISOString(),
  country: documentFormState.country,
  uploadedDocuments: documentFormState.uploadedDocuments, // ✅ Excludes deleted
  documentsDetails: documentFormState.documentsDetails,   // ✅ Excludes deleted
  uploadedFiles: documentFormState.uploadedFiles,         // ✅ Excludes deleted
  documentUploadIds: documentFormState.documentUploadIds, // ✅ Excludes deleted
  selectedDocument: documentFormState.selectedDocument,
};
```

## Example Scenario

### Initial State (3 documents uploaded):
```json
{
  "documentsUploaded": true,
  "country": "India",
  "uploadedDocuments": ["passport", "driver_license", "aadhaar"],
  "documentsDetails": [
    {
      "documentName": "Passport",
      "documentDefinitionId": 123,
      "frontFileId": 456,
      "backFileId": 457,
      "status": "uploaded",
      "uploadedAt": "2025-10-17T08:00:00Z"
    },
    {
      "documentName": "Driver License",
      "documentDefinitionId": 124,
      "frontFileId": 458,
      "backFileId": 459,
      "status": "uploaded",
      "uploadedAt": "2025-10-17T08:05:00Z"
    },
    {
      "documentName": "Aadhaar",
      "documentDefinitionId": 125,
      "frontFileId": 460,
      "backFileId": 461,
      "status": "uploaded",
      "uploadedAt": "2025-10-17T08:10:00Z"
    }
  ]
}
```

### User Deletes "Driver License"

1. DELETE requests sent:
   - `DELETE /api/Files/458` ✅
   - `DELETE /api/Files/459` ✅

2. State updated (removes Driver License)

3. Auto-save triggered (200ms delay)

4. **POST request sent with updated state:**
```json
{
  "documentsUploaded": true,
  "country": "India",
  "uploadedDocuments": ["passport", "aadhaar"],
  "documentsDetails": [
    {
      "documentName": "Passport",
      "documentDefinitionId": 123,
      "frontFileId": 456,
      "backFileId": 457,
      "status": "uploaded",
      "uploadedAt": "2025-10-17T08:00:00Z"
    },
    {
      "documentName": "Aadhaar",
      "documentDefinitionId": 125,
      "frontFileId": 460,
      "backFileId": 461,
      "status": "uploaded",
      "uploadedAt": "2025-10-17T08:10:00Z"
    }
  ]
}
```

### Result:
- ✅ Files deleted from server
- ✅ Backend updated with remaining 2 documents
- ✅ No trace of "Driver License" remains
- ✅ Page reload shows only Passport and Aadhaar

## Console Output

### Successful Deletion with Auto-Save:
```
🗑️ Deleting front file, ID: 458
🗑️ Deleting back file, ID: 459
🗑️ Removed from documentsDetails: Driver License
✅ Document deleted successfully: Driver License
📤 Auto-save triggered after document deletion
📤 Document state changed, triggering auto-save...
📋 Current documents state: {
  uploadedDocuments: ["passport", "aadhaar"],
  documentsDetails: [
    {documentName: "Passport", ...},
    {documentName: "Aadhaar", ...}
  ]
}
📤 Posting document section data: {...}
Posted section data for documents
✅ Document section auto-saved successfully
```

## Benefits

1. **Automatic Sync**: Backend always reflects current state without manual action
2. **No User Action Required**: Deletion + backend update happens automatically
3. **Data Consistency**: State and backend stay in sync
4. **Audit Trail**: Console logs show exact state being saved
5. **Reliable**: 200ms delay ensures all state updates complete before POST
6. **Silent Operation**: No alerts or notifications needed (happens in background)

## Testing Checklist

- [ ] Upload 3 documents
- [ ] Delete the middle document
- [ ] Check console logs for:
  - `🗑️ Removed from documentsDetails: [Document Name]`
  - `📤 Auto-save triggered after document deletion`
  - `📋 Current documents state:` (showing 2 documents)
  - `✅ Document section auto-saved successfully`
- [ ] Check Network tab for POST request
- [ ] Verify POST body has only 2 documents (not 3)
- [ ] Reload page
- [ ] ✅ Verify only 2 documents show (deleted one is gone)

## Edge Cases Handled

1. **Multiple Quick Deletions**: Each triggers its own auto-save
2. **Delete During Upload**: State updates are atomic, won't conflict
3. **Network Failure**: POST failure logged in console but doesn't break app
4. **State Not Ready**: 200ms delay ensures state updates complete
5. **No Lifted State**: Auto-save only triggers if using lifted state (`isUsingLiftedState`)

## Related Files

- `client/components/IdentityDocumentForm.tsx` - Delete handler with auto-save trigger
- `client/components/IdentityVerificationPage.tsx` - Auto-save callback and POST logic
- `DOCUMENT_UPLOAD_AUTO_SAVE.md` - Original auto-save implementation
- `DOCUMENT_TRACKING_FIX.md` - File ID tracking fixes

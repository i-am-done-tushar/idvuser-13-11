# Document Tracking Fixes

## Issues Fixed

### Issue 1: Last Document Not Showing After Page Reload
**Problem**: User uploads the last required document, moves to next section, then reloads the page. The system shows "Document Verification section completed" but the last uploaded document doesn't appear in the "Documents Uploaded" section.

**Root Cause**: The `addDocumentDetail()` function was being called with file IDs from the component state (`documentUploadIds[docId]`), but this state hadn't been updated yet at the time of the call. React state updates are asynchronous, so the old state (which was empty/undefined for the last document) was being used.

**Solution**: 
1. Modified `CameraDialog` to pass the uploaded file IDs directly in the `onSubmit` callback
2. Updated `IdentityDocumentForm` to receive these file IDs as a parameter
3. Use the file IDs from the callback parameter instead of relying on potentially stale state

**Changes Made**:
- `CameraDialog.tsx`: 
  - Updated `onSubmit` callback signature to include `uploadedFileIds`
  - Pass `uploadedFileIds` state in `handleSubmit()`
  
- `IdentityDocumentForm.tsx`:
  - Accept `uploadedFileIds` parameter in camera dialog's `onSubmit` handler
  - Use `uploadedFileIds` (from parameter) instead of `documentUploadIds[docId]` (from state)

### Issue 2: Delete Document Not Updating Backend
**Problem**: When user clicks the delete button (×) on an uploaded document and confirms deletion, the files are deleted from the server, but the backend's section data (POST request data) is not updated to reflect the deletion.

**Root Cause**: The `handleDeleteDocument()` function only:
1. Deleted files from server (DELETE /api/Files/{id})
2. Removed from local state arrays
3. Did NOT remove from `documentsDetails` array
4. Did NOT trigger auto-save to update backend section data

**Solution**:
1. Remove deleted document from `documentsDetails` array in state
2. Trigger `onDocumentUploaded()` callback to auto-save updated state to backend
3. This ensures the POST request reflects the current state after deletion

**Changes Made**:
- `IdentityDocumentForm.tsx` `handleDeleteDocument()`:
  - Added code to filter out deleted document from `documentsDetails` array
  - Added `setTimeout()` to trigger `onDocumentUploaded?.()` after deletion
  - Backend now receives updated section data without the deleted document

## Technical Details

### Before Fix - Camera Upload Flow:
```
1. User captures document
2. CameraDialog uploads to server → gets fileIds
3. CameraDialog calls onUploaded() → updates parent state
4. CameraDialog calls onSubmit()
5. IdentityDocumentForm tries to read documentUploadIds[docId]
6. ❌ State not updated yet → fileIds is undefined
7. addDocumentDetail() not called → document not tracked
```

### After Fix - Camera Upload Flow:
```
1. User captures document
2. CameraDialog uploads to server → gets fileIds
3. CameraDialog stores in uploadedFileIds state
4. CameraDialog calls onUploaded() → updates parent state
5. CameraDialog calls onSubmit(imageData, uploadedFileIds)
6. IdentityDocumentForm receives uploadedFileIds parameter
7. ✅ Uses uploadedFileIds from parameter → has correct IDs
8. addDocumentDetail() called successfully → document tracked
9. onDocumentUploaded() called → auto-save to backend
```

### Before Fix - Delete Flow:
```
1. User clicks delete (×) button
2. Confirmation dialog shown
3. User confirms
4. DELETE /api/Files/{frontId}
5. DELETE /api/Files/{backId}
6. Remove from uploadedDocuments array
7. Remove from uploadedFiles array
8. Remove from documentUploadIds object
9. ❌ documentsDetails NOT updated
10. ❌ Backend NOT notified
11. Page reload → shows old data with deleted document
```

### After Fix - Delete Flow:
```
1. User clicks delete (×) button
2. Confirmation dialog shown
3. User confirms
4. DELETE /api/Files/{frontId}
5. DELETE /api/Files/{backId}
6. Remove from uploadedDocuments array
7. Remove from uploadedFiles array
8. Remove from documentUploadIds object
9. ✅ Remove from documentsDetails array
10. ✅ Call onDocumentUploaded() → triggers auto-save
11. ✅ Backend receives updated section data
12. Page reload → shows correct data without deleted document
```

## Testing Checklist

### Test Case 1: Last Document Upload
- [ ] Select a country with 2+ required documents
- [ ] Upload all documents EXCEPT the last one
- [ ] Upload the LAST required document via camera
- [ ] Verify it shows in "Documents Uploaded" section
- [ ] Move to next section
- [ ] Reload the page
- [ ] ✅ Verify ALL documents (including last one) appear in "Documents Uploaded"
- [ ] Check browser console for `✅ Added document detail (Camera):` log

### Test Case 2: Document Deletion & Backend Update
- [ ] Upload a document (any method)
- [ ] Verify it appears in "Documents Uploaded" section
- [ ] Click the × button on the uploaded document
- [ ] Confirm deletion
- [ ] Wait for success message
- [ ] Check browser console for:
  - `🗑️ Removed from documentsDetails:` log
  - `📤 Triggered auto-save after document deletion` log
  - `✅ Document section auto-saved successfully` log
- [ ] Reload the page
- [ ] ✅ Verify deleted document does NOT appear
- [ ] Check Network tab for POST request with updated `documentsDetails`

### Test Case 3: Upload → Delete → Re-upload
- [ ] Upload document A
- [ ] Delete document A
- [ ] Re-upload document A
- [ ] Reload page
- [ ] ✅ Verify document A shows correctly with newest upload data

### Test Case 4: Multiple Documents
- [ ] Upload 3 different documents
- [ ] Verify all 3 show in "Documents Uploaded"
- [ ] Delete the middle one
- [ ] Reload page
- [ ] ✅ Verify only 2 documents show (first and last, not middle)

## Console Logs to Monitor

### Successful Camera Upload:
```
📄 Updated uploadedDocuments (Camera): ["passport"]
📁 Updated uploadedFiles (Camera): [...]
✅ Added document detail (Camera): {
  documentName: "Passport",
  documentDefinitionId: 123,
  frontFileId: 456,
  backFileId: 789
}
📤 Document uploaded, triggering auto-save...
✅ Document section auto-saved successfully
```

### Successful Deletion:
```
🗑️ Deleting front file, ID: 456
🗑️ Deleting back file, ID: 789
🗑️ Removed from documentsDetails: Passport
✅ Document deleted successfully: Passport
📤 Triggered auto-save after document deletion
📤 Document uploaded, triggering auto-save...
✅ Document section auto-saved successfully
```

## Benefits

1. **Data Integrity**: All uploaded documents are correctly tracked in backend
2. **Accurate State**: Backend always reflects current state after deletions
3. **Better UX**: Users see correct document status after page reload
4. **Audit Trail**: Complete history of uploads and deletions
5. **Reliable Recovery**: System can restore exact state from backend data

## Related Files

- `client/components/CameraDialog.tsx`
- `client/components/IdentityDocumentForm.tsx`
- `client/components/IdentityVerificationPage.tsx`
- `DOCUMENT_UPLOAD_AUTO_SAVE.md` (original implementation doc)

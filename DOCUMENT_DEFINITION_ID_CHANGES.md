# Document Definition ID & File Download Changes

## Summary
Updated the document verification system to:
1. Use **dynamic document definition IDs** from the API response instead of hardcoded values
2. Implement **file download functionality** for uploaded documents using the GET API endpoint

## Changes Made

### 1. Updated `shared/templates.ts`
- Enhanced `DocumentConfig` interface to support the new API structure
- Documents can now be either:
  - Simple strings: `"Aadhaar Card"`
  - Objects with ID: `{ title: "Aadhaar Card", documentDefinitionId: "90a956c3-b4e6-4267-8f5c-5ba65c4b986b" }`
- Added `countryId` field to supported countries
- Added `retryAttempts` and `allowedFileTypes` fields

### 2. Updated `client/components/IdentityDocumentForm.tsx`

#### Document Definition IDs:
- Added `getDocumentDefinitionIdFromConfig()` function to extract document definition IDs from API config
- Updated `buildFormData()` to prioritize API config IDs over hardcoded fallback
- Updated `currentDocuments` to extract titles from document objects
- Maintains backward compatibility with string-based document arrays

#### File Download Functionality:
- Added `downloadFileFromServer()` function to download individual files using the GET API
- Added `downloadDocumentFiles()` function to download both front and back files for a document
- Updated click handler for uploaded documents to trigger downloads instead of showing localStorage images
- Files are downloaded with proper naming: `{DocumentName} - Front.jpg` and `{DocumentName} - Back.jpg`

## API Response Structure

### Upload Response
When uploading a document, the API returns:

```json
{
  "file": {
    "id": 13,
    "fileName": "nature-wallpaper-7541423_1280.jpg",
    "contentType": "image/jpeg",
    "sizeBytes": 553726,
    "documentDefinitionId": "f71639c4-111c-46e1-b11f-c6d1ab5dc4d0",
    "checksumSha256": "...",
    "storageBucket": "string",
    "storageObjectKey": "...",
    "status": 0,
    "uploadedAt": "2025-10-16T09:19:28.5735485+00:00"
  },
  "mapping": {
    "id": 13,
    "fileId": 13,
    "userTemplateSubmissionId": 1,
    "createdAt": "2025-10-16T09:19:28.5826396Z",
    "success": true
  }
}
```

The `file.id` is stored in `documentUploadIds[documentId]` as:
```typescript
{
  front: 13,  // ID of front side image
  back: 14    // ID of back side image
}
```

### Template Version Response
The new API response includes document definition IDs in the structure:

```json
{
  "sections": [
    {
      "sectionType": "documents",
      "fieldMappings": [
        {
          "structure": {
            "documentVerification": {
              "supportedCountries": [
                {
                  "countryId": 1,
                  "countryName": "India",
                  "documents": [
                    {
                      "title": "Aadhaar Card",
                      "documentDefinitionId": "90a956c3-b4e6-4267-8f5c-5ba65c4b986b"
                    },
                    {
                      "title": "PAN Card",
                      "documentDefinitionId": "30e450dd-ab5c-413f-92fe-1f7ef7e5a4b3"
                    }
                  ]
                }
              ]
            }
          }
        }
      ]
    }
  ]
}
```

## How It Works

### Document Upload Process:
1. User selects a country and document type
2. User chooses upload method (Camera, Device, or DigiLocker)
3. For Camera/Device: User captures/uploads front and back images
4. Each upload creates a POST request to `/api/Files/upload` with the document definition ID
5. API returns file IDs (e.g., `13` for front, `14` for back)
6. These IDs are stored in `documentUploadIds` state
7. Document appears in "Documents Uploaded" section with green checkmark

### Document Download Process:
1. User clicks on an uploaded document box
2. System retrieves stored file IDs from `documentUploadIds[documentId]`
3. Makes GET requests to `/api/Files/{id}/content?inline=false` for each file
4. Browser downloads files with proper names:
   - `{Document Name} - Front.jpg`
   - `{Document Name} - Back.jpg`
5. Files are downloaded with a 500ms delay between front and back to avoid browser blocking

### Document Definition ID Resolution:
1. **API Config (Primary)**: System first tries to get the document definition ID from the API configuration
2. **Fallback (Secondary)**: If not found in API config, it falls back to the hardcoded mapping in `lib/document-definitions.ts`
3. **Logging**: Console logs show which method was used to obtain the document definition ID

## Benefits

- ✅ Dynamic configuration from backend
- ✅ No need to update frontend code when adding new documents
- ✅ Files are properly downloaded from server instead of localStorage
- ✅ Supports downloading both front and back images
- ✅ Backward compatible with existing implementations
- ✅ Maintains fallback for safety
- ✅ Clear logging for debugging
- ✅ User-friendly file naming

## API Endpoints Used

### Upload Files
```
POST /api/Files/upload
Content-Type: multipart/form-data

Form Data:
- File: (binary)
- DocumentDefinitionId: "90a956c3-b4e6-4267-8f5c-5ba65c4b986b"
- Bucket: "string"
- UserTemplateSubmissionId: "1"
```

### Download Files
```
GET /api/Files/{id}/content?inline=false
Accept: */*

Response: Binary file data (auto-download)
```

## Testing

To verify the changes work correctly:

1. **Upload Test**:
   - Select a country with documents configured in the API
   - Choose a document type
   - Upload front and back images via Camera or Device
   - Verify document appears in "Documents Uploaded" section with green checkmark
   - Check browser console for file IDs being stored

2. **Download Test**:
   - Click on an uploaded document box
   - Verify both front and back files download automatically
   - Check file names are formatted correctly
   - Verify files contain the correct images

3. **Document Definition ID Test**:
   - Check browser console during upload
   - Should show: `"IdentityDocumentForm: Using DocumentDefinitionId: <UUID> for document: <DocumentName>"`
   - Verify no warning about using fallback mapping (unless API doesn't provide IDs)

## Migration Notes

- Existing templates will continue to work with the fallback system
- New templates should include document definition IDs in the API response
- The `lib/document-definitions.ts` file is still used as a fallback and can be maintained for legacy support
- File IDs are stored in the `documentUploadIds` state for download functionality
- localStorage is still used as a fallback for viewing images if file IDs are not available

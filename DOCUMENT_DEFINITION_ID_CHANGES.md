# Document Definition ID Changes

## Summary
Updated the document verification system to use **dynamic document definition IDs** from the API response instead of hardcoded values.

## Changes Made

### 1. Updated `shared/templates.ts`
- Enhanced `DocumentConfig` interface to support the new API structure
- Documents can now be either:
  - Simple strings: `"Aadhaar Card"`
  - Objects with ID: `{ title: "Aadhaar Card", documentDefinitionId: "90a956c3-b4e6-4267-8f5c-5ba65c4b986b" }`
- Added `countryId` field to supported countries
- Added `retryAttempts` and `allowedFileTypes` fields

### 2. Updated `client/components/IdentityDocumentForm.tsx`
- Added `getDocumentDefinitionIdFromConfig()` function to extract document definition IDs from API config
- Updated `buildFormData()` to prioritize API config IDs over hardcoded fallback
- Updated `currentDocuments` to extract titles from document objects
- Maintains backward compatibility with string-based document arrays

## API Response Structure

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

1. **API Config (Primary)**: When uploading a document, the system first tries to get the document definition ID from the API configuration
2. **Fallback (Secondary)**: If not found in API config, it falls back to the hardcoded mapping in `lib/document-definitions.ts`
3. **Logging**: Console logs show which method was used to obtain the document definition ID

## Benefits

- ✅ Dynamic configuration from backend
- ✅ No need to update frontend code when adding new documents
- ✅ Backward compatible with existing implementations
- ✅ Maintains fallback for safety
- ✅ Clear logging for debugging

## Testing

To verify the changes work correctly:

1. Select a country with documents configured in the API
2. Upload a document
3. Check browser console for log message:
   - Should show: `"IdentityDocumentForm: Using DocumentDefinitionId: <UUID> for document: <DocumentName>"`
4. Verify no warning about using fallback mapping (unless API doesn't provide IDs)

## Migration Notes

- Existing templates will continue to work with the fallback system
- New templates should include document definition IDs in the API response
- The `lib/document-definitions.ts` file is still used as a fallback and can be maintained for legacy support

/**
 * Dynamic Document Definition ID mapping based on country and document type
 */

// Document Definition ID mapping based on country and document type
export const getDocumentDefinitionId = (country: string, documentName: string): string => {
  // Normalize document name to match database codes
  const normalizedDoc = documentName.toLowerCase().replace(/\s+/g, "_");
  
  // Country to ISO2 mapping
  const countryToISO2: Record<string, string> = {
    "India": "IN",
    "United States": "US",
    "United Kingdom": "GB",
    // Add more countries as needed
  };
  
  const countryCode = countryToISO2[country];
  if (!countryCode) {
    console.warn(`Country "${country}" not found in mapping, using fallback ID`);
    return "6bb2a401-2678-43d1-acb0-227ec9da6761"; // fallback to Aadhaar
  }
  
  // Document mapping for India (IN)
  if (countryCode === "IN") {
    const documentMapping: Record<string, string> = {
      "aadhaar_card": "6bb2a401-2678-43d1-acb0-227ec9da6761", // AADHAAR_IND
      "voter_id": "88ccdb04-a701-41b1-ad5e-aef0b2c76e06", // VOTERID_IND
      "passport": "9ca14fe5-9649-4e09-ab97-af887e619513", // PASSPORT_IND
      "indian_passport": "9ca14fe5-9649-4e09-ab97-af887e619513", // PASSPORT_IND
      "pan_card": "69243f9f-5c00-4522-b80c-0bb87bb32514", // PAN_IND
      "driving_license": "986c9fbd-fb6f-4d60-a1aa-7e7c459ae199", // DL_IND
      "driver_license": "986c9fbd-fb6f-4d60-a1aa-7e7c459ae199", // DL_IND
    };
    
    const documentId = documentMapping[normalizedDoc];
    if (documentId) {
      console.log(`Selected document: ${documentName} (${normalizedDoc}) -> ID: ${documentId}`);
      return documentId;
    }
  }
  
  // Add mappings for other countries here
  // Example for US:
  // if (countryCode === "US") {
  //   const documentMapping: Record<string, string> = {
  //     "passport": "us-passport-id",
  //     "driver_license": "us-dl-id",
  //     "state_id": "us-state-id-id",
  //   };
  //   
  //   const documentId = documentMapping[normalizedDoc];
  //   if (documentId) return documentId;
  // }
  
  console.warn(`Document "${documentName}" not found for country "${country}", using fallback ID`);
  return "6bb2a401-2678-43d1-acb0-227ec9da6761"; // fallback to Aadhaar
};

/**
 * Get all supported documents for a country
 */
export const getSupportedDocumentsForCountry = (country: string): string[] => {
  const countryToISO2: Record<string, string> = {
    "India": "IN",
    "United States": "US",
    "United Kingdom": "GB",
  };
  
  const countryCode = countryToISO2[country];
  
  if (countryCode === "IN") {
    return [
      "Aadhaar Card",
      "Voter ID", 
      "Passport",
      "Indian Passport",
      "PAN Card",
      "Driving License",
      "Driver License"
    ];
  }
  
  // Add other countries here
  
  return [];
};

/**
 * Validate if a document is supported for a country
 */
export const isDocumentSupportedForCountry = (country: string, documentName: string): boolean => {
  const supportedDocs = getSupportedDocumentsForCountry(country);
  return supportedDocs.some(doc => 
    doc.toLowerCase().replace(/\s+/g, "_") === documentName.toLowerCase().replace(/\s+/g, "_")
  );
};
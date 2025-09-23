import { RequestHandler } from "express";
import { TemplateVersionResponse } from "@shared/api";

// Mock template version data that matches the expected structure
const mockTemplateVersion: TemplateVersionResponse = {
  versionId: 2,
  templateId: 2,
  versionNumber: 1,
  isActive: true,
  enforceRekyc: false,
  rekycDeadline: null,
  changeSummary: null,
  isDeleted: false,
  createdBy: 1,
  createdByName: "System Admin",
  createdByEmail: "admin@idv.local",
  updatedBy: null,
  updatedByName: null,
  updatedByEmail: null,
  createdAt: "2025-09-22T12:47:34.652137",
  updatedAt: "2025-09-22T12:47:34.65219",
  rowVersionBase64: "CN36BE2wYVI=",
  sections: [
    {
      id: 4,
      templateVersionId: 2,
      name: "Personal Information",
      description: "Please provide your basic personal information to begin the identity verification process.",
      orderIndex: 1,
      sectionType: "personalInformation",
      isActive: true,
      createdBy: 1,
      createdByName: "System Admin",
      createdByEmail: "admin@idv.local",
      updatedBy: null,
      updatedByName: null,
      updatedByEmail: null,
      createdAt: "2025-09-22T12:47:34.67911+00:00",
      updatedAt: null,
      fieldMappings: [
        {
          id: 4,
          templateSectionId: 4,
          structure: {
            fields: [
              { name: "firstName", type: "string", required: true },
              { name: "lastName", type: "string", required: true },
              { name: "middleName", type: "string", required: false },
              { name: "dateOfBirth", type: "date", required: true },
              { name: "email", type: "email", required: true },
              { name: "phoneNumber", type: "string", required: true },
              { name: "gender", type: "enum", required: false },
              { name: "address", type: "string", required: true },
              { name: "city", type: "string", required: true },
              { name: "postalCode", type: "string", required: true }
            ]
          },
          captureAllowed: false,
          uploadAllowed: false
        }
      ]
    },
    {
      id: 5,
      templateVersionId: 2,
      name: "Document Verification",
      description: "Choose a valid government-issued ID (like a passport, driver's license, or national ID) and upload a clear photo of it.",
      orderIndex: 2,
      sectionType: "documents",
      isActive: true,
      createdBy: 1,
      createdByName: "System Admin",
      createdByEmail: "admin@idv.local",
      updatedBy: null,
      updatedByName: null,
      updatedByEmail: null,
      createdAt: "2025-09-22T12:47:34.709319+00:00",
      updatedAt: null,
      fieldMappings: [
        {
          id: 5,
          templateSectionId: 5,
          structure: {},
          captureAllowed: false,
          uploadAllowed: false
        }
      ]
    },
    {
      id: 6,
      templateVersionId: 2,
      name: "Biometric Verification",
      description: "Take a live selfie to confirm you are the person in the ID document. Make sure you're in a well-lit area and your face is clearly visible.",
      orderIndex: 3,
      sectionType: "biometrics",
      isActive: true,
      createdBy: 1,
      createdByName: "System Admin",
      createdByEmail: "admin@idv.local",
      updatedBy: null,
      updatedByName: null,
      updatedByEmail: null,
      createdAt: "2025-09-22T12:47:34.717199+00:00",
      updatedAt: null,
      fieldMappings: [
        {
          id: 6,
          templateSectionId: 6,
          structure: {},
          captureAllowed: false,
          uploadAllowed: false
        }
      ]
    }
  ],
  invitees: [
    {
      id: 1,
      name: "System Admin",
      email: "admin@idv.local",
      status: "INVITED"
    }
  ]
};

// Mock with only 2 sections (to test dynamic filtering)
const mockTemplateVersion2Sections: TemplateVersionResponse = {
  ...mockTemplateVersion,
  versionId: 3,
  sections: [
    {
      ...mockTemplateVersion.sections[0], // Personal Information
      id: 7
    },
    {
      ...mockTemplateVersion.sections[2], // Biometrics only
      id: 8,
      orderIndex: 2
    }
  ]
};

// Mock with sections in different order (to test ordering)
const mockTemplateVersionDifferentOrder: TemplateVersionResponse = {
  ...mockTemplateVersion,
  versionId: 4,
  sections: [
    {
      ...mockTemplateVersion.sections[2], // Biometrics first
      orderIndex: 1
    },
    {
      ...mockTemplateVersion.sections[0], // Personal Info second
      orderIndex: 2
    },
    {
      ...mockTemplateVersion.sections[1], // Documents third
      orderIndex: 3
    }
  ]
};

export const handleGetTemplateVersionDirect: RequestHandler = (req, res) => {
  const { versionId } = req.params;
  
  if (!versionId || isNaN(Number(versionId))) {
    return res.status(400).json({ error: "Invalid version ID" });
  }

  const id = Number(versionId);
  
  // Return different mock data based on ID to test dynamic behavior
  switch (id) {
    case 1:
      res.json(mockTemplateVersion);
      break;
    case 2:
      res.json(mockTemplateVersion2Sections);
      break;
    case 3:
      res.json(mockTemplateVersionDifferentOrder);
      break;
    default:
      res.json(mockTemplateVersion);
      break;
  }
};
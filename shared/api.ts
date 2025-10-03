/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Response type for shortcode resolution API
 */
export interface ShortCodeResolveResponse {
  linkId: number;
  userId: number;
  shortCode: string;
  templateVersionId: number;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  expiresAtUtc: string;
}

/**
 * Response type for template version API
 */
export interface TemplateVersionResponse {
  versionId: number;
  templateId: number;
  versionNumber: number;
  isActive: boolean;
  enforceRekyc: boolean;
  rekycDeadline: string | null;
  changeSummary: string | null;
  isDeleted: boolean;
  createdBy: number;
  createdByName: string;
  createdByEmail: string;
  updatedBy: number | null;
  updatedByName: string;
  updatedByEmail: string;
  createdAt: string;
  updatedAt: string;
  rowVersionBase64: string;
  sections: TemplateVersionSection[];
  invitees: any[];
}

export interface TemplateVersionSection {
  id: number;
  templateVersionId: number;
  name: string;
  description: string | null;
  orderIndex: number;
  sectionType: "personalInformation" | "documents" | "biometrics";
  isActive: boolean;
  createdBy: number;
  createdByName: string;
  createdByEmail: string;
  updatedBy: number | null;
  updatedByName: string | null;
  updatedByEmail: string | null;
  createdAt: string;
  updatedAt: string | null;
  fieldMappings: TemplateVersionFieldMapping[];
}

export interface TemplateVersionFieldMapping {
  id: number;
  templateSectionId: number;
  structure: any; // Can be more specific based on section type
  captureAllowed: boolean;
  uploadAllowed: boolean;
}

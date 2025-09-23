export interface TemplateResponse {
  id: number;
  name: string;
  description: string;
  createdBy: number;
  createdByName: string;
  createdByEmail: string;
  updatedBy: number | null;
  updatedByName: string;
  updatedByEmail: string;
  createdAt: string;
  updatedAt: string | null;
  versions: TemplateVersion[];
}

export interface TemplateVersion {
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
  sections: TemplateSection[];
}

export interface TemplateSection {
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
  fieldMappings: FieldMapping[];
}

export interface FieldMapping {
  id: number;
  templateSectionId: number;
  structure: string | object;
  captureAllowed: boolean;
  uploadAllowed: boolean;
}

export interface FormData {
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  gender: string;
  address: string;
  city: string;
  postalCode: string;
  permanentAddress: string;
  permanentCity: string;
  permanentPostalCode: string;
}

export interface DocumentConfig {
  allowCaptureWebcam?: boolean;
  allowUploadFromDevice?: boolean;
  supportedCountries?: Array<{
    countryName: string;
    documents: string[];
  }>;
}

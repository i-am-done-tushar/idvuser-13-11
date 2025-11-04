import { TemplateVersionSection } from "@shared/api";
import { PersonalInformationForm } from "./PersonalInformationForm";
import { IdentityDocumentForm } from "./IdentityDocumentForm";
import CameraSelfieStep from "./CameraSelfieStep";
import { LockedStepComponent } from "./LockedStepComponent";
import { FormData } from "@shared/templates";

interface DesktopDynamicSectionProps {
  section: TemplateVersionSection;
  sectionIndex: number;
  currentStep: number;
  onSectionFocus?: (sectionIndex: number) => void;
  // Form related props
  formData?: FormData;
  setFormData?: (data: FormData) => void;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  onSendEmailOTP?: () => void;
  onSendPhoneOTP?: () => void;
  onIdentityDocumentComplete?: () => void;
  onSelfieComplete?: () => void;
  submissionId?: number | null;
  // QR Code and session props
  shortCode?: string;
  templateVersionId?: number;
  userId?: number | null;
  // Section completion state
  isFilled?: boolean;
  isExpanded?: boolean;
  onToggle?: (sectionIndex: number) => void;
  // Document form state
  documentFormState?: {
    country: string;
    selectedDocument: string;
    uploadedDocuments: string[];
    uploadedFiles: Array<{id: string, name: string, size: string, type: string}>;
    documentUploadIds: Record<string, { front?: number; back?: number }>;
    documentsDetails: Array<{
      documentName: string;
      documentDefinitionId: number;
      frontFileId: number;
      backFileId?: number;
      status: "uploaded" | "pending";
      uploadedAt: string;
    }>;
  };
  setDocumentFormState?: (state: any) => void;
  // Callback to trigger auto-save after document upload
  onDocumentUploaded?: () => void;
  // Biometric form state
  biometricFormState?: {
    capturedImage: string | null;
    isImageCaptured: boolean;
  };
  setBiometricFormState?: (state: any) => void;
}

export function DesktopDynamicSection({
  section,
  sectionIndex,
  currentStep,
  onSectionFocus,
  formData,
  setFormData,
  isEmailVerified,
  isPhoneVerified,
  onSendEmailOTP,
  onSendPhoneOTP,
  onIdentityDocumentComplete,
  onSelfieComplete,
  submissionId,
  shortCode,
  templateVersionId,
  userId,
  isFilled,
  isExpanded,
  onToggle,
  documentFormState,
  setDocumentFormState,
  onDocumentUploaded,
  biometricFormState,
  setBiometricFormState,
}: DesktopDynamicSectionProps) {
  const renderSectionHeader = () => (
    <div className="flex p-4 flex-col justify-center items-center gap-2 self-stretch bg-background">
      <div className="flex pb-1 items-center gap-2 self-stretch">
        <button
          onClick={() => onToggle?.(sectionIndex)}
          className="flex items-center gap-2"
        >
          <svg
            className={`w-[18px] h-[18px] transform transition-transform ${
              isExpanded ? "rotate-0" : "rotate-180"
            }`}
            viewBox="0 0 18 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.00391 9.33203H12.0039M16.5039 9.33203C16.5039 13.4741 13.146 16.832 9.00391 16.832C4.86177 16.832 1.50391 13.4741 1.50391 9.33203C1.50391 5.18989 4.86177 1.83203 9.00391 1.83203C13.146 1.83203 16.5039 5.18989 16.5039 9.33203Z"
              stroke="#323238"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-text-primary font-roboto text-base font-bold leading-3">
            {section.name}
          </div>
        </button>
      </div>
      <div className="flex pl-7 justify-center items-center gap-2.5 self-stretch">
        <div className="flex-1 text-text-primary font-roboto text-[13px] font-normal leading-5">
          {!isExpanded && isFilled ? (
            <span className="text-green-600 font-medium">This section has been filled</span>
          ) : (
            section.description ||
            `Complete the ${section.name.toLowerCase()} section.`
          )}
        </div>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    // If section is locked (future step)
    if (sectionIndex > currentStep) {
      return (
        <div className="flex flex-col items-start gap-4 self-stretch rounded bg-background">
          <div className="flex py-0 px-0.5 flex-col items-start self-stretch rounded border border-border">
            {renderSectionHeader()}
            <div className="flex w-full h-[308px] border-t border-border bg-background">
              <LockedStepComponent message="This step is locked until you complete the previous step." />
            </div>
          </div>
        </div>
      );
    }

    // Render based on section type
    switch (section.sectionType) {
      case "personalInformation": {
        if (!formData || !setFormData) return null;

        // read legacy mapping
        const legacyPI = section.fieldMappings?.[0]?.structure?.personalInfo ?? {};

        // enrich fieldConfig: ensure camelCase requiredToggles is present
        const fieldConfig = {
          ...legacyPI,
          requiredToggles: legacyPI?.requiredToggles ?? {},
        };

        return (
          <div className="flex flex-col items-start gap-4 self-stretch rounded bg-background">
            <div className="flex py-0 px-0.5 flex-col items-start self-stretch rounded border border-border">
              {renderSectionHeader()}
              {isExpanded && (
                <div 
                  className="flex py-5 px-[34px] flex-col items-start self-stretch border-t border-border bg-background"
                  onClick={() => onSectionFocus?.(sectionIndex)}
                  onFocus={() => onSectionFocus?.(sectionIndex)}
                >
                  <PersonalInformationForm
                    formData={formData}
                    setFormData={setFormData}
                    isEmailVerified={isEmailVerified || false}
                    isPhoneVerified={isPhoneVerified || false}
                    onSendEmailOTP={onSendEmailOTP || (() => {})}
                    onSendPhoneOTP={onSendPhoneOTP || (() => {})}
                    fieldConfig={fieldConfig}
                  />
                </div>
              )}
            </div>
          </div>
        );
      }

      case "documents": {
        const legacy =
          section.fieldMappings?.[0]?.structure?.documentVerification ?? {};

        const documentConfig = {
          allowUploadFromDevice: !!legacy.allowUploadFromDevice,
          allowCaptureWebcam: !!legacy.allowCaptureWebcam,
          documentHandling: legacy.documentHandlingRejectImmediately
            ? "reject"
            : legacy.documentHandlingAllowRetries
              ? "retry"
              : "",
          retryAttempts: Number(legacy.retryAttempts) || 0,
          allowedFileTypes: Array.isArray(legacy.allowedFileTypes)
            ? legacy.allowedFileTypes
            : [],
          supportedCountries: Array.isArray(legacy.supportedCountries)
            ? legacy.supportedCountries
            : [],
          selectedCountries: Array.isArray(legacy.selectedCountries)
            ? legacy.selectedCountries
            : [],
          selectedDocuments: Array.isArray(legacy.selectedDocuments)
            ? legacy.selectedDocuments
            : [],
        };

        return (
          <div className="flex flex-col items-start gap-4 self-stretch rounded bg-background">
            <div className="flex py-0 px-0.5 flex-col items-start self-stretch rounded border border-[#DEDEDD] bg-white">
              {renderSectionHeader()}
              {isExpanded && (
                <div 
                  className="flex py-4 px-[34px] flex-col items-start self-stretch border-t border-[#DEDEDD] bg-white"
                  onClick={() => onSectionFocus?.(sectionIndex)}
                  onFocus={() => onSectionFocus?.(sectionIndex)}
                >
                  {/* summary chips so the new fields are visible */}
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 rounded-full border bg-white">
                      Upload: {documentConfig.allowUploadFromDevice ? "Device ✓" : "Device ✗"}
                    </span>
                    <span className="px-2 py-1 rounded-full border bg-white">
                      Capture: {documentConfig.allowCaptureWebcam ? "Webcam ✓" : "Webcam ✗"}
                    </span>
                    <span className="px-2 py-1 rounded-full border bg-white">
                      Handling: {documentConfig.documentHandling || "—"}
                    </span>
                    {documentConfig.documentHandling === "retry" && (
                      <span className="px-2 py-1 rounded-full border bg-white">
                        Retries: {documentConfig.retryAttempts}
                      </span>
                    )}
                    {!!documentConfig.allowedFileTypes.length && (
                      <span className="px-2 py-1 rounded-full border bg-white">
                        File types: {documentConfig.allowedFileTypes.join(", ").toUpperCase()}
                      </span>
                    )}
                  </div>

                  <IdentityDocumentForm
                    onComplete={onIdentityDocumentComplete || (() => {})}
                    documentConfig={documentConfig}
                    submissionId={submissionId}
                    shortCode={shortCode}
                    templateVersionId={templateVersionId}
                    userId={userId}
                    documentFormState={documentFormState}
                    setDocumentFormState={setDocumentFormState}
                    onDocumentUploaded={onDocumentUploaded}
                  />
                </div>
              )}
            </div>
          </div>
        );
      }

      case "biometrics": {
        const legacy =
          section.fieldMappings?.[0]?.structure?.biometricVerification ?? {};

        const bioCfg = {
          maxRetries: Number(legacy.maxRetries) || 0,
          askUserRetry: !!legacy.askUserRetry,
          blockAfterRetries: !!legacy.blockAfterRetries,
          dataRetention: legacy.dataRetention || "",
          livenessThreshold: Number(legacy.livenessThreshold) || 0,
          faceMatchThreshold: Number(legacy.faceMatchThreshold) || 0,
        };

        return (
          <div className="flex flex-col items-start gap-4 self-stretch rounded bg-background">
            <div className="flex py-0 px-0.5 flex-col items-start self-stretch rounded border border-border">
              {renderSectionHeader()}
              {isExpanded && (
                <div
                  onClick={() => onSectionFocus?.(sectionIndex)}
                  onFocus={() => onSectionFocus?.(sectionIndex)}
                >
                  {/* summary chips */}
                  <div className="flex w-full py-3 px-[34px] border-t border-border bg-background">
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                      <span className="px-2 py-1 rounded-full border bg-white">
                        Max retries: {bioCfg.maxRetries}
                      </span>
                      <span className="px-2 py-1 rounded-full border bg-white">
                        Liveness ≥ {bioCfg.livenessThreshold}%
                      </span>
                      <span className="px-2 py-1 rounded-full border bg-white">
                        Face match ≥ {bioCfg.faceMatchThreshold}%
                      </span>
                      <span className="px-2 py-1 rounded-full border bg-white">
                        On low score: {bioCfg.askUserRetry ? "Ask to retry" : bioCfg.blockAfterRetries ? "Block after retries" : "—"}
                      </span>
                      {bioCfg.dataRetention && (
                        <span className="px-2 py-1 rounded-full border bg-white">
                          Retention: {bioCfg.dataRetention}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex p-3 flex-col justify-center items-center self-stretch bg-background">
                    <div className="flex w-full flex-col items-center gap-2">
                      <CameraSelfieStep
                        onComplete={onSelfieComplete || (() => {})}
                        userId={submissionId}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }

      default:
        return (
          <div className="flex flex-col items-start gap-4 self-stretch rounded bg-background">
            <div className="flex py-0 px-0.5 flex-col items-start self-stretch rounded border border-border">
              {renderSectionHeader()}
              {isExpanded && (
                <div 
                  className="flex p-4 flex-col items-start self-stretch border-t border-border bg-background"
                  onClick={() => onSectionFocus?.(sectionIndex)}
                  onFocus={() => onSectionFocus?.(sectionIndex)}
                >
                  <div className="text-text-primary font-roboto text-sm">
                    Unknown section type: {section.sectionType}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return renderSectionContent();
}

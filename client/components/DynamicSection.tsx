import { useState } from "react";
import { TemplateVersionSection } from "@shared/api";
import { PersonalInformationForm } from "./PersonalInformationForm";
import { IdentityDocumentForm } from "./IdentityDocumentForm";
import CameraSelfieStep from "./CameraSelfieStep";
import { LockedStepComponent } from "./LockedStepComponent";
import { FormData } from "@shared/templates";
import { BiometricCaptureUI } from "./BiometricCaptureUI";

interface DynamicSectionProps {
  section: TemplateVersionSection;
  sectionIndex: number;
  currentStep: number;
  isExpanded: boolean;
  onToggle: (sectionIndex: number) => void;
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
  // Document form state
  documentFormState?: {
    country: string;
    selectedDocument: string;
    uploadedDocuments: string[];
    uploadedFiles: Array<{
      id: string;
      name: string;
      size: string;
      type: string;
    }>;
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

export function DynamicSection({
  section,
  sectionIndex,
  currentStep,
  isExpanded,
  onToggle,
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
  documentFormState,
  setDocumentFormState,
  onDocumentUploaded,
  biometricFormState,
  setBiometricFormState,
}: DynamicSectionProps) {
  const [isBiometricScanStarted, setIsBiometricScanStarted] = useState(false);

  const handleScanFace = () => {
    setIsBiometricScanStarted(true);
  };

  const renderSectionContent = () => {
    // Future steps are locked
    if (sectionIndex > currentStep) {
      return (
        <div className="flex w-full h-[308px] border-t border-border bg-background">
          <LockedStepComponent message="This step is locked until you complete the previous step." />
        </div>
      );
    }

    switch (section.sectionType) {
      case "personalInformation": {
        if (!formData || !setFormData) return null;

        const legacyPI =
          section.fieldMappings?.[0]?.structure?.personalInfo ?? {};
        const fieldConfig = {
          ...legacyPI,
          requiredToggles: legacyPI?.requiredToggles ?? {}, // camelCase only
        };

        return (
          <div className="flex py-5 px-[34px] flex-col items-start self-stretch border-t border-border bg-background">
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
          <div className="flex py-4 px-[34px] flex-col items-start self-stretch border-t border-[#DEDEDD] bg-white">
            {/* summary chips */}
            <div className="text-xs text-muted-foreground flex flex-wrap gap-2 mb-3">
              <span className="px-2 py-1 rounded-full border bg-white">
                Upload:{" "}
                {documentConfig.allowUploadFromDevice ? "Device ✓" : "Device ✗"}
              </span>
              <span className="px-2 py-1 rounded-full border bg-white">
                Capture:{" "}
                {documentConfig.allowCaptureWebcam ? "Webcam ✓" : "Webcam ✗"}
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
                  File types:{" "}
                  {documentConfig.allowedFileTypes.join(", ").toUpperCase()}
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
          <>
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
                  On low score:{" "}
                  {bioCfg.askUserRetry
                    ? "Ask to retry"
                    : bioCfg.blockAfterRetries
                      ? "Block after retries"
                      : "—"}
                </span>
                {bioCfg.dataRetention && (
                  <span className="px-2 py-1 rounded-full border bg-white">
                    Retention: {bioCfg.dataRetention}
                  </span>
                )}
              </div>
            </div>

            {!isBiometricScanStarted ? (
              <BiometricCaptureUI onScanFace={handleScanFace} />
            ) : (
              <div className="flex p-4 flex-col justify-center items-center self-stretch bg-background">
                <div className="flex w-full items-center gap-6">
                  {/* Left Box - Camera Selfie */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex h-[380px] flex-col items-center gap-2 rounded-t-lg border-[1.5px] border-dashed border-[#C3C6D4] bg-white pt-4">
                      <CameraSelfieStep
                        onStepComplete={onSelfieComplete || (() => {})}
                        userId={submissionId}
                      />
                    </div>
                    <div className="flex w-full px-4 py-2 items-center justify-end gap-2 rounded-b border-t-0 border-[1.5px] border-dashed border-[#C3C6D4] bg-[#F6F7FB]"></div>
                  </div>

                  {/* Separator with "or" */}
                  <div className="flex flex-col items-center justify-center gap-1 h-[428px]">
                    <div className="h-[160px] w-px bg-[#D0D4E4]"></div>
                    <div className="text-[#676879] font-roboto text-[13px] font-normal">
                      or
                    </div>
                    <div className="h-[160px] w-px bg-[#D0D4E4]"></div>
                  </div>

                  {/* Right Box - QR Code */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex h-[380px] flex-col items-center justify-center gap-4 rounded-t-lg border-[1.5px] border-dashed border-[#C3C6D4] bg-white">
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=https://id.xyz/verify"
                        alt="QR Code"
                        className="w-32 h-32"
                      />
                      <div className="flex flex-col items-center gap-3 max-w-[214px]">
                        <p className="text-[#676879] text-center font-roboto text-[13px] font-normal leading-5">
                          Continue on another device by scanning the QR code or
                          opening{" "}
                          <a
                            href="https://id.xyz/verify"
                            className="text-[#0073EA]"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            https://id.xyz/verify
                          </a>
                        </p>
                      </div>
                    </div>
                    <div className="flex w-full px-4 py-2 items-center gap-2 rounded-b border-t-0 border-[1.5px] border-dashed border-[#C3C6D4] bg-[#F6F7FB]">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clipPath="url(#clip0_info)">
                          <path
                            d="M10.0013 13.3307V9.9974M10.0013 6.66406H10.0096M18.3346 9.9974C18.3346 14.5997 14.6036 18.3307 10.0013 18.3307C5.39893 18.3307 1.66797 14.5997 1.66797 9.9974C1.66797 5.39502 5.39893 1.66406 10.0013 1.66406C14.6036 1.66406 18.3346 5.39502 18.3346 9.9974Z"
                            stroke="#0073EA"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_info">
                            <rect width="20" height="20" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                      <span className="text-[#0073EA] font-roboto text-[12px] font-normal leading-5">
                        How does this work?
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        );
      }

      default:
        return (
          <div className="flex p-4 px-6 flex-col items-start self-stretch border-t border-border bg-background">
            <div className="text-text-primary font-roboto text-sm">
              Unknown section type: {section.sectionType}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-start gap-4 bg-background rounded border border-[#DEDEDD]">
      <div className="flex p-0.5 flex-col items-start self-stretch rounded-t border border-[#DEDEDD]">
        <div className="flex p-4 flex-col justify-center items-center gap-2 self-stretch bg-background">
          <div className="flex pb-1 items-center gap-2 self-stretch">
            <button
              onClick={() => onToggle(sectionIndex)}
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
          <div className="flex pl-6 justify-center items-center gap-2.5 self-stretch">
            <div className="flex-1 text-text-primary font-roboto text-[13px] font-normal leading-5">
              {!isExpanded && isFilled ? (
                <span className="text-green-600 font-medium">
                  This section has been filled
                </span>
              ) : (
                section.description ||
                `Complete the ${section.name.toLowerCase()} section.`
              )}
            </div>
          </div>
        </div>
        {isExpanded && (
          <div
            onClick={() => onSectionFocus?.(sectionIndex)}
            onFocus={() => onSectionFocus?.(sectionIndex)}
          >
            {renderSectionContent()}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { TemplateVersionSection } from "@shared/api";
import { PersonalInformationForm } from "./PersonalInformationForm";
import { IdentityDocumentForm } from "./IdentityDocumentForm";
import { CameraSelfieStep } from "./CameraSelfieStep";
import { LockedStepComponent } from "./LockedStepComponent";
import { FormData } from "@shared/templates";

interface DynamicSectionProps {
  section: TemplateVersionSection;
  sectionIndex: number;
  currentStep: number;
  isExpanded: boolean;
  onToggle: (sectionIndex: number) => void;
  // Form related props
  formData?: FormData;
  setFormData?: (data: FormData) => void;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  onSendEmailOTP?: () => void;
  onSendPhoneOTP?: () => void;
  onIdentityDocumentComplete?: () => void;
  onSelfieComplete?: () => void;
}

export function DynamicSection({
  section,
  sectionIndex,
  currentStep,
  isExpanded,
  onToggle,
  formData,
  setFormData,
  isEmailVerified,
  isPhoneVerified,
  onSendEmailOTP,
  onSendPhoneOTP,
  onIdentityDocumentComplete,
  onSelfieComplete,
}: DynamicSectionProps) {
  const renderSectionContent = () => {
    // Only the current step is active; all others are locked
    if (sectionIndex !== currentStep) {
      return (
        <div className="flex w-full h-[308px] border-t border-border bg-background">
          <LockedStepComponent
            message={
              "This step is locked until you complete the previous step."
            }
          />
        </div>
      );
    }

    // Render based on section type
    switch (section.sectionType) {
      case "personalInformation":
        if (!formData || !setFormData) return null;

        // Extract field configuration from fieldMappings
        const fieldConfig =
          section.fieldMappings?.[0]?.structure?.personalInfo || {};

        return (
          <div className="flex p-5 px-6 flex-col items-start self-stretch border-t border-border bg-background">
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

      case "documents":
        // Extract document configuration from fieldMappings
        const documentConfig =
          section.fieldMappings?.[0]?.structure?.documentVerification || {};

        return (
          <div className="flex p-4 px-6 flex-col items-start self-stretch border-t border-border bg-background">
            <IdentityDocumentForm
              onComplete={onIdentityDocumentComplete || (() => {})}
              documentConfig={documentConfig}
            />
          </div>
        );

      case "biometrics":
        return (
          <div className="flex p-3 flex-col justify-center items-center self-stretch border-t border-border bg-background">
            <div className="flex w-full flex-col items-center gap-2">
              <CameraSelfieStep onComplete={onSelfieComplete || (() => {})} />
            </div>
          </div>
        );

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
              {section.description ||
                `Complete the ${section.name.toLowerCase()} section.`}
            </div>
          </div>
        </div>
        {isExpanded && renderSectionContent()}
      </div>
    </div>
  );
}

import { TemplateVersionSection } from "@shared/api";
import { PersonalInformationForm } from "./PersonalInformationForm";
import { IdentityDocumentForm } from "./IdentityDocumentForm";
import { CameraSelfieStep } from "./CameraSelfieStep";
import { LockedStepComponent } from "./LockedStepComponent";
import { FormData } from "@shared/templates";

interface DesktopDynamicSectionProps {
  section: TemplateVersionSection;
  sectionIndex: number;
  currentStep: number;
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

export function DesktopDynamicSection({
  section,
  sectionIndex,
  currentStep,
  formData,
  setFormData,
  isEmailVerified,
  isPhoneVerified,
  onSendEmailOTP,
  onSendPhoneOTP,
  onIdentityDocumentComplete,
  onSelfieComplete,
}: DesktopDynamicSectionProps) {
  
  const renderSectionContent = () => {
    // Render based on section type
    switch (section.sectionType) {
      case "personalInformation":
        if (!formData || !setFormData) return null;

        // Extract field configuration from fieldMappings
        const fieldConfig = section.fieldMappings?.[0]?.structure?.personalInfo || {};

        if (currentStep === sectionIndex) {
          return (
            <div className="flex flex-col items-start gap-4 self-stretch rounded bg-background">
              <div className="flex py-0 px-0.5 flex-col items-start self-stretch rounded border border-border">
                <div className="flex p-4 flex-col justify-center items-center gap-2 self-stretch bg-background">
                  <div className="flex pb-1 items-center gap-2 self-stretch">
                    <svg
                      className="w-[18px] h-[18px] aspect-1"
                      viewBox="0 0 18 18"
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
                  </div>
                  <div className="flex pl-7 justify-center items-center gap-2.5 self-stretch">
                    <div className="flex-1 text-text-primary font-roboto text-[13px] font-normal leading-5">
                      {section.description || `Complete the ${section.name.toLowerCase()} section.`}
                    </div>
                  </div>
                </div>
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
              </div>
            </div>
          );
        }
        return (
          <div className="flex flex-col items-start gap-4 self-stretch rounded bg-background">
            <div className="flex py-0 px-0.5 flex-col items-start self-stretch rounded border border-border">
              <div className="flex p-4 flex-col justify-center items-center gap-2 self-stretch bg-background">
                <div className="flex pb-1 items-center gap-2 self-stretch">
                  <svg
                    className="w-[18px] h-[18px] aspect-1"
                    viewBox="0 0 18 18"
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
                </div>
                <div className="flex pl-7 justify-center items-center gap-2.5 self-stretch">
                  <div className="flex-1 text-text-primary font-roboto text-[13px] font-normal leading-5">
                    {section.description || `Complete the ${section.name.toLowerCase()} section.`}
                  </div>
                </div>
              </div>
              <div className="flex w-full h-[308px] border-t border-border bg-background">
                <LockedStepComponent message="This step is locked until you complete the previous step." />
              </div>
            </div>
          </div>
        );
      
      case "documents":
        // Extract document configuration from fieldMappings
        const documentConfig = section.fieldMappings?.[0]?.structure?.documentVerification || {};
        
        return (
          <div className="flex flex-col items-start gap-4 self-stretch rounded bg-background">
            <div className="flex py-0 px-0.5 flex-col items-start self-stretch rounded border border-[#DEDEDD] bg-white">
              <div className="flex p-4 flex-col justify-center items-center gap-2 self-stretch bg-white">
                <div className="flex pb-1 items-center gap-2 self-stretch">
                  <svg
                    className="w-[18px] h-[18px] aspect-1"
                    viewBox="0 0 18 18"
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
                </div>
                <div className="flex pl-7 justify-center items-center gap-2.5 self-stretch">
                  <div className="flex-1 text-text-primary font-roboto text-[13px] font-normal leading-5">
                    {section.description || `Complete the ${section.name.toLowerCase()} section.`}
                  </div>
                </div>
              </div>
              {currentStep === sectionIndex ? (
                <div className="flex py-4 px-[34px] flex-col items-start self-stretch border-t border-[#DEDEDD] bg-white">
                  <IdentityDocumentForm
                    onComplete={onIdentityDocumentComplete || (() => {})}
                    documentConfig={documentConfig}
                  />
                </div>
              ) : (
                <div className="flex w-full h-[308px] border-t border-border bg-background">
                  <LockedStepComponent message="This step is locked until you complete the previous step." />
                </div>
              )}
            </div>
          </div>
        );
      
      case "biometrics":
        if (currentStep === sectionIndex) {
          return (
            <CameraSelfieStep
              onComplete={onSelfieComplete || (() => {})}
            />
          );
        } else {
          return (
            <div className="flex flex-col items-start gap-4 self-stretch rounded bg-background">
              <div className="flex py-0 px-0.5 flex-col items-start self-stretch rounded border border-border">
                <div className="flex p-3 flex-col justify-center items-center gap-2 self-stretch bg-background">
                  <div className="flex pb-1 items-center gap-2 self-stretch">
                    <svg
                      className="w-[18px] h-[18px] aspect-1"
                      viewBox="0 0 18 18"
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
                  </div>
                  <div className="flex pl-7 justify-center items-center gap-2.5 self-stretch">
                    <div className="flex-1 text-text-primary font-roboto text-[13px] font-normal leading-5">
                      {section.description || `Complete the ${section.name.toLowerCase()} section.`}
                    </div>
                  </div>
                </div>
                <div className="flex w-full h-[308px] border-t border-border bg-background">
                  <LockedStepComponent message="You'll be able to complete this step after submitting your identity document." />
                </div>
              </div>
            </div>
          );
        }
      
      default:
        return (
          <div className="flex flex-col items-start gap-4 self-stretch rounded bg-background">
            <div className="flex py-0 px-0.5 flex-col items-start self-stretch rounded border border-border">
              <div className="flex p-4 flex-col justify-center items-center gap-2 self-stretch bg-background">
                <div className="flex pb-1 items-center gap-2 self-stretch">
                  <div className="text-text-primary font-roboto text-base font-bold leading-3">
                    {section.name}
                  </div>
                </div>
                <div className="flex pl-7 justify-center items-center gap-2.5 self-stretch">
                  <div className="flex-1 text-text-primary font-roboto text-[13px] font-normal leading-5">
                    Unknown section type: {section.sectionType}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return renderSectionContent();
}

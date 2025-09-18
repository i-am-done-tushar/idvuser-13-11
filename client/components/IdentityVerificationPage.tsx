import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { StepSidebar } from "./StepSidebar";
import { PersonalInformationForm } from "./PersonalInformationForm";
import { IdentityDocumentForm } from "./IdentityDocumentForm";
import { CameraSelfieStep } from "./CameraSelfieStep";
import { ConsentDialog } from "./ConsentDialog";
import { HowItWorksDialog } from "./HowItWorksDialog";
import { LockedStepComponent } from "./LockedStepComponent";
import { TemplateResponse, FormData } from "@shared/templates";
import { useToast } from "@/hooks/use-toast";
import {
  isValidName,
  isValidEmail,
  isValidPhoneForCountry,
  isValidDOB,
  isValidAddress,
  isValidPostalCode,
} from "@/lib/validation";

interface IdentityVerificationPageProps {
  templateId: number;
}

export function IdentityVerificationPage({
  templateId,
}: IdentityVerificationPageProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<TemplateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [hasShownStep1Toast, setHasShownStep1Toast] = useState(false);
  const [isIdentityDocumentCompleted, setIsIdentityDocumentCompleted] =
    useState(false);
  const [hasShownStep2Toast, setHasShownStep2Toast] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(true);
  const [hasConsented, setHasConsented] = useState(false);
  const [showHowItWorksDialog, setShowHowItWorksDialog] = useState(false);
  const [expandedSections, setExpandedSections] = useState<number[]>([1]);

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    middleName: "",
    dateOfBirth: "",
    email: "",
    countryCode: "",
    phoneNumber: "",
    gender: "",
    address: "",
    city: "",
    postalCode: "",
  });

  // Fetch template data
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/templates/${templateId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch template");
        }
        const templateData = await response.json();
        setTemplate(templateData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId]);

  // Monitor for Step 1 completion
  useEffect(() => {
    const formIsValid = isFormValid();

    if (currentStep === 1 && formIsValid && !hasShownStep1Toast) {
      // Show success toast
      toast({
        title: (
          <div className="flex items-center gap-2">
            <div className="flex w-6 h-6 p-1.5 justify-center items-center rounded-full border-2 border-[#ECFDF3] bg-[#D1FADF]">
              <svg
                className="w-3 h-3 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22 11.0801V12.0001C21.9988 14.1565 21.3005 16.2548 20.0093 17.9819C18.7182 19.7091 16.9033 20.9726 14.8354 21.584C12.7674 22.1954 10.5573 22.122 8.53447 21.3747C6.51168 20.6274 4.78465 19.2462 3.61096 17.4372C2.43727 15.6281 1.87979 13.4882 2.02168 11.3364C2.16356 9.18467 2.99721 7.13643 4.39828 5.49718C5.79935 3.85793 7.69279 2.71549 9.79619 2.24025C11.8996 1.76502 14.1003 1.98245 16.07 2.86011M22 4.00011L12 14.0101L9.00001 11.0101"
                  stroke="#039855"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-text-primary font-figtree text-base font-bold">
              Step 1 completed
            </span>
          </div>
        ),
        description: (
          <span className="text-text-secondary font-figtree text-[13px] font-normal">
            Step 1 completed. Please proceed to the next step
          </span>
        ),
      });

      setHasShownStep1Toast(true);

      // Advance to step 2 after a short delay
      setTimeout(() => {
        setCurrentStep(2);
        setExpandedSections([2]);
      }, 1500);
    }
  }, [
    isEmailVerified,
    isPhoneVerified,
    formData.firstName,
    formData.lastName,
    formData.dateOfBirth,
    formData.email,
    formData.countryCode,
    formData.phoneNumber,
    formData.address,
    formData.city,
    formData.postalCode,
    currentStep,
    hasShownStep1Toast,
    toast,
  ]);

  // Monitor for Step 2 completion
  useEffect(() => {
    if (
      currentStep === 2 &&
      isIdentityDocumentCompleted &&
      !hasShownStep2Toast
    ) {
      // Show success toast
      toast({
        title: (
          <div className="flex items-center gap-2">
            <div className="flex w-6 h-6 p-1.5 justify-center items-center rounded-full border-2 border-[#ECFDF3] bg-[#D1FADF]">
              <svg
                className="w-3 h-3 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22 11.0801V12.0001C21.9988 14.1565 21.3005 16.2548 20.0093 17.9819C18.7182 19.7091 16.9033 20.9726 14.8354 21.584C12.7674 22.1954 10.5573 22.122 8.53447 21.3747C6.51168 20.6274 4.78465 19.2462 3.61096 17.4372C2.43727 15.6281 1.87979 13.4882 2.02168 11.3364C2.16356 9.18467 2.99721 7.13643 4.39828 5.49718C5.79935 3.85793 7.69279 2.71549 9.79619 2.24025C11.8996 1.76502 14.1003 1.98245 16.07 2.86011M22 4.00011L12 14.0101L9.00001 11.0101"
                  stroke="#039855"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-text-primary font-figtree text-base font-bold">
              Step 2 completed
            </span>
          </div>
        ),
        description: (
          <span className="text-text-secondary font-figtree text-[13px] font-normal">
            Step 2 completed. Please proceed to the final step
          </span>
        ),
      });

      setHasShownStep2Toast(true);

      // Advance to step 3 after a short delay
      setTimeout(() => {
        setCurrentStep(3);
        setExpandedSections([3]);
      }, 1500);
    }
  }, [currentStep, isIdentityDocumentCompleted, hasShownStep2Toast, toast]);

  const handleSendEmailOTP = () => {
    // Mock email verification
    setTimeout(() => {
      setIsEmailVerified(true);
    }, 1000);
  };

  const handleSendPhoneOTP = () => {
    // Mock phone verification
    setTimeout(() => {
      setIsPhoneVerified(true);
    }, 1000);
  };

  const handleConsentClose = () => {
    setShowConsentDialog(false);
  };

  const handleConsentAgree = () => {
    setHasConsented(true);
    setShowConsentDialog(false);
  };

  const handleIdentityDocumentComplete = () => {
    setIsIdentityDocumentCompleted(true);
  };

  const handleSubmit = () => {
    if (isFormValid()) {
      // Navigate to verification progress page
      navigate("/verification-progress");
    }
  };

  const toggleSection = (sectionIndex: number) => {
    setExpandedSections(prev =>
      prev.includes(sectionIndex)
        ? prev.filter(i => i !== sectionIndex)
        : [...prev, sectionIndex]
    );
  };

  const isFormValid = () => {
    return (
      isValidName(formData.firstName) &&
      isValidName(formData.lastName) &&
      isValidDOB(formData.dateOfBirth) &&
      isValidEmail(formData.email) &&
      !!formData.countryCode &&
      isValidPhoneForCountry(formData.countryCode, formData.phoneNumber) &&
      isValidAddress(formData.address) &&
      !!formData.city &&
      isValidPostalCode(formData.postalCode) &&
      isEmailVerified &&
      isPhoneVerified &&
      isIdentityDocumentCompleted
    );
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-page-background flex items-center justify-center">
        <div className="text-text-primary font-roboto text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="w-full h-screen bg-page-background flex items-center justify-center">
        <div className="text-destructive font-roboto text-lg">
          {error || "Template not found"}
        </div>
      </div>
    );
  }

  const activeVersion = template.versions.find((v) => v.isActive);
  if (!activeVersion) {
    return (
      <div className="w-full h-screen bg-page-background flex items-center justify-center">
        <div className="text-destructive font-roboto text-lg">
          No active template version found
        </div>
      </div>
    );
  }

  const activeSections = activeVersion.sections
    .filter((s) => s.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <>
      {/* Consent Dialog */}
      <ConsentDialog
        isOpen={showConsentDialog && !hasConsented}
        onClose={handleConsentClose}
        onAgree={handleConsentAgree}
      />

      {/* How It Works Dialog */}
      <HowItWorksDialog
        isOpen={showHowItWorksDialog}
        onClose={() => setShowHowItWorksDialog(false)}
      />

      <div
        className={`w-full min-h-screen bg-page-background flex flex-col ${
          showConsentDialog && !hasConsented
            ? "opacity-50 pointer-events-none"
            : ""
        }`}
      >
        {/* Header */}
        <Header />

        {/* Title Bar - Mobile Layout */}
        <div className="flex w-full h-11 items-center flex-shrink-0 bg-background border-b border-border">
          <div className="flex flex-col items-start flex-1 px-3 sm:px-4">
            <div className="flex h-11 justify-between items-center self-stretch">
              <div className="flex items-center gap-1">
                <div className="text-text-primary font-roboto text-base font-bold leading-3">
                  Identity Verification Form
                </div>
                {/* More Button - Mobile */}
                <div className="sm:hidden flex w-8 h-8 justify-center items-center gap-2.5">
                  <svg
                    className="w-6 h-6 transform rotate-90"
                    viewBox="0 0 25 25"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.5 12.332C13.5 11.7797 13.0523 11.332 12.5 11.332C11.9477 11.332 11.5 11.7797 11.5 12.332C11.5 12.8843 11.9477 13.332 12.5 13.332C13.0523 13.332 13.5 12.8843 13.5 12.332Z"
                      stroke="#676879"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6.5 12.332C6.5 11.7797 6.05228 11.332 5.5 11.332C4.94772 11.332 4.5 11.7797 4.5 12.332C4.5 12.8843 4.94772 13.332 5.5 13.332C6.05228 13.332 6.5 12.8843 6.5 12.332Z"
                      stroke="#676879"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M20.5 12.332C20.5 11.7797 20.0523 11.332 19.5 11.332C18.9477 11.332 18.5 11.7797 18.5 12.332C18.5 12.8843 18.9477 13.332 19.5 13.332C20.0523 13.332 20.5 12.8843 20.5 12.332Z"
                      stroke="#676879"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className={`flex h-8 py-[9px] px-3 justify-center items-center gap-0.5 rounded ${
                    isFormValid() ? "bg-primary" : "bg-primary opacity-50"
                  }`}
                  disabled={!isFormValid()}
                >
                  <span className="text-white font-roboto text-[13px] font-normal">
                    Submit
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex w-full flex-1 overflow-hidden">
          {/* Desktop Sidebar - hidden on mobile */}
          <div className="hidden lg:block border-r border-border">
            <StepSidebar sections={activeSections} currentStep={currentStep} />
          </div>

          {/* Mobile/Desktop Content Area */}
          <div className="flex w-full flex-1 flex-col">
            {/* Mobile Step Indicator */}
            <div className="lg:hidden px-3 py-4 bg-page-background">
              <div className="space-y-4">
                {/* Step 1 - Personal Information */}
                <div className="flex flex-col items-start gap-4 bg-background rounded border border-[#DEDEDD]">
                  <div className="flex p-0.5 flex-col items-start self-stretch rounded-t border border-[#DEDEDD]">
                    <div className="flex p-4 flex-col justify-center items-center gap-2 self-stretch bg-background">
                      <div className="flex pb-1 items-center gap-2 self-stretch">
                        <button
                          onClick={() => toggleSection(1)}
                          className="flex items-center gap-2"
                        >
                          <svg
                            className={`w-[18px] h-[18px] transform transition-transform ${
                              expandedSections.includes(1) ? 'rotate-0' : 'rotate-180'
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
                            Personal Information
                          </div>
                        </button>
                      </div>
                      <div className="flex pl-6 justify-center items-center gap-2.5 self-stretch">
                        <div className="flex-1 text-text-primary font-roboto text-[13px] font-normal leading-5">
                          Please provide your basic personal information to begin the identity verification process.
                        </div>
                      </div>
                    </div>
                    {expandedSections.includes(1) && (
                      <div className="flex p-5 px-6 flex-col items-start self-stretch border-t border-border bg-background">
                        <PersonalInformationForm
                          formData={formData}
                          setFormData={setFormData}
                          isEmailVerified={isEmailVerified}
                          isPhoneVerified={isPhoneVerified}
                          onSendEmailOTP={handleSendEmailOTP}
                          onSendPhoneOTP={handleSendPhoneOTP}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 2 - Identity Document */}
                <div className="flex flex-col items-start gap-4 bg-background rounded border border-border">
                  <div className="flex p-0.5 flex-col items-start self-stretch rounded border border-border">
                    <div className="flex p-3 flex-col justify-center items-center gap-2 self-stretch bg-background">
                      <div className="flex pb-1 items-center gap-2 self-stretch">
                        <button
                          onClick={() => toggleSection(2)}
                          className="flex items-center gap-2"
                        >
                          <svg
                            className={`w-[18px] h-[18px] transform transition-transform ${
                              expandedSections.includes(2) ? 'rotate-0' : 'rotate-180'
                            }`}
                            viewBox="0 0 18 19"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M6.00195 9.33106H12.002M16.502 9.33106C16.502 13.4732 13.1441 16.8311 9.00195 16.8311C4.85982 16.8311 1.50195 13.4732 1.50195 9.33106C1.50195 5.18892 4.85982 1.83105 9.00195 1.83105C13.1441 1.83105 16.502 5.18892 16.502 9.33106Z"
                              stroke="#323238"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="text-text-primary font-roboto text-base font-bold leading-3">
                            Upload Identity Document
                          </div>
                        </button>
                      </div>
                      <div className="flex pl-6 justify-center items-center gap-2.5 self-stretch">
                        <div className="flex-1 text-text-primary font-roboto text-[13px] font-normal leading-5">
                          Choose a valid government-issued ID (like a passport, driver's license, or national ID) and upload a clear photo of it.
                        </div>
                      </div>
                    </div>
                    {currentStep >= 2 && expandedSections.includes(2) && (
                      <div className="flex p-4 px-6 flex-col items-start self-stretch border-t border-border bg-background">
                        <IdentityDocumentForm
                          onComplete={handleIdentityDocumentComplete}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 3 - Capture Selfie */}
                <div className="flex flex-col items-start gap-4 bg-background rounded border border-border">
                  <div className="flex p-0.5 flex-col items-start self-stretch rounded border border-border">
                    <div className="flex p-3 flex-col justify-center items-center gap-2 self-stretch bg-background">
                      <div className="flex pb-1 items-center gap-2 self-stretch">
                        <button
                          onClick={() => toggleSection(3)}
                          className="flex items-center gap-2"
                        >
                          <svg
                            className={`w-[18px] h-[18px] transform transition-transform ${
                              expandedSections.includes(3) ? 'rotate-0' : 'rotate-180'
                            }`}
                            viewBox="0 0 18 19"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M6.00195 9.33106H12.002M16.502 9.33106C16.502 13.4732 13.1441 16.8311 9.00195 16.8311C4.85982 16.8311 1.50195 13.4732 1.50195 9.33106C1.50195 5.18892 4.85982 1.83105 9.00195 1.83105C13.1441 1.83105 16.502 5.18892 16.502 9.33106Z"
                              stroke="#323238"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="text-text-primary font-roboto text-base font-bold leading-3">
                            Capture Selfie
                          </div>
                        </button>
                      </div>
                      <div className="flex pl-6 justify-center items-center gap-2.5 self-stretch">
                        <div className="flex-1 text-text-primary font-roboto text-[13px] font-normal leading-5">
                          Take a live selfie to confirm you are the person in the ID document. Make sure you're in a well-lit area and your face is clearly visible.
                        </div>
                      </div>
                    </div>
                    {currentStep === 3 && expandedSections.includes(3) && (
                      <div className="flex p-3 flex-col justify-center items-center self-stretch border-t border-border bg-background">
                        <div className="flex w-full flex-col items-center gap-2">
                          <svg
                            className="w-[270px] h-[123px]"
                            viewBox="0 0 270 123"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M85.3279 21.5137L78.0773 23.9306C77.434 24.1451 77 24.7471 77 25.4253V63.6774C77 64.5475 77.7054 65.2529 78.5755 65.2529H191.227C192.097 65.2529 192.802 64.5475 192.802 63.6774V35.3176C194.546 22.5289 184.36 20.8214 177.822 21.6638C176.954 21.7757 176.115 21.1972 175.923 20.3434C169.802 -6.87346 153.204 1.99993 143.786 11.6466C142.867 12.5889 141.155 12.1352 140.472 11.0094C137.614 6.29858 131.053 7.6939 126.478 9.7635C125.425 10.24 124.154 9.56356 123.989 8.41924C122.429 -2.41918 117.469 -0.54889 114.308 2.60936C113.684 3.23313 112.684 3.33073 111.958 2.82911C106.479 -0.956193 104.073 2.80364 103.285 6.4498C103.063 7.47811 101.996 8.16709 100.98 7.89349C89.6105 4.83131 86.5757 13.8779 86.4423 19.9535C86.4268 20.6557 85.9943 21.2916 85.3279 21.5137Z"
                              fill="url(#paint0_linear_2641_20612)"
                            />
                            <rect
                              x="123.5"
                              y="45.7188"
                              width="24.8794"
                              height="12.8687"
                              fill="url(#paint1_linear_2641_20612)"
                            />
                            <text
                              fill="#42526E"
                              xmlSpace="preserve"
                              style={{ whiteSpace: 'pre' }}
                              fontFamily="Roboto"
                              fontSize="13"
                              fontWeight="500"
                              letterSpacing="0em"
                            >
                              <tspan x="6.16797" y="96.9507">
                                Complete the previous steps to enable selfie{' '}
                              </tspan>
                              <tspan x="111.133" y="116.951">
                                capture.
                              </tspan>
                            </text>
                            <defs>
                              <linearGradient
                                id="paint0_linear_2641_20612"
                                x1="135"
                                y1="0.157227"
                                x2="135.295"
                                y2="33.2436"
                                gradientUnits="userSpaceOnUse"
                              >
                                <stop stopColor="#F1F1F1" />
                                <stop offset="1" stopColor="#F8F8F8" stopOpacity="0.2" />
                              </linearGradient>
                              <linearGradient
                                id="paint1_linear_2641_20612"
                                x1="135.94"
                                y1="45.7188"
                                x2="135.94"
                                y2="58.5874"
                                gradientUnits="userSpaceOnUse"
                              >
                                <stop stopColor="#BCD3FF" />
                                <stop offset="1" stopColor="#EAF1FF" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Content */}
            <div className="hidden lg:flex w-full flex-1 p-6 flex-col items-center gap-6 bg-background overflow-auto">
              <div className="flex w-full max-w-[998px] flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-6 self-stretch">
                  {/* Personal Information Section */}
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
                            <g clipPath="url(#clip0_minus)">
                              <path
                                d="M6.00391 9H12.0039M16.5039 9C16.5039 13.1421 13.146 16.5 9.00391 16.5C4.86177 16.5 1.50391 13.1421 1.50391 9C1.50391 4.85786 4.86177 1.5 9.00391 1.5C13.146 1.5 16.5039 4.85786 16.5039 9Z"
                                stroke="#323238"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_minus">
                                <rect width="18" height="18" fill="white" />
                              </clipPath>
                            </defs>
                          </svg>
                          <div className="text-text-primary font-roboto text-base font-bold leading-3">
                            Personal Information
                          </div>
                        </div>
                        <div className="flex pl-7 justify-center items-center gap-2.5 self-stretch">
                          <div className="flex-1 text-text-primary font-roboto text-[13px] font-normal leading-5">
                            Please provide your basic personal information to
                            begin the identity verification process.
                          </div>
                        </div>
                      </div>
                      <div className="flex py-5 px-[34px] flex-col items-start self-stretch border-t border-border bg-background">
                        <PersonalInformationForm
                          formData={formData}
                          setFormData={setFormData}
                          isEmailVerified={isEmailVerified}
                          isPhoneVerified={isPhoneVerified}
                          onSendEmailOTP={handleSendEmailOTP}
                          onSendPhoneOTP={handleSendPhoneOTP}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Identity Document Section */}
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
                            <g clipPath="url(#clip0_2641_17192)">
                              <path
                                d="M6.00195 8.99902H12.002M16.502 8.99902C16.502 13.1411 13.1441 16.499 9.00195 16.499C4.85982 16.499 1.50195 13.1411 1.50195 8.99902C1.50195 4.85689 4.85982 1.49902 9.00195 1.49902C13.1441 1.49902 16.502 4.85689 16.502 8.99902Z"
                                stroke="#323238"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_2641_17192">
                                <rect width="18" height="18" fill="white" />
                              </clipPath>
                            </defs>
                          </svg>
                          <div className="text-[#172B4D] font-roboto text-base font-bold leading-3">
                            Identity Document
                          </div>
                        </div>
                        <div className="flex pl-7 justify-center items-center gap-2.5 self-stretch">
                          <div className="flex-1 text-[#172B4D] font-roboto text-[13px] font-normal leading-5">
                            Choose a valid government-issued ID (like a passport,
                            driver's license, or national ID) and upload a clear
                            photo of it.
                          </div>
                        </div>
                      </div>
                      {currentStep >= 2 ? (
                        <div className="flex py-4 px-[34px] flex-col items-start self-stretch border-t border-[#DEDEDD] bg-white">
                          <IdentityDocumentForm
                            onComplete={handleIdentityDocumentComplete}
                          />
                        </div>
                      ) : (
                        <div className="flex w-full h-[308px] border-t border-border bg-background">
                          <LockedStepComponent message="You'll be able to complete this step after submitting your personal information." />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Capture Selfie Section */}
                  {currentStep === 3 ? (
                    <CameraSelfieStep />
                  ) : (
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
                              <g clipPath="url(#clip0_minus3)">
                                <path
                                  d="M6.0022 8.99902H12.0022M16.5022 8.99902C16.5022 13.1411 13.1443 16.499 9.0022 16.499C4.86006 16.499 1.5022 13.1411 1.5022 8.99902C1.5022 4.85689 4.86006 1.49902 9.0022 1.49902C13.1443 1.49902 16.5022 4.85689 16.5022 8.99902Z"
                                  stroke="#323238"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </g>
                              <defs>
                                <clipPath id="clip0_minus3">
                                  <rect width="18" height="18" fill="white" />
                                </clipPath>
                              </defs>
                            </svg>
                            <div className="text-text-primary font-roboto text-base font-bold leading-3">
                              Capture Selfie
                            </div>
                          </div>
                          <div className="flex pl-7 justify-center items-center gap-2.5 self-stretch">
                            <div className="flex-1 text-text-primary font-roboto text-[13px] font-normal leading-5">
                              Take a live selfie to confirm you are the person in
                              the ID document. Make sure you're in a well-lit area
                              and your face is clearly visible.
                            </div>
                          </div>
                        </div>
                        <div className="flex w-full h-[308px] border-t border-border bg-background">
                          <LockedStepComponent message="You'll be able to complete this step after submitting your identity document." />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

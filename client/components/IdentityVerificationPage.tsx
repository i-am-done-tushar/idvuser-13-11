import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { StepSidebar } from "./StepSidebar";
import { ConsentDialog } from "./ConsentDialog";
import { HowItWorksDialog } from "./HowItWorksDialog";
import { DynamicSection } from "./DynamicSection";
import { DesktopDynamicSection } from "./DesktopDynamicSection";
import { LockedStepComponent } from "./LockedStepComponent";
import { OTPVerificationDialog } from "./OTPVerificationDialog";
import { FormData } from "@shared/templates";
import { TemplateVersionResponse } from "@shared/api";
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
  const [templateVersion, setTemplateVersion] = useState<TemplateVersionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [hasShownStep1Toast, setHasShownStep1Toast] = useState(false);
  const [isIdentityDocumentCompleted, setIsIdentityDocumentCompleted] =
    useState(false);
  const [hasShownStep2Toast, setHasShownStep2Toast] = useState(false);
  const [isSelfieCompleted, setIsSelfieCompleted] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(true);
  const [hasConsented, setHasConsented] = useState(false);
  const [showHowItWorksDialog, setShowHowItWorksDialog] = useState(false);
  const [expandedSections, setExpandedSections] = useState<number[]>([1]);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [otpType, setOtpType] = useState<"email" | "phone">("email");
  const [pendingVerification, setPendingVerification] = useState<{
    type: "email" | "phone";
    recipient: string;
  } | null>(null);

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
    permanentAddress: "",
    permanentCity: "",
    permanentPostalCode: "",
  });

  // Fetch template version data using the templateId
  useEffect(() => {
    if (!templateId) {
      setError("No template ID provided");
      setLoading(false);
      return;
    }

    const fetchTemplateVersion = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/TemplateVersion/${templateId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch template version");
        }
        const templateVersionData: TemplateVersionResponse = await response.json();
        console.log("Template version data:", templateVersionData);
        setTemplateVersion(templateVersionData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplateVersion();
  }, [templateId]);

  // Step 1 specific validation (personal info + email/phone)
  const isStep1Complete = () => {
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
      isPhoneVerified
    );
  };

  // Monitor for Step 1 completion
  useEffect(() => {
    const formIsValid = isStep1Complete();

    if (currentStep === 1 && formIsValid && !hasShownStep1Toast) {
      // Show success toast
      toast({
        title: "Step 1 completed",
        description: "Step 1 completed. Please proceed to the next step",
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
        title: "Step 2 completed",
        description: "Step 2 completed. Please proceed to the final step",
      });

      setHasShownStep2Toast(true);

      // Advance to step 3 after a short delay
      setTimeout(() => {
        setCurrentStep(3);
        setExpandedSections([3]);
        setShowMobileMenu(false);
      }, 1500);
    }
  }, [currentStep, isIdentityDocumentCompleted, hasShownStep2Toast, toast]);

  const handleSendEmailOTP = () => {
    setPendingVerification({
      type: "email",
      recipient: formData.email,
    });
    setOtpType("email");
    setShowOTPDialog(true);
  };

  const handleSendPhoneOTP = () => {
    const fullPhone = `${formData.countryCode} ${formData.phoneNumber}`;
    setPendingVerification({
      type: "phone",
      recipient: fullPhone,
    });
    setOtpType("phone");
    setShowOTPDialog(true);
  };

  const handleOTPVerify = async (otp: string) => {
    // Simulate OTP verification
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (pendingVerification?.type === "email") {
      setIsEmailVerified(true);
    } else if (pendingVerification?.type === "phone") {
      setIsPhoneVerified(true);
    }

    setShowOTPDialog(false);
    setPendingVerification(null);
  };

  const handleOTPResend = () => {
    // Simulate resending OTP
    console.log(
      `Resending ${otpType} OTP to ${pendingVerification?.recipient}`,
    );
  };

  const handleOTPClose = () => {
    setShowOTPDialog(false);
    setPendingVerification(null);
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

    // Show success toast (only once)
    if (!hasShownStep2Toast) {
      toast({
        title: "Step 2 completed",
        description: "Step 2 completed. Please proceed to the final step",
      });
      setHasShownStep2Toast(true);
    }

    // Advance to step 3 (ensure mobile menu is closed so content is visible)
    setTimeout(() => {
      setCurrentStep(3);
      setExpandedSections([3]);
      setShowMobileMenu(false);
    }, 1500);
  };

  const handleSubmit = () => {
    if (isFormValid()) {
      // Navigate to verification progress page
      navigate("/verification-progress");
    }
  };

  const toggleSection = (sectionIndex: number) => {
    setExpandedSections((prev) =>
      prev.includes(sectionIndex)
        ? prev.filter((i) => i !== sectionIndex)
        : [...prev, sectionIndex],
    );
  };

  // Ensure the currently active step is expanded on mobile when currentStep changes
  useEffect(() => {
    setExpandedSections((prev) =>
      prev.includes(currentStep) ? prev : [currentStep],
    );
    // Close mobile menu once we advance beyond step 1 so content is visible
    if (currentStep >= 2) setShowMobileMenu(false);
  }, [currentStep]);

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
      isSelfieCompleted
    );
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-page-background flex items-center justify-center">
        <div className="text-text-primary font-roboto text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-page-background flex items-center justify-center">
        <div className="text-destructive font-roboto text-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  // Handle template version data - filter active sections and sort by orderIndex
  let activeSections: any[] = [];
  
  if (templateVersion) {
    // Filter only active sections and sort by orderIndex
    activeSections = templateVersion.sections
      .filter((s) => s.isActive)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  } else {
    return (
      <div className="w-full h-screen bg-page-background flex items-center justify-center">
        <div className="text-destructive font-roboto text-lg">
          No template data available
        </div>
      </div>
    );
  }

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

      {/* OTP Verification Dialog */}
      <OTPVerificationDialog
        isOpen={showOTPDialog}
        onClose={handleOTPClose}
        onVerify={handleOTPVerify}
        onResend={handleOTPResend}
        type={otpType}
        recipientEmail={otpType === "email" ? formData.email : undefined}
        recipientPhone={
          otpType === "phone"
            ? `${formData.countryCode} ${formData.phoneNumber}`
            : undefined
        }
      />

      <div
        className={`w-full min-h-screen bg-page-background flex flex-col ${
          showConsentDialog && !hasConsented
            ? "opacity-50 pointer-events-none"
            : ""
        }`}
      >
        {/* Header */}
        <Header
          onMobileMenuToggle={() => setShowMobileMenu((v) => !v)}
          isMobileMenuOpen={showMobileMenu}
        />

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
                  onClick={handleSubmit}
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

          {/* Mobile Sidebar Overlay (from burger) */}
          {showMobileMenu && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setShowMobileMenu(false)}
                aria-hidden
              />

              {/* Panel */}
              <div
                id="mobile-step-sidebar"
                className="relative w-80 bg-white h-full border-r border-border shadow-lg overflow-auto"
              >
                <div className="flex items-center justify-between p-3 border-b border-border">
                  <div className="font-roboto font-bold">Steps</div>
                  <button
                    aria-label="Close menu"
                    className="p-1"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    ✕
                  </button>
                </div>
                <StepSidebar
                  sections={activeSections}
                  currentStep={currentStep}
                />
              </div>
            </div>
          )}

          {/* Mobile/Desktop Content Area */}
          <div className="flex w-full flex-1 flex-col">
            {/* Mobile Step Indicator */}
            <div className="lg:hidden px-3 py-4 bg-page-background">
              <div className="space-y-4">
                {activeSections.map((section, index) => (
                  <DynamicSection
                    key={section.id}
                    section={section}
                    sectionIndex={index + 1}
                    currentStep={currentStep}
                    isExpanded={expandedSections.includes(index + 1)}
                    onToggle={toggleSection}
                    formData={formData}
                    setFormData={setFormData}
                    isEmailVerified={isEmailVerified}
                    isPhoneVerified={isPhoneVerified}
                    onSendEmailOTP={handleSendEmailOTP}
                    onSendPhoneOTP={handleSendPhoneOTP}
                    onIdentityDocumentComplete={handleIdentityDocumentComplete}
                    onSelfieComplete={() => setIsSelfieCompleted(true)}
                  />
                ))}
              </div>
            </div>

            {/* Desktop Content */}
            <div className="hidden lg:flex w-full flex-1 p-6 flex-col items-center gap-6 bg-background overflow-auto">
              <div className="flex w-full max-w-[998px] flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-6 self-stretch">
                  {activeSections.map((section, index) => (
                    <DesktopDynamicSection
                      key={section.id}
                      section={section}
                      sectionIndex={index + 1}
                      currentStep={currentStep}
                      formData={formData}
                      setFormData={setFormData}
                      isEmailVerified={isEmailVerified}
                      isPhoneVerified={isPhoneVerified}
                      onSendEmailOTP={handleSendEmailOTP}
                      onSendPhoneOTP={handleSendPhoneOTP}
                      onIdentityDocumentComplete={handleIdentityDocumentComplete}
                      onSelfieComplete={() => setIsSelfieCompleted(true)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

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

// ---- single source of truth for API base ----
const API_BASE =
  import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || "";

// 🚀 DEVELOPMENT FLAG - Set to false to enable OTP verification
const BYPASS_OTP_FOR_DEVELOPMENT = false;

// token helper (kept minimal)
const getToken = () =>
  (typeof window !== "undefined" && localStorage.getItem("access")) || null;

interface IdentityVerificationPageProps {
  // NOTE: despite the name, we call /TemplateVersion/{id} so this is a VERSION id
  templateId: number;
  userId: number | null;
}

export function IdentityVerificationPage({
  templateId,
  userId,
}: IdentityVerificationPageProps) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [templateVersion, setTemplateVersion] =
    useState<TemplateVersionResponse | null>(null);
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

  // OTP dialog + state
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [otpType, setOtpType] = useState<"email" | "phone">("email");
  const [pendingVerification, setPendingVerification] = useState<{
    type: "email" | "phone";
    recipient: string;
  } | null>(null);
  const [otpSending, setOtpSending] = useState(false);
  const [otpValidating, setOtpValidating] = useState(false);

  const [showMobileMenu, setShowMobileMenu] = useState(false);

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

  // ---- helpers pulled from your new version ----
  const getPersonalInfoConfig = () => {
    if (!templateVersion) return {};
    const personalInfoSection = templateVersion.sections.find(
      (section) => section.sectionType === "personalInformation",
    );
    if (
      !personalInfoSection ||
      !personalInfoSection.fieldMappings?.[0]?.structure
    ) {
      return {};
    }
    const fieldConfig = personalInfoSection.fieldMappings[0].structure as any;
    return fieldConfig.personalInfo || {};
  };

  // ---- fetch version by id (server route uses version id) ----
  useEffect(() => {
    if (!templateId) {
      setError("No template/version ID provided");
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE}/api/TemplateVersion/${templateId}`,
          {
            headers: { Accept: "application/json" },
            signal: controller.signal,
          },
        );
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Failed to fetch version ${templateId}`);
        }
        const data: TemplateVersionResponse = await res.json();
        setTemplateVersion(data);
      } catch (e: any) {
        if (e?.name !== "AbortError")
          setError(e?.message || "Failed to load template version");
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [templateId]);

  // ---- OTP API calls (server-backed) ----
  async function generateEmailOtp(email: string, versionId: number) {
    const token = getToken();
    const res = await fetch(`${API_BASE}/api/Otp/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ email, versionId }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Failed to send OTP (HTTP ${res.status})`);
    }
  }

  async function validateEmailOtp(
    email: string,
    versionId: number,
    otp: string,
  ) {
    const token = getToken();
    const res = await fetch(`${API_BASE}/api/Otp/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ email, versionId, otp }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Invalid OTP (HTTP ${res.status})`);
    }
  }

  // ---- versionId resolver (new page only deals with TemplateVersionResponse) ----
  const getActiveVersionId = () => templateVersion?.versionId ?? null;

  // ---- Step 1 validator (dynamic by API config) ----
  const isStep1Complete = () => {
    if (!templateVersion) return false;
    const personalInfo: any = getPersonalInfoConfig();
    const checks: boolean[] = [];

    if (personalInfo.firstName) checks.push(isValidName(formData.firstName));
    if (personalInfo.lastName) checks.push(isValidName(formData.lastName));
    // Middle name is optional - only validate if it has content
    if (personalInfo.middleName && formData.middleName.trim()) {
      checks.push(isValidName(formData.middleName));
    }
    if (personalInfo.dateOfBirth) checks.push(isValidDOB(formData.dateOfBirth));
    if (personalInfo.email) {
      checks.push(isValidEmail(formData.email));
      checks.push(BYPASS_OTP_FOR_DEVELOPMENT || isEmailVerified); // 🚀 Bypass OTP in dev
    }
    if (personalInfo.phoneNumber) {
      checks.push(!!formData.countryCode);
      checks.push(
        isValidPhoneForCountry(formData.countryCode, formData.phoneNumber),
      );
      checks.push(BYPASS_OTP_FOR_DEVELOPMENT || isPhoneVerified); // 🚀 Bypass OTP in dev
    }
    if (personalInfo.currentAddress) {
      checks.push(isValidAddress(formData.address));
      checks.push(!!formData.city);
      checks.push(isValidPostalCode(formData.postalCode));
    }
    if (personalInfo.permanentAddress) {
      checks.push(isValidAddress(formData.permanentAddress));
      checks.push(!!formData.permanentCity);
      checks.push(isValidPostalCode(formData.permanentPostalCode));
    }
    return checks.length > 0 && checks.every(Boolean);
  };

  // advance to step 2 when step 1 complete
  useEffect(() => {
    const ok = isStep1Complete();
    if (currentStep === 1 && ok && !hasShownStep1Toast) {
      toast({
        title: "Step 1 completed",
        description: "Step 1 completed. Please proceed to the next step",
      });
      setHasShownStep1Toast(true);
      setTimeout(() => {
        setCurrentStep(2);
        setExpandedSections([2]);
      }, 1500);
    }
  }, [
    templateVersion,
    isEmailVerified,
    isPhoneVerified,
    formData.firstName,
    formData.lastName,
    formData.middleName,
    formData.dateOfBirth,
    formData.email,
    formData.countryCode,
    formData.phoneNumber,
    formData.address,
    formData.city,
    formData.postalCode,
    formData.permanentAddress,
    formData.permanentCity,
    formData.permanentPostalCode,
    currentStep,
    hasShownStep1Toast,
    toast,
  ]);

  // advance to step 3 when docs complete
  useEffect(() => {
    if (
      currentStep === 2 &&
      isIdentityDocumentCompleted &&
      !hasShownStep2Toast
    ) {
      toast({
        title: "Step 2 completed",
        description: "Step 2 completed. Please proceed to the final step",
      });
      setHasShownStep2Toast(true);
      setTimeout(() => {
        setCurrentStep(3);
        setExpandedSections([3]);
        setShowMobileMenu(false);
      }, 1500);
    }
  }, [currentStep, isIdentityDocumentCompleted, hasShownStep2Toast, toast]);

  // ---- OTP handlers (server-backed email; phone kept UI-only unless you add API) ----
  const handleSendEmailOTP = async () => {
    const email = formData.email?.trim();
    const versionId = getActiveVersionId();

    if (!email || !isValidEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email first.",
      });
      return;
    }
    if (versionId == null) {
      toast({
        title: "Missing version",
        description: "No active template version found.",
      });
      return;
    }
    try {
      setOtpSending(true);
      await generateEmailOtp(email, versionId);
      setPendingVerification({ type: "email", recipient: email });
      setOtpType("email");
      setShowOTPDialog(true);
      toast({ title: "OTP sent", description: `An OTP was sent to ${email}.` });
    } catch (err: any) {
      toast({
        title: "Failed to send OTP",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setOtpSending(false);
    }
  };

  const handleSendPhoneOTP = () => {
    const fullPhone = `${formData.countryCode} ${formData.phoneNumber}`.trim();
    setPendingVerification({ type: "phone", recipient: fullPhone });
    setOtpType("phone");
    setShowOTPDialog(true);
  };

  const handleOTPVerify = async (otp: string) => {
    // email OTP via server, phone OTP stays simulated
    if (!pendingVerification) return;

    if (pendingVerification.type === "email") {
      const email = formData.email?.trim();
      const versionId = getActiveVersionId();
      if (!email || versionId == null) return;
      try {
        setOtpValidating(true);
        await validateEmailOtp(email, versionId, otp);
        setIsEmailVerified(true);
        toast({
          title: "Email verified",
          description: "Your email was successfully verified.",
        });
        setShowOTPDialog(false);
        setPendingVerification(null);
      } catch (err: any) {
        toast({
          title: "Invalid OTP",
          description: err?.message || "Please check the code and try again.",
          variant: "destructive",
        });
      } finally {
        setOtpValidating(false);
      }
    } else {
      // phone simulated success
      if (otp && otp.length >= 4) {
        setIsPhoneVerified(true);
        toast({
          title: "Phone verified",
          description: "Your phone number was successfully verified.",
        });
        setShowOTPDialog(false);
        setPendingVerification(null);
      } else {
        toast({
          title: "Invalid OTP",
          description: "Please enter a valid OTP.",
          variant: "destructive",
        });
      }
    }
  };

  const handleOTPResend = async () => {
    if (pendingVerification?.type !== "email") return;
    const email = formData.email?.trim();
    const versionId = getActiveVersionId();
    if (!email || versionId == null) return;

    try {
      setOtpSending(true);
      await generateEmailOtp(email, versionId);
      toast({
        title: "OTP resent",
        description: `A new OTP was sent to ${email}.`,
      });
    } catch (err: any) {
      toast({
        title: "Failed to resend",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setOtpSending(false);
    }
  };

  const handleOTPClose = () => {
    setShowOTPDialog(false);
    setPendingVerification(null);
  };

  const handleConsentClose = () => setShowConsentDialog(false);
  const handleConsentAgree = () => {
    setHasConsented(true);
    setShowConsentDialog(false);
  };

  const handleIdentityDocumentComplete = () => {
    setIsIdentityDocumentCompleted(true);
    if (!hasShownStep2Toast) {
      toast({
        title: "Step 2 completed",
        description: "Step 2 completed. Please proceed to the final step",
      });
      setHasShownStep2Toast(true);
    }
    setTimeout(() => {
      setCurrentStep(3);
      setExpandedSections([3]);
      setShowMobileMenu(false);
    }, 1500);
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      // Show missing fields in toast
      const missingFields = getMissingFields();
      if (missingFields.length > 0) {
        toast({
          title: "Form Incomplete",
          description: `Please complete the following: ${missingFields.join(", ")}`,
          variant: "destructive",
        });
      }
      return;
    }

    if (!userId || !templateVersion) {
      toast({
        title: "Missing Information",
        description:
          "User ID or template version not found. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Submitting Form",
        description: "Please wait while we submit your information...",
      });

      // Step 1: Create UserTemplateSubmission
      const submissionResponse = await fetch(
        `${API_BASE}/api/UserTemplateSubmissions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            templateVersionId: templateVersion.versionId,
            userId: userId,
          }),
        },
      );

      if (!submissionResponse.ok) {
        throw new Error("Failed to create template submission");
      }

      const submissionData = await submissionResponse.json();
      const submissionId = submissionData.id;

      // Step 2: Submit form data for each section
      const activeSections = templateVersion.sections.filter((s) => s.isActive);

      for (const section of activeSections) {
        let fieldValue = "";

        if (section.sectionType === "personalInformation") {
          // Map personal information data
          const personalInfo = getPersonalInfoConfig();
          const mappedData: any = {};

          if (personalInfo.firstName) mappedData.firstName = formData.firstName;
          if (personalInfo.lastName) mappedData.lastName = formData.lastName;
          if (personalInfo.middleName)
            mappedData.middleName = formData.middleName;
          if (personalInfo.dateOfBirth)
            mappedData.dateOfBirth = formData.dateOfBirth;
          if (personalInfo.email) mappedData.email = formData.email;
          if (personalInfo.phoneNumber) {
            mappedData.countryCode = formData.countryCode;
            mappedData.phoneNumber = formData.phoneNumber;
          }
          if (personalInfo.gender) mappedData.gender = formData.gender;
          if (personalInfo.currentAddress) {
            mappedData.address = formData.address;
            mappedData.city = formData.city;
            mappedData.postalCode = formData.postalCode;
          }
          if (personalInfo.permanentAddress) {
            mappedData.permanentAddress = formData.permanentAddress;
            mappedData.permanentCity = formData.permanentCity;
            mappedData.permanentPostalCode = formData.permanentPostalCode;
          }

          fieldValue = JSON.stringify(mappedData);
        } else if (section.sectionType === "documents") {
          // Documents section - mark as completed if documents were uploaded
          fieldValue = JSON.stringify({
            documentsUploaded: isIdentityDocumentCompleted,
            completedAt: new Date().toISOString(),
          });
        } else if (section.sectionType === "biometrics") {
          // Biometrics section - mark as completed if selfie was uploaded
          fieldValue = JSON.stringify({
            selfieUploaded: isSelfieCompleted,
            completedAt: new Date().toISOString(),
          });
        }

        // Submit section data
        const sectionResponse = await fetch(
          `${API_BASE}/api/${submissionId}/${section.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "*/*",
            },
            body: JSON.stringify({
              fieldValue: fieldValue,
            }),
          },
        );

        if (!sectionResponse.ok) {
          throw new Error(`Failed to submit ${section.sectionType} section`);
        }
      }

      toast({
        title: "Form Submitted Successfully!",
        description: "Your identity verification form has been submitted.",
      });

      // Navigate to success page
      navigate("/verification-progress");
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Submission Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleSection = (idx: number) => {
    setExpandedSections((prev) => {
      // Allow collapsing any expanded section
      if (prev.includes(idx)) {
        return prev.filter((i) => i !== idx);
      }

      // Prevent opening sections beyond the current step until the current step is completed
      if (idx > currentStep) {
        toast({
          title: "Step locked",
          description: "Please complete the current section before opening the next one.",
          variant: "destructive",
        });
        return prev;
      }

      // Open the requested section (single-section expanded for clarity)
      return [idx];
    });
  };

  useEffect(() => {
    setExpandedSections((prev) =>
      prev.includes(currentStep) ? prev : [currentStep],
    );
    if (currentStep >= 2) setShowMobileMenu(false);
  }, [currentStep]);

  const isFormValid = () => {
    if (!templateVersion) return false;
    const personalInfo: any = getPersonalInfoConfig();
    const checks: boolean[] = [];

    if (personalInfo.firstName) checks.push(isValidName(formData.firstName));
    if (personalInfo.lastName) checks.push(isValidName(formData.lastName));
    // Middle name is optional - only validate if it has content
    if (personalInfo.middleName && formData.middleName.trim()) {
      checks.push(isValidName(formData.middleName));
    }
    if (personalInfo.dateOfBirth) checks.push(isValidDOB(formData.dateOfBirth));
    if (personalInfo.email) {
      checks.push(isValidEmail(formData.email));
      // Skip email verification for development
      if (!BYPASS_OTP_FOR_DEVELOPMENT) {
        checks.push(isEmailVerified);
      }
    }
    if (personalInfo.phoneNumber) {
      checks.push(!!formData.countryCode);
      checks.push(
        isValidPhoneForCountry(formData.countryCode, formData.phoneNumber),
      );
      // Skip phone verification for development
      if (!BYPASS_OTP_FOR_DEVELOPMENT) {
        checks.push(isPhoneVerified);
      }
    }
    if (personalInfo.currentAddress) {
      checks.push(isValidAddress(formData.address));
      checks.push(!!formData.city);
      checks.push(isValidPostalCode(formData.postalCode));
    }
    if (personalInfo.permanentAddress) {
      checks.push(isValidAddress(formData.permanentAddress));
      checks.push(!!formData.permanentCity);
      checks.push(isValidPostalCode(formData.permanentPostalCode));
    }

    const personalOk = checks.length > 0 && checks.every(Boolean);

    const docsSection = templateVersion.sections.find(
      (s) => s.sectionType === "documents",
    );
    const biometricsSection = templateVersion.sections.find(
      (s) => s.sectionType === "biometrics",
    );
    const docsRequired = !!docsSection?.isActive;
    const bioRequired = !!biometricsSection?.isActive;

    return (
      personalOk &&
      (!docsRequired || isIdentityDocumentCompleted) &&
      (!bioRequired || isSelfieCompleted)
    );
  };

  const getMissingFields = () => {
    if (!templateVersion) return ["Template data not loaded"];

    const personalInfo: any = getPersonalInfoConfig();
    const missing: string[] = [];

    // Check personal information fields
    if (personalInfo.firstName && !isValidName(formData.firstName)) {
      missing.push("First Name");
    }
    if (personalInfo.lastName && !isValidName(formData.lastName)) {
      missing.push("Last Name");
    }
    // Middle name is optional - only validate if it has content
    if (
      personalInfo.middleName &&
      formData.middleName.trim() &&
      !isValidName(formData.middleName)
    ) {
      missing.push("Middle Name");
    }
    if (personalInfo.dateOfBirth && !isValidDOB(formData.dateOfBirth)) {
      missing.push("Date of Birth");
    }
    if (personalInfo.email) {
      if (!isValidEmail(formData.email)) {
        missing.push("Valid Email");
      } else if (!isEmailVerified && !BYPASS_OTP_FOR_DEVELOPMENT) {
        missing.push("Email Verification (OTP)");
      }
    }
    if (personalInfo.phoneNumber) {
      if (!formData.countryCode) {
        missing.push("Country Code");
      } else if (
        !isValidPhoneForCountry(formData.countryCode, formData.phoneNumber)
      ) {
        missing.push("Valid Phone Number");
      } else if (!isPhoneVerified && !BYPASS_OTP_FOR_DEVELOPMENT) {
        missing.push("Phone Verification (OTP)");
      }
    }
    if (personalInfo.currentAddress) {
      if (!isValidAddress(formData.address)) {
        missing.push("Current Address");
      }
      if (!formData.city) {
        missing.push("Current City");
      }
      if (!isValidPostalCode(formData.postalCode)) {
        missing.push("Current Postal Code");
      }
    }
    if (personalInfo.permanentAddress) {
      if (!isValidAddress(formData.permanentAddress)) {
        missing.push("Permanent Address");
      }
      if (!formData.permanentCity) {
        missing.push("Permanent City");
      }
      if (!isValidPostalCode(formData.permanentPostalCode)) {
        missing.push("Permanent Postal Code");
      }
    }

    // Check document verification
    const docsSection = templateVersion.sections.find(
      (s) => s.sectionType === "documents",
    );
    if (docsSection?.isActive && !isIdentityDocumentCompleted) {
      missing.push("Document Verification");
    }

    // Check biometric verification
    const biometricsSection = templateVersion.sections.find(
      (s) => s.sectionType === "biometrics",
    );
    if (biometricsSection?.isActive && !isSelfieCompleted) {
      missing.push("Selfie Verification");
    }

    return missing;
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

  // active sections by order
  const activeSections = (templateVersion?.sections || [])
    .filter((s) => s.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  if (!templateVersion || activeSections.length === 0) {
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
                      onIdentityDocumentComplete={
                        handleIdentityDocumentComplete
                      }
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

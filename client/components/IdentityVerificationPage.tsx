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
import { truncate } from "fs";

// ---- single source of truth for API base ----
const API_BASE =
  import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || "";

// 🚀 DEVELOPMENT FLAG - Set to false to enable OTP verification
const BYPASS_OTP_FOR_DEVELOPMENT = true;

// token helper (kept minimal)
const getToken = () =>
  (typeof window !== "undefined" && localStorage.getItem("access")) || null;

interface IdentityVerificationPageProps {
  // NOTE: despite the name, we call /TemplateVersion/{id} so this is a VERSION id
  templateId: number;
  userId: number | null;
  shortCode: string; // Add shortCode for QR generation
}

export function IdentityVerificationPage({
  templateId,
  userId,
  shortCode,
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
  // Track which section is expanded (only one at a time)
  const [expandedSectionIndex, setExpandedSectionIndex] = useState<number>(1);
  // Track completed state for each section
  const [completedSections, setCompletedSections] = useState<Record<number, boolean>>({});

  // OTP dialog + state
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [otpType, setOtpType] = useState<"email" | "phone">("email");
  const [pendingVerification, setPendingVerification] = useState<{
    type: "email" | "phone";
    recipient: string;
    otpId?: number;
    expiresAt?: string;
  } | null>(null);

  const [otpSending, setOtpSending] = useState(false);
  const [otpValidating, setOtpValidating] = useState(false);

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [submissionId, setSubmissionId] = useState<number | null>(null);

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

  // Document form state - lift up to preserve across section toggles
  const [documentFormState, setDocumentFormState] = useState({
    country: "",
    selectedDocument: "",
    uploadedDocuments: [] as string[],
    uploadedFiles: [] as Array<{id: string, name: string, size: string, type: string}>,
    documentUploadIds: {} as Record<string, { front?: number; back?: number }>,
  });

  // Biometric form state - lift up to preserve across section toggles  
  const [biometricFormState, setBiometricFormState] = useState({
    capturedImage: null as string | null,
    isImageCaptured: false,
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

  // ---- create UserTemplateSubmission early to get submissionId ----
  const createUserTemplateSubmission = async () => {
    if (!templateVersion || !userId || submissionId) return; // Don't create if already exists
    
    try {
      // First, check if a UserTemplateSubmission already exists
      const checkResponse = await fetch(
        `${API_BASE}/api/UserTemplateSubmissions?TemplateVersionId=${templateVersion.versionId}&UserId=${userId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        
        // If existing submission found, use its ID
        if (checkData.items && checkData.items.length > 0) {
          const existingSubmission = checkData.items[0]; // Use the first (most recent) submission
          setSubmissionId(existingSubmission.id);
          console.log("Found existing UserTemplateSubmission with ID:", existingSubmission.id);
          return; // Exit early, don't create a new one
        }
      }

      // If no existing submission found, create a new one
      console.log("No existing submission found, creating new UserTemplateSubmission...");
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
      setSubmissionId(submissionData.id);
      console.log("Created new UserTemplateSubmission with ID:", submissionData.id);
    } catch (error) {
      console.error("Error with UserTemplateSubmission:", error);
      toast({
        title: "Initialization Error",
        description: "Failed to initialize form submission. Please refresh and try again.",
        variant: "destructive",
      });
    }
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

  // ---- create UserTemplateSubmission when template and userId are available ----
  useEffect(() => {
    if (templateVersion && userId && !submissionId) {
      createUserTemplateSubmission();
    }
  }, [templateVersion, userId, submissionId]);

  // Helper: POST section data
  const postSectionData = async (section: any) => {
    if (!templateVersion || !userId || !submissionId) return;
    let fieldValue = "";
    if (section.sectionType === "personalInformation") {
      const personalInfo = getPersonalInfoConfig();
      const mappedData: any = {};
      if (personalInfo.firstName) mappedData.firstName = formData.firstName;
      if (personalInfo.lastName) mappedData.lastName = formData.lastName;
      if (personalInfo.middleName) mappedData.middleName = formData.middleName;
      if (personalInfo.dateOfBirth) mappedData.dateOfBirth = formData.dateOfBirth;
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
      fieldValue = JSON.stringify({
        documentsUploaded: isIdentityDocumentCompleted,
        completedAt: new Date().toISOString(),
      });
    } else if (section.sectionType === "biometrics") {
      fieldValue = JSON.stringify({
        selfieUploaded: isSelfieCompleted,
        completedAt: new Date().toISOString(),
      });
    }
    try {
      await fetch(
        `${API_BASE}/api/${submissionId}/${section.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
          body: JSON.stringify({ fieldValue }),
        }
      );
      console.log(`Posted section data for ${section.sectionType}`);
    } catch (err) {
      console.error("Failed to POST section data", err);
    }
  };

  // Mark section as filled when completed and send POST
  const handleSectionComplete = async (sectionIndex: number, section: any) => {
    setCompletedSections((prev) => ({ ...prev, [sectionIndex]: true }));
    await postSectionData(section);
    
    // Provide specific feedback based on section type
    if (section.sectionType === "personalInformation") {
      toast({ 
        title: "✅ Personal Information Completed", 
        description: "Your personal information has been saved. You can now proceed to Document Verification.",
        duration: 3000,
      });
      
      // Move to document section after personal info completion
      setTimeout(() => {
        setCurrentStep(2);
        setExpandedSectionIndex(2);
        toast({
          title: "📄 Document Verification",
          description: "Please upload the required identity documents to continue.",
          duration: 4000,
        });
      }, 2000);
    } else {
      toast({ 
        title: "✅ Section Completed", 
        description: "This section has been successfully completed.",
        duration: 3000,
      });
    }
    
    // Don't auto-collapse - let the step advancement logic handle UI transitions
  };

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

  // ---- PHONE OTP API calls ----
  async function startPhoneOtp(
    phoneCountryCode: string,
    phoneNationalNumber: string,
    versionId: number,
    channel = "whatsapp",
    purpose = "phoneVerification"
  ) {
    const token = getToken();
    const res = await fetch(`${API_BASE}/api/Otp/phone/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        phoneCountryCode,
        phoneNationalNumber,
        channel,
        purpose,
        versionId,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Failed to start phone OTP (HTTP ${res.status})`);
    }

    // { success: true, otpId: number, expiresAt: string }
    return res.json() as Promise<{ success: boolean; otpId: number; expiresAt: string }>;
  }

  async function verifyPhoneOtp(otpId: number, code: string) {
    const token = getToken();
    const res = await fetch(`${API_BASE}/api/Otp/phone/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ otpId, code: String(code).trim() }),
    });

    // read body as text first (API may respond text/plain)
    const bodyText = await res.text().catch(() => "");
    let json: any = null;
    try { json = bodyText ? JSON.parse(bodyText) : null; } catch {}

    // Throw on HTTP error OR success:false
    if (!res.ok || (json && json.success === false)) {
      const msg = (json?.message || bodyText || `Invalid OTP (HTTP ${res.status})`).toString();
      throw new Error(msg);
    }

    // treat missing payload as success only if HTTP was 2xx
    return (json ?? { success: true }) as { success: boolean };
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

  // Auto-mark sections as completed when valid
  useEffect(() => {
    const sections = activeSections;
    
    // Auto-mark personal information section as completed when valid
    const ok = isStep1Complete();
    if (ok && !completedSections[1] && sections[0]) {
      // Mark section 1 as completed when form is valid
      setCompletedSections((prev) => ({ ...prev, 1: true }));
      // Post section data immediately
      postSectionData(sections[0]);
    }
    
    // Don't auto-mark other sections - let them be marked when user explicitly completes them
    
    // advance to step 2 when step 1 complete
    if (currentStep === 1 && ok && !hasShownStep1Toast) {
      toast({
        title: "Step 1 completed",
        description: "Step 1 completed. Please proceed to the next step",
      });
      setHasShownStep1Toast(true);
      setTimeout(() => {
        setCurrentStep(2);
        setExpandedSectionIndex(2);
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
    isIdentityDocumentCompleted,
    isSelfieCompleted,
    currentStep,
    hasShownStep1Toast,
    completedSections,
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
        setExpandedSectionIndex(3);
        setShowMobileMenu(false);
      }, 1500);
    }
  }, [currentStep, isIdentityDocumentCompleted, hasShownStep2Toast, toast]);

  // Determine current step dynamically based on section order and completion state
  useEffect(() => {
    const sections = (templateVersion?.sections || [])
      .filter((s) => s.isActive)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    if (sections.length === 0) return;

    const isSectionComplete = (type: string) => {
      if (type === "personalInformation") return isStep1Complete();
      if (type === "documents") return isIdentityDocumentCompleted;
      if (type === "biometrics") return isSelfieCompleted;
      return true;
    };

    const firstIncompleteIdx = sections.findIndex(
      (s) => !isSectionComplete(s.sectionType as string),
    );
    const nextStep =
      firstIncompleteIdx === -1 ? sections.length : firstIncompleteIdx + 1;

    if (nextStep !== currentStep) {
      setCurrentStep(nextStep);
      setExpandedSectionIndex(nextStep);
      setShowMobileMenu(false);
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
    isIdentityDocumentCompleted,
    isSelfieCompleted,
  ]);

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

  const handleSendPhoneOTP = async () => {
    const versionId = getActiveVersionId();
    if (versionId == null) {
      toast({ title: "Missing version", description: "No active template version found." });
      return;
    }

    const cc = (formData.countryCode || "").trim(); // keep as provided (e.g. +91 or 91)
    const nn = (formData.phoneNumber || "").replace(/\D+/g, ""); // national digits only

    if (!cc || !nn || !isValidPhoneForCountry(formData.countryCode, formData.phoneNumber)) {
      toast({ title: "Invalid phone", description: "Please enter a valid phone number first." });
      return;
    }

    try {
      setOtpSending(true);
      const { success, otpId, expiresAt } = await startPhoneOtp(cc, nn, versionId,
        "whatsapp", "phoneVerification");
      if (!success) throw new Error("Failed to start phone OTP.");

      setPendingVerification({
        type: "phone",
        recipient: `${cc} ${formData.phoneNumber}`,
        otpId,
        expiresAt,
      });
      setOtpType("phone");
      setShowOTPDialog(true);
      toast({ title: "OTP sent", description: `An OTP was sent to ${cc} ${formData.phoneNumber}.` });
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
        // PHONE verify via backend
        const code = String(otp || "").trim();
        if (code.length < 4) {
          toast({ title: "Invalid OTP", description: "Please enter a valid OTP.", variant: "destructive" });
          return;
        }
        if (!pendingVerification.otpId) {
          toast({ title: "Missing OTP", description: "No OTP session found. Please resend the code.", variant: "destructive" });
          return;
        }

        try {
          setOtpValidating(true);
          const { success } = await verifyPhoneOtp(pendingVerification.otpId, code);
          if (!success) throw new Error("Invalid or expired code.");

          setIsPhoneVerified(true);
          toast({ title: "Phone verified", description: "Your phone number was successfully verified." });
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
      }
  };

  const handleOTPResend = async () => {
    const versionId = getActiveVersionId();

    if (pendingVerification?.type === "email") {
      const email = formData.email?.trim();
      if (!email || versionId == null) return;
      try {
        setOtpSending(true);
        await generateEmailOtp(email, versionId);
        toast({ title: "OTP resent", description: `A new OTP was sent to ${email}.` });
      } catch (err: any) {
        toast({ title: "Failed to resend", description: err?.message || "Please try again.", variant: "destructive" });
      } finally {
        setOtpSending(false);
      }
    }

    if (pendingVerification?.type === "phone") {
      if (versionId == null) return;
      const cc = (formData.countryCode || "").trim();
      const nn = (formData.phoneNumber || "").replace(/\D+/g, "");
      if (!cc || !nn) return;

      try {
        setOtpSending(true);
        const { success, otpId, expiresAt } = await startPhoneOtp(cc, nn, versionId, "whatsapp", "phoneVerification");
        if (!success) throw new Error("Failed to start phone OTP.");
        setPendingVerification((pv) =>
          pv ? { ...pv, otpId, expiresAt } : { type: "phone", recipient: `${cc} ${formData.phoneNumber}`, otpId, expiresAt }
        );
        toast({ title: "OTP resent", description: `A new OTP was sent to ${cc} ${formData.phoneNumber}.` });
      } catch (err: any) {
        toast({ title: "Failed to resend", description: err?.message || "Please try again.", variant: "destructive" });
      } finally {
        setOtpSending(false);
      }
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

  const handleSelfieComplete = () => {
    setIsSelfieCompleted(true);
    
    // Mark section 3 as completed
    setCompletedSections((prev) => ({ ...prev, 3: true }));
    
    // Post section data immediately
    const biometricsSection = activeSections.find(s => s.sectionType === "biometrics");
    if (biometricsSection) {
      postSectionData(biometricsSection);
    }
    
    toast({
      title: "🎉 Verification Complete!",
      description: "All sections have been completed successfully. Your identity verification is now complete.",
      duration: 5000,
    });
    
    // Optional: Navigate to success page after completion
    setTimeout(() => {
      // You can add navigation to success page here if needed
      console.log("Identity verification process completed successfully");
    }, 2000);
  };

  const handleIdentityDocumentComplete = () => {
    setIsIdentityDocumentCompleted(true);
    
    // Mark section 2 as completed
    setCompletedSections((prev) => ({ ...prev, 2: true }));
    
    // Post section data immediately
    const documentsSection = activeSections.find(s => s.sectionType === "documents");
    if (documentsSection) {
      postSectionData(documentsSection);
    }
    
    if (!hasShownStep2Toast) {
      toast({
        title: "✅ Document Verification Completed",
        description: "Your documents have been successfully uploaded and verified. Moving to Biometric Verification...",
        duration: 3000,
      });
      setHasShownStep2Toast(true);
    }
    
    // Move to next step after a delay to show completion
    setTimeout(() => {
      setCurrentStep(3);
      setExpandedSectionIndex(3);
      setShowMobileMenu(false);
      
      // Show transition toast
      toast({
        title: "📸 Biometric Verification",
        description: "Please complete the biometric verification to finish the identity verification process.",
        duration: 4000,
      });
    }, 2000);
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

    if (!userId || !templateVersion || !submissionId) {
      toast({
        title: "Missing Information",
        description:
          "User ID, template version, or submission ID not found. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Submitting Form",
        description: "Please wait while we submit your information...",
      });

      // Submit form data for each section (UserTemplateSubmission already created)
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

  // Toggle section: expand/collapse, send POST if closing a filled section
  const toggleSection = async (idx: number) => {
    if (idx > currentStep) {
      toast({
        title: "Step locked",
        description:
          "You can only access unlocked steps. Complete the current step to continue.",
        variant: "destructive",
      });
      return;
    }
    if (expandedSectionIndex === idx) {
      // Collapse section, send POST if filled
      if (completedSections[idx]) {
        const section = activeSections[idx - 1];
        if (section) await postSectionData(section);
      }
      setExpandedSectionIndex(-1);
    } else {
      // If previous section was expanded and filled, send POST before switching
      if (expandedSectionIndex > 0 && completedSections[expandedSectionIndex]) {
        const prevSection = activeSections[expandedSectionIndex - 1];
        if (prevSection) await postSectionData(prevSection);
      }
      setExpandedSectionIndex(idx);
    }
  };

  useEffect(() => {
    setExpandedSectionIndex(currentStep);
    if (currentStep >= 2) setShowMobileMenu(false);
  }, [currentStep]);

  // active sections by order
  const activeSections = (templateVersion?.sections || [])
    .filter((s) => s.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex);

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
                    isExpanded={expandedSectionIndex === index + 1}
                    onToggle={toggleSection}
                    formData={formData}
                    setFormData={setFormData}
                    isEmailVerified={isEmailVerified}
                    isPhoneVerified={isPhoneVerified}
                    onSendEmailOTP={handleSendEmailOTP}
                    onSendPhoneOTP={handleSendPhoneOTP}
                    onIdentityDocumentComplete={handleIdentityDocumentComplete}
                    onSelfieComplete={handleSelfieComplete}
                    submissionId={submissionId}
                    shortCode={shortCode}
                    templateVersionId={templateVersion?.versionId}
                    userId={userId}
                    isFilled={!!completedSections[index + 1]}
                    documentFormState={documentFormState}
                    setDocumentFormState={setDocumentFormState}
                    biometricFormState={biometricFormState}
                    setBiometricFormState={setBiometricFormState}
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
                      onSelfieComplete={handleSelfieComplete}
                      submissionId={submissionId}
                      shortCode={shortCode}
                      templateVersionId={templateVersion?.versionId}
                      userId={userId}
                      isFilled={!!completedSections[index + 1]}
                      isExpanded={expandedSectionIndex === index + 1}
                      onToggle={toggleSection}
                      documentFormState={documentFormState}
                      setDocumentFormState={setDocumentFormState}
                      biometricFormState={biometricFormState}
                      setBiometricFormState={setBiometricFormState}
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

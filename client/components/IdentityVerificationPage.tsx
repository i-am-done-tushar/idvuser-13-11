import { useState, useEffect, useMemo } from "react";
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
const API_BASE = "https://idvapi-test.arconnet.com:1019";
  // import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || "";

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
  const [hasShownWelcomeBackToast, setHasShownWelcomeBackToast] = useState(false);
  const [isSelfieCompleted, setIsSelfieCompleted] = useState(false);

  const [showConsentDialog, setShowConsentDialog] = useState(true);
  const [hasConsented, setHasConsented] = useState(false);
  const [showHowItWorksDialog, setShowHowItWorksDialog] = useState(false);
  // Track which sections are expanded (can have multiple expanded at once)
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({ 1: true });
  // Track completed state for each section
  const [completedSections, setCompletedSections] = useState<Record<number, boolean>>({});
  // Track the currently active/focused section for auto-save
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(1);

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
    uploadedDocuments: [] as string[], // List of document names uploaded (e.g., ["Passport", "Driver's License"])
    uploadedFiles: [] as Array<{id: string, name: string, size: string, type: string}>,
    documentUploadIds: {} as Record<string, { front?: number; back?: number }>, // Maps document name to file IDs
    // New: Detailed document tracking for backend storage
    documentsDetails: [] as Array<{
      documentName: string; // e.g., "Passport"
      documentDefinitionId: number; // From API config
      frontFileId: number;
      backFileId?: number; // Optional for single-sided documents
      status: "uploaded" | "pending";
      uploadedAt: string; // ISO timestamp
    }>,
  });

  // Wrap setDocumentFormState to add logging
  const setDocumentFormStateWithLogging = (newState: any) => {
    console.log('🔧 Parent setDocumentFormState called with:', newState);
    console.log('🔧 Previous documentFormState:', documentFormState);
    setDocumentFormState(newState);
    console.log('🔧 After setState, new documentFormState should be:', newState);
  };

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

  // ---- fetch and populate submission values if submissionId exists ----
  useEffect(() => {
    if (!submissionId || !templateVersion) return;

    const fetchSubmissionValues = async () => {
      try {
        console.log("Fetching submission values for submissionId:", submissionId);
        const response = await fetch(
          `${API_BASE}/api/submissions/${submissionId}/values`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          console.error("Failed to fetch submission values:", response.status);
          return;
        }

        const submissionValues = await response.json();
        console.log("Fetched submission values:", submissionValues);

        // Track which sections are completed based on API response
        const completedSectionIds = new Set<number>();
        
        // Parse and populate each section's data
        submissionValues.forEach((submission: any) => {
          const section = templateVersion.sections.find(
            (s) => s.id === submission.templateSectionId,
          );

          if (!section) return;

          // Mark this section as completed (data exists in backend)
          completedSectionIds.add(submission.templateSectionId);

          try {
            const parsedValue = JSON.parse(submission.fieldValue);

            // Populate personal information section
            if (section.sectionType === "personalInformation") {
              setFormData((prev) => ({
                ...prev,
                firstName: parsedValue.firstName || prev.firstName,
                lastName: parsedValue.lastName || prev.lastName,
                middleName: parsedValue.middleName || prev.middleName,
                dateOfBirth: parsedValue.dateOfBirth || prev.dateOfBirth,
                email: parsedValue.email || prev.email,
                countryCode: parsedValue.countryCode || prev.countryCode,
                phoneNumber: parsedValue.phoneNumber || prev.phoneNumber,
                gender: parsedValue.gender || prev.gender,
                address: parsedValue.address || prev.address,
                city: parsedValue.city || prev.city,
                postalCode: parsedValue.postalCode || prev.postalCode,
                permanentAddress: parsedValue.permanentAddress || prev.permanentAddress,
                permanentCity: parsedValue.permanentCity || prev.permanentCity,
                permanentPostalCode: parsedValue.permanentPostalCode || prev.permanentPostalCode,
              }));
              console.log("✅ Populated personal information from submission");
            }

            // Populate document section
            if (section.sectionType === "documents" && parsedValue) {
              // New structure: { country, documents: [...] }
              const documentsArray = parsedValue.documents || [];
              
              // Extract document names and rebuild documentUploadIds for UI compatibility
              const uploadedDocIds: string[] = [];
              const rebuiltDocumentUploadIds: Record<string, { front?: number; back?: number }> = {};
              
              documentsArray.forEach((doc: any) => {
                const docName = doc.documentName;
                
                // Convert document name to docId format (lowercase with underscores)
                const docId = docName.toLowerCase().replace(/\s+/g, "_");
                uploadedDocIds.push(docId);
                
                // Rebuild documentUploadIds map for file downloads
                rebuiltDocumentUploadIds[docId] = {
                  front: doc.frontFileId,
                  ...(doc.backFileId && { back: doc.backFileId }),
                };
              });
              
              setDocumentFormState((prev) => ({
                ...prev,
                country: parsedValue.country || prev.country,
                // Populate uploadedDocuments with docIds (matches the format used during upload)
                uploadedDocuments: uploadedDocIds,
                // Rebuild documentUploadIds for download functionality
                documentUploadIds: rebuiltDocumentUploadIds,
                // Restore detailed document information from the new structure
                documentsDetails: documentsArray,
              }));
              
              // Mark document section as completed if any documents exist
              if (documentsArray.length > 0) {
                setIsIdentityDocumentCompleted(true);
              }
              
              console.log("✅ Populated document information from submission");
              console.log("📄 Restored country:", parsedValue.country);
              console.log("📄 Restored uploadedDocuments (docIds):", uploadedDocIds);
              console.log("📄 Restored documentUploadIds:", rebuiltDocumentUploadIds);
              console.log("📄 Restored documentsDetails:", documentsArray);
              console.log(`📊 Total documents uploaded: ${documentsArray.length}`);
            }

            // Populate biometric section
            if (section.sectionType === "biometrics" && parsedValue) {
              setBiometricFormState((prev) => ({
                ...prev,
                capturedImage: parsedValue.capturedImage || prev.capturedImage,
                isImageCaptured: parsedValue.isImageCaptured || prev.isImageCaptured,
              }));
              
              // Mark biometric section as completed
              if (parsedValue.isImageCaptured) {
                setIsSelfieCompleted(true);
              }
              console.log("✅ Populated biometric information from submission");
            }
          } catch (parseError) {
            console.error("Error parsing fieldValue for section:", section.sectionType, parseError);
          }
        });

        // Update completedSections state based on which sections have data
        const sections = templateVersion.sections
          .filter((s) => s.isActive)
          .sort((a, b) => a.orderIndex - b.orderIndex);
        
        const newCompletedSections: Record<number, boolean> = {};
        
        sections.forEach((section, index) => {
          const sectionIndex = index + 1; // 1-based indexing
          
          // Check if this section's ID exists in the API response
          if (completedSectionIds.has(section.id)) {
            newCompletedSections[sectionIndex] = true;
            console.log(`✅ Section ${sectionIndex} (${section.name}) marked as completed`);
          } else {
            console.log(`⏳ Section ${sectionIndex} (${section.name}) not yet completed`);
          }
        });
        
        // Set all completed sections at once
        setCompletedSections(newCompletedSections);
        
        // Log summary
        const completedCount = Object.values(newCompletedSections).filter(Boolean).length;
        console.log(`📊 Summary: ${completedCount}/${sections.length} sections completed`);
        
      } catch (error) {
        console.error("Error fetching submission values:", error);
      }
    };

    fetchSubmissionValues();
  }, [submissionId, templateVersion]);

  // Show welcome-back toast for already-completed sections on page load
  useEffect(() => {
    if (!templateVersion || Object.keys(completedSections).length === 0) return;
    if (hasShownWelcomeBackToast) return; // Prevent showing multiple times
    
    // Only run once when completedSections is first populated
    const hasAnyCompletedSections = Object.values(completedSections).some(Boolean);
    if (!hasAnyCompletedSections) return;
    
    const sections = templateVersion.sections
      .filter((s) => s.isActive)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    
    const completedSectionNames: string[] = [];
    let firstIncompleteSection: number | null = null;
    const sectionsToExpand: Record<number, boolean> = {};
    
    sections.forEach((section, index) => {
      const sectionIndex = index + 1;
      if (completedSections[sectionIndex]) {
        completedSectionNames.push(section.name);
        // Expand all completed sections
        sectionsToExpand[sectionIndex] = true;
      } else if (firstIncompleteSection === null) {
        // Track the first incomplete section
        firstIncompleteSection = sectionIndex;
        // Also expand the first incomplete section
        sectionsToExpand[sectionIndex] = true;
      }
    });
    
    if (completedSectionNames.length > 0) {
      const completedCount = completedSectionNames.length;
      const totalCount = sections.length;
      
      // Navigate to the first incomplete section (or last section if all complete)
      const targetSection = firstIncompleteSection || sections.length;
      
      console.log(`🎯 Navigating to section ${targetSection} (first incomplete section)`);
      setCurrentStep(targetSection);
      // Expand all completed sections plus the first incomplete one
      setExpandedSections(sectionsToExpand);
      
      // Show a single summary toast
      setTimeout(() => {
        const nextSectionName = firstIncompleteSection 
          ? sections[firstIncompleteSection - 1]?.name 
          : null;
        
        toast({
          title: "🎉 Welcome Back!",
          description: `You've already completed ${completedCount}/${totalCount} section${completedCount > 1 ? 's' : ''}: ${completedSectionNames.join(', ')}${
            nextSectionName ? `. Continue with ${nextSectionName}.` : ''
          }`,
          duration: 6000,
        });
        setHasShownWelcomeBackToast(true); // Mark as shown
      }, 500); // Small delay to ensure page has loaded
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedSections, templateVersion, hasShownWelcomeBackToast]); // Only run when completedSections is populated

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
      // Build clean document data structure
      const documentData = {
        country: documentFormState.country,
        documents: documentFormState.documentsDetails,
      };
      
      fieldValue = JSON.stringify(documentData);
      console.log("📤 Posting document section data:", documentData);
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

  // Helper: Check if a section has any data entered (partial or complete)
  const sectionHasData = (sectionIndex: number) => {
    const sections = (templateVersion?.sections || [])
      .filter((s) => s.isActive)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    const section = sections[sectionIndex - 1];
    
    if (!section) return false;

    if (section.sectionType === "personalInformation") {
      // Check if any personal info field has data
      return !!(
        formData.firstName ||
        formData.lastName ||
        formData.middleName ||
        formData.dateOfBirth ||
        formData.email ||
        formData.phoneNumber ||
        formData.gender ||
        formData.address ||
        formData.city ||
        formData.postalCode ||
        formData.permanentAddress ||
        formData.permanentCity ||
        formData.permanentPostalCode
      );
    } else if (section.sectionType === "documents") {
      return isIdentityDocumentCompleted;
    } else if (section.sectionType === "biometrics") {
      return isSelfieCompleted;
    }
    return false;
  };

  // Auto-save section data when user switches to a different section
  const handleSectionFocus = async (newSectionIndex: number) => {
    const sections = (templateVersion?.sections || [])
      .filter((s) => s.isActive)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    // If switching from one section to another and the previous section has data
    if (activeSectionIndex !== newSectionIndex && activeSectionIndex > 0) {
      const previousSection = sections[activeSectionIndex - 1];
      
      // Auto-save the previous section if it has any data
      if (previousSection && sectionHasData(activeSectionIndex)) {
        console.log(`Auto-saving section ${activeSectionIndex} data before switching to section ${newSectionIndex}`);
        await postSectionData(previousSection);
        
        // Show a subtle notification
        toast({
          title: "Progress Saved",
          description: `Your ${previousSection.name.toLowerCase()} data has been saved.`,
          duration: 2000,
        });
      }
    }

    // Update the active section
    setActiveSectionIndex(newSectionIndex);
  };

  // Mark section as filled when completed and send POST
  const handleSectionComplete = async (sectionIndex: number, section: any) => {
    setCompletedSections((prev) => ({ ...prev, [sectionIndex]: true }));
    await postSectionData(section);
    
    // Check if this is the last section
    const isLastSection = sectionIndex === activeSections.length;
    
    // Provide specific feedback based on section type
    if (section.sectionType === "personalInformation") {
      if (isLastSection) {
        toast({ 
          title: "🎉 Verification Complete!", 
          description: "All sections have been completed successfully. Your identity verification is now complete.",
          duration: 5000,
        });
      } else {
        toast({ 
          title: `✅ ${section.name || 'Personal Information'} Completed`, 
          description: "Your personal information has been saved. Moving to the next section...",
          duration: 3000,
        });
        
        // Move to next section after personal info completion
        setTimeout(() => {
          const nextSectionIndex = sectionIndex + 1;
          if (nextSectionIndex <= activeSections.length) {
            setCurrentStep(nextSectionIndex);
            // Keep previous sections expanded and expand the next section
            setExpandedSections(prev => ({ ...prev, [nextSectionIndex]: true }));
            const nextSection = activeSections[nextSectionIndex - 1];
            toast({
              title: `📋 ${nextSection?.name || 'Next Section'}`,
              description: `Please complete the ${nextSection?.name?.toLowerCase() || 'next section'}.`,
              duration: 4000,
            });
          }
        }, 2000);
      }
    } else {
      if (isLastSection) {
        toast({ 
          title: "🎉 Verification Complete!", 
          description: "All sections have been completed successfully. Your identity verification is now complete.",
          duration: 5000,
        });
      } else {
        toast({ 
          title: `✅ ${section.name || 'Section'} Completed`, 
          description: "This section has been successfully completed. Moving to the next section...",
          duration: 3000,
        });
        
        // Move to next section
        setTimeout(() => {
          const nextSectionIndex = sectionIndex + 1;
          if (nextSectionIndex <= activeSections.length) {
            setCurrentStep(nextSectionIndex);
            // Keep previous sections expanded and expand the next section
            setExpandedSections(prev => ({ ...prev, [nextSectionIndex]: true }));
            const nextSection = activeSections[nextSectionIndex - 1];
            toast({
              title: `📋 ${nextSection?.name || 'Next Section'}`,
              description: `Please complete the ${nextSection?.name?.toLowerCase() || 'next section'}.`,
              duration: 4000,
            });
          }
        }, 2000);
      }
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
    const requiredToggles = personalInfo?.requiredToggles || {};
    const checks: boolean[] = [];

    // Required fields - always validated
    if (personalInfo.firstName) checks.push(isValidName(formData.firstName));
    if (personalInfo.lastName) checks.push(isValidName(formData.lastName));
    
    // Conditionally required fields based on requiredToggles
    if (personalInfo.middleName) {
      if (requiredToggles.middleName) {
        checks.push(isValidName(formData.middleName));
      } else if (formData.middleName.trim()) {
        // If field is shown but not required, only validate if user entered something
        checks.push(isValidName(formData.middleName));
      }
    }
    
    if (personalInfo.dateOfBirth) {
      if (requiredToggles.dob) {
        checks.push(isValidDOB(formData.dateOfBirth));
      } else if (formData.dateOfBirth) {
        checks.push(isValidDOB(formData.dateOfBirth));
      }
    }
    
    if (personalInfo.email) {
      checks.push(isValidEmail(formData.email));
      checks.push(BYPASS_OTP_FOR_DEVELOPMENT || isEmailVerified); // 🚀 Bypass OTP in dev
    }
    
    if (personalInfo.phoneNumber) {
      if (requiredToggles.phoneNumber) {
        checks.push(!!formData.countryCode);
        checks.push(isValidPhoneForCountry(formData.countryCode, formData.phoneNumber));
        checks.push(BYPASS_OTP_FOR_DEVELOPMENT || isPhoneVerified); // 🚀 Bypass OTP in dev
      } else if (formData.phoneNumber) {
        // If phone is shown but not required, validate only if entered
        checks.push(!!formData.countryCode);
        checks.push(isValidPhoneForCountry(formData.countryCode, formData.phoneNumber));
        checks.push(BYPASS_OTP_FOR_DEVELOPMENT || isPhoneVerified);
      }
    }
    
    if (personalInfo.gender && requiredToggles.gender) {
      checks.push(!!formData.gender);
    }
    
    if (personalInfo.currentAddress) {
      // Check address line required toggle
      if (requiredToggles.currentAddress) {
        checks.push(isValidAddress(formData.address));
      } else if (formData.address) {
        checks.push(isValidAddress(formData.address));
      }
      
      // Check city required toggle
      if (requiredToggles.currentCity) {
        checks.push(!!formData.city && formData.city.trim().length >= 2);
      } else if (formData.city) {
        checks.push(formData.city.trim().length >= 2);
      }
      
      // Check postal code required toggle
      if (requiredToggles.currentPostal) {
        checks.push(isValidPostalCode(formData.postalCode));
      } else if (formData.postalCode) {
        checks.push(isValidPostalCode(formData.postalCode));
      }
    }
    
    if (personalInfo.permanentAddress) {
      // Check permanent address line required toggle
      if (requiredToggles.permanentAddress) {
        checks.push(isValidAddress(formData.permanentAddress));
      } else if (formData.permanentAddress) {
        checks.push(isValidAddress(formData.permanentAddress));
      }
      
      // Check permanent city required toggle
      if (requiredToggles.permanentCity) {
        checks.push(!!formData.permanentCity && formData.permanentCity.trim().length >= 2);
      } else if (formData.permanentCity) {
        checks.push(formData.permanentCity.trim().length >= 2);
      }
      
      // Check permanent postal code required toggle
      if (requiredToggles.permanentPostal) {
        checks.push(isValidPostalCode(formData.permanentPostalCode));
      } else if (formData.permanentPostalCode) {
        checks.push(isValidPostalCode(formData.permanentPostalCode));
      }
    }
    
    return checks.length > 0 && checks.every(Boolean);
  };

  // Auto-mark sections as completed when valid and auto-advance to next section
  useEffect(() => {
    const sections = (templateVersion?.sections || [])
      .filter((s) => s.isActive)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    
    // Auto-mark personal information section as completed when valid
    const ok = isStep1Complete();
    if (ok && !completedSections[1] && sections[0]) {
      // Mark section 1 as completed when form is valid
      setCompletedSections((prev) => ({ ...prev, 1: true }));
      // Post section data immediately
      postSectionData(sections[0]);
      
      // Show completion toast and auto-advance to next section
      if (currentStep === 1 && !hasShownStep1Toast) {
        const nextSection = sections[1];
        const isLastSection = sections.length === 1;
        
        if (isLastSection) {
          toast({
            title: "🎉 Verification Complete!",
            description: "All sections have been completed successfully.",
            duration: 5000,
          });
        } else {
          toast({
            title: `✅ ${sections[0]?.name || 'Personal Information'} Completed`,
            description: "Your personal information has been saved. Opening next section...",
            duration: 3000,
          });
          
          setHasShownStep1Toast(true);
          
          // Auto-advance to next section after a short delay
          setTimeout(() => {
            setCurrentStep(2);
            // Keep previous section expanded and also expand the next section
            setExpandedSections(prev => ({ ...prev, 2: true }));
            
            // Show next section toast
            if (nextSection) {
              toast({
                title: `📋 ${nextSection.name}`,
                description: `Please complete the ${nextSection.name.toLowerCase()}.`,
                duration: 4000,
              });
            }
          }, 2000);
        }
      }
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
    const sections = (templateVersion?.sections || [])
      .filter((s) => s.isActive)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    
    if (currentStep === 2 && isIdentityDocumentCompleted && !hasShownStep2Toast) {
      // Mark section 2 as completed
      if (!completedSections[2] && sections[1]) {
        setCompletedSections((prev) => ({ ...prev, 2: true }));
        postSectionData(sections[1]);
      }
      
      const nextSection = sections[2];
      const isLastSection = sections.length === 2;
      
      if (isLastSection) {
        toast({
          title: "🎉 Verification Complete!",
          description: "All sections have been completed successfully.",
          duration: 5000,
        });
      } else {
        toast({
          title: `✅ ${sections[1]?.name || 'Document Verification'} Completed`,
          description: "Your documents have been uploaded. Opening next section...",
          duration: 3000,
        });
        
        setHasShownStep2Toast(true);
        
        // Auto-advance to next section
        setTimeout(() => {
          setCurrentStep(3);
          // Keep previous sections expanded and also expand the next section
          setExpandedSections(prev => ({ ...prev, 3: true }));
          setShowMobileMenu(false);
          
          // Show next section toast
          if (nextSection) {
            toast({
              title: `📋 ${nextSection.name}`,
              description: `Please complete the ${nextSection.name.toLowerCase()}.`,
              duration: 4000,
            });
          }
        }, 2000);
      }
    }
  }, [templateVersion, currentStep, isIdentityDocumentCompleted, hasShownStep2Toast, completedSections, toast]);

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
      // Expand the current step section
      setExpandedSections(prev => ({ ...prev, [nextStep]: true }));
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
    if (BYPASS_OTP_FOR_DEVELOPMENT) {
      setIsEmailVerified(true);
      toast({ title: "Email verified (dev bypass)", description: "OTP skipped in development." });
      return;
    }

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
    if (BYPASS_OTP_FOR_DEVELOPMENT) {
      setIsPhoneVerified(true);
      toast({ title: "Phone verified (dev bypass)", description: "OTP skipped in development." });
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
    
    // Find the biometric section and its index dynamically
    const biometricsSection = activeSections.find(s => s.sectionType === "biometrics");
    const biometricsSectionIndex = activeSections.findIndex(s => s.sectionType === "biometrics") + 1;
    
    // Mark the correct section as completed
    setCompletedSections((prev) => ({ ...prev, [biometricsSectionIndex]: true }));
    
    // Post section data immediately
    if (biometricsSection) {
      postSectionData(biometricsSection);
    }
    
    // Check if this is the last section
    const isLastSection = biometricsSectionIndex === activeSections.length;
    
    if (isLastSection) {
      toast({
        title: "🎉 Verification Complete!",
        description: "All sections have been completed successfully. Your identity verification is now complete.",
        duration: 5000,
      });
    } else {
      toast({
        title: `✅ ${biometricsSection?.name || 'Biometric Verification'} Completed`,
        description: "Biometric verification completed successfully. Please continue to the next section.",
        duration: 3000,
      });
      
      // Move to next section if not the last
      setTimeout(() => {
        const nextSectionIndex = biometricsSectionIndex + 1;
        if (nextSectionIndex <= activeSections.length) {
          setCurrentStep(nextSectionIndex);
          // Keep previous sections expanded and expand the next section
          setExpandedSections(prev => ({ ...prev, [nextSectionIndex]: true }));
          const nextSection = activeSections[nextSectionIndex - 1];
          toast({
            title: `📋 ${nextSection?.name || 'Next Section'}`,
            description: `Please complete the ${nextSection?.name?.toLowerCase() || 'next section'}.`,
            duration: 4000,
          });
        }
      }, 2000);
    }
    
    // Optional: Navigate to success page after completion if it's the last section
    if (isLastSection) {
      setTimeout(() => {
        console.log("Identity verification process completed successfully");
      }, 2000);
    }
  };

  // Callback to auto-save document section data after each document upload
  const handleDocumentUploaded = async () => {
    console.log('📤 Document state changed, triggering auto-save...');
    const documentsSection = activeSections.find(s => s.sectionType === "documents");
    if (documentsSection) {
      console.log('📋 Current documents state:', {
        uploadedDocuments: documentFormState.uploadedDocuments,
        documentsDetails: documentFormState.documentsDetails,
      });
      await postSectionData(documentsSection);
      console.log('✅ Document section auto-saved successfully');
    }
  };

  const handleIdentityDocumentComplete = () => {
    setIsIdentityDocumentCompleted(true);
    
    // Find the documents section and its index dynamically
    const documentsSection = activeSections.find(s => s.sectionType === "documents");
    const documentsSectionIndex = activeSections.findIndex(s => s.sectionType === "documents") + 1;
    
    // Mark the correct section as completed
    setCompletedSections((prev) => ({ ...prev, [documentsSectionIndex]: true }));
    
    // Post section data immediately
    if (documentsSection) {
      postSectionData(documentsSection);
    }
    
    // Check if this is the last section
    const isLastSection = documentsSectionIndex === activeSections.length;
    
    if (!hasShownStep2Toast) {
      if (isLastSection) {
        toast({
          title: "🎉 Verification Complete!",
          description: "All sections have been completed successfully. Your identity verification is now complete.",
          duration: 5000,
        });
      } else {
        toast({
          title: `✅ ${documentsSection?.name || 'Document Verification'} Completed`,
          description: "Your documents have been successfully uploaded and verified. Moving to the next section...",
          duration: 3000,
        });
      }
      setHasShownStep2Toast(true);
    }
    
    // Move to next step if not the last section
    if (!isLastSection) {
      setTimeout(() => {
        const nextSectionIndex = documentsSectionIndex + 1;
        if (nextSectionIndex <= activeSections.length) {
          setCurrentStep(nextSectionIndex);
          // Keep previous sections expanded and expand the next section
          setExpandedSections(prev => ({ ...prev, [nextSectionIndex]: true }));
          const nextSection = activeSections[nextSectionIndex - 1];
          toast({
            title: `📋 ${nextSection?.name || 'Next Section'}`,
            description: `Please complete the ${nextSection?.name?.toLowerCase() || 'next section'}.`,
            duration: 4000,
          });
        }
      }, 2000);
    }
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
          // Documents section - clean structure
          fieldValue = JSON.stringify({
            country: documentFormState.country,
            documents: documentFormState.documentsDetails,
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
    
    // Toggle the section - collapse if expanded, expand if collapsed
    setExpandedSections(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
    
    // If collapsing a completed section, send POST
    if (expandedSections[idx] && completedSections[idx]) {
      const section = activeSections[idx - 1];
      if (section) await postSectionData(section);
    }
  };

  useEffect(() => {
    // Ensure current step is expanded
    setExpandedSections(prev => ({ ...prev, [currentStep]: true }));
    if (currentStep >= 2) setShowMobileMenu(false);
  }, [currentStep]);

  // active sections by order
  const activeSections = (templateVersion?.sections || [])
    .filter((s) => s.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const isFormValid = () => {
    if (!templateVersion) return false;
    const personalInfo: any = getPersonalInfoConfig();
    const requiredToggles = personalInfo?.requiredToggles || {};
    const checks: boolean[] = [];

    // Required fields - always validated if shown
    if (personalInfo.firstName) checks.push(isValidName(formData.firstName));
    if (personalInfo.lastName) checks.push(isValidName(formData.lastName));
    
    // Conditionally required fields based on requiredToggles
    if (personalInfo.middleName && requiredToggles.middleName) {
      checks.push(isValidName(formData.middleName));
    }
    
    if (personalInfo.dateOfBirth && requiredToggles.dob) {
      checks.push(isValidDOB(formData.dateOfBirth));
    }
    
    if (personalInfo.email) {
      checks.push(isValidEmail(formData.email));
      // Skip email verification for development
      if (!BYPASS_OTP_FOR_DEVELOPMENT) {
        checks.push(isEmailVerified);
      }
    }
    
    if (personalInfo.phoneNumber && requiredToggles.phoneNumber) {
      checks.push(!!formData.countryCode);
      checks.push(
        isValidPhoneForCountry(formData.countryCode, formData.phoneNumber),
      );
      // Skip phone verification for development
      if (!BYPASS_OTP_FOR_DEVELOPMENT) {
        checks.push(isPhoneVerified);
      }
    }
    
    if (personalInfo.gender && requiredToggles.gender) {
      checks.push(!!formData.gender);
    }
    
    if (personalInfo.currentAddress) {
      // Check address line if required
      if (requiredToggles.currentAddress) {
        checks.push(isValidAddress(formData.address));
      }
      // Check city if required
      if (requiredToggles.currentCity) {
        checks.push(!!formData.city && formData.city.trim().length >= 2);
      }
      // Check postal code if required
      if (requiredToggles.currentPostal) {
        checks.push(isValidPostalCode(formData.postalCode));
      }
    }
    
    if (personalInfo.permanentAddress) {
      // Check permanent address line if required
      if (requiredToggles.permanentAddress) {
        checks.push(isValidAddress(formData.permanentAddress));
      }
      // Check permanent city if required
      if (requiredToggles.permanentCity) {
        checks.push(!!formData.permanentCity && formData.permanentCity.trim().length >= 2);
      }
      // Check permanent postal code if required
      if (requiredToggles.permanentPostal) {
        checks.push(isValidPostalCode(formData.permanentPostalCode));
      }
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
    const requiredToggles = personalInfo?.requiredToggles || {};
    const missing: string[] = [];

    // Check personal information fields - required fields only
    if (personalInfo.firstName && !isValidName(formData.firstName)) {
      missing.push("First Name");
    }
    if (personalInfo.lastName && !isValidName(formData.lastName)) {
      missing.push("Last Name");
    }
    
    // Conditionally required fields based on requiredToggles
    if (personalInfo.middleName && requiredToggles.middleName && !isValidName(formData.middleName)) {
      missing.push("Middle Name");
    }
    
    if (personalInfo.dateOfBirth && requiredToggles.dob && !isValidDOB(formData.dateOfBirth)) {
      missing.push("Date of Birth");
    }
    
    if (personalInfo.email) {
      if (!isValidEmail(formData.email)) {
        missing.push("Valid Email");
      } else if (!isEmailVerified && !BYPASS_OTP_FOR_DEVELOPMENT) {
        missing.push("Email Verification (OTP)");
      }
    }
    
    if (personalInfo.phoneNumber && requiredToggles.phoneNumber) {
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
    
    if (personalInfo.gender && requiredToggles.gender && !formData.gender) {
      missing.push("Gender");
    }
    
    if (personalInfo.currentAddress) {
      if (requiredToggles.currentAddress && !isValidAddress(formData.address)) {
        missing.push("Current Address");
      }
      if (requiredToggles.currentCity && (!formData.city || formData.city.trim().length < 2)) {
        missing.push("Current City");
      }
      if (requiredToggles.currentPostal && !isValidPostalCode(formData.postalCode)) {
        missing.push("Current Postal Code");
      }
    }
    
    if (personalInfo.permanentAddress) {
      if (requiredToggles.permanentAddress && !isValidAddress(formData.permanentAddress)) {
        missing.push("Permanent Address");
      }
      if (requiredToggles.permanentCity && (!formData.permanentCity || formData.permanentCity.trim().length < 2)) {
        missing.push("Permanent City");
      }
      if (requiredToggles.permanentPostal && !isValidPostalCode(formData.permanentPostalCode)) {
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
                    isExpanded={!!expandedSections[index + 1]}
                    onToggle={toggleSection}
                    onSectionFocus={handleSectionFocus}
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
                    setDocumentFormState={setDocumentFormStateWithLogging}
                    onDocumentUploaded={handleDocumentUploaded}
                    biometricFormState={biometricFormState}
                    setBiometricFormState={setBiometricFormState}
                    // personalInfoConfig={personalCfg}
                    // personalInfoRequired={personalInfoRequired}
                    // documentsConfig={docsCfg}
                    // biometricsConfig={bioCfg}
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
                      onSectionFocus={handleSectionFocus}
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
                      isExpanded={!!expandedSections[index + 1]}
                      onToggle={toggleSection}
                      documentFormState={documentFormState}
                      setDocumentFormState={setDocumentFormStateWithLogging}
                      onDocumentUploaded={handleDocumentUploaded}
                      biometricFormState={biometricFormState}
                      setBiometricFormState={setBiometricFormState}
                      // personalInfoConfig={personalCfg}
                      // personalInfoRequired={personalInfoRequired}
                      // documentsConfig={docsCfg}
                      // biometricsConfig={bioCfg}

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

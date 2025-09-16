import { useState, useEffect } from 'react';
import { Header } from './Header';
import { StepSidebar } from './StepSidebar';
import { PersonalInformationForm } from './PersonalInformationForm';
import { ConsentDialog } from './ConsentDialog';
import { TemplateResponse, FormData } from '@shared/templates';
import { useToast } from '@/hooks/use-toast';

interface IdentityVerificationPageProps {
  templateId: number;
}

export function IdentityVerificationPage({ templateId }: IdentityVerificationPageProps) {
  const { toast } = useToast();
  const [template, setTemplate] = useState<TemplateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [hasShownStep1Toast, setHasShownStep1Toast] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(true);
  const [hasConsented, setHasConsented] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    email: '',
    phoneNumber: '',
    gender: '',
    address: '',
    city: '',
    postalCode: '',
  });

  // Fetch template data
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/templates/${templateId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch template');
        }
        const templateData = await response.json();
        setTemplate(templateData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
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
              <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 11.0801V12.0001C21.9988 14.1565 21.3005 16.2548 20.0093 17.9819C18.7182 19.7091 16.9033 20.9726 14.8354 21.584C12.7674 22.1954 10.5573 22.122 8.53447 21.3747C6.51168 20.6274 4.78465 19.2462 3.61096 17.4372C2.43727 15.6281 1.87979 13.4882 2.02168 11.3364C2.16356 9.18467 2.99721 7.13643 4.39828 5.49718C5.79935 3.85793 7.69279 2.71549 9.79619 2.24025C11.8996 1.76502 14.1003 1.98245 16.07 2.86011M22 4.00011L12 14.0101L9.00001 11.0101" stroke="#039855" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-text-primary font-figtree text-base font-bold">Step 1 completed</span>
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
      }, 1500);
    }
  }, [
    isEmailVerified,
    isPhoneVerified,
    formData.firstName,
    formData.lastName,
    formData.dateOfBirth,
    formData.email,
    formData.phoneNumber,
    formData.address,
    formData.city,
    formData.postalCode,
    currentStep,
    hasShownStep1Toast,
    toast
  ]);

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

  const isFormValid = () => {
    return (
      formData.firstName &&
      formData.lastName &&
      formData.dateOfBirth &&
      formData.email &&
      formData.phoneNumber &&
      formData.address &&
      formData.city &&
      formData.postalCode &&
      isEmailVerified &&
      isPhoneVerified
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
          {error || 'Template not found'}
        </div>
      </div>
    );
  }

  const activeVersion = template.versions.find(v => v.isActive);
  if (!activeVersion) {
    return (
      <div className="w-full h-screen bg-page-background flex items-center justify-center">
        <div className="text-destructive font-roboto text-lg">No active template version found</div>
      </div>
    );
  }

  const activeSections = activeVersion.sections
    .filter(s => s.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="w-full h-screen bg-page-background flex flex-col">
      {/* Header */}
      <Header />

      {/* Title Bar */}
      <div className="flex w-full h-12 items-start flex-shrink-0 bg-background">
        <div className="flex flex-col items-start flex-1 self-stretch bg-background">
          <div className="flex h-12 py-0 px-4 justify-between items-center self-stretch border-b border-border">
            <div className="flex flex-col justify-center items-start flex-1">
              <div className="flex items-start gap-2">
                <div className="flex items-center gap-2">
                  <div className="text-text-primary font-roboto text-xl font-bold leading-[30px]">
                    Verify your identity
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Expand/Collapse Icons */}
              <div className="flex w-8 h-8 justify-center items-center gap-2.5 rounded border border-border bg-background">
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.49984 13.6666L4.27067 16.9166C4.104 17.0833 3.90956 17.1666 3.68734 17.1666C3.46511 17.1666 3.27067 17.0833 3.104 16.9166C2.93734 16.7499 2.854 16.552 2.854 16.3228C2.854 16.0937 2.93734 15.8958 3.104 15.7291L6.33317 12.4999H4.99984C4.76373 12.4999 4.56581 12.4201 4.40609 12.2603C4.24636 12.1006 4.1665 11.9027 4.1665 11.6666C4.1665 11.4305 4.24636 11.2326 4.40609 11.0728C4.56581 10.9131 4.76373 10.8333 4.99984 10.8333H8.33317C8.56928 10.8333 8.7672 10.9131 8.92692 11.0728C9.08664 11.2326 9.1665 11.4305 9.1665 11.6666V14.9999C9.1665 15.236 9.08664 15.4339 8.92692 15.5937C8.7672 15.7534 8.56928 15.8333 8.33317 15.8333C8.09706 15.8333 7.89914 15.7534 7.73942 15.5937C7.5797 15.4339 7.49984 15.236 7.49984 14.9999V13.6666ZM13.6665 7.49992H14.9998C15.2359 7.49992 15.4339 7.57978 15.5936 7.7395C15.7533 7.89922 15.8332 8.09714 15.8332 8.33325C15.8332 8.56936 15.7533 8.76728 15.5936 8.927C15.4339 9.08672 15.2359 9.16659 14.9998 9.16659H11.6665C11.4304 9.16659 11.2325 9.08672 11.0728 8.927C10.913 8.76728 10.8332 8.56936 10.8332 8.33325V4.99992C10.8332 4.76381 10.913 4.56589 11.0728 4.40617C11.2325 4.24645 11.4304 4.16659 11.6665 4.16659C11.9026 4.16659 12.1005 4.24645 12.2603 4.40617C12.42 4.56589 12.4998 4.76381 12.4998 4.99992V6.33325L15.729 3.08325C15.8957 2.91659 16.0901 2.83325 16.3123 2.83325C16.5346 2.83325 16.729 2.91659 16.8957 3.08325C17.0623 3.24992 17.1457 3.44784 17.1457 3.677C17.1457 3.90617 17.0623 4.10409 16.8957 4.27075L13.6665 7.49992Z" fill="#515257"/>
                </svg>
              </div>
              <div className="flex w-8 h-8 justify-center items-center gap-2.5 rounded border border-border bg-background">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.00033 6.66667L13.667 2M13.667 2H9.66699M13.667 2V6M6.33366 9.33333L1.66699 14M1.66699 14H5.66699M1.66699 14V10" stroke="#515257" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <button 
                className={`flex h-8 py-[9px] px-3 justify-center items-center gap-0.5 rounded ${
                  isFormValid() ? 'bg-primary' : 'bg-primary opacity-50'
                }`}
                disabled={!isFormValid()}
              >
                <span className="text-white font-roboto text-[13px] font-normal">Submit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex w-full flex-1 overflow-hidden flex-col lg:flex-row">
        {/* Sidebar - hidden on mobile, visible on desktop */}
        <div className="hidden lg:block border-r border-border">
          <StepSidebar sections={activeSections} currentStep={currentStep} />
        </div>

        {/* Mobile Steps Indicator */}
        <div className="lg:hidden px-4 py-2 bg-background border-b border-border">
          <div className="flex items-center justify-between">
            <div className="text-text-primary font-roboto text-sm font-medium">
              Step {currentStep} of {activeSections.length}: {activeSections[currentStep - 1]?.name}
            </div>
            <div className="flex gap-1">
              {activeSections.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index + 1 === currentStep ? 'bg-primary' :
                    index + 1 < currentStep ? 'bg-primary/50' : 'bg-step-inactive-border'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex w-full flex-1 p-2 sm:p-4 lg:p-6 flex-col items-center gap-4 lg:gap-6 bg-background overflow-auto">
          <div className="flex w-full max-w-[998px] flex-col items-center gap-4 lg:gap-6">
            <div className="flex flex-col items-center gap-4 lg:gap-6 self-stretch">
              {/* Personal Information Section */}
              <div className="flex flex-col items-start gap-4 self-stretch rounded bg-background">
                <div className="flex py-0 px-0.5 flex-col items-start self-stretch rounded border border-border">
                  <div className="flex p-4 flex-col justify-center items-center gap-2 self-stretch bg-background">
                    <div className="flex pb-1 items-center gap-2 self-stretch">
                      <svg className="w-[18px] h-[18px] aspect-1" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_minus)">
                          <path d="M6.00391 9H12.0039M16.5039 9C16.5039 13.1421 13.146 16.5 9.00391 16.5C4.86177 16.5 1.50391 13.1421 1.50391 9C1.50391 4.85786 4.86177 1.5 9.00391 1.5C13.146 1.5 16.5039 4.85786 16.5039 9Z" stroke="#323238" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_minus">
                            <rect width="18" height="18" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>
                      <div className="text-text-primary font-roboto text-base font-bold leading-3">
                        Personal Information
                      </div>
                    </div>
                    <div className="flex pl-7 justify-center items-center gap-2.5 self-stretch">
                      <div className="flex-1 text-text-primary font-roboto text-[13px] font-normal leading-5">
                        Please provide your basic personal information to begin the identity verification process.
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

              {/* Identity Document Section (Collapsed) */}
              <div className="flex flex-col items-start gap-4 self-stretch rounded bg-background">
                <div className="flex py-0 px-0.5 flex-col items-start self-stretch rounded border border-border">
                  <div className="flex p-3 flex-col justify-center items-center gap-2 self-stretch bg-background">
                    <div className="flex pb-1 items-center gap-2 self-stretch">
                      <svg className="w-[18px] h-[18px] aspect-1" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_minus2)">
                          <path d="M6.0022 8.99902H12.0022M16.5022 8.99902C16.5022 13.1411 13.1443 16.499 9.0022 16.499C4.86006 16.499 1.5022 13.1411 1.5022 8.99902C1.5022 4.85689 4.86006 1.49902 9.0022 1.49902C13.1443 1.49902 16.5022 4.85689 16.5022 8.99902Z" stroke="#323238" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_minus2">
                            <rect width="18" height="18" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>
                      <div className="text-text-primary font-roboto text-base font-bold leading-3">
                        Identity Document
                      </div>
                    </div>
                    <div className="flex pl-7 justify-center items-center gap-2.5 self-stretch">
                      <div className="flex-1 text-text-primary font-roboto text-[13px] font-normal leading-5">
                        Choose a valid government-issued ID (like a passport, driver's license, or national ID) and upload a clear photo of it.
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full h-[308px] py-4 px-4 flex-col justify-center items-center border-t border-border bg-background">
                    <div className="flex w-[269px] flex-col items-center gap-2 text-center">
                      <svg className="w-[270px] h-[124px]" viewBox="0 0 270 124" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M85.3279 22.1817L78.0773 24.5986C77.434 24.813 77 25.4151 77 26.0933V64.3453C77 65.2155 77.7054 65.9209 78.5755 65.9209H191.227C192.097 65.9209 192.802 65.2155 192.802 64.3453V35.9856C194.546 23.1968 184.36 21.4894 177.822 22.3318C176.954 22.4437 176.115 21.8651 175.923 21.0114C169.802 -6.20549 153.204 2.6679 143.786 12.3146C142.867 13.2569 141.155 12.8031 140.472 11.6773C137.614 6.96655 131.053 8.36187 126.478 10.4315C125.425 10.908 124.154 10.2315 123.989 9.08721C122.429 -1.75121 117.469 0.119079 114.308 3.27733C113.684 3.9011 112.684 3.9987 111.958 3.49708C106.479 -0.288224 104.073 3.4716 103.285 7.11776C103.063 8.14607 101.996 8.83505 100.98 8.56145C89.6105 5.49927 86.5757 14.5459 86.4423 20.6214C86.4268 21.3237 85.9943 21.9596 85.3279 22.1817Z" fill="url(#paint0_linear_doc)"/>
                        <rect x="123.5" y="46.3867" width="24.8794" height="12.8687" fill="url(#paint1_linear_doc)"/>
                        <path d="M123.759 42.4412L116.105 52.7943C115.745 53.2812 115.989 53.9778 116.575 54.1334L120.155 55.085C120.486 55.173 120.837 55.0557 121.049 54.7866L125.516 49.1128C125.679 48.9062 125.927 48.7856 126.19 48.7856H145.088C145.402 48.7856 145.69 48.9567 145.841 49.2318L148.89 54.8064C149.034 55.0694 149.305 55.2383 149.604 55.2517L154.138 55.4557C154.81 55.4859 155.254 54.7672 154.926 54.1803L148.42 42.5328C148.268 42.2614 147.982 42.0933 147.671 42.0933H124.448C124.176 42.0933 123.92 42.2224 123.759 42.4412Z" fill="url(#paint2_linear_doc)"/>
                        <path opacity="0.6" d="M157.998 75.1751H112.026C110.993 75.1751 110.448 73.9515 111.139 73.1837L114.18 69.8057H114.717H155.346C155.687 69.8057 156.012 69.9514 156.238 70.2061L158.89 73.1892C159.574 73.9586 159.027 75.1751 157.998 75.1751Z" fill="#EFF1F5"/>
                        <path d="M114.924 70.1123V53.812C114.924 52.8644 115.693 52.0962 116.64 52.0962H125.548C126.357 52.0962 127.056 52.6614 127.226 53.4525L127.931 56.7453C128.101 57.5364 128.8 58.1016 129.609 58.1016H141.747C142.601 58.1016 143.325 57.4737 143.446 56.6284L143.883 53.5694C144.004 52.7241 144.728 52.0962 145.581 52.0962H153.959C154.907 52.0962 155.675 52.8644 155.675 53.812V70.1123C155.675 71.0599 154.907 71.8281 153.959 71.8281H116.64C115.693 71.8281 114.924 71.0599 114.924 70.1123Z" fill="url(#paint3_linear_doc)"/>
                        <defs>
                          <linearGradient id="paint0_linear_doc" x1="135" y1="0.825195" x2="135.295" y2="33.9116" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#F1F1F1"/>
                            <stop offset="1" stopColor="#F8F8F8" stopOpacity="0.2"/>
                          </linearGradient>
                          <linearGradient id="paint1_linear_doc" x1="135.94" y1="46.3867" x2="135.94" y2="59.2554" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#BCD3FF"/>
                            <stop offset="1" stopColor="#EAF1FF"/>
                          </linearGradient>
                          <linearGradient id="paint2_linear_doc" x1="135.516" y1="49.8145" x2="135.516" y2="40.3774" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#4372DF"/>
                            <stop offset="1" stopColor="#8EAFFE"/>
                          </linearGradient>
                          <linearGradient id="paint3_linear_doc" x1="135.514" y1="52.3911" x2="135.514" y2="72.123" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#84ABF8"/>
                            <stop offset="1" stopColor="#C1D4FC"/>
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="text-text-secondary font-roboto text-[13px] font-medium">
                        You'll be able to complete this step after<br />
                        submitting your personal information.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Capture Selfie Section (Collapsed) */}
              <div className="flex flex-col items-start gap-4 self-stretch rounded bg-background">
                <div className="flex py-0 px-0.5 flex-col items-start self-stretch rounded border border-border">
                  <div className="flex p-3 flex-col justify-center items-center gap-2 self-stretch bg-background">
                    <div className="flex pb-1 items-center gap-2 self-stretch">
                      <svg className="w-[18px] h-[18px] aspect-1" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_minus3)">
                          <path d="M6.0022 8.99902H12.0022M16.5022 8.99902C16.5022 13.1411 13.1443 16.499 9.0022 16.499C4.86006 16.499 1.5022 13.1411 1.5022 8.99902C1.5022 4.85689 4.86006 1.49902 9.0022 1.49902C13.1443 1.49902 16.5022 4.85689 16.5022 8.99902Z" stroke="#323238" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_minus3">
                            <rect width="18" height="18" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>
                      <div className="text-text-primary font-roboto text-base font-bold leading-3">
                        Capture Selfie
                      </div>
                    </div>
                    <div className="flex pl-7 justify-center items-center gap-2.5 self-stretch">
                      <div className="flex-1 text-text-primary font-roboto text-[13px] font-normal leading-5">
                        Take a live selfie to confirm you are the person in the ID document. Make sure you're in a well-lit area and your face is clearly visible.
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full h-[308px] py-4 px-4 flex-col justify-center items-center border-t border-border bg-background">
                    <div className="flex w-[269px] flex-col items-center gap-2 text-center">
                      <svg className="w-[270px] h-[124px]" viewBox="0 0 270 124" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M85.3279 22.1817L78.0773 24.5986C77.434 24.813 77 25.4151 77 26.0933V64.3453C77 65.2155 77.7054 65.9209 78.5755 65.9209H191.227C192.097 65.9209 192.802 65.2155 192.802 64.3453V35.9856C194.546 23.1968 184.36 21.4894 177.822 22.3318C176.954 22.4437 176.115 21.8651 175.923 21.0114C169.802 -6.20549 153.204 2.6679 143.786 12.3146C142.867 13.2569 141.155 12.8031 140.472 11.6773C137.614 6.96655 131.053 8.36187 126.478 10.4315C125.425 10.908 124.154 10.2315 123.989 9.08721C122.429 -1.75121 117.469 0.119079 114.308 3.27733C113.684 3.9011 112.684 3.9987 111.958 3.49708C106.479 -0.288224 104.073 3.4716 103.285 7.11776C103.063 8.14607 101.996 8.83505 100.98 8.56145C89.6105 5.49927 86.5757 14.5459 86.4423 20.6214C86.4268 21.3237 85.9943 21.9596 85.3279 22.1817Z" fill="url(#paint0_linear_selfie)"/>
                        <rect x="123.5" y="46.3867" width="24.8794" height="12.8687" fill="url(#paint1_linear_selfie)"/>
                        <path d="M123.759 42.4412L116.105 52.7943C115.745 53.2812 115.989 53.9778 116.575 54.1334L120.155 55.085C120.486 55.173 120.837 55.0557 121.049 54.7866L125.516 49.1128C125.679 48.9062 125.927 48.7856 126.19 48.7856H145.088C145.402 48.7856 145.69 48.9567 145.841 49.2318L148.89 54.8064C149.034 55.0694 149.305 55.2383 149.604 55.2517L154.138 55.4557C154.81 55.4859 155.254 54.7672 154.926 54.1803L148.42 42.5328C148.268 42.2614 147.982 42.0933 147.671 42.0933H124.448C124.176 42.0933 123.92 42.2224 123.759 42.4412Z" fill="url(#paint2_linear_selfie)"/>
                        <path opacity="0.6" d="M157.998 75.1751H112.026C110.993 75.1751 110.448 73.9515 111.139 73.1837L114.18 69.8057H114.717H155.346C155.687 69.8057 156.012 69.9514 156.238 70.2061L158.89 73.1892C159.574 73.9586 159.027 75.1751 157.998 75.1751Z" fill="#EFF1F5"/>
                        <path d="M114.924 70.1123V53.812C114.924 52.8644 115.693 52.0962 116.64 52.0962H125.548C126.357 52.0962 127.056 52.6614 127.226 53.4525L127.931 56.7453C128.101 57.5364 128.8 58.1016 129.609 58.1016H141.747C142.601 58.1016 143.325 57.4737 143.446 56.6284L143.883 53.5694C144.004 52.7241 144.728 52.0962 145.581 52.0962H153.959C154.907 52.0962 155.675 52.8644 155.675 53.812V70.1123C155.675 71.0599 154.907 71.8281 153.959 71.8281H116.64C115.693 71.8281 114.924 71.0599 114.924 70.1123Z" fill="url(#paint3_linear_selfie)"/>
                        <defs>
                          <linearGradient id="paint0_linear_selfie" x1="135" y1="0.825195" x2="135.295" y2="33.9116" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#F1F1F1"/>
                            <stop offset="1" stopColor="#F8F8F8" stopOpacity="0.2"/>
                          </linearGradient>
                          <linearGradient id="paint1_linear_selfie" x1="135.94" y1="46.3867" x2="135.94" y2="59.2554" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#BCD3FF"/>
                            <stop offset="1" stopColor="#EAF1FF"/>
                          </linearGradient>
                          <linearGradient id="paint2_linear_selfie" x1="135.516" y1="49.8145" x2="135.516" y2="40.3774" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#4372DF"/>
                            <stop offset="1" stopColor="#8EAFFE"/>
                          </linearGradient>
                          <linearGradient id="paint3_linear_selfie" x1="135.514" y1="52.3911" x2="135.514" y2="72.123" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#84ABF8"/>
                            <stop offset="1" stopColor="#C1D4FC"/>
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="text-text-secondary font-roboto text-[13px] font-medium">
                        You'll be able to complete this step after<br />
                        submitting your personal information.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

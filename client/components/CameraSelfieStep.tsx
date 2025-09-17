import { useState } from "react";
import { HowItWorksDialog } from "./HowItWorksDialog";

interface CameraSelfieStepProps {
  // Add props as needed for camera functionality
}

export function CameraSelfieStep({}: CameraSelfieStepProps) {
  const [cameraError, setCameraError] = useState(true); // For demo purposes, showing error state
  const [showHowItWorksDialog, setShowHowItWorksDialog] = useState(false);

  return (
    <div className="flex flex-col items-start gap-4 self-stretch rounded bg-background">
      <div className="flex py-0 px-0.5 flex-col items-start self-stretch rounded border border-border">
        {/* Header Section */}
        <div className="flex p-4 flex-col justify-center items-center gap-2 self-stretch bg-background">
          <div className="flex pb-1 items-center gap-2 self-stretch">
            <svg
              className="w-[18px] h-[18px] aspect-1"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_2641_20064)">
                <path
                  d="M6.00195 8.99902H12.002M16.502 8.99902C16.502 13.1411 13.1441 16.499 9.00195 16.499C4.85982 16.499 1.50195 13.1411 1.50195 8.99902C1.50195 4.85689 4.85982 1.49902 9.00195 1.49902C13.1441 1.49902 16.502 4.85689 16.502 8.99902Z"
                  stroke="#323238"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_2641_20064">
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
              Take a live selfie to confirm you are the person in the ID
              document. Make sure you're in a well-lit area and your face is
              clearly visible.
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="flex p-2 sm:p-4 flex-col justify-center items-center self-stretch border-t border-border bg-background">
          <div className="flex w-full max-w-[956px] p-2 flex-col lg:flex-row items-center gap-4 lg:gap-6">
            {/* Left Section - Camera Capture */}
            <div className="flex w-full lg:flex-1 flex-col justify-center items-center">
              <div className="flex w-full max-w-[440px] min-h-[300px] lg:min-h-[380px] pt-4 flex-col items-center gap-2 rounded-t-lg border-t-[1.5px] border-r-[1.5px] border-l-[1.5px] border-dashed border-step-inactive-border bg-background">
                <div className="flex flex-col justify-center items-center gap-7 flex-1 self-stretch rounded-t border-[1.5px] border-dashed border-step-inactive-border bg-background">
                  <div className="flex flex-col justify-center items-center gap-2 flex-1 self-stretch rounded-lg bg-background px-4">
                    <div className="flex w-full max-w-[350px] flex-col items-center gap-2">
                      <div className="w-[126px] h-[52px] relative">
                        <svg
                          className="w-8 h-8 flex-shrink-0 absolute left-1/2 top-0 transform -translate-x-1/2"
                          viewBox="0 0 32 32"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M15.9974 10.668V16.0013M15.9974 21.3346H16.0107M29.3307 16.0013C29.3307 23.365 23.3611 29.3346 15.9974 29.3346C8.6336 29.3346 2.66406 23.365 2.66406 16.0013C2.66406 8.6375 8.6336 2.66797 15.9974 2.66797C23.3611 2.66797 29.3307 8.6375 29.3307 16.0013Z"
                            stroke="#676879"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="w-full text-text-primary text-center font-roboto text-[13px] font-medium leading-5 absolute left-0 top-8 h-5">
                          Camera not detected.
                        </div>
                      </div>
                      <div className="w-full max-w-[284px] text-text-muted text-center font-roboto text-[13px] font-normal leading-5">
                        Please check your device or close other apps using the
                        camera.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Retry Button Section */}
              <div className="flex w-full max-w-[440px] p-2 pr-4 flex-col items-end gap-2 rounded-b bg-[#F6F7FB]">
                <button className="flex h-8 py-[9px] px-3 justify-center items-center gap-1 rounded bg-primary hover:bg-primary/90 transition-colors">
                  <svg
                    className="w-[18px] h-[18px] transform -rotate-90"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.5 1.875C7.5 1.875 5.45116 3.37875 4.22868 4.60035C3.0062 5.82203 2.25 7.5102 2.25 9.375C2.25 13.1029 5.27208 16.125 9 16.125C12.728 16.125 15.75 13.1029 15.75 9.375C15.75 6.29768 13.6907 3.70133 10.875 2.88885M7.5 1.875H3M7.5 1.875V6.375"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-white font-roboto text-[13px] font-medium">
                    Retry
                  </span>
                </button>
              </div>
            </div>

            {/* Center Divider - Horizontal on mobile, Vertical on desktop */}
            <div className="flex lg:hidden w-full h-4 flex-row justify-center items-center gap-2">
              <div className="flex-1 h-0 border-t border-border"></div>
              <div className="text-text-muted font-roboto text-[13px] font-normal px-2">
                or
              </div>
              <div className="flex-1 h-0 border-t border-border"></div>
            </div>
            <div className="hidden lg:flex h-24 flex-col justify-center items-center gap-1">
              <div className="w-0 h-[34px] border-l border-border"></div>
              <div className="text-text-muted font-roboto text-[13px] font-normal">
                or
              </div>
              <div className="w-0 h-[34px] border-l border-border"></div>
            </div>

            {/* Right Section - QR Code */}
            <div className="flex w-full lg:flex-1 flex-col justify-center items-center">
              <div className="flex w-full max-w-[440px] min-h-[300px] lg:min-h-[380px] flex-col items-center gap-2">
                <div className="flex pt-4 flex-col justify-between items-center flex-1 self-stretch rounded-t-lg border-[1.5px] border-dashed border-step-inactive-border">
                  <div className="flex flex-col justify-center items-center gap-2 flex-1 px-4">
                    <div className="flex flex-col lg:flex-row justify-center items-center gap-4">
                      {/* QR Code Image */}
                      <img
                        className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 flex-shrink-0"
                        src="https://api.builder.io/api/v1/image/assets/TEMP/7e3be353453f139a4c9f40e2de6ea62b3ab16235?width=256"
                        alt="QR Code"
                      />

                      {/* QR Instructions */}
                      <div className="flex flex-col justify-center items-center gap-2">
                        <div className="flex w-full max-w-[214px] flex-col items-center gap-3">
                          <div className="flex w-full flex-col items-start">
                            <div className="w-full text-center font-roboto text-[13px] font-normal leading-5">
                              <span className="text-text-muted">
                                Continue on another device by scanning the QR
                                code or opening
                              </span>
                              <span className="text-primary">
                                {" "}
                                https://id.xyz/verify
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* How does this work section */}
              <div className="flex w-full max-w-[440px] h-12 p-4 items-center gap-2 rounded-b bg-[#F6F7FB]">
                <div className="flex w-full justify-end items-center gap-1">
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_9052_929)">
                      <path
                        d="M10.0003 13.3332V9.99984M10.0003 6.6665H10.0087M18.3337 9.99984C18.3337 14.6022 14.6027 18.3332 10.0003 18.3332C5.39795 18.3332 1.66699 14.6022 1.66699 9.99984C1.66699 5.39746 5.39795 1.6665 10.0003 1.6665C14.6027 1.6665 18.3337 5.39746 18.3337 9.99984Z"
                        stroke="#0073EA"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_9052_929">
                        <rect width="20" height="20" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                  <button
                    onClick={() => setShowHowItWorksDialog(true)}
                    className="text-primary font-roboto text-xs font-normal leading-5 hover:underline"
                  >
                    How does this work?
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <HowItWorksDialog
        isOpen={showHowItWorksDialog}
        onClose={() => setShowHowItWorksDialog(false)}
      />
    </div>
  );
}

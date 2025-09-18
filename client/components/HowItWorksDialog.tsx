import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface HowItWorksDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowItWorksDialog({ isOpen, onClose }: HowItWorksDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-[320px] sm:max-w-[400px] lg:max-w-[800px] p-0 gap-0 bg-white border border-border rounded-lg">
        {/* Header */}
        <DialogHeader className="flex flex-row justify-between items-center p-4 sm:p-6 border-b border-border">
          <DialogTitle className="text-[#172B4D] font-figtree text-lg sm:text-xl font-bold leading-[30px]">
            How does this work?
          </DialogTitle>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-6 h-6"
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6.33203L6 18.332M6 6.33203L18 18.332"
                stroke="#676879"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </DialogHeader>

        {/* Mobile Step Indicators */}
        <div className="lg:hidden flex flex-col p-4 gap-4 bg-white">
          <div className="text-[#172B4D] text-center font-roboto text-lg font-medium">
            Continue Securely On Another Device
          </div>

          {/* Step 1 */}
          <div className="flex flex-col items-start gap-4 p-4 bg-[#E6F1FD] rounded">
            <div className="flex items-center gap-3 self-stretch">
              <div className="flex w-6 h-6 justify-center items-center rounded-full bg-[#0073EA]">
                <span className="text-white font-roboto text-[13px] font-medium">1</span>
              </div>
              <div className="flex flex-col flex-1">
                <div className="text-[#323238] font-roboto text-[15px] font-bold">
                  Personal Information
                </div>
                <div className="text-[#323238] font-roboto text-[13px] font-normal">
                  Step 1
                </div>
              </div>
            </div>
            <div className="text-[#172B4D] font-figtree text-[13px] font-normal leading-5">
              Please provide your basic personal information to begin the identity verification process.
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-start gap-4 p-4 bg-white rounded border border-border">
            <div className="flex items-center gap-3 self-stretch">
              <div className="flex w-6 h-6 justify-center items-center rounded-full border border-border bg-white">
                <span className="text-[#42526E] font-roboto text-[13px] font-medium">2</span>
              </div>
              <div className="flex flex-col flex-1">
                <div className="text-[#323238] font-roboto text-[15px] font-bold">
                  Identity Document
                </div>
                <div className="text-[#323238] font-roboto text-[13px] font-normal">
                  Step 2
                </div>
              </div>
            </div>
            <div className="text-[#42526E] font-figtree text-[13px] font-normal leading-5">
              Choose a valid government-issued ID (like a passport, driver's license, or national ID) and upload a clear photo of it.
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-start gap-4 p-4 bg-white rounded border border-border">
            <div className="flex items-center gap-3 self-stretch">
              <div className="flex w-6 h-6 justify-center items-center rounded-full border border-border bg-white">
                <span className="text-[#42526E] font-roboto text-[13px] font-medium">3</span>
              </div>
              <div className="flex flex-col flex-1">
                <div className="text-[#323238] font-roboto text-[15px] font-bold">
                  Capture Selfie
                </div>
                <div className="text-[#323238] font-roboto text-[13px] font-normal">
                  Step 3
                </div>
              </div>
            </div>
            <div className="text-[#42526E] font-figtree text-[13px] font-normal leading-5">
              Take a live selfie to confirm you are the person in the ID document. Make sure you're in a well-lit area and your face is clearly visible.
            </div>
          </div>

          {/* Success message for mobile */}
          <div className="flex items-center justify-center p-4 bg-[#BBDBC9] rounded gap-2">
            <svg
              className="w-[18px] h-[18px]"
              viewBox="0 0 18 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M1.52363 9.33203C1.5234 9.23168 1.50369 9.13141 1.46449 9.03691L0.923408 7.72684C0.809093 7.45094 0.750045 7.15477 0.75 6.85612C0.749952 6.55732 0.808785 6.26142 0.92313 5.98535C1.03747 5.70928 1.2051 5.45845 1.41642 5.24719C1.62769 5.03599 1.87849 4.86847 2.1545 4.7542L3.46245 4.21241C3.65187 4.13409 3.80295 3.98368 3.88181 3.79447L4.42373 2.48614C4.65456 1.92882 5.09734 1.48603 5.65465 1.25517C6.21196 1.02432 6.83815 1.02432 7.39546 1.25517L8.70278 1.79671C8.89252 1.87503 9.10575 1.87493 9.29535 1.79626L9.29685 1.79565L10.6053 1.25597C11.1624 1.02543 11.7887 1.02535 12.3458 1.2561C12.903 1.48691 13.3457 1.92958 13.5766 2.48674L14.1055 3.76367C14.1102 3.77375 14.1147 3.78397 14.119 3.79434C14.1974 3.98396 14.3478 4.13471 14.5372 4.21351L15.8459 4.75561C16.4032 4.98646 16.8461 5.42926 17.0769 5.98657C17.3077 6.54388 17.3077 7.17007 17.0769 7.72739L16.5351 9.03541C16.4957 9.13036 16.4761 9.23161 16.4761 9.33226C16.4761 9.43291 16.4957 9.53371 16.5351 9.62866L17.0769 10.9367C17.3077 11.494 17.3077 12.1202 17.0769 12.6775C16.8461 13.2348 16.4032 13.6776 15.8459 13.9085L14.5372 14.4506C14.3478 14.5294 14.1974 14.6801 14.119 14.8697C14.1147 14.8801 14.1102 14.8903 14.1055 14.9004L13.5766 16.1773C13.3457 16.7345 12.903 17.1772 12.3458 17.408C11.7887 17.6387 11.1624 17.6387 10.6053 17.4081L9.29685 16.8684L9.29535 16.8678C9.10575 16.7891 8.89252 16.7891 8.70278 16.8674L7.39546 17.4089C6.83815 17.6398 6.21196 17.6398 5.65465 17.4089C5.09734 17.178 4.65456 16.7352 4.42373 16.178L3.88181 14.8696C3.80295 14.6804 3.65187 14.53 3.46245 14.4517L2.1545 13.9099C1.87849 13.7956 1.62769 13.6281 1.41642 13.4169C1.2051 13.2056 1.03747 12.9548 0.92313 12.6787C0.808785 12.4026 0.749952 12.1067 0.75 11.8079C0.750045 11.5093 0.809093 11.2131 0.923408 10.9372L1.46449 9.62716C1.50369 9.53266 1.5234 9.43238 1.52363 9.33203ZM12.1553 7.98736C12.4482 7.69447 12.4482 7.2196 12.1553 6.9267C11.8624 6.63381 11.3876 6.63381 11.0947 6.9267L8.25 9.77138L7.28033 8.80171C6.98744 8.50883 6.51256 8.50883 6.21967 8.80171C5.92678 9.09458 5.92678 9.56948 6.21967 9.86236L7.71968 11.3624C8.01255 11.6552 8.48745 11.6552 8.78032 11.3624L12.1553 7.98736Z"
                fill="#258750"
              />
            </svg>
            <div className="text-[#172B4D] font-roboto text-[12px] font-normal leading-[22px]">
              Complete the previous steps to enable selfie capture.
            </div>
          </div>
        </div>

        {/* Desktop Content */}
        <div className="hidden lg:flex flex-col items-center gap-6 p-6 bg-white">
          <div className="text-[#172B4D] text-center font-roboto text-lg font-medium">
            Continue Securely On Another Device
          </div>

          {/* Steps Container */}
          <div className="flex flex-col lg:flex-row items-center gap-8 w-full max-w-[705px]">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-4 min-w-[194px]">
              {/* Step 1 Illustration */}
              <div className="relative w-[183px] h-[183px]">
                <div className="absolute inset-0 rounded-full border border-dashed border-[#C3C6D4] bg-white"></div>
                <div className="absolute inset-[7px] rounded-full bg-gradient-to-br from-[rgba(0,115,234,0.1)] to-[rgba(255,255,255,0.1)]"></div>

                {/* QR Code Icon */}
                <svg
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[85px] h-[124px]"
                  viewBox="0 0 85 125"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M34.5 11H23.5V23"
                    stroke="#323238"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M46.5 69L57.5 69L57.5 58"
                    stroke="#323238"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M46.5 11H57.5V23"
                    stroke="#323238"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M34.5 69L23.5 69L23.5 58"
                    stroke="#323238"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <rect
                    x="16.5"
                    y="1.5"
                    width="46"
                    height="68"
                    stroke="#0073EA"
                    strokeWidth="2"
                    rx="2"
                    fill="none"
                  />
                </svg>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="text-[#0073EA] font-roboto text-[15px] font-bold">
                  Step 1
                </div>
                <div className="w-[194px] text-[#676879] text-center font-roboto text-[13px] font-normal leading-5">
                  Scan this QR code with your device's camera. (mobile or tablet
                  for example)
                </div>
              </div>
            </div>

            {/* Arrow 1 */}
            <div className="hidden lg:block">
              <svg
                className="w-9 h-9 text-[#323238]"
                viewBox="0 0 37 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 26.25L27.5 18.75L20 11.25M9.5 26.25L17 18.75L9.5 11.25"
                  stroke="url(#paint0_linear_arrow1)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_arrow1"
                    x1="26"
                    y1="10.5"
                    x2="5"
                    y2="11"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0.246914" stopColor="#323238" />
                    <stop offset="1" stopColor="white" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-4 min-w-[187px]">
              <div className="relative w-[183px] h-[183px]">
                <div className="absolute inset-0 rounded-full border border-dashed border-[#C3C6D4] bg-white"></div>
                <div className="absolute inset-[7px] rounded-full bg-gradient-to-br from-[rgba(0,115,234,0.1)] to-[rgba(255,255,255,0.1)]"></div>

                {/* Phone Icon */}
                <svg
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[122px]"
                  viewBox="0 0 101 122"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M42.5 68.4115V5.83815C42.5 3.19916 44.8845 1 47.865 1H90.135C93.0614 1 95.5 3.15029 95.5 5.83815V89.1618C95.5 91.8008 93.1155 94 90.135 94H68"
                    stroke="#0073EA"
                    strokeWidth="1.95513"
                    strokeLinecap="round"
                  />
                  <rect
                    x="54.5"
                    y="26.5"
                    width="29"
                    height="15"
                    stroke="#323238"
                    strokeWidth="2"
                    rx="1"
                    fill="none"
                  />
                  <rect
                    x="54.5"
                    y="11.5"
                    width="29"
                    height="8"
                    stroke="#323238"
                    strokeWidth="2"
                    rx="1"
                    fill="none"
                  />
                  <g filter="url(#filter0_d_phone)">
                    <rect
                      x="54.5"
                      y="49"
                      width="31"
                      height="10"
                      stroke="#0073EA"
                      strokeWidth="2"
                      rx="1"
                      fill="none"
                    />
                  </g>
                  <defs>
                    <filter
                      id="filter0_d_phone"
                      x="50.1927"
                      y="48"
                      width="39.6146"
                      height="18.6146"
                      filterUnits="userSpaceOnUse"
                      colorInterpolationFilters="sRGB"
                    >
                      <feFlood floodOpacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset dy="3.30729" />
                      <feGaussianBlur stdDeviation="1.65365" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                      />
                      <feBlend
                        mode="normal"
                        in2="BackgroundImageFix"
                        result="effect1_dropShadow_phone"
                      />
                      <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect1_dropShadow_phone"
                        result="shape"
                      />
                    </filter>
                  </defs>
                </svg>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="text-[#0073EA] font-roboto text-[15px] font-bold">
                  Step 2
                </div>
                <div className="text-[#676879] text-center font-roboto text-[13px] font-normal leading-5">
                  Tap the link that appears to open your verification session.
                </div>
              </div>
            </div>

            {/* Arrow 2 */}
            <div className="hidden lg:block">
              <svg
                className="w-5 h-[18px] text-[#323238]"
                viewBox="0 0 21 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 16.25L19.5 8.75L12 1.25M1.5 16.25L9 8.75L1.5 1.25"
                  stroke="url(#paint0_linear_arrow2)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_arrow2"
                    x1="18"
                    y1="0.500001"
                    x2="-3"
                    y2="1"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0.246914" stopColor="#323238" />
                    <stop offset="1" stopColor="white" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-4 min-w-[183px]">
              <div className="relative w-[183px] h-[183px]">
                <div className="absolute inset-0 rounded-full border border-dashed border-[#C3C6D4] bg-white"></div>
                <div className="absolute inset-[7px] rounded-full bg-gradient-to-br from-[rgba(0,115,234,0.1)] to-[rgba(255,255,255,0.1)]"></div>

                {/* Checkmark Phone Icon */}
                <svg
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[85px] h-[124px]"
                  viewBox="0 0 85 125"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.7891 61.7373V4.62095C16.7891 3.02189 18.0883 1.72266 19.6874 1.72266H62.9119C64.511 1.72266 65.8102 3.02189 65.8102 4.62095V40.0501"
                    stroke="#0073EA"
                    strokeWidth="1.99882"
                    strokeLinecap="round"
                  />
                  <path
                    d="M26.575 22.5L28.525 24.45L32.425 20.55M36 22.5C36 26.0898 33.0898 29 29.5 29C25.9101 29 23 26.0898 23 22.5C23 18.9101 25.9101 16 29.5 16C33.0898 16 36 18.9101 36 22.5Z"
                    stroke="#323238"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <g filter="url(#filter0_d_check)">
                    <rect
                      x="26.5"
                      y="67"
                      width="28"
                      height="8"
                      stroke="#0073EA"
                      strokeWidth="2"
                      rx="1"
                      fill="none"
                    />
                  </g>
                  <defs>
                    <filter
                      id="filter0_d_check"
                      x="22.1927"
                      y="66"
                      width="37.6146"
                      height="16.6146"
                      filterUnits="userSpaceOnUse"
                      colorInterpolationFilters="sRGB"
                    >
                      <feFlood floodOpacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset dy="3.30729" />
                      <feGaussianBlur stdDeviation="1.65365" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                      />
                      <feBlend
                        mode="normal"
                        in2="BackgroundImageFix"
                        result="effect1_dropShadow_check"
                      />
                      <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect1_dropShadow_check"
                        result="shape"
                      />
                    </filter>
                  </defs>
                </svg>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="text-[#0073EA] font-roboto text-[15px] font-bold">
                  Step 3
                </div>
                <div className="w-[180px] text-[#676879] text-center font-roboto text-[13px] font-normal leading-5">
                  Pick up where you left off - your progress is saved!
                </div>
              </div>
            </div>
          </div>

          {/* Expiry Notice */}
          <div className="text-[#172B4D] text-center font-roboto text-sm">
            The link expires in <span className="font-bold">10 minutes</span>{" "}
            for security.
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center p-4 sm:p-6 border-t border-border bg-white">
          <Button
            onClick={onClose}
            className="h-[38px] px-4 bg-[#0073EA] text-white font-roboto text-[13px] font-medium rounded hover:bg-[#0073EA]/90 transition-colors"
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

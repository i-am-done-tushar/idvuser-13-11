import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
      <DialogContent className="max-w-[800px] p-0 gap-0 bg-white border border-border rounded-lg">
        {/* Header */}
        <DialogHeader className="flex flex-row justify-between items-center p-6 border-b border-border">
          <DialogTitle className="text-[#172B4D] font-figtree text-xl font-bold leading-[30px]">
            How does this work?
          </DialogTitle>
        </DialogHeader>

        {/* Main Content */}
        <div className="flex flex-col items-center gap-6 p-6 bg-white">
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
                  <g clipPath="url(#clip0_qr)">
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
                    <path
                      d="M35.0417 39.5002H41.5V45.9585M29.8879 39.5002H29.875M36.3463 45.9585H36.3333M41.5129 51.1252H41.5M53.1379 39.5002H53.125M29.875 45.9585H31.8125M46.0208 39.5002H48.6042M29.875 51.1252H36.3333M41.5 26.5835V34.3335M48.7333 51.1252H51.0583C51.7818 51.1252 52.1435 51.1252 52.4197 50.9844C52.6628 50.8605 52.8603 50.663 52.9842 50.4199C53.125 50.1436 53.125 49.782 53.125 49.0585V46.7335C53.125 46.01 53.125 45.6484 52.9842 45.3721C52.8603 45.129 52.6628 44.9315 52.4197 44.8076C52.1435 44.6668 51.7818 44.6668 51.0583 44.6668H48.7333C48.0099 44.6668 47.6482 44.6668 47.3719 44.8076C47.1288 44.9315 46.9313 45.129 46.8075 45.3721C46.6667 45.6484 46.6667 46.01 46.6667 46.7335V49.0585C46.6667 49.782 46.6667 50.1436 46.8075 50.4199C46.9313 50.663 47.1288 50.8605 47.3719 50.9844C47.6482 51.1252 48.0099 51.1252 48.7333 51.1252ZM48.7333 34.3335H51.0583C51.7818 34.3335 52.1435 34.3335 52.4197 34.1927C52.6628 34.0689 52.8603 33.8713 52.9842 33.6282C53.125 33.3519 53.125 32.9902 53.125 32.2668V29.9418C53.125 29.2184 53.125 28.8567 52.9842 28.5804C52.8603 28.3374 52.6628 28.1398 52.4197 28.0159C52.1435 27.8752 51.7818 27.8752 51.0583 27.8752H48.7333C48.0099 27.8752 47.6482 27.8752 47.3719 28.0159C47.1288 28.1398 46.9313 28.3374 46.8075 28.5804C46.6667 28.8567 46.6667 29.2184 46.6667 29.9418V32.2668C46.6667 32.9902 46.6667 33.3519 46.8075 33.6282C46.9313 33.8713 47.1288 34.0689 47.3719 34.1927C47.6482 34.3335 48.0099 34.3335 48.7333 34.3335ZM31.9417 34.3335H34.2667C34.9901 34.3335 35.3518 34.3335 35.6281 34.1927C35.8711 34.0689 36.0687 33.8713 36.1926 33.6282C36.3333 33.3519 36.3333 32.9902 36.3333 32.2668V29.9418C36.3333 29.2184 36.3333 28.8567 36.1926 28.5804C36.0687 28.3374 35.8711 28.1398 35.6281 28.0159C35.3518 27.8752 34.9901 27.8752 34.2667 27.8752H31.9417C31.2183 27.8752 30.8566 27.8752 30.5803 28.0159C30.3372 28.1398 30.1396 28.3374 30.0158 28.5804C29.875 28.8567 29.875 29.2184 29.875 29.9418V32.2668C29.875 32.9902 29.875 33.3519 30.0158 33.6282C30.1396 33.8713 30.3372 34.0689 30.5803 34.1927C30.8566 34.3335 31.2183 34.3335 31.9417 34.3335Z"
                      stroke="#323238"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
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
                  </g>
                  <defs>
                    <clipPath id="clip0_qr">
                      <rect width="85" height="125" fill="white" />
                    </clipPath>
                  </defs>
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
              {/* Step 2 Illustration */}
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
              {/* Step 3 Illustration */}
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
        <DialogFooter className="flex justify-end items-center p-6 border-t border-border bg-white">
          <Button
            onClick={onClose}
            className="h-[38px] px-4 bg-[#0073EA] text-white font-roboto text-[13px] font-medium rounded hover:bg-[#0073EA]/90 transition-colors"
          >
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

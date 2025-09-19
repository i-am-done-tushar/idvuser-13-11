import { useState, useRef, useEffect } from "react";

interface OTPVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => void;
  recipientEmail?: string;
  recipientPhone?: string;
  type: "email" | "phone";
  onResend: () => void;
}

export function OTPVerificationDialog({
  isOpen,
  onClose,
  onVerify,
  recipientEmail,
  recipientPhone,
  type,
  onResend,
}: OTPVerificationDialogProps) {
  const [otpValues, setOtpValues] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset OTP values when dialog opens
  useEffect(() => {
    if (isOpen) {
      setOtpValues(["", "", "", "", "", ""]);
      setIsVerifying(false);
      // Focus first input after a short delay to ensure dialog is rendered
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow single digits
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newValues = [...otpValues];
    newValues[index] = value;
    setOtpValues(newValues);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const digits = pastedText.replace(/\D/g, "").slice(0, 6);

    if (digits.length > 0) {
      const newValues = [...otpValues];
      for (let i = 0; i < 6; i++) {
        newValues[i] = digits[i] || "";
      }
      setOtpValues(newValues);

      // Focus next empty input or last filled input
      const nextEmptyIndex = newValues.findIndex((val) => val === "");
      const focusIndex =
        nextEmptyIndex === -1 ? 5 : Math.min(nextEmptyIndex, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleVerify = async () => {
    const otp = otpValues.join("");
    if (otp.length !== 6) return;

    setIsVerifying(true);
    try {
      await onVerify(otp);
    } finally {
      setIsVerifying(false);
    }
  };

  const isOTPComplete = otpValues.every((val) => val !== "");
  const recipient = type === "email" ? recipientEmail : recipientPhone;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-[408px] mx-4 bg-white rounded-lg shadow-xl">
        <div className="flex flex-col p-6 pb-6 gap-2">
          {/* Close Button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="flex w-8 h-8 justify-center items-center rounded-full bg-white hover:bg-gray-50 transition-colors"
              aria-label="Close dialog"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 5L5 15M5 5L15 15"
                  stroke="#676879"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-1 text-center">
              <h2 className="text-text-primary font-roboto text-[28px] font-bold leading-[42px]">
                Enter Verification Code
              </h2>
              <p className="text-text-muted font-roboto text-sm font-normal leading-[22px]">
                We've sent a code to {recipient}
              </p>
            </div>

            {/* OTP Input Group */}
            <div className="flex justify-center gap-2">
              {otpValues.map((value, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-[54px] text-center text-lg font-medium border border-input-border rounded bg-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  aria-label={`Digit ${index + 1}`}
                />
              ))}
            </div>

            {/* Resend Link */}
            <div className="text-center">
              <span className="text-text-muted font-roboto text-sm font-normal">
                Didn't get a code?{" "}
              </span>
              <button
                onClick={onResend}
                className="text-primary font-roboto text-sm font-normal underline hover:text-primary/80 transition-colors"
              >
                Click to Resend
              </button>
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={!isOTPComplete || isVerifying}
              className={`w-full h-12 px-4 flex justify-center items-center gap-2 rounded font-roboto text-base font-bold transition-colors ${
                isOTPComplete && !isVerifying
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-primary/50 text-white cursor-not-allowed"
              }`}
            >
              {isVerifying ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

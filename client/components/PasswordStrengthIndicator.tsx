import { PasswordStrength } from "@/lib/password-validation";

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  onDismiss?: () => void;
}

export function PasswordStrengthIndicator({
  strength,
  onDismiss,
}: PasswordStrengthIndicatorProps) {
  return (
    <div
      className="flex flex-col items-start gap-2 p-2 rounded bg-[#F6F7FB] cursor-pointer transition-opacity hover:opacity-90"
      onClick={onDismiss}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onDismiss?.();
        }
      }}
      aria-label="Password requirements (click to dismiss)"
    >
      <p className="text-xs font-medium text-[#323238] leading-normal">
        Password must contain:
      </p>

      <div className="flex flex-col items-start gap-1">
        <div className="flex items-center gap-1">
          {strength.requirements.minLength ? (
            <svg
              className="w-5 h-5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.5 10L8.5 13L14.5 7"
                stroke="#676879"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.1693 5.83594L5.83594 14.1693M5.83594 5.83594L14.1693 14.1693"
                stroke="#676879"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          <span className="text-xs font-normal leading-5 text-[#676879]">
            At least 8 characters
          </span>
        </div>

        <div className="flex items-center gap-1">
          {strength.requirements.hasUppercase ? (
            <svg
              className="w-5 h-5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.5 10L8.5 13L14.5 7"
                stroke="#676879"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.1693 5.83594L5.83594 14.1693M5.83594 5.83594L14.1693 14.1693"
                stroke="#676879"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          <span className="text-xs font-normal leading-5 text-[#676879]">
            One uppercase letter
          </span>
        </div>

        <div className="flex items-center gap-1">
          {strength.requirements.hasNumber ? (
            <svg
              className="w-5 h-5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.5 10L8.5 13L14.5 7"
                stroke="#676879"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.1693 5.83594L5.83594 14.1693M5.83594 5.83594L14.1693 14.1693"
                stroke="#676879"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          <span className="text-xs font-normal leading-5 text-[#676879]">
            One number
          </span>
        </div>

        <div className="flex items-center gap-1">
          {strength.requirements.hasSpecialChar ? (
            <svg
              className="w-5 h-5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.5 10L8.5 13L14.5 7"
                stroke="#676879"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.1693 5.83594L5.83594 14.1693M5.83594 5.83594L14.1693 14.1693"
                stroke="#676879"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          <span className="text-xs font-normal leading-5 text-[#676879]">
            One special character
          </span>
        </div>
      </div>
    </div>
  );
}

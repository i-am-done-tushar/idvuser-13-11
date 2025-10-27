import { PasswordStrength } from "@/lib/password-validation";

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
}

export function PasswordStrengthIndicator({
  strength,
}: PasswordStrengthIndicatorProps) {
  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700">
            Password Strength
          </label>
          <span
            className={`text-sm font-medium ${
              strength.color === "bg-red-500"
                ? "text-red-600"
                : strength.color === "bg-yellow-500"
                  ? "text-yellow-600"
                  : strength.color === "bg-blue-500"
                    ? "text-blue-600"
                    : "text-green-600"
            }`}
          >
            {strength.label}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${(strength.score + 1) * 25}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-2 bg-gray-50 p-3 rounded-md">
        <p className="text-xs font-semibold text-gray-600 uppercase">
          Requirements
        </p>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-sm">
            <div
              className={`w-4 h-4 rounded flex items-center justify-center ${
                strength.requirements.minLength ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              {strength.requirements.minLength && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <span
              className={
                strength.requirements.minLength
                  ? "text-gray-700"
                  : "text-gray-500"
              }
            >
              At least 8 characters
            </span>
          </li>

          <li className="flex items-center gap-2 text-sm">
            <div
              className={`w-4 h-4 rounded flex items-center justify-center ${
                strength.requirements.hasUppercase
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            >
              {strength.requirements.hasUppercase && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <span
              className={
                strength.requirements.hasUppercase
                  ? "text-gray-700"
                  : "text-gray-500"
              }
            >
              At least 1 uppercase letter
            </span>
          </li>

          <li className="flex items-center gap-2 text-sm">
            <div
              className={`w-4 h-4 rounded flex items-center justify-center ${
                strength.requirements.hasNumber ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              {strength.requirements.hasNumber && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <span
              className={
                strength.requirements.hasNumber
                  ? "text-gray-700"
                  : "text-gray-500"
              }
            >
              At least 1 number
            </span>
          </li>

          <li className="flex items-center gap-2 text-sm">
            <div
              className={`w-4 h-4 rounded flex items-center justify-center ${
                strength.requirements.hasSpecialChar
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            >
              {strength.requirements.hasSpecialChar && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <span
              className={
                strength.requirements.hasSpecialChar
                  ? "text-gray-700"
                  : "text-gray-500"
              }
            >
              At least 1 special character (!@#$%^&*...)
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

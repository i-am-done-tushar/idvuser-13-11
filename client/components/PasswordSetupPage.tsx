import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  validatePassword,
  isPasswordValid,
  passwordsMatch,
} from "@/lib/password-validation";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { useToast } from "@/hooks/use-toast";

export function PasswordSetupPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordStrength = validatePassword(password);
  const isPasswordStrong = isPasswordValid(password);
  const doesPasswordMatch = passwordsMatch(password, confirmPassword);
  const canSubmit = isPasswordStrong && doesPasswordMatch && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password strength
    if (!isPasswordStrong) {
      toast({
        title: "Weak Password",
        description: "Password does not meet security requirements.",
        variant: "destructive",
      });
      return;
    }

    // Validate passwords match
    if (!doesPasswordMatch) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Integrate with backend to save password
      // For now, just simulate a successful save
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Success",
        description: "Your password has been set successfully.",
        duration: 3000,
      });

      // Redirect to dashboard after success
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Password setup error:", error);
      toast({
        title: "Error",
        description: "Failed to set password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen flex-col bg-page-background">
      {/* Header */}
      <div className="flex w-full h-11 items-center px-8 border-b border-[#D0D4E4] bg-white">
        {/* Arcon Logo */}
        <div className="flex items-center gap-2">
          <svg
            width="64"
            height="16"
            viewBox="0 0 64 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.6451 6.27505C20.4605 5.29486 21.4477 4.80469 22.6065 4.80469C23.2074 4.80469 23.76 4.97008 24.2643 5.30072C24.7686 5.63143 25.1548 6.05658 25.4231 6.57622L25.5679 4.96414H27.6281V14.7073H25.5679L25.4231 13.0776C25.1548 13.5972 24.7686 14.0224 24.2643 14.353C23.76 14.6837 23.2074 14.8491 22.6065 14.8491C21.4477 14.8491 20.4605 14.359 19.6451 13.3787C18.8296 12.3867 18.4219 11.1998 18.4219 9.81804C18.4219 8.43624 18.8296 7.25524 19.6451 6.27505ZM21.3833 11.625C21.8339 12.1327 22.3812 12.3867 23.025 12.3867C23.6795 12.3867 24.2321 12.1387 24.6827 11.6426C25.1334 11.1348 25.3587 10.5266 25.3587 9.81804C25.3587 9.10947 25.1334 8.50713 24.6827 8.0111C24.2321 7.50326 23.6795 7.24938 23.025 7.24938C22.3812 7.24938 21.8339 7.50326 21.3833 8.0111C20.9327 8.50713 20.7073 9.10947 20.7073 9.81804C20.7073 10.5266 20.9327 11.1289 21.3833 11.625ZM29.5129 4.96414H31.573L31.734 6.36361C32.2598 5.38342 33.1343 4.89332 34.3575 4.89332C34.6686 4.89332 34.9369 4.91693 35.1622 4.96414L34.6954 7.35568C34.5667 7.33207 34.4755 7.3202 34.4219 7.3202C33.6707 7.3202 33.0431 7.57415 32.5387 8.08199C32.0344 8.57795 31.7823 9.42237 31.7823 10.6152V14.7073H29.5129V4.96414ZM37.3457 6.29279C38.2255 5.31253 39.2932 4.82243 40.5485 4.82243C41.2996 4.82243 42.0025 5.01729 42.657 5.40702C43.3115 5.78495 43.8534 6.29866 44.2825 6.94821L42.4156 8.31227C41.9542 7.67452 41.3319 7.35568 40.5485 7.35568C39.9262 7.35568 39.3951 7.59776 38.9551 8.08199C38.5153 8.56615 38.2953 9.15074 38.2953 9.83578C38.2953 10.5209 38.5153 11.1055 38.9551 11.5897C39.3951 12.0739 39.9262 12.316 40.5485 12.316C41.3319 12.316 41.9542 11.9972 42.4156 11.3597L44.2825 12.7237C43.8534 13.373 43.3115 13.887 42.657 14.2658C42.0025 14.6445 41.2996 14.8339 40.5485 14.8339C39.2932 14.8339 38.2255 14.3438 37.3457 13.3635C36.466 12.3833 36.0261 11.1964 36.0261 9.80278C36.0261 8.40912 36.466 7.27379 37.3457 6.29279ZM46.0871 14.7073V4.96414H48.3565V14.7073H46.0871ZM47.2213 3.5847C46.7283 3.5847 46.3241 3.37718 46.0089 2.96229C45.6936 2.5474 45.536 2.02491 45.536 1.3848C45.536 0.744685 45.6936 0.222192 46.0089 -0.192704C46.3241 -0.607596 46.7283 -0.815115 47.2213 -0.815115C47.7143 -0.815115 48.1185 -0.607596 48.4338 -0.192704C48.749 0.222192 48.9066 0.744685 48.9066 1.3848C48.9066 2.02491 48.749 2.5474 48.4338 2.96229C48.1185 3.37718 47.7143 3.5847 47.2213 3.5847ZM50.3646 14.7073V4.96414H52.4247L52.5695 6.41559C53.0454 5.40896 53.9146 4.90547 55.177 4.90547C56.2916 4.90547 57.1615 5.28999 57.7868 6.05918C58.4121 6.82836 58.7248 7.96859 58.7248 9.47989C58.7248 10.9673 58.4121 12.0999 57.7868 12.8776C57.1615 13.6553 56.2916 14.0441 55.177 14.0441C53.9146 14.0441 53.0454 13.5407 52.5695 12.5341L52.4247 14.7073H50.3646ZM52.6389 9.40968C52.6389 10.1648 52.8576 10.7769 53.2951 11.2461C53.7326 11.7152 54.3183 11.9498 55.052 11.9498C55.7856 11.9498 56.3713 11.7152 56.8088 11.2461C57.2463 10.7769 57.4651 10.1648 57.4651 9.40968C57.4651 8.65457 57.2463 8.04246 56.8088 7.57334C56.3713 7.10422 55.7856 6.86966 55.052 6.86966C54.3183 6.86966 53.7326 7.10422 53.2951 7.57334C52.8576 8.04246 52.6389 8.65457 52.6389 9.40968Z"
              fill="#323238"
            />
            <path
              d="M14.3486 12.736C14.6548 13.3353 14.2196 14.0465 13.5466 14.0465H3.02185C2.3453 14.0465 1.91028 13.3285 2.22355 12.7288L7.54372 2.54495C7.8823 1.89684 8.81128 1.901 9.14404 2.55212L14.3486 12.736Z"
              stroke="#D83A52"
              strokeWidth="2.42826"
            />
          </svg>
        </div>

        {/* Divider */}
        <div className="w-[1px] h-5 bg-[#D0D4E4] mx-2" />

        {/* Rippling Logo */}
        <div className="flex items-center justify-center">
          <svg
            width="80"
            height="23"
            viewBox="0 0 80 23"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_2641_13989)">
              <path
                d="M1.79875 10.2148C1.79875 8.97716 1.17188 7.95455 0 7.0957H2.72375C3.2039 7.46144 3.59293 7.93332 3.86041 8.47442C4.1279 9.01552 4.26659 9.61118 4.26563 10.2148C4.26659 10.8184 4.1279 11.4141 3.86041 11.9552C3.59293 12.4963 3.2039 12.9682 2.72375 13.3339C3.60813 13.7027 4.11125 14.6028 4.11125 15.8911V18.3457H1.645V15.8911C1.645 14.664 1.05938 13.8052 0.000625 13.3345C1.1725 12.4751 1.79875 11.4524 1.79875 10.2148ZM7.14375 10.2148C7.14375 8.97716 6.51688 7.95455 5.345 7.0957H8.06938C8.54941 7.46151 8.93832 7.93341 9.20569 8.47451C9.47307 9.01561 9.61166 9.61123 9.61063 10.2148C9.61166 10.8184 9.47307 11.414 9.20569 11.9551C8.93832 12.4962 8.54941 12.9681 8.06938 13.3339C8.95313 13.7027 9.45688 14.6028 9.45688 15.8911V18.3457H6.99V15.8911C6.99 14.664 6.40375 13.8052 5.345 13.3345C6.51688 12.4751 7.14375 11.4524 7.14375 10.2148ZM12.49 10.2148C12.49 8.97716 11.8631 7.95455 10.6913 7.0957H13.415C13.8951 7.46144 14.2842 7.93332 14.5517 8.47442C14.8191 9.01552 14.9578 9.61118 14.9569 10.2148C14.9578 10.8184 14.8191 11.4141 14.5517 11.9552C14.2842 12.4963 13.8951 12.9682 13.415 13.3339C14.2994 13.7027 14.8025 14.6028 14.8025 15.8911V18.3457H12.3356V15.8911C12.3356 14.664 11.75 13.8052 10.6913 13.3345C11.8631 12.4751 12.49 11.4524 12.49 10.2148ZM22.47 16.3017H20.6V9.14093H25.195C27.405 9.14093 28.4944 9.95977 28.4944 11.2993C28.4944 12.2094 27.96 12.8945 26.9631 13.2426C27.9906 13.3958 28.4531 13.9377 28.4531 14.9097V16.3005H26.5619V14.9916C26.5619 14.1727 26.1506 13.8477 25.3438 13.8477H22.47V16.3017ZM22.47 11.5989V12.7563H24.8663C25.3188 12.7563 25.6581 12.5577 25.6581 12.1768C25.6581 11.796 25.3188 11.5989 24.8663 11.5989H22.47ZM30.5238 16.3017V9.14093H34.2944C36.2038 9.14093 37.1906 10.075 37.1906 11.6486C37.1906 13.2222 36.2038 14.1494 34.2944 14.1494H32.4119V16.3017H30.5238ZM32.4119 11.5989V12.7563H34.0594C34.7206 12.7563 35.0763 12.4525 35.0763 11.6749C35.0763 10.8973 34.7206 10.5989 34.0594 10.5989H32.4119V11.5989ZM39.7119 16.3017V9.14093H41.6V14.5239H46.5119V16.3017H39.7119ZM48.0075 16.3017V9.14093H52.0906C54.1263 9.14093 55.45 10.3701 55.45 12.2277C55.45 14.0854 54.1263 15.3146 52.0906 15.3146H49.8956V16.3017H48.0075ZM49.8956 10.7681V13.6926H51.9313C52.9788 13.6926 53.5294 13.0725 53.5294 12.2222C53.5294 11.372 52.9788 10.7681 51.9313 10.7681H49.8956ZM57.1406 16.3017V9.14093H61.2188C63.2544 9.14093 64.5781 10.3701 64.5781 12.2277C64.5781 14.0854 63.2544 15.3146 61.2188 15.3146H59.0244V16.3017H57.1406ZM59.0244 10.7681V13.6926H61.0581C62.1056 13.6926 62.6562 13.0725 62.6562 12.2222C62.6562 11.372 62.1056 10.7681 61.0581 10.7681H59.0244Z"
                fill="black"
              />
            </g>
            <defs>
              <clipPath id="clip0_2641_13989">
                <rect width="79.6875" height="22.5" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex w-full max-w-4xl justify-center items-center">
          <div className="flex w-full max-w-[512px] flex-col gap-8 rounded-2xl bg-white p-8 shadow-sm border border-[#E8EBF5]">
            {/* Header */}
            <div className="flex flex-col gap-2">
              <h1 className="text-[#172B4D] font-roboto text-[28px] font-bold leading-tight">
                Set Your Password
              </h1>
              <p className="text-[#676879] font-roboto text-sm font-normal leading-normal">
                Create a strong password to secure your account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter a strong password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0m7.6 0a10.05 10.05 0 011.563 4.803m-5.596 3.856a4.872 4.872 0 005.049-7.52M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <PasswordStrengthIndicator strength={passwordStrength} />
              )}

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                      confirmPassword && !doesPasswordMatch
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-indigo-500"
                    }`}
                    placeholder="Confirm your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0m7.6 0a10.05 10.05 0 011.563 4.803m-5.596 3.856a4.872 4.872 0 005.049-7.52M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {confirmPassword && !doesPasswordMatch && (
                  <p className="text-sm text-red-600">
                    Passwords do not match.
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!canSubmit}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                  canSubmit
                    ? "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Setting Password...
                  </span>
                ) : (
                  "Set Password"
                )}
              </button>
            </form>

            {/* Additional Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">💡 Tip:</span> Use a unique
                password that you haven't used elsewhere. This helps keep your
                account secure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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

    if (!isPasswordStrong) {
      toast({
        title: "Weak Password",
        description: "Password does not meet security requirements.",
        variant: "destructive",
      });
      return;
    }

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
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Success",
        description: "Your password has been set successfully.",
        duration: 3000,
      });

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
    <div className="w-screen min-h-screen bg-white flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-[607px] flex-col relative bg-white overflow-hidden flex-shrink-0 h-full">
        {/* Background Blobs */}
        <div className="absolute inset-0">
          <svg
            className="absolute left-[190px] top-[214px] w-[279px] h-[123px] opacity-80"
            width="404"
            height="236"
            viewBox="0 0 404 236"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g opacity="0.8">
              <g filter="url(#filter0_f_blob1)">
                <ellipse
                  cx="250.058"
                  cy="117.553"
                  rx="85.3719"
                  ry="45.8769"
                  transform="rotate(-12.3921 250.058 117.553)"
                  fill="#F8E4E8"
                  fillOpacity="0.5"
                />
              </g>
              <g filter="url(#filter1_f_blob1)">
                <ellipse
                  cx="142.087"
                  cy="112.195"
                  rx="88.956"
                  ry="49.0935"
                  transform="rotate(-12.3921 142.087 112.195)"
                  fill="#E0EFFE"
                  fillOpacity="0.5"
                />
              </g>
            </g>
            <defs>
              <filter
                id="filter0_f_blob1"
                x="96.9561"
                y="0"
                width="306.205"
                height="235.107"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="BackgroundImageFix"
                  result="shape"
                />
                <feGaussianBlur
                  stdDeviation="34.5659"
                  result="effect1_foregroundBlur_blob1"
                />
              </filter>
              <filter
                id="filter1_f_blob1"
                x="0.000492096"
                y="6.01343"
                width="284.173"
                height="212.364"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="BackgroundImageFix"
                  result="shape"
                />
                <feGaussianBlur
                  stdDeviation="27.2791"
                  result="effect1_foregroundBlur_blob1"
                />
              </filter>
            </defs>
          </svg>

          <div className="absolute left-[-96px] top-0 w-[677px] h-[643px]">
            <svg
              className="absolute left-[335px] top-[301px] w-[342px] h-[342px]"
              width="802"
              height="697"
              viewBox="0 0 802 697"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g filter="url(#filter0_f_blob2)">
                <circle cx="401" cy="401" r="171" fill="#BCD2E8" />
              </g>
              <defs>
                <filter
                  id="filter0_f_blob2"
                  x="0"
                  y="0"
                  width="802"
                  height="802"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  />
                  <feGaussianBlur
                    stdDeviation="115"
                    result="effect1_foregroundBlur_blob2"
                  />
                </filter>
              </defs>
            </svg>
            <svg
              className="absolute left-0 top-0 w-[465px] h-[397px]"
              width="529"
              height="557"
              viewBox="0 0 529 557"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g filter="url(#filter0_f_blob3)">
                <ellipse
                  cx="136.5"
                  cy="198.5"
                  rx="232.5"
                  ry="198.5"
                  fill="#E0EFFE"
                />
              </g>
              <defs>
                <filter
                  id="filter0_f_blob3"
                  x="-256"
                  y="-160"
                  width="785"
                  height="717"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  />
                  <feGaussianBlur
                    stdDeviation="80"
                    result="effect1_foregroundBlur_blob3"
                  />
                </filter>
              </defs>
            </svg>
          </div>
        </div>

        {/* Illustration - Placeholder for identity verification graphic */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative w-[252px] h-[318px]">
            {/* Card backgrounds */}
            <div
              className="absolute w-[252px] h-[318px] rounded-3xl border border-black/10 bg-gradient-to-br from-[#E0EFFE] via-[#F3CFFF] to-[#F3CFFF]"
              style={{ transform: "rotate(6.554deg)" }}
            />
            <div className="absolute w-[252px] h-[318px] rounded-3xl border border-black/10 bg-white backdrop-blur-[7.5px]" />

            {/* Success checkmark */}
            <svg
              className="absolute right-[-36px] top-4 w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1ZM17.2071 9.70711C17.5976 9.31658 17.5976 8.68342 17.2071 8.29289C16.8166 7.90237 16.1834 7.90237 15.7929 8.29289L10.5 13.5858L8.20711 11.2929C7.81658 10.9024 7.18342 10.9024 6.79289 11.2929C6.40237 11.6834 6.40237 12.3166 6.79289 12.7071L9.79289 15.7071C10.1834 16.0976 10.8166 16.0976 11.2071 15.7071L17.2071 9.70711Z"
                fill="#258750"
              />
            </svg>

            {/* Blue bar inside card */}
            <div className="absolute left-8 top-14 w-[185px] h-[130px] rounded-2xl bg-[#E0EFFE]" />
          </div>
        </div>

        {/* Bottom Text */}
        <div className="absolute bottom-[130px] left-1/2 -translate-x-1/2 w-[461px]">
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-[#323238] text-center font-roboto text-[32px] font-bold leading-[120%]">
              Secure your account.
            </h2>
            <p className="text-[#676879] text-center font-roboto text-[13px] font-medium leading-[20px]">
              Create a strong password to protect your verified identity.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header with Logo */}
        <div className="flex items-center justify-center h-14 gap-[33.246px] pt-[84px] pb-6">
          <svg
            className="w-[124px] h-[25.176px]"
            width="126"
            height="27"
            viewBox="0 0 126 27"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M37.0043 10.1061C38.6231 8.32663 40.5827 7.43677 42.8831 7.43677C44.0759 7.43677 45.1729 7.73702 46.1739 8.33728C47.175 8.93766 47.9418 9.70947 48.4743 10.6528L48.7618 7.72625H52.8515V25.4143H48.7618L48.4743 22.4556C47.9418 23.3989 47.175 24.1708 46.1739 24.771C45.1729 25.3714 44.0759 25.6715 42.8831 25.6715C40.5827 25.6715 38.6231 24.7818 37.0043 23.0022C35.3855 21.2013 34.5762 19.0465 34.5762 16.5381C34.5762 14.0296 35.3855 11.8856 37.0043 10.1061ZM40.4548 19.8185C41.3495 20.7403 42.4358 21.2013 43.7138 21.2013C45.0131 21.2013 46.1101 20.7511 47.0045 19.8505C47.8992 18.9286 48.3465 17.8245 48.3465 16.5381C48.3465 15.2518 47.8992 14.1583 47.0045 13.2577C46.1101 12.3358 45.0131 11.8749 43.7138 11.8749C42.4358 11.8749 41.3495 12.3358 40.4548 13.2577C39.5603 14.1583 39.113 15.2518 39.113 16.5381C39.113 17.8245 39.5603 18.918 40.4548 19.8185ZM56.593 7.72625H60.6826L61.0021 10.2669C62.0458 8.48741 63.7818 7.59767 66.2099 7.59767C66.8277 7.59767 67.3601 7.64053 67.8074 7.72625L66.8808 12.0679C66.6252 12.025 66.4442 12.0035 66.3378 12.0035C64.8467 12.0035 63.6007 12.4645 62.5996 13.3865C61.5985 14.2868 61.098 15.8198 61.098 17.9852V25.4143H56.593V7.72625ZM72.1419 10.1383C73.8884 8.35871 76.0078 7.46897 78.4999 7.46897C79.9908 7.46897 81.386 7.82274 82.6853 8.53026C83.9846 9.21636 85.0603 10.1489 85.9122 11.3282L82.2061 13.8045C81.2902 12.6467 80.0548 12.0679 78.4999 12.0679C77.2645 12.0679 76.2101 12.5074 75.3368 13.3865C74.4636 14.2654 74.0269 15.3267 74.0269 16.5703C74.0269 17.8352 74.4636 18.9072 75.3368 19.7863C76.2101 20.6653 77.2645 21.1048 78.4999 21.1048C80.14 21.1048 81.3966 20.4616 82.27 19.1752L86.008 21.6836C85.1774 22.9058 84.1018 23.8813 82.7811 24.6102C81.4606 25.3392 80.0335 25.7037 78.4999 25.7037C76.0078 25.7037 73.8778 24.8139 72.1099 23.0344C70.3633 21.2335 69.49 19.0787 69.49 16.5703C69.49 14.0618 70.374 11.9178 72.1419 10.1383ZM90.5504 10.1383C92.2971 8.35871 94.4163 7.46897 96.9085 7.46897C99.4005 7.46897 101.531 8.36948 103.298 10.1704C105.088 11.95 105.982 14.0832 105.982 16.5703C105.982 19.0787 105.098 21.2227 103.33 23.0022C101.541 24.8032 99.4005 25.7037 96.9085 25.7037C94.4163 25.7037 92.2864 24.8139 90.5185 23.0344C88.7718 21.2335 87.8986 19.0787 87.8986 16.5703C87.8986 14.0618 88.7826 11.9178 90.5504 10.1383ZM92.4355 16.5703C92.4355 17.8352 92.8721 18.9072 93.7454 19.7863C94.6188 20.6653 95.673 21.1048 96.9085 21.1048C98.1652 21.1048 99.2301 20.6653 100.103 19.7863C100.977 18.9072 101.413 17.8352 101.413 16.5703C101.413 15.3267 100.977 14.2654 100.103 13.3865C99.2301 12.5074 98.1652 12.0679 96.9085 12.0679C95.673 12.0679 94.6188 12.5074 93.7454 13.3865C92.8721 14.2654 92.4355 15.3267 92.4355 16.5703ZM108.855 25.4143V7.72625H112.944L113.232 10.2991C113.743 9.44142 114.414 8.75533 115.245 8.24079C116.097 7.70482 117.055 7.43677 118.12 7.43677C120.25 7.43677 121.933 8.1765 123.168 9.65584C124.425 11.1352 125.053 13.3757 125.053 16.3773V25.4143H120.58V16.3773C120.58 14.898 120.229 13.7831 119.526 13.0327C118.844 12.2609 117.992 11.8749 116.97 11.8749C115.926 11.8749 115.064 12.2609 114.382 13.0327C113.7 13.7831 113.36 14.898 113.36 16.3773V25.4143H108.855Z"
              fill="#323238"
            />
            <path
              d="M26.425 21.7199C27.0492 22.8369 26.2417 24.213 24.9622 24.213H3.93975C2.65324 24.213 1.84661 22.8233 2.48474 21.7062L13.1115 3.10326C13.7582 1.97113 15.3932 1.97882 16.0293 3.11699L26.425 21.7199Z"
              stroke="#D83A52"
              strokeWidth="4.5177"
            />
          </svg>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-[360px]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Heading */}
              <div className="flex flex-col justify-center items-center gap-0">
                <h1 className="text-[#172B4D] text-center font-roboto text-[28px] font-extrabold leading-[42px]">
                  Set Your Password
                </h1>
                <p className="text-[#676879] text-center font-roboto text-[14px] font-normal leading-[22px]">
                  Create a strong password to secure your account
                </p>
              </div>

              {/* New Password Field */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="password"
                  className="text-[#323238] font-roboto text-[13px] font-medium leading-normal"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-[54px] px-3 py-[15px] border border-[#C3C6D4] rounded bg-white text-[#323238] font-roboto text-base leading-5 placeholder:text-[#676879] focus:outline-none focus:ring-2 focus:ring-[#0073EA] focus:border-transparent"
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
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-[#323238] font-roboto text-[13px] font-medium leading-normal"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full h-[54px] px-3 py-[15px] border rounded bg-white text-[#323238] font-roboto text-base leading-5 placeholder:text-[#676879] focus:outline-none focus:ring-2 focus:border-transparent ${
                      confirmPassword && !doesPasswordMatch
                        ? "border-red-300 focus:ring-red-500"
                        : "border-[#C3C6D4] focus:ring-[#0073EA]"
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
                className={`w-full h-12 px-4 py-[11px] rounded bg-[#0073EA] flex items-center justify-center gap-2 transition-colors ${
                  canSubmit
                    ? "hover:bg-[#0062c7] cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                <span className="text-white font-roboto text-base font-bold leading-normal">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
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
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

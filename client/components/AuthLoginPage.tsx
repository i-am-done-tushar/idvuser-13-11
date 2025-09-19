import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Country = { code: string; name: string; length?: number; min?: number; max?: number };

const COUNTRIES: Country[] = [
  { code: "+91", name: "India", length: 10 },
  { code: "+1", name: "United States", length: 10 },
  { code: "+44", name: "United Kingdom", length: 10 },
  { code: "+61", name: "Australia", length: 9 },
  { code: "+49", name: "Germany", length: 10 },
  { code: "+33", name: "France", length: 9 },
  { code: "+55", name: "Brazil", length: 11 },
];

export function AuthLoginPage() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [emailError, setEmailError] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [countryError, setCountryError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const navigate = useNavigate();

  const handleSendOTP = () => {
    const trimmed = emailOrPhone.trim();

    if (mode === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!trimmed || !emailRegex.test(trimmed)) {
        setEmailError("Please enter a valid email address.");
        return;
      }
      navigate("/auth/otp", { state: { emailOrPhone: trimmed } });
      return;
    }

    // phone mode validations
    if (!selectedCountry) {
      setCountryError("Please select a country code.");
      return;
    }
    setCountryError("");

    if (!trimmed) {
      setPhoneError("Please enter a valid phone number.");
      return;
    }

    const country = COUNTRIES.find((c) => c.code === selectedCountry);
    const digits = trimmed.replace(/\D/g, "");

    if (!digits) {
      setPhoneError("Please enter a valid phone number.");
      return;
    }

    // length validation
    if (country && country.length !== undefined) {
      if (digits.length !== country.length) {
        setPhoneError("Please enter a valid phone number.");
        return;
      }
    } else {
      // fallback: accept 7-15 digits
      if (digits.length < 7 || digits.length > 15) {
        setPhoneError("Please enter a valid phone number.");
        return;
      }
    }

    setPhoneError("");
    // send with country code prefixed
    navigate("/auth/otp", { state: { emailOrPhone: `${selectedCountry}${digits}` } });
  };

  return (
    <div className="flex w-full min-h-screen bg-white">
      {/* Left Section - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-white">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          {/* Gradient blurs */}
          <div className="absolute w-[342px] h-[342px] rounded-full bg-[#BCD2E8] blur-[115px] left-[239px] top-[301px]" />
          <div className="absolute w-[465px] h-[397px] rounded-full bg-[#E0EFFE] blur-[80px] left-0 top-0" />

          {/* Cards */}
          <div className="absolute w-[252px] h-[318px] rounded-3xl border border-black/10 bg-gradient-to-br from-[#E0EFFE] via-[#F3CFFF] to-[#F3CFFF] backdrop-blur-[7.5px] transform rotate-[6.554deg] left-[275px] top-[140px]" />
          <div className="absolute w-[252px] h-[318px] rounded-3xl border border-black/10 bg-white backdrop-blur-[7.5px] left-[276px] top-[150px]" />

          {/* Identity verification visual elements */}
          <div className="absolute w-[185px] h-[130px] rounded-2xl bg-[#E0EFFE] left-[309px] top-[205px]" />

          {/* Check circle icon */}
          <svg
            className="absolute w-6 h-6 left-[488px] top-[166px]"
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

          {/* Decorative dashed lines */}
          <svg
            className="absolute w-[145px] h-[121px] left-[466px] top-[140px]"
            viewBox="0 0 147 123"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M54.5 7.99954C83 -7.00098 150.09 0.513069 145.701 45.8941C141.318 91.2094 66.3066 105.225 1 122.126"
              stroke="black"
              strokeOpacity="0.44"
              strokeDasharray="2 2"
            />
          </svg>
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-24 left-20 right-20 text-center">
          <h2 className="text-[#172B4D] font-roboto text-[32px] font-bold leading-tight mb-6">
            Proof of identity, made simple.
          </h2>
          <p className="text-[#676879] font-roboto text-[13px] font-normal leading-5">
            Easily verify your identity in seconds with our secure and seamless
            process.
          </p>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="flex-1 lg:w-1/2 flex flex-col">
        {/* Background elements for mobile */}
        <div className="lg:hidden absolute inset-0 overflow-hidden">
          <div className="absolute w-[279px] h-[123px] transform -rotate-12 opacity-80 left-[190px] top-[214px]">
            <div className="absolute inset-0 bg-gradient-to-r from-[#F8E4E8] to-transparent opacity-50 rounded-full blur-[35px]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#E0EFFE] to-transparent opacity-50 rounded-full blur-[27px]" />
          </div>
        </div>

        {/* Header */}
        <div className="flex justify-center items-center h-14 border-b border-[#D0D4E4] px-8 relative z-10">
          <svg
            width="124"
            height="25"
            viewBox="0 0 126 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M37.9516 10.9901C39.5704 9.21066 41.53 8.3208 43.8304 8.3208C45.0232 8.3208 46.1201 8.62106 47.1212 9.22131C48.1223 9.82169 48.889 10.5935 49.4216 11.5369L49.7091 8.61028H53.7987V26.2983H49.7091L49.4216 23.3396C48.889 24.283 48.1223 25.0548 47.1212 25.655C46.1201 26.2554 45.0232 26.5556 43.8304 26.5556C41.53 26.5556 39.5704 25.6658 37.9516 23.8862C36.3328 22.0853 35.5234 19.9306 35.5234 17.4221C35.5234 14.9136 36.3328 12.7696 37.9516 10.9901ZM41.4021 20.7025C42.2967 21.6243 43.3831 22.0853 44.661 22.0853C45.9604 22.0853 47.0573 21.6351 47.9518 20.7346C48.8464 19.8126 49.2938 18.7085 49.2938 17.4221C49.2938 16.1358 48.8464 15.0423 47.9518 14.1418C47.0573 13.2198 45.9604 12.7589 44.661 12.7589C43.3831 12.7589 42.2967 13.2198 41.4021 14.1418C40.5076 15.0423 40.0603 16.1358 40.0603 17.4221C40.0603 18.7085 40.5076 19.802 41.4021 20.7025ZM57.5403 8.61028H61.6298L61.9494 11.1509C62.9931 9.37144 64.729 8.48171 67.1572 8.48171C67.7749 8.48171 68.3074 8.52456 68.7547 8.61028L67.8281 12.9519C67.5725 12.9091 67.3915 12.8875 67.285 12.8875C65.794 12.8875 64.548 13.3485 63.5468 14.2705C62.5457 15.1709 62.0453 16.7038 62.0453 18.8693V26.2983H57.5403V8.61028ZM73.0891 11.0223C74.8357 9.24274 76.9551 8.35301 79.4471 8.35301C80.9381 8.35301 82.3333 8.70677 83.6325 9.4143C84.9319 10.1004 86.0075 11.033 86.8595 12.2122L83.1533 14.6885C82.2374 13.5308 81.0021 12.9519 79.4471 12.9519C78.2118 12.9519 77.1574 13.3914 76.2841 14.2705C75.4109 15.1494 74.9741 16.2107 74.9741 17.4543C74.9741 18.7193 75.4109 19.7912 76.2841 20.6703C77.1574 21.5494 78.2118 21.9888 79.4471 21.9888C81.0872 21.9888 82.3439 21.3456 83.2172 20.0593L86.9553 22.5677C86.1247 23.7899 85.049 24.7653 83.7284 25.4943C82.4079 26.2232 80.9808 26.5878 79.4471 26.5878C76.9551 26.5878 74.8251 25.6979 73.0571 23.9184C71.3106 22.1175 70.4373 19.9628 70.4373 17.4543C70.4373 14.9458 71.3213 12.8018 73.0891 11.0223ZM91.4977 11.0223C93.2443 9.24274 95.3636 8.35301 97.8558 8.35301C100.348 8.35301 102.478 9.25352 104.246 11.0544C106.035 12.834 106.929 14.9672 106.929 17.4543C106.929 19.9628 106.046 22.1068 104.278 23.8862C102.488 25.6873 100.348 26.5878 97.8558 26.5878C95.3636 26.5878 93.2336 25.6979 91.4658 23.9184C89.7191 22.1175 88.8459 19.9628 88.8459 17.4543C88.8459 14.9458 89.7298 12.8018 91.4977 11.0223ZM93.3828 17.4543C93.3828 18.7193 93.8194 19.7912 94.6927 20.6703C95.566 21.5494 96.6203 21.9888 97.8558 21.9888C99.1124 21.9888 100.177 21.5494 101.051 20.6703C101.924 19.7912 102.361 18.7193 102.361 17.4543C102.361 16.2107 101.924 15.1494 101.051 14.2705C100.177 13.3914 99.1124 12.9519 97.8558 12.9519C96.6203 12.9519 95.566 13.3914 94.6927 14.2705C93.8194 15.1494 93.3828 16.2107 93.3828 17.4543ZM109.802 26.2983V8.61028H113.892L114.179 11.1831C114.69 10.3255 115.361 9.63936 116.192 9.12482C117.044 8.58885 118.002 8.3208 119.067 8.3208C121.197 8.3208 122.88 9.06053 124.116 10.5399C125.372 12.0192 126 14.2597 126 17.2614V26.2983H121.527V17.2614C121.527 15.782 121.176 14.6671 120.473 13.9167C119.792 13.1449 118.94 12.7589 117.917 12.7589C116.873 12.7589 116.011 13.1449 115.329 13.9167C114.648 14.6671 114.307 15.782 114.307 17.2614V26.2983H109.802Z"
              fill="#323238"
            />
            <path
              d="M27.3723 22.6039C27.9964 23.7209 27.189 25.097 25.9095 25.097H4.88702C3.6005 25.097 2.79387 23.7073 3.43201 22.5902L14.0587 3.98729C14.7055 2.85516 16.3405 2.86285 16.9765 4.00102L27.3723 22.6039Z"
              stroke="#D83A52"
              strokeWidth="4.5177"
            />
          </svg>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-8 relative z-10">
          <div className="w-full max-w-[360px]">
            <div className="flex flex-col gap-6">
              {/* Heading */}
              <div className="text-center space-y-2">
                <h1 className="text-[#172B4D] font-roboto text-[28px] font-bold leading-[42px]">
                  Welcome back!
                </h1>
                <p className="text-[#676879] font-roboto text-sm font-normal leading-[22px]">
                  Get a login code via email or mobile.
                </p>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {/* Mode toggle */}
                <div className="flex items-center gap-2 bg-[#F6F7FB] rounded p-1 w-full">
                  <button
                    type="button"
                    onClick={() => { setMode("email"); setEmailError(""); setEmailOrPhone(""); }}
                    className={`flex-1 h-10 rounded text-sm font-medium ${mode === "email" ? "bg-white shadow text-[#172B4D]" : "text-[#676879]"}`}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode("phone"); setEmailError(""); setEmailOrPhone(""); }}
                    className={`flex-1 h-10 rounded text-sm font-medium ${mode === "phone" ? "bg-white shadow text-[#172B4D]" : "text-[#676879]"}`}
                  >
                    Mobile
                  </button>
                </div>

                {/* Input Field */}
                <div className="space-y-2">
                  <label className="block text-[#323238] font-roboto text-[13px] font-medium">
                    {mode === "email" ? "Email Address" : "Mobile Number"}
                  </label>
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Trim leading/trailing spaces automatically
                      const trimmed = val.trimStart();
                      // We keep trailing spaces while typing but remove starting spaces immediately
                      setEmailOrPhone(trimmed);
                      if (mode === "email") setEmailError("");
                    }}
                    onBlur={() => {
                      // Trim trailing spaces on blur and validate if email mode
                      const trimmed = emailOrPhone.trim();
                      setEmailOrPhone(trimmed);
                      if (mode === "email") {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(trimmed)) {
                          setEmailError("Please enter a valid email address.");
                        } else {
                          setEmailError("");
                        }
                      }
                    }}
                    placeholder={mode === "email" ? "example@domain.com" : "Enter mobile number"
                    }
                    className="w-full h-[54px] px-3 py-4 border border-[#C3C6D4] rounded bg-white text-[#676879] font-roboto text-base placeholder:text-[#676879] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {emailError && (
                    <p className="text-sm text-destructive mt-1">{emailError}</p>
                  )}
                </div>

                {/* Send OTP Button */}
                <button
                  onClick={() => {
                    // Ensure trimming and validation before sending
                    const trimmed = emailOrPhone.trim();
                    setEmailOrPhone(trimmed);
                    if (mode === "email") {
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (!trimmed || !emailRegex.test(trimmed)) {
                        setEmailError("Please enter a valid email address.");
                        return;
                      }
                    }
                    // For phone mode we simply require non-empty input
                    if (!trimmed) return;
                    navigate("/auth/otp", { state: { emailOrPhone: trimmed } });
                  }}
                  disabled={mode === "email" ? !emailOrPhone.trim() || !!emailError : !emailOrPhone.trim()}
                  className={`w-full h-12 px-4 py-3 rounded font-roboto text-base font-bold transition-colors ${
                    emailOrPhone.trim()
                      ? "bg-primary hover:bg-primary/90 text-white"
                      : "bg-primary/50 text-white cursor-not-allowed"
                  }`}
                >
                  Send OTP
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile bottom content */}
        <div className="lg:hidden p-8 text-center relative z-10">
          <h2 className="text-[#172B4D] font-roboto text-[32px] font-bold leading-tight mb-6">
            Proof of identity, made simple.
          </h2>
          <p className="text-[#676879] font-roboto text-[13px] font-normal leading-5">
            Easily verify your identity in seconds with our secure and seamless
            process.
          </p>
        </div>
      </div>
    </div>
  );
}

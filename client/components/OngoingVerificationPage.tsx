import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OngoingVerificationCard } from "./OngoingVerificationCard";

interface VerificationItem {
  id: string;
  title: string;
  documentType: string;
  progress: number;
  expiryDate: string;
  status: "in-progress" | "not-started";
}

const notStartedVerifications: VerificationItem[] = [
  {
    id: "1",
    title: "Employment Verification",
    documentType: "Employee ID Card",
    progress: 0,
    expiryDate: "Oct 10, 2025",
    status: "not-started",
  },
  {
    id: "2",
    title: "Employment Verification",
    documentType: "Employee ID Card",
    progress: 0,
    expiryDate: "Oct 10, 2025",
    status: "not-started",
  },
];

const inProgressVerifications: VerificationItem[] = [
  {
    id: "3",
    title: "Employment Verification",
    documentType: "Employee ID Card",
    progress: 15,
    expiryDate: "Oct 10, 2025",
    status: "in-progress",
  },
  {
    id: "4",
    title: "Employment Verification",
    documentType: "Employee ID Card",
    progress: 15,
    expiryDate: "Oct 9, 2025",
    status: "in-progress",
  },
  {
    id: "5",
    title: "Employment Verification",
    documentType: "Employee ID Card",
    progress: 15,
    expiryDate: "Oct 2, 2025",
    status: "in-progress",
  },
  {
    id: "6",
    title: "Employment Verification",
    documentType: "Employee ID Card",
    progress: 15,
    expiryDate: "Sept 28, 2025",
    status: "in-progress",
  },
  {
    id: "7",
    title: "Employment Verification",
    documentType: "Employee ID Card",
    progress: 15,
    expiryDate: "Sept 20, 2025",
    status: "in-progress",
  },
  {
    id: "8",
    title: "Employment Verification",
    documentType: "Employee ID Card",
    progress: 15,
    expiryDate: "Sept 10, 2025",
    status: "in-progress",
  },
];

export function OngoingVerificationPage() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("home");

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: (isActive: boolean) => (
        <svg
          className="w-5 h-5"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.56194 1.11261C9.84719 1.03538 10.1479 1.03538 10.4331 1.11261C10.7642 1.20227 11.043 1.42115 11.2655 1.59584C13.185 3.10283 15.1164 4.59457 17.0444 6.09074C17.3583 6.33431 17.6348 6.5489 17.8408 6.82749C18.0216 7.07197 18.1564 7.3474 18.2383 7.64023C18.3317 7.97391 18.3314 8.32392 18.3309 8.72123C18.3288 10.769 18.3309 12.8167 18.3309 14.8645C18.3309 15.3037 18.3309 15.6826 18.3054 15.9948C18.2784 16.3243 18.219 16.652 18.0584 16.9673C17.8187 17.4376 17.4362 17.8201 16.9659 18.0598C16.6505 18.2205 16.3229 18.2799 15.9934 18.3068C15.3254 18.3614 14.6479 18.332 13.9782 18.3323C13.8789 18.3323 13.7604 18.3324 13.656 18.3239C13.5349 18.314 13.3616 18.2886 13.18 18.1961C12.9449 18.0762 12.7536 17.885 12.6338 17.6498C12.5412 17.4681 12.5159 17.2948 12.5059 17.1738C12.4974 17.0694 12.4974 16.9508 12.4975 16.8516L12.5041 12.1881C12.5048 11.7207 12.505 11.4871 12.4144 11.3086C12.3345 11.1516 12.207 11.0238 12.0501 10.9438C11.8717 10.8528 11.638 10.8528 11.1708 10.8528H8.83752C8.37144 10.8528 8.13836 10.8528 7.96023 10.9435C7.80354 11.0232 7.67609 11.1505 7.59611 11.3071C7.50519 11.4851 7.50485 11.7181 7.50419 12.1842L7.49751 16.8516C7.49755 16.9508 7.4976 17.0694 7.48906 17.1738C7.47918 17.2948 7.45381 17.4681 7.36127 17.6498C7.24143 17.885 7.0502 18.0762 6.815 18.1961C6.63338 18.2886 6.46005 18.314 6.33904 18.3239C6.2346 18.3324 6.11606 18.3323 6.0168 18.3323C5.34706 18.332 4.66959 18.3614 4.00165 18.3068C3.6722 18.2799 3.34452 18.2205 3.0292 18.0598C2.5588 17.8201 2.17635 17.4376 1.93666 16.9673C1.776 16.652 1.71657 16.3243 1.68965 15.9948C1.66415 15.6826 1.66416 15.3037 1.66418 14.8644C1.66418 12.8166 1.66633 10.7689 1.66412 8.72123C1.66369 8.32392 1.66331 7.97391 1.75671 7.64023C1.83868 7.3474 1.97339 7.07197 2.15421 6.82749C2.36026 6.5489 2.63677 6.33431 2.95063 6.09075C4.87849 4.59464 6.8101 3.1028 8.72952 1.59584C8.95202 1.42115 9.23077 1.20227 9.56194 1.11261Z"
            fill={isActive ? "#0073EA" : "#676879"}
          />
        </svg>
      ),
      onClick: () => navigate("/dashboard"),
    },
    {
      id: "ongoing",
      label: "Ongoing Verification",
      icon: (isActive: boolean) => (
        <svg
          className="w-5 h-5"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18.9167 9.58333L17.2504 11.25L15.5833 9.58333M17.4543 10.8333C17.4845 10.5597 17.5 10.2817 17.5 10C17.5 5.85787 14.1422 2.5 10 2.5C5.85787 2.5 2.5 5.85787 2.5 10C2.5 14.1422 5.85787 17.5 10 17.5C12.3561 17.5 14.4583 16.4136 15.8333 14.7144M10 5.83333V10L12.5 11.6667"
            stroke={isActive ? "#0073EA" : "#676879"}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      onClick: () => navigate("/ongoing-verification"),
    },
    {
      id: "expired",
      label: "Expired Verification",
      icon: (isActive: boolean) => (
        <svg
          className="w-5 h-5"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_11001_25789)">
            <path
              d="M12.5052 7.50521L7.50521 12.5052M7.50521 7.50521L12.5052 12.5052M18.3385 10.0052C18.3385 14.6075 14.6075 18.3385 10.0052 18.3385C5.40283 18.3385 1.67188 14.6075 1.67188 10.0052C1.67188 5.40283 5.40283 1.67188 10.0052 1.67188C14.6075 1.67188 18.3385 5.40283 18.3385 10.0052Z"
              stroke={isActive ? "#0073EA" : "#676879"}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_11001_25789">
              <rect width="20" height="20" fill="white" />
            </clipPath>
          </defs>
        </svg>
      ),
      onClick: () => navigate("/expired-verification"),
    },
    {
      id: "verified",
      label: "Verified Credentials",
      icon: (isActive: boolean) => (
        <svg
          className="w-5 h-5"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.5 9.16667L10 11.6667L18.3333 3.33333M13.3333 2.5H6.5C5.09987 2.5 4.3998 2.5 3.86503 2.77248C3.39462 3.01217 3.01217 3.39462 2.77248 3.86503C2.5 4.3998 2.5 5.09987 2.5 6.5V13.5C2.5 14.9002 2.5 15.6002 2.77248 16.135C3.01217 16.6054 3.39462 16.9878 3.86503 17.2275C4.3998 17.5 5.09987 17.5 6.5 17.5H13.5C14.9002 17.5 15.6002 17.5 16.135 17.2275C16.6054 16.9878 16.9878 16.6054 17.2275 16.135C17.5 15.6002 17.5 14.9002 17.5 13.5V10"
            stroke={isActive ? "#0073EA" : "#676879"}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      onClick: () => navigate("/verified-credentials"),
    },
    {
      id: "contact",
      label: "Contact Admin",
      icon: (isActive: boolean) => (
        <svg
          className="w-5 h-5"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.6693 17.5C16.6693 16.337 16.6693 15.7556 16.5258 15.2824C16.2026 14.2171 15.3689 13.3833 14.3035 13.0602C13.8304 12.9167 13.2489 12.9167 12.0859 12.9167H7.91927C6.7563 12.9167 6.17481 12.9167 5.70165 13.0602C4.63631 13.3833 3.80264 14.2171 3.47947 15.2824C3.33594 15.7556 3.33594 16.337 3.33594 17.5M13.7526 6.25C13.7526 8.32107 12.0737 10 10.0026 10C7.93154 10 6.2526 8.32107 6.2526 6.25C6.2526 4.17893 7.93154 2.5 10.0026 2.5C12.0737 2.5 13.7526 4.17893 13.7526 6.25Z"
            stroke={isActive ? "#0073EA" : "#676879"}
            strokeWidth="1.66667"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      onClick: () => navigate("/contact-admin"),
    },
  ];

  return (
    <div className="flex flex-col w-full h-screen bg-white">
      <div className="flex w-full h-11 px-3 lg:px-4 justify-between items-center border-b border-[#DEDEDD] bg-white">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/4566b1e4f2b69299156b1f1c61472e06e0ad9666?width=180"
          alt="Logo"
          className="w-[90px] h-7 object-contain"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/profile")}
            className="flex w-8 h-8 p-2 justify-center items-center gap-2 rounded-full bg-[#F65F7C]"
          >
            <span className="text-white font-roboto text-xs font-medium leading-[10px]">
              OS
            </span>
          </button>
        </div>
      </div>

      <div className="flex h-full bg-white overflow-hidden">
        <div className="flex w-[248px] px-2 py-2 flex-col items-start gap-1 border-r border-[#D0D4E4] bg-white overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  item.onClick();
                }}
                className={`flex h-[38px] items-center gap-2 self-stretch rounded ${
                  isActive ? "bg-[#E6F1FD] pl-1 pr-2.25" : "pl-3 pr-2.25"
                }`}
              >
                {isActive && (
                  <svg
                    className="w-0.5 h-[28.5px]"
                    width="2"
                    height="31"
                    viewBox="0 0 2 31"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 1V29.5"
                      stroke="#0073EA"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {item.icon(isActive)}
                <span
                  className={`font-roboto text-[13px] font-medium leading-normal ${
                    isActive ? "text-[#172B4D]" : "text-[#505258]"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-1 flex-col items-start bg-white overflow-y-auto">
          <div className="flex h-14 flex-col items-start self-stretch">
            <div className="flex px-4 py-2 items-center gap-2 flex-1 self-stretch">
              <div className="flex items-start gap-2">
                <h1 className="text-[#172B4D] font-roboto text-xl font-bold leading-[30px]">
                  Ongoing Verifications
                </h1>
              </div>
            </div>
          </div>

          <div className="flex px-4 flex-col items-start gap-2.5 flex-1 self-stretch">
            <div className="flex flex-col items-start gap-2.5 self-stretch">
              <h2 className="text-[#172B4D] font-roboto text-base font-bold leading-[26px]">
                Not yet started
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 self-stretch">
                {notStartedVerifications.map((item) => (
                  <div key={item.id} className="w-full">
                    <OngoingVerificationCard
                      title={item.title}
                      documentType={item.documentType}
                      progress={item.progress}
                      expiryDate={item.expiryDate}
                      status={item.status}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-start gap-2.5 self-stretch">
              <h2 className="text-[#172B4D] font-roboto text-base font-bold leading-[26px]">
                In Progress
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 self-stretch">
                {inProgressVerifications.map((item) => (
                  <div key={item.id} className="w-full">
                    <OngoingVerificationCard
                      title={item.title}
                      documentType={item.documentType}
                      progress={item.progress}
                      expiryDate={item.expiryDate}
                      status={item.status}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

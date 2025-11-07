import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navItems: Array<{
    id: string;
    label: string;
    icon: (isActive: boolean) => JSX.Element;
    onClick?: () => void;
  }> = [
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
            d="M10.8186 2.30492C10.5258 2.07721 10.3794 1.96335 10.2178 1.91959C10.0752 1.88097 9.92484 1.88097 9.78221 1.91959C9.62057 1.96335 9.47418 2.07721 9.18141 2.30492L3.52949 6.70086C3.15168 6.99471 2.96278 7.14163 2.82669 7.32563C2.70614 7.48862 2.61633 7.67224 2.56169 7.86746C2.5 8.08785 2.5 8.32717 2.5 8.8058V14.8349C2.5 15.7683 2.5 16.235 2.68166 16.5916C2.84144 16.9052 3.09641 17.1601 3.41002 17.3199C3.76654 17.5016 4.23325 17.5016 5.16667 17.5016H6.83333C7.06669 17.5016 7.18337 17.5016 7.2725 17.4562C7.3509 17.4162 7.41464 17.3525 7.45459 17.2741C7.5 17.1849 7.5 17.0683 7.5 16.8349V11.3349C7.5 10.8682 7.5 10.6348 7.59083 10.4566C7.67072 10.2998 7.79821 10.1723 7.95501 10.0924C8.13327 10.0016 8.36662 10.0016 8.83333 10.0016H11.1667C11.6334 10.0016 11.8667 10.0016 12.045 10.0924C12.2018 10.1723 12.3293 10.2998 12.4092 10.4566C12.5 10.6348 12.5 10.8682 12.5 11.3349V16.8349C12.5 17.0683 12.5 17.1849 12.5454 17.2741C12.5854 17.3525 12.6491 17.4162 12.7275 17.4562C12.8166 17.5016 12.9333 17.5016 13.1667 17.5016H14.8333C15.7668 17.5016 16.2335 17.5016 16.59 17.3199C16.9036 17.1601 17.1586 16.9052 17.3183 16.5916C17.5 16.235 17.5 15.7683 17.5 14.8349V8.8058C17.5 8.32717 17.5 8.08785 17.4383 7.86746C17.3837 7.67224 17.2939 7.48862 17.1733 7.32563C17.0372 7.14163 16.8483 6.99471 16.4705 6.70086L10.8186 2.30492Z"
            stroke={isActive ? "#0073EA" : "#676879"}
            strokeWidth="1.36364"
            strokeLinecap="round"
            strokeLinejoin="round"
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
          <g clipPath="url(#clip0_11004_6928)">
            <path
              d="M12.5052 7.50521L7.50521 12.5052M7.50521 7.50521L12.5052 12.5052M18.3385 10.0052C18.3385 14.6075 14.6075 18.3385 10.0052 18.3385C5.40283 18.3385 1.67188 14.6075 1.67188 10.0052C1.67188 5.40283 5.40283 1.67188 10.0052 1.67188C14.6075 1.67188 18.3385 5.40283 18.3385 10.0052Z"
              stroke={isActive ? "#0073EA" : "#676879"}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_11004_6928">
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
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      onClick: () => navigate("/contact-admin"),
    },
  ];

  const sessions = [
    {
      device: "Chrome on Windows",
      ipAddress: "192.168.1.105",
      logInTime: "2025-08-24 @ 5:45 PM",
      lastActivity: "Just Now",
      status: "This Device",
      isCurrentDevice: true,
    },
    {
      device: "Chrome on Android",
      ipAddress: "192.168.1.87",
      logInTime: "2025-08-21 @ 9:12 AM",
      lastActivity: "15 Hours Ago",
      status: "Active",
      isCurrentDevice: false,
    },
    {
      device: "Firefox on MacOS",
      ipAddress: "10.0.0.42",
      logInTime: "2025-08-19 @ 11:30 PM",
      lastActivity: "1 Day Ago",
      status: "Active",
      isCurrentDevice: false,
    },
    {
      device: "Safari on iPhone",
      ipAddress: "192.168.1.92",
      logInTime: "2025-08-15 @ 2:05 PM",
      lastActivity: "3 Days Ago",
      status: "Active",
      isCurrentDevice: false,
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
                  item.onClick?.();
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
          <div className="flex w-full h-14 flex-col items-start border-b border-[#DEDEDD]">
            <div className="flex h-14 flex-col items-start self-stretch">
              <div className="flex px-4 py-2 items-center gap-2 flex-1 self-stretch">
                <div className="flex items-start gap-2">
                  <h1 className="text-[#172B4D] font-roboto text-xl font-bold leading-[30px]">
                    Profile
                  </h1>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 self-stretch p-4">
            <div className="flex flex-col items-start gap-2 self-stretch rounded border border-[#DEDEDD]">
              <div className="flex px-4 py-3 items-center gap-2.5 self-stretch">
                <h2 className="text-[#172B4D] font-roboto text-base font-bold leading-6">
                  User Information
                </h2>
              </div>
              <div className="w-full h-px bg-[#DEDEDD]"></div>
              <div className="flex px-4 py-3 items-start gap-2.5 self-stretch">
                <p className="text-[#505258] font-roboto text-[13px] font-normal leading-5">
                  Fetched from Lorem Ipsum
                </p>
              </div>
              <div className="w-full h-px bg-[#DEDEDD]"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-3 w-full">
                <div className="flex flex-col gap-1">
                  <label className="text-[#172B4D] font-roboto text-[13px] font-bold leading-5">
                    Full Name
                  </label>
                  <div className="text-[#505258] font-roboto text-[13px] font-normal leading-5">
                    Opinder Singh
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[#172B4D] font-roboto text-[13px] font-bold leading-5">
                    Employee ID
                  </label>
                  <div className="text-[#505258] font-roboto text-[13px] font-normal leading-5">
                    EMP-2345
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[#172B4D] font-roboto text-[13px] font-bold leading-5">
                    Email Address
                  </label>
                  <div className="text-[#505258] font-roboto text-[13px] font-normal leading-5">
                    Opinder.singh@company.com
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[#172B4D] font-roboto text-[13px] font-bold leading-5">
                    Department / Role
                  </label>
                  <div className="text-[#505258] font-roboto text-[13px] font-normal leading-5">
                    Information Technology - Senior Software Engineer
                  </div>
                </div>
              </div>
            </div>

            <div className="flex h-16 flex-col justify-center items-start gap-2 self-stretch rounded border border-[#DEDEDD]">
              <div className="flex px-4 py-3 justify-between items-center self-stretch">
                <div className="flex flex-col items-start gap-1">
                  <h2 className="text-[#172B4D] font-roboto text-base font-bold leading-6">
                    Change Password
                  </h2>
                  <p className="text-[#505258] font-roboto text-[13px] font-normal leading-5">
                    Update your password to keep your account secure
                  </p>
                </div>
                <button className="flex h-8 px-3 py-2 justify-center items-center gap-2 rounded bg-[#0073EA]">
                  <span className="text-white font-roboto text-[13px] font-medium leading-4">
                    Change Password
                  </span>
                </button>
              </div>
            </div>

            <div className="flex h-16 flex-col justify-center items-start gap-2 self-stretch rounded border border-[#DEDEDD]">
              <div className="flex px-4 py-3 justify-between items-center self-stretch">
                <div className="flex flex-col items-start gap-1">
                  <h2 className="text-[#172B4D] font-roboto text-base font-bold leading-6">
                    MFA Configuration
                  </h2>
                  <p className="text-[#505258] font-roboto text-[13px] font-normal leading-5">
                    Multi-factor authentication adds an extra layer of security
                    to your account
                  </p>
                </div>
                <button className="flex h-8 px-3 py-2 justify-center items-center gap-2 rounded bg-[#0073EA]">
                  <span className="text-white font-roboto text-[13px] font-medium leading-4">
                    Enable MFA
                  </span>
                </button>
              </div>
            </div>

            <div className="flex flex-col justify-center items-start gap-2 self-stretch rounded border border-[#DEDEDD]">
              <div className="flex px-4 py-3 items-start gap-2.5 self-stretch">
                <div className="flex flex-col items-start gap-1 flex-1">
                  <h2 className="text-[#172B4D] font-roboto text-base font-bold leading-6">
                    Session & Security
                  </h2>
                  <p className="text-[#505258] font-roboto text-[13px] font-normal leading-5">
                    Multi-factor authentication adds an extra layer of security
                    to your account
                  </p>
                </div>
                <button className="flex h-8 px-3 py-2 justify-center items-center gap-2 rounded">
                  <svg
                    className="w-4 h-4"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10.6693 7.33464L13.3359 7.33464M13.3359 7.33464L16.0026 7.33464M13.3359 7.33464L13.3359 4.66797M13.3359 7.33464L13.3359 10.0013M5.33594 14.668L5.33594 13.3346C5.33594 12.5992 5.33594 12.2315 5.21046 11.9499C5.09888 11.7016 4.92011 11.4896 4.69464 11.3366C4.43905 11.1634 4.10225 11.1086 3.42865 11.0013C2.31094 10.8301 1.33594 9.8551 1.33594 8.66797C1.33594 7.38126 2.38294 6.33464 3.66927 6.33464C5.18927 6.33464 5.33594 5.46797 5.33594 4.66797L5.33594 1.33464M5.33594 1.33464L2.66927 1.33464M5.33594 1.33464L8.0026 1.33464"
                      stroke="#0073EA"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-[#0073EA] font-roboto text-[13px] font-medium leading-4">
                    Refresh
                  </span>
                </button>
              </div>
              <div className="w-full h-px bg-[#DEDEDD]"></div>
              <div className="flex px-4 py-2 items-start gap-2.5 self-stretch">
                <h3 className="text-[#172B4D] font-roboto text-sm font-semibold leading-5">
                  Active Sessions
                </h3>
              </div>
              <div className="flex px-4 items-start gap-2.5 self-stretch">
                <p className="text-[#505258] font-roboto text-xs font-normal leading-[18px]">
                  Let users upload existing documents directly from their
                  device.
                </p>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full">
                  <thead className="bg-[#F7F8F9]">
                    <tr>
                      <th className="px-4 py-2 text-left">
                        <div className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-[#DEDEDD]"
                          />
                          <span className="text-[#172B4D] font-roboto text-xs font-semibold leading-[18px]">
                            Device
                          </span>
                        </div>
                      </th>
                      <th className="px-4 py-2 text-left">
                        <span className="text-[#172B4D] font-roboto text-xs font-semibold leading-[18px]">
                          IP Address
                        </span>
                      </th>
                      <th className="px-4 py-2 text-left">
                        <span className="text-[#172B4D] font-roboto text-xs font-semibold leading-[18px]">
                          Log In Time
                        </span>
                      </th>
                      <th className="px-4 py-2 text-left">
                        <span className="text-[#172B4D] font-roboto text-xs font-semibold leading-[18px]">
                          Last Activity
                        </span>
                      </th>
                      <th className="px-4 py-2 text-left">
                        <span className="text-[#172B4D] font-roboto text-xs font-semibold leading-[18px]">
                          Status
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session, index) => (
                      <tr key={index} className="border-t border-[#DEDEDD]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-[#DEDEDD]"
                            />
                            <span className="text-[#505258] font-roboto text-xs font-normal leading-[18px]">
                              {session.device}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[#505258] font-roboto text-xs font-normal leading-[18px]">
                            {session.ipAddress}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[#505258] font-roboto text-xs font-normal leading-[18px]">
                            {session.logInTime}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[#505258] font-roboto text-xs font-normal leading-[18px]">
                            {session.lastActivity}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
                              session.isCurrentDevice
                                ? "bg-[#E6F4EA] text-[#1E7E34]"
                                : "bg-[#E6F1FD] text-[#0073EA]"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                session.isCurrentDevice
                                  ? "bg-[#1E7E34]"
                                  : "bg-[#0073EA]"
                              }`}
                            ></span>
                            <span className="font-roboto text-xs font-medium leading-[18px]">
                              {session.status}
                            </span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex px-4 py-3 items-start gap-2.5 self-stretch">
                <button className="flex h-8 px-3 py-2 justify-center items-center gap-2 rounded bg-[#D83A52]">
                  <span className="text-white font-roboto text-[13px] font-medium leading-4">
                    Logout from All Sessions
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { OngoingVerificationCard } from "./OngoingVerificationCard";
import { ExpiredVerificationCard } from "./ExpiredVerificationCard";
import { VerifiedCredentialCard } from "./VerifiedCredentialCard";

interface OngoingCard {
  id: string;
  title: string;
  documentType: string;
  progress: number;
  expiryDate: string;
  status: "in-progress" | "not-started";
}

interface ExpiredCard {
  id: string;
  title: string;
  documentType: string;
  expiredDate: string;
  issuedOn: string;
}

interface VerifiedCard {
  id: string;
  title: string;
  documentType: string;
  completedOn: string;
  expiresOn: string;
}

const ongoingVerifications: OngoingCard[] = [
  {
    id: "1",
    title: "Employment Verification",
    documentType: "Employee ID Card",
    progress: 15,
    expiryDate: "Oct 10, 2025",
    status: "in-progress",
  },
  {
    id: "2",
    title: "Employment Verification",
    documentType: "Employee ID Card",
    progress: 0,
    expiryDate: "Oct 10, 2025",
    status: "not-started",
  },
  {
    id: "3",
    title: "Employment Verification",
    documentType: "Employee ID Card",
    progress: 0,
    expiryDate: "N/A",
    status: "not-started",
  },
];

const expiredVerifications: ExpiredCard[] = [
  {
    id: "4",
    title: "Arcon Document Submission",
    documentType: "Passport",
    expiredDate: "Oct 10, 2025",
    issuedOn: "June 05, 2025",
  },
  {
    id: "5",
    title: "Arcon Document Submission",
    documentType: "Passport",
    expiredDate: "Oct 10, 2025",
    issuedOn: "June 05, 2025",
  },
  {
    id: "6",
    title: "Arcon Document Submission",
    documentType: "Passport",
    expiredDate: "Oct 10, 2025",
    issuedOn: "June 05, 2025",
  },
];

const verifiedCredentials: VerifiedCard[] = [
  {
    id: "7",
    title: "Arcon Document Submission",
    documentType: "Passport",
    completedOn: "Oct 10, 2025",
    expiresOn: "Oct 10, 2025",
  },
  {
    id: "8",
    title: "Arcon Document Submission",
    documentType: "Passport",
    completedOn: "Oct 10, 2025",
    expiresOn: "Oct 10, 2025",
  },
  {
    id: "9",
    title: "Arcon Document Submission",
    documentType: "Passport",
    completedOn: "Oct 10, 2025",
    expiresOn: "Oct 10, 2025",
  },
];

const OngoingVerificationSection = ({ cards }: { cards: OngoingCard[] }) => {
  return (
    <div className="flex flex-col items-start gap-2.5 w-full">
      <div className="flex justify-between items-start w-full">
        <h2 className="text-[#172B4D] font-roboto text-base font-bold leading-[26px]">
          Ongoing Verifications
        </h2>
        <button className="flex h-7 px-3 py-2.25 justify-center items-center gap-2 rounded">
          <span className="text-[#0073EA] font-roboto text-xs font-medium leading-normal">
            View All
          </span>
        </button>
      </div>
      <div className="grid w-full gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.id} className="w-full">
            <OngoingVerificationCard
              title={card.title}
              documentType={card.documentType}
              progress={card.progress}
              expiryDate={card.expiryDate}
              status={card.status}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const ExpiredVerificationSection = ({ cards }: { cards: ExpiredCard[] }) => {
  return (
    <div className="flex flex-col items-start gap-2.5 w-full">
      <div className="flex justify-between items-start w-full">
        <h2 className="text-[#172B4D] font-roboto text-base font-bold leading-[26px]">
          Expired Verification
        </h2>
        <button className="flex h-7 px-3 py-2.25 justify-center items-center gap-2 rounded">
          <span className="text-[#0073EA] font-roboto text-xs font-medium leading-normal">
            View All
          </span>
        </button>
      </div>
      <div className="grid w-full gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.id} className="w-full">
            <ExpiredVerificationCard
              title={card.title}
              documentType={card.documentType}
              expiredDate={card.expiredDate}
              issuedOn={card.issuedOn}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const VerifiedCredentialsSection = ({ cards }: { cards: VerifiedCard[] }) => {
  return (
    <div className="flex flex-col items-start gap-2.5 w-full">
      <div className="flex justify-between items-start w-full">
        <h2 className="text-[#172B4D] font-roboto text-base font-bold leading-[26px]">
          Verified Credentials
        </h2>
        <button className="flex h-7 px-3 py-2.25 justify-center items-center gap-2 rounded">
          <span className="text-[#0073EA] font-roboto text-xs font-medium leading-normal">
            View All
          </span>
        </button>
      </div>
      <div className="grid w-full gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.id} className="w-full">
            <VerifiedCredentialCard
              title={card.title}
              documentType={card.documentType}
              completedOn={card.completedOn}
              expiresOn={card.expiresOn}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeNav, setActiveNav] = useState("home");

  useEffect(() => {
    const path = location.pathname || "";
    if (path.startsWith("/ongoing")) setActiveNav("ongoing");
    else if (path.startsWith("/expired")) setActiveNav("expired");
    else if (path.startsWith("/verified")) setActiveNav("verified");
    else if (path.startsWith("/contact")) setActiveNav("contact");
    else setActiveNav("home");
  }, [location.pathname]);

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
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.56584 1.11261C9.85109 1.03538 10.1518 1.03538 10.437 1.11261C10.7681 1.20227 11.0469 1.42115 11.2694 1.59584C13.1889 3.10283 15.1203 4.59457 17.0483 6.09074C17.3622 6.33431 17.6387 6.5489 17.8447 6.82749C18.0255 7.07197 18.1603 7.3474 18.2422 7.64023C18.3356 7.97391 18.3353 8.32392 18.3348 8.72123C18.3327 10.769 18.3348 12.8167 18.3348 14.8645C18.3348 15.3037 18.3348 15.6826 18.3093 15.9948C18.2823 16.3243 18.2229 16.652 18.0623 16.9673C17.8226 17.4376 17.4401 17.8201 16.9698 18.0598C16.6544 18.2205 16.3268 18.2799 15.9973 18.3068C15.3293 18.3614 14.6518 18.332 13.9821 18.3323C13.8828 18.3323 13.7643 18.3324 13.6599 18.3239C13.5388 18.314 13.3655 18.2886 13.1839 18.1961C12.9488 18.0762 12.7575 17.885 12.6377 17.6498C12.5451 17.4681 12.5198 17.2948 12.5098 17.1738C12.5013 17.0694 12.5013 16.9508 12.5014 16.8516L12.508 12.1881C12.5087 11.7207 12.5089 11.4871 12.4183 11.3086C12.3384 11.1516 12.2109 11.0238 12.054 10.9438C11.8756 10.8528 11.6419 10.8528 11.1747 10.8528H8.84143C8.37534 10.8528 8.14227 10.8528 7.96414 10.9435C7.80744 11.0232 7.67999 11.1505 7.60002 11.3071C7.50909 11.4851 7.50876 11.7181 7.50809 12.1842L7.50142 16.8516C7.50146 16.9508 7.5015 17.0694 7.49297 17.1738C7.48309 17.2948 7.45772 17.4681 7.36518 17.6498C7.24534 17.885 7.05411 18.0762 6.8189 18.1961C6.63729 18.2886 6.46395 18.314 6.34294 18.3239C6.23851 18.3324 6.11997 18.3323 6.02071 18.3323C5.35097 18.332 4.67349 18.3614 4.00556 18.3068C3.6761 18.2799 3.34843 18.2205 3.03311 18.0598C2.5627 17.8201 2.18025 17.4376 1.94057 16.9673C1.7799 16.652 1.72048 16.3243 1.69356 15.9948C1.66805 15.6826 1.66807 15.3037 1.66809 14.8644C1.66809 12.8166 1.67024 10.7689 1.66803 8.72123C1.66759 8.32392 1.66722 7.97391 1.76062 7.64023C1.84259 7.3474 1.97729 7.07197 2.15812 6.82749C2.36417 6.5489 2.64068 6.33431 2.95454 6.09075C4.88239 4.59464 6.814 3.1028 8.73343 1.59584C8.95593 1.42115 9.23468 1.20227 9.56584 1.11261Z"
            fill={isActive ? "#0073EA" : "#676879"}
          />
        </svg>
      ),
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
          <g clipPath="url(#clip0_11001_18676)">
            <path
              d="M12.5013 7.50521L7.5013 12.5052M7.5013 7.50521L12.5013 12.5052M18.3346 10.0052C18.3346 14.6075 14.6036 18.3385 10.0013 18.3385C5.39893 18.3385 1.66797 14.6075 1.66797 10.0052C1.66797 5.40283 5.39893 1.67188 10.0013 1.67188C14.6036 1.67188 18.3346 5.40283 18.3346 10.0052Z"
              stroke={isActive ? "#0073EA" : "#676879"}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_11001_18676">
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
            d="M16.6654 17.5C16.6654 16.337 16.6654 15.7556 16.5219 15.2824C16.1987 14.2171 15.3649 13.3833 14.2996 13.0602C13.8264 12.9167 13.245 12.9167 12.082 12.9167H7.91536C6.7524 12.9167 6.17091 12.9167 5.69775 13.0602C4.63241 13.3833 3.79873 14.2171 3.47556 15.2824C3.33203 15.7556 3.33203 16.337 3.33203 17.5M13.7487 6.25C13.7487 8.32107 12.0698 10 9.9987 10C7.92763 10 6.2487 8.32107 6.2487 6.25C6.2487 4.17893 7.92763 2.5 9.9987 2.5C12.0698 2.5 13.7487 4.17893 13.7487 6.25Z"
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

      <div className="flex flex-1 h-[calc(100vh-44px)] bg-white">
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

        <main className="flex flex-1 flex-col items-start bg-white overflow-y-auto">
          {/* Banner - independent element inside main */}
          <section className="w-full px-4">
            <div className="relative flex w-full items-center gap-2.5 rounded-b-2xl overflow-hidden h-[138px] bg-gradient-to-br from-[#003d82] via-[#1e5ba8] to-[#0073EA] shadow-sm" style={{ zIndex: 1 }}>
              <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/38b9840b8e157e2e4686f0512b46f97b9e7cb4c5?width=2700"
                  alt=""
                  className="absolute"
                  style={{
                    width: "1350px",
                    height: "224.865px",
                    left: "-135px",
                    top: "-43.437px",
                    opacity: 0.22,
                  }}
                />
              </div>

              <div className="flex px-4 flex-col justify-center items-start gap-0.5 flex-1 relative z-10">
                <h1 className="text-white font-roboto text-2xl font-semibold leading-[30px]">
                  Welcome, Opinder Singh !
                </h1>
                <p className="text-white font-roboto text-[13px] font-normal leading-[30px]">
                  Contrary to popular belief, Lorem Ipsum is not simply random
                  text. It has roots in a piece of classical Latin
                </p>
              </div>
            </div>
          </section>

          <div className="flex px-4 py-5 flex-col items-start gap-6 self-stretch">
            <OngoingVerificationSection cards={ongoingVerifications} />
            <VerifiedCredentialsSection cards={verifiedCredentials} />
            <ExpiredVerificationSection cards={expiredVerifications} />
          </div>
        </main>
      </div>
    </div>
  );
}

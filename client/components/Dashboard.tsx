import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OngoingVerificationCard } from "./OngoingVerificationCard";
import { ExpiredVerificationCard } from "./ExpiredVerificationCard";
import { VerifiedCredentialCard } from "./VerifiedCredentialCard";

interface OngoingCard {
  id: string;
  title: string;
  documentType: string;
  progress: number;
  expiryDate: string;
}

interface ExpiredCard {
  id: string;
  title: string;
  documentType: string;
  expiredDate: string;
}

interface VerifiedCard {
  id: string;
  title: string;
  documentType: string;
  expiryDate: string;
  completionDate: string;
}

const ongoingVerifications: OngoingCard[] = [
  {
    id: "1",
    title: "Employment Verification",
    documentType: "Employee ID Card",
    progress: 30,
    expiryDate: "11/12/25",
  },
  {
    id: "2",
    title: "Employment Verification",
    documentType: "Employee ID Card",
    progress: 0,
    expiryDate: "11/12/25",
  },
  {
    id: "3",
    title: "Employment Verification",
    documentType: "Employee ID Card",
    progress: 0,
    expiryDate: "N/A",
  },
];

const expiredVerifications: ExpiredCard[] = [
  {
    id: "4",
    title: "Passport Verification",
    documentType: "Passport",
    expiredDate: "Oct 10, 2025",
  },
  {
    id: "5",
    title: "Previous Employment",
    documentType: "Employment Letter",
    expiredDate: "Oct 10, 2025",
  },
  {
    id: "6",
    title: "Arcon Submission",
    documentType: "Passport",
    expiredDate: "Oct 10, 2025",
  },
];

const verifiedCredentials: VerifiedCard[] = [
  {
    id: "7",
    title: "Education Verification",
    documentType: "Degree Certificate",
    expiryDate: "Oct 1, 2025",
    completionDate: "Oct 1, 2025",
  },
  {
    id: "8",
    title: "Education Verification",
    documentType: "Degree Certificate",
    expiryDate: "Oct 1, 2025",
    completionDate: "Oct 1, 2025",
  },
  {
    id: "9",
    title: "Education Verification",
    documentType: "Degree Certificate",
    expiryDate: "Oct 1, 2025",
    completionDate: "Oct 1, 2025",
  },
];

const OngoingVerificationSection = ({ cards }: { cards: OngoingCard[] }) => {
  return (
    <div className="flex flex-col items-start gap-2 w-full">
      <div className="flex h-[26px] px-4 pb-1 flex-col items-start gap-1 w-full">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-[#172B4D] font-roboto text-base font-bold leading-[26px]">
            Ongoing Verification
          </h2>
          <span className="text-[#0073EA] font-roboto text-base font-normal leading-[26px] cursor-pointer hover:underline">
            View All
          </span>
        </div>
      </div>
      <div className="flex px-4 pb-4 items-start gap-6 w-full overflow-x-auto scrollbar-hidden">
        <div className="flex items-start gap-6 min-w-full">
          {cards.map((card) => (
            <div key={card.id} className="flex-1 min-w-[280px] max-w-[400px]">
              <OngoingVerificationCard
                title={card.title}
                documentType={card.documentType}
                progress={card.progress}
                expiryDate={card.expiryDate}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ExpiredVerificationSection = ({ cards }: { cards: ExpiredCard[] }) => {
  return (
    <div className="flex flex-col items-start gap-2 w-full">
      <div className="flex h-[26px] px-4 pb-1 flex-col items-start gap-1 w-full">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-[#172B4D] font-roboto text-base font-bold leading-[26px]">
            Expired Verification
          </h2>
          <span className="text-[#0073EA] font-roboto text-base font-normal leading-[26px] cursor-pointer hover:underline">
            View All
          </span>
        </div>
      </div>
      <div className="flex px-4 pb-4 items-start gap-6 w-full overflow-x-auto scrollbar-hidden">
        <div className="flex items-start gap-6 min-w-full">
          {cards.map((card) => (
            <div key={card.id} className="flex-1 min-w-[280px] max-w-[400px]">
              <ExpiredVerificationCard
                title={card.title}
                documentType={card.documentType}
                expiredDate={card.expiredDate}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const VerifiedCredentialsSection = ({ cards }: { cards: VerifiedCard[] }) => {
  return (
    <div className="flex flex-col items-start gap-2 w-full">
      <div className="flex h-[26px] px-4 pb-1 flex-col items-start gap-1 w-full">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-[#172B4D] font-roboto text-base font-bold leading-[26px]">
            Verified Credentials
          </h2>
          <span className="text-[#0073EA] font-roboto text-base font-normal leading-[26px] cursor-pointer hover:underline">
            View All
          </span>
        </div>
      </div>
      <div className="flex px-4 pb-4 items-start gap-6 w-full overflow-x-auto scrollbar-hidden">
        <div className="flex items-start gap-6 min-w-full">
          {cards.map((card) => (
            <div key={card.id} className="flex-1 min-w-[280px] max-w-[400px]">
              <VerifiedCredentialCard
                title={card.title}
                documentType={card.documentType}
                expiryDate={card.expiryDate}
                completionDate={card.completionDate}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export function Dashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("home");

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: (
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
            stroke="#676879"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "ongoing",
      label: "Ongoing Verification",
      icon: (
        <svg
          className="w-5 h-5"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11.6615 1.89648V5.3386C11.6615 5.80531 11.6615 6.03867 11.7523 6.21693C11.8322 6.37373 11.9596 6.50121 12.1165 6.58111C12.2947 6.67193 12.528 6.67193 12.9948 6.67193H16.4369M7.49479 13.3385L9.16146 15.0052L12.9115 11.2552M11.6615 1.67188H7.32813C5.92799 1.67188 5.22793 1.67188 4.69315 1.94436C4.22274 2.18404 3.84029 2.56649 3.60061 3.0369C3.32813 3.57168 3.32812 4.27174 3.32812 5.67188V14.3385C3.32812 15.7387 3.32813 16.4387 3.60061 16.9735C3.84029 17.444 4.22274 17.8264 4.69315 18.066C5.22793 18.3385 5.92799 18.3385 7.32813 18.3385H12.6615C14.0616 18.3385 14.7616 18.3385 15.2965 18.066C15.7669 17.8264 16.1493 17.444 16.389 16.9735C16.6615 16.4387 16.6615 15.7387 16.6615 14.3385V6.67188L11.6615 1.67188Z"
            stroke="#676879"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "expired",
      label: "Expired Verification",
      icon: (
        <svg
          className="w-5 h-5"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11.6615 1.89648V5.3386C11.6615 5.80531 11.6615 6.03867 11.7523 6.21693C11.8322 6.37373 11.9596 6.50121 12.1165 6.58111C12.2947 6.67193 12.528 6.67193 12.9948 6.67193H16.4369M7.91146 10.0052L12.0781 14.1719M12.0781 10.0052L7.91146 14.1719M11.6615 1.67188H7.32813C5.92799 1.67188 5.22793 1.67188 4.69315 1.94436C4.22274 2.18404 3.84029 2.56649 3.60061 3.0369C3.32813 3.57168 3.32812 4.27174 3.32812 5.67188V14.3385C3.32812 15.7387 3.32813 16.4387 3.60061 16.9735C3.84029 17.444 4.22274 17.8264 4.69315 18.066C5.22793 18.3385 5.92799 18.3385 7.32813 18.3385H12.6615C14.0616 18.3385 14.7616 18.3385 15.2965 18.066C15.7669 17.8264 16.1493 17.444 16.389 16.9735C16.6615 16.4387 16.6615 15.7387 16.6615 14.3385V6.67188L11.6615 1.67188Z"
            stroke="#676879"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "verified",
      label: "Verified Credentials",
      icon: (
        <svg
          className="w-5 h-5"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_9130_10239)">
            <path
              d="M6.2474 9.9974L8.7474 12.4974L13.7474 7.4974M18.3307 9.9974C18.3307 14.5997 14.5997 18.3307 9.9974 18.3307C5.39502 18.3307 1.66406 14.5997 1.66406 9.9974C1.66406 5.39502 5.39502 1.66406 9.9974 1.66406C14.5997 1.66406 18.3307 5.39502 18.3307 9.9974Z"
              stroke="#676879"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_9130_10239">
              <rect width="20" height="20" fill="white" />
            </clipPath>
          </defs>
        </svg>
      ),
    },
    {
      id: "contact",
      label: "Contact Admin",
      icon: (
        <svg
          className="w-5 h-5"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.5 6.5C2.5 5.09987 2.5 4.3998 2.77248 3.86503C3.01217 3.39462 3.39462 3.01217 3.86503 2.77248C4.3998 2.5 5.09987 2.5 6.5 2.5H13.5C14.9002 2.5 15.6002 2.5 16.135 2.77248C16.6054 3.01217 16.9878 3.39462 17.2275 3.86503C17.5 4.3998 17.5 5.09987 17.5 6.5V11C17.5 12.4002 17.5 13.1002 17.2275 13.635C16.9878 14.1054 16.6054 14.4878 16.135 14.7275C15.6002 15 14.9002 15 13.5 15H8.06979C7.54975 15 7.28973 15 7.04101 15.0511C6.82036 15.0963 6.60683 15.1713 6.40624 15.2738C6.18014 15.3893 5.9771 15.5517 5.57101 15.8765L3.58313 17.4668C3.23639 17.7442 3.06303 17.8829 2.91712 17.8831C2.79023 17.8832 2.67018 17.8255 2.59103 17.7263C2.5 17.6123 2.5 17.3903 2.5 16.9463V6.5Z"
            stroke="#676879"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col w-full h-screen bg-white">
      {/* Header */}
      <div className="flex w-full h-11 px-3 lg:px-4 justify-between items-center flex-shrink-0 border-b border-[#DEDEDD] bg-white">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/4566b1e4f2b69299156b1f1c61472e06e0ad9666?width=180"
          alt="Logo"
          className="w-[90px] h-7 flex-shrink-0 object-contain"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/profile")}
            className="flex w-8 h-8 p-2 justify-center items-center gap-2 rounded-[50px] bg-[#F65F7C]"
          >
            <span className="text-white font-roboto text-xs font-medium leading-[10px]">
              OS
            </span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex items-start flex-1 w-full bg-white overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:flex w-[180px] py-2 flex-col items-start flex-shrink-0 border-r border-[#D0D4E4] bg-white h-full overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className="flex px-4 py-2 items-center gap-1 w-full bg-white hover:bg-[#F6F7FB] transition-colors"
            >
              {item.icon}
              <span className="text-[#505258] text-center font-roboto text-[11px] font-bold leading-5">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 h-full flex-col items-start gap-2 bg-[#F6F7FB] overflow-y-auto">
          {/* Welcome Section */}
          <div className="flex px-4 py-3 flex-col justify-center items-start gap-1 w-full">
            <div className="flex flex-col gap-0 w-full">
              <h1 className="text-[#252529] font-roboto text-xl font-semibold leading-[30px]">
                Welcome, <span className="font-bold">Opinder Singh</span>
              </h1>
              <p className="text-[#41424D] font-figtree text-[13px] font-normal leading-[15px] mt-1">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy
                text ever since the 1500s.
              </p>
            </div>
          </div>

          {/* Ongoing Verification Section */}
          <OngoingVerificationSection cards={ongoingVerifications} />

          {/* Expired Verification Section */}
          <ExpiredVerificationSection cards={expiredVerifications} />

          {/* Verified Credentials Section */}
          <VerifiedCredentialsSection cards={verifiedCredentials} />
        </div>
      </div>
    </div>
  );
}

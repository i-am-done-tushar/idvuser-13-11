interface ExpiredVerificationCardProps {
  title: string;
  documentType: string;
  expiredDate: string;
  issuedOn: string;
}

const StatusBadge = () => {
  return (
    <div className="flex items-center gap-1">
      <div className="w-2 h-2 rounded-full bg-[#D83A52]" />
      <span className="font-roboto text-xs font-normal leading-5 text-[#49290E]">
        Expired
      </span>
    </div>
  );
};

export function ExpiredVerificationCard({
  title,
  documentType,
  expiredDate,
  issuedOn,
}: ExpiredVerificationCardProps) {
  return (
    <div className="flex flex-col items-start gap-2 rounded border border-[#DEDEDD] bg-white">
      <div className="flex px-3 py-2 flex-col justify-center items-start self-stretch gap-2">
        <div className="flex h-7 justify-between items-center self-stretch">
          <h3 className="flex-1 text-[#172B4D] text-left font-roboto text-sm font-bold leading-normal truncate">
            {title}
          </h3>
          <StatusBadge />
        </div>
        <div className="flex items-start justify-start gap-2 self-stretch">
          <span className="text-[#505258] font-roboto text-xs font-normal leading-5">
            You have successfully submitted the Employee ID Card
          </span>
        </div>
        <div className="flex justify-between items-start self-stretch">
          <div className="flex flex-col items-start gap-1">
            <span className="text-[#505258] font-roboto text-xs font-normal leading-5">
              Issued on
            </span>
            <span className="text-[#172B4D] font-roboto text-xs font-semibold leading-5">
              {issuedOn}
            </span>
          </div>
          <div className="flex flex-col items-start gap-1">
            <span className="text-[#505258] font-roboto text-xs font-normal leading-5">
              Expired on
            </span>
            <span className="text-[#D83A52] font-roboto text-xs font-semibold leading-5">
              {expiredDate}
            </span>
          </div>
        </div>
        <button className="flex items-center gap-0.5">
          <svg
            className="w-4 h-4"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 8.66667V12M8 5.33333H8.00667M14.6667 8C14.6667 11.6819 11.6819 14.6667 8 14.6667C4.3181 14.6667 1.33333 11.6819 1.33333 8C1.33333 4.3181 4.3181 1.33333 8 1.33333C11.6819 1.33333 14.6667 4.3181 14.6667 8Z"
              stroke="#D83A52"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[#D83A52] font-roboto text-xs font-normal leading-5">
            Link expired before completion
          </span>
        </button>
      </div>
    </div>
  );
}

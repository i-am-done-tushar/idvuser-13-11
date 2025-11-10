import { DocumentDetailsModal } from "./DocumentDetailsModal";

interface VerifiedCredentialCardProps {
  title: string;
  documentType: string;
  completedOn: string;
  expiresOn: string;
}

const StatusBadge = () => {
  return (
    <div className="flex items-center gap-1">
      <div className="w-2 h-2 rounded-full bg-[#5E9872]" />
      <span className="font-roboto text-xs font-normal leading-5 text-[#1C3829]">
        Verified
      </span>
    </div>
  );
};

export function VerifiedCredentialCard({
  title,
  documentType,
  completedOn,
  expiresOn,
}: VerifiedCredentialCardProps) {
  return (
    <div className="flex flex-col items-start gap-2 rounded border border-[#DEDEDD] bg-white">
      <div className="flex px-3 py-2 flex-col justify-center items-start self-stretch gap-2">
        <div className="flex h-7 justify-between items-center self-stretch">
          <h3 className="flex-1 text-[#172B4D] text-left font-roboto text-sm font-bold leading-normal truncate">
            {title}
          </h3>
          <StatusBadge />
        </div>
        <div className="flex items-center justify-center gap-2 self-stretch">
          <span className="text-[#505258] font-roboto text-xs font-normal leading-5">
            You have successfully submitted the {documentType}
          </span>
        </div>
        <div className="flex justify-between items-start self-stretch">
          <div className="flex flex-col items-start gap-1">
            <span className="text-[#505258] font-roboto text-xs font-normal leading-5">
              Completed on
            </span>
            <span className="text-[#172B4D] font-roboto text-xs font-semibold leading-5">
              {completedOn}
            </span>
          </div>
          <div className="flex flex-col items-start gap-1">
            <span className="text-[#505258] font-roboto text-xs font-normal leading-5">
              Expires on
            </span>
            <span className="text-[#D83A52] font-roboto text-xs font-semibold leading-5">
              {expiresOn}
            </span>
          </div>
        </div>
        <DocumentDetailsModal
          trigger={
            <button className="flex items-center gap-0.5 text-[#0073EA] font-roboto text-xs font-normal leading-5 hover:underline">
              View Details
              <svg
                className="w-3 h-3"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.5 6H9.5M9.5 6L6.5 3M9.5 6L6.5 9"
                  stroke="#0073EA"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          }
        />
      </div>
    </div>
  );
}

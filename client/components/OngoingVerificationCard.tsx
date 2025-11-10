interface OngoingVerificationCardProps {
  title: string;
  documentType: string;
  progress: number;
  expiryDate: string;
  status: "in-progress" | "not-started";
}

const StatusBadge = ({ status }: { status: "in-progress" | "not-started" }) => {
  const isInProgress = status === "in-progress";
  return (
    <div className="flex items-center gap-1">
      <div
        className={`w-2 h-2 rounded-full ${
          isInProgress ? "bg-[#C98F20]" : "bg-[#616273]"
        }`}
      />
      <span
        className={`font-roboto text-xs font-normal leading-5 ${
          isInProgress ? "text-[#402C1B]" : "text-[#616273]"
        }`}
      >
        {isInProgress ? "In Progress" : "Not Yet Started"}
      </span>
    </div>
  );
};

const CircularProgress = ({ progress }: { progress: number }) => {
  const radius = 36;
  const strokeWidth = 4.819;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-20 h-20">
      <svg className="w-20 h-20 -rotate-90" width="80" height="80">
        <circle
          cx="40"
          cy="40"
          r={normalizedRadius}
          fill="white"
          stroke="#E9EDF3"
          strokeWidth={strokeWidth}
        />
        {progress > 0 && (
          <circle
            cx="40"
            cy="40"
            r={normalizedRadius}
            fill="none"
            stroke="#0073EA"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-black font-roboto text-[23px] font-bold leading-[25px]">
          {progress}%
        </span>
      </div>
    </div>
  );
};

export function OngoingVerificationCard({
  title,
  documentType,
  progress,
  expiryDate,
  status,
}: OngoingVerificationCardProps) {
  const borderColor = status === "in-progress" ? "#EFDDBC" : "#E9EAED";

  return (
    <div
      className="flex flex-col items-start rounded border-l-[8px]"
      style={{ borderLeftColor: borderColor }}
    >
      <div className="flex px-3 py-2 flex-col justify-center items-start self-stretch rounded-tr rounded-br border-t border-r border-b border-[#DEDEDD] bg-white">
        <div className="flex h-7 justify-between items-center self-stretch">
          <h3 className="flex-1 text-[#402C1B] text-left font-roboto text-sm font-bold leading-normal truncate">
            {title}
          </h3>
          <StatusBadge status={status} />
        </div>
        <div className="flex items-center gap-4 self-stretch">
          <CircularProgress progress={progress} />
          <div className="flex flex-col justify-center items-start gap-1 flex-1">
            <span className="text-[#505258] font-roboto text-xs font-normal leading-5">
              {documentType}
            </span>
            <div className="text-[#505258] font-roboto text-xs font-normal leading-5">
              <span className="font-semibold text-[#D83A52]">Expires</span> on{" "}
              {expiryDate}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

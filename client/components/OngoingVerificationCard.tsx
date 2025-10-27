interface OngoingVerificationCardProps {
  id: string;
  verificationName: string;
  documentType: string;
  expiryDate?: string;
  progress: number;
  status: "Not Started Yet" | "In Progress";
}

export function OngoingVerificationCard({
  verificationName,
  documentType,
  expiryDate,
  progress,
  status,
}: OngoingVerificationCardProps) {
  const getProgressLabel = () => {
    if (status === "Not Started Yet") {
      return "Not Started Yet";
    }
    return `${progress}% - In Progress`;
  };

  const getProgressColor = () => {
    if (progress === 0) {
      return "bg-gray-300";
    }
    if (progress < 50) {
      return "bg-[#FF9800]";
    }
    if (progress < 100) {
      return "bg-[#0073EA]";
    }
    return "bg-[#258750]";
  };

  return (
    <div className="flex flex-col p-6 gap-4 rounded-lg border border-input-border bg-white hover:shadow-md transition-all cursor-default">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h3 className="text-text-primary font-roboto text-base font-bold leading-normal">
          {verificationName}
        </h3>
        <p className="text-text-muted font-roboto text-sm font-normal leading-normal">
          {documentType}
        </p>
      </div>

      {/* Expiry Date */}
      {expiryDate && (
        <div className="flex flex-col gap-1">
          <p className="text-text-muted font-roboto text-xs font-normal leading-[15px]">
            Expiry Date
          </p>
          <p className="text-text-primary font-roboto text-sm font-medium leading-normal">
            {expiryDate}
          </p>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-text-muted font-roboto text-xs font-normal leading-[15px]">
            Progress
          </p>
          <p className="text-text-primary font-roboto text-xs font-medium leading-[15px]">
            {getProgressLabel()}
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${Math.max(progress, 5)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

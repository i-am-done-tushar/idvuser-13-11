interface ExpiredVerificationCardProps {
  id: string;
  verificationName: string;
  expiryDate?: string;
  expiryReason:
    | "Link expired before completion."
    | `Verification validity expired on ${string}.`;
}

export function ExpiredVerificationCard({
  verificationName,
  expiryDate,
  expiryReason,
}: ExpiredVerificationCardProps) {
  return (
    <div className="flex flex-col p-6 gap-4 rounded-lg border border-input-border bg-white opacity-60 cursor-not-allowed select-none">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h3 className="text-text-primary font-roboto text-base font-bold leading-normal">
          {verificationName}
        </h3>
        <p className="text-text-muted font-roboto text-sm font-normal leading-normal">
          Expired Verification
        </p>
      </div>

      {/* Expiry Reason */}
      <div className="flex flex-col gap-1">
        <p className="text-text-muted font-roboto text-xs font-normal leading-[15px]">
          Expiry Reason
        </p>
        <p className="text-text-primary font-roboto text-sm font-medium leading-normal">
          {expiryReason}
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
    </div>
  );
}

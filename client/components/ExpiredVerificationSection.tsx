import { ExpiredVerificationCard } from "./ExpiredVerificationCard";

interface ExpiredVerification {
  id: string;
  verificationName: string;
  expiryDate?: string;
  expiryReason:
    | "Link expired before completion."
    | `Verification validity expired on ${string}.`;
}

export function ExpiredVerificationSection() {
  const expiredVerifications: ExpiredVerification[] = [
    {
      id: "e1",
      verificationName: "Amit Kumar",
      expiryDate: "12 Oct 2025",
      expiryReason: "Link expired before completion.",
    },
    {
      id: "e2",
      verificationName: "Priya Singh",
      expiryDate: "03 Sep 2025",
      expiryReason: "Verification validity expired on 03 Sep 2025.",
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Title and Description */}
      <div className="flex flex-col gap-2">
        <h1 className="text-text-primary font-roboto text-[22px] font-bold leading-[30px]">
          Expired Verifications
        </h1>
        <p className="text-text-muted font-roboto text-[13px] font-normal leading-[15px]">
          These verifications can no longer be continued.
        </p>
      </div>

      {/* Grid or Empty State */}
      {expiredVerifications.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {expiredVerifications.map((verification) => (
              <ExpiredVerificationCard
                key={verification.id}
                id={verification.id}
                verificationName={verification.verificationName}
                expiryDate={verification.expiryDate}
                expiryReason={verification.expiryReason}
              />
            ))}
          </div>
          <div className="flex items-center justify-start">
            <p className="text-text-muted font-roboto text-sm leading-normal">
              Contact admin to request a new verification.
            </p>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center py-12 rounded-lg border border-input-border bg-white">
          <p className="text-text-muted font-roboto text-base font-normal">
            No expired verifications.
          </p>
        </div>
      )}
    </div>
  );
}

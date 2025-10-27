import { OngoingVerificationCard } from "./OngoingVerificationCard";

interface OngoingVerification {
  id: string;
  verificationName: string;
  documentType: string;
  expiryDate?: string;
  progress: number;
  status: "Not Started Yet" | "In Progress";
}

export function OngoingVerificationSection() {
  const ongoingVerifications: OngoingVerification[] = [
    {
      id: "1",
      verificationName: "John Doe",
      documentType: "Aadhar Card",
      expiryDate: "15 Dec 2025",
      progress: 0,
      status: "Not Started Yet",
    },
    {
      id: "2",
      verificationName: "Jane Smith",
      documentType: "Passport",
      expiryDate: "20 Jan 2026",
      progress: 45,
      status: "In Progress",
    },
    {
      id: "3",
      verificationName: "Robert Johnson",
      documentType: "Driving License",
      expiryDate: "10 Mar 2026",
      progress: 75,
      status: "In Progress",
    },
    {
      id: "4",
      verificationName: "Emily Brown",
      documentType: "Voter ID",
      expiryDate: "05 Feb 2026",
      progress: 25,
      status: "In Progress",
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Title and Description */}
      <div className="flex flex-col gap-2">
        <h1 className="text-text-primary font-roboto text-[22px] font-bold leading-[30px]">
          Ongoing Verifications
        </h1>
        <p className="text-text-muted font-roboto text-[13px] font-normal leading-[15px]">
          All pending and ongoing verifications are displayed below. Track the
          progress of each verification.
        </p>
      </div>

      {/* Verifications Grid */}
      {ongoingVerifications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {ongoingVerifications.map((verification) => (
            <OngoingVerificationCard
              key={verification.id}
              id={verification.id}
              verificationName={verification.verificationName}
              documentType={verification.documentType}
              expiryDate={verification.expiryDate}
              progress={verification.progress}
              status={verification.status}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-12 rounded-lg border border-input-border bg-white">
          <p className="text-text-muted font-roboto text-base font-normal">
            No ongoing verifications.
          </p>
        </div>
      )}
    </div>
  );
}

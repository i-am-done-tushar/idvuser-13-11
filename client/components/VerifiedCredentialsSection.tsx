import { VerifiedCredentialCard } from "./VerifiedCredentialCard";

interface VerifiedItem {
  id: string;
  userName: string;
  documentType: string;
  verifiedAt: string;
  expiryDate?: string;
  data?: Record<string, string>;
  consentGivenAt?: string;
  consentExpiry?: string;
}

import { useState } from "react";

export function VerifiedCredentialsSection({
  userName,
}: {
  userName?: string;
}) {
  const name = userName ?? "Sahil Angad";

  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const verifiedItems: VerifiedItem[] = [
    {
      id: "v1",
      userName: name,
      documentType: "Aadhaar Card",
      verifiedAt: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString(), // 45 days
      data: { "Aadhaar Number": "**** **** 1234", Name: name },
      consentGivenAt: new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 10,
      ).toISOString(),
      consentExpiry: new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 350,
      ).toISOString(),
    },
    {
      id: "v2",
      userName: name,
      documentType: "PAN Card",
      verifiedAt: new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 200,
      ).toISOString(),
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString(), // 20 days -> warning
      data: { PAN: "ABCDE1234F", Name: name },
      consentGivenAt: new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 300,
      ).toISOString(),
      consentExpiry: new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 10,
      ).toISOString(),
    },
    {
      id: "v3",
      userName: name,
      documentType: "Passport",
      verifiedAt: new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 400,
      ).toISOString(),
      data: { "Passport No": "N1234567", Name: name },
      consentGivenAt: new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 400,
      ).toISOString(),
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Title and Description */}
      <div className="flex flex-col gap-2">
        <h1 className="text-text-primary font-roboto text-[22px] font-bold leading-[30px]">
          Verified Credentials
        </h1>
        <p className="text-text-muted font-roboto text-[13px] font-normal leading-[15px]">
          View credentials that have been successfully verified for the user.
        </p>
      </div>

      {/* Grid */}
      {verifiedItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {verifiedItems.map((item) => (
            <VerifiedCredentialCard
              key={item.id}
              id={item.id}
              userName={item.userName}
              documentType={item.documentType}
              verifiedAt={item.verifiedAt}
              expiryDate={item.expiryDate}
              data={item.data}
              consentGivenAt={item.consentGivenAt}
              consentExpiry={item.consentExpiry}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-12 rounded-lg border border-input-border bg-white">
          <p className="text-text-muted font-roboto text-base font-normal">
            No verified credentials.
          </p>
        </div>
      )}
    </div>
  );
}

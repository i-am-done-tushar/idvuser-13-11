import { useState } from "react";

interface VerifiedCredentialCardProps {
  id: string;
  userName: string;
  documentType: string;
  verifiedAt: string; // ISO or human-readable
  expiryDate?: string; // ISO or human-readable
  data?: Record<string, string>; // user-filled data
  consentGivenAt?: string;
  consentExpiry?: string;
}

function daysUntil(dateStr?: string) {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function VerifiedCredentialCard({
  userName,
  documentType,
  verifiedAt,
  expiryDate,
  data = {},
  consentGivenAt,
  consentExpiry,
}: VerifiedCredentialCardProps) {
  const [expanded, setExpanded] = useState(false);

  const expiryDays = daysUntil(expiryDate);
  const consentExpiryDays = daysUntil(consentExpiry);

  const showExpiryWarning = expiryDate ? expiryDays <= 30 : false;

  return (
    <div className="flex flex-col rounded-lg border border-input-border bg-white transition-all">
      {/* Warning banner if nearing expiry */}
      {showExpiryWarning && (
        <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200 text-yellow-800 text-sm rounded-t-lg">
          Warning: Credential expires in {expiryDays} day
          {expiryDays === 1 ? "" : "s"}.
        </div>
      )}

      <div
        className={`p-6 gap-4 flex flex-col ${expanded ? "" : "hover:shadow-md cursor-pointer hover:scale-[1.01]"}`}
        onClick={() => setExpanded((s) => !s)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setExpanded((s) => !s);
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#E8F5E9] flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[#258750]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h3 className="text-text-primary font-roboto text-base font-bold leading-normal">
                {userName}
              </h3>
              <p className="text-text-muted font-roboto text-sm">
                {documentType}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-green-700">Verified</span>
            <span className="text-text-muted text-xs">
              Completed: {new Date(verifiedAt).toLocaleDateString()}
            </span>
            {expiryDate && (
              <span className="text-text-muted text-xs">
                Expiry: {new Date(expiryDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Expand indicator */}
        <div className="flex justify-end">
          <div className="text-text-muted text-xs">
            {expanded ? "Hide details" : "Show details"}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-6 pt-0 border-t border-input-border bg-white">
          {/* User-filled Data */}
          <div className="mb-4">
            <div className="text-text-primary font-roboto text-sm font-semibold mb-2">
              User-filled data
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.keys(data).length === 0 ? (
                <div className="text-text-muted">No data available.</div>
              ) : (
                Object.entries(data).map(([k, v]) => (
                  <div key={k} className="flex flex-col">
                    <span className="text-text-muted text-xs">{k}</span>
                    <span className="text-text-primary text-sm font-medium">
                      {v}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Consent Management */}
          <div>
            <div className="text-text-primary font-roboto text-sm font-semibold mb-2">
              Consent
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-text-muted text-sm">
                Given:{" "}
                {consentGivenAt
                  ? new Date(consentGivenAt).toLocaleDateString()
                  : "-"}
              </div>
              <div className="text-text-muted text-sm">
                Consent expiry:{" "}
                {consentExpiry
                  ? new Date(consentExpiry).toLocaleDateString()
                  : "N/A"}
              </div>
              {consentExpiry && consentExpiryDays <= 30 && (
                <div className="px-3 py-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded">
                  Consent expires in {consentExpiryDays} day
                  {consentExpiryDays === 1 ? "" : "s"}.
                </div>
              )}
              <div className="pt-3">
                <button className="px-3 py-2 rounded-md bg-white border border-input-border text-sm text-text-primary">
                  Manage consent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

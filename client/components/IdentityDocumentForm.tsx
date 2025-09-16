import { useState } from 'react';

interface IdentityDocumentFormProps {
  // You can add form data props as needed
}

export function IdentityDocumentForm({}: IdentityDocumentFormProps) {
  const [country, setCountry] = useState('');
  const [documentType, setDocumentType] = useState('');

  return (
    <div className="flex flex-col items-start gap-4 self-stretch w-full">
      {/* Country Selection */}
      <div className="flex w-full flex-col items-start">
        {/* Label */}
        <div className="flex pb-2 items-start gap-2 self-stretch">
          <div className="flex h-2.5 flex-col justify-center flex-1 text-[#172B4D] font-roboto text-[13px] font-medium leading-[18px]">
            Country
          </div>
        </div>

        {/* Input Container */}
        <div className="flex w-full items-start gap-6">
          {/* Country Dropdown */}
          <div className="flex h-[38px] px-3 py-[15px] justify-between items-center flex-1 rounded border border-[#C3C6D4] bg-white">
            <div className="flex items-center gap-2 flex-1">
              <div className="text-[#676879] font-roboto text-[13px] font-normal leading-5">
                {country || 'Select'}
              </div>
            </div>
            <div className="flex justify-end items-center gap-2">
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                <path
                  d="M1 3L5 7L9 3"
                  stroke="#344563"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Document Type Dropdown */}
          <div className="flex h-[38px] px-3 py-[15px] justify-between items-center flex-1 rounded border border-[#C3C6D4] bg-white">
            <div className="flex items-center gap-2 flex-1">
              <div className="text-[#676879] font-roboto text-[13px] font-normal leading-5">
                {documentType || 'Select'}
              </div>
            </div>
            <div className="flex justify-end items-center gap-2">
              {/* No chevron for now as per design */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

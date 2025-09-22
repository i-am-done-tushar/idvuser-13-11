import { useState, useRef } from "react";

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function UploadDialog({ isOpen, onClose, onSubmit }: UploadDialogProps) {
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const [frontError, setFrontError] = useState<string>("");
  const [backError, setBackError] = useState<string>("");

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"] as const;
  const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".pdf"] as const;

  if (!isOpen) return null;

  const validateFile = (file: File) => {
    const typeOk =
      ALLOWED_TYPES.includes(file.type as any) ||
      ALLOWED_EXT.some((ext) => file.name.toLowerCase().endsWith(ext));
    const sizeOk = file.size <= MAX_SIZE;
    return { typeOk, sizeOk };
  };

  const handleFrontFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setFrontFile(null);
      setFrontError("");
      return;
    }
    const { typeOk, sizeOk } = validateFile(file);
    if (!typeOk || !sizeOk) {
      setFrontFile(null);
      setFrontError("Invalid file. Allowed: JPG, JPEG, PNG, PDF. Max 5MB.");
      return;
    }
    setFrontError("");
    setFrontFile(file);
  };

  const handleBackFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setBackFile(null);
      setBackError("");
      return;
    }
    const { typeOk, sizeOk } = validateFile(file);
    if (!typeOk || !sizeOk) {
      setBackFile(null);
      setBackError("Invalid file. Allowed: JPG, JPEG, PNG, PDF. Max 5MB.");
      return;
    }
    setBackError("");
    setBackFile(file);
  };

  const handleSubmit = () => {
    if (frontFile && backFile && !frontError && !backError) {
      onSubmit();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex w-[800px] max-w-[90vw] max-h-[90vh] flex-col items-start rounded-lg bg-white overflow-auto">
        {/* Header */}
        <div className="flex h-[58px] justify-between items-center self-stretch border-b border-[#D0D4E4] px-6">
          <div className="flex items-center gap-2">
            <div className="text-[#172B4D] font-figtree text-xl font-bold leading-[30px]">
              Upload Documents
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex w-8 h-8 justify-center items-center gap-2.5 rounded-full bg-white hover:bg-gray-50"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="#676879"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex p-6 flex-col items-center gap-6 self-stretch bg-white">
          <div className="text-[#172B4D] text-center font-roboto text-lg font-medium">
            Upload clear images of both front and back sides.
          </div>

          <div className="flex flex-col sm:flex-row h-auto sm:h-[320px] items-center gap-6 px-4 sm:px-0">
            {/* Front Side */}
            <div className="flex flex-1 min-w-0 h-auto sm:h-[320px] flex-col items-start">
              <div className="flex w-full h-auto sm:h-[272px] flex-col items-center gap-7 flex-shrink-0">
                <div className="flex h-auto sm:h-[272px] flex-col items-start flex-shrink-0 self-stretch">
                  <div className="flex justify-center items-center gap-2 flex-1 self-stretch">
                    <div
                      className="flex flex-col justify-end items-center gap-2 flex-1 self-stretch rounded-t-lg border-2 border-dashed border-[#C3C6D4] bg-white cursor-pointer hover:bg-gray-50"
                      onClick={() => frontInputRef.current?.click()}
                    >
                      <div className="flex w-full max-w-[326px] h-auto sm:h-[262px] flex-col justify-center items-center gap-2">
                        <div className="flex w-12 h-12 p-2 justify-center items-center flex-shrink-0 rounded-full bg-[#F6F7FB]">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M7.76471 11.5294C6.88944 11.5294 6.4518 11.5294 6.09274 11.6256C5.11837 11.8867 4.35729 12.6478 4.09621 13.6221C4 13.9812 4 14.4188 4 15.2941V16.4235C4 18.0049 4 18.7955 4.30775 19.3995C4.57845 19.9308 5.01039 20.3627 5.54168 20.6334C6.14566 20.9412 6.93632 20.9412 8.51765 20.9412H16.4235C18.0049 20.9412 18.7955 20.9412 19.3995 20.6334C19.9308 20.3627 20.3627 19.9308 20.6334 19.3995C20.9412 18.7955 20.9412 18.0049 20.9412 16.4235V15.2941C20.9412 14.4188 20.9412 13.9812 20.845 13.6221C20.5839 12.6478 19.8228 11.8867 18.8485 11.6256C18.4894 11.5294 18.0518 11.5294 17.1765 11.5294M16.2353 7.76471L12.4706 4M12.4706 4L8.70588 7.76471M12.4706 4V15.2941"
                              stroke="#676879"
                              strokeWidth="1.41176"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <div className="self-stretch text-[#172B4D] text-center font-roboto text-lg font-medium">
                          Front side of your document
                        </div>
                        <div className="text-center font-roboto text-[13px] font-medium">
                          <span className="text-[#172B4D]">
                            Drag & Drop File Here or{" "}
                          </span>
                          <span className="text-[#0073EA]">Choose File</span>
                        </div>
                      </div>
                      <input
                        ref={frontInputRef}
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={handleFrontFileSelect}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex h-12 px-4 justify-center items-end gap-2 flex-shrink-0 self-stretch rounded-b bg-[#F6F7FB]">
                <div className="flex justify-between items-center flex-1 self-stretch">
                  <div className="text-[#676879] font-roboto text-xs font-normal leading-5">
                    Supported Formats: JPG, JPEG, PNG, PDF
                  </div>
                  <div className="text-[#676879] font-roboto text-xs font-normal leading-5">
                    Maximum Size: 5MB
                  </div>
                </div>
              </div>
            </div>

            {/* Back Side */}
            <div className="flex flex-1 min-w-0 h-auto sm:h-[320px] flex-col items-start">
              <div className="flex w-full h-auto sm:h-[272px] flex-col items-center gap-7 flex-shrink-0">
                <div className="flex h-auto sm:h-[272px] flex-col items-start flex-shrink-0 self-stretch">
                  <div className="flex justify-center items-center gap-2 flex-1 self-stretch">
                    <div
                      className="flex flex-col justify-end items-center gap-2 flex-1 self-stretch rounded-t-lg border-2 border-dashed border-[#C3C6D4] bg-white cursor-pointer hover:bg-gray-50"
                      onClick={() => backInputRef.current?.click()}
                    >
                      <div className="flex w-full max-w-[326px] h-auto sm:h-[262px] flex-col justify-center items-center gap-2">
                        <div className="flex w-12 h-12 p-2 justify-center items-center flex-shrink-0 rounded-full bg-[#F6F7FB]">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M7.76471 11.5294C6.88944 11.5294 6.4518 11.5294 6.09274 11.6256C5.11837 11.8867 4.35729 12.6478 4.09621 13.6221C4 13.9812 4 14.4188 4 15.2941V16.4235C4 18.0049 4 18.7955 4.30775 19.3995C4.57845 19.9308 5.01039 20.3627 5.54168 20.6334C6.14566 20.9412 6.93632 20.9412 8.51765 20.9412H16.4235C18.0049 20.9412 18.7955 20.9412 19.3995 20.6334C19.9308 20.3627 20.3627 19.9308 20.6334 19.3995C20.9412 18.7955 20.9412 18.0049 20.9412 16.4235V15.2941C20.9412 14.4188 20.9412 13.9812 20.845 13.6221C20.5839 12.6478 19.8228 11.8867 18.8485 11.6256C18.4894 11.5294 18.0518 11.5294 17.1765 11.5294M16.2353 7.76471L12.4706 4M12.4706 4L8.70588 7.76471M12.4706 4V15.2941"
                              stroke="#676879"
                              strokeWidth="1.41176"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <div className="self-stretch text-[#172B4D] text-center font-roboto text-lg font-medium">
                          Back side of your document
                        </div>
                        <div className="text-center font-roboto text-[13px] font-medium">
                          <span className="text-[#172B4D]">
                            Drag & Drop File Here or{" "}
                          </span>
                          <span className="text-[#0073EA]">Choose File</span>
                        </div>
                      </div>
                      <input
                        ref={backInputRef}
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={handleBackFileSelect}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex h-12 px-4 justify-center items-end gap-2 flex-shrink-0 self-stretch rounded-b bg-[#F6F7FB]">
                <div className="flex justify-between items-center flex-1 self-stretch">
                  <div className="text-[#676879] font-roboto text-xs font-normal leading-5">
                    Supported Formats: JPG, JPEG, PNG, PDF
                  </div>
                  <div className="text-[#676879] font-roboto text-xs font-normal leading-5">
                    Maximum Size: 5MB
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex h-[68px] justify-between items-center gap-2 self-stretch border-t border-[#D0D4E4] bg-white px-6">
          {(frontError || backError) && (
            <div className="text-destructive text-xs">
              {frontError || backError}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={!frontFile || !backFile || !!frontError || !!backError}
            className={`flex h-[38px] px-4 py-[11px] justify-center items-center gap-2 rounded ${
              frontFile && backFile && !frontError && !backError
                ? "bg-[#0073EA] hover:bg-[#0073EA]/90"
                : "bg-[#0073EA]/50 cursor-not-allowed"
            }`}
          >
            <span className="text-white font-roboto text-[13px] font-medium">
              Submit
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

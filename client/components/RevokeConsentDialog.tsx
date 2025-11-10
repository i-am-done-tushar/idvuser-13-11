import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface RevokeConsentDialogProps {
  trigger: React.ReactNode;
  onConfirm?: () => void;
}

export function RevokeConsentDialog({
  trigger,
  onConfirm,
}: RevokeConsentDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm?.();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-[548px] p-0 gap-0">
        <div className="flex items-start gap-6 p-6">
          <div className="flex w-12 h-12 justify-center items-center flex-shrink-0 rounded-[28px] border-8 border-[#FEF3F2] bg-[#FEE4E2]">
            <svg
              className="w-6 h-6 flex-shrink-0"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                stroke="#D92D20"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="flex flex-col gap-12 flex-1">
            <div className="flex flex-col gap-2 pr-5">
              <DialogTitle className="text-[#323238] font-roboto text-base font-bold leading-4">
                Revoke Consent
              </DialogTitle>
              <p className="text-[#505258] font-roboto text-[13px] font-normal leading-5">
                Revoking will stop verification and delete your shared data.
                Continue?
              </p>
            </div>

            <div className="flex justify-end items-center gap-2 pr-5 bg-white">
              <button
                onClick={() => setOpen(false)}
                className="flex h-[38px] px-4 py-2.5 justify-center items-center rounded bg-white text-[#505258] font-roboto text-[13px] font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex h-[38px] px-4 py-2.5 justify-center items-center gap-0.5 rounded border border-[#D83A52] bg-[#D83A52] text-white font-roboto text-[13px] font-medium hover:bg-[#C02E47] transition-colors"
              >
                Yes, Revoke
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

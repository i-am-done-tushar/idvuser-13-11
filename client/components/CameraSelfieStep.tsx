import { useEffect, useRef, useState } from "react";
import { HowItWorksDialog } from "./HowItWorksDialog";

interface CameraSelfieStepProps {
  onComplete?: () => void;
}

export function CameraSelfieStep({ onComplete }: CameraSelfieStepProps) {
  const [cameraError, setCameraError] = useState(false);
  const [showHowItWorksDialog, setShowHowItWorksDialog] = useState(false);
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Ask for camera access on mount
  useEffect(() => {
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraError(false);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setCameraError(true);
      }
    }

    initCamera();

    return () => {
      // Stop camera when unmounting
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  // Capture frame from video
  const captureSelfie = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const selfieDataUrl = canvas.toDataURL("image/png"); // you can send this to backend
    console.log("Selfie captured:", selfieDataUrl);

    setSelfieCaptured(true);
    onComplete?.();
  };

  // Retry initializing camera without reloading the page
  const handleRetry = async () => {
    setSelfieCaptured(false);
    setCameraError(false);

    // Stop existing tracks if any
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((t) => t.stop());
      // Clear the srcObject so video element can be reattached to new stream
      try {
        (videoRef.current as HTMLVideoElement).srcObject = null;
      } catch {}
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraError(false);
    } catch (err) {
      console.error("Error accessing camera on retry:", err);
      setCameraError(true);
    }
  };

  return (
    <div className="flex flex-col items-start gap-4 self-stretch rounded bg-background">
      <div className="flex py-0 px-0.5 flex-col items-start self-stretch rounded border border-border">
        {/* Header Section */}
        <div className="flex p-4 flex-col justify-center items-center gap-2 self-stretch bg-background">
          <div className="flex pb-1 items-center gap-2 self-stretch">
            <svg
              className="w-[18px] h-[18px] aspect-1"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.00195 8.99902H12.002M16.502 8.99902C16.502 13.1411 13.1441 16.499 9.00195 16.499C4.85982 16.499 1.50195 13.1411 1.50195 8.99902C1.50195 4.85689 4.85982 1.49902 9.00195 1.49902C13.1441 1.49902 16.502 4.85689 16.502 8.99902Z"
                stroke="#323238"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-text-primary font-roboto text-base font-bold leading-3">
              Capture Selfie
            </div>
          </div>
          <div className="flex pl-7 justify-center items-center gap-2.5 self-stretch">
            <div className="flex-1 text-text-primary font-roboto text-[13px] font-normal leading-5">
              Take a live selfie to confirm you are the person in the ID
              document. Make sure you're in a well-lit area and your face is
              clearly visible.
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="flex p-2 sm:p-4 flex-col justify-center items-center self-stretch border-t border-border bg-background">
          <div className="flex w-full max-w-[956px] p-2 flex-col lg:flex-row items-center gap-4 lg:gap-6">
            {/* Left Section - Camera Capture */}
            <div className="flex w-full lg:flex-1 flex-col justify-center items-center">
              <div className="flex w-full max-w-[440px] min-h-[300px] lg:min-h-[380px] pt-4 flex-col items-center gap-2 rounded-t-lg border-t-[1.5px] border-r-[1.5px] border-l-[1.5px] border-dashed border-step-inactive-border bg-background">
                <div className="flex flex-col justify-center items-center gap-7 flex-1 self-stretch rounded-t border-[1.5px] border-dashed border-step-inactive-border bg-background">
                  <div className="flex flex-col justify-center items-center gap-2 flex-1 self-stretch rounded-lg bg-background px-4">
                    {cameraError ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-[126px] h-[52px] relative">
                          <div className="w-full text-text-primary text-center font-roboto text-[13px] font-medium">
                            Camera not detected.
                          </div>
                        </div>
                        <div className="w-full max-w-[284px] text-text-muted text-center font-roboto text-[13px] font-normal leading-5">
                          Please check your device or close other apps using the
                          camera.
                        </div>
                      </div>
                    ) : (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full max-w-[350px] rounded-lg"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Retry & Capture Buttons */}
              <div className="flex w-full max-w-[440px] p-2 pr-4 flex-row items-center gap-2 rounded-b bg-[#F6F7FB] justify-end">
                <button
                  onClick={handleRetry}
                  className="flex h-8 py-[9px] px-3 justify-center items-center gap-1 rounded bg-primary hover:bg-primary/90 transition-colors"
                >
                  <span className="text-white font-roboto text-[13px] font-medium">
                    Retry
                  </span>
                </button>

                <button
                  onClick={captureSelfie}
                  disabled={cameraError}
                  className={`flex h-8 py-[9px] px-3 justify-center items-center gap-1 rounded ${
                    cameraError
                      ? "bg-primary opacity-50"
                      : "bg-success hover:bg-success/90"
                  }`}
                >
                  <span className="text-white font-roboto text-[13px] font-medium">
                    {selfieCaptured ? "Captured" : "Capture Selfie"}
                  </span>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="flex lg:hidden w-full h-4 flex-row justify-center items-center gap-2">
              <div className="flex-1 h-0 border-t border-border"></div>
              <div className="text-text-muted font-roboto text-[13px] font-normal px-2">
                or
              </div>
              <div className="flex-1 h-0 border-t border-border"></div>
            </div>
            <div className="hidden lg:flex h-24 flex-col justify-center items-center gap-1">
              <div className="w-0 h-[34px] border-l border-border"></div>
              <div className="text-text-muted font-roboto text-[13px] font-normal">
                or
              </div>
              <div className="w-0 h-[34px] border-l border-border"></div>
            </div>

            {/* Right Section - QR Code */}
            <div className="flex w-full lg:flex-1 flex-col justify-center items-center">
              <div className="flex w-full max-w-[440px] min-h-[300px] lg:min-h-[380px] flex-col items-center gap-2">
                <div className="flex pt-4 flex-col justify-between items-center flex-1 self-stretch rounded-t-lg border-[1.5px] border-dashed border-step-inactive-border">
                  <div className="flex flex-col justify-center items-center gap-2 flex-1 px-4">
                    <div className="flex flex-col lg:flex-row justify-center items-center gap-4">
                      <img
                        className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 flex-shrink-0"
                        src="https://api.builder.io/api/v1/image/assets/TEMP/7e3be353453f139a4c9f40e2de6ea62b3ab16235?width=256"
                        alt="QR Code"
                      />
                      <div className="flex flex-col justify-center items-center gap-2">
                        <div className="flex w-full max-w-[214px] flex-col items-center gap-3">
                          <div className="w-full text-center font-roboto text-[13px] font-normal leading-5">
                            <span className="text-text-muted">
                              Continue on another device by scanning the QR code
                              or opening
                            </span>
                            <span className="text-primary">
                              {" "}
                              https://id.xyz/verify
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* How does this work */}
              <div className="flex w-full max-w-[440px] h-12 p-4 items-center gap-2 rounded-b bg-[#F6F7FB]">
                <div className="flex w-full justify-end items-center gap-1">
                  <button
                    onClick={() => setShowHowItWorksDialog(true)}
                    className="text-primary font-roboto text-xs font-normal leading-5 hover:underline"
                  >
                    How does this work?
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <HowItWorksDialog
        isOpen={showHowItWorksDialog}
        onClose={() => setShowHowItWorksDialog(false)}
      />
    </div>
  );
}

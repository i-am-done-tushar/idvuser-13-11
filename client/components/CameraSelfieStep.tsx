import { useEffect, useRef, useState } from "react";
import { HowItWorksDialog } from "./HowItWorksDialog";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || "";

interface CameraSelfieStepProps {
  onComplete?: () => void;
}

export function CameraSelfieStep({ onComplete }: CameraSelfieStepProps) {
  const { toast } = useToast();
  const [cameraError, setCameraError] = useState(false);
  const [showHowItWorksDialog, setShowHowItWorksDialog] = useState(false);
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  // store the uploaded file id so we can delete it if the user re-uploads
  const [uploadedFileId, setUploadedFileId] = useState<number | null>(null);
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

    // Convert to JPEG format (API only accepts JPEG and PDF)
    const selfieDataUrl = canvas.toDataURL("image/jpeg", 0.9);
    console.log("Selfie captured:", selfieDataUrl);

    // Set the captured image and freeze the camera view
    setCapturedImageUrl(selfieDataUrl);
    setSelfieCaptured(true);
  };

  // Confirm the captured selfie and upload to server
  const uploadSelfie = async () => {
    if (!capturedImageUrl) return;

    try {
      setUploading(true);

      // Convert data URL to blob
      const response = await fetch(capturedImageUrl);
      const blob = await response.blob();

      // Create FormData for upload
      const DOCUMENT_DEFINITION_ID = "5c5df74f-9684-413e-849f-c3b4d53e032d";

      // If there is an existing uploaded file for this selfie, attempt to delete it first
      if (uploadedFileId) {
        try {
          await fetch(`${API_BASE}/api/Files/${uploadedFileId}`, { method: 'DELETE' });
        } catch (delErr) {
          console.warn(`Failed to delete previous selfie id ${uploadedFileId}:`, delErr);
        }
      }

      const formData = new FormData();
      formData.append('File', blob, 'selfie.jpg');
      formData.append('DocumentDefinitionId', DOCUMENT_DEFINITION_ID);
      formData.append('Bucket', 'string');
      formData.append('UserTemplateSubmissionId', '5');

      // Upload to the same endpoint as documents
      const uploadResponse = await fetch(`${API_BASE}/api/Files/upload`, {
        method: 'POST',
        body: formData,
      });

      if (uploadResponse.ok) {
        const result = await uploadResponse.json().catch(() => ({}));
        if (result && typeof result.id === 'number') {
          setUploadedFileId(result.id);
        }

        toast({
          title: "Selfie Uploaded",
          description: "Your selfie has been uploaded successfully!",
        });

        // Mark biometric verification as complete
        onComplete?.();
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading selfie:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload selfie. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Retake the selfie (clear captured image and show live video again)
  const retakeSelfie = () => {
    setCapturedImageUrl(null);
    setSelfieCaptured(false);
  };

  // Retry initializing camera without reloading the page
  const handleRetry = async () => {
    setSelfieCaptured(false);
    setCapturedImageUrl(null);
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
                    ) : selfieCaptured && capturedImageUrl ? (
                      // Show captured image when selfie is taken
                      <div className="flex flex-col items-center gap-3 w-full">
                        <img
                          src={capturedImageUrl}
                          alt="Captured selfie"
                          className="w-full max-w-[350px] rounded-lg"
                        />
                        <div className="text-text-primary text-center font-roboto text-[13px] font-medium">
                          Selfie Captured
                        </div>
                        <div className="text-text-muted text-center font-roboto text-[12px] font-normal">
                          Review your photo and confirm or retake if needed
                        </div>
                      </div>
                    ) : (
                      // Show live video feed
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
                {selfieCaptured && capturedImageUrl ? (
                  // Show retake and upload buttons when selfie is captured
                  <div className="flex gap-2">
                    <button
                      onClick={retakeSelfie}
                      disabled={uploading}
                      className="flex h-8 py-[9px] px-3 justify-center items-center gap-1 rounded bg-gray-500 hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      <span className="text-white font-roboto text-[13px] font-medium">
                        Retake
                      </span>
                    </button>
                    <button
                      onClick={uploadSelfie}
                      disabled={uploading}
                      className="flex h-8 py-[9px] px-3 justify-center items-center gap-1 rounded bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      <span className="text-white font-roboto text-[13px] font-medium">
                        {uploading ? "Uploading..." : "Upload"}
                      </span>
                    </button>
                  </div>
                ) : (
                  // Show retry and capture buttons when no selfie is captured
                  <>
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
                          : "bg-primary hover:bg-primary/90"
                      }`}
                    >
                      <span className="text-white font-roboto text-[13px] font-medium">
                        Capture Selfie
                      </span>
                    </button>
                  </>
                )}
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

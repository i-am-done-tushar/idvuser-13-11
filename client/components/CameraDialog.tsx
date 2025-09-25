import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface CameraDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

interface CapturedImage {
  blob: Blob;
  dataUrl: string;
}

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  "http://10.10.2.133:8080";
const DOCUMENT_DEFINITION_ID = "5c5df74f-9684-413e-849f-c3b4d53e032d";

export function CameraDialog({ isOpen, onClose, onSubmit }: CameraDialogProps) {
  const { toast } = useToast();
  const [frontCaptured, setFrontCaptured] = useState<CapturedImage | null>(
    null,
  );
  const [backCaptured, setBackCaptured] = useState<CapturedImage | null>(null);
  const [showCamera, setShowCamera] = useState<"front" | "back" | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{
    front: boolean;
    back: boolean;
  }>({
    front: false,
    back: false,
  });

  // store uploaded file ids returned by the server so we can delete on re-upload
  const [uploadedFileIds, setUploadedFileIds] = useState<{
    front?: number;
    back?: number;
  }>({});

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera when camera view is shown
  useEffect(() => {
    if (showCamera && isOpen) {
      initCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [showCamera, isOpen]);

  // Clean up when dialog closes
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setShowCamera(null);
      setFrontCaptured(null);
      setBackCaptured(null);
      setUploadedFiles({ front: false, back: false });
      setCameraError(false);
    }
  }, [isOpen]);

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setCameraError(false);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError(true);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = async (side: "front" | "back") => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          const capturedImage: CapturedImage = { blob, dataUrl };

          if (side === "front") {
            setFrontCaptured(capturedImage);
          } else {
            setBackCaptured(capturedImage);
          }

          // Close camera view
          setShowCamera(null);
          stopCamera();

          toast({
            title: "Image Captured",
            description: `${side === "front" ? "Front" : "Back"} side captured successfully.`,
          });
        }
      },
      "image/jpeg",
      0.8,
    );
  };

  const uploadImage = async (image: CapturedImage, side: "front" | "back") => {
    try {
      setUploading(true);

      // If there's a previous uploaded file for this side, attempt to delete it first (purge)
      const previousId = uploadedFileIds[side];
      if (previousId) {
        try {
          await fetch(`${API_BASE}/api/Files/${previousId}/purge`, {
            method: "DELETE",
          });
        } catch (delErr) {
          // log and continue - deletion failure shouldn't block new upload
          console.warn(
            `Failed to purge previous file id ${previousId}:`,
            delErr,
          );
        }
      }

      const formData = new FormData();
      formData.append("File", image.blob, `${side}-document.jpg`);
      formData.append("DocumentDefinitionId", DOCUMENT_DEFINITION_ID);
      formData.append("Bucket", "string");
      formData.append("UserTemplateSubmissionId", "5");

      const response = await fetch(`${API_BASE}/api/Files/upload`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json().catch(() => ({}));
        // Save returned file id so we can delete on subsequent uploads
        const returnedId =
          (result &&
            result.file &&
            typeof result.file.id === "number" &&
            result.file.id) ||
          (typeof result.id === "number" && result.id) ||
          (result &&
            result.mapping &&
            typeof result.mapping.fileId === "number" &&
            result.mapping.fileId) ||
          null;
        if (returnedId) {
          setUploadedFileIds((prev) => ({ ...prev, [side]: returnedId }));
        }

        setUploadedFiles((prev) => ({ ...prev, [side]: true }));
        toast({
          title: "Upload Successful",
          description: `${side === "front" ? "Front" : "Back"} side uploaded successfully.`,
        });
      } else {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error uploading ${side} image:`, error);
      toast({
        title: "Upload Failed",
        description: `Failed to upload ${side} side. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const retakeImage = (side: "front" | "back") => {
    if (side === "front") {
      setFrontCaptured(null);
      setUploadedFiles((prev) => ({ ...prev, front: false }));
    } else {
      setBackCaptured(null);
      setUploadedFiles((prev) => ({ ...prev, back: false }));
    }
  };

  const handleSubmit = () => {
    if (uploadedFiles.front && uploadedFiles.back) {
      toast({
        title: "Done",
        description: "Both documents uploaded successfully.",
      });
      onSubmit();
    }
  };

  if (!isOpen) return null;

  // Camera view
  if (showCamera) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <div className="flex h-16 justify-between items-center px-6 bg-black/50 text-white">
            <div className="text-xl font-bold">
              Capture {showCamera === "front" ? "Front" : "Back"} Side
            </div>
            <button
              onClick={() => {
                setShowCamera(null);
                stopCamera();
              }}
              className="flex w-8 h-8 justify-center items-center rounded-full bg-white/20 hover:bg-white/30"
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
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Camera View */}
          <div className="flex-1 flex items-center justify-center">
            {cameraError ? (
              <div className="text-white text-center">
                <div className="text-xl mb-2">Camera not available</div>
                <div className="text-sm opacity-75">
                  Please check your camera permissions
                </div>
              </div>
            ) : (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="max-w-full max-h-full rounded-lg"
                />
                <div className="absolute inset-0 border-2 border-white/50 rounded-lg pointer-events-none" />
              </div>
            )}
          </div>

          {/* Capture Button */}
          <div className="flex justify-center pb-8">
            <button
              onClick={() => captureImage(showCamera)}
              disabled={cameraError}
              className="flex w-16 h-16 justify-center items-center rounded-full bg-white hover:bg-gray-100 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
                  fill="black"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main dialog view
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex w-[800px] max-w-[90vw] max-h-[90vh] flex-col items-start rounded-lg bg-white overflow-auto">
        {/* Header */}
        <div className="flex h-[58px] justify-between items-center self-stretch border-b border-[#D0D4E4] px-6">
          <div className="flex items-center gap-2">
            <div className="text-[#172B4D] font-figtree text-xl font-bold leading-[30px]">
              Capture Documents
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
            Capture clear images of both front and back sides.
          </div>

          <div className="flex flex-col sm:flex-row h-auto sm:h-[320px] items-center gap-6 px-4 sm:px-0">
            {/* Front Side */}
            <div className="flex flex-1 min-w-0 h-auto sm:h-[320px] flex-col items-start">
              <div className="flex w-full h-auto sm:h-[272px] flex-col items-center gap-7 flex-shrink-0">
                <div className="flex h-[272px] flex-col items-start flex-shrink-0 self-stretch">
                  <div className="flex justify-center items-center gap-2 flex-1 self-stretch">
                    <div
                      className={`flex flex-col justify-center items-center gap-2 flex-1 self-stretch rounded-t-lg border-2 ${
                        frontCaptured
                          ? "border-green-500 bg-green-50"
                          : "border-dashed border-[#C3C6D4] bg-white"
                      }`}
                    >
                      <div className="flex w-full max-w-[326px] h-auto sm:h-[262px] flex-col justify-center items-center gap-2 p-4">
                        {frontCaptured ? (
                          <div className="flex flex-col items-center gap-2">
                            <img
                              src={frontCaptured.dataUrl}
                              alt="Front side captured"
                              className="max-w-full max-h-32 rounded"
                            />
                            <div className="text-green-600 font-medium text-sm">
                              ✓ Front side captured
                            </div>
                            <button
                              onClick={() => retakeImage("front")}
                              className="text-blue-600 text-xs hover:underline"
                            >
                              Retake
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex w-[52px] h-[52px] p-2 justify-center items-center flex-shrink-0 rounded-full bg-[#F6F7FB]">
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 25"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M1.99805 8.87722C1.99805 8.5269 1.99805 8.35174 2.01267 8.20421C2.15365 6.78127 3.27932 5.6556 4.70226 5.51462C4.84979 5.5 5.03441 5.5 5.40363 5.5C5.5459 5.5 5.61704 5.5 5.67744 5.49634C6.44866 5.44963 7.124 4.96288 7.41219 4.246C7.43476 4.18986 7.45586 4.12657 7.49805 4C7.54024 3.87343 7.56134 3.81014 7.58391 3.754C7.8721 3.03712 8.54744 2.55037 9.31866 2.50366C9.37906 2.5 9.44577 2.5 9.57919 2.5H14.4169C14.5503 2.5 14.617 2.5 14.6774 2.50366C15.4486 2.55037 16.124 3.03712 16.4121 3.754C16.4347 3.81014 16.4558 3.87343 16.498 4C16.5402 4.12657 16.5613 4.18986 16.5839 4.246C16.872 4.96288 17.5474 5.44963 18.3186 5.49634C18.379 5.5 18.4501 5.5 18.5924 5.5C18.9616 5.5 19.1463 5.5 19.2938 5.51462C20.7167 5.6556 21.8424 6.78127 21.9834 8.20421C21.998 8.35174 21.998 8.5269 21.998 8.87722V16.7C21.998 18.3802 21.998 19.2202 21.671 19.862C21.3834 20.4265 20.9245 20.8854 20.36 21.173C19.7182 21.5 18.8782 21.5 17.198 21.5H6.79805C5.11789 21.5 4.27781 21.5 3.63608 21.173C3.07159 20.8854 2.61265 20.4265 2.32503 19.862C1.99805 19.2202 1.99805 18.3802 1.99805 16.7V8.87722Z"
                                  stroke="#676879"
                                  strokeWidth="1.35"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M11.998 17C14.2071 17 15.998 15.2091 15.998 13C15.998 10.7909 14.2071 9 11.998 9C9.78891 9 7.99805 10.7909 7.99805 13C7.99805 15.2091 9.78891 17 11.998 17Z"
                                  stroke="#676879"
                                  strokeWidth="1.35"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                            <div className="self-stretch text-[#172B4D] text-center font-roboto text-lg font-medium">
                              Front side of your document
                            </div>
                            <div className="text-[#676879] font-roboto text-xs font-normal leading-5">
                              Ensure the front side is in frame and well-lit.
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex w-full sm:w-[364px] h-12 p-2 flex-col items-end gap-2 flex-shrink-0 rounded-b border-t-0 bg-[#F6F7FB]">
                {frontCaptured ? (
                  uploadedFiles.front ? (
                    <button
                      disabled
                      className="flex h-8 px-3 py-[9px] justify-center items-center gap-2 flex-shrink-0 rounded bg-green-600"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 9L8 11L12 7"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-white font-roboto text-[13px] font-medium">
                        Uploaded
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() => uploadImage(frontCaptured, "front")}
                      disabled={uploading}
                      className="flex h-8 px-3 py-[9px] justify-center items-center gap-2 flex-shrink-0 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                    >
                      <span className="text-white font-roboto text-[13px] font-medium">
                        {uploading ? "Uploading..." : "Upload"}
                      </span>
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => setShowCamera("front")}
                    className="flex h-8 px-3 py-[9px] justify-center items-center gap-2 flex-shrink-0 rounded bg-[#0073EA] hover:bg-[#0073EA]/90"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1.5 6.28292C1.5 6.02018 1.5 5.8888 1.51097 5.77816C1.6167 4.71095 2.46095 3.8667 3.52816 3.76096C3.6388 3.75 3.77727 3.75 4.05419 3.75C4.16089 3.75 4.21424 3.75 4.25954 3.74725C4.83796 3.71222 5.34446 3.34716 5.56061 2.8095C5.57753 2.7674 5.59336 2.71993 5.625 2.625C5.65664 2.53007 5.67247 2.4826 5.68939 2.4405C5.90554 1.90284 6.41204 1.53778 6.99046 1.50274C7.03576 1.5 7.08579 1.5 7.18585 1.5H10.8142C10.9142 1.5 10.9643 1.5 11.0096 1.50274C11.588 1.53778 12.0945 1.90284 12.3106 2.4405C12.3275 2.4826 12.3434 2.53007 12.375 2.625C12.4066 2.71993 12.4225 2.7674 12.4394 2.8095C12.6555 3.34716 13.1621 3.71222 13.7405 3.74725C13.7858 3.75 13.8391 3.75 13.9458 3.75C14.2227 3.75 14.3612 3.75 14.4718 3.76096C15.539 3.8667 16.3833 4.71095 16.489 5.77816C16.5 5.8888 16.5 6.02018 16.5 6.28292V12.15C16.5 13.4102 16.5 14.0401 16.2548 14.5215C16.0391 14.9449 15.6949 15.2891 15.2715 15.5048C14.7901 15.75 14.1602 15.75 12.9 15.75H5.1C3.83988 15.75 3.20982 15.75 2.72852 15.5048C2.30516 15.2891 1.96095 14.9449 1.74524 14.5215C1.5 14.0401 1.5 13.4102 1.5 12.15V6.28292Z"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 12.375C10.6568 12.375 12 11.0318 12 9.375C12 7.71817 10.6568 6.375 9 6.375C7.34314 6.375 6 7.71817 6 9.375C6 11.0318 7.34314 12.375 9 12.375Z"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-white font-roboto text-[13px] font-medium">
                      Capture
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Back Side */}
            <div className="flex flex-1 min-w-0 h-auto sm:h-[320px] flex-col items-start">
              <div className="flex w-full h-auto sm:h-[272px] flex-col items-center gap-7 flex-shrink-0">
                <div className="flex h-[272px] flex-col items-start flex-shrink-0 self-stretch">
                  <div className="flex justify-center items-center gap-2 flex-1 self-stretch">
                    <div
                      className={`flex flex-col justify-center items-center gap-2 flex-1 self-stretch rounded-t-lg border-2 ${
                        backCaptured
                          ? "border-green-500 bg-green-50"
                          : "border-dashed border-[#C3C6D4] bg-white"
                      }`}
                    >
                      <div className="flex w-full max-w-[326px] h-auto sm:h-[262px] flex-col justify-center items-center gap-2 p-4">
                        {backCaptured ? (
                          <div className="flex flex-col items-center gap-2">
                            <img
                              src={backCaptured.dataUrl}
                              alt="Back side captured"
                              className="max-w-full max-h-32 rounded"
                            />
                            <div className="text-green-600 font-medium text-sm">
                              ✓ Back side captured
                            </div>
                            <button
                              onClick={() => retakeImage("back")}
                              className="text-blue-600 text-xs hover:underline"
                            >
                              Retake
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex w-[52px] h-[52px] p-2 justify-center items-center flex-shrink-0 rounded-full bg-[#F6F7FB]">
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 25"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M1.99805 8.87722C1.99805 8.5269 1.99805 8.35174 2.01267 8.20421C2.15365 6.78127 3.27932 5.6556 4.70226 5.51462C4.84979 5.5 5.03441 5.5 5.40363 5.5C5.5459 5.5 5.61704 5.5 5.67744 5.49634C6.44866 5.44963 7.124 4.96288 7.41219 4.246C7.43476 4.18986 7.45586 4.12657 7.49805 4C7.54024 3.87343 7.56134 3.81014 7.58391 3.754C7.8721 3.03712 8.54744 2.55037 9.31866 2.50366C9.37906 2.5 9.44577 2.5 9.57919 2.5H14.4169C14.5503 2.5 14.617 2.5 14.6774 2.50366C15.4486 2.55037 16.124 3.03712 16.4121 3.754C16.4347 3.81014 16.4558 3.87343 16.498 4C16.5402 4.12657 16.5613 4.18986 16.5839 4.246C16.872 4.96288 17.5474 5.44963 18.3186 5.49634C18.379 5.5 18.4501 5.5 18.5924 5.5C18.9616 5.5 19.1463 5.5 19.2938 5.51462C20.7167 5.6556 21.8424 6.78127 21.9834 8.20421C21.998 8.35174 21.998 8.5269 21.998 8.87722V16.7C21.998 18.3802 21.998 19.2202 21.671 19.862C21.3834 20.4265 20.9245 20.8854 20.36 21.173C19.7182 21.5 18.8782 21.5 17.198 21.5H6.79805C5.11789 21.5 4.27781 21.5 3.63608 21.173C3.07159 20.8854 2.61265 20.4265 2.32503 19.862C1.99805 19.2202 1.99805 18.3802 1.99805 16.7V8.87722Z"
                                  stroke="#676879"
                                  strokeWidth="1.35"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M11.998 17C14.2071 17 15.998 15.2091 15.998 13C15.998 10.7909 14.2071 9 11.998 9C9.78891 9 7.99805 10.7909 7.99805 13C7.99805 15.2091 9.78891 17 11.998 17Z"
                                  stroke="#676879"
                                  strokeWidth="1.35"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                            <div className="self-stretch text-[#172B4D] text-center font-roboto text-lg font-medium">
                              Back side of your document
                            </div>
                            <div className="text-[#676879] font-roboto text-xs font-normal leading-5">
                              Ensure the back side is in frame and clearly
                              visible.
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex w-full sm:w-[364px] h-12 p-2 flex-col items-end gap-2 flex-shrink-0 rounded-b border-t-0 bg-[#F6F7FB]">
                {backCaptured ? (
                  uploadedFiles.back ? (
                    <button
                      disabled
                      className="flex h-8 px-3 py-[9px] justify-center items-center gap-2 flex-shrink-0 rounded bg-green-600"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 9L8 11L12 7"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-white font-roboto text-[13px] font-medium">
                        Uploaded
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() => uploadImage(backCaptured, "back")}
                      disabled={uploading}
                      className="flex h-8 px-3 py-[9px] justify-center items-center gap-2 flex-shrink-0 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                    >
                      <span className="text-white font-roboto text-[13px] font-medium">
                        {uploading ? "Uploading..." : "Upload"}
                      </span>
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => setShowCamera("back")}
                    className="flex h-8 px-3 py-[9px] justify-center items-center gap-2 flex-shrink-0 rounded bg-[#0073EA] hover:bg-[#0073EA]/90"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1.5 6.28292C1.5 6.02018 1.5 5.8888 1.51097 5.77816C1.6167 4.71095 2.46095 3.8667 3.52816 3.76096C3.6388 3.75 3.77727 3.75 4.05419 3.75C4.16089 3.75 4.21424 3.75 4.25954 3.74725C4.83796 3.71222 5.34446 3.34716 5.56061 2.8095C5.57753 2.7674 5.59336 2.71993 5.625 2.625C5.65664 2.53007 5.67247 2.4826 5.68939 2.4405C5.90554 1.90284 6.41204 1.53778 6.99046 1.50274C7.03576 1.5 7.08579 1.5 7.18585 1.5H10.8142C10.9142 1.5 10.9643 1.5 11.0096 1.50274C11.588 1.53778 12.0945 1.90284 12.3106 2.4405C12.3275 2.4826 12.3434 2.53007 12.375 2.625C12.4066 2.71993 12.4225 2.7674 12.4394 2.8095C12.6555 3.34716 13.1621 3.71222 13.7405 3.74725C13.7858 3.75 13.8391 3.75 13.9458 3.75C14.2227 3.75 14.3612 3.75 14.4718 3.76096C15.539 3.8667 16.3833 4.71095 16.489 5.77816C16.5 5.8888 16.5 6.02018 16.5 6.28292V12.15C16.5 13.4102 16.5 14.0401 16.2548 14.5215C16.0391 14.9449 15.6949 15.2891 15.2715 15.5048C14.7901 15.75 14.1602 15.75 12.9 15.75H5.1C3.83988 15.75 3.20982 15.75 2.72852 15.5048C2.30516 15.2891 1.96095 14.9449 1.74524 14.5215C1.5 14.0401 1.5 13.4102 1.5 12.15V6.28292Z"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 12.375C10.6568 12.375 12 11.0318 12 9.375C12 7.71817 10.6568 6.375 9 6.375C7.34314 6.375 6 7.71817 6 9.375C6 11.0318 7.34314 12.375 9 12.375Z"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-white font-roboto text-[13px] font-medium">
                      Capture
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex h-[68px] justify-end items-center gap-2 self-stretch border-t border-[#D0D4E4] bg-white px-6">
          <button
            onClick={handleSubmit}
            disabled={!uploadedFiles.front || !uploadedFiles.back}
            className={`flex h-[38px] px-4 py-[11px] justify-center items-center gap-2 rounded ${
              uploadedFiles.front && uploadedFiles.back
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
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

import { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";
import * as tf from "@tensorflow/tfjs";
import { useToast } from "@/hooks/use-toast";

interface FaceGuideOval {
  cx: number;
  cy: number;
  rOuter: number;
  rInner: number;
  w: number;
  h: number;
}

interface PartialSegmentBlob {
  blob: Blob;
  startTime: number;
  endTime: number;
  duration: number;
}

interface SegmentSubPart {
  blob: Blob;
  startTime: number;
  endTime: number;
  duration: number;
}

interface CameraSelfieStepProps {
  onComplete?: () => void;
  submissionId?: number | null;
}

const API_BASE = import.meta.env.VITE_API_BASE || "";
const TOTAL_DURATION = 10;
const TOTAL_SEGMENTS = 3;
const MAX_HEAD_TURN_ATTEMPTS = 2;
const FACE_MISMATCH_THRESHOLD = 3;

type VerificationDirection = "left" | "right" | "up" | "down";
type RecordingState = "inactive" | "recording" | "paused";

export function CameraSelfieStep({ onComplete, submissionId }: CameraSelfieStepProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const brightnessCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // UI State
  const [cameraError, setCameraError] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [dashedCircleAlignMessage, setDashedCircleAlignMessage] = useState("");
  const [brightnessMessage, setBrightnessMessage] = useState("");
  const [distanceMessage, setDistanceMessage] = useState("");
  const [ovalAlignMessage, setOvalAlignMessage] = useState("");
  const [recordingMessage, setRecordingMessage] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [headTurnAttemptStatus, setHeadTurnAttemptStatus] = useState("");
  const [mobileStatusMessage, setMobileStatusMessage] = useState("");
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);

  // Camera & Stream
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [segmentDurations, setSegmentDurations] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [segmentSecondsRecorded, setSegmentSecondsRecorded] = useState(0);

  // Face Detection & Verification
  const referenceFaceDescriptorRef = useRef<Float32Array | null>(null);
  const lastLandmarksRef = useRef<faceapi.FaceLandmarks68 | null>(null);
  const lastBoxRef = useRef<faceapi.Box | null>(null);
  const ovalRef = useRef<FaceGuideOval>({
    cx: 0,
    cy: 0,
    rOuter: 0,
    rInner: 0,
    w: 0,
    h: 0,
  });

  // Recording internals
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksPerSegmentRef = useRef<Record<number, Blob[]>>({});
  const completedSegmentsRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);

  // Head turn verification
  const [showHeadTurnPrompt, setShowHeadTurnPrompt] = useState(false);
  const [headTurnDirection, setHeadTurnDirection] = useState<VerificationDirection | null>(null);
  const [isVerifyingHeadTurn, setIsVerifyingHeadTurn] = useState(false);
  const headTurnAttemptsRef = useRef(0);
  const headRecordedChunksRef = useRef<Blob[]>([]);
  const headMediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Verification state
  const verificationDoneForSegmentRef = useRef<Record<number, boolean>>({});
  const headTurnAttemptsPerSegmentRef = useRef<Record<number, number>>({});
  const partialSegmentBlobsPerSegmentRef = useRef<
    Record<number, PartialSegmentBlob[]>
  >({});
  const firstVerificationDirectionRef = useRef<VerificationDirection | null>(null);
  const secondVerificationDirectionRef = useRef<VerificationDirection | null>(null);

  // Brightness & quality
  const currentBrightnessRef = useRef(100);
  const insideOvalFramesRef = useRef(0);
  const fillBufferRef = useRef<number[]>([]);

  // Face mismatch detection
  const faceMismatchCounterRef = useRef(0);

  const showMessage = useCallback(
    (setter: (msg: string) => void, msg: string) => {
      setter(msg);
    },
    []
  );

  // Check mobile on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize camera and face-api models
  useEffect(() => {
    const init = async () => {
      try {
        // Setup TensorFlow
        await tf.setBackend("webgl");
        await tf.ready();

        // Load face-api models
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/assets/weights"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/assets/weights"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/assets/weights"),
          faceapi.nets.faceExpressionNet.loadFromUri("/assets/weights"),
        ]);

        await startCamera();
        generateSegmentDurations();
      } catch (err) {
        console.error("Initialization failed:", err);
        setCameraError(true);
      }
    };

    init();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30, max: 30 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoElementRef.current = videoRef.current;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        const setupOverlay = () => {
          if (overlayRef.current && videoRef.current) {
            const w = videoRef.current.videoWidth || 640;
            const h = videoRef.current.videoHeight || 480;

            overlayRef.current.width = w;
            overlayRef.current.height = h;
            overlayCanvasRef.current = overlayRef.current;

            ovalRef.current = {
              w: w * 0.5,
              h: h * 0.6,
              cx: w / 2,
              cy: h / 2,
              rOuter: Math.min(w, h) * 0.35,
              rInner: Math.min(w, h) * 0.35 * 0.7,
            };

            if (!brightnessCanvasRef.current) {
              brightnessCanvasRef.current = document.createElement("canvas");
              brightnessCanvasRef.current.width = w;
              brightnessCanvasRef.current.height = h;
            }
          }
        };

        setupOverlay();
        videoRef.current.addEventListener("loadedmetadata", setupOverlay);

        setIsCameraOn(true);
        startDetectionLoop();
      }
    } catch (err: any) {
      console.error("Camera initialization failed:", err);
      setCameraError(true);

      if (err.name === "NotAllowedError") {
        showMessage(
          (msg) => setCameraError(true),
          "❌ Camera permission denied."
        );
      } else if (err.name === "NotFoundError") {
        showMessage(
          (msg) => setCameraError(true),
          "⚠️ No camera found on this device."
        );
      }
    }
  };

  const startDetectionLoop = () => {
    const options = new faceapi.TinyFaceDetectorOptions();

    const loop = async () => {
      if (!isCameraOn || !videoElementRef.current) return;

      frameCountRef.current++;

      // Detect faces periodically
      if (frameCountRef.current % 1 === 0) {
        try {
          const detection = await faceapi
            .detectSingleFace(videoElementRef.current, options)
            .withFaceLandmarks();

          if (detection) {
            lastLandmarksRef.current = detection.landmarks;
            lastBoxRef.current = detection.detection.box;

            // Check face alignment
            const box = detection.detection.box;
            const landmarks = detection.landmarks;
            const fillPct = (box.height / ovalRef.current.h) * 100;

            fillBufferRef.current.push(fillPct);
            if (fillBufferRef.current.length > 5) fillBufferRef.current.shift();

            const smoothedFill =
              fillBufferRef.current.reduce((a, b) => a + b, 0) /
              fillBufferRef.current.length;
            const lowerBound = 55,
              upperBound = 80;

            let sizeOK = false;

            if (smoothedFill < lowerBound) {
              showMessage(
                setDistanceMessage,
                "📏 Please move closer to the camera."
              );
            } else if (smoothedFill > upperBound) {
              showMessage(
                setDistanceMessage,
                "📏 Please move slightly farther away."
              );
            } else {
              sizeOK = true;
              showMessage(setDistanceMessage, "");
            }

            const faceInside = areLandmarksFullyInsideOval(landmarks);

            if (sizeOK && faceInside) {
              insideOvalFramesRef.current++;

              if (insideOvalFramesRef.current >= 3) {
                showMessage(
                  setStatusMessage,
                  "✅ Perfect! Stay still inside the dashed circle."
                );
                setIsFaceDetected(true);

                if (!isRecording) {
                  startRecordingSession();
                }
              }
            } else {
              insideOvalFramesRef.current = 0;
              setIsFaceDetected(false);
            }
          } else {
            setIsFaceDetected(false);
            insideOvalFramesRef.current = 0;
          }
        } catch (err) {
          console.error("Detection error:", err);
        }
      }

      drawFaceGuideOverlay(currentBrightnessRef.current);
      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);
  };

  const areLandmarksFullyInsideOval = (landmarks: faceapi.FaceLandmarks68) => {
    const { cx, cy, rOuter } = ovalRef.current;
    const detectionRadius = rOuter * 1.2;

    return landmarks.positions.every((point) => {
      const dx = point.x - cx;
      const dy = point.y - cy;
      return Math.sqrt(dx * dx + dy * dy) <= detectionRadius;
    });
  };

  const drawFaceGuideOverlay = (brightness: number) => {
    if (!overlayCanvasRef.current) return;

    const ctx = overlayCanvasRef.current.getContext("2d");
    if (!ctx) return;

    const w = overlayCanvasRef.current.width;
    const h = overlayCanvasRef.current.height;
    const { cx, cy, rOuter } = ovalRef.current;
    const biggerRadius = rOuter * 1.2;

    ctx.clearRect(0, 0, w, h);

    // Background
    if (brightness < 60) {
      ctx.fillStyle = "white";
    } else if (brightness > 180) {
      ctx.fillStyle = "black";
    } else {
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    }
    ctx.fillRect(0, 0, w, h);

    // Punch out transparent circle
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(cx, cy, biggerRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    // Outer circle stroke
    const outerStrokeColor =
      isRecording && isFaceDetected ? "#16a34a" : "#ffffff";

    ctx.beginPath();
    ctx.arc(cx, cy, biggerRadius, 0, 2 * Math.PI);
    ctx.setLineDash([]);
    ctx.lineWidth = 5;
    ctx.strokeStyle = outerStrokeColor;
    ctx.stroke();

    // Inner dashed circle
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, 0, 2 * Math.PI);
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    // Instruction text
    ctx.font = "18px Arial";
    ctx.fillStyle = "#ffffffff";
    ctx.textAlign = "center";
    ctx.fillText("Align your face within the white circles", cx, cy + biggerRadius + 20);
  };

  const generateSegmentDurations = () => {
    const firstVal = Math.floor(Math.random() * 2) + 2;
    const secondVal = Math.floor(Math.random() * 3) + 2;
    const lastVal = Math.max(TOTAL_DURATION - (firstVal + secondVal), 1);
    setSegmentDurations([firstVal, secondVal, lastVal]);
  };

  const startRecordingSession = async () => {
    if (!isFaceDetected) {
      showMessage(
        setStatusMessage,
        "🙋 Please align your face inside the circle first."
      );
      return;
    }

    try {
      const detection = await faceapi
        .detectSingleFace(
          videoElementRef.current!,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection?.descriptor) {
        referenceFaceDescriptorRef.current = detection.descriptor;
      }
    } catch (err) {
      console.error("Error capturing reference face:", err);
    }

    setCurrentSegment(1);
    setIsRecording(true);
    completedSegmentsRef.current = [];
    verificationDoneForSegmentRef.current = {};
    headTurnAttemptsPerSegmentRef.current = {};
    partialSegmentBlobsPerSegmentRef.current = {};

    startSegmentRecording(0);
  };

  const startSegmentRecording = async (resumeSecondsRecorded = 0) => {
    if (!streamRef.current) {
      showMessage(setStatusMessage, "⚠️ Camera not initialized.");
      return;
    }

    if (currentSegment <= 0) {
      setCurrentSegment(1);
      return;
    }

    let options: MediaRecorderOptions | undefined;

    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
      options = { mimeType: "video/webm;codecs=vp9" };
    } else if (MediaRecorder.isTypeSupported("video/webm")) {
      options = { mimeType: "video/webm" };
    } else if (MediaRecorder.isTypeSupported("video/mp4")) {
      options = { mimeType: "video/mp4", videoBitsPerSecond: 100000 };
    }

    const mediaRecorder = new MediaRecorder(streamRef.current, options);
    mediaRecorderRef.current = mediaRecorder;

    recordedChunksPerSegmentRef.current[currentSegment] = [];

    const segmentTarget = segmentDurations[currentSegment - 1];

    setSegmentSecondsRecorded(resumeSecondsRecorded);
    setTimeRemaining(segmentTarget - resumeSecondsRecorded);

    showMessage(
      setRecordingMessage,
      `🎥 Recording segment ${currentSegment}... (${segmentTarget - resumeSecondsRecorded}s left)`
    );

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0 && isFaceDetected) {
        if (!recordedChunksPerSegmentRef.current[currentSegment]) {
          recordedChunksPerSegmentRef.current[currentSegment] = [];
        }
        recordedChunksPerSegmentRef.current[currentSegment].push(e.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const chunks =
        recordedChunksPerSegmentRef.current[currentSegment] || [];

      if (chunks.length > 0) {
        const blob = new Blob(chunks, {
          type: options?.mimeType || "video/webm",
        });
        completedSegmentsRef.current.push(blob);
      }

      if (currentSegment < TOTAL_SEGMENTS) {
        setCurrentSegment(currentSegment + 1);
        setTimeout(() => startSegmentRecording(0), 600);
      } else {
        finishRecording();
      }
    };

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = window.setInterval(() => {
      setSegmentSecondsRecorded((prev) => {
        const newTime = prev + 1;
        setTimeRemaining(segmentTarget - newTime);

        if (newTime >= segmentTarget) {
          clearInterval(timerIntervalRef.current!);
          if (
            mediaRecorder.state === "recording" ||
            mediaRecorder.state === "paused"
          ) {
            mediaRecorder.stop();
          }
        }

        return newTime;
      });
    }, 1000);

    mediaRecorder.start(1000);
  };

  const finishRecording = () => {
    setIsRecording(false);
    showMessage(
      setRecordingMessage,
      "✅ All segments complete. Thank you!"
    );
    setShowSuccessScreen(true);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    // Download completed blobs
    downloadAllBlobs();
  };

  const downloadAllBlobs = () => {
    completedSegmentsRef.current.forEach((blob, idx) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `segment_${idx + 1}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    });

    // Call onComplete
    onComplete?.();
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
              Capture Selfie Video
            </div>
          </div>
          <div className="flex pl-7 justify-center items-center gap-2.5 self-stretch">
            <div className="flex-1 text-text-primary font-roboto text-[13px] font-normal leading-5">
              Record a short video to confirm you are the person in the ID
              document. Make sure you're in a well-lit area and your face is
              clearly visible.
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="flex p-2 sm:p-4 flex-col justify-center items-center self-stretch border-t border-border bg-background">
          <div className="flex w-full max-w-[956px] p-2 flex-col items-center gap-4">
            {showSuccessScreen ? (
              <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-lg border border-green-500 bg-green-50">
                <div className="text-2xl font-bold text-green-700">
                  ✅ Recording Complete!
                </div>
                <div className="text-center text-green-600">
                  Your video has been successfully recorded and will be
                  uploaded. Thank you for completing the verification process.
                </div>
              </div>
            ) : (
              <div className="flex w-full flex-col gap-4">
                {/* Video Feed */}
                <div className="flex w-full justify-center">
                  <div className="flex w-full max-w-[440px] min-h-[380px] flex-col items-center gap-2 rounded-lg border-[1.5px] border-dashed border-step-inactive-border bg-background overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <canvas
                      ref={overlayRef}
                      className="absolute w-full max-w-[440px] h-[380px]"
                    />
                  </div>
                </div>

                {/* Status Messages */}
                <div className="w-full max-w-[440px] mx-auto">
                  {statusMessage && (
                    <div className="text-sm p-2 rounded bg-blue-50 text-blue-700">
                      {statusMessage}
                    </div>
                  )}
                  {recordingMessage && (
                    <div className="text-sm p-2 rounded bg-green-50 text-green-700">
                      {recordingMessage}
                    </div>
                  )}
                  {dashedCircleAlignMessage && (
                    <div className="text-sm p-2 rounded bg-yellow-50 text-yellow-700">
                      {dashedCircleAlignMessage}
                    </div>
                  )}
                  {brightnessMessage && (
                    <div className="text-sm p-2 rounded bg-orange-50 text-orange-700">
                      {brightnessMessage}
                    </div>
                  )}
                  {distanceMessage && (
                    <div className="text-sm p-2 rounded bg-purple-50 text-purple-700">
                      {distanceMessage}
                    </div>
                  )}
                  {verificationMessage && (
                    <div className="text-sm p-2 rounded bg-red-50 text-red-700">
                      {verificationMessage}
                    </div>
                  )}
                </div>

                {/* Recording Progress */}
                {isRecording && (
                  <div className="w-full max-w-[440px] mx-auto">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>
                        Segment {currentSegment}/{TOTAL_SEGMENTS}
                      </span>
                      <span>{timeRemaining}s remaining</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${
                            ((segmentSecondsRecorded /
                              segmentDurations[currentSegment - 1]) *
                              100) %
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

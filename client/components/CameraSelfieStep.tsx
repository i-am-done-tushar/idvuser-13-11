import React, { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";
import * as tf from "@tensorflow/tfjs";
import "./CameraSelfieStep.css";
import { waitForOpenCv } from "../lib/opencvLoader";

interface FaceGuideOval {
  cx: number;
  cy: number;
  rOuter: number;
  rInner: number;
  w: number;
  h: number;
}
interface SegmentSubPart {
  blob: Blob;
  startTime: number;
  endTime: number;
  duration: number;
}
interface PartialSegmentBlob {
  blob: Blob; // actual binary
  startTime: number; // in seconds
  endTime: number; // in seconds
  duration: number; // computed duration
}
declare var cv: any; // OpenCV.js

type CameraCaptureProps = {
  userId: number; // required input
  onStepComplete?: (step: number) => void; // output as callback
};

// function Step6({ userId, onStepComplete }: Step6Props) {
//   // ...component logic

//   // Where you had: this.stepComplete.emit(7)
//   const finish = () => {
//     onStepComplete?.(7); // optional chaining to avoid undefined checks
//   };

//   // Where you had: this.stepComplete.emit(1)
//   const resetAll = () => {
//     // ...reset logic
//     onStepComplete?.(1);
//   };

//   return (
//     <>
//       {/* video/canvas refs, UI, etc. */}
//     </>
//   );
// }

export default function CameraCapture({
  userId,
  onStepComplete,
}: CameraCaptureProps) {
  //-----------------------------useState-------------------------------------
  //UI/Display State (triggers re-renders):
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [dashedCircleAlignMessage, setDashedCircleAlignMessage] = useState("");
  const [cameraErrorMessage, setCameraErrorMessage] = useState("");
  const [brightnessMessage, setBrightnessMessage] = useState("");
  const [ovalAlignMessage, setOvalAlignMessage] = useState("");
  const [distanceMessage, setDistanceMessage] = useState("");
  const [recordingMessage, setRecordingMessage] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [showFaceMismatchModal, setShowFaceMismatchModal] = useState(false);
  const [mobileStatusMessage, setMobileStatusMessage] = useState("");
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [capturedFrameUrl, setCapturedFrameUrl] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  // OpenCV readiness
  const [openCvReady, setOpenCvReady] = useState(false);

  //Recording State (affects UI):
  const [isRecording, setIsRecording] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [segmentSecondsRecorded, setSegmentSecondsRecorded] = useState(0);
  const [completedSegments, setCompletedSegments] = useState<Blob[]>([]);

  //Verification State (affects UI):
  const [headTurnVerified, setHeadTurnVerified] = useState(false);
  const [showHeadTurnPrompt, setShowHeadTurnPrompt] = useState(false);
  const [headTurnAttemptStatus, setHeadTurnAttemptStatus] = useState("");
  const [isVerifyingHeadTurn, setIsVerifyingHeadTurn] = useState(false);
  const [direction, setDirection] = useState<
    "left" | "right" | "up" | "down" | "forward"
  >();
  const [VerificationStatus, setVerificationStatus] = useState(false);

  //Logging/Debug State (displayed in UI):
  // const [selectedLevel, setSelectedLevel] = useState<LogLevel>('debug');
  const [logs, setLogs] = useState("");
  const [blinkCount, setBlinkCount] = useState(0);

  //extra
  // Initialize with default equal durations, will be randomized in generateSegmentDurations
  const [segmentDurations, setSegmentDurations] = useState<number[]>([3, 4, 3]);
  // In your React component, add this state:
  const [headTurnBlob, setHeadTurnBlob] = useState<Blob | null>(null);
  const [extraSecondsRecorded, setExtraSecondsRecorded] = useState(0);
  const [headTurnAttempts, setHeadTurnAttempts] = useState(0);
  const [headSegmentSecondsRecorded, setHeadSegmentSecondsRecorded] =
    useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  // const [stream, setStream] = useState<MediaStream | null>(null);
  const [isSegmentValid, setIsSegmentValid] = useState(true);
  const [verificationDoneForSegment, setVerificationDoneForSegment] = useState<{
    [key: number]: boolean;
  }>({});
  const [headTurnAttemptsPerSegment, setHeadTurnAttemptsPerSegment] = useState<{
    [key: number]: number;
  }>({});
  const [headVerificationCountPerSegment, setHeadVerificationCountPerSegment] =
    useState<{ [key: number]: number }>({});
  const [partialSegmentBlobsPerSegment, setPartialSegmentBlobsPerSegment] =
    useState<{ [key: number]: any[] }>({});
  const [recordedChunksPerSegment, setRecordedChunksPerSegment] = useState<{
    [key: number]: Blob[];
  }>({});
  const [logService, setLogService] = useState<any>({
    log: (level: string, message: string) => console.log(`[${level}]`, message),
  });

  const [triggerVerification3, setTriggerVerification3] = useState(false);

  const [firstVerificationDirection, setFirstVerificationDirection] = useState<
    "up" | "down" | "left" | "right" | "forward" | null
  >(null);
  const [secondVerificationDirection, setSecondVerificationDirection] =
    useState<"up" | "down" | "left" | "right" | "forward" | null>(null);
  const [thirdVerificationDirection, setThirdVerificationDirection] = useState<
    "up" | "down" | "left" | "right" | "forward" | null
  >(null);

  const [headTurnRecordingFailed, setHeadTurnRecordingFailed] = useState(false);

  const [headTurnDirection, setHeadTurnDirection] = useState<
    "left" | "right" | "up" | "down" | "forward"
  >("forward");

  const [HeadTurnRecordingDone, setHeadTurnRecordingDone] = useState(false);

  //Progress Tracking State (outer circle green percentage):
  // 5 stages total: segment 1 (20%), head 1 (40%), segment 2 (60%), head 2 (80%), segment 3 (100%)
  const [overallProgressPercentage, setOverallProgressPercentage] = useState(0);

  //-----------------------------useRef-------------------------------------
  //DOM Element References:
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const brightnessCanvasRef = useRef<HTMLCanvasElement | null>(null);

  //Media/Stream Objects (don't trigger renders):
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const headMediaRecorderRef = useRef<MediaRecorder | undefined>(undefined);

  //Animation/Timer IDs:
  const rafIdRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const blinkIntervalIdRef = useRef<any>(null);

  //Computation/Cache Values (not displayed directly):
  const referenceFaceDescriptorRef = useRef<Float32Array | null>(null);
  const ovalRef = useRef<FaceGuideOval>({
    cx: 0,
    cy: 0,
    rOuter: 0,
    rInner: 0,
    w: 0,
    h: 0,
  });
  const ovalProgressRef = useRef(0);
  const brightnessCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const currentBrightnessRef = useRef(100);

  //Detection Loop State (performance-critical, updated frequently):
  const frameCountRef = useRef(0);
  const insideOvalFramesRef = useRef(0);
  const recordedFrameCountRef = useRef(0);
  const lastLandmarksRef = useRef<faceapi.FaceLandmarks68 | null>(null);
  const lastBoxRef = useRef<faceapi.Box | null>(null);
  const fillBufferRef = useRef<number[]>([]);
  const faceMismatchCounterRef = useRef(0);

  //Arrays/Objects for Recording (frequently updated):
  const continuousRecordingBlobsRef = useRef<Blob[]>([]);
  const recordedChunksPerSegmentRef = useRef<Record<number, Blob[]>>({});
  const headRecordedChunksRef = useRef<Blob[]>([]);
  // Store the most recent head verification blob (assembled on stop)
  const latestHeadBlobRef = useRef<Blob | null>(null);
  const partialSegmentBlobsPerSegmentRef = useRef<
    Record<number, PartialSegmentBlob[]>
  >({});
  const segmentSubPartsRef = useRef<Record<number, SegmentSubPart[]>>({});

  //Verification Tracking (internal logic state):
  const verificationDoneForSegmentRef = useRef<Record<number, boolean>>({});
  const verificationTriggeredForSegmentRef = useRef<Record<number, boolean>>(
    {},
  );
  const verificationSuccessForSegmentRef = useRef<Record<number, boolean>>({});
  const headTurnAttemptsPerSegmentRef = useRef<Record<number, number>>({});
  const headVerificationCountPerSegmentRef = useRef<Record<number, number>>({});
  // Track whether head downloads for segment 1 and 2 have been performed
  const headDownloadDoneRef = useRef<Record<number, boolean>>({});

  //Flags/Counters (internal state):
  const recordingFlagRef = useRef(0);
  const isSegmentValidRef = useRef(true);
  const stoppingForRestartRef = useRef(false);
  const restartCooldownRef = useRef(false);
  const processingSegmentCompletionRef = useRef(false);
  const lastAdjustedSegmentSecondsRecordedRef = useRef<number | null>(null);
  const messageCooldownsRef = useRef<Record<string, boolean>>({});
  // Guard to avoid concurrent starts of the same segment (prevents duplicate timers/recorders)
  const startingSegmentRef = useRef(false);
  // One-time warning suppressor for OpenCV frame read failures
  const openCvFrameWarningShownRef = useRef(false);

  //extra
  const timeRemainingRef = useRef<number>(0);
  const blinkingDirectionRef = useRef<
    "left" | "right" | "up" | "down" | "forward" | null
  >(null);
  const blinkVisibleRef = useRef<boolean>(false);
  const currentSegmentRef = useRef<number>(0);

  const currentSessionStartTimeRef = useRef(0);

  const verificationTimeInSegmentRef = useRef(0);

  const isFaceDetectedRef = useRef(false);
  const isRecordingRef = useRef(false);
  const segmentSecondsRecordedRef = useRef(0);
  const extraSecondsRecordedRef = useRef(0);
  // Session lifecycle flags
  const sessionCompletedRef = useRef(false); // Set true after all segments & verifications finish
  const autoStartDisabledRef = useRef(false); // Prevent auto re-start after completion until user manually resets
  const downloadsTriggeredRef = useRef(false); // Ensure downloads only happen once per session
  const verificationInProgressRef = useRef(false); // Prevent overlapping head turn verifications
  const isVerifyingHeadTurnRef = useRef(false); // sync to state for immediate checks
  const verificationPendingRef = useRef(false); // Block auto-start while verification is pending/deferred
  // Pre-prompt gating before starting a segment
  const prePromptInProgressRef = useRef(false);
  const plannedVerificationDirectionRef = useRef<
    Record<number, "up" | "down" | "left" | "right">
  >({});
  // Gating refs: block recording when conditions invalid
  const multipleFacesDetectedRef = useRef(false);
  const differentFaceDetectedRef = useRef(false);

  const lastYawRef = useRef<number | undefined>(undefined);
  const lastPitchRef = useRef<number | undefined>(undefined);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize logServiceRef with a mock logger
  const logServiceRef = useRef({
    log: (level: string, message: string) => console.log(`[${level}]`, message),
  });

  //Constants (can be plain const):
  const DETECT_EVERY = 1;
  const BRIGHT_EVERY = 6;
  const totalSegments = 3;
  const totalDuration = 10;
  const maxHeadTurnAttempts = 2;
  const smoothingWindow = 5;
  const requiredFrames = 3;
  const faceMismatchThreshold = 3;
  const MOBILE_BREAKPOINT = 767;
  // Max time allowed for a single head movement verification attempt (ms).
  // Previously 30000 (30s) which caused very long head verification clips; reduce to ~4.5s.
  // This yields typical head clips of 2-4s while still allowing a brief grace period.
  const HEAD_VERIFICATION_TIMEOUT_MS = 4500;

  // -------------------------------
  // ngOnInit equivalent
  // -------------------------------
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        checkIsMobile();

        console.log("Setting TensorFlow.js backend to webgl...");
        await tf.setBackend("webgl");
        await tf.ready();
        console.log("TensorFlow backend:", tf.getBackend());

        console.log("Loading face-api models...");
        // logService.log('debug', 'Loading face-api models...');
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/assets/weights"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/assets/weights"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/assets/weights"),
          faceapi.nets.faceExpressionNet.loadFromUri("/assets/weights"),
        ]);
        console.log("✅ FaceAPI models loaded");
        // logService.log('debug', '✅ FaceAPI models loaded');

        // Ensure OpenCV is loaded and initialized before any cv.* usage
        console.log("Loading OpenCV.js...");
        try {
          await waitForOpenCv();
          if (!cancelled) setOpenCvReady(true);
          console.log("✅ OpenCV.js ready");
        } catch (e) {
          console.error("Failed to load OpenCV.js", e);
          // Not fatal for camera start; features using cv will be skipped
        }

        // Example: COCO-SSD load removed/commented—keep consistent with Angular
        // await cocoSsd.load();

        // logService.log('info', 'Step 6 loaded');
        // if (!cancelled) {
        //   setLogs(logService.getLogs());
        // }

        console.log("Starting camera...");
        await startCamera(); // fill in inside your React version
      } catch (err: any) {
        console.error("Camera initialization failed:", err);
        if (cancelled) return;

        if (err?.name === "NotAllowedError") {
          setCameraErrorMessage(
            "❌ Camera permission denied. Please allow access and refresh.",
          );
        } else if (err?.name === "NotFoundError") {
          setCameraErrorMessage("⚠️ No camera found on this device.");
        } else {
          setCameraErrorMessage("⚠️ Failed to access the camera. Try again.");
        }
        setIsCameraOn(false);
      }
    };

    init();

    // -------------------------------
    // ngOnDestroy equivalent (cleanup)
    // -------------------------------
    return () => {
      cancelled = true;

      // Cancel animation frame
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      // Clear interval timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      // Stop media tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []); // run once like ngOnInit

  const showMessage = useCallback(
    (
      key: string,
      msg: any,
      autoHide: boolean = false,
      duration: number = 2000,
      cooldownDuration: number = 1000,
    ) => {
      // Normalize key: if empty or not a valid state property, fallback to statusMessage
      const validKeys = [
        "statusMessage",
        "dashedCircleAlignMessage",
        "cameraErrorMessage",
        "brightnessMessage",
        "ovalAlignMessage",
        "distanceMessage",
        "recordingMessage",
        "verificationMessage",
        "mobileStatusMessage",
        "headTurnAttemptStatus",
      ];

      if (!key || !validKeys.includes(key)) {
        console.warn(
          `⚠️ Unknown or empty message key provided: ${key}. Falling back to 'statusMessage'.`,
        );
        key = "statusMessage";
      }

      // Ensure message is always a string to avoid showing [object Object] in the UI
      let text: string;
      try {
        if (typeof msg === "string") {
          text = msg;
        } else if (msg === null || msg === undefined) {
          text = "";
        } else if (typeof msg === "object") {
          text = JSON.stringify(msg);
        } else {
          text = String(msg);
        }
      } catch (e) {
        text = String(msg);
      }

      // Check cooldown
      if (messageCooldownsRef.current[key]) {
        return;
      }

      // Get current value from the appropriate state
      const stateGetters: Record<string, () => string> = {
        statusMessage: () => statusMessage,
        dashedCircleAlignMessage: () => dashedCircleAlignMessage,
        cameraErrorMessage: () => cameraErrorMessage,
        brightnessMessage: () => brightnessMessage,
        ovalAlignMessage: () => ovalAlignMessage,
        distanceMessage: () => distanceMessage,
        recordingMessage: () => recordingMessage,
        verificationMessage: () => verificationMessage,
        mobileStatusMessage: () => mobileStatusMessage,
        headTurnAttemptStatus: () => headTurnAttemptStatus,
      };

      const currentVal = stateGetters[key]?.() ?? "";

      // Don't update if value hasn't changed
      if (currentVal === text) {
        return;
      }

      // State setters mapping
      const stateSetters: Record<string, (value: string) => void> = {
        statusMessage: setStatusMessage,
        dashedCircleAlignMessage: setDashedCircleAlignMessage,
        cameraErrorMessage: setCameraErrorMessage,
        brightnessMessage: setBrightnessMessage,
        ovalAlignMessage: setOvalAlignMessage,
        distanceMessage: setDistanceMessage,
        recordingMessage: setRecordingMessage,
        verificationMessage: setVerificationMessage,
        mobileStatusMessage: setMobileStatusMessage,
        headTurnAttemptStatus: setHeadTurnAttemptStatus,
      };

      if (isMobile) {
        // On mobile: update only the mobileStatusMessage with the latest message
        setMobileStatusMessage(text);

        // Also clear the specific full status message to avoid showing bubbles
        stateSetters[key]?.("");
      } else {
        // On desktop/tablet: update the full status bubble message normally
        stateSetters[key]?.(text);

        // Clear mobile message if any
        setMobileStatusMessage("");
      }

      if (autoHide) {
        setTimeout(() => {
          const updatedVal = stateGetters[key]?.() ?? "";

          if (updatedVal === text) {
            stateSetters[key]?.("");

            if (isMobile && mobileStatusMessage === text) {
              setMobileStatusMessage("");
            }

            messageCooldownsRef.current[key] = true;

            setTimeout(() => {
              messageCooldownsRef.current[key] = false;
            }, cooldownDuration);
          }
        }, duration);
      }
    },
    [
      isMobile,
      statusMessage,
      dashedCircleAlignMessage,
      cameraErrorMessage,
      brightnessMessage,
      ovalAlignMessage,
      distanceMessage,
      recordingMessage,
      verificationMessage,
      mobileStatusMessage,
      headTurnAttemptStatus,
    ],
  );

  // Angular-style function that sets the state and also returns the value
  function checkIsMobile(): boolean {
    if (typeof window === "undefined") return false;
    const val = window.innerWidth <= MOBILE_BREAKPOINT;
    setIsMobile(val);
    return val;
  }

  const generateSegmentDurations = useCallback(() => {
    // Random first segment: 2 or 3
    const firstVal = Math.floor(Math.random() * 2) + 2; // 2 or 3

    // Random second segment: 2 to 4
    const secondVal = Math.floor(Math.random() * 3) + 2; // 2, 3, 4

    // Last segment = total - (first + second)
    const lastVal = Math.max(totalDuration - (firstVal + secondVal), 1);

    setSegmentDurations([firstVal, secondVal, lastVal]);
    console.log(
      `📊 Segment durations: [${firstVal}s, ${secondVal}s, ${lastVal}s] = ${firstVal + secondVal + lastVal}s total`,
    );
  }, [totalDuration]);

  const validateCameraAndVideo = useCallback((loop: () => void): boolean => {
    if (!streamRef.current || !videoRef.current) {
      console.log(
        "info",
        "Camera off or video element missing; stopping detection loop.",
      );
      return false;
    }
    return true;
  }, []);

  const scheduleNext = useCallback(
    (fn: FrameRequestCallback | (() => void)): void => {
      rafIdRef.current = requestAnimationFrame(fn as FrameRequestCallback);
    },
    [],
  );

  const validateOval = useCallback(
    (loop: () => void): boolean => {
      if (!ovalRef.current) {
        console.log(
          "info",
          "Oval guide not initialized yet; scheduling next frame.",
        );
        scheduleNext(loop);
        return false;
      }
      return true;
    },
    [scheduleNext],
  );

  const getFrameBrightness = useCallback((): number => {
    if (!brightnessCtxRef.current) return 0;

    const w = brightnessCanvasRef.current!.width;
    const h = brightnessCanvasRef.current!.height;

    // Draw current video frame onto canvas
    brightnessCtxRef.current.drawImage(videoRef.current!, 0, 0, w, h);

    // Get pixel data from the canvas
    const frame = brightnessCtxRef.current.getImageData(0, 0, w, h).data;

    let totalLuminance = 0;
    const numPixels = frame.length / 4;

    for (let i = 0; i < frame.length; i += 4) {
      const r = frame[i];
      const g = frame[i + 1];
      const b = frame[i + 2];

      // Calculate luminance using Rec. 709 formula
      totalLuminance += 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    // Return average luminance (brightness) of the frame
    return totalLuminance / numPixels;
  }, []);

  const drawFaceGuideOverlay = useCallback(
    (brightness: number) => {
      const ctx = overlayRef.current!.getContext("2d")!;
      const w = overlayRef.current!.width;
      const h = overlayRef.current!.height;

      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      const outerRadius = Math.min(w, h) * 0.35; // Inner transparent circle radius
      const biggerRadius = outerRadius * 1.2; // Outer circle radius
      const boundaryRadius = biggerRadius + 20; // Outermost 7px solid border circle

      // Step 1: Background fill logic based on brightness
      if (brightness < 60) {
        // Too dark: fill outside bigger circle with white
        ctx.fillStyle = "white";
      } else if (brightness > 180) {
        // Too bright: fill outside bigger circle with black
        ctx.fillStyle = "black";
      } else {
        // Normal brightness: fill outside bigger circle with fully opaque black
        ctx.fillStyle = "rgba(0, 0, 0, 1)";
      }
      ctx.fillRect(0, 0, w, h);

      // Step 2: Punch out a big transparent circle with biggerRadius (show camera inside this)
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(cx, cy, biggerRadius, 0, 2 * Math.PI);
      ctx.fill();

      // Reset compositing to normal
      ctx.globalCompositeOperation = "source-over";

      // Step 3: Draw outer circle with progress indicator
      ctx.setLineDash([]);
      ctx.lineWidth = 5;

      const startAngle = -Math.PI / 2; // Start from top

      // Draw green progress arc if progress exists
      if (overallProgressPercentage > 0) {
        const progressRatio = overallProgressPercentage / 100;
        const progressEndAngle = startAngle + 2 * Math.PI * progressRatio;

        ctx.beginPath();
        ctx.arc(cx, cy, biggerRadius, startAngle, progressEndAngle);
        ctx.strokeStyle = "#16a34a"; // Green for completed progress
        ctx.stroke();

        // Draw white arc for remaining progress (if not 100%)
        if (overallProgressPercentage < 100) {
          ctx.beginPath();
          ctx.arc(
            cx,
            cy,
            biggerRadius,
            progressEndAngle,
            startAngle + 2 * Math.PI,
          );
          ctx.strokeStyle = "#ffffff"; // White for remaining
          ctx.stroke();
        }
      } else {
        // No progress yet - draw full white circle
        ctx.beginPath();
        ctx.arc(cx, cy, biggerRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
      }

      // Step 4: Draw outlines for innerRadius circle (dashed alignment guide)

      // Inner alignment circle (white dashed)
      ctx.beginPath();
      ctx.arc(cx, cy, outerRadius, 0, 2 * Math.PI);
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      // --- BLINKING ARC ---
      if (blinkingDirectionRef.current && blinkVisibleRef.current) {
        ctx.beginPath();
        ctx.lineWidth = 12;

        // Neon blue color that pops on black backgrounds
        ctx.strokeStyle = "rgba(0, 191, 255, 1)";

        // Glow effect
        ctx.shadowColor = "rgba(0, 191, 255, 0.7)";
        ctx.shadowBlur = 20;

        // Set dashed line pattern
        ctx.setLineDash([8, 6]);

        const radius = outerRadius; // Blinking arc on the dashed circle

        let startAngle: number;
        let endAngle: number;

        switch (blinkingDirectionRef.current) {
          case "left":
            startAngle = -Math.PI * 0.5; // 90 deg (top)
            endAngle = Math.PI * 0.5; // 270 deg (bottom)
            break;
          case "right":
            startAngle = Math.PI * 0.5; // 270 deg (bottom)
            endAngle = Math.PI * 1.5; // 90 deg (top)
            break;
          case "down":
            startAngle = 0; // 0 deg (right)
            endAngle = Math.PI; // 180 deg (left)
            break;
          case "up":
            startAngle = Math.PI; // 180 deg (left)
            endAngle = Math.PI * 2; // 360 deg / 0 deg (right)
            break;
          case "forward":
            // Full circle to indicate "keep face still"
            startAngle = 0;
            endAngle = Math.PI * 2; // Complete circle
            break;
          default:
            // fallback to full circle or no blink
            startAngle = 0;
            endAngle = 0;
            break;
        }

        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.stroke();

        // Reset shadowBlur and line dash for next draw calls
        ctx.shadowBlur = 0;
        ctx.setLineDash([]);
      }

      // Step 5: Instruction text (moved slightly higher for visibility)
      ctx.font = "18px Arial";
      ctx.fillStyle = "#ffffffff";
      ctx.textAlign = "center";
      ctx.fillText(
        "Align your face within the white circles",
        cx,
        cy + biggerRadius + 20,
      );

      // Step 6: Recording progress arc (green arc on inner alignment circle)
      if (isRecording) {
        recordedFrameCountRef.current++;
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + 2 * Math.PI * ovalProgressRef.current;
        ctx.beginPath();
        ctx.arc(cx, cy, outerRadius, startAngle, endAngle);
        ctx.strokeStyle = "#16a34a";
        ctx.lineWidth = 4;
        ctx.stroke();
      }

      // Save oval info for detection alignment
      ovalRef.current = {
        cx,
        cy,
        rOuter: outerRadius,
        rInner: outerRadius * 0.7,
        w: outerRadius * 2,
        h: outerRadius * 2,
      };
    },
    [isRecording, isFaceDetected, overallProgressPercentage],
  );

  const isVideoBlank = useCallback((): boolean => {
    if (!brightnessCtxRef.current) return true;

    brightnessCtxRef.current.drawImage(
      videoRef.current!,
      0,
      0,
      brightnessCanvasRef.current!.width,
      brightnessCanvasRef.current!.height,
    );
    const imageData = brightnessCtxRef.current.getImageData(
      0,
      0,
      brightnessCanvasRef.current!.width,
      brightnessCanvasRef.current!.height,
    ).data;

    let blackPixels = 0;
    const threshold = 30;
    for (let i = 0; i < imageData.length; i += 4) {
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      if (r < threshold && g < threshold && b < threshold) {
        blackPixels++;
      }
    }

    const blackPercent = blackPixels / (imageData.length / 4);
    return blackPercent > 0.95;
  }, []);

  const checkDifferentFace = useCallback(async (): Promise<boolean> => {
    /* Detects whether the current face differs from the reference face for a sustained period.
     * Returns true if different face detected for FACE_MISMATCH_THRESHOLD consecutive checks.
     */
    if (!referenceFaceDescriptorRef.current) {
      console.log(
        "info",
        "[FaceCheck] No reference descriptor; skipping check.",
      );
      return false; // can't decide without baseline
    }

    try {
      if (!videoRef.current) return false;

      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions(),
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection && detection.descriptor) {
        const distance = faceapi.euclideanDistance(
          referenceFaceDescriptorRef.current,
          detection.descriptor,
        );
        console.log(
          "info",
          `[FaceCheck] distance=${distance.toFixed(3)}, counter=${faceMismatchCounterRef.current}`,
        );

        if (distance > 0.6) {
          faceMismatchCounterRef.current++;
          console.log(
            "warn",
            `[FaceCheck] Mismatch counter incremented: ${faceMismatchCounterRef.current}`,
          );
          showMessage(
            "verificationMessage",
            "⚠️ Possible different face detected…",
          );

          if (faceMismatchCounterRef.current >= faceMismatchThreshold) {
            console.log(
              "error",
              `[FaceCheck] ❌ Different face confirmed (${faceMismatchCounterRef.current} checks)`,
            );
            faceMismatchCounterRef.current = 0;
            differentFaceDetectedRef.current = true;
            if (
              mediaRecorderRef.current &&
              mediaRecorderRef.current.state === "recording"
            ) {
              try {
                mediaRecorderRef.current.pause();
                // Silent pause - background recording
                // showMessage('recordingMessage','⏸️ Paused – different face detected');
              } catch {}
            }
            return true; // confirmed different face
          }
        } else {
          if (faceMismatchCounterRef.current > 0) {
            console.log(
              "info",
              `[FaceCheck] Face match restored, counter reset.`,
            );
          }
          faceMismatchCounterRef.current = 0;
          if (differentFaceDetectedRef.current) {
            differentFaceDetectedRef.current = false;
            // Resume if safe (no multi faces, face detected)
            if (
              mediaRecorderRef.current &&
              mediaRecorderRef.current.state === "paused" &&
              !multipleFacesDetectedRef.current &&
              isFaceDetectedRef.current
            ) {
              try {
                mediaRecorderRef.current.resume();
                // Silent resume - background recording
                // showMessage('recordingMessage','▶️ Resumed – original face restored');
              } catch {}
            }
          }
        }
      } else {
        console.log("warn", `[FaceCheck] ⚠️ No face detected (null detection)`);
        faceMismatchCounterRef.current = 0; // temporary loss, not mismatch
      }
    } catch (err) {
      console.log(
        "error",
        `[FaceCheck] ⚠️ Error during face detection: ${err}`,
      );
      faceMismatchCounterRef.current = 0;
    }

    return false; // default safe
  }, [showMessage]);

  // Outside your component
  const getRandomDirection = (
    exclude: Array<"up" | "down" | "left" | "right" | "forward">,
  ): "up" | "down" | "left" | "right" | "forward" => {
    const types: ("up" | "down" | "left" | "right" | "forward")[] = [
      "up",
      "down",
      "left",
      "right",
      "forward",
    ];
    const filtered = types.filter((t) => !exclude.includes(t));
    return filtered[Math.floor(Math.random() * filtered.length)];
  };

  const startBlinking = useCallback(
    (direction: "left" | "right" | "up" | "down" | "forward") => {
      // Save direction for reference
      blinkingDirectionRef.current = direction;
      blinkVisibleRef.current = true;

      // Clear existing blink interval if any
      if (blinkIntervalIdRef.current) {
        clearInterval(blinkIntervalIdRef.current);
      }

      blinkIntervalIdRef.current = setInterval(() => {
        // Toggle visibility on/off to create blink effect
        blinkVisibleRef.current = !blinkVisibleRef.current;

        // Redraw face guide overlay with current brightness (default 100 if not set)
        drawFaceGuideOverlay(currentBrightnessRef.current || 100);
      }, 500); // Repeat every 500 milliseconds (twice per second)
    },
    [drawFaceGuideOverlay],
  );

  const stopBlinking = useCallback(() => {
    // Clear blinking interval timer
    if (blinkIntervalIdRef.current) {
      clearInterval(blinkIntervalIdRef.current);
      blinkIntervalIdRef.current = null;
    }

    // Clear stored blinking direction
    blinkingDirectionRef.current = null;

    // Hide blink overlay
    blinkVisibleRef.current = false;

    // Redraw face guide overlay with current brightness (default 100 if not set)
    drawFaceGuideOverlay(currentBrightnessRef.current || 100);
  }, [drawFaceGuideOverlay]);

  const runVerification = useCallback(
    (
      direction: "left" | "right" | "up" | "down" | "forward",
    ): Promise<boolean> => {
      return new Promise((resolve) => {
        try {
          // Array to collect recorded video chunks
          const tempChunks: Blob[] = [];
          let recorder: MediaRecorder | null = null;
          let success = false;
          let isRecordingVerification = false;

          // Attempt to create MediaRecorder for video capture
          try {
            if (!streamRef.current) {
              logServiceRef.current.log(
                "error",
                "[HeadVerification] No stream available",
              );
              resolve(false);
              return;
            }
            recorder = new MediaRecorder(streamRef.current, {
              mimeType: "video/webm;codecs=vp9",
            });
          } catch (err) {
            logServiceRef.current.log(
              "error",
              `[HeadVerification] Failed to create MediaRecorder: ${err}`,
            );
            resolve(false);
            return;
          }

          // Event triggered when new data chunk is available
          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) tempChunks.push(e.data);
          };

          // Event triggered when recording stops
          recorder.onstop = () => {
            const blob = new Blob(tempChunks, { type: "video/webm" });
            setHeadTurnBlob(blob);

            if (success) {
              setVerificationMessage(
                "✅ Head movement verified — downloading...",
              );
              logServiceRef.current.log(
                "info",
                "[HeadVerification] 🎥 Recording complete. Starting download.",
              );
              showMessage(
                "headTurnAttemptStatus",
                "✅ Head movement verified — downloading...",
              );
              resolve(true);
            } else {
              logServiceRef.current.log(
                "info",
                "[HeadVerification] 🎥 Recording complete. No verification.",
              );
              resolve(false);
            }
          };

          // Define thresholds for yaw (left/right rotation) and pitch (up/down rotation)
          const yawThreshold = 0.35;
          const pitchThreshold = 0.38;
          const upThreshold = 0.12;

          const nearYawThreshold = yawThreshold * 0.2;
          const nearPitchThresholdDown = 0.27;
          const nearPitchThresholdUp = 0.2;

          logServiceRef.current.log(
            "info",
            `[HeadVerification] Started. Direction: ${direction}, YawThreshold: ${yawThreshold}, PitchThreshold: ${pitchThreshold}`,
          );
          showMessage(
            "headTurnAttemptStatus",
            `[HeadVerification] Started. Direction: ${direction}, YawThreshold: ${yawThreshold}, PitchThreshold: ${pitchThreshold}`,
          );

          // Start UI blinking effect to guide user
          startBlinking(direction);

          // Clear overlay canvas for fresh drawing
          try {
            if (overlayCanvasRef.current) {
              const ctx = overlayCanvasRef.current.getContext("2d");
              if (ctx)
                ctx.clearRect(
                  0,
                  0,
                  overlayCanvasRef.current.width,
                  overlayCanvasRef.current.height,
                );
            }
          } catch (err) {
            logServiceRef.current.log(
              "warn",
              `[HeadVerification] Could not clear overlay canvas: ${err}`,
            );
          }

          // Helper functions must be defined before baseline init usage
          const yawFromLandmarks = (lm: faceapi.FaceLandmarks68) => {
            const leftEye = lm.getLeftEye();
            const rightEye = lm.getRightEye();
            const nose = lm.getNose()[3];
            const leftEyeOuter = leftEye[0];
            const rightEyeOuter = rightEye[3];
            const eyeDist = Math.max(1, rightEyeOuter.x - leftEyeOuter.x);
            const eyeMidX = (leftEyeOuter.x + rightEyeOuter.x) / 2;
            return (nose.x - eyeMidX) / eyeDist;
          };
          const pitchFromLandmarks = (lm: faceapi.FaceLandmarks68) => {
            const leftEye = lm.getLeftEye();
            const rightEye = lm.getRightEye();
            const nose = lm.getNose();
            const jaw = lm.getJawOutline();
            const leftEyeCenter = {
              x: (leftEye[0].x + leftEye[3].x) / 2,
              y: (leftEye[1].y + leftEye[5].y) / 2,
            };
            const rightEyeCenter = {
              x: (rightEye[0].x + rightEye[3].x) / 2,
              y: (rightEye[1].y + rightEye[5].y) / 2,
            };
            const eyeMidY = (leftEyeCenter.y + rightEyeCenter.y) / 2;
            const noseTip = nose[3];
            const chinPoint = jaw[8];
            const faceHeight = Math.max(1, chinPoint.y - eyeMidY);
            const noseRelativeY = (noseTip.y - eyeMidY) / faceHeight;
            return noseRelativeY;
          };
          // Capture baseline landmarks once at start to compute relative deltas
          let baselineYaw: number | null = null;
          let baselinePitch: number | null = null;
          // Tunable delta thresholds: slightly easier than absolute angles
          const yawDeltaThreshold = 0.06; // left/right
          const pitchDeltaDownThreshold = 0.05; // down
          const pitchDeltaUpThreshold = -0.05; // up (negative)

          // Sampling interval to check head movement roughly every 120ms for faster feedback
          const sampler = setInterval(async () => {
            try {
              // Detect face directly in verification loop instead of relying on stale refs
              const videoEl = videoRef.current;
              if (!videoEl || !ovalRef.current) return;

              const detections = await faceapi
                .detectSingleFace(
                  videoEl,
                  new faceapi.TinyFaceDetectorOptions(),
                )
                .withFaceLandmarks();

              if (!detections || !detections.landmarks) {
                logServiceRef.current.log(
                  "warn",
                  "[HeadVerification] No face detected in current frame",
                );
                return;
              }

              const landmarks = detections.landmarks;
              const box = detections.detection.box;

              // Initialize baseline once when first valid landmarks are detected
              if (baselineYaw === null || baselinePitch === null) {
                baselineYaw = yawFromLandmarks(landmarks);
                baselinePitch = pitchFromLandmarks(landmarks);
                logServiceRef.current.log(
                  "info",
                  `[HeadVerification] Baseline yaw=${baselineYaw.toFixed(3)} pitch=${baselinePitch.toFixed(3)}`,
                );
                return; // wait next tick to start measuring deltas
              }

              // Verify if face center is inside the predefined oval bounds
              const faceCenterX = box.x + box.width / 2;
              const faceCenterY = box.y + box.height / 2;
              const dx = faceCenterX - ovalRef.current.cx;
              const dy = faceCenterY - ovalRef.current.cy;
              const dist = Math.sqrt(dx * dx + dy * dy);

              // If user moves outside the oval while recording, stop recording immediately
              if (dist > ovalRef.current.rOuter) {
                if (
                  isRecordingVerification &&
                  recorder &&
                  recorder.state !== "inactive"
                ) {
                  logServiceRef.current.log(
                    "info",
                    "[HeadVerification] User moved outside oval, stopping recording.",
                  );
                  recorder.stop();
                  isRecordingVerification = false;
                }
                return;
              }

              let isVerified = false;

              // Current absolute values from fresh detection
              const currentYaw = yawFromLandmarks(landmarks);
              const currentPitch = pitchFromLandmarks(landmarks);
              const yawDelta = currentYaw - (baselineYaw as number);
              const pitchDelta = currentPitch - (baselinePitch as number);
              logServiceRef.current.log(
                "info",
                `[HeadVerification] ΔYaw=${yawDelta.toFixed(3)} ΔPitch=${pitchDelta.toFixed(3)}`,
              );

              if (direction === "forward") {
                // For 'forward' direction: just verify face stays centered and stable
                const isStable =
                  Math.abs(yawDelta) < 0.03 && Math.abs(pitchDelta) < 0.03;
                if (!isRecordingVerification) {
                  recorder?.start();
                  isRecordingVerification = true;
                  showMessage(
                    "headTurnAttemptStatus",
                    `Capturing face — keep looking STRAIGHT…`,
                  );
                }
                if (isStable) {
                  isVerified = true;
                  success = true;
                  setVerificationMessage(`✅ Face captured (STRAIGHT).`);
                } else {
                  setVerificationMessage(
                    `📷 Keep your face STRAIGHT and STILL…`,
                  );
                }
              } else if (direction === "left" || direction === "right") {
                const passes =
                  (direction === "left" && yawDelta < -yawDeltaThreshold) ||
                  (direction === "right" && yawDelta > yawDeltaThreshold);
                if (
                  !isRecordingVerification &&
                  Math.abs(yawDelta) > yawDeltaThreshold / 2
                ) {
                  recorder?.start();
                  isRecordingVerification = true;
                  showMessage(
                    "headTurnAttemptStatus",
                    `Capturing head turn (${direction.toUpperCase()})…`,
                  );
                }
                if (
                  isRecordingVerification &&
                  Math.abs(yawDelta) < yawDeltaThreshold / 3
                ) {
                  recorder?.stop();
                  isRecordingVerification = false;
                }
                if (passes) {
                  isVerified = true;
                  success = true;
                  setVerificationMessage(
                    `✅ ${direction.toUpperCase()} movement detected.`,
                  );
                } else {
                  setVerificationMessage(
                    `${direction === "left" ? "⬅️" : "➡️"} Keep turning your head ${direction.toUpperCase()}.`,
                  );
                }
              } else if (direction === "down" || direction === "up") {
                const passes =
                  (direction === "down" &&
                    pitchDelta > pitchDeltaDownThreshold) ||
                  (direction === "up" && pitchDelta < pitchDeltaUpThreshold);
                if (
                  !isRecordingVerification &&
                  ((direction === "down" &&
                    pitchDelta > pitchDeltaDownThreshold / 2) ||
                    (direction === "up" &&
                      pitchDelta < pitchDeltaUpThreshold / 2))
                ) {
                  recorder?.start();
                  isRecordingVerification = true;
                  showMessage(
                    "headTurnAttemptStatus",
                    `Capturing head movement (${direction.toUpperCase()})…`,
                  );
                }
                if (
                  isRecordingVerification &&
                  ((direction === "down" &&
                    pitchDelta < pitchDeltaDownThreshold / 3) ||
                    (direction === "up" &&
                      pitchDelta > pitchDeltaUpThreshold / 3))
                ) {
                  recorder?.stop();
                  isRecordingVerification = false;
                }
                if (passes) {
                  isVerified = true;
                  success = true;
                  setVerificationMessage(
                    `✅ ${direction.toUpperCase()} movement detected.`,
                  );
                } else {
                  setVerificationMessage(
                    `${direction === "down" ? "⬇️" : "⬆️"} Keep moving your head ${direction.toUpperCase()}.`,
                  );
                }
              }

              // Optionally draw face landmarks on overlay canvas here:
              // drawFaceLandmarks(lastLandmarksRef.current, overlayCanvasRef.current);

              if (isVerified) {
                success = true;
                setVerificationStatus(true);
                stopBlinking();
                clearInterval(sampler);
                setHeadTurnRecordingDone(true);
                if (recorder && recorder.state !== "inactive") recorder.stop();

                setVerificationMessage(
                  `✅ VERIFIED direction (${direction.toUpperCase()})!`,
                );
                showMessage(
                  "statusMessage",
                  `✅ VERIFIED direction (${direction.toUpperCase()})!`,
                );

                // Add glow effect to video element for feedback
                const videoEl = videoRef.current;
                if (videoEl) {
                  videoEl.classList.add("selfie-glow-green");
                  console.log(
                    "[HeadVerification] ✅ Added glow-green class to video",
                  );
                  setTimeout(() => {
                    videoEl.classList.remove("selfie-glow-green");
                    console.log(
                      "[HeadVerification] Removed glow-green class from video",
                    );
                  }, 3000);
                } else {
                  console.warn(
                    "[HeadVerification] ⚠️ Could not find video element for glow effect",
                  );
                }
              }
            } catch (err) {
              logServiceRef.current.log(
                "error",
                `[HeadVerification] Sampler error: ${err}`,
              );
            }
          }, 150);

          // Timeout fallback: stop verification if it takes too long
          setTimeout(() => {
            try {
              clearInterval(sampler);
              stopBlinking();

              if (!success) {
                if (
                  isRecordingVerification &&
                  recorder &&
                  recorder.state !== "inactive"
                )
                  recorder.stop();
                setVerificationStatus(false);
                setHeadTurnRecordingFailed(true);
                setVerificationMessage(
                  `❌ Head movement (${direction.toUpperCase()}) timed out. Please try again.`,
                );
                logServiceRef.current.log(
                  "error",
                  `[HeadVerification] ❌ TIMEOUT after ${HEAD_VERIFICATION_TIMEOUT_MS}ms. Direction: ${direction} not verified in time.`,
                );
                resolve(false);
              }
            } catch (err) {
              logServiceRef.current.log(
                "error",
                `[HeadVerification] Timeout cleanup failed: ${err}`,
              );
              resolve(false);
            }
          }, HEAD_VERIFICATION_TIMEOUT_MS);
        } catch (err) {
          logServiceRef.current.log(
            "error",
            `[HeadVerification] Unexpected error in verification: ${err}`,
          );
          resolve(false);
        }
      });
    },
    [
      showMessage,
      startBlinking,
      stopBlinking,
      setHeadTurnBlob,
      setVerificationMessage,
      setVerificationStatus,
      setHeadTurnRecordingDone,
      setHeadTurnRecordingFailed,
    ],
  );

  // Returns: true = success, false = explicit failed attempt, null = defer (camera not ready)
  const startHeadMovementVerification = useCallback(
    async (
      direction: "left" | "right" | "up" | "down" | "forward",
    ): Promise<boolean | null> => {
      try {
        // Check if the camera is active before starting verification
        if (sessionCompletedRef.current) {
          logServiceRef.current.log(
            "info",
            "[HeadVerification] Ignored after session completion",
          );
          return null;
        }
        // Stream readiness is checked in performVerificationForCurrentSegment before calling this
        // If we reach here, stream exists and camera is active

        // Initialize verification state variables
        setHeadTurnDirection(direction);
        setHeadTurnAttemptStatus("");
        setIsVerifyingHeadTurn(true);
        isVerifyingHeadTurnRef.current = true;
        setHeadTurnBlob(null);
        setVerificationStatus(false);

        // Show a user-friendly message to prompt head movement in the desired direction
        const message =
          direction === "forward"
            ? `Recording face — keep looking STRAIGHT into the camera...`
            : `Recording head movement (${direction.toUpperCase()}) �� keep your face in this direction...`;
        setVerificationMessage(message);
        showMessage("headTurnAttemptStatus", message);

        // Wait briefly before starting verification (short delay to prepare)
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Perform the core head movement verification logic (returns true/false)
        const success = await runVerification(direction);

        // Wait an additional 3 seconds before finishing (could be to stabilize UI or user feedback)
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Mark verification as complete
        setIsVerifyingHeadTurn(false);
        isVerifyingHeadTurnRef.current = false;

        // Return whether the head movement verification was successful or not
        return success;
      } catch (outerErr) {
        // Handle unexpected errors gracefully and log them
        logServiceRef.current.log(
          "error",
          `[HeadVerification] Unexpected error: ${outerErr}`,
        );
        setVerificationMessage("❌ Unexpected error during verification.");
        setIsVerifyingHeadTurn(false);
        isVerifyingHeadTurnRef.current = false;
        return false;
      }
    },
    [isCameraOn, showMessage, runVerification],
  );

  const _resetAll = useCallback(() => {
    // Recording/session state
    setCurrentSegment(1);
    currentSegmentRef.current = 1; // ✅ Sync ref
    setSegmentSecondsRecorded(0);
    segmentSecondsRecordedRef.current = 0; // ✅ Sync ref
    setIsRecording(false);
    isRecordingRef.current = false; // ✅ Sync ref
    setCompletedSegments([]);
    recordingFlagRef.current = 0; // Reset recording flag

    // Verification maps and counters (state and refs)
    setVerificationDoneForSegment({});
    verificationDoneForSegmentRef.current = {}; // ✅ Clear ref
    setHeadTurnAttemptsPerSegment({});
    headTurnAttemptsPerSegmentRef.current = {}; // ✅ Clear ref
    setHeadTurnAttempts(0);
    // Clear success tracking per segment (used by shouldVerifyAfterSegment logic)
    verificationSuccessForSegmentRef.current = {};
    verificationTriggeredForSegmentRef.current = {}; // ✅ Clear triggered flags

    // Face mismatch counter reset
    faceMismatchCounterRef.current = 0;

    // Verification flow flags
    setTriggerVerification3(false);
    setFirstVerificationDirection(null);
    setSecondVerificationDirection(null);
    setThirdVerificationDirection(null);
    verificationTimeInSegmentRef.current = 0;
    // Clear any verification gating flags so a fresh session can start
    verificationInProgressRef.current = false;
    verificationPendingRef.current = false;
    processingSegmentCompletionRef.current = false;
    isVerifyingHeadTurnRef.current = false;
    recordingFlagRef.current = 0;

    // Reset progress percentage
    setOverallProgressPercentage(0);
  }, []);

  const performVerificationForCurrentSegment: () => Promise<void> =
    useCallback(async () => {
      const segment = currentSegmentRef.current; // ✅ Use ref to avoid stale closure
      console.log(
        "info",
        "[HeadVerification] performVerificationForCurrentSegment called for segment",
        segment,
      );
      setShowHeadTurnPrompt(true);
      verificationPendingRef.current = true;

      let verificationDirection: "up" | "down" | "left" | "right" | "forward";
      if (verificationInProgressRef.current) {
        logServiceRef.current.log(
          "info",
          "Head verification already in progress; skipping new request.",
        );
        return; // Prevent duplicate starts
      }
      verificationInProgressRef.current = true;
      // Mark verification as triggered for this segment
      verificationTriggeredForSegmentRef.current[segment] = true;

      // Prefer any pre-planned direction chosen at segment start
      const prePlanned = plannedVerificationDirectionRef.current[segment];
      if (prePlanned) {
        verificationDirection = prePlanned;
        if (segment === 1) setFirstVerificationDirection(verificationDirection);
        else if (segment === 2)
          setSecondVerificationDirection(verificationDirection);
        else setThirdVerificationDirection(verificationDirection);
      } else if (segment === 1) {
        // Default: use 'forward' for segment 1 if not pre-planned
        verificationDirection = "forward";
        setFirstVerificationDirection(verificationDirection);
      } else if (segment === 2) {
        verificationDirection = getRandomDirection([
          firstVerificationDirection!,
        ]);
        setSecondVerificationDirection(verificationDirection);
      } else {
        verificationDirection = getRandomDirection([
          firstVerificationDirection!,
          secondVerificationDirection!,
        ]);
        setThirdVerificationDirection(verificationDirection);
      }

      setDirection(verificationDirection);
      showMessage(
        "headTurnAttemptStatus",
        `Please ${
          verificationDirection === "left"
            ? "turn your head LEFT and KEEP it there"
            : verificationDirection === "right"
              ? "turn your head RIGHT and KEEP it there"
              : verificationDirection === "up"
                ? "tilt your head UP and KEEP it there"
                : verificationDirection === "down"
                  ? "tilt your head DOWN and KEEP it there"
                  : "look STRAIGHT into the camera and KEEP your face still"
        }`,
      );
      if (sessionCompletedRef.current) {
        logServiceRef.current.log(
          "info",
          "Head verification prompt suppressed after session completion.",
        );
        verificationInProgressRef.current = false;
        return; // Do not proceed once session done
      }
      logServiceRef.current.log(
        "info",
        `Prompting user to ${verificationDirection}`,
      );

      // Pause main recording before starting head verification recording (silent background operation)
      if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.pause();
        // showMessage('recordingMessage', `⏸️ Paused segment recording for head verification.`);
      }

      // Early guard: if stream not ready, defer verification without counting attempt
      // Ensure a usable stream; prefer streamRef, recover from video element if needed
      console.log(
        "info",
        "[HeadVerification] Checking stream readiness. streamRef.current=",
        !!streamRef.current,
      );
      if (!streamRef.current) {
        const videoEl = videoRef.current;
        if (videoEl && videoEl.srcObject instanceof MediaStream) {
          streamRef.current = videoEl.srcObject as MediaStream;
          console.log(
            "info",
            "[HeadVerification] Recovered stream from video element – proceeding",
          );
        }
      }

      // If after recovery we STILL have no stream, defer and keep pending true to block next segment
      if (!streamRef.current) {
        console.log(
          "warn",
          "[HeadVerification] Deferring – stream not ready (post-recovery)",
        );
        verificationInProgressRef.current = false;
        setShowHeadTurnPrompt(false);
        // Keep pending to prevent next segment from starting
        verificationPendingRef.current = true;
        // Schedule a re-attempt
        setTimeout(() => {
          console.log(
            "info",
            "[HeadVerification] Re-attempting after deferral...",
          );
          if (!sessionCompletedRef.current) {
            performVerificationForCurrentSegment();
          }
        }, 1200);
        return;
      }

      console.log(
        "info",
        "[HeadVerification] Stream ready, proceeding to create headMediaRecorder. Stream has",
        streamRef.current.getTracks().length,
        "tracks",
      );

      // Setup and start headMediaRecorder here:
      let options: MediaRecorderOptions | undefined;
      if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
        options = { mimeType: "video/webm;codecs=vp9" };
      } else if (MediaRecorder.isTypeSupported("video/webm")) {
        options = { mimeType: "video/webm" };
      } else if (MediaRecorder.isTypeSupported("video/mp4")) {
        options = { mimeType: "video/mp4", videoBitsPerSecond: 100000 };
      } else {
        logServiceRef.current.log(
          "error",
          "No supported MIME type found for MediaRecorder on this browser.",
        );
        showMessage(
          "statusMessage",
          "⚠️ MediaRecorder MIME type not supported.",
        );
        return;
      }

      headRecordedChunksRef.current = [];
      setHeadSegmentSecondsRecorded(0);

      // Use the live stream from ref (state 'stream' was removed)
      if (!streamRef.current) {
        showMessage(
          "statusMessage",
          "⚠️ Camera stream not ready for head verification.",
        );
        return;
      }
      const headRecorder = new MediaRecorder(streamRef.current, options);
      // Store head verification MediaRecorder in ref (no state setter exists)
      headMediaRecorderRef.current = headRecorder;

      headRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          headRecordedChunksRef.current.push(e.data);
          setHeadSegmentSecondsRecorded((prev) => prev + 1);
        }
      };

      headRecorder.onstop = () => {
        if (sessionCompletedRef.current) {
          logServiceRef.current.log(
            "info",
            "Head verification stop ignored after session completion.",
          );
          return;
        }
        const chunksToKeep = Math.min(headRecordedChunksRef.current.length, 3);
        const selectedChunks =
          headRecordedChunksRef.current.slice(-chunksToKeep);
        const headBlob = new Blob(selectedChunks, {
          type: options?.mimeType ?? "video/webm",
        });

        // Store latest head verification blob for conditional download on SUCCESS only
        latestHeadBlobRef.current = headBlob;

        // Reset head chunks and counter for next verification video if any
        headRecordedChunksRef.current = [];
        setHeadSegmentSecondsRecorded(0);

        // Note: Main recording resumption is handled in the success/failure blocks below
        // via _startSegmentRecording() which creates a fresh recorder from the paused position
      };

      // Record verification video in 1s chunks so we can trim to last 2-3 seconds easily
      headRecorder.start(1000);

      // Now call your verification function that awaits the user's head movement
      const success = await startHeadMovementVerification(
        verificationDirection,
      );

      // Stop the headMediaRecorder when done verification
      if (
        headRecorder.state === "recording" ||
        headRecorder.state === "paused"
      ) {
        headRecorder.stop();
      }

      setShowHeadTurnPrompt(false);

      if (success === true) {
        const segment = currentSegmentRef.current; // Use ref to get current value
        setVerificationDoneForSegment((prev) => ({ ...prev, [segment]: true }));
        // Mark success for this segment (1 or 2). Segment 3 managed separately.
        verificationSuccessForSegmentRef.current[segment] = true;
        // ✅ Also mark 'done' in ref so shouldVerifyAfterSegment returns false next time
        verificationDoneForSegmentRef.current[segment] = true;

        // Update progress based on completed verification
        // Verifications: 1 (40%), 2 (80%), 3 (already at 100% from segment 3 completion)
        if (segment === 1) {
          setOverallProgressPercentage(40);
        } else if (segment === 2) {
          setOverallProgressPercentage(80);
        }

        console.log(
          "info",
          `[HeadVerification] ✅ SUCCESS for segment ${segment}. verificationDoneForSegmentRef is now:`,
          verificationDoneForSegmentRef.current,
        );
        setHeadTurnAttempts(0);
        setHeadTurnAttemptsPerSegment((prev) => ({ ...prev, [segment]: 0 }));
        showMessage(
          "headTurnAttemptStatus",
          `✅ Head turn verified for segment ${segment}.`,
        );

        // ✅ Download head verification video exactly once for segment 1 and 2
        if (
          (segment === 1 || segment === 2) &&
          !headDownloadDoneRef.current[segment]
        ) {
          try {
            let blobToDownload: Blob | null = latestHeadBlobRef.current;
            if (!blobToDownload) {
              // Fallback to chunks if latest blob wasn't set yet
              const chunksToKeep = Math.min(
                headRecordedChunksRef.current.length,
                3,
              );
              const selectedChunks =
                headRecordedChunksRef.current.slice(-chunksToKeep);
              blobToDownload = selectedChunks.length
                ? new Blob(selectedChunks, { type: "video/webm" })
                : null;
            }
            if (blobToDownload) {
              const a = document.createElement("a");
              a.style.display = "none";
              a.href = URL.createObjectURL(blobToDownload);
              a.download = `head${segment}.webm`;
              document.body.appendChild(a);
              a.click();
              setTimeout(() => {
                URL.revokeObjectURL(a.href);
                document.body.removeChild(a);
              }, 100);
              headDownloadDoneRef.current[segment] = true;
              console.log(
                "info",
                `[HeadVerification] Downloaded head${segment}.webm`,
              );
            } else {
              console.warn(
                "[HeadVerification] No head blob available to download after success",
              );
            }
          } catch (e) {
            console.warn(
              "[HeadVerification] Failed to download head video after success:",
              e,
            );
          } finally {
            // Clear latest blob reference for next time
            latestHeadBlobRef.current = null;
          }
        }

        // ✅ Resume segment recording after successful verification
        // Since segment is already complete (saved to completedSegments), calling _startSegmentRecording
        // with the full duration will immediately trigger onSegmentComplete to move to next segment
        if (!sessionCompletedRef.current) {
          const resumeFrom = segmentSecondsRecordedRef.current;
          const segmentTarget = segmentDurations[segment - 1];
          console.log(
            "info",
            `[HeadVerification] Resuming segment ${segment} from ${resumeFrom}s (target: ${segmentTarget}s)`,
          );
          console.log(
            "info",
            `   This will trigger immediate completion and move to next segment`,
          );
          recordingFlagRef.current = 1;
          // Resume the current segment from where it paused (use ref value for accuracy)
          setTimeout(
            () => _startSegmentRecording(segmentSecondsRecordedRef.current),
            600,
          );
        }
        verificationPendingRef.current = false;
      } else if (success === false) {
        const segment = currentSegmentRef.current; // Use ref to get current value
        setHeadTurnAttempts((prev) => prev + 1);
        const newAttempts = headTurnAttempts + 1;
        setHeadTurnAttemptsPerSegment((prev) => ({
          ...prev,
          [segment]: newAttempts,
        }));
        showMessage(
          "headTurnAttemptStatus",
          `❌ Head turn failed attempt ${newAttempts}. Please try again.`,
        );

        if (newAttempts >= maxHeadTurnAttempts) {
          // Final failure for this segment -> mark verification as failed
          verificationSuccessForSegmentRef.current[segment] = false;
          verificationDoneForSegmentRef.current[segment] = true; // mark done (failed)
          if (segment === 1) {
            setHeadTurnRecordingFailed(true);
            showMessage(
              "headTurnAttemptStatus",
              `❌ Verification 1 failed ${newAttempts} times. Restarting all segments.`,
            );
            _resetAll();
            setTimeout(() => _startSegmentRecording(0), 1000);
          } else if (segment === 2) {
            setHeadTurnRecordingFailed(true);
            showMessage(
              "headTurnAttemptStatus",
              `❌ Verification 2 failed. Will trigger verification 3 after final video.`,
            );
            setTriggerVerification3(true);
            // ✅ Resume segment 2 from where it left off to complete its duration
            setTimeout(
              () => _startSegmentRecording(segmentSecondsRecordedRef.current),
              600,
            );
          } else {
            setHeadTurnRecordingFailed(true);
            showMessage(
              "headTurnAttemptStatus",
              `❌ Verification 3 failed. Restarting all.`,
            );
            verificationDoneForSegmentRef.current[segment] = true;
            _resetAll();
            setTimeout(() => _startSegmentRecording(0), 1000);
          }
        } else {
          // Retry verification after short delay (keep pending true)
          setTimeout(() => performVerificationForCurrentSegment(), 1500);
        }
      } else {
        // success === null (deferred) -> do not increment attempts, schedule a retry only when camera active
        logServiceRef.current.log(
          "info",
          "[HeadVerification] Deferred; will retry when camera active",
        );
        setTimeout(() => {
          if (isCameraOn && !sessionCompletedRef.current)
            performVerificationForCurrentSegment();
        }, 1500);
        // pending stays true
      }

      verificationInProgressRef.current = false;
    }, [
      currentSegment,
      firstVerificationDirection,
      secondVerificationDirection,
      mediaRecorder,
      isRecording,
      headTurnAttempts,
      maxHeadTurnAttempts,
      segmentSecondsRecorded,
      segmentDurations,
      setShowHeadTurnPrompt,
      setFirstVerificationDirection,
      setSecondVerificationDirection,
      setThirdVerificationDirection,
      setDirection,
      setHeadSegmentSecondsRecorded,
      setHeadVerificationCountPerSegment,
      setVerificationDoneForSegment,
      setHeadTurnAttempts,
      setHeadTurnAttemptsPerSegment,
      setHeadTurnRecordingFailed,
      setTriggerVerification3,
      showMessage,
      logServiceRef,
      headRecordedChunksRef,
      getRandomDirection,
      startHeadMovementVerification,
      _resetAll,
      isCameraOn,
    ]);

  const stopCamera = useCallback(() => {
    console.log("info", "[Camera] Stopping camera and cleaning up...");

    // Stop animation frame loop
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
      console.log("info", "[Camera] Cancelled animation frame");
    }

    // Clear timer interval
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
      console.log("info", "[Camera] Cleared timer interval");
    }

    // Clear blink interval
    if (blinkIntervalIdRef.current) {
      clearInterval(blinkIntervalIdRef.current);
      blinkIntervalIdRef.current = null;
      console.log("info", "[Camera] Cleared blink interval");
    }

    // Stop all media recorders
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      try {
        mediaRecorderRef.current.stop();
        console.log("info", "[Camera] Stopped main media recorder");
      } catch (e) {
        console.warn("[Camera] Error stopping main recorder:", e);
      }
    }

    if (
      headMediaRecorderRef.current &&
      headMediaRecorderRef.current.state !== "inactive"
    ) {
      try {
        headMediaRecorderRef.current.stop();
        console.log("info", "[Camera] Stopped head verification recorder");
      } catch (e) {
        console.warn("[Camera] Error stopping head recorder:", e);
      }
    }

    // Stop all media stream tracks (this actually turns off the camera)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("info", `[Camera] Stopped track: ${track.kind}`);
      });
      streamRef.current = null;
    }

    // Clear video element source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Update camera state
    setIsCameraOn(false);
    console.log(
      "info",
      "[Camera] ✅ Camera stopped and cleaned up successfully",
    );
  }, [setIsCameraOn]);

  const downloadAllBlobs = useCallback(() => {
    if (downloadsTriggeredRef.current) {
      console.log(
        "info",
        "Downloads already triggered; skipping duplicate call.",
      );
      return;
    }
    downloadsTriggeredRef.current = true;

    // Download all completed segments (verification is only for liveness, not for filtering downloads)
    console.log("info", "[Downloads] Starting download of all segments");
    console.log(
      "info",
      "[Downloads] completedSegments count:",
      completedSegments.length,
    );

    // Build exactly one blob per segment (1..totalSegments) to avoid duplicates
    const finalSegments: Blob[] = [];
    for (let seg = 1; seg <= totalSegments; seg++) {
      const chunks = recordedChunksPerSegmentRef.current[seg];
      if (chunks && chunks.length > 0) {
        try {
          const blob = new Blob(chunks, { type: "video/webm" });
          finalSegments.push(blob);
          console.log(
            "info",
            `[Downloads] Using recorded chunks for segment ${seg} (${chunks.length} chunks).`,
          );
          continue;
        } catch (e) {
          console.log(
            "error",
            `[Downloads] Failed to build blob from chunks for segment ${seg}:`,
            e,
          );
        }
      }
      // Fallback to completedSegments array by index (seg-1)
      const fallback = completedSegments[seg - 1];
      if (fallback) {
        finalSegments.push(fallback);
        console.log(
          "info",
          `[Downloads] Using fallback completedSegments entry for segment ${seg}.`,
        );
      } else {
        console.log(
          "warn",
          `[Downloads] No blob available for segment ${seg}.`,
        );
      }
    }

    // Stagger downloads to avoid popup blockers; attach anchors to DOM for reliability
    finalSegments.forEach((blob, idx) => {
      const segmentNumber = idx + 1;
      const delay = idx * 300; // stagger by 300ms
      setTimeout(() => {
        try {
          const filename = `segment_${segmentNumber}.webm`;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.style.display = "none";
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 1000);
          console.log("info", `[Downloads] Triggered: ${filename}`);
        } catch (e) {
          console.log("error", "[Downloads] Failed to trigger download:", e);
        }
      }, delay);
    });

    // DO NOT download partial blobs - they are intermediate recordings from restarts
    // Only download the final complete segments above
    console.log(
      "info",
      "[Downloads] Skipping partial segment downloads (internal use only)",
    );

    // Head verification videos are already downloaded immediately after each verification
    // (see headRecorder.onstop in performVerificationForCurrentSegment)
    console.log(
      "info",
      "[Downloads] Head verification videos already downloaded during verification",
    );

    setStatusMessage("Downloads complete ✅ (segments + head verifications)");

    // Mark session completed & disable auto start IMMEDIATELY
    sessionCompletedRef.current = true;
    autoStartDisabledRef.current = true;

    // Stop camera and detection loop IMMEDIATELY to prevent any further recordings
    console.log(
      "info",
      "[Downloads] Stopping camera immediately to prevent duplicate downloads...",
    );
    stopCamera();

    console.log("✅ Session fully completed. Camera stopped.");
    // Don't call onStepComplete yet - wait for user to click submit
  }, [
    completedSegments,
    partialSegmentBlobsPerSegment,
    headTurnBlob,
    headTurnAttemptsPerSegment,
    setStatusMessage,
    _resetAll,
    stopCamera,
  ]);

  const captureLastFrame = useCallback(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw the video frame (mirrored to match the display)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL
    const frameUrl = canvas.toDataURL("image/png");
    setCapturedFrameUrl(frameUrl);
  }, []);

  const onSegmentComplete = useCallback(async () => {
    // If session is already completed, do nothing
    if (sessionCompletedRef.current) {
      console.log(
        "info",
        "[onSegmentComplete] Ignored because sessionCompletedRef is true",
      );
      return;
    }

    // Segment completes silently in background (no UI message)
    const seg = currentSegmentRef.current || currentSegment;
    // showMessage('recordingMessage', `✅ Segment ${seg} complete.`);

    if (seg < totalSegments) {
      const nextSegment = seg + 1; // define nextSegment before using
      setCurrentSegment(nextSegment);
      currentSegmentRef.current = nextSegment; // ✅ keep ref in sync with state
      verificationTimeInSegmentRef.current = 0;
      // Start next segment after a short delay
      // Pre-set recording flag so RAF loop won't race a concurrent start
      recordingFlagRef.current = 1;
      setTimeout(() => {
        _startSegmentRecording(0);
      }, 600);
    } else {
      // Final segment (segment 3) done
      // Only trigger verification 3 if segment 2's verification failed (triggerVerification3 flag)
      const segment3Done = !!verificationDoneForSegmentRef.current[3];
      console.log(
        "info",
        `[onSegmentComplete] Final segment. triggerVerification3=${triggerVerification3}, segment3Done=${segment3Done}`,
      );
      if (triggerVerification3 && !segment3Done) {
        // Segment 2 verification failed, need to do verification 3
        console.log(
          "info",
          "[onSegmentComplete] Segment 2 verification failed, triggering verification 3",
        );
        await performVerificationForCurrentSegment();
      } else {
        console.log(
          "info",
          "[onSegmentComplete] All segments and verifications complete! Completing session.",
        );
        // Stop any further recording and mark session complete BEFORE any async work
        setIsRecording(false);
        isRecordingRef.current = false; // ✅ Sync ref
        sessionCompletedRef.current = true;
        autoStartDisabledRef.current = true; // Prevent detection loop auto-restart
        // Silently complete - only show final success message
        // showMessage('recordingMessage', '✅ All 3 segments recorded successfully!');
        // downloadLogs();

        // Capture the last frame before stopping camera
        captureLastFrame();

        // Immediately download all blobs
        downloadAllBlobs();
      }
    }
  }, [
    currentSegment,
    totalSegments,
    triggerVerification3,
    verificationDoneForSegment,
    showMessage,
    setCurrentSegment,
    verificationTimeInSegmentRef,
    performVerificationForCurrentSegment,
    setIsRecording,
    // downloadLogs,
    downloadAllBlobs,
    captureLastFrame,
  ]);

  const shouldVerifyAfterSegment = useCallback(
    (segmentNumber: number): boolean => {
      console.log(
        "info",
        `[shouldVerifyAfterSegment] Called for segment ${segmentNumber}`,
      );
      // Segments 1 and 2 always get verification after completion
      if (segmentNumber === 1 || segmentNumber === 2) {
        const alreadyDone =
          !!verificationDoneForSegmentRef.current?.[segmentNumber];
        const decision = !alreadyDone;
        console.log(
          "info",
          `[shouldVerifyAfterSegment] Segment ${segmentNumber} done=${alreadyDone} -> return ${decision}`,
        );
        return decision;
      }
      // Segment 3 only gets verification if segment 2's verification FAILED
      if (segmentNumber === 3) {
        const segment2Failed =
          verificationSuccessForSegmentRef.current?.[2] === false;
        console.log(
          "info",
          `[shouldVerifyAfterSegment] Segment 3: segment2Failed=${segment2Failed} -> return ${segment2Failed}`,
        );
        return segment2Failed;
      }
      console.log(
        "info",
        `[shouldVerifyAfterSegment] Segment ${segmentNumber} -> returning FALSE`,
      );
      return false;
    },
    [],
  );

  const _startSegmentRecording: (
    resumeSecondsRecorded?: number,
  ) => Promise<void> = useCallback(
    async (resumeSecondsRecorded = 0) => {
      if (startingSegmentRef.current) {
        console.log(
          "warn",
          "Start already in progress - ignoring duplicate call.",
        );
        return;
      }
      // If session already completed or auto start disabled, do not start new recording
      if (sessionCompletedRef.current || autoStartDisabledRef.current) {
        console.log(
          "info",
          "[startSegment] Aborting start because sessionCompletedRef or autoStartDisabledRef is true",
        );
        return;
      }
      startingSegmentRef.current = true;
      try {
        // Camera stream check
        if (!streamRef.current) {
          showMessage("statusMessage", "⚠️ Camera not initialized.");
          // logService.log('error', 'Camera stream not initialized when trying to start segment recording.');
          return;
        }

        // Segment number check
        // Prefer ref for robustness; fallback to state
        let segment = currentSegmentRef.current || currentSegment;
        if (!segment || segment <= 0) {
          segment = 1;
          setCurrentSegment(1);
          currentSegmentRef.current = 1; // ✅ Sync ref
          console.log("warn", "currentSegment was 0 or invalid, reset to 1.");
        }

        let options: MediaRecorderOptions | undefined;
        if (resumeSecondsRecorded === 0) {
          recordedChunksPerSegmentRef.current[segment] = []; // ✅ Initialize ref
          setRecordedChunksPerSegment((prev) => ({ ...prev, [segment]: [] }));
          if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
            options = { mimeType: "video/webm;codecs=vp9" };
          } else if (MediaRecorder.isTypeSupported("video/webm")) {
            options = { mimeType: "video/webm" };
          } else if (MediaRecorder.isTypeSupported("video/mp4")) {
            options = { mimeType: "video/mp4", videoBitsPerSecond: 100000 };
          } else {
            console.log(
              "info",
              "No supported MIME type found for MediaRecorder on this browser.",
            );
            showMessage(
              "statusMessage",
              "⚠️ MediaRecorder MIME type not supported.",
            );
            return;
          }
        } else {
          if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
            options = { mimeType: "video/webm;codecs=vp9" };
          } else if (MediaRecorder.isTypeSupported("video/webm")) {
            options = { mimeType: "video/webm" };
          } else if (MediaRecorder.isTypeSupported("video/mp4")) {
            options = { mimeType: "video/mp4", videoBitsPerSecond: 100000 };
          }
        }

        // Segment state initialization
        if (resumeSecondsRecorded === 0 && !isRecording) {
          console.log("info", "Starting fresh new segment recording.");
          processingSegmentCompletionRef.current = false; // Reset flag when starting new segment
          if (
            segment === 1 &&
            (segmentSecondsRecorded === undefined ||
              segmentSecondsRecorded === null)
          ) {
            setCompletedSegments([]);
            setVerificationDoneForSegment({});
            setHeadTurnAttemptsPerSegment({});
            setHeadVerificationCountPerSegment({});
            partialSegmentBlobsPerSegmentRef.current = {}; // ✅ Use ref only
          }
          setSegmentSecondsRecorded(0);
          segmentSecondsRecordedRef.current = 0; // ✅ Sync ref
          setExtraSecondsRecorded(0);
          extraSecondsRecordedRef.current = 0; // ✅ Sync ref
          setIsSegmentValid(true);
          setIsRecording(true);
          setHeadTurnAttempts(0);
          currentSessionStartTimeRef.current = 0;

          setVerificationDoneForSegment((prev) => ({
            ...prev,
            [segment]: false,
          }));
          verificationDoneForSegmentRef.current[segment] = false; // ✅ Sync ref
          setHeadTurnAttemptsPerSegment((prev) => ({ ...prev, [segment]: 0 }));
          setHeadVerificationCountPerSegment((prev) => ({
            ...prev,
            [segment]: 0,
          }));
        } else {
          setSegmentSecondsRecorded(resumeSecondsRecorded);
          segmentSecondsRecordedRef.current = resumeSecondsRecorded; // ✅ Sync ref
          setExtraSecondsRecorded(0);
          extraSecondsRecordedRef.current = 0; // ✅ Sync ref
          currentSessionStartTimeRef.current = resumeSecondsRecorded;
          setRecordedChunksPerSegment((prev) => ({ ...prev, [segment]: [] }));
        }

        // MediaRecorder setup
        const recorder = new MediaRecorder(streamRef.current, options);
        mediaRecorderRef.current = recorder;
        setMediaRecorder(recorder);
        setIsRecording(true);
        isRecordingRef.current = true; // ✅ Sync ref immediately

        console.log("info", "MediaRecorder created", {
          state: recorder.state,
          options,
        });

        const segmentTarget =
          segmentDurations[segment - 1] || totalDuration / totalSegments;
        setTimeRemaining(segmentTarget - segmentSecondsRecorded);

        if (!segmentDurations || segmentDurations.length === 0) {
          console.log(
            "warn",
            "Segment durations not initialized yet, using default values",
          );
        }

        if (segmentTarget - segmentSecondsRecorded <= 0) {
          console.log(
            "info",
            "Segment duration already met or exceeded, calling _onSegmentComplete.",
          );
          await onSegmentComplete();
          return;
        }

        showMessage(
          "recordingMessage",
          `🔴 Recording segment ${segment}/${totalSegments} — keep your face FORWARD and still (${segmentTarget - segmentSecondsRecorded}s remaining)`,
        );

        // Data available handler (Angular parity: only keep chunks when face is detected)
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            console.log(
              "info",
              `📦 ondataavailable: received chunk of size ${e.data.size} bytes`,
            );
            // Save chunks only when exactly one matching face is inside the oval
            if (
              isFaceDetectedRef.current &&
              !multipleFacesDetectedRef.current &&
              !differentFaceDetectedRef.current
            ) {
              if (!recordedChunksPerSegmentRef.current[segment]) {
                recordedChunksPerSegmentRef.current[segment] = [];
              }
              recordedChunksPerSegmentRef.current[segment].push(e.data);
              setRecordedChunksPerSegment((prev) => ({
                ...prev,
                [segment]: [...recordedChunksPerSegmentRef.current[segment]],
              }));
            }
          }
        };

        // Stop handler
        recorder.onstop = async () => {
          console.log("info", `🛑 [onstop] ENTERED for segment ${segment}`);
          // Clear starting guard when recorder stops so a new segment can be started later
          startingSegmentRef.current = false;
          // ✅ Read from ref (always up-to-date)
          const actualSecondsRecorded = segmentSecondsRecordedRef.current;
          const chunkCount =
            recordedChunksPerSegmentRef.current[segment]?.length || 0;
          const hasEnoughTime = actualSecondsRecorded >= segmentTarget;
          const hasValidChunks = chunkCount > 0;

          // Use ref-backed values in logs to avoid stale state confusion
          console.log(
            "info",
            `📹 onstop: wasFaceDetected(ref)=${isFaceDetectedRef.current}, isSegmentValid=${isSegmentValid}, hasEnoughTime=${hasEnoughTime} (${actualSecondsRecorded}>=${segmentTarget}), hasValidChunks=${hasValidChunks} (${chunkCount} chunks)`,
          );

          // Always clear flag after any stop so detection loop doesn't think a start is pending
          recordingFlagRef.current = 0;

          if (stoppingForRestartRef.current) {
            // Use refs for precise timing when slicing partial blobs
            const sessionDuration =
              actualSecondsRecorded - currentSessionStartTimeRef.current;
            if (hasValidChunks && sessionDuration > 0) {
              const chunks = recordedChunksPerSegmentRef.current[segment];
              const blob = new Blob(chunks, {
                type: options?.mimeType ?? "video/webm",
              });
              if (!partialSegmentBlobsPerSegmentRef.current[segment]) {
                partialSegmentBlobsPerSegmentRef.current[segment] = [];
              }
              partialSegmentBlobsPerSegmentRef.current[segment].push({
                blob,
                startTime: currentSessionStartTimeRef.current,
                endTime: actualSecondsRecorded,
                duration: sessionDuration,
              });
            }
            stoppingForRestartRef.current = false;
            startingSegmentRef.current = false;
            return;
          }

          // Use ref for isFaceDetected to avoid stale state
          const wasFaceDetected = isFaceDetectedRef.current;

          // Accept segment if it has enough time and valid chunks, even if face flag flickered off right at stop
          if (isSegmentValid && hasEnoughTime && hasValidChunks) {
            // ✅ Read from ref
            const chunks = recordedChunksPerSegmentRef.current[segment];
            const blob = new Blob(chunks, {
              type: options?.mimeType ?? "video/webm",
            });
            setCompletedSegments((prev) => [...prev, blob]);

            // Update progress based on completed segment
            // Segments: 1 (20%), 2 (60%), 3 (100%)
            if (segment === 1) {
              setOverallProgressPercentage(20);
            } else if (segment === 2) {
              setOverallProgressPercentage(60);
            } else if (segment === 3) {
              setOverallProgressPercentage(100);
            }

            console.log(
              "info",
              `✅ Segment ${segment} COMPLETED and saved. Blob size: ${blob.size} bytes, Chunk count: ${chunks.length}`,
            );
            console.log(
              "info",
              `   Segment recorded for ${actualSecondsRecorded}s (target: ${segmentTarget}s)`,
            );
            // ✅ DON'T reset counters here - they're needed if verification resumes segment
            // Counters will be reset when starting fresh segment (resumeSecondsRecorded === 0)
          } else {
            console.log(
              "warn",
              `❌ Segment ${segment} incomplete; retrying. (face=${wasFaceDetected}, valid=${isSegmentValid}, time=${hasEnoughTime}, chunks=${hasValidChunks})`,
            );
            setTimeout(
              () => _startSegmentRecording(actualSecondsRecorded),
              600,
            );
            return;
          }

          console.log(
            "info",
            `[onstop] About to check shouldVerifyAfterSegment(${segment})`,
          );
          const shouldVerify = shouldVerifyAfterSegment(segment);
          console.log(
            "info",
            `[onstop] shouldVerifyAfterSegment(${segment}) returned:`,
            shouldVerify,
          );

          if (shouldVerify) {
            console.log(
              "info",
              `[onstop] Calling performVerificationForCurrentSegment for segment ${segment}`,
            );
            await performVerificationForCurrentSegment();
            processingSegmentCompletionRef.current = false; // Reset flag after verification
            startingSegmentRef.current = false;
            return;
          }

          await onSegmentComplete();
          processingSegmentCompletionRef.current = false; // Reset flag after completion
          // After onSegmentComplete sets up next segment, set recordingFlagRef to 0 until the loop decides to start again.
          recordingFlagRef.current = 0;
          startingSegmentRef.current = false;
        };

        // Timer logic
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = setInterval(async () => {
          // If recording flag dropped unexpectedly (e.g. onstop already fired), stop ticking
          if (recordingFlagRef.current === 0 && !isRecordingRef.current) {
            clearInterval(timerIntervalRef.current);
            return;
          }
          if (!isRecordingRef.current) {
            clearInterval(timerIntervalRef.current);
            return;
          }

          if (!isFaceDetectedRef.current) {
            if (recorder.state === "recording") {
              recorder.pause();
              // Silent pause - no UI message for background recording
              // showMessage('recordingMessage', `⏸️ Paused because face not detected`);
            }
            return;
          }

          // Additional gating: pause when multiple faces or different face detected
          if (
            multipleFacesDetectedRef.current ||
            differentFaceDetectedRef.current
          ) {
            if (recorder.state === "recording") {
              recorder.pause();
              // Silent pause - no UI message for background recording
              // showMessage('recordingMessage', multipleFacesDetectedRef.current
              //   ? '��️ Paused – multiple faces detected'
              //   : '⏸️ Paused – different face detected'
              // );
            }
            return;
          }

          if (recorder.state === "paused") {
            recorder.resume();
            // Silent resume - no UI message for background recording
            // showMessage('recordingMessage', `▶️ Resumed recording`);
          }

          if (recorder.state === "recording") {
            const currentSeconds = segmentSecondsRecordedRef.current;
            console.log(
              "info",
              `⏱️ Timer tick: currentSeconds=${currentSeconds}, target=${segmentTarget}`,
            );

            // Check for different face (only if still recording segment)
            if (currentSeconds < segmentTarget) {
              const newValue = currentSeconds + 1;
              segmentSecondsRecordedRef.current = newValue;
              setSegmentSecondsRecorded(newValue);
              setTimeRemaining(segmentTarget - newValue);

              if (await checkDifferentFace()) {
                setIsSegmentValid(false);
                showMessage(
                  "verificationMessage",
                  "❌ Different face detected for several seconds! Restarting from scratch...",
                );
                clearInterval(timerIntervalRef.current);
                _resetAll();
                _restartCurrentSegmentDueToFaceLoss();
                if (
                  recorder.state === "recording" ||
                  recorder.state === "paused"
                ) {
                  recorder.stop();
                }
                return;
              }
            } else {
              // Segment time reached - add extra second buffer only if there's a mismatch
              const extraSeconds = extraSecondsRecordedRef.current;
              // Only add extra second if segmentSecondsRecorded doesn't exactly match target
              if (currentSeconds !== segmentTarget && extraSeconds < 1) {
                extraSecondsRecordedRef.current = extraSeconds + 1;
                setExtraSecondsRecorded(extraSeconds + 1);
                console.log(
                  "info",
                  `⏱️ Adding extra second buffer for timing mismatch (extra=${extraSeconds + 1})`,
                );
                return;
              }
              console.log(
                "info",
                `✅ Segment complete at ${currentSeconds}s (target: ${segmentTarget}s, extra=${extraSeconds}), stopping recorder`,
              );
              processingSegmentCompletionRef.current = true; // Prevent detection loop from restarting
              clearInterval(timerIntervalRef.current);
              if (
                recorder.state === "recording" ||
                recorder.state === "paused"
              ) {
                recorder.stop();
              }
              // After stopping, guard will be cleared in onstop; prevent any parallel start attempts.
              return;
            }
          }
        }, 1000);

        console.log("info", "Starting MediaRecorder...");
        recorder.start(1000);
        console.log("info", "MediaRecorder started, state=", recorder.state);
      } catch (err) {
        showMessage(
          "statusMessage",
          "⚠️ Unable to start recording segment. Please try again.",
        );
        console.error("Failed to start recording:", err);
        // Ensure guard is cleared if start fails
        startingSegmentRef.current = false;
      }
    },
    [
      streamRef.current,
      currentSegment,
      segmentSecondsRecorded,
      segmentDurations,
      totalDuration,
      totalSegments,
      isRecording,
      isFaceDetected,
      isSegmentValid,
      recordedChunksPerSegment,
      showMessage,
      logService,
      setCompletedSegments,
      setVerificationDoneForSegment,
      setHeadTurnAttemptsPerSegment,
      setHeadVerificationCountPerSegment,
      setPartialSegmentBlobsPerSegment,
      setSegmentSecondsRecorded,
      setExtraSecondsRecorded,
      setIsSegmentValid,
      setIsRecording,
      setHeadTurnAttempts,
      setMediaRecorder,
      setTimeRemaining,
      setRecordedChunksPerSegment,
      shouldVerifyAfterSegment,
      checkDifferentFace,
      _resetAll,
    ],
  );

  // Export or use _startSegmentRecording in your component

  const _restartCurrentSegmentDueToFaceLoss: () => void = useCallback(() => {
    console.log(
      "info",
      "Attempting to restart current segment due to face loss.",
    );

    if (restartCooldownRef.current) {
      console.log("warn", "Restart called but cooldown active. Ignoring.");
      return;
    }

    restartCooldownRef.current = true;
    console.log("info", "Restart cooldown activated.");

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      stoppingForRestartRef.current = true;
      showMessage(
        "verificationMessage",
        "⚠️ Recording reset due to face loss. Continuing from current progress...",
      );
      console.log(
        "warn",
        "Recording reset due to face loss or quality issues.",
      );

      clearInterval(timerIntervalRef.current);
      console.log("info", "Timer interval cleared.");

      try {
        console.log(
          "info",
          `Stopping mediaRecorder. Current state: ${mediaRecorderRef.current.state}`,
        );
        mediaRecorderRef.current.stop();
        console.log("info", "MediaRecorder.stop() called successfully.");
      } catch (stopErr) {
        console.log(
          "error",
          `Error stopping mediaRecorder during restart: ${stopErr}`,
        );
      }
    } else {
      console.log(
        "info",
        "MediaRecorder not recording or undefined, skipping stop.",
      );
    }

    setTimeout(() => {
      restartCooldownRef.current = false;
      console.log("info", "Restart cooldown reset.");

      // Use ref to get correct current segment value
      const segment = currentSegmentRef.current || currentSegment;
      const segmentSeconds = segmentSecondsRecordedRef.current ?? 0;

      // Clear verification flags for this segment since we're restarting it
      verificationDoneForSegmentRef.current[segment] = false;
      verificationSuccessForSegmentRef.current[segment] = false;
      verificationTriggeredForSegmentRef.current[segment] = false;

      // Reset face mismatch counter to prevent false positives after restart
      faceMismatchCounterRef.current = 0;

      console.log(
        "info",
        `[Restart] Cleared verification flags for segment ${segment}, reset face mismatch counter`,
      );

      let resumeTime;

      if (
        segmentSeconds > 1 &&
        lastAdjustedSegmentSecondsRecordedRef.current !== segmentSeconds
      ) {
        // Subtract 1 only if segmentSeconds changed since last adjustment
        resumeTime = segmentSeconds - 1;
        lastAdjustedSegmentSecondsRecordedRef.current = resumeTime;
        console.log(
          "info",
          `Adjusted segmentSecondsRecorded by -1 for segment ${segment}`,
        );
      } else {
        // Otherwise, use the segmentSeconds as is (or 0)
        resumeTime = segmentSeconds;
      }

      console.log(
        "info",
        `Resuming recording from ${resumeTime}s for segment ${segment}.`,
      );

      if (
        !mediaRecorderRef.current ||
        mediaRecorderRef.current.state !== "recording"
      ) {
        console.log("info", "Starting segment recording after restart.");
        _startSegmentRecording(resumeTime);
      } else {
        console.log(
          "warn",
          "Attempted to restart recording but MediaRecorder is already recording.",
        );
      }
    }, 1000);
  }, [showMessage, segmentSecondsRecorded, currentSegment]);

  const showAndLogMessage = useCallback(
    (
      id: string,
      msg: string,
      level: "info" | "warn" | "error",
      loop: () => void,
    ): boolean => {
      showMessage(id, msg);
      console.log(level, msg);

      if (isRecording) {
        _restartCurrentSegmentDueToFaceLoss();
      }

      scheduleNext(loop);
      return true;
    },
    [
      showMessage,
      isRecording,
      _restartCurrentSegmentDueToFaceLoss,
      scheduleNext,
    ],
  );

  const checkMultipleFaces = useCallback(
    async (loop: () => void, options: any): Promise<boolean> => {
      /* Detects all faces and ensures only one is within the oval guide.
       * Warns user if multiple faces are detected */

      if (!videoRef.current) return false;

      const allFaces = await faceapi.detectAllFaces(videoRef.current, options);
      const oval = ovalRef.current;

      if (!oval) return false;

      const { cx, cy, rOuter } = oval;
      const biggerRadius = rOuter * 1.2;

      const facesInsideCircle = allFaces.filter((face) => {
        const centerX = face.box.x + face.box.width / 2;
        const centerY = face.box.y + face.box.height / 2;
        const dx = centerX - cx;
        const dy = centerY - cy;
        return Math.sqrt(dx * dx + dy * dy) <= biggerRadius;
      }).length;

      if (facesInsideCircle > 1) {
        multipleFacesDetectedRef.current = true;
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "recording"
        ) {
          try {
            mediaRecorderRef.current.pause();
            // Silent pause - background recording
            // showMessage('recordingMessage', '⏸️ Paused – multiple faces detected');
          } catch {}
        }
        return showAndLogMessage(
          "verificationMessage",
          "❌ Multiple faces detected. Ensure only one face remains.",
          "warn",
          loop,
        );
      } else {
        if (multipleFacesDetectedRef.current) {
          multipleFacesDetectedRef.current = false;
          showMessage("verificationMessage", "");
        }
      }

      return false;
    },
    [
      isRecording,
      isVerifyingHeadTurn,
      _restartCurrentSegmentDueToFaceLoss,
      showAndLogMessage,
      showMessage,
    ],
  );

  const getCurrentFrameAsMat = useCallback((): any => {
    try {
      if (!openCvReady || !(window as any).cv || !(window as any).cv.imread) {
        return null;
      }
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current!.videoWidth;
      canvas.height = videoRef.current!.videoHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(videoRef.current!, 0, 0, canvas.width, canvas.height);
      return (window as any).cv.imread(canvas);
    } catch (err) {
      console.error("Error reading frame for OpenCV:", err);
      return null;
    }
  }, [openCvReady]);

  const detectBrightSpot = useCallback((frame: any): string => {
    try {
      if (!openCvReady || !(window as any).cv || !frame) {
        return "";
      }
      // ==== Adjustable Parameters (tweak these for tuning detection) ====
      const BRIGHTNESS_THRESHOLD = 230; // Pixel brightness threshold (0-255), lower = more sensitive to bright spots
      const MIN_CONTOUR_AREA = 500; // Minimum contour area to consider (in pixels)
      const MAX_CONTOUR_AREA = 70000; // Maximum contour area to consider
      const MIN_RADIUS = 20; // Minimum radius of detected bright spot (in pixels)
      const MAX_RADIUS = 180; // Maximum radius of detected bright spot
      const CIRCULARITY_MIN = 0.3; // Minimum circularity (0-1+), 1 = perfect circle
      const CIRCULARITY_MAX = 1.3; // Maximum circularity threshold

      // ====================================================================

      const cvRef: any = (window as any).cv;
      let gray = new cvRef.Mat();
      cvRef.cvtColor(frame, gray, cvRef.COLOR_RGBA2GRAY);

      const height = gray.rows,
        width = gray.cols;
      const centerX = Math.floor(width / 2),
        centerY = Math.floor(height / 2);

      // Use rInner radius from oval or fallback
      const mainRadius =
        ovalRef.current?.rInner || Math.max(Math.min(centerX, centerY) - 10, 1);

      // Threshold bright areas based on adjustable brightness threshold
      let thresh = new cv.Mat();
      cv.threshold(gray, thresh, BRIGHTNESS_THRESHOLD, 255, cv.THRESH_BINARY);

      // Create circular mask centered on frame
      let mask = cv.Mat.zeros(gray.rows, gray.cols, cv.CV_8UC1);
      cv.circle(
        mask,
        new cv.Point(centerX, centerY),
        mainRadius,
        new cv.Scalar(255, 255, 255),
        -1,
      );

      let masked = new cv.Mat();
      cv.bitwise_and(thresh, mask, masked);

      // Find contours in masked bright areas
      let contours = new cv.MatVector();
      let hierarchy = new cv.Mat();
      cv.findContours(
        masked,
        contours,
        hierarchy,
        cv.RETR_EXTERNAL,
        cv.CHAIN_APPROX_SIMPLE,
      );

      let spotFound = false;
      for (let i = 0; i < contours.size(); i++) {
        let contour = contours.get(i);
        let area = cv.contourArea(contour);

        // Filter contours by adjustable area thresholds
        if (area < MIN_CONTOUR_AREA || area > MAX_CONTOUR_AREA) continue;

        let circle = cv.minEnclosingCircle(contour);
        let radius = circle.radius;
        let cx = circle.center.x;
        let cy = circle.center.y;

        // Filter by distance from center
        let dist = Math.sqrt((cx - centerX) ** 2 + (cy - centerY) ** 2);
        if (dist > mainRadius) continue;

        // Filter contours by adjustable radius range
        if (radius < MIN_RADIUS || radius > MAX_RADIUS) continue;

        let perimeter = cv.arcLength(contour, true);
        if (perimeter === 0) continue;

        let circularity = 4 * Math.PI * (area / (perimeter * perimeter));

        // Filter by adjustable circularity range
        if (circularity >= CIRCULARITY_MIN && circularity <= CIRCULARITY_MAX) {
          console.log(
            `[BrightnessCheck] Contour ${i} matched: area=${area}, radius=${radius}, circularity=${circularity.toFixed(2)}`,
          );
          spotFound = true;
          break;
        }
      }

      // Clean up mats to avoid memory leaks
      gray.delete();
      thresh.delete();
      mask.delete();
      masked.delete();
      contours.delete();
      hierarchy.delete();

      return spotFound ? "spot detected" : "no spot detected";
    } catch (err) {
      console.error("Bright spot detection error:", err);
      return "error";
    }
  }, []);

  const isVideoBlurred = useCallback((): boolean => {
    // This blur heuristic does not strictly require OpenCV, but if future logic depends on cv, guard here.
    if (!brightnessCtxRef.current || !openCvReady) return false;

    brightnessCtxRef.current.drawImage(
      videoRef.current!,
      0,
      0,
      brightnessCanvasRef.current!.width,
      brightnessCanvasRef.current!.height,
    );

    const imageData = brightnessCtxRef.current.getImageData(
      0,
      0,
      brightnessCanvasRef.current!.width,
      brightnessCanvasRef.current!.height,
    );
    const pixels = imageData.data;

    let sum = 0;
    let sumSq = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      sum += brightness;
      sumSq += brightness * brightness;
    }

    const mean = sum / (pixels.length / 4);
    const variance = sumSq / (pixels.length / 4) - mean * mean;

    return variance < 50; // tweak this threshold if needed
  }, [openCvReady]);

  const handleBrightnessChecks = useCallback(
    async (loop: () => void): Promise<boolean> => {
      const brightness = getFrameBrightness();
      console.log(
        "info",
        `[BrightnessCheck] Frame brightness: ${brightness}`,
        "brightness",
      );

      drawFaceGuideOverlay(brightness);

      if (isVideoBlank()) {
        if (isRecording) {
          _restartCurrentSegmentDueToFaceLoss();
        }
        console.log(
          "warn",
          "[BrightnessCheck] Camera feed appears blank.",
          "cameraError",
        );
        return showAndLogMessage(
          "cameraErrorMessage",
          "⚠️ Camera feed appears blank. Check your camera or refresh the page.",
          "warn",
          loop,
        );
      }

      const mat = getCurrentFrameAsMat();
      let showWarning = false;

      if (mat) {
        const result = detectBrightSpot(mat);
        console.log(
          "info",
          `[BrightnessCheck] Bright spot detection result: ${result}`,
          "brightness",
        );
        mat.delete();

        if (result === "spot detected") {
          showWarning = true;
        }
      } else {
        if (!openCvFrameWarningShownRef.current) {
          console.log(
            "warn",
            "[BrightnessCheck] Failed to get current frame as Mat (OpenCV not ready). Suppressing further warnings.",
            "cameraError",
          );
          openCvFrameWarningShownRef.current = true;
        }
      }

      if (showWarning) {
        if (isRecording && !isVerifyingHeadTurn) {
          _restartCurrentSegmentDueToFaceLoss();
        }
        console.log(
          "warn",
          "[BrightnessCheck] Bright spot detected in the oval.",
          "brightnessWarning",
        );
        return showAndLogMessage(
          "brightnessMessage",
          "⚠️ Bright spot detected in the oval. Please adjust lighting or avoid reflections.",
          "warn",
          loop,
        );
      }

      if (brightness < 60) {
        if (isRecording && !isVerifyingHeadTurn) {
          _restartCurrentSegmentDueToFaceLoss();
        }
        console.log(
          "warn",
          "[BrightnessCheck] Too dark environment detected.",
          "brightnessWarning",
        );
        return showAndLogMessage(
          "brightnessMessage",
          "🌑 Too dark — please move to a brighter place.",
          "warn",
          loop,
        );
      } else if (brightness > 180) {
        if (isRecording && !isVerifyingHeadTurn) {
          _restartCurrentSegmentDueToFaceLoss();
        }
        console.log(
          "warn",
          "[BrightnessCheck] Too bright environment detected.",
          "brightnessWarning",
        );
        return showAndLogMessage(
          "brightnessMessage",
          "☀️ Too bright — reduce lighting.",
          "warn",
          loop,
        );
      } else {
        console.log(
          "info",
          "[BrightnessCheck] Brightness is within acceptable range.",
          "brightness",
        );
        showMessage("brightnessMessage", "");
      }

      showMessage("cameraErrorMessage", "");

      if (isVideoBlurred()) {
        if (isRecording && !isVerifyingHeadTurn) {
          _restartCurrentSegmentDueToFaceLoss();
        }
        console.log(
          "warn",
          "[BrightnessCheck] Video is blurry detected.",
          "blurWarning",
        );
        return showAndLogMessage(
          "dashedCircleAlignMessage",
          "🔍 Video is blurry. Clean your camera lens or adjust focus.",
          "warn",
          loop,
        );
      }

      console.log(
        "info",
        "[BrightnessCheck] No issues detected in current frame.",
        "status",
      );
      return false;
    },
    [
      getFrameBrightness,
      drawFaceGuideOverlay,
      isVideoBlank,
      isRecording,
      _restartCurrentSegmentDueToFaceLoss,
      showAndLogMessage,
      getCurrentFrameAsMat,
      detectBrightSpot,
      isVerifyingHeadTurn,
      showMessage,
      isVideoBlurred,
      overallProgressPercentage,
    ],
  );

  const detectSingleFaceWithLandmarks = useCallback(
    async (options: any): Promise<void> => {
      /* Detects a single face and extracts its landmarks and bounding box. */

      if (!videoRef.current) return;

      const res = await faceapi
        .detectSingleFace(videoRef.current, options)
        .withFaceLandmarks();

      lastLandmarksRef.current = res?.landmarks ?? null;
      lastBoxRef.current = res?.detection?.box ?? null;
    },
    [],
  );

  const areLandmarksFullyInsideOval = useCallback(
    (landmarks: faceapi.FaceLandmarks68): boolean => {
      const oval = ovalRef.current;
      if (!oval || !landmarks) return false;

      const { cx, cy, rOuter } = oval;
      const detectionRadius = rOuter * 1.2;

      return landmarks.positions.every((pt) => {
        const dx = pt.x - cx;
        const dy = pt.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist <= detectionRadius;
      });
    },
    [],
  );

  const handleFaceAlignment = useCallback(
    async (_loop: () => void): Promise<[boolean, boolean]> => {
      /* Validates face alignment inside oval, size constraints, and triggers recording. */
      const box = lastBoxRef.current;
      const landmarks = lastLandmarksRef.current;
      const oval = ovalRef.current;

      if (!box || !landmarks || !oval) {
        return [false, false];
      }

      const fillPct = (box.height / oval.h) * 100;

      // Rolling buffer smoothing
      fillBufferRef.current.push(fillPct);
      if (fillBufferRef.current.length > smoothingWindow) {
        fillBufferRef.current.shift();
      }

      const smoothedFill =
        fillBufferRef.current.reduce((a, b) => a + b, 0) /
        fillBufferRef.current.length;

      const lowerBound = 55;
      const upperBound = 80;
      let sizeOK = false;

      if (smoothedFill < lowerBound) {
        showMessage("distanceMessage", "📏 Please move closer to the camera.");
      } else if (smoothedFill > upperBound) {
        showMessage(
          "distanceMessage",
          "📏 Please move slightly farther away from the camera.",
        );
      } else {
        sizeOK = true;
        showMessage("distanceMessage", "");
      }

      const faceInside = areLandmarksFullyInsideOval(landmarks);
      showMessage(
        "ovalAlignMessage",
        faceInside ? "✅ Yay! Your face is perfectly inside the oval! 🎉" : "",
      );

      return [faceInside, sizeOK];
    },
    [showMessage, areLandmarksFullyInsideOval],
  );

  // Place this inside your React component:
  const startRecording_FaceReference = useCallback(async (): Promise<void> => {
    /**
     * Starts a new recording session.
     * - Resets all recording-related states and flags.
     * - Requires a currently detected face; otherwise asks user to align.
     * - Attempts to capture a reference face descriptor for verification.
     * - Initializes the first segment index.
     */

    // Reset previously completed recording segments and face verification data
    setCompletedSegments([]);
    setHeadTurnBlob(null); // ← Uses state setter
    setHeadTurnVerified(false);
    setHeadTurnAttemptStatus("");
    setShowHeadTurnPrompt(false);
    referenceFaceDescriptorRef.current = null; // reset reference face for new session
    // Reset verification/processing flags to avoid sticky deferrals
    verificationInProgressRef.current = false;
    verificationPendingRef.current = false;
    processingSegmentCompletionRef.current = false;
    isVerifyingHeadTurnRef.current = false;
    recordingFlagRef.current = 0;
    // Clear prior success/failure tracking
    verificationSuccessForSegmentRef.current = {};

    // Ensure a face is detected before starting recording; use ref to avoid React state timing/race issues
    if (!isFaceDetectedRef.current) {
      showMessage(
        "statusMessage",
        "🙋 Please align your face inside the circle and adjust distance before starting.",
      );
      console.log("info", "Attempted to start recording but no face detected.");
      return;
    }

    try {
      // Try to detect a single face and capture its descriptor for reference
      const videoEl = videoRef.current;
      if (!videoEl) {
        console.log(
          "warn",
          "Video element not ready while capturing reference face.",
        );
      } else {
        const detection = await faceapi
          .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        // If descriptor successfully captured, store it and log success
        if (detection && detection.descriptor) {
          referenceFaceDescriptorRef.current = detection.descriptor;
          console.log("info", "✅ Reference face captured");
          frameCountRef.current += 1;
          console.log("Capturing frame", frameCountRef.current);
        } else {
          // If face detection failed or was unclear, warn user but continue recording
          console.log(
            "warn",
            "⚠️ Face not detected clearly; continuing without reference descriptor",
          );
          showMessage(
            "statusMessage",
            "⚠️ Face not detected clearly. Please adjust position.",
          );
        }
      }
    } catch (err: any) {
      // Handle any errors thrown by FaceAPI and notify user
      console.log(
        "error",
        `❌ FaceAPI error while capturing reference face: ${err?.message || err}`,
      );
      showMessage(
        "statusMessage",
        "⚠️ Error detecting face, continuing with recording.",
      );
    }

    // Initialize current segment number for segmented recording (only if not already started)
    if (!currentSegmentRef.current || currentSegmentRef.current <= 0) {
      setCurrentSegment(1);
      currentSegmentRef.current = 1; // ✅ Keep both in sync
    }
  }, [
    setCompletedSegments,
    setHeadTurnBlob, // ← Added to dependencies
    setHeadTurnVerified,
    setHeadTurnAttemptStatus,
    setShowHeadTurnPrompt,
    videoRef,
    referenceFaceDescriptorRef,
    frameCountRef,
    currentSegmentRef,
    showMessage,
  ]);

  const handleNoFaceDetected = useCallback(
    (loop: () => void): void => {
      setIsFaceDetected(false);
      isFaceDetectedRef.current = false; // ✅ Sync ref
      insideOvalFramesRef.current = 0;

      if (isRecording && !isVerifyingHeadTurn) {
        _restartCurrentSegmentDueToFaceLoss();
      }

      // logServiceRef.current?.log('info', 'No face detected in the current frame.');
    },
    [isRecording, isVerifyingHeadTurn, _restartCurrentSegmentDueToFaceLoss],
  );

  const startDetectionRAF = useCallback(() => {
    // logService.log('info', '🔄 Starting face detection loop...');
    const options = new faceapi.TinyFaceDetectorOptions();

    const loop = async () => {
      // Stop detection loop immediately if session is completed
      if (sessionCompletedRef.current || autoStartDisabledRef.current) {
        console.log("info", "[Detection] Loop stopped - session completed");
        return;
      }

      // Validate camera and video readiness
      if (!validateCameraAndVideo(loop)) return;

      // Ensure oval guide is initialized
      if (!validateOval(loop)) return;

      frameCountRef.current++;

      // Perform brightness and image quality checks at intervals
      if (frameCountRef.current % BRIGHT_EVERY === 0) {
        if (await handleBrightnessChecks(loop)) return;
      }

      // Detect all faces periodically to check for multiple faces
      if (frameCountRef.current % DETECT_EVERY === 0) {
        if (await checkMultipleFaces(loop, options)) return;
        await detectSingleFaceWithLandmarks(options);
      }

      // Analyze face position, size, and alignment
      if (lastBoxRef.current && lastLandmarksRef.current) {
        const [faceInside, sizeOK] = await handleFaceAlignment(loop);

        if (sizeOK && faceInside) {
          insideOvalFramesRef.current++;
          showMessage("dashedCircleAlignMessage", "");

          if (insideOvalFramesRef.current >= requiredFrames) {
            // showMessage('statusMessage', '✅ Perfect! Stay still inside the dashed circle.');
            setIsFaceDetected(true);
            isFaceDetectedRef.current = true;

            await checkDifferentFace();

            const recorderActive =
              mediaRecorderRef.current &&
              (mediaRecorderRef.current.state === "recording" ||
                mediaRecorderRef.current.state === "paused");

            console.log(
              "info",
              `Recording flag: ${recordingFlagRef.current}, isRecording: ${isRecording}, recorderState: ${mediaRecorderRef.current?.state || "none"}`,
            );
            // Use ref-based isRecording for more accurate immediate state
            console.log(
              "debug",
              `Ref states -> isRecordingRef=${isRecordingRef.current}, startingGuard=${startingSegmentRef.current}`,
            );
            console.log(
              "info",
              `Recording flag: ${recordingFlagRef.current}, isRecording(state)=${isRecording}, isRecording(ref)=${isRecordingRef.current}, recorderState: ${mediaRecorderRef.current?.state || "none"}`,
            );

            // Prevent auto start when session is completed
            if (sessionCompletedRef.current || autoStartDisabledRef.current) {
              return; // Do nothing after session completion until manual reset
            }

            if (processingSegmentCompletionRef.current) {
              console.log(
                "info",
                "⏳ Processing segment completion, not starting new recording",
              );
              return;
            }

            if (recordingFlagRef.current === 0 && !recorderActive) {
              // Prevent starting new segment while verification is pending/running or segment completion processing
              if (
                isVerifyingHeadTurnRef.current ||
                verificationInProgressRef.current ||
                verificationPendingRef.current ||
                processingSegmentCompletionRef.current
              ) {
                console.log("info", "Deferring segment start. Flags:", {
                  isVerifyingHeadTurn: isVerifyingHeadTurnRef.current,
                  verificationInProgress: verificationInProgressRef.current,
                  verificationPending: verificationPendingRef.current,
                  processingSegmentCompletion:
                    processingSegmentCompletionRef.current,
                  recordingFlag: recordingFlagRef.current,
                  currentSegment: currentSegmentRef.current,
                });
              } else {
                // Only initialize face reference and segment index if this is the first start
                if (
                  !currentSegmentRef.current ||
                  currentSegmentRef.current <= 0
                ) {
                  startRecording_FaceReference();
                }
                // Show a head-turn prompt BEFORE starting recording
                if (prePromptInProgressRef.current) {
                  return;
                }
                const segToStart = currentSegmentRef.current || 1;
                // Pick direction consistent with later verification and store it
                let chosen: "up" | "down" | "left" | "right";
                if (segToStart === 1) {
                  // Exclude 'forward' from pre-prompt random selection
                  chosen = ((): "up" | "down" | "left" | "right" => {
                    const dir = getRandomDirection([]);
                    return dir === "forward" ? "up" : dir; // fallback if forward appears
                  })();
                  setFirstVerificationDirection(chosen);
                } else if (segToStart === 2) {
                  chosen = ((): "up" | "down" | "left" | "right" => {
                    const baseExclude = [firstVerificationDirection!].filter(
                      Boolean,
                    ) as any;
                    const dir = getRandomDirection(baseExclude);
                    return dir === "forward" ? "right" : dir;
                  })();
                  setSecondVerificationDirection(chosen);
                } else {
                  const exclude: any[] = [];
                  if (firstVerificationDirection)
                    exclude.push(firstVerificationDirection);
                  if (secondVerificationDirection)
                    exclude.push(secondVerificationDirection);
                  chosen = ((): "up" | "down" | "left" | "right" => {
                    const dir = getRandomDirection(exclude as any);
                    return dir === "forward" ? "left" : dir;
                  })();
                  setThirdVerificationDirection(chosen);
                }
                plannedVerificationDirectionRef.current[segToStart] = chosen;
                setDirection(chosen);
                setShowHeadTurnPrompt(true);
                startBlinking(chosen);
                showMessage(
                  "headTurnAttemptStatus",
                  `Please ${chosen === "left" ? "turn your head LEFT" : chosen === "right" ? "turn your head RIGHT" : chosen === "up" ? "tilt your head UP" : "tilt your head DOWN"} and KEEP it there — recording will start now.`,
                );
                prePromptInProgressRef.current = true;
                setTimeout(async () => {
                  stopBlinking();
                  setShowHeadTurnPrompt(false);
                  console.log(
                    "info",
                    "��� Starting recording after head-turn prompt...",
                  );
                  recordingFlagRef.current = 1;
                  try {
                    await _startSegmentRecording();
                  } catch (err) {
                    console.log(
                      "error",
                      `❌ Error starting segment recording: ${err}`,
                    );
                    recordingFlagRef.current = 0;
                  } finally {
                    prePromptInProgressRef.current = false;
                  }
                }, 1200);
              }
            } else if (recordingFlagRef.current === 1 && !recorderActive) {
              // Flag is set but recording isn't active - this happens due to React state timing
              // Don't reset immediately, give the recorder a moment to start
              console.log("info", "Waiting for recorder to start...");
            }
          }
        } else {
          insideOvalFramesRef.current = 0;
          setIsFaceDetected(false);
          isFaceDetectedRef.current = false; // ✅ Sync ref

          if (isRecording && !isVerifyingHeadTurn) {
            _restartCurrentSegmentDueToFaceLoss();
          }

          // User guidance based on alignment
          if (!sizeOK && !faceInside) {
            console.log(
              "dashedCircleAlignMessage",
              "🧭 Make sure your full face is inside the dashed circle and adjust distance.",
            );
          } else if (!faceInside) {
            console.log(
              "dashedCircleAlignMessage",
              "🧭 Your entire face must be inside the dashed circle.",
            );
          } else {
            console.log("dashedCircleAlignMessage", "");
          }
        }
      } else {
        handleNoFaceDetected(loop);
      }

      // Schedule the next frame detection
      scheduleNext(loop);
    };

    // Start the detection loop
    scheduleNext(loop);
  }, [
    validateCameraAndVideo,
    validateOval,
    handleBrightnessChecks,
    checkMultipleFaces,
    detectSingleFaceWithLandmarks,
    handleFaceAlignment,
    showMessage,
    checkDifferentFace,
    startRecording_FaceReference,
    _startSegmentRecording,
    handleNoFaceDetected,
    _restartCurrentSegmentDueToFaceLoss,
    scheduleNext,
    BRIGHT_EVERY,
    DETECT_EVERY,
    requiredFrames,
  ]);

  const startCamera = useCallback(async () => {
    try {
      const videoEl = videoRef.current;
      const overlayCanvas = overlayRef.current;

      if (!videoEl || !overlayCanvas) {
        // Replace with your logger or UI message
        // logService.log('error', 'Video or overlay element not available');
        setCameraErrorMessage("⚠️ Video or overlay element not available.");
        return;
      }

      // logService.log('info', 'Starting camera...');
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
      videoEl.srcObject = stream;
      await videoEl.play();

      // logService.log('info', 'Camera stream acquired and video playback started.');

      // Check actual video settings
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length) {
        const settings = videoTracks[0].getSettings();
        // logService.log('debug', `Camera settings: ${JSON.stringify(settings)}`);

        if (
          (settings.width && settings.width < 400) ||
          (settings.height && settings.height < 300)
        ) {
          setCameraErrorMessage(
            "⚠️ Low camera resolution. Face detection may not work properly.",
          );
          // logService.log('warn', 'Low camera resolution detected.');
        }

        if (settings.frameRate && settings.frameRate < 15) {
          setCameraErrorMessage(
            "⚠️ Low frame rate. Detection quality may be affected.",
          );
          // logService.log('warn', 'Low frame rate detected.');
        }
      }

      // Check measured FPS (keep your helper; don’t inline logic here)
      const fps = await checkCameraFPS();
      // logService.log('debug', `Measured camera FPS: ${fps}`);
      if (fps < 10) {
        setCameraErrorMessage(
          "⚠️ Camera FPS is too low for reliable detection.",
        );
        // logService.log('warn', 'Camera FPS too low.');
      }

      // Validate stream binding
      if (!videoEl.srcObject || !(videoEl.srcObject instanceof MediaStream)) {
        const msg =
          "⚠️ Camera not providing video. Try refreshing or switching device.";
        setCameraErrorMessage(msg);
        // logService.log('error', msg);
        return;
      }

      setIsCameraOn(true);
      setRecordingMessage("📷 Camera started successfully.");

      // check resolution (keep your existing helper)
      checkVideoResolution();

      // Setup overlay + brightness canvas
      const setupOverlay = () => {
        const w = videoEl.videoWidth || 640;
        const h = videoEl.videoHeight || 480;

        overlayCanvas.width = w;
        overlayCanvas.height = h;

        // update oval guide (same math as Angular)
        ovalRef.current.w = w * 0.5;
        ovalRef.current.h = h * 0.6;
        ovalRef.current.cx = w / 2;
        ovalRef.current.cy = h / 2;

        // brightness offscreen canvas
        if (!brightnessCanvasRef.current) {
          brightnessCanvasRef.current = document.createElement("canvas");
        }
        brightnessCanvasRef.current.width = w;
        brightnessCanvasRef.current.height = h;
        // Use willReadFrequently to optimize repeated getImageData calls; cast safely
        const ctx = brightnessCanvasRef.current.getContext("2d", {
          willReadFrequently: true,
        } as any);
        brightnessCtxRef.current = ctx as CanvasRenderingContext2D | null;

        // logService.log('debug', `Overlay and brightness canvas set up with dimensions: ${w}x${h}`);
      };

      setupOverlay();
      videoEl.addEventListener("loadedmetadata", setupOverlay, { once: true });

      // Segment durations and detection loop
      generateSegmentDurations();
      startDetectionRAF();
      // logService.log('info', 'Started detection loop via requestAnimationFrame.');
      console.log("info", "Started detection loop via requestAnimationFrame.");
    } catch (err: any) {
      const name = err?.name;
      const msg =
        name === "NotAllowedError"
          ? "❌ Camera permission denied. Please allow access and refresh."
          : name === "NotFoundError"
            ? "⚠️ No camera found on this device."
            : "⚠️ Failed to access the camera. Try again.";

      setCameraErrorMessage(msg);
      // logService.log('error', `Camera initialization failed: ${err?.message || err}`);
      setIsCameraOn(false);
    }
  }, [
    videoRef,
    overlayRef,
    setIsCameraOn,
    setRecordingMessage,
    setCameraErrorMessage,
    // If these are stable (useCallback) you can include them too:
    generateSegmentDurations,
    startDetectionRAF,
  ]);

  const checkCameraFPS = useCallback((): Promise<number> => {
    return new Promise<number>((resolve) => {
      let frameCount = 0;
      let startTime = performance.now();

      const countFrame = () => {
        frameCount++;
        const elapsed = performance.now() - startTime;
        if (elapsed >= 1000) {
          resolve(frameCount);
        } else {
          requestAnimationFrame(countFrame);
        }
      };

      countFrame();
    });
  }, []);

  const checkVideoResolution = useCallback(() => {
    if (!videoRef.current) return;

    const width = videoRef.current.videoWidth;
    const height = videoRef.current.videoHeight;

    console.log(`📷 Video resolution: ${width}x${height}`);
    if (width < 400 || height < 300) {
      console.log(
        "cameraErrorMessage",
        "⚠️ Low camera resolution. Face detection may not work properly.",
      );
    }
  }, []);

  return (
    <div className="selfie-app-root">
      <h3 className="note">
        ⚠️ Please remove any accessories on your face (e.g. glasses)
      </h3>

      {/* Error messages only, positioned above video and below 'remove any accessories' */}
      {(cameraErrorMessage || brightnessMessage || verificationMessage) && (
        <div
          className="selfie-error-messages"
          style={{ margin: "12px 0", textAlign: "center" }}
        >
          {cameraErrorMessage && (
            <div
              className="selfie-error-message"
              style={{ color: "#dc2626", fontWeight: 600 }}
            >
              {cameraErrorMessage}
            </div>
          )}
          {brightnessMessage && (
            <div
              className="selfie-error-message"
              style={{ color: "#dc2626", fontWeight: 600 }}
            >
              {brightnessMessage}
            </div>
          )}
          {verificationMessage &&
            verificationMessage.toLowerCase().includes("error") && (
              <div
                className="selfie-error-message"
                style={{ color: "#dc2626", fontWeight: 600 }}
              >
                {verificationMessage}
              </div>
            )}
        </div>
      )}

      {isVerifyingHeadTurn && (
        <h3 className="head-turn-instruction">
          👤 Move your head toward the{" "}
          <span style={{ color: "rgb(35, 27, 148)" }}>blinking arc</span> and
          hold
        </h3>
      )}

      <div className="selfie-video-wrapper">
        <div className="selfie-video-container">
          <div className="selfie-video-area">
            {capturedFrameUrl ? (
              <div className="selfie-captured-frame-wrapper">
                <img
                  src={capturedFrameUrl}
                  alt="Captured frame"
                  className="selfie-captured-frame"
                />
                <div className="selfie-frame-overlay"></div>
              </div>
            ) : (
              <>
                <video ref={videoRef} autoPlay playsInline muted />
                <canvas ref={overlayRef} />
                <div className="oval-overlay"></div>
              </>
            )}
          </div>

          {capturedFrameUrl && (
            <div className="selfie-capture-complete-message">
              <p>Capture complete</p>
            </div>
          )}

          {isRecording && (
            <div className="selfie-recording-panel">
              <div className="info">
                {!isCameraOn && <p>📷 Start the camera to begin.</p>}
                {isCameraOn &&
                  !isRecording &&
                  completedSegments.length < totalSegments && (
                    <p>
                      ✔ Ready – Keep your face inside the oval (75���85%
                      height), then hit <strong>Start</strong>.
                    </p>
                  )}
              </div>
              <p>⏺️ Recording </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile status message */}
      {isMobile && mobileStatusMessage && (
        <div className="selfie-mobile-status-message">
          {mobileStatusMessage}
        </div>
      )}

      {/* Post-record */}
      {!isRecording && completedSegments.length === totalSegments && (
        <div className="post-record">
          <p>
            ✅ All {totalSegments} segments recorded.
            <br />
            Please complete <strong>head-turn verification</strong> before
            download.
          </p>
        </div>
      )}

      {/* Face Mismatch Modal */}
      {/* {showFaceMismatchModal && (
        <div className="face-mismatch-modal">
          <div className="modal-content">
            <h2>Face Mismatch</h2>
            <p>❌ Different face detected. Please ensure the same person stays in view.</p>
            <button onClick={closeFaceMismatchModal}>OK</button>
          </div>
        </div>
      )} */}

      {/* Log Controls */}
      {/* <div>
        <div className="log-container"></div>
        <label htmlFor="logLevel">Log Level:</label>
        <select onChange={onLogLevelChange} defaultValue="debug">
          <option value="error">Error</option>
          <option value="info">Info</option>
          <option value="warn">Warn</option>
          <option value="debug">Debug</option>
        </select>
        <button onClick={simulateError}>Simulate Error</button>
        <button onClick={downloadLogs}>Download Logs</button>
      </div> */}

      <pre>{logs}</pre>

      {/* Success Overlay */}
      {showSuccessScreen && (
        <div className="selfie-success-overlay">
          <div className="selfie-success-message">
            <h1>✅ Successfully Completed</h1>
            <p>Your video segments have been verified and downloaded.</p>
          </div>
        </div>
      )}
    </div>
  );
}

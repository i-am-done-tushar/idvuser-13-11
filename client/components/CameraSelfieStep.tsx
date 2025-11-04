import React, { useCallback, useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import * as tf from "@tensorflow/tfjs";

// declare OpenCV global similar to Angular's `declare var cv: any;`:
declare const cv: any;

/* ---------------- Types mirrored from Angular ---------------- */
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
export type LogLevel = "debug" | "info" | "warn" | "error";

/* --------------- Lightweight LogService equivalent ------------ */
class LogService {
  private level: LogLevel = "debug";
  private buffer: string[] = [];
  setLogLevel(lvl: LogLevel) {
    this.level = lvl;
  }
  getLogs() {
    return this.buffer.join("\n");
  }
  log(level: LogLevel, message: string, _category?: string) {
    const order: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
    if (order[level] >= order[this.level]) {
      const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;
      this.buffer.push(line);
      // eslint-disable-next-line no-console
      (console as any)[level === "debug" ? "log" : level](line);
    }
  }
  downloadLogs() {
    const blob = new Blob([this.getLogs()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

/* ------------------------ Props ------------------------ */
interface CameraSelfieStepProps {
  userId: number; // @Input()
  onComplete?: (n: number) => void; // @Output() stepComplete
}

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080";

/* ---------------------- Component ---------------------- */
export default function CameraSelfieStep({ userId, onComplete }: CameraSelfieStepProps) {

  const isStartingCameraRef = useRef(false);

  /* services & element refs */
  const logServiceRef = useRef(new LogService());
  const logService = logServiceRef.current;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);

  /* mirrors Angular private fields as refs */
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const headMediaRecorderRef = useRef<MediaRecorder | null>(null);

  const referenceFaceDescriptorRef = useRef<Float32Array | null>(null);

  const brightnessCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const brightnessCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const currentBrightnessRef = useRef<number>(100);

  const ovalRef = useRef<FaceGuideOval>({ cx: 0, cy: 0, rOuter: 0, rInner: 0, w: 0, h: 0 });
  const ovalProgressRef = useRef<number>(0);

  const rafIdRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);
  const DETECT_EVERY = useRef<number>(1);
  const BRIGHT_EVERY = useRef<number>(6);
  const insideOvalFramesRef = useRef<number>(0);
  const requiredFramesRef = useRef<number>(3);
  const recordedFrameCountRef = useRef<number>(0);
  const lastLandmarksRef = useRef<faceapi.FaceLandmarks68 | null>(null);
  const lastBoxRef = useRef<faceapi.Box | null>(null);

  const blinkClosedRef = useRef<boolean>(false);
  const blinkCountRef = useRef<number>(0);
  const baselineEARsRef = useRef<number[]>([]);
  const prevEARRef = useRef<number | undefined>(undefined);
  const minEARRef = useRef<number>(Number.POSITIVE_INFINITY);
  const maxEARRef = useRef<number>(Number.NEGATIVE_INFINITY);

  const lastYawRef = useRef<number | undefined>(undefined);
  const lastPitchRef = useRef<number | undefined>(undefined);

  const verificationDoneForSegmentRef = useRef<Record<number, boolean>>({});
  const verificationTriggeredForSegmentRef = useRef<Record<number, boolean>>({});
  const verificationSuccessForSegmentRef = useRef<Record<number, boolean>>({});
  const performVerificationForCurrentSegmentRef = useRef<boolean>(false);
  const verificationTimeInSegmentRef = useRef<number>(0);
  const firstVerificationDirectionRef = useRef<"up" | "down" | "left" | "right" | null>(null);
  const secondVerificationDirectionRef = useRef<"up" | "down" | "left" | "right" | null>(null);
  const thirdVerificationDirectionRef = useRef<"up" | "down" | "left" | "right" | null>(null);
  const triggerVerification3Ref = useRef<boolean>(false);

  const blinkingDirectionRef = useRef<"left" | "right" | "up" | "down" | null>(null);
  const blinkVisibleRef = useRef<boolean>(false);
  const blinkIntervalIdRef = useRef<number | null>(null);

  const recordingFlagRef = useRef<number>(0);
  const isSegmentValidRef = useRef<boolean>(true);
  const fillBufferRef = useRef<number[]>([]);
  const smoothingWindowRef = useRef<number>(5);
  const faceMismatchCounterRef = useRef<number>(0);
  const faceMismatchThresholdRef = useRef<number>(3);

  const headTurnDirectionRef = useRef<"left" | "right" | "up" | "down" | undefined>(undefined);
  const headTurnAttemptsRef = useRef<number>(0);
  const maxHeadTurnAttemptsRef = useRef<number>(2);
  const headTurnAttemptsPerSegmentRef = useRef<Record<number, number>>({});
  const headTurnVerifiedRef = useRef<boolean>(false);
  const HeadTurnRecordingDoneRef = useRef<boolean>(false);
  const HeadTurnRecordingFailedRef = useRef<boolean>(false);
  const headVerificationCountPerSegmentRef = useRef<Record<number, number>>({});
  const isVerifyingHeadTurnRef = useRef<boolean>(false);
  const VerificationStatusRef = useRef<boolean>(false);

  const partialSegmentBlobsPerSegmentRef = useRef<Record<number, PartialSegmentBlob[]>>({});
  const segmentSubPartsRef = useRef<Record<number, SegmentSubPart[]>>({});
  const currentSubPartStartTimeRef = useRef<number>(0);
  const currentSessionStartTimeRef = useRef<number>(0);
  const stoppingForRestartRef = useRef<boolean>(false);
  const restartCooldownRef = useRef<boolean>(false);
  const lastAdjustedSegmentSecondsRecordedRef = useRef<number | null>(null);

  const completedSegmentsRef = useRef<Blob[]>([]);
  const recordedChunksPerSegmentRef = useRef<Record<number, Blob[]>>({});

  const timerIntervalRef = useRef<number | null>(null);

  const totalDurationRef = useRef<number>(10);
  const totalSegmentsRef = useRef<number>(3);
  const segmentDurationsRef = useRef<number[]>([]);
  const currentSegmentRef = useRef<number>(0);
  const segmentSecondsRecordedRef = useRef<number>(0);
  const extraSecondsRecordedRef = useRef<number>(0);
  const headSegmentSecondsRecordedRef = useRef<number>(0);

  const headRecordedChunksRef = useRef<Blob[]>([]);
  const headTurnBlobRef = useRef<Blob | null>(null);

  const messageCooldownsRef = useRef<Record<string, boolean>>({});

  /* ------------------ UI states (Angular bindings) ------------------ */
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
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [selectedLevel, setSelectedLevel] = useState<LogLevel>("debug");
  const [logs, setLogs] = useState("");
  const [headTurnAttemptStatus, setHeadTurnAttemptStatus] = useState("");
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showHeadTurnPrompt, setShowHeadTurnPrompt] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | "up" | "down" | null>(null);
  const [overlaySize, setOverlaySize] = useState({ width: 640, height: 480 });
  const [cvReady, setCvReady] = useState(false);



  /* to match Angular's getter/setter by key in showMessage */
  const setByKey = useCallback((key: string, value: string) => {
    switch (key) {
      case "statusMessage":
        setStatusMessage(value);
        break;
      case "dashedCircleAlignMessage":
        setDashedCircleAlignMessage(value);
        break;
      case "cameraErrorMessage":
        setCameraErrorMessage(value);
        break;
      case "brightnessMessage":
        setBrightnessMessage(value);
        break;
      case "ovalAlignMessage":
        setOvalAlignMessage(value);
        break;
      case "distanceMessage":
        setDistanceMessage(value);
        break;
      case "recordingMessage":
        setRecordingMessage(value);
        break;
      case "verificationMessage":
        setVerificationMessage(value);
        break;
      case "headTurnAttemptStatus":
        setHeadTurnAttemptStatus(value);
        break;
      case "mobileStatusMessage":
        setMobileStatusMessage(value);
        break;
      default:
        setStatusMessage(value);
        break;
    }
  }, []);
  const getByKey = useCallback(
    (key: string): string => {
      switch (key) {
        case "statusMessage":
          return statusMessage;
        case "dashedCircleAlignMessage":
          return dashedCircleAlignMessage;
        case "cameraErrorMessage":
          return cameraErrorMessage;
        case "brightnessMessage":
          return brightnessMessage;
        case "ovalAlignMessage":
          return ovalAlignMessage;
        case "distanceMessage":
          return distanceMessage;
        case "recordingMessage":
          return recordingMessage;
        case "verificationMessage":
          return verificationMessage;
        case "headTurnAttemptStatus":
          return headTurnAttemptStatus;
        case "mobileStatusMessage":
          return mobileStatusMessage;
        default:
          return statusMessage;
      }
    },
    [
      statusMessage,
      dashedCircleAlignMessage,
      cameraErrorMessage,
      brightnessMessage,
      ovalAlignMessage,
      distanceMessage,
      recordingMessage,
      verificationMessage,
      headTurnAttemptStatus,
      mobileStatusMessage,
    ]
  );

  /* ---------------------- UI Helpers ---------------------- */
  const showMessage = useCallback(
    (
      key: string,
      msg: unknown,
      autoHide = false,
      duration = 2000,
      cooldownDuration = 1000
    ) => {
      if (
        !key ||
        ![
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
        ].includes(key)
      ) {
        // eslint-disable-next-line no-console
        console.warn(
          `âš ï¸ Unknown or empty message key provided: ${key}. Falling back to 'statusMessage'.`
        );
        key = "statusMessage";
      }

      let text: string;
      try {
        if (typeof msg === "string") text = msg;
        else if (msg === null || msg === undefined) text = "";
        else if (typeof msg === "object") text = JSON.stringify(msg);
        else text = String(msg);
      } catch {
        text = String(msg);
      }

      const cooldowns = messageCooldownsRef.current;
      if (cooldowns[key]) return;

      const currentVal = getByKey(key);
      if (currentVal === text) return;

      if (isMobile) {
        setMobileStatusMessage(text);
        setByKey(key, "");
      } else {
        setByKey(key, text);
        setMobileStatusMessage("");
      }

      if (autoHide) {
        window.setTimeout(() => {
          if (getByKey(key) === text) {
            setByKey(key, "");
            if (isMobile && mobileStatusMessage === text) setMobileStatusMessage("");
            cooldowns[key] = true;
            window.setTimeout(() => {
              cooldowns[key] = false;
            }, cooldownDuration);
          }
        }, duration);
      }
    },
    [getByKey, isMobile, mobileStatusMessage, setByKey]
  );

  const showAndLogMessage = useCallback(
    (id: string, msg: string, level: LogLevel, loop: () => void): boolean => {
      showMessage(id, msg);
      logService.log(level, msg);
      if (isRecordingRef.current) _restartCurrentSegmentDueToFaceLoss();
      _scheduleNext(loop);
      return true;
    },
    [logService, showMessage]
  );

  const showModal = useCallback((_title: string, _message: string) => {
    setShowFaceMismatchModal(true);
  }, []);
  const closeFaceMismatchModal = useCallback(() => setShowFaceMismatchModal(false), []);

  const simulateError = useCallback(() => {
    try {
      throw new Error("Testing error in FaceDetection Component");
    } catch (error: any) {
      logService.log("error", error.message);
      setLogs(logService.getLogs());
    }
  }, [logService]);

  const downloadLogs = useCallback(() => logService.downloadLogs(), [logService]);
  const onLogLevelChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as LogLevel;
      setSelectedLevel(value);
      logService.setLogLevel(value);
    },
    [logService]
  );

  /* ---------------------- Camera helpers ---------------------- */
  const checkCameraFPS = useCallback(() => {
    return new Promise<number>((resolve) => {
      let frameCount = 0;
      const startTime = performance.now();
      const countFrame = () => {
        frameCount++;
        const elapsed = performance.now() - startTime;
        if (elapsed >= 1000) resolve(frameCount);
        else requestAnimationFrame(countFrame);
      };
      countFrame();
    });
  }, []);

  const checkVideoResolution = useCallback(() => {
    const el = videoElementRef.current;
    if (!el) return;
    const width = el.videoWidth;
    const height = el.videoHeight;
    // eslint-disable-next-line no-console
    console.log(`ðŸ“· Video resolution: ${width}x${height}`);
    if (width < 400 || height < 300) {
      showMessage(
        "cameraErrorMessage",
        "âš ï¸ Low camera resolution. Face detection may not work properly."
      );
    }
  }, [showMessage]);

  const isVideoBlurred = useCallback((): boolean => {
    const ctx = brightnessCtxRef.current;
    const canvas = brightnessCanvasRef.current;
    const video = videoElementRef.current;
    if (!ctx || !canvas || !video) return false;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
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
    return variance < 50;
  }, []);

  const isVideoBlank = useCallback((): boolean => {
    const ctx = brightnessCtxRef.current;
    const canvas = brightnessCanvasRef.current;
    const video = videoElementRef.current;
    if (!ctx || !canvas || !video) return true;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let blackPixels = 0;
    const threshold = 30;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r < threshold && g < threshold && b < threshold) blackPixels++;
    }
    const blackPercent = blackPixels / (data.length / 4);
    return blackPercent > 0.95;
  }, []);

  /* ---------------- startCamera (Angular startCamera) ---------------- */
const startCamera = useCallback(async () => {
  if (isStartingCameraRef.current) return;
  isStartingCameraRef.current = true;
  try {
    const videoEl = videoRef.current;
    videoElementRef.current = videoEl;
    const overlayEl = overlayRef.current;

    if (!videoEl) {
      logService.log("error", "Video element not found");
      showMessage("cameraErrorMessage", "Video element not found");
      return;
    }

    if (!overlayEl) {
      logService.log("error", "Overlay element not found");
      showMessage("cameraErrorMessage", "Overlay element not found");
      return;
    }
    overlayCanvasRef.current = overlayEl;

    logService.log("info", "Starting camera...");
    
    // 1. Request stream AFTER video element checks
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 30, max: 30 }
      },
      audio: false,
    });
    streamRef.current = stream;

    // 2. Stop previous tracks (if any)
    if (videoEl.srcObject) {
      (videoEl.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }

    // 3. Assign new stream to video, call play
    videoEl.srcObject = stream;
    try {
      await videoEl.play();
    } catch (playError) {
      logService.log("warn", "Video playback interrupted: " + playError);
    }

  
    // 4. **Ensure camera status is updated ONLY after play starts**
    // This avoids the issue where video exists but isn't streaming!
    videoEl.onplaying = () => {
      streamRef.current = stream;
      setIsCameraOn(true);
      logService.log("info", "Camera is playing and detection is allowed.");
    };

    // 5. If video is already playing (for some browsers), set flag
    if (!videoEl.paused && videoEl.readyState >= 2) {
      setIsCameraOn(true);
      logService.log("info", "Camera is auto-playing and detection is allowed.");
    }

    logService.log("info", "Camera stream acquired and video playback started.");

    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length) {
      const settings = videoTracks[0].getSettings();
      logService.log("debug", `Camera settings: ${JSON.stringify(settings)}`);
      if (
        (settings.width && settings.width < 400) ||
        (settings.height && settings.height < 300)
      ) {
        const msg = "⚠️ Low camera resolution. Face detection may not work properly.";
        showMessage("cameraErrorMessage", msg);
        logService.log("warn", msg);
      }
      if (settings.frameRate && settings.frameRate < 15) {
        const msg = "⚠️ Low frame rate. Detection quality may be affected.";
        showMessage("cameraErrorMessage", msg);
        logService.log("warn", msg);
      }
    }

    const fps = await checkCameraFPS();
    logService.log("debug", `Measured camera FPS: ${fps}`);
    if (fps < 15) {
      const msg = "⚠️ Camera FPS is too low for reliable detection.";
      showMessage("cameraErrorMessage", msg);
      logService.log("warn", msg);
    }

    if (!videoEl.srcObject || !(videoEl.srcObject instanceof MediaStream)) {
      const msg = "⚠️ Camera not providing video. Try refreshing or switching device.";
      showMessage("cameraErrorMessage", msg);
      logService.log("error", msg);
      return;
    }

    // 6. You can display success message after camera is confirmed
    showMessage("recordingMessage", "📷 Camera started successfully.");
    logService.log("info", "📷 Camera started successfully.");

    _checkVideoResolution();

    // Setup overlay & brightness canvas
    const setupOverlay = () => {
      const w = videoEl.videoWidth || 640;
      const h = videoEl.videoHeight || 480;
      console.log("Canvas dimensions (w, h):", w, h);  // Add this log

      overlayEl.width = w;
      overlayEl.height = h;
      overlayEl.style.width = w + "px";
      overlayEl.style.height = h + "px";
      setOverlaySize({ width: w, height: h });
      const ctx = overlayEl.getContext("2d");
      ctx?.clearRect(0, 0, w, h);
      if (ovalRef.current) {
        ovalRef.current.w = w * 0.5;
        ovalRef.current.h = h * 0.6;
        ovalRef.current.cx = w / 2;
        ovalRef.current.cy = h / 2;
      }
      if (!brightnessCanvasRef.current)
        brightnessCanvasRef.current = document.createElement("canvas");
      const bc = brightnessCanvasRef.current!;
      bc.width = w;
      bc.height = h;
      brightnessCtxRef.current = bc.getContext("2d");
      _drawFaceGuideOverlay(currentBrightnessRef.current || 100);
      console.log(`Overlay and brightness canvas set up with dimensions: ${w}x${h}`);
    };

    // Run setupOverlay after video metadata is loaded
    if (videoEl.readyState >= 1) {
      setupOverlay();
    } else {
      videoEl.addEventListener("loadedmetadata", setupOverlay, { once: true });
    }

    console.log("Before detection loop: isCameraOn=", isCameraOn, "video", videoElementRef.current, "stream", streamRef.current);
    logService.log("debug", `Detection precheck: isCameraOn=${isCameraOn} videoRef=${!!videoElementRef.current}`);


  } catch (err: any) {
    const errorMsg = `Camera initialization failed: ${err.message || err}`;
    logService.log("error", errorMsg);
    // eslint-disable-next-line no-console
    console.error(errorMsg);

    if (err.name === "NotAllowedError") {
      const msg = "❌ Camera permission denied. Please allow access and refresh.";
      showMessage("cameraErrorMessage", msg);
      logService.log("error", msg);
    } else if (err.name === "NotFoundError") {
      const msg = "⚠️ No camera found on this device.";
      showMessage("cameraErrorMessage", msg);
      logService.log("error", msg);
    } else {
      const msg = "⚠️ Failed to access the camera. Try again.";
      showMessage("cameraErrorMessage", msg);
      logService.log("error", msg);
    }
    setIsCameraOn(false);
  } finally {
    isStartingCameraRef.current = false;
  }
}, [checkCameraFPS, showMessage, logService]);


  /* small wrapper to keep Angular method names exactly */
  const _checkVideoResolution = useCallback(() => checkVideoResolution(), [checkVideoResolution]);

  /* ------------------------ Brightness helpers ------------------------ */
  const _getFrameBrightness = useCallback((): number => {
    const ctx = brightnessCtxRef.current;
    const canvas = brightnessCanvasRef.current;
    const video = videoElementRef.current;
    if (!ctx || !canvas || !video) return 0;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let totalLuminance = 0;
    const numPixels = frame.length / 4;

    for (let i = 0; i < frame.length; i += 4) {
      const r = frame[i];
      const g = frame[i + 1];
      const b = frame[i + 2];
      totalLuminance += 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    return totalLuminance / numPixels;
  }, []);

  /* ----------------------- Detection loop unit ----------------------- */
  const _scheduleNext = useCallback((fn: FrameRequestCallback | (() => void)) => {
    rafIdRef.current = requestAnimationFrame(fn as FrameRequestCallback);
  }, []);

  const _validateCameraAndVideo = useCallback((_loop: () => void): boolean => {
    if (!isCameraOn || !videoElementRef.current) {
      logService.log("info", "Camera off or video element missing; stopping detection loop.");
      console.log("Camera status:", isCameraOn, "Video ref:", videoElementRef.current);
      return false;
    }
    return true;
  }, [isCameraOn, logService]);

  const _validateOval = useCallback((loop: () => void): boolean => {
    if (!ovalRef.current) {
      logService.log("info", "Oval guide not initialized yet; scheduling next frame.");
      _scheduleNext(loop);
      return false;
    }
    return true;
  }, [logService, _scheduleNext]);

  const _getCurrentFrameAsMat = useCallback((): any => {
    try {
      // bail if cv is not ready
      if (typeof cv === "undefined" || !cv.imread) return null;
      const v = videoElementRef.current;
      if (!v) return null;
      const canvas = document.createElement("canvas");
      canvas.width = v.videoWidth;
      canvas.height = v.videoHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      return cv.imread(canvas);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error reading frame for OpenCV:", err);
      return null;
    }
  }, []);

  const _detectBrightSpot = useCallback((frame: any): string => {
    try {
      const BRIGHTNESS_THRESHOLD = 230;
      const MIN_CONTOUR_AREA = 500;
      const MAX_CONTOUR_AREA = 70000;
      const MIN_RADIUS = 20;
      const MAX_RADIUS = 180;
      const CIRCULARITY_MIN = 0.3;
      const CIRCULARITY_MAX = 1.3;

      const gray = new cv.Mat();
      cv.cvtColor(frame, gray, cv.COLOR_RGBA2GRAY);

      const height = gray.rows,
        width = gray.cols;
      const centerX = Math.floor(width / 2),
        centerY = Math.floor(height / 2);

      const mainRadius =
        ovalRef.current?.rInner || Math.max(Math.min(centerX, centerY) - 10, 1);

      const thresh = new cv.Mat();
      cv.threshold(gray, thresh, BRIGHTNESS_THRESHOLD, 255, cv.THRESH_BINARY);

      const mask = cv.Mat.zeros(gray.rows, gray.cols, cv.CV_8UC1);
      cv.circle(
        mask,
        new cv.Point(centerX, centerY),
        mainRadius,
        new cv.Scalar(255, 255, 255),
        -1
      );

      const masked = new cv.Mat();
      cv.bitwise_and(thresh, mask, masked);

      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();
      cv.findContours(
        masked,
        contours,
        hierarchy,
        cv.RETR_EXTERNAL,
        cv.CHAIN_APPROX_SIMPLE
      );

      let spotFound = false;
      for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i);
        const area = cv.contourArea(contour);
        if (area < MIN_CONTOUR_AREA || area > MAX_CONTOUR_AREA) continue;

        const circle = cv.minEnclosingCircle(contour);
        const radius = circle.radius;
        const cx2 = circle.center.x;
        const cy2 = circle.center.y;

        const dist = Math.sqrt((cx2 - centerX) ** 2 + (cy2 - centerY) ** 2);
        if (dist > mainRadius) continue;
        if (radius < MIN_RADIUS || radius > MAX_RADIUS) continue;

        const perimeter = cv.arcLength(contour, true);
        if (perimeter === 0) continue;

        const circularity = (4 * Math.PI * area) / (perimeter * perimeter);
        if (circularity >= CIRCULARITY_MIN && circularity <= CIRCULARITY_MAX) {
          // eslint-disable-next-line no-console
          console.log(
            `[BrightnessCheck] Contour ${i} matched: area=${area}, radius=${radius}, circularity=${circularity.toFixed(
              2
            )}`
          );
          spotFound = true;
          break;
        }
      }

      gray.delete();
      thresh.delete();
      mask.delete();
      masked.delete();
      contours.delete();
      hierarchy.delete();

      return spotFound ? "spot detected" : "no spot detected";
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Bright spot detection error:", err);
      return "error";
    }
  }, []);

  const _handleBrightnessChecks = useCallback(
    async (loop: () => void): Promise<boolean> => {
      const brightness = _getFrameBrightness();
      currentBrightnessRef.current = brightness;
      logService.log("info", `[BrightnessCheck] Frame brightness: ${brightness}`, "brightness");

      _drawFaceGuideOverlay(brightness);

      if (_isVideoBlank()) {
        if (isRecordingRef.current) _restartCurrentSegmentDueToFaceLoss();
        logService.log("warn", "[BrightnessCheck] Camera feed appears blank.", "cameraError");
        return showAndLogMessage(
          "cameraErrorMessage",
          "âš ï¸ Camera feed appears blank. Check your camera or refresh the page.",
          "warn",
          loop
        );
      }

      const mat = _getCurrentFrameAsMat();
      let showWarning = false;

      if (mat) {
        const result = _detectBrightSpot(mat);
        logService.log(
          "info",
          `[BrightnessCheck] Bright spot detection result: ${result}`,
          "brightness"
        );
        mat.delete();
        if (result === "spot detected") showWarning = true;
      } else {
        logService.log("warn", "[BrightnessCheck] Failed to get current frame as Mat.", "cameraError");
      }

      if (showWarning) {
        if (isRecordingRef.current && !isVerifyingHeadTurnRef.current)
          _restartCurrentSegmentDueToFaceLoss();
        logService.log("warn", "[BrightnessCheck] Bright spot detected in the oval.", "brightnessWarning");
        return showAndLogMessage(
          "brightnessMessage",
          "âš ï¸ Bright spot detected in the oval. Please adjust lighting or avoid reflections.",
          "warn",
          loop
        );
      }

      if (brightness < 60) {
        if (isRecordingRef.current && !isVerifyingHeadTurnRef.current)
          _restartCurrentSegmentDueToFaceLoss();
        logService.log("warn", "[BrightnessCheck] Too dark environment detected.", "brightnessWarning");
        return showAndLogMessage(
          "brightnessMessage",
          "ðŸŒ‘ Too dark â€” please move to a brighter place.",
          "warn",
          loop
        );
      } else if (brightness > 180) {
        if (isRecordingRef.current && !isVerifyingHeadTurnRef.current)
          _restartCurrentSegmentDueToFaceLoss();
        logService.log("warn", "[BrightnessCheck] Too bright environment detected.", "brightnessWarning");
        return showAndLogMessage(
          "brightnessMessage",
          "â˜€ï¸ Too bright â€” reduce lighting.",
          "warn",
          loop
        );
      } else {
        logService.log("info", "[BrightnessCheck] Brightness is within acceptable range.", "brightness");
        showMessage("brightnessMessage", "");
      }

      showMessage("cameraErrorMessage", "");

      if (_isVideoBlurred()) {
        if (isRecordingRef.current && !isVerifyingHeadTurnRef.current)
          _restartCurrentSegmentDueToFaceLoss();
        logService.log("warn", "[BrightnessCheck] Video is blurry detected.", "blurWarning");
        return showAndLogMessage(
          "dashedCircleAlignMessage",
          "ðŸ” Video is blurry. Clean your camera lens or adjust focus.",
          "warn",
          loop
        );
      }

      logService.log("info", "[BrightnessCheck] No issues detected in current frame.", "status");
      return false;
    },

    
    [logService, showAndLogMessage, showMessage]
  );

  const _checkMultipleFaces = useCallback(
    async (loop: () => void, options: any): Promise<boolean> => {
      const v = videoElementRef.current!;
      const allFaces = await faceapi.detectAllFaces(v, options);
      const { cx, cy, rOuter } = ovalRef.current;
      const biggerRadius = rOuter * 1.2;

      const facesInsideCircle = allFaces.filter((face) => {
        const centerX = face.box.x + face.box.width / 2;
        const centerY = face.box.y + face.box.height / 2;
        const dx = centerX - cx;
        const dy = centerY - cy;
        return Math.sqrt(dx * dx + dy * dy) <= biggerRadius;
      }).length;

      if (facesInsideCircle > 1) {
        if (isRecordingRef.current && !isVerifyingHeadTurnRef.current)
          _restartCurrentSegmentDueToFaceLoss();
        return showAndLogMessage(
          "verificationMessage",
          "âŒ Multiple faces detected inside the guide. Please ensure only one face is visible.",
          "warn",
          loop
        );
      } else {
        showMessage("verificationMessage", "");
      }
      return false;
    },
    [showAndLogMessage, showMessage]
  );

const _detectSingleFaceWithLandmarks = useCallback(
  async (options: any): Promise<void> => {
    const v = videoElementRef.current!;
    const res = await faceapi.detectSingleFace(v, options).withFaceLandmarks();

    // Debug (keep if useful)
    console.log("Detection result:", res);

    if (res) {
      // ✅ on success, populate the refs used by alignment/verification logic
      lastLandmarksRef.current = res.landmarks;
      lastBoxRef.current = res.detection.box;
      // Optional: draw landmarks if you want a visual
      // _drawFaceLandmarks(res.landmarks, overlayCanvasRef.current!);
    } else {
      // No face -> clear refs so alignment logic resets counters
      lastLandmarksRef.current = null;
      lastBoxRef.current = null;
      logService.log("warn", "No face detected");
    }
  },
  [logService]
);


  const _areLandmarksFullyInsideOval = useCallback((landmarks: faceapi.FaceLandmarks68): boolean => {
    const { cx, cy, rOuter } = ovalRef.current;
    const detectionRadius = rOuter * 1.2;

    return landmarks.positions.every((point) => {
      const dx = point.x - cx;
      const dy = point.y - cy;
      return Math.sqrt(dx * dx + dy * dy) <= detectionRadius;
    });
  }, []);

  const _handleFaceAlignment = useCallback(
    async (_loop: () => void): Promise<[boolean, boolean]> => {
      const box = lastBoxRef.current!;
      const landmarks = lastLandmarksRef.current!;
      const fillPct = (box.height / ovalRef.current.h) * 100;

      const fb = fillBufferRef.current;
      fb.push(fillPct);
      if (fb.length > smoothingWindowRef.current) fb.shift();

      const smoothedFill = fb.reduce((a, b) => a + b, 0) / fb.length;
      const lowerBound = 50,
        upperBound = 85;

      let sizeOK = false;

      if (smoothedFill < lowerBound) {
        showMessage("distanceMessage", "ðŸ“ Please move closer to the camera.");
      } else if (smoothedFill > upperBound) {
        showMessage("distanceMessage", "ðŸ“ Please move slightly farther away from the camera.");
      } else {
        sizeOK = true;
        showMessage("distanceMessage", "");
      }

      const faceInside = _areLandmarksFullyInsideOval(landmarks);

      showMessage(
        "ovalAlignMessage",
        faceInside ? "âœ… Yay! Your face is perfectly inside the oval! ðŸŽ‰" : ""
      );
      
      console.log("Alignment:", {faceInside, sizeOK, insideOvalFrames: insideOvalFramesRef.current});

      return [faceInside, sizeOK];
    },
    [_areLandmarksFullyInsideOval, showMessage]
  );

  const _handleNoFaceDetected = useCallback((_loop: () => void): void => {
    setIsFaceDetected(false);
    insideOvalFramesRef.current = 0;

    console.log("Segment trigger? flag:", recordingFlagRef.current, "insideOvalFrames:", insideOvalFramesRef.current);


    if (isRecordingRef.current && !isVerifyingHeadTurnRef.current) _restartCurrentSegmentDueToFaceLoss();
    
  }, []);

  const _checkDifferentFace = useCallback(async (): Promise<boolean> => {
    if (!referenceFaceDescriptorRef.current) {
      logService.log("info", "[FaceCheck] No reference descriptor; skipping check.");
      return false;
    }

    if (!faceapi.nets.faceRecognitionNet.isLoaded) {
  await faceapi.nets.faceRecognitionNet.loadFromUri("/assets/weights");
  logService.log("info", "Loaded faceRecognitionNet on demand (FaceCheck)");
}


    try {
      const v = videoElementRef.current!;
      const detection = await faceapi
        .detectSingleFace(v, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection && detection.descriptor) {
        const distance = faceapi.euclideanDistance(
          referenceFaceDescriptorRef.current,
          detection.descriptor
        );
        logService.log(
          "info",
          `[FaceCheck] distance=${distance.toFixed(3)}, counter=${faceMismatchCounterRef.current}`
        );

        if (distance > 0.6) {
          faceMismatchCounterRef.current++;
          logService.log(
            "warn",
            `[FaceCheck] Mismatch counter incremented: ${faceMismatchCounterRef.current}`
          );
          showMessage(
            "verificationMessage",
            "âŒ Different face detected for several seconds! Restarting from scratch...",
            true,
            5000
          );
          if (faceMismatchCounterRef.current >= faceMismatchThresholdRef.current) {
            logService.log(
              "error",
              `[FaceCheck] âŒ Different face detected consistently for ${faceMismatchCounterRef.current} seconds`
            );
            faceMismatchCounterRef.current = 0;
            return true; // confirmed different face
          }
        } else {
          if (faceMismatchCounterRef.current > 0) {
            logService.log("info", `[FaceCheck] Face match restored, counter reset.`);
          }
          faceMismatchCounterRef.current = 0;
        }
      } else {
        logService.log("warn", `[FaceCheck] âš ï¸ No face detected (null detection)`);
        faceMismatchCounterRef.current = 0;
      }
    } catch (err) {
      logService.log("error", `[FaceCheck] âš ï¸ Error during face detection: ${err}`);
      faceMismatchCounterRef.current = 0;
    }

    return false;
  }, [logService, showMessage]);

  const _startDetectionRAF = useCallback(() => {
    logService.log("info", "ðŸ”„ Starting face detection loop...");
    const options = new faceapi.TinyFaceDetectorOptions();

    const loop = async () => {
      if (!_validateCameraAndVideo(loop)) return;
      if (!_validateOval(loop)) return;

      frameCountRef.current++;

      console.log("Inside oval frames:", insideOvalFramesRef.current, "Required frames:", requiredFramesRef.current);

      if (frameCountRef.current % BRIGHT_EVERY.current === 0) {
        if (await _handleBrightnessChecks(loop)) return;
      }

      if (frameCountRef.current % DETECT_EVERY.current === 0) {
        if (await _checkMultipleFaces(loop, options)) return;
        await _detectSingleFaceWithLandmarks(options);
      }

      if (lastBoxRef.current && lastLandmarksRef.current) {
        const [faceInside, sizeOK] = await _handleFaceAlignment(loop);

        console.log("Face alignment check:", {
        faceInside,
        sizeOK,
        insideOvalFrames: insideOvalFramesRef.current
        });

         if (insideOvalFramesRef.current >= requiredFramesRef.current) {
              console.log("Triggering recording due to enough frames inside the oval.");
              console.log("Current recording flag:", recordingFlagRef.current);
              showMessage("statusMessage", "âœ… Perfect! Stay still inside the dashed circle.");
              setIsFaceDetected(true);
              await _checkDifferentFace();
          }                                
           

        if (sizeOK && faceInside) {
          insideOvalFramesRef.current++;
          showMessage("dashedCircleAlignMessage", "");

          console.log("Segment trigger? flag:", recordingFlagRef.current, "insideOvalFrames:", insideOvalFramesRef.current);

          if (insideOvalFramesRef.current >= requiredFramesRef.current) {
            showMessage("statusMessage", "âœ… Perfect! Stay still inside the dashed circle.");
            setIsFaceDetected(true);
            await _checkDifferentFace();

            console.log("🎬 Trigger check", { flag: recordingFlagRef.current, isCameraOn, stream: !!streamRef.current });

            if (recordingFlagRef.current === 0) {
              await startRecording_FaceReference();
              logService.log("info", "ðŸŽ¥ Starting recording...");
              
              // recordingFlagRef.current = 1;
              try {
                await _startSegmentRecording(); // identical name & behavior
              } catch (err) {
                logService.log("error", `âŒ Error starting segment recording: ${err}`);
                showMessage("statusMessage", "âš ï¸ Unable to start recording. Please try again.");
              }
            }
          }
        } else {
          // Instead of resetting to zero, decrement for debugging/tuning
          insideOvalFramesRef.current = Math.max(insideOvalFramesRef.current - 1, 0);
          setIsFaceDetected(false);
          if (isRecordingRef.current && !isVerifyingHeadTurnRef.current)
            _restartCurrentSegmentDueToFaceLoss();

          if (!sizeOK && !faceInside) {
            showMessage(
              "dashedCircleAlignMessage",
              "ðŸ§­ Make sure your full face is inside the dashed circle and adjust distance."
            );
          } else if (!faceInside) {
            showMessage("dashedCircleAlignMessage", "ðŸ§­ Your entire face must be inside the dashed circle.");
          } else {
            showMessage("dashedCircleAlignMessage", "");
          }
        }
      } else {
        _handleNoFaceDetected(loop);
      }

      _scheduleNext(loop);
    };

    _scheduleNext(loop);
  }, [
    _checkDifferentFace,
    _checkMultipleFaces,
    _detectSingleFaceWithLandmarks,
    _handleBrightnessChecks,
    _handleFaceAlignment,
    _handleNoFaceDetected,
    _scheduleNext,
    _validateCameraAndVideo,
    _validateOval,
    logService,
    showMessage,
  ]);

  /* ---------------- Window resize & mobile check (HostListener) --------------- */
  const _checkIsMobile = useCallback(() => setIsMobile(window.innerWidth <= 767), []);
useEffect(() => {
  
  async function loadModelsAndStart() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/assets/weights');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/assets/weights');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/assets/weights');
    await faceapi.nets.faceExpressionNet.loadFromUri('/assets/weights');

    // Wait until videoRef is set by React
    function waitForVideoRef(): Promise<HTMLVideoElement> {
      return new Promise((resolve, reject) => {
        const maxWaitMs = 20000;
        const pollIntervalMs = 100;
        let waited = 0;

        const interval = setInterval(() => {
          if (videoRef.current) {
            clearInterval(interval);
            resolve(videoRef.current);
          }
          waited += pollIntervalMs;
          if (waited >= maxWaitMs) {
            clearInterval(interval);
            reject(new Error('Timed out waiting for video element'));
          }
        }, pollIntervalMs);
      });
    }

    try {
      await waitForVideoRef();
    } catch (e) {
      console.error('Failed to initialize camera: ', e);
      showMessage('cameraErrorMessage', 'Video element not found. Please refresh.');
    }
    await startCamera();
    _generateSegmentDurations();
  }
  loadModelsAndStart();
}, []);

useEffect(() => {
  try {
    if (typeof cv !== "undefined") {
      (cv as any).onRuntimeInitialized = () => {
        console.log("OpenCV.js loaded");
        setCvReady(true);
      };
    }
  } catch {}
}, []);

useEffect(() => {
  if (isCameraOn) {
    _startDetectionRAF();
    logService.log("info", "Detection loop started because camera is ON.");
  }
}, [isCameraOn]);

useEffect(() => {
  const id = window.setInterval(() => {
    const stuck =
      recordingFlagRef.current === 1 &&
      (!isRecordingRef.current ||
        !mediaRecorderRef.current ||
        mediaRecorderRef.current.state === "inactive");

    if (stuck) {
      console.warn("🛠 Resetting stuck recording flag");
      recordingFlagRef.current = 0;
    }
  }, 1500);

  return () => window.clearInterval(id);
}, []);




  /* ---------------------- Lifecycle: mount/unmount ---------------------- */
  // useEffect(() => {
  //   (async () => {
  //     try {
  //       // tf backend
  //       // eslint-disable-next-line no-console
  //       console.log("Setting TensorFlow.js backend to webgl...");
  //       await tf.setBackend("webgl");
  //       await tf.ready();
  //       // eslint-disable-next-line no-console
  //       console.log("TensorFlow backend:", tf.getBackend());

  //       // load faceapi models
  //       // eslint-disable-next-line no-console
  //       console.log("Loading face-api models...");
  //       logService.log("debug", "Loading face-api models...");
  //       await Promise.all([
  //         faceapi.nets.tinyFaceDetector.loadFromUri("/assets/weights"),
  //         faceapi.nets.faceLandmark68Net.loadFromUri("/assets/weights"),
  //         faceapi.nets.faceRecognitionNet.loadFromUri("/assets/weights"),
  //         faceapi.nets.faceExpressionNet.loadFromUri("/assets/weights"),
  //       ]);
  //       // eslint-disable-next-line no-console
  //       console.log("âœ… FaceAPI models loaded");
  //       logService.log("debug", "âœ… FaceAPI models loaded");

  //       // eslint-disable-next-line no-console
  //       console.log("Loading COCO-SSD model...");
  //       // const cocoModel = await cocoSsd.load();
  //       // eslint-disable-next-line no-console
  //       console.log("âœ… COCO-SSD model loaded");
  //       logService.log("info", "Step 6 loaded");
  //       setLogs(logService.getLogs());

  //       // eslint-disable-next-line no-console
  //       console.log("Starting camera...");
  //       await startCamera();
  //     } catch (err: any) {
  //       // eslint-disable-next-line no-console
  //       console.error("Camera initialization failed:", err);

  //       if (err.name === "NotAllowedError")
  //         setCameraErrorMessage("âŒ Camera permission denied. Please allow access and refresh.");
  //       else if (err.name === "NotFoundError")
  //         setCameraErrorMessage("âš ï¸ No camera found on this device.");
  //       else setCameraErrorMessage("âš ï¸ Failed to access the camera. Try again.");

  //       setIsCameraOn(false);
  //     }
  //   })();

  //   return () => {
  //     if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
  //     if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
  //     if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  /* ----------------------- Recording Lifecycle ----------------------- */
  const isRecordingRef = useRef<boolean>(false);

  /* Angular: startRecording_FaceReference */
const startRecording_FaceReference = useCallback(async () => {
  completedSegmentsRef.current = [];
  headTurnBlobRef.current = null;
  headTurnVerifiedRef.current = false;
  setHeadTurnAttemptStatus("");
  referenceFaceDescriptorRef.current = null; // reset

  // ✅ Check readiness via refs (not React state)
  const canCapture =
    !!lastLandmarksRef.current &&
    !!lastBoxRef.current &&
    insideOvalFramesRef.current >= (requiredFramesRef.current || 3);

  if (!canCapture) {
    showMessage("statusMessage", "🧭 Hold steady inside the circle for a moment…");
    logService.log("info", "Reference capture attempted but face not ready via refs.");
    return;
  }

  try {
    // Ensure recognition model is loaded (safety guard)
    if (!faceapi.nets.faceRecognitionNet.isLoaded) {
      await faceapi.nets.faceRecognitionNet.loadFromUri("/assets/weights");
      logService.log("info", "Loaded faceRecognitionNet on demand");
    }

    const v = videoElementRef.current!;
    const opts = new faceapi.TinyFaceDetectorOptions();

    // Try a few times; first frame may be mid-blink/blurred
    let detection:
      | (faceapi.WithFaceDescriptor<
          faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>
        >)
      | null = null;

    for (let i = 0; i < 3 && !detection?.descriptor; i++) {
      detection = await faceapi
        .detectSingleFace(v, opts)
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (!detection?.descriptor) await new Promise((r) => setTimeout(r, 120));
    }

    if (detection?.descriptor) {
      referenceFaceDescriptorRef.current = detection.descriptor;
      logService.log("info", "✅ Reference face descriptor captured");
    } else {
      logService.log("warn", "⚠️ Could not compute reference descriptor");
      showMessage(
        "statusMessage",
        "⚠️ Could not lock onto your face—hold still and keep within the circle."
      );
    }
  } catch (err) {
    logService.log("error", `❌ Error capturing reference face: ${err}`);
    showMessage("statusMessage", "⚠️ Error detecting face (will continue).");
    recordingFlagRef.current = 0;
  }

  currentSegmentRef.current = 1;
}, [logService, showMessage]);


  /* Angular: _startSegmentRecording */
  const _startSegmentRecording = useCallback(

    async (resumeSecondsRecorded = 0) => {
      console.log("🟢 _startSegmentRecording() called", { 
        stream: !!streamRef.current,
        tracks: streamRef.current?.getTracks().map(t => ({ kind: t.kind, readyState: t.readyState })),
      });

      try {
        // eslint-disable-next-line no-console
        console.log("_startSegmentRecording called ---", {
          resumeSecondsRecorded,
          currentSegment: currentSegmentRef.current,
          isRecording: isRecordingRef.current,
          segmentSecondsRecorded: segmentSecondsRecordedRef.current,
        });

        if (!streamRef.current) {
          showMessage("statusMessage", "âš ï¸ Camera not initialized.");
          logService.log(
            "error",
            "Camera stream not initialized when trying to start segment recording."
          );
          // eslint-disable-next-line no-console
          console.error("Camera stream not initialized. Aborting segment recording.");
          recordingFlagRef.current = 0;
          return;
        }

        if (!currentSegmentRef.current || currentSegmentRef.current <= 0) {
          currentSegmentRef.current = 1;
          logService.log("warn", "currentSegment was 0 or invalid, reset to 1.");
        }

        let options: MediaRecorderOptions | undefined;

        if (resumeSecondsRecorded === 0) {
          recordedChunksPerSegmentRef.current[currentSegmentRef.current] = [];
          if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9"))
            options = { mimeType: "video/webm;codecs=vp9" };
          else if (MediaRecorder.isTypeSupported("video/webm")) options = { mimeType: "video/webm" };
          else if (MediaRecorder.isTypeSupported("video/mp4"))
            options = { mimeType: "video/mp4", videoBitsPerSecond: 100000 };
          else {
            logService.log("info", "No supported MIME type found for MediaRecorder on this browser.");
            showMessage("statusMessage", "âš ï¸ MediaRecorder MIME type not supported.");
            recordingFlagRef.current = 0;
            return;
          }
        } else {
          if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9"))
            options = { mimeType: "video/webm;codecs=vp9" };
          else if (MediaRecorder.isTypeSupported("video/webm")) options = { mimeType: "video/webm" };
          else if (MediaRecorder.isTypeSupported("video/mp4"))
            options = { mimeType: "video/mp4", videoBitsPerSecond: 100000 };
        }

        if (resumeSecondsRecorded === 0 && !isRecordingRef.current) {
          logService.log("info", "Starting fresh new segment recording.");

          if (
            currentSegmentRef.current === 1 &&
            (segmentSecondsRecordedRef.current === undefined ||
              segmentSecondsRecordedRef.current === null)
          ) {
            completedSegmentsRef.current = [];
            verificationDoneForSegmentRef.current = {};
            verificationSuccessForSegmentRef.current = {};
            headTurnAttemptsPerSegmentRef.current = {};
            headVerificationCountPerSegmentRef.current = {};
            partialSegmentBlobsPerSegmentRef.current = {};
          }

          segmentSecondsRecordedRef.current = 0;
          extraSecondsRecordedRef.current = 0;
          isSegmentValidRef.current = true;
          // isRecordingRef.current = true;
          headTurnAttemptsRef.current = 0;
          currentSessionStartTimeRef.current = 0;

          verificationDoneForSegmentRef.current[currentSegmentRef.current] = false;
          headTurnAttemptsPerSegmentRef.current[currentSegmentRef.current] = 0;
          headVerificationCountPerSegmentRef.current[currentSegmentRef.current] = 0;
        } else {
          segmentSecondsRecordedRef.current = resumeSecondsRecorded;
          extraSecondsRecordedRef.current = 0;
          currentSessionStartTimeRef.current = resumeSecondsRecorded;
          recordedChunksPerSegmentRef.current[currentSegmentRef.current] = [];
        }

        headSegmentSecondsRecordedRef.current = 0;

        console.log("🟢 _startSegmentRecording() invoked", {
          streamExists: !!streamRef.current,
          trackStates: streamRef.current?.getTracks().map(t => ({
            kind: t.kind,
            readyState: t.readyState,
            enabled: t.enabled,
          })),
          videoState: videoElementRef.current?.readyState,
        });

        // 🟢 Ensure video is actually playing before creating MediaRecorder
        const videoEl = videoElementRef.current;
        if (videoEl) {
          console.log("Waiting for video readiness...");
          await new Promise<void>((resolve) => {
            if (videoEl.readyState >= 2 && !videoEl.paused) {
              console.log("Video already playing");
              resolve();
            } else {
              videoEl.onplaying = () => {
                console.log("Video is now playing — safe to start MediaRecorder");
                resolve();
              };
            }
          });
        }

        try {
          mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);
          console.log(`MediaRecorder created for segment ${currentSegmentRef.current}`);
        } catch (err) {
          console.error(`Failed to create MediaRecorder: ${err}`);
          showMessage("statusMessage", "⚠️ Could not create MediaRecorder. Recording aborted.");
          recordingFlagRef.current = 0;
          return;
        }        

        if (!streamRef.current) {
          console.error("Stream ref is null, cannot start recording.");
          showMessage("statusMessage", "⚠️ Camera stream not available for recording.");
          return;
        }

        // isRecordingRef.current = true;

        console.log(`MediaRecorder created for segment ${currentSegmentRef.current}`);

        mediaRecorderRef.current.onstart = () => {
          console.log("🎥 MediaRecorder started:", mediaRecorderRef.current?.state);
          recordingFlagRef.current = 1;   // set the flag only once recording truly starts
          isRecordingRef.current = true;  // mark recording active
        };

        const segmentTarget =
          segmentDurationsRef.current[currentSegmentRef.current - 1];
        const remaining = segmentTarget - segmentSecondsRecordedRef.current;
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          await _onSegmentComplete();
          return;
        }

        showMessage(
          "recordingMessage",
          `ðŸŽ¥ Recording segment ${currentSegmentRef.current}... (${remaining}s left)`
        );

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            console.log(`Data chunk received for segment ${currentSegmentRef.current}: size=${event.data.size}`);
            recordedChunksPerSegmentRef.current[currentSegmentRef.current] ??= [];
            recordedChunksPerSegmentRef.current[currentSegmentRef.current].push(event.data);
          } else {
            console.warn("Empty data chunk received");
          }
        };

        mediaRecorderRef.current.onstop = async () => {
          recordingFlagRef.current = 0;       // ✅ allow retriggers later
          isRecordingRef.current = false;

            console.log(`MediaRecorder stopped for segment ${currentSegmentRef.current}. Total chunks recorded:`, recordedChunksPerSegmentRef.current[currentSegmentRef.current]?.length);
            console.log("⚙️ onstop fired for segment", currentSegmentRef.current);
          const chunkCount =
            recordedChunksPerSegmentRef.current[currentSegmentRef.current]?.length || 0;
          const segmentTarget2 =
            segmentDurationsRef.current[currentSegmentRef.current - 1];
          const hasEnoughTime = segmentSecondsRecordedRef.current >= segmentTarget2;
          const hasValidChunks = chunkCount > 0;

          if (stoppingForRestartRef.current) {
            const sessionDuration =
              segmentSecondsRecordedRef.current - currentSessionStartTimeRef.current;
            if (hasValidChunks && sessionDuration > 0) {
              const chunks =
                recordedChunksPerSegmentRef.current[currentSegmentRef.current];
              const blob = new Blob(chunks, { type: options?.mimeType ?? "video/webm" });
              if (!partialSegmentBlobsPerSegmentRef.current[currentSegmentRef.current])
                partialSegmentBlobsPerSegmentRef.current[currentSegmentRef.current] = [];
              partialSegmentBlobsPerSegmentRef.current[currentSegmentRef.current].push({
                blob,
                startTime: currentSessionStartTimeRef.current,
                endTime: segmentSecondsRecordedRef.current,
                duration: sessionDuration,
              });
            }
            stoppingForRestartRef.current = false;
            return;
          }

          if (isFaceDetected && isSegmentValidRef.current && hasEnoughTime && hasValidChunks) {
            const chunks =
              recordedChunksPerSegmentRef.current[currentSegmentRef.current];
            const blob = new Blob(chunks, { type: options?.mimeType ?? "video/webm" });
            completedSegmentsRef.current.push(blob);
            logService.log("info", `Segment ${currentSegmentRef.current} COMPLETED and saved.`);
          } else {
            logService.log("warn", `Segment ${currentSegmentRef.current} incomplete; retrying.`);
            window.setTimeout(
              () => _startSegmentRecording(segmentSecondsRecordedRef.current),
              600
            );
            return;
          }

          if (_shouldVerifyAfterSegment(currentSegmentRef.current)) {
            await _performVerificationForCurrentSegment();
            return;
          }

          console.log("💾 Debug: Downloading immediately...");
          _downloadAllBlobs();

          await _onSegmentComplete();
        };

        if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = window.setInterval(async () => {
          if (!isRecordingRef.current) {
            if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
            return;
          }

          if (!isFaceDetected) {
            if (mediaRecorderRef.current?.state === "recording") {
              mediaRecorderRef.current.pause();
              showMessage("recordingMessage", `â¸ï¸ Paused because face not detected`);
            }
            return;
          }

          if (mediaRecorderRef.current?.state === "paused") {
            mediaRecorderRef.current.resume();
            showMessage("recordingMessage", `â–¶ï¸ Resumed recording`);
          }

          if (mediaRecorderRef.current?.state === "recording") {
            const target = segmentDurationsRef.current[currentSegmentRef.current - 1];

            if (segmentSecondsRecordedRef.current < target) {
              segmentSecondsRecordedRef.current++;
              const remain = target - segmentSecondsRecordedRef.current;
              setTimeRemaining(remain);

              if (await _checkDifferentFace()) {
                isSegmentValidRef.current = false;
                showMessage(
                  "verificationMessage",
                  "âŒ Different face detected for several seconds! Restarting from scratch..."
                );
                if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
                _resetAll();
                _restartCurrentSegmentDueToFaceLoss();
                if ((mediaRecorderRef.current?.state as MediaRecorder["state"]) !== "inactive")
                  mediaRecorderRef.current?.stop();
                return;
              }
            } else {
              // Segment time reached → stop recorder & trigger onstop
              if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);

              if (mediaRecorderRef.current?.state === "recording") {
                console.log(
                  "🕑 Segment target reached, stopping MediaRecorder for segment",
                  currentSegmentRef.current
                );
                mediaRecorderRef.current.stop();
              } else {
                console.warn("MediaRecorder not in recording state at target time:", mediaRecorderRef.current?.state);
              }
            }
          }
        }, 1000);

        mediaRecorderRef.current.start();

      } catch (err) {
        showMessage("statusMessage", "âš ï¸ Unable to start recording segment. Please try again.");
        // eslint-disable-next-line no-console
        console.error("Failed to start recording:", err);
        recordingFlagRef.current = 0;
      }
    },
    [_checkDifferentFace, showMessage]
  );

  /* Angular: _resetAll (full reset for restart) */
  const _resetAll = useCallback(() => {
    currentSegmentRef.current = 1;
    segmentSecondsRecordedRef.current = 0;
    isRecordingRef.current = false;
    completedSegmentsRef.current = [];
    verificationDoneForSegmentRef.current = {};
    verificationTriggeredForSegmentRef.current = {};
    headTurnAttemptsPerSegmentRef.current = {};
    headTurnAttemptsRef.current = 0;
    triggerVerification3Ref.current = false;
    firstVerificationDirectionRef.current = null;
    secondVerificationDirectionRef.current = null;
    thirdVerificationDirectionRef.current = null;
    verificationTimeInSegmentRef.current = 0;
  }, []);


  /* Angular: _restartCurrentSegmentDueToFaceLoss */
  const _restartCurrentSegmentDueToFaceLoss = useCallback(() => {
    logService.log("info", "Attempting to restart current segment due to face loss.");

    if (restartCooldownRef.current) {
      logService.log("warn", "Restart called but cooldown active. Ignoring.");
      return;
    }

    restartCooldownRef.current = true;
    logService.log("info", "Restart cooldown activated.");

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      stoppingForRestartRef.current = true;
      showMessage(
        "verificationMessage",
        "âš ï¸ Recording reset due to face loss. Continuing from current progress..."
      );
      logService.log("warn", "Recording reset due to face loss or quality issues.");

      if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
      logService.log("info", `Stopping mediaRecorder. Current state: ${mediaRecorderRef.current.state}`);

      try {
        mediaRecorderRef.current.stop();
        logService.log("info", "MediaRecorder.stop() called successfully.");
      } catch (stopErr) {
        logService.log("error", `Error stopping mediaRecorder during restart: ${stopErr}`);
      }
    } else {
      logService.log("info", "MediaRecorder not recording or undefined, skipping stop.");
    }

    window.setTimeout(() => {
      restartCooldownRef.current = false;
      logService.log("info", "Restart cooldown reset.");

      const segmentSeconds = segmentSecondsRecordedRef.current ?? 0;
      let resumeTime: number;

      if (
        segmentSeconds > 1 &&
        lastAdjustedSegmentSecondsRecordedRef.current !== segmentSeconds
      ) {
        resumeTime = segmentSeconds - 1;
        lastAdjustedSegmentSecondsRecordedRef.current = resumeTime;
        logService.log(
          "info",
          `Adjusted segmentSecondsRecorded by -1 for segment ${currentSegmentRef.current}`
        );
      } else {
        resumeTime = segmentSeconds;
      }

      logService.log(
        "info",
        `Resuming recording from ${resumeTime}s for segment ${currentSegmentRef.current}.`
      );

      if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== "recording") {
        logService.log("info", "Starting segment recording after restart.");
        _startSegmentRecording(resumeTime);
      } else {
        logService.log(
          "warn",
          "Attempted to restart recording but MediaRecorder is already recording."
        );
      }
    }, 1000);
  }, [logService, showMessage, _startSegmentRecording]);

  /* Angular: downloadAllBlobs -> _downloadAllBlobs */
  const _downloadAllBlobs = useCallback(() => {
    console.log("Download blobs", completedSegmentsRef.current);
    if (!completedSegmentsRef.current || completedSegmentsRef.current.length === 0) {
      logService.log("error", "No recorded segments available for download.");
      return;
    }

    completedSegmentsRef.current.forEach((blob, idx) => {
      const segmentNumber = idx + 1;
      const startSecond = 0;
      const endSecond = 6;
      let filename = `segment_${segmentNumber}_${startSecond}-${endSecond}.webm`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    });

    Object.keys(partialSegmentBlobsPerSegmentRef.current || {}).forEach((segmentNum) => {
      const partials =
        partialSegmentBlobsPerSegmentRef.current[parseInt(segmentNum, 10)];
      partials.forEach((partial: any, partialIdx: number) => {
        let filename: string;

        if (
          partial &&
          typeof partial === "object" &&
          partial.startTime !== undefined &&
          partial.endTime !== undefined
        ) {
          const startSec = Math.floor(partial.startTime);
          const endSec = Math.floor(partial.endTime);
          filename = `segment_${segmentNum}_${startSec}-${endSec}_(${partialIdx + 1}).webm`;
        } else {
          filename = `segment_${segmentNum}_partial_${partialIdx + 1}.webm`;
        }

        const blob = partial && partial.blob ? partial.blob : partial;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        logService.log("info", `Downloaded: ${filename}`);
      });
    });

    if (headTurnBlobRef.current) {
      const url2 = URL.createObjectURL(headTurnBlobRef.current);
      const a2 = document.createElement("a");
      a2.href = url2;
      a2.download = `head_turn.webm`;
      a2.click();
      URL.revokeObjectURL(url2);
    }

    setStatusMessage("Downloads complete âœ…");
    _resetAllPublic();
    // eslint-disable-next-line no-console
    console.log("âž¡ï¸ Emitting stepComplete(7)");
    onComplete?.(7);
  }, [logService, onComplete]);

  /* Angular: uploadAllBlobs */
  const _uploadAllBlobs = useCallback(() => {
    if (!userId) {
      // eslint-disable-next-line no-console
      console.error("No User found!");
      return;
    }
    const uploadUrl = `${API_BASE}/UploadVideoSegment`;

    const uploadBlob = (blob: Blob, index: number) => {
      const formData = new FormData();
      formData.append("userId", String(userId));
      formData.append("index", String(index));
      formData.append("file", blob, `segment_${index}.webm`);

      return fetch(uploadUrl, { method: "POST", body: formData }).then((r) => {
        if (!r.ok) throw new Error(`Upload failed (${r.status})`);
      });
    };

    const uploads: Promise<void>[] = completedSegmentsRef.current.map((blob, idx) =>
      uploadBlob(blob, idx + 1)
    );
    if (headTurnBlobRef.current) uploads.push(uploadBlob(headTurnBlobRef.current, 0));

    Promise.all(uploads)
      .then(() => {
        setStatusMessage("Uploads complete âœ…");
        _resetAllPublic();
        // eslint-disable-next-line no-console
        console.log("âž¡ï¸ Emitting stepComplete(7)");
        onComplete?.(7);
      })
      .catch((error) => {
        // eslint-disable-next-line no-alert
        alert("Upload failed, please try again.");
        // eslint-disable-next-line no-console
        console.error("Upload failed:", error);
      });
  }, [onComplete, userId]);

  /* Angular: resetAll (public) */
  const _resetAllPublic = useCallback(() => {
    isRecordingRef.current = false;
    setTimeRemaining(0);
    currentSegmentRef.current = 0;
    completedSegmentsRef.current = [];
    headTurnBlobRef.current = null;
    headTurnVerifiedRef.current = false;
    setHeadTurnAttemptStatus("");
    insideOvalFramesRef.current = 0;
    blinkClosedRef.current = false;
    blinkCountRef.current = 0;
    minEARRef.current = +Infinity;
    maxEARRef.current = -Infinity;
    onComplete?.(1);
  }, [onComplete]);

  /* ------------------------- Verification ------------------------- */
  const setDirectionRef = (d: "left" | "right" | "up" | "down") => {
    headTurnDirectionRef.current = d;
    setDirection(d);
  };

  /* Angular: startHeadMovementVerification */
  const _startHeadMovementVerification = useCallback(
    async (dir: "left" | "right" | "up" | "down"): Promise<boolean> => {
      try {
        if (!isCameraOn) {
          setCameraErrorMessage("Camera not started");
          logService.log("error", "[HeadVerification] Camera not active");
          return false;
        }

        headTurnDirectionRef.current = dir;
        setHeadTurnAttemptStatus("");
        isVerifyingHeadTurnRef.current = true;
        headTurnBlobRef.current = null;
        VerificationStatusRef.current = false;

        const msg = `Recording head movement (${dir.toUpperCase()}) â€” please move now...`;
        setVerificationMessage(msg);
        showMessage("", msg);

        await new Promise((r) => setTimeout(r, 100));

        const success = await _runVerification(dir);

        await new Promise((r) => setTimeout(r, 3000));

        isVerifyingHeadTurnRef.current = false;
        return success;
      } catch (outerErr) {
        logService.log("error", `[HeadVerification] Unexpected error: ${outerErr}`);
        setVerificationMessage("âŒ Unexpected error during verification.");
        isVerifyingHeadTurnRef.current = false;
        return false;
      }
    },
    [isCameraOn, logService, showMessage]
  );

  /* Angular: runVerification */
  const _runVerification = useCallback(
    (dir: "left" | "right" | "up" | "down"): Promise<boolean> => {
      return new Promise((resolve) => {
        try {
          const tempChunks: Blob[] = [];
          let recorder: MediaRecorder | null = null;
          let success = false;
          let isRecordingLocal = false;

          try {
            recorder = new MediaRecorder(streamRef.current!, {
              mimeType: "video/webm;codecs=vp9",
            });
          } catch (err) {
            logService.log("error", `[HeadVerification] Failed to create MediaRecorder: ${err}`);
            resolve(false);
            return;
          }

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) tempChunks.push(e.data);
          };

          recorder.onstop = () => {
            const blob = new Blob(tempChunks, { type: "video/webm" });
            headTurnBlobRef.current = blob;
            if (success) {
              setVerificationMessage("âœ… Head movement verified â€” downloading...");
              logService.log("info", "[HeadVerification] ðŸŽ¥ Recording complete. Starting download.");
              showMessage("headTurnAttemptStatus", "âœ… Head movement verified â€” downloading...");
              resolve(true);
            } else {
              logService.log("info", "[HeadVerification] ðŸŽ¥ Recording complete. No verification.");
              resolve(false);
            }
          };

          const yawThreshold = 0.35;
          const pitchThreshold = 0.38;
          const upThreshold = 0.12;

          const nearYawThreshold = yawThreshold * 0.2;
          const nearPitchThresholdDown = 0.27;
          const nearPitchThresholdUp = 0.2;

          logService.log(
            "info",
            `[HeadVerification] Started. Direction: ${dir}, YawThreshold: ${yawThreshold}, PitchThreshold: ${pitchThreshold}`
          );
          showMessage(
            "headTurnAttemptStatus",
            `[HeadVerification] Started. Direction: ${dir}, YawThreshold: ${yawThreshold}, PitchThreshold: ${pitchThreshold}`
          );

          _startBlinking(dir);

          try {
            const ctx = overlayCanvasRef.current?.getContext("2d");
            if (ctx && overlayCanvasRef.current)
              ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
          } catch (err) {
            logService.log("warn", `[HeadVerification] Could not clear overlay canvas: ${err}`);
          }

          const sampler = setInterval(() => {
            try {
              if (!lastLandmarksRef.current || !lastBoxRef.current || !ovalRef.current) return;

              const box = lastBoxRef.current;
              const faceCenterX = box.x + box.width / 2;
              const faceCenterY = box.y + box.height / 2;
              const dx = faceCenterX - ovalRef.current.cx;
              const dy = faceCenterY - ovalRef.current.cy;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist > ovalRef.current.rOuter) {
                if (isRecordingLocal && recorder && recorder.state !== "inactive") {
                  logService.log("info", "[HeadVerification] User moved outside oval, stopping recording.");
                  recorder.stop();
                  isRecordingLocal = false;
                }
                return;
              }

              let isVerified = false;

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

              if (dir === "left" || dir === "right") {
                const yaw = yawFromLandmarks(lastLandmarksRef.current);
                lastYawRef.current = yaw;
                logService.log("info", `[HeadVerification] Yaw: ${yaw.toFixed(3)}`);


                if (
                  !isRecordingLocal &&
                  ((dir === "left" && yaw < -nearYawThreshold) ||
                    (dir === "right" && yaw > nearYawThreshold))
                ) {
                  recorder?.start();
                  isRecordingLocal = true;
                  showMessage("", `Started recording for Head Turn ${dir}`);
                  logService.log("info", "[HeadVerification] Started recording (near yaw threshold).");
                }

                if (
                  isRecordingLocal &&
                  !((dir === "left" && yaw < -nearYawThreshold) ||
                    (dir === "right" && yaw > nearYawThreshold))
                ) {
                  recorder?.stop();
                  isRecordingLocal = false;
                  logService.log("info", "[HeadVerification] Stopped recording (yaw out of near threshold).");
                }

                if ((dir === "left" && yaw < -yawThreshold) || (dir === "right" && yaw > yawThreshold)) {
                  isVerified = true;
                }
              } else if (dir === "down" || dir === "up") {
                const pitch = pitchFromLandmarks(lastLandmarksRef.current);
                lastPitchRef.current = pitch;
                logService.log("info", `[HeadVerification] Pitch: ${pitch.toFixed(3)}`);

                if (dir === "down") {
                  if (!isRecordingLocal && pitch > nearPitchThresholdDown) {
                    showMessage("", `Started recording for Head ${dir}`);
                    recorder?.start();
                    isRecordingLocal = true;
                    logService.log("info", "[HeadVerification] Started recording (near down pitch threshold).");
                  }
                  if (isRecordingLocal && pitch <= nearPitchThresholdDown) {
                    recorder?.stop();
                    isRecordingLocal = false;
                    logService.log("info", "[HeadVerification] Stopped recording (down pitch below near threshold).");
                  }
                  if (pitch > pitchThreshold) {
                    isVerified = true;
                    success = true;
                    showMessage("verificationMessage", "âœ… DOWN movement detected.");
                    logService.log(
                      "info",
                      `[HeadVerification] âœ… DOWN detected. Pitch: ${pitch.toFixed(3)} > ${pitchThreshold}`
                    );
                  } else {
                    showMessage("verificationMessage", "â¬‡ï¸ Not enough DOWN movement.");
                  }
                } else if (dir === "up") {
                  if (!isRecordingLocal && pitch < nearPitchThresholdUp) {
                    recorder?.start();
                    isRecordingLocal = true;
                    logService.log("info", "[HeadVerification] Started recording (near up pitch threshold).");
                  }
                  if (isRecordingLocal && pitch >= nearPitchThresholdUp) {
                    recorder?.stop();
                    isRecordingLocal = false;
                    logService.log("info", "[HeadVerification] Stopped recording (up pitch above near threshold).");
                  }
                  if (pitch < upThreshold) {
                    isVerified = true;
                    success = true;
                    showMessage("verificationMessage", "âœ… UP movement detected.");
                    logService.log(
                      "info",
                      `[HeadVerification] âœ… UP detected. Pitch: ${pitch.toFixed(3)} < ${upThreshold}`
                    );
                  } else {
                    showMessage("verificationMessage", "â¬†ï¸ Not enough UP movement.");
                  }
                }
              }

              if (isVerified) {
                success = true;
                VerificationStatusRef.current = true;
                _stopBlinking();
                clearInterval(sampler);
                HeadTurnRecordingDoneRef.current = true;

                if (recorder && recorder.state !== "inactive") recorder.stop();

                const msg = `âœ… VERIFIED direction (${dir.toUpperCase()})!`;
                setStatusMessage(msg);

                // small UI glow effect (optional)
                const el = videoElementRef.current;
                if (el) {
                  el.classList.add("glow-green");
                  setTimeout(() => el.classList.remove("glow-green"), 3000);
                }
              }
            } catch (err) {
              logService.log("error", `[HeadVerification] Sampler error: ${err}`);
            }
          }, 150);

          setTimeout(() => {
            try {
              clearInterval(sampler);
              _stopBlinking();

              if (!success) {
                if (isRecordingLocal && recorder && recorder.state !== "inactive") recorder.stop();
                VerificationStatusRef.current = false;
                HeadTurnRecordingFailedRef.current = true;
                setVerificationMessage(
                  `âŒ Head movement (${dir.toUpperCase()}) not detected in time. Please try again.`
                );
                logService.log(
                  "error",
                  `[HeadVerification] âŒ TIMEOUT. Direction: ${dir} not verified in time.`
                );
                resolve(false);
              }
            } catch (err) {
              logService.log("error", `[HeadVerification] Timeout cleanup failed: ${err}`);
              resolve(false);
            }
          }, 30000);
        } catch (err) {
          logService.log("error", `[HeadVerification] Unexpected error in verification: ${err}`);
          resolve(false);
        }
      });
    },
    [logService]
  );

  /* Angular: _performVerificationForCurrentSegment */
  const _performVerificationForCurrentSegment = useCallback(async () => {
    setShowHeadTurnPrompt(true);

    let verificationDirection: "up" | "down" | "left" | "right";
    if (currentSegmentRef.current === 1) {
      verificationDirection = _getRandomDirection([]);
      firstVerificationDirectionRef.current = verificationDirection;
    } else if (currentSegmentRef.current === 2) {
      verificationDirection = _getRandomDirection([firstVerificationDirectionRef.current!]);
      secondVerificationDirectionRef.current = verificationDirection;
    } else {
      verificationDirection = _getRandomDirection([
        firstVerificationDirectionRef.current!,
        secondVerificationDirectionRef.current!,
      ]);
      thirdVerificationDirectionRef.current = verificationDirection;
    }

    setDirectionRef(verificationDirection);
    showMessage(
      "headTurnAttemptStatus",
      `Please ${
        verificationDirection === "left"
          ? "turn your head LEFT"
          : verificationDirection === "right"
          ? "turn your head RIGHT"
          : verificationDirection === "up"
          ? "tilt your head UP"
          : "tilt your head DOWN"
      }`
    );
    logService.log("info", `Prompting user to ${verificationDirection}`);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      showMessage("recordingMessage", `â¸ï¸ Paused segment recording for head verification.`);
    }

    let options: MediaRecorderOptions | undefined;
    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9"))
      options = { mimeType: "video/webm;codecs=vp9" };
    else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8"))
      options = { mimeType: "video/webm;codecs=vp8" };
    else if (MediaRecorder.isTypeSupported("video/webm"))
      options = { mimeType: "video/webm" };
    else {
      console.error("⚠️ No supported MediaRecorder MIME type found");
      return;
    }

    headRecordedChunksRef.current = [];
    headSegmentSecondsRecordedRef.current = 0;

    if (!streamRef.current || !(streamRef.current instanceof MediaStream)) {
    console.error("Invalid or missing stream for MediaRecorder.");
    return;
    }


    headMediaRecorderRef.current = new MediaRecorder(streamRef.current!, options);

    headMediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        headRecordedChunksRef.current.push(e.data);
        headSegmentSecondsRecordedRef.current++;
      }
    };

    headMediaRecorderRef.current.onstop = () => {
      const chunksToKeep = Math.min(headRecordedChunksRef.current.length, 3);
      const selectedChunks = headRecordedChunksRef.current.slice(-chunksToKeep);
      const headBlob = new Blob(selectedChunks, {
        type: options?.mimeType ?? "video/webm",
      });

      if (!headVerificationCountPerSegmentRef.current[currentSegmentRef.current])
        headVerificationCountPerSegmentRef.current[currentSegmentRef.current] = 0;

      headVerificationCountPerSegmentRef.current[currentSegmentRef.current]++;
      const count = headVerificationCountPerSegmentRef.current[currentSegmentRef.current];

      const a = document.createElement("a");
      a.style.display = "none";
      a.href = URL.createObjectURL(headBlob);
      a.download = `head${count}.webm`;
      document.body.appendChild(a);
      a.click();

      window.setTimeout(() => {
        URL.revokeObjectURL(a.href);
        document.body.removeChild(a);
      }, 100);

      showMessage("statusMessage", `Head verification video head${count}.webm downloaded.`);

      headRecordedChunksRef.current = [];
      headSegmentSecondsRecordedRef.current = 0;

      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused" && isRecordingRef.current) {
        mediaRecorderRef.current.resume();
        showMessage("recordingMessage", `â–¶ï¸ Resumed segment recording after head verification video.`);
      }
    };

    console.log(`Starting MediaRecorder for segment ${currentSegmentRef.current}`);

    headMediaRecorderRef.current.start();
    console.log("🎥 Recorder started with state:", headMediaRecorderRef.current.state);

    setTimeout(() => {
      console.log("⏱️ Recorder state after 2s:", mediaRecorderRef.current?.state);
    }, 2000);


    const success = await _startHeadMovementVerification(verificationDirection);

    if (headMediaRecorderRef.current.state === "recording" || headMediaRecorderRef.current.state === "paused") {
      headMediaRecorderRef.current.stop();
    }

    setShowHeadTurnPrompt(false);

    if (success) {
      verificationDoneForSegmentRef.current[currentSegmentRef.current] = true;
      headTurnAttemptsRef.current = 0;
      headTurnAttemptsPerSegmentRef.current[currentSegmentRef.current] = 0;
      showMessage("headTurnAttemptStatus", `âœ… Head turn verified.`);

      window.setTimeout(() => _startSegmentRecording(segmentSecondsRecordedRef.current), 600);
    } else {
      headTurnAttemptsRef.current++;
      headTurnAttemptsPerSegmentRef.current[currentSegmentRef.current] = headTurnAttemptsRef.current;
      showMessage(
        "headTurnAttemptStatus",
        `âŒ Head turn failed attempt ${headTurnAttemptsRef.current}. Please try again.`
      );

      if (headTurnAttemptsRef.current >= maxHeadTurnAttemptsRef.current) {
        if (currentSegmentRef.current === 1) {
          HeadTurnRecordingFailedRef.current = true;
          showMessage(
            "headTurnAttemptStatus",
            `âŒ Verification 1 failed ${headTurnAttemptsRef.current} times. Restarting all segments.`
          );
          _resetAll();
          window.setTimeout(() => _startSegmentRecording(0), 1000);
        } else if (currentSegmentRef.current === 2) {
          HeadTurnRecordingFailedRef.current = true;
          showMessage(
            "headTurnAttemptStatus",
            `âŒ Verification 2 failed. Will trigger verification 3 after final video.`
          );
          triggerVerification3Ref.current = true;
          window.setTimeout(
            () =>
              _startSegmentRecording(
                segmentDurationsRef.current[currentSegmentRef.current - 1]
              ),
            600
          );
        } else {
          HeadTurnRecordingFailedRef.current = true;
          showMessage("headTurnAttemptStatus", `âŒ Verification 3 failed. Restarting all.`);
          _resetAll();
          window.setTimeout(() => _startSegmentRecording(0), 1000);
        }
      } else {
        window.setTimeout(() => _performVerificationForCurrentSegment(), 1500);
      }
    }
  }, [_resetAll, _startHeadMovementVerification, _startSegmentRecording, showMessage]);

    /* Angular: _onSegmentComplete */
  const _onSegmentComplete = useCallback(async () => {
    showMessage("recordingMessage", `âœ… Segment ${currentSegmentRef.current} complete.`);

    if (currentSegmentRef.current < totalSegmentsRef.current) {
      currentSegmentRef.current++;
      verificationTimeInSegmentRef.current = 0;
      window.setTimeout(() => _startSegmentRecording(0), 600);
    } else {
      if (triggerVerification3Ref.current && !verificationDoneForSegmentRef.current[3]) {
        await _performVerificationForCurrentSegment();
      } else {
        isRecordingRef.current = false;
        showMessage("recordingMessage", "âœ… All segments & verifications complete. Thank you!");

        downloadLogs();
        window.setTimeout(() => _downloadAllBlobs(), 3000);
        setShowSuccessScreen(true);
      }
    }
  }, [downloadLogs, showMessage, _performVerificationForCurrentSegment, _startSegmentRecording]);


  /* Angular: getRandomDirection */
  const _getRandomDirection = (
    exclude: Array<"up" | "down" | "left" | "right">
  ): "up" | "down" | "left" | "right" => {
    const types: Array<"up" | "down" | "left" | "right"> = ["up", "down", "left", "right"];
    const filtered = types.filter((t) => !exclude.includes(t));
    return filtered[Math.floor(Math.random() * filtered.length)];
  };

  /* Angular: startBlinking / stopBlinking */
  const _startBlinking = (dir: "left" | "right" | "up" | "down") => {
    blinkingDirectionRef.current = dir;
    blinkVisibleRef.current = true;
    if (blinkIntervalIdRef.current) window.clearInterval(blinkIntervalIdRef.current);
    blinkIntervalIdRef.current = window.setInterval(() => {
      blinkVisibleRef.current = !blinkVisibleRef.current;
      _drawFaceGuideOverlay(currentBrightnessRef.current || 100);
    }, 500) as unknown as number;
  };
  const _stopBlinking = () => {
    if (blinkIntervalIdRef.current) {
      window.clearInterval(blinkIntervalIdRef.current);
      blinkIntervalIdRef.current = null;
    }
    blinkingDirectionRef.current = null;
    blinkVisibleRef.current = false;
    _drawFaceGuideOverlay(currentBrightnessRef.current || 100);
  };

  /* Angular: shouldVerifyAfterSegment */
  const _shouldVerifyAfterSegment = (segmentNumber: number): boolean => {
    if (segmentNumber === 1 || segmentNumber === 2) return true;
    if (segmentNumber === 3) {
      return (verificationSuccessForSegmentRef.current?.[2] === false);
    }
    return false;
  };

  /* Angular: drawFaceLandmarks (used for debugging overlays) */
  const _drawFaceLandmarks = (landmarks: faceapi.FaceLandmarks68, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "rgba(0, 255, 0, 0.8)";
    ctx.strokeStyle = "rgba(0, 255, 0, 0.6)";
    ctx.lineWidth = 2;

    landmarks.positions.forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    const drawPath = (points: faceapi.Point[], closePath = false) => {
      ctx.beginPath();
      points.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      if (closePath) ctx.closePath();
      ctx.stroke();
    };

    drawPath(landmarks.getJawOutline());
    drawPath(landmarks.getLeftEyeBrow());
    drawPath(landmarks.getRightEyeBrow());
    drawPath(landmarks.getNose());
    drawPath(landmarks.getLeftEye(), true);
    drawPath(landmarks.getRightEye(), true);
    drawPath(landmarks.getMouth(), true);

    const nose = landmarks.getNose()[3];
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();

    const leftEyeCenter = {
      x: (leftEye[0].x + leftEye[3].x) / 2,
      y: (leftEye[1].y + leftEye[5].y) / 2,
    };
    const rightEyeCenter = {
      x: (rightEye[0].x + rightEye[3].x) / 2,
      y: (rightEye[1].y + rightEye[5].y) / 2,
    };

    const eyeMidX = (leftEyeCenter.x + rightEyeCenter.x) / 2;
    const eyeMidY = (leftEyeCenter.y + rightEyeCenter.y) / 2;

    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(eyeMidX, eyeMidY, 5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(eyeMidX, eyeMidY);
    ctx.lineTo(nose.x, nose.y);
    ctx.stroke();

    if (lastYawRef.current !== undefined && lastPitchRef.current !== undefined) {
      ctx.fillStyle = "white";
      ctx.font = "16px Arial";
      ctx.fillText(`Yaw: ${lastYawRef.current.toFixed(3)}`, 10, 20);
      ctx.fillText(`Pitch: ${lastPitchRef.current.toFixed(3)}`, 10, 40);
      ctx.fillText(`Direction: ${headTurnDirectionRef.current || "none"}`, 10, 60);
      ctx.fillText(
        `Status: ${VerificationStatusRef.current ? "VERIFIED" : "detecting..."}`,
        10,
        80
      );
    }
  };

  /* Angular: startSmileVerification (kept for parity) */
  const _startSmileVerification = async () => {
    if (!isCameraOn) return;

    setVerificationMessage("ðŸ˜Š Please smile! Recording now...");
    const tempChunks: Blob[] = [];
    const recorder = new MediaRecorder(streamRef.current!);
    let success = false;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) tempChunks.push(e.data);
    };

    const smileThreshold = 0.6;

    const sampler = setInterval(async () => {
      try {
        const result = await faceapi
          .detectSingleFace(videoElementRef.current!, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        if (result && result.expressions.happy > smileThreshold) {
          success = true;
          clearInterval(sampler);
          try {
            recorder.stop();
          } catch {}
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Smile detection error:", err);
      }
    }, 200);

    recorder.start();

    setTimeout(() => {
      clearInterval(sampler);
      if (recorder.state !== "inactive") recorder.stop();
    }, 5000);

    await new Promise((res) => ((recorder.onstop as any) = res));

    if (tempChunks.length > 0) {
      headTurnBlobRef.current = new Blob(tempChunks, { type: "video/webm" });
    }

    if (success) {
      headTurnVerifiedRef.current = true;
      setVerificationMessage("âœ… Smile detected successfully!");
      _uploadAllBlobs();
      setTimeout(() => _downloadAllBlobs(), 7000);
    } else {
      setVerificationMessage("âŒ Smile not detected. Please try again.");
      setTimeout(() => _startSmileVerification(), 5000);
    }
  };

  /* Angular: generateSegmentDurations */
  const _generateSegmentDurations = () => {
    const firstVal = Math.floor(Math.random() * 2) + 2; // 2 or 3
    const secondVal = Math.floor(Math.random() * 3) + 2; // 2..4
    const lastVal = Math.max(totalDurationRef.current - (firstVal + secondVal), 1);
    segmentDurationsRef.current = [firstVal, secondVal, lastVal];
  };

  /* Angular: drawFaceGuideOverlay */
  const _drawFaceGuideOverlay = (brightness: number) => {
    const ctx = overlayCanvasRef.current?.getContext("2d");
    const canvas = overlayCanvasRef.current;
    if (!ctx || !canvas) return;

    // Check if the context is initialized and stroke style is set
    console.log("Drawing oval with context:", ctx);
    console.log("Current strokeStyle:", ctx.strokeStyle); // Log the strokeStyle  
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;

    const outerRadius = Math.min(w, h) * 0.35;
    const biggerRadius = outerRadius * 1.2;

    // background fill choice
    if (brightness < 60) {
      ctx.fillStyle = "white";
    } else if (brightness > 180) {
      ctx.fillStyle = "black";
    } else {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
    }
    ctx.fillRect(0, 0, w, h);

    // punch out bigger circle
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(cx, cy, biggerRadius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.globalCompositeOperation = "source-over";

    let outerStrokeColor = "#ffffff";
    if (isRecordingRef.current && ((timeRemaining < 6 && timeRemaining > 0) || isFaceDetected)) {
      outerStrokeColor = "#16a34a";
    }

    // outer bigger circle
    ctx.beginPath();
    ctx.arc(cx, cy, biggerRadius, 0, 2 * Math.PI);
    ctx.setLineDash([]);
    ctx.lineWidth = 5;
    ctx.strokeStyle = outerStrokeColor;
    ctx.stroke();

    // inner dashed alignment circle
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, 0, 2 * Math.PI);
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    // blinking arc guidance
    if (blinkingDirectionRef.current && blinkVisibleRef.current) {
      ctx.beginPath();
      ctx.lineWidth = 12;
      ctx.strokeStyle = "rgba(0,191,255,1)";
      ctx.shadowColor = "rgba(0,191,255,0.7)";
      ctx.shadowBlur = 20;

      const radius = biggerRadius + 10;
      let startAngle: number, endAngle: number;
      switch (blinkingDirectionRef.current) {
        case "left":
          startAngle = -Math.PI * 0.5;
          endAngle = Math.PI * 0.5;
          break;
        case "right":
          startAngle = Math.PI * 0.5;
          endAngle = Math.PI * 1.5;
          break;
        case "down":
          startAngle = 0;
          endAngle = Math.PI;
          break;
        case "up":
          startAngle = Math.PI;
          endAngle = Math.PI * 2;
          break;
        default:
          startAngle = 0;
          endAngle = 0;
          break;
      }
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // instruction text
    ctx.font = "18px Arial";
    ctx.fillStyle = "#ffffffff";
    ctx.textAlign = "center";
    ctx.fillText("Align your face within the white circles", cx, cy + biggerRadius + 20);

    // progress arc (optional, matching Angular var)
    if (isRecordingRef.current) {
      recordedFrameCountRef.current++;
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + 2 * Math.PI * ovalProgressRef.current;
      ctx.beginPath();
      ctx.arc(cx, cy, outerRadius, startAngle, endAngle);
      ctx.strokeStyle = "#16a34a";
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // store oval
    ovalRef.current = {
      cx,
      cy,
      rOuter: outerRadius,
      rInner: outerRadius * 0.7,
      w: outerRadius * 2,
      h: outerRadius * 2,
    };
  };

  /* simple wrappers to keep original Angular names used elsewhere */
  const _isVideoBlurred = isVideoBlurred;
  const _isVideoBlank = isVideoBlank;
  const _scheduleNextPublic = _scheduleNext;

  /* ------------------------------- JSX UI ------------------------------- */
  return (
<div style={{ position: "relative", width: `${overlaySize.width}px`, margin: "0 auto" }}>
  <video
    ref={videoRef}
    autoPlay
    playsInline
    muted
    style={{
      width: `${overlaySize.width}px`,
      height: `${overlaySize.height}px`,
      display: "block",
      borderRadius: "12px"
    }}
  />
  <canvas
    ref={overlayRef}
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: `${overlaySize.width}px`,
      height: `${overlaySize.height}px`,
      pointerEvents: "none"
    }}
  />
</div>
  );
}
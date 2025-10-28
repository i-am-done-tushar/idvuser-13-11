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

export function CameraSelfieStep({
  onComplete,
  submissionId,
}: CameraSelfieStepProps) {
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
  const [showHeadTurnPrompt, setShowHeadTurnPrompt] = useState(false);

  // Camera & Stream
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [segmentDurations, setSegmentDurations] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [segmentSecondsRecorded, setSegmentSecondsRecorded] = useState(0);

  // Refs for internal state (matches Angular component)
  const streamRef = useRef<MediaStream | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksPerSegmentRef = useRef<Record<number, Blob[]>>({});
  const completedSegmentsRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  const insideOvalFramesRef = useRef(0);
  const fillBufferRef = useRef<number[]>([]);
  const currentBrightnessRef = useRef(100);
  const faceMismatchCounterRef = useRef(0);
  const smoothingWindowRef = useRef(5);
  const stoppingForRestartRef = useRef(false);
  const restartCooldownRef = useRef(false);
  const lastAdjustedSegmentSecondsRecordedRef = useRef<number | null>(null);

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
        console.log("Setting TensorFlow.js backend to webgl...");
        await tf.setBackend("webgl");
        await tf.ready();
        console.log("TensorFlow backend:", tf.getBackend());

        console.log("Loading face-api models...");
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/assets/weights"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/assets/weights"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/assets/weights"),
          faceapi.nets.faceExpressionNet.loadFromUri("/assets/weights"),
        ]);
        console.log("✅ FaceAPI models loaded");

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

  const showMessage = useCallback(
    (key: string, msg: string, autoHide = false, duration = 2000) => {
      if (!msg) return;

      if (isMobile) {
        setMobileStatusMessage(msg);
      } else {
        switch (key) {
          case "statusMessage":
            setStatusMessage(msg);
            break;
          case "dashedCircleAlignMessage":
            setDashedCircleAlignMessage(msg);
            break;
          case "brightnessMessage":
            setBrightnessMessage(msg);
            break;
          case "distanceMessage":
            setDistanceMessage(msg);
            break;
          case "ovalAlignMessage":
            setOvalAlignMessage(msg);
            break;
          case "recordingMessage":
            setRecordingMessage(msg);
            break;
          case "verificationMessage":
            setVerificationMessage(msg);
            break;
          case "headTurnAttemptStatus":
            setHeadTurnAttemptStatus(msg);
            break;
        }
      }

      if (autoHide) {
        setTimeout(() => {
          if (isMobile) {
            setMobileStatusMessage("");
          } else {
            switch (key) {
              case "statusMessage":
                setStatusMessage("");
                break;
              case "dashedCircleAlignMessage":
                setDashedCircleAlignMessage("");
                break;
              case "brightnessMessage":
                setBrightnessMessage("");
                break;
              case "distanceMessage":
                setDistanceMessage("");
                break;
              case "ovalAlignMessage":
                setOvalAlignMessage("");
                break;
              case "recordingMessage":
                setRecordingMessage("");
                break;
              case "verificationMessage":
                setVerificationMessage("");
                break;
              case "headTurnAttemptStatus":
                setHeadTurnAttemptStatus("");
                break;
            }
          }
        }, duration);
      }
    },
    [isMobile],
  );

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

        console.log("Camera stream acquired and video playback started.");

        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length) {
          const settings = videoTracks[0].getSettings();
          console.log(`Camera settings: ${JSON.stringify(settings)}`);

          if (
            (settings.width && settings.width < 400) ||
            (settings.height && settings.height < 300)
          ) {
            showMessage(
              "cameraErrorMessage",
              "⚠️ Low camera resolution. Face detection may not work properly.",
            );
          }

          if (settings.frameRate && settings.frameRate < 15) {
            showMessage(
              "cameraErrorMessage",
              "⚠️ Low frame rate. Detection quality may be affected.",
            );
          }
        }

        const setupOverlay = () => {
          if (overlayRef.current && videoRef.current) {
            const w = videoRef.current.videoWidth || 640;
            const h = videoRef.current.videoHeight || 480;

            overlayRef.current.width = w;
            overlayRef.current.height = h;
            overlayCanvasRef.current = overlayRef.current;

            const outerRadius = Math.min(w, h) * 0.35;
            ovalRef.current = {
              w: w * 0.5,
              h: h * 0.6,
              cx: w / 2,
              cy: h / 2,
              rOuter: outerRadius,
              rInner: outerRadius * 0.7,
            };

            if (!brightnessCanvasRef.current) {
              brightnessCanvasRef.current = document.createElement("canvas");
              brightnessCanvasRef.current.width = w;
              brightnessCanvasRef.current.height = h;
            }

            console.log(
              `Overlay and brightness canvas set up with dimensions: ${w}x${h}`,
            );
          }
        };

        setupOverlay();
        videoRef.current.addEventListener("loadedmetadata", setupOverlay, {
          once: true,
        });

        setIsCameraOn(true);
        console.log("Starting detection loop via requestAnimationFrame.");
        startDetectionLoop();
      }
    } catch (err: any) {
      console.error("Camera initialization failed:", err);
      setCameraError(true);
    }
  };

  const getFrameBrightness = (): number => {
    if (!brightnessCanvasRef.current || !videoElementRef.current) return 0;

    const canvas = brightnessCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;

    ctx.drawImage(videoElementRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    let totalLuminance = 0;
    const numPixels = pixels.length / 4;

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      totalLuminance += 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    return totalLuminance / numPixels;
  };

  const isVideoBlurred = (): boolean => {
    if (!brightnessCanvasRef.current || !videoElementRef.current) return false;

    const canvas = brightnessCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    ctx.drawImage(videoElementRef.current, 0, 0, canvas.width, canvas.height);
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
  };

  const isVideoBlank = (): boolean => {
    if (!brightnessCanvasRef.current || !videoElementRef.current) return true;

    const canvas = brightnessCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return true;

    ctx.drawImage(videoElementRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

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
  };

  const checkDifferentFace = async (): Promise<boolean> => {
    if (!referenceFaceDescriptorRef.current || !videoElementRef.current) {
      return false;
    }

    try {
      const detection = await faceapi
        .detectSingleFace(
          videoElementRef.current,
          new faceapi.TinyFaceDetectorOptions(),
        )
        .withFaceDescriptor();

      if (detection && detection.descriptor) {
        const distance = faceapi.euclideanDistance(
          referenceFaceDescriptorRef.current,
          detection.descriptor,
        );
        console.log(
          `[FaceCheck] distance=${distance.toFixed(3)}, counter=${faceMismatchCounterRef.current}`,
        );

        if (distance > 0.6) {
          faceMismatchCounterRef.current++;

          if (faceMismatchCounterRef.current >= FACE_MISMATCH_THRESHOLD) {
            faceMismatchCounterRef.current = 0;
            return true;
          }
        } else {
          faceMismatchCounterRef.current = 0;
        }
      }
    } catch (err) {
      console.error("Face check error:", err);
      faceMismatchCounterRef.current = 0;
    }

    return false;
  };

  const startDetectionLoop = () => {
    const options = new faceapi.TinyFaceDetectorOptions();

    const loop = async () => {
      if (!isCameraOn || !videoElementRef.current) return;

      frameCountRef.current++;

      // Brightness checks
      if (frameCountRef.current % 6 === 0) {
        const brightness = getFrameBrightness();
        currentBrightnessRef.current = brightness;

        if (isVideoBlank()) {
          if (isRecording) {
            restartCurrentSegmentDueToFaceLoss();
          }
          showMessage(
            "cameraErrorMessage",
            "⚠️ Camera feed appears blank. Check your camera or refresh the page.",
          );
        } else if (brightness < 60) {
          if (isRecording) {
            restartCurrentSegmentDueToFaceLoss();
          }
          showMessage(
            "brightnessMessage",
            "🌑 Too dark — please move to a brighter place.",
          );
        } else if (brightness > 180) {
          if (isRecording) {
            restartCurrentSegmentDueToFaceLoss();
          }
          showMessage("brightnessMessage", "☀️ Too bright — reduce lighting.");
        } else {
          showMessage("brightnessMessage", "");
        }

        if (isVideoBlurred()) {
          if (isRecording) {
            restartCurrentSegmentDueToFaceLoss();
          }
          showMessage(
            "dashedCircleAlignMessage",
            "🔍 Video is blurry. Clean your camera lens or adjust focus.",
          );
        }
      }

      // Face detection
      if (frameCountRef.current % 1 === 0) {
        try {
          const res = await faceapi
            .detectSingleFace(videoElementRef.current, options)
            .withFaceLandmarks();

          if (res) {
            lastLandmarksRef.current = res.landmarks;
            lastBoxRef.current = res.detection.box;

            const box = res.detection.box;
            const landmarks = res.landmarks;
            const fillPct = (box.height / ovalRef.current.h) * 100;

            fillBufferRef.current.push(fillPct);
            if (fillBufferRef.current.length > smoothingWindowRef.current)
              fillBufferRef.current.shift();

            const smoothedFill =
              fillBufferRef.current.reduce((a, b) => a + b, 0) /
              fillBufferRef.current.length;
            const lowerBound = 55,
              upperBound = 80;

            let sizeOK = false;

            if (smoothedFill < lowerBound) {
              showMessage(
                "distanceMessage",
                "📏 Please move closer to the camera.",
              );
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

            if (sizeOK && faceInside) {
              insideOvalFramesRef.current++;
              showMessage("dashedCircleAlignMessage", "");

              if (insideOvalFramesRef.current >= 3) {
                showMessage(
                  "statusMessage",
                  "✅ Perfect! Stay still inside the dashed circle.",
                );
                setIsFaceDetected(true);

                checkDifferentFace();

                if (!isRecording) {
                  startRecordingSession();
                }
              }
            } else {
              insideOvalFramesRef.current = 0;
              setIsFaceDetected(false);

              if (isRecording) {
                restartCurrentSegmentDueToFaceLoss();
              }

              if (!sizeOK && !faceInside) {
                showMessage(
                  "dashedCircleAlignMessage",
                  "🧭 Make sure your full face is inside the dashed circle and adjust distance.",
                );
              } else if (!faceInside) {
                showMessage(
                  "dashedCircleAlignMessage",
                  "🧭 Your entire face must be inside the dashed circle.",
                );
              } else {
                showMessage("dashedCircleAlignMessage", "");
              }
            }
          } else {
            setIsFaceDetected(false);
            insideOvalFramesRef.current = 0;

            if (isRecording) {
              restartCurrentSegmentDueToFaceLoss();
            }
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

  const areLandmarksFullyInsideOval = (
    landmarks: faceapi.FaceLandmarks68,
  ): boolean => {
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
    ctx.fillText(
      "Align your face within the white circles",
      cx,
      cy + biggerRadius + 20,
    );
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
        "statusMessage",
        "🙋 Please align your face inside the circle and adjust distance before starting.",
      );
      return;
    }

    try {
      const detection = await faceapi
        .detectSingleFace(
          videoElementRef.current!,
          new faceapi.TinyFaceDetectorOptions(),
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection && detection.descriptor) {
        referenceFaceDescriptorRef.current = detection.descriptor;
        console.log("✅ Reference face captured");
      } else {
        console.log(
          "⚠️ Face not detected clearly; continuing without reference descriptor",
        );
      }
    } catch (err) {
      console.error("❌ FaceAPI error while capturing reference face:", err);
    }

    setCurrentSegment(1);
    setIsRecording(true);
    completedSegmentsRef.current = [];

    startSegmentRecording(0);
  };

  const startSegmentRecording = async (resumeSecondsRecorded = 0) => {
    if (!streamRef.current) {
      showMessage("statusMessage", "⚠️ Camera not initialized.");
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
      "recordingMessage",
      `🎥 Recording segment ${currentSegment}... (${segmentTarget - resumeSecondsRecorded}s left)`,
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
      const chunks = recordedChunksPerSegmentRef.current[currentSegment] || [];

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

  const restartCurrentSegmentDueToFaceLoss = () => {
    console.log("Attempting to restart current segment due to face loss.");

    if (restartCooldownRef.current) {
      console.log("Restart called but cooldown active. Ignoring.");
      return;
    }

    restartCooldownRef.current = true;
    console.log("Restart cooldown activated.");

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      stoppingForRestartRef.current = true;
      showMessage(
        "verificationMessage",
        "⚠️ Recording reset due to face loss. Continuing from current progress...",
      );
      console.log("Recording reset due to face loss or quality issues.");

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      try {
        console.log(
          `Stopping mediaRecorder. Current state: ${mediaRecorderRef.current.state}`,
        );
        mediaRecorderRef.current.stop();
        console.log("MediaRecorder.stop() called successfully.");
      } catch (stopErr) {
        console.error(
          `Error stopping mediaRecorder during restart: ${stopErr}`,
        );
      }
    } else {
      console.log("MediaRecorder not recording or undefined, skipping stop.");
    }

    setTimeout(() => {
      restartCooldownRef.current = false;
      console.log("Restart cooldown reset.");

      const segmentSeconds = segmentSecondsRecorded ?? 0;
      let resumeTime;

      if (
        segmentSeconds > 1 &&
        lastAdjustedSegmentSecondsRecordedRef.current !== segmentSeconds
      ) {
        resumeTime = segmentSeconds - 1;
        lastAdjustedSegmentSecondsRecordedRef.current = resumeTime;
        console.log(
          `Adjusted segmentSecondsRecorded by -1 for segment ${currentSegment}`,
        );
      } else {
        resumeTime = segmentSeconds;
      }

      console.log(
        `Resuming recording from ${resumeTime}s for segment ${currentSegment}.`,
      );

      if (
        !mediaRecorderRef.current ||
        mediaRecorderRef.current.state !== "recording"
      ) {
        console.log("Starting segment recording after restart.");
        startSegmentRecording(resumeTime);
      }
    }, 1000);
  };

  const finishRecording = () => {
    setIsRecording(false);
    showMessage(
      "recordingMessage",
      "✅ All segments & verifications complete. Thank you!",
    );
    setShowSuccessScreen(true);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

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
            ) : cameraError ? (
              <div className="flex flex-col items-center gap-4 p-8 rounded-lg border border-red-500 bg-red-50">
                <div className="text-xl font-bold text-red-700">
                  ❌ Camera Error
                </div>
                <div className="text-center text-red-600">
                  Unable to access camera. Please check your device settings or
                  try another device.
                </div>
              </div>
            ) : (
              <div className="flex w-full flex-col gap-4">
                {/* Video Feed Container */}
                <div className="flex w-full justify-center">
                  <div className="relative flex w-full max-w-[440px] min-h-[380px] flex-col items-center gap-2 rounded-lg border-[1.5px] border-dashed border-step-inactive-border bg-background overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <canvas
                      ref={overlayRef}
                      className="absolute top-0 left-0 w-full h-full"
                    />
                  </div>
                </div>

                {/* Status Messages */}
                <div className="w-full max-w-[440px] mx-auto space-y-2">
                  {statusMessage && (
                    <div className="text-sm p-2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {statusMessage}
                    </div>
                  )}
                  {recordingMessage && (
                    <div className="text-sm p-2 rounded bg-green-50 text-green-700 border border-green-200">
                      {recordingMessage}
                    </div>
                  )}
                  {dashedCircleAlignMessage && (
                    <div className="text-sm p-2 rounded bg-yellow-50 text-yellow-700 border border-yellow-200">
                      {dashedCircleAlignMessage}
                    </div>
                  )}
                  {brightnessMessage && (
                    <div className="text-sm p-2 rounded bg-orange-50 text-orange-700 border border-orange-200">
                      {brightnessMessage}
                    </div>
                  )}
                  {distanceMessage && (
                    <div className="text-sm p-2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                      {distanceMessage}
                    </div>
                  )}
                  {verificationMessage && (
                    <div className="text-sm p-2 rounded bg-red-50 text-red-700 border border-red-200">
                      {verificationMessage}
                    </div>
                  )}
                  {ovalAlignMessage && (
                    <div className="text-sm p-2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {ovalAlignMessage}
                    </div>
                  )}
                  {headTurnAttemptStatus && (
                    <div className="text-sm p-2 rounded bg-cyan-50 text-cyan-700 border border-cyan-200">
                      {headTurnAttemptStatus}
                    </div>
                  )}
                  {mobileStatusMessage && (
                    <div className="text-sm p-2 rounded bg-slate-50 text-slate-700 border border-slate-200">
                      {mobileStatusMessage}
                    </div>
                  )}
                </div>

                {/* Recording Progress */}
                {isRecording && currentSegment > 0 && (
                  <div className="w-full max-w-[440px] mx-auto">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>
                        Segment {currentSegment}/{TOTAL_SEGMENTS}
                      </span>
                      <span>{timeRemaining}s remaining</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            ((segmentSecondsRecorded /
                              (segmentDurations[currentSegment - 1] || 1)) *
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

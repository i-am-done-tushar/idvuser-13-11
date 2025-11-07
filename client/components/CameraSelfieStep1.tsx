// src/components/FaceThing.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Heavy libs: you can static import, or lazy-load them inside effects to cut bundle size.
// Static version:
import * as faceapi from "face-api.js";
import * as tf from "@tensorflow/tfjs";

// If you had a logger service in Angular, keep a tiny util or pass one via props:
// import { log, LogLevel } from "../utils/log"; // optional

// Env: replace Angular `environment` with your bundler’s env.
// Example (Vite): import.meta.env.VITE_API_BASE, VITE_SOME_FLAG
const API_BASE = import.meta.env.VITE_API_BASE as string | undefined;

// src/types/vision.ts
export type FaceGuideOval = {
  cx: number;
  cy: number;
  rOuter: number;
  rInner: number;
  w: number;
  h: number;
};

export type SegmentSubPart = {
  blob: Blob;
  startTime: number;
  endTime: number;
  duration: number;
};

export type PartialSegmentBlob = {
  blob: Blob;        // actual binary
  startTime: number; // seconds
  endTime: number;   // seconds
  duration: number;  // computed seconds
};

// src/types/opencv.d.ts
declare const cv: any; // If you know which APIs you use, narrow this later.
export {};



export type CameraSelfieStep1Props = {
  /** @Input() userId */
  userId: number;

  /** @Output() stepComplete -> onStepComplete */
  onStepComplete?: (stepNumber: number) => void;

  /** Optionally inject an HTTP client & logger (otherwise we'll use fetch/console) */
  http?: { get: (url: string, init?: RequestInit) => Promise<Response>; post: (url: string, body?: any, init?: RequestInit) => Promise<Response> };
};

// optional: shared cleanup type
type Disposable = () => void;

export default function CameraSelfieStep1(props: CameraSelfieStep1Props) {

  const disposablesRef = useRef<Disposable[]>([]);
  const registerDispose = useCallback((fn: Disposable) => {
    disposablesRef.current.push(fn);
  }, []);

  // OnDestroy equivalent
  useEffect(() => {
    return () => {
      for (const dispose of disposablesRef.current) {
        try { dispose(); } catch { /* ignore */ }
      }
      disposablesRef.current = [];
    };
  }, [])

}
  // central place to register teardowns (ngOnDestroy equivalent)


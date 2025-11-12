// Lightweight loader for OpenCV.js in the browser without touching public/index.html
// Usage:
//   import { loadOpenCv } from './opencvLoader';
//   await loadOpenCv(); // resolves when cv is ready

// When loading OpenCV globally via index.html, we don't inject scripts here.
// This module only waits for readiness and exposes a tiny status.

// Simple global status for diagnostics
function getStatusBag() {
  if (!window.__opencvLoad) {
    window.__opencvLoad = {
      startedAt: null,
      injected: false,
      initialized: false,
      ready: false,
      timedOut: false,
      error: null,
    };
  }
  return window.__opencvLoad;
}

let loadingPromise = null;

export async function loadOpenCv(opts = {}) {
  // If cv is already present and functional, resolve immediately
  if (window.cv && window.cv.Mat) {
    return window.cv;
  }

  if (!loadingPromise) {
    loadingPromise = new Promise(async (resolve, reject) => {
      try {
        const status = getStatusBag();
        status.startedAt = Date.now();
        // We expect OpenCV to be loaded globally via index.html
        // Wait until window.cv is available and initialized.
        const start = Date.now();
        const timeoutMs = opts.timeoutMs || 20000;
        const tick = () => {
          // Use the global flag set in index.html if present
          if (window.__cvReady && window.cv && window.cv.Mat) {
            const s = getStatusBag();
            s.initialized = true;
            s.ready = true;
            return resolve(window.cv);
          }
          // Fallback: if Mat exists, consider it ready
          if (window.cv && window.cv.Mat) {
            const s = getStatusBag();
            s.ready = true;
            return resolve(window.cv);
          }
          if (Date.now() - start > timeoutMs) {
            const s = getStatusBag();
            s.timedOut = true;
            return reject(new Error('Timed out waiting for OpenCV initialization'));
          }
          setTimeout(tick, 200);
        };
        setTimeout(tick, 200);
      } catch (e) {
        const status = getStatusBag();
        status.error = e && (e.message || String(e));
        reject(e);
      }
    });
  }

  return loadingPromise;
}

export async function waitForOpenCv() {
  try {
    await loadOpenCv();
    return true;
  } catch (e) {
    console.error('OpenCV failed to load:', e);
    return false;
  }
}

export function getOpenCvStatus() {
  try {
    return getStatusBag();
  } catch {
    return {};
  }
}

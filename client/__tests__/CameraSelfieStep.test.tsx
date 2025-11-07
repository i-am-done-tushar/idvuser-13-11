import React from 'react';
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import CameraSelfieStep from '@/components/CameraSelfieStep';

// ------------------ Global/DOM Mocks ------------------
const rafCbs: FrameRequestCallback[] = [];

function flushRaf(times = 1) {
  for (let i = 0; i < times; i++) {
    const cb = rafCbs.shift();
    if (cb) cb(performance.now());
  }
}

// Mock requestAnimationFrame
beforeEach(() => {
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
    rafCbs.push(cb);
    return rafCbs.length as unknown as number;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {} as any);
});

afterEach(() => {
  (window.requestAnimationFrame as any).mockRestore?.();
  (window.cancelAnimationFrame as any).mockRestore?.();
});

// Mock createElement for <a> clicks used in downloads
beforeEach(() => {
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  vi.spyOn(document, 'createElement').mockImplementation(((tagName: string) => {
    if (tagName.toLowerCase() === 'a') {
      return {
        href: '',
        download: '',
        click: vi.fn(),
        style: {},
        setAttribute: vi.fn(),
      } as any;
    }
    if (tagName.toLowerCase() === 'canvas') {
      return {
        width: 640,
        height: 480,
        getContext: vi.fn().mockReturnValue({
          drawImage: vi.fn(),
          getImageData: vi.fn().mockReturnValue({ data: new Uint8ClampedArray(640 * 480 * 4) }),
          clearRect: vi.fn(),
          beginPath: vi.fn(),
          arc: vi.fn(),
          stroke: vi.fn(),
          fill: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          rect: vi.fn(),
          save: vi.fn(),
          restore: vi.fn(),
          fillText: vi.fn(),
          font: '',
          textAlign: 'center',
          textBaseline: 'middle',
          strokeStyle: '',
          fillStyle: '',
          lineWidth: 1,
          setLineDash: vi.fn(),
        }),
        style: {},
      } as any;
    }
    return (document.createElement as any).mock.originalImpl(tagName);
  }) as any);
  (document.createElement as any).mock.originalImpl = document.createElement;
});

afterEach(() => {
  (URL.createObjectURL as any).mockRestore?.();
  (URL.revokeObjectURL as any).mockRestore?.();
  (document.createElement as any).mockRestore?.();
});

// ------------------ Browser APIs ------------------
class FakeMediaStreamTrack {
  kind: string;
  constructor(kind: 'video' | 'audio') { this.kind = kind; }
  stop() {}
  getSettings() { return { width: 640, height: 480, frameRate: 30 }; }
}

class FakeMediaStream implements MediaStream {
  // minimal impl
  active = true; id = 'fake-stream';
  onaddtrack: any; onremovetrack: any;
  addTrack(): void {}
  clone(): MediaStream { return this as any; }
  getAudioTracks(): MediaStreamTrack[] { return [new FakeMediaStreamTrack('audio') as any]; }
  getTrackById(): MediaStreamTrack | null { return null; }
  getTracks(): MediaStreamTrack[] { return [new FakeMediaStreamTrack('video') as any]; }
  getVideoTracks(): MediaStreamTrack[] { return [new FakeMediaStreamTrack('video') as any]; }
  removeTrack(): void {}
  addEventListener(): void {}
  removeEventListener(): void {}
  dispatchEvent(): boolean { return true; }
}

let getUserMediaMock: any;

beforeEach(() => {
  (global as any).navigator = (global as any).navigator || {};
  (global as any).navigator.mediaDevices = {
    getUserMedia: vi.fn(async () => new FakeMediaStream()),
  } as any;
  getUserMediaMock = (global as any).navigator.mediaDevices.getUserMedia;
});

afterEach(() => {
  getUserMediaMock.mockReset?.();
});

class FakeMediaRecorder {
  stream: MediaStream;
  state: 'inactive' | 'recording' | 'paused' = 'inactive';
  ondataavailable: ((event: any) => void) | null = null;
  onstop: (() => void) | null = null;
  constructor(stream: MediaStream) { this.stream = stream; }
  start() { this.state = 'recording'; }
  stop() { this.state = 'inactive'; this.onstop && this.onstop(); }
  pause() { if (this.state === 'recording') this.state = 'paused'; }
  resume() { if (this.state === 'paused') this.state = 'recording'; }
}

beforeEach(() => {
  (global as any).MediaRecorder = FakeMediaRecorder as any;
  (MediaRecorder as any).isTypeSupported = () => true;
});

// ------------------ face-api.js Mock ------------------
vi.mock('face-api.js', () => {
  const detectAllFaces = vi.fn(async () => []);

  const withFaceLandmarks = vi.fn().mockResolvedValue({
    landmarks: {
      positions: Array.from({ length: 68 }, (_, i) => ({ x: 320 + (i % 3), y: 240 + (i % 3) })),
      getLeftEye: () => [{ x: 290, y: 230 }, {}, {}, { x: 300, y: 230 }, {}, {}],
      getRightEye: () => [{}, {}, {}, { x: 340, y: 230 }, {}, {}],
      getNose: () => [{}, {}, {}, { x: 320, y: 250 }],
      getJawOutline: () => Array.from({ length: 17 }, (_, i) => ({ x: 300 + i, y: 300 })),
    },
    detection: { box: { x: 250, y: 150, width: 140, height: 180 } },
  });

  const detectSingleFace = vi.fn(() => ({ withFaceLandmarks }));

  const TinyFaceDetectorOptions = vi.fn();

  const nets = {
    tinyFaceDetector: { loadFromUri: vi.fn(async () => {}) },
    faceLandmark68Net: { loadFromUri: vi.fn(async () => {}) },
    faceRecognitionNet: { loadFromUri: vi.fn(async () => {}), isLoaded: true },
    faceExpressionNet: { loadFromUri: vi.fn(async () => {}) },
  };

  const euclideanDistance = vi.fn(() => 0.4);

  return { detectAllFaces, detectSingleFace, nets, TinyFaceDetectorOptions, euclideanDistance };
});

// ------------------ Helper to render component ------------------
function renderComponent() {
  const { container } = render(<CameraSelfieStep userId={1} onComplete={() => {}} />);

  // Attach a fake video element to satisfy refs and playback
  const videoEl = container.querySelector('video') as HTMLVideoElement | null;
  if (videoEl) {
    Object.defineProperty(videoEl, 'paused', { value: false, configurable: true });
    Object.defineProperty(videoEl, 'readyState', { value: 3, configurable: true });
    Object.defineProperty(videoEl, 'videoWidth', { value: 640, configurable: true });
    Object.defineProperty(videoEl, 'videoHeight', { value: 480, configurable: true });
    (videoEl as any).play = vi.fn(async function () {
      setTimeout(() => this.onplaying && this.onplaying(new Event('playing') as any), 0);
    });
  }
  return { container, videoEl };
}

// ------------------ Tests ------------------

describe('CameraSelfieStep', () => {
  beforeEach(() => {
    // neutral brightness: set getImageData to mid gray to avoid blank/too bright/dark warnings by default
    const getCtx = (document.createElement('canvas') as any).getContext as any;
    getCtx?.mock?.calls?.forEach?.((c: any) => {
      const ctx = c[0];
      if (ctx?.getImageData) {
        ctx.getImageData = vi.fn().mockReturnValue({
          data: new Uint8ClampedArray(640 * 480 * 4).fill(120),
        });
      }
    });
  });

  it('Should display a camera permission denied error', async () => {
    getUserMediaMock.mockRejectedValueOnce(Object.assign(new Error('denied'), { name: 'NotAllowedError' }));

    renderComponent();

    await waitFor(() => expect(screen.getByText(/camera permission denied/i)).toBeInTheDocument());
  });

  it('Should warn on low resolution from track settings', async () => {
    // Reduce resolution via getSettings
    class LowResTrack extends FakeMediaStreamTrack { getSettings() { return { width: 320, height: 200, frameRate: 30 }; } }
    class LowResStream extends FakeMediaStream { override getVideoTracks() { return [new LowResTrack('video') as any]; } }
    getUserMediaMock.mockResolvedValueOnce(new LowResStream());

    renderComponent();

    await waitFor(() => expect(screen.getByText(/low camera resolution/i)).toBeInTheDocument());
  });

  it('Should warn when camera FPS is too low', async () => {
    // Mock RAF so only ~10 frames in 1s measurement
    let start = performance.now();
    ;(window.requestAnimationFrame as any).mockImplementation((cb: FrameRequestCallback) => {
      start += 120; // ~8 FPS
      setTimeout(() => cb(start), 0);
      return 1 as any;
    });

    renderComponent();

    await waitFor(() => expect(screen.getByText(/camera fps is too low/i)).toBeInTheDocument());
  });

  it('Should show camera started successfully when video plays', async () => {
    renderComponent();

    await waitFor(() => expect(screen.getByText(/camera started successfully/i)).toBeInTheDocument());
  });

  it('Should clear brightness warnings when acceptable', async () => {
    renderComponent();

    // advance a few detection frames
    await act(async () => { flushRaf(5); });

    // Ensure no brightness warning is shown
    expect(screen.queryByText(/too dark/i)).toBeNull();
    expect(screen.queryByText(/too bright/i)).toBeNull();
  });

  it('Should show blank video warning', async () => {
    // Make getImageData return mostly black
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
      getImageData: vi.fn().mockReturnValue({ data: new Uint8ClampedArray(640 * 480 * 4).fill(0) }),
      clearRect: vi.fn(),
      setLineDash: vi.fn(),
    } as any);

    renderComponent();

    await act(async () => { flushRaf(10); });

    expect(screen.getByText(/camera feed appears blank/i)).toBeInTheDocument();
  });

  it('Should show guidance when face not aligned', async () => {
    // Override face-api to simulate no face first, then face
    const faceApi = await import('face-api.js');
    (faceApi as any).detectSingleFace.mockResolvedValueOnce({ withFaceLandmarks: vi.fn().mockResolvedValue(null) });

    renderComponent();

    await act(async () => { flushRaf(10); });

    // Expect guidance message (outside dashed circle or alignment)
    // Component uses various messages; check for any hint from dashed circle guidance
    expect(
      screen.queryByText(/your entire face must be inside the dashed circle/i) ||
      screen.queryByText(/make sure your full face is inside the dashed circle/i)
    ).not.toBeNull();
  });

  it('Should start face reference and segment when aligned enough frames', async () => {
    // Use default face-api mock that returns landmarks and a box
    renderComponent();

    // Push many RAFs to allow insideOvalFrames to reach required threshold
    await act(async () => { flushRaf(30); });

    // Status message indicating aligned and recording start steps were attempted
    expect(screen.getByText(/perfect! stay still inside the dashed circle/i)).toBeInTheDocument();
  });
});

# Enhanced Camera Selfie Component

## Overview

The `CameraSelfieStep` component has been significantly enhanced to match the functionality of the Angular version. It now includes advanced face detection, video recording, and verification features.

## Features Implemented

### 1. Face Detection & Alignment
- Real-time face detection using `face-api.js`
- Oval guide overlay for face alignment
- Automatic feedback when face is properly positioned
- Landmark-based alignment validation

### 2. Video Recording
- Segmented recording (3 segments totaling 10 seconds)
- Random segment duration distribution
- Automatic face detection during recording
- MediaRecorder integration for WebM format support

### 3. Brightness & Quality Checks
- Real-time brightness analysis
- Blur detection using variance calculation
- Environmental lighting feedback
- Automatic brightness-based overlay adjustment

### 4. Face Mismatch Detection
- Reference face descriptor capture at session start
- Continuous face identity verification
- Mismatch detection with cooldown threshold

### 5. Status Messages & UI
- Real-time status updates
- Mobile-responsive message display
- Color-coded feedback bubbles
- Progress indicators for recording

## Installation

### Dependencies Added
```json
{
  "@tensorflow/tfjs": "^4.17.0",
  "@tensorflow/tfjs-backend-webgl": "^4.17.0",
  "face-api.js": "^0.22.2"
}
```

### Setup Steps
1. Install dependencies: `pnpm install`
2. Ensure `/public/assets/weights/` directory exists with face-api models
3. The component will automatically load models on initialization

### Face-API Models Required
The following models must be available in `/public/assets/weights/`:
- `tiny_face_detector_model-weights_manifest.json`
- `tiny_face_detector_model-weights.bin`
- `face_landmark_68_model-weights_manifest.json`
- `face_landmark_68_model-weights.bin`
- `face_recognition_model-weights_manifest.json`
- `face_recognition_model-weights.bin`
- `face_expression_model-weights_manifest.json`
- `face_expression_model-weights.bin`

## Component Props

```typescript
interface CameraSelfieStepProps {
  onComplete?: () => void;           // Called when recording is finished
  submissionId?: number | null;      // User's submission ID for uploads
}
```

## Usage Example

```tsx
import { CameraSelfieStep } from "@/components/CameraSelfieStep";

export function MyPage() {
  const handleComplete = () => {
    console.log("Selfie recording complete!");
    // Navigate to next step
  };

  return (
    <CameraSelfieStep 
      onComplete={handleComplete}
      submissionId={123}
    />
  );
}
```

## Technical Implementation

### State Management
- React hooks for UI state
- Refs for non-render-affecting state (camera stream, detection loop)
- Separation of React state from animation frame callbacks

### Detection Loop
- Uses `requestAnimationFrame` for efficient face detection
- Periodic brightness checks (every 6 frames)
- Face detection at 1 frame interval
- Canvas overlay for real-time visual feedback

### Recording Flow
1. User aligns face in oval guide
2. Reference face descriptor captured
3. Segment recording starts
4. Timer counts down to segment duration
5. MediaRecorder captures video chunks
6. On completion, blobs are downloaded
7. `onComplete` callback fired

### Key Algorithms

#### Face Alignment Validation
```typescript
areLandmarksFullyInsideOval(landmarks: FaceLandmarks68): boolean
```
Checks if all 68 facial landmarks are within the detection radius (120% of oval radius).

#### Brightness Calculation
Uses Rec. 709 luminance formula:
```
L = 0.2126 * R + 0.7152 * G + 0.0722 * B
```

#### Blur Detection
Uses pixel variance calculation:
```
variance = sum(pixel²) / count - mean(pixel)²
```
Images with variance < 50 are considered blurry.

#### Face Mismatch Detection
Uses Euclidean distance between face descriptors:
```
distance = sqrt(sum((descriptor1[i] - descriptor2[i])²))
```
Distance > 0.6 indicates a different face.

## Performance Considerations

1. **TensorFlow.js Backend**: Uses WebGL backend for GPU acceleration
2. **Detection Frequency**: Detection runs at frame rate but brightness checks every 6 frames
3. **Canvas Operations**: Overlay canvas uses `clearRect` and drawing operations efficiently
4. **Memory Management**: Refs are used to prevent unnecessary re-renders

## Error Handling

The component handles:
- Camera permission denial
- Camera not found
- Camera in use by another app
- Face-API model loading failures
- MediaRecorder initialization errors
- Browser compatibility issues

## Mobile Responsiveness

- Detects mobile viewport (width ≤ 767px)
- Condenses status messages into single mobile message
- Responsive layout with flex containers
- Touch-friendly video element

## Browser Compatibility

- Modern browsers with WebRTC support
- WebGL backend support for TensorFlow.js
- MediaRecorder API support
- Canvas 2D context support

## Testing Recommendations

1. Test with good lighting conditions
2. Test with poor lighting (too dark/bright)
3. Test with blurry video
4. Test with multiple faces in frame
5. Test face mismatch detection
6. Test segment transitions
7. Test on mobile and desktop
8. Test with different camera devices

## Future Enhancements

The following features from the Angular component could be implemented:
1. Head movement verification (left, right, up, down)
2. Advanced pose estimation
3. Blink detection and counting
4. OpenCV integration for advanced image processing
5. Network retry logic for uploads
6. Smile detection and verification
7. Audio support

## Troubleshooting

### Models Not Loading
- Verify `/public/assets/weights/` directory exists
- Check browser console for CORS errors
- Ensure model files are accessible

### Face Not Detected
- Check lighting conditions
- Ensure face is centered in frame
- Verify camera is functioning properly
- Clear browser cache and reload

### Recording Not Starting
- Check browser microphone/camera permissions
- Verify MediaRecorder supported MIME type
- Check browser console for errors

### Video Not Playing
- Verify video container size
- Check video autoplay policies
- Ensure stream is properly connected

## Security Considerations

1. Face descriptors are stored in memory only, not persisted
2. Video blobs are handled locally before upload
3. No external camera access logging
4. All processing done client-side (WebGL)

## Dependencies Graph

```
CameraSelfieStep
├── face-api.js
│   └── @tensorflow/tfjs
│       └── @tensorflow/tfjs-backend-webgl
├── React hooks
│   └── useRef, useState, useEffect, useCallback
└── useToast (from @/hooks/use-toast)
```

## Constants

```typescript
const TOTAL_DURATION = 10;                    // Total video length in seconds
const TOTAL_SEGMENTS = 3;                     // Number of recording segments
const MAX_HEAD_TURN_ATTEMPTS = 2;             // Attempts for head verification
const FACE_MISMATCH_THRESHOLD = 3;            // Frames for mismatch detection
```

## License

This component uses:
- face-api.js (MIT License)
- TensorFlow.js (Apache 2.0 License)

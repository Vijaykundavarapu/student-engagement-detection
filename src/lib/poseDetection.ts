import { Pose, PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

export interface PoseKeypoint {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface PoseResult {
  landmarks: PoseKeypoint[];
  worldLandmarks?: PoseKeypoint[];
}

let poseLandmarker: PoseLandmarker | null = null;

export async function initializePoseDetector(): Promise<void> {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  );

  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
}

export function detectPose(videoElement: HTMLVideoElement, timestamp: number): PoseResult | null {
  if (!poseLandmarker) {
    console.error('Pose detector not initialized');
    return null;
  }

  const result = poseLandmarker.detectForVideo(videoElement, timestamp);

  if (result.landmarks && result.landmarks.length > 0) {
    return {
      landmarks: result.landmarks[0].map(landmark => ({
        x: landmark.x,
        y: landmark.y,
        z: landmark.z,
        visibility: landmark.visibility,
      })),
      worldLandmarks: result.worldLandmarks?.[0]?.map(landmark => ({
        x: landmark.x,
        y: landmark.y,
        z: landmark.z,
        visibility: landmark.visibility,
      })),
    };
  }

  return null;
}

export function drawPose(
  canvasElement: HTMLCanvasElement,
  landmarks: PoseKeypoint[]
): void {
  const ctx = canvasElement.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  const connections = [
    [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
    [11, 23], [12, 24], [23, 24],
    [23, 25], [24, 26], [25, 27], [26, 28],
    [27, 29], [28, 30], [29, 31], [30, 32],
    [0, 1], [1, 2], [2, 3], [3, 7],
    [0, 4], [4, 5], [5, 6], [6, 8],
  ];

  ctx.strokeStyle = '#00FF00';
  ctx.lineWidth = 2;

  connections.forEach(([start, end]) => {
    const startPoint = landmarks[start];
    const endPoint = landmarks[end];

    if (startPoint && endPoint &&
        (startPoint.visibility ?? 1) > 0.5 &&
        (endPoint.visibility ?? 1) > 0.5) {
      ctx.beginPath();
      ctx.moveTo(startPoint.x * canvasElement.width, startPoint.y * canvasElement.height);
      ctx.lineTo(endPoint.x * canvasElement.width, endPoint.y * canvasElement.height);
      ctx.stroke();
    }
  });

  ctx.fillStyle = '#FF0000';
  landmarks.forEach(landmark => {
    if ((landmark.visibility ?? 1) > 0.5) {
      ctx.beginPath();
      ctx.arc(
        landmark.x * canvasElement.width,
        landmark.y * canvasElement.height,
        5,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
  });

  ctx.restore();
}

export function calculateAngle(
  point1: PoseKeypoint,
  point2: PoseKeypoint,
  point3: PoseKeypoint
): number {
  const radians = Math.atan2(point3.y - point2.y, point3.x - point2.x) -
    Math.atan2(point1.y - point2.y, point1.x - point2.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) {
    angle = 360 - angle;
  }

  return angle;
}

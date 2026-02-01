import { PoseKeypoint, calculateAngle } from './poseDetection';

export type EngagementLevel = 'engaged' | 'neutral' | 'distracted';

export interface EngagementResult {
  level: EngagementLevel;
  confidence: number;
  headAngle: number;
  shoulderAngle: number;
  details: string;
}

const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE: 2,
  RIGHT_EYE: 5,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
};

export function classifyEngagement(landmarks: PoseKeypoint[]): EngagementResult {
  const nose = landmarks[POSE_LANDMARKS.NOSE];
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
  const leftEar = landmarks[POSE_LANDMARKS.LEFT_EAR];
  const rightEar = landmarks[POSE_LANDMARKS.RIGHT_EAR];
  const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
  const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];

  const shoulderMidpoint = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
    z: ((leftShoulder.z ?? 0) + (rightShoulder.z ?? 0)) / 2,
  };

  const hipMidpoint = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2,
    z: ((leftHip.z ?? 0) + (rightHip.z ?? 0)) / 2,
  };

  const headAngle = calculateAngle(
    shoulderMidpoint,
    nose,
    { x: nose.x, y: nose.y - 0.1, z: nose.z }
  );

  const shoulderAngle = calculateAngle(
    hipMidpoint,
    shoulderMidpoint,
    { x: shoulderMidpoint.x, y: shoulderMidpoint.y - 0.1, z: shoulderMidpoint.z }
  );

  const headTilt = Math.abs(leftEar.y - rightEar.y);

  const handsNearFace = (
    (Math.abs(leftWrist.y - nose.y) < 0.15 && Math.abs(leftWrist.x - nose.x) < 0.15) ||
    (Math.abs(rightWrist.y - nose.y) < 0.15 && Math.abs(rightWrist.x - nose.x) < 0.15)
  );

  const headDown = nose.y > shoulderMidpoint.y + 0.05;

  const uprightPosture = shoulderAngle < 30 && Math.abs(nose.x - shoulderMidpoint.x) < 0.1;

  const slouchingPosture = shoulderAngle > 40 || headDown;

  let level: EngagementLevel;
  let confidence: number;
  let details: string;

  if (handsNearFace) {
    level = 'distracted';
    confidence = 0.85;
    details = 'Hands near face - likely distracted or bored';
  } else if (headDown && slouchingPosture) {
    level = 'distracted';
    confidence = 0.8;
    details = 'Head down with slouched posture - not engaged';
  } else if (uprightPosture && !headDown && headTilt < 0.08) {
    level = 'engaged';
    confidence = 0.9;
    details = 'Upright posture, head level - actively engaged';
  } else if (slouchingPosture) {
    level = 'neutral';
    confidence = 0.7;
    details = 'Slouched posture - moderate engagement';
  } else if (headTilt > 0.12) {
    level = 'distracted';
    confidence = 0.75;
    details = 'Significant head tilt - attention elsewhere';
  } else {
    level = 'neutral';
    confidence = 0.65;
    details = 'Neutral posture - moderate engagement';
  }

  return {
    level,
    confidence,
    headAngle,
    shoulderAngle,
    details,
  };
}

export function getEngagementColor(level: EngagementLevel): string {
  switch (level) {
    case 'engaged':
      return '#10b981';
    case 'neutral':
      return '#f59e0b';
    case 'distracted':
      return '#ef4444';
  }
}

export function getEngagementLabel(level: EngagementLevel): string {
  switch (level) {
    case 'engaged':
      return 'Engaged';
    case 'neutral':
      return 'Neutral';
    case 'distracted':
      return 'Distracted';
  }
}

import { useEffect, useRef, useState } from 'react';
import { Camera, Square } from 'lucide-react';
import { initializePoseDetector, detectPose, drawPose } from '../lib/poseDetection';
import { classifyEngagement, EngagementResult, getEngagementColor, getEngagementLabel } from '../lib/engagementClassifier';
import { createDetection } from '../lib/database';

interface PoseDetectorProps {
  sessionId: string | null;
  isRecording: boolean;
  onDetectionUpdate?: (result: EngagementResult) => void;
}

export default function PoseDetector({ sessionId, isRecording, onDetectionUpdate }: PoseDetectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentEngagement, setCurrentEngagement] = useState<EngagementResult | null>(null);
  const [error, setError] = useState<string>('');
  const animationFrameRef = useRef<number>();
  const lastSaveTimeRef = useRef<number>(0);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        await initializePoseDetector();
        if (mounted) {
          setIsInitialized(true);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to initialize pose detector');
          console.error(err);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
        setError('');
        startDetection();
      }
    } catch (err) {
      setError('Failed to access camera. Please grant camera permissions.');
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    setIsStreaming(false);
  };

  const startDetection = () => {
    const processFrame = async () => {
      if (!videoRef.current || !canvasRef.current || !isStreaming) return;

      const timestamp = performance.now();
      const poseResult = detectPose(videoRef.current, timestamp);

      if (poseResult && poseResult.landmarks) {
        drawPose(canvasRef.current, poseResult.landmarks);

        const engagementResult = classifyEngagement(poseResult.landmarks);
        setCurrentEngagement(engagementResult);

        if (onDetectionUpdate) {
          onDetectionUpdate(engagementResult);
        }

        if (isRecording && sessionId && timestamp - lastSaveTimeRef.current > 2000) {
          lastSaveTimeRef.current = timestamp;
          await createDetection(
            sessionId,
            engagementResult.level,
            engagementResult.confidence,
            { landmarks: poseResult.landmarks },
            engagementResult.headAngle
          );
        }
      }

      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    processFrame();
  };

  const toggleCamera = () => {
    if (isStreaming) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Camera className="w-6 h-6" />
            Real-Time Pose Detection
          </h2>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              className="w-full h-auto"
              style={{ transform: 'scaleX(-1)' }}
            />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="absolute top-0 left-0 w-full h-full"
              style={{ transform: 'scaleX(-1)' }}
            />

            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">Camera is off</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 mb-4">
            <button
              onClick={toggleCamera}
              disabled={!isInitialized}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                isInitialized
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isStreaming ? 'Stop Camera' : 'Start Camera'}
            </button>
          </div>

          {currentEngagement && isStreaming && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-700 mb-3">Current Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="p-4 rounded-lg border-2"
                  style={{ borderColor: getEngagementColor(currentEngagement.level) }}
                >
                  <div className="text-sm text-gray-600 mb-1">Engagement Level</div>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: getEngagementColor(currentEngagement.level) }}
                  >
                    {getEngagementLabel(currentEngagement.level)}
                  </div>
                </div>

                <div className="p-4 rounded-lg border-2 border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Confidence</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {(currentEngagement.confidence * 100).toFixed(0)}%
                  </div>
                </div>

                <div className="col-span-2 p-4 rounded-lg bg-gray-50">
                  <div className="text-sm text-gray-600 mb-1">Analysis</div>
                  <div className="text-gray-800">{currentEngagement.details}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

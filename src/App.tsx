import { useState } from 'react';
import { GraduationCap, Info } from 'lucide-react';
import PoseDetector from './components/PoseDetector';
import SessionControl from './components/SessionControl';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import SessionHistory from './components/SessionHistory';
import { Session } from './lib/supabase';

function App() {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleSessionStart = (session: Session) => {
    setCurrentSession(session);
  };

  const handleSessionEnd = () => {
    setCurrentSession(null);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Student Engagement Detection System
                </h1>
                <p className="text-gray-600">Computer Vision-Based Pose Estimation</p>
              </div>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
            >
              {showHistory ? 'Hide History' : 'View History'}
            </button>
          </div>
        </header>

        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">About This System</p>
              <p>
                This application uses MediaPipe pose estimation to detect student engagement levels in real-time.
                Based on research in computer vision and learning analytics, it classifies posture into three categories:
                <span className="font-semibold"> Engaged</span> (upright, attentive),
                <span className="font-semibold"> Neutral</span> (moderate attention), and
                <span className="font-semibold"> Distracted</span> (slouched, hands on face, head down).
              </p>
            </div>
          </div>
        </div>

        {showHistory ? (
          <SessionHistory />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PoseDetector
                sessionId={currentSession?.id || null}
                isRecording={!!currentSession}
              />

              <div className="mt-6">
                <AnalyticsDashboard sessionId={currentSession?.id || null} />
              </div>
            </div>

            <div>
              <SessionControl
                onSessionStart={handleSessionStart}
                onSessionEnd={handleSessionEnd}
                currentSession={currentSession}
              />
            </div>
          </div>
        )}

        <footer className="mt-12 text-center text-gray-600 text-sm">
          <p>
            Based on research: "Computer Vision-Based Pose Estimation for Student Engagement Detection"
          </p>
          <p className="mt-1">YOLO, MediaPipe, and CNN-based approaches for educational analytics</p>
        </footer>
      </div>
    </div>
  );
}

export default App;

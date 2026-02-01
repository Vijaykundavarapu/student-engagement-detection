import { useState } from 'react';
import { Play, Square, Clock } from 'lucide-react';
import { createSession, endSession } from '../lib/database';
import { Session } from '../lib/supabase';

interface SessionControlProps {
  onSessionStart: (session: Session) => void;
  onSessionEnd: () => void;
  currentSession: Session | null;
}

export default function SessionControl({ onSessionStart, onSessionEnd, currentSession }: SessionControlProps) {
  const [sessionTitle, setSessionTitle] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  const handleStartSession = async () => {
    if (!sessionTitle.trim()) {
      alert('Please enter a session title');
      return;
    }

    setIsStarting(true);
    const session = await createSession(sessionTitle);

    if (session) {
      onSessionStart(session);
      setSessionTitle('');
    } else {
      alert('Failed to create session');
    }

    setIsStarting(false);
  };

  const handleEndSession = async () => {
    if (!currentSession) return;

    const success = await endSession(currentSession.id);
    if (success) {
      onSessionEnd();
    } else {
      alert('Failed to end session');
    }
  };

  const getSessionDuration = () => {
    if (!currentSession) return '00:00';

    const start = new Date(currentSession.started_at).getTime();
    const now = Date.now();
    const duration = Math.floor((now - start) / 1000);

    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Session Control</h2>

      {!currentSession ? (
        <div>
          <div className="mb-4">
            <label htmlFor="sessionTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Session Title
            </label>
            <input
              id="sessionTitle"
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="e.g., Math Class - Period 1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleStartSession()}
            />
          </div>

          <button
            onClick={handleStartSession}
            disabled={isStarting || !sessionTitle.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all"
          >
            <Play className="w-5 h-5" />
            {isStarting ? 'Starting...' : 'Start Session'}
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800">Active Session</span>
              <span className="flex items-center gap-1 text-green-600">
                <Clock className="w-4 h-4" />
                <span className="font-mono font-semibold">{getSessionDuration()}</span>
              </span>
            </div>
            <div className="text-lg font-bold text-green-900">{currentSession.title}</div>
          </div>

          <button
            onClick={handleEndSession}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
          >
            <Square className="w-5 h-5" />
            End Session
          </button>
        </div>
      )}
    </div>
  );
}

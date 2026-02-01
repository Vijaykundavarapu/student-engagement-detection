import { useEffect, useState } from 'react';
import { History, Calendar, Clock, TrendingUp } from 'lucide-react';
import { getAllSessions, getSessionAnalytics } from '../lib/database';
import { Session, SessionAnalytics } from '../lib/supabase';

export default function SessionHistory() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionAnalytics, setSelectedSessionAnalytics] = useState<Map<string, SessionAnalytics>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setIsLoading(true);
    const sessionsData = await getAllSessions();
    setSessions(sessionsData);

    const analyticsMap = new Map<string, SessionAnalytics>();
    for (const session of sessionsData.slice(0, 10)) {
      const analytics = await getSessionAnalytics(session.id);
      if (analytics) {
        analyticsMap.set(session.id, analytics);
      }
    }
    setSelectedSessionAnalytics(analyticsMap);
    setIsLoading(false);
  };

  const formatDuration = (startDate: string, endDate: string | null) => {
    const start = new Date(startDate).getTime();
    const end = endDate ? new Date(endDate).getTime() : Date.now();
    const duration = Math.floor((end - start) / 1000);

    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <History className="w-6 h-6" />
          Session History
        </h2>
        <div className="text-center py-8 text-gray-500">Loading sessions...</div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <History className="w-6 h-6" />
          Session History
        </h2>
        <div className="text-center py-8 text-gray-500">
          <History className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No sessions yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <History className="w-6 h-6" />
        Session History
      </h2>

      <div className="space-y-3">
        {sessions.map((session) => {
          const analytics = selectedSessionAnalytics.get(session.id);
          const isActive = !session.ended_at;

          return (
            <div
              key={session.id}
              className={`p-4 border-2 rounded-lg transition-all ${
                isActive
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800">{session.title}</h3>
                  {isActive && (
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full mt-1">
                      Active
                    </span>
                  )}
                </div>
                {analytics && (
                  <div className="text-right">
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Avg: {(analytics.avg_engagement_score * 100).toFixed(0)}%
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(session.started_at)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(session.started_at, session.ended_at)}
                </div>
              </div>

              {analytics && analytics.total_detections > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Engaged:</span>
                      <span className="font-semibold text-green-600 ml-1">
                        {analytics.engaged_count}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Neutral:</span>
                      <span className="font-semibold text-yellow-600 ml-1">
                        {analytics.neutral_count}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Distracted:</span>
                      <span className="font-semibold text-red-600 ml-1">
                        {analytics.distracted_count}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

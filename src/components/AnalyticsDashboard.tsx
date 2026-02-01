import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, Activity } from 'lucide-react';
import { getSessionAnalytics, getSessionDetections } from '../lib/database';
import { SessionAnalytics, Detection } from '../lib/supabase';
import { getEngagementColor, getEngagementLabel } from '../lib/engagementClassifier';

interface AnalyticsDashboardProps {
  sessionId: string | null;
}

export default function AnalyticsDashboard({ sessionId }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (sessionId) {
      loadAnalytics();
      const interval = setInterval(loadAnalytics, 3000);
      return () => clearInterval(interval);
    }
  }, [sessionId]);

  const loadAnalytics = async () => {
    if (!sessionId) return;

    setIsLoading(true);
    const [analyticsData, detectionsData] = await Promise.all([
      getSessionAnalytics(sessionId),
      getSessionDetections(sessionId),
    ]);

    if (analyticsData) setAnalytics(analyticsData);
    if (detectionsData) setDetections(detectionsData);
    setIsLoading(false);
  };

  if (!sessionId) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-500">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Start a session to view analytics</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-500">
          <Activity className="w-8 h-8 mx-auto mb-2 animate-spin" />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  const getPercentage = (count: number) => {
    if (analytics.total_detections === 0) return 0;
    return ((count / analytics.total_detections) * 100).toFixed(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6" />
        Session Analytics
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-medium">Total Detections</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {analytics.total_detections}
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Engaged</span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {analytics.engaged_count}
            <span className="text-sm text-green-600 ml-2">
              ({getPercentage(analytics.engaged_count)}%)
            </span>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-600 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Neutral</span>
          </div>
          <div className="text-2xl font-bold text-yellow-900">
            {analytics.neutral_count}
            <span className="text-sm text-yellow-600 ml-2">
              ({getPercentage(analytics.neutral_count)}%)
            </span>
          </div>
        </div>

        <div className="p-4 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-medium">Distracted</span>
          </div>
          <div className="text-2xl font-bold text-red-900">
            {analytics.distracted_count}
            <span className="text-sm text-red-600 ml-2">
              ({getPercentage(analytics.distracted_count)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Engagement Distribution</h3>
        <div className="h-8 flex rounded-lg overflow-hidden">
          {analytics.engaged_count > 0 && (
            <div
              className="bg-green-500 flex items-center justify-center text-white text-sm font-semibold"
              style={{ width: `${getPercentage(analytics.engaged_count)}%` }}
            >
              {getPercentage(analytics.engaged_count)}%
            </div>
          )}
          {analytics.neutral_count > 0 && (
            <div
              className="bg-yellow-500 flex items-center justify-center text-white text-sm font-semibold"
              style={{ width: `${getPercentage(analytics.neutral_count)}%` }}
            >
              {getPercentage(analytics.neutral_count)}%
            </div>
          )}
          {analytics.distracted_count > 0 && (
            <div
              className="bg-red-500 flex items-center justify-center text-white text-sm font-semibold"
              style={{ width: `${getPercentage(analytics.distracted_count)}%` }}
            >
              {getPercentage(analytics.distracted_count)}%
            </div>
          )}
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Average Engagement Score</h3>
          <span className="text-2xl font-bold text-blue-600">
            {(analytics.avg_engagement_score * 100).toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="h-4 rounded-full transition-all duration-300"
            style={{
              width: `${analytics.avg_engagement_score * 100}%`,
              backgroundColor: analytics.avg_engagement_score > 0.7
                ? '#10b981'
                : analytics.avg_engagement_score > 0.4
                ? '#f59e0b'
                : '#ef4444',
            }}
          />
        </div>
      </div>

      {detections.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Detections</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {detections.slice(-10).reverse().map((detection) => (
              <div
                key={detection.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getEngagementColor(detection.engagement_level) }}
                  />
                  <span className="font-medium text-gray-800">
                    {getEngagementLabel(detection.engagement_level)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(detection.detected_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

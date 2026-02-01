import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Session = {
  id: string;
  title: string;
  started_at: string;
  ended_at: string | null;
  created_at: string;
};

export type Detection = {
  id: string;
  session_id: string;
  engagement_level: 'engaged' | 'neutral' | 'distracted';
  confidence: number;
  pose_data: Record<string, unknown>;
  head_angle: number | null;
  detected_at: string;
};

export type SessionAnalytics = {
  id: string;
  session_id: string;
  total_detections: number;
  engaged_count: number;
  neutral_count: number;
  distracted_count: number;
  avg_engagement_score: number;
  updated_at: string;
};

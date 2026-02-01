/*
  # Student Engagement Detection System Schema

  1. New Tables
    - `sessions`
      - `id` (uuid, primary key) - Unique session identifier
      - `title` (text) - Session name/title
      - `started_at` (timestamptz) - When the session started
      - `ended_at` (timestamptz) - When the session ended
      - `created_at` (timestamptz) - Record creation time
    
    - `detections`
      - `id` (uuid, primary key) - Unique detection identifier
      - `session_id` (uuid, foreign key) - Reference to session
      - `engagement_level` (text) - Classified engagement: engaged, neutral, distracted
      - `confidence` (numeric) - Confidence score (0-1)
      - `pose_data` (jsonb) - Raw pose keypoints data
      - `head_angle` (numeric) - Head tilt angle
      - `detected_at` (timestamptz) - When detection occurred
    
    - `session_analytics`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key) - Reference to session
      - `total_detections` (integer) - Total number of detections
      - `engaged_count` (integer) - Number of engaged detections
      - `neutral_count` (integer) - Number of neutral detections
      - `distracted_count` (integer) - Number of distracted detections
      - `avg_engagement_score` (numeric) - Average engagement score
      - `updated_at` (timestamptz) - Last update time

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (for demo purposes)
*/

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Classroom Session',
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create detections table
CREATE TABLE IF NOT EXISTS detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  engagement_level text NOT NULL CHECK (engagement_level IN ('engaged', 'neutral', 'distracted')),
  confidence numeric CHECK (confidence >= 0 AND confidence <= 1) DEFAULT 0.5,
  pose_data jsonb DEFAULT '{}',
  head_angle numeric,
  detected_at timestamptz DEFAULT now()
);

-- Create session analytics table
CREATE TABLE IF NOT EXISTS session_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
  total_detections integer DEFAULT 0,
  engaged_count integer DEFAULT 0,
  neutral_count integer DEFAULT 0,
  distracted_count integer DEFAULT 0,
  avg_engagement_score numeric DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo purposes)
CREATE POLICY "Public can view all sessions"
  ON sessions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can create sessions"
  ON sessions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can update sessions"
  ON sessions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view all detections"
  ON detections FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can create detections"
  ON detections FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can view analytics"
  ON session_analytics FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can create analytics"
  ON session_analytics FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can update analytics"
  ON session_analytics FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_detections_session_id ON detections(session_id);
CREATE INDEX IF NOT EXISTS idx_detections_detected_at ON detections(detected_at);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at);
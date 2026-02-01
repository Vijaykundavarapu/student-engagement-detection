import { supabase, Session, Detection, SessionAnalytics } from './supabase';
import { EngagementLevel } from './engagementClassifier';

export async function createSession(title: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from('sessions')
    .insert({ title })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating session:', error);
    return null;
  }

  if (data) {
    await supabase
      .from('session_analytics')
      .insert({ session_id: data.id })
      .select()
      .maybeSingle();
  }

  return data;
}

export async function endSession(sessionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('sessions')
    .update({ ended_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (error) {
    console.error('Error ending session:', error);
    return false;
  }

  return true;
}

export async function createDetection(
  sessionId: string,
  engagementLevel: EngagementLevel,
  confidence: number,
  poseData: Record<string, unknown>,
  headAngle: number
): Promise<Detection | null> {
  const { data, error } = await supabase
    .from('detections')
    .insert({
      session_id: sessionId,
      engagement_level: engagementLevel,
      confidence,
      pose_data: poseData,
      head_angle: headAngle,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating detection:', error);
    return null;
  }

  await updateSessionAnalytics(sessionId);

  return data;
}

async function updateSessionAnalytics(sessionId: string): Promise<void> {
  const { data: detections } = await supabase
    .from('detections')
    .select('engagement_level, confidence')
    .eq('session_id', sessionId);

  if (!detections) return;

  const totalDetections = detections.length;
  const engagedCount = detections.filter(d => d.engagement_level === 'engaged').length;
  const neutralCount = detections.filter(d => d.engagement_level === 'neutral').length;
  const distractedCount = detections.filter(d => d.engagement_level === 'distracted').length;

  const engagementScores = detections.map(d => {
    switch (d.engagement_level) {
      case 'engaged': return 1.0;
      case 'neutral': return 0.5;
      case 'distracted': return 0.0;
    }
  });

  const avgEngagementScore = engagementScores.length > 0
    ? engagementScores.reduce((a, b) => a + b, 0) / engagementScores.length
    : 0;

  await supabase
    .from('session_analytics')
    .update({
      total_detections: totalDetections,
      engaged_count: engagedCount,
      neutral_count: neutralCount,
      distracted_count: distractedCount,
      avg_engagement_score: avgEngagementScore,
      updated_at: new Date().toISOString(),
    })
    .eq('session_id', sessionId);
}

export async function getSessionAnalytics(sessionId: string): Promise<SessionAnalytics | null> {
  const { data, error } = await supabase
    .from('session_analytics')
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching analytics:', error);
    return null;
  }

  return data;
}

export async function getAllSessions(): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('started_at', { ascending: false });

  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }

  return data || [];
}

export async function getSessionDetections(sessionId: string): Promise<Detection[]> {
  const { data, error } = await supabase
    .from('detections')
    .select('*')
    .eq('session_id', sessionId)
    .order('detected_at', { ascending: true });

  if (error) {
    console.error('Error fetching detections:', error);
    return [];
  }

  return data || [];
}

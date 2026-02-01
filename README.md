# Student Engagement Detection System

A real-time computer vision application that detects and analyzes student engagement levels using pose estimation technology.

## Overview

This project implements the concepts from the research paper "Computer Vision-Based Pose Estimation for Student Engagement Detection: Trends and Challenges" by Tarigan et al. It uses MediaPipe for pose estimation and classifies student engagement into three categories:

- **Engaged**: Upright posture, head level, attentive position
- **Neutral**: Moderate engagement, some slouching
- **Distracted**: Hands on face, head down, poor posture

## Key Features

### Real-Time Pose Detection
- Uses MediaPipe Pose for efficient, browser-based pose estimation
- Detects 33 body landmarks in real-time
- Visual feedback with skeleton overlay on video stream

### Engagement Classification
- Analyzes head angle, shoulder posture, and hand positions
- Provides confidence scores for each classification
- Detailed analysis of detected behaviors

### Session Management
- Create and manage classroom monitoring sessions
- Track engagement over time
- Store all detections in Supabase database

### Analytics Dashboard
- Real-time engagement statistics
- Distribution charts showing engaged/neutral/distracted percentages
- Average engagement score calculation
- Recent detection history

### Session History
- View past sessions with analytics
- Compare engagement across different sessions
- Track session duration and timestamps

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Pose Estimation**: MediaPipe Pose (Lite model)
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React

## Research Background

This implementation is based on findings from recent systematic literature review that identified:

1. **YOLO-based methods** as most widely adopted for complex scenarios
2. **CNN-based methods** for high data efficiency with smaller datasets
3. **MediaPipe** as robust algorithm for keypoint detection
4. **Hybrid approaches** combining detection and pose estimation for best results

## Classification Methodology

The engagement classifier analyzes:

- **Head Position**: Vertical alignment relative to shoulders
- **Shoulder Angle**: Posture uprightness
- **Head Tilt**: Lateral head movement
- **Hand Position**: Proximity to face (distraction indicator)

## Database Schema

### Tables

1. **sessions**: Stores classroom session information
2. **detections**: Individual pose detections with engagement levels
3. **session_analytics**: Aggregated statistics per session

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Run database migrations (already applied via Supabase)

4. Start development server:
   ```bash
   npm run dev
   ```

5. Grant camera permissions when prompted

6. Start a session and begin monitoring!

## Usage

1. **Start Session**: Enter a session title and click "Start Session"
2. **Enable Camera**: Click "Start Camera" to begin pose detection
3. **Monitor**: Watch real-time engagement classification
4. **Analyze**: View analytics dashboard for session statistics
5. **End Session**: Click "End Session" to stop recording
6. **Review**: Check session history for past analytics

## Privacy Considerations

- Only pose keypoints are stored, not actual video/images
- Camera access required but video is processed locally
- Data stored in secure Supabase database
- No facial recognition or identification

## Performance

- Processes video at ~30 FPS on modern hardware
- Lightweight MediaPipe Lite model for efficiency
- Detection saved every 2 seconds to reduce database load
- Real-time analytics updates every 3 seconds

## Future Enhancements

Based on research opportunities identified:

- Multi-student detection in classroom settings
- Integration with facial expression analysis
- Improved accuracy with larger training datasets
- Export functionality for analytics reports
- Teacher alerts for low engagement patterns

## References

Tarigan, G. A., Elwirehardja, G. N., Nugroho, K. S., & Pardamean, B. (2025). Computer Vision-Based Pose Estimation for Student Engagement Detection: Trends and Challenges. 2025 7th International Conference on Cybernetics and Intelligent System (ICORIS).

## License

Educational and research purposes.

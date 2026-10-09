import React from 'react';

export default function FeaturesPage({ onNavigate, onOpenAuth }) {
  return (
    <div style={{ minHeight: '100vh', background: '#080c14', color: '#f1f5f9', padding: '20px 24px 60px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ fontSize: '2.6rem', fontWeight: 800 }}>
            AI Proctoring & <span style={{ color: '#818cf8' }}>Anti-Cheating Tech Showcase</span>
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '12px' }}>
            Multi-model computer vision architecture protecting exam integrity in real time.
          </p>
        </div>

        <div className="glass" style={{ padding: '36px', marginBottom: '32px', borderLeft: '4px solid #6366f1' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', color: '#818cf8' }}>1. YOLOv8 Small Phone & Device Detector</h2>
          <p style={{ color: '#94a3b8', lineHeight: 1.7 }}>
            Uses the Ultralytics <strong>YOLOv8 Small (`yolov8s.pt`)</strong> neural network (11.2M parameters) with CLAHE adaptive contrast preprocessing to detect mobile phones, handheld devices, laptops, and books under low lighting or room reflections.
          </p>
        </div>

        <div className="glass" style={{ padding: '36px', marginBottom: '32px', borderLeft: '4px solid #06b6d4' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', color: '#38bdf8' }}>2. MediaPipe FaceMesh Gaze & Head Pose Tracker</h2>
          <p style={{ color: '#94a3b8', lineHeight: 1.7 }}>
            Extracts 468 3D facial landmarks to calculate yaw and pitch tilt angles. Identifies gaze direction (`centered`, `looking_left`, `looking_right`, `looking_up`, `looking_down`) to flag students glancing away from screen.
          </p>
        </div>

        <div className="glass" style={{ padding: '36px', borderLeft: '4px solid #34d399' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', color: '#34d399' }}>3. OpenCV Face & Presence Counter</h2>
          <p style={{ color: '#94a3b8', lineHeight: 1.7 }}>
            Tracks student presence to flag student absence (0 faces) or multiple persons visible in the webcam stream.
          </p>
        </div>
      </div>
    </div>
  );
}

import React from 'react';

export default function FeaturesPage({ onNavigate, onOpenAuth }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #f8fafc)', color: 'var(--text-primary, #0f172a)', padding: '24px 32px 60px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a' }}>
            AI Proctoring & <span style={{ color: '#0066ff' }}>Anti-Cheating Tech Showcase</span>
          </h1>
          <p style={{ color: '#64748b', marginTop: '12px', fontSize: '1rem' }}>
            Multi-model computer vision architecture protecting exam integrity in real time.
          </p>
        </div>

        <div className="card" style={{ padding: '32px', marginBottom: '24px', borderLeft: '4px solid #0066ff' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px', color: '#0066ff' }}>1. YOLOv8 Small Phone & Device Detector</h2>
          <p style={{ color: '#64748b', lineHeight: 1.7, fontSize: '0.95rem' }}>
            Uses the Ultralytics <strong style={{ color: '#0f172a' }}>YOLOv8 Small (`yolov8s.pt`)</strong> neural network (11.2M parameters) with CLAHE adaptive contrast preprocessing to detect mobile phones, handheld devices, laptops, and books under low lighting or room reflections.
          </p>
        </div>

        <div className="card" style={{ padding: '32px', marginBottom: '24px', borderLeft: '4px solid #0284c7' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px', color: '#0284c7' }}>2. MediaPipe FaceMesh Gaze & Head Pose Tracker</h2>
          <p style={{ color: '#64748b', lineHeight: 1.7, fontSize: '0.95rem' }}>
            Extracts 468 3D facial landmarks to calculate yaw and pitch tilt angles. Identifies gaze direction (<strong style={{ color: '#0f172a' }}>`centered`, `looking_left`, `looking_right`, `looking_up`, `looking_down`</strong>) to flag students glancing away from screen.
          </p>
        </div>

        <div className="card" style={{ padding: '32px', borderLeft: '4px solid #10b981' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px', color: '#10b981' }}>3. OpenCV Face & Presence Counter</h2>
          <p style={{ color: '#64748b', lineHeight: 1.7, fontSize: '0.95rem' }}>
            Tracks student presence to flag student absence (0 faces) or multiple persons visible in the webcam stream.
          </p>
        </div>
      </div>
    </div>
  );
}

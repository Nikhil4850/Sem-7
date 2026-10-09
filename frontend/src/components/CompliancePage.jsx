import React from 'react';

export default function CompliancePage({ onNavigate }) {
  return (
    <div className="container" style={{ maxWidth: '1000px', margin: '40px auto', animation: 'fadeIn 0.4s ease' }}>
      
      <div className="card" style={{ padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="badge badge-info" style={{ marginBottom: '8px' }}>Regulatory & Privacy Standards</span>
          <h2 style={{ fontSize: '2rem' }}>Academic Integrity & AI Privacy Governance</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '8px' }}>
            EduVanguard Online Proctoring Platform operates under strict educational compliance frameworks.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-muted)' }}>
          
          <div style={{ background: 'var(--bg-dark)', padding: '24px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '8px' }}>🛡️ FERPA & Student Privacy Compliance</h3>
            <p>
              All video frames, biometric facial embeddings, and breach activity logs are encrypted in transit via SSL/TLS and at rest using AES-256 encryption. Webcam feeds are strictly processed locally or on secure isolated inference workers and are never sold or shared with third-party advertising networks.
            </p>
          </div>

          <div style={{ background: 'var(--bg-dark)', padding: '24px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '8px' }}>🤖 Ethical AI & Explainability Standards</h3>
            <p>
              Our computer vision models (YOLOv8s, MediaPipe, YuNet) provide objective computer vision telemetry (bounding box coordinates, gaze angles, face counts) without automated disciplinary actions. Final exam invalidation decisions are ALWAYS made by human university invigilators.
            </p>
          </div>

          <div style={{ background: 'var(--bg-dark)', padding: '24px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '8px' }}>⚖️ Candidate Appeal Rights</h3>
            <p>
              Candidates flagged for alleged violations have the right to request a formal review of the recorded evidence timeline by an independent Academic Appeals Committee within 14 days of exam completion.
            </p>
          </div>

        </div>

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <button className="btn btn-primary" onClick={() => onNavigate('landing')}>Return to Homepage</button>
        </div>
      </div>

    </div>
  );
}

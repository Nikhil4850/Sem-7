import React from 'react';

export default function Footer({ onNavigate }) {
  return (
    <footer style={{
      background: '#0f172a',
      color: '#94a3b8',
      borderTop: '1px solid #1e293b',
      padding: '60px 32px 30px',
      marginTop: 'auto',
      fontSize: '0.9rem'
    }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        
        {/* Main Footer Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          paddingBottom: '48px',
          borderBottom: '1px solid #1e293b'
        }}>
          
          {/* Brand Info */}
          <div style={{ maxWidth: '320px' }}>
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '16px' }}
              onClick={() => onNavigate && onNavigate('landing')}
            >
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0066ff 0%, #0052cc 100%)',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1.2rem',
                boxShadow: '0 4px 12px rgba(0, 102, 255, 0.3)'
              }}>
                🛡️
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
                Proctor<span style={{ color: '#0066ff' }}>AI</span>
              </span>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '20px' }}>
              The industry-standard AI proctoring platform powered by YOLOv8, MediaPipe 3D face mesh, and real-time WebSockets telemetry.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 10px #10b981',
                display: 'inline-block'
              }} />
              <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                All Systems Operational (99.99% Uptime)
              </span>
            </div>
          </div>

          {/* AI Engines & Technology */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', letterSpacing: '0.5px' }}>
              AI ENGINE TECH
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <li><button onClick={() => onNavigate && onNavigate('features')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0, textAlign: 'left' }}>YOLOv8 Phone Detector</button></li>
              <li><button onClick={() => onNavigate && onNavigate('features')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0, textAlign: 'left' }}>MediaPipe Gaze Estimator</button></li>
              <li><button onClick={() => onNavigate && onNavigate('features')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0, textAlign: 'left' }}>YuNet Multi-Person Counter</button></li>
              <li><button onClick={() => onNavigate && onNavigate('practice')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0, textAlign: 'left' }}>Camera Calibration Sandbox</button></li>
              <li><button onClick={() => onNavigate && onNavigate('health')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0, textAlign: 'left' }}>Sub-20ms Engine Telemetry</button></li>
            </ul>
          </div>

          {/* Educational Solutions */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', letterSpacing: '0.5px' }}>
              ACADEMIC PORTALS
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <li><button onClick={() => onNavigate && onNavigate('courses')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0, textAlign: 'left' }}>Accredited Courses</button></li>
              <li><button onClick={() => onNavigate && onNavigate('departments')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0, textAlign: 'left' }}>Faculty Directory</button></li>
              <li><button onClick={() => onNavigate && onNavigate('schedule')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0, textAlign: 'left' }}>Academic Timetable</button></li>
              <li><button onClick={() => onNavigate && onNavigate('certificates')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0, textAlign: 'left' }}>Certificate Hash Verifier</button></li>
              <li><button onClick={() => onNavigate && onNavigate('compliance')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0, textAlign: 'left' }}>FERPA Privacy Governance</button></li>
            </ul>
          </div>

          {/* Regulatory & Security */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', letterSpacing: '0.5px' }}>
              COMPLIANCE & TRUST
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', color: '#e2e8f0' }}>
                🛡️ <strong>FERPA & GDPR Compliant</strong>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>AES-256 Encrypted In-Flight & At-Rest</div>
              </div>
              <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', color: '#e2e8f0' }}>
                ⚖️ <strong>Human In-The-Loop Verdicts</strong>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Zero Automated Student Disqualification</div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Credits & Copyright */}
        <div style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          paddingTop: '28px',
          fontSize: '0.82rem',
          color: '#64748b'
        }}>
          <div>
            © {new Date().getFullYear()} ProctorAI Inc. All rights reserved. Powered by OpenCV, MediaPipe & PyTorch.
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <button onClick={() => onNavigate && onNavigate('compliance')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>Privacy Policy</button>
            <button onClick={() => onNavigate && onNavigate('compliance')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>Terms of Service</button>
            <button onClick={() => onNavigate && onNavigate('faq')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>Help Center</button>
            <button onClick={() => onNavigate && onNavigate('health')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>System Telemetry</button>
          </div>
        </div>

      </div>
    </footer>
  );
}

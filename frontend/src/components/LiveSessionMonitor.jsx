import React from 'react';

const DEMO_LIVE_SESSIONS = [
  { id: "SESS-881", student: "student_alex", status: "ACTIVE", suspicion: 90, lastEvent: "phone_detected", timeRemaining: "32:15", camera: "ONLINE" },
  { id: "SESS-882", student: "student_maria", status: "ACTIVE", suspicion: 20, lastEvent: "looking_away", timeRemaining: "28:40", camera: "ONLINE" },
  { id: "SESS-883", student: "student_jordan", status: "ACTIVE", suspicion: 40, lastEvent: "tab_switch", timeRemaining: "15:10", camera: "ONLINE" },
  { id: "SESS-884", student: "student_sam", status: "ACTIVE", suspicion: 0, lastEvent: "normal", timeRemaining: "41:00", camera: "ONLINE" }
];

export default function LiveSessionMonitor({ onNavigate }) {
  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{
            fontSize: '22px', fontWeight: '700',
            background: 'linear-gradient(135deg, #fff, #94a3b8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>Live Student Examination Monitor</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
            Real-Time Proctored Webcam Sessions & Threat Alert Feeds
          </p>
        </div>
        <div className="badge-green">
          🟢 Live Proctoring Engine Active
        </div>
      </div>

      {/* Grid of active sessions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {DEMO_LIVE_SESSIONS.map(sess => {
          const isHighAlert = sess.suspicion >= 50;
          return (
            <div
              key={sess.id}
              className="glass"
              style={{
                padding: '20px',
                borderLeft: isHighAlert ? '4px solid #ef4444' : '4px solid #34d399',
                display: 'flex', flexDirection: 'column'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '1rem' }}>
                  {sess.student}
                </span>
                <span className={isHighAlert ? 'pill pill-red' : 'pill pill-green'}>
                  {sess.status}
                </span>
              </div>

              {/* Simulated camera feed box */}
              <div style={{
                height: '140px', background: '#000', borderRadius: '10px',
                position: 'relative', display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: '16px', overflow: 'hidden',
                border: isHighAlert ? '1px solid #ef4444' : '1px solid var(--border)'
              }}>
                <div style={{ color: '#64748b', fontSize: '12px', textAlign: 'center' }}>
                  📷 LIVE STREAM: {sess.id}<br />
                  <span style={{ fontSize: '10px', color: '#4ade80' }}>● WEBCAM CONNECTED</span>
                </div>

                {isHighAlert && (
                  <div style={{
                    position: 'absolute', bottom: '8px', left: '8px', right: '8px',
                    background: 'rgba(239, 68, 68, 0.9)', color: '#fff',
                    padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700',
                    textAlign: 'center'
                  }}>
                    🚨 THREAT FLAG: {sess.lastEvent.toUpperCase()}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px' }}>
                <span>Suspicion Score:</span>
                <strong style={{ color: isHighAlert ? '#ef4444' : '#4ade80' }}>{sess.suspicion}/100</strong>
              </div>

              <div className="score-track" style={{ marginBottom: '16px' }}>
                <div className="score-fill" style={{ width: `${sess.suspicion}%`, background: isHighAlert ? '#ef4444' : '#22c55e' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
                <span>Remaining: {sess.timeRemaining}</span>
                <span>ID: {sess.id}</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

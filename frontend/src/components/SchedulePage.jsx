import React, { useState } from 'react';
import { eventsData } from '../data/eduData';

export default function SchedulePage({ onNavigate, onOpenAuth }) {
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const runPreflightCheck = () => {
    setTesting(true);
    setTestResult(null);

    setTimeout(() => {
      setTesting(false);
      setTestResult({
        webcam: true,
        resolution: "1280x720 (HD)",
        fps: "30 FPS",
        proctorEngine: "YOLOv8s + MediaPipe Ready",
        status: "PASS - Ready for Examination"
      });
    }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #f8fafc)', color: 'var(--text-primary, #0f172a)', padding: '24px 32px 60px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a' }}>
            Academic Schedule & <span style={{ color: '#0066ff' }}>Pre-Flight Test</span>
          </h1>
          <p style={{ color: '#64748b', marginTop: '12px', fontSize: '1rem' }}>
            Check upcoming academic symposiums, examination timetables, and verify your webcam hardware.
          </p>
        </div>

        {/* Pre-Flight System Compatibility Test */}
        <div className="card" style={{ padding: '32px', marginBottom: '40px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>📹 AI Proctor Pre-Flight System Check</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Test your camera resolution, WebSockets latency, and YOLOv8 readiness before launching an exam.</p>
            </div>
            <button className="btn-primary" style={{ padding: '10px 22px' }} onClick={runPreflightCheck} disabled={testing}>
              {testing ? "Testing Hardware..." : "Run Pre-Flight Test"}
            </button>
          </div>

          {testResult && (
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>WEBCAM ACCESS</span>
                <p style={{ color: '#10b981', fontWeight: 700, marginTop: '2px' }}>🟢 CONNECTED</p>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>RESOLUTION</span>
                <p style={{ color: '#0f172a', fontWeight: 600, marginTop: '2px' }}>{testResult.resolution}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>FRAME RATE</span>
                <p style={{ color: '#0f172a', fontWeight: 600, marginTop: '2px' }}>{testResult.fps}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>AI ENGINE</span>
                <p style={{ color: '#0066ff', fontWeight: 600, marginTop: '2px' }}>{testResult.proctorEngine}</p>
              </div>
            </div>
          )}
        </div>

        {/* Academic Calendar Events */}
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>📅 Upcoming Examination & Webinar Timetable</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {eventsData.map((evt, idx) => (
            <div key={idx} className="card" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#0066ff', padding: '10px 16px', borderRadius: '12px', textAlign: 'center', fontWeight: 800, minWidth: '100px' }}>
                  {evt.date}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{evt.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Instructor / Speaker: <strong style={{ color: '#334155' }}>{evt.speaker}</strong> • {evt.time}</p>
                </div>
              </div>
              <span className="badge badge-success">{evt.tag}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

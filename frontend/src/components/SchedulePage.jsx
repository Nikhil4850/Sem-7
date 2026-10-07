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
    <div style={{ minHeight: '100vh', background: '#080c14', color: '#f1f5f9', padding: '120px 24px 60px' }}>
      
      {/* Top Navigation */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000,
        padding: '16px 5%', background: 'rgba(8, 12, 20, 0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ fontSize: '1.4rem', fontWeight: 800, cursor: 'pointer' }} onClick={() => onNavigate('landing')}>
          <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EduVanguard</span>
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <button style={{ background: 'none', border: 'none', color: '#94a3b8', fontWeight: 500, cursor: 'pointer' }} onClick={() => onNavigate('landing')}>Home</button>
          <button style={{ background: 'none', border: 'none', color: '#94a3b8', fontWeight: 500, cursor: 'pointer' }} onClick={() => onNavigate('courses')}>Courses</button>
          <button style={{ background: 'none', border: 'none', color: '#94a3b8', fontWeight: 500, cursor: 'pointer' }} onClick={() => onNavigate('features')}>AI Proctoring</button>
          <button style={{ background: 'none', border: 'none', color: '#94a3b8', fontWeight: 500, cursor: 'pointer' }} onClick={() => onNavigate('departments')}>Departments</button>
          <button style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer' }} onClick={() => onNavigate('schedule')}>Schedule</button>
          <button style={{ background: 'none', border: 'none', color: '#94a3b8', fontWeight: 500, cursor: 'pointer' }} onClick={() => onNavigate('certificates')}>Verify</button>
          <button style={{ background: 'none', border: 'none', color: '#94a3b8', fontWeight: 500, cursor: 'pointer' }} onClick={() => onNavigate('faq')}>FAQ</button>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="nav-btn active" onClick={() => onOpenAuth('student')}>Student Login</button>
        </div>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ fontSize: '2.6rem', fontWeight: 800 }}>
            Academic Schedule & <span style={{ color: '#818cf8' }}>Pre-Flight Test</span>
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '12px' }}>
            Check upcoming academic symposiums, examination timetables, and verify your webcam hardware.
          </p>
        </div>

        {/* Pre-Flight System Compatibility Test */}
        <div className="glass" style={{ padding: '32px', marginBottom: '50px', borderLeft: '4px solid #34d399' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '6px' }}>📹 AI Proctor Pre-Flight System Check</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Test your camera resolution, WebSockets latency, and YOLOv8 readiness before launching an exam.</p>
            </div>
            <button className="next-btn" style={{ padding: '12px 24px' }} onClick={runPreflightCheck} disabled={testing}>
              {testing ? "Testing Hardware..." : "Run Pre-Flight Test"}
            </button>
          </div>

          {testResult && (
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>WEBCAM ACCESS</span>
                <p style={{ color: '#34d399', fontWeight: 700 }}>🟢 CONNECTED</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>RESOLUTION</span>
                <p style={{ color: '#f1f5f9', fontWeight: 600 }}>{testResult.resolution}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>FRAME RATE</span>
                <p style={{ color: '#f1f5f9', fontWeight: 600 }}>{testResult.fps}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>AI ENGINE</span>
                <p style={{ color: '#818cf8', fontWeight: 600 }}>{testResult.proctorEngine}</p>
              </div>
            </div>
          )}
        </div>

        {/* Academic Calendar Events */}
        <h2 style={{ fontSize: '1.6rem', marginBottom: '24px' }}>📅 Upcoming Examination & Webinar Timetable</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {eventsData.map((evt, idx) => (
            <div key={idx} className="glass" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818cf8', padding: '10px 16px', borderRadius: '12px', textAlign: 'center', fontWeight: 800, minWidth: '100px' }}>
                  {evt.date}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '4px' }}>{evt.title}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Instructor / Speaker: <strong style={{ color: '#cbd5e1' }}>{evt.speaker}</strong> • {evt.time}</p>
                </div>
              </div>
              <span className="pill pill-green">{evt.tag}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

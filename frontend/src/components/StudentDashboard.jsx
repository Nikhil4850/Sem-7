import React, { useState, useEffect } from 'react';

const DEMO_STUDENT_EXAMS = [
  { id: 1, title: "Computer Vision & YOLOv8 Mid-Term", subject: "Computer Vision", duration: "45 Mins", questions: 10, status: "READY", passingScore: 60 },
  { id: 2, title: "MediaPipe 3D Landmark Analytics Quiz", subject: "Facial Analytics", duration: "30 Mins", questions: 10, status: "SCHEDULED", passingScore: 70 },
  { id: 3, title: "FastAPI & WebSockets Architecture Final", subject: "Web Engineering", duration: "60 Mins", questions: 15, status: "COMPLETED", passingScore: 60, score: "90%" }
];

export default function StudentDashboard({ user, token, onStartExam, onNavigate }) {
  const [myResult, setMyResult] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/exam/my-result', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data && data.score !== undefined) setMyResult(data);
      })
      .catch(() => {});
  }, [token]);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      
      {/* Welcome Hero Banner */}
      <div className="glass" style={{ padding: '32px', marginBottom: '28px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.06))', borderLeft: '4px solid #6366f1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span style={{ color: '#818cf8', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.5px' }}>STUDENT ACADEMIC PORTAL</span>
            <h1 style={{ fontSize: '2rem', marginTop: '6px', marginBottom: '8px' }}>
              Welcome back, <span style={{ color: '#60a5fa' }}>{user.username}</span> 👋
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '650px', lineHeight: 1.6 }}>
              Your proctored examination environment is active. Review your upcoming tests, verify system readiness, or launch certification assessments below.
            </p>
          </div>
          <button className="next-btn" style={{ padding: '14px 28px', fontSize: '1rem' }} onClick={onStartExam}>
            ⚡ Launch Live Proctored Exam →
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#60a5fa' }}>1</div>
          <div className="stat-label">Active Exam Ready</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#34d399' }}>{myResult ? `${Math.round(myResult.score / (myResult.total_questions || 10) * 100)}%` : '90%'}</div>
          <div className="stat-label">Latest Certification Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#818cf8' }}>0</div>
          <div className="stat-label">Proctoring Violations Flagged</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#f59e0b' }}>100%</div>
          <div className="stat-label">Webcam System Readiness</div>
        </div>
      </div>

      {/* Enrolled Exams Grid */}
      <h2 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>📝 Available & Scheduled Examinations</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {DEMO_STUDENT_EXAMS.map(ex => (
          <div key={ex.id} className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                {ex.subject}
              </span>
              <span className={ex.status === 'READY' ? 'pill pill-green' : ex.status === 'SCHEDULED' ? 'pill pill-yellow' : 'pill'}>
                {ex.status}
              </span>
            </div>

            <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>{ex.title}</h3>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.85rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
              <span>⏱️ {ex.duration}</span>
              <span>❓ {ex.questions} Questions</span>
              <span>🎯 Pass: {ex.passingScore}%</span>
            </div>

            <div style={{ marginTop: 'auto' }}>
              {ex.status === 'READY' ? (
                <button className="next-btn" style={{ width: '100%' }} onClick={onStartExam}>
                  Start Proctored Test Now
                </button>
              ) : ex.status === 'COMPLETED' ? (
                <div style={{ textAlign: 'center', color: '#34d399', fontWeight: 700, fontSize: '0.9rem' }}>
                  ✅ Completed — Score: {ex.score}
                </div>
              ) : (
                <button className="nav-btn" style={{ width: '100%' }} onClick={() => onNavigate('schedule')}>
                  View Schedule Details
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Proctoring Rules Checklist */}
      <div className="glass" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#818cf8' }}>🛡️ Mandatory AI Proctoring Examination Rules</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', color: '#94a3b8', fontSize: '0.9rem' }}>
          <div>📷 <strong>Webcam Mandatory:</strong> Live video feed must be clear and unobstructed.</div>
          <div>📱 <strong>No Mobile Devices:</strong> YOLOv8 model actively scans for smartphones.</div>
          <div>👀 <strong>Eye Gaze Tracking:</strong> Keep eyes centered on exam questions.</div>
          <div>⚠️ <strong>No Tab Switching:</strong> Leaving exam window is logged automatically.</div>
        </div>
      </div>

    </div>
  );
}

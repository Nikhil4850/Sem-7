import React from 'react';
import { coursesData, eventsData } from '../data/eduData';

export default function LandingPage({ onNavigate, onOpenAuth }) {
  return (
    <div style={{ minHeight: '100vh', background: '#080c14', color: '#f1f5f9', position: 'relative' }}>

      {/* Hero Section */}
      <section style={{ padding: '40px 24px 80px', textAlign: 'center', maxWidth: '1150px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px',
          borderRadius: '30px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)',
          color: '#818cf8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '24px'
        }}>
          ✨ Next-Gen Educational Institution & Real-Time AI Anti-Cheating Guardian
        </div>

        <h1 style={{ fontSize: '3.6rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '24px' }}>
          Empowering Global Learning with <br />
          <span style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Accredited Degrees & AI Proctoring
          </span>
        </h1>

        <p style={{ fontSize: '1.15rem', color: '#94a3b8', maxWidth: '780px', margin: '0 auto 40px', lineHeight: 1.7 }}>
          A complete educational platform offering 12+ accredited degree courses, interactive quizzes, faculty research, and military-grade real-time AI examination proctoring powered by YOLOv8, MediaPipe 3D Mesh, and OpenCV.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '60px' }}>
          <button className="next-btn" style={{ padding: '14px 32px', fontSize: '1rem' }} onClick={() => onNavigate('courses')}>
            📚 Explore 12+ Courses
          </button>
          <button className="nav-btn" style={{ padding: '14px 32px', fontSize: '1rem' }} onClick={() => onOpenAuth('student')}>
            🎓 Launch Proctored Exam
          </button>
          <button className="nav-btn" style={{ padding: '14px 32px', fontSize: '1rem', borderColor: '#8b5cf6', color: '#c084fc' }} onClick={() => onNavigate('features')}>
            👁️ AI Proctoring Tech Demo
          </button>
        </div>

        {/* Global Statistics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div className="glass" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#818cf8' }}>50,000+</div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Enrolled Students</div>
          </div>
          <div className="glass" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#34d399' }}>99.8%</div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>AI Anti-Cheating Accuracy</div>
          </div>
          <div className="glass" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f472b6' }}>1,200+</div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Secured Examinations</div>
          </div>
          <div className="glass" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fbbf24' }}>4.9 ★</div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Institution Rating</div>
          </div>
        </div>
      </section>

      {/* Signature AI Proctoring Feature Section */}
      <section style={{ padding: '80px 24px', background: 'rgba(15, 23, 42, 0.5)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 50px' }}>
            <span style={{ color: '#818cf8', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '1px' }}>CORE PLATFORM FEATURE</span>
            <h2 style={{ fontSize: '2.4rem', marginTop: '8px' }}>AI-Powered Anti-Cheating Guardian</h2>
            <p style={{ color: '#94a3b8', marginTop: '12px' }}>
              Multi-algorithm computer vision engine monitoring examinations live without human fatigue.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px' }}>
            <div className="glass" style={{ padding: '32px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📱</div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>YOLOv8 Phone & Device Detector</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Uses Ultralytics YOLOv8 Small model (`yolov8s.pt`) with CLAHE contrast preprocessing to detect mobile phones, secondary screens, or notes.
              </p>
            </div>

            <div className="glass" style={{ padding: '32px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '16px' }}>👁️</div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>MediaPipe Gaze & Pose Tracking</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Extracts 468 3D facial landmarks to detect if student turns head or looks away left, right, up, or down from the screen.
              </p>
            </div>

            <div className="glass" style={{ padding: '32px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '16px' }}>👥</div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>Multi-Person & Absence Detector</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Monitors single student presence and alerts immediately if multiple faces or 0 faces are detected in the field of view.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Grid Section */}
      <section style={{ padding: '80px 24px', maxWidth: '1150px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '2.2rem' }}>Featured Academic Degrees</h2>
          <p style={{ color: '#94a3b8', marginTop: '8px' }}>Select an academic degree course to view syllabus and launch AI-proctored certification assessments.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
          {coursesData.slice(0, 3).map(course => (
            <div key={course.id} className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, width: 'fit-content', marginBottom: '12px' }}>
                {course.categoryLabel}
              </span>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{course.title}</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px', flex: 1, lineHeight: 1.6 }}>{course.desc}</p>
              <button className="next-btn" style={{ width: '100%' }} onClick={() => onOpenAuth('student')}>Enroll & Take Exam</button>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button className="nav-btn" style={{ padding: '12px 28px' }} onClick={() => onNavigate('courses')}>
            View All 12+ Academic Courses →
          </button>
        </div>
      </section>

      {/* Upcoming Events Preview */}
      <section style={{ padding: '60px 24px', background: 'rgba(15, 23, 42, 0.4)', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '32px' }}>📅 Academic Symposiums & Live Events</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {eventsData.map((evt, idx) => (
              <div key={idx} className="glass" style={{ padding: '20px' }}>
                <span className="pill pill-green" style={{ marginBottom: '10px', display: 'inline-block' }}>{evt.tag}</span>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>{evt.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Keynote: {evt.speaker} • {evt.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-Column Comprehensive Footer */}
      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '60px 24px 30px', color: '#64748b', fontSize: '0.88rem' }}>
        <div style={{ maxWidth: '1150px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr repeat(3, 1fr)', gap: '40px', marginBottom: '40px' }}>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>EduVanguard University</div>
            <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Accredited online educational platform featuring real-time AI examination proctoring, neural computer vision guardians, and global academic certification.</p>
          </div>
          <div>
            <h4 style={{ color: '#fff', marginBottom: '12px' }}>Portals</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} onClick={() => onOpenAuth('student')}>Student Portal</button></li>
              <li><button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} onClick={() => onOpenAuth('teacher')}>Teacher / Admin Hub</button></li>
              <li><button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} onClick={() => onNavigate('certificates')}>Verify Credentials</button></li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#fff', marginBottom: '12px' }}>Academics</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} onClick={() => onNavigate('courses')}>Course Directory</button></li>
              <li><button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} onClick={() => onNavigate('departments')}>University Departments</button></li>
              <li><button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} onClick={() => onNavigate('schedule')}>Academic Schedule</button></li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#fff', marginBottom: '12px' }}>AI Technology</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} onClick={() => onNavigate('features')}>YOLOv8 Phone Detector</button></li>
              <li><button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} onClick={() => onNavigate('features')}>MediaPipe 3D Mesh</button></li>
              <li><button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} onClick={() => onNavigate('faq')}>Help Desk & FAQ</button></li>
            </ul>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', textAlign: 'center' }}>
          © 2026 EduVanguard Platform. All rights reserved. Powered by YOLOv8s, MediaPipe & FastAPI.
        </div>
      </footer>

    </div>
  );
}

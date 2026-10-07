import React, { useRef, useState, useEffect } from 'react';
import Camera            from './components/Camera';
import DetectionHUD      from './components/DetectionHUD';
import ExamPanel         from './components/ExamPanel';
import AdminDashboard    from './components/AdminDashboard';
import QuestionManager   from './components/QuestionManager';
import ExamResults       from './components/ExamResults';
import LandingPage       from './components/LandingPage';
import CoursesPage       from './components/CoursesPage';
import FeaturesPage      from './components/FeaturesPage';
import DepartmentsPage   from './components/DepartmentsPage';
import SchedulePage      from './components/SchedulePage';
import CertificatesPage  from './components/CertificatesPage';
import FaqPage           from './components/FaqPage';
import AuthModal         from './components/AuthModal';
import { useProctor }    from './hooks/useProctor';

export default function App() {
  const videoRef = useRef(null);
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState('student');

  useEffect(() => {
    const token    = localStorage.getItem('token');
    const role     = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    if (token) {
      setUser({ token, role, username });
      setView(role === 'admin' ? 'dashboard' : 'landing');
    }
  }, []);

  function handleLoginSuccess(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('username', data.username);
    setUser(data);
    setView(data.role === 'admin' ? 'dashboard' : 'exam');
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setUser(null);
    setView('landing');
  }

  function openAuth(role = 'student') {
    setAuthRole(role);
    setAuthModalOpen(true);
  }

  const publicViews = ['landing', 'courses', 'features', 'departments', 'schedule', 'certificates', 'faq'];

  /* Public unauthenticated views */
  if (!user && publicViews.includes(view)) {
    return (
      <div>
        {view === 'landing' && <LandingPage onNavigate={setView} onOpenAuth={openAuth} />}
        {view === 'courses' && <CoursesPage onNavigate={setView} onOpenAuth={openAuth} />}
        {view === 'features' && <FeaturesPage onNavigate={setView} onOpenAuth={openAuth} />}
        {view === 'departments' && <DepartmentsPage onNavigate={setView} onOpenAuth={openAuth} />}
        {view === 'schedule' && <SchedulePage onNavigate={setView} onOpenAuth={openAuth} />}
        {view === 'certificates' && <CertificatesPage onNavigate={setView} onOpenAuth={openAuth} />}
        {view === 'faq' && <FaqPage onNavigate={setView} onOpenAuth={openAuth} />}

        <AuthModal
          isOpen={authModalOpen}
          initialRole={authRole}
          onClose={() => setAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  /* Default unauthenticated handler */
  if (!user) {
    return (
      <div>
        <LandingPage onNavigate={setView} onOpenAuth={openAuth} />
        <AuthModal
          isOpen={true}
          initialRole={authRole}
          onClose={() => setView('landing')}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  return (
    <div>
      <AppInner
        user={user}
        view={view}
        setView={setView}
        videoRef={videoRef}
        onLogout={handleLogout}
        onOpenAuth={openAuth}
      />
      <AuthModal
        isOpen={authModalOpen}
        initialRole={authRole}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

function AppInner({ user, view, setView, videoRef, onLogout, onOpenAuth }) {
  const { result, connected, error, tabSwitchCount, tabWarning } = useProctor(videoRef, user.token);
  const isSuspicious = result ? result.suspicion_score > 0 : false;

  const adminViews = [
    { key: 'dashboard', label: '📊 Dashboard' },
    { key: 'questions', label: '📝 Questions' },
    { key: 'results',   label: '🏆 Results'   },
  ];

  return (
    <div className="app">
      
      {/* Tab switch warning banner */}
      {tabWarning && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: 'linear-gradient(135deg, #dc2626, #991b1b)',
          color: '#fff', padding: '14px',
          textAlign: 'center', fontSize: '14px', fontWeight: '600',
          boxShadow: '0 4px 20px rgba(239,68,68,0.4)',
          animation: 'slideIn 0.3s ease',
        }}>
          ⚠️ WARNING: Tab switching detected! This has been logged. ({tabSwitchCount} time{tabSwitchCount !== 1 ? 's' : ''})
        </div>
      )}

      {/* Topbar Navigation */}
      <div className="topbar" style={{ marginTop: tabWarning ? '54px' : '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="topbar-title" style={{ cursor: 'pointer' }} onClick={() => setView('landing')}>
            🛡️ EduVanguard University
          </div>
          <div className="topbar-sub">
            Logged in as <strong style={{ color: user.role === 'admin' ? '#a78bfa' : '#60a5fa' }}>{user.username}</strong> ({user.role})
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className={`nav-btn ${view === 'landing' ? 'active' : ''}`} onClick={() => setView('landing')}>Home</button>
          <button className={`nav-btn ${view === 'courses' ? 'active' : ''}`} onClick={() => setView('courses')}>Courses</button>
          <button className={`nav-btn ${view === 'features' ? 'active' : ''}`} onClick={() => setView('features')}>AI Tech</button>
          <button className={`nav-btn ${view === 'departments' ? 'active' : ''}`} onClick={() => setView('departments')}>Departments</button>
          <button className={`nav-btn ${view === 'schedule' ? 'active' : ''}`} onClick={() => setView('schedule')}>Schedule</button>
          <button className={`nav-btn ${view === 'certificates' ? 'active' : ''}`} onClick={() => setView('certificates')}>Verify</button>
          <button className={`nav-btn ${view === 'faq' ? 'active' : ''}`} onClick={() => setView('faq')}>FAQ</button>

          {/* Admin Navigation */}
          {user.role === 'admin' && adminViews.map(v => (
            <button key={v.key} onClick={() => setView(v.key)} className={`nav-btn ${view === v.key ? 'active' : ''}`}>
              {v.label}
            </button>
          ))}

          {/* Student Navigation */}
          {user.role === 'student' && (
            <button onClick={() => setView('exam')} className={`nav-btn ${view === 'exam' ? 'active' : ''}`}>
              📝 Live Exam
            </button>
          )}

          <div className={connected ? 'badge-green' : 'badge-red'}>
            {connected ? '🟢 Proctoring Active' : '🔴 Standby'}
          </div>

          <button onClick={onLogout} style={{ padding: '7px 16px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', fontSize: '13px', fontWeight: '500', background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
            Logout
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Render Main Views */}
      {view === 'landing' && <LandingPage onNavigate={setView} onOpenAuth={onOpenAuth} />}
      {view === 'courses' && <CoursesPage onNavigate={setView} onOpenAuth={onOpenAuth} />}
      {view === 'features' && <FeaturesPage onNavigate={setView} onOpenAuth={onOpenAuth} />}
      {view === 'departments' && <DepartmentsPage onNavigate={setView} onOpenAuth={onOpenAuth} />}
      {view === 'schedule' && <SchedulePage onNavigate={setView} onOpenAuth={onOpenAuth} />}
      {view === 'certificates' && <CertificatesPage onNavigate={setView} onOpenAuth={onOpenAuth} />}
      {view === 'faq' && <FaqPage onNavigate={setView} onOpenAuth={onOpenAuth} />}

      {view === 'exam' && (
        <div className="grid" style={{ animation: 'fadeIn 0.4s ease' }}>
          <ExamPanel token={user.token} />
          <div className="right-col">
            <Camera videoRef={videoRef} isSuspicious={isSuspicious} />
            <DetectionHUD result={result} connected={connected} />
          </div>
        </div>
      )}

      {view === 'dashboard' && <AdminDashboard token={user.token} />}
      {view === 'questions' && <QuestionManager token={user.token} />}
      {view === 'results' && <ExamResults token={user.token} />}
    </div>
  );
}
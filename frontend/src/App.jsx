import React, { useRef, useState, useEffect } from 'react';
import Navbar             from './components/Navbar';
import Camera             from './components/Camera';
import DetectionHUD       from './components/DetectionHUD';
import ExamPanel          from './components/ExamPanel';
import AdminDashboard     from './components/AdminDashboard';
import QuestionManager    from './components/QuestionManager';
import ExamResults        from './components/ExamResults';
import StudentDashboard   from './components/StudentDashboard';
import ExamManagement     from './components/ExamManagement';
import SystemSettings     from './components/SystemSettings';
import LiveSessionMonitor from './components/LiveSessionMonitor';
import LandingPage        from './components/LandingPage';
import CoursesPage        from './components/CoursesPage';
import FeaturesPage       from './components/FeaturesPage';
import DepartmentsPage    from './components/DepartmentsPage';
import SchedulePage       from './components/SchedulePage';
import CertificatesPage   from './components/CertificatesPage';
import FaqPage            from './components/FaqPage';
import AuthModal          from './components/AuthModal';
import { useProctor }     from './hooks/useProctor';

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
      setView(role === 'admin' ? 'dashboard' : 'student-dashboard');
    }
  }, []);

  function handleLoginSuccess(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('username', data.username);
    setUser(data);
    setView(data.role === 'admin' ? 'dashboard' : 'student-dashboard');
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

  // Hook proctor connection
  const token = user ? user.token : null;
  const { result, connected, error, tabSwitchCount, tabWarning } = useProctor(videoRef, token);
  const isSuspicious = result ? result.suspicion_score > 0 : false;

  return (
    <div className="app">
      <Navbar
        view={view}
        onNavigate={setView}
        user={user}
        onLogout={handleLogout}
        onOpenAuth={openAuth}
        connected={connected}
      />

      {/* Tab switch warning banner */}
      {tabWarning && (
        <div style={{
          position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 9999,
          background: 'linear-gradient(135deg, #dc2626, #991b1b)',
          color: '#fff', padding: '12px 16px',
          textAlign: 'center', fontSize: '13px', fontWeight: '600',
          boxShadow: '0 4px 20px rgba(239,68,68,0.4)',
          animation: 'slideIn 0.3s ease',
        }}>
          ⚠️ WARNING: Tab switching detected during active proctoring session! This event was recorded. ({tabSwitchCount} time{tabSwitchCount !== 1 ? 's' : ''})
        </div>
      )}

      {error && user && view === 'exam' && <div className="error-banner">{error}</div>}

      {/* Main Views */}
      {view === 'landing'      && <LandingPage onNavigate={setView} onOpenAuth={openAuth} />}
      {view === 'courses'      && <CoursesPage onNavigate={setView} onOpenAuth={openAuth} />}
      {view === 'features'     && <FeaturesPage onNavigate={setView} onOpenAuth={openAuth} />}
      {view === 'departments'  && <DepartmentsPage onNavigate={setView} onOpenAuth={openAuth} />}
      {view === 'schedule'     && <SchedulePage onNavigate={setView} onOpenAuth={openAuth} />}
      {view === 'certificates' && <CertificatesPage onNavigate={setView} onOpenAuth={openAuth} />}
      {view === 'faq'          && <FaqPage onNavigate={setView} onOpenAuth={openAuth} />}

      {/* Student Views */}
      {view === 'student-dashboard' && user && (
        <StudentDashboard user={user} token={user.token} onStartExam={() => setView('exam')} onNavigate={setView} />
      )}

      {view === 'exam' && user && (
        <div className="grid" style={{ animation: 'fadeIn 0.4s ease' }}>
          <ExamPanel token={user.token} />
          <div className="right-col">
            <Camera videoRef={videoRef} isSuspicious={isSuspicious} phoneBoxes={result.phone_boxes || []} />
            <DetectionHUD result={result} connected={connected} />
          </div>
        </div>
      )}

      {/* Admin Views */}
      {view === 'dashboard'    && user && <AdminDashboard token={user.token} />}
      {view === 'live-monitor' && user && <LiveSessionMonitor onNavigate={setView} />}
      {view === 'questions'    && user && <QuestionManager token={user.token} />}
      {view === 'exam-mgmt'    && user && <ExamManagement token={user.token} />}
      {view === 'results'      && user && <ExamResults token={user.token} />}
      {view === 'settings'     && user && <SystemSettings token={user.token} />}

      <AuthModal
        isOpen={authModalOpen}
        initialRole={authRole}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
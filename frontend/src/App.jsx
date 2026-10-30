import React, { useRef, useState, useEffect } from 'react';
import Navbar             from './components/Navbar';
import TeacherSidebar     from './components/TeacherSidebar';
import TeacherHeader      from './components/TeacherHeader';
import StudentSidebar     from './components/StudentSidebar';
import StudentHeader      from './components/StudentHeader';
import Camera             from './components/Camera';
import DetectionHUD       from './components/DetectionHUD';
import ExamPanel          from './components/ExamPanel';
import AdminDashboard     from './components/AdminDashboard';
import TeacherDashboard   from './components/TeacherDashboard';
// QuestionManager removed (no longer used in teacher workspace)
// import QuestionManager    from './components/QuestionManager';
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

import IdentityVerifyPage from './components/IdentityVerifyPage';
import EvidencePlayerPage from './components/EvidencePlayerPage';
import AnalyticsPage      from './components/AnalyticsPage';
import PracticeLabPage    from './components/PracticeLabPage';
import SystemHealthPage   from './components/SystemHealthPage';
import CompliancePage     from './components/CompliancePage';
import Footer             from './components/Footer';

import UsersPage          from './components/UsersPage';
import { useProctor }     from './hooks/useProctor';
import { BASE_URL }       from './api';

// ── Role → default dashboard view mapping ──────────────────────────────────
function defaultViewForRole(role) {
  if (role === 'admin' || role === 'administrator') return 'dashboard';
  if (role === 'teacher') return 'dashboard';
  return 'student-dashboard';
}

// ── Guard: ensure a restored view actually belongs to the user's role ───────
const TEACHER_VIEWS  = ['dashboard','live-monitor','evidence','analytics','questions','exam-mgmt','results','users','system-health','settings','compliance'];
const STUDENT_VIEWS  = ['student-dashboard','student-exams','student-instructions','student-system','student-results','student-profile','student-support','verify'];
const PUBLIC_VIEWS   = ['landing','courses','features','departments','schedule','certificates','faq','practice-lab'];

function safeView(savedView, role) {
  if (!savedView) return defaultViewForRole(role);
  if (role === 'student')  return STUDENT_VIEWS.includes(savedView)  ? savedView : defaultViewForRole(role);
  if (role === 'admin' || role === 'administrator' || role === 'teacher')
    return TEACHER_VIEWS.includes(savedView) ? savedView : defaultViewForRole(role);
  return PUBLIC_VIEWS.includes(savedView) ? savedView : 'landing';
}

export default function App() {
  const videoRef = useRef(null);
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState('student');
  const [examId, setExamId]     = useState(null);
  // 'checking' while we read localStorage, 'done' after
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token     = localStorage.getItem('token');
    const role      = localStorage.getItem('role');
    const username  = localStorage.getItem('username');
    const savedView = localStorage.getItem('view');

    if (!token) {
      // No session at all → go to landing
      setAuthChecked(true);
      return;
    }

    // ── Step 1: Optimistically restore session from localStorage ────────────
    const resolvedRole = role || 'student';
    const restoredView = safeView(savedView, resolvedRole);
    const fullName     = localStorage.getItem('fullName') || '';
    const email        = localStorage.getItem('email') || '';

    setUser({ token, role: resolvedRole, username, fullName, email });
    setView(restoredView);
    setAuthChecked(true);

    // ── Step 2: Validate token in background (silent re-hydration) ──────────
    fetch(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
      // Abort quickly if server is down — don't penalize slow networks
      signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined,
    })
      .then(r => {
        // Only treat 401 / 403 as "session expired" — everything else could
        // be a transient server issue and should NOT wipe the local session.
        if (r.status === 401 || r.status === 403) {
          throw Object.assign(new Error('auth_rejected'), { status: r.status });
        }
        return r.ok ? r.json() : null; // tolerate 404/500 gracefully
      })
      .then(data => {
        if (!data) return; // server error — keep existing session
        // Refresh user details with latest server data
        setUser(prev => ({
          ...prev,
          role:     data.role     || prev.role,
          username: data.username || prev.username,
          fullName: data.fullName || data.full_name || prev.fullName,
          email:    data.email    || prev.email,
        }));
      })
      .catch(err => {
        // Only wipe session if server explicitly rejected the token (401/403)
        // Network errors, timeouts, AbortErrors → keep the session alive
        if (err.status === 401 || err.status === 403) {
          clearSession();
        }
        // Otherwise: silently keep the local session
      });
  }, []); // eslint-disable-line

  // ── Session helpers ──────────────────────────────────────────────────────
  function clearSession() {
    ['token','role','username','view'].forEach(k => localStorage.removeItem(k));
    setUser(null);
    setView('landing');
  }

  function handleLoginSuccess(data) {
    const token = data.token || data.access_token;
    const role  = (data.role || 'student').toLowerCase();
    const dv    = defaultViewForRole(role);

    localStorage.setItem('token',    token);
    localStorage.setItem('role',     role);
    localStorage.setItem('username', data.username || '');
    localStorage.setItem('view',     dv);
    if (data.fullName || data.full_name) localStorage.setItem('fullName', data.fullName || data.full_name);
    if (data.email)                      localStorage.setItem('email',    data.email);

    setUser({ token, role, username: data.username || '', fullName: data.fullName || data.full_name || '', email: data.email || '' });
    setView(dv);
  }

  function handleLogout() {
    ['token','role','username','view','fullName','email'].forEach(k => localStorage.removeItem(k));
    setUser(null);
    setView('landing');
  }

  // Expose logout globally so any component can call window.__appLogout() on 401
  useEffect(() => {
    window.__appLogout = handleLogout;
    return () => { delete window.__appLogout; };
  }); // eslint-disable-line

  // Persist view on every navigation (so refresh restores correct page)
  function navigate(v) {
    localStorage.setItem('view', v);
    setView(v);
  }

  function openAuth(role = 'student') {
    setAuthRole(role);
    setAuthModalOpen(true);
  }

  // Hook proctor connection — must be called before any early return
  const token = user ? user.token : null;
  const { result, connected, error, tabSwitchCount, tabWarning } = useProctor(videoRef, token);
  const isSuspicious = result ? result.suspicion_score > 0 : false;

  // Show a minimal loading splash while reading localStorage (prevents flash to landing page)
  if (!authChecked) return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#0f172a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '16px',
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px',
        background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '24px', boxShadow: '0 0 32px rgba(99,102,241,0.5)',
      }}>🛡️</div>
      <div style={{
        width: '32px', height: '3px', borderRadius: '2px',
        background: 'linear-gradient(90deg,#3b82f6,#6366f1)',
        animation: 'shimmer 1s infinite',
      }} />
      <style>{`
        @keyframes shimmer {
          0%   { opacity: 1; transform: scaleX(1); }
          50%  { opacity: 0.4; transform: scaleX(0.5); }
          100% { opacity: 1; transform: scaleX(1); }
        }
      `}</style>
    </div>
  );

  const teacherWorkspaceViews = [
    'dashboard', 'live-monitor', 'evidence', 'analytics',
    'questions', 'exam-mgmt', 'results', 'users', 'system-health', 'settings'
  ];
  const isTeacherWorkspace = user &&
    (user.role === 'admin' || user.role === 'administrator' || user.role === 'teacher') &&
    teacherWorkspaceViews.includes(view);

  const studentWorkspaceViews = [
    'student-dashboard', 'student-exams', 'student-instructions',
    'student-system', 'student-results', 'student-profile', 'student-support',
    'verify',
  ];
  const isStudentWorkspace = user && user.role === 'student' && studentWorkspaceViews.includes(view);

  // If in Teacher Workspace, render the dedicated Vertical Sidebar layout
  if (isTeacherWorkspace) {
    return (
      <div className="teacher-layout" style={{ display: 'flex', flexDirection: 'row', width: '100%', minHeight: '100vh', background: '#f0f4f8' }}>
        <TeacherSidebar
          view={view}
          onNavigate={navigate}
          user={user}
          onLogout={handleLogout}
          isAdmin={user.role === 'admin' || user.role === 'administrator'}
        />

        <div className="teacher-main-content" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: '#f0f4f8' }}>
          <TeacherHeader
            view={view}
            user={user}
            onNavigate={navigate}
            onLogout={handleLogout}
          />

          <main className="teacher-workspace-body" style={{ flex: 1, padding: '20px 24px 48px', overflowY: 'auto', background: '#f0f4f8' }}>
            {(() => {
              const isAdmin = user.role === 'admin' || user.role === 'administrator';
              return (
                <>
                  {view === 'dashboard'     && (isAdmin ? <AdminDashboard token={user.token} /> : <TeacherDashboard token={user.token} onNavigate={navigate} />)}
                  {view === 'live-monitor'  && <LiveSessionMonitor onNavigate={navigate} />}
                  {view === 'evidence'      && <EvidencePlayerPage onNavigate={navigate} />}
                  {view === 'analytics'     && <AnalyticsPage token={user.token} onNavigate={navigate} />}
                  {view === 'exam-mgmt'     && <ExamManagement token={user.token} />}
                  {view === 'questions'     && <ExamManagement token={user.token} />}
                  {view === 'results'       && <ExamResults token={user.token} onNavigate={navigate} />}
                  {view === 'users'         && (isAdmin ? <UsersPage token={user.token} /> : <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>⛔ Admin access only.</div>)}
                  {view === 'system-health' && <SystemHealthPage token={user.token} onNavigate={navigate} />}
                  {view === 'settings'      && <SystemSettings token={user.token} />}
                </>
              );
            })()}
          </main>

          <Footer onNavigate={navigate} />
        </div>

        <AuthModal
          isOpen={authModalOpen}
          initialRole={authRole}
          onClose={() => setAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  // Student Workspace — dedicated sidebar layout
  if (isStudentWorkspace) {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', width: '100%', minHeight: '100vh', background: '#f0f4f8' }}>
        <StudentSidebar
          view={view}
          onNavigate={navigate}
          user={user}
          onLogout={handleLogout}
        />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: '#f0f4f8' }}>
          <StudentHeader
            view={view}
            user={user}
            onNavigate={navigate}
            onLogout={handleLogout}
          />
          <main style={{ flex: 1, padding: '20px 24px 48px', overflowY: 'auto', background: '#f0f4f8' }}>
            {view === 'student-dashboard'    && <StudentDashboard user={user} token={user.token} onStartExam={(id) => { setExamId(id); navigate('verify'); }} onNavigate={navigate} />}
            {view === 'student-exams'        && <StudentDashboard user={user} token={user.token} onStartExam={(id) => { setExamId(id); navigate('verify'); }} onNavigate={navigate} />}
            {view === 'student-results'      && <ExamResults token={user.token} onNavigate={navigate} />}
            {view === 'student-instructions' && (
              <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #e8edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>📋 Exam Instructions</h2>
                {['Ensure a stable internet connection before starting.','Keep your face clearly visible in the webcam at all times.','Do not use mobile phones or any external devices.','Do not leave your seat or switch browser tabs during the exam.','Any suspicious activity will be automatically recorded and flagged.','You must complete the exam within the allotted time.','Submit your answers before the timer expires.'].map((ins, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '14px', alignItems: 'flex-start' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#4f8ef7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>{i+1}</div>
                    <span style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>{ins}</span>
                  </div>
                ))}
              </div>
            )}
            {view === 'student-system' && (
              <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #e8edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>🖥 System Check</h2>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '24px' }}>Verify your hardware before starting an exam.</p>
                {[['📷','Webcam','Your webcam must be active and clear.'],['🎙','Microphone','Microphone access required for proctoring.'],['📶','Internet Connection','A stable broadband connection is needed.'],['🌐','Browser','Use Chrome or Edge for best compatibility.']].map(([icon,label,desc],i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px', borderRadius:'10px', background:'#f8fafc', border:'1px solid #e8edf2', marginBottom:'10px' }}>
                    <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 }}>{icon}</div>
                    <div style={{ flex:1 }}><div style={{ fontWeight:700, color:'#0f172a', fontSize:'0.85rem' }}>{label}</div><div style={{ color:'#94a3b8', fontSize:'0.75rem' }}>{desc}</div></div>
                    <span style={{ fontSize:'0.75rem', fontWeight:700, color:'#10b981' }}>✓ Ready</span>
                  </div>
                ))}
              </div>
            )}
            {view === 'student-profile' && (
              <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #e8edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', maxWidth: '520px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>👤 My Profile</h2>
                <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'24px', padding:'18px', background:'#f8fafc', borderRadius:'12px', border:'1px solid #e2e8f0' }}>
                  <div style={{ width:'60px', height:'60px', borderRadius:'50%', background:'linear-gradient(135deg,#4f8ef7,#6366f1)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:'1.5rem' }}>{(user?.username||'S')[0].toUpperCase()}</div>
                  <div><div style={{ fontWeight:800, color:'#0f172a', fontSize:'1rem' }}>{user?.fullName||user?.username||'Student'}</div><div style={{ color:'#94a3b8', fontSize:'0.78rem', marginTop:'2px' }}>Student Portal</div></div>
                </div>
                {[['Username', user?.username],['Role', 'Student'],['Email', `${user?.username||'student'}@git.edu.in`]].map(([k,v],i) => (
                  <div key={i} style={{ display:'flex', gap:'12px', padding:'12px 0', borderBottom: i<2 ? '1px solid #f4f7fb' : 'none' }}>
                    <span style={{ color:'#94a3b8', fontSize:'0.82rem', minWidth:'100px', fontWeight:500 }}>{k}</span>
                    <span style={{ color:'#334155', fontSize:'0.82rem', fontWeight:600 }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
            {view === 'student-support' && (
              <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #e8edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', maxWidth: '520px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>🎧 Support</h2>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '24px' }}>Having trouble? Our support team is available 24/7.</p>
                <a href="mailto:support@aiproctor.edu.in" style={{ display:'block', padding:'14px 20px', background:'linear-gradient(135deg,#4f8ef7,#6366f1)', color:'#fff', borderRadius:'10px', textAlign:'center', textDecoration:'none', fontWeight:700, fontSize:'0.9rem' }}>📧 Email Support</a>
              </div>
            )}
            {view === 'verify' && (
              <IdentityVerifyPage
                onNavigate={navigate}
                onStartExam={() => navigate('exam')}
              />
            )}
          </main>
          <Footer onNavigate={navigate} />
        </div>
        <AuthModal isOpen={authModalOpen} initialRole={authRole} onClose={() => setAuthModalOpen(false)} onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // Standard Public & Student Portal Layout with Top Navbar
  return (
    <div className="app">
      <Navbar
        view={view}
        onNavigate={navigate}
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

      {/* Main Public Views */}
      {view === 'landing'      && <LandingPage onNavigate={navigate} onOpenAuth={openAuth} />}
      {view === 'courses'      && <CoursesPage onNavigate={navigate} onOpenAuth={openAuth} />}
      {view === 'features'     && <FeaturesPage onNavigate={navigate} onOpenAuth={openAuth} />}
      {view === 'departments'  && <DepartmentsPage onNavigate={navigate} onOpenAuth={openAuth} />}
      {view === 'schedule'     && <SchedulePage onNavigate={navigate} onOpenAuth={openAuth} />}
      {view === 'certificates' && <CertificatesPage onNavigate={navigate} onOpenAuth={openAuth} />}
      {view === 'faq'          && <FaqPage onNavigate={navigate} onOpenAuth={openAuth} />}
      {view === 'compliance'   && <CompliancePage onNavigate={navigate} />}

      {view === 'verify' && user && user.role !== 'student' && (
        <IdentityVerifyPage onNavigate={navigate} onStartExam={() => navigate('exam')} />
      )}

      {view === 'practice-lab' && (
        <PracticeLabPage onNavigate={navigate} />
      )}

      {view === 'exam' && user && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
          <ExamPanel
            token={user.token}
            examId={examId}
            videoRef={videoRef}
            result={result}
            connected={connected}
            onDone={() => {
              if (user.role === 'student') navigate('student-dashboard');
              else navigate('dashboard');
            }}
          />
        </div>
      )}

      {view !== 'exam' && <Footer onNavigate={navigate} />}

      <AuthModal
        isOpen={authModalOpen}
        initialRole={authRole}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
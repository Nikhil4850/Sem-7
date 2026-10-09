import React from 'react';

export default function Navbar({ view, onNavigate, user, onLogout, onOpenAuth, connected }) {
  const publicNavs = [
    { key: 'landing',      label: 'Home' },
    { key: 'courses',      label: 'Courses' },
    { key: 'features',     label: 'AI Tech' },
    { key: 'schedule',     label: 'Schedule' },
    { key: 'certificates', label: 'Verify' },
    { key: 'compliance',   label: 'Privacy Governance' },
    { key: 'faq',          label: 'FAQ' },
  ];

  const adminNavs = [
    { key: 'dashboard',      label: '📊 Logs' },
    { key: 'live-monitor',   label: '👁️ Live Monitor' },
    { key: 'evidence',       label: '🎬 Evidence Player' },
    { key: 'analytics',      label: '📈 Analytics' },
    { key: 'questions',      label: '📝 Questions' },
    { key: 'exam-mgmt',      label: '🗓️ Exams' },
    { key: 'results',        label: '🏆 Results' },
    { key: 'system-health',  label: '⚡ AI Telemetry' },
    { key: 'settings',       label: '⚙️ Settings' },
  ];

  return (
    <nav className="main-navbar">
      <div className="nav-left" onClick={() => onNavigate('landing')}>
        <div className="brand-logo">
          <span className="brand-icon">🛡️</span>
          <span className="brand-name">EduVanguard</span>
        </div>
        <span className="brand-tag">AI Proctor SaaS</span>
      </div>

      <div className="nav-center">
        {publicNavs.map(n => (
          <button
            key={n.key}
            className={`nav-link ${view === n.key ? 'active' : ''}`}
            onClick={() => onNavigate(n.key)}
          >
            {n.label}
          </button>
        ))}

        {user && user.role === 'admin' && adminNavs.map(n => (
          <button
            key={n.key}
            className={`nav-link admin-link ${view === n.key ? 'active' : ''}`}
            onClick={() => onNavigate(n.key)}
          >
            {n.label}
          </button>
        ))}

        {user && user.role === 'student' && (
          <>
            <button
              className={`nav-link ${view === 'student-dashboard' ? 'active' : ''}`}
              onClick={() => onNavigate('student-dashboard')}
            >
              🎓 Portal
            </button>
            <button
              className={`nav-link ${view === 'verify' ? 'active' : ''}`}
              onClick={() => onNavigate('verify')}
            >
              🪪 ID Check
            </button>
            <button
              className={`nav-link ${view === 'practice-lab' ? 'active' : ''}`}
              onClick={() => onNavigate('practice-lab')}
            >
              🧪 AI Lab
            </button>
            <button
              className={`nav-link exam-link ${view === 'exam' ? 'active' : ''}`}
              onClick={() => onNavigate('exam')}
            >
              ⚡ Live Exam
            </button>
          </>
        )}
      </div>


      <div className="nav-right">
        {user ? (
          <div className="user-profile-widget">
            <div className="user-info">
              <span className="user-name">{user.username}</span>
              <span className={`role-badge ${user.role}`}>
                {user.role === 'admin' ? 'Teacher / Admin' : 'Student'}
              </span>
            </div>

            {view === 'exam' && (
              <div className={connected ? 'badge-green' : 'badge-red'}>
                {connected ? '🟢 AI Proctor Active' : '🔴 Standby'}
              </div>
            )}

            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div className="auth-btns">
            <button className="login-btn student" onClick={() => onOpenAuth('student')}>
              Student Portal
            </button>
            <button className="login-btn teacher" onClick={() => onOpenAuth('teacher')}>
              Teacher Portal
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

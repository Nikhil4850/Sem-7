import React from 'react';

export default function Navbar({ view, onNavigate, user, onLogout, onOpenAuth, connected }) {
  const publicNavs = [
    { key: 'landing',      label: 'Home' },
    { key: 'courses',      label: 'Courses' },
    { key: 'features',     label: 'AI Tech' },
    { key: 'departments',  label: 'Departments' },
    { key: 'schedule',     label: 'Schedule' },
    { key: 'certificates', label: 'Verify' },
    { key: 'faq',          label: 'FAQ' },
  ];

  const adminNavs = [
    { key: 'dashboard', label: '📊 Dashboard' },
    { key: 'questions', label: '📝 Question Bank' },
    { key: 'results',   label: '🏆 Exam Results' },
  ];

  return (
    <nav className="main-navbar">
      <div className="nav-left" onClick={() => onNavigate('landing')}>
        <div className="brand-logo">
          <span className="brand-icon">🛡️</span>
          <span className="brand-name">EduVanguard</span>
        </div>
        <span className="brand-tag">AI Proctor Platform</span>
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
          <button
            className={`nav-link exam-link ${view === 'exam' ? 'active' : ''}`}
            onClick={() => onNavigate('exam')}
          >
            ⚡ Live Exam
          </button>
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

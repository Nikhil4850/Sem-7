import React from 'react';

export default function Navbar({ view, onNavigate, user, onLogout, onOpenAuth, connected }) {
  const publicNavs = [
    { key: 'landing',      label: 'Home' },
    { key: 'courses',      label: 'About' },
    { key: 'features',     label: 'Features' },
    { key: 'practice-lab', label: 'How It Works' },
    { key: 'schedule',     label: 'Exams' },
    { key: 'compliance',   label: 'Contact' },
  ];

  const isTeacher = user && user.role === 'admin';

  return (
    <nav style={{
      width: '100%',
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '12px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        gap: '20px'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            onClick={() => onNavigate(isTeacher ? 'dashboard' : 'landing')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#0066ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(0, 102, 255, 0.3)'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6C2.89543 6 2 6.89543 2 8V16C2 17.1046 2.89543 18 4 18H14C15.1046 18 16 17.1046 16 16V13.8L19.2 16.2C20.1 16.875 21.5 16.2 21.5 15V9C21.5 7.8 20.1 7.125 19.2 7.8L16 10.2V8C16 6.89543 15.1046 6 14 6H4Z" />
              </svg>
            </div>
            <div style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              fontFamily: "'Inter', sans-serif"
            }}>
              Proctor<span style={{ color: '#0066ff' }}>AI</span>
            </div>
          </div>
        </div>

        {/* Public Nav Menu Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
          {publicNavs.map(n => {
            const isActive = view === n.key;
            return (
              <button
                key={n.key}
                onClick={() => onNavigate(n.key)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.92rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#0066ff' : '#475569',
                  padding: '6px 0',
                  position: 'relative',
                  transition: 'color 0.2s ease'
                }}
                onMouseOver={e => !isActive && (e.currentTarget.style.color = '#0066ff')}
                onMouseOut={e => !isActive && (e.currentTarget.style.color = '#475569')}
              >
                {n.label}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-8px',
                    left: 0,
                    right: 0,
                    height: '2.5px',
                    background: '#0066ff',
                    borderRadius: '2px'
                  }} />
                )}
              </button>
            );
          })}

          {/* Student shortcuts */}
          {user && user.role === 'student' && (
            <>
              <button
                onClick={() => onNavigate('student-dashboard')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: view === 'student-dashboard' ? '#0066ff' : '#475569'
                }}
              >
                Student Portal
              </button>
              <button
                onClick={() => onNavigate('exam')}
                style={{
                  background: '#0066ff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                ⚡ Live Exam
              </button>
            </>
          )}
        </div>

        {/* Right Side Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isTeacher && (
                <button
                  onClick={() => onNavigate('dashboard')}
                  style={{
                    background: '#0066ff',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '7px 16px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 102, 255, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  👨‍🏫 Teacher Workspace
                </button>
              )}

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '4px 10px',
                borderRadius: '20px'
              }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                  👤 {user.username}
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '12px',
                  background: isTeacher ? '#dbeafe' : '#dcfce7',
                  color: isTeacher ? '#1e40af' : '#15803d'
                }}>
                  {isTeacher ? 'Teacher' : 'Student'}
                </span>
              </div>

              <button
                onClick={onLogout}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => onOpenAuth('student')}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '7px 18px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#1e293b',
                  cursor: 'pointer'
                }}
              >
                Login
              </button>
              <button
                onClick={() => onOpenAuth('teacher')}
                style={{
                  background: '#0066ff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 18px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 102, 255, 0.25)'
                }}
              >
                Teacher Portal
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

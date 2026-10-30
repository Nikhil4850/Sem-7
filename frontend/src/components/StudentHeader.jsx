import React, { useState, useEffect } from 'react';

const META = {
  'student-dashboard':    { title: 'Dashboard',         sub: 'Your upcoming exams and recent activity' },
  'student-exams':        { title: 'My Exams',          sub: 'All your assigned examinations' },
  'student-instructions': { title: 'Exam Instructions', sub: 'Guidelines before starting your exam' },
  'student-system':       { title: 'System Check',      sub: 'Verify webcam, microphone and browser' },
  'student-results':      { title: 'Results',           sub: 'Your completed exam scores' },
  'student-profile':      { title: 'Profile',           sub: 'Your account information' },
  'student-support':      { title: 'Support',           sub: 'Get help and report issues' },
};

export default function StudentHeader({ view, user, onNavigate, onLogout }) {
  const meta = META[view] || { title: 'Student Portal', sub: '' };
  const [now, setNow]           = useState(new Date());
  const [showDrop, setShowDrop] = useState(false);
  const [showBell, setShowBell] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const dayStr  = now.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const studentId = user?.studentId || user?.username?.toUpperCase() || 'STU001';

  return (
    <header style={{
      height: '64px', background: '#ffffff',
      borderBottom: '1px solid #e8edf2',
      padding: '0 22px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 90,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>

      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#64748b', padding: '6px', borderRadius: '7px',
          display: 'flex', alignItems: 'center', transition: 'background 0.15s',
        }}
          onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
          onMouseOut={e => e.currentTarget.style.background = 'none'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
            {meta.title}
          </h1>
          <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0, marginTop: '1px' }}>{meta.sub}</p>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

        {/* Date/time */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          background: '#f8fafc', border: '1px solid #e2e8f0',
          padding: '6px 14px', borderRadius: '8px',
          fontSize: '0.77rem', color: '#334155', fontWeight: 500,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {dayStr}&nbsp;&nbsp;{timeStr}
        </div>

        {/* Bell */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => { setShowBell(p => !p); setShowDrop(false); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px', borderRadius: '8px',
              display: 'flex', alignItems: 'center', color: '#64748b',
              transition: 'background 0.15s', position: 'relative',
            }}
            onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseOut={e => e.currentTarget.style.background = 'none'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span style={{
              position: 'absolute', top: '5px', right: '5px',
              width: '9px', height: '9px', borderRadius: '50%',
              background: '#ef4444', border: '2px solid #fff',
            }} />
          </button>
          {showBell && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: '#fff', border: '1px solid #e2e8f0',
              borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              width: '280px', zIndex: 300, overflow: 'hidden',
            }}>
              <div style={{ padding: '13px 16px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                Notifications
              </div>
              {[
                { text: 'Exam starting in 30 minutes', sub: 'Data Structures - Mid Term', color: '#4f8ef7' },
                { text: 'System check required', sub: 'Before your next exam', color: '#f59e0b' },
              ].map((n, i) => (
                <div key={i} style={{
                  padding: '11px 14px', borderBottom: i === 0 ? '1px solid #f8fafc' : 'none',
                  display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer',
                }}
                  onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.color, flexShrink: 0, marginTop: '4px' }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>{n.text}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{n.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Avatar dropdown */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => { setShowDrop(p => !p); setShowBell(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '4px 8px', borderRadius: '8px', transition: 'background 0.15s',
            }}
            onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseOut={e => e.currentTarget.style.background = 'none'}
          >
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f8ef7, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
              boxShadow: '0 2px 8px rgba(79,142,247,0.3)',
            }}>
              {(user?.username || 'S')[0].toUpperCase()}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                {user?.fullName || user?.username || 'Student'}
              </div>
              <div style={{ fontSize: '0.67rem', color: '#94a3b8', lineHeight: 1.2 }}>
                Student ({studentId})
              </div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </button>

          {showDrop && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: '#fff', border: '1px solid #e2e8f0',
              borderRadius: '10px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              minWidth: '180px', zIndex: 300, overflow: 'hidden',
            }}>
              {[
                { label: 'My Profile', icon: '👤', action: () => { onNavigate('student-profile'); setShowDrop(false); } },
                { label: 'Results',    icon: '📊', action: () => { onNavigate('student-results'); setShowDrop(false); } },
              ].map(item => (
                <button key={item.label} onClick={item.action}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 14px', background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: '0.84rem', color: '#334155',
                    textAlign: 'left', fontFamily: 'inherit', transition: 'background 0.1s',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseOut={e => e.currentTarget.style.background = 'none'}
                >
                  <span>{item.icon}</span> {item.label}
                </button>
              ))}
              <div style={{ height: '1px', background: '#f1f5f9' }} />
              <button onClick={onLogout}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 14px', background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: '0.84rem', color: '#ef4444',
                  textAlign: 'left', fontFamily: 'inherit', transition: 'background 0.1s',
                }}
                onMouseOver={e => e.currentTarget.style.background = '#fef2f2'}
                onMouseOut={e => e.currentTarget.style.background = 'none'}
              >
                <span>🚪</span> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

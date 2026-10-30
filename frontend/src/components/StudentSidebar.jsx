import React from 'react';

const NAV = [
  { key: 'student-dashboard', label: 'Dashboard', icon: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  )},
  { key: 'student-exams', label: 'My Exams', icon: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14,2 14,8 20,8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  )},
  { key: 'student-instructions', label: 'Exam Instructions', icon: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )},
  { key: 'student-system', label: 'System Check', icon: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
    </svg>
  )},
  { key: 'student-results', label: 'Results', icon: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  )},
  { key: 'student-profile', label: 'Profile', icon: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )},
  { key: 'student-support', label: 'Support', icon: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )},
];

export default function StudentSidebar({ view, onNavigate, user, onLogout }) {
  return (
    <aside style={{
      width: '220px', minWidth: '220px', maxWidth: '220px',
      flexShrink: 0,
      background: 'linear-gradient(180deg, #1a1f35 0%, #1e2540 100%)',
      height: '100vh', position: 'sticky', top: 0, left: 0,
      display: 'flex', flexDirection: 'column',
      zIndex: 100, overflow: 'hidden',
    }}>

      {/* Brand */}
      <div onClick={() => onNavigate('student-dashboard')} style={{
        padding: '20px 18px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: '11px',
        cursor: 'pointer',
      }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #4f8ef7 0%, #6366f1 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', flexShrink: 0,
          boxShadow: '0 4px 14px rgba(79,142,247,0.4)',
        }}>🛡️</div>
        <div>
          <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
            AI Proctor
          </div>
          <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>
            Online Examination System
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '14px 10px' }}>
        {NAV.map(item => {
          const active = view === item.key;
          return (
            <button key={item.key} onClick={() => onNavigate(item.key)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 13px', borderRadius: '9px', border: 'none',
                background: active
                  ? 'linear-gradient(90deg, rgba(79,142,247,0.22) 0%, rgba(79,142,247,0.09) 100%)'
                  : 'transparent',
                color: active ? '#4f8ef7' : '#8897aa',
                fontWeight: active ? 700 : 500,
                fontSize: '0.865rem', cursor: 'pointer',
                transition: 'all 0.15s ease', marginBottom: '3px',
                textAlign: 'left',
                borderLeft: active ? '3px solid #4f8ef7' : '3px solid transparent',
                fontFamily: 'inherit',
              }}
              onMouseOver={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#c8d6e5'; } }}
              onMouseOut={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8897aa'; } }}
            >
              <span style={{ flexShrink: 0, opacity: active ? 1 : 0.75 }}>{item.icon}</span>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
            </button>
          );
        })}

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '10px 6px' }} />

        {/* Logout */}
        <button onClick={onLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 13px', borderRadius: '9px', border: 'none',
            background: 'transparent', color: '#8897aa', fontWeight: 500,
            fontSize: '0.865rem', cursor: 'pointer', transition: 'all 0.15s ease',
            textAlign: 'left', borderLeft: '3px solid transparent', fontFamily: 'inherit',
          }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8897aa'; }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Logout</span>
        </button>
      </nav>

      {/* User strip */}
      <div style={{
        padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: '9px',
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #4f8ef7, #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: '0.82rem',
        }}>
          {(user?.username || 'S')[0].toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.username || 'Student'}
          </div>
          <div style={{ fontSize: '0.62rem', color: '#64748b' }}>Student</div>
        </div>
      </div>
    </aside>
  );
}

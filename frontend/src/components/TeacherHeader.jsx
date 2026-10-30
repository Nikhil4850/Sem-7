import React, { useState, useEffect, useCallback } from 'react';
import { API, apiRequest } from '../api';

const META = {
  'dashboard':     { title: 'Dashboard',        sub: 'Monitor ongoing examinations and student activity' },
  'live-monitor':  { title: 'Live Monitoring',   sub: 'Active candidate webcam streams' },
  'evidence':      { title: 'Violation Alerts',  sub: 'Session snapshots & AI audit trail' },
  'analytics':     { title: 'Reports',           sub: 'Proctoring trends & statistics' },
  'exam-mgmt':     { title: 'My Exams',          sub: 'Create, schedule and manage exams' },
  'results':       { title: 'Exam Results',      sub: 'Candidate submissions & grades' },
  'users':         { title: 'Student List',      sub: 'Students enrolled in your exams' },
  'system-health': { title: 'System Health',     sub: 'AI engine & server telemetry' },
  'settings':      { title: 'Profile & Settings',sub: 'Detection thresholds & account config' },
};

const V_COLORS = {
  phone_detected: '#ef4444', multiple_faces: '#f97316',
  tab_switch: '#f59e0b', looking_away: '#3b82f6',
  face_missing: '#8b5cf6', suspicious_movement: '#10b981',
};
const V_LABELS = {
  phone_detected: 'Phone Detected', multiple_faces: 'Multiple People',
  tab_switch: 'Tab Switch', looking_away: 'Looking Away',
  face_missing: 'Face Missing', suspicious_movement: 'Suspicious Activity',
};

export default function TeacherHeader({ view, user, onNavigate, onLogout }) {
  const meta = META[view] || { title: 'Teacher Panel', sub: '' };
  const [now, setNow]               = useState(new Date());
  const [showDropdown, setDropdown] = useState(false);
  const [showNotif, setNotif]       = useState(false);
  const [alerts, setAlerts]         = useState([]);

  /* Live clock */
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* Fetch real recent violation alerts */
  const fetchAlerts = useCallback(async () => {
    try {
      const r = await apiRequest(API.proctoringLogs, 'GET', null, user?.token);
      if (r.ok) {
        const data = await r.json();
        const sorted = (Array.isArray(data) ? data : [])
          .sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt))
          .slice(0, 5);
        setAlerts(sorted);
      }
    } catch {}
  }, [user?.token]);

  useEffect(() => {
    fetchAlerts();
    const t = setInterval(fetchAlerts, 8000);
    return () => clearInterval(t);
  }, [fetchAlerts]);

  const dayStr  = now.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const roleLabel = user?.role === 'admin' || user?.role === 'administrator' ? 'System Administrator' : 'Subject Teacher';

  return (
    <header style={{
      height: '64px',
      background: '#ffffff',
      borderBottom: '1px solid #e8edf2',
      padding: '0 22px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 90,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>

      {/* Left: hamburger + page title */}
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
          <h1 style={{ fontSize: '1.18rem', fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
            {meta.title}
          </h1>
          <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0, marginTop: '1px' }}>{meta.sub}</p>
        </div>
      </div>

      {/* Right: date/time + bell + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

        {/* Date + Time pill */}
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

        {/* Notification bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setNotif(p => !p); setDropdown(false); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px', borderRadius: '8px', position: 'relative',
              display: 'flex', alignItems: 'center', color: '#64748b',
              transition: 'background 0.15s',
            }}
            onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseOut={e => e.currentTarget.style.background = 'none'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {alerts.length > 0 && (
              <span style={{
                position: 'absolute', top: '5px', right: '5px',
                width: '9px', height: '9px', borderRadius: '50%',
                background: '#ef4444', border: '2px solid #fff',
              }} />
            )}
          </button>

          {showNotif && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: '#fff', border: '1px solid #e2e8f0',
              borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.13)',
              width: '300px', zIndex: 300, overflow: 'hidden',
            }}>
              <div style={{
                padding: '13px 16px', borderBottom: '1px solid #f1f5f9',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>Recent Alerts</span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{alerts.length} new</span>
              </div>
              {alerts.length === 0
                ? <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>No alerts</div>
                : alerts.map((l, i) => {
                    const event = l.event || l.eventType || '';
                    const color = V_COLORS[event] || '#94a3b8';
                    const ts    = l.timestamp || l.createdAt;
                    return (
                      <div key={i} style={{
                        padding: '11px 14px', borderBottom: i < alerts.length - 1 ? '1px solid #f8fafc' : 'none',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        cursor: 'pointer', transition: 'background 0.1s',
                      }}
                        onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>
                            {V_LABELS[event] || event.replace(/_/g, ' ')}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            {l.user_id || l.studentUsername} &nbsp;·&nbsp; {ts ? new Date(ts).toLocaleTimeString() : ''}
                          </div>
                        </div>
                      </div>
                    );
                  })
              }
              <div style={{ padding: '10px 14px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={() => { onNavigate('evidence'); setNotif(false); }}
                  style={{
                    width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0',
                    borderRadius: '8px', padding: '7px', fontSize: '0.77rem',
                    fontWeight: 600, color: '#334155', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  View All Alerts →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Avatar + dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setDropdown(p => !p); setNotif(false); }}
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
              {(user?.username || 'T')[0].toUpperCase()}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                {user?.username ? `Prof. ${user.username.charAt(0).toUpperCase()}${user.username.slice(1)}` : 'Prof. Teacher'}
              </div>
              <div style={{ fontSize: '0.67rem', color: '#94a3b8', lineHeight: 1.2 }}>
                {roleLabel}
              </div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </button>

          {showDropdown && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: '#fff', border: '1px solid #e2e8f0',
              borderRadius: '10px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              minWidth: '188px', zIndex: 300, overflow: 'hidden',
            }}>
              {[
                { label: 'Profile & Settings', icon: '⚙️', action: () => { onNavigate('teacher-profile'); setDropdown(false); } },
                { label: 'My Exams',           icon: '📋', action: () => { onNavigate('exam-mgmt'); setDropdown(false); } },
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

import React, { useState, useEffect, useCallback } from 'react';
import { API, BASE_URL } from '../api';

/* ─── helpers ───────────────────────────────────────────────────── */
// eslint-disable-next-line no-unused-vars
function fmtDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtTime(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}
function getStatus(ex) {
  if (!ex.isActive) return 'upcoming';
  // No schedule set — treat as always available (ongoing)
  if (!ex.startTime && !ex.endTime) return 'ongoing';
  const now   = Date.now();
  const start = ex.startTime ? new Date(ex.startTime).getTime() : 0;
  const end   = ex.endTime
    ? new Date(ex.endTime).getTime()
    : start + (ex.durationMinutes || 60) * 60000;
  if (start > now) return 'upcoming';
  if (now >= start && now <= end) return 'ongoing';
  return 'completed';
}
const STATUS_BADGE = {
  upcoming:  { label: 'Upcoming',  color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  ongoing:   { label: 'Live',      color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
  completed: { label: 'Completed', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
};
const EXAM_ICON_COLORS = ['#eff6ff','#f5f3ff','#fef3c7','#fce7f3','#ecfdf5','#fff7ed'];
const EXAM_ICONS = ['📋','📝','📄','📑','🗂️','📃'];

/* ─── StatCard ─────────────────────────────────────────────────── */
function StatCard({ icon, iconBg, label, value, sub }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e8edf2',
      borderRadius: '14px', padding: '16px 18px',
      display: 'flex', alignItems: 'center', gap: '14px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default',
    }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)'; }}
      onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
    >
      <div style={{
        width: '46px', height: '46px', borderRadius: '12px',
        background: iconBg, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, marginBottom: '3px' }}>{label}</div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1a2035', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: '0.67rem', color: '#94a3b8', marginTop: '3px' }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ─── SystemCheck row ──────────────────────────────────────────── */
function SysRow({ icon, label, status, ok }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '9px 0', borderBottom: '1px solid #f4f7fb',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
        <span style={{ fontSize: '16px' }}>{icon}</span>
        <span style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 500 }}>{label}</span>
      </div>
      <span style={{
        fontSize: '0.72rem', fontWeight: 700,
        color: ok ? '#10b981' : '#f59e0b',
        display: 'flex', alignItems: 'center', gap: '4px',
      }}>
        <span style={{
          width: '14px', height: '14px', borderRadius: '50%',
          background: ok ? '#10b981' : '#f59e0b',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '8px', color: '#fff', flexShrink: 0,
        }}>✓</span>
        {status}
      </span>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────── */
export default function StudentDashboard({ user, token, onStartExam, onNavigate }) {
  const [exams,    setExams]    = useState([]);
  const [logs,     setLogs]     = useState([]);
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState('all');
  const [sysReady, setSysReady] = useState({ webcam: null, mic: null });
  const [profilePhoto, setProfilePhoto] = useState(null);

  /* ── Fetch real data ─────────────────────────────────────────── */
  const fetchAll = useCallback(async () => {
    const h = { 'Authorization': `Bearer ${token}` };

    // Fetch each independently so one failure doesn't block the others
    try {
      const eRes = await fetch(API.exams, { headers: h });
      if (eRes.ok) {
        const data = await eRes.json();
        setExams(Array.isArray(data) ? data : []);
      }
    } catch {}

    try {
      const lRes = await fetch(API.proctoringLogs, { headers: h });
      if (lRes.ok) {
        const data = await lRes.json();
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch {}

    try {
      const rRes = await fetch(`${BASE_URL}/api/sessions/my`, { headers: h });
      if (rRes.ok) {
        const data = await rRes.json();
        setResults(Array.isArray(data) ? data : []);
      }
    } catch {}

    setLoading(false);
  }, [token]);

  // Fetch profile photo separately
  useEffect(() => {
    fetch(`${BASE_URL}/api/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.ProfilePhoto || d?.profilePhoto) setProfilePhoto(d.ProfilePhoto || d.profilePhoto); })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, 8000);
    return () => clearInterval(t);
  }, [fetchAll]);

  /* ── Browser system check ────────────────────────────────────── */
  useEffect(() => {
    navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
      .then(() => setSysReady({ webcam: true, mic: true }))
      .catch(() => setSysReady({ webcam: false, mic: false }));
  }, []);

  /* ── Derived ─────────────────────────────────────────────────── */
  const myViolations = logs.filter(l => l.user_id === user?.username || l.studentUsername === user?.username);
  const upcoming     = exams.filter(e => getStatus(e) === 'upcoming');
  const ongoing      = exams.filter(e => getStatus(e) === 'ongoing');
  const completed    = results.length > 0
    ? exams.filter(e => results.some(r =>
        (r.ExamId || r.exam_id) === (e.examId || e.ExamId || e.id) &&
        (r.Status || r.status || '').toLowerCase() === 'submitted'
      ))
    : exams.filter(e => getStatus(e) === 'completed');

  const tabExams = tab === 'all'       ? exams
                 : tab === 'upcoming'  ? upcoming
                 : tab === 'ongoing'   ? ongoing
                 : completed;

  const studentId = user?.userId || user?.UserId || user?.studentId || user?.username || 'N/A';

  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', animation: 'fadeIn 0.3s ease' }}>

      {/* ── Main column ────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Welcome banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1a2035 0%, #1e2d4a 50%, #1a2035 100%)',
          borderRadius: '16px', padding: '24px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          overflow: 'hidden', position: 'relative', minHeight: '110px',
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', right: '200px', top: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(79,142,247,0.12)' }} />
          <div style={{ position: 'absolute', right: '140px', bottom: '-30px', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', margin: '0 0 6px', lineHeight: 1.2 }}>
              Welcome, {user?.fullName || user?.username || 'Student'} 👋
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
              Here are your upcoming exams and recent activity.
            </p>
          </div>

          {/* Illustration placeholder */}
          <div style={{
            position: 'relative', zIndex: 1,
            display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0,
          }}>
            <div style={{
              width: '90px', height: '75px',
              background: 'rgba(255,255,255,0.05)', borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '44px', border: '1px solid rgba(255,255,255,0.1)',
            }}>🎓</div>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          <StatCard icon="📋" iconBg="#eff6ff" label="Total Exams"  value={loading ? '…' : exams.length}       sub="Assigned to you" />
          <StatCard icon="✅" iconBg="#f0fdf4" label="Completed"    value={loading ? '…' : completed.length}   sub="Exams completed" />
          <StatCard icon="▶" iconBg="#fff7ed" label="Upcoming"     value={loading ? '…' : upcoming.length}    sub={upcoming.length > 0 ? 'Scheduled' : 'None scheduled'} />
          <StatCard icon="⚠️" iconBg="#fef2f2" label="Violations"  value={loading ? '…' : myViolations.length} sub="In your exams" />
        </div>

        {/* My Exams table */}
        <div style={{
          background: '#fff', border: '1px solid #e8edf2',
          borderRadius: '16px', padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          {/* Header + tabs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>My Exams</h3>
            <div style={{ display: 'flex', gap: '4px', background: '#f8fafc', borderRadius: '10px', padding: '4px' }}>
              {[
                { key: 'all',       label: 'All Exams' },
                { key: 'upcoming',  label: 'Upcoming' },
                { key: 'ongoing',   label: 'Ongoing' },
                { key: 'completed', label: 'Completed' },
              ].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  style={{
                    padding: '6px 14px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                    fontSize: '0.78rem', fontWeight: tab === t.key ? 700 : 500,
                    background: tab === t.key ? '#fff' : 'transparent',
                    color: tab === t.key ? '#4f8ef7' : '#64748b',
                    boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s', fontFamily: 'inherit',
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Exam rows */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '0.85rem' }}>Loading exams…</div>
          ) : tabExams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📭</div>
              <div style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>No exams in this category</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>Check back later or switch tabs.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {tabExams.map((ex, i) => {
                const status = getStatus(ex);
                const badge  = STATUS_BADGE[status];
                const isLive = status === 'ongoing';
                const isDone = status === 'completed';
                const examResult = results.find(r =>
                  (r.ExamId || r.exam_id) === (ex.examId || ex.ExamId || ex.id) &&
                  (r.Status || r.status || '').toLowerCase() === 'submitted'
                );
                const resultScore = examResult
                  ? (examResult.Score ?? examResult.score ?? 0)
                  : null;
                const resultTotal = examResult
                  ? (examResult.TotalMarks || examResult.total_questions || 0)
                  : null;
                return (
                  <div key={ex.examId || ex.id || i} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '14px 0',
                    borderBottom: i < tabExams.length - 1 ? '1px solid #f4f7fb' : 'none',
                    transition: 'background 0.1s', borderRadius: '8px',
                  }}
                    onMouseOver={e => e.currentTarget.style.background = '#fafbfd'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Icon */}
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '10px', flexShrink: 0,
                      background: EXAM_ICON_COLORS[i % EXAM_ICON_COLORS.length],
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                    }}>
                      {EXAM_ICONS[i % EXAM_ICONS.length]}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ex.title || ex.examTitle || 'Untitled Exam'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        {ex.courseCode && (
                          <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>🏷</span> {ex.courseCode}
                          </span>
                        )}
                        {ex.questionType && (
                          <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>📄</span> {ex.questionType}
                          </span>
                        )}
                        <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>⏱</span> {ex.durationMinutes || '—'} Minutes
                        </span>
                      </div>
                    </div>

                    {/* Date/time */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                        <span>📅</span> {fmtDate(ex.startTime || ex.scheduledAt)}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        {fmtTime(ex.startTime || ex.scheduledAt)}
                        {ex.endTime && ` – ${fmtTime(ex.endTime)}`}
                      </div>
                    </div>

                    {/* Status + action */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0, minWidth: '110px' }}>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px',
                        borderRadius: '20px', background: badge.bg,
                        color: badge.color, border: `1px solid ${badge.border}`,
                        display: 'flex', alignItems: 'center', gap: '4px',
                      }}>
                        {isLive && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />}
                        {badge.label}
                      </span>
                      {isLive ? (
                        <button onClick={() => onStartExam(ex.examId || ex.id)}
                          style={{
                            width: '100%', padding: '7px 0',
                            background: 'linear-gradient(135deg, #4f8ef7, #6366f1)',
                            color: '#fff', border: 'none', borderRadius: '8px',
                            fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                            fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(79,142,247,0.3)',
                            transition: 'opacity 0.15s',
                          }}
                          onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
                          onMouseOut={e => e.currentTarget.style.opacity = '1'}
                        >
                          Start Exam
                        </button>
                      ) : isDone ? (
                        <button onClick={() => onNavigate('student-results')}
                          style={{
                            width: '100%', padding: '7px 0',
                            background: '#fff', color: '#334155',
                            border: '1px solid #e2e8f0', borderRadius: '8px',
                            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                            fontFamily: 'inherit', transition: 'border-color 0.15s',
                          }}
                          onMouseOver={e => e.currentTarget.style.borderColor = '#4f8ef7'}
                          onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                        >
                          {examResult ? `Score: ${resultScore}/${resultTotal}` : 'View Result'}
                        </button>
                      ) : (
                        <button
                          style={{
                            width: '100%', padding: '7px 0',
                            background: '#f8fafc', color: '#64748b',
                            border: '1px solid #e2e8f0', borderRadius: '8px',
                            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                            fontFamily: 'inherit',
                          }}
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Proctoring Guidelines */}
        <div style={{
          background: '#fff', border: '1px solid #e8edf2',
          borderRadius: '16px', padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            Proctoring Guidelines
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
            {[
              { icon: '📷', label: 'Keep your face visible always', color: '#eff6ff', ico: '#4f8ef7' },
              { icon: '👥', label: 'No multiple people allowed', color: '#fef3c7', ico: '#f59e0b' },
              { icon: '📱', label: 'No mobile phones or external devices', color: '#fce7f3', ico: '#ec4899' },
              { icon: '👀', label: 'Do not look away from the screen', color: '#f0fdf4', ico: '#10b981' },
              { icon: '🖥', label: 'Stay in front of system during exam', color: '#f5f3ff', ico: '#8b5cf6' },
            ].map((g, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '14px 8px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: g.color, margin: '0 auto 8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                }}>{g.icon}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', lineHeight: 1.4 }}>{g.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right sidebar ──────────────────────────────────────── */}
      <div style={{ width: '268px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* My Profile */}
        <div style={{
          background: '#fff', border: '1px solid #e8edf2',
          borderRadius: '16px', padding: '18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>My Profile</h3>
            <button onClick={() => onNavigate('student-profile')}
              style={{
                background: 'none', border: 'none', fontSize: '0.75rem',
                color: '#4f8ef7', fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'inherit',
              }}>Edit</button>
          </div>

          {/* Avatar row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
              background: 'linear-gradient(135deg, #4f8ef7, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', color: '#fff', fontWeight: 800,
              boxShadow: '0 4px 12px rgba(79,142,247,0.3)',
            }}>
              {profilePhoto
                ? <img src={profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (user?.username || 'S')[0].toUpperCase()
              }
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                {user?.fullName || user?.username || 'Student'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                Student ID: {studentId}
              </div>
            </div>
          </div>

          {/* Info rows */}
          {[
            { label: 'Department', value: user?.department || 'Computer Engineering' },
            { label: 'Year',       value: user?.year       || 'BE - Final Year' },
            { label: 'Email',      value: user?.email      || `${user?.username || 'student'}@git.edu.in` },
          ].map((row, i) => (
            <div key={i} style={{
              display: 'flex', gap: '8px',
              padding: '7px 0',
              borderBottom: i < 2 ? '1px solid #f4f7fb' : 'none',
            }}>
              <span style={{ fontSize: '0.73rem', color: '#94a3b8', minWidth: '80px', fontWeight: 500 }}>{row.label}:</span>
              <span style={{ fontSize: '0.73rem', color: '#334155', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* System Status */}
        <div style={{
          background: '#fff', border: '1px solid #e8edf2',
          borderRadius: '16px', padding: '18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>System Status</h3>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, color: '#10b981',
              background: '#f0fdf4', padding: '3px 10px', borderRadius: '20px',
              border: '1px solid #bbf7d0',
            }}>● Ready</span>
          </div>

          <SysRow icon="📷" label="Webcam"               status={sysReady.webcam === null ? 'Checking…' : sysReady.webcam ? 'Detected' : 'Not found'} ok={sysReady.webcam !== false} />
          <SysRow icon="🎙" label="Microphone"           status={sysReady.mic === null    ? 'Checking…' : sysReady.mic    ? 'Detected' : 'Not found'} ok={sysReady.mic !== false} />
          <SysRow icon="📶" label="Internet Connection"  status="Stable"     ok={true} />
          <SysRow icon="🌐" label="Browser Compatibility" status="Supported" ok={true} />

          <button
            onClick={() => navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
              .then(() => setSysReady({ webcam: true, mic: true }))
              .catch(() => setSysReady({ webcam: false, mic: false }))}
            style={{
              marginTop: '12px', width: '100%',
              padding: '9px', background: '#f8fafc',
              border: '1px solid #e2e8f0', borderRadius: '8px',
              fontSize: '0.78rem', fontWeight: 600, color: '#334155',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.15s',
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = '#4f8ef7'}
            onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            🔄 Re-check System
          </button>
        </div>

        {/* Important Instructions */}
        <div style={{
          background: '#fff', border: '1px solid #e8edf2',
          borderRadius: '16px', padding: '18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '26px', height: '26px', borderRadius: '6px',
                background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px',
              }}>🛡️</div>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Important Instructions</h3>
            </div>
            <button style={{
              background: 'none', border: 'none', fontSize: '0.72rem',
              color: '#4f8ef7', fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'inherit',
            }}>View All</button>
          </div>

          {[
            'Ensure a stable internet connection.',
            'Keep your face visible in the webcam.',
            'Do not use mobile phones or external devices.',
            'Do not leave your seat during the exam.',
            'Any suspicious activity will be recorded.',
          ].map((inst, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '9px',
              marginBottom: i < 4 ? '8px' : 0,
            }}>
              <div style={{
                width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                background: '#4f8ef7', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.62rem', fontWeight: 800, marginTop: '1px',
              }}>{i + 1}</div>
              <span style={{ fontSize: '0.73rem', color: '#334155', lineHeight: 1.45 }}>{inst}</span>
            </div>
          ))}
        </div>

        {/* Need Help */}
        <div style={{
          background: '#fff', border: '1px solid #e8edf2',
          borderRadius: '16px', padding: '18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
              background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
            }}>🎧</div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Need Help?</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px', lineHeight: 1.4 }}>
                Having issues or facing any problem during the exam? Contact support for assistance.
              </div>
            </div>
          </div>
          <button onClick={() => onNavigate('student-support')}
            style={{
              width: '100%', padding: '9px',
              background: 'linear-gradient(135deg, #4f8ef7, #6366f1)',
              color: '#fff', border: 'none', borderRadius: '8px',
              fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(79,142,247,0.25)',
              transition: 'opacity 0.15s',
            }}
            onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={e => e.currentTarget.style.opacity = '1'}
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}

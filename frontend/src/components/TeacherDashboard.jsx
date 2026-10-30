import React, { useState, useEffect, useCallback } from 'react';
import { API } from '../api'; // dashboard

/* ── Constants ─────────────────────────────────────────────────── */
const V_COLORS = {
  phone_detected:      '#ef4444',
  multiple_faces:      '#f97316',
  tab_switch:          '#f59e0b',
  looking_away:        '#3b82f6',
  face_missing:        '#8b5cf6',
  suspicious_movement: '#10b981',
};
const V_LABELS = {
  phone_detected:      'Phone Detected',
  multiple_faces:      'Multiple People Detected',
  tab_switch:          'Tab Switch',
  looking_away:        'Looking Away',
  face_missing:        'Face Missing',
  suspicious_movement: 'Suspicious Activity',
};
const V_ICONS = {
  phone_detected: '📱', multiple_faces: '👥',
  tab_switch: '🔄', looking_away: '👀',
  face_missing: '🚫', suspicious_movement: '⚠️',
};

/* ── Helpers ────────────────────────────────────────────────────── */
function pad(n) { return String(n).padStart(2, '0'); }

function formatTime(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

/* Stat Card matching the reference design */
function StatCard({ icon, iconBg, label, value, sub }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e8edf2',
      borderRadius: '14px',
      padding: '18px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'default',
    }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; }}
      onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
    >
      <div style={{
        width: '50px', height: '50px', borderRadius: '12px',
        background: iconBg, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '22px',
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginBottom: '3px' }}>{label}</div>
        <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#1a2035', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>{sub}</div>}
      </div>
    </div>
  );
}

/* Countdown timer display */
function Countdown({ endTime }) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    function calc() {
      const diff = Math.max(0, new Date(endTime) - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining({ h, m, s, done: diff <= 0 });
    }
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endTime]);

  if (!remaining) return null;
  if (remaining.done) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ef4444' }}>Exam Ended</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {[
        { val: remaining.h, label: 'Hours' },
        { val: remaining.m, label: 'Minutes' },
        { val: remaining.s, label: 'Seconds' },
      ].map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1a2035', lineHeight: 1, paddingBottom: '14px' }}>:</span>}
          <div style={{ textAlign: 'center', minWidth: '52px' }}>
            <div style={{
              fontSize: '1.8rem', fontWeight: 800, color: '#1a2035', lineHeight: 1,
              background: '#f0f4f8', borderRadius: '8px', padding: '8px 10px',
              letterSpacing: '0.04em',
            }}>{pad(item.val)}</div>
            <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────── */
export default function TeacherDashboard({ token, onNavigate }) {
  const [exams,   setExams]   = useState([]);
  const [logs,    setLogs]    = useState([]);
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [eRes, lRes, uRes] = await Promise.all([
        fetch(API.exams,          { headers }),
        fetch(API.proctoringLogs, { headers }),
        fetch(API.users,          { headers }),
      ]);
      if (eRes.ok) setExams(await eRes.json().then(d => Array.isArray(d) ? d : []));
      if (lRes.ok) setLogs(await lRes.json().then(d => Array.isArray(d) ? d : []));
      if (uRes.ok) setUsers(await uRes.json().then(d => Array.isArray(d) ? d : []));
      setUpdated(new Date());
    } catch {}
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, 5000);
    return () => clearInterval(t);
  }, [fetchAll]);

  /* Derived values */
  const activeExams  = exams.filter(e => e.IsActive || e.isActive);
  const ongoingExam  = activeExams[0] || null;
  const students     = users.filter(u => (u.role || u.Role || '').toLowerCase() === 'student');
  const todayLogs    = logs.filter(l => {
    const d = new Date(l.timestamp || l.createdAt);
    const n = new Date();
    return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  });
  const recentAlerts = [...logs]
    .sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt))
    .slice(0, 5);

  /* Build exam end time from startTime + durationMinutes */
  function getEndTime(exam) {
    if (!exam) return null;
    const endTime = exam.endTime || exam.EndTime;
    if (endTime) return endTime;
    const startTime = exam.startTime || exam.StartTime;
    const duration  = exam.durationMinutes || exam.DurationMinutes;
    if (startTime && duration) {
      return new Date(new Date(startTime).getTime() + duration * 60000).toISOString();
    }
    return null;
  }

  function fmt12(ts) {
    if (!ts) return '—';
    return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  /* ── RENDER ─────────────────────────────────────────────────────── */
  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard
          icon="📋" iconBg="#eff6ff"
          label="My Exams"
          value={loading ? '…' : exams.length}
          sub="Today"
        />
        <StatCard
          icon="👥" iconBg="#f0fdf4"
          label="Students"
          value={loading ? '…' : students.length}
          sub="In Exam"
        />
        <StatCard
          icon="▶" iconBg="#fff7ed"
          label="Live Monitoring"
          value={loading ? '…' : activeExams.length}
          sub="Active Now"
        />
        <StatCard
          icon="⚠️" iconBg="#fef2f2"
          label="Violations"
          value={loading ? '…' : todayLogs.length}
          sub="Detected"
        />
      </div>

      {/* ── Bottom Row: Ongoing Exam + Recent Alerts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'flex-start' }}>

        {/* ── Ongoing Exam Card ── */}
        <div style={{
          background: '#fff',
          border: '1px solid #e8edf2',
          borderRadius: '16px',
          padding: '22px 24px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Ongoing Exam</h3>
            <button
              onClick={() => onNavigate('exam-mgmt')}
              style={{
                background: 'none', border: 'none', fontSize: '0.8rem',
                color: '#4f8ef7', fontWeight: 600, cursor: 'pointer',
                padding: '4px 10px', borderRadius: '6px', fontFamily: 'inherit',
                transition: 'background 0.15s',
              }}
              onMouseOver={e => e.currentTarget.style.background = '#eff6ff'}
              onMouseOut={e => e.currentTarget.style.background = 'none'}
            >
              View Details →
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '0.88rem' }}>
              Loading exam data…
            </div>
          ) : !ongoingExam ? (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📋</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>No Active Exam</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '18px' }}>Start or schedule an exam to see it here.</div>
              <button onClick={() => onNavigate('exam-mgmt')} style={{
                background: '#4f8ef7', color: '#fff', border: 'none',
                borderRadius: '8px', padding: '9px 20px', fontSize: '0.82rem',
                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                + Create Exam
              </button>
            </div>
          ) : (
            <>
              {/* Exam title row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px',
                background: 'linear-gradient(135deg, #f0f6ff 0%, #f5f3ff 100%)',
                borderRadius: '12px',
                marginBottom: '20px',
                border: '1px solid #e0eaff',
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #4f8ef7, #6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', flexShrink: 0,
                }}>📄</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                    {ongoingExam.title || ongoingExam.examTitle || 'Untitled Exam'}
                  </div>
                  {ongoingExam.subject && (
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                      {ongoingExam.subject}
                    </div>
                  )}
                </div>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 700, color: '#10b981',
                  background: '#f0fdf4', padding: '5px 12px', borderRadius: '20px',
                  border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '5px',
                  flexShrink: 0,
                }}>
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: '#10b981', display: 'inline-block',
                    animation: 'pulse 1.5s infinite',
                  }} />
                  In Progress
                </span>
              </div>

              {/* Exam info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', marginBottom: '22px' }}>
                {[
                  { label: 'Course Code',    value: ongoingExam.courseCode || `EXAM-${String(ongoingExam.examId || ongoingExam.ExamId || '').slice(0,6).toUpperCase()}` || 'N/A' },
                  { label: 'Total Students', value: students.length || '—' },
                  { label: 'Start Time',     value: fmt12(ongoingExam.startTime || ongoingExam.StartTime || ongoingExam.scheduledAt) },
                  { label: 'End Time',       value: fmt12(getEndTime(ongoingExam)) },
                ].map((row, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '11px 0',
                    borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none',
                  }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', minWidth: '120px', fontWeight: 500 }}>
                      : {row.label}
                    </span>
                    <span style={{ fontSize: '0.83rem', color: '#1a2035', fontWeight: 700 }}>
                      {row.value}
                    </span>
                    {row.label === 'Total Students' && (
                      <span style={{
                        marginLeft: '4px', fontSize: '0.68rem', fontWeight: 700,
                        color: '#10b981', background: '#f0fdf4',
                        padding: '2px 8px', borderRadius: '10px', border: '1px solid #bbf7d0',
                      }}>In Progress</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Countdown timer */}
              {getEndTime(ongoingExam) && (
                <div style={{
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  background: '#f8fafc', borderRadius: '12px', padding: '18px',
                  border: '1px solid #e8edf2',
                }}>
                  <Countdown endTime={getEndTime(ongoingExam)} />
                </div>
              )}

              {/* If no end time, show duration */}
              {!getEndTime(ongoingExam) && ongoingExam.durationMinutes && (
                <div style={{
                  textAlign: 'center', background: '#f8fafc',
                  borderRadius: '12px', padding: '16px',
                  border: '1px solid #e8edf2',
                  fontSize: '0.88rem', color: '#334155', fontWeight: 600,
                }}>
                  ⏱ Duration: {ongoingExam.durationMinutes} minutes
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Recent Alerts ── */}
        <div style={{
          background: '#fff',
          border: '1px solid #e8edf2',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Recent Alerts</h3>
            <button
              onClick={() => onNavigate('evidence')}
              style={{
                background: 'none', border: 'none', fontSize: '0.78rem',
                color: '#4f8ef7', fontWeight: 600, cursor: 'pointer',
                padding: '3px 8px', borderRadius: '6px', fontFamily: 'inherit',
                transition: 'background 0.15s',
              }}
              onMouseOver={e => e.currentTarget.style.background = '#eff6ff'}
              onMouseOut={e => e.currentTarget.style.background = 'none'}
            >View All</button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', fontSize: '0.82rem' }}>Loading…</div>
          ) : recentAlerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', fontSize: '0.82rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
              No violations detected
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {recentAlerts.map((l, i) => {
                const event = l.event || l.eventType || '';
                const color = V_COLORS[event] || '#94a3b8';
                const ts = l.timestamp || l.createdAt;
                return (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 0',
                    borderBottom: i < recentAlerts.length - 1 ? '1px solid #f4f7fb' : 'none',
                    transition: 'background 0.1s',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                    onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Avatar with dot */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #1e2a3a, #2d3e52)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '16px',
                      }}>
                        {V_ICONS[event] || '⚠️'}
                      </div>
                      <span style={{
                        position: 'absolute', top: '-2px', right: '-2px',
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: color, border: '2px solid #fff',
                      }} />
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.8rem', fontWeight: 700, color: '#0f172a',
                        lineHeight: 1.3, marginBottom: '2px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {V_LABELS[event] || event.replace(/_/g, ' ')}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>
                        {l.user_id || l.studentUsername || '—'}
                      </div>
                      <div style={{ fontSize: '0.67rem', color: '#94a3b8', marginTop: '1px' }}>
                        {formatTime(ts)}
                      </div>
                    </div>

                    {/* Risk badge */}
                    <span style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: color, flexShrink: 0,
                    }} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick stats */}
          {!loading && (
            <div style={{
              marginTop: '14px',
              padding: '12px 14px',
              background: 'linear-gradient(135deg, #f0f6ff 0%, #f5f3ff 100%)',
              borderRadius: '10px',
              border: '1px solid #e0eaff',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ef4444' }}>
                  {logs.filter(l => (l.suspicion_score ?? l.score ?? 0) > 60).length}
                </div>
                <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>High Risk</div>
              </div>
              <div style={{ width: '1px', height: '30px', background: '#dde6f0' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b' }}>
                  {todayLogs.length}
                </div>
                <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Today</div>
              </div>
              <div style={{ width: '1px', height: '30px', background: '#dde6f0' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#4f8ef7' }}>
                  {logs.length}
                </div>
                <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Total</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Additional Exams list (if multiple active) ── */}
      {activeExams.length > 1 && (
        <div style={{
          marginTop: '20px',
          background: '#fff',
          border: '1px solid #e8edf2',
          borderRadius: '14px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
            Other Active Exams
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {activeExams.slice(1).map((ex, i) => (
              <div key={ex.examId || ex.ExamId || i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: '10px',
                background: '#f8fafc', border: '1px solid #e8edf2',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: '#eff6ff', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px',
                }}>📋</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ex.title || ex.examTitle}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                    ⏱ {ex.durationMinutes || ex.DurationMinutes} min · {ex.totalMarks || ex.TotalMarks} marks
                  </div>
                </div>
                <span style={{
                  fontSize: '0.62rem', fontWeight: 700, color: '#10b981',
                  background: '#f0fdf4', padding: '3px 8px', borderRadius: '10px',
                  border: '1px solid #bbf7d0', flexShrink: 0,
                }}>● Live</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Live status bar at bottom ── */}
      <div style={{
        marginTop: '16px',
        display: 'flex', alignItems: 'center', gap: '8px',
        fontSize: '0.7rem', color: '#94a3b8',
      }}>
        <span style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: '#10b981', display: 'inline-block',
          animation: 'pulse 2s infinite',
        }} />
        Auto-refreshing every 5 seconds
        {updated && ` · Last updated ${updated.toLocaleTimeString()}`}
      </div>
    </div>
  );
}

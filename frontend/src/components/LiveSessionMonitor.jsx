import React, { useState, useEffect, useCallback } from 'react';
import { BASE_URL } from '../api';

const V_COLORS = { phone_detected:'#ef4444', multiple_faces:'#f97316', tab_switch:'#f59e0b', looking_away:'#3b82f6', no_face:'#8b5cf6' };
const V_LABELS = { phone_detected:'Phone Detected', multiple_faces:'Multiple Faces', tab_switch:'Tab Switch', looking_away:'Looking Away', no_face:'No Face' };
const V_ICONS  = { phone_detected:'📱', multiple_faces:'👥', tab_switch:'🔄', looking_away:'👀', no_face:'🚫' };

function fmtTime(ts) {
  if (!ts) return '—';
  try {
    const d = new Date(ts);
    return isNaN(d) ? '—' : d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:true });
  } catch { return '—'; }
}

function norm(s) {
  return {
    sessionId:       s.SessionId       || s.sessionId,
    examTitle:       s.ExamTitle       || s.examTitle       || 'Unknown Exam',
    studentUsername: s.StudentUsername || s.studentUsername || '—',
    studentName:     s.StudentName     || s.studentName     || '',
    startTime:       s.StartTime       || s.startTime,
    status:          (s.Status         || s.status          || '').toLowerCase(),
    score:           s.Score           ?? s.score           ?? null,
    totalMarks:      s.TotalMarks      || s.totalMarks      || null,
    violationCount:  s.ViolationCount  || s.violationCount  || 0,
    verdict:         (s.Verdict        || s.verdict         || 'clean').toLowerCase(),
    lastHeartbeat:   s.LastHeartbeat   || s.lastHeartbeat,
  };
}

export default function LiveSessionMonitor({ onNavigate }) {
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [notice,   setNotice]   = useState(null);
  const token = localStorage.getItem('token');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setSessions(await res.json().then(d => Array.isArray(d) ? d : []));
    } catch {}
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 8000);
    return () => clearInterval(t);
  }, [fetchData]);

  function flash(msg) { setNotice(msg); setTimeout(() => setNotice(null), 3000); }

  const enriched = sessions.map(norm);
  const active   = enriched.filter(s => s.status === 'active');
  const flagged  = active.filter(s => s.violationCount > 3 || s.verdict === 'cheating_detected' || s.verdict === 'suspicious');

  const filtered = active.filter(s => {
    const q = search.toLowerCase();
    return !q
      || s.studentUsername.toLowerCase().includes(q)
      || s.studentName.toLowerCase().includes(q)
      || s.examTitle.toLowerCase().includes(q);
  });

  return (
    <div style={{ width:'100%', animation:'fadeIn 0.4s ease' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <span className="badge badge-info" style={{ marginBottom:'6px' }}>Real-Time Invigilator HUD</span>
          <h2 style={{ fontSize:'1.7rem', fontWeight:800, color:'#0f172a' }}>Live Exam Monitor</h2>
          <p style={{ color:'#64748b', fontSize:'0.9rem', marginTop:'2px' }}>
            {loading
              ? 'Connecting…'
              : active.length === 0
                ? 'No active exams right now'
                : `${active.length} student${active.length !== 1 ? 's' : ''} in exam · ${flagged.length} flagged`
            }
          </p>
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <button className="btn btn-secondary" style={{ fontSize:'0.82rem' }} onClick={fetchData}>↻ Refresh</button>
          <button className="btn btn-secondary" style={{ fontSize:'0.82rem' }} onClick={() => onNavigate('dashboard')}>← Dashboard</button>
        </div>
      </div>

      {notice && (
        <div style={{ padding:'12px 16px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'8px', marginBottom:'16px', color:'#15803d', fontSize:'0.88rem', fontWeight:600 }}>
          ✓ {notice}
        </div>
      )}

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px', marginBottom:'24px' }}>
        {[
          { label:'Live Now',    value: active.length,    color:'#10b981', bg:'#f0fdf4' },
          { label:'Flagged',     value: flagged.length,   color:'#ef4444', bg:'#fef2f2' },
          { label:'Total Today', value: enriched.length,  color:'#4f8ef7', bg:'#eff6ff' },
        ].map(s => (
          <div key={s.label} style={{ background:s.bg, borderRadius:'12px', padding:'16px', border:`1px solid ${s.color}22`, textAlign:'center' }}>
            <div style={{ fontSize:'1.8rem', fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'0.72rem', color:'#64748b', fontWeight:600, marginTop:'3px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom:'18px' }}>
        <input
          type="text"
          placeholder="Search student name or exam…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width:'100%', padding:'9px 14px', border:'1.5px solid #e2e8f0', borderRadius:'8px', fontSize:'0.85rem', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'60px', color:'#94a3b8' }}>
          <div style={{ fontSize:'2rem', marginBottom:'12px' }}>⏳</div>
          Connecting to live sessions…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px 40px', background:'#fff', borderRadius:'16px', border:'1px solid #e8edf2' }}>
          <div style={{ fontSize:'4rem', marginBottom:'16px' }}>🟢</div>
          <div style={{ fontWeight:700, color:'#0f172a', fontSize:'1.1rem', marginBottom:'8px' }}>No Active Exams Right Now</div>
          <div style={{ fontSize:'0.88rem', color:'#94a3b8' }}>
            This page auto-refreshes every 8 seconds.<br />
            Student cards appear here when an exam starts.
          </div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'16px' }}>
          {filtered.map((s, i) => {
            const isHighAlert = s.violationCount > 3 || s.verdict === 'cheating_detected' || s.verdict === 'suspicious';
            const pct = s.score !== null && s.totalMarks ? Math.round((s.score / s.totalMarks) * 100) : null;
            const borderColor = isHighAlert ? '#ef4444' : '#10b981';

            return (
              <div key={s.sessionId || i} style={{ background:'#fff', borderRadius:'14px', padding:'20px', border:`1.5px solid ${isHighAlert ? '#fca5a5' : '#e2e8f0'}`, borderLeft:`4px solid ${borderColor}`, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>

                {/* Card header */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
                  <div>
                    <div style={{ fontWeight:800, color:'#0f172a', fontSize:'0.92rem' }}>👤 {s.studentName || s.studentUsername}</div>
                    <div style={{ fontSize:'0.72rem', color:'#94a3b8', marginTop:'1px' }}>@{s.studentUsername}</div>
                    <div style={{ fontSize:'0.72rem', color:'#64748b', marginTop:'3px', maxWidth:'160px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>📋 {s.examTitle}</div>
                  </div>
                  <span style={{ fontSize:'0.68rem', fontWeight:700, padding:'3px 10px', borderRadius:'20px', background:'#f0fdf4', color:'#10b981', border:'1px solid #bbf7d0', display:'flex', alignItems:'center', gap:'4px', flexShrink:0 }}>
                    <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#10b981', display:'inline-block', animation:'livePulse 1.5s infinite' }} />
                    Live
                  </span>
                </div>

                {/* Camera placeholder */}
                <div style={{ height:'90px', background:'#0f172a', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'12px', border:`1.5px solid ${isHighAlert ? '#ef4444' : '#334155'}`, position:'relative' }}>
                  <div style={{ textAlign:'center', color:'#475569' }}>
                    <div style={{ fontSize:'1.4rem', marginBottom:'3px' }}>📹</div>
                    <div style={{ fontSize:'0.62rem' }}>Proctoring via WebSocket</div>
                  </div>
                  {isHighAlert && (
                    <div style={{ position:'absolute', bottom:'6px', left:'6px', right:'6px', background:'rgba(239,68,68,0.9)', color:'#fff', padding:'3px 8px', borderRadius:'5px', fontSize:'0.68rem', fontWeight:700, textAlign:'center' }}>
                      🚨 {s.violationCount} violation{s.violationCount !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {/* Violations */}
                {s.violationCount > 0 && (
                  <div style={{ display:'flex', gap:'5px', flexWrap:'wrap', marginBottom:'10px' }}>
                    {Object.entries(V_ICONS).slice(0, Math.min(s.violationCount, 5)).map(([key, icon], idx) => (
                      <span key={idx} title={V_LABELS[key]} style={{ fontSize:'13px', background:`${V_COLORS[key]}18`, padding:'2px 6px', borderRadius:'6px', border:`1px solid ${V_COLORS[key]}30` }}>{icon}</span>
                    ))}
                  </div>
                )}

                {/* Times */}
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.72rem', color:'#64748b', marginBottom:'10px' }}>
                  <span>🕒 {fmtTime(s.startTime)}</span>
                  <span>💓 {fmtTime(s.lastHeartbeat)}</span>
                </div>

                {/* Score bar */}
                {pct !== null && (
                  <div style={{ marginBottom:'10px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.72rem', marginBottom:'4px' }}>
                      <span style={{ color:'#64748b' }}>Score</span>
                      <span style={{ fontWeight:700, color: pct >= 60 ? '#10b981' : '#ef4444' }}>{s.score}/{s.totalMarks} ({pct}%)</span>
                    </div>
                    <div style={{ height:'5px', background:'#f1f5f9', borderRadius:'3px', overflow:'hidden' }}>
                      <div style={{ width:`${pct}%`, height:'100%', background: pct >= 60 ? '#10b981' : '#ef4444', borderRadius:'3px' }} />
                    </div>
                  </div>
                )}

                {/* Verdict + action */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'8px' }}>
                  <span style={{ fontSize:'0.72rem', fontWeight:700, padding:'4px 10px', borderRadius:'20px', background: isHighAlert ? '#fef2f2' : '#f0fdf4', color: isHighAlert ? '#ef4444' : '#10b981', border:`1px solid ${isHighAlert ? '#fca5a5' : '#86efac'}` }}>
                    {isHighAlert ? '⚠ Flagged' : '✓ Clean'}
                  </span>
                  <button className="btn btn-secondary" style={{ fontSize:'0.72rem', padding:'4px 10px' }}
                    onClick={() => { flash(`Session #${s.sessionId} noted.`); onNavigate('student-data'); }}>
                    👁 View
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

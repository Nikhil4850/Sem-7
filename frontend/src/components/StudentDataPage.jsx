import React, { useState, useEffect, useCallback } from 'react';
import { BASE_URL } from '../api';

const V_COLORS = { phone_detected:'#ef4444', multiple_faces:'#f97316', tab_switch:'#f59e0b', looking_away:'#3b82f6', no_face:'#8b5cf6' };
const V_ICONS  = { phone_detected:'📱', multiple_faces:'👥', tab_switch:'🔄', looking_away:'👀', no_face:'🚫' };
const V_LABELS = { phone_detected:'Phone Detected', multiple_faces:'Multiple Faces', tab_switch:'Tab Switch', looking_away:'Looking Away', no_face:'No Face' };

function fmt(ts) {
  if (!ts) return '—';
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  } catch { return '—'; }
}

function fmtDate(ts) {
  if (!ts) return '—';
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return '—'; }
}

export default function StudentDataPage({ token, onNavigate }) {
  const [sessions, setSessions]         = useState([]);
  const [loading,  setLoading]          = useState(true);
  const [search,   setSearch]           = useState('');
  const [filter,   setFilter]           = useState('all'); // all | active | submitted
  const [selected, setSelected]         = useState(null); // student detail modal
  const [detail,   setDetail]           = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const h = { Authorization: `Bearer ${token}` };

  const fetchSessions = useCallback(() => {
    setLoading(true);
    fetch(`${BASE_URL}/api/admin/sessions`, { headers: h })
      .then(r => r.json())
      .then(d => { setSessions(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]); // eslint-disable-line

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  async function openStudent(studentId) {
    setSelected(studentId);
    setDetailLoading(true);
    try {
      const r = await fetch(`${BASE_URL}/api/admin/students/${studentId}`, { headers: h });
      if (r.ok) setDetail(await r.json());
    } catch {}
    setDetailLoading(false);
  }

  const filtered = sessions.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (s.StudentUsername || '').toLowerCase().includes(q) ||
      (s.StudentName     || '').toLowerCase().includes(q) ||
      (s.ExamTitle       || '').toLowerCase().includes(q);
    const matchFilter = filter === 'all' || (s.Status || '').toLowerCase() === filter;
    return matchSearch && matchFilter;
  });

  const submitted = sessions.filter(s => (s.Status || '').toLowerCase() === 'submitted');
  const active    = sessions.filter(s => (s.Status || '').toLowerCase() === 'active');
  const flagged   = sessions.filter(s => s.ViolationCount > 3);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>Student Exam Data</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>All students · exam results · proctoring violations</p>
        </div>
        <button onClick={fetchSessions} className="btn btn-secondary" style={{ fontSize: '0.82rem' }}>↻ Refresh</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Sessions', value: sessions.length,  color: '#4f8ef7', bg: '#eff6ff' },
          { label: 'Active Now',     value: active.length,    color: '#10b981', bg: '#f0fdf4' },
          { label: 'Completed',      value: submitted.length, color: '#8b5cf6', bg: '#f5f3ff' },
          { label: 'Flagged',        value: flagged.length,   color: '#ef4444', bg: '#fef2f2' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: '14px', padding: '16px', textAlign: 'center', border: `1px solid ${s.color}22` }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" placeholder="Search student name, username, exam…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '220px', padding: '9px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none' }} />
        <div style={{ display: 'flex', gap: '6px' }}>
          {[['all','All'],['active','Active'],['submitted','Completed']].map(([val,lbl]) => (
            <button key={val} onClick={() => setFilter(val)}
              style={{ padding: '8px 16px', borderRadius: '8px', border: `1.5px solid ${filter===val ? '#4f8ef7' : '#e2e8f0'}`, background: filter===val ? '#eff6ff' : '#fff', color: filter===val ? '#4f8ef7' : '#64748b', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e8edf2', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Student','Exam','Start Time','Status','Score','Violations','Verdict','Action'].map(h => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No records found.</td></tr>
              ) : filtered.map((s, i) => {
                const status  = (s.Status || '').toLowerCase();
                const pct     = s.Score && s.TotalMarks ? Math.round((s.Score / s.TotalMarks) * 100) : null;
                const passed  = pct !== null && pct >= 60;
                const verdict = s.Verdict || (s.ViolationCount > 3 ? 'suspicious' : 'clean');
                const vColor  = verdict === 'cheating_detected' ? '#ef4444' : verdict === 'suspicious' ? '#f59e0b' : '#10b981';
                return (
                  <tr key={s.SessionId || i} style={{ borderBottom: '1px solid #f1f5f9' }}
                    onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseOut={e => e.currentTarget.style.background = '#fff'}>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{s.StudentName || s.StudentUsername}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>@{s.StudentUsername}</div>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: '0.83rem', color: '#334155', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.ExamTitle}</td>
                    <td style={{ padding: '11px 14px', fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>{fmt(s.StartTime)}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700,
                        background: status === 'active' ? '#f0fdf4' : status === 'submitted' ? '#eff6ff' : '#f8fafc',
                        color: status === 'active' ? '#10b981' : status === 'submitted' ? '#4f8ef7' : '#64748b',
                        border: `1px solid ${status === 'active' ? '#bbf7d0' : status === 'submitted' ? '#bfdbfe' : '#e2e8f0'}` }}>
                        {status === 'active' ? '● Live' : status === 'submitted' ? '✓ Done' : status}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      {pct !== null ? (
                        <span style={{ fontSize: '0.83rem', fontWeight: 700, color: passed ? '#10b981' : '#ef4444' }}>
                          {s.Score}/{s.TotalMarks} ({pct}%)
                        </span>
                      ) : <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>—</span>}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontSize: '0.83rem', fontWeight: 700, color: s.ViolationCount > 3 ? '#ef4444' : '#64748b' }}>
                        {s.ViolationCount > 0 ? `⚠️ ${s.ViolationCount}` : '✓ 0'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: `${vColor}15`, color: vColor, border: `1px solid ${vColor}30` }}>
                        {verdict.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <button onClick={() => openStudent(s.StudentId)}
                        style={{ padding: '5px 12px', background: '#eff6ff', color: '#4f8ef7', border: '1px solid #bfdbfe', borderRadius: '7px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '720px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Student Profile</h3>
              <button onClick={() => { setSelected(null); setDetail(null); }}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', color: '#94a3b8', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ padding: '24px' }}>
              {detailLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading…</div>
              ) : detail ? (
                <>
                  {/* Student info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg,#4f8ef7,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: '#fff', fontWeight: 800, flexShrink: 0 }}>
                      {detail.Student?.ProfilePhoto
                        ? <img src={detail.Student.ProfilePhoto} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        : (detail.Student?.FullName || detail.Student?.Username || 'S')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>{detail.Student?.FullName || detail.Student?.Username}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>@{detail.Student?.Username} · {detail.Student?.Email}</div>
                      {detail.Student?.Department && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{detail.Student.Department} {detail.Student.YearOfStudy && `· ${detail.Student.YearOfStudy}`}</div>}
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Joined: {fmtDate(detail.Student?.CreatedAt)}</div>
                    </div>
                  </div>

                  {/* Exam results */}
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>📊 Exam Results</h4>
                  {detail.Sessions?.length === 0 ? (
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>No exams taken yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                      {detail.Sessions?.map((s, i) => {
                        const pct    = s.Score && s.TotalMarks ? Math.round((s.Score / s.TotalMarks) * 100) : null;
                        const passed = pct !== null && pct >= 60;
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e8edf2' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{s.ExamTitle}</div>
                              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>{fmt(s.StartTime)} {s.EndTime ? `→ ${fmt(s.EndTime)}` : ''}</div>
                            </div>
                            {pct !== null ? (
                              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: passed ? '#10b981' : '#ef4444' }}>
                                {s.Score}/{s.TotalMarks} ({pct}%) {passed ? '✅' : '❌'}
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.78rem', color: '#94a3b8', background: '#f1f5f9', padding: '3px 10px', borderRadius: '10px' }}>{s.Status}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Violations */}
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>⚠️ Violation Summary</h4>
                  {detail.Violations?.length === 0 ? (
                    <p style={{ color: '#10b981', fontSize: '0.85rem' }}>✓ No violations recorded.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '10px' }}>
                      {detail.Violations?.map((v, i) => {
                        const key = (v.EventType || '').toLowerCase().replace(' ', '_');
                        const color = V_COLORS[key] || '#94a3b8';
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: `${color}10`, borderRadius: '10px', border: `1px solid ${color}30` }}>
                            <span style={{ fontSize: '20px' }}>{V_ICONS[key] || '⚠️'}</span>
                            <div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{V_LABELS[key] || v.EventType}</div>
                              <div style={{ fontSize: '1rem', fontWeight: 800, color }}>{v.Count}×</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <p style={{ textAlign: 'center', color: '#94a3b8' }}>Failed to load student data.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { BASE_URL, API } from '../api';

const V_COLORS = { phone_detected:'#ef4444', multiple_faces:'#f97316', tab_switch:'#f59e0b', looking_away:'#3b82f6', no_face:'#8b5cf6' };
const V_LABELS = { phone_detected:'Phone Detected', multiple_faces:'Multiple Faces', tab_switch:'Tab Switch', looking_away:'Looking Away', no_face:'No Face' };
const V_ICONS  = { phone_detected:'📱', multiple_faces:'👥', tab_switch:'🔄', looking_away:'👀', no_face:'🚫' };

export default function LiveSessionMonitor({ onNavigate }) {
  const [sessions,  setSessions]  = useState([]);
  const [verdicts,  setVerdicts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [notice,    setNotice]    = useState(null);
  const token = localStorage.getItem('token');
  const h = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchData = useCallback(async () => {
    try {
      const [sRes, vRes] = await Promise.all([
        fetch(`${BASE_URL}/api/sessions`,            { headers: h }),
        fetch(API.proctoringVerdicts,                { headers: h }),
      ]);
      if (sRes.ok) setSessions(await sRes.json().then(d => Array.isArray(d) ? d : []));
      if (vRes.ok) setVerdicts(await vRes.json().then(d => Array.isArray(d) ? d : []));
    } catch {}
    setLoading(false);
  }, []); // eslint-disable-line

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 6000);
    return () => clearInterval(t);
  }, [fetchData]);

  // Merge sessions with their verdict data
  const enriched = sessions.map(s => {
    const v = verdicts.find(x => x.username === s.student_id) || {};
    return { ...s, violationCount: v.violationCount || 0, maxScore: v.maxScore || 0, verdict: v.verdict || 'Clean' };
  });

  const active  = enriched.filter(s => s.status === 'active');
  const flagged = enriched.filter(s => s.verdict === 'Flagged' || s.maxScore > 60);

  function flash(msg) { setNotice(msg); setTimeout(() => setNotice(null), 3000); }

  return (
    <div style={{ width:'100%', animation:'fadeIn 0.4s ease' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <span className="badge badge-info" style={{ marginBottom:'6px' }}>Real-Time Invigilator HUD</span>
          <h2 style={{ fontSize:'1.7rem', fontWeight:800, color:'#0f172a' }}>Live Student Examination Monitor</h2>
          <p style={{ color:'#64748b', fontSize:'0.9rem', marginTop:'2px' }}>
            {loading ? 'Loading...' : `${active.length} active · ${flagged.length} flagged · ${enriched.length} total sessions`}
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

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'24px' }}>
        {[
          { label:'Total Sessions', value: enriched.length, color:'#0066ff', bg:'#eff6ff' },
          { label:'Active Now',     value: active.length,   color:'#10b981', bg:'#f0fdf4' },
          { label:'Flagged',        value: flagged.length,  color:'#ef4444', bg:'#fef2f2' },
          { label:'Submitted',      value: enriched.filter(s=>s.status==='submitted').length, color:'#8b5cf6', bg:'#f5f3ff' },
        ].map(s => (
          <div key={s.label} style={{ background:s.bg, borderRadius:'12px', padding:'16px', border:`1px solid ${s.color}22`, textAlign:'center' }}>
            <div style={{ fontSize:'1.8rem', fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'0.72rem', color:'#64748b', fontWeight:600, marginTop:'3px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Sessions grid */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'60px', color:'#94a3b8' }}>
          <div style={{ fontSize:'2rem', marginBottom:'12px' }}>⏳</div>Loading session data...
        </div>
      ) : enriched.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px', background:'#fff', borderRadius:'16px', border:'1px solid #e8edf2', color:'#64748b' }}>
          <div style={{ fontSize:'3rem', marginBottom:'14px' }}>📭</div>
          <div style={{ fontWeight:700, color:'#0f172a', marginBottom:'6px' }}>No exam sessions yet</div>
          <div style={{ fontSize:'0.85rem' }}>Sessions will appear here when students start exams.</div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'18px' }}>
          {enriched.map((sess, i) => {
            const isHighAlert = sess.maxScore >= 60 || sess.verdict === 'Flagged';
            const pct = Math.round(((sess.score||0) / Math.max(sess.total_questions||1, 1)) * 100);
            return (
              <div key={sess.id||i} style={{
                background:'#fff', borderRadius:'14px', padding:'20px',
                border:`1.5px solid ${isHighAlert ? '#fca5a5' : '#e2e8f0'}`,
                borderLeft:`4px solid ${isHighAlert ? '#ef4444' : '#10b981'}`,
                boxShadow:'0 1px 4px rgba(0,0,0,0.05)',
              }}>
                {/* Header */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
                  <div>
                    <div style={{ fontWeight:800, color:'#0f172a', fontSize:'0.92rem' }}>👤 {sess.student_id}</div>
                    <div style={{ fontSize:'0.72rem', color:'#94a3b8', marginTop:'2px' }}>Session #{sess.id}</div>
                  </div>
                  <span style={{
                    fontSize:'0.68rem', fontWeight:700, padding:'3px 10px', borderRadius:'20px',
                    background: sess.status==='active' ? '#f0fdf4' : '#f8fafc',
                    color:      sess.status==='active' ? '#10b981'  : '#64748b',
                    border:     `1px solid ${sess.status==='active' ? '#bbf7d0' : '#e2e8f0'}`,
                  }}>
                    {sess.status==='active' ? '● Active' : sess.status==='submitted' ? '✓ Submitted' : sess.status}
                  </span>
                </div>

                {/* Webcam placeholder */}
                <div style={{
                  height:'120px', background:'#0f172a', borderRadius:'10px',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  marginBottom:'14px', border:`1.5px solid ${isHighAlert ? '#ef4444' : '#334155'}`,
                  position:'relative', overflow:'hidden',
                }}>
                  <div style={{ textAlign:'center', color:'#64748b' }}>
                    <div style={{ fontSize:'1.8rem', marginBottom:'4px' }}>📹</div>
                    <div style={{ fontSize:'0.7rem' }}>Live stream not available in review mode</div>
                  </div>
                  {isHighAlert && (
                    <div style={{
                      position:'absolute', bottom:'6px', left:'6px', right:'6px',
                      background:'rgba(239,68,68,0.92)', color:'#fff',
                      padding:'4px 8px', borderRadius:'6px', fontSize:'0.7rem', fontWeight:700, textAlign:'center',
                    }}>
                      🚨 HIGH RISK — {sess.violationCount} violation{sess.violationCount!==1?'s':''}
                    </div>
                  )}
                </div>

                {/* Suspicion score bar */}
                <div style={{ marginBottom:'12px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', marginBottom:'5px' }}>
                    <span style={{ color:'#64748b' }}>Max Suspicion Score</span>
                    <strong style={{ color: isHighAlert ? '#ef4444' : '#10b981' }}>{sess.maxScore} / 100</strong>
                  </div>
                  <div style={{ height:'6px', background:'#f1f5f9', borderRadius:'3px', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${Math.min(sess.maxScore,100)}%`, background: isHighAlert ? '#ef4444' : '#10b981', borderRadius:'3px' }} />
                  </div>
                </div>

                {/* Info row */}
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'#64748b', marginBottom:'14px' }}>
                  <span>📊 Score: <strong>{sess.score||0}/{sess.total_questions||'—'}</strong> ({pct}%)</span>
                  <span>⚠ Violations: <strong>{sess.violationCount}</strong></span>
                </div>

                {/* Verdict badge */}
                <div style={{ display:'flex', gap:'8px', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{
                    fontSize:'0.72rem', fontWeight:700, padding:'4px 12px', borderRadius:'20px',
                    background: isHighAlert ? '#fef2f2' : '#f0fdf4',
                    color:      isHighAlert ? '#ef4444'  : '#15803d',
                    border:     `1px solid ${isHighAlert ? '#fca5a5' : '#86efac'}`,
                  }}>
                    {isHighAlert ? '⚠ Flagged' : '✓ Clean'}
                  </span>
                  <button className="btn btn-secondary" style={{ fontSize:'0.72rem', padding:'4px 10px' }}
                    onClick={() => { flash(`Session #${sess.id} noted.`); onNavigate('evidence'); }}>
                    🎬 Review
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

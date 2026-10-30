import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../api';

const V_LABELS = { phone_detected:'Phone Detected', multiple_faces:'Multiple Faces', tab_switch:'Tab Switch', looking_away:'Looking Away', no_face:'No Face Detected' };
const V_COLORS = { phone_detected:'#ef4444', multiple_faces:'#f97316', tab_switch:'#f59e0b', looking_away:'#3b82f6', no_face:'#8b5cf6' };
const V_ICONS  = { phone_detected:'📱', multiple_faces:'👥', tab_switch:'🔄', looking_away:'👀', no_face:'🚫' };

export default function EvidencePlayerPage({ onNavigate }) {
  const [logs,            setLogs]            = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [filterEvent,     setFilterEvent]     = useState('ALL');
  const [currentIndex,    setCurrentIndex]    = useState(0);
  const [filterStudent,   setFilterStudent]   = useState('ALL');
  const [proctorNotes,    setProctorNotes]    = useState('');
  const [decision,        setDecision]        = useState('FLAGGED');
  const [savedStatus,     setSavedStatus]     = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${BASE_URL}/api/proctoring/logs`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { setLogs(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const students   = [...new Set(logs.map(l => l.user_id).filter(Boolean))];
  const eventTypes = [...new Set(logs.map(l => l.event).filter(Boolean))];

  const filtered = logs.filter(l => {
    const matchE = filterEvent   === 'ALL' || l.event   === filterEvent;
    const matchS = filterStudent === 'ALL' || l.user_id === filterStudent;
    return matchE && matchS;
  });

  const active = filtered[currentIndex] || filtered[0];

  function handleSave() {
    setSavedStatus('Audit verdict saved.');
    setTimeout(() => setSavedStatus(null), 3000);
  }

  return (
    <div style={{ width:'100%', animation:'fadeIn 0.4s ease' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <span className="badge badge-warning" style={{ marginBottom:'6px' }}>Invigilator Evidence Player</span>
          <h2 style={{ fontSize:'1.6rem', fontWeight:800, color:'#0f172a' }}>Proctoring Violation Log Viewer</h2>
          <p style={{ color:'#64748b', fontSize:'0.85rem', marginTop:'4px' }}>
            {loading ? 'Loading...' : `${logs.length} total events · ${filtered.length} shown`}
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => onNavigate('dashboard')}>← Back</button>
      </div>

      {savedStatus && (
        <div style={{ padding:'12px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'8px', color:'#15803d', fontWeight:600, marginBottom:'16px', fontSize:'0.88rem' }}>
          ✓ {savedStatus}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px', color:'#94a3b8' }}>
          <div style={{ fontSize:'2rem', marginBottom:'10px' }}>⏳</div> Loading violation logs...
        </div>
      ) : logs.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px', background:'#fff', borderRadius:'16px', border:'1px solid #e8edf2', color:'#64748b' }}>
          <div style={{ fontSize:'3rem', marginBottom:'14px' }}>📭</div>
          <div style={{ fontWeight:700, color:'#0f172a', marginBottom:'6px' }}>No violations recorded yet</div>
          <div style={{ fontSize:'0.85rem' }}>Violation events will appear here after students complete proctored exams.</div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'24px' }}>

          {/* Left — active event viewer */}
          <div>
            <div className="card" style={{ padding:'24px', marginBottom:'20px' }}>
              {/* Filters */}
              <div style={{ display:'flex', gap:'12px', marginBottom:'20px', flexWrap:'wrap' }}>
                <select className="form-select" style={{ flex:1 }} value={filterStudent} onChange={e => { setFilterStudent(e.target.value); setCurrentIndex(0); }}>
                  <option value="ALL">All Students</option>
                  {students.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select className="form-select" style={{ flex:1 }} value={filterEvent} onChange={e => { setFilterEvent(e.target.value); setCurrentIndex(0); }}>
                  <option value="ALL">All Events ({logs.length})</option>
                  {eventTypes.map(e => <option key={e} value={e}>{V_LABELS[e]||e} ({logs.filter(l=>l.event===e).length})</option>)}
                </select>
              </div>

              {active && (
                <>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                    <div>
                      <strong style={{ fontSize:'1rem', color:'#0f172a' }}>Student: {active.user_id}</strong>
                      <span style={{ marginLeft:'12px', fontSize:'0.82rem', color:'#94a3b8' }}>Event #{active.id}</span>
                    </div>
                    <span style={{
                      fontSize:'0.78rem', fontWeight:700, padding:'4px 12px', borderRadius:'20px',
                      background:`${V_COLORS[active.event]||'#94a3b8'}18`,
                      color: V_COLORS[active.event]||'#64748b',
                      border:`1px solid ${V_COLORS[active.event]||'#e2e8f0'}44`,
                    }}>
                      {V_ICONS[active.event]||'⚠️'} {V_LABELS[active.event]||active.event}
                    </span>
                  </div>

                  {/* Simulated frame */}
                  <div style={{ height:'320px', background:'#0f172a', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'20px', border:`1.5px solid ${V_COLORS[active.event]||'#334155'}`, position:'relative' }}>
                    <div style={{ textAlign:'center', color:'#94a3b8' }}>
                      <div style={{ fontSize:'3rem', marginBottom:'10px' }}>{V_ICONS[active.event]||'⚠️'}</div>
                      <div style={{ fontSize:'0.88rem', fontWeight:600, color:'#fff', marginBottom:'6px' }}>{V_LABELS[active.event]||active.event}</div>
                      <div style={{ fontSize:'0.75rem' }}>Suspicion Score: <strong style={{ color: active.suspicion_score>60?'#ef4444':'#f59e0b' }}>{active.suspicion_score}</strong></div>
                      <div style={{ fontSize:'0.72rem', marginTop:'4px', color:'#64748b' }}>{active.timestamp ? new Date(active.timestamp).toLocaleString() : '—'}</div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <button className="btn btn-secondary" style={{ padding:'6px 14px' }} disabled={currentIndex === 0} onClick={() => setCurrentIndex(i => i-1)}>← Prev</button>
                    <div style={{ flex:1 }}>
                      <input type="range" min="0" max={Math.max(filtered.length-1,0)} value={currentIndex}
                        onChange={e => setCurrentIndex(Number(e.target.value))} style={{ width:'100%' }} />
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.72rem', color:'#94a3b8', marginTop:'4px' }}>
                        <span>Event 1</span>
                        <span>{currentIndex+1} / {filtered.length}</span>
                        <span>Event {filtered.length}</span>
                      </div>
                    </div>
                    <button className="btn btn-secondary" style={{ padding:'6px 14px' }} disabled={currentIndex >= filtered.length-1} onClick={() => setCurrentIndex(i => i+1)}>Next →</button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right — log list + verdict */}
          <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

            {/* Event list */}
            <div className="card" style={{ padding:'20px' }}>
              <h4 style={{ fontSize:'0.95rem', fontWeight:700, color:'#0f172a', marginBottom:'14px' }}>
                Breach Events ({filtered.length})
              </h4>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px', maxHeight:'320px', overflowY:'auto' }}>
                {filtered.map((log, idx) => (
                  <div key={log.id||idx} onClick={() => setCurrentIndex(idx)} style={{
                    padding:'10px 12px', borderRadius:'8px', cursor:'pointer',
                    border: currentIndex===idx ? '1.5px solid #0066ff' : '1px solid #e2e8f0',
                    background: currentIndex===idx ? '#eff6ff' : '#f8fafc',
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                  }}>
                    <div>
                      <div style={{ fontSize:'0.82rem', fontWeight:700, color:'#0f172a' }}>
                        {V_ICONS[log.event]||'⚠️'} {V_LABELS[log.event]||log.event}
                      </div>
                      <div style={{ fontSize:'0.7rem', color:'#64748b' }}>{log.user_id} · Score: {log.suspicion_score}</div>
                    </div>
                    <span style={{ fontSize:'0.68rem', color:'#94a3b8', whiteSpace:'nowrap' }}>
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verdict form */}
            <div className="card" style={{ padding:'20px' }}>
              <h4 style={{ fontSize:'0.95rem', fontWeight:700, color:'#0f172a', marginBottom:'14px' }}>Proctor Verdict</h4>
              <div style={{ marginBottom:'12px' }}>
                <label style={{ fontSize:'0.82rem', color:'#64748b', display:'block', marginBottom:'5px' }}>Decision</label>
                <select className="form-select" value={decision} onChange={e => setDecision(e.target.value)}>
                  <option value="CLEAR">Clear — No Breach</option>
                  <option value="WARNING">Issue Warning</option>
                  <option value="FLAGGED">Flag for Review</option>
                  <option value="DISQUALIFIED">Invalidate Exam</option>
                </select>
              </div>
              <div style={{ marginBottom:'14px' }}>
                <label style={{ fontSize:'0.82rem', color:'#64748b', display:'block', marginBottom:'5px' }}>Remarks</label>
                <textarea className="form-input" rows="3" value={proctorNotes}
                  onChange={e => setProctorNotes(e.target.value)}
                  placeholder="Add notes about the violation..." style={{ resize:'vertical' }} />
              </div>
              <button className="btn btn-primary" style={{ width:'100%' }} onClick={handleSave}>
                💾 Save Audit Verdict
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

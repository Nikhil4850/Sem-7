import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { API, BASE_URL, apiRequest } from '../api';

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
  multiple_faces:      'Multiple Faces',
  tab_switch:          'Tab Switch',
  looking_away:        'Looking Away',
  face_missing:        'Face Missing',
  suspicious_movement: 'Suspicious Movement',
};
const V_ICONS = {
  phone_detected: '📱', multiple_faces: '👥',
  tab_switch: '🔄', looking_away: '👀',
  face_missing: '🚫', suspicious_movement: '⚠️',
};

function StatCard({ icon, label, value, sub, iconBg }) {
  return (
    <div style={{ background:'#fff', border:'1px solid #e8edf2', borderRadius:'14px', padding:'20px', display:'flex', alignItems:'center', gap:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:iconBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0 }}>{icon}</div>
      <div>
        <div style={{ fontSize:'0.73rem', color:'#64748b', fontWeight:600, marginBottom:'3px' }}>{label}</div>
        <div style={{ fontSize:'1.8rem', fontWeight:800, color:'#0f172a', lineHeight:1 }}>{value}</div>
        {sub && <div style={{ fontSize:'0.68rem', color:'#94a3b8', marginTop:'3px' }}>{sub}</div>}
      </div>
    </div>
  );
}

const DTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:'8px', padding:'8px 12px', fontSize:'0.78rem' }}><strong>{payload[0].name}</strong>: {payload[0].value}</div>;
};

export default function AdminDashboard({ token }) {
  const [logs,  setLogs]  = useState([]);
  const [exams, setExams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [updated, setUpdated] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [lr, er, ur] = await Promise.all([
        apiRequest(API.proctoringLogs,         'GET', null, token),
        apiRequest(API.exams,                  'GET', null, token),
        apiRequest(`${BASE_URL}/api/users`,    'GET', null, token),
      ]);
      if (lr.ok) setLogs( await lr.json().then(d => Array.isArray(d) ? d : []));
      if (er.ok) setExams(await er.json().then(d => Array.isArray(d) ? d : []));
      if (ur.ok) setUsers(await ur.json().then(d => Array.isArray(d) ? d : []));
      setUpdated(new Date());
    } catch {}
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchAll(); const t = setInterval(fetchAll, 5000); return () => clearInterval(t); }, [fetchAll]);

  // derived
  const activeExams = exams.filter(e => e.isActive);
  const students    = users.filter(u => u.role === 'student');

  const vMap = {};
  logs.forEach(l => { const k = l.event || l.eventType || 'other'; vMap[k] = (vMap[k] || 0) + 1; });
  const vPie = Object.entries(vMap).map(([k, v]) => ({ name: V_LABELS[k] || k.replace(/_/g,' '), value:v, color: V_COLORS[k] || '#94a3b8', key:k }));
  const totalPie = vPie.reduce((a, v) => a + v.value, 0);

  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const dMap = {}; logs.forEach(l => { const d = new Date(l.timestamp||l.createdAt); dMap[days[d.getDay()]] = (dMap[days[d.getDay()]]||0)+1; });
  const barData = days.map(d => ({ day:d, Violations: dMap[d]||0 }));

  const recentAlerts = [...logs].sort((a,b) => new Date(b.timestamp||b.createdAt) - new Date(a.timestamp||a.createdAt)).slice(0,6);
  const filtered = logs.filter(l => { const s = search.toLowerCase(); return !s || (l.user_id||l.studentUsername||'').toLowerCase().includes(s) || (l.event||l.eventType||'').toLowerCase().includes(s); });
  const bc = s => s > 60 ? '#ef4444' : s > 30 ? '#f59e0b' : '#10b981';

  return (
    <div style={{ animation:'fadeIn 0.35s ease', display:'flex', gap:'24px', alignItems:'flex-start' }}>

      {/* Main */}
      <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:'22px' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h2 style={{ fontSize:'1.25rem', fontWeight:800, color:'#0f172a', margin:0 }}>Proctoring Dashboard</h2>
            <p style={{ fontSize:'0.72rem', color:'#94a3b8', margin:'3px 0 0' }}>
              {loading ? 'Refreshing…' : updated ? `Updated ${updated.toLocaleTimeString()}` : 'Live'}
            </p>
          </div>
          <button onClick={fetchAll} className="btn btn-secondary" style={{ fontSize:'0.78rem', padding:'6px 14px' }}>↻ Refresh</button>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px' }}>
          <StatCard icon="📋" label="Total Exams"      value={exams.length}   sub={`${activeExams.length} active`}         iconBg="#eff6ff" />
          <StatCard icon="👥" label="Students"         value={students.length} sub={`${users.length} total users`}         iconBg="#f0fdf4" />
          <StatCard icon="▶"  label="Active Exams"     value={activeExams.length} sub="Available now"                     iconBg="#fff7ed" />
          <StatCard icon="⚠️" label="Total Violations" value={logs.length}    sub="All time"                               iconBg="#fef2f2" />
        </div>

        {/* Charts */}
        <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:'18px' }}>
          <div style={{ background:'#fff', border:'1px solid #e8edf2', borderRadius:'14px', padding:'20px', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize:'0.88rem', fontWeight:700, color:'#0f172a', marginBottom:'14px' }}>Violations Per Day</h3>
            {logs.length === 0
              ? <div style={{ textAlign:'center', padding:'40px 0', color:'#94a3b8', fontSize:'0.82rem' }}>No violations yet</div>
              : <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={barData} barSize={18}>
                    <XAxis dataKey="day" tick={{ fill:'#94a3b8', fontSize:11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:'#94a3b8', fontSize:10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:'8px', fontSize:'0.78rem' }} cursor={{ fill:'rgba(0,0,0,0.03)' }} />
                    <Bar dataKey="Violations" fill="#4f8ef7" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
            }
          </div>

          <div style={{ background:'#fff', border:'1px solid #e8edf2', borderRadius:'14px', padding:'20px', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize:'0.88rem', fontWeight:700, color:'#0f172a', marginBottom:'12px' }}>Violation Types</h3>
            {vPie.length === 0
              ? <div style={{ textAlign:'center', padding:'40px 0', color:'#94a3b8', fontSize:'0.82rem' }}>No violations yet</div>
              : <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                  <div style={{ position:'relative', flexShrink:0 }}>
                    <PieChart width={120} height={120}>
                      <Pie data={vPie} cx={55} cy={55} innerRadius={34} outerRadius={55} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                        {vPie.map((e,i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip content={<DTip />} />
                    </PieChart>
                    <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center' }}>
                      <div style={{ fontSize:'1.3rem', fontWeight:800, color:'#0f172a', lineHeight:1 }}>{totalPie}</div>
                      <div style={{ fontSize:'0.58rem', color:'#94a3b8' }}>Total</div>
                    </div>
                  </div>
                  <div style={{ flex:1 }}>
                    {vPie.map((v,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'5px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                          <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:v.color, display:'inline-block' }} />
                          <span style={{ fontSize:'0.7rem', color:'#334155' }}>{v.name}</span>
                        </div>
                        <span style={{ fontSize:'0.73rem', fontWeight:700, color:'#0f172a' }}>{v.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
            }
          </div>
        </div>

        {/* Violation Feed Table */}
        <div style={{ background:'#fff', border:'1px solid #e8edf2', borderRadius:'14px', padding:'20px', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px', flexWrap:'wrap', gap:'10px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <h3 style={{ fontSize:'0.88rem', fontWeight:700, color:'#0f172a' }}>Live Violation Feed</h3>
              <span style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'0.68rem', fontWeight:600, color:'#10b981', background:'#f0fdf4', padding:'3px 9px', borderRadius:'20px', border:'1px solid #bbf7d0' }}>
                <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#10b981', display:'inline-block' }} /> Live · {filtered.length}
              </span>
            </div>
            <input type="text" placeholder="Search student or event…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ padding:'6px 12px', border:'1px solid #e2e8f0', borderRadius:'8px', fontSize:'0.78rem', outline:'none', width:'210px', fontFamily:'inherit' }} />
          </div>

          {filtered.length === 0
            ? <div style={{ textAlign:'center', padding:'36px', color:'#94a3b8', fontSize:'0.82rem' }}>{loading ? 'Loading…' : 'No violations recorded yet.'}</div>
            : <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'separate', borderSpacing:0 }}>
                  <thead>
                    <tr>{['Time','Student','Event','Risk Score','Status'].map(h => (
                      <th key={h} style={{ padding:'9px 13px', background:'#f8fafc', color:'#64748b', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid #e2e8f0', textAlign:'left' }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0,50).map((l, i) => {
                      const score = l.suspicion_score ?? l.score ?? 0;
                      const event = l.event || l.eventType || '';
                      const user  = l.user_id || l.studentUsername || '—';
                      const ts    = l.timestamp || l.createdAt;
                      return (
                        <tr key={l.id||i}>
                          <td style={{ padding:'9px 13px', fontSize:'0.75rem', color:'#94a3b8', borderBottom:'1px solid #f1f5f9' }}>{ts ? new Date(ts).toLocaleTimeString() : '—'}</td>
                          <td style={{ padding:'9px 13px', fontWeight:600, color:'#0f172a', fontSize:'0.83rem', borderBottom:'1px solid #f1f5f9' }}>{user}</td>
                          <td style={{ padding:'9px 13px', borderBottom:'1px solid #f1f5f9' }}>
                            <span style={{ background:`${V_COLORS[event]||'#94a3b8'}18`, color:V_COLORS[event]||'#475569', padding:'3px 9px', borderRadius:'20px', fontSize:'0.7rem', fontWeight:700, whiteSpace:'nowrap' }}>
                              {V_ICONS[event] || '⚠️'} {V_LABELS[event] || event.replace(/_/g,' ') || '—'}
                            </span>
                          </td>
                          <td style={{ padding:'9px 13px', borderBottom:'1px solid #f1f5f9' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                              <div style={{ width:'52px', height:'5px', background:'#f1f5f9', borderRadius:'3px', overflow:'hidden' }}>
                                <div style={{ width:`${Math.min(score,100)}%`, height:'100%', background:bc(score), borderRadius:'3px' }} />
                              </div>
                              <span style={{ fontSize:'0.78rem', fontWeight:700, color:bc(score) }}>{score}</span>
                            </div>
                          </td>
                          <td style={{ padding:'9px 13px', borderBottom:'1px solid #f1f5f9' }}>
                            <span style={{ fontSize:'0.73rem', fontWeight:600, color:score>60?'#ef4444':'#10b981' }}>{score>60?'⚠ High Risk':'✓ Normal'}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
          }
        </div>
      </div>

      {/* Sidebar */}
      <div style={{ width:'248px', flexShrink:0, display:'flex', flexDirection:'column', gap:'16px' }}>

        {/* Recent Alerts */}
        <div style={{ background:'#fff', border:'1px solid #e8edf2', borderRadius:'14px', padding:'18px', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize:'0.85rem', fontWeight:700, color:'#0f172a', marginBottom:'12px' }}>Recent Alerts</h3>
          {recentAlerts.length === 0
            ? <div style={{ color:'#94a3b8', fontSize:'0.78rem', textAlign:'center', padding:'14px 0' }}>No alerts yet</div>
            : <div style={{ display:'flex', flexDirection:'column', gap:'9px' }}>
                {recentAlerts.map((l, i) => {
                  const event = l.event || l.eventType || '';
                  const color = V_COLORS[event] || '#94a3b8';
                  const ts    = l.timestamp || l.createdAt;
                  return (
                    <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'9px', paddingBottom:'9px', borderBottom: i < recentAlerts.length-1 ? '1px solid #f8fafc' : 'none' }}>
                      <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:`${color}18`, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px' }}>
                        {V_ICONS[event] || '⚠️'}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:'0.73rem', fontWeight:700, color:'#0f172a', lineHeight:1.3 }}>{V_LABELS[event] || event.replace(/_/g,' ')}</div>
                        <div style={{ fontSize:'0.65rem', color:'#94a3b8' }}>{l.user_id || l.studentUsername}</div>
                        <div style={{ fontSize:'0.62rem', color:'#cbd5e1', marginTop:'1px' }}>{ts ? new Date(ts).toLocaleTimeString() : ''}</div>
                      </div>
                      <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:color, flexShrink:0, marginTop:'5px' }} />
                    </div>
                  );
                })}
              </div>
          }
        </div>

        {/* Active Exams */}
        <div style={{ background:'#fff', border:'1px solid #e8edf2', borderRadius:'14px', padding:'18px', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize:'0.85rem', fontWeight:700, color:'#0f172a', marginBottom:'12px' }}>Active Exams</h3>
          {activeExams.length === 0
            ? <div style={{ color:'#94a3b8', fontSize:'0.78rem', textAlign:'center', padding:'14px 0' }}>No active exams</div>
            : <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {activeExams.map((ex, i) => (
                  <div key={ex.examId||i} style={{ display:'flex', alignItems:'flex-start', gap:'9px' }}>
                    <div style={{ width:'30px', height:'30px', borderRadius:'8px', background:'#eff6ff', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px' }}>📋</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'0.76rem', fontWeight:700, color:'#0f172a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ex.title}</div>
                      <div style={{ fontSize:'0.65rem', color:'#94a3b8' }}>⏱ {ex.durationMinutes} min · {ex.totalMarks} marks</div>
                    </div>
                    <span style={{ fontSize:'0.6rem', fontWeight:700, color:'#10b981', background:'#f0fdf4', padding:'2px 6px', borderRadius:'10px', border:'1px solid #bbf7d0', flexShrink:0 }}>● Live</span>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* User Breakdown */}
        <div style={{ background:'#fff', border:'1px solid #e8edf2', borderRadius:'14px', padding:'18px', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize:'0.85rem', fontWeight:700, color:'#0f172a', marginBottom:'12px' }}>Users</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
            {[
              { label:'Admins',   role:'administrator', color:'#f59e0b', icon:'🔑' },
              { label:'Teachers', role:'teacher',       color:'#8b5cf6', icon:'👨‍🏫' },
              { label:'Students', role:'student',       color:'#10b981', icon:'🎓' },
            ].map(({ label, role, color, icon }) => {
              const count = users.filter(u => u.role === role || (role === 'administrator' && u.role === 'admin')).length;
              return (
                <div key={role} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 10px', borderRadius:'8px', background:'#f8fafc' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                    <span style={{ fontSize:'13px' }}>{icon}</span>
                    <span style={{ fontSize:'0.76rem', color:'#334155', fontWeight:500 }}>{label}</span>
                  </div>
                  <span style={{ fontSize:'0.85rem', fontWeight:800, color }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

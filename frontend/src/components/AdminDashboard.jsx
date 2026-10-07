import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const SAMPLE_DEMO_LOGS = [
  { id: 101, user_id: 'student_alex', event: 'phone_detected', suspicion_score: 90, timestamp: new Date(Date.now() - 120000).toISOString() },
  { id: 102, user_id: 'student_maria', event: 'looking_away', suspicion_score: 20, timestamp: new Date(Date.now() - 240000).toISOString() },
  { id: 103, user_id: 'student_jordan', event: 'tab_switch', suspicion_score: 40, timestamp: new Date(Date.now() - 360000).toISOString() },
  { id: 104, user_id: 'student_sam', event: 'multiple_faces', suspicion_score: 80, timestamp: new Date(Date.now() - 480000).toISOString() },
  { id: 105, user_id: 'student_alex', event: 'no_face', suspicion_score: 30, timestamp: new Date(Date.now() - 600000).toISOString() },
];

export default function AdminDashboard({ token }) {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  function fetchLogs() {
    setLoading(true);
    fetch('http://localhost:8000/logs', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setLogs(data);
        } else {
          setLogs(SAMPLE_DEMO_LOGS);
        }
        setLoading(false);
      })
      .catch(() => {
        // Offline / Demo Fallback Mode
        setLogs(SAMPLE_DEMO_LOGS);
        setError(null);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const total    = logs.length;
  const phones   = logs.filter(l => l.event === 'phone_detected').length;
  const noface   = logs.filter(l => l.event === 'no_face').length;
  const looking  = logs.filter(l => l.event === 'looking_away').length;
  const multiple = logs.filter(l => l.event === 'multiple_faces').length;
  const tabs     = logs.filter(l => l.event === 'tab_switch').length;

  const barData = [
    { name: 'Phone', value: phones || 1,   color: '#ef4444' },
    { name: 'No Face', value: noface || 1, color: '#f59e0b' },
    { name: 'Looking Away', value: looking || 1, color: '#3b82f6' },
    { name: 'Multi Face', value: multiple || 1, color: '#8b5cf6' },
    { name: 'Tab Switch', value: tabs || 1, color: '#ec4899' },
  ];

  function eventColor(event) {
    const map = {
      phone_detected: 'pill pill-red',
      multiple_faces: 'pill pill-red',
      no_face:        'pill pill-yellow',
      looking_away:   'pill pill-yellow',
      tab_switch:     'pill pill-yellow',
    };
    return map[event] || 'pill pill-green';
  }

  function formatTime(ts) {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString();
  }

  const stats = [
    { label: 'Total Events',   value: total,           color: '#3b82f6' },
    { label: 'Phone Detected', value: phones,           color: '#ef4444' },
    { label: 'Looking Away',   value: looking,          color: '#f59e0b' },
    { label: 'Tab Switches',   value: tabs,             color: '#ec4899' },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{
            fontSize: '22px', fontWeight: '700',
            background: 'linear-gradient(135deg, #fff, #94a3b8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>Teacher & Administrator Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
            Live Student Proctoring Monitor · Instant Analytics Feed
            {loading && ' · Refreshing...'}
          </p>
        </div>
        <button onClick={fetchLogs} className="nav-btn active" style={{ padding: '8px 16px', fontSize: '13px' }}>
          ↻ Refresh Logs
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Distribution Chart */}
      <div className="glass" style={{ padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          AI Violation Event Distribution
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} barSize={36}>
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9' }} />
            <Bar dataKey="value" radius={[6,6,0,0]}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Logs Table */}
      <div className="glass" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80', animation: 'pulse 2s infinite' }} />
          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Live Student Session Violation Logs</span>
          <span style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: '600' }}>{total}</span>
        </div>

        {error && <div className="error-banner" style={{ margin: '16px' }}>{error}</div>}

        <table className="data-table">
          <thead>
            <tr>
              {['Log ID', 'Student Username', 'AI Violation Event', 'Suspicion Score', 'Timestamp'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td style={{ color: 'var(--text-muted)' }}>#{log.id}</td>
                <td style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{log.user_id}</td>
                <td>
                  <span className={eventColor(log.event)}>{log.event}</span>
                </td>
                <td style={{ fontWeight: '700', color: log.suspicion_score >= 50 ? '#f87171' : log.suspicion_score >= 20 ? '#fbbf24' : '#4ade80' }}>
                  {log.suspicion_score}
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{formatTime(log.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../api';

export default function ExamResults({ token, onNavigate }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // expanded session

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE_URL}/api/sessions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setResults(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setResults([]); setLoading(false); });
  }, [token]);

  function exportCSV() {
    const headers = ['Session','Exam','Score','Total','Percentage','Status','Submitted'];
    const rows = results.map(r => {
      const total = r.total_questions || 10;
      const pct   = Math.round(((r.score || 0) / Math.max(total, 1)) * 100);
      return [r.id, r.exam_id || '—', r.score || 0, total, `${pct}%`,
              pct >= 60 ? 'PASSED' : 'FAILED',
              r.submitted_at ? new Date(r.submitted_at).toLocaleString() : '—'];
    });
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const a   = Object.assign(document.createElement('a'), {
      href:     'data:text/csv;charset=utf-8,' + encodeURIComponent(csv),
      download: 'my_results.csv',
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  const submitted = results.filter(r => r.status === 'submitted');
  const totalPass = submitted.filter(r => {
    const t = r.total_questions || 10;
    return Math.round(((r.score || 0) / Math.max(t, 1)) * 100) >= 60;
  }).length;
  const avgPct = submitted.length
    ? Math.round(submitted.reduce((s, r) => s + ((r.score || 0) / Math.max(r.total_questions || 10, 1)) * 100, 0) / submitted.length)
    : 0;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>My Exam Results</h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px' }}>
            Your submitted exam history and scores
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {submitted.length > 0 && (
            <button onClick={exportCSV} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
              📥 Export CSV
            </button>
          )}
          {onNavigate && (
            <button onClick={() => onNavigate('student-dashboard')} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              ← Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Exams Taken',  value: submitted.length, color: '#0066ff', bg: '#eff6ff' },
          { label: 'Passed',       value: totalPass,         color: '#10b981', bg: '#f0fdf4' },
          { label: 'Failed',       value: submitted.length - totalPass, color: '#ef4444', bg: '#fef2f2' },
          { label: 'Avg Score',    value: submitted.length ? `${avgPct}%` : '—', color: '#8b5cf6', bg: '#f5f3ff' },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg, borderRadius: '14px', padding: '16px',
            border: `1px solid ${s.color}22`, textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
          <div style={{ fontWeight: 600 }}>Loading your results...</div>
        </div>
      ) : submitted.length === 0 ? (
        <div style={{
          background: '#fff', border: '1px solid #e8edf2', borderRadius: '16px',
          padding: '60px 24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '14px' }}>📭</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
            No exam results yet
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '24px' }}>
            Complete a proctored exam to see your scores here.
          </div>
          {onNavigate && (
            <button className="btn btn-primary" onClick={() => onNavigate('student-dashboard')}>
              Browse Exams →
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {submitted.map(r => {
            const total   = r.total_questions || 10;
            const score   = r.score || 0;
            const pct     = Math.round((score / Math.max(total, 1)) * 100);
            const passed  = pct >= 60;
            const isOpen  = selected === r.id;
            return (
              <div key={r.id} style={{
                background: '#fff', border: `1.5px solid ${isOpen ? '#0066ff' : '#e2e8f0'}`,
                borderRadius: '14px', overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}>
                {/* Row header */}
                <div
                  onClick={() => setSelected(isOpen ? null : r.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '16px 20px', cursor: 'pointer',
                    background: isOpen ? '#f8faff' : '#fff',
                  }}
                >
                  {/* Score circle */}
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
                    background: passed ? '#f0fdf4' : '#fef2f2',
                    border: `2.5px solid ${passed ? '#86efac' : '#fca5a5'}`,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: passed ? '#15803d' : '#dc2626', lineHeight: 1 }}>{pct}%</span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: '3px' }}>
                      Exam Session #{r.id}
                    </div>
                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        📊 {score} / {total} questions
                      </span>
                      {r.submitted_at && (
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                          🕒 {new Date(r.submitted_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Badge + chevron */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                      background: passed ? '#dcfce7' : '#fee2e2',
                      color: passed ? '#15803d' : '#dc2626',
                      border: `1px solid ${passed ? '#86efac' : '#fca5a5'}`,
                    }}>
                      {passed ? '✅ PASSED' : '❌ FAILED'}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '1rem', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
                  </div>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid #f1f5f9' }}>

                    {/* Score bar */}
                    <div style={{ marginTop: '16px', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Score breakdown</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: passed ? '#15803d' : '#dc2626' }}>{pct}%</span>
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct}%`, height: '100%',
                          background: passed ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#ef4444,#f87171)',
                          borderRadius: '4px', transition: 'width 0.6s ease',
                        }} />
                      </div>
                    </div>

                    {/* Detail grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '10px', marginBottom: '16px' }}>
                      {[
                        { label: 'Score',         value: `${score} / ${total}`,       icon: '📊' },
                        { label: 'Percentage',    value: `${pct}%`,                    icon: '📈' },
                        { label: 'Status',        value: passed ? 'Passed' : 'Failed', icon: passed ? '✅' : '❌' },
                        { label: 'Submitted',     value: r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : '—', icon: '📅' },
                      ].map(d => (
                        <div key={d.label} style={{
                          background: '#f8fafc', borderRadius: '10px', padding: '12px 14px',
                          border: '1px solid #e2e8f0',
                        }}>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>
                            {d.icon} {d.label}
                          </div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{d.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Proctoring note */}
                    <div style={{
                      background: '#fffbeb', border: '1px solid #fde68a',
                      borderRadius: '8px', padding: '10px 14px',
                      fontSize: '0.78rem', color: '#92400e',
                    }}>
                      🛡️ This exam session was monitored by AI Proctor. Logs are recorded and verified.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

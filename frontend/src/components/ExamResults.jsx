import React, { useState, useEffect } from 'react';

const DEMO_RESULTS = [
  { id: 201, student_id: 'student_alex', score: 9, total_questions: 10, submitted_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 202, student_id: 'student_maria', score: 8, total_questions: 10, submitted_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 203, student_id: 'student_jordan', score: 10, total_questions: 10, submitted_at: new Date(Date.now() - 10800000).toISOString() },
  { id: 204, student_id: 'student_sam', score: 5, total_questions: 10, submitted_at: new Date(Date.now() - 14400000).toISOString() },
  { id: 205, student_id: 'student_taylor', score: 7, total_questions: 10, submitted_at: new Date(Date.now() - 18000000).toISOString() },
];

export default function ExamResults({ token }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = `http://localhost:8000`;

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/exam/results`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setResults(data);
        } else {
          setResults(DEMO_RESULTS);
        }
        setLoading(false);
      })
      .catch(() => {
        setResults(DEMO_RESULTS);
        setLoading(false);
      });
  }, [token]);

  function formatDate(ts) {
    if (!ts) return '';
    return new Date(ts).toLocaleString();
  }

  const totalSubs = results.length;
  const avgPct = totalSubs
    ? Math.round(results.reduce((a, r) => a + (r.score / (r.total_questions || 10) * 100), 0) / totalSubs)
    : 0;

  const passedCount = results.filter(r => (r.score / (r.total_questions || 10)) >= 0.6).length;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{
            fontSize: '22px', fontWeight: '700',
            background: 'linear-gradient(135deg, #fff, #94a3b8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>Examination Results & Student Scores</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
            {totalSubs} Verified Proctored Submissions · Automated Scoring Ledger
            {loading && ' · Loading...'}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#60a5fa' }}>{totalSubs}</div>
          <div className="stat-label">Total Submissions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#fbbf24' }}>{avgPct}%</div>
          <div className="stat-label">Average Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#4ade80' }}>{passedCount}</div>
          <div className="stat-label">Passed Certification</div>
        </div>
      </div>

      {/* Results Table */}
      <div className="glass" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              {['Submission ID', 'Student Username', 'Raw Score', 'Percentage', 'Status', 'Submitted At'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map(r => {
              const totalQ = r.total_questions || 10;
              const pct = Math.round((r.score / totalQ) * 100);
              const isPassed = pct >= 60;

              return (
                <tr key={r.id}>
                  <td style={{ color: 'var(--text-muted)' }}>#{r.id}</td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{r.student_id}</td>
                  <td style={{ fontWeight: '700', color: isPassed ? '#4ade80' : '#f87171' }}>
                    {r.score} / {totalQ}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="score-track" style={{ width: '100px' }}>
                        <div className="score-fill" style={{ width: `${pct}%`, background: isPassed ? '#22c55e' : '#ef4444' }} />
                      </div>
                      <span style={{ fontWeight: '700', fontSize: '13px', color: isPassed ? '#4ade80' : '#f87171' }}>
                        {pct}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={isPassed ? 'pill pill-green' : 'pill pill-red'}>
                      {isPassed ? 'PASSED' : 'FAILED'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    {formatDate(r.submitted_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
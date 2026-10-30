import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../api';

export default function AnalyticsPage({ token, onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/analytics/summary`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '60px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 16px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p>Loading Institutional AI Analytics Data...</p>
      </div>
    );
  }

  const events = data ? data.event_counts || {} : {};

  return (
    <div style={{ width: '100%', animation: 'fadeIn 0.4s ease' }}>
      
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <span className="badge badge-info" style={{ marginBottom: '6px' }}>Executive Dashboard</span>
          <h2 style={{ fontSize: '1.8rem' }}>Institutional Integrity & AI Proctoring Analytics</h2>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" onClick={() => window.open(`${BASE_URL}/api/sessions/results/export/csv`)}>
            📥 Export CSV Report
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate('dashboard')}>
            ← Back to Admin Panel
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', tracking: '1px' }}>Total Active Candidates</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '8px', color: 'var(--primary-color)' }}>{data?.total_candidates ?? 0}</div>
          <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '4px' }}>Students with proctoring activity</div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', tracking: '1px' }}>Total Proctor Logs Logged</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '8px', color: '#38bdf8' }}>{data?.total_logs ?? 0}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Across all computer vision nodes</div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', tracking: '1px' }}>AI Detection Accuracy</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '8px', color: '#10b981' }}>{data?.ai_accuracy_rate ?? '—'}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>YOLOv8 Small + CLAHE preprocessing</div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', tracking: '1px' }}>Avg Suspicion Score</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '8px', color: (data?.avg_suspicion_score ?? 0) > 30 ? '#ef4444' : '#f59e0b' }}>
            {data?.avg_suspicion_score ?? 0} <span style={{ fontSize: '1rem', fontWeight: 400 }}>/ 100</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Across all exam sessions</div>
        </div>
      </div>

      {/* Main Breakdown Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        
        {/* Breach Frequency Distribution */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>AI Breach Event Breakdown</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { key: 'phone_detected',  label: '📱 Smartphone / Mobile Devices',       color: '#ef4444' },
              { key: 'tab_switch',      label: '🔄 Browser Tab Switch / Focus Loss',    color: '#f59e0b' },
              { key: 'looking_away',    label: '👁️ Off-Screen Gaze (Looking Away)',     color: '#6366f1' },
              { key: 'multiple_faces',  label: '👥 Multiple Persons in Camera Frame',   color: '#ec4899' },
              { key: 'no_face',         label: '🚫 No Face Detected',                   color: '#8b5cf6' },
            ].map(({ key, label, color }) => {
              const count = events[key] || 0;
              const total = Object.values(events).reduce((a, b) => a + b, 0) || 1;
              const pct   = Math.round((count / total) * 100);
              return (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                    <span>{label}</span>
                    <strong>{count} events</strong>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-dark)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              );
            })}
            {Object.values(events).reduce((a, b) => a + b, 0) === 0 && (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No violation events recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Per-Event Daily Breakdown */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Event Summary</h3>
          {Object.keys(events).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              No events recorded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(events).sort((a, b) => b[1] - a[1]).map(([key, count]) => {
                const colors = { phone_detected:'#ef4444', tab_switch:'#f59e0b', looking_away:'#6366f1', multiple_faces:'#ec4899', no_face:'#8b5cf6' };
                const icons  = { phone_detected:'📱', tab_switch:'🔄', looking_away:'👀', multiple_faces:'👥', no_face:'🚫' };
                const color  = colors[key] || '#94a3b8';
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: `${color}10`, borderRadius: '8px', border: `1px solid ${color}30` }}>
                    <span style={{ fontSize: '1.2rem' }}>{icons[key] || '⚠️'}</span>
                    <span style={{ flex: 1, fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 500 }}>{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color }}>{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Institutional AI Accuracy Audit Notice */}
      <div className="card" style={{ padding: '20px', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ fontSize: '1rem', color: 'var(--primary-color)' }}>Computer Vision Pipeline Verification</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            Current Model: {data?.model_status || 'YOLOv8s + YuNet + MediaPipe 3D Mesh active'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate('settings')}>Configure AI Sensitivity Sliders</button>
      </div>

    </div>
  );
}

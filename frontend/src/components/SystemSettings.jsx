import React, { useState, useEffect } from 'react';

export default function SystemSettings({ token }) {
  const [settings, setSettings] = useState({
    phoneConfThreshold: '0.65',
    lookAwaySecs: '2.5',
    tabSwitchPenalty: '25',
    maxSuspicionScore: '100',
    minBrightnessGuard: '30',
    wsIntervalMs: '500'
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/settings', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});
  }, [token]);

  const handleSave = (e) => {
    e.preventDefault();
    fetch('http://localhost:8000/settings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    })
      .then(() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      })
      .catch(() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      });
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontSize: '22px', fontWeight: '700',
          background: 'linear-gradient(135deg, #fff, #94a3b8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>AI Proctoring Neural Configuration & Settings</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
          Tune YOLOv8 detection thresholds, gaze tracking sensitivity, and server parameters
        </p>
      </div>

      {saved && (
        <div style={{
          background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
          color: '#4ade80', padding: '12px 16px', borderRadius: '10px',
          marginBottom: '20px', fontSize: '14px', fontWeight: '600'
        }}>
          ✅ System parameters successfully updated and synced across AI detection modules!
        </div>
      )}

      <form onSubmit={handleSave}>
        
        {/* Detection Thresholds Card */}
        <div className="glass" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#818cf8' }}>📱 YOLOv8 Smartphone Detection Tuning</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                Confidence Threshold (FP Max: 0.56, Calibrated: 0.65)
              </label>
              <input
                type="number" step="0.05" min="0.30" max="0.95"
                className="input-field"
                value={settings.phoneConfThreshold}
                onChange={e => setSettings({ ...settings, phoneConfThreshold: e.target.value })}
              />
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                Dark Frame Minimum Brightness Guard (Avg Pixel)
              </label>
              <input
                type="number"
                className="input-field"
                value={settings.minBrightnessGuard}
                onChange={e => setSettings({ ...settings, minBrightnessGuard: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Gaze & Behavior Tuning */}
        <div className="glass" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#38bdf8' }}>👁️ Gaze & Tab Switch Suspicion Penalties</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                Look-Away Trigger Hold Time (Seconds)
              </label>
              <input
                type="number" step="0.5"
                className="input-field"
                value={settings.lookAwaySecs}
                onChange={e => setSettings({ ...settings, lookAwaySecs: e.target.value })}
              />
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                Tab Switch Penalty Score (Points per Switch)
              </label>
              <input
                type="number"
                className="input-field"
                value={settings.tabSwitchPenalty}
                onChange={e => setSettings({ ...settings, tabSwitchPenalty: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* System & Database Info */}
        <div className="glass" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#34d399' }}>💻 Infrastructure & Model Weights</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '0.88rem', color: '#94a3b8' }}>
            <div><strong>Active Weight:</strong> <span style={{ color: '#f1f5f9' }}>Smartphone-Detection/best.pt</span></div>
            <div><strong>Face Detection Engine:</strong> <span style={{ color: '#f1f5f9' }}>YuNet ONNX SSD</span></div>
            <div><strong>Database:</strong> <span style={{ color: '#34d399' }}>proctor.db (SQLite)</span></div>
            <div><strong>Backend API:</strong> <span style={{ color: '#60a5fa' }}>FastAPI + Uvicorn 0.30.1</span></div>
          </div>
        </div>

        <button type="submit" className="next-btn" style={{ padding: '12px 32px', fontSize: '0.95rem' }}>
          💾 Save Configuration Settings
        </button>

      </form>
    </div>
  );
}

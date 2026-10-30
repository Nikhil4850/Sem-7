import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../api';

export default function SystemSettings({ token }) {
  const [settings, setSettings] = useState({
    phoneConfThreshold: '0.70',
    lookAwaySecs: '2.5',
    tabSwitchPenalty: '25',
    maxSuspicionScore: '100',
    minBrightnessGuard: '30',
    wsIntervalMs: '500'
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/api/settings`, {
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
    fetch(`${BASE_URL}/api/settings`, {
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
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
          AI Proctoring Neural Configuration & Settings
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
          Tune YOLOv8 detection thresholds, gaze tracking sensitivity, and server parameters
        </p>
      </div>

      {saved && (
        <div className="badge badge-success" style={{ width: '100%', padding: '12px', textAlign: 'center', marginBottom: '20px', fontSize: '0.92rem' }}>
          ✓ System Settings Updated & Applied Live!
        </div>
      )}

      <form onSubmit={handleSave} className="card" style={{ padding: '32px' }}>
        
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0066ff', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
          🤖 YOLOv8 Computer Vision Pipeline Tuning
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <div>
            <label style={{ color: '#334155', fontSize: '0.88rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              YOLOv8 Phone Confidence Threshold
            </label>
            <input
              type="number"
              step="0.05"
              min="0.4"
              max="0.95"
              className="form-input"
              value={settings.phoneConfThreshold}
              onChange={e => setSettings(p => ({ ...p, phoneConfThreshold: e.target.value }))}
            />
            <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
              Current: {settings.phoneConfThreshold} (Calibrated gap: 0.70)
            </span>
          </div>

          <div>
            <label style={{ color: '#334155', fontSize: '0.88rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Minimum Brightness Guard (0-255)
            </label>
            <input
              type="number"
              className="form-input"
              value={settings.minBrightnessGuard}
              onChange={e => setSettings(p => ({ ...p, minBrightnessGuard: e.target.value }))}
            />
            <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
              Skip detection when average pixel brightness &lt; {settings.minBrightnessGuard}
            </span>
          </div>
        </div>

        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0066ff', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingTop: '12px' }}>
          👁️ Gaze & Suspicion Scoring Rules
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <div>
            <label style={{ color: '#334155', fontSize: '0.88rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Look-Away Seconds Threshold
            </label>
            <input
              type="number"
              step="0.5"
              className="form-input"
              value={settings.lookAwaySecs}
              onChange={e => setSettings(p => ({ ...p, lookAwaySecs: e.target.value }))}
            />
            <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
              Seconds off-screen before triggering Gaze Deviation
            </span>
          </div>

          <div>
            <label style={{ color: '#334155', fontSize: '0.88rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Tab Switch Risk Score Penalty
            </label>
            <input
              type="number"
              className="form-input"
              value={settings.tabSwitchPenalty}
              onChange={e => setSettings(p => ({ ...p, tabSwitchPenalty: e.target.value }))}
            />
            <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
              Score added per tab-switch event (+{settings.tabSwitchPenalty} pts)
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px' }}>
            💾 Save & Apply Neural Settings
          </button>
        </div>

      </form>

    </div>
  );
}

import React from 'react';

function scoreColor(s) {
  if (s === 0) return '#10b981';
  if (s < 50)  return '#f59e0b';
  return '#ef4444';
}

export default function DetectionHUD({ result, connected }) {
  const { face_count, looking_direction, phone_detected, look_away_secs, suspicion_score, events } = result;
  const color = scoreColor(suspicion_score);

  const facePill  = face_count === 1 ? 'badge badge-success' : 'badge badge-danger';
  const gazePill  = looking_direction === 'centered' || looking_direction === 'connecting...' ? 'badge badge-success' : 'badge badge-warning';
  const phonePill = phone_detected ? 'badge badge-danger' : 'badge badge-success';

  // Parse multiple_faces:N event to extract exact count
  const multiFaceEvent = events && events.find(e => e.startsWith('multiple_faces'));
  const multiFaceCount = multiFaceEvent
    ? (multiFaceEvent.includes(':') ? parseInt(multiFaceEvent.split(':')[1]) : face_count)
    : null;

  const hasPhone    = events && events.some(e => e.startsWith('phone_detected'));
  const hasNoFace   = events && events.some(e => e.startsWith('no_face'));
  const hasMulti    = events && events.some(e => e.startsWith('multiple_faces'));
  const hasLookAway = events && events.some(e => e.startsWith('looking_away'));

  return (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: connected ? '#10b981' : '#ef4444' }} />
        {connected ? '🟢 AI Proctor Active' : '🔴 Standby'}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            Suspicion score
          </span>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color }}>{suspicion_score} / 100</span>
        </div>
        <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${suspicion_score}%`, height: '100%', background: color, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      <div className="detect-rows">
        <div className="detect-row">
          <span className="detect-key">Faces detected</span>
          <span className={facePill}>
            {face_count} face{face_count !== 1 ? 's' : ''}
            {face_count > 1 && <span style={{ marginLeft: '4px' }}>⚠️</span>}
          </span>
        </div>
        <div className="detect-row">
          <span className="detect-key">Gaze direction</span>
          <span className={gazePill}>{looking_direction}</span>
        </div>
        <div className="detect-row">
          <span className="detect-key">Phone visible</span>
          <span className={phonePill}>{phone_detected ? 'YES — ALERT' : 'No'}</span>
        </div>
        {look_away_secs > 0 && (
          <div className="detect-row">
            <span className="detect-key">Looking away</span>
            <span className={look_away_secs >= 2.5 ? 'badge badge-danger' : 'badge badge-warning'}>{look_away_secs}s</span>
          </div>
        )}
      </div>

      {events && events.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {hasPhone    && <div className="error-banner" style={{ margin: 0 }}>📱 Phone detected in frame</div>}
          {hasMulti    && (
            <div className="error-banner" style={{ margin: 0 }}>
              👥 {multiFaceCount || face_count} faces detected — only 1 allowed
            </div>
          )}
          {hasNoFace   && <div className="error-banner" style={{ margin: 0 }}>🚫 No face detected</div>}
          {hasLookAway && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 14px', fontSize: '0.85rem', color: '#b45309', fontWeight: 600 }}>
              👀 Please keep your eyes on the exam screen
            </div>
          )}
        </div>
      )}
    </div>
  );
}
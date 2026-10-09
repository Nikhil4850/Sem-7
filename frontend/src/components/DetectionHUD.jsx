import React from 'react';

function scoreColor(s) {
  if (s === 0) return '#22c55e';
  if (s < 50)  return '#f59e0b';
  return '#ef4444';
}

export default function DetectionHUD({ result, connected }) {
  const { face_count, looking_direction, phone_detected, look_away_secs, suspicion_score, events } = result;
  const color = scoreColor(suspicion_score);

  const facePill  = face_count === 1 ? 'pill pill-green' : 'pill pill-red';
  const gazePill  = looking_direction === 'centered' || looking_direction === 'connecting...' ? 'pill pill-green' : 'pill pill-yellow';
  const phonePill = phone_detected ? 'pill pill-red' : 'pill pill-green';

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
    <div className="hud">
      <div className="hud-conn">
        <div className={`conn-dot ${connected ? 'on' : 'off'}`} />
        {connected ? 'Connected to AI backend' : 'Disconnected — start backend server'}
      </div>

      <div>
        <div className="score-label">
          <span>Suspicion score</span>
          <span className="score-num" style={{ color }}>{suspicion_score}</span>
        </div>
        <div className="score-track">
          <div className="score-fill" style={{ width: `${suspicion_score}%`, background: color }} />
        </div>
      </div>

      <div className="detect-rows">
        <div className="detect-row">
          <span className="detect-key">Faces detected</span>
          <span className={facePill}>
            {face_count} face{face_count !== 1 ? 's' : ''}
            {face_count > 1 && <span style={{ marginLeft: '6px' }}>⚠️</span>}
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
            <span className={look_away_secs >= 2.5 ? 'pill pill-red' : 'pill pill-yellow'}>{look_away_secs}s</span>
          </div>
        )}
      </div>

      {events && events.length > 0 && (
        <div className="alerts">
          {hasPhone    && <div className="alert-red">📱 Phone detected in frame</div>}
          {hasMulti    && (
            <div className="alert-red">
              👥 {multiFaceCount || face_count} faces detected — only 1 allowed
            </div>
          )}
          {hasNoFace   && <div className="alert-red">🚫 No face detected</div>}
          {hasLookAway && <div className="alert-yellow">👀 Please look at the screen</div>}
        </div>
      )}
    </div>
  );
}
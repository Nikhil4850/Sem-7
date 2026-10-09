import React, { useState } from 'react';

export default function EvidencePlayerPage({ onNavigate }) {
  const [selectedSession] = useState('SESS-1042');

  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [filterBreach, setFilterBreach] = useState('ALL');
  const [proctorNotes, setProctorNotes] = useState('Candidate observed glancing repeatedly towards left lower desk area at timestamp 14:20.');
  const [decision, setDecision] = useState('FLAGGED');
  const [savedStatus, setSavedStatus] = useState(null);

  const mockIncidents = [
    { time: '04:12', type: 'smartphone_detected', label: 'Smartphone Detected (YOLOv8 94%)', level: 'danger', score: 45, snippet: 'Device placed near keyboard' },
    { time: '14:20', type: 'looking_left', label: 'Off-Screen Gaze (Head Pitch -24°)', level: 'warning', score: 20, snippet: 'Looking away left for >6s' },
    { time: '28:45', type: 'tab_switch', label: 'Tab Switch / Window Blur Event', level: 'danger', score: 30, snippet: 'Browser focus lost' },
    { time: '41:10', type: 'multiple_faces', label: 'Multiple Persons Detected', level: 'danger', score: 50, snippet: 'Secondary face detected in background' },
  ];

  const filteredIncidents = filterBreach === 'ALL' 
    ? mockIncidents 
    : mockIncidents.filter(i => i.type === filterBreach);

  const activeFrame = mockIncidents[currentFrameIndex] || mockIncidents[0];

  const handleSaveAudit = () => {
    setSavedStatus('Audit Review Saved & Disciplinary Log Updated!');
    setTimeout(() => setSavedStatus(null), 3000);
  };

  return (
    <div className="container" style={{ maxWidth: '1250px', margin: '30px auto', animation: 'fadeIn 0.4s ease' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <span className="badge badge-warning" style={{ marginBottom: '6px' }}>Invigilator Evidence Player</span>
          <h2 style={{ fontSize: '1.6rem' }}>Session Violation Snapshot Replay & Audit</h2>
        </div>
        <button className="btn btn-secondary" onClick={() => onNavigate('results')}>← Back to Exam Results</button>
      </div>

      {savedStatus && (
        <div className="badge badge-success" style={{ width: '100%', padding: '12px', textAlign: 'center', marginBottom: '20px', fontSize: '0.95rem' }}>
          ✓ {savedStatus}
        </div>
      )}

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Left Column: Frame Snapshot Viewer & Timeline */}
        <div>
          <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <strong style={{ fontSize: '1.1rem' }}>Candidate: Sarah Jenkins (CS-402)</strong>
                <span className="text-muted" style={{ marginLeft: '12px', fontSize: '0.85rem' }}>Session ID: {selectedSession}</span>
              </div>
              <span className={`badge badge-${activeFrame.level}`}>Timestamp {activeFrame.time}</span>
            </div>

            {/* Simulated Frame Viewer */}
            <div style={{ position: 'relative', width: '100%', height: '420px', background: '#090d16', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(0,0,0,0.7)', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', color: '#fff' }}>
                REC 🔴 Frame #{currentFrameIndex + 1420} • 1080p 30fps
              </div>

              {/* Bounding Box Visual Simulation */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '12px' }}>👤</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Snapshot Frame at {activeFrame.time}</div>
                {activeFrame.type === 'smartphone_detected' && (
                  <div style={{ marginTop: '16px', border: '2px solid #ef4444', background: 'rgba(239, 68, 68, 0.15)', padding: '8px 16px', borderRadius: '6px', color: '#ef4444', fontWeight: 700, fontSize: '0.85rem' }}>
                    📱 YOLOv8 Bounding Box: [x:240, y:180, w:85, h:160] Phone Confidence: 94.2%
                  </div>
                )}
                {activeFrame.type === 'multiple_faces' && (
                  <div style={{ marginTop: '16px', border: '2px solid #ef4444', background: 'rgba(239, 68, 68, 0.15)', padding: '8px 16px', borderRadius: '6px', color: '#ef4444', fontWeight: 700, fontSize: '0.85rem' }}>
                    👥 YuNet Face Detector: Count = 2 Faces Detected in Field of View
                  </div>
                )}
              </div>
            </div>

            {/* Frame Timeline Slider */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <span>00:00 (Start)</span>
                <span>Incident Marker {activeFrame.time}</span>
                <span>60:00 (Submitted)</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max={mockIncidents.length - 1} 
                value={currentFrameIndex} 
                onChange={e => setCurrentFrameIndex(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Suspicion Score Heatmap Breakdown */}
          <div className="card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '16px' }}>Session Suspicion Accumulation Graph</h4>
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '90px', gap: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
              {[10, 15, 12, 45, 48, 52, 60, 75, 82, 85, 95].map((val, idx) => (
                <div key={idx} style={{ flex: 1, height: `${val}%`, background: val > 60 ? '#ef4444' : val > 30 ? '#f59e0b' : '#6366f1', borderRadius: '4px' }} title={`Minute ${idx*5}: Score ${val}`} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              <span>0m</span>
              <span>15m</span>
              <span>30m</span>
              <span>45m</span>
              <span>60m</span>
            </div>
          </div>
        </div>

        {/* Right Column: Violation Logs & Proctor Decision Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Filterable Incident Feed */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem' }}>Detected Breach Events</h4>
              <select className="form-select" style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8rem' }} value={filterBreach} onChange={e => setFilterBreach(e.target.value)}>
                <option value="ALL">All Types ({mockIncidents.length})</option>
                <option value="smartphone_detected">Smartphones</option>
                <option value="looking_left">Gaze Deviations</option>
                <option value="tab_switch">Tab Switches</option>
                <option value="multiple_faces">Multiple Persons</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
              {filteredIncidents.map((inc, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setCurrentFrameIndex(mockIncidents.indexOf(inc))}
                  style={{
                    padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)',
                    background: mockIncidents[currentFrameIndex] === inc ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-dark)',
                    cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{inc.label}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{inc.snippet}</div>
                  </div>
                  <span className={`badge badge-${inc.level}`} style={{ fontSize: '0.75rem' }}>{inc.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Official Invigilator Verdict Form */}
          <div className="card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '14px' }}>Proctor Verdict & Report Sign-Off</h4>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>Disciplinary Decision</label>
              <select className="form-select" value={decision} onChange={e => setDecision(e.target.value)}>
                <option value="CLEAR">Clear Flag - No Breach Confirmed</option>
                <option value="WARNING">Issue Formal Warning to Student</option>
                <option value="FLAGGED">Flag Session for Academic Board Review</option>
                <option value="DISQUALIFIED">Immediate Exam Invalidation / Zero Score</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>Proctor Audit Remarks</label>
              <textarea 
                className="form-input" 
                rows="3" 
                value={proctorNotes} 
                onChange={e => setProctorNotes(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSaveAudit}>
              💾 Save Official Audit Verdict
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

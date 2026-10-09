import React, { useState, useRef } from 'react';

export default function PracticeLabPage({ onNavigate }) {
  const [labActive, setLabActive] = useState(false);
  const [simulatedPhone, setSimulatedPhone] = useState(false);
  const [simulatedLookAway, setSimulatedLookAway] = useState(false);
  const [score, setScore] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const videoRef = useRef(null);

  const mockQuestions = [
    { id: 1, q: "Which computer vision algorithm in our system performs real-time smartphone detection?", options: ["YOLOv8 Small", "ResNet-50", "VGG-16", "AlexNet"], correct: 0 },
    { id: 2, q: "How many 3D facial landmarks are extracted by MediaPipe Face Mesh?", options: ["68", "128", "468", "1024"], correct: 2 },
    { id: 3, q: "What status is triggered when a candidate switches browser tabs during an exam?", options: ["Tab Switch Violation", "Automatic Logout", "Camera Reset", "No Effect"], correct: 0 },
  ];

  const startSandbox = async () => {
    setLabActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectOption = (qId, optionIdx) => {
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const calculateDiagnosticScore = () => {
    let s = 0;
    mockQuestions.forEach(q => {
      if (selectedAnswers[q.id] === q.correct) s += 33.3;
    });
    setScore(Math.round(s));
  };

  return (
    <div className="container" style={{ maxWidth: '1150px', margin: '30px auto', animation: 'fadeIn 0.4s ease' }}>
      
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <span className="badge badge-success" style={{ marginBottom: '6px' }}>Student Calibration Sandbox</span>
          <h2 style={{ fontSize: '1.7rem' }}>AI Proctor Practice Lab & Camera Diagnostic</h2>
        </div>
        <button className="btn btn-secondary" onClick={() => onNavigate('student-dashboard')}>← Back to Student Portal</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Left Column: Live AI Sandbox Video Feed */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Camera & Hardware Calibration</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
            Test your room lighting, webcam positioning, and test holding a smartphone to watch how the AI detection model responds live.
          </p>

          <div style={{ position: 'relative', width: '100%', height: '300px', background: '#090d16', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            {!labActive ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🧪</div>
                <button className="btn btn-primary" onClick={startSandbox}>Start Live Camera Test</button>
              </div>
            ) : (
              <>
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                
                {/* Simulated AI Overlays */}
                {simulatedPhone && (
                  <div style={{ position: 'absolute', top: '20%', left: '30%', width: '120px', height: '160px', border: '2px solid #ef4444', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontWeight: 700, fontSize: '0.75rem', padding: '4px' }}>
                    📱 CELL PHONE 96%
                  </div>
                )}

                {simulatedLookAway && (
                  <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#f59e0b', color: '#000', padding: '4px 10px', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem' }}>
                    ⚠️ LOOKING AWAY (PITCH: -28°)
                  </div>
                )}
              </>
            )}
          </div>

          {/* Interactive AI Simulation Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              className={`btn ${simulatedPhone ? 'btn-danger' : 'btn-outline'}`} 
              onClick={() => setSimulatedPhone(!simulatedPhone)}
              disabled={!labActive}
            >
              {simulatedPhone ? '❌ Remove Simulated Phone' : '📱 Test Phone Alert'}
            </button>

            <button 
              className={`btn ${simulatedLookAway ? 'btn-warning' : 'btn-outline'}`} 
              onClick={() => setSimulatedLookAway(!simulatedLookAway)}
              disabled={!labActive}
            >
              {simulatedLookAway ? '❌ Reset Gaze Test' : '👁️ Test Off-Screen Look'}
            </button>
          </div>
        </div>

        {/* Right Column: Diagnostic Quiz */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Practice Diagnostic Quiz</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
            Answer 3 sample questions to test answer selection, timer countdown, and instant scoring logic.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
            {mockQuestions.map((q, qIdx) => (
              <div key={q.id} style={{ background: 'var(--bg-dark)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <strong style={{ fontSize: '0.92rem', display: 'block', marginBottom: '10px' }}>{qIdx + 1}. {q.q}</strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {q.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(q.id, oIdx)}
                      className={`btn ${selectedAnswers[q.id] === oIdx ? 'btn-primary' : 'btn-outline'}`}
                      style={{ textAlign: 'left', padding: '8px 12px', fontSize: '0.82rem' }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn btn-primary" onClick={calculateDiagnosticScore}>Submit Diagnostic Quiz</button>
            {score > 0 && (
              <span className="badge badge-success" style={{ fontSize: '1rem', padding: '8px 16px' }}>
                Score: {score}%
              </span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

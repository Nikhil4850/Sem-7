import React, { useState, useRef } from 'react';

export default function IdentityVerifyPage({ onNavigate, onStartExam }) {
  const [step, setStep] = useState(1);
  const [capturing, setCapturing] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [idScanned, setIdScanned] = useState(false);
  const [matchScore, setMatchScore] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const videoRef = useRef(null);

  const startCamera = async () => {
    setCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
    }
  };

  const capturePhoto = () => {
    setPhotoTaken(true);
    setTimeout(() => {
      setStep(2);
    }, 1200);
  };

  const simulateIdScan = () => {
    setIdScanned(true);
    setTimeout(() => {
      setMatchScore(98.6);
      setStep(3);
    }, 1500);
  };

  return (
    <div className="container" style={{ maxWidth: '850px', margin: '40px auto', animation: 'fadeIn 0.4s ease' }}>
      <div className="card" style={{ padding: '32px' }}>
        
        {/* Step Indicator Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', tracking: '1px', color: 'var(--primary-color)', fontWeight: 700 }}>Pre-Exam Protocol</span>
            <h2 style={{ fontSize: '1.6rem', marginTop: '4px' }}>Candidate Biometric & ID Verification</h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3, 4].map(s => (
              <div 
                key={s} 
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: step === s ? 'var(--primary-color)' : step > s ? '#10b981' : 'var(--bg-dark)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.9rem', border: '1px solid var(--border-color)'
                }}
              >
                {step > s ? '✓' : s}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Live Face Photo Capture */}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Step 1: Capture Live Face Reference</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Ensure your face is clearly visible, centered in the camera frame, and well-lit without glasses or hats.
            </p>

            <div style={{ position: 'relative', width: '100%', height: '360px', background: '#000', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
              {!capturing ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📸</div>
                  <button className="btn btn-primary" onClick={startCamera}>Enable Webcam Feed</button>
                </div>
              ) : (
                <>
                  <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                  {/* Overlay Guides */}
                  <div style={{ position: 'absolute', border: '2px dashed var(--primary-color)', borderRadius: '50%', width: '220px', height: '260px', pointerEvents: 'none' }} />
                  {photoTaken && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.3rem' }}>
                      ✓ Reference Face Captured!
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => onNavigate('student-dashboard')}>Cancel</button>
              <button className="btn btn-primary" disabled={!capturing || photoTaken} onClick={capturePhoto}>
                {photoTaken ? 'Processing...' : 'Take Face Photo'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Student / Govt ID Scanner */}
        {step === 2 && (
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Step 2: Scan Official Student ID Card</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Hold your University ID card or Passport up to the camera lens so the AI OCR scanner can verify candidate credentials.
            </p>

            <div style={{ position: 'relative', width: '100%', height: '320px', background: '#080c14', borderRadius: '12px', border: '2px dashed var(--primary-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              {!idScanned ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🪪</div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>Position ID card inside the target rectangular box</p>
                  <button className="btn btn-primary" onClick={simulateIdScan}>Scan & Verify ID Card</button>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 16px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Analyzing ID Photo & Text OCR...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Biometric Match & Device Audit */}
        {step === 3 && (
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Step 3: Verification Result & Diagnostic Audit</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <span className="badge badge-success" style={{ marginBottom: '8px' }}>Facial Biometric Match</span>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981' }}>{matchScore}%</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Verified against enrollment record</p>
              </div>

              <div style={{ background: 'var(--bg-dark)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '12px' }}>Hardware Diagnostic Checklist</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Webcam Feed (1080p):</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>✓ Optimal</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Microphone Noise Level:</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>✓ Low (&lt;12dB)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Secondary Monitor Detection:</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>✓ Single Display</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Browser Lockout API:</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>✓ Enabled</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setStep(4)}>Proceed to Honor Code →</button>
            </div>
          </div>
        )}

        {/* Step 4: Honor Code & Final Launch */}
        {step === 4 && (
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Step 4: Academic Integrity Charter & Launch</h3>
            <div style={{ background: 'var(--bg-dark)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
              <p style={{ marginBottom: '12px' }}>
                By proceeding, I confirm that I am taking this proctored examination independently without assistance from external persons, mobile devices, books, AI chatbots, or secondary screens.
              </p>
              <p>
                I acknowledge that live video, audio, gaze movement, and tab switching activities will be recorded and analyzed by the AI Proctoring System and reviewed by university invigilators.
              </p>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', cursor: 'pointer', marginBottom: '24px' }}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ width: '18px', height: '18px' }} />
              <span>I hereby agree to the Academic Integrity Charter and AI Proctoring Terms.</span>
            </label>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setStep(3)}>← Back</button>
              <button className="btn btn-primary" disabled={!agreed} style={{ padding: '12px 28px', fontSize: '1rem' }} onClick={onStartExam}>
                ⚡ Begin Proctored Exam Now
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

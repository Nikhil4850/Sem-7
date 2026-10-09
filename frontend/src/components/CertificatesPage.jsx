import React, { useState } from 'react';

export default function CertificatesPage({ onNavigate, onOpenAuth }) {
  const [certHash, setCertHash] = useState('');
  const [verifiedCert, setVerifiedCert] = useState(null);
  const [searched, setSearched] = useState(false);

  const sampleCerts = {
    "EV-9921-AI": {
      student: "John Doe",
      course: "Computer Vision & YOLOv8 Detection",
      grade: "96%",
      issueDate: "August 28, 2026",
      status: "VERIFIED & VALID",
      issuer: "EduVanguard Academic Board"
    },
    "EV-7734-CS": {
      student: "Alice Smith",
      course: "Full-Stack Web Architectures & FastAPI",
      grade: "100%",
      issueDate: "August 30, 2026",
      status: "VERIFIED & VALID",
      issuer: "EduVanguard Academic Board"
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    setSearched(true);
    const key = certHash.trim().toUpperCase();
    if (sampleCerts[key]) {
      setVerifiedCert(sampleCerts[key]);
    } else {
      setVerifiedCert(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080c14', color: '#f1f5f9', padding: '20px 24px 60px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.6rem', fontWeight: 800, marginBottom: '12px' }}>
          Credential & Badge <span style={{ color: '#34d399' }}>Verification Portal</span>
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '32px' }}>
          Enter a student certificate hash ID to instantly verify exam proctoring credentials and digital badges.
        </p>

        {/* Verification Form */}
        <div className="glass" style={{ padding: '32px', marginBottom: '40px' }}>
          <form onSubmit={handleVerify} style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Enter Certificate Code (e.g. EV-9921-AI or EV-7734-CS)..."
              value={certHash}
              onChange={(e) => setCertHash(e.target.value)}
              required
            />
            <button type="submit" className="next-btn" style={{ padding: '12px 28px', whiteSpace: 'nowrap' }}>
              🔍 Verify Hash
            </button>
          </form>
        </div>

        {/* Verification Result Card */}
        {searched && (
          verifiedCert ? (
            <div className="glass" style={{ padding: '36px', borderLeft: '4px solid #34d399', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ color: '#34d399', fontWeight: 800, letterSpacing: '1px' }}>✅ OFFICIAL VERIFIED CERTIFICATE</span>
                <span className="pill pill-green">{verifiedCert.status}</span>
              </div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{verifiedCert.student}</h2>
              <p style={{ color: '#818cf8', fontSize: '1.1rem', marginBottom: '20px' }}>{verifiedCert.course}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', color: '#94a3b8', fontSize: '0.9rem' }}>
                <div><strong>Final Grade:</strong> <span style={{ color: '#34d399', fontWeight: 700 }}>{verifiedCert.grade}</span></div>
                <div><strong>Issue Date:</strong> <span style={{ color: '#f1f5f9' }}>{verifiedCert.issueDate}</span></div>
                <div><strong>Proctoring Mode:</strong> <span style={{ color: '#f1f5f9' }}>AI Real-Time Guardian</span></div>
                <div><strong>Issuing Body:</strong> <span style={{ color: '#f1f5f9' }}>{verifiedCert.issuer}</span></div>
              </div>
            </div>
          ) : (
            <div className="error-banner" style={{ padding: '24px', fontSize: '1rem' }}>
              ❌ Certificate Code not found. Please verify the hash code (Try sample code: <strong>EV-9921-AI</strong> or <strong>EV-7734-CS</strong>).
            </div>
          )
        )}
      </div>
    </div>
  );
}

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
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #f8fafc)', color: 'var(--text-primary, #0f172a)', padding: '24px 32px 60px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
          Credential & Badge <span style={{ color: '#10b981' }}>Verification Portal</span>
        </h1>
        <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '1rem' }}>
          Enter a student certificate hash ID to instantly verify exam proctoring credentials and digital badges.
        </p>

        {/* Verification Form */}
        <div className="card" style={{ padding: '32px', marginBottom: '32px' }}>
          <form onSubmit={handleVerify} style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Enter Certificate Code (e.g. EV-9921-AI or EV-7734-CS)..."
              value={certHash}
              onChange={(e) => setCertHash(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" style={{ padding: '12px 28px', whiteSpace: 'nowrap' }}>
              🔍 Verify Hash
            </button>
          </form>
        </div>

        {/* Verification Result Card */}
        {searched && (
          verifiedCert ? (
            <div className="card" style={{ padding: '36px', borderLeft: '4px solid #10b981', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ color: '#10b981', fontWeight: 800, letterSpacing: '0.5px' }}>✅ OFFICIAL VERIFIED CERTIFICATE</span>
                <span className="badge badge-success">{verifiedCert.status}</span>
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>{verifiedCert.student}</h2>
              <p style={{ color: '#0066ff', fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px' }}>{verifiedCert.course}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '20px', color: '#64748b', fontSize: '0.9rem' }}>
                <div><strong>Final Grade:</strong> <span style={{ color: '#10b981', fontWeight: 700 }}>{verifiedCert.grade}</span></div>
                <div><strong>Issue Date:</strong> <span style={{ color: '#0f172a' }}>{verifiedCert.issueDate}</span></div>
                <div><strong>Proctoring Mode:</strong> <span style={{ color: '#0f172a' }}>AI Real-Time Guardian</span></div>
                <div><strong>Issuing Body:</strong> <span style={{ color: '#0f172a' }}>{verifiedCert.issuer}</span></div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '24px', background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', fontSize: '0.95rem' }}>
              ❌ Certificate Code not found. Please verify the hash code (Try sample code: <strong style={{ color: '#991b1b' }}>EV-9921-AI</strong> or <strong style={{ color: '#991b1b' }}>EV-7734-CS</strong>).
            </div>
          )
        )}
      </div>
    </div>
  );
}

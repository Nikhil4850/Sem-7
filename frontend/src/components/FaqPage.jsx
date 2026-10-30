import React, { useState } from 'react';
import { faqData } from '../data/eduData';

export default function FaqPage({ onNavigate, onOpenAuth }) {
  const [openIdx, setOpenIdx] = useState(null);

  const toggleAccordion = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #f8fafc)', color: 'var(--text-primary, #0f172a)', padding: '24px 32px 60px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a' }}>
            Frequently Asked Questions & <span style={{ color: '#0066ff' }}>Help Desk</span>
          </h1>
          <p style={{ color: '#64748b', marginTop: '12px', fontSize: '1rem' }}>
            Find clear answers regarding exam rules, AI proctoring technical limits, and student guidelines.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqData.map((item, idx) => (
            <div key={idx} className="card" style={{ padding: '24px', cursor: 'pointer' }} onClick={() => toggleAccordion(idx)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: openIdx === idx ? '#0066ff' : '#0f172a' }}>
                  {item.question}
                </h3>
                <span style={{ fontSize: '1.4rem', color: '#0066ff', fontWeight: 700 }}>
                  {openIdx === idx ? '−' : '+'}
                </span>
              </div>

              {openIdx === idx && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', color: '#64748b', lineHeight: 1.7, fontSize: '0.95rem' }}>
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

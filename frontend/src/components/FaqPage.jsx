import React, { useState } from 'react';
import { faqData } from '../data/eduData';

export default function FaqPage({ onNavigate, onOpenAuth }) {
  const [openIdx, setOpenIdx] = useState(null);

  const toggleAccordion = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080c14', color: '#f1f5f9', padding: '20px 24px 60px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ fontSize: '2.6rem', fontWeight: 800 }}>
            Frequently Asked Questions & <span style={{ color: '#818cf8' }}>Help Desk</span>
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '12px' }}>
            Find clear answers regarding exam rules, AI proctoring technical limits, and student guidelines.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqData.map((item, idx) => (
            <div key={idx} className="glass" style={{ padding: '24px', cursor: 'pointer' }} onClick={() => toggleAccordion(idx)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.15rem', color: openIdx === idx ? '#818cf8' : '#f1f5f9' }}>
                  {item.question}
                </h3>
                <span style={{ fontSize: '1.4rem', color: '#818cf8', fontWeight: 700 }}>
                  {openIdx === idx ? '−' : '+'}
                </span>
              </div>

              {openIdx === idx && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', lineHeight: 1.7, fontSize: '0.95rem' }}>
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

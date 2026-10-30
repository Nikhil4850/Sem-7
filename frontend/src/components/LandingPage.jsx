import React from 'react';

export default function LandingPage({ onNavigate, onOpenAuth }) {
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 32%, #ffffff 100%)',
      color: '#0f172a',
      fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      position: 'relative',
      margin: 0,
      padding: 0,
      overflowX: 'hidden'
    }}>

      {/* Hero Section */}
      <section style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '40px 32px 60px',
        display: 'grid',
        gridTemplateColumns: '1.15fr 1fr',
        alignItems: 'center',
        gap: '40px'
      }}>


        {/* Hero Left Content */}
        <div>
          {/* AI-Powered Tag Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            background: '#e0edff',
            border: '1px solid #bfdbfe',
            color: '#0066ff',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '20px'
          }}>
            <span style={{ fontSize: '8px' }}>●</span>
            <span>AI-Powered • Secure • Fair</span>
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: '3.6rem',
            fontWeight: 800,
            lineHeight: 1.15,
            color: '#0f172a',
            marginBottom: '20px',
            letterSpacing: '-0.02em'
          }}>
            Smart Online <br />
            <span style={{ color: '#0066ff' }}>Exam Proctoring</span> System
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '1.1rem',
            color: '#64748b',
            lineHeight: 1.65,
            maxWidth: '510px',
            marginBottom: '32px'
          }}>
            Ensure a fair and secure examination environment with AI-powered monitoring, real-time detection, and detailed reports.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '36px', flexWrap: 'wrap' }}>
            <button
              onClick={() => onOpenAuth('student')}
              style={{
                background: '#0066ff',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '14px 28px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 6px 18px rgba(0, 102, 255, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span>Start an Exam</span>
              <span style={{ fontSize: '1.1rem' }}>→</span>
            </button>

            <button
              onClick={() => onNavigate('features')}
              style={{
                background: '#ffffff',
                color: '#0066ff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '10px',
                padding: '13px 28px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = '#0066ff';
                e.currentTarget.style.background = '#f8faff';
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.background = '#ffffff';
              }}
            >
              Learn More
            </button>
          </div>

          {/* Feature Checkmarks Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontSize: '0.92rem', fontWeight: 600 }}>
              <span style={{ color: '#0066ff', fontSize: '1.1rem' }}>✓</span>
              <span>AI Monitoring</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontSize: '0.92rem', fontWeight: 600 }}>
              <span style={{ color: '#0066ff', fontSize: '1.1rem' }}>✓</span>
              <span>Real-time Detection</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontSize: '0.92rem', fontWeight: 600 }}>
              <span style={{ color: '#0066ff', fontSize: '1.1rem' }}>✓</span>
              <span>Detailed Reports</span>
            </div>
          </div>
        </div>

        {/* Hero Right Visual Graphic with Live Overlays */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '520px' }}>
          
          {/* Radial ambient glow behind candidate */}
          <div style={{
            position: 'absolute',
            width: '460px',
            height: '460px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(199, 210, 254, 0.45) 0%, rgba(224, 231, 255, 0.2) 50%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0
          }} />

          {/* Dotted orbital trajectory */}
          <svg style={{ position: 'absolute', width: '520px', height: '480px', pointerEvents: 'none', zIndex: 1 }} viewBox="0 0 520 480">
            <path
              d="M 40,240 C 60,60 460,50 480,240"
              fill="none"
              stroke="#93c5fd"
              strokeWidth="2"
              strokeDasharray="6,6"
            />
          </svg>

          {/* Main Student Image */}
          <div style={{
            position: 'relative',
            width: '380px',
            height: '460px',
            borderRadius: '24px',
            overflow: 'visible',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img
              src="/student_proctor_hero.png"
              alt="Student Taking Proctored Exam"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '24px',
                boxShadow: '0 16px 40px rgba(0, 102, 255, 0.12)'
              }}
              onError={(e) => {
                // Graceful fallback if image path takes a moment
                e.target.style.background = '#e2e8f0';
              }}
            />

            {/* Green Face Detection Bounding Box Overlay */}
            <div style={{
              position: 'absolute',
              top: '80px',
              left: '125px',
              width: '130px',
              height: '150px',
              border: '2.5px solid #22c55e',
              borderRadius: '8px',
              boxShadow: '0 0 15px rgba(34, 197, 94, 0.3)',
              pointerEvents: 'none',
              zIndex: 10
            }}>
              {/* Corner tick marks */}
              <div style={{ position: 'absolute', top: '-4px', left: '-4px', width: '10px', height: '10px', borderTop: '3px solid #22c55e', borderLeft: '3px solid #22c55e' }} />
              <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '10px', height: '10px', borderTop: '3px solid #22c55e', borderRight: '3px solid #22c55e' }} />
              <div style={{ position: 'absolute', bottom: '-4px', left: '-4px', width: '10px', height: '10px', borderBottom: '3px solid #22c55e', borderLeft: '3px solid #22c55e' }} />
              <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '10px', height: '10px', borderBottom: '3px solid #22c55e', borderRight: '3px solid #22c55e' }} />

              {/* Green Face Detected Pill below chin */}
              <div style={{
                position: 'absolute',
                bottom: '-28px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#22c55e',
                color: '#ffffff',
                padding: '3px 12px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 10px rgba(34, 197, 94, 0.3)'
              }}>
                <span>✓</span>
                <span>Face Detected</span>
              </div>
            </div>
          </div>

          {/* Overlay Card 1: Top-Left (Multiple People Not Detected) */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '-20px',
            background: '#ffffff',
            borderRadius: '14px',
            padding: '10px 14px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
            border: '1px solid #f1f5f9',
            zIndex: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '84px',
              height: '48px',
              background: '#f1f5f9',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem'
            }}>
              👥
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>
              <span style={{ color: '#22c55e' }}>✓</span>
              <span>Multiple People Not Detected</span>
            </div>
          </div>

          {/* Overlay Card 2: Bottom-Left (Mobile Phone Not Detected) */}
          <div style={{
            position: 'absolute',
            top: '200px',
            left: '-30px',
            background: '#ffffff',
            borderRadius: '14px',
            padding: '10px 14px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
            border: '1px solid #f1f5f9',
            zIndex: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '84px',
              height: '48px',
              background: '#f1f5f9',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem'
            }}>
              📱
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>
              <span style={{ color: '#22c55e' }}>✓</span>
              <span>Mobile Phone Not Detected</span>
            </div>
          </div>

          {/* Overlay Card 3: Top-Right (Looking at Screen) */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '-15px',
            background: '#ffffff',
            borderRadius: '14px',
            padding: '8px 12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
            border: '1px solid #f1f5f9',
            zIndex: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px'
          }}>
            <img
              src="/eyes_screen_closeup.png"
              alt="Looking at screen"
              style={{
                width: '105px',
                height: '46px',
                borderRadius: '6px',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>
              <span style={{ color: '#22c55e' }}>✓</span>
              <span>Looking at Screen</span>
            </div>
          </div>

          {/* Overlay Card 4: Middle-Right (Tab Switch Not Detected) */}
          <div style={{
            position: 'absolute',
            top: '160px',
            right: '-25px',
            background: '#ffffff',
            borderRadius: '14px',
            padding: '8px 12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
            border: '1px solid #f1f5f9',
            zIndex: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{
              width: '105px',
              height: '46px',
              borderRadius: '6px',
              background: '#0f172a',
              display: 'flex',
              flexDirection: 'column',
              padding: '4px 6px',
              gap: '3px'
            }}>
              <div style={{ display: 'flex', gap: '3px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} />
              </div>
              <div style={{ height: '4px', background: '#334155', borderRadius: '2px', width: '60%' }} />
              <div style={{ height: '4px', background: '#334155', borderRadius: '2px', width: '80%' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>
              <span style={{ color: '#22c55e' }}>✓</span>
              <span>Tab Switch Not Detected</span>
            </div>
          </div>

          {/* Overlay Card 5: Bottom-Right (Attention Level 92% Widget) */}
          <div style={{
            position: 'absolute',
            bottom: '15px',
            right: '-40px',
            background: '#ffffff',
            borderRadius: '16px',
            padding: '14px 18px',
            boxShadow: '0 14px 30px rgba(0, 0, 0, 0.1)',
            border: '1px solid #f1f5f9',
            zIndex: 15
          }}>
            <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600, marginBottom: '8px' }}>
              Attention Level
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {/* Radial Progress Gauge (92%) */}
              <div style={{ position: 'relative', width: '54px', height: '54px' }}>
                <svg width="54" height="54" viewBox="0 0 54 54">
                  <circle cx="27" cy="27" r="22" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                  <circle
                    cx="27" cy="27" r="22"
                    fill="none"
                    stroke="#0066ff"
                    strokeWidth="4"
                    strokeDasharray="138.2"
                    strokeDashoffset="11"
                    strokeLinecap="round"
                    transform="rotate(-90 27 27)"
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#0f172a'
                }}>
                  92%
                </div>
              </div>

              {/* Sparkline curve */}
              <div style={{ width: '70px', height: '34px' }}>
                <svg width="70" height="34" viewBox="0 0 70 34" fill="none">
                  <path
                    d="M 2,24 C 15,10 25,28 40,14 C 52,2 60,18 68,12"
                    stroke="#93c5fd"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 2,24 C 15,10 25,28 40,14 C 52,2 60,18 68,12 L 68,34 L 2,34 Z"
                    fill="rgba(199, 210, 254, 0.3)"
                  />
                </svg>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* 4 Feature Cards Grid */}
      <section style={{
        maxWidth: '1440px',
        margin: '20px auto 48px',
        padding: '0 32px'
      }}>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px'
        }}>

          {/* Card 1: AI Monitoring */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #eef2f6',
            padding: '32px 24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0066ff',
              fontSize: '1.4rem'
            }}>
              📹
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '18px 0 8px' }}>
              AI Monitoring
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Real-time face, eye, and behavior monitoring using advanced AI models.
            </p>
          </div>

          {/* Card 2: Cheating Detection */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #eef2f6',
            padding: '32px 24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
              fontSize: '1.4rem'
            }}>
              🛡️
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '18px 0 8px' }}>
              Cheating Detection
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Detects multiple people, mobile phones, suspicious objects and unusual activities.
            </p>
          </div>

          {/* Card 3: Exam Analytics */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #eef2f6',
            padding: '32px 24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#f5f3ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8b5cf6',
              fontSize: '1.4rem'
            }}>
              📊
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '18px 0 8px' }}>
              Exam Analytics
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Detailed reports and risk analysis for each exam attempt.
            </p>
          </div>

          {/* Card 4: Secure & Reliable */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #eef2f6',
            padding: '32px 24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
              fontSize: '1.4rem'
            }}>
              🔒
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '18px 0 8px' }}>
              Secure & Reliable
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Prevent tab switching, copy-paste and other unfair means.
            </p>
          </div>

        </div>
      </section>

      {/* Bottom Statistics Bar */}
      <section style={{
        maxWidth: '1440px',
        margin: '0 auto 60px',
        padding: '0 32px'
      }}>

        <div style={{
          background: '#f8fafd',
          borderRadius: '20px',
          border: '1px solid #edf2f7',
          padding: '28px 48px',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr auto 1fr auto 1fr',
          alignItems: 'center'
        }}>

          {/* Stat 1: 10K+ Students Monitored */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              color: '#0066ff'
            }}>
              👥
            </div>
            <div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0066ff', lineHeight: 1 }}>
                10K+
              </div>
              <div style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px' }}>
                Students Monitored
              </div>
            </div>
          </div>

          <div style={{ width: '1px', height: '44px', background: '#e2e8f0' }} />

          {/* Stat 2: 500+ Exams Conducted */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              color: '#10b981'
            }}>
              📄
            </div>
            <div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#10b981', lineHeight: 1 }}>
                500+
              </div>
              <div style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px' }}>
                Exams Conducted
              </div>
            </div>
          </div>

          <div style={{ width: '1px', height: '44px', background: '#e2e8f0' }} />

          {/* Stat 3: 98% Detection Accuracy */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: '#f5f3ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              color: '#8b5cf6'
            }}>
              🛡️
            </div>
            <div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#8b5cf6', lineHeight: 1 }}>
                98%
              </div>
              <div style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px' }}>
                Detection Accuracy
              </div>
            </div>
          </div>

          <div style={{ width: '1px', height: '44px', background: '#e2e8f0' }} />

          {/* Stat 4: 24/7 Secure Monitoring */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              color: '#ef4444'
            }}>
              🕒
            </div>
            <div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ef4444', lineHeight: 1 }}>
                24/7
              </div>
              <div style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px' }}>
                Secure Monitoring
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}

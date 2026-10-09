import React from 'react';
import { departmentsData, facultyData } from '../data/eduData';

export default function DepartmentsPage({ onNavigate, onOpenAuth }) {
  return (
    <div style={{ minHeight: '100vh', background: '#080c14', color: '#f1f5f9', padding: '20px 24px 60px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ fontSize: '2.6rem', fontWeight: 800 }}>
            Academic Departments & <span style={{ color: '#818cf8' }}>Faculty Directory</span>
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '12px' }}>
            Explore our world-class academic departments, pioneering research labs, and distinguished faculty leadership.
          </p>
        </div>

        {/* Departments Grid */}
        <h2 style={{ fontSize: '1.6rem', marginBottom: '24px' }}>🏫 University Departments</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '60px' }}>
          {departmentsData.map(dept => (
            <div key={dept.id} className="glass" style={{ padding: '24px' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '12px' }}>{dept.icon}</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{dept.name}</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '16px', lineHeight: 1.6 }}>{dept.desc}</p>
              
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px', fontSize: '0.82rem', color: '#64748b' }}>
                <div style={{ marginBottom: '4px' }}><strong>Department Head:</strong> <span style={{ color: '#cbd5e1' }}>{dept.head}</span></div>
                <div style={{ marginBottom: '4px' }}><strong>Research Focus:</strong> <span style={{ color: '#818cf8' }}>{dept.researchFocus}</span></div>
                <div><strong>Enrolled Students:</strong> <span style={{ color: '#34d399' }}>{dept.studentsCount.toLocaleString()}</span></div>
              </div>
            </div>
          ))}
        </div>

        {/* Faculty Leadership Directory */}
        <h2 style={{ fontSize: '1.6rem', marginBottom: '24px' }}>🎓 Distinguished Faculty Profiles</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {facultyData.map((fac, idx) => (
            <div key={idx} className="glass" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 12px' }}>
                👤
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{fac.name}</h4>
              <p style={{ color: '#818cf8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>{fac.title}</p>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '12px' }}>{fac.degree}</p>
              <span style={{ fontSize: '0.78rem', color: '#34d399', background: 'rgba(52, 211, 153, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>
                {fac.specialty}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

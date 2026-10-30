import React from 'react';
import { departmentsData, facultyData } from '../data/eduData';

export default function DepartmentsPage({ onNavigate, onOpenAuth }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #f8fafc)', color: 'var(--text-primary, #0f172a)', padding: '24px 32px 60px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a' }}>
            Academic Departments & <span style={{ color: '#0066ff' }}>Faculty Directory</span>
          </h1>
          <p style={{ color: '#64748b', marginTop: '12px', fontSize: '1rem' }}>
            Explore our world-class academic departments, pioneering research labs, and distinguished faculty leadership.
          </p>
        </div>

        {/* Departments Grid */}
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>🏫 University Departments</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          {departmentsData.map(dept => (
            <div key={dept.id} className="card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '12px' }}>{dept.icon}</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>{dept.name}</h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '16px', lineHeight: 1.6 }}>{dept.desc}</p>
              
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', fontSize: '0.82rem', color: '#64748b' }}>
                <div style={{ marginBottom: '4px' }}><strong>Department Head:</strong> <span style={{ color: '#0f172a', fontWeight: 600 }}>{dept.head}</span></div>
                <div style={{ marginBottom: '4px' }}><strong>Research Focus:</strong> <span style={{ color: '#0066ff', fontWeight: 600 }}>{dept.researchFocus}</span></div>
                <div><strong>Enrolled Students:</strong> <span style={{ color: '#10b981', fontWeight: 700 }}>{dept.studentsCount.toLocaleString()}</span></div>
              </div>
            </div>
          ))}
        </div>

        {/* Faculty Leadership Directory */}
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>🎓 Distinguished Faculty Profiles</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {facultyData.map((fac, idx) => (
            <div key={idx} className="card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#0066ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 12px' }}>
                👤
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{fac.name}</h4>
              <p style={{ color: '#0066ff', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>{fac.title}</p>
              <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '12px' }}>{fac.degree}</p>
              <span className="badge badge-success" style={{ fontSize: '0.78rem' }}>
                {fac.specialty}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { coursesData } from '../data/eduData';

export default function CoursesPage({ onNavigate, onOpenAuth }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  const filtered = coursesData.filter(c => {
    const matchCat = selectedCat === 'all' || c.category === selectedCat;
    const matchSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.desc.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#080c14', color: '#f1f5f9', padding: '120px 24px 60px' }}>
      
      {/* Top Navigation */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000,
        padding: '16px 5%', background: 'rgba(8, 12, 20, 0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ fontSize: '1.4rem', fontWeight: 800, cursor: 'pointer' }} onClick={() => onNavigate('landing')}>
          <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EduVanguard</span>
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <button style={{ background: 'none', border: 'none', color: '#94a3b8', fontWeight: 500, cursor: 'pointer' }} onClick={() => onNavigate('landing')}>Home</button>
          <button style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer' }} onClick={() => onNavigate('courses')}>Courses</button>
          <button style={{ background: 'none', border: 'none', color: '#94a3b8', fontWeight: 500, cursor: 'pointer' }} onClick={() => onNavigate('features')}>AI Proctoring</button>
          <button style={{ background: 'none', border: 'none', color: '#94a3b8', fontWeight: 500, cursor: 'pointer' }} onClick={() => onNavigate('departments')}>Departments</button>
          <button style={{ background: 'none', border: 'none', color: '#94a3b8', fontWeight: 500, cursor: 'pointer' }} onClick={() => onNavigate('schedule')}>Schedule</button>
          <button style={{ background: 'none', border: 'none', color: '#94a3b8', fontWeight: 500, cursor: 'pointer' }} onClick={() => onNavigate('certificates')}>Verify</button>
          <button style={{ background: 'none', border: 'none', color: '#94a3b8', fontWeight: 500, cursor: 'pointer' }} onClick={() => onNavigate('faq')}>FAQ</button>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="nav-btn active" onClick={() => onOpenAuth('student')}>Student Login</button>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.6rem', fontWeight: 800, marginBottom: '12px' }}>
          Academic Curriculum & <span style={{ color: '#818cf8' }}>Course Directory</span>
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '32px' }}>
          Explore our accredited degree courses ({coursesData.length} active courses). Launch AI-proctored certification assessments.
        </p>

        {/* Search Bar */}
        <div style={{ maxWidth: '600px', margin: '0 auto 24px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Search by course name, course code (e.g. AI-101, CS-201), or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Tags */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '40px', flexWrap: 'wrap' }}>
          <button className={`nav-btn ${selectedCat === 'all' ? 'active' : ''}`} onClick={() => setSelectedCat('all')}>All Courses</button>
          <button className={`nav-btn ${selectedCat === 'ai' ? 'active' : ''}`} onClick={() => setSelectedCat('ai')}>AI & Vision</button>
          <button className={`nav-btn ${selectedCat === 'cs' ? 'active' : ''}`} onClick={() => setSelectedCat('cs')}>Computer Science</button>
          <button className={`nav-btn ${selectedCat === 'cyber' ? 'active' : ''}`} onClick={() => setSelectedCat('cyber')}>Cyber Security</button>
          <button className={`nav-btn ${selectedCat === 'ds' ? 'active' : ''}`} onClick={() => setSelectedCat('ds')}>Data Science</button>
          <button className={`nav-btn ${selectedCat === 'cloud' ? 'active' : ''}`} onClick={() => setSelectedCat('cloud')}>Cloud</button>
          <button className={`nav-btn ${selectedCat === 'gamedev' ? 'active' : ''}`} onClick={() => setSelectedCat('gamedev')}>Game Dev</button>
        </div>

        {/* Courses Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '28px' }}>
          {filtered.map(course => (
            <div key={course.id} className="glass" style={{ padding: '24px', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                  {course.categoryLabel}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>
                  ★ {course.rating} ({course.studentsCount} Students)
                </span>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>CODE: {course.code} • {course.level}</div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>{course.title}</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '16px', lineHeight: 1.6, flex: 1 }}>{course.desc}</p>
              
              {/* Modules list preview */}
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.78rem', color: '#cbd5e1' }}>
                <strong>Key Modules:</strong> {course.modules.slice(0, 3).join(', ')}...
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Exam: {course.questionsCount} Qs ({course.duration})</span>
                <button className="next-btn" onClick={() => onOpenAuth('student')}>Take Proctored Exam</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #f8fafc)', color: 'var(--text-primary, #0f172a)', padding: '24px 32px 60px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
          Academic Curriculum & <span style={{ color: '#0066ff' }}>Course Directory</span>
        </h1>
        <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '1rem' }}>
          Explore our accredited degree courses ({coursesData.length} active courses). Launch AI-proctored certification assessments.
        </p>

        {/* Search Bar */}
        <div style={{ maxWidth: '600px', margin: '0 auto 24px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by course name, course code (e.g. AI-101, CS-201), or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Tags */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '40px', flexWrap: 'wrap' }}>
          <button className={`btn-secondary ${selectedCat === 'all' ? 'active' : ''}`} style={selectedCat === 'all' ? { background: '#0066ff', color: '#fff' } : {}} onClick={() => setSelectedCat('all')}>All Courses</button>
          <button className={`btn-secondary ${selectedCat === 'ai' ? 'active' : ''}`} style={selectedCat === 'ai' ? { background: '#0066ff', color: '#fff' } : {}} onClick={() => setSelectedCat('ai')}>AI & Vision</button>
          <button className={`btn-secondary ${selectedCat === 'cs' ? 'active' : ''}`} style={selectedCat === 'cs' ? { background: '#0066ff', color: '#fff' } : {}} onClick={() => setSelectedCat('cs')}>Computer Science</button>
          <button className={`btn-secondary ${selectedCat === 'cyber' ? 'active' : ''}`} style={selectedCat === 'cyber' ? { background: '#0066ff', color: '#fff' } : {}} onClick={() => setSelectedCat('cyber')}>Cyber Security</button>
          <button className={`btn-secondary ${selectedCat === 'ds' ? 'active' : ''}`} style={selectedCat === 'ds' ? { background: '#0066ff', color: '#fff' } : {}} onClick={() => setSelectedCat('ds')}>Data Science</button>
          <button className={`btn-secondary ${selectedCat === 'cloud' ? 'active' : ''}`} style={selectedCat === 'cloud' ? { background: '#0066ff', color: '#fff' } : {}} onClick={() => setSelectedCat('cloud')}>Cloud</button>
          <button className={`btn-secondary ${selectedCat === 'gamedev' ? 'active' : ''}`} style={selectedCat === 'gamedev' ? { background: '#0066ff', color: '#fff' } : {}} onClick={() => setSelectedCat('gamedev')}>Game Dev</button>
        </div>

        {/* Courses Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {filtered.map(course => (
            <div key={course.id} className="card" style={{ padding: '24px', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="badge badge-info" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                  {course.categoryLabel}
                </span>
                <span style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 700 }}>
                  ★ {course.rating} ({course.studentsCount} Students)
                </span>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>CODE: {course.code} • {course.level}</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>{course.title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '16px', lineHeight: 1.6, flex: 1 }}>{course.desc}</p>
              
              {/* Modules list preview */}
              <div style={{ background: '#f1f5f9', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.8rem', color: '#334155' }}>
                <strong style={{ color: '#0f172a' }}>Key Modules:</strong> {course.modules.slice(0, 3).join(', ')}...
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Exam: {course.questionsCount} Qs ({course.duration})</span>
                <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => onOpenAuth('student')}>Take Proctored Exam</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

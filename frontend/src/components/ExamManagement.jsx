import React, { useState, useEffect } from 'react';

const DEMO_EXAMS = [
  { id: 1, title: "Computer Vision & YOLOv8 Mid-Term", subject: "Computer Vision", duration_minutes: 45, total_questions: 10, passing_score: 60, is_active: 1 },
  { id: 2, title: "MediaPipe 3D Landmark Analytics Quiz", subject: "Facial Analytics", duration_minutes: 30, total_questions: 10, passing_score: 70, is_active: 1 },
  { id: 3, title: "FastAPI & WebSockets Architecture Final", subject: "Web Architecture", duration_minutes: 60, total_questions: 15, passing_score: 60, is_active: 1 }
];

export default function ExamManagement({ token }) {
  const [exams, setExams]       = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [form, setForm] = useState({
    title: '', subject: '', duration_minutes: 45, total_questions: 10, passing_score: 60
  });

  const API = `http://localhost:8000`;

  function fetchExams() {
    fetch(`${API}/exams`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setExams(data);
        else setExams(DEMO_EXAMS);
      })
      .catch(() => setExams(DEMO_EXAMS));
  }

  useEffect(() => {
    fetchExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveExam(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/exams`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error();
      fetchExams();
    } catch {
      setExams(prev => [{ id: Date.now(), ...form, is_active: 1 }, ...prev]);
    }
    setShowForm(false);
    setForm({ title: '', subject: '', duration_minutes: 45, total_questions: 10, passing_score: 60 });
    setLoading(false);
  }

  async function deleteExam(id) {
    if (!window.confirm('Delete this examination schedule?')) return;
    try {
      await fetch(`${API}/exams/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch {}
    setExams(prev => prev.filter(e => e.id !== id));
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)',
    borderRadius: '8px', color: '#f1f5f9',
    fontSize: '13px', boxSizing: 'border-box',
    marginBottom: '12px'
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{
            fontSize: '22px', fontWeight: '700',
            background: 'linear-gradient(135deg, #fff, #94a3b8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>Examination Schedule & Assignment Creator</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
            {exams.length} Configured Examinations · Server-Controlled Time Engine
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="next-btn"
          style={{ padding: '9px 20px', fontSize: '13px', background: '#3b82f6' }}
        >
          {showForm ? 'Cancel' : '+ Create New Exam'}
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="glass" style={{ padding: '24px', marginBottom: '24px', borderLeft: '4px solid #3b82f6' }}>
          <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '20px' }}>➕ Create Proctored Exam Schedule</h3>
          <form onSubmit={saveExam}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Exam Title</label>
                <input style={inputStyle} value={form.title} required
                  onChange={e => setForm(p => ({...p, title: e.target.value}))}
                  placeholder="e.g. Deep Learning & YOLO Analytics Exam" />
              </div>
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Subject Domain</label>
                <input style={inputStyle} value={form.subject} required
                  onChange={e => setForm(p => ({...p, subject: e.target.value}))}
                  placeholder="e.g. Computer Vision" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Duration (Minutes)</label>
                <input type="number" style={inputStyle} value={form.duration_minutes} required
                  onChange={e => setForm(p => ({...p, duration_minutes: parseInt(e.target.value)}))} />
              </div>
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Total Questions</label>
                <input type="number" style={inputStyle} value={form.total_questions} required
                  onChange={e => setForm(p => ({...p, total_questions: parseInt(e.target.value)}))} />
              </div>
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Passing Grade (%)</label>
                <input type="number" style={inputStyle} value={form.passing_score} required
                  onChange={e => setForm(p => ({...p, passing_score: parseInt(e.target.value)}))} />
              </div>
            </div>

            <button type="submit" className="next-btn" style={{ padding: '10px 24px' }} disabled={loading}>
              {loading ? 'Publishing...' : 'Publish Examination Schedule'}
            </button>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="glass" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              {['#', 'Exam Title', 'Subject', 'Duration', 'Questions', 'Pass %', 'Actions'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {exams.map(ex => (
              <tr key={ex.id}>
                <td style={{ color: 'var(--text-muted)' }}>#{ex.id}</td>
                <td style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{ex.title}</td>
                <td>
                  <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600' }}>
                    {ex.subject}
                  </span>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>⏱️ {ex.duration_minutes} mins</td>
                <td style={{ color: 'var(--text-secondary)' }}>❓ {ex.total_questions} Qs</td>
                <td style={{ color: '#4ade80', fontWeight: '700' }}>{ex.passing_score}%</td>
                <td>
                  <button onClick={() => deleteExam(ex.id)} className="logout-btn" style={{ padding: '4px 12px', fontSize: '12px' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

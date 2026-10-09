import React, { useState, useEffect } from 'react';

const DEMO_QUESTIONS = [
  { id: 1, subject: "Computer Vision", difficulty: "medium", question_text: "What does CLAHE stand for in image contrast enhancement?", option_a: "Contrast Limited Adaptive Histogram Equalization", option_b: "Color Luminance Adaptive High Equalizer", option_c: "Computer Learning Adaptive Histogram Engine", option_d: "Contrast Linear Auto Histogram Estimator", correct_answer: "A" },
  { id: 2, subject: "Object Detection", difficulty: "hard", question_text: "In COCO dataset classification for YOLO models, which class index represents 'cell phone'?", option_a: "Class 0", option_b: "Class 67", option_c: "Class 15", option_d: "Class 80", correct_answer: "B" },
  { id: 3, subject: "Facial Analytics", difficulty: "medium", question_text: "How many 3D facial landmarks are extracted by MediaPipe FaceMesh?", option_a: "68 landmarks", option_b: "128 landmarks", option_c: "468 landmarks", option_d: "1024 landmarks", correct_answer: "C" },
  { id: 4, subject: "Web Architecture", difficulty: "easy", question_text: "Which HTTP status code represents a successful API response?", option_a: "200 OK", option_b: "404 Not Found", option_c: "500 Internal Server Error", option_d: "401 Unauthorized", correct_answer: "A" },
  { id: 5, subject: "Machine Learning", difficulty: "hard", question_text: "In YOLO object detection pipelines, what does NMS stand for?", option_a: "Non-Maximum Suppression", option_b: "Neural Matrix Scaling", option_c: "Normalized Mean Score", option_d: "Network Model Segmentation", correct_answer: "A" }
];

export default function QuestionManager({ token }) {
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [form, setForm] = useState({
    subject: '', question_text: '',
    option_a: '', option_b: '', option_c: '', option_d: '',
    correct_answer: 'A', difficulty: 'medium'
  });

  const API = `http://localhost:8000`;

  async function fetchQuestions() {
    try {
      const res = await fetch(`${API}/questions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setQuestions(data);
          return;
        }
      }
      setQuestions(DEMO_QUESTIONS);
    } catch {
      setQuestions(DEMO_QUESTIONS);
    }
  }

  useEffect(() => { fetchQuestions(); }, []);

  async function saveQuestion() {
    setLoading(true);
    try {
      const url = editing ? `${API}/questions/${editing}` : `${API}/questions`;
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error();
    } catch {
      // Local addition fallback
      if (editing) {
        setQuestions(prev => prev.map(q => q.id === editing ? { ...q, ...form } : q));
      } else {
        setQuestions(prev => [{ id: Date.now(), ...form }, ...prev]);
      }
    }
    setShowForm(false);
    setEditing(null);
    resetForm();
    setLoading(false);
  }

  async function deleteQuestion(id) {
    if (!window.confirm('Delete this question?')) return;
    try {
      await fetch(`${API}/questions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch {}
    setQuestions(prev => prev.filter(q => q.id !== id));
  }

  function editQuestion(q) {
    setForm({
      subject: q.subject, question_text: q.question_text,
      option_a: q.option_a, option_b: q.option_b,
      option_c: q.option_c, option_d: q.option_d,
      correct_answer: q.correct_answer, difficulty: q.difficulty
    });
    setEditing(q.id);
    setShowForm(true);
  }

  function resetForm() {
    setForm({
      subject: '', question_text: '',
      option_a: '', option_b: '', option_c: '', option_d: '',
      correct_answer: 'A', difficulty: 'medium'
    });
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
          }}>Examination Question Bank Manager</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
            {questions.length} Active Questions in Repository · Exam Generator Engine
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setEditing(null); setShowForm(true); }}
          className="next-btn"
          style={{ padding: '9px 20px', fontSize: '13px', background: '#3b82f6' }}
        >
          + Add New Question
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="glass" style={{ padding: '24px', marginBottom: '24px', borderLeft: '4px solid #3b82f6' }}>
          <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '20px' }}>
            {editing ? '✏️ Edit Question' : '➕ Add Question to Exam Bank'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Subject / Domain</label>
              <input style={inputStyle} value={form.subject}
                onChange={e => setForm(p => ({...p, subject: e.target.value}))}
                placeholder="e.g. Computer Vision, Machine Learning" />
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Difficulty Level</label>
              <select style={inputStyle} value={form.difficulty}
                onChange={e => setForm(p => ({...p, difficulty: e.target.value}))}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <label style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Question Text</label>
          <textarea style={{...inputStyle, height: '80px', resize: 'vertical'}}
            value={form.question_text}
            onChange={e => setForm(p => ({...p, question_text: e.target.value}))}
            placeholder="Type the examination question..." />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {['a','b','c','d'].map(opt => (
              <div key={opt}>
                <label style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Option {opt.toUpperCase()}
                </label>
                <input style={inputStyle}
                  value={form[`option_${opt}`]}
                  onChange={e => setForm(p => ({...p, [`option_${opt}`]: e.target.value}))}
                  placeholder={`Option ${opt.toUpperCase()} content`} />
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '16px', alignItems: 'center' }}>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Correct Answer Option</label>
              <select style={inputStyle}
                value={form.correct_answer}
                onChange={e => setForm(p => ({...p, correct_answer: e.target.value}))}>
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button onClick={() => setShowForm(false)} className="nav-btn" style={{ padding: '9px 20px' }}>
                Cancel
              </button>
              <button onClick={saveQuestion} disabled={loading} className="next-btn" style={{ padding: '9px 24px' }}>
                {loading ? 'Saving...' : editing ? 'Update Question' : 'Save Question'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions Table */}
      <div className="glass" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              {['#', 'Subject', 'Question', 'Difficulty', 'Correct', 'Actions'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {questions.map((q, i) => (
              <tr key={q.id}>
                <td style={{ color: 'var(--text-muted)' }}>#{q.id}</td>
                <td>
                  <span style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600' }}>
                    {q.subject}
                  </span>
                </td>
                <td style={{ color: 'var(--text-primary)', fontWeight: '500', maxWidth: '360px' }}>
                  {q.question_text}
                </td>
                <td>
                  <span className={
                    q.difficulty === 'easy' ? 'pill pill-green' :
                    q.difficulty === 'medium' ? 'pill pill-yellow' : 'pill pill-red'
                  }>
                    {q.difficulty}
                  </span>
                </td>
                <td style={{ color: '#4ade80', fontWeight: '700', fontSize: '14px' }}>
                  Option {q.correct_answer}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => editQuestion(q)} className="nav-btn" style={{ padding: '4px 12px', fontSize: '12px' }}>
                      Edit
                    </button>
                    <button onClick={() => deleteQuestion(q.id)} className="logout-btn" style={{ padding: '4px 12px', fontSize: '12px' }}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
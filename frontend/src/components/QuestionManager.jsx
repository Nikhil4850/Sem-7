import React, { useState, useEffect } from 'react';
import { API } from '../api';



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



  async function fetchQuestions() {
    try {
      const res = await fetch(API.questions, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(Array.isArray(data) ? data : []);
      } else {
        setQuestions([]);
      }
    } catch {
      setQuestions([]);
    }
  }

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveQuestion() {
    setLoading(true);
    try {
      const url = editing ? API.question(editing) : API.questions;
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
      setShowForm(false);
      resetForm();
      fetchQuestions();
    } catch {
      if (editing) {
        setQuestions(prev => prev.map(q => q.id === editing ? { ...q, ...form } : q));
      } else {
        setQuestions(prev => [{ id: Date.now(), ...form }, ...prev]);
      }
      setShowForm(false);
      resetForm();
    } finally {
      setLoading(false);
    }
  }

  async function deleteQuestion(id) {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await fetch(API.question(id), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch {}
    setQuestions(prev => prev.filter(q => q.id !== id));
  }

  function handleEdit(q) {
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

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
            Examination Question Bank Manager
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
            {questions.length} Active Questions in Repository · Exam Generator Engine
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setEditing(null); setShowForm(true); }}
          className="btn btn-primary"
        >
          + Add New Question
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card" style={{ padding: '28px', marginBottom: '24px', borderLeft: '4px solid #0066ff' }}>
          <h3 style={{ color: '#0f172a', fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>
            {editing ? '✏️ Edit Question' : '➕ Add Question to Exam Bank'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ color: '#334155', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Subject / Domain
              </label>
              <input className="form-input" value={form.subject}
                onChange={e => setForm(p => ({...p, subject: e.target.value}))}
                placeholder="e.g. Computer Vision, Machine Learning" />
            </div>
            <div>
              <label style={{ color: '#334155', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Difficulty Level
              </label>
              <select className="form-select" value={form.difficulty}
                onChange={e => setForm(p => ({...p, difficulty: e.target.value}))}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#334155', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Question Text
            </label>
            <textarea className="form-input" style={{ height: '80px', resize: 'vertical' }}
              value={form.question_text}
              onChange={e => setForm(p => ({...p, question_text: e.target.value}))}
              placeholder="Type the examination question..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            {['a','b','c','d'].map(opt => (
              <div key={opt}>
                <label style={{ color: '#334155', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Option {opt.toUpperCase()}
                </label>
                <input className="form-input"
                  value={form[`option_${opt}`]}
                  onChange={e => setForm(p => ({...p, [`option_${opt}`]: e.target.value}))}
                  placeholder={`Option ${opt.toUpperCase()} content`} />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#334155', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Correct Answer Option
            </label>
            <select className="form-select" style={{ width: '200px' }} value={form.correct_answer}
              onChange={e => setForm(p => ({...p, correct_answer: e.target.value}))}>
              <option value="A">Option A</option>
              <option value="B">Option B</option>
              <option value="C">Option C</option>
              <option value="D">Option D</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={saveQuestion} disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : editing ? 'Update Question' : 'Save Question'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Questions Table */}
      <div className="card" style={{ padding: '0px', overflow: 'hidden' }}>
        <table className="saas-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Subject</th>
              <th>Question</th>
              <th>Correct Answer</th>
              <th>Difficulty</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map(q => (
              <tr key={q.id}>
                <td style={{ color: '#64748b', fontSize: '0.85rem' }}>#{q.id}</td>
                <td>
                  <span className="badge badge-primary">{q.subject}</span>
                </td>
                <td style={{ maxWidth: '400px', fontWeight: 500, color: '#0f172a' }}>{q.question_text}</td>
                <td>
                  <span className="badge badge-success">Option {q.correct_answer}</span>
                </td>
                <td>
                  <span className={q.difficulty === 'hard' ? 'badge badge-danger' : q.difficulty === 'medium' ? 'badge badge-warning' : 'badge badge-success'}>
                    {q.difficulty.toUpperCase()}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => handleEdit(q)}>
                      Edit
                    </button>
                    <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => deleteQuestion(q.id)}>
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
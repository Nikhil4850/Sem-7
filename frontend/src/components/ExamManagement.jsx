import React, { useState, useEffect } from 'react';
import { API, apiRequest } from '../api';

const BLANK_EXAM = {
  title: '', description: '', durationMinutes: 60, totalMarks: 100,
  passingScore: 60, isActive: true,
  startTime: '', endTime: ''
};
const BLANK_Q = {
  examId: null, questionText: '', questionType: 'MCQ',
  optionA: '', optionB: '', optionC: '', optionD: '',
  correctAnswer: 'B', marks: 10, orderNumber: 1
};

// helper — normalise id field from API response (examId or id)
const eid = (ex) => ex?.examId ?? ex?.id;
const qid = (q)  => q?.questionId ?? q?.id;

export default function ExamManagement({ token }) {
  const [exams, setExams]             = useState([]);
  const [showExamForm, setShowExamForm] = useState(false);
  const [examForm, setExamForm]       = useState(BLANK_EXAM);
  const [editingExam, setEditingExam] = useState(null);
  const [savingExam, setSavingExam]   = useState(false);

  // Question panel state (per exam)
  const [activeExam, setActiveExam]   = useState(null); // exam whose questions are shown
  const [questions, setQuestions]     = useState([]);
  const [loadingQ, setLoadingQ]       = useState(false);
  const [showQForm, setShowQForm]     = useState(false);
  const [editingQ, setEditingQ]       = useState(null);
  const [qForm, setQForm]             = useState(BLANK_Q);
  const [savingQ, setSavingQ]         = useState(false);
  const [msg, setMsg]                 = useState('');
  const [msgType, setMsgType]         = useState('success'); // 'success' | 'error'

  // ── Exams ─────────────────────────────────────────────────────
  function fetchExams() {
    fetch(API.exams, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setExams(Array.isArray(data) ? data : []))
      .catch(() => setExams([]));
  }

  useEffect(() => { fetchExams(); }, []); // eslint-disable-line

  async function saveExam(e) {
    e.preventDefault();
    setSavingExam(true);
    try {
      const url    = editingExam ? API.exam(editingExam) : API.exams;
      const method = editingExam ? 'PUT' : 'POST';
      const payload = {
        ...examForm,
        startTime: examForm.startTime ? new Date(examForm.startTime).toISOString() : null,
        endTime:   examForm.endTime   ? new Date(examForm.endTime).toISOString()   : null,
      };
      const res = await apiRequest(url, method, payload, token);
      if (!res.ok) {
        let reason = `Server error (${res.status})`;
        try { const e = await res.json(); reason = e.message || e.detail || reason; } catch {}
        flash(`Failed to save exam: ${reason}`, 'error');
        return;
      }
      const saved = await res.json();
      console.log('[saveExam] saved:', saved);
      flash(editingExam ? 'Exam updated.' : 'Exam created! Now add questions below.');
      setShowExamForm(false);
      setEditingExam(null);
      setExamForm(BLANK_EXAM);
      await fetchExamsAndOpen(saved, !editingExam);
    } catch (err) {
      console.error('[saveExam] error:', err);
      flash(`Failed to save exam: ${err.message}`, 'error');
    }
    finally { setSavingExam(false); }
  }

  async function fetchExamsAndOpen(saved, autoOpen) {
    return new Promise(resolve => {
      fetch(API.exams, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => {
          const list = Array.isArray(data) ? data : [];
          setExams(list);
          if (autoOpen && (saved?.examId || saved?.id)) {
            const savedId = saved.examId ?? saved.id;
            const ex = list.find(e => eid(e) === savedId) || saved;
            openExamQuestions(ex);
          }
          resolve();
        })
        .catch(() => { setExams([]); resolve(); });
    });
  }

  async function deleteExam(id) {
    if (!window.confirm('Delete this exam and all its questions?')) return;
    flash('Deleting...');
    const url = API.exam(id);
    console.log('[deleteExam] DELETE', url);
    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('[deleteExam] response status:', res.status);

      if (res.ok || res.status === 204) {
        setExams(p => p.filter(e => eid(e) !== id));
        if (eid(activeExam) === id) setActiveExam(null);
        flash('Exam deleted successfully.');
        return;
      }

      let reason = `Server error (${res.status})`;
      try {
        const err = await res.json();
        console.log('[deleteExam] error body:', err);
        reason = err.message || err.detail || reason;
      } catch {}
      flash(`Delete failed: ${reason}`, 'error');
    } catch (err) {
      console.error('[deleteExam] network error:', err);
      flash(`Delete failed: ${err.message}`, 'error');
    }
  }

  function startEditExam(ex) {
    setEditingExam(eid(ex));
    setExamForm({
      title: ex.title,
      description: ex.description || '',
      durationMinutes: ex.durationMinutes || 60,
      totalMarks: ex.totalMarks || 100,
      passingScore: ex.passingScore || 60,
      isActive: ex.isActive !== undefined ? ex.isActive : true,
      startTime: ex.startTime ? ex.startTime.slice(0, 16) : '',
      endTime:   ex.endTime   ? ex.endTime.slice(0, 16)   : '',
    });
    setShowExamForm(true);
    setActiveExam(null);
  }

  // ── Questions for selected exam ───────────────────────────────
  function openExamQuestions(ex) {
    setActiveExam(ex);
    setShowQForm(true);
    setEditingQ(null);
    setQForm({ ...BLANK_Q, examId: eid(ex) });
    fetchQuestions(eid(ex));
  }

  function fetchQuestions(examId) {
    setLoadingQ(true);
    fetch(`${API.questions}?examId=${examId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setQuestions(Array.isArray(data) ? data : []); setLoadingQ(false); })
      .catch(() => { setQuestions([]); setLoadingQ(false); });
  }

  async function saveQuestion(e) {
    e.preventDefault();
    setSavingQ(true);
    try {
      const url    = editingQ ? API.question(editingQ) : API.questions;
      const method = editingQ ? 'PUT' : 'POST';
      const payload = { ...qForm, examId: eid(activeExam) };
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error();
      flash('Question saved.');
      setShowQForm(false);
      setEditingQ(null);
      setQForm({ ...BLANK_Q, examId: eid(activeExam) });
      fetchQuestions(eid(activeExam));
    } catch { flash('Failed to save question.', 'error'); }
    finally { setSavingQ(false); }
  }

  async function deleteQuestion(id) {
    if (!window.confirm('Delete this question?')) return;
    try {
      const res = await fetch(API.question(id), { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok || res.status === 204) {
        setQuestions(p => p.filter(q => qid(q) !== id));
      } else {
        flash('Failed to delete question.', 'error');
      }
    } catch { flash('Failed to delete question.', 'error'); }
  }

  function startEditQ(q) {
    setEditingQ(qid(q));
    setQForm({
      examId: eid(activeExam),
      questionText: q.questionText || q.question_text || '',
      questionType: q.questionType || q.question_type || 'MCQ',
      optionA: q.optionA || q.option_a || '',
      optionB: q.optionB || q.option_b || '',
      optionC: q.optionC || q.option_c || '',
      optionD: q.optionD || q.option_d || '',
      correctAnswer: q.correctAnswer || q.correct_answer || 'B',
      marks: q.marks || 10,
      orderNumber: q.orderNumber || q.order_number || 1
    });
    setShowQForm(true);
  }

  function flash(m, type = 'success') { setMsg(m); setMsgType(type); setTimeout(() => setMsg(''), 4000); }

  const isMCQ = qForm.questionType === 'MCQ';
  const isTF  = qForm.questionType === 'TrueFalse';

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>

      {msg && (
        <div style={{
          width: '100%', padding: '12px 16px', marginBottom: '16px',
          fontSize: '0.9rem', fontWeight: 600, borderRadius: '8px',
          background: msgType === 'error' ? '#fef2f2' : '#f0fdf4',
          color:      msgType === 'error' ? '#b91c1c' : '#15803d',
          border:     `1px solid ${msgType === 'error' ? '#fecaca' : '#bbf7d0'}`,
        }}>
          {msgType === 'error' ? '✗ ' : '✓ '}{msg}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>Exam Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
            Create exams and manage their questions
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowExamForm(p => !p); setEditingExam(null); setExamForm(BLANK_EXAM); setActiveExam(null); }}>
          {showExamForm && !editingExam ? 'Cancel' : '+ New Exam'}
        </button>
      </div>

      {/* ── Exam Create / Edit Form ── */}
      {showExamForm && (
        <form onSubmit={saveExam} className="card" style={{ padding: '28px', marginBottom: '28px', borderLeft: '4px solid #0066ff' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>
            {editingExam ? '✏️ Edit Exam' : '🗓️ Create New Exam'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={lbl}>Exam Title</label>
              <input required className="form-input" placeholder="e.g. Python Fundamentals" value={examForm.title} onChange={e => setExamForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Description</label>
              <input className="form-input" placeholder="e.g. Basic Python programming exam" value={examForm.description} onChange={e => setExamForm(p => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={lbl}>Start Date & Time</label>
              <input type="datetime-local" className="form-input" value={examForm.startTime}
                onChange={e => setExamForm(p => ({ ...p, startTime: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>End Date & Time</label>
              <input type="datetime-local" className="form-input" value={examForm.endTime}
                onChange={e => setExamForm(p => ({ ...p, endTime: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={lbl}>Duration (mins)</label>
              <input required type="number" className="form-input" value={examForm.durationMinutes} onChange={e => setExamForm(p => ({ ...p, durationMinutes: +e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Total Marks</label>
              <input required type="number" className="form-input" value={examForm.totalMarks} onChange={e => setExamForm(p => ({ ...p, totalMarks: +e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Passing Score (%)</label>
              <input required type="number" className="form-input" value={examForm.passingScore} onChange={e => setExamForm(p => ({ ...p, passingScore: +e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Status</label>
              <select className="form-select" value={examForm.isActive ? 'true' : 'false'} onChange={e => setExamForm(p => ({ ...p, isActive: e.target.value === 'true' }))}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary" disabled={savingExam}>{savingExam ? 'Saving...' : editingExam ? 'Update Exam' : 'Create Exam'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowExamForm(false); setEditingExam(null); }}>Cancel</button>
          </div>
        </form>
      )}

      {/* ── Exams Grid ── */}
      {exams.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No exams yet. Create one above.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px', marginBottom: activeExam ? '32px' : 0 }}>
          {exams.map(ex => {
            const isOpen = eid(activeExam) === eid(ex);
            return (
              <div key={eid(ex)} className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', border: isOpen ? '2px solid #0066ff' : '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span className="badge badge-primary">{ex.description || '—'}</span>
                  <span className={ex.isActive ? 'badge badge-success' : 'badge badge-warning'}>
                    {ex.isActive ? 'Active 🟢' : 'Inactive'}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>{ex.title}</h3>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.82rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                  <span>⏱️ {ex.durationMinutes} min</span>
                  <span>🎯 {ex.totalMarks || 100} marks</span>
                  <span>✅ Pass: {ex.passingScore || 60}%</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.82rem', padding: '7px' }} onClick={() => isOpen ? setActiveExam(null) : openExamQuestions(ex)}>
                    {isOpen ? '▲ Hide Questions' : `📝 Questions`}
                  </button>
                  <button className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '7px 10px' }} onClick={() => startEditExam(ex)}>Edit</button>
                  <button className="btn btn-danger" style={{ fontSize: '0.82rem', padding: '7px 10px' }} onClick={() => deleteExam(eid(ex))}>Del</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Question Panel (inline under selected exam) ── */}
      {activeExam && (
        <div className="card" style={{ padding: '28px', marginTop: '8px', borderTop: '3px solid #0066ff' }}>

          {/* Question panel header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                📝 Questions — {activeExam.title}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '3px' }}>
                {questions.length} question{questions.length !== 1 ? 's' : ''} added
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => { setShowQForm(p => !p); setEditingQ(null); setQForm({ ...BLANK_Q, examId: activeExam.id }); }}>
              {showQForm && !editingQ ? 'Cancel' : '+ Add Question'}
            </button>
          </div>

          {/* Question form */}
          {showQForm && (
            <form onSubmit={saveQuestion} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <h4 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
                {editingQ ? '✏️ Edit Question' : '➕ New Question'}
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={lbl}>Question Type</label>
                  <select className="form-select" value={qForm.questionType} onChange={e => setQForm(p => ({ ...p, questionType: e.target.value }))}>
                    <option value="MCQ">MCQ</option>
                    <option value="TrueFalse">True / False</option>
                    <option value="ShortAnswer">Short Answer</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Marks</label>
                  <input type="number" className="form-input" value={qForm.marks} onChange={e => setQForm(p => ({ ...p, marks: +e.target.value }))} />
                </div>
                <div>
                  <label style={lbl}>Order #</label>
                  <input type="number" className="form-input" value={qForm.orderNumber} onChange={e => setQForm(p => ({ ...p, orderNumber: +e.target.value }))} />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={lbl}>Question Text</label>
                <textarea required className="form-input" style={{ height: '80px', resize: 'vertical' }}
                  placeholder="Enter the question..." value={qForm.questionText}
                  onChange={e => setQForm(p => ({ ...p, questionText: e.target.value }))} />
              </div>

              {(isMCQ || isTF) && (
                <div style={{ display: 'grid', gridTemplateColumns: isTF ? '1fr 1fr' : '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  {isTF ? (
                    <>
                      <div><label style={lbl}>Option A</label><input className="form-input" value="True" readOnly /></div>
                      <div><label style={lbl}>Option B</label><input className="form-input" value="False" readOnly /></div>
                    </>
                  ) : (
                    ['A','B','C','D'].map(o => (
                      <div key={o}>
                        <label style={lbl}>Option {o}</label>
                        <input required className="form-input" placeholder={`Option ${o}`}
                          value={qForm[`option${o}`]}
                          onChange={e => setQForm(p => ({ ...p, [`option${o}`]: e.target.value }))} />
                      </div>
                    ))
                  )}
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={lbl}>Correct Answer</label>
                {qForm.questionType === 'ShortAnswer' ? (
                  <input required className="form-input" placeholder="Expected answer text"
                    value={qForm.correctAnswer} onChange={e => setQForm(p => ({ ...p, correctAnswer: e.target.value }))} />
                ) : (
                  <select className="form-select" style={{ width: '200px' }} value={qForm.correctAnswer}
                    onChange={e => setQForm(p => ({ ...p, correctAnswer: e.target.value }))}>
                    {isTF ? (
                      <><option value="A">A — True</option><option value="B">B — False</option></>
                    ) : (
                      ['A','B','C','D'].map(o => <option key={o} value={o}>Option {o}</option>)
                    )}
                  </select>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" disabled={savingQ}>{savingQ ? 'Saving...' : editingQ ? 'Update' : 'Save Question'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowQForm(false); setEditingQ(null); }}>Cancel</button>
              </div>
            </form>
          )}

          {/* Questions list */}
          {loadingQ ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>Loading questions...</div>
          ) : questions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>No questions yet. Add one above.</div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Type</th>
                    <th>Question</th>
                    <th>Answer</th>
                    <th>Marks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, idx) => (
                    <tr key={qid(q)}>
                      <td style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{q.orderNumber || q.order_number || idx + 1}</td>
                      <td><span className="badge badge-primary">{q.questionType || q.question_type || 'MCQ'}</span></td>
                      <td style={{ maxWidth: '380px', color: '#0f172a', fontWeight: 500 }}>{q.questionText || q.question_text}</td>
                      <td><span className="badge badge-success">{q.correctAnswer || q.correct_answer}</span></td>
                      <td style={{ fontWeight: 600, color: '#0066ff' }}>{q.marks}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-secondary" style={{ padding: '3px 9px', fontSize: '0.78rem' }} onClick={() => startEditQ(q)}>Edit</button>
                          <button className="btn btn-danger" style={{ padding: '3px 9px', fontSize: '0.78rem' }} onClick={() => deleteQuestion(qid(q))}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const lbl = { color: '#334155', fontSize: '0.83rem', fontWeight: 600, display: 'block', marginBottom: '5px' };

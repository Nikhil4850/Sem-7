import React, { useState, useEffect, useCallback, useRef } from 'react';
import { API } from '../api';

const EXAM_DURATION = 45 * 60;

/* ── helpers ────────────────────────────────────────────────────── */
function pad2(n) { return String(n).padStart(2, '0'); }
function formatHMS(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return { h: pad2(h), m: pad2(m), s: pad2(s) };
}

/* ── Question status helpers ─────────────────────────────────────── */
function getQStatus(idx, current, answers, questionKey, marked) {
  if (idx === current) return 'current';
  if (marked.has(idx)) return 'marked';
  if (answers[questionKey] !== undefined) return 'answered';
  return 'unanswered';
}

const Q_STATUS_COLORS = {
  answered:  { bg: '#22c55e', color: '#fff', border: '#16a34a' },
  unanswered:{ bg: '#fff',    color: '#334155', border: '#cbd5e1' },
  current:   { bg: '#3b82f6', color: '#fff', border: '#2563eb' },
  marked:    { bg: '#ef4444', color: '#fff', border: '#dc2626' },
};

export default function ExamPanel({ token, examId, onDone, videoRef: externalVideoRef, result: procResult, connected }) {
  const [phase, setPhase]         = useState('start');
  const [session, setSession]     = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent]     = useState(0);
  const [answers, setAnswers]     = useState({});
  const [marked, setMarked]       = useState(new Set());
  const [timeLeft, setTimeLeft]   = useState(EXAM_DURATION);
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [examMeta, setExamMeta]   = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // internal videoRef if not provided externally
  const internalVideoRef = useRef(null);
  const videoRef = externalVideoRef || internalVideoRef;
  const canvasRef = useRef(null);
  const wrapRef   = useRef(null);

  // Timer Countdown Effect
  useEffect(() => {
    if (phase !== 'exam') return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  async function startExam() {
    setLoading(true);
    setError(null);
    if (!examId) {
      setError('No exam selected. Please go back and select an exam.');
      setLoading(false);
      return;
    }
    try {
      const startRes = await fetch(API.sessionStart, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId })
      });
      if (!startRes.ok) {
        const err = await startRes.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to start exam session');
      }
      const sData = await startRes.json();
      setSession(sData);
      setExamMeta(sData);

      const qRes = await fetch(`${API.questions}?examId=${examId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!qRes.ok) throw new Error('Failed to load questions');
      const data = await qRes.json();
      const qs   = Array.isArray(data) ? data : (data.questions || []);
      if (qs.length === 0) throw new Error('No questions found for this exam. Please contact your teacher.');
      setQuestions(qs);
      if (sData.durationMinutes) setTimeLeft(sData.durationMinutes * 60);
      setPhase('exam');
    } catch (e) {
      setError(e.message || 'Could not start exam. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const submitExam = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const timeTaken = (session.durationMinutes
      ? session.durationMinutes * 60
      : EXAM_DURATION) - timeLeft;
    // Stringify all keys so backend's answers.get(str(q["id"])) lookup works
    const stringAnswers = {};
    Object.entries(answers).forEach(([k, v]) => { stringAnswers[String(k)] = v; });
    try {
      const res = await fetch(API.sessionSubmit(session.sessionId || session.id), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: stringAnswers, timeTaken })
      });
      if (res.ok) {
        const data = await res.json();
        // Backend returns questions + answers in response for result screen
        // Fall back to local state if backend doesn't include them
        setResult({
          ...data,
          questions: data.questions && data.questions.length > 0 ? data.questions : questions,
          answers:   data.answers   || stringAnswers,
          timeTaken: data.timeTaken ?? timeTaken,
        });
        setPhase('result');
      } else {
        setError('Failed to submit exam. Please try again.');
      }
    } catch {
      setError('Submission failed. Please check your connection.');
    } finally {
      setLoading(false);
      setShowSubmitModal(false);
    }
  }, [session, answers, token, questions, timeLeft]);

  // Start camera when exam begins
  useEffect(() => {
    if (phase !== 'exam') return;
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 360 } });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.warn('Camera error:', err);
      }
    }
    startCamera();
  }, [phase, videoRef]);

  /* ──────────────────────────────────────────────────────────────── */
  /* START SCREEN                                                    */
  /* ──────────────────────────────────────────────────────────────── */
  if (phase === 'start') return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)', padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '48px 40px', maxWidth: '520px', width: '100%', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}>📝</div>
        <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>Ready to Begin?</h2>
        <p style={{ color: '#64748b', marginBottom: '8px', fontSize: '0.95rem' }}>AI Proctor Guardian will monitor you throughout the exam.</p>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', fontSize: '0.85rem', color: '#dc2626', fontWeight: 600, marginBottom: '28px', lineHeight: 1.5 }}>
          ⚠️ Do not switch tabs or leave this window during the exam. All violations are automatically recorded.
        </div>
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', color: '#dc2626', fontSize: '0.85rem', fontWeight: 600, marginBottom: '16px' }}>{error}</div>}
        <button onClick={startExam} disabled={loading}
          style={{ width: '100%', padding: '16px', fontSize: '1rem', fontWeight: 700, background: loading ? '#94a3b8' : 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 8px 24px rgba(59,130,246,0.4)', transition: 'all 0.2s', fontFamily: 'inherit' }}>
          {loading ? 'Launching Exam…' : 'Start Proctored Exam →'}
        </button>
      </div>
    </div>
  );

  /* ──────────────────────────────────────────────────────────────── */
  /* RESULT SCREEN                                                   */
  /* ──────────────────────────────────────────────────────────────── */
  if (phase === 'result' && result) {
    const pct    = result.percentage ?? Math.round((result.score / Math.max(result.total, 1)) * 100);
    const passed = pct >= 60;
    const mins   = result.timeTaken ? Math.floor(result.timeTaken / 60) : null;
    const secs   = result.timeTaken ? result.timeTaken % 60 : null;
    const qs     = result.questions || [];
    const userAns = result.answers  || {};
    const correct = qs.filter(q => {
      const qkey = String(q.questionId ?? q.id);
      const ca = (q.correctAnswer || q.correct_answer || '').toUpperCase();
      return (userAns[qkey] || '').toUpperCase() === ca;
    }).length;
    const wrong = qs.filter(q => {
      const qkey = String(q.questionId ?? q.id);
      const ca = (q.correctAnswer || q.correct_answer || '').toUpperCase();
      const my = (userAns[qkey] || '').toUpperCase();
      return my && my !== ca;
    }).length;
    const skipped = qs.length - correct - wrong;

    return (
      <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 24px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '760px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div style={{ background: passed ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' : 'linear-gradient(135deg,#fef2f2,#fee2e2)', border: `2px solid ${passed ? '#86efac' : '#fca5a5'}`, borderRadius: '20px', padding: '36px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '8px' }}>{pct >= 90 ? '🏆' : pct >= 75 ? '🎉' : passed ? '✅' : '❌'}</div>
            <div style={{ fontSize: '3.5rem', fontWeight: 900, color: passed ? '#15803d' : '#dc2626', lineHeight: 1 }}>
              {result.score} <span style={{ fontSize: '1.8rem', color: '#64748b', fontWeight: 600 }}>/ {result.total}</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: passed ? '#15803d' : '#dc2626', margin: '10px 0 4px' }}>{pct}% — {passed ? 'PASSED' : 'FAILED'}</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#475569' }}>
              {pct >= 90 ? 'Excellent! Outstanding performance.' : pct >= 75 ? 'Great job! Well done.' : passed ? 'You passed. Keep it up!' : 'You did not pass. Review and try again.'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
            {[
              { label: 'Correct', value: correct, color: '#10b981', bg: '#f0fdf4' },
              { label: 'Wrong',   value: wrong,   color: '#ef4444', bg: '#fef2f2' },
              { label: 'Skipped', value: skipped, color: '#f59e0b', bg: '#fffbeb' },
              { label: 'Time', value: mins !== null ? `${mins}m ${secs}s` : '—', color: '#6366f1', bg: '#f5f3ff' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: '14px', padding: '18px 10px', textAlign: 'center', border: `1px solid ${s.color}33` }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {qs.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>📋 Question Review</h3>
              </div>
              {qs.map((q, i) => {
                const qkey = String(q.questionId ?? q.id ?? i);
                const ca   = (q.correctAnswer || q.correct_answer || '').toUpperCase();
                const myAns = (userAns[qkey] || '').toUpperCase();
                const isCorr = myAns === ca, isSkip = !myAns;
                const qText = q.questionText || q.question_text || `Question ${i + 1}`;
                const opts = { A: q.optionA || q.option_a || '', B: q.optionB || q.option_b || '', C: q.optionC || q.option_c || '', D: q.optionD || q.option_d || '' };
                return (
                  <div key={qkey} style={{ padding: '16px 20px', borderBottom: i < qs.length - 1 ? '1px solid #f1f5f9' : 'none', background: isCorr ? '#f0fdf4' : isSkip ? '#fffbeb' : '#fef2f2' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0, background: isCorr ? '#10b981' : isSkip ? '#f59e0b' : '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>
                        {isCorr ? '✓' : isSkip ? '–' : '✗'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Q{i + 1}</span>
                        <p style={{ margin: '2px 0 0', fontSize: '0.87rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.4 }}>{qText}</p>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', paddingLeft: '36px' }}>
                      {['A','B','C','D'].filter(l => opts[l]).map(letter => {
                        const isCorrectOpt = letter === ca, isMyOpt = letter === myAns;
                        let bg = '#fff', border = '#e2e8f0', color = '#475569';
                        if (isCorrectOpt)             { bg = '#f0fdf4'; border = '#86efac'; color = '#15803d'; }
                        if (isMyOpt && !isCorrectOpt) { bg = '#fef2f2'; border = '#fca5a5'; color = '#dc2626'; }
                        return (
                          <div key={letter} style={{ padding: '7px 12px', borderRadius: '8px', fontSize: '0.8rem', background: bg, border: `1.5px solid ${border}`, color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong>{letter}.</strong> {opts[letter]}
                            {isCorrectOpt && <span style={{ marginLeft: 'auto' }}>✓</span>}
                            {isMyOpt && !isCorrectOpt && <span style={{ marginLeft: 'auto' }}>✗</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => { setPhase('start'); setAnswers({}); setMarked(new Set()); setQuestions([]); setSession(null); setResult(null); setTimeLeft(EXAM_DURATION); }}
              style={{ flex: 1, padding: '14px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', color: '#334155', fontFamily: 'inherit' }}>
              🔄 Retake Exam
            </button>
            <button onClick={() => { if (onDone) onDone(); else window.location.reload(); }}
              style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', border: 'none', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', color: '#fff', fontFamily: 'inherit', boxShadow: '0 6px 20px rgba(59,130,246,0.35)' }}>
              🏠 Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* Loading */
  if (phase === 'exam' && questions.length === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f0f4f8' }}>
      <div style={{ textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>⏳</div>
        <div style={{ fontWeight: 600 }}>Loading questions…</div>
      </div>
    </div>
  );

  /* ──────────────────────────────────────────────────────────────── */
  /* LIVE EXAM UI                                                    */
  /* ──────────────────────────────────────────────────────────────── */
  const q           = questions[current];
  if (!q) return null;

  const isLowTime    = timeLeft < 5 * 60;
  const { h, m: mm, s: ss } = formatHMS(timeLeft);
  const questionText = q.questionText || q.question_text || '';
  const optKey       = (letter) => q[`option${letter}`] || q[`option_${letter.toLowerCase()}`] || '';
  // Always use string key so answers map is consistent across store/read/submit
  const questionKey  = String(q.questionId ?? q.id ?? current);
  const isMarked     = marked.has(current);

  const answeredCount = Object.keys(answers).length;
  const markedCount   = marked.size;
  const notAnswered   = questions.length - answeredCount;

  // Proctoring data (from props or defaults)
  const pr            = procResult || {};
  const suspScore     = pr.suspicion_score ?? 0;
  const faceCount     = pr.face_count ?? 1;
  const gazeDir       = pr.looking_direction ?? 'centered';
  const phoneDetected = pr.phone_detected ?? false;
  const suspColor     = suspScore === 0 ? '#10b981' : suspScore < 50 ? '#f59e0b' : '#ef4444';

  // Exam info from session
  const totalQs    = questions.length;
  const totalMarks = examMeta?.totalMarks || totalQs;
  const duration   = examMeta?.durationMinutes
    ? (examMeta.durationMinutes >= 60
        ? `${Math.floor(examMeta.durationMinutes / 60)} Hour${examMeta.durationMinutes >= 120 ? 's' : ''}`
        : `${examMeta.durationMinutes} Minutes`)
    : '45 Minutes';
  const subject    = examMeta?.subject || examMeta?.title || q.subject || 'General';
  const examType   = examMeta?.questionType || 'MCQ';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f1f5f9', fontFamily: "'Inter', 'Segoe UI', sans-serif", overflow: 'hidden' }}>

      {/* ══ TOP HEADER ══════════════════════════════════════════════ */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 20px', height: '64px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', zIndex: 10 }}>
        {/* Left: exam title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>📋</div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{examMeta?.title || examMeta?.examTitle || 'Live Examination'}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              {examMeta?.courseCode && <><span>{examMeta.courseCode}</span><span>|</span></>}
              <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Center: Timer */}
        <div style={{ background: isLowTime ? '#fef2f2' : '#fff5f5', border: `1.5px solid ${isLowTime ? '#fca5a5' : '#fecdd3'}`, borderRadius: '14px', padding: '8px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#dc2626', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
            <span>⏱</span> Time Remaining
          </div>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-start' }}>
            {[{ val: h, label: 'Hours' }, { val: mm, label: 'Minutes' }, { val: ss, label: 'Seconds' }].map((t, i) => (
              <React.Fragment key={t.label}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: isLowTime ? '#dc2626' : '#1e293b', lineHeight: 1, fontVariantNumeric: 'tabular-nums', minWidth: '2ch' }}>{t.val}</div>
                  <div style={{ fontSize: '0.5rem', color: '#94a3b8', fontWeight: 600 }}>{t.label}</div>
                </div>
                {i < 2 && <div style={{ fontSize: '1.4rem', fontWeight: 900, color: isLowTime ? '#dc2626' : '#334155', lineHeight: 1.1 }}>:</div>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Right: End Exam */}
        <button onClick={() => setShowSubmitModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#fff', color: '#dc2626', border: '1.5px solid #fca5a5', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
          onMouseOver={e => { e.currentTarget.style.background = '#fef2f2'; }}
          onMouseOut={e => { e.currentTarget.style.background = '#fff'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          End Exam
        </button>
      </header>

      {/* ══ BODY (3-column) ════════════════════════════════════════ */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── LEFT SIDEBAR: Question Navigation ─────────────────── */}
        <aside style={{ width: '185px', minWidth: '185px', background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '14px 10px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>Question Navigation</div>

          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '14px' }}>
            {[
              { color: '#22c55e', border: '#22c55e', label: 'Answered' },
              { color: '#fff',    border: '#94a3b8', label: 'Not Answered' },
              { color: '#3b82f6', border: '#3b82f6', label: 'Current Question' },
              { color: '#ef4444', border: '#ef4444', label: 'Marked for Review' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '3px', flexShrink: 0, background: item.color, border: `1.5px solid ${item.border}` }} />
                <span style={{ fontSize: '0.66rem', color: '#475569', fontWeight: 500 }}>{item.label}</span>
              </div>
            ))}
          </div>

          <div style={{ height: '1px', background: '#f1f5f9', marginBottom: '10px' }} />

          {/* Question grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '4px', marginBottom: '12px' }}>
            {questions.map((qItem, idx) => {
              const qk = String(qItem.questionId ?? qItem.id ?? idx);
              const status = getQStatus(idx, current, answers, qk, marked);
              const sc = Q_STATUS_COLORS[status];
              return (
                <button key={idx} onClick={() => setCurrent(idx)}
                  style={{ width: '28px', height: '28px', borderRadius: '5px', background: sc.bg, color: sc.color, border: `1.5px solid ${sc.border}`, fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s' }}>
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {markedCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '7px', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px' }}>🚩</span>
              <span style={{ fontSize: '0.66rem', color: '#dc2626', fontWeight: 700 }}>Marked for Review ({markedCount})</span>
            </div>
          )}

          <div style={{ flex: 1 }} />

          <button onClick={() => setShowSubmitModal(true)}
            style={{ width: '100%', padding: '11px 6px', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(59,130,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            Submit Exam
          </button>
        </aside>

        {/* ── CENTER: Question Area ──────────────────────────────── */}
        <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '18px' }}>

          {/* Question header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>Question {current + 1} of {questions.length}</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe' }}>{q.questionType || 'MCQ'}</span>
              <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>{q.marks || 1} Mark{(q.marks || 1) > 1 ? 's' : ''}</span>
              <button
                onClick={() => { setMarked(prev => { const next = new Set(prev); if (next.has(current)) next.delete(current); else next.add(current); return next; }); }}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, background: isMarked ? '#fef2f2' : '#fff', color: isMarked ? '#dc2626' : '#64748b', border: `1px solid ${isMarked ? '#fca5a5' : '#cbd5e1'}`, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                🔖 {isMarked ? 'Marked' : 'Mark for Review'}
              </button>
            </div>
          </div>

          {/* Question card */}
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '22px 24px', marginBottom: '14px' }}>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.7, margin: 0 }}>{questionText}</p>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
            {['A', 'B', 'C', 'D'].map(letter => {
              const optText    = optKey(letter);
              if (!optText) return null;
              const isSelected = answers[questionKey] === letter;
              return (
                <button key={letter}
                  onClick={() => setAnswers(p => ({ ...p, [questionKey]: letter }))}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '13px 18px', background: isSelected ? '#eff6ff' : '#fff', border: `1.5px solid ${isSelected ? '#3b82f6' : '#e2e8f0'}`, borderRadius: '12px', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit', textAlign: 'left', color: '#1e293b', transition: 'all 0.15s', boxShadow: isSelected ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none' }}
                  onMouseOver={e => { if (!isSelected) { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#94a3b8'; } }}
                  onMouseOut={e => { if (!isSelected) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; } }}
                >
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0, border: `2px solid ${isSelected ? '#3b82f6' : '#cbd5e1'}`, background: isSelected ? '#3b82f6' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                    {isSelected && <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#fff' }} />}
                  </div>
                  <span><strong style={{ marginRight: '8px', color: isSelected ? '#3b82f6' : '#64748b' }}>{letter}.</strong>{optText}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={() => setAnswers(p => { const n = { ...p }; delete n[questionKey]; return n; })}
              style={{ padding: '10px 18px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', color: '#475569', fontFamily: 'inherit' }}>
              Clear Answer
            </button>
            <div style={{ flex: 1 }} />
            {current > 0 && (
              <button onClick={() => setCurrent(c => c - 1)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.83rem', fontWeight: 700, cursor: 'pointer', color: '#334155', fontFamily: 'inherit', transition: 'border-color 0.15s' }}
                onMouseOver={e => e.currentTarget.style.borderColor = '#94a3b8'}
                onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                ← Previous
              </button>
            )}
            {current < questions.length - 1 ? (
              <button onClick={() => setCurrent(c => c + 1)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '0.83rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(59,130,246,0.35)', transition: 'opacity 0.15s' }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                Next Question →
              </button>
            ) : (
              <button onClick={() => setShowSubmitModal(true)} disabled={loading}
                style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '0.83rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(16,185,129,0.35)' }}>
                {loading ? 'Submitting…' : '✅ Submit Exam'}
              </button>
            )}
          </div>

          {/* Quick nav grid */}
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '14px 16px', marginTop: '18px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span>Question Navigation Quick View</span>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.68rem', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '9px', height: '9px', borderRadius: '2px', background: '#22c55e', display: 'inline-block' }} /> Answered ({answeredCount})</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '9px', height: '9px', borderRadius: '2px', background: '#fff', border: '1px solid #94a3b8', display: 'inline-block' }} /> Not Answered ({notAnswered})</span>
                {markedCount > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '9px', height: '9px', borderRadius: '2px', background: '#ef4444', display: 'inline-block' }} /> Marked ({markedCount})</span>}
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {questions.map((qItem, idx) => {
                const qk = String(qItem.questionId ?? qItem.id ?? idx);
                const status = getQStatus(idx, current, answers, qk, marked);
                const sc = Q_STATUS_COLORS[status];
                return (
                  <button key={idx} onClick={() => setCurrent(idx)}
                    style={{ width: '36px', height: '36px', borderRadius: '7px', background: sc.bg, color: sc.color, border: `1.5px solid ${sc.border}`, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s' }}>
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </main>

        {/* ── RIGHT SIDEBAR: Live Proctoring ─────────────────────── */}
        <aside style={{ width: '275px', minWidth: '275px', background: '#fff', borderLeft: '1px solid #e2e8f0', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

          {/* Camera section */}
          <div style={{ padding: '12px 12px 10px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>Live Proctoring</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.65rem', fontWeight: 700, color: '#10b981' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'livePulse 1.5s infinite' }} />
                AI Proctor Active
              </div>
            </div>

            <div ref={wrapRef} style={{ position: 'relative', background: '#0f172a', borderRadius: '10px', overflow: 'hidden', aspectRatio: '4/3' }}>
              <video ref={videoRef} autoPlay muted playsInline style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
              <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
              <button style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '5px', padding: '4px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                  <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                </svg>
              </button>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.65)', padding: '5px 8px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.62rem', fontWeight: 700 }}>
                <span style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '3px' }}>📷 Camera: <span style={{ color: '#22c55e' }}>ON</span></span>
                <span style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '3px' }}>🎙 Mic: <span style={{ color: '#22c55e' }}>ON</span></span>
                <span style={{ marginLeft: 'auto', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '3px' }}>📶 Good Signal</span>
              </div>
            </div>
          </div>

          {/* Suspicion Score */}
          <div style={{ margin: '10px 10px 0', border: `1.5px solid ${suspScore > 0 ? '#ef4444' : '#22c55e'}`, borderRadius: '10px', padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '7px', fontSize: '0.65rem', fontWeight: 700, color: '#10b981' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> AI Proctor Active
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '7px' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#334155', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Suspicion Score</span>
              <span style={{ fontSize: '1rem', fontWeight: 900, color: suspColor }}>{suspScore} / 100</span>
            </div>
            <div style={{ height: '5px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
              <div style={{ width: `${suspScore}%`, height: '100%', background: suspColor, transition: 'width 0.4s ease', borderRadius: '4px' }} />
            </div>
            {[
              { key: 'Faces detected', value: `${faceCount} face${faceCount !== 1 ? 's' : ''}`, ok: faceCount === 1 },
              { key: 'Gaze direction', value: gazeDir, ok: gazeDir === 'centered' || gazeDir === 'connecting...' },
              { key: 'Phone visible',  value: phoneDetected ? 'YES — ALERT' : 'No', ok: !phoneDetected },
            ].map(row => (
              <div key={row.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f8fafc' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{row.key}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: '20px', background: row.ok ? '#f0fdf4' : '#fef2f2', color: row.ok ? '#16a34a' : '#dc2626', border: `1px solid ${row.ok ? '#bbf7d0' : '#fecaca'}` }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* AI Detection Status */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>AI Detection Status</span>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '2px 7px', borderRadius: '20px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>No Violation</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {[
                { icon: '👤', label: 'Face Detected',      ok: faceCount >= 1 },
                { icon: '📱', label: 'Mobile Phone',       ok: !phoneDetected },
                { icon: '👥', label: 'No Multiple People', ok: faceCount <= 1 },
                { icon: '👁', label: 'Looking Away',       ok: gazeDir === 'centered' || gazeDir === 'connecting...' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 7px', background: '#f8fafc', borderRadius: '7px', border: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '12px' }}>{item.icon}</span>
                  <span style={{ fontSize: '0.62rem', color: '#475569', fontWeight: 500, flex: 1, lineHeight: 1.2 }}>{item.label}</span>
                  <span style={{ fontSize: '12px' }}>{item.ok ? '✅' : '❌'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Exam Information */}
          <div style={{ padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px' }}>ℹ️</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>Exam Information</span>
            </div>
            {[
              { label: 'Total Questions', value: totalQs },
              { label: 'Total Marks',     value: totalMarks },
              { label: 'Time Duration',   value: duration },
              { label: 'Subject',         value: subject },
              { label: 'Exam Type',       value: examType },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f8fafc' }}>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500 }}>{row.label}</span>
                <span style={{ fontSize: '0.7rem', color: '#334155', fontWeight: 700 }}>{row.value}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* ══ SUBMIT MODAL ══════════════════════════════════════════ */}
      {showSubmitModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '36px 32px', maxWidth: '420px', width: '90%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            <div style={{ fontSize: '48px', marginBottom: '14px' }}>📤</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>Submit Exam?</h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 4px' }}>
              You have answered <strong style={{ color: '#3b82f6' }}>{answeredCount}</strong> of <strong>{questions.length}</strong> questions.
            </p>
            {notAnswered > 0 && (
              <p style={{ color: '#f59e0b', fontSize: '0.82rem', fontWeight: 600, margin: '4px 0 16px' }}>⚠️ {notAnswered} question{notAnswered > 1 ? 's' : ''} still unanswered.</p>
            )}
            <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 22px' }}>This action cannot be undone. Make sure you have reviewed all answers.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowSubmitModal(false)}
                style={{ flex: 1, padding: '13px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', color: '#334155', fontFamily: 'inherit' }}>
                Review Answers
              </button>
              <button onClick={submitExam} disabled={loading}
                style={{ flex: 1, padding: '13px', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(16,185,129,0.4)', opacity: loading ? 0.8 : 1 }}>
                {loading ? 'Submitting…' : 'Submit Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}

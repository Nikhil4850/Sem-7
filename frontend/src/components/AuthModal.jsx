import React, { useState } from 'react';
import { API } from '../api';

export default function AuthModal({ isOpen, initialRole, onClose, onLoginSuccess }) {
  const [role, setRole] = useState(initialRole || 'student');
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        const res = await fetch(API.register, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password, fullName, role: 'student' })
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.detail || data.message || 'Registration failed');
        } else {
          setMode('login');
          setError('Registration successful! Please login.');
        }
        setLoading(false);
        return;
      }

      const res = await fetch(API.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || data.message || 'Invalid credentials');
        setLoading(false);
        return;
      }

      onLoginSuccess({
        token: data.Token || data.token || data.access_token,
        role: (data.Role || data.role || '').toLowerCase(),
        username: data.Username || data.username || username
      });
      onClose();
    } catch {
      setError('Cannot reach server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(8, 12, 20, 0.85)', backdropFilter: 'blur(16px)',
      zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
    }}>
      <div className="glass" style={{ width: '100%', maxWidth: '460px', padding: '36px', position: 'relative' }}>

        <button style={{
          position: 'absolute', top: '16px', right: '16px', background: 'none',
          border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer'
        }} onClick={onClose}>&times;</button>

        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px', marginBottom: '24px' }}>
          <button
            className={`nav-btn ${role === 'student' ? 'active' : ''}`}
            style={{ flex: 1 }}
            onClick={() => { setRole('student'); setError(''); }}
          >
            Student Portal
          </button>
          <button
            className={`nav-btn ${role === 'teacher' ? 'active' : ''}`}
            style={{ flex: 1 }}
            onClick={() => { setRole('teacher'); setMode('login'); setError(''); }}
          >
            Teacher / Admin
          </button>
        </div>

        <h2 style={{ fontSize: '1.4rem', marginBottom: '6px', textAlign: 'center' }}>
          {role === 'student' ? (mode === 'login' ? 'Student Sign-In' : 'Student Registration') : 'Teacher / Admin Sign-In'}
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', marginBottom: '20px' }}>
          {role === 'student' ? 'Access proctored exams and course dashboard' : 'Access live proctoring & quiz creator'}
        </p>

        {error && (
          <div className="error-banner" style={{ textAlign: 'center', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Username</label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {mode === 'register' && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Email</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="next-btn" style={{ width: '100%', padding: '12px' }} disabled={loading}>
            {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Register')}
          </button>
        </form>

        {role === 'student' && (
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
            {mode === 'login' ? (
              <span>Need an account? <button style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setMode('register'); setError(''); }}>Register</button></span>
            ) : (
              <span>Already registered? <button style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setMode('login'); setError(''); }}>Sign In</button></span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

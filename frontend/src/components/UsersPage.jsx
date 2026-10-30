import React, { useState, useEffect } from 'react';
import { API, BASE_URL } from '../api';

const ROLE_COLORS = {
  admin:         { bg: '#fef3c7', color: '#92400e', label: 'Admin' },
  teacher:       { bg: '#ede9fe', color: '#5b21b6', label: 'Teacher' },
  student:       { bg: '#dcfce7', color: '#166534', label: 'Student' },
  administrator: { bg: '#fef3c7', color: '#92400e', label: 'Administrator' },
};

const BLANK = { username: '', email: '', fullName: '', password: '', role: 'student' };
const lbl   = { color: '#334155', fontSize: '0.83rem', fontWeight: 600, display: 'block', marginBottom: '5px' };

export default function UsersPage({ token }) {
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [filterRole,  setFilterRole]  = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [newRole,     setNewRole]     = useState('');
  const [saving,      setSaving]      = useState(false);
  const [showForm,    setShowForm]    = useState(false);
  const [form,        setForm]        = useState(BLANK);
  const [registering, setRegistering] = useState(false);
  const [msg,         setMsg]         = useState({ text: '', type: 'success' });

  function flash(text, type = 'success') {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: 'success' }), 4000);
  }

  function fetchUsers() {
    setLoading(true);
    fetch(`${BASE_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setUsers(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => { setUsers([]); setLoading(false); });
  }

  useEffect(() => { fetchUsers(); }, []); // eslint-disable-line

  async function registerUser(e) {
    e.preventDefault();
    setRegistering(true);
    try {
      const res  = await fetch(API.register, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { flash(data.message || data.detail || `Error ${res.status}`, 'error'); }
      else {
        flash(`"${form.username}" registered as ${form.role}.`);
        setForm(BLANK);
        setShowForm(false);
        fetchUsers();
      }
    } catch (err) { flash(err.message, 'error'); }
    finally { setRegistering(false); }
  }

  async function updateRole(username) {
    setSaving(true);
    try {
      const res = await fetch(API.userRole(username), {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error();
      flash(`Role updated for ${username}`);
      setEditingUser(null);
      fetchUsers();
    } catch { flash('Failed to update role.', 'error'); }
    finally { setSaving(false); }
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (!q || (u.username||'').toLowerCase().includes(q) || (u.fullName||'').toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q))
      && (filterRole === 'all' || u.role === filterRole);
  });

  const counts = {
    total:   users.length,
    admin:   users.filter(u => u.role === 'admin' || u.role === 'administrator').length,
    teacher: users.filter(u => u.role === 'teacher').length,
    student: users.filter(u => u.role === 'student').length,
  };

  const rs = r => ROLE_COLORS[r] || { bg: '#f1f5f9', color: '#475569', label: r };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>User Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>View all users and register new students or teachers</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchUsers} className="btn btn-secondary">↻ Refresh</button>
          <button onClick={() => { setShowForm(p => !p); setForm(BLANK); }} className="btn btn-primary">
            {showForm ? 'Cancel' : '+ Register User'}
          </button>
        </div>
      </div>

      {/* Flash */}
      {msg.text && (
        <div style={{
          padding: '11px 16px', marginBottom: '16px', borderRadius: '8px',
          fontSize: '0.88rem', fontWeight: 600,
          background: msg.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color:      msg.type === 'error' ? '#b91c1c' : '#15803d',
          border:    `1px solid ${msg.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
        }}>
          {msg.type === 'error' ? '✗ ' : '✓ '}{msg.text}
        </div>
      )}

      {/* Register form */}
      {showForm && (
        <form onSubmit={registerUser} className="card" style={{ padding: '28px', marginBottom: '24px', borderLeft: '4px solid #0066ff' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '18px' }}>Register New User</h3>

          {/* Role picker */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {[['student','Student'],['teacher','Teacher'],['administrator','Admin']].map(([val, label]) => (
              <button key={val} type="button" onClick={() => setForm(p => ({ ...p, role: val }))}
                style={{
                  padding: '8px 18px', borderRadius: '8px', cursor: 'pointer',
                  border: `1.5px solid ${form.role === val ? '#0066ff' : '#e2e8f0'}`,
                  background: form.role === val ? '#eff6ff' : '#fff',
                  color: form.role === val ? '#0066ff' : '#64748b',
                  fontWeight: 600, fontSize: '0.85rem',
                }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={lbl}>Full Name</label>
              <input required className="form-input" placeholder="e.g. John Doe"
                value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Username</label>
              <input required className="form-input" placeholder="e.g. john_doe"
                value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Email</label>
              <input required type="email" className="form-input" placeholder="john@example.com"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Password</label>
              <input required type="password" className="form-input" placeholder="Min 8 characters"
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary" disabled={registering}>
              {registering ? 'Registering...' : `Register ${form.role === 'student' ? 'Student' : form.role === 'teacher' ? 'Teacher' : 'Admin'}`}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Users', value: counts.total,   color: '#0066ff' },
          { label: 'Admins',      value: counts.admin,   color: '#f59e0b' },
          { label: 'Teachers',    value: counts.teacher, color: '#8b5cf6' },
          { label: 'Students',    value: counts.student, color: '#10b981' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: '18px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" className="form-input" style={{ flex: 1, minWidth: '200px' }}
          placeholder="Search by name, username or email..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-select" style={{ width: '160px' }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="administrator">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>All Users</h3>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{filtered.length} users</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="saas-table">
            <thead>
              <tr>
                <th>#</th><th>Name</th><th>Username</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No users found.</td></tr>
              ) : filtered.map((u, i) => {
                const style  = rs(u.role);
                const isEdit = editingUser === u.username;
                return (
                  <tr key={u.userId || u.username}>
                    <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', color: '#0066ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                          {(u.fullName || u.username || '?')[0].toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem' }}>{u.fullName || u.username}</span>
                      </div>
                    </td>
                    <td style={{ color: '#475569', fontSize: '0.85rem' }}>@{u.username}</td>
                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{u.email || '—'}</td>
                    <td>
                      {isEdit ? (
                        <select className="form-select" style={{ width: '130px', padding: '4px 8px', fontSize: '0.8rem' }}
                          value={newRole} onChange={e => setNewRole(e.target.value)}>
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="administrator">Admin</option>
                        </select>
                      ) : (
                        <span style={{ background: style.bg, color: style.color, padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {style.label}
                        </span>
                      )}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      {isEdit ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                            onClick={() => updateRole(u.username)} disabled={saving}>{saving ? '…' : 'Save'}</button>
                          <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                            onClick={() => setEditingUser(null)}>Cancel</button>
                        </div>
                      ) : (
                        <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                          onClick={() => { setEditingUser(u.username); setNewRole(u.role); }}>
                          Change Role
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

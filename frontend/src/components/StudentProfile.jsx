import React, { useState, useEffect, useRef } from 'react';
import { BASE_URL } from '../api';

export default function StudentProfile({ user, token, onProfileUpdate }) {
  const [profile, setProfile]   = useState(null);
  const [editing, setEditing]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [msg,     setMsg]       = useState(null);
  const [form,    setForm]      = useState({});
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const flash = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  };

  useEffect(() => {
    fetch(`${BASE_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => {
        if (r.status === 401) throw new Error('Session expired. Please log out and log in again.');
        if (!r.ok) throw new Error(`Server error (${r.status})`);
        return r.json();
      })
      .then(data => {
        setProfile(data);
        setForm({
          fullName:    data.fullName    || data.FullName    || '',
          email:       data.email       || data.Email       || '',
          department:  data.department  || data.Department  || '',
          yearOfStudy: data.yearOfStudy || data.YearOfStudy || '',
          phone:       data.phone       || data.Phone       || '',
        });
      })
      .catch(err => flash(err.message || 'Failed to load profile.', 'error'));
  }, [token]);

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          FullName:    form.fullName,
          Email:       form.email,
          Department:  form.department,
          YearOfStudy: form.yearOfStudy,
          Phone:       form.phone,
        })
      });
      if (res.ok) {
        setProfile(p => ({ ...p, ...form }));
        setEditing(false);
        flash('Profile updated successfully.');
        if (onProfileUpdate) onProfileUpdate({ fullName: form.fullName, email: form.email });
      } else {
        flash('Failed to update profile.', 'error');
      }
    } catch {
      flash('Network error.', 'error');
    } finally {
      setSaving(false);
    }
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { flash('Photo must be under 5MB.', 'error'); return; }
    if (!file.type.startsWith('image/')) { flash('Please select an image file.', 'error'); return; }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      setUploading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/profile/photo`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ PhotoBase64: base64 })
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(p => ({ ...p, profilePhoto: data.photoUrl, ProfilePhoto: data.photoUrl }));
          flash('Photo updated successfully.');
        } else {
          flash('Failed to upload photo.', 'error');
        }
      } catch {
        flash('Upload failed.', 'error');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  const photo = profile?.ProfilePhoto || profile?.profilePhoto;
  const name  = profile?.FullName     || profile?.fullName     || user?.fullName || user?.username || 'Student';
  const email = profile?.Email        || profile?.email        || user?.email    || '';
  const dept  = profile?.Department   || profile?.department   || '';
  const year  = profile?.YearOfStudy  || profile?.yearOfStudy  || '';
  const phone = profile?.Phone        || profile?.phone        || '';

  const inp  = { width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', color: '#0f172a', background: '#fff', boxSizing: 'border-box' };
  const lbl  = { fontSize: '0.78rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '5px' };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>

      {/* Flash message */}
      {msg && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 600,
          background: msg.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color:      msg.type === 'success' ? '#15803d' : '#dc2626',
          border:    `1px solid ${msg.type === 'success' ? '#bbf7d0' : '#fecaca'}` }}>
          {msg.type === 'success' ? '✓ ' : '✗ '}{msg.text}
        </div>
      )}

      {/* Profile card */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8edf2', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>

        {/* Avatar + photo upload */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: '88px', height: '88px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #e2e8f0', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {photo
                ? <img src={photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#4f8ef7' }}>{name[0]?.toUpperCase()}</span>
              }
            </div>
            {/* Upload overlay */}
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ position: 'absolute', bottom: 0, right: 0, width: '28px', height: '28px', borderRadius: '50%', background: '#4f8ef7', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '13px' }}
              title="Change photo">
              {uploading ? '⏳' : '📷'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
          </div>

          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{name}</h2>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{email}</div>
            {dept && <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>{dept} {year && `· ${year}`}</div>}
          </div>

          {!editing && (
            <button onClick={() => setEditing(true)}
              style={{ marginLeft: 'auto', padding: '8px 18px', background: '#eff6ff', color: '#4f8ef7', border: '1.5px solid #bfdbfe', borderRadius: '8px', fontSize: '0.83rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              ✏️ Edit
            </button>
          )}
        </div>

        {!editing ? (
          /* Read-only view */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', border: '1px solid #f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
            {[
              { label: 'Username',    value: profile?.Username    || profile?.username    || user?.username },
              { label: 'Full Name',   value: name },
              { label: 'Email',       value: email },
              { label: 'Department',  value: dept  || '—' },
              { label: 'Year',        value: year  || '—' },
              { label: 'Phone',       value: phone || '—' },
              { label: 'Role',        value: (profile?.Role || profile?.role || user?.role || '').toUpperCase() },
              { label: 'Member Since',value: profile?.CreatedAt || profile?.createdAt ? new Date(profile.CreatedAt || profile.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—' },
            ].map((row, i, arr) => (
              <div key={row.label} style={{ display: 'flex', padding: '11px 16px', background: i % 2 === 0 ? '#f8fafc' : '#fff', borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, minWidth: '120px' }}>{row.label}</span>
                <span style={{ fontSize: '0.83rem', color: '#0f172a', fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}
          </div>
        ) : (
          /* Edit form */
          <form onSubmit={saveProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={lbl}>Full Name</label>
                <input style={inp} value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Your full name" />
              </div>
              <div>
                <label style={lbl}>Email</label>
                <input style={inp} type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" />
              </div>
              <div>
                <label style={lbl}>Department</label>
                <input style={inp} value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} placeholder="e.g. Computer Engineering" />
              </div>
              <div>
                <label style={lbl}>Year of Study</label>
                <select style={inp} value={form.yearOfStudy} onChange={e => setForm(p => ({ ...p, yearOfStudy: e.target.value }))}>
                  <option value="">Select year</option>
                  <option value="FE - First Year">FE - First Year</option>
                  <option value="SE - Second Year">SE - Second Year</option>
                  <option value="TE - Third Year">TE - Third Year</option>
                  <option value="BE - Final Year">BE - Final Year</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={lbl}>Phone Number</label>
                <input style={inp} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={saving}
                style={{ padding: '10px 24px', background: saving ? '#94a3b8' : 'linear-gradient(135deg,#4f8ef7,#6366f1)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => setEditing(false)}
                style={{ padding: '10px 20px', background: '#fff', color: '#475569', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

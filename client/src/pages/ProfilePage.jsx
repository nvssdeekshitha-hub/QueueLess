import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Shield, Phone, Building, CheckCircle, AlertCircle } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    studentId: user?.studentId || '',
    department: user?.department || 'General',
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');
      await updateProfile(formData);
      setSuccessMsg('Profile updated successfully!');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary-900)' }}>
          My Account & Profile
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Manage your contact information, student credentials, and account details.
        </p>
      </div>

      {successMsg && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#dcfce7',
          border: '1px solid #bbf7d0',
          color: '#166534',
          borderRadius: 'var(--radius-md)',
          fontSize: '14px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          borderRadius: 'var(--radius-md)',
          fontSize: '14px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="card">
        {/* Profile Avatar Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '24px', borderBottom: '1px solid var(--border-light)', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-100)',
            color: 'var(--primary-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 800,
          }}>
            {user?.name?.charAt(0) || 'U'}
          </div>

          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800 }}>{user?.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: user?.role === 'admin' ? '#fef3c7' : user?.role === 'staff' ? '#ede9fe' : '#dcfce7',
                color: user?.role === 'admin' ? '#b45309' : user?.role === 'staff' ? '#6d28d9' : '#15803d',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}>
                {user?.role}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address (Read-only)</label>
            <input
              type="email"
              className="form-input"
              value={user?.email || ''}
              disabled
              style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Student ID / Roll No</label>
              <input
                type="text"
                name="studentId"
                className="form-input"
                placeholder="22CSE1042"
                value={formData.studentId}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <input
              type="text"
              name="department"
              className="form-input"
              value={formData.department}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ marginTop: '12px' }}
          >
            {submitting ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;

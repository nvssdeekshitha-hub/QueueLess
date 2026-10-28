import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage = () => {
  return (
    <div style={{
      minHeight: 'calc(100vh - 160px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '40px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
        }}>
          <ShieldAlert size={36} />
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-900)', marginBottom: '8px' }}>
          403 Access Denied
        </h1>

        <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '28px' }}>
          You do not have the required role or permissions to access this administrative section.
          Please check your account role or return to your designated portal.
        </p>

        <Link to="/" className="btn btn-primary btn-lg" style={{ justifyContent: 'center', width: '100%' }}>
          <ArrowLeft size={18} /> Return to Homepage
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;

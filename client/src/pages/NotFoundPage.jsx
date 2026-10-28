import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
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
          backgroundColor: 'var(--primary-100)',
          color: 'var(--primary-600)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
        }}>
          <Compass size={36} />
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary-900)', marginBottom: '8px' }}>
          404 — Page Not Found
        </h1>

        <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '28px' }}>
          The requested queue service URL or resource does not exist or may have been relocated.
        </p>

        <Link to="/" className="btn btn-primary btn-lg" style={{ justifyContent: 'center', width: '100%' }}>
          <ArrowLeft size={18} /> Back to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;

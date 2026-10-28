import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading...', size = 32 }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 20px',
      gap: '12px',
      color: 'var(--text-muted)',
    }}>
      <Loader2 size={size} className="spinner" style={{
        animation: 'spin 1s linear infinite',
        color: 'var(--primary-600)',
      }} />
      <span style={{ fontSize: '14px', fontWeight: 500 }}>{message}</span>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;

import React from 'react';
import { Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are currently no items to display in this list.',
  actionLabel,
  actionTo,
  onAction,
}) => {
  return (
    <div style={{
      padding: '48px 24px',
      textAlign: 'center',
      backgroundColor: 'white',
      borderRadius: 'var(--radius-lg)',
      border: '1px dashed var(--border-medium)',
      margin: '16px 0',
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: 'var(--bg-subtle)',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px auto',
      }}>
        <Icon size={28} />
      </div>

      <h4 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
        {title}
      </h4>

      <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 20px auto' }}>
        {description}
      </p>

      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn btn-primary btn-sm">
          {actionLabel}
        </Link>
      )}

      {actionLabel && onAction && !actionTo && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

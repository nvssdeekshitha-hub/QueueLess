import React from 'react';

export const StatusBadge = ({ status }) => {
  const normStatus = (status || 'booked').toLowerCase();

  const labels = {
    booked: 'Booked',
    waiting: 'Waiting',
    serving: 'Serving Now',
    completed: 'Completed',
    skipped: 'Skipped',
    cancelled: 'Cancelled',
  };

  return (
    <span className={`status-badge ${normStatus}`}>
      <span className="badge-dot"></span>
      {labels[normStatus] || status}
    </span>
  );
};

export default StatusBadge;

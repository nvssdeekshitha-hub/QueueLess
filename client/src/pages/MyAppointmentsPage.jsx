import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService } from '../services/appointmentService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import ConfirmationModal from '../components/common/ConfirmationModal';
import {
  Calendar,
  Clock,
  Printer,
  Compass,
  XCircle,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export const MyAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  // Cancel modal state
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentService.getAppointments({ limit: 50 });
      if (res.success) {
        setAppointments(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleOpenCancel = (apt) => {
    setSelectedAppointment(apt);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedAppointment) return;

    try {
      setCancelling(true);
      await appointmentService.cancelAppointment(selectedAppointment._id, cancelReason);
      setCancelModalOpen(false);
      setSelectedAppointment(null);
      // Refresh list
      fetchAppointments();
    } catch (err) {
      alert('Error cancelling appointment: ' + err.message);
    } finally {
      setCancelling(false);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (activeTab === 'active') return ['booked', 'waiting', 'serving'].includes(apt.status);
    if (activeTab === 'completed') return apt.status === 'completed';
    if (activeTab === 'cancelled') return apt.status === 'cancelled';
    return true; // all
  });

  return (
    <div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '28px',
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary-900)' }}>
            My Appointments & Bookings
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            View your scheduled appointment slots, live tokens, and print official receipts.
          </p>
        </div>

        <Link to="/book" className="btn btn-primary">
          <Calendar size={18} /> Book New Slot
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
        {['all', 'active', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="btn btn-sm"
            style={{
              textTransform: 'capitalize',
              backgroundColor: activeTab === tab ? 'var(--primary-600)' : 'transparent',
              color: activeTab === tab ? 'white' : 'var(--text-muted)',
              border: activeTab === tab ? '1px solid var(--primary-600)' : 'none',
              fontWeight: 700,
            }}
          >
            {tab} ({
              tab === 'all'
                ? appointments.length
                : tab === 'active'
                ? appointments.filter((a) => ['booked', 'waiting', 'serving'].includes(a.status)).length
                : appointments.filter((a) => a.status === tab).length
            })
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching your appointment records..." />
      ) : filteredAppointments.length === 0 ? (
        <EmptyState
          title={`No ${activeTab !== 'all' ? activeTab : ''} bookings found`}
          description="You don't have any appointments matching this category."
          actionLabel="Schedule Appointment"
          actionTo="/book"
        />
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Reference</th>
                <th>Service & Counter</th>
                <th>Date & Slot</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((apt) => {
                const canCancel = ['booked', 'waiting'].includes(apt.status);
                const isActive = ['booked', 'waiting', 'serving'].includes(apt.status);

                return (
                  <tr key={apt._id}>
                    <td>
                      <span className="token-badge" style={{ fontSize: '15px', color: 'var(--primary-800)' }}>
                        {apt.tokenNumber}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-muted)' }}>
                        {apt.bookingReference}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{apt.service?.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {apt.service?.counterName}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{apt.appointmentDate}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{apt.timeSlot}</div>
                    </td>
                    <td>
                      <StatusBadge status={apt.status} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {isActive && (
                          <Link
                            to={`/queue/${apt.service?._id}`}
                            className="btn btn-secondary btn-sm"
                            title="Track live queue"
                          >
                            <Compass size={14} />
                          </Link>
                        )}

                        <a
                          href={`/receipt/${apt.bookingReference}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          title="Print official receipt"
                        >
                          <Printer size={14} />
                        </a>

                        {canCancel && (
                          <button
                            onClick={() => handleOpenCancel(apt)}
                            className="btn btn-danger btn-sm"
                            title="Cancel booking"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      <ConfirmationModal
        isOpen={cancelModalOpen}
        title={`Cancel Booking ${selectedAppointment?.tokenNumber}`}
        message={`Are you sure you want to cancel your appointment for ${selectedAppointment?.service?.name} on ${selectedAppointment?.appointmentDate}? This will release your token and time slot.`}
        confirmLabel={cancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
        isDanger={true}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelModalOpen(false)}
      />
    </div>
  );
};

export default MyAppointmentsPage;

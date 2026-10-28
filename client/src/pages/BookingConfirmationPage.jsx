import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { queueService } from '../services/queueService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import {
  CheckCircle,
  Printer,
  Compass,
  Calendar,
  Clock,
  ArrowRight,
  Layers,
  MapPin,
} from 'lucide-react';

export const BookingConfirmationPage = () => {
  const { bookingReference } = useParams();
  const location = useLocation();

  const [appointment, setAppointment] = useState(location.state?.appointment || null);
  const [loading, setLoading] = useState(!appointment);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!appointment && bookingReference) {
      const fetchAppointment = async () => {
        try {
          setLoading(true);
          const res = await queueService.getTokenStatus(bookingReference);
          if (res.success && res.data) {
            setAppointment(res.data.appointment);
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchAppointment();
    }
  }, [bookingReference, appointment]);

  if (loading) {
    return <LoadingSpinner message="Retrieving your digital queue pass..." />;
  }

  if (error || !appointment) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h3>Could not load booking details</h3>
        <p style={{ color: 'var(--text-muted)' }}>{error || 'Booking reference not recognized.'}</p>
        <Link to="/dashboard" className="btn btn-secondary" style={{ marginTop: '16px' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
      {/* Success Badge */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#dcfce7',
          color: '#16a34a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px auto',
        }}>
          <CheckCircle size={32} />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-900)' }}>
          Appointment Booked Successfully!
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Your digital queue token has been generated and registered in the system.
        </p>
      </div>

      {/* Digital Ticket Pass Card */}
      <div className="card" style={{
        padding: '0',
        overflow: 'hidden',
        border: '2px solid var(--primary-500)',
        boxShadow: 'var(--shadow-xl)',
        marginBottom: '24px',
      }}>
        {/* Pass Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
          color: 'white',
          padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>
            Digital Queue Pass
          </div>
          <div style={{
            fontSize: '48px',
            fontWeight: 800,
            fontFamily: 'monospace',
            letterSpacing: '2px',
            margin: '8px 0',
          }}>
            {appointment.tokenNumber}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>
            Booking Reference: <strong style={{ fontFamily: 'monospace' }}>{appointment.bookingReference}</strong>
          </div>
        </div>

        {/* Pass Body */}
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Service Requested</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-900)' }}>
                {appointment.service?.name}
              </div>
            </div>
            <StatusBadge status={appointment.status} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', padding: '16px 0', borderTop: '1px dashed var(--border-medium)', borderBottom: '1px dashed var(--border-medium)' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} /> Scheduled Date
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '2px' }}>
                {appointment.appointmentDate}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> Time Slot
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '2px' }}>
                {appointment.timeSlot}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} /> Assigned Counter
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '2px' }}>
                {appointment.service?.counterName}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Student Name</div>
              <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '2px' }}>
                {appointment.user?.name || 'Student'}
              </div>
            </div>
          </div>

          {appointment.notes && (
            <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <strong>Notes:</strong> {appointment.notes}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Link
          to={`/queue/${appointment.service?._id || appointment.service}`}
          className="btn btn-primary btn-lg"
          style={{ justifyContent: 'center' }}
        >
          <Compass size={18} /> Track Live Queue Position
        </Link>

        <a
          href={`/receipt/${appointment.bookingReference}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary btn-lg"
          style={{ justifyContent: 'center' }}
        >
          <Printer size={18} /> View & Print Official SSR Receipt
        </a>

        <Link
          to="/dashboard"
          style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 600 }}
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;

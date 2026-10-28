import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { appointmentService } from '../services/appointmentService';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  Calendar,
  Clock,
  ArrowRight,
  Printer,
  Compass,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const UserDashboardPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserAppointments = async () => {
      try {
        setLoading(true);
        const res = await appointmentService.getAppointments({ limit: 10 });
        if (res.success) {
          setAppointments(res.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAppointments();
  }, []);

  // Find active appointment today (booked, waiting, or serving)
  const todayStr = new Date().toISOString().slice(0, 10);
  const activeToken = appointments.find(
    (apt) =>
      apt.appointmentDate === todayStr &&
      ['booked', 'waiting', 'serving'].includes(apt.status)
  );

  const upcomingAppointments = appointments.filter(
    (apt) => ['booked', 'waiting'].includes(apt.status) && apt !== activeToken
  );

  const pastAppointments = appointments.filter((apt) =>
    ['completed', 'cancelled', 'skipped'].includes(apt.status)
  );

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  return (
    <div>
      {/* Header Welcome Banner */}
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
            Welcome back, {user?.name}! 👋
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            {user?.department} • ID: {user?.studentId || 'N/A'} • Role: Student
          </p>
        </div>

        <Link to="/book" className="btn btn-primary">
          <Calendar size={18} /> Book New Appointment
        </Link>
      </div>

      {/* Active Token Callout Banner (if student has an active ticket today) */}
      {activeToken && (
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
          color: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          marginBottom: '32px',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px',
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}>
                <Sparkles size={14} /> Active Token for Today
              </div>

              <div style={{ fontSize: '42px', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '1px' }}>
                {activeToken.tokenNumber}
              </div>

              <div style={{ fontSize: '18px', fontWeight: 600, opacity: 0.95, marginTop: '4px' }}>
                {activeToken.service?.name}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>
                {activeToken.service?.counterName} • Slot: {activeToken.timeSlot}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link
                to={`/queue/${activeToken.service?._id || activeToken.service}`}
                className="btn btn-secondary btn-lg"
                style={{ backgroundColor: 'white', color: 'var(--primary-700)', fontWeight: 700 }}
              >
                <Compass size={18} /> Track Live Queue
              </Link>
              <a
                href={`/receipt/${activeToken.bookingReference}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: 'white', borderColor: 'transparent' }}
              >
                <Printer size={16} /> Print SSR Receipt
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Upcoming Bookings & Fast Navigation */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column: Upcoming appointments (2 cols) */}
        <div style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Upcoming Appointments</h3>
            <Link to="/appointments" style={{ fontSize: '13px', color: 'var(--primary-600)', fontWeight: 600 }}>
              View All ({appointments.length})
            </Link>
          </div>

          {upcomingAppointments.length === 0 && !activeToken ? (
            <EmptyState
              title="No active appointments"
              description="You don't have any pending appointments scheduled. Book a slot whenever you need university services."
              actionLabel="Browse Services"
              actionTo="/services"
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {upcomingAppointments.map((apt) => (
                <div key={apt._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span className="token-badge" style={{ fontSize: '16px', color: 'var(--primary-700)' }}>
                        {apt.tokenNumber}
                      </span>
                      <StatusBadge status={apt.status} />
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700 }}>{apt.service?.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Date: {apt.appointmentDate} • Slot: {apt.timeSlot}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to={`/queue/${apt.service?._id}`} className="btn btn-secondary btn-sm">
                      Track
                    </Link>
                    <a
                      href={`/receipt/${apt.bookingReference}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      title="Print receipt"
                    >
                      <Printer size={16} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Quick Info & Campus Services */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Quick Service Hub</h3>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Link to="/services" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>Certificates Section</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Transcripts & Bonafide</div>
              </div>
              <ArrowRight size={16} color="var(--primary-600)" />
            </Link>

            <Link to="/services" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>Finance & Fees</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Scholarships & Receipts</div>
              </div>
              <ArrowRight size={16} color="var(--primary-600)" />
            </Link>

            <Link to="/services" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>Admin & ID Cards</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Passes & Redressal</div>
              </div>
              <ArrowRight size={16} color="var(--primary-600)" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;

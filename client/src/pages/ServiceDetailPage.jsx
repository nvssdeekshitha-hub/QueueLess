import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { serviceService } from '../services/serviceService';
import { queueService } from '../services/queueService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Layers,
  Clock,
  MapPin,
  Users,
  Calendar,
  Compass,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';

export const ServiceDetailPage = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected date for slot preview
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    const fetchServiceAndQueue = async () => {
      try {
        setLoading(true);
        const [svcRes, qRes] = await Promise.all([
          serviceService.getServiceById(id, selectedDate),
          queueService.getQueue(id, todayStr),
        ]);

        if (svcRes.success) {
          setService(svcRes.data.service);
          setSlots(svcRes.data.availableSlots || []);
        }

        if (qRes.success) {
          setQueueStatus(qRes.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceAndQueue();
  }, [id]);

  // Refetch slots when date changes
  const handleDateChange = async (newDate) => {
    setSelectedDate(newDate);
    try {
      setSlotsLoading(true);
      const res = await serviceService.getServiceById(id, newDate);
      if (res.success) {
        setSlots(res.data.availableSlots || []);
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      setSlotsLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading service details..." />;
  }

  if (error || !service) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h3>Error loading service</h3>
        <p style={{ color: 'var(--text-muted)' }}>{error || 'Service not found.'}</p>
        <Link to="/services" className="btn btn-secondary" style={{ marginTop: '16px' }}>
          <ArrowLeft size={16} /> Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <Link to="/services" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600, marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to all services
      </Link>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column (2 cols): Service Details & Slot Availability */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--primary-100)',
                  color: 'var(--primary-700)',
                  fontFamily: 'monospace',
                }}>
                  {service.code}
                </span>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary-900)', marginTop: '8px' }}>
                  {service.name}
                </h1>
              </div>

              <Link to={`/book?serviceId=${service._id}`} className="btn btn-primary">
                <Calendar size={18} /> Book This Service
              </Link>
            </div>

            <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
              {service.description}
            </p>

            <div className="grid grid-cols-3 gap-4" style={{ backgroundColor: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Assigned Counter</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                  {service.counterName}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Operating Hours</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                  {service.operatingHours?.start} - {service.operatingHours?.end}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Avg Service Time</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                  ~{service.estimatedDurationMin} minutes
                </div>
              </div>
            </div>
          </div>

          {/* Slot Capacity Preview */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Live Slot Availability</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  View capacity and remaining slots for your intended date.
                </p>
              </div>

              <input
                type="date"
                className="form-input"
                style={{ width: '180px' }}
                value={selectedDate}
                min={todayStr}
                onChange={(e) => handleDateChange(e.target.value)}
              />
            </div>

            {slotsLoading ? (
              <LoadingSpinner message="Calculating slot capacities..." />
            ) : slots.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No slots scheduled for this date.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {slots.map((slot) => (
                  <div
                    key={slot.timeSlot}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      backgroundColor: slot.isFull ? '#fee2e2' : 'var(--bg-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 700 }}>{slot.timeSlot}</div>
                    <div style={{ fontSize: '12px', color: slot.isFull ? '#dc2626' : '#059669', fontWeight: 600 }}>
                      {slot.isFull ? 'Fully Booked' : `${slot.available} of ${slot.capacity} spots left`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Queue Status for Today */}
        <div>
          <div className="card" style={{ position: 'sticky', top: '88px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Compass size={20} color="var(--primary-600)" />
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Today's Live Queue</h3>
            </div>

            {/* Currently Serving Display */}
            <div style={{
              backgroundColor: 'var(--primary-50)',
              border: '2px dashed var(--primary-400)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              textAlign: 'center',
              marginBottom: '20px',
            }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Now Serving at {service.counterName}
              </div>
              <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--primary-900)', fontFamily: 'monospace', margin: '4px 0' }}>
                {queueStatus?.currentlyServing?.tokenNumber || '—'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {queueStatus?.currentlyServing ? `Slot: ${queueStatus.currentlyServing.timeSlot}` : 'Counter is waiting for next token'}
              </div>
            </div>

            {/* Queue Summary stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ color: 'var(--text-muted)' }}>People Waiting:</span>
                <span style={{ fontWeight: 700, color: '#d97706' }}>{queueStatus?.totalWaiting || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Completed Today:</span>
                <span style={{ fontWeight: 700, color: '#16a34a' }}>{queueStatus?.totalCompleted || 0}</span>
              </div>
            </div>

            <Link
              to={`/queue/${service._id}`}
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Open Live Tracker Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;

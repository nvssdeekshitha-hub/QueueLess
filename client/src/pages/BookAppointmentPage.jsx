import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { serviceService } from '../services/serviceService';
import { appointmentService } from '../services/appointmentService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Calendar,
  Clock,
  Layers,
  FileText,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

export const BookAppointmentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get('serviceId');

  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(preselectedServiceId || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Fetch available services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await serviceService.getServices();
        if (res.success) {
          setServices(res.data);
          if (!selectedServiceId && res.data.length > 0) {
            setSelectedServiceId(res.data[0]._id);
          }
        }
      } catch (err) {
        setErrorMsg('Failed to load services: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // 2. Fetch available slots whenever service or date changes
  useEffect(() => {
    if (!selectedServiceId || !selectedDate) return;

    const fetchSlots = async () => {
      try {
        setSlotsLoading(true);
        setSelectedSlot('');
        const res = await serviceService.getServiceById(selectedServiceId, selectedDate);
        if (res.success) {
          setAvailableSlots(res.data.availableSlots || []);
        }
      } catch (err) {
        console.error('Error fetching slots:', err);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [selectedServiceId, selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedServiceId || !selectedDate || !selectedSlot) {
      setErrorMsg('Please select a service, date, and available time slot.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await appointmentService.bookAppointment({
        serviceId: selectedServiceId,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        notes: notes.trim(),
      });

      if (res.success && res.data) {
        navigate(`/confirmation/${res.data.bookingReference}`, {
          state: { appointment: res.data },
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentService = services.find((s) => s._id === selectedServiceId);
  const todayStr = new Date().toISOString().slice(0, 10);

  if (loading) {
    return <LoadingSpinner message="Preparing booking console..." />;
  }

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary-900)' }}>
          Book an Appointment
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Select an administrative service, choose an open time slot, and receive your digital queue pass.
        </p>
      </div>

      {errorMsg && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          borderRadius: 'var(--radius-md)',
          fontSize: '14px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ padding: '32px' }}>
        {/* Step 1: Service Selection */}
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label" style={{ fontSize: '15px', fontWeight: 700 }}>
            1. Select Administrative Service
          </label>
          <div className="grid grid-cols-2 gap-3" style={{ marginTop: '10px' }}>
            {services.map((svc) => (
              <div
                key={svc._id}
                onClick={() => setSelectedServiceId(svc._id)}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${selectedServiceId === svc._id ? 'var(--primary-600)' : 'var(--border-light)'}`,
                  backgroundColor: selectedServiceId === svc._id ? 'var(--primary-50)' : 'white',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    color: 'var(--primary-700)',
                    fontFamily: 'monospace',
                    border: '1px solid var(--border-medium)',
                  }}>
                    {svc.code}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{svc.counterName}</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-900)' }}>
                  {svc.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Date Selection */}
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label" style={{ fontSize: '15px', fontWeight: 700 }}>
            2. Choose Appointment Date
          </label>
          <input
            type="date"
            className="form-input"
            value={selectedDate}
            min={todayStr}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
            style={{ maxWidth: '240px' }}
          />
        </div>

        {/* Step 3: Slot Selection */}
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label" style={{ fontSize: '15px', fontWeight: 700 }}>
            3. Select Available Time Slot
          </label>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Slots are monitored in real time. Red badges indicate fully occupied slots.
          </p>

          {slotsLoading ? (
            <LoadingSpinner message="Checking available slots..." size={24} />
          ) : availableSlots.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              No slots available for this service on the selected date.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {availableSlots.map((slot) => {
                const isSelected = selectedSlot === slot.timeSlot;
                return (
                  <button
                    type="button"
                    key={slot.timeSlot}
                    disabled={slot.isFull}
                    onClick={() => setSelectedSlot(slot.timeSlot)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: `2px solid ${isSelected ? 'var(--primary-600)' : slot.isFull ? '#fecaca' : 'var(--border-medium)'}`,
                      backgroundColor: isSelected ? 'var(--primary-600)' : slot.isFull ? '#fee2e2' : 'white',
                      color: isSelected ? 'white' : slot.isFull ? '#b91c1c' : 'var(--text-main)',
                      cursor: slot.isFull ? 'not-allowed' : 'pointer',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      alignItems: 'center',
                      transition: 'var(--transition)',
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>{slot.timeSlot}</span>
                    <span style={{ fontSize: '11px', opacity: 0.9 }}>
                      {slot.isFull ? 'Full' : `${slot.available} open`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Step 4: Notes / Reason */}
        <div className="form-group" style={{ marginBottom: '28px' }}>
          <label className="form-label" style={{ fontSize: '15px', fontWeight: 700 }}>
            4. Purpose / Notes (Optional)
          </label>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="e.g. Requesting bonafide letter for education loan application..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={300}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          style={{ width: '100%', justifyContent: 'center' }}
          disabled={submitting || !selectedSlot}
        >
          {submitting ? 'Confirming Booking & Generating Token...' : 'Confirm Booking & Issue Token'}
        </button>
      </form>
    </div>
  );
};

export default BookAppointmentPage;

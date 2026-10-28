import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { serviceService } from '../services/serviceService';
import { appointmentService } from '../services/appointmentService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  ListOrdered,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  PhoneCall,
} from 'lucide-react';

export const StaffDashboardPage = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setLoading(true);
        const [servicesRes, aptRes] = await Promise.all([
          serviceService.getServices(),
          appointmentService.getAppointments({ date: todayStr, limit: 100 }),
        ]);

        if (servicesRes.success) setServices(servicesRes.data);
        if (aptRes.success) setTodayAppointments(aptRes.data);
      } catch (err) {
        console.error('Error loading staff dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, []);

  const totalWaiting = todayAppointments.filter((a) => ['booked', 'waiting'].includes(a.status)).length;
  const totalServing = todayAppointments.filter((a) => a.status === 'serving').length;
  const totalCompleted = todayAppointments.filter((a) => a.status === 'completed').length;
  const totalSkipped = todayAppointments.filter((a) => a.status === 'skipped').length;

  if (loading) {
    return <LoadingSpinner message="Loading staff workstation..." />;
  }

  return (
    <div>
      {/* Header */}
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
            Staff Command Center
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Logged in as <strong>{user?.name}</strong> • Department: {user?.department}
          </p>
        </div>

        <Link to="/staff/queue" className="btn btn-primary btn-lg">
          <ListOrdered size={20} /> Open Queue Console
        </Link>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '32px' }}>
        <div className="card" style={{ borderLeft: '4px solid #d97706' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Waiting in Queue
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#d97706', marginTop: '6px' }}>
            {totalWaiting}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Awaiting service
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #7c3aed' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Currently Serving
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#7c3aed', marginTop: '6px' }}>
            {totalServing}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            At active counters
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #16a34a' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Completed Today
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#16a34a', marginTop: '6px' }}>
            {totalCompleted}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Tokens cleared
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #ea580c' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Skipped / Absent
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#ea580c', marginTop: '6px' }}>
            {totalSkipped}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Unanswered calls
          </div>
        </div>
      </div>

      {/* Services List and Quick Call */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
            University Counters Overview
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {services.map((svc) => (
              <div
                key={svc._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-subtle)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>{svc.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {svc.counterName} • Code: {svc.code} • Capacity: {svc.slotCapacity}/slot
                  </div>
                </div>

                <Link to={`/staff/queue?serviceId=${svc._id}`} className="btn btn-secondary btn-sm">
                  Manage Queue <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Instructions */}
        <div className="card" style={{ backgroundColor: 'var(--primary-50)', border: '1px solid var(--primary-100)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary-900)', marginBottom: '12px' }}>
            Workstation Guidelines
          </h3>
          <ul style={{ paddingLeft: '20px', fontSize: '14px', color: 'var(--primary-800)', lineHeight: 1.8 }}>
            <li>Click <strong>Open Queue Console</strong> to manage live student tokens.</li>
            <li>Use <strong>Call Next Token</strong> to automatically summon the next eligible student in sequence.</li>
            <li>Once the student reaches your counter, click <strong>Start Serving</strong>.</li>
            <li>When done, click <strong>Mark Completed</strong> to register completion and update waiting metrics.</li>
            <li>If a student does not report after 3 calls, use <strong>Skip Token</strong> to proceed.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboardPage;

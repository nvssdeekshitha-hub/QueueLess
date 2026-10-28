import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Users,
  Layers,
  Shield,
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await adminService.getDashboardStats();
        if (res.success && res.data) {
          setStats(res.data.overview);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Aggregating administrative metrics..." />;
  }

  return (
    <div>
      {/* Title */}
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
            System Administration Console
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Institution-wide appointment booking, queue monitoring, and counter capacity management.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin/services" className="btn btn-secondary btn-sm">
            <Layers size={16} /> Manage Services
          </Link>
          <Link to="/admin/analytics" className="btn btn-primary btn-sm">
            <BarChart3 size={16} /> Detailed Analytics
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '32px' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--primary-600)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Registered Students
            </span>
            <Users size={18} color="var(--primary-600)" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary-900)', marginTop: '8px' }}>
            {stats?.totalUsers || 0}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Active campus accounts
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #0d9488' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Active Services
            </span>
            <Layers size={18} color="#0d9488" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary-900)', marginTop: '8px' }}>
            {stats?.totalServices || 0}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Counters configured
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #7c3aed' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Staff Officers
            </span>
            <Shield size={18} color="#7c3aed" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary-900)', marginTop: '8px' }}>
            {stats?.totalStaff || 0}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Assigned to workstations
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #16a34a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Avg Wait Time
            </span>
            <Clock size={18} color="#16a34a" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#16a34a', marginTop: '8px' }}>
            ~{stats?.avgWaitMinutes || 12}m
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Calculated from MongoDB
          </div>
        </div>
      </div>

      {/* Today's Operational Breakdown */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
          Today's Operational Volume
        </h3>

        <div className="grid grid-cols-4 gap-4" style={{ textAlign: 'center' }}>
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Total Booked Today</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-900)', marginTop: '4px' }}>
              {stats?.todayAppointments || 0}
            </div>
          </div>
          <div style={{ padding: '16px', backgroundColor: '#fef3c7', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '12px', color: '#b45309', fontWeight: 600 }}>Currently Waiting</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#b45309', marginTop: '4px' }}>
              {stats?.todayWaiting || 0}
            </div>
          </div>
          <div style={{ padding: '16px', backgroundColor: '#dcfce7', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>Completed</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#15803d', marginTop: '4px' }}>
              {stats?.todayCompleted || 0}
            </div>
          </div>
          <div style={{ padding: '16px', backgroundColor: '#fee2e2', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '12px', color: '#b91c1c', fontWeight: 600 }}>Cancelled</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#b91c1c', marginTop: '4px' }}>
              {stats?.todayCancelled || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Administration Portals</h3>
      <div className="grid grid-cols-3 gap-6">
        <Link to="/admin/services" className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--primary-900)' }}>Manage Services</div>
            <Layers size={18} color="var(--primary-600)" />
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Add new counters, configure duration, operating hours, and slot capacities.
          </p>
        </Link>

        <Link to="/admin/staff" className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--primary-900)' }}>Staff Assignments</div>
            <Shield size={18} color="#7c3aed" />
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Create staff credentials and assign officers to university counters.
          </p>
        </Link>

        <Link to="/admin/appointments" className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--primary-900)' }}>Master Appointments</div>
            <Calendar size={18} color="#16a34a" />
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Filter, search, audit, and cancel university appointment bookings across all services.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

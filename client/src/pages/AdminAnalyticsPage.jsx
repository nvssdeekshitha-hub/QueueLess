import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, Clock, Layers } from 'lucide-react';

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#8b5cf6', '#0d9488'];

export const AdminAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await adminService.getAnalytics();
        if (res.success && res.data) {
          setAnalytics(res.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Computing MongoDB aggregation analytics..." />;
  }

  if (error || !analytics) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#b91c1c' }}>
        <h3>Error loading analytics</h3>
        <p>{error || 'No analytics data returned.'}</p>
      </div>
    );
  }

  const { dailyTrend, statusBreakdown, peakHours, serviceDistribution } = analytics;

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary-900)' }}>
          Queue & Appointment Analytics
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Operational intelligence powered by MongoDB aggregation pipelines ($match, $group, $sort, $project).
        </p>
      </div>

      {/* Grid: Chart 1 (Daily Trend) & Chart 2 (Status Distribution) */}
      <div className="grid grid-cols-2 gap-6" style={{ marginBottom: '32px' }}>
        {/* Chart 1: Daily Trend */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <TrendingUp size={20} color="var(--primary-600)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Daily Bookings & Completions</h3>
          </div>

          <div style={{ height: '300px', width: '100%' }}>
            {dailyTrend.length === 0 ? (
              <p style={{ textAlign: 'center', paddingTop: '100px', color: 'var(--text-muted)' }}>
                No appointment trends recorded yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '13px' }} />
                  <Area type="monotone" dataKey="total" name="Total Bookings" stroke="#2563eb" fillOpacity={1} fill="url(#colorTotal)" />
                  <Area type="monotone" dataKey="completed" name="Completed" stroke="#16a34a" fillOpacity={1} fill="url(#colorComp)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Status Breakdown */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <PieIcon size={20} color="#7c3aed" />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Appointment Status Distribution</h3>
          </div>

          <div style={{ height: '300px', width: '100%' }}>
            {statusBreakdown.length === 0 ? (
              <p style={{ textAlign: 'center', paddingTop: '100px', color: 'var(--text-muted)' }}>
                No status data available.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={50}
                    label={(entry) => `${entry.status} (${entry.count})`}
                  >
                    {statusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '13px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Chart 3 (Peak Hours) & Chart 4 (Service Volume) */}
      <div className="grid grid-cols-2 gap-6">
        {/* Chart 3: Peak Hours */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Clock size={20} color="#d97706" />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Peak Appointment Slots</h3>
          </div>

          <div style={{ height: '300px', width: '100%' }}>
            {peakHours.length === 0 ? (
              <p style={{ textAlign: 'center', paddingTop: '100px', color: 'var(--text-muted)' }}>
                No slot data recorded yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHours} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="slot" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Appointments Booked" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 4: Service Volume Breakdown */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Layers size={20} color="#0d9488" />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Service Counter Demand</h3>
          </div>

          <div style={{ height: '300px', width: '100%' }}>
            {serviceDistribution.length === 0 ? (
              <p style={{ textAlign: 'center', paddingTop: '100px', color: 'var(--text-muted)' }}>
                No service distribution records.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceDistribution} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="code" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '13px' }} />
                  <Bar dataKey="totalBookings" name="Total Bookings" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="completedBookings" name="Completed" fill="#16a34a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;

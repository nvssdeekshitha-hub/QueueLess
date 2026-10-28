import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Smartphone,
  CalendarCheck,
  TrendingDown,
  Layers,
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)',
        padding: '80px 0 60px 0',
        borderBottom: '1px solid var(--border-light)',
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '840px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--primary-100)',
            color: 'var(--primary-700)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: 700,
            marginBottom: '24px',
          }}>
            <Sparkles size={16} />
            Eliminate Waiting Lines with Intelligent Queueing
          </div>

          <h1 style={{
            fontSize: '48px',
            fontWeight: 800,
            lineHeight: 1.15,
            color: 'var(--primary-900)',
            letterSpacing: '-1.5px',
            marginBottom: '20px',
          }}>
            Smart Appointment Booking & <br />
            <span style={{ color: 'var(--primary-600)' }}>Digital Queue Management</span>
          </h1>

          <p style={{
            fontSize: '18px',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            marginBottom: '36px',
          }}>
            Say goodbye to physical lines. QueueLess allows students and visitors to schedule appointments,
            receive instant digital tokens, track queue positions in real time, and arrive right on time.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/services" className="btn btn-primary btn-lg">
              Browse Services & Book <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Explore Demo Portals
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            marginTop: '60px',
            padding: '24px',
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-light)',
          }}>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary-600)' }}>85%</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
                Average Wait Time Reduction
              </div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981' }}>100%</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
                Digital Token Transparency
              </div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#8b5cf6' }}>0</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
                Physical Crowd Congestion
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '80px 0', backgroundColor: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary-900)', marginBottom: '12px' }}>
              How QueueLess Works
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--text-muted)', maxWidth: '560px', margin: '0 auto' }}>
              A seamless, automated queue workflow designed for academic institutions, clinics, and service centers.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-6">
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}>
                <CalendarCheck size={24} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>1. Select & Book</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Pick an administrative service, choose a date, and select an available 30-minute time slot.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}>
                <Smartphone size={24} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>2. Get Digital Token</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Receive a sequential token number (e.g. REC-001) and printable receipt with your booking reference.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#ede9fe',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}>
                <Clock size={24} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>3. Track Live Position</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                View how many people are ahead and receive live updates with calculated estimated waiting time.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}>
                <CheckCircle2 size={24} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>4. Hassle-Free Service</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Approach the designated counter when your token is called and complete your task quickly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Showcase */}
      <section style={{ padding: '80px 0', backgroundColor: 'var(--bg-main)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary-900)', marginBottom: '12px' }}>
              Built for Every Stakeholder
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Users size={24} color="#2563eb" />
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Students & Visitors</h3>
              </div>
              <ul style={{ paddingLeft: '18px', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                <li>Browse university administrative services</li>
                <li>Book capacity-managed time slots</li>
                <li>Track live queue position and wait time</li>
                <li>Cancel bookings with automatic queue reordering</li>
                <li>Download or print official server-rendered receipts</li>
              </ul>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Clock size={24} color="#7c3aed" />
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Staff & Officers</h3>
              </div>
              <ul style={{ paddingLeft: '18px', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                <li>Dedicated workstation queue console</li>
                <li>One-click "Call Next Token" workflow</li>
                <li>Mark tokens as Serving, Completed, or Skipped</li>
                <li>Search records by token or student ID</li>
                <li>Monitor today's counter workload in real time</li>
              </ul>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <ShieldCheck size={24} color="#059669" />
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Administrators</h3>
              </div>
              <ul style={{ paddingLeft: '18px', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                <li>Create and configure service counters and capacities</li>
                <li>Manage staff accounts and counter assignments</li>
                <li>Real-time aggregation analytics & charts</li>
                <li>Audit trails of queue events and transitions</li>
                <li>Secure session and RBAC access enforcement</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
        color: 'white',
        padding: '64px 0',
        textAlign: 'center',
      }}>
        <div className="container" style={{ maxWidth: '640px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>
            Ready to experience line-free queueing?
          </h2>
          <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '32px' }}>
            Sign up today or explore the pre-seeded demonstration accounts with instant login.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <Link to="/register" className="btn btn-secondary btn-lg" style={{ color: 'var(--primary-700)' }}>
              Create Free Account
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg" style={{ backgroundColor: 'transparent', color: 'white', borderColor: 'white' }}>
              Sign In to Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

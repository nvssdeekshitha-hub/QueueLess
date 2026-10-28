import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'white',
      borderTop: '1px solid var(--border-light)',
      padding: '40px 0 24px 0',
      marginTop: 'auto',
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--border-light)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}>
              <Layers size={18} />
            </div>
            <div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-900)' }}>
                Queue<span style={{ color: 'var(--primary-600)' }}>Less</span>
              </span>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Smart Appointment & Digital Queue Management System
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <Link to="/" style={{ color: 'inherit' }}>Home</Link>
            <Link to="/services" style={{ color: 'inherit' }}>Services</Link>
            <Link to="/login" style={{ color: 'inherit' }}>Login</Link>
            <Link to="/register" style={{ color: 'inherit' }}>Register</Link>
          </div>
        </div>

        <div style={{
          paddingTop: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          fontSize: '12px',
          color: 'var(--text-light)',
        }}>
          <div>
            &copy; {new Date().getFullYear()} QueueLess. Built for college administration and service centers.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Engineered with React.js, Express.js, Node.js & MongoDB
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

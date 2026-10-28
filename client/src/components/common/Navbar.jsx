import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Layers,
  Calendar,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Shield,
  Activity,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'staff') return '/staff';
    return '/dashboard';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      backgroundColor: 'white',
      borderBottom: '1px solid var(--border-light)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '68px',
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}>
            <Layers size={20} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-900)', letterSpacing: '-0.5px' }}>
            Queue<span style={{ color: 'var(--primary-600)' }}>Less</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div style={{ display: 'none', alignItems: 'center', gap: '28px' }} className="desktop-nav">
          <Link
            to="/"
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: isActive('/') ? 'var(--primary-600)' : 'var(--text-muted)',
              transition: 'var(--transition)',
            }}
          >
            Home
          </Link>
          <Link
            to="/services"
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: isActive('/services') ? 'var(--primary-600)' : 'var(--text-muted)',
              transition: 'var(--transition)',
            }}
          >
            Browse Services
          </Link>

          {isAuthenticated && user?.role === 'student' && (
            <>
              <Link
                to="/appointments"
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: isActive('/appointments') ? 'var(--primary-600)' : 'var(--text-muted)',
                  transition: 'var(--transition)',
                }}
              >
                My Bookings
              </Link>
              <Link
                to="/book"
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: isActive('/book') ? 'var(--primary-600)' : 'var(--text-muted)',
                  transition: 'var(--transition)',
                }}
              >
                Book Appointment
              </Link>
            </>
          )}
        </div>

        {/* User Account / Auth CTA */}
        <div style={{ display: 'none', alignItems: 'center', gap: '12px' }} className="desktop-actions">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link to={getDashboardLink()} className="btn btn-primary btn-sm">
                <LayoutDashboard size={16} />
                Dashboard
              </Link>

              <Link
                to="/profile"
                className="btn btn-secondary btn-sm"
                title={`${user?.name} (${user?.role})`}
              >
                <User size={16} />
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name?.split(' ')[0]}
                </span>
                <span style={{
                  fontSize: '11px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: user?.role === 'admin' ? '#fef3c7' : user?.role === 'staff' ? '#ede9fe' : '#dcfce7',
                  color: user?.role === 'admin' ? '#b45309' : user?.role === 'staff' ? '#6d28d9' : '#15803d',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}>
                  {user?.role}
                </span>
              </Link>

              <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Log out">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-main)',
            cursor: 'pointer',
            padding: '8px',
          }}
          className="mobile-toggle"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          padding: '16px 20px',
          backgroundColor: 'white',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '8px 0', fontWeight: 600 }}
          >
            Home
          </Link>
          <Link
            to="/services"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '8px 0', fontWeight: 600 }}
          >
            Browse Services
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: '8px 0', fontWeight: 600, color: 'var(--primary-600)' }}
              >
                Dashboard ({user?.role})
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: '8px 0', fontWeight: 600 }}
              >
                My Profile
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="btn btn-danger btn-sm"
                style={{ marginTop: '8px' }}
              >
                <LogOut size={16} /> Log Out
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Inline media query style helper */}
      <style>{`
        @media (min-width: 769px) {
          .desktop-nav { display: flex !important; }
          .desktop-actions { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;

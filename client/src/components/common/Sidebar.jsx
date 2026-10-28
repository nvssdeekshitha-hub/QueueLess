import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Calendar,
  Layers,
  Clock,
  User,
  Users,
  Shield,
  BarChart3,
  ListOrdered,
  Settings,
  HelpCircle,
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'student';

  const studentLinks = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/services', label: 'Browse Services', icon: Layers },
    { to: '/book', label: 'Book Slot', icon: Calendar },
    { to: '/appointments', label: 'My Bookings', icon: Clock },
    { to: '/queue/live', label: 'Live Queue', icon: ListOrdered },
    { to: '/profile', label: 'My Profile', icon: User },
  ];

  const staffLinks = [
    { to: '/staff', label: 'Staff Console', icon: LayoutDashboard },
    { to: '/staff/queue', label: 'Queue Manager', icon: ListOrdered },
    { to: '/appointments', label: 'All Bookings', icon: Calendar },
    { to: '/profile', label: 'My Profile', icon: User },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Admin Overview', icon: LayoutDashboard },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/admin/services', label: 'Manage Services', icon: Layers },
    { to: '/admin/staff', label: 'Manage Staff', icon: Shield },
    { to: '/admin/appointments', label: 'Appointments', icon: Calendar },
    { to: '/admin/users', label: 'User Accounts', icon: Users },
    { to: '/profile', label: 'Admin Profile', icon: User },
  ];

  const links = role === 'admin' ? adminLinks : role === 'staff' ? staffLinks : studentLinks;

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'white',
      borderRight: '1px solid var(--border-light)',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 68px)',
      position: 'sticky',
      top: '68px',
      padding: '24px 16px',
    }}>
      {/* Role Tag & User Chip */}
      <div style={{
        padding: '14px',
        backgroundColor: 'var(--bg-subtle)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '24px',
      }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Role Space
        </div>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-900)', textTransform: 'capitalize' }}>
          {role === 'student' ? 'Student Portal' : role === 'staff' ? 'Staff Workstation' : 'System Administration'}
        </div>
      </div>

      {/* Nav Menu */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {links.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard' || item.to === '/admin' || item.to === '/staff'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: 600,
                color: isActive ? 'var(--primary-600)' : 'var(--text-muted)',
                backgroundColor: isActive ? 'var(--primary-50)' : 'transparent',
                transition: 'var(--transition)',
              })}
            >
              <IconComponent size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div style={{
        paddingTop: '16px',
        borderTop: '1px solid var(--border-light)',
        fontSize: '12px',
        color: 'var(--text-light)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <HelpCircle size={14} />
        <span>QueueLess v1.0.0</span>
      </div>
    </aside>
  );
};

export default Sidebar;

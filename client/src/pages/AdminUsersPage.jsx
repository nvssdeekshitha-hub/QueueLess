import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Shield,
  RefreshCw,
} from 'lucide-react';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({
        page,
        limit: 15,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        search: search.trim() || undefined,
      });

      if (res.success) {
        setUsers(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, search]);

  const handleToggleStatus = async (user) => {
    try {
      const res = await adminService.toggleUserStatus(user._id);
      if (res.success) {
        setStatusMsg(res.message);
        await fetchUsers();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
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
            User Account Management
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            View registered students, staff officers, and administrators across the platform.
          </p>
        </div>

        <button onClick={fetchUsers} className="btn btn-secondary btn-sm">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {statusMsg && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#dcfce7',
          color: '#166534',
          borderRadius: 'var(--radius-md)',
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '20px',
        }}>
          {statusMsg}
        </div>
      )}

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'student', 'staff', 'admin'].map((role) => (
              <button
                key={role}
                onClick={() => {
                  setRoleFilter(role);
                  setPage(1);
                }}
                className="btn btn-sm"
                style={{
                  textTransform: 'capitalize',
                  backgroundColor: roleFilter === role ? 'var(--primary-600)' : 'white',
                  color: roleFilter === role ? 'white' : 'var(--text-main)',
                  borderColor: roleFilter === role ? 'var(--primary-600)' : 'var(--border-medium)',
                  fontWeight: 700,
                }}
              >
                {role}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-light)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search by name, email, roll..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        {loading ? (
          <LoadingSpinner message="Loading user accounts..." />
        ) : users.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No accounts found matching your query.
          </p>
        ) : (
          <>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Student ID</th>
                    <th>Registered On</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} style={{ opacity: u.isActive ? 1 : 0.6 }}>
                      <td style={{ fontWeight: 700 }}>{u.name}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                      <td>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: u.role === 'admin' ? '#fef3c7' : u.role === 'staff' ? '#ede9fe' : '#dcfce7',
                          color: u.role === 'admin' ? '#b45309' : u.role === 'staff' ? '#6d28d9' : '#15803d',
                          textTransform: 'uppercase',
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.department || 'General'}</td>
                      <td>{u.studentId || '—'}</td>
                      <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: u.isActive ? '#dcfce7' : '#fee2e2',
                          color: u.isActive ? '#15803d' : '#b91c1c',
                          textTransform: 'uppercase',
                        }}>
                          {u.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-light)',
              }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} accounts)
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination.hasPrevPage}
                    className="btn btn-secondary btn-sm"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination.hasNextPage}
                    className="btn btn-secondary btn-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;

import React, { useState, useEffect } from 'react';
import { appointmentService } from '../services/appointmentService';
import { serviceService } from '../services/serviceService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmationModal from '../components/common/ConfirmationModal';
import {
  Calendar,
  Search,
  Filter,
  Trash2,
  XCircle,
  Printer,
  Compass,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Filters
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterService, setFilterService] = useState('');
  const [search, setSearch] = useState('');

  // Confirmation Modal
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    isDanger: true,
    onConfirm: () => {},
  });

  const fetchServices = async () => {
    try {
      const res = await serviceService.getServices();
      if (res.success) setServices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentService.getAppointments({
        page,
        limit: 15,
        date: filterDate || undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        serviceId: filterService || undefined,
        search: search.trim() || undefined,
      });

      if (res.success) {
        setAppointments(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [page, filterDate, filterStatus, filterService, search]);

  const handleDelete = (apt) => {
    setModalConfig({
      isOpen: true,
      title: `Delete Appointment ${apt.tokenNumber}`,
      message: `Are you sure you want to permanently delete appointment record ${apt.bookingReference}? This action cannot be undone.`,
      confirmLabel: 'Permanently Delete',
      isDanger: true,
      onConfirm: async () => {
        try {
          await appointmentService.deleteAppointment(apt._id);
          setModalConfig((p) => ({ ...p, isOpen: false }));
          await fetchAppointments();
        } catch (err) {
          alert('Error deleting appointment: ' + err.message);
        }
      },
    });
  };

  const handleCancel = (apt) => {
    setModalConfig({
      isOpen: true,
      title: `Cancel Appointment ${apt.tokenNumber}`,
      message: `Are you sure you want to cancel this appointment for ${apt.user?.name}?`,
      confirmLabel: 'Cancel Appointment',
      isDanger: true,
      onConfirm: async () => {
        try {
          await appointmentService.cancelAppointment(apt._id, 'Cancelled by Administrator');
          setModalConfig((p) => ({ ...p, isOpen: false }));
          await fetchAppointments();
        } catch (err) {
          alert('Error cancelling appointment: ' + err.message);
        }
      },
    });
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
            Master Appointment Records
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Comprehensive view of all university appointment bookings, digital tokens, and audit status.
          </p>
        </div>

        <button onClick={fetchAppointments} className="btn btn-secondary btn-sm">
          <RefreshCw size={16} /> Refresh Records
        </button>
      </div>

      {/* Filter Strip */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
        }}>
          <div>
            <label className="form-label" style={{ fontSize: '12px' }}>Search (Token / Ref / Name)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. REC-001 or QL-..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '12px' }}>Filter by Date</label>
            <input
              type="date"
              className="form-input"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '12px' }}>Service Counter</label>
            <select
              className="form-select"
              value={filterService}
              onChange={(e) => {
                setFilterService(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Services</option>
              {services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '12px' }}>Status</label>
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Statuses</option>
              <option value="booked">Booked</option>
              <option value="waiting">Waiting</option>
              <option value="serving">Serving</option>
              <option value="completed">Completed</option>
              <option value="skipped">Skipped</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="card">
        {loading ? (
          <LoadingSpinner message="Fetching appointment records..." />
        ) : appointments.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No appointments match the selected filter criteria.
          </p>
        ) : (
          <>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Booking Ref</th>
                    <th>Student Name</th>
                    <th>Service & Counter</th>
                    <th>Date & Slot</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr key={apt._id}>
                      <td>
                        <span className="token-badge" style={{ fontSize: '15px', color: 'var(--primary-800)' }}>
                          {apt.tokenNumber}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
                          {apt.bookingReference}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{apt.user?.name || 'Student'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{apt.user?.studentId || apt.user?.email}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{apt.service?.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{apt.service?.counterName}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{apt.appointmentDate}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{apt.timeSlot}</div>
                      </td>
                      <td>
                        <StatusBadge status={apt.status} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <a
                            href={`/receipt/${apt.bookingReference}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-secondary btn-sm"
                            title="View SSR Receipt"
                          >
                            <Printer size={14} />
                          </a>

                          {['booked', 'waiting'].includes(apt.status) && (
                            <button
                              onClick={() => handleCancel(apt)}
                              className="btn btn-secondary btn-sm"
                              title="Cancel Appointment"
                              style={{ color: '#dc2626' }}
                            >
                              <XCircle size={14} />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(apt)}
                            className="btn btn-danger btn-sm"
                            title="Delete Record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
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
                  Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total records)
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmLabel={modalConfig.confirmLabel}
        isDanger={modalConfig.isDanger}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig((p) => ({ ...p, isOpen: false }))}
      />
    </div>
  );
};

export default AdminAppointmentsPage;

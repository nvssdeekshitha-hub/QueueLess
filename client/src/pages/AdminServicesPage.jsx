import React, { useState, useEffect } from 'react';
import { serviceService } from '../services/serviceService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmationModal from '../components/common/ConfirmationModal';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  Clock,
  MapPin,
  X,
} from 'lucide-react';

export const AdminServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');

  // Modal State for Create/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: 'Academic',
    counterName: 'Counter 1',
    estimatedDurationMin: 15,
    slotCapacity: 5,
    operatingHours: {
      start: '09:00',
      end: '17:00',
    },
  });
  const [submitting, setSubmitting] = useState(false);

  // Deactivate confirmation modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    service: null,
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await serviceService.getServices({ includeInactive: true });
      if (res.success) {
        setServices(res.data);
      }
    } catch (err) {
      setErrorMsg('Failed to load services: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenCreate = () => {
    setEditingServiceId(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      category: 'Academic',
      counterName: 'Counter 1',
      estimatedDurationMin: 15,
      slotCapacity: 5,
      operatingHours: { start: '09:00', end: '17:00' },
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (svc) => {
    setEditingServiceId(svc._id);
    setFormData({
      name: svc.name,
      code: svc.code,
      description: svc.description,
      category: svc.category || 'Academic',
      counterName: svc.counterName || 'Counter 1',
      estimatedDurationMin: svc.estimatedDurationMin || 15,
      slotCapacity: svc.slotCapacity || 5,
      operatingHours: {
        start: svc.operatingHours?.start || '09:00',
        end: svc.operatingHours?.end || '17:00',
      },
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg('');

      if (editingServiceId) {
        await serviceService.updateService(editingServiceId, formData);
        setSuccessMsg('Service updated successfully!');
      } else {
        await serviceService.createService(formData);
        setSuccessMsg('New service created successfully!');
      }

      setIsModalOpen(false);
      await fetchServices();
    } catch (err) {
      setErrorMsg(err.message || 'Error saving service.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (svc) => {
    try {
      await serviceService.updateService(svc._id, { isActive: !svc.isActive });
      setSuccessMsg(`Service ${!svc.isActive ? 'activated' : 'deactivated'} successfully.`);
      await fetchServices();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const filteredServices = services.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
  });

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
            Service Management
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Configure university counters, operating windows, appointment slot capacities, and durations.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={18} /> Add New Service
        </button>
      </div>

      {successMsg && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#dcfce7',
          color: '#166534',
          borderRadius: 'var(--radius-md)',
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '20px',
        }}>
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fee2e2',
          color: '#b91c1c',
          borderRadius: 'var(--radius-md)',
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '20px',
        }}>
          {errorMsg}
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
            Configured Services ({services.length})
          </h3>

          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-light)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading services..." />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Service Name</th>
                  <th>Category</th>
                  <th>Counter</th>
                  <th>Capacity / Slot</th>
                  <th>Hours & Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((svc) => (
                  <tr key={svc._id} style={{ opacity: svc.isActive ? 1 : 0.6 }}>
                    <td>
                      <span className="token-badge" style={{ fontSize: '14px', color: 'var(--primary-700)' }}>
                        {svc.code}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{svc.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {svc.description}
                      </div>
                    </td>
                    <td>{svc.category}</td>
                    <td>{svc.counterName}</td>
                    <td style={{ fontWeight: 700 }}>{svc.slotCapacity} bookings</td>
                    <td>
                      <div style={{ fontSize: '13px' }}>{svc.operatingHours?.start} - {svc.operatingHours?.end}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>~{svc.estimatedDurationMin}m duration</div>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: svc.isActive ? '#dcfce7' : '#fee2e2',
                        color: svc.isActive ? '#15803d' : '#b91c1c',
                        textTransform: 'uppercase',
                      }}>
                        {svc.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenEdit(svc)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Service"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(svc)}
                          className={`btn btn-sm ${svc.isActive ? 'btn-danger' : 'btn-success'}`}
                          title={svc.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {svc.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Service Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '580px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800 }}>
                {editingServiceId ? 'Edit Service' : 'Create New Service Counter'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm}>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Service Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Certificates & Records"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Service Code *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. REC"
                    maxLength={6}
                    required
                    disabled={!!editingServiceId}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Service purpose and requirements..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Academic">Academic</option>
                    <option value="Financial">Financial</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Library">Library</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Counter Name / Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.counterName}
                    onChange={(e) => setFormData({ ...formData, counterName: e.target.value })}
                    placeholder="e.g. Counter 1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Max Slot Capacity (Concurrent)</label>
                  <input
                    type="number"
                    className="form-input"
                    min={1}
                    max={50}
                    value={formData.slotCapacity}
                    onChange={(e) => setFormData({ ...formData, slotCapacity: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Est. Duration (Minutes)</label>
                  <input
                    type="number"
                    className="form-input"
                    min={5}
                    max={120}
                    value={formData.estimatedDurationMin}
                    onChange={(e) => setFormData({ ...formData, estimatedDurationMin: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Opening Time (HH:MM)</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.operatingHours.start}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        operatingHours: { ...formData.operatingHours, start: e.target.value },
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Closing Time (HH:MM)</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.operatingHours.end}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        operatingHours: { ...formData.operatingHours, end: e.target.value },
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : editingServiceId ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServicesPage;

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { serviceService } from '../services/serviceService';
import { queueService } from '../services/queueService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmationModal from '../components/common/ConfirmationModal';
import {
  PhoneCall,
  Play,
  CheckCircle,
  SkipForward,
  XCircle,
  Search,
  RefreshCw,
  Compass,
  AlertCircle,
  Layers,
} from 'lucide-react';

export const StaffQueuePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialServiceId = searchParams.get('serviceId');

  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(initialServiceId || '');
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [statusFeedback, setStatusFeedback] = useState('');

  // Confirmation modal for Skip/Cancel
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    isDanger: false,
    onConfirm: () => {},
  });

  // 1. Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await serviceService.getServices();
        if (res.success && res.data.length > 0) {
          setServices(res.data);
          if (!selectedServiceId) {
            setSelectedServiceId(res.data[0]._id);
          }
        }
      } catch (err) {
        setErrorMsg('Error loading services: ' + err.message);
      }
    };

    fetchServices();
  }, []);

  // 2. Fetch live queue for selected service
  const fetchQueue = async () => {
    if (!selectedServiceId) return;

    try {
      const res = await queueService.getQueue(selectedServiceId);
      if (res.success) {
        setQueueData(res.data);
      }
    } catch (err) {
      setErrorMsg('Error loading queue: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedServiceId) {
      fetchQueue();
      // Auto-poll every 6 seconds for fresh queue state
      const timer = setInterval(fetchQueue, 6000);
      return () => clearInterval(timer);
    }
  }, [selectedServiceId]);

  // Action: Call Next Token
  const handleCallNext = async () => {
    try {
      setActionLoading(true);
      setErrorMsg('');
      setStatusFeedback('');
      const res = await queueService.callNext(selectedServiceId);
      if (res.success) {
        if (res.data) {
          setStatusFeedback(`Token ${res.data.tokenNumber} summoned to counter.`);
        } else {
          setStatusFeedback('Queue is empty! No waiting tokens.');
        }
        await fetchQueue();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error calling next token.');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Transition Token Status (serving, completed, skipped, cancelled)
  const handleUpdateStatus = async (tokenId, newStatus, reason = '') => {
    try {
      setActionLoading(true);
      setErrorMsg('');
      setStatusFeedback('');
      const res = await queueService.updateStatus(tokenId, newStatus, reason);
      if (res.success) {
        setStatusFeedback(`Token status updated to: ${newStatus.toUpperCase()}`);
        await fetchQueue();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update token status.');
    } finally {
      setActionLoading(false);
    }
  };

  const activeToken = queueData?.currentlyServing;
  const currentService = services.find((s) => s._id === selectedServiceId);

  // Filtered waiting list
  const filteredWaitingList = (queueData?.waitingList || []).filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.tokenNumber.toLowerCase().includes(q) ||
      item.userName.toLowerCase().includes(q) ||
      item.bookingReference.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Top Console Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary-900)' }}>
            Queue Management Console
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Counter: <strong>{currentService?.counterName || 'Assigned Counter'}</strong> • Real-time token caller
          </p>
        </div>

        {/* Counter Selection Dropdown */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            className="form-select"
            style={{ width: '240px', fontWeight: 600 }}
            value={selectedServiceId}
            onChange={(e) => {
              setSelectedServiceId(e.target.value);
              setSearchParams({ serviceId: e.target.value });
            }}
          >
            {services.map((svc) => (
              <option key={svc._id} value={svc._id}>
                {svc.name} ({svc.code})
              </option>
            ))}
          </select>

          <button onClick={fetchQueue} className="btn btn-secondary btn-sm" title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Notifications / Feedback */}
      {statusFeedback && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#dcfce7',
          color: '#166534',
          borderRadius: 'var(--radius-md)',
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <CheckCircle size={18} />
          <span>{statusFeedback}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fee2e2',
          color: '#b91c1c',
          borderRadius: 'var(--radius-md)',
          fontSize: '14px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Hero Action: Active Token & Call Next Button */}
      <div className="grid grid-cols-3 gap-6" style={{ marginBottom: '32px' }}>
        {/* Left Column: Call Next Master Control (1 col) */}
        <div className="card" style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '32px 24px',
          backgroundColor: 'var(--primary-50)',
          border: '2px solid var(--primary-200)',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Queue Control
          </div>

          <div style={{ fontSize: '36px', fontWeight: 900, color: '#d97706', marginBottom: '4px' }}>
            {queueData?.totalWaiting || 0}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Students waiting in line
          </div>

          <button
            onClick={handleCallNext}
            disabled={actionLoading || (queueData?.totalWaiting === 0)}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: 800, justifyContent: 'center' }}
          >
            <PhoneCall size={20} /> Call Next Token
          </button>
        </div>

        {/* Right Column: Active Serving Station (2 cols) */}
        <div className="card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Active Station Token
              </div>
              {activeToken && <StatusBadge status="serving" />}
            </div>

            {activeToken ? (
              <div>
                <div style={{
                  fontSize: '52px',
                  fontWeight: 900,
                  color: 'var(--primary-800)',
                  fontFamily: 'monospace',
                  letterSpacing: '2px',
                  lineHeight: 1,
                  marginBottom: '8px',
                }}>
                  {activeToken.tokenNumber}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
                  Student: {activeToken.userName}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Booking Reference: <strong style={{ fontFamily: 'monospace' }}>{activeToken.bookingReference}</strong> • Slot: {activeToken.timeSlot}
                </div>
              </div>
            ) : (
              <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Compass size={40} style={{ opacity: 0.3, margin: '0 auto 12px auto' }} />
                <p style={{ fontSize: '15px', fontWeight: 600 }}>No token currently being served</p>
                <p style={{ fontSize: '13px' }}>Click "Call Next Token" to summon the first waiting student.</p>
              </div>
            )}
          </div>

          {/* Action Transitions Strip for Active Token */}
          {activeToken && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
              <button
                onClick={() => handleUpdateStatus(activeToken.id, 'completed')}
                disabled={actionLoading}
                className="btn btn-success"
                style={{ flex: 2, justifyContent: 'center' }}
              >
                <CheckCircle size={18} /> Mark Completed
              </button>

              <button
                onClick={() => {
                  setModalConfig({
                    isOpen: true,
                    title: `Skip Token ${activeToken.tokenNumber}`,
                    message: `Are you sure you want to mark token ${activeToken.tokenNumber} as skipped? You can recall skipped tokens if needed.`,
                    confirmLabel: 'Yes, Skip Token',
                    isDanger: false,
                    onConfirm: () => {
                      setModalConfig((prev) => ({ ...prev, isOpen: false }));
                      handleUpdateStatus(activeToken.id, 'skipped');
                    },
                  });
                }}
                disabled={actionLoading}
                className="btn btn-secondary"
                style={{ flex: 1, justifyContent: 'center', color: '#ea580c' }}
              >
                <SkipForward size={16} /> Skip
              </button>

              <button
                onClick={() => {
                  setModalConfig({
                    isOpen: true,
                    title: `Cancel Appointment ${activeToken.tokenNumber}`,
                    message: `Are you sure you want to cancel this appointment for ${activeToken.userName}?`,
                    confirmLabel: 'Cancel Appointment',
                    isDanger: true,
                    onConfirm: () => {
                      setModalConfig((prev) => ({ ...prev, isOpen: false }));
                      handleUpdateStatus(activeToken.id, 'cancelled', 'Cancelled at counter by staff');
                    },
                  });
                }}
                disabled={actionLoading}
                className="btn btn-danger"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <XCircle size={16} /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Waiting Queue List */}
      <div className="card">
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
              Live Waiting Queue ({queueData?.waitingList?.length || 0})
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Students waiting in sequential order for {currentService?.name}
            </p>
          </div>

          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-light)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search token, name, ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredWaitingList.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
            No waiting students match your filter.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Seq #</th>
                  <th>Token Number</th>
                  <th>Student Name</th>
                  <th>Time Slot</th>
                  <th>Status</th>
                  <th>Est. Wait</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWaitingList.map((item, idx) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 800, color: 'var(--text-muted)' }}>#{item.tokenSequence}</td>
                    <td>
                      <span className="token-badge" style={{ fontSize: '15px', color: 'var(--primary-800)' }}>
                        {item.tokenNumber}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.userName}</td>
                    <td>{item.timeSlot}</td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td style={{ fontWeight: 600 }}>~{item.estimatedWaitMin}m</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'serving')}
                          disabled={actionLoading}
                          className="btn btn-primary btn-sm"
                          title="Start serving directly"
                        >
                          <Play size={14} /> Serve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'skipped')}
                          disabled={actionLoading}
                          className="btn btn-secondary btn-sm"
                          title="Skip token"
                        >
                          <SkipForward size={14} />
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmLabel={modalConfig.confirmLabel}
        isDanger={modalConfig.isDanger}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default StaffQueuePage;

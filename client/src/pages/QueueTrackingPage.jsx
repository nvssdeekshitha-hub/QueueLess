import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { serviceService } from '../services/serviceService';
import { useQueue } from '../hooks/useQueue';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import {
  Compass,
  Clock,
  Users,
  RefreshCw,
  MapPin,
  CheckCircle,
  Pause,
  Play,
  ArrowRight,
  Layers,
} from 'lucide-react';

export const QueueTrackingPage = () => {
  const { serviceId } = useParams();
  const { user } = useAuth();

  const [services, setServices] = useState([]);
  const [activeServiceId, setActiveServiceId] = useState(serviceId || '');

  // Fetch all services if serviceId is not in route or for selector
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await serviceService.getServices();
        if (res.success && res.data.length > 0) {
          setServices(res.data);
          if (!activeServiceId) {
            setActiveServiceId(res.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Error loading services for queue:', err);
      }
    };

    fetchServices();
  }, [activeServiceId]);

  // Hook handles auto-polling every 5 seconds
  const { queueData, loading, error, refresh, isPolling, setIsPolling } = useQueue(
    activeServiceId,
    5000
  );

  return (
    <div className="container" style={{ padding: '36px 20px', maxWidth: '1000px' }}>
      {/* Page Title & Service Switcher */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '28px',
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary-600)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
            <Compass size={16} /> Live Counter Display
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary-900)' }}>
            Digital Queue Tracker
          </h1>
        </div>

        {/* Controls: Service Selector & Polling Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {services.length > 0 && (
            <select
              className="form-select"
              style={{ width: '220px' }}
              value={activeServiceId}
              onChange={(e) => setActiveServiceId(e.target.value)}
            >
              {services.map((svc) => (
                <option key={svc._id} value={svc._id}>
                  {svc.name} ({svc.code})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setIsPolling(!isPolling)}
            className="btn btn-secondary btn-sm"
            title={isPolling ? 'Pause real-time updates' : 'Resume real-time updates'}
          >
            {isPolling ? <Pause size={14} /> : <Play size={14} />}
            {isPolling ? 'Live' : 'Paused'}
          </button>

          <button onClick={refresh} className="btn btn-secondary btn-sm" title="Refresh manually">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Connecting to live counter queue..." />
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#b91c1c' }}>
          <h3>Unable to fetch queue status</h3>
          <p>{error}</p>
          <button onClick={refresh} className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>
            Retry Connection
          </button>
        </div>
      ) : !queueData ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>No queue data available.</p>
        </div>
      ) : (
        <>
          {/* Main Board: Currently Serving Hero */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
            color: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: '36px',
            textAlign: 'center',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-xl)',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '16px',
            }}>
              Now Serving at {queueData.service?.counterName}
            </div>

            <div style={{
              fontSize: '64px',
              fontWeight: 900,
              fontFamily: 'monospace',
              letterSpacing: '3px',
              color: queueData.currentlyServing ? '#93c5fd' : '#94a3b8',
              lineHeight: 1,
              marginBottom: '12px',
            }}>
              {queueData.currentlyServing?.tokenNumber || 'NO ACTIVE TOKEN'}
            </div>

            <div style={{ fontSize: '16px', opacity: 0.9 }}>
              {queueData.currentlyServing ? (
                <>
                  Holder: <strong>{queueData.currentlyServing.userName}</strong> • Slot: {queueData.currentlyServing.timeSlot}
                </>
              ) : (
                'Counter officer is currently available or preparing for the next student'
              )}
            </div>
          </div>

          {/* Metric Stats Strip */}
          <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '32px' }}>
            <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>In Queue</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
                {queueData.totalWaiting}
              </div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Served Today</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                {queueData.totalCompleted}
              </div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Skipped</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#ea580c', marginTop: '4px' }}>
                {queueData.totalSkipped}
              </div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Avg Service Time</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary-600)', marginTop: '4px' }}>
                ~{queueData.service?.estimatedDurationMin}m
              </div>
            </div>
          </div>

          {/* Waiting Queue List */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Next in Queue ({queueData.waitingList.length})</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Sorted by arrival sequence • Last updated: {new Date(queueData.lastUpdated).toLocaleTimeString()}
              </span>
            </div>

            {queueData.waitingList.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                🎉 The queue is currently empty! No students waiting at this counter.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Position</th>
                      <th>Token</th>
                      <th>Student</th>
                      <th>Scheduled Slot</th>
                      <th>Status</th>
                      <th>People Ahead</th>
                      <th>Est. Wait Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queueData.waitingList.map((item, idx) => (
                      <tr key={item.id} style={{
                        backgroundColor: idx === 0 ? 'var(--primary-50)' : 'transparent',
                      }}>
                        <td style={{ fontWeight: 800, color: idx === 0 ? 'var(--primary-700)' : 'var(--text-muted)' }}>
                          #{idx + 1}
                        </td>
                        <td>
                          <span className="token-badge" style={{ fontSize: '15px', color: 'var(--primary-800)' }}>
                            {item.tokenNumber}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{item.userName}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{item.timeSlot}</td>
                        <td>
                          <StatusBadge status={item.status} />
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          {item.positionAhead === 0 ? 'Next up!' : `${item.positionAhead} ahead`}
                        </td>
                        <td style={{ fontWeight: 700, color: item.estimatedWaitMin <= 10 ? '#16a34a' : 'var(--text-main)' }}>
                          ~{item.estimatedWaitMin} mins
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default QueueTrackingPage;

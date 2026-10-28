import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { serviceService } from '../services/serviceService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  Layers,
  Search,
  Clock,
  MapPin,
  Calendar,
  Compass,
  ArrowRight,
} from 'lucide-react';

export const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Academic', 'Financial', 'Administrative', 'Library'];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await serviceService.getServices({
          category: selectedCategory,
          search: search.trim() || undefined,
        });
        if (res.success) {
          setServices(res.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [selectedCategory, search]);

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Title & Search bar */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary-900)', marginBottom: '8px' }}>
          University Administrative Services
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
          Browse available service counters, view operating hours, and book appointment slots.
        </p>

        {/* Filter Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '24px',
        }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="btn btn-sm"
                style={{
                  backgroundColor: selectedCategory === cat ? 'var(--primary-600)' : 'white',
                  color: selectedCategory === cat ? 'white' : 'var(--text-main)',
                  borderColor: selectedCategory === cat ? 'var(--primary-600)' : 'var(--border-medium)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-light)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search services or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <LoadingSpinner message="Fetching campus services..." />
      ) : services.length === 0 ? (
        <EmptyState
          title="No matching services"
          description="Try adjusting your search terms or selecting a different category filter."
          actionLabel="Reset Filters"
          onAction={() => {
            setSelectedCategory('All');
            setSearch('');
          }}
        />
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {services.map((svc) => (
            <div key={svc._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '4px 8px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--primary-100)',
                    color: 'var(--primary-700)',
                    fontFamily: 'monospace',
                  }}>
                    {svc.code}
                  </span>

                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {svc.category}
                  </span>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary-900)', marginBottom: '8px' }}>
                  {svc.name}
                </h3>

                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
                  {svc.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} color="var(--primary-500)" />
                    <span>{svc.counterName}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} color="var(--primary-500)" />
                    <span>
                      {svc.operatingHours?.start} - {svc.operatingHours?.end} ({svc.estimatedDurationMin} min avg)
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                <Link
                  to={`/book?serviceId=${svc._id}`}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                >
                  <Calendar size={16} /> Book Slot
                </Link>
                <Link
                  to={`/services/${svc._id}`}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  <Compass size={16} /> Details & Queue
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesPage;

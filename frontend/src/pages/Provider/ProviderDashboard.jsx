import { useEffect, useState } from 'react';
import { getMyBookings, updateProfile } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Layout from '../../components/Layout/Layout';
import BookingCard from '../../components/Cards/BookingCard';
import { Link } from 'react-router-dom';

export default function ProviderDashboard() {
  const { user, refreshUser } = useAuth();
  const { subscribe } = useSocket() || {};
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [filter, setFilter] = useState('active');

  const fetchBookings = async () => {
    try {
      const { data } = await getMyBookings();
      setBookings(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  useEffect(() => {
    if (!subscribe) return;
    const unsub = subscribe('booking_updated', fetchBookings);
    return unsub;
  }, [subscribe]);

  const toggleAvailability = async () => {
    setToggling(true);
    try {
      await updateProfile({ isAvailable: !user.isAvailable });
      await refreshUser();
    } catch (e) { alert('Failed to update availability'); }
    finally { setToggling(false); }
  };

  const active = bookings.filter(b => ['accepted','confirmed','in_progress'].includes(b.status));
  const filtered = filter === 'active'
    ? active
    : filter === 'all' ? bookings
    : bookings.filter(b => b.status === filter);

  const isApproved = user?.isApproved;

  return (
    <Layout>
      <div className="container">
        <div className="page-header">
          <h1>Provider Dashboard</h1>
          <p>{user?.name} · {user?.services?.map(s => s.name || s).join(', ')}</p>
        </div>

        {!isApproved && (
          <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
            ⏳ Your account is pending admin approval. You won't receive requests until approved.
          </div>
        )}

        {/* Availability toggle */}
        <div className="availability-bar">
          <div>
            <div style={{ fontWeight: 600 }}>Availability Status</div>
            <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>
              {user?.isEngaged ? '🔴 Currently engaged with a job' : user?.isAvailable ? '🟢 Accepting new requests' : '🔴 Not accepting requests'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {user?.isAvailable ? 'Available' : 'Unavailable'}
            </span>
            <div
              className={`toggle ${user?.isAvailable ? 'on' : ''}`}
              onClick={!toggling && !user?.isEngaged ? toggleAvailability : undefined}
              style={{ cursor: user?.isEngaged ? 'not-allowed' : 'pointer', opacity: toggling ? 0.5 : 1 }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid-4 mb-3">
          {[
            { icon: '💼', value: user?.totalJobs || 0, label: 'Total Jobs' },
            { icon: '⚡', value: active.length, label: 'Active Jobs' },
            { icon: '✅', value: bookings.filter(b=>b.status==='completed').length, label: 'Completed' },
            { icon: '💰', value: `₹${user?.visitCharges || 0}`, label: 'Visit Charges' },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick action */}
        <div className="card card-gold mb-3" style={{ background: 'linear-gradient(135deg, rgba(212,160,23,0.08), rgba(212,160,23,0.03))' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3>Check Nearby Requests</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Browse pending requests within your service radius</p>
            </div>
            <Link to="/provider/requests" className="btn btn-gold">📍 Find Requests</Link>
          </div>
        </div>

        {/* Booking list */}
        <div className="tabs">
          {['active','all','pending','confirmed','in_progress','completed'].map((t) => (
            <button key={t} className={`tab-btn ${filter===t?'active':''}`} onClick={() => setFilter(t)}>
              {t.replace('_',' ').replace(/^\w/,c=>c.toUpperCase())}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No jobs here</h3>
            <p>Accepted jobs will appear here</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map((b) => (
              <BookingCard key={b._id} booking={b} role="provider" onUpdate={fetchBookings} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
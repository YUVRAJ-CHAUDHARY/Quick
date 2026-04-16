import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookings } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Layout from '../../components/Layout/Layout';
import BookingCard from '../../components/Cards/BookingCard';

export default function ClientDashboard() {
  const { user } = useAuth();
  const { subscribe } = useSocket() || {};
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchBookings = async () => {
    try {
      const { data } = await getMyBookings();
      setBookings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  useEffect(() => {
    if (!subscribe) return;
    const unsub1 = subscribe('booking_accepted', fetchBookings);
    const unsub2 = subscribe('booking_updated', fetchBookings);
    return () => { unsub1?.(); unsub2?.(); };
  }, [subscribe]);

  const active = bookings.filter((b) => ['pending','accepted','confirmed','in_progress'].includes(b.status));
  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <Layout>
      <div className="container">
        <div className="page-header">
          <h1>Welcome, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Manage your service requests and bookings</p>
        </div>

        {/* Stats */}
        <div className="grid-4 mb-3">
          {[
            { icon: '📋', value: bookings.length, label: 'Total Requests' },
            { icon: '⏳', value: active.length, label: 'Active' },
            { icon: '✅', value: bookings.filter(b=>b.status==='completed').length, label: 'Completed' },
            { icon: '❌', value: bookings.filter(b=>['cancelled','rejected'].includes(b.status)).length, label: 'Cancelled' },
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
              <h3>Need a service?</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Post a new service request and get matched with nearby providers</p>
            </div>
            <Link to="/client/request" className="btn btn-gold">+ New Request</Link>
          </div>
        </div>

        {/* Booking list */}
        <div className="tabs">
          {['all','pending','accepted','confirmed','in_progress','completed','cancelled'].map((t) => (
            <button key={t} className={`tab-btn ${filter===t?'active':''}`} onClick={() => setFilter(t)}>
              {t.replace('_',' ').replace(/^\w/, c => c.toUpperCase())}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No bookings found</h3>
            <p>Your service requests will appear here</p>
            <Link to="/client/request" className="btn btn-gold mt-2">Make a Request</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map((b) => (
              <BookingCard key={b._id} booking={b} role="client" onUpdate={fetchBookings} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
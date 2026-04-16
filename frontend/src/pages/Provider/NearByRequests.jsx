import { useState, useEffect } from 'react';
import { getPendingNearby } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Layout from '../../components/Layout/Layout';
import BookingCard from '../../components/Cards/BookingCard';

export default function NearbyRequests() {
  const { user } = useAuth();
  const { subscribe } = useSocket() || {};
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState({ lat: '', lng: '' });
  const [radius, setRadius] = useState(10);
  const [locSet, setLocSet] = useState(false);
  const [error, setError] = useState('');

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude.toString(), lng: pos.coords.longitude.toString() });
        setLocSet(true);
      },
      () => {
        // Fallback to user's stored location
        if (user?.location?.coordinates) {
          const [lng, lat] = user.location.coordinates;
          setCoords({ lat: lat.toString(), lng: lng.toString() });
          setLocSet(true);
        } else {
          setError('Please enable location access.');
        }
      }
    );
  };

  const fetchRequests = async () => {
    if (!coords.lat || !coords.lng) return getLocation();
    setLoading(true);
    setError('');
    try {
      const { data } = await getPendingNearby({ lat: coords.lat, lng: coords.lng, radius });
      setRequests(data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (locSet) fetchRequests();
  }, [locSet]);

  useEffect(() => {
    if (!subscribe) return;
    const unsub = subscribe('new_booking', fetchRequests);
    const unsub2 = subscribe('booking_updated', fetchRequests);
    return () => { unsub?.(); unsub2?.(); };
  }, [subscribe, coords]);

  if (!user?.isApproved) {
    return (
      <Layout>
        <div className="container">
          <div className="empty-state" style={{ marginTop: '4rem' }}>
            <div className="empty-icon">⏳</div>
            <h3>Account Pending Approval</h3>
            <p>An admin must approve your account before you can view and accept requests.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container">
        <div className="page-header">
          <h1>Nearby Requests</h1>
          <p>Pending service requests within {radius}km of your location</p>
        </div>

        {/* Controls */}
        <div className="card mb-3">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Search Radius</label>
              <select value={radius} onChange={(e) => setRadius(Number(e.target.value))}>
                {[1, 2, 5, 10, 20].map(r => <option key={r} value={r}>{r} km</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Your Location</label>
              <input
                placeholder="Latitude"
                value={coords.lat}
                onChange={(e) => setCoords(c => ({ ...c, lat: e.target.value }))}
              />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Longitude</label>
              <input
                placeholder="Longitude"
                value={coords.lng}
                onChange={(e) => setCoords(c => ({ ...c, lng: e.target.value }))}
              />
            </div>
            <button className="btn btn-gold" onClick={fetchRequests} disabled={loading}>
              {loading ? 'Searching...' : '🔍 Find Requests'}
            </button>
            <button className="btn btn-outline" onClick={getLocation}>📍 Use My Location</button>
          </div>

          {coords.lat && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--success)' }}>
              📍 Location: {parseFloat(coords.lat).toFixed(4)}, {parseFloat(coords.lng).toFixed(4)}
            </div>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Real-time indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <div className="notif-dot" />
          Live — new requests appear automatically
        </div>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No pending requests nearby</h3>
            <p>New requests will appear here in real-time once clients post them.</p>
            <button className="btn btn-outline mt-2" onClick={fetchRequests}>Refresh</button>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Found {requests.length} pending request{requests.length !== 1 ? 's' : ''}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {requests.map((b) => (
                <BookingCard key={b._id} booking={b} role="provider" onUpdate={fetchRequests} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
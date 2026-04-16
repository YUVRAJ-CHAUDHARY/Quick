import { useEffect, useState } from 'react';
import { getAllBookings } from '../../api';
import Layout from '../../components/Layout/Layout';

const statusLabel = (s) => s.replace('_', ' ').replace(/^\w/, c => c.toUpperCase());

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAllBookings()
      .then(r => setBookings(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings
    .filter(b => filter === 'all' ? true : b.status === filter)
    .filter(b => !search ||
      b.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.service?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b._id?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <Layout>
      <div className="container">
        <div className="page-header">
          <h1>All Bookings</h1>
          <p>{bookings.length} total bookings on the platform</p>
        </div>

        {/* Stats row */}
        <div className="grid-4 mb-3">
          {[
            { label: 'Total', value: bookings.length, status: 'all' },
            { label: 'Active', value: bookings.filter(b => ['pending','accepted','confirmed','in_progress'].includes(b.status)).length, status: 'pending' },
            { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, status: 'completed' },
            { label: 'Cancelled', value: bookings.filter(b => ['cancelled','rejected'].includes(b.status)).length, status: 'cancelled' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilter(s.status)}>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="tabs" style={{ margin: 0, flex: 1 }}>
            {['all','pending','accepted','confirmed','in_progress','completed','cancelled'].map(t => (
              <button key={t} className={`tab-btn ${filter===t?'active':''}`} onClick={() => setFilter(t)}>
                {statusLabel(t)}
              </button>
            ))}
          </div>
          <input
            placeholder="Search client, service, ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 260 }}
          />
        </div>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Service</th>
                    <th>Client</th>
                    <th>Provider</th>
                    <th>Charges</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                        #{b._id?.slice(-8).toUpperCase()}
                      </td>
                      <td>
                        <span>{b.service?.icon} {b.service?.name}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                          {b.client?.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {b.client?.email}
                        </div>
                      </td>
                      <td>
                        {b.provider ? (
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                            {b.provider?.name}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--gold)', fontWeight: 600 }}>
                        {b.visitCharges > 0 ? `₹${b.visitCharges}` : '—'}
                      </td>
                      <td>
                        <span className={`badge badge-${b.status}`}>{statusLabel(b.status)}</span>
                      </td>
                      <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                        {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No bookings found</h3>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
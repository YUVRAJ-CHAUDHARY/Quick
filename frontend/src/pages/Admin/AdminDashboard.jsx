import { useEffect, useState } from 'react';
import { getAdminStats } from '../../api';
import Layout from '../../components/Layout/Layout';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { icon: '👤', value: stats.totalUsers, label: 'Total Clients', color: 'var(--info)' },
    { icon: '🔧', value: stats.totalProviders, label: 'Total Providers', color: 'var(--gold)' },
    { icon: '⏳', value: stats.pendingApprovals, label: 'Pending Approvals', color: 'var(--warning)' },
    { icon: '📋', value: stats.totalBookings, label: 'Total Bookings', color: 'var(--text-primary)' },
    { icon: '⚡', value: stats.activeBookings, label: 'Active Bookings', color: '#a855f7' },
    { icon: '✅', value: stats.completedBookings, label: 'Completed', color: 'var(--success)' },
  ] : [];

  return (
    <Layout>
      <div className="container">
        <div className="page-header">
          <h1>Admin Dashboard</h1>
          <p>Platform overview and management</p>
        </div>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : (
          <>
            <div className="grid-3 mb-3">
              {cards.map((c) => (
                <div key={c.label} className="stat-card">
                  <div className="stat-icon">{c.icon}</div>
                  <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
                  <div className="stat-label">{c.label}</div>
                </div>
              ))}
            </div>

            {stats.pendingApprovals > 0 && (
              <div className="alert alert-info mb-3">
                ⚠️ {stats.pendingApprovals} provider{stats.pendingApprovals > 1 ? 's' : ''} awaiting approval.{' '}
                <Link to="/admin/users" style={{ fontWeight: 700 }}>Review now →</Link>
              </div>
            )}

            {/* Quick Nav */}
            <div className="grid-3">
              {[
                { to: '/admin/users', icon: '👥', title: 'Manage Users', desc: 'View, approve and manage all users and providers' },
                { to: '/admin/bookings', icon: '📋', title: 'All Bookings', desc: 'Monitor all service requests and their statuses' },
                { to: '/admin/services', icon: '⚙️', title: 'Service Categories', desc: 'Add, edit, or remove service categories' },
              ].map((item) => (
                <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ height: '100%', cursor: 'pointer' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{item.icon}</div>
                    <h3 style={{ marginBottom: '0.4rem' }}>{item.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
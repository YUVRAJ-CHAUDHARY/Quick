import { useEffect, useState } from 'react';
import { getAllUsers, approveProvider, toggleUserStatus } from '../../api';
import Layout from '../../components/Layout/Layout';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    getAllUsers()
      .then(r => setUsers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleApprove = async (id) => {
    try { await approveProvider(id); fetchUsers(); }
    catch (e) { alert(e.response?.data?.message || 'Failed'); }
  };

  const handleToggle = async (id) => {
    try { await toggleUserStatus(id); fetchUsers(); }
    catch (e) { alert(e.response?.data?.message || 'Failed'); }
  };

  const filtered = users
    .filter(u => filter === 'all' ? true : u.role === filter)
    .filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout>
      <div className="container">
        <div className="page-header">
          <h1>Manage Users</h1>
          <p>{users.length} registered users</p>
        </div>

        {/* Filter + Search */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div className="tabs" style={{ margin: 0 }}>
            {['all','client','provider'].map(t => (
              <button key={t} className={`tab-btn ${filter===t?'active':''}`} onClick={() => setFilter(t)}>
                {t.charAt(0).toUpperCase()+t.slice(1)}
              </button>
            ))}
          </div>
          <input
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 280 }}
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
                    <th>User</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Services</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.8rem', flexShrink: 0 }}>
                            {u.name[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{u.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ textTransform: 'capitalize', color: u.role === 'provider' ? 'var(--gold)' : 'var(--text-secondary)' }}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.phone}</td>
                      <td style={{ fontSize: '0.82rem' }}>
                        {u.role === 'provider' ? (u.services?.map(s=>s.name||s).join(', ') || '—') : '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {u.role === 'provider' && (
                            <span className={`badge ${u.isApproved ? 'badge-completed' : 'badge-pending'}`}>
                              {u.isApproved ? 'Approved' : 'Pending'}
                            </span>
                          )}
                          <span className={`badge ${u.isActive ? 'badge-completed' : 'badge-cancelled'}`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {u.role === 'provider' && !u.isApproved && (
                            <button className="btn btn-success btn-sm" onClick={() => handleApprove(u._id)}>
                              ✓ Approve
                            </button>
                          )}
                          <button
                            className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                            onClick={() => handleToggle(u._id)}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="empty-state"><div className="empty-icon">👥</div><h3>No users found</h3></div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
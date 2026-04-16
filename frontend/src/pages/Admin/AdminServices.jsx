import { useEffect, useState } from 'react';
import { getServices, createService, updateService, deleteService } from '../../api';
import Layout from '../../components/Layout/Layout';
import Modal from '../../components/Modal/Modal';

const emptyForm = { name: '', description: '', icon: '🔧', basePrice: '' };

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchServices = () => {
    setLoading(true);
    getServices()
      .then(r => setServices(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchServices(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (svc) => {
    setEditTarget(svc);
    setForm({ name: svc.name, description: svc.description, icon: svc.icon, basePrice: svc.basePrice });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return setError('Service name is required');
    setSaving(true);
    setError('');
    try {
      if (editTarget) {
        await updateService(editTarget._id, form);
      } else {
        await createService(form);
      }
      fetchServices();
      setModalOpen(false);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this service?')) return;
    try {
      await deleteService(id);
      fetchServices();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed');
    }
  };

  const ICON_OPTIONS = ['🔧','⚡','🪚','🎨','🧹','❄️','🐛','🔒','🚿','🏗️','📦','🌿'];

  return (
    <Layout>
      <div className="container">
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1>Service Categories</h1>
            <p>Manage what services are available on the platform</p>
          </div>
          <button className="btn btn-gold" onClick={openCreate}>+ Add Service</button>
        </div>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : (
          <div className="grid-3">
            {services.map(svc => (
              <div key={svc._id} className="card" style={{ transition: 'var(--transition)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '2.5rem' }}>{svc.icon}</div>
                  <span className={`badge ${svc.isActive ? 'badge-completed' : 'badge-cancelled'}`}>
                    {svc.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h3 style={{ marginBottom: '0.35rem' }}>{svc.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  {svc.description}
                </p>
                {svc.basePrice > 0 && (
                  <div style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem' }}>
                    from ₹{svc.basePrice}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(svc)}>✏️ Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(svc._id)}>🗑 Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editTarget ? 'Edit Service' : 'Add New Service'}
        >
          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <div className="form-group">
            <label>Choose Icon</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {ICON_OPTIONS.map(ic => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, icon: ic }))}
                  style={{
                    width: 42, height: 42, borderRadius: 'var(--radius-sm)', fontSize: '1.3rem',
                    background: form.icon === ic ? 'var(--gold-glow)' : 'var(--bg-elevated)',
                    border: `2px solid ${form.icon === ic ? 'var(--gold)' : 'var(--border)'}`,
                    cursor: 'pointer', transition: 'var(--transition)',
                  }}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Service Name *</label>
            <input
              placeholder="e.g. Electrician"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows={2}
              placeholder="Short description..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label>Base Price (₹)</label>
            <input
              type="number"
              placeholder="0"
              min="0"
              value={form.basePrice}
              onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button className="btn btn-gold" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editTarget ? 'Update Service' : 'Create Service'}
            </button>
            <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
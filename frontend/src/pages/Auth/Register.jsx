import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getServices } from '../../api';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    role: 'client', address: '', lat: '', lng: '',
    visitCharges: '', services: [],
  });

  useEffect(() => {
    getServices().then((r) => setServices(r.data)).catch(() => {});
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleService = (id) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(id)
        ? prev.services.filter((s) => s !== id)
        : [...prev.services, id],
    }));
  };

  const getLocation = () => {
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({ ...f, lat: pos.coords.latitude.toString(), lng: pos.coords.longitude.toString() }));
        setLocLoading(false);
      },
      () => { alert('Could not get location. Enter manually.'); setLocLoading(false); }
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.lat || !form.lng) return setError('Please provide your location.');
    if (form.role === 'provider' && form.services.length === 0)
      return setError('Please select at least one service.');
    setError(''); setLoading(true);
    try {
      const data = await register(form);
      if (data.role === 'provider') navigate('/provider');
      else navigate('/client');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at center, rgba(212,160,23,0.05) 0%, transparent 70%), var(--bg-primary)', padding: '5rem 1rem 2rem' }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            ⚡ Quick.
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Create your account</p>
        </div>

        <div className="card card-gold fade-in">
          {/* Role Toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '0.3rem', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
            {['client', 'provider'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setForm({ ...form, role: r })}
                style={{
                  flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)',
                  background: form.role === r ? 'var(--gold)' : 'transparent',
                  color: form.role === r ? '#000' : 'var(--text-secondary)',
                  fontWeight: form.role === r ? 700 : 500, fontSize: '0.9rem',
                  transition: 'var(--transition)',
                }}
              >
                {r === 'client' ? '👤 I need a service' : '🔧 I provide services'}
              </button>
            ))}
          </div>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <form onSubmit={onSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input name="name" placeholder="John Doe" value={form.name} onChange={onChange} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" placeholder="9876543210" value={form.phone} onChange={onChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={onChange} required />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" placeholder="Min 6 characters" value={form.password} onChange={onChange} required minLength={6} />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input name="address" placeholder="Your area / street" value={form.address} onChange={onChange} />
            </div>

            {/* Location */}
            <div className="form-group">
              <label>Your Location</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input name="lat" placeholder="Latitude" value={form.lat} onChange={onChange} required style={{ flex: 1 }} />
                <input name="lng" placeholder="Longitude" value={form.lng} onChange={onChange} required style={{ flex: 1 }} />
                <button type="button" className="btn btn-outline btn-sm" onClick={getLocation} disabled={locLoading} style={{ whiteSpace: 'nowrap' }}>
                  {locLoading ? '...' : '📍 Auto'}
                </button>
              </div>
            </div>

            {/* Provider-only fields */}
            {form.role === 'provider' && (
              <>
                <div className="form-group">
                  <label>Visit Charges (₹)</label>
                  <input type="number" name="visitCharges" placeholder="e.g. 200" value={form.visitCharges} onChange={onChange} min="0" />
                </div>
                <div className="form-group">
                  <label>Services You Offer</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {services.map((svc) => (
                      <label
                        key={svc._id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.5rem',
                          background: form.services.includes(svc._id) ? 'var(--gold-glow)' : 'var(--bg-elevated)',
                          border: `1px solid ${form.services.includes(svc._id) ? 'var(--gold)' : 'var(--border)'}`,
                          borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.75rem',
                          cursor: 'pointer', fontSize: '0.85rem', transition: 'var(--transition)',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={form.services.includes(svc._id)}
                          onChange={() => toggleService(svc._id)}
                          style={{ width: 'auto' }}
                        />
                        {svc.icon} {svc.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="alert alert-info" style={{ fontSize: '0.82rem' }}>
                  ℹ️ Provider accounts require admin approval before going live.
                </div>
              </>
            )}

            <button type="submit" className="btn btn-gold w-full mt-2" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>

          <div className="divider">or</div>
          <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--gold)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getServices, createBooking, getNearbyProviders } from '../../api';
import Layout from '../../components/Layout/Layout';

export default function RequestService() {
  const locationState = useLocation().state;
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=select service, 2=location+details, 3=show nearby, 4=submitted
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(locationState?.service || null);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    description: '', address: '', lat: '', lng: '',
  });

  useEffect(() => {
    getServices().then((r) => setServices(r.data)).catch(() => {});
    if (locationState?.service) setStep(2);
  }, []);

  const getLocation = () => {
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({ ...f, lat: pos.coords.latitude.toString(), lng: pos.coords.longitude.toString() }));
        setLocLoading(false);
      },
      () => { alert('Location access denied. Please enter manually.'); setLocLoading(false); }
    );
  };

  const fetchNearbyProviders = async () => {
    if (!form.lat || !form.lng) return;
    try {
      const { data } = await getNearbyProviders({ serviceId: selectedService._id, lat: form.lat, lng: form.lng, radius: 10 });
      setProviders(data);
    } catch (e) { console.error(e); }
  };

  const handleServiceSelect = (svc) => {
    setSelectedService(svc);
    setStep(2);
  };

  const handleNext = async () => {
    if (!form.lat || !form.lng) return setError('Please provide your location first.');
    setError('');
    await fetchNearbyProviders();
    setStep(3);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await createBooking({
        serviceId: selectedService._id,
        description: form.description,
        address: form.address,
        lat: form.lat,
        lng: form.lng,
      });
      setStep(4);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container">
        <div className="page-header">
          <h1>Request a Service</h1>
          <p>Get matched with nearby professionals</p>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {['Select Service','Your Details','Nearby Providers','Confirmation'].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: step > i+1 ? 'var(--success)' : step === i+1 ? 'var(--gold)' : 'var(--bg-elevated)',
                border: `2px solid ${step >= i+1 ? 'var(--gold)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, color: step >= i+1 ? '#000' : 'var(--text-muted)',
                flexShrink: 0,
              }}>
                {step > i+1 ? '✓' : i+1}
              </div>
              <span style={{ fontSize: '0.82rem', color: step === i+1 ? 'var(--gold)' : 'var(--text-muted)' }}>{s}</span>
              {i < 3 && <span style={{ color: 'var(--border)', margin: '0 0.25rem' }}>›</span>}
            </div>
          ))}
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        {/* STEP 1: Choose service */}
        {step === 1 && (
          <div className="fade-in">
            <h2 style={{ marginBottom: '1.25rem', fontSize: '1.2rem' }}>What service do you need?</h2>
            <div className="grid-4">
              {services.map((svc) => (
                <div key={svc._id} className="service-card" onClick={() => handleServiceSelect(svc)}>
                  <div className="s-icon">{svc.icon}</div>
                  <h3>{svc.name}</h3>
                  <p>{svc.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Location + details */}
        {step === 2 && selectedService && (
          <div className="fade-in" style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem' }}>{selectedService.icon}</div>
              <div>
                <h2 style={{ fontSize: '1.2rem' }}>{selectedService.name}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{selectedService.description}</p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setStep(1)} style={{ marginLeft: 'auto' }}>Change</button>
            </div>

            <div className="card">
              <div className="form-group">
                <label>Describe the issue (optional)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Kitchen tap leaking, bathroom light not working..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label>Your Address</label>
                <input
                  placeholder="Street, Landmark, Area"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Your Location Coordinates</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input placeholder="Latitude" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} style={{ flex: 1 }} />
                  <input placeholder="Longitude" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} style={{ flex: 1 }} />
                  <button type="button" className="btn btn-outline btn-sm" onClick={getLocation} disabled={locLoading}>
                    {locLoading ? '...' : '📍'}
                  </button>
                </div>
                {form.lat && form.lng && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--success)' }}>
                    ✅ Location set: {parseFloat(form.lat).toFixed(4)}, {parseFloat(form.lng).toFixed(4)}
                  </div>
                )}
              </div>

              <button className="btn btn-gold" style={{ width: '100%' }} onClick={handleNext}>
                Find Nearby Providers →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Nearby providers */}
        {step === 3 && (
          <div className="fade-in" style={{ maxWidth: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.2rem' }}>
                {providers.length} Provider{providers.length !== 1 ? 's' : ''} Available Nearby
              </h2>
              <button className="btn btn-outline btn-sm" onClick={() => setStep(2)}>← Back</button>
            </div>

            {providers.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>😔</div>
                <h3>No providers available right now</h3>
                <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem', fontSize: '0.9rem' }}>
                  You can still post your request — providers will be notified
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {providers.map((p) => (
                  <div key={p._id} className="provider-card">
                    <div className="avatar" style={{ width: 48, height: 48, fontSize: '1.1rem' }}>
                      {p.name[0].toUpperCase()}
                    </div>
                    <div className="provider-info">
                      <div className="provider-name">{p.name}</div>
                      <div className="provider-meta">
                        ⭐ {p.rating || '4.5'} · {p.services?.map(s => s.name).join(', ')}
                      </div>
                      <div className="provider-meta">📍 {p.address || 'Nearby'}</div>
                    </div>
                    <div>
                      <div className="provider-charge">₹{p.visitCharges}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right' }}>visit charge</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="card card-gold" style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Post your request and the nearest available provider will accept it.
              </p>
              <button className="btn btn-gold btn-lg" style={{ width: '100%' }} onClick={handleSubmit} disabled={loading}>
                {loading ? 'Posting...' : '🚀 Post Service Request'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Success */}
        {step === 4 && (
          <div className="fade-in" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', padding: '3rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>Request Posted!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Nearby providers are being notified. You'll be alerted as soon as someone accepts your request.
            </p>
            <div className="card" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <div>✅ Service: <strong style={{ color: 'var(--text-primary)' }}>{selectedService?.name}</strong></div>
                <div>📍 Location: <strong style={{ color: 'var(--text-primary)' }}>{form.address || 'Your location'}</strong></div>
                <div>⏱️ Status: <span className="badge badge-pending">Pending</span></div>
              </div>
            </div>
            <button className="btn btn-gold btn-lg" style={{ width: '100%' }} onClick={() => navigate('/client')}>
              View My Bookings →
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
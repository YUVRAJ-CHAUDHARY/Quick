import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getServices } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout/Layout';

const steps = [
  { n: 1, icon: '📍', title: 'Post a Request', desc: 'Describe what you need and share your location' },
  { n: 2, icon: '🔔', title: 'Provider Accepts', desc: 'A nearby verified provider accepts your request' },
  { n: 3, icon: '✅', title: 'Confirm & Done', desc: 'Review visit charges, confirm, and the job is on!' },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);

  useEffect(() => {
    getServices().then((r) => setServices(r.data)).catch(() => {});
  }, []);

  const handleServiceClick = (svc) => {
    if (!user) return navigate('/login');
    if (user.role === 'client') navigate('/client/request', { state: { service: svc } });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">⚡ On-Demand Local Services</div>
            <h1>
              Get Any Service<br />
              <span className="highlight">Delivered Fast</span>
            </h1>
            <p>
              Connect with trusted local professionals — electricians, plumbers, carpenters and more — within minutes. Real-time matching based on your location.
            </p>
            <div className="hero-actions">
              {user ? (
                <Link
                  to={user.role === 'client' ? '/client' : user.role === 'provider' ? '/provider' : '/admin'}
                  className="btn btn-gold btn-lg"
                >
                  Go to Dashboard →
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-gold btn-lg">Get Started Free</Link>
                  <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="hero-visual">⚡</div>
      </section>

      {/* Services */}
      <section className="services-section">
        <div className="container">
          <div className="section-title">
            <h2>Our <span>Services</span></h2>
            <p>Expert professionals for every home service need</p>
          </div>
          <div className="grid-4">
            {services.map((svc) => (
              <div key={svc._id} className="service-card" onClick={() => handleServiceClick(svc)}>
                <div className="s-icon">{svc.icon}</div>
                <h3>{svc.name}</h3>
                <p>{svc.description}</p>
                {svc.basePrice > 0 && (
                  <div style={{ marginTop: '0.75rem', color: 'var(--gold)', fontWeight: 600, fontSize: '0.9rem' }}>
                    from ₹{svc.basePrice}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-section">
        <div className="container">
          <div className="section-title">
            <h2>How <span>It Works</span></h2>
            <p>Three simple steps to get your problem solved</p>
          </div>
          <div className="grid-3">
            {steps.map((s) => (
              <div key={s.n} className="step-card fade-in">
                <div className="step-number">{s.n}</div>
                <div style={{ fontSize: '2rem', margin: '0.75rem 0' }}>{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 0', textAlign: 'center', background: 'radial-gradient(ellipse at center, rgba(212,160,23,0.07) 0%, transparent 70%)' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            Ready to get started?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Join thousands of customers who trust Quick for their daily needs.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register?role=client" className="btn btn-gold btn-lg">I Need a Service</Link>
            <Link to="/register?role=provider" className="btn btn-outline btn-lg">Become a Provider</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '2rem 0', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <div className="container">
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>⚡ Quick.</span> © {new Date().getFullYear()} — On-Demand Local Services
        </div>
      </footer>
    </Layout>
  );
}
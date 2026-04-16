import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      if (data.role === 'admin') navigate('/admin');
      else if (data.role === 'provider') navigate('/provider');
      else navigate('/client');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at center, rgba(212,160,23,0.05) 0%, transparent 70%), var(--bg-primary)', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            ⚡ Quick.
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Welcome back</p>
        </div>

        <div className="card card-gold fade-in">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>Sign In</h2>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={onChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={onChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-gold w-full mt-2" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div className="divider">or</div>

          <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--gold)', fontWeight: 600 }}>Register here</Link>
          </p>

          {/* Quick demo hint */}
          <div style={{ marginTop: '1.5rem', padding: '0.85rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            🔐 <strong style={{ color: 'var(--gold)' }}>Admin:</strong> admin@quick.com / admin123
          </div>
        </div>
      </div>
    </div>
  );
}
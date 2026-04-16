import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navLinks = {
  client: [
    { to: '/client', label: 'Dashboard' },
    { to: '/client/request', label: 'Request Service' },
    { to: '/client/history', label: 'My Bookings' },
  ],
  provider: [
    { to: '/provider', label: 'Dashboard' },
    { to: '/provider/requests', label: 'Nearby Requests' },
    { to: '/provider/history', label: 'My Jobs' },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/bookings', label: 'Bookings' },
    { to: '/admin/services', label: 'Services' },
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          ⚡ Quick<span>.</span>
        </Link>

        <div className="navbar-links">
          {user &&
            navLinks[user.role]?.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
        </div>

        <div className="navbar-user">
          {user ? (
            <>
              <div className="avatar">{user.name?.[0]?.toUpperCase()}</div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {user.name?.split(' ')[0]}
              </span>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-gold btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
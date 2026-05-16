import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const navItems = [
  { to: '/',             label: 'Home',          icon: '♪' },
  { to: '/discover',     label: 'Discover',       icon: '◎' },
  { to: '/profile',      label: 'Profile',        icon: '◉' },
  { to: '/collab',       label: 'Collab',         icon: '⊕' },
];

export default function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop top nav */}
      <nav className="navbar glass">
        <div className="navbar-inner container">
          <Link to="/" className="navbar-logo">
            <span className="logo-icon">♪</span>
            <span className="logo-text">LIZI</span>
          </Link>

          <ul className="navbar-links">
            {navItems.map(item => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`nav-link ${location.pathname === item.to ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="navbar-actions">
            <Link to="/profile" className="btn-secondary">My Profile</Link>
          </div>

          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu glass">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`mobile-link ${location.pathname === item.to ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <span className="mobile-link-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      )}

      {/* Mobile bottom nav pill */}
      <nav className="bottom-nav glass">
        {navItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`bottom-nav-item ${location.pathname === item.to ? 'active' : ''}`}
          >
            <span className="bottom-icon">{item.icon}</span>
            <span className="bottom-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}

import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="footer-logo-icon">♪</span>
          <span className="footer-logo-text">LIZI</span>
          <p className="footer-tagline">Music for everyone. Made by everyone.</p>
        </div>

        <div className="footer-links-grid">
          <div className="footer-col">
            <h4 className="footer-col-title">Platform</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/discover">Discover</Link></li>
              <li><Link to="/collab">Collaborate</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-title">Artists</h4>
            <ul>
              <li><Link to="/profile">My Profile</Link></li>
              <li><a href="#">Upload Music</a></li>
              <li><a href="#">Open Stage</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-title">Community</h4>
            <ul>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Events</a></li>
              <li><a href="#">Support</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom container">
        <span>© 2026 LIZI. Built with ♪ for musicians everywhere.</span>
        <div className="footer-socials">
          <a href="#" aria-label="Instagram">◈</a>
          <a href="#" aria-label="Twitter">◇</a>
          <a href="#" aria-label="YouTube">▷</a>
        </div>
      </div>
    </footer>
  );
}

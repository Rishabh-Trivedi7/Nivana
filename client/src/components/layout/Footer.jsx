import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link to="/" className="footer__logo">Nivana</Link>
          <p className="footer__tagline">Curated Stays. Meaningful Experiences.</p>
        </div>

        <div className="footer__links">
          <div className="footer__col">
            <h4>Explore</h4>
            <Link to="/properties">All Stays</Link>
            <Link to="/properties?category=Wellness Retreats">Wellness</Link>
            <Link to="/properties?category=Mountain Escapes">Mountains</Link>
          </div>
          <div className="footer__col">
            <h4>Account</h4>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/bookings">My Bookings</Link>
            <Link to="/admin/login">Admin Login</Link>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Nivana. Crafted for meaningful travel.</p>
        </div>
      </div>
    </footer>
  );
}

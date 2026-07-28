import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../common/Button.jsx';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to={isAdmin ? '/admin' : '/'} className="navbar__logo">
          <span className="navbar__logo-icon" aria-hidden="true">◆</span>
          Nivana
        </Link>

        <nav className="navbar__nav" aria-label="Main navigation">
          {!isAdmin && <NavLink to="/properties" className="navbar__link">Stays</NavLink>}
          {isAuthenticated ? (
            <>
              {!isAdmin && (
                <>
                  <NavLink to="/bookings" className="navbar__link">My Bookings</NavLink>
                  <NavLink to="/wishlist" className="navbar__link">Wishlist</NavLink>
                </>
              )}
              {isAdmin ? (
                <NavLink to="/admin" className="navbar__link navbar__link--admin">Admin Dashboard</NavLink>
              ) : null}
            </>
          ) : null}
        </nav>

        <div className="navbar__actions">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="navbar__user">
                <span className="navbar__avatar" aria-hidden="true">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </span>
                {user?.fullName?.split(' ')[0]}
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

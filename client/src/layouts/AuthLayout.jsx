import { Outlet, Link } from 'react-router-dom';
import './AuthLayout.css';

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-layout__panel auth-layout__panel--brand">
        <Link to="/" className="auth-layout__logo">Nivana</Link>
        <h1 className="auth-layout__heading">Curated Stays.<br />Meaningful Experiences.</h1>
        <p className="auth-layout__text">
          Discover premium Indian wellness retreats, mountain lodges, heritage properties, and nature escapes — thoughtfully curated for the discerning traveller.
        </p>
      </div>
      <div className="auth-layout__panel auth-layout__panel--form">
        <Outlet />
      </div>
    </div>
  );
}

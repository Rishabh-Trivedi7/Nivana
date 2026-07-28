import { NavLink, Outlet } from 'react-router-dom';
import './AdminSidebar.css';

const LINKS = [
  { to: '/admin', label: '🏡 Overview', end: true },
  { to: '/admin/properties', label: '🏘️ My Properties' },
  { to: '/admin/bookings', label: '📋 Reservations' },
  { to: '/admin/reviews', label: '💬 Guest Reviews' },
];

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__header">
        <span className="admin-sidebar__label">Host Portal</span>
        <h2 className="admin-sidebar__title">Nivana</h2>
      </div>
      <nav className="admin-sidebar__nav">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export function AdminContent() {
  return (
    <div className="admin-content">
      <Outlet />
    </div>
  );
}

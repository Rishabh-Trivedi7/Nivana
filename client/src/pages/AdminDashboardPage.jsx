import { useEffect, useState } from 'react';
import { getStats } from '../services/adminService.js';
import { getNotifications, markAllAsRead } from '../services/notificationService.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import Loader from '../components/common/Loader.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import './AdminDashboardPage.css';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [statsRes, notifRes] = await Promise.all([
        getStats(),
        getNotifications().catch(() => ({ data: { notifications: [], unreadCount: 0 } })),
      ]);
      setStats(statsRes.data);
      setNotifications(notifRes.data?.notifications || []);
      setUnreadCount(notifRes.data?.unreadCount || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClearNotifications = async () => {
    try {
      await markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const formatMethod = (method) => {
    switch (method) {
      case 'upi': return 'UPI Instant';
      case 'credit_card': return 'Credit Card';
      case 'debit_card': return 'Debit Card';
      case 'net_banking': return 'Net Banking';
      default: return 'Online';
    }
  };

  if (loading) {
    return <Loader message="Loading host dashboard & notifications..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__header-bar">
        <h1 className="admin-dashboard__title">Host Overview</h1>
        {unreadCount > 0 && (
          <div className="admin-dashboard__notif-badge">
            🔔 {unreadCount} New Booking Notification{unreadCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Overview Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-card__label">Total Revenue</span>
          <span className="stat-card__val">{formatCurrency(stats.totalRevenue)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Total Reservations</span>
          <span className="stat-card__val">{stats.totalBookings}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Listed Properties</span>
          <span className="stat-card__val">{stats.totalProperties}</span>
        </div>
      </div>

      <div className="dashboard-layout">
        <div className="dashboard-layout__main">
          {/* Recent Payments Section */}
          <div className="dashboard-card">
            <h2 className="dashboard-card__title">Recent Payments</h2>
            {!stats.recentPayments || stats.recentPayments.length === 0 ? (
              <p className="dashboard-card__empty">No online transactions logged yet.</p>
            ) : (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Txn ID</th>
                    <th>Guest</th>
                    <th>Retreat</th>
                    <th>Method</th>
                    <th>Amount Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentPayments.map((p) => (
                    <tr key={p._id}>
                      <td className="dashboard-table__code">{p.transactionId || 'SIMULATED'}</td>
                      <td>{p.userId?.fullName || 'Guest'}</td>
                      <td>{p.propertyId?.title || 'Retreat'}</td>
                      <td>{formatMethod(p.paymentMethod)}</td>
                      <td className="dashboard-table__amount">{formatCurrency(p.amountPaid || p.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Upcoming Guests Section */}
          <div className="dashboard-card" style={{ marginTop: '2rem' }}>
            <h2 className="dashboard-card__title">Upcoming Guests</h2>
            {!stats.upcomingGuests || stats.upcomingGuests.length === 0 ? (
              <p className="dashboard-card__empty">No upcoming arrivals scheduled.</p>
            ) : (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Retreat</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.upcomingGuests.map((g) => (
                    <tr key={g._id}>
                      <td>{g.userId?.fullName || 'Guest'}</td>
                      <td>{g.propertyId?.title || 'Retreat'}</td>
                      <td>{formatDate(g.checkInDate)}</td>
                      <td>{formatDate(g.checkOutDate)}</td>
                      <td>
                        <span className="status-indicator status-indicator--confirmed">
                          Auto-Confirmed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Recent Bookings Section */}
          <div className="dashboard-card" style={{ marginTop: '2rem' }}>
            <h2 className="dashboard-card__title">All Recent Reservations</h2>
            {stats.recentBookings?.length === 0 ? (
              <p className="dashboard-card__empty">No reservations found.</p>
            ) : (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Retreat</th>
                    <th>Dates</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentBookings.map((b) => (
                    <tr key={b._id}>
                      <td>{b.userId?.fullName || 'Guest'}</td>
                      <td>{b.propertyId?.title || 'Retreat'}</td>
                      <td>
                        {formatDate(b.checkInDate)} – {formatDate(b.checkOutDate)}
                      </td>
                      <td>{formatCurrency(b.totalPrice)}</td>
                      <td>
                        <span className={`status-indicator status-indicator--${b.bookingStatus}`}>
                          {b.bookingStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Sidebar: Host Notifications + Top Rated Stays */}
        <div className="dashboard-layout__sidebar">
          {/* Notifications Card */}
          <div className="dashboard-card">
            <div className="dashboard-card__header-row">
              <h2 className="dashboard-card__title">Host Notifications</h2>
              {unreadCount > 0 && (
                <button className="dashboard-card__link-btn" onClick={handleClearNotifications}>
                  Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="dashboard-card__empty">No new notifications.</p>
            ) : (
              <div className="notifications-list">
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n._id}
                    className={`notification-item ${!n.isRead ? 'notification-item--unread' : ''}`}
                  >
                    <div className="notification-item__icon">🌿</div>
                    <div className="notification-item__body">
                      <h4 className="notification-item__title">{n.title}</h4>
                      <p className="notification-item__msg">{n.message}</p>
                      <span className="notification-item__time">
                        {new Date(n.createdAt).toLocaleDateString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Rated Stays Card */}
          <div className="dashboard-card" style={{ marginTop: '2rem' }}>
            <h2 className="dashboard-card__title">Top Rated Stays</h2>
            {stats.topRatedProperties?.length === 0 ? (
              <p className="dashboard-card__empty">No reviews yet for your properties.</p>
            ) : (
              <div className="top-properties-list">
                {stats.topRatedProperties.map((p) => (
                  <div key={p._id} className="top-property-item">
                    {p.images?.[0] && (
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="top-property-item__img"
                      />
                    )}
                    <div className="top-property-item__info">
                      <div className="top-property-item__name">{p.title}</div>
                      <div className="top-property-item__location">
                        {p.location}, {p.state}
                      </div>
                      <div className="top-property-item__rating">
                        ★ {p.averageRating.toFixed(1)}{' '}
                        <span>({p.totalReviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


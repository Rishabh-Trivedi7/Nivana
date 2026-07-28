import { useEffect, useState } from 'react';
import { getAdminBookings, updateBookingStatus } from '../services/bookingService.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import Loader from '../components/common/Loader.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import './AdminBookingsPage.css';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchBookingsList = async () => {
    try {
      const res = await getAdminBookings();
      setBookings(res.data.bookings);
    } catch (err) {
      setError(err.message || 'Failed to load booking reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingsList();
  }, []);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    if (!window.confirm(`Update booking status to "${newStatus}"?`)) {
      return;
    }
    setActionLoadingId(bookingId);
    setError('');
    try {
      await updateBookingStatus(bookingId, newStatus);
      await fetchBookingsList();
    } catch (err) {
      setError(err.message || 'Failed to update reservation status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const calculateNights = (inDate, outDate) => {
    const checkIn = new Date(inDate);
    const checkOut = new Date(outDate);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    return Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  };

  if (loading) {
    return <Loader message="Retrieving all reservations..." />;
  }

  return (
    <div className="admin-bookings">
      <h1 className="admin-bookings__title">Manage Bookings</h1>

      <ErrorMessage message={error} />

      <div className="bookings-table-wrap">
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Guest Details</th>
              <th>Selected Stay</th>
              <th>Stay Dates</th>
              <th>Total Cost</th>
              <th>Payment & Txn</th>
              <th>Booking Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => {
              const userObj = booking.userId;
              const propObj = booking.propertyId;
              if (!userObj || !propObj) return null;

              const nights = calculateNights(booking.checkInDate, booking.checkOutDate);

              return (
                <tr key={booking._id}>
                  <td>
                    <div className="booking-user-cell">
                      <span className="booking-user-cell__name">{userObj.fullName}</span>
                      <span className="booking-user-cell__email">{userObj.email}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{propObj.title}</td>
                  <td>
                    <div className="booking-dates-cell">
                      <span className="booking-dates-cell__range">
                        {formatDate(booking.checkInDate)} – {formatDate(booking.checkOutDate)}
                      </span>
                      <span className="booking-dates-cell__nights">
                        {nights} night{nights !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--color-forest)' }}>
                    {formatCurrency(booking.totalPrice)}
                  </td>
                  <td>
                    <div className="booking-dates-cell">
                      <span className={`status-indicator status-indicator--${booking.paymentStatus === 'paid' ? 'confirmed' : 'pending'}`}>
                        {booking.paymentStatus || 'Paid'}
                      </span>
                      {booking.transactionId && (
                        <span className="booking-dates-cell__nights" style={{ fontFamily: 'monospace', marginTop: '0.2rem' }}>
                          {booking.transactionId}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`status-indicator status-indicator--${booking.bookingStatus}`}>
                      {booking.bookingStatus}
                    </span>
                  </td>
                  <td>
                    <div className="booking-actions">
                      {booking.bookingStatus === 'pending' && (
                        <button
                          className="booking-action-btn booking-action-btn--confirm"
                          onClick={() => handleUpdateStatus(booking._id, 'confirmed')}
                          disabled={actionLoadingId !== null}
                        >
                          Confirm
                        </button>
                      )}
                      {booking.bookingStatus === 'confirmed' && (
                        <button
                          className="booking-action-btn booking-action-btn--complete"
                          onClick={() => handleUpdateStatus(booking._id, 'completed')}
                          disabled={actionLoadingId !== null}
                        >
                          Complete
                        </button>
                      )}
                      {['pending', 'confirmed'].includes(booking.bookingStatus) && (
                        <button
                          className="booking-action-btn booking-action-btn--cancel"
                          onClick={() => handleUpdateStatus(booking._id, 'cancelled')}
                          disabled={actionLoadingId !== null}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

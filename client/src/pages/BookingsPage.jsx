import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getUserBookings, cancelBooking } from '../services/bookingService.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import Loader from '../components/common/Loader.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import Button from '../components/common/Button.jsx';
import Toast from '../components/common/Toast.jsx';
import './BookingsPage.css';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const location = useLocation();
  const [toastMessage, setToastMessage] = useState(location.state?.message || '');

  const fetchBookings = async () => {
    try {
      const res = await getUserBookings();
      setBookings(res.data.bookings);
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) {
      return;
    }
    setCancellingId(bookingId);
    setError('');
    try {
      await cancelBooking(bookingId);
      await fetchBookings();
      setToastMessage('Booking cancelled successfully.');
    } catch (err) {
      setError(err.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
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
    return <Loader message="Retrieving your bookings..." />;
  }

  return (
    <div className="bookings-page">
      <div className="page-hero">
        <div className="container">
          <h1 className="page-hero__title">My Bookings</h1>
          <p className="page-hero__subtitle">Manage your upcoming stays and reservation requests.</p>
        </div>
      </div>

      <div className="container">
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />

        <ErrorMessage message={error} />

        {bookings.length === 0 ? (
          <div className="bookings-page__empty">
            <h2 className="bookings-page__empty-title">No Stays Found</h2>
            <p className="bookings-page__empty-desc">
              Discover unique retreats, wellness escapes, and tea estate experiences.
            </p>
            <Link to="/properties">
              <Button>Explore Retreats</Button>
            </Link>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => {
              const property = booking.propertyId;
              if (!property) return null;

              const img = property.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600';
              const nights = calculateNights(booking.checkInDate, booking.checkOutDate);

              return (
                <div key={booking._id} className="booking-card">
                  <div className="booking-card__image-wrap">
                    <img src={img} alt={property.title} className="booking-card__image" />
                  </div>
                  <div className="booking-card__body">
                    <div className="booking-card__header">
                      <div>
                        <span className="booking-card__category">{property.category}</span>
                        <Link to={`/properties/${property._id}`} className="booking-card__title-link">
                          <h3 className="booking-card__title">{property.title}</h3>
                        </Link>
                        <p className="booking-card__location">{property.location}, {property.state}</p>
                      </div>
                      <span className={`booking-card__status booking-card__status--${booking.bookingStatus}`}>
                        {booking.bookingStatus}
                      </span>
                    </div>

                    <div className="booking-card__details">
                      <div className="booking-card__detail-item">
                        <span className="booking-card__detail-label">Check-in</span>
                        <span className="booking-card__detail-val">{formatDate(booking.checkInDate)}</span>
                      </div>
                      <div className="booking-card__detail-item">
                        <span className="booking-card__detail-label">Check-out</span>
                        <span className="booking-card__detail-val">{formatDate(booking.checkOutDate)}</span>
                      </div>
                      <div className="booking-card__detail-item">
                        <span className="booking-card__detail-label">Duration</span>
                        <span className="booking-card__detail-val">{nights} night{nights !== 1 ? 's' : ''}</span>
                      </div>
                      {booking.transactionId && (
                        <div className="booking-card__detail-item">
                          <span className="booking-card__detail-label">Transaction ID</span>
                          <span className="booking-card__txn-code">{booking.transactionId}</span>
                        </div>
                      )}
                    </div>

                    <div className="booking-card__footer">
                      <div className="booking-card__price-wrap">
                        <span className="booking-card__price-label">Total Paid</span>
                        <span className="booking-card__price-val">{formatCurrency(booking.totalPrice)}</span>
                      </div>

                      {['pending', 'confirmed'].includes(booking.bookingStatus) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(booking._id)}
                          loading={cancellingId === booking._id}
                          disabled={cancellingId !== null}
                        >
                          Cancel Stay
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

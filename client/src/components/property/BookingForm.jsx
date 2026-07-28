import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { checkAvailability } from '../../services/bookingService.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { todayISO } from '../../utils/calculateNights.js';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';
import PaymentModal from '../booking/PaymentModal.jsx';
import './BookingForm.css';

export default function BookingForm({ property }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [availability, setAvailability] = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // If the property is booked right now (today falls inside an active booking window)
  const isCurrentlyBooked = !!property.isCurrentlyBooked;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  useEffect(() => {
    // Don't bother checking availability if property is blocked right now
    if (isCurrentlyBooked) return;
    if (!checkInDate || !checkOutDate || checkOutDate <= checkInDate) {
      setAvailability(null);
      return;
    }

    const timer = setTimeout(async () => {
      setChecking(true);
      setError('');
      try {
        const res = await checkAvailability(property._id, checkInDate, checkOutDate);
        setAvailability(res.data);
      } catch (err) {
        setAvailability(null);
        setError(err.message || 'This property is unavailable for the selected dates.');
      } finally {
        setChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [property._id, checkInDate, checkOutDate, isCurrentlyBooked]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    if (!checkInDate || !checkOutDate) {
      setError('Please select check-in and check-out dates');
      return;
    }

    if (!availability?.available) {
      setError('This property is unavailable for the selected dates.');
      return;
    }

    setShowPaymentModal(true);
  };

  const minCheckout = checkInDate
    ? new Date(new Date(checkInDate).getTime() + 86400000).toISOString().split('T')[0]
    : todayISO();

  // ── BLOCKED STATE: property is currently occupied ─────────────────────────
  if (isCurrentlyBooked) {
    return (
      <div className="booking-form">
        <div className="booking-form__header">
          <p className="booking-form__price">
            {formatCurrency(property.pricePerNight)}
            <span>/ night</span>
          </p>
        </div>
        <div className="booking-form__body">
          <div className="booking-form__booked-notice">
            <div className="booking-form__booked-icon">🔒</div>
            <h3 className="booking-form__booked-title">Currently Unavailable</h3>
            <p className="booking-form__booked-desc">
              This retreat is booked and unavailable right now.
              {property.activeBookingCheckOut && (
                <> It becomes available from{' '}
                  <strong>{formatDate(property.activeBookingCheckOut)}</strong>.
                </>
              )}
            </p>
            <p className="booking-form__booked-hint">
              You can still save it to your wishlist and come back when it's free.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── NORMAL BOOKING FORM ────────────────────────────────────────────────────
  return (
    <>
      <div className="booking-form">
        <div className="booking-form__header">
          <p className="booking-form__price">
            {formatCurrency(property.pricePerNight)}
            <span>/ night</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="booking-form__body" noValidate>
          <ErrorMessage message={error} />

          <Input
            label="Check-in"
            type="date"
            name="checkInDate"
            value={checkInDate}
            min={todayISO()}
            onChange={(e) => setCheckInDate(e.target.value)}
          />
          <Input
            label="Check-out"
            type="date"
            name="checkOutDate"
            value={checkOutDate}
            min={minCheckout}
            onChange={(e) => setCheckOutDate(e.target.value)}
          />

          {checking ? (
            <p className="booking-form__checking">Checking availability...</p>
          ) : null}

          {availability && !checking ? (
            <div className={`booking-form__summary ${availability.available ? '' : 'booking-form__summary--unavailable'}`}>
              {availability.available ? (
                <>
                  <div className="booking-form__row">
                    <span>{availability.nights} night{availability.nights !== 1 ? 's' : ''}</span>
                    <span>{formatCurrency(availability.subtotal || property.pricePerNight * availability.nights)}</span>
                  </div>
                  <div className="booking-form__row">
                    <span>GST (18%)</span>
                    <span>{formatCurrency(availability.taxAmount || 0)}</span>
                  </div>
                  <div className="booking-form__row booking-form__row--total">
                    <span>Total Price</span>
                    <span>{formatCurrency(availability.totalPrice)}</span>
                  </div>
                </>
              ) : (
                <p>This property is unavailable for the selected dates.</p>
              )}
            </div>
          ) : null}

          {isAuthenticated ? (
            <Button
              type="submit"
              fullWidth
              disabled={!availability?.available || checking}
            >
              Book Now
            </Button>
          ) : (
            <Link to="/login" state={{ from: location }}>
              <Button type="button" fullWidth>
                Sign in to Book
              </Button>
            </Link>
          )}

          <p className="booking-form__note">
            ⚡ Instant confirmation upon successful payment.
          </p>
        </form>
      </div>

      {showPaymentModal && (
        <PaymentModal
          property={property}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          availability={availability}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </>
  );
}


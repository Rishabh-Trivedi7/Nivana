import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency.js';
import Button from '../common/Button.jsx';
import './PaymentSuccess.css';

export default function PaymentSuccess({ booking, property, nights, onClose }) {
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleGoToBookings = () => {
    if (onClose) onClose();
    navigate('/bookings', {
      state: { message: 'Booking confirmed! Your stay has been reserved.' },
    });
  };

  return (
    <div className="payment-success">
      <div className="payment-success__badge">
        <div className="payment-success__checkmark">✓</div>
      </div>

      <span className="payment-success__tag">Payment Successful</span>
      <h2 className="payment-success__title">Booking Confirmed</h2>
      <p className="payment-success__subtitle">
        Your payment has been processed and your stay at {property.title} is locked in.
      </p>

      <div className="payment-success__card">
        <div className="payment-success__txn">
          <span className="payment-success__label">Transaction ID</span>
          <span className="payment-success__code">{booking.transactionId}</span>
        </div>

        <div className="payment-success__divider" />

        <div className="payment-success__grid">
          <div className="payment-success__item">
            <span className="payment-success__label">Property</span>
            <span className="payment-success__val">{property.title}</span>
          </div>

          <div className="payment-success__item">
            <span className="payment-success__label">Location</span>
            <span className="payment-success__val">{property.location}, {property.state}</span>
          </div>

          <div className="payment-success__item">
            <span className="payment-success__label">Check-in</span>
            <span className="payment-success__val">{formatDate(booking.checkInDate)}</span>
          </div>

          <div className="payment-success__item">
            <span className="payment-success__label">Check-out</span>
            <span className="payment-success__val">{formatDate(booking.checkOutDate)}</span>
          </div>

          <div className="payment-success__item">
            <span className="payment-success__label">Duration</span>
            <span className="payment-success__val">{nights} night{nights !== 1 ? 's' : ''}</span>
          </div>

          <div className="payment-success__item">
            <span className="payment-success__label">Amount Paid</span>
            <span className="payment-success__val payment-success__val--highlight">
              {formatCurrency(booking.amountPaid || booking.totalPrice)}
            </span>
          </div>
        </div>
      </div>

      <div className="payment-success__actions">
        <Button fullWidth onClick={handleGoToBookings}>
          Go To My Bookings
        </Button>
      </div>
    </div>
  );
}

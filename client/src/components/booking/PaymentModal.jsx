import { useState } from 'react';
import { initiatePayment } from '../../services/bookingService.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import PaymentProcessing from './PaymentProcessing.jsx';
import PaymentSuccess from './PaymentSuccess.jsx';
import PaymentFailed from './PaymentFailed.jsx';
import Button from '../common/Button.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';
import './PaymentModal.css';

const PAYMENT_METHODS = [
  {
    id: 'upi',
    name: 'UPI (Instant)',
    icon: '📱',
    desc: 'Google Pay, PhonePe, Paytm, BHIM',
  },
  {
    id: 'credit_card',
    name: 'Credit Card',
    icon: '💳',
    desc: 'Visa, Mastercard, Amex, RuPay',
  },
  {
    id: 'debit_card',
    name: 'Debit Card',
    icon: '💳',
    desc: 'All major Indian banks',
  },
  {
    id: 'net_banking',
    name: 'Net Banking',
    icon: '🏦',
    desc: 'HDFC, ICICI, SBI, Axis & more',
  },
];

export default function PaymentModal({
  property,
  checkInDate,
  checkOutDate,
  availability,
  onClose,
}) {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [status, setStatus] = useState('IDLE'); // IDLE | PROCESSING | SUCCESS | FAILED
  const [bookingData, setBookingData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const nights = availability?.nights || 1;
  const pricePerNight = availability?.pricePerNight || property.pricePerNight;
  const subtotal = availability?.subtotal || pricePerNight * nights;
  const taxAmount = availability?.taxAmount || Math.round(subtotal * 0.18);
  const totalAmount = availability?.totalPrice || subtotal + taxAmount;

  const handlePayNow = async () => {
    setStatus('PROCESSING');
    setErrorMsg('');

    const startTime = Date.now();

    try {
      const res = await initiatePayment({
        propertyId: property._id,
        checkInDate,
        checkOutDate,
        paymentMethod: selectedMethod,
      });

      // Ensure minimum 2.5 seconds processing animation
      const elapsedTime = Date.now() - startTime;
      const minDelay = 2500;
      if (elapsedTime < minDelay) {
        await new Promise((r) => setTimeout(r, minDelay - elapsedTime));
      }

      setBookingData(res.data.booking);
      setStatus('SUCCESS');
    } catch (err) {
      const elapsedTime = Date.now() - startTime;
      const minDelay = 2500;
      if (elapsedTime < minDelay) {
        await new Promise((r) => setTimeout(r, minDelay - elapsedTime));
      }

      setErrorMsg(err.message || 'Payment simulation failed. Please try again.');
      setStatus('FAILED');
    }
  };

  const handleRetry = () => {
    setStatus('IDLE');
    setErrorMsg('');
  };

  return (
    <div className="payment-modal-overlay" onClick={status === 'IDLE' ? onClose : undefined}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header with close button */}
        <div className="payment-modal__header">
          <div className="payment-modal__brand">
            <span className="payment-modal__logo-mark">🌿</span>
            <span className="payment-modal__logo-text">Nivana Checkout</span>
          </div>

          {status === 'IDLE' && (
            <button className="payment-modal__close-btn" onClick={onClose} aria-label="Close modal">
              ✕
            </button>
          )}
        </div>

        {/* Modal Body depending on status */}
        {status === 'PROCESSING' && <PaymentProcessing />}

        {status === 'SUCCESS' && bookingData && (
          <PaymentSuccess
            booking={bookingData}
            property={property}
            nights={nights}
            onClose={onClose}
          />
        )}

        {status === 'FAILED' && (
          <PaymentFailed
            errorMessage={errorMsg}
            onRetry={handleRetry}
            onCancel={onClose}
          />
        )}

        {status === 'IDLE' && (
          <div className="payment-modal__content">
            <h2 className="payment-modal__title">Complete Your Reservation</h2>
            <p className="payment-modal__subtitle">
              Review stay summary and select your preferred payment mode.
            </p>

            <ErrorMessage message={errorMsg} />

            <div className="payment-modal__layout">
              {/* Payment Methods */}
              <div className="payment-modal__section">
                <h3 className="payment-modal__section-title">1. Select Payment Method</h3>
                <div className="payment-methods-list">
                  {PAYMENT_METHODS.map((m) => (
                    <label
                      key={m.id}
                      className={`payment-method-card ${
                        selectedMethod === m.id ? 'payment-method-card--selected' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={m.id}
                        checked={selectedMethod === m.id}
                        onChange={() => setSelectedMethod(m.id)}
                        className="sr-only"
                      />
                      <span className="payment-method-card__icon">{m.icon}</span>
                      <div className="payment-method-card__info">
                        <span className="payment-method-card__name">{m.name}</span>
                        <span className="payment-method-card__desc">{m.desc}</span>
                      </div>
                      <div className="payment-method-card__radio">
                        {selectedMethod === m.id && <div className="payment-method-card__radio-inner" />}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Booking Summary */}
              <div className="payment-modal__section">
                <h3 className="payment-modal__section-title">2. Booking Summary</h3>
                <div className="booking-summary-card">
                  <div className="booking-summary-card__property">
                    {property.images?.[0] && (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="booking-summary-card__img"
                      />
                    )}
                    <div>
                      <h4 className="booking-summary-card__name">{property.title}</h4>
                      <p className="booking-summary-card__loc">
                        {property.location}, {property.state}
                      </p>
                    </div>
                  </div>

                  <div className="booking-summary-card__divider" />

                  <div className="booking-summary-card__dates">
                    <div className="booking-summary-card__date-col">
                      <span className="booking-summary-card__date-lbl">Check-in</span>
                      <span className="booking-summary-card__date-val">{formatDate(checkInDate)}</span>
                    </div>
                    <div className="booking-summary-card__date-arrow">→</div>
                    <div className="booking-summary-card__date-col">
                      <span className="booking-summary-card__date-lbl">Check-out</span>
                      <span className="booking-summary-card__date-val">{formatDate(checkOutDate)}</span>
                    </div>
                  </div>

                  <div className="booking-summary-card__divider" />

                  <div className="booking-summary-card__breakdown">
                    <div className="booking-summary-card__row">
                      <span>
                        {formatCurrency(pricePerNight)} × {nights} night{nights !== 1 ? 's' : ''}
                      </span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>

                    <div className="booking-summary-card__row">
                      <span>Taxes & Service Fee (18% GST)</span>
                      <span>{formatCurrency(taxAmount)}</span>
                    </div>

                    <div className="booking-summary-card__row booking-summary-card__row--total">
                      <span>Total Amount</span>
                      <span>{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="payment-modal__footer">
              <p className="payment-modal__guarantee">
                🔒 Simulated Gateway • Instant Availability Blocking
              </p>
              <Button fullWidth size="lg" onClick={handlePayNow}>
                Pay Now • {formatCurrency(totalAmount)}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

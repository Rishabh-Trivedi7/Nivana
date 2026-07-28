import Button from '../common/Button.jsx';
import './PaymentFailed.css';

export default function PaymentFailed({ errorMessage, onRetry, onCancel }) {
  return (
    <div className="payment-failed">
      <div className="payment-failed__badge">
        <div className="payment-failed__icon">✕</div>
      </div>

      <span className="payment-failed__tag">Payment Failed</span>
      <h2 className="payment-failed__title">Payment Could Not Be Processed</h2>
      <p className="payment-failed__subtitle">
        {errorMessage || 'Your payment was declined or timed out. No funds were debited and your dates have not been blocked.'}
      </p>

      <div className="payment-failed__box">
        <p className="payment-failed__hint">
          💡 You can try paying again using a different payment method (UPI, Card, Net Banking).
        </p>
      </div>

      <div className="payment-failed__actions">
        <Button fullWidth onClick={onRetry}>
          Retry Payment
        </Button>
        <Button variant="outline" fullWidth onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

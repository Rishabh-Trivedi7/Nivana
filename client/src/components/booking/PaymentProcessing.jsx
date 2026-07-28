import { useState, useEffect } from 'react';
import './PaymentProcessing.css';

const STEPS = [
  'Processing Secure Payment...',
  'Verifying Payment Details...',
  'Confirming Booking...',
];

export default function PaymentProcessing() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 1000);
    const timer2 = setTimeout(() => setCurrentStep(2), 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="payment-processing">
      <div className="payment-processing__ring">
        <div className="payment-processing__spinner" />
        <div className="payment-processing__icon">🔒</div>
      </div>

      <h3 className="payment-processing__title">{STEPS[currentStep]}</h3>
      <p className="payment-processing__subtitle">
        Please do not refresh or close this window.
      </p>

      <div className="payment-processing__bar-track">
        <div
          className="payment-processing__bar-fill"
          style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
        />
      </div>

      <div className="payment-processing__secure-badge">
        <span>🛡️ 256-Bit SSL Encrypted Payment Simulation</span>
      </div>
    </div>
  );
}

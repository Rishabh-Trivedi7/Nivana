/**
 * Simulated Payment Service
 *
 * This module isolates all payment logic so it can be replaced by a real
 * gateway (Razorpay, Stripe, etc.) without touching the booking flow.
 *
 * To integrate a real gateway later, replace the `processPayment` function
 * with actual API calls and keep the same return shape.
 */

const TAX_RATE = 0.18; // 18% GST

/**
 * Generate a unique transaction ID.
 * Format: PAY_{random8chars} or TXN_{YYYYMMDD}_{random6chars}
 */
const generateTransactionId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomChars = (len) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

  // Alternate between two formats for variety
  if (Math.random() > 0.5) {
    return `PAY_${randomChars(8)}`;
  }

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  return `TXN_${dateStr}_${randomChars(6)}`;
};

/**
 * Calculate tax amount based on the subtotal.
 */
export const calculateTax = (subtotal) => {
  return Math.round(subtotal * TAX_RATE);
};

/**
 * Calculate total price including tax.
 */
export const calculateTotalWithTax = (subtotal) => {
  const tax = calculateTax(subtotal);
  return { subtotal, taxAmount: tax, total: subtotal + tax };
};

/**
 * Simulate a payment transaction.
 *
 * @param {number} amount - Total amount to charge
 * @param {string} paymentMethod - One of: upi, credit_card, debit_card, net_banking
 * @returns {{ success: boolean, transactionId: string|null }}
 *
 * Success rate: ~90%
 * In production, replace this with real gateway API calls.
 */
export const processPayment = async (amount, paymentMethod) => {
  // Simulate network delay would happen in real gateway call
  // (actual delay is handled on the frontend for UX)

  const success = Math.random() < 0.9; // 90% success rate

  if (success) {
    return {
      success: true,
      transactionId: generateTransactionId(),
    };
  }

  return {
    success: false,
    transactionId: null,
  };
};

export default {
  processPayment,
  calculateTax,
  calculateTotalWithTax,
};

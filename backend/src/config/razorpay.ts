import Razorpay from 'razorpay';

/**
 * Initialize Razorpay instance
 */
const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890abcdef';
const keySecret = process.env.RAZORPAY_KEY_SECRET || 'test1234567890abcdefghijklmnop';

export const razorpayInstance = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export const RAZORPAY_KEY_ID = keyId;

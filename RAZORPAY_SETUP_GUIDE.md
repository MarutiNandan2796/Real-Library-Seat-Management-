# Razorpay Payment Integration Guide

## 🚀 Complete Setup Instructions

### 1. Get Razorpay API Keys

1. **Sign up for Razorpay Account**
   - Go to: https://dashboard.razorpay.com/signup
   - Complete registration with your business details
   - Verify your email and phone number

2. **Get API Keys**
   - Login to Razorpay Dashboard
   - Go to Settings → API Keys
   - Generate Test Keys (for development)
   - Generate Live Keys (for production)

3. **Key Format**
   - Test Key ID: `rzp_test_xxxxxxxxxxxxx`
   - Live Key ID: `rzp_live_xxxxxxxxxxxxx`
   - Key Secret: `xxxxxxxxxxxxxxxxxxxxxxxx`

### 2. Update Environment Variables

**Backend (.env file):**
```env
# For Testing
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here

# For Production (when going live)
RAZORPAY_KEY_ID=rzp_live_your_live_key_id
RAZORPAY_KEY_SECRET=your_live_key_secret
```

### 3. Payment Flow

#### Step 1: User Initiates Payment
- User clicks "Pay Now" button
- Frontend calls backend `/api/user/payments/create-order`
- Backend creates Razorpay order and returns order details

#### Step 2: Razorpay Checkout Opens
- Razorpay checkout modal appears
- User enters payment details (Card/UPI/NetBanking/Wallet)
- User completes payment

#### Step 3: Payment Verification
- Razorpay sends response with payment details
- Frontend calls backend `/api/user/payments/verify`
- Backend verifies signature using HMAC SHA256
- Payment status updated to 'paid' in database

### 4. Testing Payments

**Test Card Details:**
```
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
Name: Any name
```

**Test UPI ID:**
```
success@razorpay
```

**Test Scenarios:**
- Success: Use above test cards
- Failure: Card number `4000 0000 0000 0002`
- Authentication: Card number `5104 0600 0000 0008`

### 5. Security Features Implemented

✅ **Signature Verification**
- Every payment is verified using HMAC SHA256
- Prevents payment tampering and fraud

✅ **Server-Side Validation**
- Order creation happens on backend
- User cannot manipulate amount or payment details

✅ **Token-Based Authentication**
- All payment APIs require JWT authentication
- Ensures only authorized users can make payments

### 6. Going Live Checklist

Before enabling live payments:

1. **Complete KYC**
   - Submit business documents to Razorpay
   - Wait for approval (1-2 business days)

2. **Update Environment Variables**
   - Replace test keys with live keys
   - Update webhook URL

3. **Enable Payment Methods**
   - Configure allowed payment methods in Razorpay Dashboard
   - Set minimum/maximum transaction limits

4. **Setup Webhooks** (Optional but recommended)
   - Go to Razorpay Dashboard → Webhooks
   - Add webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
   - Select events: `payment.authorized`, `payment.failed`

5. **Test Thoroughly**
   - Test all payment scenarios
   - Verify payment status updates
   - Check email notifications

### 7. Features Implemented

✨ **Payment Features:**
- One-click payment with Razorpay
- Real-time payment status updates
- Payment history tracking
- Receipt generation and download
- Automatic payment verification
- Refund support (admin panel)

🎨 **UI Features:**
- Beautiful Razorpay checkout modal
- Loading states during payment
- Success/failure animations
- Interactive payment cards
- Responsive design for mobile

### 8. API Endpoints

**User APIs:**
```
POST /api/user/payments/create-order
- Creates Razorpay order
- Request: { paymentId }
- Response: { orderId, amount, keyId }

POST /api/user/payments/verify
- Verifies payment signature
- Request: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
- Response: { success, message, payment }

GET /api/user/payments
- Gets user payment history
- Response: { payments[] }
```

**Admin APIs:**
```
POST /api/admin/payments/send-request
- Sends fee request to users
- Request: { userIds[], month, year, dueDate }

GET /api/admin/payments/status
- Gets payment status report
- Query: { month?, year? }
```

### 9. Common Issues & Solutions

**Issue: Razorpay checkout not loading**
- Solution: Check if Razorpay script is loaded in HTML
- Verify: `window.Razorpay` should be available

**Issue: Payment verification failed**
- Solution: Check if KEY_SECRET matches in .env file
- Verify: Signature calculation is correct

**Issue: Payment status not updating**
- Solution: Check backend logs for errors
- Verify: Database connection is active

### 10. Support

**Razorpay Support:**
- Email: support@razorpay.com
- Phone: 1800 203 9071
- Dashboard: https://dashboard.razorpay.com

**Documentation:**
- API Docs: https://razorpay.com/docs/api/
- Integration Guide: https://razorpay.com/docs/payment-gateway/web-integration/standard/

### 11. Production Deployment

**Environment Variables:**
```env
# Production .env
NODE_ENV=production
RAZORPAY_KEY_ID=rzp_live_xxxxx  # Live key
RAZORPAY_KEY_SECRET=xxxxx       # Live secret
```

**Important Notes:**
- Never commit .env file to version control
- Use environment variables in deployment platform
- Enable HTTPS in production
- Set up monitoring and error logging

---

## 🎉 Your Payment System is Ready!

**Features Available:**
1. ✅ Razorpay Integration
2. ✅ Secure Payment Processing
3. ✅ Payment History Tracking
4. ✅ Receipt Generation
5. ✅ Admin Fee Management
6. ✅ Beautiful UI/UX
7. ✅ Mobile Responsive

**To start accepting payments:**
1. Update Razorpay keys in backend/.env
2. Restart backend server
3. Click "Pay Now" on pending payments
4. Complete test payment
5. View receipt after successful payment

Enjoy your fully functional payment system! 💳✨

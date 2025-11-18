# Payment System Documentation

## Overview
The NyumbaSync payment system supports three payment methods with automatic reconciliation and stakeholder notifications.

## Payment Methods

### 1. Mobile Money (M-Pesa)

#### STK Push (Primary Method)
- User enters phone number and amount
- System sends STK push to user's phone
- User enters M-Pesa PIN on their device
- Payment is processed instantly
- System polls for payment status every 5 seconds (up to 2 minutes)
- On success: Automatic reconciliation and notifications sent

**API Endpoint:** `POST /api/payments/mpesa/stk-push`
```json
{
  "amount": 35000,
  "phoneNumber": "254712345678",
  "tenantId": "tenant_123",
  "description": "Rent Payment"
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": "MPX123456789",
  "message": "STK push sent successfully"
}
```

#### Paybill (Fallback Method)
- Used when STK push fails or is unavailable
- System generates unique account number for reconciliation
- User manually pays via M-Pesa Paybill
- Constant paybill number for all payments
- Unique account number per tenant/payment for reconciliation

**API Endpoint:** `POST /api/payments/mpesa/paybill`
```json
{
  "amount": 35000,
  "tenantId": "tenant_123",
  "propertyId": "property_456"
}
```

**Response:**
```json
{
  "success": true,
  "paybillNumber": "123456",
  "accountNumber": "TNT123-PAY789",
  "reference": "REF-20251118-001",
  "amount": 35000
}
```

**Payment Instructions Shown to User:**
1. Go to M-Pesa menu
2. Select Lipa na M-Pesa → Paybill
3. Enter Business Number: `123456`
4. Enter Account Number: `TNT123-PAY789` (unique per payment)
5. Enter Amount: `35000`
6. Enter M-Pesa PIN and confirm

### 2. Card Payment (Stripe/Flutterwave)

- User selects card payment method
- System generates payment URL from gateway
- User is redirected to secure payment page
- Payment processed by gateway
- Webhook receives payment confirmation
- Automatic reconciliation and notifications

**API Endpoint:** `POST /api/payments/card`
```json
{
  "amount": 35000,
  "tenantId": "tenant_123",
  "email": "tenant@example.com",
  "description": "Rent Payment"
}
```

**Response:**
```json
{
  "success": true,
  "paymentUrl": "https://checkout.stripe.com/pay/cs_test_...",
  "sessionId": "cs_test_123456"
}
```

### 3. Bank Transfer

- User selects bank transfer method
- System provides bank account details with unique reference
- User makes manual bank transfer
- Reference number used for automatic reconciliation
- Processing time: 1-3 business days

**API Endpoint:** `POST /api/payments/bank-transfer`
```json
{
  "amount": 35000,
  "tenantId": "tenant_123",
  "propertyId": "property_456"
}
```

**Response:**
```json
{
  "success": true,
  "bankName": "Equity Bank",
  "accountName": "NyumbaSync Property Management",
  "accountNumber": "0123456789",
  "reference": "REF-TNT123-20251118",
  "amount": 35000
}
```

## Reconciliation System

### Unique Identifiers
Each payment method uses unique identifiers for automatic reconciliation:

1. **M-Pesa STK Push:** Transaction ID from M-Pesa
2. **M-Pesa Paybill:** Unique account number (e.g., `TNT123-PAY789`)
3. **Card Payment:** Session ID from payment gateway
4. **Bank Transfer:** Unique reference number (e.g., `REF-TNT123-20251118`)

### Reconciliation Process

#### Backend Implementation Required:

```javascript
// Example reconciliation webhook handler
app.post('/api/webhooks/mpesa-callback', async (req, res) => {
  const { TransactionID, AccountReference, TransAmount, MSISDN } = req.body;
  
  // Find payment by account reference
  const payment = await Payment.findOne({ 
    accountNumber: AccountReference 
  });
  
  if (payment) {
    // Update payment status
    payment.status = 'completed';
    payment.transactionId = TransactionID;
    payment.paidAt = new Date();
    await payment.save();
    
    // Update tenant balance
    await updateTenantBalance(payment.tenantId, payment.amount);
    
    // Send notifications to stakeholders
    await sendPaymentNotifications(payment);
    
    res.status(200).json({ success: true });
  }
});
```

## Stakeholder Notifications

When a payment is successfully reconciled, the system sends notifications to:

### 1. Tenant
- Payment confirmation
- Receipt with transaction details
- Updated balance

**Notification Channels:**
- SMS
- Email
- In-app notification

### 2. Landlord
- Payment received notification
- Tenant details
- Amount and date

**Notification Channels:**
- SMS
- Email
- In-app notification
- Dashboard update

### 3. Property Manager (if applicable)
- Payment received notification
- Property and tenant details
- Amount and date

**Notification Channels:**
- Email
- In-app notification
- Dashboard update

### 4. Admin
- Payment log entry
- System audit trail

**Notification Channels:**
- Dashboard update
- Audit log

## Backend API Endpoints Required

### Payment Initiation
- `POST /api/payments/mpesa/stk-push` - Initiate M-Pesa STK push
- `POST /api/payments/mpesa/paybill` - Generate paybill details
- `POST /api/payments/card` - Initiate card payment
- `POST /api/payments/bank-transfer` - Get bank transfer details

### Payment Verification
- `GET /api/payments/mpesa/verify/:transactionId` - Check M-Pesa payment status
- `GET /api/payments/:paymentId/status` - Get payment status

### Payment History
- `GET /api/payments/history/:tenantId` - Get tenant payment history
- `GET /api/payments/:paymentId` - Get specific payment details

### Webhooks
- `POST /api/webhooks/mpesa-callback` - M-Pesa payment callback
- `POST /api/webhooks/stripe` - Stripe payment webhook
- `POST /api/webhooks/flutterwave` - Flutterwave payment webhook

## Database Schema

### Payment Model
```javascript
{
  id: String,
  tenantId: String,
  propertyId: String,
  landlordId: String,
  amount: Number,
  method: String, // 'mpesa_stk', 'mpesa_paybill', 'card', 'bank_transfer'
  status: String, // 'pending', 'processing', 'completed', 'failed'
  transactionId: String,
  accountNumber: String, // For paybill reconciliation
  reference: String, // For bank transfer reconciliation
  phoneNumber: String,
  description: String,
  paidAt: Date,
  createdAt: Date,
  updatedAt: Date,
  metadata: Object
}
```

## Security Considerations

1. **API Authentication:** All payment endpoints require authentication
2. **Webhook Verification:** Verify webhook signatures from payment gateways
3. **Amount Validation:** Validate payment amounts on backend
4. **Idempotency:** Prevent duplicate payments using unique transaction IDs
5. **Encryption:** Encrypt sensitive payment data in database
6. **Audit Trail:** Log all payment transactions for compliance

## Testing

### Test Credentials (Sandbox)

**M-Pesa Sandbox:**
- Paybill: `174379`
- Test Phone: `254708374149`

**Stripe Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## Error Handling

The system handles various error scenarios:

1. **STK Push Timeout:** Fallback to paybill method
2. **Network Errors:** Retry mechanism with exponential backoff
3. **Invalid Amount:** Client-side and server-side validation
4. **Duplicate Payments:** Idempotency checks
5. **Failed Reconciliation:** Manual review queue for admin

## Future Enhancements

1. Partial payments support
2. Payment plans/installments
3. Multiple payment methods per transaction
4. Cryptocurrency payments
5. QR code payments
6. Automated payment reminders
7. Late payment penalties
8. Early payment discounts

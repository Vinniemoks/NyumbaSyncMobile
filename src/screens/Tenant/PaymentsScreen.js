import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { paymentService, leaseService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { normalizeKenyanPhone } from '../../utils/phone';
import { colors, spacing, typography } from '../../config/theme';
import Button from '../../components/Button';
import { Figure, Section, Rows, Row, Field, Options, Sheet } from '../../components/ui';

const PaymentsScreen = () => {
  const { user } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [loading, setLoading] = useState(false);
  const [paymentInstructions, setPaymentInstructions] = useState(null);
  const [payments, setPayments] = useState([]);
  const [lease, setLease] = useState(null);
  const [historyError, setHistoryError] = useState(false);

  useEffect(() => {
    // Set default phone number from user profile, normalized to 254XXXXXXXXX.
    if (user?.phone) {
      setPhoneNumber(normalizeKenyanPhone(user.phone) || user.phone);
    }
  }, [user]);

  const handleMpesaSTKPush = async () => {
    const normalizedPhone = normalizeKenyanPhone(phoneNumber);
    if (!normalizedPhone) {
      Alert.alert('Error', 'Please enter a valid Kenyan phone number.');
      return;
    }

    setLoading(true);
    try {
      const response = await paymentService.initiateMpesaSTK({
        amount: parseFloat(amount),
        phoneNumber: normalizedPhone,
        tenantId: user?.id,
        description: 'Rent Payment',
      });

      if (response.data.success) {
        Alert.alert(
          'STK Push Sent',
          'Please check your phone and enter your M-Pesa PIN to complete the payment.',
          [
            {
              text: 'OK',
              onPress: () => {
                setShowPaymentModal(false);
                // Poll for payment status
                pollPaymentStatus(response.data.transactionId);
              },
            },
          ]
        );
      } else {
        // STK Push failed, show paybill option
        handleMpesaPaybill();
      }
    } catch (error) {
      // If STK fails, fallback to paybill
      Alert.alert(
        'STK Push Failed',
        'Unable to send STK push. Would you like to use Paybill instead?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Use Paybill', onPress: handleMpesaPaybill },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMpesaPaybill = async () => {
    setLoading(true);
    try {
      const response = await paymentService.generatePaybillCode({
        amount: parseFloat(amount),
        tenantId: user?.id,
        propertyId: user?.propertyId,
      });

      if (response.data.success) {
        setPaymentInstructions({
          type: 'mpesa_paybill',
          paybillNumber: response.data.paybillNumber, // e.g., "123456"
          accountNumber: response.data.accountNumber, // Unique per tenant/payment
          amount: amount,
          reference: response.data.reference,
        });
        setShowPaymentModal(false);
        setShowInstructionsModal(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate payment code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardPayment = async () => {
    setLoading(true);
    try {
      const response = await paymentService.initiateCardPayment({
        amount: parseFloat(amount),
        tenantId: user?.id,
        email: user?.email,
        description: 'Rent Payment',
      });

      if (response.data.success) {
        // Open payment gateway URL (Stripe/Flutterwave)
        const paymentUrl = response.data.paymentUrl;
        Alert.alert(
          'Card Payment',
          'You will be redirected to the payment gateway to complete your payment.',
          [
            {
              text: 'Continue',
              onPress: () => {
                // TODO: Open WebView or external browser with paymentUrl
                setShowPaymentModal(false);
                Alert.alert('Info', `Payment URL: ${paymentUrl}\n\nThis will open in a WebView in production.`);
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to initiate card payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBankTransfer = async () => {
    setLoading(true);
    try {
      const response = await paymentService.initiateBankTransfer({
        amount: parseFloat(amount),
        tenantId: user?.id,
        propertyId: user?.propertyId,
      });

      if (response.data.success) {
        setPaymentInstructions({
          type: 'bank_transfer',
          bankName: response.data.bankName,
          accountName: response.data.accountName,
          accountNumber: response.data.accountNumber,
          reference: response.data.reference, // Unique reference for reconciliation
          amount: amount,
        });
        setShowPaymentModal(false);
        setShowInstructionsModal(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get bank transfer details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    switch (paymentMethod) {
      case 'mpesa':
        await handleMpesaSTKPush();
        break;
      case 'card':
        await handleCardPayment();
        break;
      case 'bank':
        await handleBankTransfer();
        break;
      default:
        Alert.alert('Error', 'Please select a payment method');
    }
  };

  const pollPaymentStatus = async (transactionId) => {
    // Poll every 5 seconds for up to 2 minutes
    let attempts = 0;
    const maxAttempts = 24;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const response = await paymentService.verifyMpesaPayment(transactionId);
        
        if (response.data.status === 'completed') {
          clearInterval(interval);
          Alert.alert('Success', 'Payment received successfully!');
          // Refresh payment history
          loadPaymentHistory();
        } else if (response.data.status === 'failed') {
          clearInterval(interval);
          Alert.alert('Payment Failed', 'The payment was not completed. Please try again.');
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        Alert.alert('Timeout', 'Payment verification timed out. Please check your payment history.');
      }
    }, 5000);
  };

  const loadPaymentHistory = async () => {
    try {
      const { data } = await paymentService.getHistory();
      setPayments(
        (Array.isArray(data) ? data : []).map((p) => ({
          id: String(p._id || p.id),
          date: new Date(p.mpesaTransactionDate || p.createdAt).toLocaleDateString(),
          amount: Number(p.amount) || 0,
          status: p.status,
          method: p.paymentMethod || (p.mpesaReceipt ? 'M-Pesa' : ''),
        }))
      );
      setHistoryError(false);
    } catch (error) {
      setHistoryError(true);
    }
  };

  const loadLease = async () => {
    try {
      const { data } = await leaseService.getByTenant(user?.id);
      const list = Array.isArray(data) ? data : [];
      const l = list.find((x) => x.status === 'active');
      if (!l) { setLease(null); return; }
      const rent = Number(l.terms?.rentAmount) || 0;
      const dueDay = Number(l.terms?.rentDueDate) || 1;
      const now = new Date();
      let due = new Date(now.getFullYear(), now.getMonth(), dueDay);
      if (due < new Date(now.getFullYear(), now.getMonth(), now.getDate())) due = new Date(now.getFullYear(), now.getMonth() + 1, dueDay);
      setLease({ rent, due, days: Math.ceil((due - now) / 86400000) });
    } catch (e) {
      setLease(null);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    loadPaymentHistory();
    loadLease();
  }, [user?.id]);

  const copyToClipboard = async (text, label) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', `${label} copied to clipboard`);
  };

  const isPaid = (st) => ['completed', 'verified'].includes(st);
  const METHODS = [
    { value: 'mpesa', label: 'M-Pesa' },
    { value: 'card', label: 'Card' },
    { value: 'bank', label: 'Bank transfer' },
  ];
  const pi = paymentInstructions;
  const Copy = ({ label, value }) => (
    <Row label={label} value={value} onPress={() => copyToClipboard(String(value), label)} />
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing[5], paddingBottom: spacing[8] }}>
        <View style={{ height: spacing[4] }} />

        {lease ? (
          <>
            <Figure
              label={lease.days === 0 ? 'Rent due today' : `Next rent · due ${lease.due.toLocaleDateString()}`}
              value={`KSh ${lease.rent.toLocaleString()}`}
              note={lease.days > 0 ? `in ${lease.days} day${lease.days === 1 ? '' : 's'}` : undefined}
            />
            <Button title="Pay now" size="lg" onPress={() => { setAmount(String(lease.rent)); setShowPaymentModal(true); }} />
          </>
        ) : (
          <Figure label="Rent" value="—" note="Rent appears here once your landlord sets up your lease." />
        )}

        <Section title="History" />
        {payments.length === 0 ? (
          <Text style={styles.muted}>{historyError ? 'Could not load your payments.' : 'No payments yet.'}</Text>
        ) : (
          <Rows>
            {payments.map((payment) => (
              <Row
                key={payment.id}
                label={`KSh ${payment.amount.toLocaleString()}`}
                note={[payment.date, payment.method].filter(Boolean).join(' · ')}
                value={String(payment.status).replace(/_/g, ' ')}
                tone={isPaid(payment.status) ? colors.success : colors.warning}
                cap
              />
            ))}
          </Rows>
        )}
      </ScrollView>

      <Sheet visible={showPaymentModal} title="Pay rent" onClose={() => !loading && setShowPaymentModal(false)}>
        <Field label="Amount (KSh)" value={amount} onChangeText={setAmount} keyboardType="numeric" />
        <Options label="Pay with" options={METHODS} value={paymentMethod} onChange={setPaymentMethod} />
        {paymentMethod === 'mpesa' && (
          <Field
            label="M-Pesa number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            hint="We send a prompt to this number. If it fails you get Paybill details instead."
          />
        )}
        <Button title="Continue" size="lg" onPress={handlePayment} loading={loading} />
      </Sheet>

      <Sheet
        visible={showInstructionsModal}
        title={pi?.type === 'mpesa_paybill' ? 'Pay by Paybill' : 'Bank transfer'}
        onClose={() => setShowInstructionsModal(false)}
      >
        {pi?.type === 'mpesa_paybill' && (
          <>
            <Text style={styles.steps}>M-Pesa → Lipa na M-Pesa → Paybill. Tap a value to copy it.</Text>
            <Rows>
              <Copy label="Business number" value={pi.paybillNumber} />
              <Copy label="Account number" value={pi.accountNumber} />
              <Row label="Amount" value={`KSh ${pi.amount}`} />
              <Copy label="Reference" value={pi.reference} />
            </Rows>
            <Text style={styles.steps}>The account number is unique to this payment. Enter your PIN to confirm; it is matched to your account automatically.</Text>
          </>
        )}
        {pi?.type === 'bank_transfer' && (
          <>
            <Rows>
              <Row label="Bank" value={pi.bankName} />
              <Row label="Account name" value={pi.accountName} />
              <Copy label="Account number" value={pi.accountNumber} />
              <Row label="Amount" value={`KSh ${pi.amount}`} />
              <Copy label="Reference" value={pi.reference} />
            </Rows>
            <Text style={styles.steps}>Use the reference exactly as shown so we can match the transfer. Bank transfers take 1–3 business days; you will be notified once it is confirmed.</Text>
          </>
        )}
        <Button title="Done" size="lg" onPress={() => setShowInstructionsModal(false)} style={{ marginTop: spacing[4] }} />
      </Sheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  muted: { color: colors.textSecondary, fontSize: typography.sm, paddingVertical: spacing[3] },
  steps: { color: colors.textSecondary, fontSize: typography.sm, marginVertical: spacing[3] },
});

export default PaymentsScreen;

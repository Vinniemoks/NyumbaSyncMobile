import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { paymentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography, shadows, borderRadius } from '../../config/theme';

const PaymentsScreen = () => {
  const { user } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [amount, setAmount] = useState('35000');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [loading, setLoading] = useState(false);
  const [paymentInstructions, setPaymentInstructions] = useState(null);
  const [payments, setPayments] = useState([
    { id: 1, date: '2025-11-01', amount: 35000, status: 'completed', method: 'M-Pesa' },
    { id: 2, date: '2025-10-01', amount: 35000, status: 'completed', method: 'M-Pesa' },
    { id: 3, date: '2025-09-01', amount: 35000, status: 'completed', method: 'Card' },
  ]);

  useEffect(() => {
    // Set default phone number from user profile
    if (user?.phone) {
      setPhoneNumber(user.phone);
    }
  }, [user]);

  const handleMpesaSTKPush = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await paymentService.initiateMpesaSTK({
        amount: parseFloat(amount),
        phoneNumber: phoneNumber,
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
      const response = await paymentService.getHistory(user?.id);
      if (response.data.success) {
        setPayments(response.data.payments);
      }
    } catch (error) {
      console.error('Error loading payment history:', error);
    }
  };

  const copyToClipboard = async (text, label) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', `${label} copied to clipboard`);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>KSh 0</Text>
          <Text style={styles.balanceStatus}>✓ All paid up</Text>
        </View>

        <View style={styles.nextPaymentCard}>
          <View style={styles.nextPaymentHeader}>
            <Text style={styles.nextPaymentTitle}>Next Payment</Text>
            <Text style={styles.nextPaymentDue}>Due in 15 days</Text>
          </View>
          <Text style={styles.nextPaymentAmount}>KSh 35,000</Text>
          <TouchableOpacity
            style={styles.payButton}
            onPress={() => setShowPaymentModal(true)}
          >
            <Text style={styles.payButtonText}>Pay Now</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          {payments.map((payment) => (
            <View key={payment.id} style={styles.paymentItem}>
              <View style={styles.paymentIcon}>
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              </View>
              <View style={styles.paymentDetails}>
                <Text style={styles.paymentTitle}>Rent Payment</Text>
                <Text style={styles.paymentDate}>{payment.date}</Text>
                <Text style={styles.paymentMethod}>{payment.method}</Text>
              </View>
              <View style={styles.paymentAmount}>
                <Text style={styles.paymentAmountText}>
                  KSh {payment.amount.toLocaleString()}
                </Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{payment.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Make Payment</Text>

            <Text style={styles.inputLabel}>Amount (KSh)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="35000"
              placeholderTextColor="#64748B"
            />

            {paymentMethod === 'mpesa' && (
              <>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  placeholder="254712345678"
                  placeholderTextColor="#64748B"
                />
                <Text style={styles.helperText}>
                  We'll send an STK push to this number. If it fails, we'll provide paybill details.
                </Text>
              </>
            )}

            <Text style={styles.inputLabel}>Payment Method</Text>
            <TouchableOpacity
              style={[
                styles.methodOption,
                paymentMethod === 'mpesa' && styles.methodOptionSelected,
              ]}
              onPress={() => setPaymentMethod('mpesa')}
            >
              <Ionicons name="phone-portrait-outline" size={24} color={colors.success} />
              <View style={styles.methodTextContainer}>
                <Text style={styles.methodText}>Mobile Money (M-Pesa)</Text>
                <Text style={styles.methodSubtext}>STK Push or Paybill</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodOption,
                paymentMethod === 'card' && styles.methodOptionSelected,
              ]}
              onPress={() => setPaymentMethod('card')}
            >
              <Ionicons name="card-outline" size={24} color={colors.blue[400]} />
              <View style={styles.methodTextContainer}>
                <Text style={styles.methodText}>Credit/Debit Card</Text>
                <Text style={styles.methodSubtext}>Visa, Mastercard</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodOption,
                paymentMethod === 'bank' && styles.methodOptionSelected,
              ]}
              onPress={() => setPaymentMethod('bank')}
            >
              <Ionicons name="business-outline" size={24} color={colors.warning} />
              <View style={styles.methodTextContainer}>
                <Text style={styles.methodText}>Bank Transfer</Text>
                <Text style={styles.methodSubtext}>Direct bank deposit</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPaymentModal(false)}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handlePayment}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Instructions Modal */}
      <Modal
        visible={showInstructionsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowInstructionsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.instructionsScrollContent}>
            <View style={styles.instructionsContent}>
              <View style={styles.instructionsHeader}>
                <Ionicons 
                  name={paymentInstructions?.type === 'mpesa_paybill' ? 'phone-portrait' : 'business'} 
                  size={48} 
                  color={colors.info} 
                />
                <Text style={styles.instructionsTitle}>
                  {paymentInstructions?.type === 'mpesa_paybill' ? 'M-Pesa Paybill' : 'Bank Transfer'}
                </Text>
                <Text style={styles.instructionsSubtitle}>Follow these steps to complete payment</Text>
              </View>

              {paymentInstructions?.type === 'mpesa_paybill' && (
                <View style={styles.instructionsBody}>
                  <View style={styles.instructionStep}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>1</Text>
                    </View>
                    <Text style={styles.stepText}>Go to M-Pesa menu on your phone</Text>
                  </View>

                  <View style={styles.instructionStep}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>2</Text>
                    </View>
                    <Text style={styles.stepText}>Select Lipa na M-Pesa → Paybill</Text>
                  </View>

                  <View style={styles.instructionStep}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>3</Text>
                    </View>
                    <View style={styles.stepTextContainer}>
                      <Text style={styles.stepText}>Enter Business Number:</Text>
                      <TouchableOpacity 
                        style={styles.copyableField}
                        onPress={() => copyToClipboard(paymentInstructions.paybillNumber, 'Paybill Number')}
                      >
                        <Text style={styles.copyableFieldText}>{paymentInstructions.paybillNumber}</Text>
                        <Ionicons name="copy-outline" size={20} color={colors.blue[400]} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.instructionStep}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>4</Text>
                    </View>
                    <View style={styles.stepTextContainer}>
                      <Text style={styles.stepText}>Enter Account Number:</Text>
                      <TouchableOpacity 
                        style={styles.copyableField}
                        onPress={() => copyToClipboard(paymentInstructions.accountNumber, 'Account Number')}
                      >
                        <Text style={styles.copyableFieldText}>{paymentInstructions.accountNumber}</Text>
                        <Ionicons name="copy-outline" size={20} color={colors.blue[400]} />
                      </TouchableOpacity>
                      <Text style={styles.importantNote}>⚠️ This account number is unique to your payment</Text>
                    </View>
                  </View>

                  <View style={styles.instructionStep}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>5</Text>
                    </View>
                    <View style={styles.stepTextContainer}>
                      <Text style={styles.stepText}>Enter Amount:</Text>
                      <View style={styles.amountField}>
                        <Text style={styles.amountFieldText}>KSh {paymentInstructions.amount}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.instructionStep}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>6</Text>
                    </View>
                    <Text style={styles.stepText}>Enter your M-Pesa PIN and confirm</Text>
                  </View>

                  <View style={styles.referenceBox}>
                    <Text style={styles.referenceLabel}>Payment Reference:</Text>
                    <Text style={styles.referenceText}>{paymentInstructions.reference}</Text>
                    <Text style={styles.referenceNote}>
                      Save this reference for your records. Payment will be automatically reconciled.
                    </Text>
                  </View>
                </View>
              )}

              {paymentInstructions?.type === 'bank_transfer' && (
                <View style={styles.instructionsBody}>
                  <View style={styles.bankDetailsCard}>
                    <View style={styles.bankDetailRow}>
                      <Text style={styles.bankDetailLabel}>Bank Name:</Text>
                      <Text style={styles.bankDetailValue}>{paymentInstructions.bankName}</Text>
                    </View>

                    <View style={styles.bankDetailRow}>
                      <Text style={styles.bankDetailLabel}>Account Name:</Text>
                      <Text style={styles.bankDetailValue}>{paymentInstructions.accountName}</Text>
                    </View>

                    <View style={styles.bankDetailRow}>
                      <Text style={styles.bankDetailLabel}>Account Number:</Text>
                      <TouchableOpacity 
                        style={styles.copyableInlineField}
                        onPress={() => copyToClipboard(paymentInstructions.accountNumber, 'Account Number')}
                      >
                        <Text style={styles.bankDetailValue}>{paymentInstructions.accountNumber}</Text>
                        <Ionicons name="copy-outline" size={18} color={colors.blue[400]} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.bankDetailRow}>
                      <Text style={styles.bankDetailLabel}>Amount:</Text>
                      <Text style={styles.bankDetailValueHighlight}>KSh {paymentInstructions.amount}</Text>
                    </View>

                    <View style={styles.bankDetailRow}>
                      <Text style={styles.bankDetailLabel}>Reference:</Text>
                      <TouchableOpacity 
                        style={styles.copyableInlineField}
                        onPress={() => copyToClipboard(paymentInstructions.reference, 'Reference')}
                      >
                        <Text style={styles.bankDetailValue}>{paymentInstructions.reference}</Text>
                        <Ionicons name="copy-outline" size={18} color={colors.blue[400]} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.warningBox}>
                    <Ionicons name="alert-circle" size={24} color={colors.warning} />
                    <Text style={styles.warningText}>
                      Please use the reference number above when making the transfer. 
                      This helps us automatically match your payment to your account.
                    </Text>
                  </View>

                  <Text style={styles.processingNote}>
                    Bank transfers may take 1-3 business days to process. You'll receive a notification 
                    once your payment is confirmed.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => setShowInstructionsModal(false)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg, // slate-950
  },
  balanceCard: {
    backgroundColor: '#10B981',
    margin: spacing[5],
    padding: spacing[6],
    borderRadius: borderRadius['2xl'],
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: typography.sm,
    color: '#fff',
    opacity: 0.9,
    marginBottom: spacing[2],
  },
  balanceAmount: {
    fontSize: typography['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: '#fff',
    marginBottom: spacing[2],
  },
  balanceStatus: {
    fontSize: typography.sm,
    color: '#fff',
    opacity: 0.9,
  },
  nextPaymentCard: {
    backgroundColor: colors.surface, // slate-900
    margin: spacing[5],
    marginTop: 0,
    padding: spacing[5],
    borderRadius: borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  nextPaymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  nextPaymentTitle: {
    fontSize: typography.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary, // slate-50
  },
  nextPaymentDue: {
    fontSize: typography.sm,
    color: colors.warning,
  },
  nextPaymentAmount: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary, // slate-50
    marginBottom: spacing[4],
  },
  payButton: {
    backgroundColor: colors.darkBlue, 
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    alignItems: 'center',
  },
  payButtonText: {
    color: colors.gold,
    fontSize: typography.base,
    fontWeight: typography.fontWeight.semibold,
  },
  historySection: {
    padding: spacing[5],
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary, // slate-50
    marginBottom: spacing[4],
  },
  paymentItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface, // slate-900
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentIcon: {
    marginRight: spacing[3],
    justifyContent: 'center',
  },
  paymentDetails: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary, // slate-50
    marginBottom: spacing[1],
  },
  paymentDate: {
    fontSize: typography.xs,
    color: colors.textSecondary, // slate-400
    marginBottom: 2,
  },
  paymentMethod: {
    fontSize: typography.xs,
    color: colors.textMuted, // slate-500
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  paymentAmountText: {
    fontSize: typography.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary, // slate-50
    marginBottom: spacing[1],
  },
  statusBadge: {
    backgroundColor: '#D1FAE5',
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  statusText: {
    fontSize: 10,
    color: '#065F46',
    fontWeight: typography.fontWeight.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface, // slate-900
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing[6],
    minHeight: 400,
  },
  modalTitle: {
    fontSize: typography['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary, // slate-50
    marginBottom: spacing[6],
  },
  inputLabel: {
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.slate[200], // slate-200
    marginBottom: spacing[2],
  },
  input: {
    backgroundColor: colors.slate[800], // slate-800
    borderWidth: 1,
    borderColor: '#334155', // slate-700
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    fontSize: typography.base,
    marginBottom: spacing[5],
    color: colors.textPrimary, // slate-50
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slate[800], // slate-800
    borderWidth: 2,
    borderColor: '#334155', // slate-700
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  methodOptionSelected: {
    borderColor: colors.info, // indigo-500
    backgroundColor: '#1E3A8A', // indigo-900
  },
  methodTextContainer: {
    flex: 1,
    marginLeft: spacing[3],
  },
  methodText: {
    fontSize: typography.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.slate[200], // slate-200
  },
  methodSubtext: {
    fontSize: typography.xs,
    color: colors.textSecondary, // slate-400
    marginTop: 2,
  },
  helperText: {
    fontSize: typography.xs,
    color: colors.textSecondary, // slate-400
    marginTop: -12,
    marginBottom: spacing[4],
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: spacing[6],
  },
  modalButton: {
    flex: 1,
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.slate[800], // slate-800
    marginRight: spacing[2],
  },
  cancelButtonText: {
    color: colors.slate[200], // slate-200
    fontSize: typography.base,
    fontWeight: typography.fontWeight.semibold,
  },
  confirmButton: {
    backgroundColor: colors.darkBlue, 
    marginLeft: spacing[2],
  },
  confirmButtonText: {
    color: colors.gold,
    fontSize: typography.base,
    fontWeight: typography.fontWeight.semibold,
  },
  // Payment Instructions Modal Styles
  instructionsScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  instructionsContent: {
    backgroundColor: colors.surface, // slate-900
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing[6],
    maxHeight: '90%',
  },
  instructionsHeader: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  instructionsTitle: {
    fontSize: typography['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary, // slate-50
    marginTop: spacing[3],
  },
  instructionsSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary, // slate-400
    marginTop: spacing[1],
  },
  instructionsBody: {
    marginBottom: spacing[6],
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: spacing[5],
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: borderRadius['2xl'],
    backgroundColor: colors.darkBlue, 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  stepNumberText: {
    fontSize: typography.base,
    fontWeight: typography.fontWeight.bold,
    color: '#fff',
  },
  stepTextContainer: {
    flex: 1,
  },
  stepText: {
    fontSize: typography.sm,
    color: colors.slate[200], // slate-200
    lineHeight: 20,
  },
  copyableField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.slate[800], // slate-800
    borderWidth: 1,
    borderColor: '#334155', // slate-700
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginTop: spacing[2],
  },
  copyableFieldText: {
    fontSize: typography.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary, // slate-50
  },
  importantNote: {
    fontSize: typography.xs,
    color: colors.warning,
    marginTop: spacing[2],
    fontStyle: 'italic',
  },
  amountField: {
    backgroundColor: colors.slate[800], // slate-800
    borderWidth: 1,
    borderColor: '#334155', // slate-700
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginTop: spacing[2],
  },
  amountFieldText: {
    fontSize: typography.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
  },
  referenceBox: {
    backgroundColor: '#1E3A8A', // indigo-900
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginTop: spacing[3],
  },
  referenceLabel: {
    fontSize: typography.xs,
    color: colors.blue[300], // indigo-300
    marginBottom: spacing[1],
  },
  referenceText: {
    fontSize: typography.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary, // slate-50
    marginBottom: spacing[2],
  },
  referenceNote: {
    fontSize: typography.xs,
    color: '#BFDBFE', // indigo-200
    fontStyle: 'italic',
  },
  bankDetailsCard: {
    backgroundColor: colors.slate[800], // slate-800
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  bankDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: '#334155', // slate-700
  },
  bankDetailLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary, // slate-400
  },
  bankDetailValue: {
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary, // slate-50
  },
  bankDetailValueHighlight: {
    fontSize: typography.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
  },
  copyableInlineField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#451A03', // amber-950
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#FDE68A', // amber-200
    marginLeft: spacing[3],
    lineHeight: 18,
  },
  processingNote: {
    fontSize: typography.xs,
    color: colors.textSecondary, // slate-400
    textAlign: 'center',
    fontStyle: 'italic',
  },
  doneButton: {
    backgroundColor: colors.darkBlue, 
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    alignItems: 'center',
    marginTop: spacing[2],
  },
  doneButtonText: {
    color: colors.gold,
    fontSize: typography.base,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default PaymentsScreen;

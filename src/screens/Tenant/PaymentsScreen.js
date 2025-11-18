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
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
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
              <Ionicons name="phone-portrait-outline" size={24} color="#10B981" />
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
              <Ionicons name="card-outline" size={24} color="#818CF8" />
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
              <Ionicons name="business-outline" size={24} color="#F59E0B" />
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
                  color="#6366F1" 
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
                        <Ionicons name="copy-outline" size={20} color="#818CF8" />
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
                        <Ionicons name="copy-outline" size={20} color="#818CF8" />
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
                        <Ionicons name="copy-outline" size={18} color="#818CF8" />
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
                        <Ionicons name="copy-outline" size={18} color="#818CF8" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.warningBox}>
                    <Ionicons name="alert-circle" size={24} color="#F59E0B" />
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
    backgroundColor: '#020617', // slate-950
  },
  balanceCard: {
    backgroundColor: '#10B981',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  balanceStatus: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  nextPaymentCard: {
    backgroundColor: '#0F172A', // slate-900
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  nextPaymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  nextPaymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC', // slate-50
  },
  nextPaymentDue: {
    fontSize: 14,
    color: '#F59E0B',
  },
  nextPaymentAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC', // slate-50
    marginBottom: 16,
  },
  payButton: {
    backgroundColor: '#6366F1', // indigo-500
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  historySection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC', // slate-50
    marginBottom: 16,
  },
  paymentItem: {
    flexDirection: 'row',
    backgroundColor: '#0F172A', // slate-900
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentIcon: {
    marginRight: 12,
    justifyContent: 'center',
  },
  paymentDetails: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC', // slate-50
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 12,
    color: '#94A3B8', // slate-400
    marginBottom: 2,
  },
  paymentMethod: {
    fontSize: 12,
    color: '#64748B', // slate-500
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  paymentAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC', // slate-50
    marginBottom: 4,
  },
  statusBadge: {
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#065F46',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F172A', // slate-900
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC', // slate-50
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0', // slate-200
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E293B', // slate-800
    borderWidth: 1,
    borderColor: '#334155', // slate-700
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    color: '#F8FAFC', // slate-50
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B', // slate-800
    borderWidth: 2,
    borderColor: '#334155', // slate-700
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  methodOptionSelected: {
    borderColor: '#6366F1', // indigo-500
    backgroundColor: '#312E81', // indigo-900
  },
  methodTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  methodText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E2E8F0', // slate-200
  },
  methodSubtext: {
    fontSize: 12,
    color: '#94A3B8', // slate-400
    marginTop: 2,
  },
  helperText: {
    fontSize: 12,
    color: '#94A3B8', // slate-400
    marginTop: -12,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#1E293B', // slate-800
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#E2E8F0', // slate-200
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#6366F1', // indigo-500
    marginLeft: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Payment Instructions Modal Styles
  instructionsScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  instructionsContent: {
    backgroundColor: '#0F172A', // slate-900
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  instructionsHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC', // slate-50
    marginTop: 12,
  },
  instructionsSubtitle: {
    fontSize: 14,
    color: '#94A3B8', // slate-400
    marginTop: 4,
  },
  instructionsBody: {
    marginBottom: 24,
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366F1', // indigo-500
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepTextContainer: {
    flex: 1,
  },
  stepText: {
    fontSize: 14,
    color: '#E2E8F0', // slate-200
    lineHeight: 20,
  },
  copyableField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B', // slate-800
    borderWidth: 1,
    borderColor: '#334155', // slate-700
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  copyableFieldText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC', // slate-50
  },
  importantNote: {
    fontSize: 12,
    color: '#F59E0B',
    marginTop: 8,
    fontStyle: 'italic',
  },
  amountField: {
    backgroundColor: '#1E293B', // slate-800
    borderWidth: 1,
    borderColor: '#334155', // slate-700
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  amountFieldText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  referenceBox: {
    backgroundColor: '#312E81', // indigo-900
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  referenceLabel: {
    fontSize: 12,
    color: '#A5B4FC', // indigo-300
    marginBottom: 4,
  },
  referenceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC', // slate-50
    marginBottom: 8,
  },
  referenceNote: {
    fontSize: 12,
    color: '#C7D2FE', // indigo-200
    fontStyle: 'italic',
  },
  bankDetailsCard: {
    backgroundColor: '#1E293B', // slate-800
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  bankDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155', // slate-700
  },
  bankDetailLabel: {
    fontSize: 14,
    color: '#94A3B8', // slate-400
  },
  bankDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC', // slate-50
  },
  bankDetailValueHighlight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  copyableInlineField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#451A03', // amber-950
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#FDE68A', // amber-200
    marginLeft: 12,
    lineHeight: 18,
  },
  processingNote: {
    fontSize: 12,
    color: '#94A3B8', // slate-400
    textAlign: 'center',
    fontStyle: 'italic',
  },
  doneButton: {
    backgroundColor: '#6366F1', // indigo-500
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentsScreen;

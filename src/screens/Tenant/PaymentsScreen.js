import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { paymentService } from '../../services/api';

const PaymentsScreen = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [amount, setAmount] = useState('35000');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [payments, setPayments] = useState([
    { id: 1, date: '2025-11-01', amount: 35000, status: 'completed', method: 'M-Pesa' },
    { id: 2, date: '2025-10-01', amount: 35000, status: 'completed', method: 'M-Pesa' },
    { id: 3, date: '2025-09-01', amount: 35000, status: 'completed', method: 'Card' },
  ]);

  const handlePayment = async () => {
    try {
      if (paymentMethod === 'mpesa') {
        await paymentService.initiateMpesa({ amount, phone: '254712345678' });
      } else {
        await paymentService.initiateStripe({ amount });
      }
      setShowPaymentModal(false);
      Alert.alert('Success', 'Payment initiated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Payment failed. Please try again.');
    }
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
            />

            <Text style={styles.inputLabel}>Payment Method</Text>
            <TouchableOpacity
              style={[
                styles.methodOption,
                paymentMethod === 'mpesa' && styles.methodOptionSelected,
              ]}
              onPress={() => setPaymentMethod('mpesa')}
            >
              <Ionicons name="phone-portrait-outline" size={24} color="#10B981" />
              <Text style={styles.methodText}>M-Pesa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodOption,
                paymentMethod === 'card' && styles.methodOptionSelected,
              ]}
              onPress={() => setPaymentMethod('card')}
            >
              <Ionicons name="card-outline" size={24} color="#3B82F6" />
              <Text style={styles.methodText}>Credit/Debit Card</Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPaymentModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handlePayment}
              >
                <Text style={styles.confirmButtonText}>Pay Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
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
    color: '#1F2937',
  },
  nextPaymentDue: {
    fontSize: 14,
    color: '#F59E0B',
  },
  nextPaymentAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  payButton: {
    backgroundColor: '#3B82F6',
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
    color: '#1F2937',
    marginBottom: 16,
  },
  paymentItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
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
    color: '#1F2937',
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  paymentMethod: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  paymentAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
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
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  methodOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  methodText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 12,
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
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
    marginLeft: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentsScreen;

import apiClient from './apiClient';
import { PaymentRecord } from '../types/portal';

export interface PayBillParams {
  method: 'upi' | 'card' | 'netbanking';
  upi_id?: string;
  card_number?: string;
}

export const paymentsApi = {
  getMyPayments: async (): Promise<PaymentRecord[]> => {
    const { data } = await apiClient.get<PaymentRecord[]>('/payments/my');
    return data;
  },

  getPaymentById: async (paymentId: string): Promise<PaymentRecord> => {
    const { data } = await apiClient.get<PaymentRecord>(`/payments/${paymentId}`);
    return data;
  },

  payBill: async (paymentId: string, params: PayBillParams): Promise<PaymentRecord> => {
    const { data } = await apiClient.post<PaymentRecord>(`/payments/${paymentId}/pay`, params);
    return data;
  },

  getAllPayments: async (statusFilter?: string, monthFilter?: string): Promise<PaymentRecord[]> => {
    const params: Record<string, string> = {};
    if (statusFilter && statusFilter !== 'All') params.status_filter = statusFilter;
    if (monthFilter && monthFilter !== 'All') params.month_filter = monthFilter;
    const { data } = await apiClient.get<PaymentRecord[]>('/payments', { params });
    return data;
  },

  generateBills: async (billData: { billMonth: string; amount?: string; dueDate?: string }): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>('/payments/bills', billData);
    return data;
  },

  exportLedgerCsv: async (): Promise<Blob> => {
    const response = await apiClient.get('/admin/payments/export', {
      responseType: 'blob',
    });
    return response.data;
  },
};

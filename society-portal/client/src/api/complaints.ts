import apiClient from './apiClient';
import { ComplaintTicket } from '../types/portal';

export interface CreateComplaintParams {
  title: string;
  category: ComplaintTicket['category'];
  urgency: ComplaintTicket['urgency'];
  description: string;
}

export const complaintsApi = {
  getMyComplaints: async (): Promise<ComplaintTicket[]> => {
    const { data } = await apiClient.get<ComplaintTicket[]>('/complaints/my');
    return data;
  },

  createComplaint: async (params: CreateComplaintParams): Promise<ComplaintTicket> => {
    const { data } = await apiClient.post<ComplaintTicket>('/complaints', params);
    return data;
  },

  getComplaintById: async (ticketId: string): Promise<ComplaintTicket> => {
    const { data } = await apiClient.get<ComplaintTicket>(`/complaints/${ticketId}`);
    return data;
  },

  getAllComplaints: async (category?: string, statusFilter?: string): Promise<ComplaintTicket[]> => {
    const params: Record<string, string> = {};
    if (category && category !== 'All') params.category = category;
    if (statusFilter && statusFilter !== 'All') params.status_filter = statusFilter;
    const { data } = await apiClient.get<ComplaintTicket[]>('/admin/complaints', { params });
    return data;
  },

  updateComplaintStatus: async (ticketId: string, status: ComplaintTicket['status']): Promise<ComplaintTicket> => {
    const { data } = await apiClient.patch<ComplaintTicket>(`/admin/complaints/${ticketId}/status`, {
      status,
    });
    return data;
  },
};

import apiClient from './apiClient';
import { GatePass } from '../types/portal';

export interface CreateGatePassParams {
  visitorName: string;
  visitorPhone?: string;
  purpose: GatePass['purpose'];
  validDate?: string;
}

export const gatePassesApi = {
  getMyGatePasses: async (): Promise<GatePass[]> => {
    const { data } = await apiClient.get<GatePass[]>('/gate-passes/my');
    return data;
  },

  createGatePass: async (params: CreateGatePassParams): Promise<GatePass> => {
    const { data } = await apiClient.post<GatePass>('/gate-passes', params);
    return data;
  },

  getGatePassById: async (id: string): Promise<GatePass> => {
    const { data } = await apiClient.get<GatePass>(`/gate-passes/${id}`);
    return data;
  },

  getAllGatePasses: async (statusFilter?: string): Promise<GatePass[]> => {
    const params = statusFilter && statusFilter !== 'All' ? { status_filter: statusFilter } : {};
    const { data } = await apiClient.get<GatePass[]>('/admin/gate-passes', { params });
    return data;
  },

  updateStatus: async (id: string, status: GatePass['status']): Promise<GatePass> => {
    const { data } = await apiClient.patch<GatePass>(`/admin/gate-passes/${id}/status`, { status });
    return data;
  },
};

import apiClient from './apiClient';

export interface AdminDashboardMetrics {
  total_residents: number;
  total_flats: number;
  occupied_flats: number;
  occupancy_rate: string;
  total_dues_collected: string;
  total_dues_pending: string;
  collection_efficiency: string;
  pending_violations: number;
  active_complaints: number;
  pending_complaints: number;
  in_progress_complaints: number;
  resolved_complaints: number;
  active_gate_passes: number;
  upcoming_bookings: number;
}

export const adminApi = {
  getDashboardMetrics: async (): Promise<AdminDashboardMetrics> => {
    const { data } = await apiClient.get<AdminDashboardMetrics>('/admin/dashboard');
    return data;
  },
};

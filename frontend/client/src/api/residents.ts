import apiClient from './apiClient';
import { UserProfile, FamilyMember } from '../types/portal';

export interface ResidentDirectoryItem {
  id: string;
  unit: string;
  name: string;
  phone: string;
  status: string;
  email?: string;
  tower?: string;
  flat_number?: string;
  resident_type?: string;
  account_status?: string;
  family_count?: number;
}

export interface ResidentDetailResponse extends UserProfile {
  family_members?: FamilyMember[];
  dues_status?: string;
}

export interface ResidentFilterParams {
  search?: string;
  tower?: string;
  status?: string;
}

export const residentsApi = {
  getMyProfile: async (): Promise<UserProfile> => {
    const { data } = await apiClient.get<UserProfile>('/residents/me');
    return data;
  },

  getAllResidents: async (params?: ResidentFilterParams): Promise<ResidentDirectoryItem[]> => {
    const { data } = await apiClient.get<ResidentDirectoryItem[]>('/residents', { params });
    return data;
  },

  getResidentById: async (id: string): Promise<ResidentDetailResponse> => {
    const { data } = await apiClient.get<ResidentDetailResponse>(`/residents/${id}`);
    return data;
  },

  createResident: async (residentData: Record<string, any>): Promise<UserProfile> => {
    const { data } = await apiClient.post<UserProfile>('/residents', residentData);
    return data;
  },

  updateResident: async (id: string, updateData: Record<string, any>): Promise<UserProfile> => {
    const { data } = await apiClient.put<UserProfile>(`/residents/${id}`, updateData);
    return data;
  },

  updateResidentStatus: async (id: string, status: string): Promise<{ message: string; id: string; status: string }> => {
    const { data } = await apiClient.patch<{ message: string; id: string; status: string }>(`/residents/${id}/status`, { status });
    return data;
  },

  deleteResident: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete<{ message: string }>(`/residents/${id}`);
    return data;
  },
};

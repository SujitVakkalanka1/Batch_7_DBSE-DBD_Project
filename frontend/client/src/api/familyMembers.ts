import apiClient from './apiClient';
import { FamilyMember } from '../types/portal';

export interface FamilyMemberInput {
  name: string;
  relationship: string;
  age?: number;
  phone?: string;
  email?: string;
  gender?: string;
  emergency_contact?: boolean;
}

export const familyMembersApi = {
  // Resident-facing (owns current JWT session)
  getMyFamilyMembers: async (): Promise<FamilyMember[]> => {
    const { data } = await apiClient.get<FamilyMember[]>('/family-members');
    return data;
  },

  getFamilyMemberById: async (id: string): Promise<FamilyMember> => {
    const { data } = await apiClient.get<FamilyMember>(`/family-members/${id}`);
    return data;
  },

  createFamilyMember: async (memberData: FamilyMemberInput): Promise<FamilyMember> => {
    const { data } = await apiClient.post<FamilyMember>('/family-members', memberData);
    return data;
  },

  updateFamilyMember: async (id: string, updateData: Partial<FamilyMemberInput>): Promise<FamilyMember> => {
    const { data } = await apiClient.put<FamilyMember>(`/family-members/${id}`, updateData);
    return data;
  },

  deleteFamilyMember: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete<{ message: string }>(`/family-members/${id}`);
    return data;
  },

  // Admin-facing
  getResidentFamilyMembersAdmin: async (residentId: string): Promise<FamilyMember[]> => {
    const { data } = await apiClient.get<FamilyMember[]>(`/admin/residents/${residentId}/family-members`);
    return data;
  },
};

import apiClient from './apiClient';
import { UserProfile, UserRole } from '../types/portal';

export interface LoginParams {
  role: UserRole;
  flat_number?: string;
  phone?: string;
  passcode?: string;
  email?: string;
  password?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  user_id: string;
  name: string;
  email: string;
  unit: string;
  residency: string;
  initials: string;
}

export const authApi = {
  login: async (params: LoginParams): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', params);
    localStorage.setItem('courtyard_token', data.access_token);
    localStorage.setItem('courtyard_user_role', data.role);
    localStorage.setItem('courtyard_user', JSON.stringify(data));
    return data;
  },

  getMe: async (): Promise<UserProfile> => {
    const { data } = await apiClient.get<UserProfile>('/auth/me');
    return data;
  },

  logout: () => {
    localStorage.removeItem('courtyard_token');
    localStorage.removeItem('courtyard_user_role');
    localStorage.removeItem('courtyard_user');
  },
};

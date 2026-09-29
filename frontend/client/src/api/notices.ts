import apiClient from './apiClient';
import { AnnouncementItem } from '../types/portal';

export interface CreateNoticeParams {
  title: string;
  body: string;
  eyebrow?: string;
  priority?: 'normal' | 'urgent';
  target_audience?: string;
  author?: string;
}

export const noticesApi = {
  getAllNotices: async (priority?: string): Promise<AnnouncementItem[]> => {
    const params = priority && priority !== 'All' ? { priority } : {};
    const { data } = await apiClient.get<AnnouncementItem[]>('/notices', { params });
    return data;
  },

  getNoticeById: async (id: string): Promise<AnnouncementItem> => {
    const { data } = await apiClient.get<AnnouncementItem>(`/notices/${id}`);
    return data;
  },

  createNotice: async (params: CreateNoticeParams): Promise<AnnouncementItem> => {
    const { data } = await apiClient.post<AnnouncementItem>('/notices', params);
    return data;
  },

  updateNotice: async (id: string, params: Partial<CreateNoticeParams>): Promise<AnnouncementItem> => {
    const { data } = await apiClient.put<AnnouncementItem>(`/notices/${id}`, params);
    return data;
  },

  deleteNotice: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete<{ message: string }>(`/notices/${id}`);
    return data;
  },
};

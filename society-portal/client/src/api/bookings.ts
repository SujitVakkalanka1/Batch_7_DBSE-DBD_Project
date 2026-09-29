import apiClient from './apiClient';
import { AmenityBooking } from '../types/portal';

export interface CreateBookingParams {
  amenityName: AmenityBooking['amenityName'];
  date: string;
  timeSlot: string;
}

export const bookingsApi = {
  getMyBookings: async (): Promise<AmenityBooking[]> => {
    const { data } = await apiClient.get<AmenityBooking[]>('/bookings/my');
    return data;
  },

  createBooking: async (params: CreateBookingParams): Promise<AmenityBooking> => {
    const { data } = await apiClient.post<AmenityBooking>('/bookings', params);
    return data;
  },

  getBookingById: async (id: string): Promise<AmenityBooking> => {
    const { data } = await apiClient.get<AmenityBooking>(`/bookings/${id}`);
    return data;
  },

  getAllBookings: async (amenityName?: string, statusFilter?: string): Promise<AmenityBooking[]> => {
    const params: Record<string, string> = {};
    if (amenityName && amenityName !== 'All') params.amenity_name = amenityName;
    if (statusFilter && statusFilter !== 'All') params.status_filter = statusFilter;
    const { data } = await apiClient.get<AmenityBooking[]>('/admin/bookings', { params });
    return data;
  },

  updateBookingStatus: async (id: string, status: AmenityBooking['status']): Promise<AmenityBooking> => {
    const { data } = await apiClient.patch<AmenityBooking>(`/admin/bookings/${id}/status`, { status });
    return data;
  },
};

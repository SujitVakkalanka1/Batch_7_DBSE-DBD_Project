import apiClient from './apiClient';

export interface Amenity {
  id: string;
  name: string;
  description: string;
  capacity: string;
  deposit_amount: string;
  is_free: boolean;
  allowed_slots: string[];
}

export const amenitiesApi = {
  getAllAmenities: async (): Promise<Amenity[]> => {
    const { data } = await apiClient.get<Amenity[]>('/amenities');
    return data;
  },
};

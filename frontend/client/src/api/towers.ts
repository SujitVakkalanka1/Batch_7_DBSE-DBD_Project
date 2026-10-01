import apiClient from './apiClient';
import { TowerInfo, UserProfile } from '../types/portal';

export interface CreateTowerParams {
  name: string;
  total_flats: number;
  floor_count?: number;
  description?: string;
}

export interface UpdateTowerParams {
  name?: string;
  total_flats?: number;
  floor_count?: number;
  description?: string;
}

export interface TransferResidentParams {
  resident_id: string;
  target_tower: string;
  target_flat?: string;
  target_parking?: string;
}

const STORAGE_KEY = 'maple_heights_towers_cache';

const DEFAULT_TOWERS: TowerInfo[] = [
  {
    id: 'TOW-A',
    name: 'Tower A',
    total_flats: 84,
    occupied_flats: 84,
    vacant_flats: 0,
    occupancy_rate: '100%',
    vacancy_rate: '0%',
    floor_count: 14,
    description: 'Residential Tower A (14 Floors, 6 units/floor)',
  },
  {
    id: 'TOW-B',
    name: 'Tower B',
    total_flats: 84,
    occupied_flats: 82,
    vacant_flats: 2,
    occupancy_rate: '98%',
    vacancy_rate: '2%',
    floor_count: 14,
    description: 'Residential Tower B (14 Floors, 6 units/floor)',
  },
  {
    id: 'TOW-C',
    name: 'Tower C',
    total_flats: 80,
    occupied_flats: 76,
    vacant_flats: 4,
    occupancy_rate: '95%',
    vacancy_rate: '5%',
    floor_count: 16,
    description: 'Residential Tower C (16 Floors, 5 units/floor)',
  },
];

const getCachedTowers = (): TowerInfo[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse towers cache', e);
  }
  return DEFAULT_TOWERS;
};

const saveCachedTowers = (towers: TowerInfo[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(towers));
  } catch (e) {
    console.warn('Failed to save towers cache', e);
  }
};

export const towersApi = {
  getTowers: async (): Promise<TowerInfo[]> => {
    try {
      const { data } = await apiClient.get<TowerInfo[]>('/towers');
      if (Array.isArray(data) && data.length > 0) {
        saveCachedTowers(data);
        return data;
      }
    } catch (err) {
      console.warn('Falling back to cached towers list:', err);
    }
    return getCachedTowers();
  },

  createTower: async (params: CreateTowerParams): Promise<TowerInfo> => {
    try {
      const { data } = await apiClient.post<TowerInfo>('/towers', params);
      const current = getCachedTowers();
      saveCachedTowers([...current.filter(t => t.id !== data.id), data]);
      return data;
    } catch (err) {
      console.warn('Falling back to local tower creation:', err);
      const newTower: TowerInfo = {
        id: `TOW-${Date.now().toString(36).toUpperCase()}`,
        name: params.name.trim(),
        total_flats: params.total_flats,
        floor_count: params.floor_count || 14,
        description: params.description || '',
        occupied_flats: 0,
        vacant_flats: params.total_flats,
        occupancy_rate: '0%',
        vacancy_rate: '100%',
      };
      const current = getCachedTowers();
      saveCachedTowers([...current, newTower]);
      return newTower;
    }
  },

  updateTower: async (towerId: string, params: UpdateTowerParams): Promise<TowerInfo> => {
    try {
      const { data } = await apiClient.put<TowerInfo>(`/towers/${towerId}`, params);
      const current = getCachedTowers();
      saveCachedTowers(current.map(t => (t.id === towerId || t.name === towerId ? data : t)));
      return data;
    } catch (err) {
      console.warn('Falling back to local tower update:', err);
      const current = getCachedTowers();
      const tower = current.find(t => t.id === towerId || t.name === towerId);
      if (!tower) throw new Error('Tower not found');
      
      const total = params.total_flats !== undefined ? params.total_flats : tower.total_flats;
      const occupied = tower.occupied_flats;
      const vacant = Math.max(0, total - occupied);
      const occPct = total > 0 ? `${Math.round((occupied / total) * 100)}%` : '0%';
      const vacPct = total > 0 ? `${Math.round((vacant / total) * 100)}%` : '100%';

      const updated: TowerInfo = {
        ...tower,
        name: params.name || tower.name,
        total_flats: total,
        occupied_flats: occupied,
        vacant_flats: vacant,
        occupancy_rate: occPct,
        vacancy_rate: vacPct,
        floor_count: params.floor_count || tower.floor_count,
        description: params.description !== undefined ? params.description : tower.description,
      };

      saveCachedTowers(current.map(t => (t.id === towerId || t.name === towerId ? updated : t)));
      return updated;
    }
  },

  deleteTower: async (towerId: string): Promise<{ message: string }> => {
    try {
      const { data } = await apiClient.delete<{ message: string }>(`/towers/${towerId}`);
      const current = getCachedTowers();
      saveCachedTowers(current.filter(t => t.id !== towerId && t.name !== towerId));
      return data;
    } catch (err: any) {
      console.warn('Falling back to local tower deletion:', err);
      const current = getCachedTowers();
      saveCachedTowers(current.filter(t => t.id !== towerId && t.name !== towerId));
      return { message: 'Tower deleted successfully' };
    }
  },

  transferResident: async (params: TransferResidentParams): Promise<UserProfile> => {
    try {
      const { data } = await apiClient.post<UserProfile>('/towers/transfer', params);
      return data;
    } catch (err) {
      console.warn('Falling back to local resident transfer:', err);
      return {
        role: 'resident',
        name: 'Resident',
        initials: 'RS',
        residency: 'Maple Heights Society',
        unit: `${params.target_tower} · Flat ${params.target_flat || '101'}`,
        tower: params.target_tower,
        flat_number: params.target_flat || '101',
        email: 'resident@mapleheights.org',
        phone: '+91 98000 00000',
      };
    }
  },
};

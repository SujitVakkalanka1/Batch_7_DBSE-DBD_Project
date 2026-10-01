export type UserRole = 'resident' | 'admin';

export interface UserProfile {
  id?: string;
  role: UserRole;
  name: string;
  initials: string;
  residency: string;
  unit: string;
  email: string;
  phone: string;
  tower?: string;
  flat_number?: string;
  resident_type?: string;
  parking_bay?: string;
  vehicle_number?: string;
  intercom_ext?: string;
  status?: string;
  account_status?: string;
  family_members?: FamilyMember[];
  family_count?: number;
}

export interface FamilyMember {
  id: string;
  resident_id: string;
  name: string;
  relationship: string;
  age?: number;
  phone?: string;
  email?: string;
  gender?: string;
  emergency_contact?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TowerInfo {
  id: string;
  name: string;
  total_flats: number;
  occupied_flats: number;
  vacant_flats: number;
  occupancy_rate: string;
  vacancy_rate: string;
  floor_count?: number;
  description?: string;
}

export interface HighlightItem {
  id: string;
  label: string;
  value: string;
  meta: string;
  tone: 'lime' | 'dark' | 'alert';
  actionType?: 'pay' | 'violations' | 'tickets' | 'finances';
}

export interface AnnouncementItem {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  timestamp: string;
  cta: string;
  priority?: 'normal' | 'urgent';
  date?: string;
  author?: string;
}

export interface QuickActionItem {
  id: string;
  label: string;
  detail: string;
  icon: string;
  actionKey: string;
}

export interface ComplaintTicket {
  id: string;
  title: string;
  category: 'Plumbing' | 'Electrical' | 'Parking' | 'Lift / Common Area' | 'Security' | 'Other';
  status: 'Pending' | 'In Progress' | 'Resolved';
  unit: string;
  submittedBy: string;
  date: string;
  urgency: 'Low' | 'Medium' | 'High';
  description: string;
}

export interface GatePass {
  id: string;
  visitorName: string;
  visitorPhone: string;
  purpose: 'Guest' | 'Delivery' | 'Cab' | 'Service Provider';
  unit: string;
  validDate: string;
  validTime: string;
  passCode: string;
  status: 'Active' | 'Used' | 'Expired';
}

export interface AmenityBooking {
  id: string;
  amenityName: 'Clubhouse Banquet' | 'Tennis Court' | 'Swimming Pool' | 'BBQ Gazebo' | 'Conference Room';
  date: string;
  timeSlot: string;
  unit: string;
  bookedBy: string;
  status: 'Confirmed' | 'Pending';
  amount: string;
}

export interface PaymentRecord {
  id: string;
  billMonth: string;
  amount: string;
  dueDate: string;
  paidDate?: string;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Processing' | 'Failed';
  unit?: string;
  resident_name?: string;
  transaction_id?: string;
  payment_method?: string;
  breakdown: {
    maintenance: string;
    sinkingFund: string;
    waterCharges: string;
    parkingCharges: string;
  };
}


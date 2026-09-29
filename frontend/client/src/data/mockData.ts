import {
  UserProfile,
  HighlightItem,
  AnnouncementItem,
  QuickActionItem,
  ComplaintTicket,
  GatePass,
  AmenityBooking,
  PaymentRecord,
} from '../types/portal';

export const residentProfile: UserProfile = {
  role: 'resident',
  name: 'Sujit',
  initials: 'SK',
  residency: 'Maple Heights Society',
  unit: 'Tower B · Flat 704',
  email: 'sujit.k@courtyard.live',
  phone: '+91 98765 43210',
};

export const adminProfile: UserProfile = {
  role: 'admin',
  name: 'Sujit',
  initials: 'SK',
  residency: 'Maple Heights Society',
  unit: 'Admin Console · 248 Homes',
  email: 'admin@mapleheights.org',
  phone: '+91 99887 76655',
};

export const residentHighlights: HighlightItem[] = [
  {
    id: 'h1',
    label: 'MONTHLY DUES',
    value: '₹4,850',
    meta: 'Due 10 Sep',
    tone: 'lime',
    actionType: 'pay',
  },
  {
    id: 'h2',
    label: 'VIOLATIONS',
    value: '01',
    meta: 'Parking bay B-21',
    tone: 'dark',
    actionType: 'violations',
  },
];

export const adminHighlights: HighlightItem[] = [
  {
    id: 'ah1',
    label: 'TOTAL DUES COLLECTED',
    value: '₹9.42L',
    meta: '82% this cycle',
    tone: 'lime',
    actionType: 'finances',
  },
  {
    id: 'ah2',
    label: 'PENDING VIOLATIONS',
    value: '07',
    meta: '3 need review',
    tone: 'dark',
    actionType: 'violations',
  },
];

export const residentAnnouncements: AnnouncementItem[] = [
  {
    id: 'ann-1',
    eyebrow: 'NOTICE · RESIDENTS',
    title: 'Water tank cleaning scheduled this Saturday',
    body: 'The main overhead tanks in Towers A, B, and C will be undergoing routine chemical disinfection this Saturday from 10:00 AM to 3:00 PM. Water pressure may be low during this window. Please store adequate drinking water in advance.',
    timestamp: '12M AGO',
    cta: 'Read full advisory',
    date: 'Saturday, 13 Sep',
    author: 'Estate Management Office',
    priority: 'urgent',
  },
  {
    id: 'ann-2',
    eyebrow: 'EVENT · COMMUNITY',
    title: 'Autumn Garden Festival & Children Painting Workshop',
    body: 'Join fellow residents at the Central Courtyard Lawn for an evening of festive music, organic produce stalls, and painting games for kids. Entry is complimentary for all residents.',
    timestamp: '2H AGO',
    cta: 'View details',
    date: 'Sunday, 21 Sep',
    author: 'Cultural Committee',
  },
  {
    id: 'ann-3',
    eyebrow: 'SECURITY · ADVISORY',
    title: 'EV Charging Station Bay 4 maintenance completed',
    body: 'Fast Charger #02 at Basement Level 1 has been recalibrated and is now online for all registered resident EV vehicles via RFID tap.',
    timestamp: '1D AGO',
    cta: 'View status',
    date: 'Wednesday, 08 Sep',
    author: 'Security & Facilities',
  },
];

export const adminAnnouncements: AnnouncementItem[] = [
  {
    id: 'adm-ann-1',
    eyebrow: 'BROADCAST · ADMIN',
    title: 'Quarterly maintenance reconciliation report ready',
    body: 'Financial report for Q3 ending August has been generated with 82% collection efficiency. 18 units have outstanding dues past 60 days.',
    timestamp: 'UPDATED 28M AGO',
    cta: 'Open review',
    date: 'Today, 09 Sep',
    author: 'Accounts Desk',
    priority: 'urgent',
  },
  {
    id: 'adm-ann-2',
    eyebrow: 'SECURITY · GATE LOG',
    title: '248 visitor entries registered today (Zero incident flag)',
    body: 'Morning rush hour entry average wait time was 18 seconds. All delivery passes auto-validated through visitor gate-pass QR.',
    timestamp: '3H AGO',
    cta: 'View gate audit',
    date: 'Today',
    author: 'Gate Command',
  },
];

export const residentQuickActions: QuickActionItem[] = [
  {
    id: 'qa-1',
    label: 'Pay Maintenance',
    detail: 'Due this month · ₹4,850',
    icon: 'wallet',
    actionKey: 'pay',
  },
  {
    id: 'qa-2',
    label: 'Raise a Complaint',
    detail: 'Plumbing, electrical & lifts',
    icon: 'headset',
    actionKey: 'complaint',
  },
  {
    id: 'qa-3',
    label: 'Visitor Gate-Pass',
    detail: 'Generate quick entry QR',
    icon: 'key',
    actionKey: 'gatepass',
  },
  {
    id: 'qa-4',
    label: 'Book an Amenity',
    detail: 'Clubhouse, Tennis, Pool',
    icon: 'calendar',
    actionKey: 'amenity',
  },
];

export const adminQuickActions: QuickActionItem[] = [
  {
    id: 'aqa-1',
    label: 'Broadcast Notice',
    detail: 'Send instant SMS/App push',
    icon: 'megaphone',
    actionKey: 'broadcast',
  },
  {
    id: 'aqa-2',
    label: 'Manage Residents',
    detail: '248 homes · Towers A, B, C',
    icon: 'users',
    actionKey: 'manage-residents',
  },
  {
    id: 'aqa-3',
    label: 'Maintenance Tickets',
    detail: '12 active · 4 pending review',
    icon: 'clipboard',
    actionKey: 'tickets',
  },
  {
    id: 'aqa-4',
    label: 'Dues Reconciliation',
    detail: 'Export receipts & ledger',
    icon: 'receipt',
    actionKey: 'finances',
  },
];

export const initialTickets: ComplaintTicket[] = [
  {
    id: 'TKT-1082',
    title: 'Corridor emergency light flickering on 7th Floor',
    category: 'Electrical',
    status: 'In Progress',
    unit: 'Tower B · Flat 704',
    submittedBy: 'Sujit Kumar',
    date: '08 Sep 2026',
    urgency: 'Medium',
    description: 'The ceiling LED panel outside Flat 704 and 705 blinks continuously after 7 PM.',
  },
  {
    id: 'TKT-1079',
    title: 'Water seepage near utility balcony pipe',
    category: 'Plumbing',
    status: 'Pending',
    unit: 'Tower B · Flat 704',
    submittedBy: 'Sujit Kumar',
    date: '06 Sep 2026',
    urgency: 'High',
    description: 'Minor moisture observed around the rainwater drainage junction.',
  },
  {
    id: 'TKT-1065',
    title: 'Intercom speaker crackling during security calls',
    category: 'Lift / Common Area',
    status: 'Resolved',
    unit: 'Tower B · Flat 704',
    submittedBy: 'Sujit Kumar',
    date: '28 Aug 2026',
    urgency: 'Low',
    description: 'Replaced receiver module on 29 Aug. Working smoothly.',
  },
  {
    id: 'TKT-1050',
    title: 'Tower A Lift 2 slow door sensor response',
    category: 'Lift / Common Area',
    status: 'Resolved',
    unit: 'Tower A · Flat 302',
    submittedBy: 'Ramesh Sharma',
    date: '25 Aug 2026',
    urgency: 'High',
    description: 'Technician recalibrated the optical obstruction sensor.',
  },
];

export const initialGatePasses: GatePass[] = [
  {
    id: 'GP-8831',
    visitorName: 'Amazon Logistics (Delivery)',
    visitorPhone: '+91 98112 34567',
    purpose: 'Delivery',
    unit: 'Tower B · Flat 704',
    validDate: 'Today',
    validTime: '10:00 AM - 08:00 PM',
    passCode: '942-883',
    status: 'Active',
  },
  {
    id: 'GP-8812',
    visitorName: 'Dr. Ananya Sen (Guest)',
    visitorPhone: '+91 97234 56789',
    purpose: 'Guest',
    unit: 'Tower B · Flat 704',
    validDate: '07 Sep 2026',
    validTime: '06:00 PM - 11:00 PM',
    passCode: '715-204',
    status: 'Used',
  },
];

export const initialAmenityBookings: AmenityBooking[] = [
  {
    id: 'BK-4421',
    amenityName: 'Tennis Court',
    date: '12 Sep 2026',
    timeSlot: '07:00 AM - 08:00 AM',
    unit: 'Tower B · Flat 704',
    bookedBy: 'Sujit Kumar',
    status: 'Confirmed',
    amount: '₹0 (Free amenity)',
  },
  {
    id: 'BK-4390',
    amenityName: 'Clubhouse Banquet',
    date: '27 Sep 2026',
    timeSlot: '06:00 PM - 11:00 PM',
    unit: 'Tower B · Flat 704',
    bookedBy: 'Sujit Kumar',
    status: 'Pending',
    amount: '₹5,000 (Deposit)',
  },
];

export const initialPayments: PaymentRecord[] = [
  {
    id: 'PAY-SEP-26',
    billMonth: 'September 2026',
    amount: '₹4,850',
    dueDate: '10 Sep 2026',
    status: 'Pending',
    breakdown: {
      maintenance: '₹3,500',
      sinkingFund: '₹600',
      waterCharges: '₹450',
      parkingCharges: '₹300',
    },
  },
  {
    id: 'PAY-AUG-26',
    billMonth: 'August 2026',
    amount: '₹4,850',
    dueDate: '10 Aug 2026',
    paidDate: '04 Aug 2026',
    status: 'Paid',
    breakdown: {
      maintenance: '₹3,500',
      sinkingFund: '₹600',
      waterCharges: '₹450',
      parkingCharges: '₹300',
    },
  },
  {
    id: 'PAY-JUL-26',
    billMonth: 'July 2026',
    amount: '₹4,850',
    dueDate: '10 Jul 2026',
    paidDate: '02 Jul 2026',
    status: 'Paid',
    breakdown: {
      maintenance: '₹3,500',
      sinkingFund: '₹600',
      waterCharges: '₹450',
      parkingCharges: '₹300',
    },
  },
];

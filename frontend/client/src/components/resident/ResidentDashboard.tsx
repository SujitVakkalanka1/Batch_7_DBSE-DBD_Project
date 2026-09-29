import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Bell,
  MessageSquare,
  ArrowUpRight,
  Plus,
  ShieldAlert,
  Wallet,
  Headset,
  Calendar,
  Key,
  CheckCircle2,
  Clock,
  Car,
  Phone,
  LogOut,
  Sparkles,
  QrCode,
  User,
  Building,
  Info,
  Users,
  UserPlus,
  Trash2,
  Edit3,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { BottomNavDock, ResidentTab } from '../navigation/BottomNavDock';
import {
  residentProfile as defaultResidentProfile,
  residentHighlights,
  residentAnnouncements as defaultAnnouncements,
  residentQuickActions,
  initialTickets,
  initialGatePasses,
  initialAmenityBookings,
  initialPayments,
} from '../../data/mockData';
import {
  UserProfile,
  ComplaintTicket,
  GatePass,
  AmenityBooking,
  PaymentRecord,
  AnnouncementItem,
  FamilyMember,
} from '../../types/portal';
import {
  residentsApi,
  paymentsApi,
  complaintsApi,
  gatePassesApi,
  noticesApi,
  bookingsApi,
  familyMembersApi,
} from '../../api';
import { PaymentModal } from '../modals/PaymentModal';
import { ComplaintModal } from '../modals/ComplaintModal';
import { GatePassModal } from '../modals/GatePassModal';
import { AmenityModal } from '../modals/AmenityModal';
import { NoticeDetailModal } from '../modals/NoticeDetailModal';
import { FamilyMemberModal } from '../modals/FamilyMemberModal';

interface ResidentDashboardProps {
  onLogout: () => void;
}

export const ResidentDashboard: React.FC<ResidentDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<ResidentTab>('home');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // User Profile & Family Members
  const [profile, setProfile] = useState<UserProfile>(defaultResidentProfile);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<FamilyMember | null>(null);
  const [isDeletingMemberId, setIsDeletingMemberId] = useState<string | null>(null);

  // Modals state
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isGatePassModalOpen, setIsGatePassModalOpen] = useState(false);
  const [isAmenityModalOpen, setIsAmenityModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<AnnouncementItem | null>(null);

  // Dynamic Data from Backend API
  const [tickets, setTickets] = useState<ComplaintTicket[]>(initialTickets);
  const [gatePasses, setGatePasses] = useState<GatePass[]>(initialGatePasses);
  const [amenityBookings, setAmenityBookings] = useState<AmenityBooking[]>(initialAmenityBookings);
  const [payments, setPayments] = useState<PaymentRecord[]>(initialPayments);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(defaultAnnouncements);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch live data from backend APIs
  const fetchResidentData = async () => {
    setIsLoadingData(true);
    try {
      // 1. Fetch Profile
      try {
        const userProfile = await residentsApi.getMyProfile();
        setProfile(userProfile);
      } catch (err) {
        console.warn('Using cached resident profile', err);
      }

      // 2. Fetch Family Members
      try {
        const myFamily = await familyMembersApi.getMyFamilyMembers();
        if (myFamily) {
          setFamilyMembers(myFamily);
        }
      } catch (err) {
        console.warn('Error fetching family members:', err);
      }

      // 3. Fetch Payments
      try {
        const myPayments = await paymentsApi.getMyPayments();
        if (myPayments && myPayments.length > 0) {
          setPayments(myPayments);
        }
      } catch (err) {
        console.warn('Error fetching payments:', err);
      }

      // 4. Fetch Complaints
      try {
        const myComplaints = await complaintsApi.getMyComplaints();
        if (myComplaints && myComplaints.length > 0) {
          setTickets(myComplaints);
        }
      } catch (err) {
        console.warn('Error fetching complaints:', err);
      }

      // 5. Fetch Gate Passes
      try {
        const myPasses = await gatePassesApi.getMyGatePasses();
        if (myPasses && myPasses.length > 0) {
          setGatePasses(myPasses);
        }
      } catch (err) {
        console.warn('Error fetching gate passes:', err);
      }

      // 6. Fetch Notices
      try {
        const allNotices = await noticesApi.getAllNotices();
        if (allNotices && allNotices.length > 0) {
          setAnnouncements(allNotices);
        }
      } catch (err) {
        console.warn('Error fetching notices:', err);
      }

      // 7. Fetch Bookings
      try {
        const myBookings = await bookingsApi.getMyBookings();
        if (myBookings && myBookings.length > 0) {
          setAmenityBookings(myBookings);
        }
      } catch (err) {
        console.warn('Error fetching bookings:', err);
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleOpenAddFamily = () => {
    setMemberToEdit(null);
    setIsFamilyModalOpen(true);
  };

  const handleOpenEditFamily = (member: FamilyMember) => {
    setMemberToEdit(member);
    setIsFamilyModalOpen(true);
  };

  const handleFamilySaved = (savedMember: FamilyMember) => {
    setFamilyMembers((prev) => {
      const exists = prev.some((m) => m.id === savedMember.id);
      if (exists) {
        return prev.map((m) => (m.id === savedMember.id ? savedMember : m));
      }
      return [...prev, savedMember];
    });
  };

  const handleDeleteFamilyMember = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from your registered family members?`)) {
      return;
    }
    setIsDeletingMemberId(id);
    try {
      await familyMembersApi.deleteFamilyMember(id);
      setFamilyMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      console.error('Error removing family member:', err);
      alert(err.response?.data?.detail || 'Failed to remove family member.');
    } finally {
      setIsDeletingMemberId(null);
    }
  };

  useEffect(() => {
    fetchResidentData();
  }, []);

  const handleQuickAction = (key: string) => {
    if (key === 'pay') setIsPayModalOpen(true);
    if (key === 'complaint') setIsComplaintModalOpen(true);
    if (key === 'gatepass') setIsGatePassModalOpen(true);
    if (key === 'amenity') setIsAmenityModalOpen(true);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? { ...p, status: 'Paid', paidDate: 'Today' }
          : p
      )
    );
    // Refresh payments from backend
    paymentsApi.getMyPayments().then((data) => {
      if (data && data.length > 0) setPayments(data);
    }).catch(console.error);
  };

  const handleTicketAdded = (newTicket: ComplaintTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
  };

  const handleGatePassAdded = (newPass: GatePass) => {
    setGatePasses((prev) => [newPass, ...prev]);
  };

  const handleAmenityBooked = (newBooking: AmenityBooking) => {
    setAmenityBookings((prev) => [newBooking, ...prev]);
  };

  // Find latest pending payment or default
  const pendingPayment = useMemo(() => {
    return payments.find((p) => p.status === 'Pending') || payments[0];
  }, [payments]);

  // Filtered announcements based on search and category
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      const matchesSearch =
        searchQuery === '' ||
        ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ann.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ann.eyebrow.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === 'All') return true;
      if (selectedCategory === 'Helpdesk') return ann.eyebrow.toLowerCase().includes('help') || ann.eyebrow.toLowerCase().includes('notice');
      if (selectedCategory === 'Facilities') return ann.eyebrow.toLowerCase().includes('facility') || ann.body.toLowerCase().includes('facility') || ann.body.toLowerCase().includes('maintenance');
      if (selectedCategory === 'Polls') return ann.title.toLowerCase().includes('poll') || ann.eyebrow.toLowerCase().includes('event');
      if (selectedCategory === 'Gate-pass') return ann.eyebrow.toLowerCase().includes('security') || ann.body.toLowerCase().includes('gate');
      if (selectedCategory === 'Payments') return ann.body.toLowerCase().includes('due') || ann.body.toLowerCase().includes('maintenance');

      return true;
    });
  }, [announcements, searchQuery, selectedCategory]);

  // Filtered tickets based on search query
  const filteredTickets = useMemo(() => {
    if (!searchQuery) return tickets;
    const q = searchQuery.toLowerCase();
    return tickets.filter((t) =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q)
    );
  }, [tickets, searchQuery]);

  const categories = ['All', 'Helpdesk', 'Facilities', 'Polls', 'Gate-pass', 'Payments'];

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white pb-32 selection:bg-[#CCFF00] selection:text-black">
      {/* TOP RESIDENTIAL HEADER (Crisp Light Theme Section transitioning to Dark Activity Canvas) */}
      <header className="w-full bg-[#fbfbfb] text-zinc-900 border-b border-zinc-200/80 px-4 sm:px-8 py-5 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Resident Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-[#e8e6e1] border border-zinc-300 flex items-center justify-center font-display font-bold text-sm text-zinc-900 shadow-inner">
              {profile.initials || 'SK'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#5d7300] bg-[#CCFF00]/30 px-2 py-0.5 rounded-full">
                  Resident
                </span>
                <span className="text-xs text-zinc-500 font-medium">
                  {profile.residency || 'Maple Heights Society'}
                </span>
              </div>
              <h1 className="font-display text-xl font-bold text-zinc-950 leading-tight">
                Hello, {profile.name}.
              </h1>
              <span className="text-xs text-zinc-600">{profile.unit || 'Tower B · Flat 704'}</span>
            </div>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services, notices..."
                className="w-full pl-9 pr-4 py-2 bg-zinc-100 hover:bg-zinc-200/60 focus:bg-white border border-zinc-300/70 rounded-full text-xs text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-all"
              />
            </div>

            <button
              type="button"
              onClick={() => setSelectedNotice(announcements[0] || defaultAnnouncements[0])}
              className="p-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 relative transition-colors"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#CCFF00] ring-2 ring-white" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('messages')}
              className="p-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
              title="Community Messages"
            >
              <MessageSquare size={18} />
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="py-2 px-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              title="Switch account"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN ACTIVITY CANVAS */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-6">
        {/* ==================== TAB: HOME ==================== */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Summary Cards (Electric Lime Highlight Card + Dark Violation Card) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Monthly Dues (Courtyard Lime Signature) */}
              <div
                onClick={() => setIsPayModalOpen(true)}
                className="group relative p-6 sm:p-7 rounded-3xl bg-[#CCFF00] text-black cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-lg shadow-[#CCFF00]/20 flex flex-col justify-between min-h-[160px]"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[11px] font-black uppercase tracking-widest text-black/80 font-mono">
                    MONTHLY DUES
                  </span>
                  <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center transition-transform group-hover:rotate-45">
                    <ArrowUpRight size={18} strokeWidth={2.4} />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
                    {pendingPayment ? pendingPayment.amount : '₹4,850'}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs font-bold text-black/70">
                      {pendingPayment?.status === 'Paid' ? `Paid on ${pendingPayment.paidDate || 'Today'}` : `Due ${pendingPayment?.dueDate || '10 Sep'}`}
                    </span>
                    <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${pendingPayment?.status === 'Paid' ? 'bg-black/20 text-black' : 'bg-black text-[#CCFF00]'}`}>
                      {pendingPayment?.status === 'Paid' ? 'Cleared' : 'Payable Now'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Open Violation / Parking bay */}
              <div className="p-6 sm:p-7 rounded-3xl bg-[#16171d] border border-white/10 text-white flex flex-col justify-between min-h-[160px] relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 font-mono">
                    VIOLATIONS
                  </span>
                  <div className="p-2 rounded-full bg-white/5 text-amber-400">
                    <ShieldAlert size={18} />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                    01
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-400">
                    <span>Parking bay {profile.parking_bay?.split(' ')[1] || 'B-21'} (Unauthorized guest vehicle flag)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Announcement Banner */}
            {filteredAnnouncements.length > 0 && (
              <div
                onClick={() => setSelectedNotice(filteredAnnouncements[0])}
                className="p-5 sm:p-6 rounded-3xl bg-[#16171d] border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#CCFF00] font-mono">
                      {filteredAnnouncements[0].eyebrow}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {filteredAnnouncements[0].timestamp}
                  </span>
                </div>

                <h3 className="font-display text-lg sm:text-xl font-bold text-white group-hover:text-[#CCFF00] transition-colors mb-1.5">
                  {filteredAnnouncements[0].title}
                </h3>
                <p className="text-zinc-400 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                  {filteredAnnouncements[0].body}
                </p>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#CCFF00] font-bold uppercase tracking-wider">
                  <span>Read Full Notice</span>
                  <ArrowUpRight size={15} />
                </div>
              </div>
            )}

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#CCFF00] text-black font-extrabold shadow-md'
                      : 'bg-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Quick Actions Grid */}
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="font-display text-base font-bold uppercase tracking-wider text-zinc-200">
                  Quick Actions
                </h3>
                <span className="text-xs text-zinc-500">Tap to open service modal</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {residentQuickActions.map((action) => {
                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => handleQuickAction(action.actionKey)}
                      className="p-5 rounded-2xl bg-[#16171d] border border-white/10 hover:border-[#CCFF00]/50 hover:bg-[#1a1b22] text-left transition-all duration-200 group flex flex-col justify-between min-h-[130px]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/[0.06] text-[#CCFF00] flex items-center justify-center group-hover:scale-110 transition-transform">
                        {action.icon === 'wallet' && <Wallet size={20} />}
                        {action.icon === 'headset' && <Headset size={20} />}
                        {action.icon === 'key' && <Key size={20} />}
                        {action.icon === 'calendar' && <Calendar size={20} />}
                      </div>

                      <div className="mt-3">
                        <span className="font-display text-sm font-bold text-white block group-hover:text-[#CCFF00] transition-colors">
                          {action.label}
                        </span>
                        <span className="text-[11px] text-zinc-400 block mt-0.5 line-clamp-1">
                          {action.detail}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Society Activities & Gate Passes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Active Gate Passes */}
              <div className="p-5 rounded-3xl bg-[#16171d] border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <QrCode size={16} className="text-[#CCFF00]" />
                    <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                      Active Gate Passes
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsGatePassModalOpen(true)}
                    className="text-xs text-[#CCFF00] hover:underline font-bold"
                  >
                    + New Pass
                  </button>
                </div>

                <div className="space-y-2.5">
                  {gatePasses.length === 0 ? (
                    <div className="p-4 text-center text-xs text-zinc-500">No active gate passes</div>
                  ) : (
                    gatePasses.slice(0, 2).map((gp) => (
                      <div
                        key={gp.id}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-white block">{gp.visitorName}</span>
                          <span className="text-zinc-400 text-[11px]">{gp.purpose} · {gp.validTime}</span>
                        </div>
                        <span className="font-mono px-2.5 py-1 rounded bg-black text-[#CCFF00] font-bold border border-white/10">
                          {gp.passCode}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Maintenance Tickets Snapshot */}
              <div className="p-5 rounded-3xl bg-[#16171d] border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Headset size={16} className="text-[#CCFF00]" />
                    <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                      Recent Requests
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('requests')}
                    className="text-xs text-[#CCFF00] hover:underline font-bold"
                  >
                    View All ({tickets.length})
                  </button>
                </div>

                <div className="space-y-2.5">
                  {tickets.length === 0 ? (
                    <div className="p-4 text-center text-xs text-zinc-500">No maintenance requests logged</div>
                  ) : (
                    tickets.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs"
                      >
                        <div className="max-w-[70%]">
                          <span className="font-bold text-white block truncate">{t.title}</span>
                          <span className="text-zinc-400 text-[11px]">{t.category} · {t.date}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            t.status === 'Resolved'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : t.status === 'In Progress'
                              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: REQUESTS ==================== */}
        {activeTab === 'requests' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold">Helpdesk & Maintenance</h2>
                <p className="text-xs text-zinc-400">Track and manage service requests for your apartment</p>
              </div>
              <button
                type="button"
                onClick={() => setIsComplaintModalOpen(true)}
                className="py-2.5 px-4 rounded-xl bg-[#CCFF00] text-black font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#CCFF00]/20"
              >
                <Plus size={16} />
                <span>Raise Complaint</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {filteredTickets.length === 0 ? (
                <div className="p-8 text-center bg-[#16171d] rounded-2xl border border-white/10 text-zinc-400 text-sm">
                  No matching maintenance tickets found.
                </div>
              ) : (
                filteredTickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-5 rounded-2xl bg-[#16171d] border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-[#CCFF00] font-bold">{t.id}</span>
                          <span className="text-zinc-500 text-xs">· {t.category}</span>
                          <span className="text-zinc-500 text-xs">· {t.date}</span>
                        </div>
                        <h4 className="font-display text-base font-bold text-white mb-1.5">{t.title}</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">{t.description}</p>
                      </div>

                      <span
                        className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold uppercase ${
                          t.status === 'Resolved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : t.status === 'In Progress'
                            ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB: PAY ==================== */}
        {activeTab === 'pay' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold">Payments & Financials</h2>
                <p className="text-xs text-zinc-400">Society maintenance invoices and payment receipts</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPayModalOpen(true)}
                className="py-2.5 px-4 rounded-xl bg-[#CCFF00] text-black font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#CCFF00]/20"
              >
                <Wallet size={16} />
                <span>Pay Maintenance</span>
              </button>
            </div>

            <div className="space-y-3">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-[#16171d] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display font-bold text-base text-white">{p.billMonth}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          p.status === 'Paid'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-[#CCFF00]/20 text-[#CCFF00]'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 flex gap-3">
                      <span>Due: {p.dueDate}</span>
                      {p.paidDate && <span>Paid on: {p.paidDate}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-display text-xl font-bold text-white">{p.amount}</span>
                    {p.status === 'Pending' ? (
                      <button
                        type="button"
                        onClick={() => setIsPayModalOpen(true)}
                        className="py-2 px-4 rounded-xl bg-[#CCFF00] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#bceb00]"
                      >
                        Pay Now
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => alert(`Official Receipt for ${p.billMonth}\nAmount: ${p.amount}\nStatus: Paid\nUnit: ${p.unit || profile.unit}`)}
                        className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-zinc-300 font-bold uppercase flex items-center gap-1.5"
                      >
                        <FileText size={14} />
                        <span>Receipt</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB: MESSAGES ==================== */}
        {activeTab === 'messages' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-display text-2xl font-bold">Society Noticeboard & Messages</h2>
              <p className="text-xs text-zinc-400">Official estate broadcasts and committee announcements</p>
            </div>

            <div className="space-y-4">
              {filteredAnnouncements.length === 0 ? (
                <div className="p-8 text-center bg-[#16171d] rounded-2xl border border-white/10 text-zinc-400 text-sm">
                  No announcements match your search.
                </div>
              ) : (
                filteredAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    onClick={() => setSelectedNotice(ann)}
                    className="p-5 rounded-2xl bg-[#16171d] border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold font-mono uppercase px-2 py-0.5 rounded bg-[#CCFF00]/20 text-[#CCFF00]">
                        {ann.eyebrow}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">{ann.timestamp}</span>
                    </div>
                    <h4 className="font-display text-lg font-bold text-white mb-1.5">{ann.title}</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">{ann.body}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB: PROFILE ==================== */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fade-in max-w-2xl">
            <div>
              <h2 className="font-display text-2xl font-bold">Resident Profile & Unit Details</h2>
              <p className="text-xs text-zinc-400">Account records registered with Maple Heights Estate Office</p>
            </div>

            {/* Profile Details Card */}
            <div className="p-6 rounded-3xl bg-[#16171d] border border-white/10 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                <div className="w-16 h-16 rounded-full bg-[#CCFF00] text-black font-display font-extrabold text-xl flex items-center justify-center">
                  {profile.initials || 'SK'}
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white">{profile.name}</h3>
                  <span className="text-xs text-zinc-400">{profile.unit || 'Tower B · Flat 704'}</span>
                  <span className="text-[10px] block text-[#CCFF00] font-bold uppercase mt-0.5">
                    {profile.resident_type || 'Owner Resident'} · Maple Heights
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400 text-xs">Registered Phone</span>
                  <span className="text-white font-mono text-xs">{profile.phone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400 text-xs">Registered Email</span>
                  <span className="text-white font-mono text-xs">{profile.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400 text-xs">Allocated Parking Slot</span>
                  <span className="text-white font-bold text-xs">{profile.parking_bay || 'Bay B-21 (Basement 1)'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400 text-xs">Registered Vehicle</span>
                  <span className="text-white font-mono text-xs">{profile.vehicle_number || 'MH-02-CD-8842 (Sedan)'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-400 text-xs">Intercom Extension</span>
                  <span className="text-white font-mono text-xs">{profile.intercom_ext || 'Ext. 704'}</span>
                </div>
              </div>
            </div>

            {/* FAMILY MEMBERS SECTION */}
            <div className="p-6 rounded-3xl bg-[#16171d] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#CCFF00]/15 text-[#CCFF00]">
                    <Users size={18} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">Family Members</h3>
                    <span className="text-[11px] text-zinc-400">
                      Registered co-occupants ({familyMembers.length})
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddFamily}
                  className="py-2 px-3.5 rounded-xl bg-[#CCFF00] text-black font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#bceb00] transition-colors shadow-md shadow-[#CCFF00]/15"
                >
                  <UserPlus size={15} />
                  <span>+ Add Member</span>
                </button>
              </div>

              {familyMembers.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs border border-dashed border-white/10 rounded-2xl p-4">
                  <Users size={28} className="mx-auto mb-2 text-zinc-600 opacity-60" />
                  <p className="font-semibold text-zinc-400 mb-1">No family members registered yet.</p>
                  <p className="text-[11px] text-zinc-500">
                    Add spouse, children, parents, or co-occupants living in this unit.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {familyMembers.map((member) => (
                    <div
                      key={member.id}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-display font-bold text-sm text-white">{member.name}</h4>
                          <span className="px-2 py-0.5 rounded bg-[#CCFF00]/15 text-[#CCFF00] text-[10px] font-extrabold uppercase">
                            {member.relationship}
                          </span>
                        </div>

                        <div className="text-xs text-zinc-400 space-y-1 pt-1">
                          {member.age !== undefined && member.age !== null && (
                            <div>Age: <span className="text-zinc-200">{member.age} yrs</span></div>
                          )}
                          {member.phone && (
                            <div className="font-mono text-zinc-300">📞 {member.phone}</div>
                          )}
                          {member.email && (
                            <div className="font-mono text-zinc-300 truncate">✉️ {member.email}</div>
                          )}
                          {member.emergency_contact && (
                            <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold uppercase">
                              Emergency Contact
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditFamily(member)}
                          className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFamilyMember(member.id, member.name)}
                          disabled={isDeletingMemberId === member.id}
                          className="py-1.5 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={13} />
                          <span>{isDeletingMemberId === member.id ? 'Removing...' : 'Remove'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Logout Card */}
            <div className="p-4 rounded-2xl bg-[#16171d] border border-white/10">
              <button
                type="button"
                onClick={onLogout}
                className="w-full py-3 px-4 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut size={16} />
                <span>Log out of Resident Portal</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* FLOATING BOTTOM NAVIGATION DOCK (Spaced & Visually Pleasing) */}
      <BottomNavDock
        role="resident"
        activeTab={activeTab}
        onSelectTab={(tabId) => setActiveTab(tabId as ResidentTab)}
      />

      {/* ALL INTERACTIVE MODALS */}
      <PaymentModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        payment={pendingPayment}
        onSuccess={handlePaymentSuccess}
      />

      <ComplaintModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        onSubmit={handleTicketAdded}
      />

      <GatePassModal
        isOpen={isGatePassModalOpen}
        onClose={() => setIsGatePassModalOpen(false)}
        onCreated={handleGatePassAdded}
      />

      <AmenityModal
        isOpen={isAmenityModalOpen}
        onClose={() => setIsAmenityModalOpen(false)}
        onBook={handleAmenityBooked}
      />

      <NoticeDetailModal
        notice={selectedNotice}
        onClose={() => setSelectedNotice(null)}
      />

      <FamilyMemberModal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
        memberToEdit={memberToEdit}
        onSaved={handleFamilySaved}
      />
    </div>
  );
};


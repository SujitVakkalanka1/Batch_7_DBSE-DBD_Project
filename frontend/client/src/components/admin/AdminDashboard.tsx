import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Bell,
  Megaphone,
  Users,
  ClipboardList,
  Receipt,
  ArrowUpRight,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  LogOut,
  SlidersHorizontal,
  Building,
  Building2,
  DollarSign,
  Download,
  UserPlus,
  UserCheck,
  UserX,
  Edit2,
  Eye,
  Filter,
  ArrowRightLeft,
  Settings2,
  Layers,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { BottomNavDock, AdminTab } from '../navigation/BottomNavDock';
import {
  adminProfile,
  adminHighlights,
  adminAnnouncements as defaultAdminAnnouncements,
  adminQuickActions,
  initialTickets,
} from '../../data/mockData';
import { ComplaintTicket, AnnouncementItem, TowerInfo } from '../../types/portal';
import {
  adminApi,
  AdminDashboardMetrics,
  complaintsApi,
  noticesApi,
  residentsApi,
  paymentsApi,
  towersApi,
  ResidentDirectoryItem,
} from '../../api';
import { BroadcastModal } from '../modals/BroadcastModal';
import { NoticeDetailModal } from '../modals/NoticeDetailModal';
import { ResidentFormModal } from '../modals/ResidentFormModal';
import { ResidentDetailModal } from '../modals/ResidentDetailModal';
import { TowerModal } from '../modals/TowerModal';
import { TransferResidentModal } from '../modals/TransferResidentModal';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<AnnouncementItem | null>(null);

  // Tickets management state
  const [tickets, setTickets] = useState<ComplaintTicket[]>(initialTickets);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(defaultAdminAnnouncements);
  const [directory, setDirectory] = useState<ResidentDirectoryItem[]>([]);
  const [metrics, setMetrics] = useState<AdminDashboardMetrics>({
    total_residents: 248,
    total_flats: 248,
    occupied_flats: 242,
    occupancy_rate: '98%',
    total_dues_collected: '₹9.42L',
    total_dues_pending: '₹19,400',
    collection_efficiency: '82% this cycle',
    pending_violations: 7,
    active_complaints: 4,
    pending_complaints: 1,
    in_progress_complaints: 1,
    resolved_complaints: 2,
    active_gate_passes: 1,
    upcoming_bookings: 2,
  });

  const [isExportingCsv, setIsExportingCsv] = useState(false);

  // Tower Management state
  const [towers, setTowers] = useState<TowerInfo[]>([]);
  const [isTowerModalOpen, setIsTowerModalOpen] = useState(false);
  const [towerToEdit, setTowerToEdit] = useState<TowerInfo | null>(null);

  // Transfer Resident state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [residentToTransfer, setResidentToTransfer] = useState<ResidentDirectoryItem | null>(null);

  // Resident Management state
  const [residentTowerFilter, setResidentTowerFilter] = useState('All');
  const [residentStatusFilter, setResidentStatusFilter] = useState('All');
  const [residentSearchQuery, setResidentSearchQuery] = useState('');
  const [isAddResidentModalOpen, setIsAddResidentModalOpen] = useState(false);
  const [residentToEdit, setResidentToEdit] = useState<ResidentDirectoryItem | null>(null);
  const [detailResidentId, setDetailResidentId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isTogglingStatusId, setIsTogglingStatusId] = useState<string | null>(null);
  const [isLoadingResidents, setIsLoadingResidents] = useState(false);

  // Fetch admin data on load
  const fetchAdminData = async () => {
    try {
      // 1. Dashboard Metrics
      try {
        const m = await adminApi.getDashboardMetrics();
        setMetrics(m);
      } catch (err) {
        console.warn('Error fetching metrics:', err);
      }

      // 2. Towers list with live occupancy & vacancy stats
      try {
        const towerList = await towersApi.getTowers();
        setTowers(towerList);
      } catch (err) {
        console.warn('Error fetching towers:', err);
      }

      // 3. All Complaints
      try {
        const allTickets = await complaintsApi.getAllComplaints();
        if (allTickets && allTickets.length > 0) {
          setTickets(allTickets);
        }
      } catch (err) {
        console.warn('Error fetching complaints:', err);
      }

      // 4. Notices
      try {
        const allNotices = await noticesApi.getAllNotices();
        if (allNotices && allNotices.length > 0) {
          setAnnouncements(allNotices);
        }
      } catch (err) {
        console.warn('Error fetching notices:', err);
      }

      // 5. Resident Directory
      await fetchResidentsList(residentTowerFilter, residentStatusFilter, residentSearchQuery);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  const fetchResidentsList = async (tower?: string, status?: string, search?: string) => {
    setIsLoadingResidents(true);
    try {
      const params: any = {};
      if (tower && tower !== 'All') params.tower = tower;
      if (status && status !== 'All') params.status = status;
      if (search && search.trim()) params.search = search.trim();

      const residents = await residentsApi.getAllResidents(params);
      if (residents) {
        setDirectory(residents);
      }
    } catch (err) {
      console.warn('Error fetching resident directory:', err);
    } finally {
      setIsLoadingResidents(false);
    }
  };

  const handleTowerFilterChange = (tower: string) => {
    setResidentTowerFilter(tower);
    fetchResidentsList(tower, residentStatusFilter, residentSearchQuery);
  };

  const handleStatusFilterChange = (status: string) => {
    setResidentStatusFilter(status);
    fetchResidentsList(residentTowerFilter, status, residentSearchQuery);
  };

  const handleResidentSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResidentsList(residentTowerFilter, residentStatusFilter, residentSearchQuery);
  };

  const handleOpenAddResident = () => {
    setResidentToEdit(null);
    setIsAddResidentModalOpen(true);
  };

  const handleOpenEditResident = (r: ResidentDirectoryItem) => {
    setResidentToEdit(r);
    setIsAddResidentModalOpen(true);
  };

  const handleOpenDetail = (id: string) => {
    setDetailResidentId(id);
    setIsDetailModalOpen(true);
  };

  const handleResidentSaved = async () => {
    await fetchAdminData();
    await fetchResidentsList(residentTowerFilter, residentStatusFilter, residentSearchQuery);
  };

  const handleToggleResidentStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Inactive' ? 'Active' : 'Inactive';
    setIsTogglingStatusId(id);
    try {
      await residentsApi.updateResidentStatus(id, nextStatus);
      // Update local state
      setDirectory((prev) =>
        prev.map((r) => (r.id === id ? { ...r, account_status: nextStatus, status: nextStatus } : r))
      );
      // Refresh metrics
      const m = await adminApi.getDashboardMetrics();
      setMetrics(m);
    } catch (err: any) {
      console.error('Error toggling status:', err);
      alert(err.response?.data?.detail || 'Failed to update resident status.');
    } finally {
      setIsTogglingStatusId(null);
    }
  };


  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleStatusChange = async (ticketId: string, newStatus: ComplaintTicket['status']) => {
    // Optimistic UI update
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );

    try {
      await complaintsApi.updateComplaintStatus(ticketId, newStatus);
      // Refresh metrics
      const updatedMetrics = await adminApi.getDashboardMetrics();
      setMetrics(updatedMetrics);
    } catch (err) {
      console.error('Failed to update ticket status on backend:', err);
    }
  };

  const handleBroadcastAdded = (newNotice: AnnouncementItem) => {
    setAnnouncements((prev) => [newNotice, ...prev]);
  };

  // Real CSV file download implementation
  const handleExportCsv = async () => {
    setIsExportingCsv(true);
    try {
      const blob = await paymentsApi.exportLedgerCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `maple_heights_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting ledger CSV:', err);
      alert('Failed to export CSV. Please ensure the backend server is running.');
    } finally {
      setIsExportingCsv(false);
    }
  };

  // Filtered tickets based on search
  const filteredTickets = useMemo(() => {
    if (!searchQuery) return tickets;
    const q = searchQuery.toLowerCase();
    return tickets.filter((t) =>
      t.title.toLowerCase().includes(q) ||
      t.unit.toLowerCase().includes(q) ||
      t.submittedBy.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q)
    );
  }, [tickets, searchQuery]);

  // Fallback directory if database has few records
  const residentDirectory = directory.length > 0 ? directory : [
    { id: '1', unit: 'A-101', name: 'Dr. Vikram Mehra', phone: '+91 98201 11223', status: 'Dues Cleared' },
    { id: '2', unit: 'A-204', name: 'Pooja Agarwal', phone: '+91 98202 22334', status: 'Dues Cleared' },
    { id: '3', unit: 'B-704', name: 'Sujit Kumar', phone: '+91 98765 43210', status: 'Dues Cleared' },
    { id: '4', unit: 'B-705', name: 'Amitabh Sen', phone: '+91 98203 33445', status: 'Due (₹4,850)' },
    { id: '5', unit: 'C-302', name: 'Kavita Nair', phone: '+91 98204 44556', status: 'Dues Cleared' },
    { id: '6', unit: 'C-901', name: 'Rohit Deshmukh', phone: '+91 98205 55667', status: 'Due (₹9,700)' },
  ];

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white pb-32 selection:bg-[#CCFF00] selection:text-black">
      {/* TOP ADMIN HEADER */}
      <header className="w-full bg-[#fbfbfb] text-zinc-900 border-b border-zinc-200/80 px-4 sm:px-8 py-5 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Admin Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-[#18191f] text-[#CCFF00] flex items-center justify-center font-display font-black text-sm shadow-md">
              ADM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-zinc-900 text-[#CCFF00] px-2 py-0.5 rounded-full">
                  Admin Console
                </span>
                <span className="text-xs text-zinc-500 font-medium">
                  {adminProfile.residency}
                </span>
              </div>
              <h1 className="font-display text-xl font-bold text-zinc-950 leading-tight">
                Society Operations Desk
              </h1>
              <span className="text-xs text-zinc-600">{adminProfile.unit}</span>
            </div>
          </div>

          {/* Quick Tools */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsBroadcastModalOpen(true)}
              className="py-2 px-3.5 rounded-full bg-[#CCFF00] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:bg-[#bceb00] transition-colors"
            >
              <Megaphone size={14} />
              <span>Broadcast Notice</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="py-2 px-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN ADMIN CANVAS */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-6">
        {/* ==================== TAB: OVERVIEW ==================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stat 1: Total Dues Collected */}
              <div
                onClick={() => setActiveTab('finances')}
                className="p-6 sm:p-7 rounded-3xl bg-[#CCFF00] text-black cursor-pointer hover:-translate-y-1 transition-all shadow-lg shadow-[#CCFF00]/20 flex flex-col justify-between min-h-[160px] group"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[11px] font-black uppercase tracking-widest text-black/80 font-mono">
                    TOTAL DUES RECONCILED
                  </span>
                  <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center transition-transform group-hover:rotate-45">
                    <ArrowUpRight size={18} strokeWidth={2.4} />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
                    {metrics.total_dues_collected}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs font-bold text-black/70">{metrics.collection_efficiency}</span>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-black text-[#CCFF00]">
                      Active Cycle
                    </span>
                  </div>
                </div>
              </div>

              {/* Stat 2: Pending Violations */}
              <div className="p-6 sm:p-7 rounded-3xl bg-[#16171d] border border-white/10 text-white flex flex-col justify-between min-h-[160px]">
                <div className="flex items-start justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 font-mono">
                    PENDING VIOLATIONS
                  </span>
                  <div className="p-2 rounded-full bg-white/5 text-amber-400">
                    <AlertTriangle size={18} />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                    0{metrics.pending_violations}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-400">
                    <span>3 parking flags · 2 noise notices · 2 renovation queries</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="font-display text-base font-bold uppercase tracking-wider text-zinc-200">
                  Management Tools
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {adminQuickActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => {
                      if (action.actionKey === 'broadcast') setIsBroadcastModalOpen(true);
                      if (action.actionKey === 'manage-residents') setActiveTab('settings');
                      if (action.actionKey === 'tickets') setActiveTab('tickets');
                      if (action.actionKey === 'finances') setActiveTab('finances');
                    }}
                    className="p-5 rounded-2xl bg-[#16171d] border border-white/10 hover:border-[#CCFF00]/50 hover:bg-[#1a1b22] text-left transition-all duration-200 group flex flex-col justify-between min-h-[130px]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/[0.06] text-[#CCFF00] flex items-center justify-center group-hover:scale-110 transition-transform">
                      {action.icon === 'megaphone' && <Megaphone size={20} />}
                      {action.icon === 'users' && <Users size={20} />}
                      {action.icon === 'clipboard' && <ClipboardList size={20} />}
                      {action.icon === 'receipt' && <Receipt size={20} />}
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
                ))}
              </div>
            </div>

            {/* Recent Broadcast Banner */}
            {announcements.length > 0 && (
              <div
                onClick={() => setSelectedNotice(announcements[0])}
                className="p-5 sm:p-6 rounded-3xl bg-[#16171d] border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#CCFF00] font-mono">
                    {announcements[0].eyebrow}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {announcements[0].timestamp}
                  </span>
                </div>
                <h4 className="font-display text-lg font-bold text-white group-hover:text-[#CCFF00] transition-colors mb-1">
                  {announcements[0].title}
                </h4>
                <p className="text-zinc-400 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                  {announcements[0].body}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: TICKETS ==================== */}
        {activeTab === 'tickets' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold">Society Maintenance Log</h2>
                <p className="text-xs text-zinc-400">Manage and resolve complaints submitted by residents</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter tickets..."
                  className="w-full pl-9 pr-4 py-2 bg-[#16171d] border border-white/15 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00]"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredTickets.length === 0 ? (
                <div className="p-8 text-center bg-[#16171d] rounded-2xl border border-white/10 text-zinc-400 text-sm">
                  No maintenance tickets found.
                </div>
              ) : (
                filteredTickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-5 rounded-2xl bg-[#16171d] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#CCFF00] font-bold">{t.id}</span>
                        <span className="text-zinc-400 text-xs font-semibold">· {t.unit}</span>
                        <span className="text-zinc-500 text-xs">· {t.submittedBy}</span>
                      </div>
                      <h4 className="font-display text-base font-bold text-white">{t.title}</h4>
                      <p className="text-xs text-zinc-400">{t.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t.id, e.target.value as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase bg-[#0d0e11] border focus:outline-none ${
                          t.status === 'Resolved'
                            ? 'border-emerald-500 text-emerald-400'
                            : t.status === 'In Progress'
                            ? 'border-sky-500 text-sky-400'
                            : 'border-amber-500 text-amber-400'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB: FINANCES ==================== */}
        {activeTab === 'finances' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold">Dues & Ledger Reconciliation</h2>
                <p className="text-xs text-zinc-400">Track collections across 248 units for September 2026</p>
              </div>
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={isExportingCsv}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-white transition-colors disabled:opacity-50"
              >
                {isExportingCsv ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                <span>{isExportingCsv ? 'Exporting...' : 'Export CSV'}</span>
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-[#16171d] border border-white/10 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 font-mono uppercase text-[10px]">
                    <th className="pb-3">Unit</th>
                    <th className="pb-3">Resident</th>
                    <th className="pb-3">Contact</th>
                    <th className="pb-3">Dues Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {residentDirectory.map((r) => (
                    <tr key={r.unit} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 font-bold text-white">{r.unit}</td>
                      <td className="py-3.5 text-zinc-300">{r.name}</td>
                      <td className="py-3.5 font-mono text-zinc-400">{r.phone}</td>
                      <td className="py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            r.status === 'Dues Cleared'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => alert(`Sending automated payment reminder to ${r.name} (${r.unit}) via SMS and Portal notice.`)}
                          className="text-[11px] text-[#CCFF00] hover:underline font-bold"
                        >
                          Send Reminder
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB: BROADCASTS ==================== */}
        {activeTab === 'broadcasts' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold">Broadcast Dispatch Center</h2>
                <p className="text-xs text-zinc-400">Publish notices to resident dashboards and gate screens</p>
              </div>
              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(true)}
                className="py-2.5 px-4 rounded-xl bg-[#CCFF00] text-black font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#CCFF00]/20"
              >
                <Plus size={16} />
                <span>New Broadcast</span>
              </button>
            </div>

            <div className="space-y-3">
              {announcements.map((ann) => (
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
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB: MANAGEMENT / SETTINGS ==================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header with Title, Add Tower, and Add Resident Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold">Resident & Family Member Directory</h2>
                <p className="text-xs text-zinc-400">
                  Manage resident records, tower allocations, capacity limits, vacant flats, and family members
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setTowerToEdit(null);
                    setIsTowerModalOpen(true);
                  }}
                  className="py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-white/10"
                >
                  <Building2 size={15} className="text-[#CCFF00]" />
                  <span>Manage Towers</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddResident}
                  className="py-2.5 px-4 rounded-xl bg-[#CCFF00] text-black font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#CCFF00]/20 hover:bg-[#bceb00] transition-colors"
                >
                  <UserPlus size={16} />
                  <span>Add Resident</span>
                </button>
              </div>
            </div>

            {/* Dynamic Tower Occupancy & Vacancy Summary Cards */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                  Towers & Wing Vacancy Overview ({towers.length} Towers)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setTowerToEdit(null);
                    setIsTowerModalOpen(true);
                  }}
                  className="text-xs text-[#CCFF00] hover:underline flex items-center gap-1 font-semibold"
                >
                  <Plus size={13} />
                  <span>Add Tower</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {towers.map((t) => {
                  // Compute live occupied and vacant counts based on directory if available
                  const liveOccupied = directory.filter(
                    (r) =>
                      (r.tower === t.name || (r.unit && r.unit.startsWith(t.name))) &&
                      r.account_status !== 'Inactive' &&
                      r.status !== 'Inactive'
                  ).length;
                  const displayOccupied = liveOccupied > 0 ? liveOccupied : t.occupied_flats;
                  const displayVacant = Math.max(0, t.total_flats - displayOccupied);
                  const occRate = t.total_flats > 0 ? `${Math.round((displayOccupied / t.total_flats) * 100)}%` : '0%';
                  const isSelected = residentTowerFilter === t.name;

                  return (
                    <div
                      key={t.id}
                      onClick={() => handleTowerFilterChange(t.name)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#CCFF00]/10 border-[#CCFF00] shadow-lg shadow-[#CCFF00]/10 ring-1 ring-[#CCFF00]'
                          : 'bg-[#16171d] border-white/10 hover:border-white/20 hover:bg-[#1a1b22]'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <span className="text-xs font-mono text-zinc-400 block font-bold">
                            {t.name}
                          </span>
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTowerToEdit(t);
                                setIsTowerModalOpen(true);
                              }}
                              className="p-1 rounded-md hover:bg-white/10 text-zinc-400 hover:text-[#CCFF00] transition-colors"
                              title="Edit Capacity & Specs"
                            >
                              <Edit2 size={12} />
                            </button>
                          </div>
                        </div>

                        <div className="mt-2">
                          <span className="font-display text-2xl font-extrabold text-white block">
                            {t.total_flats} Units
                          </span>
                          <span className="text-[11px] text-zinc-400 block">
                            {t.floor_count || 14} Floors · {t.description || 'Residential Wing'}
                          </span>
                        </div>
                      </div>

                      {/* Occupied and Vacant Flat Indicators */}
                      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="font-bold">{displayOccupied} Occupied</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-400">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          <span className="font-bold">{displayVacant} Vacant</span>
                        </div>
                      </div>

                      {/* Percentage Tag */}
                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-zinc-300">
                          {occRate} Occupancy
                        </span>
                        {displayVacant > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                            {displayVacant} Flats Available
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                            100% Full
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 rounded-2xl bg-[#16171d] border border-white/10 space-y-3">
              <form onSubmit={handleResidentSearch} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={residentSearchQuery}
                    onChange={(e) => setResidentSearchQuery(e.target.value)}
                    placeholder="Search residents by name, unit, phone, or email..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00] transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold uppercase tracking-wider text-white shrink-0"
                >
                  Search
                </button>
              </form>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs">
                {/* Dynamic Tower Filter Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase mr-1">Tower:</span>
                  {['All', ...towers.map((t) => t.name)].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTowerFilterChange(t)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        residentTowerFilter === t
                          ? 'bg-[#CCFF00] text-black font-bold shadow-md shadow-[#CCFF00]/10'
                          : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Status Filters */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase mr-1">Status:</span>
                  {['All', 'Active', 'Inactive'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleStatusFilterChange(s)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        residentStatusFilter === s
                          ? s === 'Active'
                            ? 'bg-emerald-500 text-white font-bold'
                            : s === 'Inactive'
                            ? 'bg-red-500 text-white font-bold'
                            : 'bg-[#CCFF00] text-black font-bold'
                          : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Residents Table / List */}
            <div className="p-6 rounded-3xl bg-[#16171d] border border-white/10 overflow-x-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase text-zinc-400">
                  Showing {directory.length} resident records {residentTowerFilter !== 'All' && `in ${residentTowerFilter}`}
                </span>
                {isLoadingResidents && (
                  <span className="text-xs text-[#CCFF00] flex items-center gap-1.5">
                    <span className="w-3 h-3 border-2 border-[#CCFF00] border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </span>
                )}
              </div>

              {directory.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs border border-dashed border-white/10 rounded-2xl space-y-2">
                  <p>No resident records match your criteria in {residentTowerFilter}.</p>
                  <p className="text-[11px] text-zinc-600">You can transfer residents from another tower or add new records.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-zinc-400 font-mono uppercase text-[10px]">
                      <th className="pb-3">Resident & Unit</th>
                      <th className="pb-3">Contact</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Family Members</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {directory.map((r) => {
                      const isInactive = r.account_status === 'Inactive' || r.status === 'Inactive';
                      return (
                        <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white/10 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                {r.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-white block">{r.name}</span>
                                <span className="text-[11px] text-zinc-400 font-mono">{r.unit}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5">
                            <span className="font-mono text-zinc-300 block">{r.phone}</span>
                            {r.email && <span className="font-mono text-[11px] text-zinc-500 block truncate">{r.email}</span>}
                          </td>
                          <td className="py-3.5">
                            <span className="text-zinc-300 text-[11px]">{r.resident_type || 'Owner Resident'}</span>
                          </td>
                          <td className="py-3.5">
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(r.id)}
                              className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-zinc-300 font-semibold flex items-center gap-1.5 transition-colors"
                              title="Click to view family members"
                            >
                              <Users size={12} className="text-[#CCFF00]" />
                              <span>{r.family_count || 0} Members</span>
                            </button>
                          </td>
                          <td className="py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                isInactive
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-emerald-500/20 text-emerald-400'
                              }`}
                            >
                              {isInactive ? 'Inactive' : 'Active'}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Transfer / Move Tower Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setResidentToTransfer(r);
                                  setIsTransferModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-[#CCFF00]/20 text-zinc-300 hover:text-[#CCFF00] transition-colors"
                                title="Transfer / Reflect Resident into Tower B or another Tower"
                              >
                                <ArrowRightLeft size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenDetail(r.id)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                                title="View Details & Family Members"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditResident(r)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-[#CCFF00] transition-colors"
                                title="Edit Resident & Tower Assignment"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleResidentStatus(r.id, isInactive ? 'Inactive' : 'Active')}
                                disabled={isTogglingStatusId === r.id}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isInactive
                                    ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400'
                                    : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-400'
                                }`}
                                title={isInactive ? 'Reactivate Resident' : 'Deactivate Resident'}
                              >
                                {isInactive ? <UserCheck size={14} /> : <UserX size={14} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>

      {/* FLOATING BOTTOM NAVIGATION DOCK */}
      <BottomNavDock
        role="admin"
        activeTab={activeTab}
        onSelectTab={(tabId) => setActiveTab(tabId as AdminTab)}
      />

      {/* MODALS */}
      <BroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        onBroadcast={handleBroadcastAdded}
      />

      <NoticeDetailModal
        notice={selectedNotice}
        onClose={() => setSelectedNotice(null)}
      />

      <ResidentFormModal
        isOpen={isAddResidentModalOpen}
        onClose={() => setIsAddResidentModalOpen(false)}
        residentToEdit={residentToEdit}
        onSaved={handleResidentSaved}
      />

      <ResidentDetailModal
        isOpen={isDetailModalOpen}
        residentId={detailResidentId}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={(res) => {
          setResidentToEdit(res);
          setIsAddResidentModalOpen(true);
        }}
        onStatusToggle={(id, newStatus) => {
          setDirectory((prev) =>
            prev.map((r) => (r.id === id ? { ...r, account_status: newStatus, status: newStatus } : r))
          );
        }}
      />

      {/* TOWER MANAGEMENT MODAL */}
      <TowerModal
        isOpen={isTowerModalOpen}
        onClose={() => {
          setIsTowerModalOpen(false);
          setTowerToEdit(null);
        }}
        initialTowerToEdit={towerToEdit}
        onTowersChanged={async () => {
          await fetchAdminData();
          await fetchResidentsList(residentTowerFilter, residentStatusFilter, residentSearchQuery);
        }}
      />

      {/* RESIDENT TOWER TRANSFER MODAL */}
      <TransferResidentModal
        isOpen={isTransferModalOpen}
        resident={residentToTransfer}
        onClose={() => {
          setIsTransferModalOpen(false);
          setResidentToTransfer(null);
        }}
        onTransferred={async () => {
          await fetchAdminData();
          await fetchResidentsList(residentTowerFilter, residentStatusFilter, residentSearchQuery);
        }}
      />
    </div>
  );
};


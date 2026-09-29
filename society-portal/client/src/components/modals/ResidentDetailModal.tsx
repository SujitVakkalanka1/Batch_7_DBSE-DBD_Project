import React, { useState, useEffect } from 'react';
import { X, User, Building, Phone, Mail, Car, Users, ShieldAlert, CheckCircle2, Edit2, UserX, UserCheck } from 'lucide-react';
import { UserProfile, FamilyMember } from '../../types/portal';
import { residentsApi, ResidentDetailResponse } from '../../api/residents';
import { familyMembersApi } from '../../api/familyMembers';

interface ResidentDetailModalProps {
  isOpen: boolean;
  residentId: string | null;
  onClose: () => void;
  onEdit: (resident: ResidentDetailResponse) => void;
  onStatusToggle: (residentId: string, newStatus: string) => void;
}

export const ResidentDetailModal: React.FC<ResidentDetailModalProps> = ({
  isOpen,
  residentId,
  onClose,
  onEdit,
  onStatusToggle,
}) => {
  const [resident, setResident] = useState<ResidentDetailResponse | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (isOpen && residentId) {
      loadResidentDetails();
    } else {
      setResident(null);
      setFamilyMembers([]);
      setErrorMsg('');
    }
  }, [isOpen, residentId]);

  const loadResidentDetails = async () => {
    if (!residentId) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const details = await residentsApi.getResidentById(residentId);
      setResident(details);

      // Load family members specifically
      try {
        const fam = await familyMembersApi.getResidentFamilyMembersAdmin(residentId);
        setFamilyMembers(fam || []);
      } catch {
        setFamilyMembers(details.family_members || []);
      }
    } catch (err: any) {
      console.error('Error loading resident details:', err);
      setErrorMsg(err.response?.data?.detail || 'Failed to load resident record.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !residentId) return null;

  const currentStatus = resident?.account_status || resident?.status || 'Active';
  const isInactive = currentStatus === 'Inactive';

  const handleToggleStatus = async () => {
    if (!resident) return;
    const targetStatus = isInactive ? 'Active' : 'Inactive';
    setIsUpdatingStatus(true);
    try {
      await residentsApi.updateResidentStatus(resident.id || residentId, targetStatus);
      setResident({ ...resident, status: targetStatus, account_status: targetStatus });
      onStatusToggle(resident.id || residentId, targetStatus);
    } catch (err: any) {
      console.error('Error toggling resident status:', err);
      setErrorMsg(err.response?.data?.detail || 'Failed to change resident status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#15161b] border border-white/15 text-white shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#CCFF00] text-black font-display font-extrabold text-lg flex items-center justify-center">
              {resident?.initials || resident?.name?.substring(0, 2).toUpperCase() || 'RS'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl font-bold text-white">
                  {resident?.name || 'Resident Details'}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    isInactive ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {currentStatus}
                </span>
              </div>
              <span className="text-xs text-zinc-400">{resident?.unit || 'Tower Unit'}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs">
              {errorMsg}
            </div>
          )}

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-zinc-400 text-xs gap-3">
              <span className="w-6 h-6 border-2 border-[#CCFF00] border-t-transparent rounded-full animate-spin" />
              <span>Fetching resident records & family members...</span>
            </div>
          ) : (
            resident && (
              <>
                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                    <span className="text-zinc-500 uppercase font-mono text-[10px] block">Contact Phone</span>
                    <span className="text-white font-mono font-medium">{resident.phone}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                    <span className="text-zinc-500 uppercase font-mono text-[10px] block">Email Address</span>
                    <span className="text-white font-mono font-medium">{resident.email}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                    <span className="text-zinc-500 uppercase font-mono text-[10px] block">Tenancy Status</span>
                    <span className="text-white font-medium">{resident.resident_type || 'Owner Resident'}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                    <span className="text-zinc-500 uppercase font-mono text-[10px] block">Allocated Parking</span>
                    <span className="text-white font-medium">{resident.parking_bay || 'Standard Parking'}</span>
                  </div>
                </div>

                {/* Family Members Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-[#CCFF00]" />
                      <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                        Registered Family Members ({familyMembers.length})
                      </h4>
                    </div>
                  </div>

                  {familyMembers.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center text-zinc-500 text-xs">
                      No family members registered under this resident account.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {familyMembers.map((member) => (
                        <div
                          key={member.id}
                          className="p-3.5 rounded-2xl bg-[#1c1e24] border border-white/10 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-display font-bold text-sm text-white">{member.name}</span>
                            <span className="px-2 py-0.5 rounded bg-[#CCFF00]/15 text-[#CCFF00] text-[10px] font-bold uppercase">
                              {member.relationship}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400 space-y-0.5">
                            {member.age !== undefined && member.age !== null && (
                              <div>Age: <span className="text-zinc-200">{member.age} yrs</span></div>
                            )}
                            {member.phone && (
                              <div className="font-mono text-zinc-300">📞 {member.phone}</div>
                            )}
                            {member.email && (
                              <div className="font-mono text-zinc-300">✉️ {member.email}</div>
                            )}
                            {member.emergency_contact && (
                              <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold uppercase">
                                Emergency Contact
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Notice */}
                {isInactive && (
                  <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <ShieldAlert size={16} className="shrink-0" />
                    <span>
                      This resident account is currently <strong>Deactivated</strong>. Historical payment receipts, complaints, and bookings are safely preserved.
                    </span>
                  </div>
                )}
              </>
            )
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#111216]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={isUpdatingStatus || !resident}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                isInactive
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30'
              }`}
            >
              {isInactive ? <UserCheck size={14} /> : <UserX size={14} />}
              <span>{isInactive ? 'Reactivate Resident' : 'Deactivate Resident'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                if (resident) {
                  onEdit(resident);
                  onClose();
                }
              }}
              className="py-2 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5"
            >
              <Edit2 size={14} />
              <span>Edit Record</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-5 rounded-xl bg-[#CCFF00] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#bceb00]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

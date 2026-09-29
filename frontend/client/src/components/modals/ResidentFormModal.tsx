import React, { useState, useEffect } from 'react';
import { X, User, Building, Phone, Mail, Shield, KeyRound, Car } from 'lucide-react';
import { UserProfile } from '../../types/portal';
import { residentsApi, ResidentDirectoryItem } from '../../api/residents';

interface ResidentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  residentToEdit?: ResidentDirectoryItem | UserProfile | null;
  onSaved: (resident: any) => void;
}

const TOWERS = ['Tower A', 'Tower B', 'Tower C'];
const RESIDENT_TYPES = ['Owner Resident', 'Tenant Resident'];

export const ResidentFormModal: React.FC<ResidentFormModalProps> = ({
  isOpen,
  onClose,
  residentToEdit,
  onSaved,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tower, setTower] = useState('Tower A');
  const [flatNumber, setFlatNumber] = useState('');
  const [residentType, setResidentType] = useState('Owner Resident');
  const [password, setPassword] = useState('123456');
  const [parkingBay, setParkingBay] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [status, setStatus] = useState('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (residentToEdit) {
      setName(residentToEdit.name || '');
      setEmail(residentToEdit.email || '');
      setPhone(residentToEdit.phone || '');
      setTower(residentToEdit.tower || 'Tower A');
      setFlatNumber(residentToEdit.flat_number || '');
      setResidentType(residentToEdit.resident_type || 'Owner Resident');
      setParkingBay((residentToEdit as any).parking_bay || '');
      setVehicleNumber((residentToEdit as any).vehicle_number || '');
      setStatus((residentToEdit as any).account_status || residentToEdit.status || 'Active');
      setPassword('');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setTower('Tower A');
      setFlatNumber('');
      setResidentType('Owner Resident');
      setPassword('123456');
      setParkingBay('');
      setVehicleNumber('');
      setStatus('Active');
    }
    setErrorMsg('');
  }, [residentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !flatNumber.trim()) {
      setErrorMsg('Name, email, phone, and flat number are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const unitFormatted = `${tower} · Flat ${flatNumber.trim()}`;

    const payload: Record<string, any> = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      tower,
      flat_number: flatNumber.trim(),
      unit: unitFormatted,
      resident_type: residentType,
      parking_bay: parkingBay.trim() || `Bay ${tower.split(' ')[1] || 'A'}-${flatNumber.trim()}`,
      vehicle_number: vehicleNumber.trim() || undefined,
      status,
      role: 'resident',
    };

    if (!residentToEdit && password.trim()) {
      payload.password = password.trim();
    }

    try {
      let result;
      if (residentToEdit && residentToEdit.id) {
        result = await residentsApi.updateResident(residentToEdit.id, payload);
      } else {
        result = await residentsApi.createResident(payload);
      }
      onSaved(result);
      onClose();
    } catch (err: any) {
      console.error('Error saving resident:', err);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setErrorMsg(detail.map((d: any) => d.msg || d.loc?.join('.')).join(', '));
      } else {
        setErrorMsg(detail || 'Failed to save resident record.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#15161b] border border-white/15 text-white shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#CCFF00]/15 text-[#CCFF00]">
              <Building size={20} />
            </div>
            <div>
              <span className="text-[#CCFF00] font-mono text-[10px] font-bold tracking-widest uppercase block">
                Administration Registry
              </span>
              <h3 className="font-display text-xl font-bold">
                {residentToEdit ? 'Edit Resident Record' : 'Add New Resident'}
              </h3>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sujit Vakkalanka"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00]"
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="resident@society.com"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00]"
              />
            </div>
          </div>

          {/* Tower & Flat Number */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Tower Assignment *
              </label>
              <select
                value={tower}
                onChange={(e) => setTower(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#1c1e24] border border-white/10 text-sm text-white focus:outline-none focus:border-[#CCFF00]"
              >
                {TOWERS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Flat / Unit Number *
              </label>
              <input
                type="text"
                required
                value={flatNumber}
                onChange={(e) => setFlatNumber(e.target.value)}
                placeholder="e.g. 704 or A-201"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00]"
              />
            </div>
          </div>

          {/* Resident Type & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Resident Type *
              </label>
              <select
                value={residentType}
                onChange={(e) => setResidentType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#1c1e24] border border-white/10 text-sm text-white focus:outline-none focus:border-[#CCFF00]"
              >
                {RESIDENT_TYPES.map((rt) => (
                  <option key={rt} value={rt}>
                    {rt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Account Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#1c1e24] border border-white/10 text-sm text-white focus:outline-none focus:border-[#CCFF00]"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive (Deactivated)</option>
              </select>
            </div>
          </div>

          {/* Initial Password (only for new resident) */}
          {!residentToEdit && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Initial Login Passcode / Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Defaults to 123456"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00]"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                The resident can change their passcode after initial login.
              </span>
            </div>
          )}

          {/* Parking & Vehicle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Parking Bay (Optional)
              </label>
              <input
                type="text"
                value={parkingBay}
                onChange={(e) => setParkingBay(e.target.value)}
                placeholder="e.g. Bay B-21"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Vehicle Plate (Optional)
              </label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="e.g. MH-02-CD-8842"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-6 rounded-xl bg-[#CCFF00] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#bceb00] disabled:opacity-50 transition-colors shadow-lg shadow-[#CCFF00]/20"
            >
              {isSubmitting ? 'Saving...' : residentToEdit ? 'Save Changes' : 'Add Resident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

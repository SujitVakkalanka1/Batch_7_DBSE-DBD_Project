import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, Building, CheckCircle2, AlertTriangle, User, Home, Car } from 'lucide-react';
import { ResidentDirectoryItem, TowerInfo } from '../../types/portal';
import { towersApi, residentsApi } from '../../api';

interface TransferResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  resident: ResidentDirectoryItem | null;
  onTransferred: () => void;
}

export const TransferResidentModal: React.FC<TransferResidentModalProps> = ({
  isOpen,
  onClose,
  resident,
  onTransferred,
}) => {
  const [towers, setTowers] = useState<TowerInfo[]>([]);
  const [targetTower, setTargetTower] = useState('Tower B');
  const [targetFlat, setTargetFlat] = useState('');
  const [targetParking, setTargetParking] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen && resident) {
      setErrorMsg('');
      // Load available towers
      towersApi.getTowers().then((list) => {
        setTowers(list);
        // Default target tower to Tower B if coming from Tower A, or any different tower
        const otherTower = list.find((t) => t.name !== resident.tower && t.name !== resident.unit?.split('·')[0]?.trim());
        if (otherTower) {
          setTargetTower(otherTower.name);
        } else if (list.length > 0) {
          setTargetTower(list[0].name);
        }
      });

      setTargetFlat(resident.flat_number || resident.unit?.split('·')[-1]?.replace('Flat', '').trim() || '704');
      const towerInitial = 'B';
      setTargetParking(`Bay ${towerInitial}-${resident.flat_number || '704'} (Basement 1)`);
    }
  }, [isOpen, resident]);

  const handleTargetTowerChange = (newTower: string) => {
    setTargetTower(newTower);
    const towerInitial = newTower.split(' ')[1] || newTower[0] || 'B';
    setTargetParking(`Bay ${towerInitial}-${targetFlat || '101'} (Basement 1)`);
  };

  const handleFlatChange = (newFlat: string) => {
    setTargetFlat(newFlat);
    const towerInitial = targetTower.split(' ')[1] || targetTower[0] || 'B';
    setTargetParking(`Bay ${towerInitial}-${newFlat} (Basement 1)`);
  };

  if (!isOpen || !resident) return null;

  const currentTower = resident.tower || resident.unit?.split('·')[0]?.trim() || 'Tower A';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTower.trim() || !targetFlat.trim()) {
      setErrorMsg('Target tower and flat number are required.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      await towersApi.transferResident({
        resident_id: resident.id,
        target_tower: targetTower.trim(),
        target_flat: targetFlat.trim(),
        target_parking: targetParking.trim(),
      });

      onTransferred();
      onClose();
    } catch (err: any) {
      console.error('Error transferring resident:', err);
      setErrorMsg(err.response?.data?.detail || 'Failed to reassign tower for resident.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#15161b] border border-white/15 text-white shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#CCFF00]/15 text-[#CCFF00]">
              <ArrowRightLeft size={20} />
            </div>
            <div>
              <span className="text-[#CCFF00] font-mono text-[10px] font-bold tracking-widest uppercase block">
                Resident Tower Reallocation
              </span>
              <h3 className="font-display text-xl font-bold">Transfer / Reflect Tower</h3>
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current Allocation Card */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">
              Current Resident Record
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] font-bold text-xs flex items-center justify-center">
                  {resident.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{resident.name}</h4>
                  <span className="text-xs text-zinc-400 font-mono">{resident.phone}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-xs font-mono font-bold text-zinc-200 block">
                  {resident.unit}
                </span>
                <span className="text-[10px] text-zinc-500 mt-0.5 block">{currentTower}</span>
              </div>
            </div>
          </div>

          {/* Target Tower Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Destination Tower *
              </label>
              <select
                value={targetTower}
                onChange={(e) => handleTargetTowerChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#1c1e24] border border-white/10 text-sm text-white focus:outline-none focus:border-[#CCFF00]"
              >
                {towers.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name} ({t.vacant_flats} vacant flats)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                New Flat / Unit Number *
              </label>
              <input
                type="text"
                required
                value={targetFlat}
                onChange={(e) => handleFlatChange(e.target.value)}
                placeholder="e.g. 704 or 101"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00]"
              />
            </div>
          </div>

          {/* New Parking Bay */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Assigned Parking Bay
            </label>
            <div className="relative">
              <Car size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={targetParking}
                onChange={(e) => setTargetParking(e.target.value)}
                placeholder="Bay B-21 (Basement 1)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00]"
              />
            </div>
          </div>

          {/* Transfer Preview Banner */}
          <div className="p-3.5 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-xs text-zinc-200">
            <div className="flex items-center gap-2 text-[#CCFF00] font-bold mb-1">
              <ArrowRightLeft size={14} />
              <span>Preview New Unit Assignment</span>
            </div>
            <p className="text-zinc-300">
              Resident will be reflected as <strong>{targetTower} · Flat {targetFlat || '___'}</strong>.
              Live vacant counts in {currentTower} and {targetTower} will be automatically updated.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-[#CCFF00] text-black font-display font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#CCFF00]/20 hover:bg-[#bceb00] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Transfer Resident</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

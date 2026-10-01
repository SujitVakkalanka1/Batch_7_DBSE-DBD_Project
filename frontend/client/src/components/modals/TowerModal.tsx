import React, { useState, useEffect } from 'react';
import { X, Building2, Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, Layers, Home, Users } from 'lucide-react';
import { TowerInfo } from '../../types/portal';
import { towersApi } from '../../api';

interface TowerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTowersChanged: () => void;
  initialTowerToEdit?: TowerInfo | null;
}

export const TowerModal: React.FC<TowerModalProps> = ({
  isOpen,
  onClose,
  onTowersChanged,
  initialTowerToEdit,
}) => {
  const [towers, setTowers] = useState<TowerInfo[]>([]);
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingTower, setEditingTower] = useState<TowerInfo | null>(null);

  // Form states
  const [towerName, setTowerName] = useState('');
  const [totalFlats, setTotalFlats] = useState(84);
  const [floorCount, setFloorCount] = useState(14);
  const [description, setDescription] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchTowers = async () => {
    setIsLoading(true);
    try {
      const data = await towersApi.getTowers();
      setTowers(data);
    } catch (err) {
      console.error('Failed to load towers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTowers();
      if (initialTowerToEdit) {
        startEditTower(initialTowerToEdit);
      } else {
        setMode('list');
      }
      setErrorMsg('');
      setSuccessMsg('');
      setDeleteConfirmId(null);
    }
  }, [isOpen, initialTowerToEdit]);

  if (!isOpen) return null;

  const startAddTower = () => {
    setTowerName('');
    setTotalFlats(84);
    setFloorCount(14);
    setDescription('');
    setEditingTower(null);
    setErrorMsg('');
    setSuccessMsg('');
    setMode('add');
  };

  const startEditTower = (t: TowerInfo) => {
    setEditingTower(t);
    setTowerName(t.name);
    setTotalFlats(t.total_flats);
    setFloorCount(t.floor_count || 14);
    setDescription(t.description || '');
    setErrorMsg('');
    setSuccessMsg('');
    setMode('edit');
  };

  const handleSaveTower = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!towerName.trim()) {
      setErrorMsg('Tower name is required.');
      return;
    }
    if (totalFlats <= 0) {
      setErrorMsg('Total flats capacity must be greater than 0.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'add') {
        await towersApi.createTower({
          name: towerName.trim(),
          total_flats: Number(totalFlats),
          floor_count: Number(floorCount),
          description: description.trim(),
        });
        setSuccessMsg(`Tower "${towerName.trim()}" created successfully!`);
      } else if (mode === 'edit' && editingTower) {
        await towersApi.updateTower(editingTower.id, {
          name: towerName.trim(),
          total_flats: Number(totalFlats),
          floor_count: Number(floorCount),
          description: description.trim(),
        });
        setSuccessMsg(`Tower "${towerName.trim()}" updated successfully!`);
      }
      await fetchTowers();
      onTowersChanged();
      setTimeout(() => {
        setMode('list');
        setSuccessMsg('');
      }, 1200);
    } catch (err: any) {
      console.error('Error saving tower:', err);
      setErrorMsg(err.response?.data?.detail || 'Failed to save tower.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTower = async (towerId: string, towerNameStr: string) => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await towersApi.deleteTower(towerId);
      setSuccessMsg(`Tower "${towerNameStr}" deleted successfully!`);
      setDeleteConfirmId(null);
      await fetchTowers();
      onTowersChanged();
    } catch (err: any) {
      console.error('Error deleting tower:', err);
      setErrorMsg(err.response?.data?.detail || 'Failed to delete tower. Ensure it has no residents.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#15161b] border border-white/15 text-white shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#CCFF00]/15 text-[#CCFF00]">
              <Building2 size={22} />
            </div>
            <div>
              <span className="text-[#CCFF00] font-mono text-[10px] font-bold tracking-widest uppercase block">
                Tower & Wing Management
              </span>
              <h3 className="font-display text-xl font-bold">
                {mode === 'list' && 'Society Towers & Unit Allocations'}
                {mode === 'add' && 'Add New Residential Tower'}
                {mode === 'edit' && `Edit ${editingTower?.name || 'Tower'}`}
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

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {mode === 'list' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-zinc-400">
                  Configure society towers, specify resident capacity, monitor vacancy rates, or add/delete wings.
                </p>
                <button
                  type="button"
                  onClick={startAddTower}
                  className="py-2 px-3.5 rounded-xl bg-[#CCFF00] text-black font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:bg-[#bceb00] transition-colors shrink-0"
                >
                  <Plus size={15} />
                  <span>Add Tower</span>
                </button>
              </div>

              {/* Towers List */}
              <div className="space-y-3">
                {towers.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#1c1e24] text-[#CCFF00] flex items-center justify-center font-bold font-mono text-sm shrink-0 border border-white/10">
                        {t.name.replace('Tower ', '').substring(0, 2) || 'TW'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display text-base font-bold text-white">{t.name}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                            {t.floor_count || 14} Floors
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">{t.description || 'Residential Wing'}</p>

                        {/* Live Unit Stats */}
                        <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs">
                          <div className="inline-flex items-center gap-1 text-zinc-300 font-mono">
                            <Home size={13} className="text-zinc-500" />
                            <span><strong>{t.total_flats}</strong> Total Units</span>
                          </div>
                          <span className="text-zinc-600">·</span>
                          <div className="inline-flex items-center gap-1 text-emerald-400 font-mono">
                            <Users size={13} />
                            <span><strong>{t.occupied_flats}</strong> Occupied ({t.occupancy_rate})</span>
                          </div>
                          <span className="text-zinc-600">·</span>
                          <div className="inline-flex items-center gap-1 text-amber-400 font-mono">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            <span><strong>{t.vacant_flats}</strong> Vacant Flats ({t.vacancy_rate})</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => startEditTower(t)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-[#CCFF00] text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Edit Tower Capacity & Specs"
                      >
                        <Edit2 size={14} />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      {deleteConfirmId === t.id ? (
                        <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 p-1 rounded-xl">
                          <span className="text-[10px] text-red-300 font-bold pl-1.5">Confirm?</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteTower(t.id, t.name)}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold uppercase"
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-1.5 py-1 text-zinc-400 hover:text-white text-[10px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(t.id)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Delete Tower"
                        >
                          <Trash2 size={14} />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Add or Edit Form */
            <form onSubmit={handleSaveTower} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Tower / Wing Name *
                </label>
                <input
                  type="text"
                  required
                  value={towerName}
                  onChange={(e) => setTowerName(e.target.value)}
                  placeholder="e.g. Tower D or North Wing"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Total Flats / Units Capacity *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={1000}
                    value={totalFlats}
                    onChange={(e) => setTotalFlats(Number(e.target.value))}
                    placeholder="84"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00]"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Defines total homes available for occupancy.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Floor Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={floorCount}
                    onChange={(e) => setFloorCount(Number(e.target.value))}
                    placeholder="14"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00]"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Number of residential floors in this structure.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Description / Amenities in Tower
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 14 Floors, 6 units per floor, with 2 high-speed passenger elevators."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00] resize-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setMode('list')}
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
                      <span>{mode === 'add' ? 'Create Tower' : 'Save Changes'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer (When in List mode) */}
        {mode === 'list' && (
          <div className="p-4 bg-white/[0.02] border-t border-white/10 flex items-center justify-between text-xs text-zinc-500">
            <span>Total Registered Towers: {towers.length}</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

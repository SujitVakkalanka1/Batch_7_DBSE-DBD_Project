import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle2, Sparkles } from 'lucide-react';
import { AmenityBooking } from '../../types/portal';

import { bookingsApi } from '../../api';

interface AmenityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBook: (booking: AmenityBooking) => void;
}

export const AmenityModal: React.FC<AmenityModalProps> = ({
  isOpen,
  onClose,
  onBook,
}) => {
  const [amenityName, setAmenityName] = useState<AmenityBooking['amenityName']>('Clubhouse Banquet');
  const [date, setDate] = useState('2026-09-20');
  const [timeSlot, setTimeSlot] = useState('06:00 PM - 09:00 PM');
  const [isDone, setIsDone] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooking(true);
    setErrorMsg('');

    try {
      const newBooking = await bookingsApi.createBooking({
        amenityName,
        date,
        timeSlot,
      });
      onBook(newBooking);
      setIsDone(true);
    } catch (err: any) {
      console.error('Error reserving amenity:', err);
      const detail = err.response?.data?.detail || 'Failed to complete booking. Slot might be unavailable.';
      setErrorMsg(detail);
    } finally {
      setIsBooking(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#15161b] border border-white/15 text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[#CCFF00] font-mono text-[10px] font-bold tracking-widest uppercase block">
              Facility Booking
            </span>
            <h3 className="font-display text-xl font-bold">Reserve Society Amenity</h3>
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
        <div className="p-6">
          {isDone ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-[#CCFF00]/20 border border-[#CCFF00]/40 text-[#CCFF00] mx-auto flex items-center justify-center mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="font-display text-2xl font-bold mb-2">Slot Confirmed!</h4>
              <p className="text-sm text-zinc-400 max-w-xs mx-auto mb-6">
                Your reservation for <strong className="text-white">{amenityName}</strong> on {date} ({timeSlot}) has been approved.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-6 rounded-xl bg-[#CCFF00] text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-[#bceb00]"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Select Facility
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    'Clubhouse Banquet',
                    'Tennis Court',
                    'Swimming Pool',
                    'BBQ Gazebo',
                    'Conference Room',
                  ] as const).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAmenityName(a)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        amenityName === a
                          ? 'border-[#CCFF00] bg-[#CCFF00]/15 text-[#CCFF00]'
                          : 'border-white/10 bg-white/[0.02] text-zinc-300 hover:border-white/20'
                      }`}
                    >
                      <span className="text-xs font-bold block">{a}</span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">
                        {a === 'Clubhouse Banquet' ? 'Max 120 guests' : 'Active resident pass'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Reservation Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0d0e11] border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-[#CCFF00]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Time Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0d0e11] border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-[#CCFF00]"
                  >
                    <option value="06:00 AM - 08:00 AM">Morning (06:00 AM - 08:00 AM)</option>
                    <option value="04:00 PM - 06:00 PM">Evening (04:00 PM - 06:00 PM)</option>
                    <option value="06:00 PM - 09:00 PM">Prime (06:00 PM - 09:00 PM)</option>
                    <option value="09:00 PM - 11:30 PM">Late (09:00 PM - 11:30 PM)</option>
                  </select>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isBooking}
                className="w-full py-3.5 px-6 rounded-xl bg-[#CCFF00] text-black font-display font-extrabold text-xs uppercase tracking-[0.14em] hover:bg-[#bceb00] active:scale-[0.99] transition-all shadow-lg shadow-[#CCFF00]/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isBooking ? (
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Confirm Reservation</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

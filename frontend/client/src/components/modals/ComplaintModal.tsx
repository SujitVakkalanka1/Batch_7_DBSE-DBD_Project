import React, { useState } from 'react';
import { X, Headset, CheckCircle2, AlertTriangle, UploadCloud } from 'lucide-react';
import { ComplaintTicket } from '../../types/portal';

import { complaintsApi } from '../../api';

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newTicket: ComplaintTicket) => void;
}

export const ComplaintModal: React.FC<ComplaintModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintTicket['category']>('Plumbing');
  const [urgency, setUrgency] = useState<ComplaintTicket['urgency']>('Medium');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const createdTicket = await complaintsApi.createComplaint({
        title,
        category,
        urgency,
        description,
      });
      onSubmit(createdTicket);
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Error creating complaint:', err);
      setErrorMsg(err.response?.data?.detail || 'Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#15161b] border border-white/15 text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[#CCFF00] font-mono text-[10px] font-bold tracking-widest uppercase block">
              Helpdesk Request
            </span>
            <h3 className="font-display text-xl font-bold">Raise a Complaint / Ticket</h3>
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
          {isSuccess ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-[#CCFF00]/20 border border-[#CCFF00]/40 text-[#CCFF00] mx-auto flex items-center justify-center mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="font-display text-2xl font-bold mb-2">Complaint Logged!</h4>
              <p className="text-sm text-zinc-400 max-w-xs mx-auto mb-6">
                Your ticket has been assigned to the on-duty facility technician. Average response time is under 4 hours.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-6 rounded-xl bg-[#CCFF00] text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-[#bceb00]"
              >
                View in Requests
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Issue Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Plumbing', 'Electrical', 'Parking', 'Lift / Common Area', 'Security', 'Other'] as const).map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          category === cat
                            ? 'border-[#CCFF00] bg-[#CCFF00]/15 text-[#CCFF00]'
                            : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Brief Summary
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Geyser switch sparking in master bath"
                  className="w-full px-4 py-2.5 bg-[#0d0e11] border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-[#CCFF00]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Urgency Level
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-[#0d0e11] border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-[#CCFF00]"
                  >
                    <option value="Low">Low (Within 48h)</option>
                    <option value="Medium">Medium (Within 24h)</option>
                    <option value="High">High (Immediate)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Unit Location
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Tower B · Flat 704"
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Detailed Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Please describe the issue in detail..."
                  className="w-full px-4 py-2.5 bg-[#0d0e11] border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-[#CCFF00]"
                  required
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-[#CCFF00] text-black font-display font-extrabold text-xs uppercase tracking-[0.14em] hover:bg-[#bceb00] active:scale-[0.99] transition-all shadow-lg shadow-[#CCFF00]/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Submit Ticket to Facility Desk</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

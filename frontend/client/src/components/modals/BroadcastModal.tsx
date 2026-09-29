import React, { useState } from 'react';
import { X, Megaphone, Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import { AnnouncementItem } from '../../types/portal';

import { noticesApi } from '../../api';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBroadcast: (notice: AnnouncementItem) => void;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({
  isOpen,
  onClose,
  onBroadcast,
}) => {
  const [title, setTitle] = useState('');
  const [eyebrow, setEyebrow] = useState('BROADCAST · ALL TOWERS');
  const [body, setBody] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const createdNotice = await noticesApi.createNotice({
        title,
        body,
        eyebrow: isUrgent ? 'URGENT BROADCAST · RESIDENTS' : eyebrow,
        priority: isUrgent ? 'urgent' : 'normal',
        target_audience: eyebrow.replace('BROADCAST · ', '').replace('NOTICE · ', ''),
      });
      onBroadcast(createdNotice);
      setIsDone(true);
    } catch (err: any) {
      console.error('Error broadcasting notice:', err);
      setErrorMsg(err.response?.data?.detail || 'Failed to dispatch broadcast notice.');
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
              Management Communications
            </span>
            <h3 className="font-display text-xl font-bold">Broadcast Society Announcement</h3>
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
              <h4 className="font-display text-2xl font-bold mb-2">Broadcast Dispatched!</h4>
              <p className="text-sm text-zinc-400 max-w-xs mx-auto mb-6">
                Your announcement has been sent to all 248 resident dashboards and mobile push channels.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-6 rounded-xl bg-[#CCFF00] text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-[#bceb00]"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Announcement Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. DG Power Backup Servicing & Switchover Drill"
                  className="w-full px-4 py-2.5 bg-[#0d0e11] border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-[#CCFF00]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Target Audience
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['BROADCAST · ALL TOWERS', 'NOTICE · TOWER B ONLY', 'EMERGENCY · ALL HOMES'].map((target) => (
                    <button
                      key={target}
                      type="button"
                      onClick={() => setEyebrow(target)}
                      className={`p-2.5 rounded-xl border text-[11px] font-semibold text-center transition-all ${
                        eyebrow === target
                          ? 'border-[#CCFF00] bg-[#CCFF00]/15 text-[#CCFF00]'
                          : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20'
                      }`}
                    >
                      {target.replace('BROADCAST · ', '').replace('NOTICE · ', '')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Message Content
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  placeholder="Type the full message for resident noticeboards..."
                  className="w-full px-4 py-2.5 bg-[#0d0e11] border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-[#CCFF00]"
                  required
                />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                <input
                  type="checkbox"
                  id="urgentFlag"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 rounded text-[#CCFF00] focus:ring-[#CCFF00] accent-[#CCFF00]"
                />
                <label htmlFor="urgentFlag" className="text-xs text-zinc-300 font-semibold cursor-pointer">
                  Mark as High Priority Alert (Sends emergency push notification)
                </label>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-[#CCFF00] text-black font-display font-extrabold text-xs uppercase tracking-[0.14em] hover:bg-[#bceb00] active:scale-[0.99] transition-all shadow-lg shadow-[#CCFF00]/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={16} />
                    <span>Publish to Resident Boards</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

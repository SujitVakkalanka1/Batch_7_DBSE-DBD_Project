import React from 'react';
import { X, Calendar, User, Clock, Bell, ShieldCheck } from 'lucide-react';
import { AnnouncementItem } from '../../types/portal';

interface NoticeDetailModalProps {
  notice: AnnouncementItem | null;
  onClose: () => void;
}

export const NoticeDetailModal: React.FC<NoticeDetailModalProps> = ({
  notice,
  onClose,
}) => {
  if (!notice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#15161b] border border-white/15 text-white shadow-2xl overflow-hidden">
        {/* Top bar with decorative line */}
        <div className="h-1.5 w-full bg-[#CCFF00]" />

        {/* Header */}
        <div className="p-6 pb-4 flex items-start justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#CCFF00]/20 text-[#CCFF00] border border-[#CCFF00]/40">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
              {notice.eyebrow}
            </span>
            <span className="text-[11px] text-zinc-400 font-mono block pt-1">
              {notice.timestamp}
            </span>
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
        <div className="px-6 py-2">
          <h3 className="font-display text-xl font-bold text-white mb-4 leading-snug">
            {notice.title}
          </h3>

          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-sm text-zinc-300 leading-relaxed space-y-3">
            <p>{notice.body}</p>
            <p className="text-xs text-zinc-400 pt-2 border-t border-white/10">
              For queries regarding this notice, you can contact the Estate Office via the Helpdesk or dial extension 101 from your apartment intercom.
            </p>
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between py-4 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <User size={14} className="text-[#CCFF00]" />
              <span>{notice.author || 'Estate Management'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Verified Society Broadcast</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-6 rounded-xl bg-[#CCFF00] text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-[#bceb00]"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, QrCode, Key, Share2, Copy, CheckCircle2, Shield } from 'lucide-react';
import { GatePass } from '../../types/portal';

import { gatePassesApi } from '../../api';

interface GatePassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (pass: GatePass) => void;
}

export const GatePassModal: React.FC<GatePassModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [purpose, setPurpose] = useState<GatePass['purpose']>('Guest');
  const [validDate, setValidDate] = useState('Today (Valid for 12 hours)');
  const [generatedPass, setGeneratedPass] = useState<GatePass | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setErrorMsg('');

    try {
      const pass = await gatePassesApi.createGatePass({
        visitorName,
        visitorPhone: visitorPhone || undefined,
        purpose,
        validDate: 'Today',
      });
      setGeneratedPass(pass);
      onCreated(pass);
    } catch (err: any) {
      console.error('Error creating gate pass:', err);
      setErrorMsg(err.response?.data?.detail || 'Failed to generate gate pass.');
    } finally {
      setIsGenerating(false);
    }
  };


  const handleCopy = () => {
    if (!generatedPass) return;
    navigator.clipboard.writeText(
      `Courtyard Society Entry Pass for ${generatedPass.visitorName}\nPass Code: ${generatedPass.passCode}\nValid for Tower B - Flat 704`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#15161b] border border-white/15 text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[#CCFF00] font-mono text-[10px] font-bold tracking-widest uppercase block">
              Security Gate Access
            </span>
            <h3 className="font-display text-xl font-bold">Create Visitor Gate-Pass</h3>
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
          {generatedPass ? (
            <div className="text-center py-4">
              {/* QR Display Card */}
              <div className="p-6 rounded-3xl bg-white text-zinc-900 max-w-xs mx-auto mb-5 shadow-xl">
                <div className="flex items-center justify-between mb-4 border-b border-zinc-200 pb-2">
                  <span className="font-display font-extrabold text-xs tracking-wider uppercase text-zinc-900">
                    Maple Heights Gate Pass
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#CCFF00] text-black text-[10px] font-bold uppercase">
                    {generatedPass.purpose}
                  </span>
                </div>

                {/* Simulated QR Code Graphic */}
                <div className="w-40 h-40 mx-auto bg-zinc-950 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 my-2">
                  <QrCode size={120} className="text-[#CCFF00]" />
                </div>

                <div className="mt-3">
                  <span className="text-[11px] text-zinc-500 font-semibold block uppercase">Passcode</span>
                  <span className="font-mono text-2xl font-black tracking-widest text-zinc-950">
                    {generatedPass.passCode}
                  </span>
                </div>

                <div className="mt-2 pt-2 border-t border-zinc-100 text-[11px] text-zinc-600">
                  <span>Authorized by: </span>
                  <span className="font-bold text-zinc-900">Sujit Kumar (B-704)</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-white"
                >
                  {copied ? <CheckCircle2 size={16} className="text-[#CCFF00]" /> : <Copy size={16} />}
                  <span>{copied ? 'Copied!' : 'Copy Pass'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-6 rounded-xl bg-[#CCFF00] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#bceb00]"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Visitor Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Guest', 'Delivery', 'Cab', 'Service Provider'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPurpose(type)}
                      className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                        purpose === type
                          ? 'border-[#CCFF00] bg-[#CCFF00]/15 text-[#CCFF00]'
                          : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Visitor / Delivery Agent Name
                </label>
                <input
                  type="text"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="e.g. Zomato / Ramesh Sharma"
                  className="w-full px-4 py-2.5 bg-[#0d0e11] border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-[#CCFF00]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Visitor Contact Phone (Optional)
                </label>
                <input
                  type="text"
                  value={visitorPhone}
                  onChange={(e) => setVisitorPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full px-4 py-2.5 bg-[#0d0e11] border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-[#CCFF00]"
                />
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-2 text-xs text-zinc-400">
                <Shield size={16} className="text-[#CCFF00] shrink-0" />
                <span>Security gate guards will scan the QR code for touchless barrier lift.</span>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3.5 px-6 rounded-xl bg-[#CCFF00] text-black font-display font-extrabold text-xs uppercase tracking-[0.14em] hover:bg-[#bceb00] active:scale-[0.99] transition-all shadow-lg shadow-[#CCFF00]/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Generate Instant Pass QR</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

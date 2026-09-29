import React, { useState } from 'react';
import { X, CheckCircle2, CreditCard, Smartphone, Building, ShieldCheck, Download } from 'lucide-react';
import { PaymentRecord } from '../../types/portal';

import { paymentsApi } from '../../api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment?: PaymentRecord;
  onSuccess: (paymentId: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  payment,
  onSuccess,
}) => {
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('sujit@okhdfcbank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [transactionId, setTransactionId] = useState('TXN-994821804');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !payment) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMsg('');

    try {
      const updated = await paymentsApi.payBill(payment.id, {
        method,
        upi_id: method === 'upi' ? upiId : undefined,
      });
      if (updated.transaction_id) {
        setTransactionId(updated.transaction_id);
      }
      setIsPaid(true);
      onSuccess(payment.id);
    } catch (err: any) {
      console.error('Payment execution error:', err);
      setErrorMsg(err.response?.data?.detail || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#15161b] border border-white/15 text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[#CCFF00] font-mono text-[10px] font-bold tracking-widest uppercase block">
              Dues Clearance
            </span>
            <h3 className="font-display text-xl font-bold">Pay Society Maintenance</h3>
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
          {isPaid ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-[#CCFF00]/20 border border-[#CCFF00]/40 text-[#CCFF00] mx-auto flex items-center justify-center mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="font-display text-2xl font-bold mb-2">Payment Successful!</h4>
              <p className="text-sm text-zinc-400 max-w-xs mx-auto mb-6">
                Receipt #REC-2026-SEP-704 has been generated and sent to your registered email.
              </p>
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 max-w-sm mx-auto mb-6 text-left">
                <div className="flex justify-between text-xs py-1 text-zinc-400">
                  <span>Transaction ID</span>
                  <span className="font-mono text-white">{transactionId}</span>
                </div>
                <div className="flex justify-between text-xs py-1 text-zinc-400">
                  <span>Amount Paid</span>
                  <span className="font-bold text-[#CCFF00]">{payment.amount}</span>
                </div>
                <div className="flex justify-between text-xs py-1 text-zinc-400">
                  <span>Flat Unit</span>
                  <span className="text-white">{payment.unit || 'Tower B · Flat 704'}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-6 rounded-xl bg-[#CCFF00] text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-[#bceb00]"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handlePay} className="space-y-6">
              {/* Bill Breakdown */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-zinc-400">Total Dues for {payment.billMonth}</span>
                  <span className="font-display text-2xl font-extrabold text-[#CCFF00]">
                    {payment.amount}
                  </span>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs text-zinc-400">
                  <div className="flex justify-between">
                    <span>Base Maintenance</span>
                    <span className="text-zinc-200">{payment.breakdown.maintenance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sinking Fund Contribution</span>
                    <span className="text-zinc-200">{payment.breakdown.sinkingFund}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Water Utility Charges</span>
                    <span className="text-zinc-200">{payment.breakdown.waterCharges}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reserved Parking Bay B-21</span>
                    <span className="text-zinc-200">{payment.breakdown.parkingCharges}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Select Payment Option
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod('upi')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      method === 'upi'
                        ? 'border-[#CCFF00] bg-[#CCFF00]/10 text-white'
                        : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <Smartphone size={18} className="mx-auto mb-1 text-[#CCFF00]" />
                    <span className="text-xs font-bold block">Instant UPI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('card')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      method === 'card'
                        ? 'border-[#CCFF00] bg-[#CCFF00]/10 text-white'
                        : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <CreditCard size={18} className="mx-auto mb-1 text-sky-400" />
                    <span className="text-xs font-bold block">Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('netbanking')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      method === 'netbanking'
                        ? 'border-[#CCFF00] bg-[#CCFF00]/10 text-white'
                        : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <Building size={18} className="mx-auto mb-1 text-emerald-400" />
                    <span className="text-xs font-bold block">NetBanking</span>
                  </button>
                </div>
              </div>

              {method === 'upi' && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    UPI ID / VPA
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@okhdfcbank"
                    className="w-full px-4 py-3 bg-[#0d0e11] border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-[#CCFF00]"
                    required
                  />
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-zinc-400 pt-2">
                <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                <span>256-Bit SSL Encrypted Society Escrow Account</span>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 px-6 rounded-xl bg-[#CCFF00] text-black font-display font-extrabold text-xs uppercase tracking-[0.14em] hover:bg-[#bceb00] active:scale-[0.99] transition-all shadow-lg shadow-[#CCFF00]/20 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Pay {payment.amount} Now</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

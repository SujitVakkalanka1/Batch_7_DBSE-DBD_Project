import React, { useState } from 'react';
import {
  Shield,
  KeyRound,
  Building,
  UserCheck,
  ArrowRight,
  Sparkles,
  Lock,
  Phone,
  Mail,
  Home,
  CheckCircle2,
  FileText,
  CreditCard,
  QrCode,
  AlertTriangle,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { UserRole } from '../../types/portal';

import { authApi } from '../../api';

interface AuthGatewayProps {
  onLogin: (role: UserRole) => void;
}

export const AuthGateway: React.FC<AuthGatewayProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('resident');
  
  // Resident form states
  const [flatNumber, setFlatNumber] = useState('Tower B · 704');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [passcode, setPasscode] = useState('••••••');

  // Admin form states
  const [adminEmail, setAdminEmail] = useState('admin@mapleheights.org');
  const [adminKey, setAdminKey] = useState('••••••••••••');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (selectedRole === 'resident') {
        const res = await authApi.login({
          role: 'resident',
          flat_number: flatNumber,
          phone: phone,
          passcode: passcode,
        });
        onLogin(res.role);
      } else {
        const res = await authApi.login({
          role: 'admin',
          email: adminEmail,
          password: adminKey,
        });
        onLogin(res.role);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const detail = err.response?.data?.detail || 'Failed to authenticate. Please check your credentials.';
      setErrorMsg(detail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role: UserRole) => {
    setSelectedRole(role);
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (role === 'resident') {
        const res = await authApi.login({
          role: 'resident',
          flat_number: 'Tower B · 704',
          phone: '+91 98765 43210',
          passcode: '••••••',
        });
        onLogin(res.role);
      } else {
        const res = await authApi.login({
          role: 'admin',
          email: 'admin@mapleheights.org',
          password: '••••••••••••',
        });
        onLogin(res.role);
      }
    } catch (err: any) {
      console.error('Demo login error:', err);
      const detail = err.response?.data?.detail || 'Demo login failed. Make sure backend is running.';
      setErrorMsg(detail);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen w-full bg-[#0e0f12] flex flex-col lg:flex-row overflow-x-hidden">
      {/* LEFT PANEL: Editorial Brand / White Canvas (Full height, edge-to-edge) */}
      <div className="w-full lg:w-1/2 bg-[#fafaf9] text-zinc-900 p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Soft background ambient gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#CCFF00]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <BrandLogo size={38} textDark={true} />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-zinc-200/70 text-zinc-800 border border-zinc-300/60">
            Maple Heights · 2026
          </span>
        </div>

        {/* Hero Narrative */}
        <div className="relative z-10 my-12 sm:my-16 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#CCFF00]/25 text-zinc-900 text-xs font-bold tracking-wide uppercase mb-6 border border-[#CCFF00]/40">
            <span className="w-2 h-2 rounded-full bg-[#8fb300] animate-pulse" />
            Society operations, made lighter
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-950 leading-[1.08] mb-6">
            Home has a <span className="underline decoration-[#CCFF00] decoration-4 underline-offset-4">rhythm</span>.
          </h1>

          <p className="text-zinc-600 text-base sm:text-lg leading-relaxed mb-8">
            One clear place for the dues, maintenance requests, visitor passes, and decisions that keep your building moving smoothly.
          </p>

          {/* Feature Highlights Pills */}
          <div className="flex flex-wrap gap-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-zinc-200/80 shadow-sm text-xs font-semibold text-zinc-800">
              <CreditCard size={15} className="text-[#658200]" />
              Direct Payments
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-zinc-200/80 shadow-sm text-xs font-semibold text-zinc-800">
              <FileText size={15} className="text-[#658200]" />
              Helpdesk & Requests
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-zinc-200/80 shadow-sm text-xs font-semibold text-zinc-800">
              <QrCode size={15} className="text-[#658200]" />
              Visitor Gate-Pass
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-6 border-t border-zinc-200/80 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-emerald-700" />
            <span>Encrypted Society Data & Role-Isolated Access</span>
          </div>
          <span className="font-mono text-[11px] text-zinc-400">v2.4.0 · Production</span>
        </div>
      </div>

      {/* RIGHT PANEL: High Contrast Charcoal / Login Screen (Full height, edge-to-edge) */}
      <div className="w-full lg:w-1/2 bg-[#101114] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative">
        {/* Subtle grid pattern & glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#CCFF00]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-md mx-auto">
          {/* Header */}
          <div className="mb-8">
            <span className="text-[#CCFF00] font-mono text-[11px] font-bold tracking-[0.18em] uppercase block mb-2">
              Authentication Portal
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sign in to your portal
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              Select your doorway to access tailored building features.
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#18191f] border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => setSelectedRole('resident')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                selectedRole === 'resident'
                  ? 'bg-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/20 scale-[1.01]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Home size={16} />
              Resident
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                selectedRole === 'admin'
                  ? 'bg-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/20 scale-[1.01]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Shield size={16} />
              Admin
            </button>
          </div>

          {/* Login Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#16171c]/90 border border-white/10 backdrop-blur-xl shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              {selectedRole === 'resident' ? (
                <>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                      Flat / Apartment Unit
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <Building size={16} />
                      </div>
                      <input
                        type="text"
                        value={flatNumber}
                        onChange={(e) => setFlatNumber(e.target.value)}
                        placeholder="e.g. Tower B - Flat 704"
                        className="w-full pl-10 pr-4 py-3 bg-[#0d0e11] border border-white/15 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                      Registered Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <Phone size={16} />
                      </div>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-3 bg-[#0d0e11] border border-white/15 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                        Passcode / PIN
                      </label>
                      <button
                        type="button"
                        onClick={() => alert('Demo passcode is 123456')}
                        className="text-[11px] text-[#CCFF00] hover:underline"
                      >
                        Forgot PIN?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <Lock size={16} />
                      </div>
                      <input
                        type="password"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        placeholder="6-digit PIN"
                        className="w-full pl-10 pr-4 py-3 bg-[#0d0e11] border border-white/15 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] transition-colors"
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                      Administrator Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="admin@mapleheights.org"
                        className="w-full pl-10 pr-4 py-3 bg-[#0d0e11] border border-white/15 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                        Master Security Key
                      </label>
                      <span className="text-[10px] text-zinc-500 uppercase">Hardware 2FA Active</span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <KeyRound size={16} />
                      </div>
                      <input
                        type="password"
                        value={adminKey}
                        onChange={(e) => setAdminKey(e.target.value)}
                        placeholder="Master passkey"
                        className="w-full pl-10 pr-4 py-3 bg-[#0d0e11] border border-white/15 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] transition-colors"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5 animate-fade-in shadow-lg shadow-red-500/10">
                  <AlertTriangle size={17} className="text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-red-300 font-mono text-[11px] uppercase tracking-wider">
                      Access Blocked
                    </span>
                    <span className="text-red-200/90 text-xs leading-relaxed block mt-0.5">
                      {errorMsg}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-6 rounded-xl bg-[#CCFF00] text-black font-display font-black text-xs uppercase tracking-[0.14em] flex items-center justify-center gap-2 hover:bg-[#bceb00] active:scale-[0.99] transition-all duration-200 shadow-lg shadow-[#CCFF00]/20 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enter {selectedRole === 'resident' ? 'Resident Portal' : 'Admin Console'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Quick 1-Click Demo Launcher */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2.5">
                Instant Demo Access
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('resident')}
                  className="py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-left transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-[#CCFF00]">
                      Resident Demo
                    </span>
                    <ArrowRight size={12} className="text-zinc-500 group-hover:text-[#CCFF00]" />
                  </div>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">
                    Sujit · Tower B-704
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin')}
                  className="py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-left transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-[#CCFF00]">
                      Admin Demo
                    </span>
                    <ArrowRight size={12} className="text-zinc-500 group-hover:text-[#CCFF00]" />
                  </div>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">
                    Maple Heights Admin
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

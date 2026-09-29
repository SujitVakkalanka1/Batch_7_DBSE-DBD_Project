import React from 'react';
import {
  LayoutGrid,
  Headset,
  Wallet,
  MessageSquare,
  User,
  Megaphone,
  Users,
  ClipboardList,
  Receipt,
  Settings,
} from 'lucide-react';
import { UserRole } from '../../types/portal';

export type ResidentTab = 'home' | 'requests' | 'pay' | 'messages' | 'profile';
export type AdminTab = 'dashboard' | 'tickets' | 'finances' | 'broadcasts' | 'settings';

interface BottomNavDockProps {
  role: UserRole;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  className?: string;
}

export const BottomNavDock: React.FC<BottomNavDockProps> = ({
  role,
  activeTab,
  onSelectTab,
  className = '',
}) => {
  const residentNavItems = [
    { id: 'home', label: 'HOME', icon: LayoutGrid },
    { id: 'requests', label: 'REQUESTS', icon: Headset },
    { id: 'pay', label: 'PAY', icon: Wallet },
    { id: 'messages', label: 'MESSAGES', icon: MessageSquare },
    { id: 'profile', label: 'PROFILE', icon: User },
  ];

  const adminNavItems = [
    { id: 'dashboard', label: 'OVERVIEW', icon: LayoutGrid },
    { id: 'tickets', label: 'TICKETS', icon: ClipboardList },
    { id: 'finances', label: 'FINANCES', icon: Receipt },
    { id: 'broadcasts', label: 'BROADCAST', icon: Megaphone },
    { id: 'settings', label: 'MANAGEMENT', icon: Users },
  ];

  const items = role === 'admin' ? adminNavItems : residentNavItems;

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[94vw] sm:max-w-fit ${className}`}
    >
      <nav
        aria-label="Bottom Navigation Pill"
        className="flex items-center justify-center gap-1 sm:gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full bg-[#16161b]/92 backdrop-blur-2xl border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.06)]"
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center justify-center gap-1 py-1.5 px-3 sm:px-4 rounded-full transition-all duration-200 outline-none select-none min-w-[56px] sm:min-w-[68px] ${
                isActive
                  ? 'bg-[#CCFF00] text-black font-extrabold shadow-[0_0_16px_rgba(204,255,0,0.35)] scale-100'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.08] active:scale-95'
              }`}
              title={item.label}
            >
              <Icon
                size={18}
                strokeWidth={isActive ? 2.4 : 1.9}
                className={isActive ? 'text-black' : 'text-current'}
              />
              <span
                className={`text-[9.5px] sm:text-[10px] tracking-[0.08em] uppercase leading-none ${
                  isActive ? 'font-black text-black' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

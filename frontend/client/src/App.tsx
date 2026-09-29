import React, { useState, useEffect } from 'react';
import { AuthGateway } from './components/auth/AuthGateway';
import { ResidentDashboard } from './components/resident/ResidentDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserRole } from './types/portal';
import { authApi } from './api';

export function App() {
  const [currentRole, setCurrentRole] = useState<'guest' | UserRole>(() => {
    const token = localStorage.getItem('courtyard_token');
    const savedRole = localStorage.getItem('courtyard_user_role');
    if (token && (savedRole === 'resident' || savedRole === 'admin')) {
      return savedRole;
    }
    return 'guest';
  });

  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('courtyard_token');
      if (token) {
        try {
          const profile = await authApi.getMe();
          setCurrentRole(profile.role);
          localStorage.setItem('courtyard_user_role', profile.role);
        } catch (error) {
          console.warn('Session verification failed, resetting to guest', error);
          authApi.logout();
          setCurrentRole('guest');
        }
      } else {
        setCurrentRole('guest');
      }
      setIsVerifying(false);
    };

    verifySession();
  }, []);

  const handleLogin = (role: UserRole) => {
    setCurrentRole(role);
  };

  const handleLogout = () => {
    authApi.logout();
    setCurrentRole('guest');
  };

  if (isVerifying) {
    return (
      <div className="w-full min-h-screen bg-[#0d0e12] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#CCFF00] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-zinc-400 tracking-wider uppercase">Loading portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#0d0e12] text-white">
      {currentRole === 'guest' && <AuthGateway onLogin={handleLogin} />}
      {currentRole === 'resident' && <ResidentDashboard onLogout={handleLogout} />}
      {currentRole === 'admin' && <AdminDashboard onLogout={handleLogout} />}
    </div>
  );
}

export default App;

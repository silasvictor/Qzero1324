import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, User as UserIcon, MonitorSmartphone, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RoleBanner: React.FC = () => {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleSwitch = async (role: 'STUDENT' | 'ADMIN' | 'OPERATOR') => {
    await switchRole(role);
    if (role === 'ADMIN') {
      navigate('/admin');
    } else if (role === 'OPERATOR') {
      navigate('/operator');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="bg-gradient-to-r from-brand-dark via-[#241E47] to-brand-dark text-white text-xs px-4 py-2 border-b border-purple-900/40 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-turquoise opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-turquoise"></span>
          </span>
          <span className="font-semibold text-brand-turquoise tracking-wide uppercase text-[11px] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> QueueZero Live System Demo
          </span>
          <span className="text-gray-300 hidden md:inline">|</span>
          <span className="text-gray-300 hidden md:inline">
            Active Identity: <strong className="text-white font-medium">{user?.name || 'Loading...'}</strong> ({user?.role})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-300 text-[11px] hidden sm:inline">Role Switcher:</span>
          
          <button
            onClick={() => handleSwitch('STUDENT')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all ${
              user?.role === 'STUDENT'
                ? 'bg-brand-purple text-white shadow-sm ring-1 ring-white/30'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            <UserIcon className="w-3 h-3" /> Student
          </button>

          <button
            onClick={() => handleSwitch('ADMIN')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all ${
              user?.role === 'ADMIN'
                ? 'bg-brand-purple text-white shadow-sm ring-1 ring-white/30'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3 h-3" /> Administrator
          </button>

          <button
            onClick={() => handleSwitch('OPERATOR')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all ${
              user?.role === 'OPERATOR'
                ? 'bg-brand-purple text-white shadow-sm ring-1 ring-white/30'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            <MonitorSmartphone className="w-3 h-3" /> Kiosk Operator
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Printer,
  Package,
  MapPin,
  Calendar,
  Wallet,
  Bell,
  User,
  Settings,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { user } = useAuth();

  const mainNavLinks = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Upload & Print', path: '/print-studio', icon: Printer },
    { name: 'My Orders', path: '/orders', icon: Package },
    { name: 'Kiosk Locator', path: '/kiosks', icon: MapPin },
    { name: 'Pickup Calendar', path: '/calendar', icon: Calendar },
    { name: 'Wallet & Payments', path: '/wallet', icon: Wallet },
    { name: 'Notifications', path: '/notifications', icon: Bell },
  ];

  const bottomNavLinks = [
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Help & Support', path: '/support', icon: HelpCircle },
  ];

  const adminNavLinks = [
    { name: 'Admin Fleet HUD', path: '/admin', icon: ShieldCheck },
    { name: 'Operator Verify', path: '/operator', icon: Cpu },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-brand-cardBorder z-40 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } pt-12 lg:pt-14`}
      >
        {/* Logo Section */}
        <div>
          <div className="px-6 py-4 flex items-center gap-3 border-b border-brand-lavender/50">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-deep to-brand-purple flex items-center justify-center text-white shadow-soft">
              <span className="font-extrabold text-xl tracking-tight">Q</span>
              <span className="text-[10px] text-brand-turquoise font-black -ml-0.5">0</span>
            </div>
            <div>
              <div className="font-bold text-lg text-brand-dark tracking-tight leading-none flex items-center gap-1">
                Queue<span className="text-brand-purple">Zero</span>
              </div>
              <span className="text-[11px] font-medium text-brand-mutedText">Campus Print Fleet</span>
            </div>
          </div>

          {/* Main Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
              Main Menu
            </div>
            {mainNavLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-purple text-white shadow-soft font-semibold'
                        : 'text-brand-mutedText hover:bg-brand-lavender/60 hover:text-brand-purple'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}

            {/* Admin / Operator Management section if role permits or for demo */}
            <div className="pt-4 px-3 pb-2 text-[11px] font-semibold tracking-wider text-gray-400 uppercase flex items-center justify-between">
              <span>Fleet Operations</span>
              <span className="text-[10px] bg-purple-100 text-brand-purple px-1.5 py-0.5 rounded font-bold">STAFF</span>
            </div>
            {adminNavLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-purple text-white shadow-soft font-semibold'
                        : 'text-brand-mutedText hover:bg-brand-lavender/60 hover:text-brand-purple'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Navigation & Wallet Pill */}
        <div className="p-4 border-t border-brand-cardBorder space-y-3">
          {/* Quick Wallet Micro-card */}
          <div className="bg-gradient-to-br from-brand-lavender to-purple-50/50 p-3 rounded-2xl border border-purple-100 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-brand-purple tracking-wider">Campus Wallet</div>
              <div className="text-sm font-bold text-brand-dark">₹{user?.balance ? user.balance.toFixed(2) : '0.00'}</div>
            </div>
            <NavLink
              to="/wallet"
              className="text-xs bg-white text-brand-purple hover:bg-brand-purple hover:text-white px-2.5 py-1 rounded-lg font-semibold shadow-sm transition-colors"
            >
              Top Up
            </NavLink>
          </div>

          <div className="space-y-0.5">
            {bottomNavLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-brand-purple text-white font-semibold'
                        : 'text-gray-500 hover:bg-brand-lavender/50 hover:text-brand-purple'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
};

import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu, X, ChevronDown, CheckCircle, ExternalLink, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationsApi } from '../../services/api';
import { NotificationItem } from '../../types';
import { useNavigate, Link } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000); // Polling every 10s for live feel
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    const res = await notificationsApi.getAll();
    if (res.success && res.data) {
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    await notificationsApi.markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await notificationsApi.markAllAsRead();
    loadNotifications();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/orders?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-8 lg:top-8 z-30 bg-white/80 backdrop-blur-md border-b border-brand-cardBorder px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-gray-500 hover:bg-brand-lavender hover:text-brand-purple lg:hidden"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracking code (e.g. 8XUI-Z123), kiosks, files..."
              className="w-full pl-10 pr-4 py-2 bg-brand-bg/80 border border-brand-cardBorder rounded-xl text-xs md:text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all placeholder:text-gray-400"
            />
          </form>
        </div>

        {/* Right: Notification Bell & Profile Avatar */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                setShowProfileDropdown(false);
              }}
              className="p-2.5 rounded-xl border border-brand-cardBorder hover:bg-brand-lavender text-gray-600 hover:text-brand-purple relative transition-all"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-purple text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover Dropdown */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-card border border-brand-cardBorder p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-brand-lavender">
                  <div className="font-semibold text-sm text-brand-dark">Notifications</div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[11px] text-brand-purple font-medium hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 py-1">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-400">No notifications yet</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs transition-colors rounded-xl flex items-start gap-2.5 ${
                          !n.isRead ? 'bg-purple-50/60 font-medium' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full bg-brand-purple mt-1.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-brand-dark font-semibold text-[13px]">{n.title}</div>
                          <div className="text-gray-600 text-[11px] mt-0.5">{n.message}</div>
                          {n.link && (
                            <Link
                              to={n.link}
                              onClick={() => {
                                handleMarkAsRead(n.id);
                                setShowNotifDropdown(false);
                              }}
                              className="text-brand-purple font-medium inline-flex items-center gap-1 mt-1 text-[11px] hover:underline"
                            >
                              View details <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 border-t border-brand-lavender text-center">
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotifDropdown(false)}
                    className="text-xs text-brand-purple font-semibold hover:underline"
                  >
                    View All Notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileDropdown(!showProfileDropdown);
                setShowNotifDropdown(false);
              }}
              className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl border border-brand-cardBorder hover:bg-brand-lavender/50 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-purple to-brand-lightPurple text-white font-bold text-xs flex items-center justify-center shadow-sm overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || 'U'
                )}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-brand-dark leading-tight">{user?.name || 'Student'}</div>
                <div className="text-[10px] text-brand-purple font-medium">{user?.role || 'STUDENT'}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
            </button>

            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-card border border-brand-cardBorder p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-3 border-b border-gray-100">
                  <div className="font-semibold text-sm text-brand-dark">{user?.name}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                  {user?.rollNumber && (
                    <div className="text-[11px] font-mono text-brand-purple mt-1 bg-purple-50 px-2 py-0.5 rounded inline-block">
                      Roll: {user.rollNumber}
                    </div>
                  )}
                </div>

                <div className="py-1 text-xs">
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileDropdown(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:bg-brand-lavender hover:text-brand-purple transition-colors"
                  >
                    <UserIcon className="w-4 h-4" /> My Profile & University ID
                  </Link>
                  <Link
                    to="/admin"
                    onClick={() => setShowProfileDropdown(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:bg-brand-lavender hover:text-brand-purple transition-colors"
                  >
                    <Shield className="w-4 h-4" /> Admin Console
                  </Link>
                </div>

                <div className="p-1 border-t border-gray-100">
                  <button
                    onClick={() => {
                      logout();
                      setShowProfileDropdown(false);
                      navigate('/');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

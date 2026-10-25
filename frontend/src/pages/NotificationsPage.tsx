import React, { useState, useEffect } from 'react';
import { notificationsApi } from '../services/api';
import { NotificationItem } from '../types';
import { Bell, CheckCheck, ExternalLink, Sparkles, Clock, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    const res = await notificationsApi.getAll();
    if (res.success && res.data?.notifications) {
      setNotifications(res.data.notifications);
    }
    setLoading(false);
  };

  const handleMarkAsRead = async (id: string) => {
    await notificationsApi.markAsRead(id);
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllAsRead();
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const filtered = filter === 'UNREAD' ? notifications.filter((n) => !n.isRead) : notifications;

  const getIcon = (type: string) => {
    switch (type) {
      case 'READY_FOR_PICKUP':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'KIOSK_ALERT':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <Bell className="w-5 h-5 text-brand-purple" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-brand-dark tracking-tight">Notifications Center</h2>
          <p className="text-xs text-brand-mutedText mt-0.5">
            Real-time telemetry alerts, payment confirmations, and hardware status updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter(filter === 'ALL' ? 'UNREAD' : 'ALL')}
            className="px-3.5 py-2 rounded-xl border border-brand-cardBorder bg-white text-xs font-semibold hover:bg-brand-lavender text-brand-dark transition-all"
          >
            {filter === 'ALL' ? 'Show Unread Only' : 'Show All'}
          </button>

          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl bg-brand-purple hover:bg-brand-deep text-white text-xs font-bold shadow-soft transition-all flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-brand-cardBorder shadow-soft space-y-3">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-400">
            <Bell className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            No notifications in this view.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl transition-all flex items-start gap-4 ${
                  !item.isRead ? 'bg-purple-50/60 font-medium' : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-purple-100 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-brand-dark">{item.title}</h4>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.message}</p>

                  <div className="flex items-center gap-3 mt-2">
                    {item.link && (
                      <Link
                        to={item.link}
                        onClick={() => handleMarkAsRead(item.id)}
                        className="text-xs font-bold text-brand-purple hover:underline inline-flex items-center gap-1"
                      >
                        View Order Details <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    {!item.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(item.id)}
                        className="text-[11px] text-gray-400 hover:text-brand-purple font-medium"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

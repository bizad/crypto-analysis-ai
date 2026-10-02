import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Crown,
  Check,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Language, Theme } from '../types';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'VIP';
  read: boolean;
  createdAt: number;
  link?: string;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  authToken?: string;
  lang: Language;
  theme: Theme;
  onOpenTickets?: () => void;
  onOpenVip?: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  authToken,
  lang,
  theme,
  onOpenTickets,
  onOpenVip,
}) => {
  const isDark = theme === 'dark';
  const isRtl = lang === 'fa';

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    const token = authToken || localStorage.getItem('crypto_auth_token');
    if (!token) {
      // Fallback notifications if user is not signed in
      setNotifications([
        {
          id: 'welcome_public',
          userId: 'guest',
          title: isRtl ? 'به نسخه ارتقایافته دیدبان خوش آمدید' : 'Welcome to DIDBAN Crypto',
          message: isRtl
            ? 'سیستم امنیت ضد IDOR، رمزنگاری Scrypt و اتصال مستقیم به تیکر بایننس فعال است.'
            : 'Anti-IDOR security, Scrypt hashing, and live Binance ticker are active.',
          type: 'INFO',
          read: false,
          createdAt: Date.now() - 3600000,
        },
      ]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      }
    } catch (err) {
      console.warn('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    const token = authToken || localStorage.getItem('crypto_auth_token');
    if (!token) return;

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    try {
      await fetch(`/api/user/notifications/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
  };

  const handleMarkAllRead = async () => {
    const token = authToken || localStorage.getItem('crypto_auth_token');
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    if (token) {
      for (const n of notifications.filter((x) => !x.read)) {
        try {
          await fetch(`/api/user/notifications/${n.id}/read`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch {}
      }
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'VIP':
        return <Crown className="w-4 h-4 text-amber-400" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-700/80 text-slate-100 shadow-cyan-950/20'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/80'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">
                  {isRtl ? 'اعلان‌ها و رویدادهای زنده' : 'Notifications & Live Events'}
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                    {unreadCount} {isRtl ? 'جدید' : 'New'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isRtl ? 'گزارش تایید واریزی‌ها، پاسخ تیکت‌ها و وضعیت اشتراک' : 'Updates on deposits, tickets & VIP status'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium px-2 py-1 rounded-lg hover:bg-cyan-500/10 transition-colors cursor-pointer"
              >
                {isRtl ? 'خواندن همه' : 'Mark all read'}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-4 sm:p-5 space-y-2.5 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span>{isRtl ? 'در حال بارگذاری اعلان‌ها...' : 'Loading notifications...'}</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-10 text-center text-slate-500 space-y-2">
              <Bell className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs">{isRtl ? 'هیچ اعلانی در حال حاضر وجود ندارد.' : 'No notifications at this time.'}</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => !item.read && handleMarkAsRead(item.id)}
                className={`p-3.5 rounded-2xl border transition-all text-right cursor-pointer flex gap-3 ${
                  item.read
                    ? isDark
                      ? 'bg-slate-950/40 border-slate-800/80 opacity-75'
                      : 'bg-slate-50 border-slate-200 opacity-75'
                    : isDark
                    ? 'bg-cyan-950/20 border-cyan-500/30 shadow-sm'
                    : 'bg-cyan-50/50 border-cyan-200 shadow-sm'
                }`}
              >
                <div className="pt-0.5 shrink-0">{getTypeIcon(item.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-200 truncate">{item.title}</h4>
                    <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                      {new Date(item.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.message}</p>

                  {item.link === '#tickets' && onOpenTickets && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                        onOpenTickets();
                      }}
                      className="mt-2 text-[10px] font-bold text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isRtl ? 'مشاهده تیکت در پروفایل' : 'View Ticket in Profile'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px]">
            {isRtl ? 'اعلان‌های مهم امنیتی به صورت خودکار ثبت می‌شوند' : 'Security alerts are recorded automatically'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            {isRtl ? 'بستن' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

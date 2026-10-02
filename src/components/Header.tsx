import React from 'react';
import {
  Moon,
  Sun,
  Globe,
  LineChart,
  Mail,
  User,
  Crown,
  Gift,
  Shield,
  Monitor,
  Bell,
  Activity,
} from 'lucide-react';
import { Language, Theme, ThemeMode, UserAccount } from '../types';
import { translations } from '../utils/translations';

interface HeaderProps {
  lang: Language;
  theme: Theme;
  themeMode?: ThemeMode;
  onToggleLang: () => void;
  onToggleTheme: () => void;
  onToggleSystemSync?: () => void;
  onOpenContact: () => void;
  onOpenVip: () => void;
  isVipActive: boolean;
  remainingFreeToday: number;
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenInvite?: () => void;
  onOpenAdmin: () => void;
  onOpenNotifications?: () => void;
  onOpenHealthModal?: () => void;
  unreadNotificationsCount?: number;
  isLiveStreaming?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  theme,
  themeMode = 'system',
  onToggleLang,
  onToggleTheme,
  onToggleSystemSync,
  onOpenContact,
  onOpenVip,
  isVipActive,
  remainingFreeToday,
  currentUser,
  onOpenAuth,
  onOpenProfile,
  onOpenAdmin,
  onOpenNotifications,
  onOpenHealthModal,
  unreadNotificationsCount = 0,
  isLiveStreaming = true,
}) => {
  const t = translations[lang];
  const isDark = theme === 'dark';

  const isAdmin =
    currentUser?.email === 'hamed.farri@gmail.com' ||
    currentUser?.id === 'user_admin_hamed' ||
    currentUser?.name?.includes('حامد فرّی');

  return (
    <header
      className={`border-b sticky top-0 z-40 backdrop-blur-md transition-colors ${
        isDark
          ? 'bg-[#060b18]/95 border-cyan-500/20 text-slate-100 shadow-lg shadow-cyan-950/20'
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-3">
        {/* Brand & Creator Bar (Right side in RTL) */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Official Didban Circular Glowing Eye Logo */}
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full p-0.5 bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-full bg-[#070e20] p-1 flex items-center justify-center overflow-hidden">
              <img
                src="/didban-logo.png"
                alt="دیدبان | Didban"
                className="w-full h-full object-contain rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const fallback = parent.querySelector('.logo-fallback') as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }
                }}
              />
              <div className="logo-fallback hidden w-full h-full bg-[#070e20] rounded-full items-center justify-center">
                <LineChart className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
          </div>

          <div className="min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg md:text-xl font-black tracking-tight text-white drop-shadow-sm truncate">
                {lang === 'fa' ? 'دیدبان تحلیل تکنیکال و فاندامنتال کریپتو' : 'Didban Crypto Technical & Fundamental'}
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-cyan-200/70 truncate hidden sm:block font-medium">
              {lang === 'fa'
                ? 'پلتفرم تحلیل جامع ارزهای دیجیتال؛ بررسی اخبار و شاخص‌های بنیادی با هوش مصنوعی'
                : 'Comprehensive cryptocurrency technical analysis & fundamental AI insights'}
            </p>
          </div>
        </div>

        {/* Action Controls (Left side in RTL) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* 23. Live API & WebSocket Health Indicator */}
          <button
            onClick={onOpenHealthModal}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-xs ${
              isDark
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
            title={lang === 'fa' ? 'وضعیت پایش زنده و سلامت APIها' : 'API & Feed Health Monitor'}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="text-[11px] font-mono">
              {isLiveStreaming ? (lang === 'fa' ? 'استریم زنده' : 'Live Stream') : (lang === 'fa' ? 'API آنلاین' : 'API Online')}
            </span>
          </button>

          {/* 20. In-App Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className={`relative p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
              isDark
                ? 'border-cyan-500/30 bg-[#0c162e] hover:bg-[#132147] text-cyan-200'
                : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title={lang === 'fa' ? 'اعلان‌ها و رویدادهای سیستم' : 'Notifications'}
          >
            <Bell className="w-4 h-4 text-cyan-400" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-black flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* User Account / Profile / Sign-in */}
          {currentUser ? (
            <button
              onClick={onOpenProfile}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm ${
                currentUser.isVip
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-amber-500/10'
                  : isDark
                  ? 'bg-[#0c162e] hover:bg-[#121f3f] border-cyan-500/30 text-cyan-200'
                  : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
              }`}
              title={lang === 'fa' ? 'مشاهده پروفایل و اعتبارات' : 'Profile & Credits'}
            >
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                {currentUser.name.charAt(0) || 'U'}
              </div>
              <span className="max-w-[80px] sm:max-w-[110px] truncate hidden xs:inline">
                {currentUser.name}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm ${
                isDark
                  ? 'bg-[#0c162e] hover:bg-[#132147] border-cyan-500/30 text-slate-100 hover:border-cyan-400/50'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">{lang === 'fa' ? 'ورود / ثبت‌نام' : 'Sign In'}</span>
            </button>
          )}

          {/* Verification / Security Shield Badge Button */}
          <button
            onClick={onOpenAdmin}
            className="p-2 sm:p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 transition-all cursor-pointer shadow-md shadow-purple-950/30 shrink-0 hover:scale-105 active:scale-95"
            title={lang === 'fa' ? 'امنیت و اعتبارسنجی شبکه (ادمین)' : 'Security & Verification'}
          >
            <Shield className="w-4 h-4 text-purple-400" />
          </button>

          {/* VIP Account Button with Golden Glow Border */}
          <button
            onClick={onOpenVip}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-lg shrink-0 hover:scale-102 active:scale-98 ${
              isVipActive
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-amber-300 shadow-amber-500/25'
                : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-400/80 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
            }`}
            title={lang === 'fa' ? 'اشتراک VIP و دسترسی نامحدود' : 'VIP Subscription'}
          >
            <Crown className={`w-4 h-4 shrink-0 ${isVipActive ? 'text-slate-950' : 'text-amber-400'}`} />
            <span>{lang === 'fa' ? 'اشتراک VIP' : 'VIP Plan'}</span>
          </button>

          {/* Theme Switcher Sun/Moon Button */}
          <button
            onClick={onToggleTheme}
            className={`p-2 sm:p-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 hover:scale-105 active:scale-95 ${
              isDark
                ? 'bg-[#0c162e] hover:bg-[#132147] border-cyan-500/30 text-amber-400 shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
            }`}
            title={theme === 'dark' ? t.lightMode : t.darkMode}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Language Switcher Button (English / فارسی) */}
          <button
            onClick={onToggleLang}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 hover:scale-102 active:scale-98 ${
              isDark
                ? 'bg-[#0c162e] hover:bg-[#132147] border-cyan-500/30 text-cyan-200'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
            }`}
            title={lang === 'fa' ? 'تغییر به زبان انگلیسی' : 'تغییر به فارسی'}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'fa' ? 'English' : 'فارسی'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};


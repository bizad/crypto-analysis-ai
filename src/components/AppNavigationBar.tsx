import React, { useState } from 'react';
import {
  Search,
  LineChart,
  Newspaper,
  Activity,
  Crown,
  Sparkles,
  HelpCircle,
  ShieldAlert,
  Headphones,
} from 'lucide-react';
import { AppNavigationSection, Language, Theme, CryptoCoin } from '../types';

interface AppNavigationBarProps {
  activeSection: AppNavigationSection;
  onSelectSection: (section: AppNavigationSection) => void;
  onOpenDisclaimer?: () => void;
  selectedCoin: CryptoCoin;
  lang: Language;
  theme: Theme;
  isVipActive: boolean;
}

export const AppNavigationBar: React.FC<AppNavigationBarProps> = ({
  activeSection,
  onSelectSection,
  onOpenDisclaimer,
  selectedCoin,
  lang,
  theme,
  isVipActive,
}) => {
  const isDark = theme === 'dark';
  const isRtl = lang === 'fa';
  const [touchActiveId, setTouchActiveId] = useState<AppNavigationSection | null>(null);

  // Reordered: Search & Watchdog is now FIRST (#1) per user request
  const navItems: {
    id: AppNavigationSection;
    labelFa: string;
    labelEn: string;
    descriptionFa: string;
    descriptionEn: string;
    icon: React.ComponentType<{ className?: string }>;
    badgeFa?: string;
    badgeEn?: string;
    badgeColor?: string;
    iconColor: string;
  }[] = [
    {
      id: 'SEARCH',
      labelFa: 'جستجو و دیده‌بان ارزها',
      labelEn: 'Watchdog & Coin Explorer',
      descriptionFa: 'پایش قیمت‌های لحظه‌ای و جستجوی ۲۰۰+ رمزارز',
      descriptionEn: 'Real-time market radar & token search',
      icon: Search,
      badgeFa: 'صفحه اصلی',
      badgeEn: 'HOME',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      iconColor: 'text-blue-400',
    },
    {
      id: 'TECHNICAL',
      labelFa: 'تحلیل تکنیکال و چارت‌ها',
      labelEn: 'Technical Analysis & Charts',
      descriptionFa: 'چارت پیشرفته دلاری و تومانی به همراه هوش مصنوعی',
      descriptionEn: 'Dual USD/Toman charts with AI setups',
      icon: LineChart,
      iconColor: 'text-purple-400',
    },
    {
      id: 'FUNDAMENTAL',
      labelFa: 'تحلیل فاندامنتال و اخبار',
      labelEn: 'Fundamental & News',
      descriptionFa: 'بررسی پروژه‌ها، رویدادها و شاخص‌های فاندامنتال',
      descriptionEn: 'On-chain metrics, project health & news',
      icon: Newspaper,
      iconColor: 'text-cyan-400',
    },
    {
      id: 'HEATMAP',
      labelFa: 'نقشه حرارتی بازار',
      labelEn: 'Market Heatmap (D3)',
      descriptionFa: 'نقشه تعاملی جریان نقدینگی و ارزش بازار',
      descriptionEn: 'Interactive D3 market volume & tree map',
      icon: Activity,
      badgeFa: 'D3 زنده',
      badgeEn: 'Live D3',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      iconColor: 'text-amber-400',
    },
    {
      id: 'VIP',
      labelFa: 'اشتراک VIP و خدمات',
      labelEn: 'VIP Subscription & Plans',
      descriptionFa: 'دسترسی نامحدود به سیگنال‌ها و تحلیل‌های عمیق',
      descriptionEn: 'Unlimited AI analysis & premium signals',
      icon: Crown,
      badgeFa: isVipActive ? 'فعال' : 'ویژه',
      badgeEn: isVipActive ? 'ACTIVE' : 'PRO',
      badgeColor: isVipActive
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        : 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      iconColor: 'text-emerald-400',
    },
    {
      id: 'GUIDE',
      labelFa: 'راهنمای سامانه',
      labelEn: 'User Guide',
      descriptionFa: 'آموزش گام‌به‌گام کار با ابزارها و تحلیل‌ها',
      descriptionEn: 'Step-by-step app manual & tutorial',
      icon: HelpCircle,
      badgeFa: 'آموزش',
      badgeEn: 'HELP',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      iconColor: 'text-sky-400',
    },
    {
      id: 'DISCLAIMER',
      labelFa: 'سلب مسئولیت قانونی و مدیریت ریسک',
      labelEn: 'Legal Disclaimer & Risk Management',
      descriptionFa: 'قوانین، حدود اختیارات تحلیلی و منشور جامع مدیریت ریسک',
      descriptionEn: 'Platform terms, risk management charter & safety protocols',
      icon: ShieldAlert,
      badgeFa: 'حقوقی',
      badgeEn: 'TERMS',
      badgeColor: 'bg-amber-500/25 text-amber-300 border-amber-500/40',
      iconColor: 'text-amber-400',
    },
    {
      id: 'CONTACT',
      labelFa: 'تماس با ما',
      labelEn: 'Contact Us',
      descriptionFa: 'ارتباط مستقیم با تیم توسعه و پشتیبانی',
      descriptionEn: 'Direct support & developer channels',
      icon: Headphones,
      badgeFa: '۲۴/۷',
      badgeEn: 'SUPPORT',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      iconColor: 'text-rose-400',
    },
  ];

  return (
    <aside
      id="app-side-navigation"
      aria-label={isRtl ? 'ناوبری عمودی برنامه' : 'App Vertical Navigation'}
      className={`fixed top-1/2 -translate-y-1/2 z-40 transition-all duration-300 select-none ${
        isRtl ? 'right-1.5 sm:right-3.5' : 'left-1.5 sm:left-3.5'
      }`}
    >
      <div
        className={`p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl border shadow-2xl flex flex-col items-center gap-1.5 sm:gap-2.5 backdrop-blur-xl transition-all max-h-[92vh] overflow-y-auto no-scrollbar ${
          isDark
            ? 'bg-[#091124]/95 border-cyan-500/25 shadow-[0_0_30px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/10'
            : 'bg-white/95 border-slate-200/90 shadow-slate-400/30 ring-1 ring-black/5'
        }`}
      >
        {/* Navigation Item Buttons */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const isTouchActive = touchActiveId === item.id;
          const isDisclaimer = item.id === 'DISCLAIMER';

          return (
            <div key={item.id} className="relative group">
              <button
                id={`nav-btn-${item.id.toLowerCase()}`}
                onClick={() => {
                  if (isDisclaimer && onOpenDisclaimer) {
                    onOpenDisclaimer();
                  }
                  onSelectSection(item.id);
                  setTouchActiveId(null);
                }}
                onTouchStart={() => setTouchActiveId((prev) => (prev === item.id ? null : item.id))}
                aria-label={isRtl ? item.labelFa : item.labelEn}
                title={isRtl ? item.labelFa : item.labelEn}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer relative focus:outline-none ${
                  isDisclaimer
                    ? isDark
                      ? 'bg-amber-600 hover:bg-amber-500 text-white border border-amber-400/50 shadow-lg shadow-amber-600/30 ring-2 ring-amber-500/30 hover:scale-110 active:scale-95'
                      : 'bg-amber-500 hover:bg-amber-600 text-white border border-amber-300 shadow-lg shadow-amber-500/30 ring-2 ring-amber-200 hover:scale-110 active:scale-95'
                    : isActive
                    ? 'bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-600/40 ring-1 ring-cyan-300/50 scale-105'
                    : isDark
                    ? 'bg-[#0f1b38]/70 hover:bg-cyan-500/15 text-cyan-300/80 hover:text-cyan-100 border border-cyan-500/15 hover:border-cyan-400/40 hover:scale-105'
                    : 'bg-slate-100/90 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 hover:scale-105'
                }`}
              >
                <Icon
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 ${
                    isDisclaimer
                      ? 'text-white scale-110'
                      : isActive
                      ? 'text-white scale-110'
                      : item.iconColor
                  }`}
                />

                {/* Tiny Badge Dot if item has a badge */}
                {(item.badgeFa || item.badgeEn) && (
                  <span
                    className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ${
                      isDark ? 'ring-slate-900' : 'ring-white'
                    } ${
                      item.id === 'VIP'
                        ? isVipActive
                          ? 'bg-emerald-400 animate-pulse'
                          : 'bg-amber-400'
                        : item.id === 'SEARCH'
                        ? 'bg-blue-400'
                        : 'bg-amber-400'
                    }`}
                  />
                )}

                {/* Active Pill Strip indicator */}
                {isActive && (
                  <span
                    className={`absolute top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-white shadow-sm ${
                      isRtl ? '-right-1' : '-left-1'
                    }`}
                  />
                )}
              </button>

              {/* Flyout Label / Tooltip (Appears on Hover or Finger Touch) */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 z-50 pointer-events-none transition-all duration-200 ${
                  isRtl
                    ? 'right-full mr-3.5 group-hover:pointer-events-auto group-focus-within:pointer-events-auto'
                    : 'left-full ml-3.5 group-hover:pointer-events-auto group-focus-within:pointer-events-auto'
                } ${
                  isTouchActive
                    ? 'opacity-100 translate-x-0 pointer-events-auto visible'
                    : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 ' +
                      (isRtl ? 'translate-x-2' : '-translate-x-2')
                }`}
              >
                <div
                  className={`relative px-3.5 py-2.5 rounded-xl shadow-2xl border backdrop-blur-xl whitespace-nowrap min-w-[170px] ${
                    isDark
                      ? 'bg-slate-900/95 border-slate-700/80 text-white shadow-black/80'
                      : 'bg-white/95 border-slate-300 text-slate-900 shadow-slate-500/25'
                  }`}
                >
                  {/* Arrow Indicator pointing towards the icon button */}
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border ${
                      isDark ? 'bg-slate-900 border-slate-700/80' : 'bg-white border-slate-300'
                    } ${
                      isRtl
                        ? '-right-1.5 border-l-0 border-b-0'
                        : '-left-1.5 border-r-0 border-t-0'
                    }`}
                  />

                  {/* Header: Label & Optional Badge */}
                  <div className="flex items-center justify-between gap-2.5">
                    <span className="font-bold text-xs sm:text-sm tracking-tight flex items-center gap-1.5">
                      {isActive && <Sparkles className="w-3.5 h-3.5 text-blue-400" />}
                      <span>{isRtl ? item.labelFa : item.labelEn}</span>
                    </span>

                    {(item.badgeFa || item.badgeEn) && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold border ${
                          item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {isRtl ? item.badgeFa : item.badgeEn}
                      </span>
                    )}
                  </div>

                  {/* Sub-description */}
                  <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1 font-normal max-w-[210px] truncate">
                    {isRtl ? item.descriptionFa : item.descriptionEn}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Divider */}
        <div className={`w-6 h-[1px] my-0.5 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

        {/* Active Coin Miniature Indicator */}
        <div className="relative group">
          <button
            onClick={() => onSelectSection('TECHNICAL')}
            aria-label={isRtl ? `ارز انتخابی: ${selectedCoin.symbol}` : `Selected: ${selectedCoin.symbol}`}
            title={isRtl ? `ارز انتخابی: ${selectedCoin.name}` : `Selected: ${selectedCoin.name}`}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center p-1 transition-transform hover:scale-105 cursor-pointer border ${
              isDark
                ? 'bg-slate-950/80 border-slate-800 hover:border-purple-500/50'
                : 'bg-slate-100 border-slate-200 hover:border-purple-400'
            }`}
          >
            {selectedCoin.thumb ? (
              <img
                src={selectedCoin.thumb}
                alt={selectedCoin.symbol}
                className="w-5 h-5 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-[11px] font-mono font-bold text-amber-400">
                {selectedCoin.symbol.slice(0, 3)}
              </span>
            )}
          </button>

          {/* Tooltip for Selected Coin */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${
              isRtl ? 'right-full mr-3.5' : 'left-full ml-3.5'
            }`}
          >
            <div
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold shadow-lg backdrop-blur-md whitespace-nowrap ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-200'
                  : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <span className="text-slate-400 font-sans">{isRtl ? 'ارز انتخابی: ' : 'Active: '}</span>
              <span className="text-amber-400">{selectedCoin.symbol}</span>
              <span className="text-slate-400 text-[10px] ml-1">
                (${selectedCoin.price < 1 ? selectedCoin.price.toFixed(4) : selectedCoin.price.toLocaleString()})
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

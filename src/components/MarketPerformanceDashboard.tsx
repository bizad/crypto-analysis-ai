import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  ShieldCheck,
  LineChart,
  Layers,
  Sparkles,
  Zap,
  Activity,
  Award,
  ChevronRight,
} from 'lucide-react';
import { CryptoCoin, Language, Theme } from '../types';
import { formatPersianDigits } from '../utils/numberFormat';
import { COIN_AVATARS } from './WatchdogExplorer';

interface MarketPerformanceDashboardProps {
  coins: CryptoCoin[];
  selectedCoinId: string;
  onSelectCoin: (coinId: string) => void;
  onNavigateToSection: (section: 'TECHNICAL' | 'FUNDAMENTAL') => void;
  usdtRate: number;
  lang: Language;
  theme: Theme;
}

export const MarketPerformanceDashboard: React.FC<MarketPerformanceDashboardProps> = ({
  coins,
  selectedCoinId,
  onSelectCoin,
  onNavigateToSection,
  usdtRate,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';
  const isRtl = lang === 'fa';

  // Sort and extract top 5 gainers (highest positive change24h)
  const topGainers = useMemo(() => {
    return [...coins]
      .sort((a, b) => b.change24h - a.change24h)
      .slice(0, 5);
  }, [coins]);

  // Sort and extract top 5 losers (lowest/most negative change24h)
  const topLosers = useMemo(() => {
    return [...coins]
      .sort((a, b) => a.change24h - b.change24h)
      .slice(0, 5);
  }, [coins]);

  // Market Breadth Statistics
  const stats = useMemo(() => {
    if (!coins || coins.length === 0) {
      return { avgChange: 0, positiveCount: 0, negativeCount: 0, bestGainerChange: 0, worstLoserChange: 0 };
    }
    let total = 0;
    let pos = 0;
    let neg = 0;
    coins.forEach((c) => {
      total += c.change24h;
      if (c.change24h >= 0) pos++;
      else neg++;
    });
    const avg = total / coins.length;
    return {
      avgChange: avg,
      positiveCount: pos,
      negativeCount: neg,
      bestGainerChange: topGainers[0]?.change24h || 0,
      worstLoserChange: topLosers[0]?.change24h || 0,
    };
  }, [coins, topGainers, topLosers]);

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString();
    if (price >= 1) return price.toFixed(2);
    if (price >= 0.001) return price.toFixed(4);
    return price.toFixed(6);
  };

  const formatToman = (usdPrice: number) => {
    const toman = Math.round(usdPrice * usdtRate);
    if (isRtl) {
      return formatPersianDigits(toman.toLocaleString()) + ' ت';
    }
    return toman.toLocaleString() + ' T';
  };

  return (
    <section
      id="market-performance-dashboard"
      aria-label={isRtl ? 'داشبورد عملکرد زنده بازار' : 'Market Performance Dashboard'}
      className={`rounded-3xl border p-4 sm:p-6 transition-all ${
        isDark
          ? 'bg-slate-900/90 border-slate-800 shadow-2xl shadow-black/40'
          : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'
      }`}
    >
      {/* Header Bar: Title, Subtitle, and Market Breadth Pulse */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 shrink-0">
              <Activity className="w-5 h-5 text-slate-950" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {isRtl ? 'داشبورد عملکرد زنده بازار' : 'Live Market Performance Dashboard'}
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {isRtl ? 'آمار لحظه‌ای ۲۴ ساعته' : 'REAL-TIME 24H'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {isRtl
              ? 'پایش بلادرنگ ۵ رمزارز با بیشترین بازدهی (Gainers) و ۵ رمزارز با بیشترین اصلاح قیمتی (Losers) در ۲۴ ساعت گذشته'
              : 'Real-time ranking of the top 5 market gainers and top 5 market losers based on 24-hour price momentum'}
          </p>
        </div>

        {/* Market Breadth & Sentiment Pills */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Market Sentiment Ratio */}
          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 font-mono ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[11px] text-slate-400 font-sans">
              {isRtl ? 'نبض کل بازار:' : 'Market Ratio:'}
            </span>
            <span className="font-bold text-emerald-500 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              {stats.positiveCount}
            </span>
            <span className="text-slate-500">/</span>
            <span className="font-bold text-rose-500 flex items-center gap-0.5">
              <TrendingDown className="w-3.5 h-3.5" />
              {stats.negativeCount}
            </span>
          </div>

          {/* Average 24h market movement */}
          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-mono ${
              stats.avgChange >= 0
                ? isDark
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : isDark
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-400'
                : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}
          >
            <span className="text-[11px] font-sans opacity-85">
              {isRtl ? 'میانگین نوسان:' : 'Avg 24h:'}
            </span>
            <span className="font-bold">
              {stats.avgChange >= 0 ? '+' : ''}
              {stats.avgChange.toFixed(2)}%
            </span>
          </div>

          {/* USDT reference */}
          <div
            className={`px-3 py-1.5 rounded-xl border text-slate-400 font-mono hidden sm:flex items-center gap-1.5 ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[11px] font-sans">USDT:</span>
            <span className="text-amber-400 font-bold">
              {isRtl ? formatPersianDigits(usdtRate.toLocaleString()) : usdtRate.toLocaleString()} {isRtl ? 'تومان' : 'TMN'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: 2 Side-by-Side Responsive Panels (Top 5 Gainers & Top 5 Losers) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mt-5">
        {/* =========================================================================
            PANEL A: TOP 5 GAINERS (بیشترین رشد ۲۴ ساعته)
            ========================================================================= */}
        <div
          id="top-gainers-card"
          className={`rounded-2xl p-4 sm:p-5 border flex flex-col justify-between transition-all ${
            isDark
              ? 'bg-slate-950/60 border-emerald-500/30 shadow-lg shadow-emerald-950/20'
              : 'bg-emerald-50/40 border-emerald-200 shadow-sm'
          }`}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5">
                  <span>{isRtl ? '۵ رمزارز با بیشترین رشد' : 'Top 5 Market Gainers'}</span>
                  <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isRtl ? 'پربازده‌ترین فرصت‌های صعودی ۲۴ ساعت اخیر' : 'Leading market gainers in the last 24h'}
                </span>
              </div>
            </div>

            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              +{stats.bestGainerChange.toFixed(2)}% MAX
            </span>
          </div>

          {/* Gainers List */}
          <div className="divide-y divide-emerald-500/10 dark:divide-slate-800/80 mt-1">
            {topGainers.map((coin, index) => {
              const isSelected = selectedCoinId === coin.id;
              const avatar = COIN_AVATARS[coin.symbol.toUpperCase()] || coin.thumb;

              return (
                <div
                  key={coin.id}
                  onClick={() => onSelectCoin(coin.id)}
                  className={`py-3 px-2 sm:px-3 rounded-xl flex items-center justify-between gap-3 transition-all cursor-pointer group hover:bg-emerald-500/10 ${
                    isSelected
                      ? 'bg-emerald-500/15 ring-1 ring-emerald-500/40'
                      : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSelectCoin(coin.id);
                    }
                  }}
                  title={isRtl ? `انتخاب ${coin.name}` : `Select ${coin.name}`}
                >
                  {/* Left: Rank & Avatar & Name */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 font-mono text-xs font-bold text-slate-400 text-center shrink-0">
                      #{index + 1}
                    </span>

                    {avatar ? (
                      <img
                        src={avatar}
                        alt={coin.symbol}
                        className="w-8 h-8 rounded-xl object-contain bg-white dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-xs shrink-0"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center text-xs shrink-0">
                        {coin.symbol.slice(0, 3)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {coin.symbol}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[80px] sm:max-w-[120px]">
                          {isRtl ? coin.nameFa || coin.name : coin.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {formatToman(coin.price)}
                      </div>
                    </div>
                  </div>

                  {/* Right: USD Price & Percentage Pill & Action */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <div className="text-end">
                      <div className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                        ${formatPrice(coin.price)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Vol: ${(coin.volume24h ? (coin.volume24h / 1e6).toFixed(1) : '10.2')}M
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-mono font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                        +{coin.change24h.toFixed(2)}%
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCoin(coin.id);
                          onNavigateToSection('TECHNICAL');
                        }}
                        title={isRtl ? 'مشاهده چارت و تحلیل هوش مصنوعی' : 'View Technical Chart & AI'}
                        className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-600 dark:text-slate-400 transition-colors cursor-pointer hidden sm:flex items-center justify-center"
                      >
                        <LineChart className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            PANEL B: TOP 5 LOSERS (بیشترین ریزش ۲۴ ساعته)
            ========================================================================= */}
        <div
          id="top-losers-card"
          className={`rounded-2xl p-4 sm:p-5 border flex flex-col justify-between transition-all ${
            isDark
              ? 'bg-slate-950/60 border-rose-500/30 shadow-lg shadow-rose-950/20'
              : 'bg-rose-50/40 border-rose-200 shadow-sm'
          }`}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-rose-500 dark:text-rose-400 flex items-center gap-1.5">
                  <span>{isRtl ? '۵ رمزارز با بیشترین ریزش' : 'Top 5 Market Losers'}</span>
                  <Zap className="w-3.5 h-3.5 text-rose-400" />
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isRtl ? 'بیشترین افت قیمتی و موقعیت‌های احتمالی واگرایی مثبت' : 'Deepest corrections & potential oversold setups'}
                </span>
              </div>
            </div>

            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30">
              {stats.worstLoserChange.toFixed(2)}% MIN
            </span>
          </div>

          {/* Losers List */}
          <div className="divide-y divide-rose-500/10 dark:divide-slate-800/80 mt-1">
            {topLosers.map((coin, index) => {
              const isSelected = selectedCoinId === coin.id;
              const avatar = COIN_AVATARS[coin.symbol.toUpperCase()] || coin.thumb;

              return (
                <div
                  key={coin.id}
                  onClick={() => onSelectCoin(coin.id)}
                  className={`py-3 px-2 sm:px-3 rounded-xl flex items-center justify-between gap-3 transition-all cursor-pointer group hover:bg-rose-500/10 ${
                    isSelected
                      ? 'bg-rose-500/15 ring-1 ring-rose-500/40'
                      : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSelectCoin(coin.id);
                    }
                  }}
                  title={isRtl ? `انتخاب ${coin.name}` : `Select ${coin.name}`}
                >
                  {/* Left: Rank & Avatar & Name */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 font-mono text-xs font-bold text-slate-400 text-center shrink-0">
                      #{index + 1}
                    </span>

                    {avatar ? (
                      <img
                        src={avatar}
                        alt={coin.symbol}
                        className="w-8 h-8 rounded-xl object-contain bg-white dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-xs shrink-0"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 font-mono font-bold flex items-center justify-center text-xs shrink-0">
                        {coin.symbol.slice(0, 3)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {coin.symbol}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[80px] sm:max-w-[120px]">
                          {isRtl ? coin.nameFa || coin.name : coin.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {formatToman(coin.price)}
                      </div>
                    </div>
                  </div>

                  {/* Right: USD Price & Percentage Pill & Action */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <div className="text-end">
                      <div className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                        ${formatPrice(coin.price)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Vol: ${(coin.volume24h ? (coin.volume24h / 1e6).toFixed(1) : '8.4')}M
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-mono font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
                        {coin.change24h.toFixed(2)}%
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCoin(coin.id);
                          onNavigateToSection('TECHNICAL');
                        }}
                        title={isRtl ? 'مشاهده چارت و تحلیل هوش مصنوعی' : 'View Technical Chart & AI'}
                        className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-600 dark:text-slate-400 transition-colors cursor-pointer hidden sm:flex items-center justify-center"
                      >
                        <LineChart className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

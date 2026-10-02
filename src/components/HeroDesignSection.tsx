import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Globe,
  TrendingUp,
  FileText,
  Clock,
  Target,
  Sparkles,
  ArrowUpRight,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';
import { CryptoCoin, Language, Theme, AppNavigationSection } from '../types';
import { INITIAL_COINS } from '../data/cryptoData';

interface HeroDesignSectionProps {
  lang: Language;
  theme: Theme;
  selectedCoin: CryptoCoin;
  onSelectCoin: (coin: CryptoCoin) => void;
  onNavigateSection: (section: AppNavigationSection) => void;
  onOpenAnalysis?: () => void;
}

export const HeroDesignSection: React.FC<HeroDesignSectionProps> = ({
  lang,
  theme,
  selectedCoin,
  onSelectCoin,
  onNavigateSection,
  onOpenAnalysis,
}) => {
  const isDark = theme === 'dark';
  const isRtl = lang === 'fa';

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Filtered coins based on query
  const filteredCoins = searchQuery.trim()
    ? INITIAL_COINS.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.nameFa && c.nameFa.includes(searchQuery))
      ).slice(0, 6)
    : [];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <section className="relative w-full rounded-3xl overflow-hidden border border-cyan-500/20 bg-gradient-to-b from-[#070e24] via-[#09132c] to-[#060b18] p-4 sm:p-6 md:p-8 shadow-2xl shadow-cyan-950/40">
      {/* Background glowing cosmic accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-emerald-500/5 blur-[90px] pointer-events-none" />

      {/* Main Grid: 3D Art on Left (in RTL) and Content on Right */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column (in RTL): 3D Glass Tablet & Crypto Coins Art */}
        <div className="lg:col-span-6 order-2 lg:order-1 flex justify-center items-center">
          <div className="relative w-full max-w-xl group">
            {/* Holographic Glowing Ambient Frame */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500/30 via-emerald-500/20 to-purple-500/30 blur-xl opacity-75 group-hover:opacity-100 transition duration-700 pointer-events-none" />

            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-cyan-500/30 bg-[#081226]/90 shadow-2xl shadow-cyan-950/60">
              <img
                src="/assets/crypto_hero_3d.jpg"
                alt="Crypto Technical Analysis 3D Dashboard"
                className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-[1.02]"
                onError={(e) => {
                  // Fallback if asset path is slightly different
                  e.currentTarget.src = '/crypto_hero_3d.jpg';
                }}
              />

              {/* Floating Mini Hologram Tickers (BTC, ETH, SOL, BNB) */}
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex items-center justify-between gap-1.5 p-2 rounded-xl bg-[#060c1d]/85 border border-cyan-500/25 backdrop-blur-md text-[10px] sm:text-xs">
                <div className="flex items-center gap-1 font-mono text-amber-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>BTC</span>
                  <span className="text-emerald-400">+2.4%</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-sky-400 font-bold">
                  <span>ETH</span>
                  <span className="text-emerald-400">+1.8%</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-purple-400 font-bold hidden xs:flex">
                  <span>SOL</span>
                  <span className="text-emerald-400">+3.7%</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-yellow-400 font-bold">
                  <span>BNB</span>
                  <span className="text-emerald-400">+1.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (in RTL): Headline, Subtitle, 4 Badges, and Futuristic Search */}
        <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col gap-5 sm:gap-6 text-right">
          {/* Main Headline */}
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              {lang === 'fa' ? (
                <>
                  <span>تحلیل هوشمند، </span>
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                    تصمیم بهتر
                  </span>
                </>
              ) : (
                <>
                  <span>Smart Analysis, </span>
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                    Better Decisions
                  </span>
                </>
              )}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-medium">
              {lang === 'fa'
                ? 'با قدرت هوش مصنوعی، بازار کریپتو را عمیق‌تر تحلیل کنید.'
                : 'Empowered by AI, analyze cryptocurrency markets deeper and faster.'}
            </p>
          </div>

          {/* Row of 4 Feature Pills / Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Pill 1: تحلیل تکنیکال حرفه‌ای */}
            <button
              onClick={() => onNavigateSection('TECHNICAL')}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-[#0d1a3a]/80 hover:bg-[#132552] border border-cyan-500/25 hover:border-cyan-400/50 text-cyan-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm hover:scale-102 active:scale-98"
            >
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
              <span>{lang === 'fa' ? 'تحلیل تکنیکال حرفه‌ای' : 'Pro Technical Analysis'}</span>
            </button>

            {/* Pill 2: بررسی فاندامنتال */}
            <button
              onClick={() => onNavigateSection('FUNDAMENTAL')}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-[#0d1a3a]/80 hover:bg-[#132552] border border-cyan-500/25 hover:border-cyan-400/50 text-cyan-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm hover:scale-102 active:scale-98"
            >
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
              <span>{lang === 'fa' ? 'بررسی فاندامنتال' : 'Fundamental Review'}</span>
            </button>

            {/* Pill 3: دسترسی به اخبار لحظه‌ای */}
            <button
              onClick={() => onNavigateSection('FUNDAMENTAL')}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-[#0d1a3a]/80 hover:bg-[#132552] border border-cyan-500/25 hover:border-cyan-400/50 text-cyan-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm hover:scale-102 active:scale-98"
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-400 shrink-0" />
              <span>{lang === 'fa' ? 'دسترسی به اخبار لحظه‌ای' : 'Real-time News'}</span>
            </button>

            {/* Pill 4: سیگنال‌های دقیق */}
            <button
              onClick={() => onNavigateSection('TECHNICAL')}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-[#0d1a3a]/80 hover:bg-[#132552] border border-cyan-500/25 hover:border-cyan-400/50 text-cyan-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm hover:scale-102 active:scale-98"
            >
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 shrink-0" />
              <span>{lang === 'fa' ? 'سیگنال‌های دقیق' : 'Accurate Signals'}</span>
            </button>
          </div>

          {/* High-Tech Integrated Search Bar */}
          <div ref={searchContainerRef} className="relative w-full">
            <div
              className={`flex items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border transition-all duration-300 ${
                isSearchFocused
                  ? 'border-cyan-400 bg-[#081228] shadow-[0_0_25px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/50'
                  : 'border-cyan-500/35 bg-[#081226]/80 hover:border-cyan-500/60 shadow-lg shadow-cyan-950/30'
              }`}
            >
              {/* Left pill button inside search: CMC & CG API */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-[11px] sm:text-xs font-mono font-bold shrink-0">
                <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>CMC & CG API</span>
              </div>

              {/* Middle search input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder={
                  lang === 'fa'
                    ? 'جستجوی ارز دیجیتال (مانند: BTC, ETH, CoinGecko و...)'
                    : 'Search crypto (e.g. BTC, ETH, CoinGecko...)'
                }
                className="flex-1 bg-transparent border-none outline-none text-white text-xs sm:text-sm placeholder-slate-400 text-right pr-2"
                dir={lang === 'fa' ? 'rtl' : 'ltr'}
              />

              {/* Right search icon */}
              <div className="text-cyan-400 shrink-0 pl-1">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
              </div>
            </div>

            {/* Interactive Live Search Dropdown */}
            {isSearchFocused && (
              <div className="absolute top-full mt-2 left-0 right-0 z-50 rounded-2xl border border-cyan-500/30 bg-[#070e22]/95 backdrop-blur-xl p-2 shadow-2xl shadow-black/80 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="text-[11px] text-cyan-300/70 font-semibold px-3 py-1.5 border-b border-cyan-500/15 flex items-center justify-between">
                  <span>{lang === 'fa' ? 'ارزهای پیشنهادی و نتایج جستجو' : 'Featured & Matching Coins'}</span>
                  <span className="font-mono text-[10px] text-emerald-400">LIVE FEED</span>
                </div>

                <div className="flex flex-col gap-1 mt-1 max-h-60 overflow-y-auto no-scrollbar">
                  {(filteredCoins.length > 0 ? filteredCoins : INITIAL_COINS.slice(0, 5)).map(
                    (coin) => (
                      <button
                        key={coin.id}
                        onClick={() => {
                          onSelectCoin(coin);
                          setSearchQuery('');
                          setIsSearchFocused(false);
                          if (onOpenAnalysis) onOpenAnalysis();
                        }}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer text-xs ${
                          selectedCoin.id === coin.id
                            ? 'bg-cyan-500/20 border border-cyan-500/40 text-white'
                            : 'hover:bg-cyan-500/10 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold text-xs ${
                              (coin.change24h || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {(coin.change24h || 0) >= 0 ? '+' : ''}
                            {coin.change24h?.toFixed(2)}%
                          </span>
                          <span className="font-mono text-slate-300 text-xs">
                            ${coin.price?.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className="font-bold text-white block">
                              {lang === 'fa' ? coin.nameFa || coin.name : coin.name}
                            </span>
                            <span className="font-mono text-[10px] text-cyan-300/70">
                              {coin.symbol}
                            </span>
                          </div>
                          <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-500/30 flex items-center justify-center font-bold font-mono text-[10px] text-cyan-300">
                            {coin.symbol.slice(0, 3)}
                          </div>
                        </div>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

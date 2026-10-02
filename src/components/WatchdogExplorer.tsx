import React, { useState, useMemo } from 'react';
import {
  Search,
  TrendingUp,
  TrendingDown,
  LineChart,
  Newspaper,
  Compass,
  Flame,
  Layers,
  Bot,
  Coins,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Zap,
  Activity,
  Gauge,
} from 'lucide-react';
import { CryptoCoin, Language, Theme } from '../types';
import { CoinSearchBar } from './CoinSearchBar';
import { FearAndGreedWidget } from './FearAndGreedWidget';
import { MarketPerformanceDashboard } from './MarketPerformanceDashboard';

// High-resolution CoinGecko official token emblems
export const COIN_AVATARS: Record<string, string> = {
  BTC: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
  ETH: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  SOL: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
  BNB: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
  XRP: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png',
  DOGE: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png',
  ADA: 'https://assets.coingecko.com/coins/images/975/small/cardano.png',
  AVAX: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
  SUI: 'https://assets.coingecko.com/coins/images/26375/small/sui-ocean-square.png',
  SHIB: 'https://assets.coingecko.com/coins/images/11939/small/shiba.png',
  LINK: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
  DOT: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png',
  TON: 'https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png',
  PEPE: 'https://assets.coingecko.com/coins/images/29850/small/pepe-token.png',
  NEAR: 'https://assets.coingecko.com/coins/images/10365/small/near.png',
  UNI: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png',
  APT: 'https://assets.coingecko.com/coins/images/26455/small/aptos_round.png',
  LTC: 'https://assets.coingecko.com/coins/images/2/small/litecoin.png',
  RENDER: 'https://assets.coingecko.com/coins/images/11636/small/rndr.png',
  FET: 'https://assets.coingecko.com/coins/images/5681/small/Fetch.jpg',
};

interface WatchdogExplorerProps {
  coins: CryptoCoin[];
  selectedCoin: CryptoCoin;
  onSelectCoin: (coinId: string) => void;
  onNavigateToSection: (section: 'TECHNICAL' | 'FUNDAMENTAL') => void;
  usdtRate: number;
  lang: Language;
  theme: Theme;
  isVipActive: boolean;
  onOpenVipModal: () => void;
}

type CategoryFilter = 'ALL' | 'LAYER1' | 'AI' | 'DEFI' | 'MEME';

export const WatchdogExplorer: React.FC<WatchdogExplorerProps> = ({
  coins,
  selectedCoin,
  onSelectCoin,
  onNavigateToSection,
  usdtRate,
  lang,
  theme,
  isVipActive,
  onOpenVipModal,
}) => {
  const isDark = theme === 'dark';
  const isRtl = lang === 'fa';
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL');

  // Filter categories
  const categories = [
    {
      id: 'ALL' as CategoryFilter,
      labelFa: 'همه رمزارزها',
      labelEn: 'All Assets',
      icon: Coins,
      count: coins.length,
    },
    {
      id: 'LAYER1' as CategoryFilter,
      labelFa: 'ارزهای پایه (Layer 1)',
      labelEn: 'Layer 1 Chains',
      icon: Layers,
      count: coins.filter((c) =>
        ['BTC', 'ETH', 'SOL', 'BNB', 'ADA', 'AVAX', 'SUI', 'TON', 'APT', 'DOT', 'LTC', 'NEAR'].includes(
          c.symbol.toUpperCase()
        )
      ).length,
    },
    {
      id: 'AI' as CategoryFilter,
      labelFa: 'هوش مصنوعی (AI Tokens)',
      labelEn: 'AI & Big Data',
      icon: Bot,
      count: coins.filter((c) => ['RENDER', 'FET', 'NEAR'].includes(c.symbol.toUpperCase())).length,
    },
    {
      id: 'DEFI' as CategoryFilter,
      labelFa: 'دیفای و اوراکل (DeFi)',
      labelEn: 'DeFi & Oracles',
      icon: Zap,
      count: coins.filter((c) => ['UNI', 'LINK', 'AAVE', 'MKR'].includes(c.symbol.toUpperCase())).length,
    },
    {
      id: 'MEME' as CategoryFilter,
      labelFa: 'میم‌کوین‌ها (Meme Coins)',
      labelEn: 'Meme Coins',
      icon: Flame,
      count: coins.filter((c) => ['DOGE', 'SHIB', 'PEPE', 'WIF', 'FLOKI'].includes(c.symbol.toUpperCase())).length,
    },
  ];

  // Filtered coins list
  const filteredCoins = useMemo(() => {
    if (activeCategory === 'ALL') return coins;
    if (activeCategory === 'LAYER1') {
      return coins.filter((c) =>
        ['BTC', 'ETH', 'SOL', 'BNB', 'ADA', 'AVAX', 'SUI', 'TON', 'APT', 'DOT', 'LTC', 'NEAR'].includes(
          c.symbol.toUpperCase()
        )
      );
    }
    if (activeCategory === 'AI') {
      return coins.filter((c) => ['RENDER', 'FET', 'NEAR'].includes(c.symbol.toUpperCase()));
    }
    if (activeCategory === 'DEFI') {
      return coins.filter((c) => ['UNI', 'LINK'].includes(c.symbol.toUpperCase()));
    }
    if (activeCategory === 'MEME') {
      return coins.filter((c) => ['DOGE', 'SHIB', 'PEPE'].includes(c.symbol.toUpperCase()));
    }
    return coins;
  }, [coins, activeCategory]);

  // Spotlight Hot Coins (Top 4: BTC, ETH, SOL, and Top Gainer)
  const spotlightCoins = useMemo(() => {
    const top3 = coins.filter((c) => ['BTC', 'ETH', 'SOL'].includes(c.symbol.toUpperCase()));
    const bestGainer = [...coins]
      .filter((c) => !['BTC', 'ETH', 'SOL'].includes(c.symbol.toUpperCase()))
      .sort((a, b) => b.change24h - a.change24h)[0];

    const result = [...top3];
    if (bestGainer) result.push(bestGainer);
    return result.slice(0, 4);
  }, [coins]);

  const getCoinImage = (coin: CryptoCoin): string | undefined => {
    return coin.thumb || COIN_AVATARS[coin.symbol.toUpperCase()];
  };

  const handleInspectTechnical = (coinId: string) => {
    onSelectCoin(coinId);
    onNavigateToSection('TECHNICAL');
  };

  const handleInspectFundamental = (coinId: string) => {
    onSelectCoin(coinId);
    onNavigateToSection('FUNDAMENTAL');
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* 1. HERO WATCHDOG BANNER & LIVE RADAR */}
      <div
        className={`relative overflow-hidden rounded-3xl border p-5 sm:p-7 transition-all ${
          isDark
            ? 'bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-indigo-500/20 shadow-xl shadow-black/40'
            : 'bg-gradient-to-br from-white via-indigo-50/50 to-blue-50/30 border-indigo-100 shadow-lg shadow-indigo-100/50'
        }`}
      >
        {/* Subtle background glow effect */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Title & Live Status */}
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md bg-blue-500/10 border-blue-500/30 text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span>{isRtl ? 'رادار زنده دیده‌بان بازار کریپتو' : 'Live Crypto Market Watchdog Radar'}</span>
              <span className="text-[10px] font-mono opacity-80">| {coins.length} رمزارز فعال</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <Compass className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500 animate-pulse" />
              <span>{isRtl ? 'دیده‌بان هوشمند و مرکز پایش رمزارزها' : 'Crypto Watchdog & Intelligence Center'}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {isRtl
                ? 'پایش لحظه‌ای قیمت دلاری و تومانی، تحلیل‌های هوش مصنوعی، سیگنال‌های واگرایی، و بررسی بنیادی ۲۰۰+ رمزارز برتر بازار کریپتو با نرخ زنده نوبیتکس.'
                : 'Real-time multi-currency price monitoring, AI divergence signals, and deep fundamentals across top 200+ cryptocurrencies with live Nobitex conversion.'}
            </p>
          </div>

          {/* Quick Stats Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
            <div
              className={`p-3 rounded-2xl border text-center transition-all ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200 shadow-sm'
              }`}
            >
              <span className="text-[11px] text-slate-500 block">
                {isRtl ? 'نرخ تتر (نوبیتکس)' : 'Nobitex USDT'}
              </span>
              <span className="text-xs sm:text-sm font-bold font-mono text-emerald-500">
                {usdtRate.toLocaleString('fa-IR')} <span className="text-[10px]">تومان</span>
              </span>
            </div>

            <div
              className={`p-3 rounded-2xl border text-center transition-all ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200 shadow-sm'
              }`}
            >
              <span className="text-[11px] text-slate-500 block">
                {isRtl ? 'سلطه بیت‌کوین (BTC.D)' : 'BTC Dominance'}
              </span>
              <span className="text-xs sm:text-sm font-bold font-mono text-amber-400">
                57.8% <span className="text-[10px] text-emerald-500">+0.4%</span>
              </span>
            </div>

            <div
              className={`p-3 rounded-2xl border text-center col-span-2 sm:col-span-1 transition-all ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200 shadow-sm'
              }`}
            >
              <span className="text-[11px] text-slate-500 block">
                {isRtl ? 'وضعیت احساسات بازار' : 'Market Sentiment'}
              </span>
              <span className="text-xs sm:text-sm font-bold text-blue-400 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{isRtl ? 'طمع صعودی' : 'Bullish Greed'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Token Icon Strip */}
        <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs text-slate-400 font-bold shrink-0">
            {isRtl ? 'رمزارزهای پایش شده:' : 'Monitored Assets:'}
          </span>
          {coins.slice(0, 16).map((coin) => {
            const imgUrl = getCoinImage(coin);
            const isSelected = selectedCoin.id === coin.id;
            return (
              <button
                key={coin.id}
                onClick={() => onSelectCoin(coin.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer border shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30 scale-105'
                    : isDark
                    ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={coin.symbol}
                    className="w-4 h-4 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 text-[10px] flex items-center justify-center font-bold">
                    {coin.symbol.slice(0, 1)}
                  </span>
                )}
                <span>{coin.symbol}</span>
                <span
                  className={`text-[10px] ${
                    coin.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {coin.change24h >= 0 ? '+' : ''}
                  {coin.change24h.toFixed(1)}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SPOTLIGHT TRENDING CARDS (Top Movers & Market Leaders) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>{isRtl ? 'لیدرهای برتر و ستاره‌های بازار کریپتو' : 'Spotlight Market Leaders & Top Movers'}</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {isRtl ? 'ارقام دلاری و برابری زنده تومانی' : 'USD & Live Toman Valuations'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {spotlightCoins.map((coin, idx) => {
            const imgUrl = getCoinImage(coin);
            const isPositive = coin.change24h >= 0;
            const tomanPrice = Math.round(coin.price * usdtRate);

            return (
              <div
                key={coin.id}
                className={`relative rounded-3xl p-5 border transition-all duration-200 group overflow-hidden ${
                  selectedCoin.id === coin.id
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : isDark
                    ? 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                {/* Top Row: Coin Avatar, Symbol, Rank */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={coin.name}
                          className="w-10 h-10 rounded-2xl p-0.5 bg-slate-800/40 border border-slate-700/50 shadow-md"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow">
                          {coin.symbol.slice(0, 2)}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 text-[10px] font-mono px-1 rounded-md bg-slate-950 text-slate-300 border border-slate-800 font-bold">
                        #{coin.marketCapRank || idx + 1}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                        {isRtl && coin.nameFa ? coin.nameFa : coin.name}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">{coin.symbol}</span>
                    </div>
                  </div>

                  {/* 24h Change Pill */}
                  <span
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-xs font-mono font-bold ${
                      isPositive
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    }`}
                  >
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{Math.abs(coin.change24h).toFixed(2)}%</span>
                  </span>
                </div>

                {/* Price Display: USD + Toman */}
                <div className="my-2 space-y-0.5">
                  <div className="text-base sm:text-lg font-mono font-black text-slate-900 dark:text-white">
                    ${coin.price < 1 ? coin.price.toFixed(4) : coin.price.toLocaleString()}
                  </div>
                  <div className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    ≈ {tomanPrice.toLocaleString('fa-IR')} <span className="text-[10px]">تومان</span>
                  </div>
                </div>

                {/* Growth Potential / AI Score Bar */}
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] flex items-center justify-between text-slate-500">
                  <span>{isRtl ? 'امتیاز رشد هوش مصنوعی:' : 'AI Growth Score:'}</span>
                  <span className="font-mono font-bold text-blue-400">
                    {coin.growthPotentialScore || 85}/100
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => handleInspectTechnical(coin.id)}
                    className="flex-1 py-1.5 px-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                  >
                    <LineChart className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'چارت و تکنیکال' : 'Chart & AI'}</span>
                  </button>

                  <button
                    onClick={() => handleInspectFundamental(coin.id)}
                    className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                    title={isRtl ? 'تحلیل فاندامنتال و اخبار' : 'Fundamental Analysis'}
                  >
                    <Newspaper className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2.5 REAL-TIME MARKET PERFORMANCE DASHBOARD (TOP 5 GAINERS & LOSERS) */}
      <MarketPerformanceDashboard
        coins={coins}
        selectedCoinId={selectedCoin.id}
        onSelectCoin={onSelectCoin}
        onNavigateToSection={onNavigateToSection}
        usdtRate={usdtRate}
        lang={lang}
        theme={theme}
      />

      {/* 3. SEARCH CONTAINER & CATEGORY FILTER CHIPS */}
      <div
        id="crypto-search-container"
        className={`p-4 sm:p-6 rounded-3xl border transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800/90' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-500" />
              <span>{isRtl ? 'جستجوی زنده در بیش از ۲۰۰ رمزارز' : 'Live Search Across 200+ Cryptocurrencies'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRtl
                ? 'نام انگلیسی، نماد یا نام فارسی رمزارز مورد نظر را تایپ کنید'
                : 'Type token name, ticker symbol or contract to inspect'}
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400">
            {isRtl ? 'پشتیبانی از جستجوی آنی' : 'Instant Autocomplete Enabled'}
          </div>
        </div>

        {/* Live Search Bar */}
        <CoinSearchBar
          onSelectCoin={(coinId) => onSelectCoin(coinId)}
          lang={lang}
          theme={theme}
          currentSymbol={selectedCoin.symbol}
        />

        {/* Narrative & Category Filter Tabs */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs text-slate-400 font-bold shrink-0 ml-1">
            {isRtl ? 'دسته‌بندی‌ها:' : 'Categories:'}
          </span>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isCatActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                  isCatActive
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                    : isDark
                    ? 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 border-slate-700/60'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isRtl ? cat.labelFa : cat.labelEn}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    isCatActive ? 'bg-white/20 text-white' : 'bg-slate-700/30 text-slate-400'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. TOP 20 MARKET WATCHDOG TABLE WITH IMAGES */}
      <div
        className={`rounded-3xl border overflow-hidden p-4 sm:p-6 ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4 gap-2">
          <div className="space-y-0.5">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>
                {isRtl
                  ? `جدول جامع دیده‌بان رمزارزها (${filteredCoins.length} ارز)`
                  : `Comprehensive Crypto Watchdog Directory (${filteredCoins.length} Coins)`}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              {isRtl
                ? 'برای مشاهده چارت دلاری/تومانی یا تحلیل هوش مصنوعی روی ردیف هر ارز کلیک کنید'
                : 'Click any row to load trading chart and AI divergence setups'}
            </p>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            {isRtl ? 'بروزرسانی زنده هر ۳۰ ثانیه' : 'Live updates every 30s'}
          </span>
        </div>

        <div className="overflow-x-auto -mx-1 sm:mx-0">
          <table className="w-full min-w-[640px] text-right text-xs border-collapse font-sans">
            <thead>
              <tr className="text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold">
                <th className="p-3 text-center">#</th>
                <th className="p-3">{isRtl ? 'رمزارز و لوگو' : 'Asset & Logo'}</th>
                <th className="p-3">{isRtl ? 'قیمت دلار جهانی' : 'USD Price'}</th>
                <th className="p-3">{isRtl ? 'برابر زنده تومانی' : 'Toman Valuation'}</th>
                <th className="p-3">{isRtl ? 'تغییر ۲۴ ساعته' : '24h Change'}</th>
                <th className="p-3 hidden md:table-cell">{isRtl ? 'ارزش کل بازار' : 'Market Cap'}</th>
                <th className="p-3 hidden lg:table-cell">{isRtl ? 'سیگنال هوش مصنوعی' : 'AI Signal'}</th>
                <th className="p-3 text-center">{isRtl ? 'عملیات تحلیل' : 'Analysis Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
              {filteredCoins.map((coin, idx) => {
                const imgUrl = getCoinImage(coin);
                const isSelected = selectedCoin.id === coin.id;
                const isPositive = coin.change24h >= 0;
                const tomanPrice = Math.round(coin.price * usdtRate);

                return (
                  <tr
                    key={coin.id}
                    className={`hover:bg-blue-500/5 transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-500/10' : ''
                    }`}
                    onClick={() => onSelectCoin(coin.id)}
                  >
                    {/* Rank */}
                    <td className="p-3 text-center text-slate-400 font-bold">
                      {idx === 0 ? (
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 inline-flex items-center justify-center text-[10px]">
                          1
                        </span>
                      ) : idx === 1 ? (
                        <span className="w-5 h-5 rounded-full bg-slate-400/20 text-slate-300 border border-slate-400/30 inline-flex items-center justify-center text-[10px]">
                          2
                        </span>
                      ) : idx === 2 ? (
                        <span className="w-5 h-5 rounded-full bg-amber-700/20 text-amber-600 border border-amber-700/30 inline-flex items-center justify-center text-[10px]">
                          3
                        </span>
                      ) : (
                        idx + 1
                      )}
                    </td>

                    {/* Logo & Name */}
                    <td className="p-3 font-sans font-bold">
                      <div className="flex items-center gap-2.5">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={coin.name}
                            className="w-7 h-7 rounded-xl p-0.5 bg-slate-800/40 border border-slate-700/50 shadow-sm shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
                            {coin.symbol.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm">
                              {coin.name}
                            </span>
                            {coin.nameFa && isRtl && (
                              <span className="text-[11px] text-slate-400 font-normal">
                                ({coin.nameFa})
                              </span>
                            )}
                          </div>
                          <span className="text-slate-400 text-[11px] font-mono block">
                            {coin.symbol}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* USD Price */}
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      ${coin.price < 1 ? coin.price.toFixed(4) : coin.price.toLocaleString()}
                    </td>

                    {/* Toman Price */}
                    <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                      {tomanPrice.toLocaleString('fa-IR')}{' '}
                      <span className="text-[10px] text-slate-400 font-sans">تومان</span>
                    </td>

                    {/* 24h Change */}
                    <td className="p-3 font-bold">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[11px] ${
                          isPositive
                            ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20'
                            : 'text-rose-500 bg-rose-500/10 border border-rose-500/20'
                        }`}
                      >
                        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        <span>
                          {isPositive ? '+' : ''}
                          {coin.change24h.toFixed(2)}%
                        </span>
                      </span>
                    </td>

                    {/* Market Cap */}
                    <td className="p-3 text-slate-400 hidden md:table-cell">
                      ${(coin.marketCap / 1e9).toFixed(2)}B
                    </td>

                    {/* AI Signal */}
                    <td className="p-3 hidden lg:table-cell font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          coin.signal === 'STRONG_BUY'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : coin.signal === 'BUY'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-amber-500/15 text-amber-400'
                        }`}
                      >
                        {coin.signal === 'STRONG_BUY'
                          ? (isRtl ? 'خرید پرقدرت' : 'STRONG BUY')
                          : coin.signal === 'BUY'
                          ? (isRtl ? 'فرصت خرید' : 'BUY')
                          : (isRtl ? 'خنثی / رنج' : 'NEUTRAL')}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInspectTechnical(coin.id);
                          }}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-all shadow-sm flex items-center gap-1 font-sans"
                        >
                          <LineChart className="w-3 h-3" />
                          <span>{isRtl ? 'چارت' : 'Chart'}</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInspectFundamental(coin.id);
                          }}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border font-sans ${
                            isDark
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                          }`}
                        >
                          <Newspaper className="w-3 h-3 text-cyan-400" />
                          <span className="hidden sm:inline">{isRtl ? 'اخبار' : 'News'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. FEAR & GREED SENTIMENT RADAR IN WATCHDOG */}
      <div id="watchdog-sentiment-widget" className="w-full">
        <FearAndGreedWidget
          coin={selectedCoin}
          lang={lang}
          theme={theme}
          isVipActive={isVipActive}
          onOpenVipModal={onOpenVipModal}
        />
      </div>
    </div>
  );
};

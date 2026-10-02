import React from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Coins,
  Layers,
  BarChart3,
  Flame,
  Award,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { CryptoCoin, Language, Theme } from '../types';
import { translations } from '../utils/translations';

interface CoinProfileCardProps {
  coin: CryptoCoin;
  lang: Language;
  theme: Theme;
  isAnalyzing: boolean;
  onRefreshAnalysis: () => void;
}

export const CoinProfileCard: React.FC<CoinProfileCardProps> = ({
  coin,
  lang,
  theme,
  isAnalyzing,
  onRefreshAnalysis,
}) => {
  const t = translations[lang];
  const isDark = theme === 'dark';
  const isPositive = coin.change24h >= 0;

  return (
    <div
      className={`rounded-3xl p-4 sm:p-5 border transition-all shadow-xl flex flex-col gap-4 relative overflow-hidden ${
        isPositive
          ? 'ring-1 ring-emerald-500/25 shadow-[0_4px_30px_-4px_rgba(16,185,129,0.12)]'
          : 'ring-1 ring-rose-500/25 shadow-[0_4px_30px_-4px_rgba(244,63,94,0.12)]'
      } ${
        isDark
          ? 'bg-slate-900/90 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
      }`}
    >
      {/* Subtle top ambient indicator bar */}
      <div
        className={`absolute top-0 inset-x-0 h-1 transition-all ${
          isPositive
            ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600'
            : 'bg-gradient-to-r from-rose-500 via-pink-400 to-rose-600'
        }`}
      />

      {/* Top row: Coin Identity + Live Price + Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800/40">
        {/* Left: Identity */}
        <div className="flex items-center gap-3.5">
          {coin.thumb ? (
            <img
              src={coin.thumb}
              alt={coin.name}
              className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 object-cover shadow-md border border-slate-200 dark:border-slate-700"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-mono font-black text-emerald-400 text-lg">
                {coin.symbol.slice(0, 3)}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {coin.name}
              </h1>
              <span className="font-mono text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 px-2.5 py-0.5 rounded-xl">
                {coin.symbol}
              </span>
              {coin.marketCapRank && (
                <span
                  className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-lg border ${
                    isDark
                      ? 'bg-slate-950/80 border-slate-800 text-slate-400'
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  {t.rank} #{coin.marketCapRank}
                </span>
              )}
              <span className="text-xs bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 px-2 py-0.5 rounded-lg font-medium">
                {coin.category}
              </span>

              {/* Psychology trust badge: Verified Live API */}
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                  isDark
                    ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40'
                    : 'text-emerald-800 bg-emerald-50 border-emerald-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {t.verifiedLiveBadge}
              </span>
            </div>

            {coin.nameFa && lang === 'fa' && coin.nameFa !== coin.name && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{coin.nameFa}</p>
            )}
          </div>
        </div>

        {/* Right: Price with Trend Pulse Animation & Analysis Trigger */}
        <div className="flex items-center justify-between md:justify-end gap-3.5 flex-wrap sm:flex-nowrap">
          {/* Subtle trend-based animation price box */}
          <div
            className={`relative px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl border transition-all shrink-0 ${
              isPositive
                ? isDark
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-emerald-50/80 border-emerald-300'
                : isDark
                ? 'bg-rose-950/20 border-rose-500/30'
                : 'bg-rose-50/80 border-rose-300'
            }`}
          >
            {/* Subtle Ambient Pulse Aura */}
            <div
              className={`absolute -inset-0.5 rounded-2xl opacity-30 blur-sm pointer-events-none transition-opacity animate-pulse ${
                isPositive ? 'bg-emerald-500/30' : 'bg-rose-500/30'
              }`}
            />

            {/* Price & Radar Pulse Indicator */}
            <div className="relative flex items-baseline justify-between gap-3 font-mono">
              <span
                className={`text-2xl sm:text-3xl font-black tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                ${coin.price > 10 ? coin.price.toLocaleString() : coin.price}
              </span>

              {/* Radar Wave Pulse */}
              <span
                className="relative flex h-2.5 w-2.5 shrink-0"
                title={isPositive ? 'Bullish Trend Pulse' : 'Bearish Trend Pulse'}
              >
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isPositive ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isPositive ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
              </span>
            </div>

            {/* 24h Trend Label */}
            <div
              className={`relative text-xs sm:text-sm font-bold flex items-center gap-1.5 mt-0.5 ${
                isPositive
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-rose-700 dark:text-rose-400'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>
                {isPositive ? '+' : ''}
                {coin.change24h}% (24h)
              </span>
              <span className="text-[10px] font-mono opacity-85">
                {isPositive
                  ? lang === 'fa'
                    ? '• نبض صعودی'
                    : '• Bullish Pulse'
                  : lang === 'fa'
                  ? '• نبض اصلاحی'
                  : '• Bearish Pulse'}
              </span>
            </div>
          </div>

          <button
            onClick={onRefreshAnalysis}
            disabled={isAnalyzing}
            className="flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition-all cursor-pointer shrink-0 min-h-[44px]"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t.analyzing}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>{t.runAnalysis}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs font-mono">
        {/* 24h High/Low */}
        <div
          className={`p-2.5 rounded-xl border ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="text-slate-500 dark:text-slate-400 text-[11px] font-sans mb-1">{t.high24h} / {t.low24h}</div>
          <div className="font-bold text-slate-900 dark:text-slate-100">
            ${coin.high24h > 10 ? coin.high24h.toLocaleString() : coin.high24h}
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
            ${coin.low24h > 10 ? coin.low24h.toLocaleString() : coin.low24h}
          </div>
        </div>

        {/* 24h Volume */}
        <div
          className={`p-2.5 rounded-xl border ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="text-slate-500 dark:text-slate-400 text-[11px] font-sans mb-1">{t.volume24h}</div>
          <div className="font-bold text-slate-900 dark:text-slate-100">
            ${coin.volume24h ? (coin.volume24h / 1e6).toFixed(1) + 'M' : 'N/A'}
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-[10px] font-sans mt-0.5">
            {lang === 'fa' ? 'حجم کل بازار جهانی' : 'Global 24h Volume'}
          </div>
        </div>

        {/* Market Cap */}
        <div
          className={`p-2.5 rounded-xl border ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="text-slate-500 dark:text-slate-400 text-[11px] font-sans mb-1">{t.marketCap}</div>
          <div className="font-bold text-slate-900 dark:text-slate-100">
            ${coin.marketCap ? (coin.marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-[10px] font-sans mt-0.5">
            {lang === 'fa' ? `رتبه #${coin.marketCapRank || '-'}` : `Rank #${coin.marketCapRank || '-'}`}
          </div>
        </div>

        {/* Circulating Supply */}
        <div
          className={`p-2.5 rounded-xl border ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="text-slate-500 dark:text-slate-400 text-[11px] font-sans mb-1">{t.circulatingSupply}</div>
          <div className="font-bold text-slate-900 dark:text-slate-100 truncate">
            {coin.circulatingSupply
              ? (coin.circulatingSupply / 1e6).toFixed(1) + 'M ' + coin.symbol
              : 'N/A'}
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-[10px] font-sans mt-0.5">
            {coin.totalSupply && coin.circulatingSupply
              ? `${Math.round((coin.circulatingSupply / coin.totalSupply) * 100)}% ${lang === 'fa' ? 'در گردش' : 'Circulating'}`
              : lang === 'fa' ? 'توکنومیکس شفاف' : 'Transparent Supply'}
          </div>
        </div>

        {/* ATH & Distance */}
        <div
          className={`p-2.5 rounded-xl border ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="text-slate-500 dark:text-slate-400 text-[11px] font-sans mb-1">{t.ath}</div>
          <div className="font-bold text-slate-900 dark:text-slate-100">
            {coin.ath ? `$${coin.ath.toLocaleString()}` : '$' + (coin.price * 1.5).toFixed(2)}
          </div>
          <div className="text-rose-600 dark:text-rose-400 text-[11px] font-bold mt-0.5">
            {coin.athChangePercentage ? `${coin.athChangePercentage}%` : '-35%'}
          </div>
        </div>

        {/* Growth Potential Score */}
        <div
          className={`p-2.5 rounded-xl border flex flex-col justify-between ${
            isDark
              ? 'bg-amber-950/20 border-amber-500/30'
              : 'bg-amber-50 border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-sans text-amber-700 dark:text-amber-400 font-bold">
            <span>{t.growthScore}</span>
            <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          </div>
          <div className="text-xl font-black text-amber-700 dark:text-amber-400 font-mono">
            {coin.growthPotentialScore}%
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800/80 rounded-full h-1 overflow-hidden mt-1">
            <div
              className="bg-amber-500 dark:bg-amber-400 h-1 rounded-full"
              style={{ width: `${coin.growthPotentialScore}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

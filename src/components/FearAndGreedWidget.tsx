import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  Crown,
  Sparkles,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  X,
  Layers,
  BarChart3,
  Activity,
  Share2,
} from 'lucide-react';
import { CryptoCoin, FearAndGreedData, Language, Theme } from '../types';
import { translations } from '../utils/translations';
import { formatPersianDigits } from '../utils/numberFormat';

interface FearAndGreedWidgetProps {
  coin: CryptoCoin;
  lang: Language;
  theme: Theme;
  isVipActive: boolean;
  onOpenVipModal: () => void;
}

export const FearAndGreedWidget: React.FC<FearAndGreedWidgetProps> = ({
  coin,
  lang,
  theme,
  isVipActive,
  onOpenVipModal,
}) => {
  const t = translations[lang];
  const isDark = theme === 'dark';

  const [fng, setFng] = useState<FearAndGreedData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [showVipBanner, setShowVipBanner] = useState<boolean>(false);
  const [autoRefreshedToast, setAutoRefreshedToast] = useState<boolean>(false);
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);

  // Per-coin refresh tracking: 1 free auto-refresh allowed per coin search
  // Keyed by coin symbol
  const [refreshedSymbols, setRefreshedSymbols] = useState<Record<string, number>>({});
  const lastCoinSymbolRef = useRef<string>('');

  const fetchFng = async (isAuto = false) => {
    setIsLoading(true);
    try {
      const sym = (coin?.symbol || 'BTC').toUpperCase();
      const params = new URLSearchParams({
        symbol: sym,
        name: coin?.nameFa || coin?.name || sym,
        price: String(coin?.price || 0),
        change24h: String(coin?.change24h || 0),
      });

      const res = await fetch(`/api/crypto/fear-and-greed?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setFng(data.data);
        }
      }
      if (isAuto) {
        setAutoRefreshedToast(true);
        setTimeout(() => setAutoRefreshedToast(false), 3500);
      }
    } catch (err) {
      console.warn('Could not fetch Fear & Greed index:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Whenever the user searches or selects a different coin:
  // Auto-refresh once per coin with the new coin's parameters!
  useEffect(() => {
    if (!coin || !coin.symbol) return;
    const symbol = coin.symbol.toUpperCase();

    // Check if this coin has already been refreshed in this session
    const prevCount = refreshedSymbols[symbol] || 0;

    if (lastCoinSymbolRef.current !== symbol) {
      lastCoinSymbolRef.current = symbol;
      setShowVipBanner(false);

      // Perform the 1 automatic refresh after search / coin change
      fetchFng(true);

      setRefreshedSymbols((prev) => ({
        ...prev,
        [symbol]: prevCount + 1,
      }));
    }
  }, [coin?.symbol]);

  // Handle manual refresh button click
  const handleManualRefreshClick = () => {
    const symbol = (coin?.symbol || 'BTC').toUpperCase();
    const timesRefreshed = refreshedSymbols[symbol] || 0;

    // If VIP user: always allow unlimited refreshes
    if (isVipActive) {
      fetchFng(false);
      return;
    }

    // If non-VIP user and already refreshed once for this coin:
    // Prompt for VIP subscription!
    if (timesRefreshed >= 1) {
      setShowVipBanner(true);
      onOpenVipModal();
      return;
    }

    // Otherwise allow the single free refresh
    setRefreshedSymbols((prev) => ({
      ...prev,
      [symbol]: timesRefreshed + 1,
    }));
    fetchFng(false);
  };

  // Sentiment colors and labels
  const getSentimentMeta = (val: number) => {
    if (val <= 24) {
      return {
        labelFa: 'ترس شدید (Extreme Fear)',
        labelEn: 'Extreme Fear',
        colorClass: 'text-rose-600 dark:text-rose-400',
        badgeBg: isDark ? 'bg-rose-950/60 border-rose-500/40 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700',
        adviceFa: 'ترس شدید در بازار؛ اغلب در این فاز فرصت‌های انباشت پله‌ای (DCA) برای سرمایه‌گذاران با دید میان‌مدت شکل می‌گیرد.',
        adviceEn: 'Extreme fear prevalent; historically presents attractive staged accumulation opportunities.',
      };
    }
    if (val <= 44) {
      return {
        labelFa: 'ترس و احتیاط (Fear)',
        labelEn: 'Fear',
        colorClass: 'text-orange-600 dark:text-orange-400',
        badgeBg: isDark ? 'bg-orange-950/60 border-orange-500/40 text-orange-300' : 'bg-orange-50 border-orange-200 text-orange-700',
        adviceFa: 'فضای محتاطانه در میان معامله‌گران؛ واکنش به سطوح حمایتی پرایس‌اکشن کلیدی است.',
        adviceEn: 'Cautious sentiment; monitor strong price-action reaction at major support levels.',
      };
    }
    if (val <= 55) {
      return {
        labelFa: 'خنثی و تعادل (Neutral)',
        labelEn: 'Neutral',
        colorClass: 'text-amber-600 dark:text-amber-400',
        badgeBg: isDark ? 'bg-amber-950/50 border-amber-500/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700',
        adviceFa: 'موازنه میان خریداران و فروشندگان؛ شکست سطوح رنج تعیین‌کننده جهت موج بعدی است.',
        adviceEn: 'Equilibrium between buyers and sellers; watch for range breakout direction.',
      };
    }
    if (val <= 75) {
      return {
        labelFa: 'طمع و هیجان خرید (Greed)',
        labelEn: 'Greed',
        colorClass: 'text-emerald-600 dark:text-emerald-400',
        badgeBg: isDark ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700',
        adviceFa: 'مومنتوم صعودی پرقدرت؛ پیشنهاد می‌شود با حد ضرر متحرک (Trailing Stop-Loss) همراه شوید.',
        adviceEn: 'Strong upward momentum; trailing stop-loss is recommended to protect profits.',
      };
    }
    return {
      labelFa: 'طمع شدید (Extreme Greed)',
      labelEn: 'Extreme Greed',
      colorClass: 'text-green-500 dark:text-green-300',
      badgeBg: isDark ? 'bg-green-950/60 border-green-500/40 text-green-300' : 'bg-green-50 border-green-200 text-green-700',
      adviceFa: 'هیجان خرید افراطی؛ احتمال اصلاح‌های نوسانی و فلاش کرش وجود دارد، سیو سود هوشمندانه الزامی است.',
      adviceEn: 'Excessive market euphoria; heightened risk of sudden pullbacks, consider taking partial profits.',
    };
  };

  const val = fng ? fng.value : 51;
  const meta = getSentimentMeta(val);

  // Compare today vs yesterday
  const prevVal = fng?.previousClose ?? val;
  const diffYesterday = val - prevVal;

  const currentSymbol = (coin?.symbol || 'BTC').toUpperCase();
  const timesRefreshed = refreshedSymbols[currentSymbol] || 0;
  const freeRefreshExhausted = !isVipActive && timesRefreshed >= 1;

  return (
    <div
      className={`rounded-3xl p-4 sm:p-5 border transition-all shadow-md flex flex-col gap-3.5 relative overflow-hidden w-full ${
        isDark
          ? 'bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-slate-950/90 border-slate-800 text-slate-100'
          : 'bg-gradient-to-b from-white via-slate-50/50 to-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Ambient Accent Line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 via-emerald-500 to-cyan-500" />

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800/70">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-bold shrink-0 shadow-sm">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold truncate flex items-center gap-1.5">
                <span>
                  {lang === 'fa'
                    ? `شاخص ترس و طمع ${coin?.nameFa || coin?.name || currentSymbol}`
                    : `${coin?.name || currentSymbol} Fear & Greed Index`}
                </span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-semibold">
                {lang === 'fa' ? `اختصاصی ${currentSymbol}` : `Coin: ${currentSymbol}`}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {lang === 'fa'
                ? `سنجش زنده مومنتوم، جو روانی و تمایلات معامله‌گران برای ارز ${coin?.nameFa || coin?.name}`
                : `Live sentiment, psychology, and trading momentum for ${coin?.name || currentSymbol}`}
            </p>
          </div>
        </div>

        {/* Right Header Badges & Actions */}
        <div className="flex items-center gap-2 flex-wrap sm:justify-end">
          {/* VIP or Quota Status Pill */}
          {isVipActive ? (
            <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === 'fa' ? 'VIP فعال: بروزرسانی نامحدود' : 'VIP Active: Unlimited'}</span>
            </span>
          ) : (
            <span
              className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-medium flex items-center gap-1 border transition-all ${
                freeRefreshExhausted
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                {lang === 'fa'
                  ? `سهمیه برای ${currentSymbol}: ۱/۱ رایگان`
                  : `Quota for ${currentSymbol}: 1/1 Free`}
              </span>
            </span>
          )}

          {/* 13. Transparency & Formula Button */}
          <button
            onClick={() => setShowFormulaModal(true)}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              isDark
                ? 'bg-slate-800/80 hover:bg-slate-750 border-cyan-500/30 text-cyan-300'
                : 'bg-cyan-50 hover:bg-cyan-100 border-cyan-300 text-cyan-800'
            }`}
            title={lang === 'fa' ? 'شفافیت و فرمول محاسبه شاخص دیدبان' : 'Formula & Methodology'}
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{lang === 'fa' ? 'فرمول شاخص' : 'Formula'}</span>
          </button>

          {/* Info Tooltip Button */}
          <button
            onClick={() => setShowTooltip(!showTooltip)}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title={lang === 'fa' ? 'درباره شاخص' : 'About Index'}
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleManualRefreshClick}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              isVipActive
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-400 hover:opacity-90'
                : freeRefreshExhausted
                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
                : 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/25'
            }`}
            title={
              freeRefreshExhausted
                ? lang === 'fa'
                  ? 'سهمیه رایگان مصرف شده - نیازمند اشتراک VIP'
                  : 'Free quota used - VIP required'
                : lang === 'fa'
                ? 'بروزرسانی شاخص'
                : 'Refresh Index'
            }
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>
              {isLoading
                ? lang === 'fa'
                  ? 'در حال دریافت...'
                  : 'Refreshing...'
                : freeRefreshExhausted
                ? lang === 'fa'
                  ? 'بروزرسانی (نیازمند VIP)'
                  : 'Refresh (VIP)'
                : lang === 'fa'
                ? 'بروزرسانی'
                : 'Refresh'}
            </span>
            {freeRefreshExhausted && <Lock className="w-3 h-3 text-amber-500" />}
          </button>
        </div>
      </div>

      {/* Auto-refreshed Toast Notification */}
      {autoRefreshedToast && (
        <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              {lang === 'fa'
                ? `شاخص ترس و طمع به‌طور خودکار برای نماد ${currentSymbol} بروزرسانی شد.`
                : `Fear & Greed index automatically updated for ${currentSymbol}.`}
            </span>
          </div>
          <span className="text-[10px] font-mono opacity-80">
            {lang === 'fa' ? 'سهمیه ۱/۱ فعال' : '1/1 Active'}
          </span>
        </div>
      )}

      {/* VIP Upgrade Banner (Triggers if user requests refresh beyond the 1 free auto-update) */}
      {showVipBanner && !isVipActive && (
        <div
          className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-200 ${
            isDark
              ? 'bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/30 border-amber-500/40 text-amber-100'
              : 'bg-gradient-to-r from-amber-50 via-white to-amber-50 border-amber-300 text-amber-900 shadow-sm'
          }`}
        >
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <Crown className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                <span>{t.vipRefreshRequiredTitle}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  VIP
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                {t.vipRefreshRequiredDesc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={() => setShowVipBanner(false)}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 cursor-pointer"
            >
              {lang === 'fa' ? 'انصراف' : 'Dismiss'}
            </button>
            <button
              onClick={onOpenVipModal}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md hover:opacity-95 transition-all cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>{t.buyVipSubscription}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Info Tooltip Overlay */}
      {showTooltip && (
        <div
          className={`p-3 rounded-2xl border text-xs shadow-xl animate-in fade-in duration-150 ${
            isDark ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between font-bold mb-1.5">
            <span>{lang === 'fa' ? 'درباره شاخص ترس و طمع:' : 'About Fear & Greed Index:'}</span>
            <button
              onClick={() => setShowTooltip(false)}
              className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-[11px] leading-relaxed opacity-90 mb-2">
            {lang === 'fa'
              ? 'این شاخص احساسات کلی بازار رمزارزها را از ۰ (ترس مطلق) تا ۱۰۰ (طمع مطلق) ارزیابی می‌کند. بررسی همزمان این شاخص در کنار پرایس‌اکشن و نمودار تومانی به تشخیص کف‌ها و سقف‌های تله‌ای کمک شایانی می‌کند.'
              : 'Measures market emotions from 0 (Extreme Fear) to 100 (Extreme Greed) based on volatility, volume, social buzz, dominance, and search trends.'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[10px] font-mono">
            <span className="p-1 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-center">
              0-24: {lang === 'fa' ? 'ترس شدید' : 'Extreme Fear'}
            </span>
            <span className="p-1 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-center">
              25-44: {lang === 'fa' ? 'ترس' : 'Fear'}
            </span>
            <span className="p-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-center">
              45-55: {lang === 'fa' ? 'خنثی' : 'Neutral'}
            </span>
            <span className="p-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-center">
              56-75: {lang === 'fa' ? 'طمع' : 'Greed'}
            </span>
            <span className="p-1 rounded bg-green-500/10 text-green-600 dark:text-green-300 border border-green-500/20 text-center col-span-2 sm:col-span-1">
              76-100: {lang === 'fa' ? 'طمع شدید' : 'Extreme Greed'}
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Left Score & Gauge, Right Insights & Comparisons */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch">
        {/* Left Column (5 cols): Numeric Score & Multi-Segment Gauge */}
        <div
          className={`md:col-span-5 p-3.5 rounded-2xl border flex flex-col justify-between gap-3 ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl sm:text-4xl font-black font-mono tracking-tight persian-num num-bold ${meta.colorClass}`}>
                {lang === 'fa' ? formatPersianDigits(val) : val}
              </span>
              <span className="text-xs font-mono text-slate-400">
                / {lang === 'fa' ? formatPersianDigits(100) : '100'}
              </span>
            </div>

            <div
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${meta.badgeBg}`}
            >
              {lang === 'fa' ? meta.labelFa : meta.labelEn}
            </div>
          </div>

          {/* Multi-Segment Color Gauge */}
          <div className="w-full flex flex-col gap-1.5 pt-1">
            <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative flex shadow-inner">
              <div className="w-1/4 bg-rose-500 h-full" title="0-24 Extreme Fear" />
              <div className="w-1/5 bg-orange-400 h-full" title="25-44 Fear" />
              <div className="w-[11%] bg-amber-400 h-full" title="45-55 Neutral" />
              <div className="w-1/5 bg-emerald-500 h-full" title="56-75 Greed" />
              <div className="flex-1 bg-green-400 h-full" title="76-100 Extreme Greed" />

              {/* Pin Indicator */}
              <div
                className="absolute top-0 bottom-0 w-3 -ml-1.5 bg-white shadow-md border-2 border-slate-900 dark:border-slate-100 rounded-full transition-all duration-500"
                style={{
                  left: `${Math.min(98, Math.max(2, val))}%`,
                }}
              />
            </div>

            <div className="flex justify-between text-[10px] font-mono text-slate-400 px-0.5 persian-num num-bold">
              <span>{lang === 'fa' ? '۰ ترس شدید' : '0 Fear'}</span>
              <span>{lang === 'fa' ? '۵۰ خنثی' : '50 Neutral'}</span>
              <span>{lang === 'fa' ? '۱۰۰ طمع شدید' : '100 Greed'}</span>
            </div>
          </div>

          {/* Yesterday & Last Week Comparisons */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">
                {lang === 'fa' ? 'دیروز:' : 'Yesterday:'}
              </span>
              <div className="flex items-center gap-1 font-mono font-bold persian-num num-bold">
                <span>{lang === 'fa' ? formatPersianDigits(prevVal) : prevVal}</span>
                {diffYesterday > 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                ) : diffYesterday < 0 ? (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                ) : (
                  <Minus className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">
                {lang === 'fa' ? 'هفته قبل:' : 'Last week:'}
              </span>
              <span className="font-mono font-bold persian-num num-bold">
                {lang === 'fa' ? formatPersianDigits(fng?.previousWeek ?? prevVal) : (fng?.previousWeek ?? prevVal)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Psychological Takeaways & Correlation Insight */}
        <div
          className={`md:col-span-7 p-3.5 rounded-2xl border flex flex-col justify-between gap-2.5 ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>{lang === 'fa' ? 'تحلیل روانشناسی رفتار معامله‌گران' : 'Behavioral & Trader Psychology'}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {lang === 'fa' ? 'منبع: آلترناتیو' : 'Alternative.me'}
            </span>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
            {lang === 'fa' ? meta.adviceFa : meta.adviceEn}
          </p>

          <div
            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-[11px] ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <span className="text-slate-500 dark:text-slate-400">
              {lang === 'fa'
                ? `همبستگی با نماد ${coin.nameFa || coin.name}:`
                : `Correlation with ${coin.symbol}:`}
            </span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {coin.change24h >= 0 ? `+${coin.change24h}%` : `${coin.change24h}%`} (۲۴H)
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1">
            <span>
              {lang === 'fa'
                ? '💡 راهنمای حرفه‌ای: در زمان طمع شدید از خرید در سقف پرهیز کنید.'
                : '💡 Pro tip: Avoid chasing pumps when extreme greed peaks.'}
            </span>
            {!isVipActive && (
              <button
                onClick={onOpenVipModal}
                className="text-amber-600 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Crown className="w-3 h-3" />
                <span>{lang === 'fa' ? 'ارتقا به VIP' : 'VIP'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 13. Transparency & Scientific Formula Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all text-right ${
              isDark
                ? 'bg-slate-900 border-cyan-500/30 text-slate-100 shadow-cyan-950/30'
                : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/80'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-indigo-950/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    {lang === 'fa'
                      ? 'شفافیت و فرمول شاخص ترس و طمع دیدبان'
                      : 'DIDBAN Fear & Greed Index Methodology'}
                  </h3>
                  <p className="text-[11px] text-cyan-200/70 mt-0.5">
                    {lang === 'fa'
                      ? `نحوه محاسبه سنتیمنت اختصاصی برای ${coin?.nameFa || coin?.name}`
                      : `Dynamic sentiment calculation for ${coin?.name || currentSymbol}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="p-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 leading-relaxed text-cyan-100">
                <span className="font-bold block text-cyan-300 mb-1">
                  {lang === 'fa' ? 'چرا شاخص اختصاصی دیدبان؟' : 'Why DIDBAN Dynamic Index?'}
                </span>
                {lang === 'fa'
                  ? 'بسیاری از سایت‌ها صرفاً عدد ترس و طمع بیت‌کوین (از alternative.me) را برای همه کوین‌ها نمایش می‌دهند که در زمان رالی آلت‌کوین‌ها یا اصلاحات موضعی نادرست است. دیدبان احساسات اختصاصی هر ارز را بر پایه ۴ مؤلفه چندعاملی محاسبه می‌کند:'
                  : 'Traditional indexes only track Bitcoin sentiment. DIDBAN synthesizes individual asset metrics to accurately capture altcoin momentum, divergence, and liquidity surges:'}
              </div>

              {/* Factors Breakdown */}
              <div className="space-y-3">
                {/* Factor 1: Macro Market */}
                <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === 'fa' ? '۱. سنتیمنت مرجع کل بازار (بیت‌کوین)' : '1. Macro Market Baseline'}</span>
                    </span>
                    <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      ۴۰٪ وزن
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'fa'
                      ? 'شاخص احساسات کلی بازار رمزارزها از Alternative.me بر پایه دامیننس، نوسان بیت‌کوین و روندهای کلان.'
                      : 'Alternative.me global Bitcoin sentiment representing overall digital asset market climate.'}
                  </p>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>

                {/* Factor 2: Momentum & Volatility */}
                <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{lang === 'fa' ? '۲. شتاب مومنتوم و تغییرات ۲۴ ساعته' : '2. Price Momentum & Velocity'}</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      ۳۵٪ وزن
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'fa'
                      ? `نرخ رشد، انحراف معیار و شتاب شکست سطوح قیمتی در مقایسه با میانگین متحرک ۲۰ روزه رمزارز ${currentSymbol}.`
                      : `24h price displacement, standard deviation, and relative velocity vs 20 EMA for ${currentSymbol}.`}
                  </p>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: '35%' }} />
                  </div>
                </div>

                {/* Factor 3: Volume & Order Book */}
                <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{lang === 'fa' ? '۳. نوسان حجم و عمق نقدینگی' : '3. Volume Surge & Liquidity'}</span>
                    </span>
                    <span className="font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                      ۱۵٪ وزن
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'fa'
                      ? 'بررسی افزایش حجم معاملات در صرافی‌های بایننس و کوین‌گکو نسبت به روزهای قبل.'
                      : 'Comparing 24h trading volume surges against baseline liquidity ratios on Binance.'}
                  </p>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-400 h-full rounded-full" style={{ width: '15%' }} />
                  </div>
                </div>

                {/* Factor 4: Social Sentiment */}
                <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>{lang === 'fa' ? '۴. ترندهای شبکه‌های اجتماعی و اخبار' : '4. Social Sentiment & Trends'}</span>
                    </span>
                    <span className="font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                      ۱۰٪ وزن
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'fa'
                      ? 'پایش نرخ تکرار و توجه معامله‌گران در جستجوها و اخبار ارزهای دیجیتال.'
                      : 'Measuring trader search velocity, mentions, and on-chain discussion spikes.'}
                  </p>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-400 h-full rounded-full" style={{ width: '10%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
              <span>{lang === 'fa' ? 'الگوریتم اختصاصی دیدبان — بروزرسانی بلادرنگ' : 'DIDBAN Proprietary Algorithm'}</span>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer transition-colors"
              >
                {lang === 'fa' ? 'متوجه شدم' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

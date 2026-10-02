import React from 'react';
import {
  CandlestickChart,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight,
  ArrowLeft,
  Info,
} from 'lucide-react';
import {
  CandlestickPrediction24h,
  CryptoCoin,
  Candle,
  Language,
  Theme,
  TechnicalAnalysisResult,
} from '../types';
import { ensureCandlestickPrediction } from '../utils/candlestickAnalysis';

interface CandlestickPredictionCardProps {
  coin: CryptoCoin;
  candles?: Candle[];
  analysis?: TechnicalAnalysisResult | null;
  lang: Language;
  theme: Theme;
}

export const CandlestickPredictionCard: React.FC<CandlestickPredictionCardProps> = ({
  coin,
  candles = [],
  analysis = null,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';
  const prediction: CandlestickPrediction24h = ensureCandlestickPrediction(
    analysis,
    candles,
    coin
  );

  const currentPrice = coin.price || 100;
  const minPrice = prediction.minPrice;
  const maxPrice = prediction.maxPrice;
  const mostLikely = prediction.mostLikelyPrice;

  // Calculate percentage changes relative to current price
  const minDelta = Number((((minPrice - currentPrice) / currentPrice) * 100).toFixed(2));
  const maxDelta = Number((((maxPrice - currentPrice) / currentPrice) * 100).toFixed(2));
  const likelyDelta = Number((((mostLikely - currentPrice) / currentPrice) * 100).toFixed(2));

  // Determine where current price is inside the predicted min..max range (0% to 100%)
  const span = Math.max(0.000001, maxPrice - minPrice);
  const positionPct = Math.max(
    5,
    Math.min(95, Math.round(((currentPrice - minPrice) / span) * 100))
  );
  const likelyPositionPct = Math.max(
    5,
    Math.min(95, Math.round(((mostLikely - minPrice) / span) * 100))
  );

  const isBullish = prediction.patternBias === 'BULLISH';
  const isBearish = prediction.patternBias === 'BEARISH';

  const formatP = (val: number) => {
    if (val >= 1000) return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (val >= 1) return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    return val.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  };

  return (
    <div
      className={`rounded-3xl p-4 sm:p-5 border transition-all shadow-md flex flex-col gap-4 relative overflow-hidden ${
        isDark
          ? 'bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-slate-950/90 border-slate-800'
          : 'bg-gradient-to-b from-white via-slate-50/50 to-white border-slate-200'
      }`}
    >
      {/* Ambient Top Glow */}
      <div
        className={`absolute top-0 inset-x-0 h-1 transition-all ${
          isBullish
            ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500'
            : isBearish
            ? 'bg-gradient-to-r from-rose-500 via-orange-400 to-amber-500'
            : 'bg-gradient-to-r from-cyan-500 via-blue-400 to-indigo-500'
        }`}
      />

      {/* Header with Pattern Badge & Reliability */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              isBullish
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : isBearish
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                : 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
            }`}
          >
            <CandlestickChart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>
                  {lang === 'fa'
                    ? 'پیش‌بینی بازه قیمتی ۲۴ ساعت آینده'
                    : '24h Candlestick Predicted Price Range'}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
                  ۲۴H
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>{lang === 'fa' ? 'مبنا:' : 'Basis:'}</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {lang === 'fa' ? prediction.primaryPatternNameFa : prediction.primaryPatternNameEn}
              </span>
            </p>
          </div>
        </div>

        {/* Pattern Badges */}
        <div className="flex items-center gap-2 flex-wrap sm:justify-end">
          {/* Bias Badge */}
          <span
            className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 border ${
              isBullish
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                : isBearish
                ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
            }`}
          >
            {isBullish ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : isBearish ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            <span>
              {isBullish
                ? lang === 'fa'
                  ? 'جهش صعودی (Bullish)'
                  : 'Bullish Bias'
                : isBearish
                ? lang === 'fa'
                  ? 'اصلاحی (Bearish)'
                  : 'Bearish Bias'
                : lang === 'fa'
                ? 'خنثی و رنج (Neutral)'
                : 'Neutral Bias'}
            </span>
          </span>

          {/* Reliability / Confidence */}
          <span
            className={`px-2 py-1 rounded-xl text-[11px] font-mono font-semibold flex items-center gap-1 border ${
              isDark
                ? 'bg-slate-800/80 text-slate-300 border-slate-700'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
            <span>
              {lang === 'fa' ? 'اعتبار الگو:' : 'Reliability:'} {prediction.probabilityPct}%
            </span>
          </span>
        </div>
      </div>

      {/* Main 3 Target Cards (Floor, Likely Close, Ceiling) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* 1. 24h Floor (Min Price) */}
        <div
          className={`p-3 rounded-2xl border flex flex-col justify-between ${
            isDark ? 'bg-slate-950/70 border-rose-500/25' : 'bg-rose-50/60 border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1">
              <span>{lang === 'fa' ? 'کف حمایتی ۲۴س (Floor)' : '24h Support Floor'}</span>
            </span>
            <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">
              {minDelta > 0 ? `+${minDelta}%` : `${minDelta}%`}
            </span>
          </div>
          <div className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-slate-100">
            ${formatP(minPrice)}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'fa' ? 'حداقل قیمت تخمینی براساس سایه کف' : 'Estimated lower shadow boundary'}
          </div>
        </div>

        {/* 2. Most Likely Target Close */}
        <div
          className={`p-3 rounded-2xl border flex flex-col justify-between relative shadow-sm ${
            isDark
              ? 'bg-cyan-950/30 border-cyan-500/40 ring-1 ring-cyan-500/20'
              : 'bg-cyan-50/70 border-cyan-300 ring-1 ring-cyan-400/20'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-bold text-cyan-800 dark:text-cyan-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>{lang === 'fa' ? 'قیمت محتمل ۲۴س (Target)' : 'Most Likely 24h Target'}</span>
            </span>
            <span className="font-mono text-cyan-700 dark:text-cyan-400 font-bold">
              {likelyDelta > 0 ? `+${likelyDelta}%` : `${likelyDelta}%`}
            </span>
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-cyan-700 dark:text-cyan-300">
            ${formatP(mostLikely)}
          </div>
          <div className="text-[10px] text-cyan-700 dark:text-cyan-400/90 mt-1">
            {lang === 'fa' ? 'تراز میانه مورد انتظار خریداران' : 'Expected weighted target level'}
          </div>
        </div>

        {/* 3. 24h Ceiling (Max Price) */}
        <div
          className={`p-3 rounded-2xl border flex flex-col justify-between ${
            isDark ? 'bg-slate-950/70 border-emerald-500/25' : 'bg-emerald-50/60 border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <span>{lang === 'fa' ? 'سقف مقاومتی ۲۴س (Ceiling)' : '24h Resistance Ceiling'}</span>
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              {maxDelta > 0 ? `+${maxDelta}%` : `${maxDelta}%`}
            </span>
          </div>
          <div className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-slate-100">
            ${formatP(maxPrice)}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'fa' ? 'حداکثر جهش تخمینی براساس مقاومت' : 'Estimated breakout ceiling limit'}
          </div>
        </div>
      </div>

      {/* Visual Interactive Range Spectrum Bar */}
      <div
        className={`p-3.5 rounded-2xl border flex flex-col gap-2.5 ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1">
            <span>{lang === 'fa' ? 'طیف نوسان و جایگاه قیمت فعلی:' : 'Price Volatility Spectrum:'}</span>
            <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
              ${formatP(currentPrice)}
            </span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {lang === 'fa' ? 'دامنه نوسان ۲۴س:' : '24h Bandwidth:'} ±{prediction.volatilityPct}%
          </span>
        </div>

        {/* The Range Gradient Bar */}
        <div className="relative pt-6 pb-2">
          {/* Current Price Pin Marker */}
          <div
            className="absolute top-0 flex flex-col items-center -translate-x-1/2 transition-all duration-500 z-10"
            style={{ left: `${positionPct}%` }}
          >
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white shadow-xs whitespace-nowrap">
              {lang === 'fa' ? 'قیمت فعلی' : 'Current'}
            </span>
            <div className="w-0.5 h-2 bg-blue-600"></div>
          </div>

          {/* Likely Target Pin Marker (Below) */}
          <div
            className="absolute -bottom-1 flex flex-col items-center -translate-x-1/2 transition-all duration-500 z-10"
            style={{ left: `${likelyPositionPct}%` }}
          >
            <div className="w-0.5 h-2 bg-cyan-400"></div>
            <span className="text-[9px] font-mono font-bold px-1 py-0.5 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 whitespace-nowrap">
              {lang === 'fa' ? 'تارگت' : 'Target'}
            </span>
          </div>

          {/* Multi-gradient Bar */}
          <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative shadow-inner">
            <div className="h-full w-full bg-gradient-to-r from-rose-500 via-amber-400 via-cyan-400 to-emerald-500 opacity-90" />
          </div>
        </div>

        {/* Footnotes for Floor / Ceiling */}
        <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 px-0.5 pt-1">
          <span>
            {lang === 'fa' ? 'کف:' : 'Floor:'} ${formatP(minPrice)}
          </span>
          <span>
            {lang === 'fa' ? 'سقف:' : 'Ceiling:'} ${formatP(maxPrice)}
          </span>
        </div>
      </div>

      {/* Candlestick Anatomy Insight & Buyer vs Seller Pressure */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
        {/* Left (7 cols): Anatomy Narrative */}
        <div
          className={`md:col-span-7 p-3.5 rounded-2xl border flex flex-col justify-between gap-2 ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>
              {lang === 'fa'
                ? 'تحلیل آناتومی کندل و رفتار سایه‌ها (Wick Rejection)'
                : 'Candle Anatomy & Shadow Analysis'}
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
            {lang === 'fa' ? prediction.candleInsightFa : prediction.candleInsightEn}
          </p>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" />
            <span>
              {lang === 'fa'
                ? 'پیشنهاد: ورود متناسب با محدوده کف و ثبت حد ضرر زیر پایین‌ترین سایه کندل قبلی.'
                : 'Recommendation: Set tactical stop-loss immediately below the previous lower shadow.'}
            </span>
          </div>
        </div>

        {/* Right (5 cols): Buyer vs Seller Pressure */}
        <div
          className={`md:col-span-5 p-3.5 rounded-2xl border flex flex-col justify-between gap-2.5 ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span>{lang === 'fa' ? 'موازنه قدرت خریدار و فروشنده' : 'Buyer vs Seller Ratio'}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">۲۴H</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono font-bold">
              <span className="text-emerald-700 dark:text-emerald-400">
                {lang === 'fa' ? 'خریداران:' : 'Buyers:'} {prediction.buyerSellerPressure.buyerPct}%
              </span>
              <span className="text-rose-700 dark:text-rose-400">
                {lang === 'fa' ? 'فروشندگان:' : 'Sellers:'} {prediction.buyerSellerPressure.sellerPct}%
              </span>
            </div>

            {/* Split Bar */}
            <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${prediction.buyerSellerPressure.buyerPct}%` }}
                title={`Buyers: ${prediction.buyerSellerPressure.buyerPct}%`}
              />
              <div
                className="bg-rose-500 h-full transition-all duration-500"
                style={{ width: `${prediction.buyerSellerPressure.sellerPct}%` }}
                title={`Sellers: ${prediction.buyerSellerPressure.sellerPct}%`}
              />
            </div>
          </div>

          <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
            {prediction.buyerSellerPressure.buyerPct >= 55
              ? lang === 'fa'
                ? '✅ تقاضای خرید بر عرضه غلبه دارد و پتانسیل رسیدن به سقف مقاومتی بالاتر است.'
                : '✅ Buyer demand dominates supply, supporting momentum towards ceiling.'
              : prediction.buyerSellerPressure.buyerPct <= 45
              ? lang === 'fa'
                ? '⚠️ فشار فروش ملایم وجود دارد؛ در انتظار تکمیل تثبیت در کف حمایتی باشید.'
                : '⚠️ Mild selling pressure; await bottom confirmation near support.'
              : lang === 'fa'
              ? '⚖️ تعادل نسبی عرضه و تقاضا؛ آمادگی برای شکست محدوده رنج.'
              : '⚖️ Supply-demand equilibrium; prepare for range breakout.'}
          </div>
        </div>
      </div>
    </div>
  );
};

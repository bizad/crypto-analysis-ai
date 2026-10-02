import React, { useState } from 'react';
import {
  HelpCircle,
  Search,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from 'lucide-react';
import { Language, Theme } from '../types';
import { translations } from '../utils/translations';

interface GuideSectionProps {
  lang: Language;
  theme: Theme;
}

export const GuideSection: React.FC<GuideSectionProps> = ({ lang, theme }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const t = translations[lang];
  const isDark = theme === 'dark';

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 border transition-all shadow-lg ${
        isDark
          ? 'bg-slate-900/90 border-cyan-500/30 text-slate-100 shadow-cyan-950/20'
          : 'bg-white border-cyan-300 text-slate-900 shadow-slate-200/60'
      }`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              isDark
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-cyan-100 text-cyan-700 border border-cyan-200'
            }`}
          >
            <Lightbulb className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-cyan-500 dark:text-cyan-400 flex items-center gap-1.5">
                <span>{t.guideTitle}</span>
              </h3>
              <span
                className={`text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-full ${
                  isDark
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                }`}
              >
                {lang === 'fa' ? 'راهنما و نکات ضروری' : 'Quick Guide'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {t.guideSubtitle}
            </p>
          </div>
        </div>

        {/* Expand / Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            isDark
              ? 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
          title={isExpanded ? (lang === 'fa' ? 'بستن راهنما' : 'Collapse') : (lang === 'fa' ? 'نمایش راهنما' : 'Expand')}
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Guide Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-800/40 space-y-3.5">
          {/* Exact User Prompt Highlight Box */}
          <div
            className={`p-4 rounded-xl border text-sm sm:text-base leading-relaxed ${
              isDark
                ? 'bg-cyan-950/30 border-cyan-500/20 text-cyan-100'
                : 'bg-cyan-50/70 border-cyan-200 text-cyan-950'
            }`}
          >
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-medium leading-relaxed">
                  {lang === 'fa' ? (
                    <>
                      برای دریافت اطلاعات دقیق ارزها از{' '}
                      <strong className="text-cyan-400 font-bold underline decoration-cyan-400/40">نام انگلیسی یا اختصاری ارزها</strong>{' '}
                      در بخش جستجو استفاده کنید. برای دریافت اطلاعات دقیق و نمودار دقیق از دکمه‌های{' '}
                      <strong className="text-emerald-400 font-bold">اجرای تحلیل مجدد</strong> و{' '}
                      <strong className="text-amber-400 font-bold">بروزرسانی نمودار</strong> استفاده کنید.
                    </>
                  ) : (
                    <>
                      To retrieve accurate cryptocurrency data, use the{' '}
                      <strong className="text-cyan-400 font-bold">English name or ticker symbol</strong>{' '}
                      in the search box. To receive accurate live data and precise charts, use the{' '}
                      <strong className="text-emerald-400 font-bold">"Run Fresh Analysis"</strong> and{' '}
                      <strong className="text-amber-400 font-bold">"Refresh Chart"</strong> buttons.
                    </>
                  )}
                </p>

                {/* Important Fundamental Refresh Notice Requested by User */}
                <div
                  className={`p-2.5 rounded-lg border text-xs sm:text-sm font-semibold flex items-center gap-2 ${
                    isDark
                      ? 'bg-blue-950/50 border-blue-500/30 text-blue-200'
                      : 'bg-blue-50 border-blue-200 text-blue-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    {lang === 'fa'
                      ? 'نکته مهم: برای بخش تحلیل فاندامنتال، برای هر ارز دکمه «بروزرسانی تحلیل فاندامنتال» هم باید جداگانه زده بشه تا آخرین وضعیت توکنومیکس، آن‌چین و احساسات اخبار اختصاصی همان ارز استخراج شود.'
                      : 'Important Note: In the Fundamental Analysis section, click the separate "Refresh Fundamental" button for each coin to retrieve on-chain data, tokenomics, and dedicated news sentiment.'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div
              className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-start gap-3 ${
                isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <Search className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-200 dark:text-slate-100 font-bold mb-1 text-sm sm:text-base">
                  {lang === 'fa' ? '۱. جستجوی نماد انگلیسی' : '1. English Symbol Search'}
                </strong>
                <span className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {lang === 'fa'
                    ? 'مثال: تایپ BTC، ETH، SOL، SUI، TON یا NOT جهت فراخوانی مستقیم داده‌های CoinMarketCap'
                    : 'Example: Type BTC, ETH, SOL, SUI, TON, or NOT for direct CoinMarketCap telemetry'}
                </span>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-start gap-3 ${
                isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <RefreshCw className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-200 dark:text-slate-100 font-bold mb-1 text-sm sm:text-base">
                  {lang === 'fa' ? '۲. هماهنگ‌سازی چارت' : '2. Real-Time Chart Sync'}
                </strong>
                <span className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {lang === 'fa'
                    ? 'دکمه «بروزرسانی نمودار» در بالای چارت دلاری و تومانی جهت بارگذاری کندل‌های لحظه‌ای.'
                    : 'Use "Refresh Chart" on candlesticks and "Run Fresh Analysis" on the coin card to update.'}
                </span>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-start gap-3 ${
                isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-200 dark:text-slate-100 font-bold mb-1 text-sm sm:text-base">
                  {lang === 'fa' ? '۳. بروزرسانی فاندامنتال مجزا' : '3. Fundamental Refresh'}
                </strong>
                <span className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {lang === 'fa'
                    ? 'برای هر ارز دکمه بروزرسانی فاندامنتال را جداگانه بزنید تا توکنومیکس و اخبار اختصاصی آن تحلیل شود.'
                    : 'Click "Refresh Fundamental" separately for each coin to trigger custom on-chain analysis.'}
                </span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

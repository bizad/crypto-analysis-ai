import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Percent,
  Check,
  Copy,
  Sparkles,
  Shield,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Wallet,
  Headphones,
  BarChart3,
  Bell,
  Cpu,
  TrendingUp,
} from 'lucide-react';
import { Language, Theme } from '../types';
import { defaultExchanges, ExchangeAd } from '../data/exchanges';

interface ExchangeAdsSectionProps {
  lang: Language;
  theme: Theme;
  onOpenContact?: () => void;
}

export const ExchangeAdsSection: React.FC<ExchangeAdsSectionProps> = ({
  lang,
  theme,
  onOpenContact,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const isDark = theme === 'dark';
  const isRtl = lang === 'fa';

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  return (
    <div className="flex flex-col gap-5 sm:gap-6 w-full">
      {/* =======================================================================
          MAIN EXCHANGES SECTION (تحلیلات و صرافی‌های برتر)
          ======================================================================= */}
      <section
        id="section-top-exchanges"
        className="relative w-full rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-[#070e24] via-[#09142e] to-[#060b18] p-4 sm:p-6 md:p-7 shadow-2xl shadow-cyan-950/40 overflow-hidden"
      >
        {/* Ambient background glows */}
        <div className="absolute top-0 right-1/4 w-96 h-36 bg-cyan-500/5 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-96 h-36 bg-purple-500/5 blur-3xl pointer-events-none rounded-full" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 pb-5 border-b border-cyan-500/15">
          {/* Right side: Icon, Title & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-950/40 shrink-0">
              <Megaphone className="w-5 h-5 text-cyan-400" />
            </div>

            <div className="text-right">
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {lang === 'fa' ? 'تحلیلات و صرافی‌های برتر' : 'Top Analyses & Recommended Exchanges'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
                {lang === 'fa'
                  ? 'با عضویت از طریق لینک‌های معرفی اختصاصی، از معتبرترین صرافی‌ها و پلتفرم‌های تحلیلی استفاده کنید.'
                  : 'Join via exclusive referral links to unlock maximum fee discounts and premium analytic perks.'}
              </p>
            </div>
          </div>

          {/* Left side: Verified Transparency Badge */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>
                {lang === 'fa'
                  ? 'لینک‌های معتبر با بالاترین شفافیت'
                  : 'Verified & Audited Referral Links'}
              </span>
            </div>
          </div>
        </div>

        {/* Two Featured Exchange Cards Side-by-Side (Nobitex & Tabdeal) */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          {/* ==========================================
              CARD 1: نوبیتکس (NOBITEX)
              ========================================== */}
          <div
            onClick={() => window.open('https://nobitex.ir/signup/?refcode=57DDD81', '_blank')}
            className="group relative rounded-2xl sm:rounded-3xl border border-cyan-500/25 bg-[#09142e]/90 hover:bg-[#0c1a3b] p-5 sm:p-6 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-cyan-950/50 hover:border-cyan-400/50 overflow-hidden flex flex-col justify-between"
          >
            {/* Background Bitcoin watermark silhouette */}
            <div className="absolute -left-6 -bottom-6 w-40 h-40 opacity-5 pointer-events-none text-white select-none">
              <span className="text-8xl font-black font-mono">₿</span>
            </div>

            <div>
              {/* Card Top: Special Offer Badge + Nobitex White Logo Badge */}
              <div className="flex items-center justify-between gap-3 mb-4">
                {/* White Logo Container */}
                <div className="bg-white rounded-xl px-3 py-1.5 shadow-md flex items-center justify-center h-10 w-28 shrink-0">
                  <img
                    src="/assets/nobitex-logo.svg"
                    alt="نوبیتکس"
                    className="max-h-7 max-w-full object-contain"
                    onError={(e) => {
                      // Fallback text if SVG fails
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML =
                          '<span class="text-purple-700 font-black text-sm">نوبیتکس</span>';
                      }
                    }}
                  />
                </div>

                {/* % پیشنهاد ویژه Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
                  <Percent className="w-3.5 h-3.5 shrink-0" />
                  <span>{lang === 'fa' ? 'پیشنهاد ویژه' : 'Special Offer'}</span>
                </div>
              </div>

              {/* Title & "پیشنهادی" Badge */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h4 className="text-base sm:text-lg font-black text-white">
                  {lang === 'fa' ? 'صرافی معتبر نوبیتکس' : 'Nobitex Premier Exchange'}
                </h4>
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{lang === 'fa' ? 'پیشنهادی' : 'Featured'}</span>
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
                {lang === 'fa' ? (
                  <>
                    بزرگترین صرافی داخلی، با بیشترین رمزارز و تنوع در ایران.
                    <br />
                    با کارمزدهای رقابتی، امنیت بالا و پشتیبانی سریع
                  </>
                ) : (
                  <>
                    Iran's deepest cryptocurrency liquidity with 100+ coins.
                    <br />
                    Ultra-fast banking settlements, cold storage & low fees.
                  </>
                )}
              </p>
            </div>

            {/* Feature Pills (3 in bottom area) */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-cyan-500/15">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0e1d42] border border-cyan-500/20 text-cyan-200 text-xs font-medium">
                <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{lang === 'fa' ? 'واریز و برداشت شتابی آنی' : 'Instant Bank Settlement'}</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0e1d42] border border-cyan-500/20 text-cyan-200 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{lang === 'fa' ? 'احراز هویت هوشمند سریع' : 'Smart Automated KYC'}</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0e1d42] border border-cyan-500/20 text-cyan-200 text-xs font-medium">
                <Wallet className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{lang === 'fa' ? 'کیف پول امن سرد' : 'Secure Cold Wallet'}</span>
              </div>
            </div>
          </div>

          {/* ==========================================
              CARD 2: تبدیل (TABDEAL)
              ========================================== */}
          <div
            onClick={() => window.open('https://tabdeal.org/auth/register-req?refcode=8v6f3l', '_blank')}
            className="group relative rounded-2xl sm:rounded-3xl border border-cyan-500/25 bg-[#09142e]/90 hover:bg-[#0c1a3b] p-5 sm:p-6 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-cyan-950/50 hover:border-cyan-400/50 overflow-hidden flex flex-col justify-between"
          >
            {/* Background Candlestick chart silhouette */}
            <div className="absolute -left-6 -bottom-6 w-40 h-40 opacity-5 pointer-events-none select-none flex items-end">
              <div className="w-3 h-20 bg-emerald-400 mx-1" />
              <div className="w-3 h-28 bg-emerald-400 mx-1" />
              <div className="w-3 h-14 bg-rose-400 mx-1" />
              <div className="w-3 h-32 bg-emerald-400 mx-1" />
            </div>

            <div>
              {/* Card Top: Badge + Tabdeal White Logo Badge */}
              <div className="flex items-center justify-between gap-3 mb-4">
                {/* White Logo Container */}
                <div className="bg-white rounded-xl px-3 py-1.5 shadow-md flex items-center justify-center h-10 w-28 shrink-0">
                  <img
                    src="/assets/tabdeal-logo.svg"
                    alt="تبدیل"
                    className="max-h-7 max-w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML =
                          '<span class="text-amber-500 font-black text-sm">تبدیل</span>';
                      }
                    }}
                  />
                </div>

                {/* % پیشنهاد ویژه Badge + معاملات تعهدی */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-cyan-200/80 font-medium hidden sm:inline">
                    {lang === 'fa' ? 'معاملات تعهدی با اهرم' : 'Margin & Leverage'}
                  </span>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
                    <Percent className="w-3.5 h-3.5 shrink-0" />
                    <span>{lang === 'fa' ? 'پیشنهاد ویژه' : 'Special Offer'}</span>
                  </div>
                </div>
              </div>

              {/* Title & "پیشنهادی" Badge */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h4 className="text-base sm:text-lg font-black text-white">
                  {lang === 'fa' ? 'صرافی معتبر تبدیل' : 'Tabdeal Advanced Exchange'}
                </h4>
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{lang === 'fa' ? 'پیشنهادی' : 'Featured'}</span>
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
                {lang === 'fa' ? (
                  <>
                    پلتفرم پیشرفته با معاملات اهرم‌دار، تریدهای حرفه‌ای و بیش از ۷۰ بازار متنوع
                    <br />
                    تنوع بی‌نظیر رمزارزها، ابزارهای حرفه‌ای، با کارمزد رقابتی و پشتیبانی ۲۴ ساعته
                  </>
                ) : (
                  <>
                    Advanced margin and leveraged trading platform with 700+ crypto pairs.
                    <br />
                    Professional OCO/Stop-Loss order execution with 24/7 dedicated support.
                  </>
                )}
              </p>
            </div>

            {/* Feature Pills (3 in bottom area) */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-cyan-500/15">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0e1d42] border border-cyan-500/20 text-cyan-200 text-xs font-medium">
                <BarChart3 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{lang === 'fa' ? 'بیش از ۷۰ بازار معاملاتی' : '70+ Active Markets'}</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0e1d42] border border-cyan-500/20 text-cyan-200 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{lang === 'fa' ? 'ابزارهای معاملاتی OCO و حد ضرر' : 'Stop-Loss & OCO Orders'}</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0e1d42] border border-cyan-500/20 text-cyan-200 text-xs font-medium">
                <Headphones className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{lang === 'fa' ? 'پشتیبانی تخصصی ۲۴ ساعته' : '24/7 Priority Support'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================================
          BOTTOM 4 HIGHLIGHT CARDS (پوشش کامل بازار، امنیت و اعتماد، اعلان‌ها، هوش مصنوعی)
          ======================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
        {/* Card 1: پوشش کامل بازار */}
        <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-[#091530] to-[#071026] shadow-lg shadow-cyan-950/20 hover:border-amber-500/40 transition-all">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
            <TrendingUp className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-right min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-amber-400 truncate">
              {lang === 'fa' ? 'پوشش کامل بازار' : 'Complete Coverage'}
            </h4>
            <p className="text-[10px] sm:text-xs text-slate-400 truncate font-medium">
              {lang === 'fa' ? 'از بیت‌کوین تا آلت‌کوین‌های آینده‌دار' : 'From BTC to promising alts'}
            </p>
          </div>
        </div>

        {/* Card 2: امنیت و اعتماد */}
        <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-[#091530] to-[#071026] shadow-lg shadow-cyan-950/20 hover:border-purple-500/40 transition-all">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-right min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-white truncate">
              {lang === 'fa' ? 'امنیت و اعتماد' : 'Security & Trust'}
            </h4>
            <p className="text-[10px] sm:text-xs text-slate-400 truncate font-medium">
              {lang === 'fa' ? 'لینک‌های معتبر و بررسی شده' : 'Audited and verified links'}
            </p>
          </div>
        </div>

        {/* Card 3: اعلان‌های لحظه‌ای */}
        <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-[#091530] to-[#071026] shadow-lg shadow-cyan-950/20 hover:border-emerald-500/40 transition-all">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
            <Bell className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-right min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-emerald-400 truncate">
              {lang === 'fa' ? 'اعلان‌های لحظه‌ای' : 'Real-time Alerts'}
            </h4>
            <p className="text-[10px] sm:text-xs text-slate-400 truncate font-medium">
              {lang === 'fa' ? 'از تغییرات مهم بازار عقب نمانید' : 'Never miss big market moves'}
            </p>
          </div>
        </div>

        {/* Card 4: تحلیل با هوش مصنوعی */}
        <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-[#091530] to-[#071026] shadow-lg shadow-cyan-950/20 hover:border-cyan-500/40 transition-all">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-sm">
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-right min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-cyan-400 truncate">
              {lang === 'fa' ? 'تحلیل با هوش مصنوعی' : 'AI-Powered Insights'}
            </h4>
            <p className="text-[10px] sm:text-xs text-slate-400 truncate font-medium">
              {lang === 'fa' ? 'دیتای بزرگ، تحلیل دقیق‌تر' : 'Big data, accurate forecasts'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

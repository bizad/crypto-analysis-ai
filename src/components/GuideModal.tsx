import React from 'react';
import {
  X,
  Lightbulb,
  Search,
  RefreshCw,
  Sparkles,
  HelpCircle,
  TrendingUp,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Mail,
} from 'lucide-react';
import { Language, Theme } from '../types';
import { translations } from '../utils/translations';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContact?: () => void;
  lang: Language;
  theme: Theme;
}

export const GuideModal: React.FC<GuideModalProps> = ({
  isOpen,
  onClose,
  onOpenContact,
  lang,
  theme,
}) => {
  if (!isOpen) return null;

  const t = translations[lang];
  const isDark = theme === 'dark';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border p-5 sm:p-6 shadow-2xl transition-all ${
          isDark
            ? 'bg-slate-900 border-cyan-500/30 text-slate-100 shadow-cyan-950/40'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-300/60'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                isDark
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
              }`}
            >
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h2
                id="guide-modal-title"
                className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2"
              >
                <span>{t.guideTitle}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {t.guideSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-5 space-y-4">
          {/* Main user requirement highlight box */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border text-sm leading-relaxed ${
              isDark
                ? 'bg-cyan-950/30 border-cyan-500/25 text-cyan-100'
                : 'bg-cyan-50 border-cyan-200 text-cyan-950'
            }`}
          >
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-cyan-500 dark:text-cyan-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-semibold text-base leading-relaxed">
                  {lang === 'fa' ? (
                    <>
                      برای دریافت اطلاعات دقیق ارزها از{' '}
                      <span className="text-cyan-600 dark:text-cyan-300 font-black underline decoration-cyan-400">
                        نام انگلیسی یا اختصاری ارزها
                      </span>{' '}
                      در بخش جستجو استفاده کنید. برای دریافت اطلاعات دقیق و نمودار دقیق از دکمه‌های{' '}
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        اجرای تحلیل مجدد
                      </span>{' '}
                      و{' '}
                      <span className="text-amber-600 dark:text-amber-400 font-bold">
                        بروزرسانی نمودار
                      </span>{' '}
                      استفاده کنید.
                    </>
                  ) : (
                    t.guideText
                  )}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                  {lang === 'fa'
                    ? 'این سامانه با اتصال مستقیم به سرورهای کوین‌مارکت‌کپ، کوین‌گکو و نوبیتکس نرخ لحظه‌ای دلار و تتر را با دقت بالا استعلام و پردازش می‌کند.'
                    : 'Real-time telemetry connects directly with premier market data feeds and live USDT order books.'}
                </p>
              </div>
            </div>
          </div>

          {/* 3 Step Practical Guide Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Step 1 */}
            <div
              className={`p-3.5 rounded-2xl border flex flex-col gap-2 ${
                isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-xs">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center font-mono">
                  1
                </div>
                <Search className="w-4 h-4" />
                <span>{lang === 'fa' ? 'جستجوی انگلیسی' : 'English Ticker'}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t.guideSearchTip}
              </p>
            </div>

            {/* Step 2 */}
            <div
              className={`p-3.5 rounded-2xl border flex flex-col gap-2 ${
                isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center font-mono">
                  2
                </div>
                <RefreshCw className="w-4 h-4" />
                <span>{lang === 'fa' ? 'بروزرسانی نمودار' : 'Sync Candlesticks'}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t.guideRefreshTip}
              </p>
            </div>

            {/* Step 3 */}
            <div
              className={`p-3.5 rounded-2xl border flex flex-col gap-2 ${
                isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs">
                <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center font-mono">
                  3
                </div>
                <Sparkles className="w-4 h-4" />
                <span>{lang === 'fa' ? 'اجرای تحلیل مجدد' : 'Trigger AI'}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t.guideAnalysisTip}
              </p>
            </div>
          </div>

          {/* Fundamental Tip */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed ${
              isDark
                ? 'bg-purple-950/20 border-purple-500/25 text-purple-200'
                : 'bg-purple-50 border-purple-200 text-purple-950'
            }`}
          >
            <Cpu className="w-5 h-5 text-purple-500 dark:text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold mb-0.5 text-purple-700 dark:text-purple-300">
                {lang === 'fa' ? 'تحلیل اختصاصی فاندامنتال:' : 'Fundamental Analysis Hint:'}
              </strong>
              <span>{t.guideFundamentalTip}</span>
            </div>
          </div>
          {/* Contact Support Banner */}
          {onOpenContact && (
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                isDark ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">
                  {lang === 'fa' ? 'سوالی دارید یا نیاز به راهنمایی بیشتری هست؟' : 'Need more help or have a question?'}
                </span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenContact();
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm transition-all"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{lang === 'fa' ? 'تماس با ما' : 'Contact'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Button */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
          >
            {lang === 'fa' ? 'متوجه شدم و بستن' : 'Got it, Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle, Info, ExternalLink, ShieldCheck, Scale, FileText } from 'lucide-react';
import { Language, Theme } from '../types';
import { translations } from '../utils/translations';

interface DisclaimerSectionProps {
  lang: Language;
  theme: Theme;
  onOpenModal?: () => void;
}

export const DisclaimerSection: React.FC<DisclaimerSectionProps> = ({ lang, theme, onOpenModal }) => {
  const t = translations[lang];
  const isDark = theme === 'dark';
  const isRtl = lang === 'fa';

  return (
    <div
      className={`rounded-3xl p-5 sm:p-7 border transition-all shadow-xl ${
        isDark
          ? 'bg-amber-950/20 border-amber-500/30 text-slate-200 shadow-amber-950/30'
          : 'bg-amber-50/70 border-amber-300 text-slate-800 shadow-amber-100'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
            isDark
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 ring-2 ring-amber-500/20'
              : 'bg-amber-200 text-amber-900 border border-amber-300 ring-2 ring-amber-300/40'
          }`}
        >
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3
                className={`text-base sm:text-xl font-black flex items-center gap-2 ${
                  isDark ? 'text-amber-300' : 'text-amber-950'
                }`}
              >
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>
                  {isRtl
                    ? 'سلب مسئولیت قانونی و منشور جامع مدیریت ریسک'
                    : 'Legal Disclaimer & Risk Management Charter'}
                </span>
              </h3>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  isDark
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-amber-200 text-amber-900'
                }`}
              >
                Risk Notice
              </span>
            </div>

            {onOpenModal && (
              <button
                onClick={onOpenModal}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-2 transition-all shrink-0 self-start sm:self-auto"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{isRtl ? 'مطالعه منشور کامل در پنجره اختصاصی' : 'Open Comprehensive Charter'}</span>
              </button>
            )}
          </div>

          <p
            className={`text-sm sm:text-base leading-relaxed ${
              isDark ? 'text-amber-200/95' : 'text-amber-950/95'
            }`}
          >
            {t.disclaimerSummary}
          </p>

          {/* Bullet Rules */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {t.disclaimerTips.map((tip, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border text-xs sm:text-sm flex items-start gap-2.5 ${
                  isDark
                    ? 'bg-slate-950/60 border-amber-500/20 text-slate-200'
                    : 'bg-white/90 border-amber-200 text-slate-800 shadow-xs'
                }`}
              >
                <CheckCircle
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    isDark ? 'text-amber-400' : 'text-amber-600'
                  }`}
                />
                <span className="leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>

          {/* Staged entry callout */}
          <div
            className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-3 mt-2 ${
              isDark ? 'bg-amber-500/10 text-amber-200 border border-amber-500/20' : 'bg-amber-100/90 text-amber-950 border border-amber-200'
            }`}
          >
            <Info className="w-5 h-5 shrink-0 text-amber-400" />
            <span className="font-medium leading-relaxed">
              {lang === 'fa'
                ? 'نکته طلایی مدیریت سرمایه: ورود به هر پوزیشن باید حتماً در چند پله قیمتی (مثلاً ۳۰٪، ۳۰٪ و ۴۰٪) انجام پذیرد تا میانگین قیمت بهینه شده و ریسک به حداقل برسد.'
                : 'Capital Management Rule: Always scale into entries in multiple staged increments (e.g. 30%, 30%, 40%) to optimize average price and minimize downside volatility.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

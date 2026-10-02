import React from 'react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  Scale,
  Percent,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Compass,
  Zap,
  Mail,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { Language, Theme } from '../types';
import { translations } from '../utils/translations';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContact?: () => void;
  lang: Language;
  theme: Theme;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({
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
      aria-labelledby="disclaimer-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className={`relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl border p-5 sm:p-7 shadow-2xl transition-all ${
          isDark
            ? 'bg-slate-900 border-amber-500/40 text-slate-100 shadow-amber-950/50'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-300/80'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                isDark
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2
                id="disclaimer-modal-title"
                className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2"
              >
                <span>{lang === 'fa' ? 'سلب مسئولیت قانونی و منشور جامع مدیریت ریسک' : 'Legal Disclaimer & Risk Management Charter'}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                {lang === 'fa'
                  ? 'قوانین، حدود اختیارات تحلیلی، پروتکل‌های ایمنی سرمایه و مسئولیت معامله‌گران'
                  : 'Platform boundaries, computational limits, safety protocols and trader responsibilities'}
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

        {/* Body Content */}
        <div className="mt-5 space-y-4 text-xs sm:text-sm">
          {/* Section 1: Non-Advisory Callout */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border leading-relaxed ${
              isDark
                ? 'bg-amber-950/30 border-amber-500/30 text-amber-100'
                : 'bg-amber-50/90 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-bold text-sm sm:text-base leading-relaxed">
                  {lang === 'fa' ? (
                    <>
                      تمامی خروجی‌های هوش مصنوعی (Google Gemini 3.8)، سطوح پیوت، نقاط ورود، اهداف سود (Take Profit) و حد ضرر (Stop Loss) صرفاً{' '}
                      <span className="text-amber-800 dark:text-amber-300 font-black underline decoration-amber-500">
                        جنبه‌ی محاسباتی، شبیه‌سازی الگوریتمی و اطلاع‌رسانی آماری
                      </span>{' '}
                      دارند و به هیچ وجه سیگنال تضمینی، مشاوره مالی، حقوقی یا سرمایه‌گذاری تلقی نمی‌شوند.
                    </>
                  ) : (
                    t.disclaimerText
                  )}
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-400 leading-normal">
                  {lang === 'fa'
                    ? 'بازار رمزارزها و دارایی‌های مشتقه مشمول نوسانات بالا و پیش‌بینی‌ناپذیر ناشی از اخبار اقتصاد کلان، نرخ بهره جهانی، تغییرات شبکه و احساسات لحظه‌ای است. هیچ مدل یادگیری ماشین یا فرمول ریاضی قادر به پیش‌بینی ۱۰۰٪ قطعی آینده نیست.'
                    : 'Digital asset markets exhibit non-linear volatility driven by macroeconomic shifts, liquidity events, and on-chain dynamics. No algorithmic framework guarantees returns.'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Detailed Legal Articles */}
          <div className="space-y-3 pt-1">
            <h3 className="font-bold text-xs sm:text-sm flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{lang === 'fa' ? 'بندهای قانونی و شرایط استفاده از دیدبان' : 'Key Legal Provisions & Conditions'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Clause 1 */}
              <div
                className={`p-3.5 rounded-2xl border space-y-1.5 ${
                  isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-xs">
                  <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-mono text-[11px]">
                    ۱
                  </span>
                  <span>{lang === 'fa' ? 'مسئولیت انحصاری معامله‌گر' : 'Sole User Responsibility'}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  {lang === 'fa'
                    ? 'هرگونه ورود به پوزیشن، خرید یا فروش با اراده، تصمیم‌گیری و تحلیل نهایی شخص کاربر صورت می‌پذیرد. توسعه‌دهندگان، مدیران و پلتفرم دیدبان هیچ‌گونه تعهد و مسئولیتی نسبت به سود یا زیان سرمایه‌گذاران ندارند.'
                    : 'All trading entries, executions, and capital allocations are executed at the exclusive discretion and risk of the user.'}
                </p>
              </div>

              {/* Clause 2 */}
              <div
                className={`p-3.5 rounded-2xl border space-y-1.5 ${
                  isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-xs">
                  <span className="w-5 h-5 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-mono text-[11px]">
                    ۲
                  </span>
                  <span>{lang === 'fa' ? 'تأخیر داده‌ها و اسپرد صرافی‌ها' : 'Data Feeds & Spreads'}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  {lang === 'fa'
                    ? 'داده‌های چارت و قیمت‌ها از APIهای عمومی و معتبر بین‌المللی استخراج می‌شوند؛ با این حال به دلیل تأخیرات اینترنتی یا اختلاف اسپرد صرافی‌های مختلف، تفاوت‌های جزئی در قیمت نهایی محتمل است.'
                    : 'Real-time market feeds originate from public exchange APIs; latency or exchange spread differentials may result in minor price variations.'}
                </p>
              </div>

              {/* Clause 3 */}
              <div
                className={`p-3.5 rounded-2xl border space-y-1.5 ${
                  isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-xs">
                  <span className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-mono text-[11px]">
                    ۳
                  </span>
                  <span>{lang === 'fa' ? 'خطرات معاملات اهرمی (فیوچرز)' : 'Leverage Risk Warning'}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  {lang === 'fa'
                    ? 'معاملات اهرم‌دار (Leveraged Derivatives) دارای ریسک لیکوئید شدن فوری کل مارجین هستند. پلتفرم دیدبان استفاده از اهرم‌های نامتعارف (بیش از ۲x یا ۳x) را به شدت رد می‌نماید.'
                    : 'Trading with high leverage accelerates risk and can lead to rapid capital liquidation. Moderate or spot allocations are recommended.'}
                </p>
              </div>

              {/* Clause 4 */}
              <div
                className={`p-3.5 rounded-2xl border space-y-1.5 ${
                  isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-xs">
                  <span className="w-5 h-5 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-mono text-[11px]">
                    ۴
                  </span>
                  <span>{lang === 'fa' ? 'حفظ امنیت حساب و کلیدها' : 'Wallet Security & Privacy'}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  {lang === 'fa'
                    ? 'پلتفرم دیدبان هرگز از شما کلید خصوصی (Private Key)، رمز عبور ولت یا کلمات بازیابی تقاضا نخواهد کرد. حفاظت از دارایی‌ها، ولت‌ها و آدرس‌های برداشت بر عهده خود کاربر است.'
                    : 'Didban never requests private keys or wallet seed phrases. Protecting credentials and transaction destinations is user responsibility.'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Golden Rules of Capital Protection */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-xs sm:text-sm flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>{lang === 'fa' ? 'دستورالعمل‌های طلایی مدیریت ریسک حرفه‌ای' : 'Golden Risk Management Rules'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                className={`p-3.5 rounded-2xl border flex flex-col gap-2 ${
                  isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
                  <Percent className="w-4 h-4" />
                  <span>{lang === 'fa' ? 'قانون ریسک ۱٪ تا ۳٪' : 'Max 1-3% Capital Risk'}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {lang === 'fa'
                    ? 'در هر معامله، میزان ضرر محتمل نباید از ۱ تا حداکثر ۳ درصد از کل ارزش پرتفوی شما تجاوز کند.'
                    : t.ruleCapitalRisk}
                </p>
              </div>

              <div
                className={`p-3.5 rounded-2xl border flex flex-col gap-2 ${
                  isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{lang === 'fa' ? 'پایبندی بدون چون‌وچرا به حد ضرر' : 'Strict Stop-Loss Discipline'}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {lang === 'fa'
                    ? 'حد ضرر را پیش از ورود به پوزیشن تعیین و در صرافی ست کنید. هرگز حد ضرر را به امید بازگشت قیمت جابه‌جا نکنید.'
                    : t.ruleStopLoss}
                </p>
              </div>

              <div
                className={`p-3.5 rounded-2xl border flex flex-col gap-2 ${
                  isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-xs">
                  <Scale className="w-4 h-4" />
                  <span>{lang === 'fa' ? 'تنوع‌بخشی ساختاریافته' : 'Smart Diversification'}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {lang === 'fa'
                    ? 'تمام سرمایه را در یک آلت‌کوین یا یک طبقه ریسک قرار ندهید. ترکیب رمزارزهای پیشرو، استیبل‌کوین و نقدینگی را حفظ کنید.'
                    : t.ruleDiversification}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Contact & Support Callout inside Disclaimer */}
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
              isDark ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <strong className="block font-bold text-slate-900 dark:text-slate-100">
                  {lang === 'fa' ? 'نیاز به راهنمایی حقوقی، ثبت تیکت یا گزارش دارید؟' : 'Need Support or Have Questions?'}
                </strong>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                  {lang === 'fa'
                    ? 'تیم پشتیبانی دیدبان همواره آماده بررسی گزارش‌ها و پاسخگویی به ابهامات شماست.'
                    : 'Our support team is always available to assist with questions and feedback.'}
                </span>
              </div>
            </div>

            {onOpenContact && (
              <button
                onClick={() => {
                  onClose();
                  onOpenContact();
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm transition-all"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{lang === 'fa' ? 'تماس با ما و ثبت پیام' : 'Contact Us'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{lang === 'fa' ? 'استفاده از سامانه دیدبان به منزله پذیرش کامل این منشور است.' : 'Usage constitutes acceptance of these terms.'}</span>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
          >
            {lang === 'fa' ? 'تایید و پذیرش قوانین' : 'Accept & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};


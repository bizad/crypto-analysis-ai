import React, { useState, useEffect } from 'react';
import {
  X,
  Crown,
  CheckCircle2,
  Copy,
  Check,
  Clock,
  CreditCard,
  Wallet,
  Zap,
  RefreshCw,
  ExternalLink,
  MessageCircle,
  Phone,
  Send,
  AlertTriangle,
  Upload,
} from 'lucide-react';
import { Language, Theme, VipPlan, VipSubscription } from '../types';
import {
  VIP_PLANS,
  VIP_WALLET_ADDRESS,
  VIP_NETWORK,
  VIP_NETWORK_FA,
  VIP_CARD_NUMBER,
  VIP_CARD_NUMBER_FORMATTED,
  VIP_CARD_HOLDER,
  VIP_CARD_BANK,
  VIP_DEPOSIT_WINDOW_SECONDS,
  VIP_SUPPORT_PHONE,
  getWhatsAppReceiptUrl,
  getBaleReceiptUrl,
  getRubikaReceiptUrl,
} from '../data/vipPlans';
import { translations } from '../utils/translations';

interface VipSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivateVip: (sub: VipSubscription) => void;
  vipSubscription: VipSubscription | null;
  remainingFreeToday: number;
  quotaBlockedNotice?: boolean;
  authToken?: string;
  lang: Language;
  theme: Theme;
}

export const VipSubscriptionModal: React.FC<VipSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onActivateVip,
  vipSubscription,
  remainingFreeToday,
  quotaBlockedNotice = false,
  authToken,
  lang,
  theme,
}) => {
  const t = translations[lang];
  const isDark = theme === 'dark';

  // Selected VIP plan (default: monthly 3.5 USD)
  const [selectedPlanId, setSelectedPlanId] = useState<string>('monthly');

  // Payment method: 'CARD' (کارت به کارت تومان) or 'USDT' (تتر BEP-20)
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'USDT'>('CARD');

  // Live Nobitex USDT to Toman rate
  const [usdtRate, setUsdtRate] = useState<number>(229324);
  const [isRefreshingRate, setIsRefreshingRate] = useState<boolean>(false);
  const [rateFetchTime, setRateFetchTime] = useState<Date>(new Date());

  // Copy feedback states
  const [copiedCard, setCopiedCard] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  // Form inputs
  const [receiptRefInput, setReceiptRefInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 10-Minute Deadline Countdown Timer (600 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(VIP_DEPOSIT_WINDOW_SECONDS);

  // Fetch live Nobitex USDT rate
  const fetchLiveNobitexRate = async () => {
    setIsRefreshingRate(true);
    try {
      const res = await fetch('/api/crypto/toman-data/USDT');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.tomanData?.usdtRate) {
          setUsdtRate(data.tomanData.usdtRate);
          setRateFetchTime(new Date());
        }
      }
    } catch {
      // Retain existing rate
    } finally {
      setIsRefreshingRate(false);
    }
  };

  // On modal open: fetch rate & reset 10-minute timer
  useEffect(() => {
    if (!isOpen) return;
    fetchLiveNobitexRate();
    setTimeLeft(VIP_DEPOSIT_WINDOW_SECONDS);
  }, [isOpen]);

  // 10-minute timer ticker
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedPlan: VipPlan =
    VIP_PLANS.find((p) => p.id === selectedPlanId) || VIP_PLANS[1];

  // Dynamic Toman calculation based on live Nobitex rate
  const tomanPrice = Math.round(selectedPlan.priceUsdt * usdtRate);
  const formattedTomanPrice = tomanPrice.toLocaleString('fa-IR');

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResetTimerAndRate = () => {
    setTimeLeft(VIP_DEPOSIT_WINDOW_SECONDS);
    fetchLiveNobitexRate();
  };

  const handleCopyCard = () => {
    navigator.clipboard.writeText(VIP_CARD_NUMBER);
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2500);
  };

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(VIP_WALLET_ADDRESS);
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2500);
  };

  const handleCopyAmount = () => {
    const textToCopy =
      paymentMethod === 'CARD'
        ? tomanPrice.toString()
        : selectedPlan.priceUsdt.toString();
    navigator.clipboard.writeText(textToCopy);
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanTxid = receiptRefInput.trim();
    if (!cleanTxid && !selectedFile) {
      setErrorMessage(
        lang === 'fa'
          ? 'لطفاً شماره پیگیری یا کد هش واریزی (TXID) خود را ثبت نمایید.'
          : 'Please enter your transaction ID (TXID) or tracking reference number.'
      );
      return;
    }

    const txidToSubmit = cleanTxid || `RECEIPT_${Date.now()}`;
    if (txidToSubmit.length < 6) {
      setErrorMessage(
        lang === 'fa'
          ? 'شناسه تراکنش باید حداقل ۶ کاراکتر باشد.'
          : 'Transaction ID must be at least 6 characters.'
      );
      return;
    }

    const token = authToken || localStorage.getItem('crypto_auth_token') || '';
    if (!token) {
      setErrorMessage(
        lang === 'fa'
          ? 'برای فعال‌سازی و ثبت تراکنش، لطفاً ابتدا وارد حساب کاربری خود شوید.'
          : 'Please sign in to your account to submit payment and activate VIP.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/user/deposits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: paymentMethod === 'USDT' ? selectedPlan.priceUsdt : tomanPrice,
          currency: paymentMethod === 'USDT' ? 'USDT' : 'TOMAN',
          planId: selectedPlan.id,
          planName: selectedPlan.nameFa,
          txid: txidToSubmit,
          receiptNote:
            paymentMethod === 'CARD'
              ? `واریز کارت به کارت شتاب (${VIP_CARD_BANK})`
              : `انتقال به ولت BEP-20 (${VIP_WALLET_ADDRESS})`,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setErrorMessage(data.error || 'خطا در ثبت سند واریز.');
        setIsSubmitting(false);
        return;
      }

      const now = Date.now();
      const expiresAt = now + selectedPlan.durationDays * 24 * 60 * 60 * 1000;

      const newSub: VipSubscription = {
        isActive: true,
        planId: selectedPlan.id,
        planNameFa: selectedPlan.nameFa,
        planNameEn: selectedPlan.nameEn,
        priceUsdt: selectedPlan.priceUsdt,
        txid: txidToSubmit,
        walletAddress: paymentMethod === 'CARD' ? `CARD_${VIP_CARD_NUMBER}` : VIP_WALLET_ADDRESS,
        startedAt: now,
        expiresAt,
      };

      onActivateVip(newSub);
      setIsSubmitting(false);
      setSuccessMessage(true);

      setTimeout(() => {
        setSuccessMessage(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در برقراری ارتباط با سرور.');
      setIsSubmitting(false);
    }
  };

  const isCurrentVipActive =
    vipSubscription?.isActive && vipSubscription.expiresAt > Date.now();

  const isTimerExpired = timeLeft === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className={`w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden transition-all my-auto max-h-[92vh] flex flex-col ${
          isDark
            ? 'bg-slate-900 border-amber-500/30 text-slate-100 shadow-amber-950/20'
            : 'bg-white border-amber-300 text-slate-900 shadow-slate-200/80'
        }`}
      >
        {/* Modal Header */}
        <div className="relative p-4 sm:p-5 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border-b border-amber-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-amber-400">
                  {lang === 'fa' ? 'ارتقا به عضویت VIP هوش مصنوعی' : 'Upgrade to VIP Membership'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  VIP ACCESS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'fa'
                  ? 'دسترسی نامحدود به پیش‌بینی ۲۴ ساعته، تحلیل Gemini و تارگت‌های سود'
                  : 'Unlimited Gemini 2.5 analyses, 24h forecasts & TP/SL targets'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Live Nobitex Dollar Rate Bar */}
          <div
            className={`p-3 sm:p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
              isDark
                ? 'bg-slate-950/80 border-slate-800 text-slate-200'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {lang === 'fa' ? 'نرخ لحظه‌ای دلار تتر (نوبیتکس):' : 'Live Tether Rate (Nobitex):'}
              </span>
              <span className="font-mono font-black text-sm text-emerald-400">
                {usdtRate.toLocaleString('fa-IR')} {lang === 'fa' ? 'تومان' : 'Toman'}
              </span>
              <span className="text-[10px] text-slate-400 hidden md:inline">
                ({rateFetchTime.toLocaleTimeString(lang === 'fa' ? 'fa-IR' : 'en-US')})
              </span>
            </div>

            <button
              type="button"
              onClick={fetchLiveNobitexRate}
              disabled={isRefreshingRate}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto transition-all ${
                isDark
                  ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300'
                  : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
              }`}
              title="بروزرسانی نرخ دلار از نوبیتکس"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingRate ? 'animate-spin text-amber-400' : ''}`} />
              <span>{lang === 'fa' ? 'بروزرسانی نرخ' : 'Refresh Rate'}</span>
            </button>
          </div>

          {/* Quota Notice Banner if blocked */}
          {quotaBlockedNotice && (
            <div
              className={`p-3.5 rounded-2xl border flex items-start gap-2.5 ${
                isDark
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  : 'bg-rose-50 border-rose-300 text-rose-950 font-medium'
              }`}
            >
              <Zap className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <strong className="block font-bold mb-0.5">
                  {lang === 'fa'
                    ? 'سهمیه بروزرسانی رایگان امروز شما به پایان رسیده است'
                    : 'Your Free Daily Analysis Quota Reached'}
                </strong>
                <span>
                  {lang === 'fa'
                    ? 'برای دسترسی فوری به تمامی تحلیل‌های تکنیکال، فاندامنتال و سیگنال‌های نامحدود، یکی از پلن‌های زیر را انتخاب فرمایید.'
                    : 'Upgrade to any VIP plan below for instant unlimited AI analyses and signals.'}
                </span>
              </div>
            </div>
          )}

          {/* Active VIP Badge if active */}
          {isCurrentVipActive && (
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                isDark
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm">
                    {lang === 'fa' ? 'اشتراک VIP شما فعال است' : 'VIP Subscription Active'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'fa'
                      ? `پلن: ${vipSubscription?.planNameFa} • انقضا: ${new Date(
                          vipSubscription?.expiresAt || 0
                        ).toLocaleDateString('fa-IR')}`
                      : `Plan: ${vipSubscription?.planNameEn}`}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/30">
                {lang === 'fa' ? 'نامحدود فعال' : 'Unlimited'}
              </span>
            </div>
          )}

          {/* =========================================================================
              1. PLAN SELECTION: 5 OFFICIAL PLANS WITH DYNAMIC NOBITEX PRICING
              ========================================================================= */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>{lang === 'fa' ? '۱. انتخاب پلن اشتراک VIP (محاسبه با دلار لحظه‌ای نوبیتکس):' : '1. Select VIP Plan:'}</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {selectedPlan.priceUsdt} USD = {formattedTomanPrice} تومان
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
              {VIP_PLANS.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                const planToman = Math.round(plan.priceUsdt * usdtRate);
                return (
                  <button
                    type="button"
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/15 shadow-md shadow-amber-500/10 ring-2 ring-amber-400/40'
                        : isDark
                        ? 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-800/50'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    {plan.badgeFa && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border self-start mb-1.5 ${
                          isSelected
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : isDark
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : 'bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                      >
                        {lang === 'fa' ? plan.badgeFa : plan.badgeEn}
                      </span>
                    )}

                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                        {lang === 'fa' ? plan.nameFa : plan.nameEn}
                      </div>
                      <div className="text-[10px] text-amber-400 font-bold font-mono mt-0.5">
                        {plan.priceUsdt} $ {lang === 'fa' ? 'دلار' : 'USD'}
                      </div>
                    </div>

                    <div className="mt-2.5 pt-1.5 border-t border-slate-200 dark:border-slate-800/80">
                      <div className="text-xs font-black font-mono text-emerald-500 dark:text-emerald-400">
                        {planToman.toLocaleString('fa-IR')}
                      </div>
                      <div className="text-[9px] text-slate-400 font-sans">
                        {lang === 'fa' ? 'تومان لحظه‌ای' : 'Toman'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* =========================================================================
              2. 10-MINUTE COUNTDOWN TIMER & PAYMENT METHOD SELECTION
              ========================================================================= */}
          <div
            className={`p-4 sm:p-5 rounded-3xl border space-y-4 ${
              isDark
                ? 'bg-slate-950/90 border-amber-500/30 shadow-lg shadow-black/40'
                : 'bg-amber-50/70 border-amber-300 shadow-sm'
            }`}
          >
            {/* Top Row: Payment Tabs + 10-Minute Timer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
              {/* Payment Method Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-800 self-start">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    paymentMethod === 'CARD'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{lang === 'fa' ? 'کارت‌به‌کارت بانکی (تومان)' : 'Bank Card (Toman)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('USDT')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    paymentMethod === 'USDT'
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>{lang === 'fa' ? 'تتر BEP-20 (USDT)' : 'Tether BEP-20'}</span>
                </button>
              </div>

              {/* 10-Minute Countdown Clock */}
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold self-start sm:self-auto ${
                  isTimerExpired
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black tracking-wider">{formatTimer(timeLeft)}</span>
                  <span className="text-[10px] font-sans">
                    {lang === 'fa' ? 'مهلت واریز با نرخ لحظه‌ای' : 'Deposit deadline'}
                  </span>
                </div>
              </div>
            </div>

            {/* Timer Expired Warning & Reset Button */}
            {isTimerExpired && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>
                    {lang === 'fa'
                      ? 'مهلت ۱۰ دقیقه‌ای با این نرخ لحظه‌ای به پایان رسید. لطفاً نرخ را به‌روزرسانی کنید.'
                      : 'The 10-minute window for this rate has expired. Please refresh the live rate.'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResetTimerAndRate}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs cursor-pointer shrink-0 flex items-center gap-1 shadow"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{lang === 'fa' ? 'شروع مجدد ۱۰ دقیقه' : 'Restart 10m'}</span>
                </button>
              </div>
            )}

            {/* =========================================================================
                TAB 1: IRANIAN BANK CARD TRANSFER (کارت‌به‌کارت بانک سامان - حامد فری)
                ========================================================================= */}
            {paymentMethod === 'CARD' ? (
              <div className="space-y-3.5">
                {/* Bank Card Presentation Graphic */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 text-white shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs shadow">
                        سامان
                      </div>
                      <div>
                        <span className="text-xs font-bold text-blue-300 block">{VIP_CARD_BANK}</span>
                        <span className="text-[10px] text-slate-400">شبکه شتاب بانکی ایران</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">صاحب حساب:</span>
                      <span className="text-xs sm:text-sm font-bold text-amber-300">{VIP_CARD_HOLDER}</span>
                    </div>
                  </div>

                  {/* Card Number */}
                  <div className="my-3 text-center">
                    <span className="text-[11px] text-slate-400 block mb-1">شماره کارت جهت واریز:</span>
                    <div className="text-lg sm:text-2xl font-mono font-black tracking-widest text-amber-400 select-all" dir="ltr">
                      {VIP_CARD_NUMBER_FORMATTED}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                    <div className="text-xs">
                      <span className="text-slate-400">مبلغ قابل پرداخت (۱۰ دقیقه معتبر):</span>
                      <div className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                        {formattedTomanPrice} <span className="text-xs font-sans text-slate-300">تومان</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyCard}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer transition-all"
                      >
                        {copiedCard ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedCard ? 'شماره کارت کپی شد!' : 'کپی شماره کارت'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyAmount}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        {copiedAmount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedAmount ? 'مبلغ کپی شد' : 'کپی مبلغ'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200/90 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    لطفاً مبلغ دقیق <strong>{formattedTomanPrice} تومان</strong> را حداکثر ظرف <strong>۱۰ دقیقه</strong> به کارت فوق واریز نموده و فیش واریز را از طریق فرم زیر یا پیام‌رسان‌ها ارسال فرمایید.
                  </span>
                </div>
              </div>
            ) : (
              /* =========================================================================
                  TAB 2: TETHER USDT (BEP-20) DEPOSIT
                  ========================================================================= */
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">شبکه انتقال تتر:</span>
                  <span className="px-2.5 py-0.5 rounded-lg font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    {VIP_NETWORK_FA}
                  </span>
                </div>

                {/* Amount to Send */}
                <div
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-amber-200'
                  }`}
                >
                  <div className="text-xs">
                    <span className="text-slate-400 block">مبلغ واریزی ارز دیجیتال:</span>
                    <div className="text-lg font-black text-amber-400 font-mono mt-0.5">
                      {selectedPlan.priceUsdt} USDT (تتر)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyAmount}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedAmount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAmount ? 'کپی شد' : 'کپی مبلغ تتر'}</span>
                  </button>
                </div>

                {/* Wallet Address */}
                <div className="space-y-1.5">
                  <label className="block text-xs text-slate-400">آدرس کیف پول گیرنده (BEP-20):</label>
                  <div
                    className={`flex items-center gap-2 p-2.5 rounded-xl border ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-amber-200'
                    }`}
                  >
                    <span className="text-xs font-mono break-all select-all flex-1 font-bold text-amber-300">
                      {VIP_WALLET_ADDRESS}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyWallet}
                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer shadow"
                    >
                      {copiedWallet ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedWallet ? 'کپی شد!' : 'کپی آدرس'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              3. MESSENGER RECEIPT SUBMISSION BUTTONS (روبیکا - بله - واتس‌اپ - 09214046903)
              ========================================================================= */}
          <div
            className={`p-4 sm:p-5 rounded-3xl border space-y-3.5 ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>ارسال فوری فیش واریز در پیام‌رسان‌ها (تایید سریع)</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  فیش واریزی خود را به شماره <strong>{VIP_SUPPORT_PHONE}</strong> در یکی از برنامه‌های زیر ارسال نمایید:
                </p>
              </div>
              <a
                href={`tel:${VIP_SUPPORT_PHONE}`}
                className="text-xs font-mono font-bold text-amber-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{VIP_SUPPORT_PHONE}</span>
              </a>
            </div>

            {/* Messenger Apps Action Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* WhatsApp Button */}
              <a
                href={getWhatsAppReceiptUrl(selectedPlan.nameFa, formattedTomanPrice, selectedPlan.priceUsdt)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-slate-100 flex items-center gap-3 transition-all group cursor-pointer shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow group-hover:scale-105 transition-transform">
                  {/* WhatsApp SVG Icon */}
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.97.549 1.764.846 2.796.846 3.182 0 5.769-2.587 5.77-5.766.001-3.182-2.585-5.633-5.77-5.633zm3.364 8.163c-.14.394-.805.733-1.121.78-.316.046-.713.064-2.023-.483-1.674-.699-2.735-2.42-2.82-2.533-.085-.114-.672-.894-.672-1.705 0-.811.425-1.21.576-1.373.151-.164.331-.205.442-.205.11 0 .221 0 .316.006.103.007.241-.039.376.287.141.339.479 1.171.521 1.258.042.086.071.189.014.303-.057.114-.085.185-.17.284-.086.099-.18.221-.257.298-.087.087-.178.182-.077.355.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.378-.043.102-.114.442-.516.56-.693.118-.178.236-.149.394-.09.158.058 1.002.472 1.174.558.173.086.288.129.331.202.043.074.043.428-.097.822z" />
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.95.56 3.77 1.53 5.31L2 22l4.82-1.48C8.31 21.46 10.1 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18.25c-1.76 0-3.41-.56-4.78-1.51l-.34-.23-2.87.88.89-2.79-.24-.36C3.64 14.82 3.1 13.45 3.1 12c0-4.91 4-8.9 8.9-8.9s8.9 4 8.9 8.9c0 4.9-3.99 8.25-8.9 8.25z" />
                  </svg>
                </div>
                <div className="flex-1 text-right">
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>واتس‌اپ (WhatsApp)</span>
                    <ExternalLink className="w-3 h-3 text-[#25D366]" />
                  </div>
                  <div className="text-[10px] text-slate-300 mt-0.5">ارسال با متن آماده</div>
                </div>
              </a>

              {/* Bale Messenger Button */}
              <a
                href={getBaleReceiptUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl bg-[#00A693]/15 hover:bg-[#00A693]/25 border border-[#00A693]/40 text-slate-100 flex items-center gap-3 transition-all group cursor-pointer shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-[#00A693] text-white flex items-center justify-center shrink-0 shadow group-hover:scale-105 transition-transform font-bold text-sm">
                  {/* Bale Icon */}
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                </div>
                <div className="flex-1 text-right">
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>پیام‌رسان بله (Bale)</span>
                    <ExternalLink className="w-3 h-3 text-[#00A693]" />
                  </div>
                  <div className="text-[10px] text-slate-300 mt-0.5">ارسال مستقیم فیش</div>
                </div>
              </a>

              {/* Rubika Button */}
              <a
                href={getRubikaReceiptUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl bg-gradient-to-r from-purple-900/30 to-rose-900/30 hover:from-purple-900/45 hover:to-rose-900/45 border border-purple-500/40 text-slate-100 flex items-center gap-3 transition-all group cursor-pointer shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500 text-white flex items-center justify-center shrink-0 shadow group-hover:scale-105 transition-transform font-bold text-xs">
                  {/* Rubika Emblem */}
                  <Send className="w-5 h-5" />
                </div>
                <div className="flex-1 text-right">
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>روبیکا (Rubika)</span>
                    <ExternalLink className="w-3 h-3 text-pink-400" />
                  </div>
                  <div className="text-[10px] text-slate-300 mt-0.5">ارسال به شماره تماس</div>
                </div>
              </a>
            </div>
          </div>

          {/* =========================================================================
              4. IN-APP RECEIPT SUBMISSION FORM (ثبت فیش درون برنامه)
              ========================================================================= */}
          <form onSubmit={handleConfirmPayment} className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Tracking Reference Input */}
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-800 dark:text-slate-200">
                  {paymentMethod === 'CARD'
                    ? 'شماره پیگیری / شماره ارجاع کارت‌به‌کارت:'
                    : 'کد پیگیری تراکنش تتر (TXID / Hash):'}
                </label>
                <input
                  type="text"
                  value={receiptRefInput}
                  onChange={(e) => setReceiptRefInput(e.target.value)}
                  placeholder={
                    paymentMethod === 'CARD'
                      ? 'مثال: شماره پیگیری ۶ رقمی یا شماره ارجاع فیش'
                      : '0x8a9b7c... یا هش شبکه BEP-20'
                  }
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono transition-all outline-none ${
                    isDark
                      ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-amber-400'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                  }`}
                />
              </div>

              {/* Upload Screenshot / Receipt */}
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-800 dark:text-slate-200">
                  بارگذاری تصویر فیش بانکی (اختیاری):
                </label>
                <label
                  className={`w-full px-3.5 py-2 rounded-xl border flex items-center justify-between gap-2 text-xs cursor-pointer transition-all ${
                    isDark
                      ? 'bg-slate-950 border-slate-700 hover:border-slate-600 text-slate-300'
                      : 'bg-slate-50 border-slate-300 hover:border-slate-400 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Upload className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">
                      {selectedFile ? selectedFile.name : 'انتخاب تصویر فیش واریز...'}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                    انتخاب فایل
                  </span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-400 font-medium bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30">
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  {lang === 'fa'
                    ? 'فیش شما ثبت شد و اشتراک VIP بلافاصله فعال گردید!'
                    : 'Receipt submitted and VIP activated successfully!'}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>{lang === 'fa' ? 'در حال تایید و فعال‌سازی...' : 'Activating VIP...'}</span>
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4" />
                  <span>
                    {lang === 'fa'
                      ? `ثبت فیش و فعال‌سازی آنی اشتراک ${selectedPlan.nameFa} (${formattedTomanPrice} تومان)`
                      : `Submit Receipt & Activate VIP (${selectedPlan.priceUsdt} USD)`}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

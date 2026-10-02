import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  CreditCard,
  MessageSquare,
  Gift,
  Crown,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
  LogOut,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Copy,
  Check,
  DollarSign,
  ArrowDownLeft,
  ExternalLink,
  Share2,
  Wallet,
} from 'lucide-react';
import { Language, Theme, UserAccount, DepositItem, TicketItem, WithdrawalItem } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  authToken?: string;
  onLogout: () => void;
  onOpenVipModal: () => void;
  onOpenInviteModal?: () => void;
  onOpenAdminModal?: () => void;
  lang: Language;
  theme: Theme;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  authToken,
  onLogout,
  onOpenVipModal,
  onOpenAdminModal,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'REFERRALS' | 'DEPOSITS' | 'TICKETS'>('OVERVIEW');

  const getAuthHeader = () => {
    const token = authToken || localStorage.getItem('crypto_auth_token') || '';
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Referral & Balance State
  const [refStats, setRefStats] = useState<{
    referralCode: string;
    referralCount: number;
    weeklyBonusQuota: number;
    rewardBalanceUsdt: number;
    totalEarnedUsdt: number;
    bep20Address: string;
    canWithdraw: boolean;
    minWithdrawalUsdt: number;
    withdrawals: WithdrawalItem[];
    referredUsers: Array<{ id: string; name: string; identifier: string; isVip: boolean; joinedAt: number }>;
  } | null>(null);

  const [loadingRefStats, setLoadingRefStats] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Withdrawal form
  const [wthAmount, setWthAmount] = useState('30');
  const [wthAddress, setWthAddress] = useState('');
  const [wthSubmitting, setWthSubmitting] = useState(false);
  const [wthFeedback, setWthFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Deposits State
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [loadingDeposits, setLoadingDeposits] = useState(false);
  const [showNewDepositForm, setShowNewDepositForm] = useState(false);
  const [depAmount, setDepAmount] = useState('');
  const [depCurrency, setDepCurrency] = useState<'TOMAN' | 'USDT'>('TOMAN');
  const [depTxid, setDepTxid] = useState('');
  const [depPlan, setDepPlan] = useState('monthly');
  const [depSubmitting, setDepSubmitting] = useState(false);
  const [depFeedback, setDepFeedback] = useState<string | null>(null);

  // Tickets State
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [activeTicket, setActiveTicket] = useState<TicketItem | null>(null);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDept, setTicketDept] = useState('پشتیبانی فنی');
  const [ticketMsg, setTicketMsg] = useState('');
  const [ticketReply, setTicketReply] = useState('');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);

  const isAdminUser =
    currentUser.email === 'hamed.farri@gmail.com' ||
    currentUser.name.includes('حامد فرّی') ||
    currentUser.id === 'user_admin_hamed';

  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}?ref=${encodeURIComponent(refStats?.referralCode || currentUser.referralCode)}`
    : `https://didban.crypto?ref=${currentUser.referralCode}`;

  useEffect(() => {
    if (isOpen && currentUser) {
      loadDeposits();
      loadTickets();
      loadReferralData();
    }
  }, [isOpen, currentUser]);

  const loadReferralData = async () => {
    setLoadingRefStats(true);
    try {
      const res = await fetch('/api/user/referrals', { headers: getAuthHeader() });
      const data = await res.json();
      if (data.success && data.referralStats) {
        setRefStats(data.referralStats);
        if (data.referralStats.bep20Address && !wthAddress) {
          setWthAddress(data.referralStats.bep20Address);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoadingRefStats(false);
    }
  };

  const loadDeposits = async () => {
    setLoadingDeposits(true);
    try {
      const res = await fetch('/api/user/deposits', { headers: getAuthHeader() });
      const data = await res.json();
      if (data.success) {
        setDeposits(data.deposits);
      }
    } catch {
      // ignore
    } finally {
      setLoadingDeposits(false);
    }
  };

  const loadTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await fetch('/api/user/tickets', { headers: getAuthHeader() });
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
        if (activeTicket) {
          const updatedActive = data.tickets.find((t: TicketItem) => t.id === activeTicket.id);
          if (updatedActive) setActiveTicket(updatedActive);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleCopyCode = () => {
    const code = refStats?.referralCode || currentUser.referralCode;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShare = async () => {
    const shareText = `دیدبان | دستیار هوشمند تحلیل و پیش‌بینی رمزارزها با هوش مصنوعی Google Gemini 3.8\nبا ثبت‌نام از طریق این لینک، از ۱ تحلیل رایگان در هفته بهره‌مند شوید:\n${referralLink}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'دیدبان | هوش مصنوعی تحلیل کریپتو',
          text: shareText,
          url: referralLink,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSubmitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setWthFeedback(null);

    const amount = Number(wthAmount);
    const balance = refStats?.rewardBalanceUsdt ?? currentUser.rewardBalanceUsdt ?? 0;

    if (isNaN(amount) || amount < 30) {
      setWthFeedback({ type: 'error', message: 'حداقل مبلغ برداشت ۳۰ دلار تتر (USDT) می‌باشد.' });
      return;
    }

    if (amount > balance) {
      setWthFeedback({ type: 'error', message: `موجودی شما (${balance.toFixed(2)}$) کمتر از مبلغ درخواستی است.` });
      return;
    }

    const cleanAddress = wthAddress.trim();
    if (!cleanAddress.startsWith('0x') || cleanAddress.length < 30) {
      setWthFeedback({ type: 'error', message: 'آدرس کیف‌پول باید با 0x شروع شده و معتبر باشد (شبکه BEP-20 BSC).' });
      return;
    }

    setWthSubmitting(true);
    try {
      const res = await fetch('/api/user/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          amountUsdt: amount,
          bep20Address: cleanAddress,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setWthFeedback({
          type: 'success',
          message: `درخواست برداشت ${amount} تتر با موفقیت ثبت شد و به زودی پس از بررسی مدیریت به کیف‌پول شما واریز می‌شود.`,
        });
        loadReferralData();
      } else {
        setWthFeedback({ type: 'error', message: data.error || 'خطا در ثبت درخواست برداشت' });
      }
    } catch (err: any) {
      setWthFeedback({ type: 'error', message: err.message || 'خطا در برقراری ارتباط با سرور' });
    } finally {
      setWthSubmitting(false);
    }
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depAmount || !depTxid) return;

    setDepSubmitting(true);
    setDepFeedback(null);

    const planName =
      depPlan === 'weekly'
        ? 'اشتراک هفتگی VIP'
        : depPlan === 'quarterly'
        ? 'اشتراک سه‌ماهه VIP'
        : depPlan === 'annual'
        ? 'اشتراک سالانه VIP'
        : 'اشتراک ماهانه VIP';

    try {
      const res = await fetch('/api/user/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          amount: Number(depAmount),
          currency: depCurrency,
          planId: depPlan,
          planName,
          txid: depTxid,
          receiptNote: 'ثبت شده توسط کاربر از بخش پروفایل',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setDepFeedback(lang === 'fa' ? 'فیش واریزی شما با موفقیت ثبت شد و در صف تایید مدیریت قرار گرفت.' : 'Receipt submitted successfully!');
        setDepAmount('');
        setDepTxid('');
        setShowNewDepositForm(false);
        loadDeposits();
      } else {
        setDepFeedback(data.error || 'خطا در ثبت فیش');
      }
    } catch (err: any) {
      setDepFeedback(err.message || 'خطا در برقراری ارتباط');
    } finally {
      setDepSubmitting(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMsg.trim()) return;

    setTicketSubmitting(true);
    try {
      const res = await fetch('/api/user/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          subject: ticketSubject.trim(),
          department: ticketDept,
          message: ticketMsg.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTicketSubject('');
        setTicketMsg('');
        setShowNewTicketForm(false);
        loadTickets();
      }
    } catch {
      // ignore
    } finally {
      setTicketSubmitting(false);
    }
  };

  const handleSendTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !ticketReply.trim()) return;

    setTicketSubmitting(true);
    try {
      const res = await fetch(`/api/user/tickets/${activeTicket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          text: ticketReply.trim(),
          sender: 'user',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTicketReply('');
        loadTickets();
      }
    } catch {
      // ignore
    } finally {
      setTicketSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentBalance = refStats?.rewardBalanceUsdt ?? currentUser.rewardBalanceUsdt ?? 0;
  const totalEarned = refStats?.totalEarnedUsdt ?? currentUser.totalEarnedUsdt ?? 0;
  const progressTo30 = Math.min(100, Math.round((currentBalance / 30) * 100));
  const remainingForWithdraw = Math.max(0, 30 - currentBalance);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between gap-3 ${
            isDark
              ? 'border-slate-800/80 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40'
              : 'border-slate-200 bg-gradient-to-r from-emerald-50 via-slate-50 to-teal-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <div
                className={`w-full h-full rounded-[14px] flex items-center justify-center font-bold text-base ${
                  isDark ? 'bg-slate-950 text-emerald-400' : 'bg-white text-emerald-600 shadow-xs'
                }`}
              >
                {currentUser.name.charAt(0) || 'U'}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  {currentUser.name}
                </h2>
                {currentUser.isVip && (
                  <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                    <Crown className="w-3 h-3" />
                    VIP
                  </span>
                )}
                {isAdminUser && (
                  <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <Shield className="w-3 h-3" />
                    مدیر سیستم
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentUser.phone || currentUser.email || 'حساب کاربری پلتفرم دیدبان'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isAdminUser && onOpenAdminModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdminModal();
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                  isDark
                    ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-500/40'
                    : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-300'
                }`}
                title="ورود به پنل مدیریت"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">پنل مدیریت</span>
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isDark
                  ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div
          className={`flex items-center gap-1.5 sm:gap-2 overflow-x-auto px-4 py-2.5 border-b text-xs font-bold no-scrollbar ${
            isDark ? 'border-slate-800/60 bg-slate-950/40' : 'border-slate-200 bg-slate-100/80'
          }`}
        >
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3 sm:px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeTab === 'OVERVIEW'
                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            خلاصه و داشبورد
          </button>
          <button
            onClick={() => setActiveTab('REFERRALS')}
            className={`px-3 sm:px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'REFERRALS'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : isDark
                ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>معرفی و برداشت تتر ({refStats?.referralCount || currentUser.referralCount || 0})</span>
            {currentBalance >= 30 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('DEPOSITS')}
            className={`px-3 sm:px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'DEPOSITS'
                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>واریزی‌ها و اشتراک ({deposits.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('TICKETS')}
            className={`px-3 sm:px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'TICKETS'
                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>پشتیبانی ({tickets.length})</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* VIP Status Card */}
                <div
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-colors ${
                    currentUser.isVip
                      ? isDark
                        ? 'bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border-amber-500/30'
                        : 'bg-gradient-to-br from-amber-50/90 via-white to-amber-100/40 border-amber-200 shadow-sm'
                      : isDark
                      ? 'bg-slate-950/60 border-slate-800'
                      : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>وضعیت پلن هوش مصنوعی</span>
                    <Crown className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  </div>
                  <div className="my-2">
                    <div className="text-lg font-black text-amber-600 dark:text-amber-400">
                      {currentUser.isVip ? 'اشتراک فعال VIP نامحدود' : 'پلن استاندارد رایگان'}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {currentUser.isVip
                        ? 'دسترسی نامحدود به تحلیل‌های تکنیکال و فاندامنتال Gemini 3.8'
                        : '۱ تحلیل رایگان روزانه + سهمیه هفتگی دعوت از دوستان'}
                    </p>
                  </div>
                  {!currentUser.isVip ? (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenVipModal();
                      }}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md shadow-amber-500/20 mt-1"
                    >
                      ارتقاء به اشتراک نامحدود VIP
                    </button>
                  ) : (
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>فعال و بدون محدودیت زمانی</span>
                    </div>
                  )}
                </div>

                {/* Cash Reward USDT Card */}
                <div
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-colors ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                      <DollarSign className="w-3.5 h-3.5" />
                      کیف‌پول پاداش نقدی (۱۰٪ VIP)
                    </span>
                    <span className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-full font-mono font-bold">
                      USDT BEP-20
                    </span>
                  </div>

                  <div className="my-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                        ${currentBalance.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">USDT</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      <span>کل سود دریافتی: ${totalEarned.toFixed(2)}</span>
                      <span>سقف برداشت: $30.00</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressTo30}%` }}
                      ></div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('REFERRALS')}
                    className={`w-full py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 mt-1 ${
                      currentBalance >= 30
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                        : isDark
                        ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                    }`}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>{currentBalance >= 30 ? 'برداشت وجه به کیف‌پول تتر (آماده)' : 'مشاهده جزییات و دعوت دوستان'}</span>
                  </button>
                </div>
              </div>

              {/* Free Quotas & Referrals Overview */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                  isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>سهمیه رایگان هفتگی از دعوت دوستان</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {refStats?.referralCount || currentUser.referralCount || 0} دوست تاکنون با کد شما عضو شده‌اند (+{refStats?.weeklyBonusQuota || currentUser.weeklyBonusQuota || 0} تحلیل هدیه در هر هفته).
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('REFERRALS')}
                  className={`px-3 py-1.5 rounded-xl border font-bold shrink-0 cursor-pointer transition-colors ${
                    isDark
                      ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  دریافت لینک دعوت
                </button>
              </div>

              {/* Account Quick Details */}
              <div
                className={`p-4 rounded-2xl border space-y-2 text-xs transition-colors ${
                  isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="font-bold text-slate-900 dark:text-slate-100 mb-2">اطلاعات حساب کاربری</div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">کد معرف اختصاصی شما:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{refStats?.referralCode || currentUser.referralCode}</span>
                    <button
                      onClick={handleCopyCode}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title="کپی کد معرف"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                {currentUser.phone && (
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-500 dark:text-slate-400">شماره تلفن:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{currentUser.phone}</span>
                  </div>
                )}
                {currentUser.email && (
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-500 dark:text-slate-400">ایمیل:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{currentUser.email}</span>
                  </div>
                )}
                <div className="flex justify-between py-1.5 text-slate-700 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400">تاریخ عضویت:</span>
                  <span>{new Date(currentUser.createdAt).toLocaleDateString('fa-IR')}</span>
                </div>
              </div>

              {/* Logout Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={onLogout}
                  className="px-3.5 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>خروج از حساب کاربری</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: REFERRALS & USDT BEP-20 WITHDRAWAL */}
          {activeTab === 'REFERRALS' && (
            <div className="space-y-4">
              {/* Cash Commission Banner */}
              <div
                className={`p-4 rounded-2xl border text-xs space-y-2 transition-colors ${
                  isDark
                    ? 'bg-gradient-to-br from-amber-500/20 via-slate-900 to-emerald-950/40 border-amber-500/40 text-slate-300'
                    : 'bg-gradient-to-br from-amber-50/90 via-white to-emerald-50/90 border-amber-300 shadow-sm text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300 font-bold text-sm">
                  <Gift className="w-4 h-4 text-amber-500" />
                  <span>طرح معرفی دوستان: ۱۰٪ پاداش نقدی تتر + ۱ تحلیل هفتگی رایگان</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  با دعوت هر دوست، به ازای هر خرید اشتراک VIP توسط ایشان، <strong className="text-amber-600 dark:text-amber-400 font-bold">۱۰٪ از مبلغ کل خرید</strong> به صورت نقدی به کیف‌پول تتر حساب کاربری شما واریز می‌شود. همچنین به ازای هر دوست، <strong className="text-emerald-600 dark:text-emerald-400 font-bold">۱ تحلیل رایگان در هفته</strong> دریافت خواهید کرد!
                </p>
                <div
                  className={`text-[10px] p-2.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 ${
                    isDark
                      ? 'bg-slate-950/50 border-slate-800 text-slate-400'
                      : 'bg-amber-100/60 border-amber-200 text-slate-800'
                  }`}
                >
                  <span>💡 مثال: با خرید اشتراک ماهانه ($79) توسط دوست شما، مبلغ <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">$7.90 USDT</strong> پاداش نقدی می‌گیرید!</span>
                  <span className="font-bold text-amber-700 dark:text-amber-400 shrink-0">حداقل برداشت: ۳۰ دلار</span>
                </div>
              </div>

              {/* Referral Link & Code Box */}
              <div
                className={`p-4 rounded-2xl border space-y-3 transition-colors ${
                  isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="font-bold text-xs text-slate-900 dark:text-slate-300">لینک اختصاصی دعوت شما</div>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex-1 px-3 py-2 rounded-xl border text-xs font-mono truncate text-left ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-slate-300'
                        : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  >
                    {referralLink}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0 transition-all shadow-sm"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'کپی شد' : 'کپی لینک'}</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className={`p-2 rounded-xl border cursor-pointer shrink-0 transition-colors ${
                      isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                    title="اشتراک‌گذاری در شبکه‌های اجتماعی"
                  >
                    <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span>کد معرف دستی: <strong className="font-mono text-amber-600 dark:text-amber-400 font-bold">{refStats?.referralCode || currentUser.referralCode}</strong></span>
                  <button
                    onClick={handleCopyCode}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1 font-bold"
                  >
                    {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'کپی شد' : 'کپی کد معرف'}</span>
                  </button>
                </div>
              </div>

              {/* Stats 4-Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className={`p-3 rounded-2xl border text-center transition-colors ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">دوستان معرفی‌شده</div>
                  <div className="text-xl font-black font-mono text-slate-900 dark:text-slate-100 mt-1">
                    {refStats?.referralCount || currentUser.referralCount || 0}
                  </div>
                </div>
                <div className={`p-3 rounded-2xl border text-center transition-colors ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">تحلیل هفتگی هدیه</div>
                  <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    +{refStats?.weeklyBonusQuota || currentUser.weeklyBonusQuota || 0}
                  </div>
                </div>
                <div className={`p-3 rounded-2xl border text-center transition-colors ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">موجودی قابل برداشت</div>
                  <div className="text-xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
                    ${currentBalance.toFixed(2)}
                  </div>
                </div>
                <div className={`p-3 rounded-2xl border text-center transition-colors ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">کل درآمد کسب‌شده</div>
                  <div className="text-xl font-black font-mono text-cyan-600 dark:text-cyan-400 mt-1">
                    ${totalEarned.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* WITHDRAWAL SECTION (USDT BEP-20) */}
              <div
                className={`p-4 rounded-2xl border space-y-3.5 transition-colors ${
                  currentBalance >= 30
                    ? isDark
                      ? 'bg-gradient-to-br from-slate-900 to-emerald-950/40 border-emerald-500/40'
                      : 'bg-gradient-to-br from-white to-emerald-50/70 border-emerald-300 shadow-sm'
                    : isDark
                    ? 'bg-slate-950/60 border-slate-800'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-bold text-xs text-slate-900 dark:text-slate-200">
                      برداشت وجه پاداش به کیف‌پول تتر شبکه بایننس اسمارت چین (BEP-20)
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      currentBalance >= 30
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                        : isDark
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {currentBalance >= 30 ? '✅ واجد شرایط برداشت' : 'حداقل ۳۰ دلار'}
                  </span>
                </div>

                {/* Progress bar and notice */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>پیشرفت تا سقف ۳۰ دلار برداشت:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{progressTo30}% (${currentBalance.toFixed(2)} از $30.00)</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressTo30}%` }}
                    ></div>
                  </div>
                  {currentBalance < 30 && (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                      برای فعال‌سازی فرم برداشت وجه، به <strong className="text-amber-600 dark:text-amber-300 font-mono">${remainingForWithdraw.toFixed(2)}</strong> دیگر از کمیسیون ۱۰٪ نیاز دارید. با دعوت از دوستان و ارتقای آنها به VIP، این سقف به سرعت پر می‌شود.
                    </p>
                  )}
                </div>

                {/* Withdrawal Form (Available if >= 30) */}
                {currentBalance >= 30 ? (
                  <form onSubmit={handleSubmitWithdrawal} className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800/60">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-medium">
                          مبلغ درخواستی برداشت (تتر USDT)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="30"
                            max={currentBalance}
                            step="0.1"
                            required
                            value={wthAmount}
                            onChange={(e) => setWthAmount(e.target.value)}
                            placeholder="30"
                            className={`w-full px-3 py-2 rounded-xl text-xs font-mono outline-none border focus:border-emerald-500 transition-colors ${
                              isDark
                                ? 'bg-slate-900 border-slate-700 text-slate-100'
                                : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setWthAmount(currentBalance.toString())}
                            className="absolute left-2 top-2 text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                          >
                            حداکثر
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-medium">
                          آدرس کیف‌پول تتر (شبکه BEP-20 / بایننس اسمارت چین)
                        </label>
                        <input
                          type="text"
                          required
                          value={wthAddress}
                          onChange={(e) => setWthAddress(e.target.value)}
                          placeholder="0x..."
                          className={`w-full px-3 py-2 rounded-xl text-xs font-mono text-left outline-none border focus:border-emerald-500 transition-colors ${
                            isDark
                              ? 'bg-slate-900 border-slate-700 text-slate-100'
                              : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    {wthFeedback && (
                      <div
                        className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                          wthFeedback.type === 'success'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {wthFeedback.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                        )}
                        <span>{wthFeedback.message}</span>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={wthSubmitting}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 transition-all"
                      >
                        {wthSubmitting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>در حال ثبت...</span>
                          </>
                        ) : (
                          <>
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                            <span>ثبت درخواست برداشت به کیف‌پول BEP-20</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div
                    className={`p-3 rounded-xl text-[11px] flex items-center gap-2 border ${
                      isDark
                        ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>پس از رسیدن موجودی به سقف ۳۰ دلار، فرم ورود آدرس ولت تتر فعال خواهد شد.</span>
                  </div>
                )}
              </div>

              {/* User Withdrawal Requests History */}
              {refStats?.withdrawals && refStats.withdrawals.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-300">تاریخچه درخواست‌های برداشت تتر شما</h4>
                  <div className="space-y-2">
                    {refStats.withdrawals.map((w) => (
                      <div
                        key={w.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-2 text-xs transition-colors ${
                          isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                            <span className="font-mono text-emerald-600 dark:text-emerald-400">${w.amountUsdt} USDT</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[150px] sm:max-w-[220px]">
                              {w.bep20Address}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                            {new Date(w.createdAt).toLocaleString('fa-IR')}
                          </div>
                          {w.txHash && (
                            <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono mt-1 flex items-center gap-1">
                              <span>هش تراکنش (TxID):</span>
                              <span className="truncate max-w-[160px] sm:max-w-[250px]">{w.txHash}</span>
                            </div>
                          )}
                        </div>

                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold shrink-0 ${
                            w.status === 'COMPLETED'
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                              : w.status === 'PENDING'
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                              : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {w.status === 'COMPLETED'
                            ? '✅ واریز شد'
                            : w.status === 'PENDING'
                            ? '⏳ در انتظار واریز'
                            : '❌ رد شده'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Referred Users List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-300">لیست دوستان معرفی‌شده با کد شما</h4>
                {loadingRefStats ? (
                  <div className="text-center py-4 text-xs text-slate-500 dark:text-slate-400">در حال دریافت اطلاعات...</div>
                ) : refStats?.referredUsers && refStats.referredUsers.length > 0 ? (
                  <div className="space-y-1.5">
                    {refStats.referredUsers.map((u) => (
                      <div
                        key={u.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
                          isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-200">{u.name}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{u.identifier}</div>
                        </div>
                        <div className="text-left">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              u.isVip
                                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                                : isDark
                                ? 'bg-slate-800 text-slate-400'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {u.isVip ? '👑 VIP (۱۰٪ پورسانت نقدی)' : 'کاربر رایگان'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-xs text-slate-500 dark:text-slate-400">
                    هنوز هیچ دوستی با کد شما عضو نشده است. لینک دعوت خود را در کانال‌ها و گروه‌های ترید به اشتراک بگذارید!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DEPOSITS */}
          {activeTab === 'DEPOSITS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-300">لیست واریزی‌ها و فیش‌های اشتراک VIP</h3>
                <button
                  onClick={() => setShowNewDepositForm(!showNewDepositForm)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 dark:hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ثبت فیش واریزی جدید</span>
                </button>
              </div>

              {depFeedback && (
                <div className="p-3 rounded-xl text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{depFeedback}</span>
                </div>
              )}

              {showNewDepositForm && (
                <form
                  onSubmit={handleSubmitDeposit}
                  className={`p-4 rounded-2xl border space-y-3 transition-colors ${
                    isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400">فرم ثبت فیش واریز اشتراک</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-medium">واحد پرداخت</label>
                      <select
                        value={depCurrency}
                        onChange={(e) => setDepCurrency(e.target.value as any)}
                        className={`w-full px-3 py-2 rounded-xl text-xs outline-none border transition-colors ${
                          isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="TOMAN">تومان (کارت‌به‌کارت)</option>
                        <option value="USDT">تتر USDT (کیف‌پول)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-medium">پلن مورد نظر</label>
                      <select
                        value={depPlan}
                        onChange={(e) => setDepPlan(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl text-xs outline-none border transition-colors ${
                          isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="weekly">اشتراک هفتگی (۱,۴۵۰,۰۰۰ تومان / ۲۹ تتر)</option>
                        <option value="monthly">اشتراک ماهانه (۳,۹۰۰,۰۰۰ تومان / ۷۹ تتر)</option>
                        <option value="quarterly">اشتراک ۳ ماهه (۹,۹۰۰,۰۰۰ تومان / ۱۹۹ تتر)</option>
                        <option value="annual">اشتراک سالانه (۲۹,۹۰۰,۰۰۰ تومان / ۵۹۹ تتر)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-medium">
                        مبلغ واریز شده ({depCurrency === 'TOMAN' ? 'تومان' : 'USDT'})
                      </label>
                      <input
                        type="number"
                        required
                        value={depAmount}
                        onChange={(e) => setDepAmount(e.target.value)}
                        placeholder={depCurrency === 'TOMAN' ? '1450000' : '29'}
                        className={`w-full px-3 py-2 rounded-xl text-xs outline-none border transition-colors font-mono ${
                          isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-medium">
                        {depCurrency === 'TOMAN' ? 'شماره پیگیری فیش کارت‌به‌کارت' : 'کد هش تراکنش (TXID)'}
                      </label>
                      <input
                        type="text"
                        required
                        value={depTxid}
                        onChange={(e) => setDepTxid(e.target.value)}
                        placeholder={depCurrency === 'TOMAN' ? 'مثال: ۷۸۲۳۱۴' : '0x...'}
                        className={`w-full px-3 py-2 rounded-xl text-xs outline-none border transition-colors font-mono ${
                          isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowNewDepositForm(false)}
                      className={`px-3 py-1.5 rounded-xl text-xs cursor-pointer border transition-colors ${
                        isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      disabled={depSubmitting}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      {depSubmitting ? 'در حال ثبت...' : 'ارسال فیش برای تایید مدیریت'}
                    </button>
                  </div>
                </form>
              )}

              {/* Deposits List */}
              {loadingDeposits ? (
                <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">در حال دریافت واریزی‌ها...</div>
              ) : deposits.length > 0 ? (
                <div className="space-y-2">
                  {deposits.map((dep) => (
                    <div
                      key={dep.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                        isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-200">{dep.planName}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          پیگیری: {dep.txid}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {new Date(dep.createdAt).toLocaleString('fa-IR')}
                        </div>
                      </div>

                      <div className="text-left">
                        <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {dep.amount.toLocaleString()} {dep.currency}
                        </div>
                        <span
                          className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            dep.status === 'APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                              : dep.status === 'PENDING'
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                              : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {dep.status === 'APPROVED'
                            ? '✅ تایید شده'
                            : dep.status === 'PENDING'
                            ? '⏳ در انتظار تایید مدیریت'
                            : '❌ رد شده'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-xs text-slate-500 dark:text-slate-400">
                  هنوز فیش واریزی ثبت نکرده‌اید. برای فعال‌سازی VIP می‌توانید فیش کارت‌به‌کارت یا TXID خود را ثبت کنید.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TICKETS */}
          {activeTab === 'TICKETS' && (
            <div className="space-y-4">
              {!activeTicket ? (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-300">لیست تیکت‌ها و مکاتبات با پشتیبانی</h3>
                    <button
                      onClick={() => setShowNewTicketForm(!showNewTicketForm)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 dark:hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ارسال تیکت جدید</span>
                    </button>
                  </div>

                  {showNewTicketForm && (
                    <form
                      onSubmit={handleCreateTicket}
                      className={`p-4 rounded-2xl border space-y-3 transition-colors ${
                        isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400">ثبت تیکت پشتیبانی</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-medium">موضوع تیکت</label>
                          <input
                            type="text"
                            required
                            value={ticketSubject}
                            onChange={(e) => setTicketSubject(e.target.value)}
                            placeholder="مثال: سوال درباره واریزی یا برداشت"
                            className={`w-full px-3 py-2 rounded-xl text-xs outline-none border transition-colors ${
                              isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-medium">دپارتمان</label>
                          <select
                            value={ticketDept}
                            onChange={(e) => setTicketDept(e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl text-xs outline-none border transition-colors ${
                              isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          >
                            <option value="پشتیبانی فنی">پشتیبانی فنی</option>
                            <option value="مالی و اشتراک">مالی، تایید واریزی و تسویه تتر</option>
                            <option value="سوالات تحلیل و مارکت">سوالات الگوریتم و هوش مصنوعی</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-medium">متن پیام</label>
                        <textarea
                          rows={3}
                          required
                          value={ticketMsg}
                          onChange={(e) => setTicketMsg(e.target.value)}
                          placeholder="پیام خود را با جزییات مطرح نمایید..."
                          className={`w-full px-3 py-2 rounded-xl text-xs outline-none border transition-colors resize-none ${
                            isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowNewTicketForm(false)}
                          className={`px-3 py-1.5 rounded-xl text-xs cursor-pointer border transition-colors ${
                            isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                          }`}
                        >
                          انصراف
                        </button>
                        <button
                          type="submit"
                          disabled={ticketSubmitting}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-sm disabled:opacity-50"
                        >
                          {ticketSubmitting ? 'در حال ارسال...' : 'ارسال تیکت'}
                        </button>
                      </div>
                    </form>
                  )}

                  {loadingTickets ? (
                    <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">در حال دریافت تیکت‌ها...</div>
                  ) : tickets.length > 0 ? (
                    <div className="space-y-2">
                      {tickets.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => setActiveTicket(t)}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors ${
                            isDark
                              ? 'bg-slate-950/60 hover:bg-slate-950 border-slate-800'
                              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                              <span>{t.subject}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                              }`}>
                                {t.department}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                              آخرین پیام: {t.messages[t.messages.length - 1]?.text}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                t.status === 'ANSWERED'
                                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                                  : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {t.status === 'ANSWERED' ? 'پاسخ داده شد' : 'در انتظار پاسخ'}
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-400 rtl:rotate-180" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-xs text-slate-500 dark:text-slate-400">
                      هیچ تیکتی تا کنون ثبت نشده است. در صورت نیاز به راهنمایی می‌توانید تیکت ارسال کنید.
                    </div>
                  )}
                </>
              ) : (
                /* Ticket Chat Thread View */
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800/40">
                    <button
                      onClick={() => setActiveTicket(null)}
                      className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <ChevronRight className="w-3.5 h-3.5 rtl:rotate-0 rotate-180" />
                      <span>بازگشت به لیست تیکت‌ها</span>
                    </button>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-300">{activeTicket.subject}</span>
                  </div>

                  <div className="space-y-2.5 max-h-56 overflow-y-auto p-1">
                    {activeTicket.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                          m.sender === 'user'
                            ? isDark
                              ? 'mr-auto bg-emerald-600/20 border border-emerald-500/30 text-emerald-100 rounded-br-none'
                              : 'mr-auto bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-br-none'
                            : isDark
                            ? 'ml-auto bg-slate-800 border border-slate-700 text-slate-100 rounded-bl-none'
                            : 'ml-auto bg-slate-100 border border-slate-200 text-slate-900 rounded-bl-none'
                        }`}
                      >
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">
                          {m.sender === 'user' ? 'شما' : '👨‍💻 پشتیبانی پلتفرم (مدیریت)'}
                        </div>
                        <div className="leading-relaxed">{m.text}</div>
                        <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 text-left font-mono">
                          {new Date(m.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Input Form */}
                  <form onSubmit={handleSendTicketReply} className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/40">
                    <input
                      type="text"
                      value={ticketReply}
                      onChange={(e) => setTicketReply(e.target.value)}
                      placeholder="پاسخ خود را بنویسید..."
                      className={`flex-1 px-3.5 py-2 rounded-xl text-xs outline-none border transition-colors ${
                        isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={ticketSubmitting}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5 rtl:rotate-180" />
                      <span>ارسال</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

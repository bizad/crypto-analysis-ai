import React, { useState, useEffect } from 'react';
import {
  X,
  Gift,
  Copy,
  Check,
  Share2,
  Users,
  Sparkles,
  Award,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Language, Theme, UserAccount } from '../types';
import { shareContent } from '../utils/shareUtils';

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
  lang: Language;
  theme: Theme;
}

export const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [referralData, setReferralData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const referralCode = currentUser?.referralCode || 'REF-GUEST';
  const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://cryptopulse.ai';
  const inviteLink = `${appOrigin}?ref=${referralCode}`;

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchReferralStats();
    }
  }, [isOpen, currentUser]);

  const fetchReferralStats = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/user/referrals?userId=${currentUser.id}`);
      const data = await res.json();
      if (data.success) {
        setReferralData(data.referralStats);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleShareInvite = async () => {
    const title = lang === 'fa' ? 'دعوت به پلتفرم هوش مصنوعی تحلیل ارزهای دیجیتال' : 'Invite to AI Crypto Analytics';
    const text =
      lang === 'fa'
        ? `🔥 سلام! من از پلتفرم هوش مصنوعی تحلیل تکنیکال و فاندامنتال رمزارزها استفاده می‌کنم.\nبا ثبت‌نام از طریق لینک زیر، هم شما و هم من سهمیه تحلیل رایگان هفتگی هدیه می‌گیریم:\n\nکد معرف: ${referralCode}`
        : `🔥 Join me on the AI Crypto Analytics platform! Use my referral code: ${referralCode} to get weekly bonus analyses.`;

    const res = await shareContent({
      title,
      text,
      url: inviteLink,
    });

    if (res.method !== 'cancelled') {
      setShareFeedback(lang === 'fa' ? res.messageFa : res.messageEn);
      setTimeout(() => setShareFeedback(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-7 border shadow-2xl relative max-h-[90vh] overflow-y-auto ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 sm:left-6 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Visual */}
        <div className="text-center mb-6 pt-1">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 p-0.5 mx-auto mb-3 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Gift className="w-7 h-7 text-amber-400 animate-bounce" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            {lang === 'fa' ? 'طرح دعوت از دوستان' : 'Invite Friends Program'}
          </h2>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {lang === 'fa'
                ? 'به ازای هر دوست: ۱ تحلیل رایگان بیشتر در هفته!'
                : '1 Free Analysis/Week for Each Invited Friend!'}
            </span>
          </div>
        </div>

        {!currentUser ? (
          /* Guest prompt to login first */
          <div className="text-center py-6 px-4 rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/5 space-y-4">
            <Users className="w-10 h-10 text-amber-400 mx-auto" />
            <div>
              <h3 className="text-sm font-bold">
                {lang === 'fa' ? 'برای دریافت لینک اختصاصی وارد شوید' : 'Sign in to get your custom referral link'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {lang === 'fa'
                  ? 'کافی است با شماره موبایل یا ایمیل خود ثبت‌نام کنید تا کد معرفی اختصاصی شما ایجاد شده و تحلیل‌های هفتگی رایگان برایتان منظور شود.'
                  : 'Register with your phone number or email to generate your personal referral code and claim weekly bonus analyses.'}
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 mx-auto cursor-pointer shadow-md shadow-emerald-500/20"
            >
              <span>{lang === 'fa' ? 'ورود یا ثبت‌نام سریع' : 'Sign In or Register'}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        ) : (
          /* Logged-in User Referral Dashboard */
          <div className="space-y-5">
            {/* Quick KPI Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div
                className={`p-4 rounded-2xl border flex flex-col justify-between ${
                  isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'fa' ? 'دوستان دعوت‌شده' : 'Friends Invited'}</span>
                </div>
                <div className="mt-2 text-2xl font-black font-mono text-emerald-400">
                  {referralData?.referralCount ?? currentUser.referralCount ?? 0}
                  <span className="text-xs font-normal text-slate-400 mr-1.5">نفر</span>
                </div>
              </div>

              <div
                className={`p-4 rounded-2xl border flex flex-col justify-between ${
                  isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'fa' ? 'سهمیه تحلیل هفتگی' : 'Weekly Bonus Quota'}</span>
                </div>
                <div className="mt-2 text-2xl font-black font-mono text-amber-400">
                  +{(referralData?.weeklyBonusQuota ?? currentUser.weeklyBonusQuota ?? 0)}
                  <span className="text-xs font-normal text-slate-400 mr-1.5">تحلیل/هفته</span>
                </div>
              </div>
            </div>

            {/* Share Feedback Toast */}
            {shareFeedback && (
              <div className="text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{shareFeedback}</span>
              </div>
            )}

            {/* Referral Link & Code Box */}
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {lang === 'fa' ? 'کد اختصاصی معرفی شما:' : 'Your Referral Code:'}
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 font-mono font-bold text-amber-400 text-sm tracking-wider text-center select-all">
                    {referralCode}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
                    title="Copy Code"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span className="hidden sm:inline">{copiedCode ? 'کپی شد' : 'کپی'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {lang === 'fa' ? 'لینک مستقیم دعوت:' : 'Direct Referral Link:'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteLink}
                    dir="ltr"
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs text-slate-300 truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs shrink-0"
                    title="Copy Link"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span className="hidden sm:inline">{copiedLink ? 'کپی شد' : 'کپی'}</span>
                  </button>
                </div>
              </div>

              {/* Web Share Action Button */}
              <button
                onClick={handleShareInvite}
                className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>{lang === 'fa' ? 'ارسال دعوت‌نامه در شبکه‌های اجتماعی و پیام‌رسان‌ها' : 'Share Invitation Link'}</span>
              </button>
            </div>

            {/* List of Referred Friends */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'fa' ? 'لیست کاربران معرفی‌شده توسط شما' : 'Invited Friends'}</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  {referralData?.referredUsers?.length || 0} نفر
                </span>
              </div>

              {referralData?.referredUsers && referralData.referredUsers.length > 0 ? (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {referralData.referredUsers.map((friend: any) => (
                    <div
                      key={friend.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                        isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                          {friend.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">{friend.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{friend.identifier}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {friend.isVip && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded-md font-bold">
                            VIP
                          </span>
                        )}
                        <span className="text-[10px] text-emerald-400 font-medium">+۱ تحلیل رایگان</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                  {lang === 'fa'
                    ? 'هنوز کاربری با کد شما ثبت‌نام نکرده است. لینک خود را برای دوستانتان بفرستید!'
                    : 'No friends have joined using your code yet. Share your link to earn bonus analyses!'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

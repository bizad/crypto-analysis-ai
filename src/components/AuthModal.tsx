import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Lock, Gift, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Language, Theme, UserAccount } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserAccount, token: string) => void;
  lang: Language;
  theme: Theme;
  initialReferralCode?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  lang,
  theme,
  initialReferralCode = '',
}) => {
  const isDark = theme === 'dark';
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  const [name, setName] = useState('');
  const [identifierType, setIdentifierType] = useState<'phone' | 'email'>('phone');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState(initialReferralCode);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Listen for Google Auth postMessage from popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        const { token, user } = event.data;
        if (token && user) {
          localStorage.setItem('crypto_auth_token', token);
          localStorage.setItem('crypto_user', JSON.stringify(user));
          setSuccessMsg(lang === 'fa' ? 'ورود با حساب گوگل با موفقیت انجام شد!' : 'Signed in with Google successfully!');
          setGoogleLoading(false);
          setTimeout(() => {
            onAuthSuccess(user, token);
            onClose();
          }, 350);
        }
      } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
        setError(event.data.error || (lang === 'fa' ? 'خطا در احراز هویت با گوگل' : 'Google authentication failed'));
        setGoogleLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [lang, onAuthSuccess, onClose]);

  const handleGoogleAuth = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const res = await fetch('/api/auth/google/url');
      const data = await res.json();
      if (!res.ok || !data.success || !data.url) {
        throw new Error(data.error || 'خطا در برقراری ارتباط با گوگل');
      }

      const width = 520;
      const height = 650;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        data.url,
        'google_user_login',
        `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
      );

      if (!popup) {
        alert(lang === 'fa' ? 'لطفاً پاپ‌آپ مرورگر را فعال فرمایید.' : 'Please allow popups to sign in with Google.');
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'خطا در ارتباط با گوگل');
      setGoogleLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!identifier.trim()) {
      setError(lang === 'fa' ? 'لطفاً شماره تلفن یا ایمیل خود را وارد کنید.' : 'Please enter your phone number or email.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'LOGIN') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: identifier.trim(),
            password: password.trim() || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'خطا در ورود به حساب کاربری');
        }

        setSuccessMsg(lang === 'fa' ? 'با موفقیت وارد شدید!' : 'Logged in successfully!');
        setTimeout(() => {
          onAuthSuccess(data.user, data.token);
          onClose();
        }, 600);
      } else {
        // Register
        const payload: any = {
          name: name.trim() || (identifierType === 'phone' ? `کاربر ${identifier.slice(-4)}` : 'کاربر گرامی'),
          password: password.trim() || '123456',
          referralCode: referralCode.trim() || undefined,
        };

        if (identifierType === 'phone') {
          payload.phone = identifier.trim();
        } else {
          payload.email = identifier.trim().toLowerCase();
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'خطا در ثبت‌نام حساب جدید');
        }

        setSuccessMsg(lang === 'fa' ? 'ثبت‌نام با موفقیت انجام شد!' : 'Registration successful!');
        setTimeout(() => {
          onAuthSuccess(data.user, data.token);
          onClose();
        }, 600);
      }
    } catch (err: any) {
      setError(err.message || 'خطای غیرمنتظره رخ داد.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl relative overflow-hidden ${
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

        {/* Modal Header */}
        <div className="text-center mb-6 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 p-0.5 mx-auto mb-3 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <User className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <h2 className="text-xl font-black">
            {mode === 'LOGIN'
              ? lang === 'fa'
                ? 'ورود به حساب کاربری'
                : 'Sign In to Account'
              : lang === 'fa'
              ? 'ثبت‌نام و عضویت'
              : 'Create New Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'fa'
              ? 'دسترسی به سوابق واریزی، تیکت‌ها، تحلیل‌های رایگان و دعوت از دوستان'
              : 'Manage deposits, support tickets, referral bonus quotas, and VIP access'}
          </p>
        </div>

        {/* Google One-Click Login Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={googleLoading || loading}
          className="w-full mb-4 py-2.5 px-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-600 text-white font-bold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-md shadow-black/20 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
        >
          {googleLoading ? (
            <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>{lang === 'fa' ? 'ورود سریع با حساب رسمی گوگل' : 'Sign in with Google'}</span>
        </button>

        {/* Visual OR Separator */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-[10px] text-slate-500 font-semibold">{lang === 'fa' ? 'یا با شماره موبایل / ایمیل' : 'OR WITH EMAIL / PHONE'}</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex rounded-xl p-1 bg-slate-800/40 border border-slate-700/50 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'LOGIN'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'fa' ? 'ورود' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('REGISTER');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'REGISTER'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'fa' ? 'ثبت‌نام جدید' : 'Register'}
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Name Field (Only in Register mode) */}
          {mode === 'REGISTER' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {lang === 'fa' ? 'نام و نام خانوادگی (اختیاری)' : 'Full Name (Optional)'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lang === 'fa' ? 'مثال: حامد فرّی' : 'e.g. Hamed Farri'}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                    isDark
                      ? 'bg-slate-950/70 border-slate-700 focus:border-emerald-500 text-white'
                      : 'bg-slate-50 border-slate-300 focus:border-emerald-500 text-slate-900'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Identifier Toggle (Phone or Email) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-400">
                {identifierType === 'phone'
                  ? lang === 'fa'
                    ? 'شماره تلفن همراه'
                    : 'Mobile Number'
                  : lang === 'fa'
                  ? 'آدرس ایمیل'
                  : 'Email Address'}
              </label>
              <div className="flex gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setIdentifierType('phone');
                    setIdentifier('');
                  }}
                  className={`cursor-pointer transition-colors ${
                    identifierType === 'phone' ? 'text-emerald-400 font-bold underline' : 'text-slate-500'
                  }`}
                >
                  {lang === 'fa' ? 'شماره موبایل' : 'Phone'}
                </button>
                <span className="text-slate-600">|</span>
                <button
                  type="button"
                  onClick={() => {
                    setIdentifierType('email');
                    setIdentifier('');
                  }}
                  className={`cursor-pointer transition-colors ${
                    identifierType === 'email' ? 'text-emerald-400 font-bold underline' : 'text-slate-500'
                  }`}
                >
                  {lang === 'fa' ? 'ایمیل' : 'Email'}
                </button>
              </div>
            </div>

            <div className="relative flex items-center">
              <input
                type={identifierType === 'phone' ? 'tel' : 'email'}
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={
                  identifierType === 'phone'
                    ? lang === 'fa'
                      ? '09121234567'
                      : '+98 912 123 4567'
                    : 'name@example.com'
                }
                dir={identifierType === 'phone' ? 'ltr' : undefined}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition-all pl-9 ${
                  isDark
                    ? 'bg-slate-950/70 border-slate-700 focus:border-emerald-500 text-white'
                    : 'bg-slate-50 border-slate-300 focus:border-emerald-500 text-slate-900'
                }`}
              />
              <div className="absolute left-3 text-slate-400 pointer-events-none">
                {identifierType === 'phone' ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
              </div>
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              {lang === 'fa' ? 'رمز عبور' : 'Password'}
            </label>
            <div className="relative flex items-center">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition-all pl-9 ${
                  isDark
                    ? 'bg-slate-950/70 border-slate-700 focus:border-emerald-500 text-white'
                    : 'bg-slate-50 border-slate-300 focus:border-emerald-500 text-slate-900'
                }`}
              />
              <div className="absolute left-3 text-slate-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Referral Code Field (Only in Register mode) */}
          {mode === 'REGISTER' && (
            <div>
              <label className="block text-xs font-medium text-amber-400/90 mb-1 flex items-center gap-1">
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'fa' ? 'کد معرف دوستان (اختیاری)' : 'Referral Code (Optional)'}</span>
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="REF-1234"
                dir="ltr"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono border outline-none transition-all ${
                  isDark
                    ? 'bg-amber-950/20 border-amber-500/40 focus:border-amber-400 text-amber-200'
                    : 'bg-amber-50/50 border-amber-300 focus:border-amber-500 text-amber-900'
                }`}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {lang === 'fa'
                  ? 'اگر توسط دوستی دعوت شده‌اید، وارد کردن کد او باعث فعالسازی سهمیه هفتگی رایگان برای او می‌شود.'
                  : 'Enter your friend’s invite code to grant them +1 free analysis per week.'}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
          >
            {loading ? (
              <span>{lang === 'fa' ? 'در حال برقراری ارتباط...' : 'Connecting...'}</span>
            ) : (
              <>
                <span>
                  {mode === 'LOGIN'
                    ? lang === 'fa'
                      ? 'ورود به حساب'
                      : 'Sign In'
                    : lang === 'fa'
                    ? 'تکمیل ثبت‌نام'
                    : 'Create Account'}
                </span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

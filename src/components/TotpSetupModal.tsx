import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  ShieldAlert,
  QrCode,
  Copy,
  Check,
  Key,
  Smartphone,
  RefreshCw,
  AlertTriangle,
  Lock,
  Download,
  Info,
} from 'lucide-react';
import { Language, Theme } from '../types';

interface TotpSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminToken: string;
  lang: Language;
  theme: Theme;
  onTotpStatusChanged?: (enabled: boolean) => void;
}

export const TotpSetupModal: React.FC<TotpSetupModalProps> = ({
  isOpen,
  onClose,
  adminToken,
  lang,
  theme,
  onTotpStatusChanged,
}) => {
  const isDark = theme === 'dark';
  const isRtl = lang === 'fa';

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [status, setStatus] = useState<{
    enabled: boolean;
    activatedAt?: number;
    adminEmail: string;
    remainingBackupCodes?: number;
  } | null>(null);

  // Setup state
  const [setupData, setSetupData] = useState<{
    secret: string;
    uri: string;
    qrCodeDataUrl: string;
    backupCodes: string[];
    email: string;
  } | null>(null);

  const [otpCode, setOtpCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [testCode, setTestCode] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [confirmedBackupCodes, setConfirmedBackupCodes] = useState<string[] | null>(null);
  const [showDisableForm, setShowDisableForm] = useState(false);

  // Load status on open
  useEffect(() => {
    if (isOpen && adminToken) {
      loadStatus();
    } else {
      // Reset transient state
      setSetupData(null);
      setOtpCode('');
      setDisableCode('');
      setTestCode('');
      setTestResult(null);
      setErrorMsg(null);
      setSuccessMsg(null);
      setConfirmedBackupCodes(null);
      setShowDisableForm(false);
    }
  }, [isOpen, adminToken]);

  const loadStatus = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/totp/status', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.success && data.status) {
        setStatus(data.status);
        if (!data.status.enabled) {
          initSetup();
        }
      }
    } catch {
      setErrorMsg(isRtl ? 'خطا در بارگذاری وضعیت TOTP' : 'Failed to load TOTP status');
    } finally {
      setLoading(false);
    }
  };

  const initSetup = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/totp/setup', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setSetupData(data);
        setOtpCode('');
        setConfirmedBackupCodes(null);
      } else {
        setErrorMsg(data.error || (isRtl ? 'خطا در تولید کلید امنیتی' : 'Failed to generate secret'));
      }
    } catch {
      setErrorMsg(isRtl ? 'خطای اتصال به سرور' : 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = otpCode.trim();
    if (clean.length !== 6) {
      setErrorMsg(isRtl ? 'کد تایید باید ۶ رقم باشد.' : 'Verification code must be 6 digits.');
      return;
    }

    setVerifying(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/totp/verify-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ code: clean }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || (isRtl ? 'احراز هویت TOTP با موفقیت فعال شد.' : 'TOTP 2FA activated successfully.'));
        setConfirmedBackupCodes(data.backupCodes || setupData?.backupCodes || []);
        setStatus({
          enabled: true,
          activatedAt: Date.now(),
          adminEmail: setupData?.email || 'hamed.farri@gmail.com',
          remainingBackupCodes: (data.backupCodes || setupData?.backupCodes || []).length,
        });
        if (onTotpStatusChanged) onTotpStatusChanged(true);
      } else {
        setErrorMsg(data.error || (isRtl ? 'کد ۶ رقمی نامعتبر است.' : 'Invalid 6-digit code.'));
      }
    } catch {
      setErrorMsg(isRtl ? 'خطای اتصال به سرور' : 'Connection error');
    } finally {
      setVerifying(false);
    }
  };

  const handleTestVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testCode.trim()) return;

    setVerifying(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/totp/verify-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ code: testCode.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: isRtl
            ? data.usedBackupCode
              ? 'کد بازیابی اضطراری معتبر بود و با موفقیت مصرف شد.'
              : 'کد ۶ رقمی TOTP معتبر است و ارتباط با نرم‌افزار همگام می‌باشد.'
            : 'TOTP authentication code is valid and in sync.',
        });
        setTestCode('');
      } else {
        setTestResult({
          success: false,
          message: data.error || (isRtl ? 'کد نامعتبر است.' : 'Invalid code.'),
        });
      }
    } catch {
      setTestResult({
        success: false,
        message: isRtl ? 'خطا در اتصال به سرور' : 'Connection error',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleDisableTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disableCode.trim()) return;

    setVerifying(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/totp/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ code: disableCode.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(isRtl ? 'احراز هویت دو مرحله‌ای TOTP غیرفعال شد.' : 'TOTP 2FA disabled.');
        setStatus({
          enabled: false,
          adminEmail: status?.adminEmail || 'hamed.farri@gmail.com',
        });
        setShowDisableForm(false);
        setDisableCode('');
        if (onTotpStatusChanged) onTotpStatusChanged(false);
        initSetup();
      } else {
        setErrorMsg(data.error || (isRtl ? 'کد نامعتبر است.' : 'Invalid code.'));
      }
    } catch {
      setErrorMsg(isRtl ? 'خطای اتصال به سرور' : 'Connection error');
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text: string, isSecret = true) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      if (isSecret) {
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2500);
      } else {
        setCopiedBackup(true);
        setTimeout(() => setCopiedBackup(false), 2500);
      }
    }
  };

  const downloadBackupCodes = (codes: string[]) => {
    const content =
      `DIDBAN Crypto Platform - Super Admin Emergency Backup Codes\n` +
      `Account: ${status?.adminEmail || 'hamed.farri@gmail.com'}\n` +
      `Generated At: ${new Date().toISOString()}\n\n` +
      `Keep these codes in a secure offline location. Each code can be used once:\n\n` +
      codes.map((c, i) => `${i + 1}. ${c}`).join('\n') +
      `\n\nSecurity Notice: If you lose your authenticator device, use these codes to regain access.`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `didban-admin-totp-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl rounded-3xl border shadow-2xl flex flex-col overflow-hidden max-h-[92vh] ${
          isDark
            ? 'bg-slate-950 border-purple-500/40 text-slate-100 shadow-purple-950/40'
            : 'bg-white border-purple-300 text-slate-900 shadow-xl'
        }`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-purple-500/20 bg-gradient-to-r from-purple-950/40 via-slate-900/40 to-indigo-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  {isRtl ? 'پیکربندی تایید هویت دو مرحله‌ای (TOTP)' : 'Super Admin TOTP 2FA Setup'}
                </h3>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                    status?.enabled
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  }`}
                >
                  {status?.enabled
                    ? isRtl
                      ? 'فعال (محافظت‌شده)'
                      : 'ACTIVE'
                    : isRtl
                    ? 'غیرفعال'
                    : 'DISABLED'}
                </span>
              </div>
              <p className="text-xs text-purple-200/70 mt-0.5">
                {isRtl
                  ? 'محافظت سخت‌افزاری از عملیات حساس مدیریتی (Google Authenticator / 1Password)'
                  : 'RFC 6238 time-based one-time password security for privileged admin actions'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Error & Success Feedback Banners */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-start gap-2.5 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* ACTIVE STATUS SCREEN */}
          {status?.enabled && !showDisableForm && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3 text-emerald-200">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-emerald-300 text-sm">
                    {isRtl
                      ? 'لایه امنیتی TOTP برای مدیر ارشد فعال است'
                      : 'Hardware-grade TOTP protection is currently active'}
                  </h4>
                  <p className="text-xs text-emerald-200/80 leading-relaxed">
                    {isRtl
                      ? 'کلیه عملیات حساس شامل تایید واریزها، تسویه حساب‌ها، تغییر تنظیمات پایگاه داده و ایجاد پشتیبان، نیازمند ارائه کد یک‌بار مصرف ۶ رقمی هستند.'
                      : 'All critical administrative operations require a 6-digit one-time passcode verification.'}
                  </p>
                  {status.activatedAt && (
                    <div className="text-[11px] text-emerald-400/70 font-mono pt-1">
                      {isRtl ? 'تاریخ فعال‌سازی: ' : 'Activated at: '}
                      {new Date(status.activatedAt).toLocaleString(isRtl ? 'fa-IR' : 'en-US')}
                    </div>
                  )}
                </div>
              </div>

              {/* Test Authenticator Code Tool */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-400" />
                  <span className="font-bold text-white text-xs">
                    {isRtl ? 'تست همگام‌سازی کد اپلیکیشن' : 'Test Authenticator Sync'}
                  </span>
                </div>
                <form onSubmit={handleTestVerify} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={9}
                    placeholder="123456"
                    value={testCode}
                    onChange={(e) => setTestCode(e.target.value.replace(/\s/g, ''))}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-center font-mono text-base tracking-widest text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={verifying || !testCode.trim()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs cursor-pointer transition-all shrink-0 flex items-center gap-1.5"
                  >
                    {verifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>{isRtl ? 'بررسی صحت کد' : 'Verify'}</span>
                  </button>
                </form>

                {testResult && (
                  <div
                    className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                      testResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {testResult.success ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Re-setup / Disable */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={initSetup}
                  className="px-3.5 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isRtl ? 'تولید مجدد کلید و بارکد' : 'Reconfigure TOTP'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDisableForm(true)}
                  className="px-3.5 py-2 rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-950/30 text-xs font-semibold cursor-pointer transition-colors"
                >
                  {isRtl ? 'غیرفعال‌سازی TOTP' : 'Disable TOTP'}
                </button>
              </div>
            </div>
          )}

          {/* DISABLE FORM SCREEN */}
          {status?.enabled && showDisableForm && (
            <form onSubmit={handleDisableTotp} className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-4">
              <div className="flex items-center gap-2 text-rose-300">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span className="font-bold text-sm">
                  {isRtl ? 'تایید غیرفعال‌سازی احراز هویت دو مرحله‌ای' : 'Confirm TOTP Deactivation'}
                </span>
              </div>
              <p className="text-xs text-rose-200/80 leading-relaxed">
                {isRtl
                  ? 'جهت حفظ امنیت، برای غیرفعال‌سازی باید یک کد ۶ رقمی فعال از نرم‌افزار خود یا یکی از کدهای بازیابی اضطراری را وارد نمایید.'
                  : 'Enter a valid 6-digit TOTP code or emergency recovery code to deactivate.'}
              </p>

              <input
                type="text"
                placeholder={isRtl ? 'کد ۶ رقمی یا کد بازیابی' : '6-digit OTP or backup code'}
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-center font-mono text-base tracking-widest text-white focus:outline-none focus:border-rose-500"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisableForm(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs cursor-pointer hover:bg-slate-800"
                >
                  {isRtl ? 'انصراف' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={verifying || !disableCode.trim()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs cursor-pointer transition-all flex items-center gap-1.5"
                >
                  {verifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isRtl ? 'تایید و غیرفعال‌سازی' : 'Confirm & Disable'}</span>
                </button>
              </div>
            </form>
          )}

          {/* SETUP WIZARD (When NOT enabled or when re-configuring) */}
          {(!status?.enabled || setupData) && !showDisableForm && (
            <div className="space-y-5">
              {/* Step 1: Scan QR Code */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-bold">
                    ۱
                  </div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">
                    {isRtl
                      ? 'اسکن بارکد در اپلیکیشن تایید هویت'
                      : 'Scan QR code in Authenticator app'}
                  </h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isRtl
                    ? 'یکی از برنامه‌های Google Authenticator، 1Password، Microsoft Authenticator یا Bitwarden را در تلفن همراه خود باز کرده و بارکد زیر را اسکن کنید:'
                    : 'Open Google Authenticator, 1Password, or Microsoft Authenticator and scan this QR code:'}
                </p>

                {loading ? (
                  <div className="w-48 h-48 mx-auto flex flex-col items-center justify-center gap-2 bg-slate-950 rounded-2xl border border-slate-800">
                    <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
                    <span className="text-[11px] text-slate-400">
                      {isRtl ? 'در حال تولید کلید امنیتی...' : 'Generating secret...'}
                    </span>
                  </div>
                ) : setupData?.qrCodeDataUrl ? (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-slate-950 p-4 rounded-2xl border border-purple-500/20">
                    <div className="p-2 bg-white rounded-2xl shadow-lg shrink-0">
                      <img
                        src={setupData.qrCodeDataUrl}
                        alt="TOTP QR Code"
                        className="w-40 h-40 sm:w-44 sm:h-44 object-contain"
                      />
                    </div>

                    <div className="flex-1 space-y-2.5 text-center sm:text-right min-w-0">
                      <span className="text-[11px] text-slate-400 block font-semibold">
                        {isRtl
                          ? 'امکان اسکن بارکد را ندارید؟ کد زیر را دستی وارد کنید:'
                          : 'Cannot scan? Enter this secret manually:'}
                      </span>
                      <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-purple-300">
                        <span className="tracking-widest select-all break-all">{setupData.secret}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(setupData.secret, true)}
                          className="p-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 transition-colors cursor-pointer shrink-0"
                          title={isRtl ? 'کپی کلید مخفی' : 'Copy secret'}
                        >
                          {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">
                        {isRtl ? 'حساب کاربری: ' : 'Account: '}
                        {setupData.email}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Step 2: Verification Input */}
              <form onSubmit={handleVerifySetup} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-bold">
                    ۲
                  </div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">
                    {isRtl
                      ? 'وارد کردن کد ۶ رقمی تولیدشده برای تایید و فعال‌سازی'
                      : 'Enter 6-digit generated code to activate'}
                  </h4>
                </div>
                <p className="text-xs text-slate-400">
                  {isRtl
                    ? 'کد ۶ رقمی فعلی نمایش‌داده‌شده در اپلیکیشن را وارد نمایید:'
                    : 'Enter the current 6-digit one-time code shown in your app:'}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="● ● ● ● ● ●"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full sm:w-64 px-4 py-2.5 rounded-2xl bg-slate-950 border border-purple-500/40 text-center font-mono text-xl tracking-[0.3em] font-black text-white focus:outline-none focus:border-purple-400 shadow-inner"
                    autoFocus
                  />

                  <button
                    type="submit"
                    disabled={verifying || otpCode.length !== 6}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all cursor-pointer shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2"
                  >
                    {verifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>{isRtl ? 'فعال‌سازی رسمی TOTP' : 'Verify & Enable'}</span>
                  </button>
                </div>
              </form>

              {/* Step 3: Emergency Backup Codes (Shown upon setup or confirmation) */}
              {(confirmedBackupCodes || setupData?.backupCodes) && (
                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-300">
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-xs">
                        {isRtl ? 'کدهای بازیابی اضطراری (یک‌بار مصرف)' : 'Emergency Recovery Backup Codes'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            (confirmedBackupCodes || setupData?.backupCodes || []).join('\n'),
                            false
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-semibold cursor-pointer transition-colors flex items-center gap-1"
                      >
                        {copiedBackup ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{isRtl ? 'کپی همه' : 'Copy All'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          downloadBackupCodes(confirmedBackupCodes || setupData?.backupCodes || [])
                        }
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-semibold cursor-pointer transition-colors flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>{isRtl ? 'دانلود فایل' : 'Download'}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-amber-200/80 leading-relaxed">
                    {isRtl
                      ? 'در صورت مفقود شدن یا عدم دسترسی به دستگاه Authenticator، می‌توانید با هر یک از این کدها عملیات حساس را تایید کنید. هر کد پس از مصرف باطل می‌شود.'
                      : 'Store these one-time codes safely. They can be used to authenticate if you lose access to your device.'}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
                    {(confirmedBackupCodes || setupData?.backupCodes || []).map((code, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-slate-950/80 border border-amber-500/20 text-center font-bold text-amber-300 tracking-wider select-all"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-purple-500/20 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Info className="w-3.5 h-3.5" />
            <span>{isRtl ? 'استاندارد رمزنگاری امنیتی RFC 6238' : 'RFC 6238 Compliant'}</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer transition-colors"
          >
            {isRtl ? 'بستن' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
